/**
 * Seeds "Focus on…" (Fokus på…): the two focus pages ported from the Webflow
 * fokus-paa pages (LED strip on cable reel, Smart Lock ST-3) in Danish and
 * English, their filter categories, and the translation links between them.
 * Images and films are copied from the Webflow CDN into Sanity's own asset
 * store, so the new site never depends on Webflow staying up. Webflow itself
 * is only READ, never written.
 *
 * Plain Node (no tsx), so it runs anywhere Node 22 runs:
 *   node scripts/seed-focus.mjs --env .env.local            create what is missing
 *   node scripts/seed-focus.mjs --env .env.local --force    overwrite (loses Studio edits!)
 *   node scripts/seed-focus.mjs --env .env.local --dry      print, write nothing
 *   node scripts/seed-focus.mjs --env .env.local --nav      ALSO point the menu at /focus-on
 *
 * Needs SANITY_API_WRITE_TOKEN (from the --env file or the environment).
 * Idempotent: fixed document ids, createIfNotExists unless --force. Assets
 * are de-duplicated by Sanity (same bytes = same asset).
 *
 * Copy rules kept: no prices anywhere; the Danish documents may name Carl Ras
 * (the Danish dealer), the English base stays dealer-neutral (buy contract):
 * its buttons resolve to the visitor's dealer or the dealer chooser.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const envIdx = args.indexOf('--env');
if (envIdx >= 0) {
  const file = args[envIdx + 1];
  for (const line of fs.readFileSync(path.resolve(file), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
const FORCE = flag('--force');
const DRY = flag('--dry');
const NAV = flag('--nav');
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token && !DRY) {
  console.error('SANITY_API_WRITE_TOKEN missing (pass --env .env.local)');
  process.exit(1);
}
const { createClient } = await import(process.env.SANITY_CLIENT_ENTRY || '@sanity/client');
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'cr7dktly',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'demo',
  apiVersion: '2026-07-12',
  token,
  useCdn: false,
});

const WF = 'https://cdn.prod.website-files.com/693fc82ce8e0df3e1f7ceda4/';
const WF_CMS = 'https://cdn.prod.website-files.com/693fc82ce8e0df3e1f7cedb8/';

/* ── assets ─────────────────────────────────────────────────────────────── */
const cache = new Map();
async function upload(url, kind = 'image') {
  if (cache.has(url)) return cache.get(url);
  if (DRY) {
    const fake = { _id: `dry-${cache.size}`, url };
    cache.set(url, fake);
    return fake;
  }
  const res = await fetch(url, { headers: { 'user-agent': 'stroxx-seed/1.0' } });
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = decodeURIComponent(url.split('/').pop()).replace(/^.*%2F/, '').replace(/^[0-9a-f]{24}_/, '');
  const asset = await client.assets.upload(kind, buf, { filename, source: { name: 'webflow-fokus-paa', id: url, url } });
  cache.set(url, asset);
  process.stdout.write('.');
  return asset;
}
const abs = (f, base) => (/^https?:/.test(f) ? f : base + f);
const img = async (file, alt = '', base = WF) => {
  const a = await upload(abs(file, base), 'image');
  return { _type: 'image', asset: { _type: 'reference', _ref: a._id }, ...(alt ? { alt } : {}) };
};
const file = async (f) => {
  const a = await upload(abs(f, WF), 'file');
  return { _type: 'file', asset: { _type: 'reference', _ref: a._id } };
};
const fileUrl = async (f) => (await upload(abs(f, WF), 'file')).url;

let k = 0;
const key = () => `k${(++k).toString(36)}`;
const keyed = (arr) => arr.map((x) => (typeof x === 'object' && x !== null && !Array.isArray(x) ? { _key: key(), ...x } : x));

/* ── shared bits ────────────────────────────────────────────────────────── */
const CR = (p, camp) =>
  `https://www.carl-ras.dk${p}${p.includes('?') ? '&' : '?'}utm_source=cr-gruppen&utm_medium=brandsite_link&utm_campaign=${camp}`;
const LED_C = 'fokus%20led%20strip';
const ST3_C = 'fokus%20smart%20lock%20st-3';

const PEOPLE_DA = async () =>
  keyed([
    { _type: 'person', name: 'Ulrik Bjørnsson', role: 'Intern sælger', location: 'Carl Ras, Hørsholm', bio: 'Intern sælger med over 30 års erfaring i branchen, heraf seks år i Reparations Center. Rådgiver med afsæt i praktisk erfaring.', phone: '81 77 53 02', email: 'ub@carl-ras.dk', photo: await img('69a70cf59aa0c054da712661_Ulrik-Bj%C3%B8rnsson.jpg', 'Ulrik Bjørnsson', WF_CMS) },
    { _type: 'person', name: 'Martin Lübker', role: 'Intern sælger', location: 'Carl Ras, Aarhus N', bio: 'Intern sælger med mange års erfaring fra byggemarkedsbranchen. Solidt kendskab til værktøj, materialer og hverdagen på pladsen.', phone: '81 77 86 87', email: 'malu@carl-ras.dk', photo: await img('69a70d169229e41e2bfe815c_Martin-Lu%CC%88bker.jpg', 'Martin Lübker', WF_CMS) },
    { _type: 'person', name: 'Susan Christensen', role: 'Intern sælger', location: 'Carl Ras, Næstved', bio: 'Intern sælger med mange års erfaring fra detail- og engroshandel, med særligt fokus på håndværkere og professionelle kunder.', phone: '81 77 55 50', email: 'susa@carl-ras.dk', photo: await img('69a711005702a6ebd37b1690_Susan-Christensen.jpg', 'Susan Christensen', WF_CMS) },
    { _type: 'person', name: 'Theis Lindgren', role: 'Intern sælger', location: 'Carl Ras', phone: '81 77 97 13', email: 'thli@carl-ras.dk', photo: await img('69a70d7ca951934b6bce7d48_Theis-Lindgren.jpg', 'Theis Lindgren', WF_CMS) },
    { _type: 'person', name: 'Niels Storm', role: 'Sourcing Manager', location: 'Carl Ras', phone: '22 76 71 14', email: 'nst@carl-ras.dk', photo: await img('69a70cb783c05ef543f06aa0_Niels-Storm.jpg', 'Niels Storm', WF_CMS) },
    { _type: 'person', name: 'Andreas Carlson', role: 'Teamleder', location: 'Carl Ras, Sydhavnen', phone: '51 35 06 11', email: 'anca@carl-ras.dk', photo: await img('69a6f204d4d17cb478192e66_Andreas-Carlson.jpg', 'Andreas Carlson', WF_CMS) },
  ]);

