// STROXX brand-site demo data.
// Categories + a curated set of REAL products harvested from carl-ras.dk
// (names, prices in DKK incl. moms, item codes, Carl-Ras image asset ids).
// Purchase always happens on the local partner platform (Carl Ras in DK).

export const UTM = 'utm_source=cr-byg&utm_medium=brandsite_link&utm_campaign=stroxx';
export const CR_BRAND = 'https://www.carl-ras.dk/maerker/stroxx';

/** Live Carl-Ras CDN thumbnail for a product image asset id. */
export const crImage = (id: number | string) =>
  `https://images.carl-ras.dk/digizuitecore/LegacyService/api/assetstream/${id}/50388`;

/** Our same-origin proxy: background-knocked-out PNG for use as a WebGL texture. */
export const toolTexture = (id: number | string) => `/api/tool/${id}`;

/** Deep-link to the Carl-Ras category listing, UTM preserved. */
export const categoryBuyUrl = (path: string) => `${CR_BRAND}/${path}/?${UTM}`;

export type Category = {
  slug: string;
  name: string;
  path: string; // carl-ras path under /maerker/stroxx/
  blurb: string;
};

export const categories: Category[] = [
  { slug: 'adgangskontrol', name: 'Adgangskontrol', path: 'stroxx-adgangskontrol', blurb: 'Låse, beslag og adgang — styr på hvem der kommer ind.' },
  { slug: 'arbejdstoej', name: 'Arbejdstøj', path: 'stroxx-arbejdstoej', blurb: 'Tøj der holder til en hård dag. Uden at koste en hel løn.' },
  { slug: 'batterier', name: 'Batterier', path: 'stroxx-batterier', blurb: 'Strøm når du har brug for det. Punktum.' },
  { slug: 'belysning', name: 'Belysning og tilbehør', path: 'stroxx-belysning', blurb: 'Lys på sagen — arbejdslamper, pander og pærer.' },
  { slug: 'bits-skruetraekkere', name: 'Bits og skruetrækkere', path: 'stroxx-haandvaerktoej/stroxx-bits-skruetraekkere', blurb: 'Greb der sidder. Spidser der bider. Hver gang.' },
  { slug: 'bor-borsaet', name: 'Bor og borsæt', path: 'stroxx-bor-borsaet', blurb: 'Bor til træ, metal og beton. Rene huller, ren samvittighed.' },
  { slug: 'fugemasse', name: 'Fugemasse og tilbehør', path: 'stroxx-fugemasse-tilbehoer', blurb: 'Fuger der tætner — og pistoler der ikke driller.' },
  { slug: 'hulsave', name: 'Hulsave og tilbehør', path: 'stroxx-hulsave-tilbehoer', blurb: 'Det rette hul, første gang. Hver gang.' },
  { slug: 'kabeltromler', name: 'Kabeltromler', path: 'stroxx-kabeltromler', blurb: 'Strøm med længde nok. Og slidstyrke til pladsen.' },
  { slug: 'kemi', name: 'Kemi og maleværktøj', path: 'stroxx-kemi', blurb: 'Lim, skum, rens og spray — kemien der bare virker.' },
  { slug: 'knive', name: 'Knive og blade', path: 'stroxx-haandvaerktoej/stroxx-arbejdsknive', blurb: 'Skarpt fra start. Klar når du er.' },
  { slug: 'lasere', name: 'Lasere og tilbehør', path: 'stroxx-lasere', blurb: 'Præcision til professionelle — til en skarp pris.' },
  { slug: 'malergrej', name: 'Malergrej og tilbehør', path: 'stroxx-malergrej-tilbehoer', blurb: 'Ruller, pensler og tape til et rent resultat.' },
  { slug: 'multicutterklinger', name: 'Multicutterklinger', path: 'stroxx-multicutterklinger', blurb: 'Klinger til multicutteren — til alt det skæve.' },
  { slug: 'maalevaerktoej', name: 'Måleværktøj', path: 'stroxx-maalevaerktoej', blurb: 'Mål rigtigt. Skær én gang. Vaterpas, vinkler og mere.' },
  { slug: 'rundsavklinger', name: 'Rundsavklinger', path: 'stroxx-rundsavklinger', blurb: 'Rene snit i træ, metal og laminat. Klinger der holder.' },
  { slug: 'sikkerhed', name: 'Sikkerhed', path: 'stroxx-sikkerhed', blurb: 'Hjelm, briller, handsker — kom hel hjem.' },
  { slug: 'skurvognsartikler', name: 'Skurvognsartikler', path: 'stroxx-skurvognsartikler', blurb: 'Det skuret skal bruge. Til pausen og pladsen.' },
  { slug: 'tape', name: 'Tape', path: 'stroxx-tape', blurb: 'Tape der klæber — og slipper når den skal.' },
  { slug: 'topnoegler', name: 'Topnøglesæt, toppe og tilbehør', path: 'stroxx-topnoegler-tilbehoer', blurb: 'Topnøgler og sæt der griber om opgaven.' },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export type Badge = 'POPULÆR' | 'BLÅ PRIS' | 'KAMPAGNE' | 'BEST I TEST' | 'NYHED';

export type Product = {
  slug: string;
  name: string;
  price: string; // DKK incl. moms, Danish formatting
  unit?: string; // /Styk, /Sæt
  code?: string; // Carl-Ras "Kode"
  imgId: number; // Carl-Ras asset id
  category: string; // primary category slug
  tags: string[]; // multi-tag taxonomy slugs
  badges: Badge[];
  blurb: string;
  specs: { label: string; value: string }[];
  hero?: boolean;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const p = (
  name: string, price: string, imgId: number, category: string,
  opts: Partial<Product> = {}
): Product => ({
  slug: slugify(name),
  name, price, imgId, category,
  unit: opts.unit ?? 'Styk',
  code: opts.code,
  tags: opts.tags ?? [category],
  badges: opts.badges ?? [],
  blurb: opts.blurb ?? '',
  specs: opts.specs ?? [],
  hero: opts.hero ?? false,
});

export const products: Product[] = [
  // ——— Lasere / Måleværktøj ———
  p('Streglaser 3D Green Floor', '2.873,75', 169241, 'lasere', {
    code: '102-411', tags: ['lasere', 'maalevaerktoej'], badges: ['POPULÆR', 'BLÅ PRIS'], hero: true,
    blurb: 'Tre grønne planer på én gang — gulv, væg og loft. Den slags præcision plejer at koste det dobbelte.',
    specs: [
      { label: 'Lasertype', value: 'Grøn 3D, 12 linjer' },
      { label: 'Nøjagtighed', value: '±3 mm / 10 m' },
      { label: 'Selvnivellering', value: '± 4°' },
      { label: 'Rækkevidde m. modtager', value: '70 m' },
      { label: 'Strøm', value: 'Genopladelig Li-Ion' },
    ],
  }),
  p('Krydslaser 102-187 grøn genopladelig', '873,75', 159146, 'lasere', {
    code: '102-187', tags: ['lasere', 'maalevaerktoej'], badges: ['POPULÆR'],
    blurb: 'Grøn krydslaser til daglig brug. Tænd, ret op, og kom i gang.',
    specs: [{ label: 'Nøjagtighed', value: '±3 mm / 10 m' }, { label: 'Strøm', value: 'Genopladelig' }],
  }),
  p('Streglaser 3D Green', '2.498,75', 169234, 'lasere', {
    tags: ['lasere', 'maalevaerktoej'], blurb: 'Grøn 3D-streglaser til den, der vil have det hele med.',
    specs: [{ label: 'Lasertype', value: 'Grøn 3D' }, { label: 'Nøjagtighed', value: '±3 mm / 10 m' }],
  }),
  p('Lasersæt m/3 lasere og skinne 2 m', '2.248,75', 170576, 'lasere', {
    unit: 'Sæt', tags: ['lasere', 'maalevaerktoej'], blurb: 'Tre lasere og en 2-meters skinne — sættet til den store opgave.',
    specs: [{ label: 'Indhold', value: '3 lasere + skinne' }, { label: 'Skinne', value: '2 m' }],
  }),
  p('Afstandsmåler 102-186 genopladelig, 50 mtr', '498,75', 159147, 'maalevaerktoej', {
    code: '102-186', tags: ['maalevaerktoej', 'lasere'],
    blurb: 'Mål 50 meter med et tryk. Genopladelig, så batterijagten stopper.',
    specs: [{ label: 'Rækkevidde', value: '50 m' }, { label: 'Strøm', value: 'Genopladelig' }],
  }),
  p('Modtager heavy duty m/milimeter', '1.248,75', 143444, 'lasere', {
    code: '101-135', tags: ['lasere', 'maalevaerktoej'],
    blurb: 'Robust modtager til udendørs og lange afstande — aflæs ned til millimeteren.',
    specs: [{ label: 'Aflæsning', value: 'mm' }, { label: 'Brug', value: 'Inde + ude' }],
  }),
  p('Torpedo vaterpas 250 mm', '148,75', 134353, 'maalevaerktoej', {
    badges: ['POPULÆR'], blurb: 'Den lille, der altid er i lommen. To libeller, kompakt, præcis.',
    specs: [{ label: 'Længde', value: '250 mm' }, { label: 'Libeller', value: '2' }],
  }),
  p('Speed vinkel', '136,25', 161224, 'maalevaerktoej', {
    tags: ['maalevaerktoej'], blurb: 'Marker, sav og mål vinkler i ét greb. Uundværlig på pladsen.',
    specs: [{ label: 'Materiale', value: 'Aluminium' }],
  }),
  p('Vaterpassæt 60-120-200 cm', '656,25', 105274, 'maalevaerktoej', {
    unit: 'Sæt', code: '120-200', blurb: 'Tre længder, ét sæt. Fra dørkarm til facade.',
    specs: [{ label: 'Længder', value: '60 / 120 / 200 cm' }],
  }),
  p('Trefod til 3D laser 1,5 mtr', '536,25', 73724, 'lasere', {
    tags: ['lasere', 'maalevaerktoej'], blurb: 'Stabil trefod, 1,5 meter — får laseren op i øjenhøjde.',
    specs: [{ label: 'Maks. højde', value: '150 cm' }, { label: 'Min. højde', value: '65 cm' }],
  }),

  // ——— Rundsavklinger ———
  p('Rundsavklinge Ø160x2,0x20mm Z30 Stål', '561,25', 124546, 'rundsavklinger', {
    blurb: 'Hærdede tænder til rene snit i stål og plade.',
    specs: [{ label: 'Diameter', value: 'Ø160 mm' }, { label: 'Boring', value: '20 mm' }, { label: 'Tænder', value: 'Z30' }, { label: 'Snitbredde', value: '2,0 mm' }],
  }),
  p('Rundsavklinge Ø165x1,7x20mm Z48WF Træ', '543,75', 171900, 'rundsavklinger', {
    badges: ['POPULÆR'], blurb: 'Fint finishsnit i træ — tyndt snit, lidt spild.',
    specs: [{ label: 'Diameter', value: 'Ø165 mm' }, { label: 'Boring', value: '20 mm' }, { label: 'Tænder', value: 'Z48 WF' }, { label: 'Snitbredde', value: '1,7 mm' }],
  }),
  p('Rundsavklinge Ø160x1,8x20mm Z52NEG Laminat', '883,75', 124586, 'rundsavklinger', {
    blurb: 'Negativ tandvinkel til splintfri snit i laminat.',
    specs: [{ label: 'Diameter', value: 'Ø160 mm' }, { label: 'Tænder', value: 'Z52 NEG' }, { label: 'Snitbredde', value: '1,8 mm' }],
  }),
  p('Rundsavklinge Ø250x2,4x30mm Z60KW Træ', '866,25', 124562, 'rundsavklinger', {
    blurb: 'Stor klinge til bord- og kapsav. Rent finishsnit i træ.',
    specs: [{ label: 'Diameter', value: 'Ø250 mm' }, { label: 'Boring', value: '30 mm' }, { label: 'Tænder', value: 'Z60 KW' }],
  }),
  p('Rundsavklinge Ø160x1,8x20mm Z52NEG Alu', '430,00', 124590, 'rundsavklinger', {
    blurb: 'Skåret til aluminium og non-ferro. Køligt, rent, kontrolleret.',
    specs: [{ label: 'Diameter', value: 'Ø160 mm' }, { label: 'Tænder', value: 'Z52 NEG' }],
  }),
  p('Rundsavklinge Ø160x2,2x20mm Z10 t/eternit', '823,75', 124558, 'rundsavklinger', {
    tags: ['rundsavklinger'], blurb: 'Diamantbestykket til eternit og fibercement uden at brænde.',
    specs: [{ label: 'Diameter', value: 'Ø160 mm' }, { label: 'Tænder', value: 'Z10 diamant' }],
  }),

  // ——— Knive og blade ———
  p('Multitool Superb', '498,75', 53081, 'knive', {
    code: '102-514', tags: ['knive'], badges: ['BEST I TEST'],
    blurb: 'Tang, kniv, file, save og skruetrækkere i ét. Det værktøj du tager med, når du kun tager ét med.',
    specs: [{ label: 'Funktioner', value: '15-i-1' }, { label: 'Stål', value: 'Rustfrit' }, { label: 'Etui', value: 'Inkl.' }],
  }),
  p('Kniv Black 25 mm med hjullås', '73,75', 53078, 'knive', {
    badges: ['POPULÆR', 'BLÅ PRIS'], blurb: 'Bred 25 mm-klinge, blød hjullås. Den klassiker du altid har på dig.',
    specs: [{ label: 'Klingebredde', value: '25 mm' }, { label: 'Lås', value: 'Hjullås' }],
  }),
  p('Kniv Black 18 mm med autolås', '48,75', 53080, 'knive', {
    badges: ['BLÅ PRIS'], blurb: '18 mm med selvlåsende klinge — skub frem og skær.',
    specs: [{ label: 'Klingebredde', value: '18 mm' }, { label: 'Lås', value: 'Autolås' }],
  }),
  p('Kniv Black 18 mm med hjullås', '48,75', 53072, 'knive', {
    blurb: 'Smal 18 mm-klinge til finarbejdet. Sikker hjullås.',
    specs: [{ label: 'Klingebredde', value: '18 mm' }, { label: 'Lås', value: 'Hjullås' }],
  }),
  p('Knivblade Black 25 mm á 10 stk', '86,25', 53068, 'knive', {
    unit: 'Pakke', blurb: 'Ti skarpe i posen. Knæk af, kør videre.',
    specs: [{ label: 'Bredde', value: '25 mm' }, { label: 'Antal', value: '10 stk' }],
  }),
  p('Knivblade 25 mm á 10 stk', '48,75', 53071, 'knive', {
    unit: 'Pakke', blurb: 'Standardblade til 25 mm-kniven. Skarpe fra første snit.',
    specs: [{ label: 'Bredde', value: '25 mm' }, { label: 'Antal', value: '10 stk' }],
  }),
  p('Kniv 18 mm m/skrue og hage', '57,50', 69855, 'knive', {
    blurb: 'Skruelås og bælte-hage — bliver hvor du lægger den.',
    specs: [{ label: 'Klingebredde', value: '18 mm' }, { label: 'Lås', value: 'Skrue' }],
  }),
];

export const productBySlug = (slug: string) => products.find((x) => x.slug === slug);
export const heroProducts = products.filter((x) => x.hero);
export const productsInCategory = (slug: string) => products.filter((x) => x.tags.includes(slug) || x.category === slug);

// Tools that fall into the bag as you scroll (distinct silhouettes, dark
// subjects that knock out cleanly). price drives the running price-tag total.
export const bagTools: { id: number; label: string; price: number }[] = [
  { id: 53078, label: 'Kniv Black 25 mm', price: 73.75 },
  { id: 134353, label: 'Torpedo vaterpas', price: 148.75 },
  { id: 124546, label: 'Rundsavklinge Z30', price: 561.25 },
  { id: 161224, label: 'Speed vinkel', price: 136.25 },
  { id: 159146, label: 'Krydslaser 102-187', price: 873.75 },
  { id: 53081, label: 'Multitool Superb', price: 498.75 },
  { id: 171900, label: 'Rundsavklinge Z48WF', price: 543.75 },
  { id: 159147, label: 'Afstandsmåler', price: 498.75 },
  { id: 53080, label: 'Kniv Black 18 mm', price: 48.75 },
  { id: 105274, label: 'Vaterpassæt', price: 656.25 },
];

export const formatDKK = (n: number) =>
  n.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// On-brand assets shipped locally in /public (from the STROXX brand kit).
export const brandImages = {
  lizaBag: '/brand/liza-bag.jpg',
  cabinet: '/brand/cabinet.jpg',
  square03: '/brand/liza-bag.jpg',
  square04: '/brand/cabinet.jpg',
  og: '/brand/og.jpg',
  logoWhite: '/brand/logo-white.svg',
  guaranteeFilm: '/films/sticker.mp4',
};

/** Real category lifestyle image shipped in /public/categories. */
export const categoryImage = (slug: string) => `/categories/${slug}.jpg`;

export type Specialist = { name: string; role: string; location: string; photo: string; quote: string; phone: string; email: string };

export const specialists: Specialist[] = [
  { name: 'Niels Storm', role: 'Sourcing Manager', location: 'Herlev', photo: '/specialists/niels-storm.jpg', phone: '22767114', email: 'nst@carl-ras.dk',
    quote: 'Jeg sourcer værktøj hele dagen. STROXX er det eneste sted, hvor prisen overrasker mig mere end specs’ne.' },
  { name: 'Andreas Carlson', role: 'Teamleder', location: 'Sydhavnen', photo: '/specialists/andreas-carlson.jpg', phone: '51350611', email: 'anca@carl-ras.dk',
    quote: 'Mit team bruger det selv. Det er den bedste anbefaling, jeg kan give.' },
  { name: 'Susan Christensen', role: 'Intern Sælger', location: 'Næstved', photo: '/specialists/susan-christensen.jpg', phone: '81775550', email: 'susa@carl-ras.dk',
    quote: 'Håndværkere mærker forskel på godt og skidt. STROXX føles rigtigt i hånden.' },
  { name: 'Rudi Olesen', role: 'Intern Sælger', location: 'Århus', photo: '/specialists/rudi-olesen.jpg', phone: '81779180', email: 'ruol@carl-ras.dk',
    quote: 'En streglaser til den pris? Jeg solgte tre i går.' },
  { name: 'Ulrik Bjørnsson', role: 'Intern Sælger', location: 'Hørsholm', photo: '/specialists/ulrik-bjornsson.jpg', phone: '81775302', email: 'ub@carl-ras.dk',
    quote: 'Kunderne kommer tilbage og griner: “Hvorfor har jeg betalt dobbelt før?”' },
  { name: 'Martin Lübker', role: 'Intern Sælger', location: 'Århus N.', photo: '/specialists/martin-lubker.jpg', phone: '81778687', email: 'malu@carl-ras.dk',
    quote: 'Jeg anbefaler STROXX uden at blinke. Det holder — og det koster ingenting.' },
  { name: 'Lea Ahrnkiel', role: 'Intern Sælger', location: 'Sydhavnen', photo: '/specialists/lea-ahrnkiel.jpg', phone: '81775702', email: 'leah@carl-ras.dk',
    quote: 'Folk tror, der er en fidus. Der er bare ikke noget mærke-tillæg.' },
  { name: 'Theis Lindgren', role: 'Intern Sælger', location: 'Amager', photo: '/specialists/theis-lindgren.jpg', phone: '81779713', email: 'thli@carl-ras.dk',
    quote: 'Knivene alene er grund nok. Skarpe, billige, altid på lager.' },
  { name: 'Nikolaj Ungermand', role: 'Sourcing & ESG', location: 'Herlev', photo: '/specialists/nikolaj-ungermand.jpg', phone: '51221002', email: 'nn@carl-ras.dk',
    quote: 'Samme kvalitet som mærkerne — bare uden mærke-tillægget. Det er hele pointen.' },
];

/** Featured categories for the homepage "bag fills" act — each with a hero product. */
export const featuredCategorySlugs = ['lasere', 'rundsavklinger', 'knive', 'maalevaerktoej'];
export const featuredCategories = featuredCategorySlugs
  .map((slug) => {
    const cat = categories.find((c) => c.slug === slug)!;
    const items = products.filter((p) => p.tags.includes(slug) || p.category === slug);
    return { cat, items, hero: items.find((i) => i.hero) ?? items[0] };
  })
  .filter((f) => f.hero);
