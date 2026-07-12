import { products, Product } from '@/lib/data';
import type { Video } from '@/lib/videos';

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
  month: 'June',
  year: '2026',

  /** HERO — månedens hovedhistorie. Kvalitet og værdi, ikke pris. */
  hero: byCode('35011932'), // Streglaser 3D Green
  heroClaims: [
    {
      title: 'Green lines. All day long.',
      body: 'A green diode is up to four times more visible than red in daylight. The lines stay sharp at 40 metres, and 70 with a receiver.',
    },
    {
      title: '±1.5 mm at 5 metres.',
      body: 'Self-levelling 3D lines across three planes, a full 360 degrees. The accuracy is on the data sheet, not just in the ad.',
    },
    {
      title: 'Set it. Forget it.',
      body: 'One person sets the laser, the same person fits. It saves you a colleague on the layout, every single time.',
    },
  ],
  /** anvendelsescases — hvor den tjener sig hjem */
  heroCases: [
    { trade: 'Carpenter', use: 'Ceilings, partitions and floor levelling in one setup. The 3D planes hit all four walls at once.' },
    { trade: 'Electrician', use: 'Boxes and runs at the same height through the whole flat, no string and no helper.' },
    { trade: 'Plumber', use: 'Falls and fixed heights on pipe runs. The line holds while you work, even in bright light.' },
  ],
  heroFaq: [
    {
      q: 'How good is the green laser in daylight?',
      a: 'A green diode reads up to four times clearer than red. Indoors in normal work light the lines stay sharp across the full range, 40 metres, and outdoors or in bright light you use the receiver and reach 70 metres.',
    },
    {
      q: 'What does 3D actually mean here?',
      a: 'Three self-levelling 360-degree planes: one horizontal and two vertical, perpendicular to each other. So you can set a level line, a plumb line and a square all at once, the whole way around the room.',
    },
    {
      q: 'How accurate is it in practice?',
      a: '±1.5 mm at 5 metres. That is the same class as the A-brand green 3D lasers, and plenty for fit-out, ceilings, tiling and electrical work.',
    },
    {
      q: 'What if it does not hold up to what I expect?',
      a: 'Then the satisfaction guarantee kicks in: try it on real jobs for 30 days, and if you are not happy, you get your money back at your STROXX dealer. No fault required, your judgement is enough.',
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
    { type: 'Premium new arrival', product: byCode('64012039'), pitch: 'Compressor cool box for the site hut. Cold lunch in July, no ice needed.' },
    { type: 'Problem solver', product: byCode('63143492'), pitch: 'Beanie with a built-in head torch. Light on the job, hands free.' },
  ],

  /** FILMS — editor-picked films for the month's film section; empty = the
   *  site shows all active films from the Film collection. */
  films: [] as Video[],
};

export type SkaNyhed = (typeof SKA.nyheder)[number];