/* ── LED strip on cable reel ────────────────────────────────────────────── */
async function ledSections(lang) {
  const da = lang === 'da-DK';
  const t = (d, e) => (da ? d : e);
  const heroFilm = {
    _type: 'photoHero',
    height: 'full',
    align: 'left',
    videoFile: await file('6aa13c64902de7e760744bf8_se-lyset-16x9-v3.mp4'),
    videoUrlSquare: await fileUrl('6aa13c66eab6cb800df8a1b8_se-lyset-1x1-v3.mp4'),
    videoUrlPortrait: await fileUrl('6aa13c66a187583405ab6236_se-lyset-9x16-v3.mp4'),
    imageUpload: await img('6aa13c6684c99f6dc8e3c982_se-lyset-16x9-poster-v3.jpg', t('STROXX LED-strip lyser en mørk gang op', 'STROXX LED strip lighting a dark corridor')),
    cueLabel: t('Rul ned', 'Scroll down'),
    disclosure: t(
      'AI-genereret indhold. Film og stemningsbilleder på denne side er skabt med kunstig intelligens.',
      'AI-generated content. The films and mood images on this page were made with artificial intelligence.',
    ),
  };
  const productPhoto = await img('6a9732a1fe45771ef7148338_magnific_dramatic-studio-product-p_WDonD1jcXe.jpg', t('STROXX LED-strip på kabeltromle', 'STROXX LED strip on a cable reel'));
  const cards = async (list) =>
    keyed(
      await Promise.all(
        list.map(async ([file_, alt, title, body, item, p, badge]) => ({
          _type: 'linkCard',
          imageUpload: await img(file_, alt),
          title,
          body,
          itemNumber: item,
          ...(da && p ? { href: CR(p, LED_C) } : {}),
          ...(badge ? { badge } : {}),
        })),
      ),
    );
  return keyed([
    heroFilm,
    {
      _type: 'splitMedia',
      imageSide: 'right',
      colour: true,
      fit: 'cover',
      eyebrow: t('Rigtigt smart', 'Properly clever'),
      headline: t('Super fleksibel LED-strip på *kabeltromle*', 'A seriously flexible LED strip on a *cable reel*'),
      body: t(
        'Klokken er 15.30, og lyset er væk. STROXX LED-strip på kabeltromle giver 20 meter jævnt arbejdslys fra ét stik. Rul hele strippen ud, tænd, og rul den ind igen når lyset er slukket og kølet af.',
        'It is half past three and the daylight has gone. The STROXX LED strip on a cable reel gives you 20 metres of even work light from a single plug. Unroll the whole strip, switch on, and roll it back in once the light is off and has cooled down.',
      ),
      ctaLabel: t('Kun hos Carl Ras', 'Where to buy'),
      ...(da ? { ctaHref: CR('/led-strip-kabeltromle-1500-l/?product=55011717/55011718', LED_C) } : {}),
      itemNumber: '55011718',
      imageUpload: productPhoto,
    },
    {
      _type: 'numberedTabs',
      eyebrow: t('Det smarte ved…', 'What makes it smart'),
      headline: t('Rul ud, tænd, og *lad den stå*', 'Unroll, switch on, *leave it be*'),
      items: keyed([
        { _type: 'tabItem', title: t('20 meter fra ét stik', '20 metres from one plug'), body: t('Tyve meter lys fra én stikkontakt, samlet på en tromle du kan bære. Rul hele længden ud før du tænder, og rul den ind igen når arbejdet er slut. Ingen bunke på gulvet.', 'Twenty metres of light from one socket, gathered on a reel you can carry. Unroll the full length before switching on, and roll it back in when the job is done. No heap on the floor.'), imageUpload: await img('6a97211d88e1a2004c21cdd3_magnific_a-flexible-ip65-led-rope-_3zT9jwGREY.jpg', t('LED-lyssnor formet som tallet 20 på en mørk overflade.', 'LED strip shaped as the number 20 on a dark surface.')), colour: true },
        { _type: 'tabItem', title: t('1.500 lumen pr. meter', '1,500 lumen per metre'), body: t('Lyset ligger langs hele strippen i stedet for at blive kastet fra ét punkt. Ingen skarpe skygger, og ingen døde hjørner midt i opgaven.', 'The light runs along the whole strip instead of being thrown from a single point. No hard shadows, and no dead corners in the middle of the job.'), imageUpload: await img('6a97211daf40fdb4afa70d7b_magnific_a-flexible-ip65-led-rope-_jUPkhjrLD0.jpg', t('LED-lys snoet i formen af tallet 1500, placeret på en mørk, ru overflade.', 'LED strip twisted into the number 1500 on a dark, rough surface.')), colour: true },
        { _type: 'tabItem', title: t('IP65 på selve strippen', 'IP65 on the strip itself'), body: t('Strippen er støvtæt og tåler vandstråler fra alle retninger. Driver, stik og samlinger har ikke en selvstændig IP-klasse, så placeringen af dem skal vurderes som en del af installationen.', 'The strip is dust-tight and withstands water jets from every direction. The driver, plug and joints have no IP rating of their own, so where they sit has to be judged as part of the installation.'), imageUpload: await img('6a97211dc99b2891db8c29f8_magnific_a-flexible-ip65-led-rope-_tCqBnb4mZJ.jpg', t('Led-lys i form af tegnene "IP65" på en mørk overflade.', 'LED light shaped as "IP65" on a dark surface.')), colour: true },
      ]),
    },
    {
      _type: 'textIntro',
      eyebrow: t('Værdi for pengene', 'Value for money'),
      headline: t('Professionelt arbejdslys. Til overraskende *almindelig pris.*', 'Professional work light. Without the *professional markup.*'),
      intro: t(
        'Vi bygger lyset, så det holder til en byggeplads gennem hele vinteren, og lader kvaliteten afgøre resten. Se lyset og priserne hos Carl Ras.',
        'We build the light to last a building site through a whole winter, and let the quality settle the rest. See the light at your STROXX dealer.',
      ),
    },
    {
      _type: 'hotspotImage',
      eyebrow: t('Tæt på', 'Up close'),
      headline: t('Tromler alle *de andre*', 'Reels in *the rest*'),
      sub: t('Tryk på et punkt og se, hvad de enkelte dele af tromlen er til for.', 'Tap a point to see what each part of the reel is for.'),
      frame: '4/5',
      showList: true,
      listItems: t(
        ['20 meter på tromle. Rul hele længden ud, før du tænder.', 'Ét stik, ét kabel. Hele længden fra en enkelt 230 V stikkontakt.', '1.500 lumen pr. meter, jævnt fordelt langs hele strippen.', 'IP65. Tåler støv og vandstænk fra alle retninger.'],
        ['20 metres on a reel. Unroll the full length before you switch on.', 'One plug, one cable. The whole length from a single 230 V socket.', '1,500 lumen per metre, spread evenly along the strip.', 'IP65. Withstands dust and water from every direction.'],
      ),
      imageUpload: await img('6a9732a208c5161139a30a82_magnific_dramatic-studio-product-p_hu5tu9VvqL.jpg', t('STROXX LED-strip på kabeltromle set forfra', 'STROXX LED strip on a cable reel, front view')),
      fit: 'cover',
      spots: keyed([
        { _type: 'hotspot', title: t('20 meter på tromle', '20 metres on a reel'), body: t('Tromlen holder de tyve meter samlet under transport. Strippen skal rulles helt ud, før den tændes, og først rulles ind igen når den er slukket og kølet af.', 'The reel keeps the twenty metres together in transport. Unroll the strip fully before switching on, and only roll it in again once it is off and has cooled down.'), x: 84, y: 40 },
        { _type: 'hotspot', title: t('Ét stik, ét kabel', 'One plug, one cable'), body: t('Hele længden kører fra en enkelt 230 V stikkontakt. Og så er der kun én ledning at falde over.', 'The whole length runs from a single 230 V socket. And there is only one cable to trip over.'), x: 17, y: 53 },
        { _type: 'hotspot', title: t('1.500 lumen pr. meter', '1,500 lumen per metre'), body: t('Lyset ligger langs hele strippen i stedet for at blive kastet fra ét punkt. Du kan arbejde helt uden skarpe skygger.', 'The light runs along the whole strip instead of being thrown from one point. You can work without hard shadows.'), x: 81.6, y: 64 },
        { _type: 'hotspot', title: t('IP65. Bygget til byggepladsen', 'IP65. Built for the site'), body: t('Støvtæt og tåler vand fra alle retninger. Driver, stik og samlinger skal placeres efter forholdene på pladsen.', 'Dust-tight and water-resistant from every direction. Place the driver, plug and joints to suit the site.'), x: 40.5, y: 36 },
      ]),
    },
    {
      _type: 'filmSection',
      videoFile: await file('https://cdn.prod.website-files.com/693fc82ce8e0df3e1f7ceda4%2F6aa2712b63d38f57df30812c_STROXX_selyset_packshot_logo_v3_mp4.mp4'),
      posterUpload: await img('https://cdn.prod.website-files.com/693fc82ce8e0df3e1f7ceda4%2F6aa2712b63d38f57df30812c_STROXX_selyset_packshot_logo_v3_poster.0000000.jpg', t('Se lyset', 'See the light')),
      ratio: '16/9',
      footnote: t('AI-genereret indhold', 'AI-generated content'),
    },
    {
      _type: 'comparisonTable',
      eyebrow: t('Sammenlign', 'Compare'),
      headline: t('Tyve meter, halvtreds meter eller *fast installation*', 'Twenty metres, fifty metres or *fixed installation*'),
      intro: t('Samme lys, tre måder at få det ud på. Valget afhænger af, hvor langt lyset skal række, og om lyset skal flytte sig med jer eller blive hængende.', 'The same light, three ways to get it out there. It depends on how far the light has to reach, and whether it moves with you or stays put.'),
      cornerLabel: 'STROXX',
      columns: keyed([
        { _type: 'cmpColumn', name: t('20 m på tromle', '20 m on reel'), note: t('Varenr. 55011718', 'Item 55011718'), tag: t('Fokusprodukt', 'Focus product'), highlight: true },
        { _type: 'cmpColumn', name: t('50 m på tromle', '50 m on reel'), note: t('Varenr. 55011719', 'Item 55011719') },
        { _type: 'cmpColumn', name: t('20 m uden tromle', '20 m without reel'), note: t('Varenr. 55011716', 'Item 55011716') },
      ]),
      rows: keyed([
        { _type: 'cmpRow', label: t('Længde', 'Length'), cells: ['20 m', '50 m', '20 m'] },
        { _type: 'cmpRow', label: t('Effekt i alt', 'Total power'), cells: ['300 W', '750 W', '300 W'] },
        { _type: 'cmpRow', label: t('Leveres på tromle', 'Supplied on a reel'), cells: ['+', '+', '-'] },
        { _type: 'cmpRow', label: t('Kan rulles ud og ind efter brug', 'Rolls out and back in after use'), cells: ['+', '+', '-'] },
        { _type: 'cmpRow', label: t('Kan forlænges med koblingsskruer', 'Extendable with couplers'), cells: ['+', '-', '+'] },
      ]),
      notes: keyed([
        { _type: 'cmpNote', title: t('1.500 lumen. Pr. meter.', '1,500 lumen. Per metre.'), body: t('1.500 lumen er pr. meter, ikke for hele strippen. På tyve meter giver det et beregnet samlet lysoutput på cirka 30.000 lumen. Beregnet, fordi tallet er 1.500 ganget med længden og ikke en selvstændig måling.', '1,500 lumen is per metre, not for the whole strip. Over twenty metres that is a calculated total output of about 30,000 lumen. Calculated, because it is 1,500 multiplied by the length, not a separate measurement.') },
        { _type: 'cmpNote', title: t('IP65 gælder strippen. Ikke hele installationen.', 'IP65 covers the strip. Not the whole installation.'), body: t('Strippen er støvtæt og tåler vandstråler fra alle retninger. Driver, stik og samlinger har ikke en selvstændig IP-klasse. Placer dem tørt og hævet, så hele opstillingen kan holde til den plads, den står på.', 'The strip is dust-tight and withstands water jets from every direction. The driver, plug and joints have no IP rating of their own. Keep them dry and raised so the whole set-up suits the site it stands on.') },
      ]),
    },
    {
      _type: 'specGrid',
      eyebrow: t('Specifikationer', 'Specifications'),
      headline: t('Tallene bag *lyset*', 'The numbers behind *the light*'),
      intro: t('Her få du alle de hårde fakta. Så er det op til dig til at se lyset.', 'All the hard facts are here. Seeing the light is up to you.'),
      specs: keyed([
        { _type: 'spec', value: '1500', unit: 'lumen', body: t('Pr. meter, med 180 LED pr. meter. Over de tyve meter giver det et beregnet samlet lysoutput på cirka 30.000 lumen.', 'Per metre, with 180 LEDs per metre. Over twenty metres that is a calculated total of about 30,000 lumen.') },
        { _type: 'spec', value: '300', unit: 'watt', body: t('På tyve meter modellen, varenr. 55011718. Halvtreds meter modellen trækker 750 W.', 'On the twenty-metre model, item 55011718. The fifty-metre model draws 750 W.') },
        { _type: 'spec', value: 'IP65', unit: t('tæthed', 'sealing'), body: t('Tæt mod støv og mod vandstråler fra alle retninger. Vurder placeringen af driver, stik og samlinger som en del af installationen.', 'Dust-tight and protected against water jets from every direction. Judge where the driver, plug and joints sit as part of the installation.') },
        { _type: 'spec', value: '120°', unit: t('spredning', 'beam spread'), body: t('Lyset lægger sig bredt over fladen i stedet for at samle sig i en spot.', 'The light spreads wide across the surface instead of gathering in a spot.') },
        { _type: 'spec', value: '20 m', unit: t('på tromle', 'on a reel'), body: t('Kan afkortes pr. meter og forlænges med koblingsskruer op til maksimalt 50 meter.', 'Can be cut per metre and extended with couplers up to a maximum of 50 metres.') },
        { _type: 'spec', value: '230 V', unit: t('almindelig stikkontakt', 'ordinary socket'), body: t('Ingen transformer, ingen særlig tilslutning. Ét stik til hele længden.', 'No transformer, no special connection. One plug for the whole length.') },
      ]),
    },
    {
      _type: 'modelCards',
      title: t('Tre længder', 'Three lengths'),
      intro: t('Samme strip og samme lys pr. meter. Det, længden ændrer, er den samlede effekt og hvor langt lyset rækker.', 'The same strip and the same light per metre. What the length changes is total power and how far the light reaches.'),
      cards: keyed(
        [
          ['10 meter', t('Gangen, kælderen, én etage', 'The corridor, the basement, one floor'), '10 m', '150 W', '55011717', false],
          [t('20 meter', '20 metres'), t('Vores fokus produkt. Gangen, opgangen, tunnelen', 'Our focus product. Corridor, stairwell, tunnel'), '20 m', '300 W', '55011718', true],
          [t('50 meter', '50 metres'), t('Hele etageplanen, tunnelen, opgangen', 'The whole floor plan, the tunnel, the stairwell'), '50 m', '750 W', '55011719', false],
        ].map(([name, use, len, w, item, hl]) => ({
          _type: 'modelCard',
          name: da ? name : String(name).replace('10 meter', '10 metres'),
          use,
          highlight: hl,
          rows: keyed([
            { _type: 'kv', key: t('Længde', 'Length'), value: len },
            { _type: 'kv', key: t('Lys', 'Light'), value: t('1.500 lumen pr. meter', '1,500 lumen per metre') },
            { _type: 'kv', key: t('Effekt i alt', 'Total power'), value: w },
            { _type: 'kv', key: t('Tilslutningskabel', 'Supply cable'), value: '4,5 m' },
            { _type: 'kv', key: t('Varenummer', 'Item number'), value: item },
            { _type: 'kv', key: t('Leveres som', 'Supplied as'), value: t('Tromle med strip, kabel og driver', 'Reel with strip, cable and driver') },
          ]),
          linkLabel: t('Se den hos Carl Ras', 'Where to buy'),
          itemNumber: item,
          ...(da ? { href: CR(`/led-strip-kabeltromle-1500-l/?product=55011717/${item}`, LED_C) } : {}),
        })),
      ),
      foot: t('Skal lyset blive hængende, findes samme strip uden tromle i 10 meter på 150 W, varenr. 55011715, og i 20 meter på 300 W, varenr. 55011716.', 'If the light is staying put, the same strip comes without a reel in 10 metres at 150 W, item 55011715, and 20 metres at 300 W, item 55011716.'),
    },
    {
      _type: 'textIntro',
      intro: t(
        'Vores fokus produkt er STROXX LED-strip kabeltromle 1500L, 300W, 20 m, varenr. 55011718, produktkode 101-460. Strippen leveres med 4,5 meter tilslutningskabel og driver til 220 til 240 V, og er fleksibel og modstandsdygtig over for vibrationer. De 30.000 lumen er et beregnet tal, 1.500 lumen pr. meter ganget med 20 meter, ikke en selvstændig producentangivelse. Se det præcise datablad på varenummeret hos Carl Ras.',
        'Our focus product is the STROXX LED strip cable reel 1500L, 300 W, 20 m, item 55011718, product code 101-460. The strip comes with a 4.5 metre supply cable and a driver for 220 to 240 V, and is flexible and resistant to vibration. The 30,000 lumen is a calculated figure, 1,500 lumen per metre times 20 metres, not a separate manufacturer rating. Your dealer has the exact data sheet under the item number.',
      ),
    },
    {
      _type: 'safetyNotice',
      eyebrow: t('Vigtigt! Før du tænder', 'Important! Before you switch on'),
      headline: t('Rul altid strippen helt ud, *før du tænder*', 'Always unroll the strip fully *before you switch on*'),
      body: t('Lyset må ikke være tændt, mens det stadig ligger på tromlen. Varmen kan ikke slippe væk fra en oprullet tromle, og det går ud over både strippen og sikkerheden. Rul ud først, tænd bagefter, og rul først ind igen når lyset er slukket og kølet af.', 'The light must not be on while it is still on the reel. Heat cannot escape from a coiled reel, and that harms both the strip and safety. Unroll first, switch on after, and only roll it back in once the light is off and has cooled down.'),
      sub: t('Det gælder alle længder, også når du kun mangler et par meter.', 'This applies to every length, even when you only need a couple of metres.'),
    },
    {
      _type: 'imageMosaic',
      colour: false,
      images: keyed(
        await Promise.all([
          ['6a9732a3a6821a26bd0f8940_magnific_grainy-black-and-white-do_p8aMmraehw.png', t('Elektriker arbejder ved en vægdåse i en råhusgang oplyst af LED-strip', 'An electrician at a wall box in a raw corridor lit by LED strip')],
          ['6a9732a2c99b2891db93ec78_magnific_grainy-black-and-white-do_xSy17e5jfW.jpg', t('Arbejdslys ruller ud langs væggen i en betonråhusgang i skumring', 'Work light rolled out along the wall of a concrete corridor at dusk')],
          ['6a983467f26b442b493b3080_magnific_grainy-black-and-white-do_Sy3AXKrUb8.jpg', t('STROXX arbejdslampe tændt i et mørkt værksted ved en søjleboremaskine', 'A STROXX work lamp on in a dark workshop by a pillar drill')],
          ['6a9732a25c0df52aa09a6d7e_magnific_grainy-black-and-white-do_nVXGDgAYQD.jpg', t('Elektriker arbejder ved en vægdåse i en råhusgang oplyst af LED-strip', 'An electrician working in a corridor lit by LED strip')],
          ['6a9732a23210f17769ae742c_magnific_grainy-black-and-white-do_xSy1w1bjfW.jpg', t('Arbejdslys ruller ud langs væggen i en betonråhusgang i skumring', 'Work light along a concrete wall at dusk')],
        ].map(async ([f, a]) => ({ ...(await img(f, a)), _type: 'mosaicImage' }))),
      ),
      disclosure: t('AI-genereret indhold. Billederne er skabt med kunstig intelligens.', 'AI-generated content. The images were made with artificial intelligence.'),
    },
    {
      _type: 'linkCards',
      eyebrow: t('Fokus på lysunivers', 'The STROXX light range'),
      headline: t('Fem der allerede *arbejder...*', 'Five already *at work...*'),
      intro: t('Fra pandelampe til projektlys. Det samme lys, i den størrelse opgaven kræver.', 'From head torch to floodlight. The same light, in the size the job needs.'),
      linkLabel: t('Se den hos Carl Ras', 'Where to buy'),
      cards: await cards([
        ['6a96fd94298bf7d2c2924541_39013533_50391.png', t('STROXX akku arbejdslampe 18V LED, 3500 lumen', 'STROXX cordless work lamp 18 V LED, 3,500 lumen'), t('Arbejdslampe 18V LED 440, 3500L', 'Work lamp 18 V LED 440, 3500L'), t('Akku arbejdslampe til servicebilen og de opgaver, hvor der ikke er strøm i væggen endnu.', 'Cordless work lamp for the service van, and the jobs where there is no power in the wall yet.'), '39013533', '/arbejdslampe-18v-led-440-25-w-3500-lumen/?product=39013533/39013533'],
        ['6a96fd5d7a3dcdbd96aaf02d_55011716a_50391.png', t('STROXX LED-strip 1500 lumen, 300 W, 20 meter', 'STROXX LED strip 1500 lumen, 300 W, 20 metres'), 'LED Strip 1500 L, 300W, 20 m', t('Samme lys som tromlen, uden tromlen. Til den faste installation på pladsen.', 'The same light as the reel, without the reel. For a fixed installation on site.'), '55011716', '/led-strip-1500-l-300w-20m/?product=55011716/55011716'],
        ['6a96f7829a887e00ef4fa184_55011719_50391.png', t('STROXX LED-strip på kabeltromle, 750 W, 50 meter', 'STROXX LED strip on a cable reel, 750 W, 50 metres'), t('LED-strip kabeltromle 1500L, 750W, 50 m', 'LED strip cable reel 1500L, 750 W, 50 m'), t('Halvtreds meter på tromle, når gangen, tunnelen eller etagen er for lang til tyve.', 'Fifty metres on a reel, for when the corridor, tunnel or floor is too long for twenty.'), '55011719', '/led-strip-kabeltromle-1500-l/?product=55011717/55011719'],
        ['6a96f7823e0f8edd6fae8853_55011140_50391.png', t('STROXX pandelampe 200 lumen', 'STROXX head torch 200 lumen'), t('Pandelampe 200L', 'Head torch 200L'), t('Lyset følger med hovedet. Til skabet, krybekælderen og alt det, der sidder i vejen.', 'The light follows your head. For the cupboard, the crawl space and everything in the way.'), '55011140', '/pandelampe-200l/?product=55011140/55011140'],
        ['6a96f7822d5c9d81e082e167_55011703_50391.png', t('STROXX genopladelig pandelampe 1200 lumen', 'STROXX rechargeable head torch 1200 lumen'), t('Pandelampe genopladelig 1200L', 'Rechargeable head torch 1200L'), t('Tolv hundrede lumen på panden, og ingen batterier at købe på vej hjem.', 'Twelve hundred lumen on your forehead, and no batteries to buy on the way home.'), '55011703', '/pandelampe-genopladelig-1200l/?product=55011703/55011703'],
      ]),
      secondHeadline: t('...og tre helt nye', '...and three brand new'),
      secondCards: await cards([
        ['6a96f782f2142bff0ce48f9d_55011708_50391.png', t('STROXX ballon arbejdslampe 31000 lumen', 'STROXX balloon work lamp 31,000 lumen'), t('Arbejdslampe Ballon 31000L komplet', 'Balloon work lamp 31000L complete'), t('Blændfrit ballonlys, der lyser en hel etage op uden skarpe skygger.', 'Glare-free balloon light that lights a whole floor without hard shadows.'), '55011708', '/arbejdslampe-ballon-31000l-komplet/?product=55011708/55011708', t('Nyhed', 'New')],
        ['6a96f782ad2ac15cc91aed26_55011802_1_50391.png', t('STROXX Mega power LED 360 grader, 400 W', 'STROXX Mega power LED 360 degrees, 400 W'), 'Mega power LED 360°, 400W', t('360 graders arbejdslys til projekter, hvor én retning ikke rækker.', '360-degree work light for projects where one direction is not enough.'), '55011802', '/arbejdslampe-mega-power-led-work-light-360-400w/?product=55011802/55011802', t('Nyhed', 'New')],
        ['6a96fd947e6df8d58e4c54be_55011803_50391.png', t('STROXX Mega power LED 360 grader, 800 W', 'STROXX Mega power LED 360 degrees, 800 W'), 'Mega power LED 360°, 800W', t('Topmodellen i lysuniverset. Til de største pladser og de mørkeste måneder.', 'The top model in the range. For the biggest sites and the darkest months.'), '55011803', '/arbejdslampe-mega-power-led-360-800w/?product=55011803/55011803', t('Nyhed', 'New')],
      ]),
    },
    {
      _type: 'linkCards',
      eyebrow: t('Vælg rigtigt', 'Choose right'),
      headline: t('Hvilket lys til *hvilken opgave?*', 'Which light for *which job?*'),
      intro: t('Tre spørgsmål afgør det meste: hvor stort et område skal lyses op, hvor længe skal lyset blive stående, og er der strøm i væggen endnu?', 'Three questions settle most of it: how big an area needs light, how long will the light stay, and is there power in the wall yet?'),
      linkLabel: t('Se den hos Carl Ras', 'Where to buy'),
      cards: await cards([
        ['6a96f7825e3b84487172c7d1_55011718_50391.png', t('STROXX LED-strip på kabeltromle', 'STROXX LED strip on a cable reel'), t('Gangen, opgangen, tunnelen', 'Corridor, stairwell, tunnel'), t('Lange stræk, hvor lyset skal ligge jævnt hele vejen. LED-strip på tromle, 20 meter, rullet ud og ind efter behov.', 'Long runs where the light has to lie evenly all the way. LED strip on a reel, 20 metres, rolled out and in as needed.'), '55011718', '/led-strip-kabeltromle-1500-l/?product=55011717/55011718'],
        ['6a96f7829a887e00ef4fa184_55011719_50391.png', t('STROXX LED-strip på kabeltromle, 50 meter', 'STROXX LED strip on a cable reel, 50 metres'), t('Meget lange stræk', 'Very long runs'), t('Når tyve meter ikke rækker. Samme lys på tromle, halvtreds meter, til hele etagen eller tunnelen.', 'When twenty metres is not enough. The same light on a reel, fifty metres, for the whole floor or tunnel.'), '55011719', '/led-strip-kabeltromle-1500-l/?product=55011717/55011719'],
        ['6a96f782f2142bff0ce48f9d_55011708_50391.png', t('STROXX ballon arbejdslampe på stativ', 'STROXX balloon work lamp on a stand'), t('Hele etagen på én gang', 'The whole floor at once'), t('Ballonlys spreder lyset blændfrit i alle retninger. Til de store rum, hvor skarpe skygger står i vejen.', 'Balloon light spreads glare-free in every direction. For big rooms where hard shadows get in the way.'), '55011708', '/arbejdslampe-ballon-31000l-komplet/?product=55011708/55011708'],
        ['6a96fd94298bf7d2c2924541_39013533_50391.png', t('STROXX akku arbejdslampe 18V LED, 3500 lumen', 'STROXX cordless work lamp 18 V LED, 3,500 lumen'), t('Der er ingen strøm endnu', 'No power yet'), t('Råhus, servicebil, udkald. Akku arbejdslampe, der ikke skal bruge en stikkontakt for at virke.', 'Shell build, service van, call-out. A cordless work lamp that needs no socket to work.'), '39013533', '/arbejdslampe-18v-led-440-25-w-3500-lumen/?product=39013533/39013533'],
        ['6a96f7822d5c9d81e082e167_55011703_50391.png', t('STROXX genopladelig pandelampe 1200 lumen', 'STROXX rechargeable head torch 1200 lumen'), t('Hænderne skal være fri', 'Hands need to be free'), t('Skabet, krybekælderen, loftrummet. Pandelampe, hvor lyset følger med hovedet og begge hænder er ledige.', 'The cupboard, the crawl space, the loft. A head torch: the light follows your head and both hands stay free.'), '55011703', '/pandelampe-genopladelig-1200l/?product=55011703/55011703'],
        ['6a96fd5d7a3dcdbd96aaf02d_55011716a_50391.png', t('STROXX LED-strip 1500 lumen, 300 W, 20 meter', 'STROXX LED strip 1500 lumen, 300 W, 20 metres'), t('Fast gennem hele byggeriet', 'Fixed for the whole build'), t('Skal lyset blive hængende i måneder, er strippen uden tromle den enkleste løsning.', 'If the light is staying up for months, the strip without a reel is the simplest answer.'), '55011716', '/led-strip-1500-l-300w-20m/?product=55011716/55011716'],
      ]),
    },
    {
      _type: 'explainer',
      eyebrow: t('Værd at vide', 'Worth knowing'),
      headline: t('Hvor meget lys *skal der til?*', 'How much light *do you need?*'),
      intro: t('Der findes vejledende niveauer for, hvor meget lys en opgave kræver. De er nyttige, når I planlægger pladsen, og de er nemme at huske.', 'There are guide levels for how much light a job needs. They help when you plan the site, and they are easy to remember.'),
      note: t('Niveauerne her er vejledende og ikke en fuld gennemgang af reglerne. Ansvaret for belysningen på pladsen ligger hos bygherre og arbejdsgiver, og det fulde regelsæt findes hos Arbejdstilsynet.', 'These levels are guidance, not a full account of the rules. Responsibility for lighting on site lies with the client and the employer; your national work-safety authority has the full rules.'),
      visual: 'levels',
      levels: keyed([
        { _type: 'level', value: '25 lux', body: t('Adgangsveje og færdselsarealer. Nok til at komme sikkert rundt. Det eneste niveau der er et decideret krav.', 'Access routes and traffic areas. Enough to move around safely.') },
        { _type: 'level', value: '50 lux', body: t('Groft udendørs arbejde, hvor I flytter jer og håndterer materialer.', 'Rough outdoor work, moving about and handling materials.') },
        { _type: 'level', value: '100 lux', body: t('Almindeligt byggearbejde. Murer og beton, hvor du skal se opgaven, men ikke tælle millimeter.', 'General building work. Masonry and concrete: you need to see the job, not count millimetres.') },
        { _type: 'level', value: '200 lux +', body: t('Fint montagearbejde. Her koster dårligt lys direkte på kvaliteten af det, du afleverer.', 'Fine assembly. Here poor light costs you directly in the quality you hand over.') },
      ]),
      notes: keyed([
        { _type: 'explainerNote', title: t('Blænding og flimmer', 'Glare and flicker'), body: t('Lyset må ikke blænde kolleger eller kranførere, og det skal være stabilt. Flimrende lys trætter øjnene og kan få roterende værktøj til at se stillestående ud.', 'The light must not dazzle colleagues or crane drivers, and it must be steady. Flickering light tires the eyes and can make rotating tools look still.') },
        { _type: 'explainerNote', title: t('Støv, vand og slag', 'Dust, water and knocks'), body: t('Materiel på en byggeplads skal tåle miljøet. Kig efter IP-klassen, og husk lys på flugtvejene, hvis strømmen går i de mørke måneder.', 'Kit on a building site has to survive it. Check the IP rating, and remember light on the escape routes if the power goes in the dark months.') },
      ]),
    },
    {
      _type: 'explainer',
      eyebrow: t('Enheder', 'Units'),
      headline: t('Lux eller *lumen?*', 'Lux or *lumen?*'),
      intro: t('De to tal måler ikke det samme. Lumen står på kassen. Lux er det, opgaven kræver.', 'The two numbers do not measure the same thing. Lumen is on the box. Lux is what the job needs.'),
      visual: 'none',
      notes: keyed([
        { _type: 'explainerNote', title: t('Lumen er lampens output', 'Lumen is what the lamp puts out'), body: t('Lumen er den samlede mængde lys, kilden sender ud. Det er tallet, producenten skriver på lampen, og det er det, du sammenligner produkter på.', 'Lumen is the total amount of light the source sends out. It is the number on the lamp, and the one you compare products on.') },
        { _type: 'explainerNote', title: t('Lux er lyset på arbejdsfladen', 'Lux is the light on the work surface'), body: t('Lux er den del af lyset, der faktisk lander, hvor du arbejder. Ét lux er ét lumen fordelt på én kvadratmeter, og derfor kan den samme lampe give både lidt og meget lux.', 'Lux is the part of the light that actually lands where you work. One lux is one lumen spread over one square metre, which is why the same lamp can give a little or a lot of lux.') },
      ]),
      after: t('Hænger lampen højere, eller spreder den lyset over et større areal, falder lux, selvom lumen er uændret. Niveauerne ovenfor står i lux, fordi det er lyset på arbejdsfladen, der afgør, om opgaven kan udføres forsvarligt.', 'Hang the lamp higher, or spread the light over a bigger area, and lux drops while lumen stays the same. The levels above are in lux, because the light on the work surface decides whether the job can be done safely.'),
      ...(da ? { ctaLabel: 'Bliv klogere på lumen', ctaHref: CR('/inspiration/specialisten/guides/arbejdslys/', LED_C) } : {}),
    },
    {
      _type: 'explainer',
      eyebrow: t('Værd at vide', 'Worth knowing'),
      headline: t('Hvad betyder Kelvin for *arbejdslyset?*', 'What does Kelvin mean for *work light?*'),
      intro: t('Kelvin beskriver lysets farvetemperatur og dermed, om lyset opleves varmt, neutralt eller mere dagslyslignende. Et lavere Kelvintal giver et varmere og mere gulligt lys. Når Kelvintallet stiger, bliver lyset køligere og mere hvidt eller blåligt.', 'Kelvin describes the colour temperature of light: whether it feels warm, neutral or closer to daylight. A lower Kelvin number gives a warmer, more yellow light. As the number rises, the light turns cooler and whiter or bluer.'),
      visual: 'kelvin',
      levels: keyed([
        { _type: 'level', value: '3.000 K', kelvin: 3000, body: t('Varmt og gulligt lys.', 'Warm, yellowish light.') },
        { _type: 'level', value: '4.000 K', kelvin: 4000, body: t('Neutralt lys til mange almindelige opgaver.', 'Neutral light for many everyday tasks.'), chips: [t('Værksted, montage, byggeplads', 'Workshop, assembly, site')] },
        { _type: 'level', value: '5.000 K', kelvin: 5000, body: t('Mere dagslyslignende lys.', 'Closer to daylight.'), chips: [t('Detaljer og overflader', 'Detail and surfaces')] },
        { _type: 'level', value: '6.500 K', kelvin: 6500, body: t('Køligt, hvidt og blåligt lys.', 'Cool, white, bluish light.') },
      ]).map((l) => (da ? l : { ...l, value: l.value.replace('.', ',') })),
      axisLow: t('Lavere Kelvintal, varmere lys', 'Lower Kelvin, warmer light'),
      axisHigh: t('Højere Kelvintal, køligere lys', 'Higher Kelvin, cooler light'),
      notes: keyed([
        { _type: 'explainerNote', title: t('Til professionelt arbejdslys', 'For professional work light'), body: t('Omkring 4.000 Kelvin er et neutralt lys, der passer til mange almindelige opgaver i værksted, ved montage og på byggepladsen. Omkring 5.000 Kelvin og opefter giver et mere dagslyslignende lys, som kan være relevant ved opgaver, hvor detaljer og overflader skal træde tydeligt frem.', 'Around 4,000 Kelvin is a neutral light that suits many everyday tasks in the workshop, in assembly and on site. Around 5,000 Kelvin and up gives a light closer to daylight, useful where detail and surfaces need to stand out.') },
        { _type: 'explainerNote', title: t('Kelvin er ikke mængden af lys', 'Kelvin is not the amount of light'), body: t('Kelvin fortæller ikke, hvor meget lys lampen udsender. Det gør lumen. Ved arbejde med farver og finish bør lampens farvegengivelse også indgå i vurderingen.', 'Kelvin does not tell you how much light the lamp gives. Lumen does. For work with colour and finish, the lamp’s colour rendering should be part of the choice too.') },
      ]),
      ...(da ? { ctaLabel: 'Bliv klogere på Kelvin', ctaHref: CR('/inspiration/specialisten/guides/kelvin/', LED_C) } : {}),
    },
    ...(da
      ? [
          {
            _type: 'peopleCards',
            eyebrow: 'Spørg en specialist',
            headline: 'Ring til en, der allerede har *set lyset*',
            intro: 'Er du i tvivl om, hvor meget lys opgaven kræver, så tag fat i en STROXX-specialist. De står i butikkerne hver dag og har set løsningen på din opgave før.',
            people: await PEOPLE_DA(),
          },
        ]
      : []),
    {
      _type: 'textIntro',
      align: 'center',
      eyebrow: t('Fokus på tryghed', 'Peace of mind'),
      headline: t('Prøv det i 30 dage. *Så bestemmer du.*', 'Try it for 30 days. *Then you decide.*'),
      intro: t('Tag lyset med på rigtige opgaver i en måned. Lever det ikke, får du pengene tilbage hos din forhandler. Der skal ikke være noget i vejen med det, din vurdering er nok.', 'Take the light on real jobs for a month. If it does not deliver, you get your money back from your dealer. Nothing has to be wrong with it; your judgement is enough.'),
      ctaLabel: t('Sådan virker tilfredshedsgarantien', 'How the satisfaction guarantee works'),
      ctaHref: '/satisfaction-guarantee',
    },
    {
      _type: 'ctaBanner',
      eyebrow: t('Klar til mørket', 'Ready for the dark'),
      headline: t('Se lyset *hos Carl Ras*', 'See *the light*'),
      sub: t('STROXX fås kun hos Carl Ras. Find vores fokus produkt, og tag det med på pladsen i morgen.', 'Find our focus product at your STROXX dealer and take it on site tomorrow.'),
      primaryLabel: t('Se STROXX hos Carl Ras', 'Where to buy'),
      ...(da ? { primaryHref: CR('/maerker/stroxx/', LED_C) } : {}),
      secondaryLabel: t('Find nærmeste butik', 'Find a store'),
      secondaryHref: da ? 'https://www.carl-ras.dk/kontakt/find-butik/' : '/stores',
      ...(da ? { note: 'På lager hos Carl Ras. Find nærmeste butik, og tag lyset med på pladsen i morgen tidlig.' } : {}),
    },
  ]);
}

