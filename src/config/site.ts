const forestDistance = '1 km';

export const site = {
  name: 'Papierówka',
  description: 'Agroturystyka w miejscowości Wasilkowo, 1 km od Puszczy Białowieskiej. Wypoczynek dla 8 osób, z możliwością noclegu dla 10.',
  url: 'https://papierowka.example',
  phone: '504 867 746',
  phoneHref: 'tel:+48504867746',
  email: 'agroturystyka.papierowka@gmail.com',
  emailLocal: 'agroturystyka.papierowka',
  emailDomain: 'gmail.com',
  address: 'Wasilkowo 6',
  postalCode: '17-200',
  addressLocality: 'Wasilkowo',
  price: 'Od 500 zł za dobę przy pobycie tygodniowym; ceny weekendowe do uzgodnienia.',
  eventPrice: 'Wieczory panieńskie i kawalerskie: 1 000 zł za dobę.',
  relaxationPrice: 'Strefa relaksu — sauna i bania — jest dodatkowo płatna; cena do uzgodnienia.',
  guests: '8 osób komfortowo; do 10 osób z miejscami do spania na sofie w salonie',
  forestDistance,
  administrator: '[[ADMINISTRATOR]]',
  checkIn: '[[GODZINA_ZAMELDOWANIA]]',
  checkOut: '[[GODZINA_WYMELDOWANIA]]',
  pets: 'Teren jest ogrodzony, zwierzęta są mile widziane.',
  bookingTerms: 'Wysokość opłaty rezerwacyjnej i zasady anulowania pobytu do uzgodnienia przed rezerwacją.',
  privacyLegalBasis: '[[PODSTAWA_PRAWNA_I_OKRES_PRZECHOWYWANIA]]',
  hostingInfo: '[[DANE_DOSTAWCY_HOSTINGU_I_LOGÓW]]',
  privacyRights: '[[INFORMACJE_O_PRAWACH_RODO]]',
  mapUrl: 'https://www.openstreetmap.org/search?query=Wasilkowo%2C%20Podlaskie',
  showReviews: true,
  reviews: [
    {
      text: 'Cudowne miejsce, spędziliśmy tu tylko weekend ale już wiemy że nie będzie to ostatni raz. Czyściutko, przemili właściciele i piękna okolica. Mieliśmy nawet szczęście spotkać stado żubrów.',
      author: 'Magdalena P.',
      date: 'Luty 2026',
    },
    {
      text: 'Z przyjemnością wystawiam najwyższą notę. Wszędzie czysto, wszystko przygotowane na nasz przyjazd, a do tego na miejscu wszystko co trzeba, od pełnego wyposażenia kuchni, aż po zeszyty, długopisy. Na obu piętrach klimatyzacja, piękny teren, balia wodna i sauna.... Super!',
      author: 'Filip M.',
      date: 'Lipiec 2026',
    },
    {
      text: 'Cudowne miejsce, które stanowi świetną bazę do zwiedzania regionu! Cisza, spokój zapewniają pełen relaks. Można skorzystać z sauny, bani, grila, ogniska nad stawem. Wszystko to oferuje Papierówka. Wspaniali gospodarze, przyjaźni zwierzakom !!!!! Polecam to miejsce z calego serca !! Wrócimy tu na pewno!',
      author: 'Izabela S.',
      date: 'Wrzesień 2024',
    },
  ],
  areaDistances: [
    { place: 'Puszcza Białowieska', distance: forestDistance },
    { place: 'Najbliższy sklep', distance: '6 km' },
    { place: 'Białowieża', distance: '30 km' },
  ],
};

export const amenities = [
  { icon: 'home', title: 'Duży dom', text: `Wygodne miejsce dla rodzin i grup: ${site.guests}.` },
  { icon: 'spa', title: 'Sauna i bania', text: `${site.relaxationPrice} Relaks pod zadaszoną wiatą o każdej porze roku.` },
  { icon: 'bike', title: 'Rowery', text: 'Odkrywaj spokojne drogi i leśne ścieżki na dwóch kółkach.' },
  { icon: 'play', title: 'Dla dzieci', text: 'Placyk zabaw, trampolina i rozkładany basen w sezonie.' },
  { icon: 'grill', title: 'Wiata i grill', text: 'Zadaszone miejsce przy domu i grill gazowy na wspólne posiłki.' },
  { icon: 'tree', title: 'Blisko natury', text: 'Spacery, wycieczki rowerowe i wyprawy w okolice puszczy.' },
];
