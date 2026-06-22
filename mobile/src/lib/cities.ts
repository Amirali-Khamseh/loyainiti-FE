/**
 * Major cities grouped by country name (must match COUNTRIES[n].name).
 * Mirror of `web/src/lib/cities.ts` — keep both in sync.
 * Lists are sorted alphabetically; they are the display value AND the persisted value.
 */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Austria: [
    'Graz', 'Innsbruck', 'Klagenfurt', 'Linz', 'Salzburg', 'Vienna', 'Wels',
  ],
  Belgium: [
    'Aalst', 'Antwerp', 'Bruges', 'Brussels', 'Charleroi', 'Ghent', 'Hasselt',
    'Kortrijk', 'Leuven', 'Liège', 'Mechelen', 'Mons', 'Namur', 'Ostend',
    'Tournai',
  ],
  Czechia: [
    'Brno', 'Liberec', 'Olomouc', 'Ostrava', 'Pardubice', 'Pilsen', 'Prague',
    'Ústí nad Labem',
  ],
  Denmark: [
    'Aalborg', 'Aarhus', 'Copenhagen', 'Esbjerg', 'Frederiksberg', 'Odense',
    'Randers',
  ],
  Finland: [
    'Espoo', 'Helsinki', 'Oulu', 'Tampere', 'Turku', 'Vantaa',
  ],
  France: [
    'Aix-en-Provence', 'Amiens', 'Angers', 'Besançon', 'Bordeaux', 'Brest',
    'Caen', 'Clermont-Ferrand', 'Dijon', 'Grenoble', 'Le Havre', 'Le Mans',
    'Lille', 'Limoges', 'Lyon', 'Marseille', 'Metz', 'Montpellier', 'Mulhouse',
    'Nancy', 'Nantes', 'Nice', 'Nîmes', 'Orléans', 'Paris', 'Perpignan',
    'Reims', 'Rennes', 'Rouen', 'Saint-Étienne', 'Strasbourg', 'Toulon',
    'Toulouse', 'Tours',
  ],
  Germany: [
    'Aachen', 'Augsburg', 'Berlin', 'Bielefeld', 'Bochum', 'Bonn', 'Braunschweig',
    'Bremen', 'Chemnitz', 'Cologne', 'Dortmund', 'Dresden', 'Duisburg', 'Düsseldorf',
    'Erfurt', 'Essen', 'Frankfurt', 'Freiburg', 'Gelsenkirchen', 'Hamburg', 'Hanover',
    'Karlsruhe', 'Kiel', 'Leipzig', 'Lübeck', 'Magdeburg', 'Mannheim',
    'Mönchengladbach', 'Munich', 'Münster', 'Nuremberg', 'Oberhausen', 'Stuttgart',
    'Wiesbaden', 'Wuppertal',
  ],
  Greece: [
    'Athens', 'Heraklion', 'Larissa', 'Patras', 'Piraeus', 'Thessaloniki', 'Volos',
  ],
  Hungary: [
    'Budapest', 'Debrecen', 'Győr', 'Miskolc', 'Nyíregyháza', 'Pécs', 'Szeged',
  ],
  Ireland: [
    'Cork', 'Dublin', 'Galway', 'Limerick', 'Waterford',
  ],
  Italy: [
    'Bari', 'Bologna', 'Brescia', 'Cagliari', 'Catania', 'Catanzaro', 'Florence',
    'Foggia', 'Genoa', 'Livorno', 'Messina', 'Milan', 'Modena', 'Monza', 'Naples',
    'Padua', 'Palermo', 'Parma', 'Perugia', 'Prato', 'Reggio Calabria', 'Reggio Emilia',
    'Rimini', 'Rome', 'Salerno', 'Sassari', 'Taranto', 'Trieste', 'Turin', 'Venice',
    'Verona',
  ],
  Netherlands: [
    'Almere', 'Amersfoort', 'Amsterdam', 'Arnhem', 'Breda', 'Delft', 'Dordrecht',
    'Eindhoven', 'Enschede', 'Groningen', 'Haarlem', 'Leiden', 'Maastricht',
    'Nijmegen', 'Rotterdam', 'The Hague', 'Tilburg', 'Utrecht', 'Zaandam',
    'Zoetermeer',
  ],
  Poland: [
    'Białystok', 'Bydgoszcz', 'Gdańsk', 'Gdynia', 'Katowice', 'Kraków', 'Lublin',
    'Łódź', 'Poznań', 'Rzeszów', 'Sosnowiec', 'Szczecin', 'Warsaw', 'Wrocław',
  ],
  Portugal: [
    'Amadora', 'Aveiro', 'Braga', 'Coimbra', 'Évora', 'Faro', 'Funchal',
    'Guimarães', 'Leiria', 'Lisbon', 'Loures', 'Matosinhos', 'Odivelas', 'Porto',
    'Setúbal', 'Sintra', 'Vila Nova de Gaia', 'Viseu',
  ],
  Romania: [
    'Brașov', 'Bucharest', 'Cluj-Napoca', 'Constanța', 'Craiova', 'Galați', 'Iași',
    'Oradea', 'Ploiești', 'Timișoara',
  ],
  Spain: [
    'A Coruña', 'Alicante', 'Almería', 'Badalona', 'Badajoz', 'Barcelona', 'Bilbao',
    'Burgos', 'Cartagena', 'Castellón de la Plana', 'Córdoba', 'Elche', 'Getafe',
    'Gijón', 'Granada', 'Hospitalet de Llobregat', 'Huelva', 'Jerez de la Frontera',
    'Las Palmas', 'Leganés', 'Logroño', 'Madrid', 'Málaga', 'Móstoles', 'Murcia',
    'Oviedo', 'Palma', 'Pamplona', 'Sabadell', 'Salamanca', 'San Sebastián',
    'Santa Cruz de Tenerife', 'Santander', 'Seville', 'Terrassa', 'Valencia',
    'Valladolid', 'Vigo', 'Vitoria-Gasteiz', 'Zaragoza',
  ],
  Sweden: [
    'Borås', 'Eskilstuna', 'Gothenburg', 'Helsingborg', 'Jönköping', 'Linköping',
    'Lund', 'Malmö', 'Norrköping', 'Örebro', 'Stockholm', 'Uppsala', 'Västerås',
  ],
};