/* ── Smart Lock ST-3 ────────────────────────────────────────────────────── */
async function st3Sections(lang) {
  const da = lang === 'da-DK';
  const t = (d, e) => (da ? d : e);
  const pdp = CR('/langskiltesaet-smart-lock-st-3-rustfri-t-oval-cylinder/?product=40014135/40014135', ST3_C);
  const manual = 'https://dam-carl-ras-dk.azureedge.net/digizuitecore/LegacyService/api/assetstream/263988/10061';
  const card = async ([f, alt, title, body, item, p, badge]) => ({
    _type: 'linkCard',
    imageUpload: await img(f, alt),
    title,
    body,
    itemNumber: item,
    ...(da && p ? { href: CR(p, ST3_C) } : {}),
    ...(badge ? { badge } : {}),
  });
  return keyed([
    {
      _type: 'photoHero',
      height: 'full',
      align: 'left',
      videoFile: await file('6ac3a4396fffd27fc70a2e21_st3-hero-macro-16x9.mp4'),
      imageUpload: await img('6ac3a43901a6ed3194860c6e_st3-hero-macro-16x9_poster.jpg', 'Smart Lock ST-3'),
      eyebrow: 'Smart Lock ST-3',
      headline: t('Din hånd er *nøglen*', 'Your hand is *the key*'),
      sub: t('Løft hånden. Grønt lys. Døren er åben. Nøglefri lås til skandinaviske døre, med håndfladescanner, kode, kort og app.', 'Raise your hand. Green light. The door is open. A keyless lock for Scandinavian doors, with palm scanner, code, card and app.'),
      ctaLabel: t('Kun hos Carl Ras', 'Where to buy'),
      ...(da ? { ctaHref: pdp } : {}),
      cueLabel: t('Rul ned', 'Scroll down'),
      disclosure: t('AI-genereret indhold. Kamerabevægelsen i filmen er skabt med kunstig intelligens. Låsen, tastaturet og lyset er STROXX\' egne produktbilleder.', 'AI-generated content. The camera movement in the film was made with artificial intelligence. The lock, keypad and light are STROXX’s own product images.'),
    },
    {
      _type: 'splitMedia',
      imageSide: 'right',
      colour: true,
      fit: 'cover',
      eyebrow: t('Om produktet', 'About the product'),
      headline: t('Smart Lock ST-3. Nøglefri adgang til *skandinaviske døre*', 'Smart Lock ST-3. Keyless entry for *Scandinavian doors*'),
      body: t(
        'Klokken er 7.02, og nøglen ligger i den anden jakke. Hånden har du altid med. Med ST-3 er håndfladen nøglen. Elektronisk langskilt i børstet rustfrit stål A2, udviklet til udendørs brug på skandinaviske låsekasser, også 3-punktslåse (stanglåse), og døre fra 40 til 100 mm. Åbner på håndflade, kode, kort og app.',
        'It is 7.02 and the key is in your other jacket. Your hand is always with you. With the ST-3 your palm is the key. An electronic long plate in brushed A2 stainless steel, made for outdoor use on Scandinavian lock cases, including 3-point locks, and doors from 40 to 100 mm. Opens with palm, code, card and app.',
      ),
      ctaLabel: t('Se den hos Carl Ras', 'Where to buy'),
      ...(da ? { ctaHref: pdp } : {}),
      itemNumber: '40014135',
      imageUpload: await img('6abea57f75d10db1e5234789_st3-threequarter-dark-4x5.jpg', t('STROXX Smart Lock ST-3 i rustfrit stål med håndfladescanner, set skråt forfra', 'STROXX Smart Lock ST-3 in stainless steel with palm scanner, three-quarter view')),
    },
    {
      _type: 'numberedTabs',
      eyebrow: t('Det smarte ved ST-3', 'What makes the ST-3 smart'),
      headline: t('Tryk. Løft hånden. *Inde.*', 'Tap. Raise your hand. *In.*'),
      items: keyed([
        { _type: 'tabItem', title: t('Hånden er nøglen', 'Your hand is the key'), body: t('Tryk på panelet, løft hånden foran scanneren, og låsen er oppe på 1 til 1,5 sekunder. Plads til 100 håndflader.', 'Tap the panel, raise your hand to the scanner, and the lock opens in 1 to 1.5 seconds. Room for 100 palms.'), imageUpload: await img('6ac37f43c56703ebe31b1894_st3-photo-door-open-r2-4x5.jpg', t('Smart Lock ST-3 på en rigtig dør, grønt lys og hånden på grebet', 'Smart Lock ST-3 on a real door, green light and a hand on the handle')), colour: true },
        { _type: 'tabItem', title: t('Fire veje ind, én lås', 'Four ways in, one lock'), body: t('Håndflade, PIN-kode, kort og app via Bluetooth. 250 koder og 1.000 kort, og midlertidige PIN-koder til gæster og håndværkere oprettes direkte i appen. Cylinderen giver ekstra aflåsning med nøgle.', 'Palm, PIN code, card and app over Bluetooth. 250 codes and 1,000 cards, and temporary PIN codes for guests and tradespeople set up right in the app. The cylinder adds extra locking with a key.'), imageUpload: await img('6abea57f75d10db1e5234752_st3-front-dark-4x5.jpg', t('Smart Lock ST-3 set forfra med scanner, tastatur og cylinder', 'Smart Lock ST-3 front view with scanner, keypad and cylinder')), colour: true },
        { _type: 'tabItem', title: t('Bygget til den danske dør', 'Built for the Scandinavian door'), body: t('Langskilt til skandinavisk låsekasse med oval cylinder over grebet, også 3-punktslåse (stanglåse) på samme kassetype. IP65 både udvendigt og indvendigt, rustfrit stål A2, testet til 250.000 åbninger.', 'A long plate for the Scandinavian lock case with an oval cylinder above the handle, including 3-point locks on the same case type. IP65 outside and inside, A2 stainless steel, tested to 250,000 openings.'), imageUpload: await img('6abea57f8388db805435e613_st3-side-dark-4x5.jpg', t('Smart Lock ST-3 set fra siden, slankt langskilt i rustfrit stål', 'Smart Lock ST-3 side view, a slim stainless long plate')), colour: true },
      ]),
    },
    {
      _type: 'textIntro',
      eyebrow: t('Håndfladescanner', 'Palm scanner'),
      headline: t('Fingeraftryk slides. *Vener gør ikke.*', 'Fingerprints wear. *Veins don’t.*'),
      intro: t('Hårdt arbejde sliber fingeraftrykket ned. Skæret, beskidt, vådt eller med hård hud, og fingerlæseren giver op. ST-3 aflæser venemønstret under huden i håndfladen, så den virker også efter en dag på pladsen.', 'Hard work grinds fingerprints down. Cut, dirty, wet or calloused, and a finger reader gives up. The ST-3 reads the vein pattern under the skin of your palm, so it still works after a day on site.'),
    },
    {
      _type: 'hotspotImage',
      eyebrow: t('Tæt på', 'Up close'),
      headline: t('Kig nærmere *på pladen*', 'Take a closer look *at the plate*'),
      sub: t('Tryk på et punkt og se, hvad de enkelte dele af låsen gør.', 'Tap a point to see what each part of the lock does.'),
      frame: '4/5',
      showList: true,
      listItems: t(
        ['Håndfladescanner. Løft hånden foran sensoren, uden berøring.', 'Tastatur og kortlæser. 250 koder og 1.000 kort.', 'Oval cylinder. Ekstra aflåsning med nøgle.', 'Greb og plade i børstet A2-stål. Grebet kan vendes.'],
        ['Palm scanner. Raise your hand to the sensor, no touching.', 'Keypad and card reader. 250 codes and 1,000 cards.', 'Oval cylinder. Extra locking with a key.', 'Handle and plate in brushed A2 steel. The handle is reversible.'],
      ),
      imageUpload: await img('6abea57f75d10db1e5234752_st3-front-dark-4x5.jpg', t('Smart Lock ST-3 set forfra med markering af scanner, tastatur, cylinder og stål', 'Smart Lock ST-3 front view marking scanner, keypad, cylinder and steel')),
      fit: 'cover',
      spots: keyed([
        { _type: 'hotspot', title: t('Håndfladescanneren', 'The palm scanner'), body: t('Sensorvinduet øverst læser håndfladen, når du holder den foran. Ingen berøring, intet fedtet glas. 100 håndflader kan lægges ind.', 'The sensor window at the top reads your palm as you hold it in front. No touching, no greasy glass. 100 palms can be stored.'), x: 32, y: 12 },
        { _type: 'hotspot', title: t('Tastatur og kortlæser', 'Keypad and card reader'), body: t('Berøringstastatur til 250 koder. Hold kortet mod symbolet ved 5-tallet. 1.000 kort kan lægges ind. Efter gentagne forkerte forsøg spærrer låsen midlertidigt og kan slå alarm.', 'A touch keypad for 250 codes. Hold the card to the symbol by the 5. 1,000 cards can be stored. After repeated wrong attempts the lock blocks for a while and can sound an alarm.'), x: 32, y: 22 },
        { _type: 'hotspot', title: t('Oval cylinder', 'Oval cylinder'), body: t('Ekstra aflåsning med nøgle. Låser du med nøglen, eller med vrideren indefra, er det elektroniske sat ud af kraft: hverken kode, brik, app eller powerbank åbner døren. Kun nøgle eller vrider låser op igen.', 'Extra locking with a key. Lock with the key, or the thumb turn inside, and the electronics are overruled: no code, tag, app or power bank opens the door. Only the key or thumb turn unlocks it again.'), x: 32, y: 38.5 },
        { _type: 'hotspot', title: t('Greb og plade i A2-stål', 'Handle and plate in A2 steel'), body: t('Børstet rustfrit stål A2. Grebet kan vendes til venstre eller højre med den medfølgende unbrakonøgle.', 'Brushed A2 stainless steel. The handle turns left or right with the supplied hex key.'), x: 64, y: 69 },
      ]),
    },
    {
      _type: 'filmSection',
      videoFile: await file('6ac3aa4bdd281a37d6e96148_st3-palm-unlock-6285-4x5.mp4'),
      posterUpload: await img('6ac3aa4b3380d6f302181761_st3-palm-unlock-6285-4x5_poster.jpg', t('Oplåsning med håndfladen', 'Unlocking with the palm')),
      ratio: '4/5',
      caption: t('Optaget på en rigtig dør, i realtid. Tryk for at vække tastaturet, løft hånden, grønt lys, døren går op. Ingen klip i selve oplåsningen.', 'Filmed on a real door, in real time. Tap to wake the keypad, raise your hand, green light, the door opens. No cuts in the unlock itself.'),
      footnote: t('Ægte optagelse. Kun stabiliseret og beskåret, ikke AI.', 'Real footage. Only stabilised and cropped, not AI.'),
    },
    {
      _type: 'textIntro',
      align: 'center',
      eyebrow: t('Håndflade eller finger', 'Palm or finger'),
      headline: t('Hvorfor håndfladen *slår fingeren*', 'Why the palm *beats the finger*'),
      intro: t('Palm Vein Recognition aflæser det unikke venemønster under huden. Da det biometriske mønster ligger beskyttet under hudens overflade, påvirkes det ikke af almindeligt slid og daglig brug på samme måde som et fingeraftryk.', 'Palm vein recognition reads the unique vein pattern under the skin. Because the pattern sits protected below the surface, it is not affected by ordinary wear and daily use the way a fingerprint is.'),
    },
    {
      _type: 'filmSection',
      videoFile: await file('6abea6dcfee1b941368b9915_st3-palm-veins-ai-16x9.mp4'),
      posterUpload: await img('6abea6ddfa0ae15434691dfd_st3-palm-veins-ai-16x9_poster.jpg', t('Venemønster i håndfladen', 'Vein pattern in the palm')),
      ratio: '16/9',
      footnote: t('AI-genereret illustration', 'AI-generated illustration'),
    },
    {
      _type: 'bentoCompare',
      title: t('Forskellen mellem finger og håndfladen', 'The difference between finger and palm'),
      labelA: t('Finger', 'Finger'),
      labelB: t('Håndflade', 'Palm'),
      tiles: keyed([
        { _type: 'bentoTile', wide: true, question: t('Finger eller håndflade?', 'Finger or palm?'), a: t('Rillerne på én fingerspids. Et lille område.', 'The ridges of one fingertip. A small area.'), b: t('Venemønstret i hele håndfladen. Mange flere kendetegn.', 'The vein pattern of the whole palm. Many more features.'), why: t('Derfor færre fejl: jo mere der bliver læst, jo sikrere er genkendelsen. En fingerspids kan nemt læses forkert, en hel håndflade kan ikke forveksles. ST-3 genkender dig første gang.', 'So fewer errors: the more that is read, the surer the match. A fingertip is easily misread; a whole palm cannot be mistaken. The ST-3 knows you first time.') },
        { _type: 'bentoTile', wide: true, question: t('Slidte, revnede eller hårde fingre', 'Worn, cracked or hard fingers'), a: t('Rillerne slides af arbejde, og læseren afviser tit.', 'Work wears the ridges down, and the reader often refuses.'), b: t('Venerne ligger under huden og slides aldrig.', 'The veins sit under the skin and never wear.'), why: t('Fordelen for dig: hårde, tørre eller revnede hænder læses lige så godt som nye. Døren åbner for håndværkerhænder hver gang, uden at du skal finde brik eller kode frem.', 'The benefit: hard, dry or cracked hands read as well as new ones. The door opens for working hands every time, without digging out a tag or code.') },
        { _type: 'bentoTile', question: t('Gips, maling eller våde hænder', 'Plaster, paint or wet hands'), a: t('Snavs på sensoren', 'Dirt on the sensor'), b: t('Hånden holdes foran sensoren', 'The hand is held in front of the sensor') },
        { _type: 'bentoTile', question: t('Aftryk på glasset', 'Prints on the glass'), a: t('Kan løftes og kopieres', 'Can be lifted and copied'), b: t('Intet aftryk at kopiere', 'No print to copy') },
        { _type: 'bentoTile', question: t('Andre veje ind', 'Other ways in'), a: t('Kode eller kort', 'Code or card'), b: t('Kode, kort eller app', 'Code, card or app') },
      ]),
    },
    {
      _type: 'specGrid',
      eyebrow: t('Specifikationer', 'Specifications'),
      headline: t('Tallene bag *låsen*', 'The numbers behind *the lock*'),
      intro: t('De hårde fakta fra manualen. Resten afgør du ved døren.', 'The hard facts from the manual. The rest you decide at the door.'),
      specs: keyed([
        { _type: 'spec', value: '100', unit: t('håndflader', 'palms'), body: t('Plus 250 koder, 1.000 kort og én administrator. Styres i appen XLOCK Manager, med lokal tidsplan eller webbaseret låseplan.', 'Plus 250 codes, 1,000 cards and one administrator. Managed in the XLOCK Manager app, with a local schedule or a web-based locking plan.') },
        { _type: 'spec', value: t('1,5', '1.5'), unit: t('sekunder', 'seconds'), body: t('Låsetid på 1 til 1,5 sekunder fra genkendelse til fri dør.', '1 to 1.5 seconds from recognition to an open door.') },
        { _type: 'spec', value: t('250.000', '250,000'), unit: t('åbninger testet', 'openings tested'), body: t('Mekanik og elektronik er testet til op til 250.000 åbninger.', 'Mechanics and electronics are tested to up to 250,000 openings.') },
        { _type: 'spec', value: t('40 til 100', '40 to 100'), unit: t('mm dørtykkelse', 'mm door thickness'), body: t('8x8 grebspind i seks længder fra 70 til 120 mm. Vælg efter døren herunder.', '8x8 spindle in six lengths from 70 to 120 mm. Choose by your door below.') },
        { _type: 'spec', value: t('2.000', '2,000'), unit: t('åbninger pr. opladning', 'openings per charge'), body: t('Ca. 3 måneder på to genopladelige 18650-batterier, 7,4 V. Lader medfølger, og låsen siger til i god tid.', 'About 3 months on two rechargeable 18650 batteries, 7.4 V. Charger included, and the lock warns you in good time.') },
        { _type: 'spec', value: t('-20 til 50', '-20 to 50'), unit: '°C', body: t('Arbejdstemperatur. IP65 både udvendigt og indvendigt.', 'Operating temperature. IP65 outside and inside.') },
      ]),
    },
    {
      _type: 'rangeAdvisor',
      title: t('Passer den til din dør?', 'Does it fit your door?'),
      intro: t('Tre ting afgør det: låsekassen, dørens tykkelse og strømmen. Træk i skyderen og se, hvilken grebspind din dør skal have.', 'Three things decide it: the lock case, the door thickness and the power. Drag the slider to see which spindle your door needs.'),
      label: t('Dørtykkelse', 'Door thickness'),
      unit: 'mm',
      min: 40,
      max: 100,
      step: 1,
      defaultValue: 55,
      bands: keyed([50, 60, 70, 80, 90, 100].map((u, i) => ({ _type: 'band', upTo: u, result: String(70 + i * 10) }))),
      resultTemplate: t('Brug grebspind 8x8x{result} mm', 'Use spindle 8x8x{result} mm'),
      valueLabel: t('{value} mm dør', '{value} mm door'),
      resultLabel: t('{result} mm grebspind', '{result} mm spindle'),
    },
    {
      _type: 'modelCards',
      cards: keyed([
        { _type: 'modelCard', name: t('Dør og låsekasse', 'Door and lock case'), use: t('Det første, du tjekker', 'The first thing to check'), rows: keyed([
          { _type: 'kv', key: t('Låsekasse', 'Lock case'), value: t('Skandinavisk, cylinder over grebet', 'Scandinavian, cylinder above the handle') },
          { _type: 'kv', key: t('Passer til', 'Fits'), value: t('3-punktslåse (stanglåse)', '3-point locks') },
          { _type: 'kv', key: t('Dørtykkelse', 'Door thickness'), value: t('40 til 100 mm', '40 to 100 mm') },
          { _type: 'kv', key: 'Cylinder', value: t('Oval, eller uden hul', 'Oval, or no hole') },
          { _type: 'kv', key: t('Grebsretning', 'Handle direction'), value: t('Vendbar, venstre og højre', 'Reversible, left and right') },
        ]), linkLabel: t('Læs manualen', 'Read the manual'), href: manual },
        { _type: 'modelCard', name: t('I kassen', 'In the box'), use: t('Alt til monteringen', 'Everything for fitting'), rows: keyed([
          { _type: 'kv', key: t('Paneler', 'Panels'), value: t('Front og bag', 'Front and back') },
          { _type: 'kv', key: t('Grebspind', 'Spindle'), value: t('8x8, 70 til 120 mm', '8x8, 70 to 120 mm') },
          { _type: 'kv', key: t('Skruer', 'Screws'), value: '4 x M5x100, 2 x M5x16' },
          { _type: 'kv', key: t('Adgang', 'Access'), value: t('2 nøgler, 2 kort', '2 keys, 2 cards') },
          { _type: 'kv', key: t('Værktøj', 'Tool'), value: t('Unbrakonøgle', 'Hex key') },
        ]), linkLabel: t('Læs manualen', 'Read the manual'), href: manual },
        { _type: 'modelCard', name: t('Strøm og drift', 'Power and running'), use: t('Ingen kabler i døren', 'No cables in the door'), rows: keyed([
          { _type: 'kv', key: t('Batteri', 'Battery'), value: '2 x 18650, 7,4 V' },
          { _type: 'kv', key: t('Rækker til', 'Lasts'), value: t('Ca. 2.000 åbninger', 'About 2,000 openings') },
          { _type: 'kv', key: t('Opladning', 'Charging'), value: t('Lader og USB medfølger', 'Charger and USB included') },
          { _type: 'kv', key: t('Forbindelse', 'Connection'), value: t('Bluetooth 5.0, appen XLOCK Manager', 'Bluetooth 5.0, the XLOCK Manager app') },
          { _type: 'kv', key: 'Online', value: t('Gateway G2 (Wi-Fi) eller G3 (PoE)', 'Gateway G2 (Wi-Fi) or G3 (PoE)') },
        ]), linkLabel: t('Læs manualen', 'Read the manual'), href: manual },
      ]),
      foot: t('Smart Lock ST-3 i rustfrit stål til oval cylinder, varenr. 40014135. Findes også i sort og uden cylinderhul. Alle tal er fra producentens brugervejledning, art. nr. 102-676-677.', 'Smart Lock ST-3 in stainless steel for an oval cylinder, item 40014135. Also in black and without a cylinder hole. All figures are from the manufacturer’s user manual, art. no. 102-676-677.'),
    },
    {
      _type: 'stepList',
      eyebrow: t('Montering', 'Installation'),
      headline: t('Monteret på en *eftermiddag*', 'Fitted in *an afternoon*'),
      intro: t('ST-3 erstatter grebene på en skandinavisk låsekasse. Det er et monteringsjob, ikke et dørjob. Sådan gør du, trin for trin fra manualen.', 'The ST-3 replaces the handles on a Scandinavian lock case. It is a fitting job, not a door job. Here is how, step by step from the manual.'),
      steps: keyed([
        [t('Tjek døren.', 'Check the door.'), t('40 til 100 mm tyk, plan og uden vrid. Vurder altid dør og låsekasse, før du går i gang: skandinavisk kasse med oval cylinder over grebet.', '40 to 100 mm thick, flat and true. Always check the door and lock case first: a Scandinavian case with an oval cylinder above the handle.')],
        [t('Låsekasse og cylinder.', 'Lock case and cylinder.'), t('Monter låsekassen, derefter cylinder, slutblik og sluttestykke i karmen.', 'Fit the lock case, then the cylinder, strike plate and keeper in the frame.')],
        [t('Grebsretning.', 'Handle direction.'), t('Bestemmes fra den sikre side. Skal grebet vendes: skru det af med unbrakonøglen, drej 180°, skru fast med ny skruesikring.', 'Decided from the secure side. To reverse the handle: unscrew it with the hex key, turn it 180°, screw it back with fresh thread lock.')],
        [t('Trekantspidsen.', 'The triangle tip.'), t('Skal pege samme vej som grebet. Peger den forkert, sæt strøm til låsen, så frigøres koblingen.', 'Must point the same way as the handle. If it points wrong, power the lock and the clutch releases.')],
        [t('Frontpanel.', 'Front panel.'), t('Sæt det på døren, før kablet gennem hullet over låsekassen, og afkort de fire M5x100 skruer til døren.', 'Put it on the door, run the cable through the hole above the lock case, and cut the four M5x100 screws to the door.')],
        [t('Kabel og grebspind.', 'Cable and spindle.'), t('Tilslut ledningerne, og sæt 8x8 grebspinden i den længde, der passer til døren.', 'Connect the wires, and fit the 8x8 spindle in the length that suits the door.')],
        [t('Bagpanel.', 'Back panel.'), t('Tag låget af batterirummet, og skru bagpanelet fast med de to M5x16 skruer.', 'Take the cover off the battery compartment, and screw the back panel on with the two M5x16 screws.')],
        [t('Batterier.', 'Batteries.'), t('Lad de to 18650-batterier op i mindst 8 timer før første brug. Sæt dem i, og luk låget.', 'Charge the two 18650 batteries for at least 8 hours before first use. Put them in and close the cover.')],
        [t('Juster og test.', 'Adjust and test.'), t('Kører det stramt, så flyt panelet eller skruerne lidt. Prøv med nøglen, og tryk grebet ned.', 'If it runs stiff, shift the panel or screws slightly. Try the key, and press the handle down.')],
        [t('Fjern filmen.', 'Remove the film.'), t('Beskyttelsesfilmen på frontpanelet skal af, ellers læser låsen ikke optimalt.', 'The protective film on the front panel must come off, or the lock will not read properly.')],
      ].map(([lead, body]) => ({ _type: 'stepItem', lead, body }))),
    },
    {
      _type: 'safetyNotice',
      eyebrow: t('Vigtigt ved montering', 'Important when fitting'),
      headline: t('Skruesikring på grebsskruerne. *Hver gang.*', 'Thread lock on the handle screws. *Every time.*'),
      body: t('Når grebet vendes, skal skruen have ny skruesikring (Loctite), og trekantspidsen skal pege samme vej som grebet. Peger den forkert, sæt strøm til låsen, så frigøres koblingen. Døren skal være plan og uden vrid, og beskyttelsesfilmen på frontpanelet skal af, før låsen tages i brug.', 'When the handle is reversed, the screw needs fresh thread lock (Loctite), and the triangle tip must point the same way as the handle. If it points wrong, power the lock and the clutch releases. The door must be flat and true, and the protective film on the front panel must come off before use.'),
      sub: t('Uden strøm står grebet frit, og låsen kan ikke låse. Nederst under langskiltet sidder en USB-C-port: en powerbank eller lader giver strøm, så kode eller brik låser op.', 'Without power the handle turns freely and the lock cannot lock. There is a USB-C port under the long plate: a power bank or charger gives power, so code or tag unlocks.'),
    },
    {
      _type: 'stepList',
      eyebrow: t('Opsætning', 'Set-up'),
      headline: t('Fra kasse til *første hånd*', 'From box to *first hand*'),
      intro: t('Seks trin, og låsen kender sin ejer. Fabrikskoden 123456 holder op med at virke, så snart der er en administrator.', 'Six steps and the lock knows its owner. The factory code 123456 stops working as soon as there is an administrator.'),
      steps: keyed([
        [t('Dansk tale.', 'Language.'), t('Tast *39#123456#3# på tastaturet.', 'For Danish voice prompts, key *39#123456#3# on the keypad.')],
        [t('Nulstil til ny ejer.', 'Reset for a new owner.'), t('Hold reset-knappen på bagpanelet inde i 3 sekunder, tast 000#, og vent på "succesfuld".', 'Hold the reset button on the back panel for 3 seconds, key 000#, and wait for "successful".')],
        [t('Hent XLOCK Manager.', 'Get XLOCK Manager.'), t('Fra App Store eller Google Play, via QR-koden i manualen.', 'From the App Store or Google Play, via the QR code in the manual.')],
        [t('Opret administrator.', 'Create an administrator.'), t('I appen. Herefter låser låsen automatisk.', 'In the app. From then on the lock locks automatically.')],
        [t('Læg hænder, koder og kort ind.', 'Add palms, codes and cards.'), t('Op til 100 håndflader, 250 koder og 1.000 kort.', 'Up to 100 palms, 250 codes and 1,000 cards.')],
        [t('Online, hvis du vil.', 'Online, if you like.'), t('Med en gateway som tilkøb styres låsen på afstand, og du ser låsestatus og fuld log. G2 kører på 2,4 GHz Wi-Fi, G3 på kablet netværk med PoE.', 'With an optional gateway the lock is managed remotely, and you see lock status and the full log. G2 runs on 2.4 GHz Wi-Fi, G3 on wired network with PoE.')],
      ].map(([lead, body]) => ({ _type: 'stepItem', lead, body }))),
    },
    {
      _type: 'imageMosaic',
      colour: true,
      images: keyed(
        await Promise.all([
          ['6ac37f43e57e07b1dd628b24_st3-photo-palm-green-r2-4x5.jpg', t('Håndfladen holdes foran scanneren på Smart Lock ST-3, grønt lys', 'A palm held to the scanner on the Smart Lock ST-3, green light')],
          ['6ac37f43c56703ebe31b1894_st3-photo-door-open-r2-4x5.jpg', t('Døren åbnes med grebet efter oplåsning på Smart Lock ST-3', 'The door opened by the handle after unlocking the Smart Lock ST-3')],
          ['6abea57fa360bd15ae5a7dbb_st3-threequarter-dark-3x2.jpg', t('Smart Lock ST-3 i rustfrit stål på mørk baggrund', 'Smart Lock ST-3 in stainless steel on a dark background')],
          ['6abea57f8388db805435e613_st3-side-dark-4x5.jpg', t('Smart Lock ST-3 set fra siden', 'Smart Lock ST-3 from the side')],
          ['6abea57fcc33db51daee214a_st3-back-light-4x5.jpg', t('Indvendigt skilt på Smart Lock ST-3 med batterirum og privatknap', 'The inside plate of the Smart Lock ST-3 with battery compartment and privacy knob')],
        ].map(async ([f, a]) => ({ ...(await img(f, a)), _type: 'mosaicImage' }))),
      ),
      disclosure: t('Billeder: STROXX\' produktbilleder og fotos af ST-3 monteret på en rigtig dør. Ingen AI i produktet.', 'Images: STROXX product photography and photos of the ST-3 fitted on a real door. No AI in the product.'),
    },
    {
      _type: 'linkCards',
      eyebrow: t('Fire udgaver', 'Four versions'),
      headline: t('Samme lås. Vælg *finish og cylinder.*', 'Same lock. Choose *finish and cylinder.*'),
      intro: t('Rustfrit eller sort, med hul til oval cylinder eller uden. Elektronikken og håndfladescanneren er den samme i alle fire.', 'Stainless or black, with a hole for an oval cylinder or without. The electronics and palm scanner are the same in all four.'),
      linkLabel: t('Se den hos Carl Ras', 'Where to buy'),
      cards: keyed(
        await Promise.all(
          [
            ['6abea580b210d9f9ea0cd865_st3-front-cutout.png', t('Smart Lock ST-3, rustfrit stål, til oval cylinder, varenr. 40014135', 'Smart Lock ST-3, stainless, for oval cylinder, item 40014135'), t('Rustfri, til oval cylinder', 'Stainless, for oval cylinder'), t('Varenr. 40014135. Børstet A2-stål, oval cylinder til ekstra aflåsning. Det er den, du ser på siden.', 'Item 40014135. Brushed A2 steel, oval cylinder for extra locking. The one on this page.'), '40014135', '/langskiltesaet-smart-lock-st-3-rustfri-t-oval-cylinder/?product=40014135/40014135'],
            ['6abea90471dfa848ed320cb7_st3-card-40014136-sort.png', t('Smart Lock ST-3, sort, til oval cylinder, varenr. 40014136', 'Smart Lock ST-3, black, for oval cylinder, item 40014136'), t('Sort, til oval cylinder', 'Black, for oval cylinder'), t('Varenr. 40014136. Samme lås i sort til mørke døre og moderne facader.', 'Item 40014136. The same lock in black for dark doors and modern facades.'), '40014136', '/langskiltesaet-smart-lock-st-3-sort-t-oval-cylinder/?product=40014136/40014136'],
            ['6abea90471dfa848ed320d24_st3-card-40014137-rustfri-uden-cyl.png', t('Smart Lock ST-3, rustfrit stål, uden cylinderhul, varenr. 40014137', 'Smart Lock ST-3, stainless, no cylinder hole, item 40014137'), t('Rustfri, uden cylinderhul', 'Stainless, no cylinder hole'), t('Varenr. 40014137. Helt nøglefri front, til døre hvor der ikke skal sidde en cylinder udvendigt.', 'Item 40014137. A fully keyless front, for doors with no cylinder outside.'), '40014137', '/langskiltesaet-smart-lock-st-3-rustfri-u-cylinder-hul/?product=40014137/40014137'],
            ['6abea90471dfa848ed320d76_st3-card-40014138-sort-uden-cyl.png', t('Smart Lock ST-3, sort, uden cylinderhul, varenr. 40014138', 'Smart Lock ST-3, black, no cylinder hole, item 40014138'), t('Sort, uden cylinderhul', 'Black, no cylinder hole'), t('Varenr. 40014138. Sort og nøglefri front. Den rene løsning.', 'Item 40014138. Black and keyless. The clean solution.'), '40014138', '/langskiltesaet-smart-lock-st-3-sort-u-cylinder-hul/?product=40014138/40014138'],
          ].map(card),
        ),
      ),
    },
    {
      _type: 'comparisonTable',
      eyebrow: t('Du vælger', 'Your choice'),
      headline: t('Håndflade, fingeraftryk *eller knapper*', 'Palm, fingerprint *or buttons*'),
      intro: t('Tre Smart Locks til den samme skandinaviske låsekasse. Forskellen er, hvad låsen læser, og hvilke hænder den skal læse.', 'Three Smart Locks for the same Scandinavian lock case. The difference is what the lock reads, and whose hands it has to read.'),
      cornerLabel: 'STROXX',
      columns: keyed([
        { _type: 'cmpColumn', name: t('ST-3 med håndflade', 'ST-3 with palm'), note: t('Smart Lock ST-3. Varenr. 40014135', 'Smart Lock ST-3. Item 40014135'), tag: 'Hero', highlight: true },
        { _type: 'cmpColumn', name: t('ST-2 med touch', 'ST-2 with touch'), note: t('Smart Lock ST-2, fingeraftryk. Varenr. 40013215', 'Smart Lock ST-2, fingerprint. Item 40013215') },
        { _type: 'cmpColumn', name: t('ST-2 med knapper', 'ST-2 with buttons'), note: t('Smart Lock ST-2, fingeraftryk. Varenr. 40014387', 'Smart Lock ST-2, fingerprint. Item 40014387') },
      ]),
      rows: keyed([
        [t('Biometri', 'Biometrics'), t('Håndflade, venemønster under huden', 'Palm, vein pattern under the skin'), t('Fingeraftryk', 'Fingerprint'), t('Fingeraftryk', 'Fingerprint')],
        [t('Tastatur', 'Keypad'), t('Touch, lyser op ved tryk', 'Touch, lights up when tapped'), 'Touch', t('Fysiske knapper', 'Physical buttons')],
        [t('PIN-kode', 'PIN code'), '+', '+', '+'],
        [t('Kort og brik', 'Card and tag'), '+', '+', '+'],
        [t('App via Bluetooth, XLOCK Manager', 'App over Bluetooth, XLOCK Manager'), '+', '+', '+'],
        [t('Fjernstyring med Gateway G2 som tilkøb', 'Remote control with optional Gateway G2'), '+', '+', '+'],
        [t('Virker med beskidte, våde eller slidte hænder', 'Works with dirty, wet or worn hands'), '+', '-', '-'],
        [t('Lys ved aflæsning', 'Light when reading'), t('Håndfladen skal have lys omkring sig', 'The palm needs some light around it'), t('Virker i mørke', 'Works in the dark'), t('Virker i mørke, knapperne lyser ikke', 'Works in the dark, buttons not lit')],
        [t('Cylinder og nøgle', 'Cylinder and key'), t('Oval cylinder, ekstra aflåsning med nøgle', 'Oval cylinder, extra locking with a key'), t('Ingen cylinder', 'No cylinder'), t('Ingen cylinder', 'No cylinder')],
        [t('Nødstrøm ved fladt batteri', 'Emergency power if the battery is flat'), t('USB-C under langskiltet, åbn med kode eller brik', 'USB-C under the long plate, open with code or tag'), t('USB-C i bunden, åbn med kode, brik eller finger', 'USB-C at the bottom, open with code, tag or finger'), t('USB-C i bunden, åbn med kode, brik eller finger', 'USB-C at the bottom, open with code, tag or finger')],
        [t('Overflade', 'Finish'), t('Børstet rustfrit stål A2', 'Brushed A2 stainless steel'), t('Sort, rustfrit stål A2', 'Black, A2 stainless steel'), t('Rustfrit stål A2', 'A2 stainless steel')],
        [t('Tæthed', 'Sealing'), t('IP65, ude og inde', 'IP65, outside and inside'), 'IP55', 'IP55'],
        [t('Låsekasse', 'Lock case'), t('Skandinavisk, også 3-punktslåse', 'Scandinavian, including 3-point locks'), t('Skandinavisk, også 3-punktslåse', 'Scandinavian, including 3-point locks'), t('Skandinavisk, også 3-punktslåse', 'Scandinavian, including 3-point locks')],
        [t('Testet', 'Tested'), t('250.000 åbninger', '250,000 openings'), t('250.000 åbninger', '250,000 openings'), t('250.000 åbninger', '250,000 openings')],
        [t('Bedst til', 'Best for'), t('Døre med mange brugere og hænder, der arbejder', 'Doors with many users and working hands'), t('Dem, der mest bruger finger eller brik', 'Those who mostly use finger or tag'), t('Dem, der vil mærke tasterne', 'Those who want to feel the keys')],
      ].map(([label, ...cells]) => ({ _type: 'cmpRow', label, cells }))),
    },
    {
      _type: 'linkCards',
      eyebrow: t('Fokus på adgang', 'Access and security'),
      headline: t('Fem, der allerede *åbner døre...*', 'Five already *opening doors...*'),
      intro: t('Fra nøgleboks til gateway. Resten af STROXX-familien til adgang og sikring.', 'From key box to gateway. The rest of the STROXX access and security family.'),
      linkLabel: t('Se den hos Carl Ras', 'Where to buy'),
      cards: keyed(
        await Promise.all(
          [
            ['6ac4fd13c4b3caa3c2f38f0c_st3-card-40013214-smart-lock-st-2.webp', t('STROXX Smart Lock ST-2 i rustfrit stål, XLOCK', 'STROXX Smart Lock ST-2 in stainless steel, XLOCK'), t('Smart Lock ST-2 rustfri, XLOCK', 'Smart Lock ST-2 stainless, XLOCK'), t('Den velkendte Smart Lock til skandinavisk låsekasse, i rustfrit stål.', 'The well-known Smart Lock for the Scandinavian lock case, in stainless steel.'), '40013214', '/langskiltesaet-smart-lock-st-2-rs-xlock-t-skandinavisk-las/?product=40013214/40013214'],
            ['6ac4fd13acaf91f9cac1de45_st3-card-40013215-smart-lock-st-2-sort.webp', t('STROXX Smart Lock ST-2 i sort med knap, for og bag', 'STROXX Smart Lock ST-2 in black, front and back'), t('Smart Lock ST-2 sort, XLOCK', 'Smart Lock ST-2 black, XLOCK'), t('Samme lås i sort, til mørke døre og facader.', 'The same lock in black, for dark doors and facades.'), '40013215', '/langskiltesaet-smart-lock-st-2-sort-xlock-t-skandinavisk-las/?product=40013215/40013215'],
            ['6ac4fd14b05dfdae94af96c0_st3-card-40014387-smart-lock-st-2-knapper.webp', t('STROXX Smart Lock ST-2 i rustfrit stål med knap, for og bag', 'STROXX Smart Lock ST-2 stainless with button, front and back'), t('Smart Lock ST-2 rustfri, med knap', 'Smart Lock ST-2 stainless, with button'), t('ST-2 i rustfrit stål med trykknap, til skandinavisk låsekasse.', 'The ST-2 in stainless steel with a push button, for the Scandinavian lock case.'), '40014387', '/langskiltesaet-smart-lock-st-2-rs-t-skandinavisk-las-m-knap/?product=40014387/40014387'],
            ['6ac4fd16d1499283acd58a1d_st3-card-40745007-noegleboks.webp', t('STROXX nøgleboks i aluminium med kodetastatur', 'STROXX key box in aluminium with code keypad'), t('Nøgleboks Keybox, aluminium', 'Key box, aluminium'), t('Nøgleboks i aluminium med bagplade i stål. Til nøglen, der skal kunne hentes af den rigtige.', 'An aluminium key box with a steel back plate. For the key the right person needs to collect.'), '40745007', '/noegleboks/?product=40745007/40745007'],
            ['6ac4fd1487a0cb43bc68ca2c_st3-card-40013955-gateway-g2.webp', t('STROXX Gateway Smart Lock G2 i hvid med USB-kabel', 'STROXX Gateway Smart Lock G2 in white with USB cable'), t('Gateway Smart Lock G2, Wi-Fi', 'Gateway Smart Lock G2, Wi-Fi'), t('Sætter din Smart Lock på nettet via 2,4 GHz Wi-Fi, så den kan styres på afstand.', 'Puts your Smart Lock online over 2.4 GHz Wi-Fi, so it can be managed remotely.'), '40013955', '/gateway-smart-lock-g2-hvid-xlock-wifi/?product=40013955/40013955'],
          ].map(card),
        ),
      ),
      secondHeadline: t('...og tre helt nye', '...and three brand new'),
      secondCards: keyed(
        await Promise.all(
          [
            ['6ac4fd14c4b3caa3c2f38f3a_st3-card-40014046-smart-lock-st-18.webp', t('STROXX kodegreb Smart Lock ST-18 i sort', 'STROXX code handle Smart Lock ST-18 in black'), t('Kodegreb Smart Lock ST-18, sort', 'Code handle Smart Lock ST-18, black'), t('Smart Lock bygget ind i selve dørgrebet. I sort.', 'A Smart Lock built into the door handle itself. In black.'), '40014046', '/kodegreb-smart-lock-sort-st-18/?product=40014046/40014046', t('Nyhed', 'New')],
            ['6ac4fd1568261008d0c76495_st3-card-40014959-doergreb-l.webp', t('STROXX dørgreb i rustfrit stål, L-form, med monteringsdele', 'STROXX door handle in stainless steel, L-shape, with fittings'), t('Dørgreb rustfri, L-form Ø16', 'Door handle stainless, L-shape Ø16'), t('Dørgreb i rustfrit stål, L-form, Ø16 mm og cc30. Monteringsdele følger med.', 'A stainless door handle, L-shape, Ø16 mm and cc30. Fittings included.'), '40014959', '/doergreb-rs-l-form-oe16-cc30-35-75/?product=40014959/40014959', t('Nyhed', 'New')],
            ['6ac4fd166c28e8d0b1b2dec0_st3-card-40014960-doergreb-u.webp', t('STROXX dørgreb i rustfrit stål, U-form, med monteringsdele', 'STROXX door handle in stainless steel, U-shape, with fittings'), t('Dørgreb rustfri, U-form Ø16', 'Door handle stainless, U-shape Ø16'), t('Dørgreb i rustfrit stål, U-form, Ø16 mm og cc30. Monteringsdele følger med.', 'A stainless door handle, U-shape, Ø16 mm and cc30. Fittings included.'), '40014960', '/doergreb-rs-u-form-oe16-cc30-35-75/?product=40014960/40014960', t('Nyhed', 'New')],
          ].map(card),
        ),
      ),
    },
    {
      _type: 'faqSection',
      eyebrow: t('Spørgsmål og svar', 'Questions and answers'),
      headline: t('Det spørger *folk om*', 'What people *ask*'),
      items: keyed([
        [t('Hvad sker der, hvis batteriet løber tør?', 'What happens if the battery runs flat?'), t('Låsen giver batterialarm i god tid. Løber det alligevel tørt, sidder der en USB-C-port nederst under langskiltet. Sæt en powerbank eller lader til, og lås op med kode eller brik som normalt. Er døren låst med nøgle eller vrider, er det kun nøgle eller vrider, der åbner. Lad batterierne op med den medfølgende lader, og bland aldrig gamle og nye.', 'The lock warns you in good time. If it still runs flat, there is a USB-C port under the long plate. Connect a power bank or charger and unlock with code or tag as usual. If the door is locked with the key or thumb turn, only the key or thumb turn opens it. Charge the batteries with the supplied charger, and never mix old and new.')],
        [t('Hvor længe holder en opladning?', 'How long does a charge last?'), t('Ca. 2.000 normale oplåsninger, svarende til omkring 3 måneder, ifølge producenten. Lad batterierne op i mindst 8 timer, før låsen tages i brug første gang.', 'About 2,000 normal unlocks, roughly 3 months, according to the manufacturer. Charge the batteries for at least 8 hours before first use.')],
        [t('Kan håndfladen læses med handsker på?', 'Can it read a palm through gloves?'), t('Nej, scanneren skal se hånden. Med handsker på bruger du kode, kort eller app.', 'No, the scanner has to see your hand. With gloves on, use code, card or app.')],
        [t('Virker den i frost?', 'Does it work in frost?'), t('Ja. Arbejdstemperaturen er -20 til 50 °C ved 10 til 95 % luftfugtighed, og både den udvendige og den indvendige del er IP65.', 'Yes. The operating temperature is -20 to 50 °C at 10 to 95 % humidity, and both the outside and inside parts are IP65.')],
        [t('Hvordan låser jeg indefra, så ingen kan komme ind?', 'How do I lock from inside so nobody can get in?'), t('Det afhænger af låsekassen i døren. Den private vrider på bagpanelet slår den elektroniske oplåsning fra, men hvordan døren låses indefra, bestemmes af låsekassen. Spørg din forhandler, hvis du er i tvivl.', 'That depends on the lock case in the door. The privacy turn on the back panel disables electronic unlocking, but how the door locks from inside is decided by the lock case. Ask your dealer if in doubt.')],
        [t('Hvordan nulstiller jeg låsen?', 'How do I reset the lock?'), t('Hold reset-knappen på bagpanelet inde i 3 sekunder, tast 000#, og vent på "succesfuld". Masterkoden er derefter 123456, indtil en ny administrator er oprettet.', 'Hold the reset button on the back panel for 3 seconds, key 000#, and wait for "successful". The master code is then 123456 until a new administrator is created.')],
        [t('Skal jeg bruge appen?', 'Do I need the app?'), t('Låsen virker uden app i hverdagen. I appen XLOCK Manager lægger du hænder, koder og kort ind, styrer app-brugere og opretter midlertidige PIN-koder, helt uden gateway. Med en gateway som tilkøb kan du også styre låsen på afstand, se låsestatus og hente den fulde log.', 'The lock works day to day without the app. In the XLOCK Manager app you add palms, codes and cards, manage app users and create temporary PIN codes, no gateway needed. With an optional gateway you can also manage the lock remotely, see its status and fetch the full log.')],
        [t('Hvordan rengør jeg den?', 'How do I clean it?'), t('Rent vand eller et mildt rengøringsmiddel på en blød klud. Aldrig midler direkte på låsen. Syrefri olie på de rustfri dele modvirker flyverust.', 'Clean water or a mild cleaner on a soft cloth. Never spray anything directly on the lock. Acid-free oil on the stainless parts prevents surface rust.')],
      ].map(([q, a]) => ({ _type: 'faqItem', q, a }))),
    },
    ...(da
      ? [
          {
            _type: 'peopleCards',
            eyebrow: 'Spørg en specialist',
            headline: 'Ring til en, der har haft den *i hånden*',
            intro: 'Er du i tvivl om låsekassen, dørtykkelsen eller opsætningen i appen, så tag fat i en STROXX-specialist. De står klar med svar, før du borer.',
            people: await PEOPLE_DA(),
          },
        ]
      : []),
    {
      _type: 'textIntro',
      align: 'center',
      eyebrow: t('Dyrt værktøj til udyr pris', 'Pro tools without the pro markup'),
      headline: t('Få råd til andet *end værktøj*', 'Afford more *than just tools*'),
      intro: t('ST-3 er ét af mere end 1.400 STROXX-varenumre hos Carl Ras. Samme kvalitet som det dyre gear, bare ikke samme pris. Se, hvad der sker, når du vælger STROXX til resten af værktøjskassen.', 'The ST-3 is one of more than 1,400 STROXX item numbers. The quality of the expensive gear, without the brand markup. See what happens when you choose STROXX for the rest of the toolbox.'),
      ctaLabel: t('Se hele STROXX-universet', 'See the whole STROXX range'),
      ctaHref: '/products',
    },
  ]);
}

