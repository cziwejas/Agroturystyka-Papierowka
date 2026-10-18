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
  // Swap this iframe URL with the src from Google Maps → Share → Embed a map
  // after selecting the verified Papierówka business listing.
  
  // googleMapsEmbedUrl: 'https://www.google.com/maps?q=Wasilkowo%206,%2017-200%20Wasilkowo&output=embed',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d32000!2d23.576249112315196!3d52.82284091364794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x472015dcd03a9327%3A0x493cca631c0e0282!2sAgroturystyka%20Papier%C3%B3wka!5e0!3m2!1spl!2spl!4v1792354544317!5m2!1spl!2spl',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Wasilkowo%206%2C%2017-200%20Wasilkowo',
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
  { icon: 'kitchen', title: 'Kuchnia', text: 'Miejsce do przygotowywania wspólnych posiłków.' },
  { icon: 'wifi', title: 'Wi-Fi', text: 'Dostęp do bezprzewodowego Internetu na miejscu.' },
  { icon: 'parking', title: 'Parking', text: 'Parking na terenie obiektu.' },
];
