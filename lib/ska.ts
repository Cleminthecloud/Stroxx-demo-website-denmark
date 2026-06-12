import { products, Product } from '@/lib/data';

/** STROXX KOMMERCIELT AKTIVERINGSPROGRAM (SKA) — the monthly engine from the
 *  client's strategy (docs/STROXX KOMMERCIEL MOTOR.pdf):
 *  every channel (newsletter, site, SoMe, influencers, campaigns, sales) works
 *  the SAME monthly lineup — 1 premium HERO product with a dedicated landing
 *  page, 5 DB2-winning cash cows linking straight to the webshop, and 1-3
 *  nyheder. This file is the demo's hand-curated month; in production the
 *  lineup is selected from sales data (DB2, customers, volume, growth,
 *  campaign response, stock) and maintained in the CMS — same swap-seam idea
 *  as lib/data.ts.
 */

const byCode = (code: string): Product => {
  const p = products.find((x) => x.code === code);
  if (!p) throw new Error(`SKA: unknown product code ${code}`);
  return p;
};

export const SKA = {
  month: 'Juni',
  year: '2026',

  /** HERO — månedens hovedhistorie. Kvalitet og værdi, ikke pris. */
  hero: byCode('35011932'), // Streglaser 3D Green
  heroClaims: [
    {
      title: 'Grønne linjer. Hele dagen.',
      body: 'Grøn diode er op til fire gange mere synlig end rød i dagslys. Linjerne står skarpt på 40 meter, og 70 med modtagerboks.',
    },
    {
      title: '±1,5 mm på 5 meter.',
      body: 'Selvnivellerende 3D-linjer i tre planer, 360 grader rundt. Nøjagtigheden står på databladet, ikke kun i reklamen.',
    },
    {
      title: 'Sæt den. Glem den.',
      body: 'Én mand sætter laseren, samme mand monterer. Det sparer en kollega på opmålingen, hver eneste gang.',
    },
  ],
  /** anvendelsescases — hvor den tjener sig hjem */
  heroCases: [
    { trade: 'Tømrer', use: 'Lofter, skillevægge og gulvopretning i ét opslag. 3D-planerne rammer alle fire vægge på én gang.' },
    { trade: 'Elektriker', use: 'Dåser og føringsveje i samme højde gennem hele lejligheden, uden snor og uden hjælper.' },
    { trade: 'VVS', use: 'Fald og faste højder på rørtræk. Linjen står, mens du arbejder, også i skarpt lys.' },
  ],
  heroFaq: [
    {
      q: 'Hvor god er den grønne laser i dagslys?',
      a: 'Grøn diode opfattes op til fire gange tydeligere end rød. Indendørs i normalt arbejdslys står linjerne skarpt på hele rækkevidden, 40 meter, og udendørs eller i skarpt lys bruger du modtagerboksen og kommer op på 70 meter.',
    },
    {
      q: 'Hvad betyder 3D, helt konkret?',
      a: 'Tre selvnivellerende 360-graders planer: ét vandret og to lodrette, vinkelret på hinanden. Du kan altså sætte vaterpaslinje, lodlinje og vinkel på samme tid, hele vejen rundt i rummet.',
    },
    {
      q: 'Hvor præcis er den i praksis?',
      a: '±1,5 mm på 5 meter. Det er samme klasse som A-mærkernes grønne 3D-lasere, og rigeligt til aptering, lofter, fliser og el-arbejde.',
    },
    {
      q: 'Hvad hvis den ikke holder, hvad jeg forventer?',
      a: 'Så gælder tilfredshedsgarantien: prøv den på rigtigt arbejde i 30 dage, og er du ikke tilfreds, får du pengene tilbage hos Carl Ras. Ingen krav om fejl, din vurdering er nok.',
    },
  ],

  /** DB2-VINDERE — cash cows. Volumen, bred kunderelevans, skarp pris. */
  cashCows: [
    byCode('34011573'), // Rundsavklinge Ø160 Z42W
    byCode('34009021'), // Kniv Black 25mm autolås
    byCode('35011812'), // Torpedo vaterpas 250mm
    byCode('35011846'), // Speed vinkel 175mm
    byCode('49011269'), // MS Byggefuge hvid 290ml
  ],

  /** NYHEDER — fordelt mellem premium / problemløser / kommerciel. */
  nyheder: [
    { type: 'Premium nyhed', product: byCode('64012039'), pitch: 'Kompressor-køleboks til skurvognen. Kold frokost i juli, uden is.' },
    { type: 'Problemløser', product: byCode('63143492'), pitch: 'Hue med indbygget pandelampe. Lys på sagen, hænderne fri.' },
  ],
};

export type SkaNyhed = (typeof SKA.nyheder)[number];