/* ── documents ──────────────────────────────────────────────────────────── */
const CATS = [
  { key: 'lighting', en: 'Lighting', da: 'Belysning', order: 1 },
  { key: 'security', en: 'Security', da: 'Sikring', order: 2 },
];

async function build() {
  const docs = [];
  for (const c of CATS) {
    docs.push({ _id: `focusCategory-${c.key}-en`, _type: 'focusCategory', language: 'en', title: c.en, key: c.key, order: c.order });
    docs.push({ _id: `focusCategory-${c.key}-da-DK`, _type: 'focusCategory', language: 'da-DK', title: c.da, key: c.key, order: c.order });
  }
  const catRef = (k2, lang) => ({ _type: 'reference', _ref: `focusCategory-${k2}-${lang}` });
  for (const lang of ['da-DK', 'en']) {
    const da = lang === 'da-DK';
    docs.push({
      _id: `focusPage-led-strip-cable-reel-${lang}`,
      _type: 'focusPage',
      language: lang,
      title: da ? 'LED-strip på kabeltromle' : 'LED strip on cable reel',
      slug: { _type: 'slug', current: 'led-strip-cable-reel' },
      month: '2026-10-01',
      teaser: da
        ? '20 meter jævnt arbejdslys fra ét stik. 1.500 lumen pr. meter og IP65.'
        : '20 metres of even work light from one plug. 1,500 lumen per metre and IP65.',
      category: catRef('lighting', lang),
      tags: da ? ['arbejdslys', 'byggeplads'] : ['work light', 'site'],
      itemNumbers: ['55011718', '55011717', '55011719'],
      cardImage: await img('6aa14d9407015b82cc339eec_Stroxx_Se-Lyset_OG.jpg', da ? 'LED-strip på kabeltromle' : 'LED strip on cable reel'),
      cutout: await img('6a96f7825e3b84487172c7d1_55011718_50391.png', da ? 'STROXX LED-strip på kabeltromle' : 'STROXX LED strip on a cable reel'),
      seoTitle: da ? 'LED-strip på kabeltromle, 20 m | STROXX' : 'LED strip on cable reel, 20 m | STROXX',
      seoDescription: da
        ? '20 meter LED-strip på tromle, 1.500 lumen pr. meter, 300 W og IP65. Professionelt arbejdslys med 30 dages tilfredshedsgaranti.'
        : '20 metres of LED strip on a reel, 1,500 lumen per metre, 300 W and IP65. Professional work light with a 30-day satisfaction guarantee.',
      ogImage: await img('6aa14d9407015b82cc339eec_Stroxx_Se-Lyset_OG.jpg'),
      sections: await ledSections(lang),
    });
    docs.push({
      _id: `focusPage-smart-lock-st-3-${lang}`,
      _type: 'focusPage',
      language: lang,
      title: 'Smart Lock ST-3',
      slug: { _type: 'slug', current: 'smart-lock-st-3' },
      month: '2026-11-01',
      teaser: da
        ? 'Din hånd er nøglen. Nøglefri lås til skandinaviske døre med håndfladescanner, kode, kort og app.'
        : 'Your hand is the key. A keyless lock for Scandinavian doors with palm scanner, code, card and app.',
      category: catRef('security', lang),
      tags: da ? ['adgang', 'smart lock'] : ['access', 'smart lock'],
      itemNumbers: ['40014135', '40014136', '40014137', '40014138'],
      cardImage: await img('6abea57fa360bd15ae5a7dbb_st3-threequarter-dark-3x2.jpg', 'Smart Lock ST-3'),
      cutout: await img('6abea580b210d9f9ea0cd865_st3-front-cutout.png', 'Smart Lock ST-3'),
      seoTitle: da ? 'Smart Lock ST-3 med håndfladescanner | STROXX' : 'Smart Lock ST-3 with palm scanner | STROXX',
      seoDescription: da
        ? 'Nøglefri adgang til skandinaviske døre. Lås op med håndfladen, PIN-kode, kort eller app. Rustfrit stål A2, 40 til 100 mm døre.'
        : 'Keyless entry for Scandinavian doors. Unlock with your palm, PIN code, card or app. A2 stainless steel, doors from 40 to 100 mm.',
      ogImage: await img('6abea57fa360bd15ae5a7dbb_st3-threequarter-dark-3x2.jpg'),
      sections: await st3Sections(lang),
    });
  }
  /* translation links (document-internationalization metadata), so the Studio's
     language menu jumps between the Danish and English versions */
  const meta = (base, type) => ({
    _id: `translation.metadata.${base}`,
    _type: 'translation.metadata',
    schemaTypes: [type],
    translations: ['en', 'da-DK'].map((l) => ({
      _key: l,
      _type: 'internationalizedArrayReferenceValue',
      value: { _type: 'reference', _ref: `${base}-${l}`, _weak: true, _strengthenOnPublish: { type } },
    })),
  });
  docs.push(meta('focusPage-led-strip-cable-reel', 'focusPage'), meta('focusPage-smart-lock-st-3', 'focusPage'));
  for (const c of CATS) docs.push(meta(`focusCategory-${c.key}`, 'focusCategory'));
  return docs;
}

