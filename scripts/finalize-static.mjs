import { createHash } from 'node:crypto';
import { readFile, writeFile, access, readdir } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const config = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const fields = Object.fromEntries([...config.matchAll(/^\s*(name|description|url|phone|email|address|postalCode|addressLocality):\s*'([^']*)'/gm)].map((match) => [match[1], match[2]]));
if (Object.keys(fields).length !== 8) throw new Error('Nie udało się odczytać danych podstawowych z src/config/site.ts');
const phoneDigits = fields.phone.replace(/\D/g, '');
const telephone = phoneDigits.length === 9 ? `+48${phoneDigits}` : `+${phoneDigits.replace(/^00/, '')}`;
const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: fields.name,
  description: fields.description,
  url: fields.url,
  telephone,
  email: fields.email,
  address: { '@type': 'PostalAddress', streetAddress: fields.address, postalCode: fields.postalCode, addressLocality: fields.addressLocality, addressRegion: 'podlaskie', addressCountry: 'PL' },
  amenityFeature: ['Sauna', 'Bania', 'Rowery', 'Plac zabaw', 'Basen', 'Grill gazowy'].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
}).replaceAll('<', '\\u003c');

async function findHtmlPages(directory, prefix = '') {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) pages.push(...await findHtmlPages(new URL(`${entry.name}/`, directory), `${relative}/`));
    else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(relative);
  }
  return pages.sort();
}
const htmlPages = await findHtmlPages(dist);
if (!htmlPages.includes('index.html')) throw new Error('Brak strony głównej dist/index.html');

// Wspólne metadane są takie same na każdej stronie, więc JSON-LD z index.html
// stanowi ten sam blok w każdej podstronie.
const digest = createHash('sha256').update(jsonLd).digest('base64');
for (const relative of htmlPages) {
  const path = new URL(relative, dist);
  const html = await readFile(path, 'utf8');
  if (!html.includes('__JSON_LD__')) throw new Error(`Nie znaleziono miejsca JSON-LD w dist/${relative}`);
  await writeFile(path, html.replace('__JSON_LD__', jsonLd));
}
const headersPath = new URL('_headers', dist);
const headers = await readFile(headersPath, 'utf8');
if (!headers.includes('__JSONLD_HASH__')) throw new Error('Brak znacznika hasha JSON-LD w dist/_headers');
const securedHeaders = headers.replace('__JSONLD_HASH__', digest);
await writeFile(headersPath, securedHeaders);
const vercelConfig = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const vercelCsp = vercelConfig.headers.flatMap(({ headers }) => headers).find(({ key }) => key.toLowerCase() === 'content-security-policy')?.value;
if (!vercelCsp?.includes(`'sha256-${digest}'`)) throw new Error('CSP w vercel.json nie zawiera aktualnego hasha JSON-LD');

const securityPath = new URL('.well-known/security.txt', dist);
const email = config.match(/^\s*email:\s*'([^']+)'/m)?.[1];
if (!email) throw new Error('Nie znaleziono pola email w src/config/site.ts');
const security = await readFile(securityPath, 'utf8');
await writeFile(securityPath, security.replaceAll('[[EMAIL]]', email).replaceAll('__SITE_URL__', fields.url));
const robotsPath = new URL('robots.txt', dist);
const robots = await readFile(robotsPath, 'utf8');
await writeFile(robotsPath, robots.replaceAll('__SITE_URL__', fields.url));

const localAssets = new Set(['index.html', '404.html', 'scripts/site.js', 'favicon.svg', 'robots.txt', 'sitemap-index.xml', 'sitemap-0.xml', '.well-known/security.txt']);
for (const relative of htmlPages) {
  const path = new URL(relative, dist);
  const html = await readFile(path, 'utf8');
  const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const [, attributes, body] of scriptTags) {
    if (!/\bsrc=/.test(attributes) && !/\btype="application\/ld\+json"/.test(attributes)) {
      throw new Error(`Niedozwolony skrypt inline w dist/${relative}`);
    }
    if (/\btype="application\/ld\+json"/.test(attributes) && createHash('sha256').update(body).digest('base64') !== digest) {
      throw new Error(`Hash JSON-LD nie zgadza się w dist/${relative}`);
    }
  }
  if (/<style\b|\sstyle="/i.test(html)) throw new Error(`Znaleziono styl inline w dist/${relative}`);
  for (const [, attributes] of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(attributes)) throw new Error(`Obraz bez atrybutu alt w dist/${relative}`);
    if (/\bsrc=""/i.test(attributes) && !/\balt=""/i.test(attributes)) throw new Error(`Pusty obraz lightboxa musi być dekoracyjny w dist/${relative}`);
  }
  for (const [, destination] of html.matchAll(/\b(?:href|src)="(\/[^"#]*)"/gi)) {
    const decoded = decodeURIComponent(destination.split('?')[0]);
    let target = decoded.slice(1);
    if (!target || target.endsWith('/')) target += 'index.html';
    else if (!/\.[a-z\d]+$/i.test(target)) target += '/index.html';
    if (!localAssets.has(target)) {
      try { await access(new URL(target, dist)); }
      catch { throw new Error(`Martwy lokalny odnośnik ${destination} w dist/${relative}`); }
    }
  }
}

if (!securedHeaders.includes(`'sha256-${digest}'`)) throw new Error('CSP nie zezwala na dokładny hash JSON-LD');
console.log(`Samokontrola dist: ${htmlPages.length} stron, hash CSP ${digest}, lokalne linki i alt-y poprawne.`);