const docs = await build();
console.log(`\n${docs.length} documents prepared, ${cache.size} assets ${DRY ? '(dry run)' : 'uploaded'}`);
if (DRY) {
  for (const d of docs) console.log(d._id, d.sections ? `${d.sections.length} sections` : '');
  process.exit(0);
}
let tx = client.transaction();
for (const d of docs) tx = FORCE ? tx.createOrReplace(d) : tx.createIfNotExists(d);
await tx.commit({ visibility: 'sync' });
console.log(`${FORCE ? 'Replaced' : 'Created (where missing)'}: ${docs.map((d) => d._id).join(', ')}`);

if (NAV) {
  /* the main menu and footer: "Tool of the Month" → "Focus on…". Run this only
     AFTER the code is live, or the link points at a route that does not exist yet. */
  const settings = await client.fetch('*[_type == "siteSettings"]{_id, language, navLinks, footerLinks}');
  for (const s of settings) {
    const da = s.language === 'da-DK';
    const label = da ? 'Fokus på…' : 'Focus on…';
    const fix = (links) =>
      (links || []).map((l) => (l.href === '/monthly' || /tool of the month/i.test(l.label || '') ? { ...l, href: '/focus-on', label } : l));
    await client.patch(s._id).set({ navLinks: fix(s.navLinks), ...(s.footerLinks ? { footerLinks: fix(s.footerLinks) } : {}) }).commit();
    console.log(`Menu updated on ${s._id} (${s.language || 'en'})`);
  }
}
