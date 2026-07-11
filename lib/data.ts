// STROXX brand-site demo data.
// Categories + a curated set of REAL products harvested from carl-ras.dk
// (names, item codes, Carl-Ras image asset ids). No price data: the brand
// site never shows or holds prices; pricing is the dealer's job.
// Purchase always happens on the local partner platform (Carl Ras in DK).

import { PDP_PATHS } from './pdp';

export const UTM = 'utm_source=cr-byg&utm_medium=brandsite_link&utm_campaign=stroxx';
export const CR_BRAND = 'https://www.carl-ras.dk/maerker/stroxx';

/** Live Carl-Ras CDN image (800px) for a product image asset id. */
export const crImage = (id: number | string) =>
  `https://images.carl-ras.dk/digizuitecore/LegacyService/api/assetstream/${id}/50384`;

/** Our same-origin proxy (canvas-readable). The proxy serves the transparent
 *  PNG cut-out (Digizuite rendition 50391), falling back to JPG. IMG_V is a
 *  cache-buster: bump it whenever the proxy's rendition logic changes so the
 *  CDN edge (s-maxage) serves fresh images instead of stale cached ones. */
const IMG_V = '9'; // v9: no-store upstream fetches (Next data-cache hung on 18MB bodies)

/** Assets whose DAM renditions are broken upstream: the transparent 50391
 *  rendition 404s and every remaining PNG is 5-19MB — over the proxy's 3MB
 *  guard — so /api/tool can only ever serve its BLANK fallback. These are
 *  committed as pre-knocked-out local PNGs instead (all lasers, as of
 *  2026-07-02). If more products go blank, check the 50391 rendition first. */
const LOCAL_TOOL_IMG: Record<string, string> = {
  '159146': '/Images/bag-tools/159146.png', // cross-line laser 102-187
  '159147': '/Images/bag-tools/159147.png', // laser distance meter 102-186
  '169234': '/Images/bag-tools/169234.png', // Line laser 3D Green (SKA hero)
  '169241': '/Images/bag-tools/169241.png', // Line laser 3D Green Floor
};
export const toolTexture = (id: number | string, f?: '50383' | '50384' | '50388') =>
  LOCAL_TOOL_IMG[String(id)] ?? `/api/tool/${id}?v=${IMG_V}${f ? `&f=${f}` : ''}`;

/** Deep-link to the Carl-Ras category listing, UTM preserved. */
export const categoryBuyUrl = (path: string) => `${CR_BRAND}/${path}/?${UTM}`;

/** Deep-link to a specific product's real Carl Ras PDP via its item number
 *  (varenummer), using the harvested PDP_PATHS map. Products not in the map
 *  (a few secondary variants) fall back to a single-item search that resolves
 *  to the product. UTM preserved. */
/** Carl Ras (Denmark) product deep-link. INTERNAL to the buy layer: only
 *  `BuyCTA` / `LandingBuyButton` / `FooterBuyLink` call this, they decide
 *  per-market whether to link to a dealer or open the dealer chooser. Do NOT
 *  hand-write a Carl Ras buy link in a component, route every buy through the
 *  buy primitive so the international market never dead-ends. See DEPENDENCIES.md. */
export const productBuyUrl = (code?: string) => {
  if (code && PDP_PATHS[code]) {
    const path = PDP_PATHS[code];
    return `https://www.carl-ras.dk${path}${path.includes('?') ? '&' : '?'}${UTM}`;
  }
  return code
    ? `https://www.carl-ras.dk/search/?search=${encodeURIComponent(code)}&${UTM}`
    : `${CR_BRAND}/?${UTM}`;
};

export type Category = {
  slug: string;
  name: string;
  path: string; // carl-ras path under /maerker/stroxx/
  blurb: string;
};

export const categories: Category[] = [
  { slug: 'access-control', name: 'Access control', path: 'stroxx-adgangskontrol', blurb: 'Locks, fittings and access. Control who gets in.' },
  { slug: 'workwear', name: 'Workwear', path: 'stroxx-arbejdstoej', blurb: 'Gear that survives a hard day. Without costing a full wage.' },
  { slug: 'batteries', name: 'Batteries', path: 'stroxx-batterier', blurb: 'Power when you need it. Full stop.' },
  { slug: 'lighting', name: 'Lighting and accessories', path: 'stroxx-belysning', blurb: 'Light on the job: work lamps, headlamps and bulbs.' },
  { slug: 'bits-screwdrivers', name: 'Bits and screwdrivers', path: 'stroxx-haandvaerktoej/stroxx-bits-skruetraekkere', blurb: 'Grips that hold. Tips that bite. Every time.' },
  { slug: 'drill-bits', name: 'Drills and drill sets', path: 'stroxx-bor-borsaet', blurb: 'Bits for wood, metal and concrete. Clean holes, clear conscience.' },
  { slug: 'sealant', name: 'Sealant and accessories', path: 'stroxx-fugemasse-tilbehoer', blurb: 'Sealant that seals, and guns that never jam.' },
  { slug: 'hole-saws', name: 'Hole saws and accessories', path: 'stroxx-hulsave-tilbehoer', blurb: 'The right hole, first time. Every time.' },
  { slug: 'cable-reels', name: 'Cable reels', path: 'stroxx-kabeltromler', blurb: 'Power with enough reach. And the toughness for the site.' },
  { slug: 'chemicals', name: 'Chemicals and paint tools', path: 'stroxx-kemi', blurb: 'Glue, foam, cleaner and spray. The chemistry that just works.' },
  { slug: 'knives', name: 'Knives and blades', path: 'stroxx-haandvaerktoej/stroxx-arbejdsknive', blurb: 'Sharp from the start. Ready when you are.' },
  { slug: 'lasers', name: 'Lasers and accessories', path: 'stroxx-lasere', blurb: 'Precision for pros, at a sharp price.' },
  { slug: 'painting-tools', name: 'Painting gear and accessories', path: 'stroxx-malergrej-tilbehoer', blurb: 'Rollers, brushes and tape for a clean finish.' },
  { slug: 'multi-cutter-blades', name: 'Multi-cutter blades', path: 'stroxx-multicutterklinger', blurb: 'Blades for the multi-tool, for every awkward cut.' },
  { slug: 'measuring-tools', name: 'Measuring tools', path: 'stroxx-maalevaerktoej', blurb: 'Measure right. Cut once. Levels, squares and more.' },
  { slug: 'circular-saw-blades', name: 'Circular saw blades', path: 'stroxx-rundsavklinger', blurb: 'Clean cuts in wood, metal and laminate. Blades that last.' },
  { slug: 'safety', name: 'Safety', path: 'stroxx-sikkerhed', blurb: 'Helmet, glasses, gloves. Get home in one piece.' },
  { slug: 'site-hut-supplies', name: 'Site hut supplies', path: 'stroxx-skurvognsartikler', blurb: 'What the site hut needs. For the break and the job.' },
  { slug: 'tape', name: 'Tape', path: 'stroxx-tape', blurb: 'Tape that grips, and lets go when it should.' },
  { slug: 'socket-sets', name: 'Socket sets, sockets and accessories', path: 'stroxx-topnoegler-tilbehoer', blurb: 'Sockets and sets that get a grip on the job.' },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export type Badge = 'POPULAR' | 'VALUE' | 'CAMPAIGN' | 'BEST IN TEST' | 'NEW' | 'OUTLET' | 'ECO';

export type Product = {
  slug: string;
  name: string;
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
  name: string, imgId: number, category: string,
  opts: Partial<Product> = {}
): Product => ({
  // append the item number so duplicate product names never collide — unique
  // slugs are required for routing AND for stable React keys in lists.
  slug: slugify(name) + (opts.code ? `-${opts.code}` : ''),
  name, imgId, category,
  unit: opts.unit ?? 'Piece',
  code: opts.code,
  tags: opts.tags ?? [category],
  badges: opts.badges ?? [],
  blurb: opts.blurb ?? '',
  specs: opts.specs ?? [],
  hero: opts.hero ?? false,
});

export const products: Product[] = [
  p("Hex key set 1,5-10mm", 47695, "bits-screwdrivers", {code:"30000071", tags:["bits-screwdrivers"], specs:[{"label":"Key width mm and inch","value":"1,5-10"},{"label":"Contents","value":"9"}]}),
  p("Hex key set 1,5-10mm", 47090, "bits-screwdrivers", {code:"30000072", tags:["bits-screwdrivers"], badges:["VALUE"], specs:[{"label":"Key width mm and inch","value":"1,5-10"},{"label":"Contents","value":"9"}]}),
  p("Socket set 1/2\", 20 pcs", 116544, "socket-sets", {code:"30012321", tags:["socket-sets"], unit:"Set", badges:["VALUE","POPULAR"], specs:[{"label":"Square drive","value":"1/2\""},{"label":"Contents","value":"20 pcs"},{"label":"Code","value":"101-320"}]}),
  p("Socket set 1/4\" + 1/2\", 79 pcs", 114521, "socket-sets", {code:"30012322", tags:["socket-sets"], unit:"Set", badges:["VALUE","POPULAR"], specs:[{"label":"Square drive","value":"1/4\" + 1/2\""},{"label":"Contents","value":"79 pcs"},{"label":"Code","value":"101-321"}]}),
  p("Socket set 1/4\", 25 pcs", 161197, "socket-sets", {code:"30012433", tags:["socket-sets"], unit:"Set", badges:["VALUE","POPULAR"], specs:[{"label":"Square drive","value":"1/4\""},{"label":"Contents","value":"25 pcs"},{"label":"Code","value":"102-097"}]}),
  p("Socket set 1/4\" long, 37 pcs", 161222, "socket-sets", {code:"30012434", tags:["socket-sets"], unit:"Set", badges:["VALUE","POPULAR"], specs:[{"label":"Square drive","value":"1/4\""},{"label":"Contents","value":"37 pcs"},{"label":"Code","value":"102-098"}]}),
  p("Socket set 3/8\", 34 pcs", 161205, "socket-sets", {code:"30012435", tags:["socket-sets"], unit:"Set", badges:["VALUE"], specs:[{"label":"Square drive","value":"3/8\""},{"label":"Contents","value":"34 pcs"},{"label":"Code","value":"102-099"}]}),
  p("Metal drill bit HSS ground 7 edge 5,0mm", 51529, "drill-bits", {code:"32000063", tags:["drill-bits"], unit:"SB card", specs:[{"label":"Diameter mm","value":"5"},{"label":"Qty per bag","value":"1"}]}),
  p("Wood twist drill bit 4,0mm", 51531, "drill-bits", {code:"32000088", tags:["drill-bits"], specs:[{"label":"Diameter mm","value":"4"}]}),
  p("SDS hammer drill bit 2-edge 8,0 x 250mm", 51414, "drill-bits", {code:"32000126", tags:["drill-bits"], badges:["OUTLET"], specs:[{"label":"Diameter mm","value":"8"},{"label":"Total length mm","value":"250"},{"label":"Flute length mm","value":"185"},{"label":"Contents","value":"1"},{"label":"Cutting edges","value":"2"}]}),
  p("Metal drill bit HSS ground cobolt 5,0mm 1 pcs", 53644, "drill-bits", {code:"32000249", tags:["drill-bits"], unit:"SB card", badges:["POPULAR"], specs:[{"label":"Diameter mm","value":"5"},{"label":"Total length mm","value":"86"},{"label":"Flute length mm","value":"52"},{"label":"Qty per bag","value":"1"}]}),
  p("Metal drill bit hss ground 2,0mm x 10 pcs", 51533, "drill-bits", {code:"32000319", tags:["drill-bits"], unit:"Pack", specs:[{"label":"Diameter mm","value":"2"},{"label":"Total length mm","value":"49"},{"label":"Flute length mm","value":"24"},{"label":"Qty per bag","value":"10"}]}),
  p("Hole saw HSS bimetal 19mm", 51535, "hole-saws", {code:"32000377", tags:["hole-saws"], badges:["OUTLET","POPULAR"], specs:[{"label":"Diameter mm","value":"19"},{"label":"Cutting depth mm","value":"38"}]}),
  p("Arbor XA1 14-30mm", 51547, "hole-saws", {code:"32000435", tags:["hole-saws"], badges:["OUTLET","POPULAR"], specs:[{"label":"For saw diameter mm","value":"14-30"},{"label":"Type","value":"XA1"},{"label":"Code","value":"500-504"}]}),
  p("Pilot drill HM 6,3x200mm", 51549, "hole-saws", {code:"32000442", tags:["hole-saws"], badges:["OUTLET"], specs:[{"label":"Length mm","value":"200"},{"label":"Diameter mm","value":"63"},{"label":"Type","value":"HM"},{"label":"Code","value":"500-511"}]}),
  p("Drill bit set HSS 1-10mm / 0,5mm ground, 19 pcs", 51608, "drill-bits", {code:"32000459", tags:["drill-bits"], unit:"Set", specs:[{"label":"Contents","value":"19"}]}),
  p("Drill bit set HSS 1-13mm / 0,5mm ground, 25 pcs", 51611, "drill-bits", {code:"32000460", tags:["drill-bits"], unit:"Set", specs:[{"label":"Contents","value":"25"}]}),
  p("Drill bit set HSS 1-10mm / 0,5mm ground, 100 pcs", 51604, "drill-bits", {code:"32000461", tags:["drill-bits"], unit:"Set", badges:["VALUE","POPULAR"], specs:[{"label":"Contents","value":"100"}]}),
  p("Drill bit set HSS cobolt 1-10mm / 0,5mm ground, 100 pcs", 51603, "drill-bits", {code:"32000463", tags:["drill-bits"], unit:"Set", specs:[{"label":"Contents","value":"100"}]}),
  p("Wood drill bit set 1/4\"-shank 5 pcs, 60 mm", 51628, "drill-bits", {code:"32000468", tags:["drill-bits"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Size mm","value":"3-8"},{"label":"Contents","value":"5"}]}),
  p("Wood drill bit set 1/4\"-shank 5 pcs, 130 mm", 51620, "drill-bits", {code:"32000471", tags:["drill-bits"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Contents","value":"5"}]}),
  p("Masonry drill bit Multi construction 4,0 x 70mm", 51626, "drill-bits", {code:"32000477", tags:["drill-bits"], badges:["OUTLET","POPULAR"], specs:[{"label":"Diameter mm","value":"4"},{"label":"Total length mm","value":"70"}]}),
  p("SDS hammer drill bit 4-edge 5,0x110", 51426, "drill-bits", {code:"32008576", tags:["drill-bits"], badges:["POPULAR"], specs:[{"label":"Diameter mm","value":"5"},{"label":"Total length mm","value":"110"},{"label":"Flute length mm","value":"50"},{"label":"Contents","value":"1"},{"label":"Cutting edges","value":"4"}]}),
  p("SDS hammer drill bitset 4-edge 7 pcs", 51140, "drill-bits", {code:"32008644", tags:["drill-bits"], unit:"Set", badges:["CAMPAIGN"], specs:[{"label":"Contents","value":"7"},{"label":"Code","value":"500-580"}]}),
  p("SDS hammer drill bit 4-edge 6,0x110 a 10 pcs", 51427, "drill-bits", {code:"32008647", tags:["drill-bits"], unit:"Pack", specs:[{"label":"Diameter mm","value":"6"},{"label":"Total length mm","value":"110"},{"label":"Flute length mm","value":"50"},{"label":"Contents","value":"10"},{"label":"Cutting edges","value":"4"}]}),
  p("Auger bit 6,0 x 400 mm, Japan", 75133, "drill-bits", {code:"32008931", tags:["drill-bits"], badges:["POPULAR"], specs:[{"label":"Diameter mm","value":"6"},{"label":"Total length mm","value":"400"},{"label":"Qty per pack","value":"1"},{"label":"Code","value":"4L-060"}]}),
  p("Auger bit Impact 6,0 x 160 mm, Japan", 60564, "drill-bits", {code:"32008986", tags:["drill-bits"], specs:[{"label":"Diameter mm","value":"6"},{"label":"Total length mm","value":"160"},{"label":"Qty per pack","value":"1"},{"label":"Code","value":"7M-060"}]}),
  p("Masonry drill bit set Multi Rush, size 4, 5, 6, 8, 10 mm, 5 pcs", 120719, "drill-bits", {code:"32012237", tags:["drill-bits"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Size mm","value":"4,5,6,8,10"},{"label":"Contents","value":"5 pcs"}]}),
  p("Plug & auger bit set 8-15mm", 129148, "drill-bits", {code:"32012261", tags:["drill-bits"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Size mm","value":"8 - 15"},{"label":"Contents","value":"8"},{"label":"Code","value":"101-418"}]}),
  p("Plug & auger bit set 16-30mm", 129153, "drill-bits", {code:"32012262", tags:["drill-bits"], unit:"Set", specs:[{"label":"Size mm","value":"16 - 30"},{"label":"Contents","value":"8"},{"label":"Code","value":"101-419"}]}),
  p("Forstner bit set 10-35mm, 12 pcs", 129155, "drill-bits", {code:"32012263", tags:["drill-bits"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Qty per pack","value":"12"},{"label":"Code","value":"101-420"}]}),
  p("Hammer drill bit SDS-Max 4-edge 12,0x340mm", 118903, "drill-bits", {code:"32012264", tags:["drill-bits"], specs:[{"label":"Diameter mm","value":"12"},{"label":"Total length mm","value":"340"},{"label":"Flute length mm","value":"200"},{"label":"Cutting edges","value":"4"},{"label":"Code","value":"500-595"}]}),
  p("Masonry drill bit Multi Rush 3,5 x 90mm", 120665, "drill-bits", {code:"32012521", tags:["drill-bits"], specs:[{"label":"Diameter mm","value":"3.5"},{"label":"Total length mm","value":"90"},{"label":"Code","value":"102-088"}]}),
  p("Hole saw HSS bimetal 19mm", 156693, "hole-saws", {code:"32012525", tags:["hole-saws"], specs:[{"label":"Diameter mm","value":"19"},{"label":"Cutting edges","value":"HSS"},{"label":"Connection","value":"A1"}]}),
  p("Arbor A1 14-30mm", 156691, "hole-saws", {code:"32012575", tags:["hole-saws"], specs:[{"label":"For saw diameter mm","value":"14 - 30"},{"label":"Type","value":"A1"},{"label":"Code","value":"501-092"}]}),
  p("Arbor A10 32-210mm", 156681, "hole-saws", {code:"32012576", tags:["hole-saws"], badges:["POPULAR"], specs:[{"label":"For saw diameter mm","value":"32 - 210"},{"label":"Shank size mm","value":"10"},{"label":"Type","value":"A10"},{"label":"Code","value":"501-093"}]}),
  p("Arbor A2 32-200mm", 156698, "hole-saws", {code:"32012577", tags:["hole-saws"], badges:["POPULAR"], specs:[{"label":"For saw diameter mm","value":"32 - 200"},{"label":"Type","value":"A2"},{"label":"Code","value":"501-094"}]}),
  p("Arbor A12 32-200mm Quick", 156699, "hole-saws", {code:"32012578", tags:["hole-saws"], badges:["POPULAR"], specs:[{"label":"For saw diameter mm","value":"32 - 200"},{"label":"Type","value":"A12"},{"label":"Code","value":"501-095"}]}),
  p("Arbor A10-SDS 32-210mm", 156701, "hole-saws", {code:"32012579", tags:["hole-saws"], specs:[{"label":"For saw diameter mm","value":"32 - 210"},{"label":"Type","value":"A10"},{"label":"Code","value":"501-096"}]}),
  p("Extension A15", 156703, "hole-saws", {code:"32012580", tags:["hole-saws"], specs:[{"label":"Length mm","value":"300"},{"label":"Shank size mm","value":"10"},{"label":"Type","value":"A15"},{"label":"Code","value":"501-097"}]}),
  p("Extension A5", 156706, "hole-saws", {code:"32012581", tags:["hole-saws"], badges:["POPULAR"], specs:[{"label":"Length mm","value":"300"},{"label":"Shank size mm","value":"13"},{"label":"Type","value":"A5"},{"label":"Code","value":"501-098"}]}),
  p("Pilot drill HSS 6.3x80mm, x 3 pcs.", 156724, "hole-saws", {code:"32012582", tags:["hole-saws"], unit:"Pack", specs:[{"label":"Length mm","value":"80"},{"label":"Diameter mm","value":"6.3"},{"label":"Type","value":"HSS"},{"label":"Code","value":"501-099"}]}),
  p("Pilot drill HM 6,3x100mm, x 3 pcs.", 156726, "hole-saws", {code:"32012584", tags:["hole-saws"], unit:"Pack", badges:["POPULAR"], specs:[{"label":"Length mm","value":"100"},{"label":"Diameter mm","value":"6.3"},{"label":"Type","value":"HM"},{"label":"Code","value":"501-101"}]}),
  p("Arbor Quick Change with 2 adapters", 156719, "hole-saws", {code:"32012585", tags:["hole-saws"], badges:["POPULAR"], specs:[{"label":"For saw diameter mm","value":"14 - 30 + 32 - 210"},{"label":"Code","value":"501-102"}]}),
  p("Hole saw adapter set 5 pcs for hole saws 14-30mm", 156722, "hole-saws", {code:"32012586", tags:["hole-saws"], badges:["POPULAR"], specs:[{"label":"For saw diameter mm","value":"14 - 30"},{"label":"Code","value":"501-103"}]}),
  p("Hole saw adapter set 5 pcs for hole saws 32-210mm", 156733, "hole-saws", {code:"32012587", tags:["hole-saws"], badges:["POPULAR"], specs:[{"label":"For saw diameter mm","value":"32 - 210"},{"label":"Code","value":"501-104"}]}),
  p("Hole saw set HSS bimetal Elektriker 19-83mm, 13 pcs", 156729, "hole-saws", {code:"32012588", tags:["hole-saws"], unit:"Set", badges:["VALUE"], specs:[{"label":"Contents mm","value":"19 - 83"},{"label":"Contents","value":"13"},{"label":"Type","value":"HSS"},{"label":"Code","value":"501-105"}]}),
  p("Hole saw set HSS bimetal Snedker 25-76mm, 11 pcs", 156732, "hole-saws", {code:"32012589", tags:["hole-saws"], unit:"Set", badges:["VALUE"], specs:[{"label":"Contents mm","value":"25 - 76"},{"label":"Contents","value":"11"},{"label":"Code","value":"501-106"}]}),
  p("Hole saw set HM Snedker 25-76mm, 11 pcs", 156740, "hole-saws", {code:"32012590", tags:["hole-saws"], unit:"Set", badges:["VALUE","POPULAR"], specs:[{"label":"Contents mm","value":"25 - 76"},{"label":"Contents","value":"11"},{"label":"Type","value":"HM"},{"label":"Code","value":"501-107"}]}),
  p("Diamond tile bit 5mm", 144482, "hole-saws", {code:"32012591", tags:["hole-saws"], specs:[{"label":"Diameter mm","value":"5"},{"label":"Code","value":"102-101"}]}),
  p("Countersink set HSS 6,3-20,5mm, 6 pcs", 179486, "drill-bits", {code:"32012694", tags:["drill-bits"], unit:"Set", badges:["VALUE"], specs:[{"label":"Size mm","value":"6,3 - 20,5"},{"label":"Contents","value":"6"},{"label":"Code","value":"102-499"}]}),
  p("Step drill bit HSS 7 edge, 4-12mm", 205464, "drill-bits", {code:"32012785", tags:["drill-bits"], badges:["POPULAR"], specs:[{"label":"Diameter mm","value":"4 - 12"},{"label":"Type","value":"HSS"},{"label":"Code","value":"102-729"}]}),
  p("Metal drill bit HSS extra long 2,0x125mm", 243123, "drill-bits", {code:"32012788", tags:["drill-bits"], specs:[{"label":"Diameter mm","value":"2"},{"label":"Total length mm","value":"125"},{"label":"Qty per bag","value":"1"},{"label":"Code","value":"102-733"}]}),
  p("Metal drill bit set HSS with trinspids Step drill, 10 pcs", 239984, "drill-bits", {code:"32012834", tags:["drill-bits"], unit:"Set", badges:["CAMPAIGN"], specs:[{"label":"Contents","value":"10"},{"label":"Code","value":"501-141"}]}),
  p("Drill bit set hss 1-10 / 0,5mm ground a19", 64832, "drill-bits", {code:"32031800", tags:["drill-bits"], badges:["VALUE","POPULAR"], specs:[{"label":"Size mm","value":"1-10"},{"label":"Contents","value":"19"},{"label":"Code","value":"STROXX"}]}),
  p("Drill bit set HSS ground with centre tip 1,0-13,0X0,5 mm, 25 pcs.", 39200, "drill-bits", {code:"32031805", tags:["drill-bits"], specs:[{"label":"Size mm","value":"1-13"},{"label":"Contents","value":"25"},{"label":"Code","value":"STROXX"}]}),
  p("Drill bit set Cobolt 1-10 / 0,5mm ground a19", 39220, "drill-bits", {code:"32032300", tags:["drill-bits"], specs:[{"label":"Size mm","value":"1-10"},{"label":"Contents","value":"19"},{"label":"Code","value":"STROXX"}]}),
  p("Bits PZ2 1/4\" x 25mm, pak af 20 pcs", 67473, "bits-screwdrivers", {code:"33000060", tags:["bits-screwdrivers"], unit:"Pack", badges:["OUTLET","POPULAR"], specs:[{"label":"Drive size","value":"PZ2"},{"label":"Length mm","value":"25"},{"label":"Qty per pack","value":"20"}]}),
  p("Bits PZ2 1/4\" x 25mm, pak af 20 pcs", 56633, "bits-screwdrivers", {code:"33008845", tags:["bits-screwdrivers"], unit:"Pack", badges:["OUTLET"], specs:[{"label":"Drive size","value":"PZ2"},{"label":"Length mm","value":"25"},{"label":"Qty per pack","value":"20"}]}),
  p("Angle bit adapter with quick change", 65253, "bits-screwdrivers", {code:"33008996", tags:["bits-screwdrivers"], badges:["VALUE"], specs:[{"label":"Qty per pack","value":"1"},{"label":"Code","value":"100-597"}]}),
  p("Bits PH1 1/4\" x 90mm, 3-pak", 53321, "bits-screwdrivers", {code:"33009001", tags:["bits-screwdrivers"], unit:"Pack", badges:["OUTLET"], specs:[{"label":"Drive size","value":"PH1"},{"label":"Length mm","value":"90"},{"label":"Qty per pack","value":"3"},{"label":"Code","value":"100-660"}]}),
  p("Bits PZ3 1/4\" x 90mm, 3-pak", 53322, "bits-screwdrivers", {code:"33009006", tags:["bits-screwdrivers"], unit:"Pack", badges:["OUTLET"], specs:[{"label":"Drive size","value":"PZ3"},{"label":"Length mm","value":"90"},{"label":"Qty per pack","value":"3"},{"label":"Code","value":"100-665"}]}),
  p("Bit screwdriver set 89mm, 17 pcs", 110503, "bits-screwdrivers", {code:"33011379", tags:["bits-screwdrivers"], specs:[{"label":"Blade length mm","value":"89"},{"label":"Contents","value":"17"},{"label":"Code","value":"100-850"}]}),
  p("Bit set impact, 32 pcs", 107900, "bits-screwdrivers", {code:"33011400", tags:["bits-screwdrivers"], badges:["VALUE"], specs:[{"label":"Contents","value":"32 pcs"},{"label":"Code","value":"101-177"}]}),
  p("Bit holder Quick lock impact 1/4\" x 60mm, x 3 pcs", 108094, "bits-screwdrivers", {code:"33011401", tags:["bits-screwdrivers"], unit:"Pack", badges:["VALUE","POPULAR"], specs:[{"label":"External dimension mm","value":"1/4\""},{"label":"Length mm","value":"60"}]}),
  p("Bit holder impact with C-ring 1/4\" x 60mm, x 5 pcs", 108099, "bits-screwdrivers", {code:"33011402", tags:["bits-screwdrivers"], unit:"Pack", badges:["VALUE"], specs:[{"label":"External dimension mm","value":"1/4\""},{"label":"Length mm","value":"60"}]}),
  p("Drywall bits with stop 1/4\" x 25 mm, pakke with 2 pcs", 108103, "bits-screwdrivers", {code:"33011403", tags:["bits-screwdrivers"], specs:[{"label":"Length mm","value":"25"},{"label":"Qty per pack","value":"2"}]}),
  p("Bits PH2 1/4\" x 25mm, pak af 20 pcs, impact", 108112, "bits-screwdrivers", {code:"33011404", tags:["bits-screwdrivers"], unit:"Pack", badges:["VALUE"], specs:[{"label":"Drive size","value":"PH2"},{"label":"Length mm","value":"25"},{"label":"Qty per pack","value":"20"}]}),
  p("Bits PZ2 1/4\" x 25mm, pak af 20 pcs, impact", 108110, "bits-screwdrivers", {code:"33011405", tags:["bits-screwdrivers"], unit:"Pack", badges:["VALUE","POPULAR"], specs:[{"label":"Drive size","value":"PZ2"},{"label":"Length mm","value":"25"},{"label":"Qty per pack","value":"20"}]}),
  p("Bits TX30 1/4\" x 25mm, pak af 20 pcs, impact", 108114, "bits-screwdrivers", {code:"33011410", tags:["bits-screwdrivers"], unit:"Pack", badges:["VALUE","POPULAR"], specs:[{"label":"Drive size","value":"TX30"},{"label":"Length mm","value":"25"},{"label":"Qty per pack","value":"20"}]}),
  p("Bit set impact, 49 pcs", 108131, "bits-screwdrivers", {code:"33011411", tags:["bits-screwdrivers"], specs:[{"label":"Contents","value":"49 pcs"}]}),
  p("Bit set 62 pcs, impact", 108018, "bits-screwdrivers", {code:"33011412", tags:["bits-screwdrivers"], badges:["POPULAR"], specs:[{"label":"Contents","value":"62 pcs"}]}),
  p("Bits PH2 1/4\" x 90mm, 3-pak, impact", 108030, "bits-screwdrivers", {code:"33011413", tags:["bits-screwdrivers"], unit:"Pack", specs:[{"label":"Drive size","value":"PH2"},{"label":"Length mm","value":"90"},{"label":"Qty per pack","value":"3"}]}),
  p("Bits PZ2 1/4\" x 90mm, 3-pak, impact", 108024, "bits-screwdrivers", {code:"33011414", tags:["bits-screwdrivers"], unit:"Pack", specs:[{"label":"Drive size","value":"PZ2"},{"label":"Length mm","value":"90"},{"label":"Qty per pack","value":"3"}]}),
  p("Bits TX10 1/4\" x 90mm, 3-pak, impact", 108034, "bits-screwdrivers", {code:"33011415", tags:["bits-screwdrivers"], unit:"Pack", badges:["POPULAR"], specs:[{"label":"Drive size","value":"TX10"},{"label":"Length mm","value":"90"},{"label":"Qty per pack","value":"3"}]}),
  p("Bits Hex 4 1/4\" x 90mm, 3-pak, impact", 108059, "bits-screwdrivers", {code:"33011421", tags:["bits-screwdrivers"], unit:"Pack", specs:[{"label":"Drive size","value":"HEX 4"},{"label":"Length mm","value":"90"},{"label":"Qty per pack","value":"3"}]}),
  p("Bit set impact with clips, 22 pcs", 108074, "bits-screwdrivers", {code:"33011425", tags:["bits-screwdrivers"], badges:["POPULAR"], specs:[{"label":"Contents","value":"22 pcs"}]}),
  p("Bit holder IMPACT 1/4\" x 65mm with C-ring", 143395, "bits-screwdrivers", {code:"33011808", tags:["bits-screwdrivers"], specs:[{"label":"External dimension mm","value":"1/4\""},{"label":"Length mm","value":"65"}]}),
  p("Magnetic socket set impact 7-8-10-11-13 mm-1/4\"", 161168, "bits-screwdrivers", {code:"33011851", tags:["bits-screwdrivers"], unit:"Set", specs:[{"label":"Contents","value":"5"},{"label":"Code","value":"102-074"}]}),
  p("Magnetic socket impact 5,5 mm x 1/4\"", 161217, "bits-screwdrivers", {code:"33011852", tags:["bits-screwdrivers"], badges:["POPULAR"], specs:[{"label":"Drive size","value":"5,5"},{"label":"Qty per pack","value":"1"},{"label":"Code","value":"102-075"}]}),
  p("Socket holder set impact 1/4\"-3/8\"-1/2\" with sekskant and udv. firk", 161166, "bits-screwdrivers", {code:"33011860", tags:["bits-screwdrivers"], unit:"Set", specs:[{"label":"Qty per pack","value":"3"},{"label":"Code","value":"102-083"}]}),
  p("Socket holder impact with 1/4\" sekskant and 1/4\" udv.", 161329, "bits-screwdrivers", {code:"33011861", tags:["bits-screwdrivers"], badges:["POPULAR"], specs:[{"label":"External dimension mm","value":"1/4\""},{"label":"Qty per pack","value":"1"},{"label":"Code","value":"102-084"}]}),
  p("Socket holder impact with 1/4\" sekskant and 3/8\" udv.", 161165, "bits-screwdrivers", {code:"33011862", tags:["bits-screwdrivers"], badges:["POPULAR"], specs:[{"label":"External dimension mm","value":"3/8\""},{"label":"Qty per pack","value":"1"},{"label":"Code","value":"102-085"}]}),
  p("Socket holder impact with 1/4\" sekskant and 1/2\" udv.", 161330, "bits-screwdrivers", {code:"33011863", tags:["bits-screwdrivers"], badges:["POPULAR"], specs:[{"label":"External dimension mm","value":"1/2\""},{"label":"Qty per pack","value":"1"},{"label":"Code","value":"102-086"}]}),
  p("Bit set impact, 37 pcs", 191154, "bits-screwdrivers", {code:"33012023", tags:["bits-screwdrivers"], unit:"Set", specs:[{"label":"Contents","value":"37 pcs"},{"label":"Code","value":"102-520"}]}),
  p("Folding knife", 51344, "knives", {code:"34000140", tags:["knives"], specs:[{"label":"Type","value":"Folding"},{"label":"Contents","value":"1"}]}),
  p("Multi-tool 14 pcs", 52967, "knives", {code:"34000141", tags:["knives"], specs:[{"label":"Contents","value":"14 pcs"},{"label":"Code","value":"100-201"}]}),
  p("Knife blades 18 mm x 10 pcs", 53074, "knives", {code:"34009010", tags:["knives"], unit:"Pack", badges:["VALUE"], specs:[{"label":"Width mm","value":"18"},{"label":"Qty per pack","value":"10"}]}),
  p("Knife blades 25 mm x 10 pcs", 53071, "knives", {code:"34009012", tags:["knives"], unit:"Pack", badges:["VALUE","POPULAR"], specs:[{"label":"Width mm","value":"25"},{"label":"Qty per pack","value":"10"}]}),
  p("Knife blades, Black 9 mm x 10 pcs", 53077, "knives", {code:"34009013", tags:["knives"], badges:["POPULAR"], specs:[{"label":"Width mm","value":"9"},{"label":"Qty per pack","value":"10"}]}),
  p("Knife blades, Black 18 mm x 10 pcs", 53073, "knives", {code:"34009014", tags:["knives"], badges:["POPULAR"], specs:[{"label":"Width mm","value":"18"},{"label":"Qty per pack","value":"10"}]}),
  p("Knife blades, Black 25 mm x 10 pcs", 53068, "knives", {code:"34009016", tags:["knives"], unit:"SB card", specs:[{"label":"Width mm","value":"25"},{"label":"Qty per pack","value":"10"}]}),
  p("Knife blade Black 1992 reversible x 10 pcs", 53067, "knives", {code:"34009017", tags:["knives"], badges:["VALUE","POPULAR"], specs:[{"label":"Width mm","value":"61"},{"label":"Qty per pack","value":"10"},{"label":"Thickness mm","value":"0.6"},{"label":"Code","value":"1992"}]}),
  p("Knife Black 9 mm with auto-lock", 53070, "knives", {code:"34009019", tags:["knives"], badges:["VALUE","POPULAR"], specs:[{"label":"Blade width mm","value":"9"}]}),
  p("Knife Black 18 mm with auto-lock", 53080, "knives", {code:"34009020", tags:["knives"], badges:["VALUE"], specs:[{"label":"Blade width mm","value":"18"}]}),
  p("Knife Black 25 mm with auto-lock", 53081, "knives", {code:"34009021", tags:["knives"], badges:["VALUE","POPULAR"], specs:[{"label":"Blade width mm","value":"25"}]}),
  p("Knife Black 18 mm with wheel lock", 53072, "knives", {code:"34009022", tags:["knives"], badges:["VALUE","POPULAR"], specs:[{"label":"Blade width mm","value":"18"}]}),
  p("Knife Black 18 mm. with aluminium handle", 53076, "knives", {code:"34009023", tags:["knives"], badges:["POPULAR"], specs:[{"label":"Blade width mm","value":"18"}]}),
  p("Knife Black 25 mm with wheel lock", 53078, "knives", {code:"34009024", tags:["knives"], badges:["VALUE","POPULAR"], specs:[{"label":"Blade width mm","value":"25"}]}),
  p("Knife 18 mm with screw and hook", 69855, "knives", {code:"34011307", tags:["knives"], specs:[{"label":"Blade width mm","value":"18"},{"label":"Length mm","value":"160"},{"label":"Code","value":"100-715"}]}),
  p("Knife blade ceramic 18mm, x 5 pcs", 102307, "knives", {code:"34011423", tags:["knives"], unit:"Pack", badges:["POPULAR"], specs:[{"label":"Width mm","value":"18"},{"label":"Qty per pack","value":"5"},{"label":"Code","value":"101-065"}]}),
  p("Knife blade ceramic 25mm, x 5 pcs", 102303, "knives", {code:"34011424", tags:["knives"], unit:"Pack", specs:[{"label":"Width mm","value":"25"},{"label":"Qty per pack","value":"5"},{"label":"Code","value":"101-066"}]}),
  p("Knife blade ceramic 1992, x 5 pcs", 102320, "knives", {code:"34011425", tags:["knives"], unit:"Pack", specs:[{"label":"Qty per pack","value":"5"},{"label":"Code","value":"101-067"}]}),
  p("Circular saw blade Ø136x1,5x20mm Z18WF Wood", 124579, "circular-saw-blades", {code:"34011570", tags:["circular-saw-blades"], badges:["POPULAR"], specs:[{"label":"Blade diameter mm","value":"136"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"1.5"},{"label":"Teeth","value":"18"},{"label":"Rake angle","value":"20°"}]}),
  p("Circular saw blade Ø160x1,8x20mm Z42W Wood", 109974, "circular-saw-blades", {code:"34011573", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"1.8"},{"label":"Teeth","value":"42"},{"label":"Rake angle","value":"16°"}]}),
  p("Circular saw blade Ø160x1,8x20mm Z52NEG Laminate", 124586, "circular-saw-blades", {code:"34011574", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"1.8"},{"label":"Teeth","value":"52"},{"label":"Rake angle","value":"-6°"}]}),
  p("Circular saw blade Ø160x1,8x20mm Z52NEG Alu", 124590, "circular-saw-blades", {code:"34011575", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"1.8"},{"label":"Teeth","value":"52"},{"label":"Rake angle","value":"-6°"}]}),
  p("Circular saw blade Ø160x2,2x20mm Z24W Wood", 109985, "circular-saw-blades", {code:"34011576", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"2.2"},{"label":"Teeth","value":"24"},{"label":"Rake angle","value":"15°"}]}),
  p("Circular saw blade Ø160x2,2x20mm Z40W Wood", 110002, "circular-saw-blades", {code:"34011577", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"2.2"},{"label":"Teeth","value":"40"},{"label":"Rake angle","value":"10°"}]}),
  p("Circular saw blade Ø160x2,2x20mm Z48NEG Laminate", 110011, "circular-saw-blades", {code:"34011580", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"2.2"},{"label":"Teeth","value":"48"},{"label":"Rake angle","value":"-6°"}]}),
  p("Circular saw blade Ø160x2,2x20mm Z56NEG Alu", 110019, "circular-saw-blades", {code:"34011581", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"2.2"},{"label":"Teeth","value":"56"},{"label":"Rake angle","value":"-6°"}]}),
  p("Circular saw blade Ø160x2,0x20mm Z30 Steel", 124546, "circular-saw-blades", {code:"34011582", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"2.2"},{"label":"Teeth","value":"30"},{"label":"Rake angle","value":"0°"}]}),
  p("Circular saw blade Ø160x2,2x20mm Z10 for eternit, fibre cement mm", 124558, "circular-saw-blades", {code:"34011583", tags:["circular-saw-blades"], badges:["POPULAR"], specs:[{"label":"Blade diameter mm","value":"160"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"2.2"},{"label":"Teeth","value":"10"},{"label":"Rake angle","value":"5°"}]}),
  p("Circular saw blade Ø216x1,8x30mm Z24NEG Wood", 124550, "circular-saw-blades", {code:"34011588", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"216"},{"label":"Bore diameter mm","value":"30"},{"label":"Kerf width mm","value":"1.8"},{"label":"Teeth","value":"24"},{"label":"Rake angle","value":"-5°"}]}),
  p("Circular saw blade Ø216x1,8x30mm Z48NEG Wood", 110007, "circular-saw-blades", {code:"34011589", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"216"},{"label":"Bore diameter mm","value":"30"},{"label":"Kerf width mm","value":"1.8"},{"label":"Teeth","value":"48"},{"label":"Rake angle","value":"-5°"}]}),
  p("Circular saw blade Ø250x2,4x30mm Z40UW Wood", 124565, "circular-saw-blades", {code:"34011593", tags:["circular-saw-blades"], badges:["POPULAR"], specs:[{"label":"Blade diameter mm","value":"250"},{"label":"Bore diameter mm","value":"30"},{"label":"Kerf width mm","value":"2.4"},{"label":"Teeth","value":"40"},{"label":"Rake angle","value":"18°"}]}),
  p("Circular saw blade Ø250x2,4x30mm Z60KW Wood", 124562, "circular-saw-blades", {code:"34011594", tags:["circular-saw-blades"], badges:["POPULAR"], specs:[{"label":"Blade diameter mm","value":"250"},{"label":"Bore diameter mm","value":"30"},{"label":"Kerf width mm","value":"2.4"},{"label":"Teeth","value":"60"}]}),
  p("Circular saw blade demolition Ø135x20mm, Z18", 161209, "circular-saw-blades", {code:"34011824", tags:["circular-saw-blades"], specs:[{"label":"Blade diameter mm","value":"135"},{"label":"Bore diameter mm","value":"20"},{"label":"Teeth","value":"18"},{"label":"Code","value":"102-159"}]}),
  p("Circular saw blade Ø165x1,7x20mm Z48WF Wood", 171900, "circular-saw-blades", {code:"34011854", tags:["circular-saw-blades"], badges:["POPULAR"], specs:[{"label":"Blade diameter mm","value":"165"},{"label":"Bore diameter mm","value":"20"},{"label":"Kerf width mm","value":"1,7"},{"label":"Teeth","value":"48"},{"label":"Code","value":"102-387"}]}),
  p("Multi-tool Superb", 190395, "knives", {code:"34011890", tags:["knives"], specs:[{"label":"Code","value":"102-514"}]}),
  p("Folding knife RS with wood handle", 190466, "knives", {code:"34011891", tags:["knives"], specs:[{"label":"Code","value":"102-515"}]}),
  p("Safety knife with auto-retracting blade", 201475, "knives", {code:"34011922", tags:["knives"], badges:["CAMPAIGN"], specs:[{"label":"Code","value":"102-763"}]}),
  p("Edge trimmer for forkantliste", 201461, "knives", {code:"34011933", tags:["knives"], badges:["POPULAR"], specs:[{"label":"Code","value":"102-753"}]}),
  p("Blade set for edge trimmer", 201463, "knives", {code:"34011934", tags:["knives"], unit:"Set", specs:[{"label":"Contents","value":"1"},{"label":"Code","value":"102-754"}]}),
  p("Knife retractable for 1992 blade", 105269, "knives", {code:"34285215", tags:["knives"], specs:[{"label":"Blade width mm","value":"18"},{"label":"Length mm","value":"169"},{"label":"Code","value":"STROXX"}]}),
  p("Knife for 1992 blade with magazine and strap cutter", 51617, "knives", {code:"34285218", tags:["knives"], badges:["VALUE"], specs:[{"label":"Blade width mm","value":"18"},{"label":"Length mm","value":"169"},{"label":"Code","value":"STROXX"}]}),
  p("Knife 18 mm with screw and hook +skede+blade", 37618, "knives", {code:"34285250", tags:["knives"], badges:["VALUE","POPULAR"], specs:[{"label":"Blade width mm","value":"18"},{"label":"Length mm","value":"178"},{"label":"Code","value":"STROXX"}]}),
  p("Tripod for 3D laser. 1,5 mtr.", 73724, "lasers", {code:"35000024", tags:["lasers","measuring-tools"], specs:[{"label":"Max. height cm","value":"150"},{"label":"Min. height cm","value":"65"},{"label":"Code","value":"100-402"}]}),
  p("Spirit level 30 cm", 48124, "measuring-tools", {code:"35000094", tags:["measuring-tools"], specs:[{"label":"Length mm","value":"300"},{"label":"Height mm","value":"22"},{"label":"Width mm","value":"48"},{"label":"Number of vials","value":"3"},{"label":"Code","value":"100-442"}]}),
  p("Spirit level set 60-120-200 cm", 105274, "measuring-tools", {code:"35000104", tags:["measuring-tools"], unit:"Set", badges:["VALUE"], specs:[{"label":"Length mm","value":"600/1200/2000"},{"label":"Height mm","value":"22"},{"label":"Width mm","value":"48"},{"label":"Number of vials","value":"3"},{"label":"Code","value":"100-452"}]}),
  p("Spirit level Magnetic 40 cm", 105280, "measuring-tools", {code:"35000105", tags:["measuring-tools"], specs:[{"label":"Length mm","value":"400"},{"label":"Height mm","value":"22"},{"label":"Width mm","value":"48"},{"label":"Number of vials","value":"3"},{"label":"Code","value":"100-453"}]}),
  p("Tripod stand 1,6 mtr.", 139961, "lasers", {code:"35008533", tags:["lasers","measuring-tools"], specs:[{"label":"Max. height cm","value":"160"}]}),
  p("Laser staff 2,4 mtr.", 51347, "lasers", {code:"35008534", tags:["lasers","measuring-tools"], specs:[{"label":"Length cm","value":"240"}]}),
  p("Batteri 3,7V Li-Ion for STROXX line laser", 159929, "lasers", {code:"35011326", tags:["lasers"], badges:["POPULAR"], specs:[{"label":"Code","value":"BALI-3.7V(B"}]}),
  p("Receiver for line laser 3D Green Compact laser", 102384, "lasers", {code:"35011373", tags:["lasers","measuring-tools"], badges:["OUTLET"], specs:[{"label":"Accuracy","value":"±1 mm / 10 m."},{"label":"Code","value":"101-126"}]}),
  p("Receiver for line laser 3D Green Motorized laser", 102389, "lasers", {code:"35011374", tags:["lasers","measuring-tools"], badges:["OUTLET"], specs:[{"label":"Accuracy","value":"±1 mm / 10 m"},{"label":"Code","value":"101-127"}]}),
  p("Charger for line laser 3D Green Atom Compact laser", 102393, "lasers", {code:"35011375", tags:["lasers"], specs:[{"label":"Length mm","value":"800"},{"label":"Code","value":"101-128"}]}),
  p("Batteri for line laser 3D Green Motorized", 102409, "lasers", {code:"35011378", tags:["lasers"], specs:[{"label":"Code","value":"101-131"}]}),
  p("Vacuum extractor for cross/line laser and drill dust", 130353, "lasers", {code:"35011417", tags:["lasers","measuring-tools"], specs:[{"label":"Code","value":"101-215"}]}),
  p("Rotary laser red", 114346, "lasers", {code:"35011418", tags:["lasers","measuring-tools"], specs:[{"label":"Accuracy","value":"±20\" (1 mm / 10 m)"},{"label":"Range m / receiver box m","value":"200"},{"label":"Code","value":"101-132"}]}),
  p("Tripod stand Heavy duty 1,6 m", 131603, "lasers", {code:"35011419", tags:["lasers","measuring-tools"], badges:["OUTLET"], specs:[{"label":"Code","value":"101-133"}]}),
  p("Laser staff 2,4 m", 117107, "lasers", {code:"35011420", tags:["lasers","measuring-tools"], badges:["OUTLET"], specs:[{"label":"Code","value":"101-134"}]}),
  p("Receiver heavy duty with millimetre", 143444, "lasers", {code:"35011421", tags:["lasers","measuring-tools"], specs:[{"label":"Code","value":"101-135"}]}),
  p("Spirit level Digital 25 cm", 108221, "measuring-tools", {code:"35011495", tags:["measuring-tools"], badges:["POPULAR"], specs:[{"label":"Length mm","value":"250"},{"label":"Number of vials","value":"2"},{"label":"Code","value":"101-313"}]}),
  p("Spirit level Digital 60 cm", 108228, "measuring-tools", {code:"35011496", tags:["measuring-tools"], specs:[{"label":"Length mm","value":"600"},{"label":"Number of vials","value":"2"},{"label":"Code","value":"101-314"}]}),
  p("Spirit level EXACTA 40 cm", 130638, "measuring-tools", {code:"35011685", tags:["measuring-tools"], specs:[{"label":"Length mm","value":"400"},{"label":"Height mm","value":"60"},{"label":"Width mm","value":"24"},{"label":"Number of vials","value":"3"},{"label":"Code","value":"101-375"}]}),
  p("Spirit level silver anodised 30cm", 129244, "measuring-tools", {code:"35011781", tags:["measuring-tools"], badges:["POPULAR"], specs:[{"label":"Length mm","value":"300"},{"label":"Number of vials","value":"3"}]}),
  p("Spirit level set silver anodised 60/120/200cm", 129261, "measuring-tools", {code:"35011788", tags:["measuring-tools"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Length mm","value":"600/1200/2000"}]}),
  p("Torpedo level 250 mm", 134353, "measuring-tools", {code:"35011812", tags:["measuring-tools"], badges:["POPULAR"], specs:[{"label":"Length mm","value":"250"},{"label":"Number of vials","value":"2"}]}),
  p("Speed square 175mm", 161224, "measuring-tools", {code:"35011846", tags:["measuring-tools"], badges:["VALUE"], specs:[{"label":"Length mm","value":"175"},{"label":"Code","value":"102-184"}]}),
  p("Receiver 60 m for laser", 169454, "lasers", {code:"35011848", tags:["lasers","measuring-tools"], badges:["POPULAR"], specs:[{"label":"Accuracy","value":"±1 mm"}]}),
  p("Laser distance meter 102-186 rechargeable, 50 mtr", 159147, "lasers", {code:"35011907", tags:["lasers","measuring-tools"], badges:["VALUE"], specs:[{"label":"Range m","value":"50"},{"label":"Accuracy","value":"±2mm"},{"label":"Code","value":"102-186"}]}),
  p("Cross-line laser 102-187 green rechargeable", 159146, "lasers", {code:"35011908", tags:["lasers","measuring-tools"], specs:[{"label":"Accuracy","value":"±3mm/10m"},{"label":"Code","value":"102-187"}]}),
  p("Batteri for cross-line laser 102-187", 169429, "lasers", {code:"35011909", tags:["lasers"], specs:[{"label":"Code","value":"102-189"}]}),
  p("Line laser 3D Green", 169234, "lasers", {code:"35011932", tags:["lasers","measuring-tools"], badges:["POPULAR"], specs:[{"label":"Accuracy","value":"±1.5 mm / 5 m"},{"label":"Range m","value":"40"},{"label":"Range m / receiver box m","value":"70"},{"label":"Code","value":"102-405"}]}),
  p("Batteri 3500 mAh for line laser 102-405", 204779, "lasers", {code:"35011933", tags:["lasers"], specs:[{"label":"Code","value":"102-406"}]}),
  p("Carry case for line laser 102-405", 204774, "lasers", {code:"35011934", tags:["lasers","measuring-tools"], specs:[{"label":"Code","value":"102-407"}]}),
  p("Target plate for line laser green", 204778, "lasers", {code:"35011937", tags:["lasers"], badges:["POPULAR"], specs:[{"label":"Code","value":"102-410"}]}),
  p("Line laser 3D Green Floor", 169241, "lasers", {code:"35011938", tags:["lasers","measuring-tools"], badges:["VALUE","POPULAR"], specs:[{"label":"Code","value":"102-411"}]}),
  p("Batteri 2600mAh for line laser for 102-411", 204786, "lasers", {code:"35011939", tags:["lasers","measuring-tools"], specs:[{"label":"Code","value":"102-412"}]}),
  p("Carry case for 102-411", 204765, "lasers", {code:"35011940", tags:["lasers"], specs:[{"label":"Code","value":"102-413"}]}),
  p("Elevation base for line lasere", 204781, "lasers", {code:"35011941", tags:["lasers"], specs:[{"label":"Code","value":"102-414"}]}),
  p("Rotating base with fine adjustment & 1/4\" gevind", 204767, "lasers", {code:"35011943", tags:["lasers"], specs:[{"label":"Code","value":"102-417"}]}),
  p("Laser set with 3 lasere and skinne 2 m", 170576, "lasers", {code:"35011958", tags:["lasers","measuring-tools"], unit:"Set", specs:[{"label":"Code","value":"Laser set"}]}),
  p("Receiver Universal 60 m for laser", 169229, "lasers", {code:"35011992", tags:["lasers"], specs:[{"label":"Accuracy","value":"±1 mm / 10 m"},{"label":"Length cm","value":"6000"},{"label":"Code","value":"102-321"}]}),
  p("Line laser 3D Green and trefod 1,5 m", 192863, "lasers", {code:"35012024", tags:["lasers","measuring-tools"], unit:"Set", specs:[{"label":"Accuracy","value":"±1.5 mm / 10 m"},{"label":"Range m","value":"40"},{"label":"Range m / receiver box m","value":"70"},{"label":"Self-levelling range","value":"±5°"},{"label":"Code","value":"102-405+102-402"}]}),
  p("Receiver laser Red", 59485, "lasers", {code:"35987062", tags:["lasers","measuring-tools"], badges:["OUTLET","POPULAR"], specs:[{"label":"Length cm","value":"14,8"},{"label":"Material","value":"Plastic"}]}),
  p("Lock spray 100 ml", 59861, "chemicals", {code:"36000032", tags:["chemicals"], unit:"Can", badges:["VALUE"], specs:[{"label":"Contents","value":"100 ml"},{"label":"Code","value":"100-344"}]}),
  p("Lubricant Unique Oil with PTFE, 200ml", 59863, "chemicals", {code:"36000033", tags:["chemicals"], unit:"Can", badges:["VALUE"], specs:[{"label":"Contents","value":"200 ml"},{"label":"Code","value":"100-342"}]}),
  p("Drilling/cutting oil, kulsyre, 500 ml", 53360, "chemicals", {code:"36007713", tags:["chemicals"], unit:"Can", badges:["POPULAR"], specs:[{"label":"Contents","value":"500ml"},{"label":"Code","value":"100-709"}]}),
  p("Lock grease 100 ml", 113292, "chemicals", {code:"36012256", tags:["chemicals"], specs:[{"label":"Contents","value":"100"},{"label":"Code","value":"101-387"}]}),
  p("Cleaner Etiket Citrusrens, Kulsyre 500 ml", 148123, "chemicals", {code:"36012505", tags:["chemicals"], unit:"Can", badges:["VALUE"], specs:[{"label":"Contents","value":"500 ml"},{"label":"Code","value":"102-211"}]}),
  p("Foam cleaner universal spray 500 ml", 148125, "chemicals", {code:"36012506", tags:["chemicals"], unit:"Can", badges:["VALUE","POPULAR"], specs:[{"label":"Contents","value":"500 ml"},{"label":"Code","value":"102-212"}]}),
  p("Brush set silk-tip, 7 pcs", 51639, "painting-tools", {code:"37000050", tags:["painting-tools"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Width mm","value":"2x1.5\",2x2\",1x3\",1x2\",1x25mm"},{"label":"Code","value":"100-357"}]}),
  p("Wallpaper scraper stripper, blade: 100mm, length: 750-1250 mm", 65265, "painting-tools", {code:"37008998", tags:["painting-tools"], specs:[{"label":"Blade width mm","value":"100"},{"label":"Length mm","value":"1250"},{"label":"Qty per pack","value":"1"}]}),
  p("Blades for wallpaper scraper, 100mm, pack of 20 pcs", 65267, "painting-tools", {code:"37008999", tags:["painting-tools"], specs:[{"label":"Blade width mm","value":"100"},{"label":"Qty per pack","value":"20"},{"label":"Code","value":"K-712-LB"}]}),
  p("Round brush, wood handle, 18mm", 61778, "painting-tools", {code:"37009019", tags:["painting-tools"], specs:[{"label":"Width mm","value":"18"},{"label":"Code","value":"100-738"}]}),
  p("Oval brush, wood handle, 25mm", 61808, "painting-tools", {code:"37009022", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Width mm","value":"25"},{"label":"Code","value":"100-741"}]}),
  p("Oval brush, wood handle, 35mm", 61813, "painting-tools", {code:"37009023", tags:["painting-tools"], specs:[{"label":"Width mm","value":"35"},{"label":"Code","value":"100-742"}]}),
  p("Oval brush, wood handle, 45mm", 61819, "painting-tools", {code:"37009024", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Width mm","value":"45"},{"label":"Code","value":"100-743"}]}),
  p("Flat brush, wood handle, 35mm", 61821, "painting-tools", {code:"37009025", tags:["painting-tools"], specs:[{"label":"Width mm","value":"35"},{"label":"Code","value":"100-744"}]}),
  p("Flat brush, wood handle, 50mm", 61785, "painting-tools", {code:"37009026", tags:["painting-tools"], specs:[{"label":"Width mm","value":"50"},{"label":"Code","value":"100-745"}]}),
  p("Flat brush, wood handle, 70mm", 61780, "painting-tools", {code:"37009027", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Width mm","value":"70"},{"label":"Code","value":"100-746"}]}),
  p("Radiator brush, wood handle, 35mm", 61790, "painting-tools", {code:"37009028", tags:["painting-tools"], specs:[{"label":"Width mm","value":"35"},{"label":"Code","value":"100-747"}]}),
  p("Radiator brush, wood handle, 50mm", 61787, "painting-tools", {code:"37009029", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Width mm","value":"50"},{"label":"Code","value":"100-748"}]}),
  p("Radiator brush, long, wood handle, 50mm", 61792, "painting-tools", {code:"37009030", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Width mm","value":"50"},{"label":"Code","value":"100-749"}]}),
  p("Radiator brush, long, wood handle, 70mm", 61782, "painting-tools", {code:"37009031", tags:["painting-tools"], specs:[{"label":"Width mm","value":"70"},{"label":"Code","value":"100-750"}]}),
  p("Scraper blade 39x19x0,25mm, x 10 pcs", 72531, "painting-tools", {code:"37010891", tags:["painting-tools"], unit:"Pack", specs:[{"label":"Blade width mm","value":"19"},{"label":"Length mm","value":"39"},{"label":"Qty per pack","value":"10"},{"label":"Code","value":"101-119"}]}),
  p("Wallpaper scraper 390mm", 118824, "painting-tools", {code:"37011346", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Length mm","value":"390"},{"label":"Code","value":"101-383"}]}),
  p("Knife blades for wallpaper scraper 100mm, pack of 10 pcs.", 114874, "painting-tools", {code:"37011348", tags:["painting-tools"], unit:"Pack", badges:["POPULAR"], specs:[{"label":"Length mm","value":"100"},{"label":"Qty per pack","value":"10"},{"label":"Code","value":"101-385"}]}),
  p("Brush set non-drop 3 pcs", 40140, "chemicals", {code:"37644301", tags:["chemicals","painting-tools"], unit:"Bag", badges:["VALUE","POPULAR"], specs:[{"label":"Width mm","value":"35 - 50 -100"},{"label":"Code","value":"100-136"}]}),
  p("Touch-up brush 12mm, pack of 10 pcs", 40157, "chemicals", {code:"37671011", tags:["chemicals","painting-tools"], unit:"Bag", badges:["POPULAR"], specs:[{"label":"Width mm","value":"12"},{"label":"Code","value":"100-138"}]}),
  p("Battery adapter for 18V Bosch", 102420, "lighting", {code:"39011913", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"For","value":"Bosch 18V"},{"label":"Code","value":"100-944"}]}),
  p("Battery adapter for 18V Festool", 131232, "lighting", {code:"39012540", tags:["lighting"], specs:[{"label":"For","value":"Festool 18V"},{"label":"Code","value":"101-269"}]}),
  p("Adapter for Bosch", 130315, "lighting", {code:"39013535", tags:["lighting"], specs:[{"label":"For","value":"Bosch"},{"label":"Code","value":"101-444"}]}),
  p("Adapter for DeWALT and Milwaukee", 130331, "lighting", {code:"39013536", tags:["lighting"], specs:[{"label":"For","value":"DeWALT and Millwaukee"},{"label":"Code","value":"101-445"}]}),
  p("Adapter for Makita", 130340, "lighting", {code:"39013537", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"For","value":"Makita"},{"label":"Code","value":"101-446"}]}),
  p("Multi-cutter blade SL AIZ32EPC 32x50mm HCS/std GOP 1 pcs", 116930, "multi-cutter-blades", {code:"39013585", tags:["multi-cutter-blades"], specs:[{"label":"Tooth pitch","value":"1,4"},{"label":"Length mm","value":"50"},{"label":"Width mm","value":"32"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Multi-cutter blade SL AII65BSPB 65x40mm BIM/Japanese GOP 1 pcs", 131591, "multi-cutter-blades", {code:"39013586", tags:["multi-cutter-blades"], specs:[{"label":"Tooth pitch","value":"1,8"},{"label":"Length mm","value":"40"},{"label":"Width mm","value":"65"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Multi-cutter blade SL AIZ32BSPB 32x50mm BIM/Japanese GOP 1 pcs", 116903, "multi-cutter-blades", {code:"39013587", tags:["multi-cutter-blades"], specs:[{"label":"Tooth pitch","value":"1,8"},{"label":"Length mm","value":"50"},{"label":"Width mm","value":"32"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Multi-cutter blade SL AII65APB 65x40mm BIM/univ GOP 1 pcs", 116897, "multi-cutter-blades", {code:"39013588", tags:["multi-cutter-blades"], specs:[{"label":"Tooth pitch","value":"1,3"},{"label":"Length mm","value":"40"},{"label":"Width mm","value":"65"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Multi-cutter blade SL AIZ32APB 32x50mm BIM/univ GOP 1 pcs", 116912, "multi-cutter-blades", {code:"39013589", tags:["multi-cutter-blades"], specs:[{"label":"Tooth pitch","value":"1,3"},{"label":"Length mm","value":"50"},{"label":"Width mm","value":"32"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Multi-cutter blade SL AIZ32AT 32x40mm metalmax, 1 pcs", 116933, "multi-cutter-blades", {code:"39013590", tags:["multi-cutter-blades"], specs:[{"label":"Length mm","value":"40"},{"label":"Width mm","value":"32"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"},{"label":"For","value":"Steel, Stainless steel"}]}),
  p("Multi-cutter blade SL AII65APC 65x40mm HCS/std GOP 1 pcs", 116943, "multi-cutter-blades", {code:"39013591", tags:["multi-cutter-blades"], specs:[{"label":"Tooth pitch","value":"1,3"},{"label":"Length mm","value":"40"},{"label":"Width mm","value":"65"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Multi-cutter blade SL AII65BSPC 65x40mm HCS/Japanese GOP 1 pcs", 131401, "multi-cutter-blades", {code:"39013592", tags:["multi-cutter-blades"], badges:["POPULAR"], specs:[{"label":"Tooth pitch","value":"1,8"},{"label":"Length mm","value":"40"},{"label":"Width mm","value":"65"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Multi-cutter blade SL AIZ32AB 32x50mm BIM/univ GOP 1 pcs", 131606, "multi-cutter-blades", {code:"39013593", tags:["multi-cutter-blades"], specs:[{"label":"Tooth pitch","value":"1,3"},{"label":"Length mm","value":"50"},{"label":"Width mm","value":"32"},{"label":"Mount","value":"Starlock"},{"label":"Qty per pack","value":"1"}]}),
  p("Long plate set Smart Lock ST-2 RS XLOCK for Scandinavian lock", 164833, "access-control", {code:"40013214", tags:["access-control"], unit:"Set", specs:[{"label":"Finish","value":"Stainless steel A2 brushed"},{"label":"Width mm","value":"39"},{"label":"Height mm","value":"310"},{"label":"Thickness mm","value":"23"},{"label":"Door thickness mm","value":"35-85"}]}),
  p("Long plate set Smart Lock ST-2 black XLOCK for Scandinavian lock", 164835, "access-control", {code:"40013215", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Finish","value":"Black"},{"label":"Width mm","value":"39"},{"label":"Height mm","value":"310"},{"label":"Thickness mm","value":"23"},{"label":"Door thickness mm","value":"35-85"}]}),
  p("Long plate set Smart Lock ST-2 RS XLOCK for European lock", 164832, "access-control", {code:"40013216", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Finish","value":"Stainless steel A2 brushed"},{"label":"Width mm","value":"39"},{"label":"Height mm","value":"310"},{"label":"Thickness mm","value":"23"},{"label":"Door thickness mm","value":"35-85"}]}),
  p("Long plate set Smart Lock ST-2 black XLOCK for European lock", 164834, "access-control", {code:"40013217", tags:["access-control"], unit:"Set", specs:[{"label":"Finish","value":"Black"},{"label":"Width mm","value":"39"},{"label":"Height mm","value":"310"},{"label":"Thickness mm","value":"23"},{"label":"Door thickness mm","value":"35-85"}]}),
  p("Cover plates RS 53x325mm for Smart Lock ST-2 for Scandinavian lock", 187466, "access-control", {code:"40013776", tags:["access-control"], unit:"Set", specs:[{"label":"For","value":"Smartlock ST-2"},{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-231"}]}),
  p("Cover plates black 53x325mm for Smart Lock ST-2 for Scandinavian lock", 187468, "access-control", {code:"40013777", tags:["access-control"], unit:"Set", specs:[{"label":"For","value":"Smartlock ST-2"},{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-232"}]}),
  p("Cover plates RS 60x385mm for Smart Lock ST-2 for Scandinavian lock", 187481, "access-control", {code:"40013780", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"For","value":"Smartlock ST-2"},{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-235"}]}),
  p("Key fob black Mifare Classic 1K RFID", 158423, "access-control", {code:"40013912", tags:["access-control"], specs:[{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-425"}]}),
  p("Gateway Smart Lock G3P, white (XLOCK) kablet LAN-forbindelse", 158435, "access-control", {code:"40013926", tags:["access-control"], badges:["POPULAR"], specs:[{"label":"Type","value":"Smartlock"},{"label":"Code","value":"102-219"}]}),
  p("Cylinder oval Smart Lock ST-10 rsl XLOCK", 167568, "access-control", {code:"40013933", tags:["access-control"], specs:[{"label":"Finish","value":"Stainless steel look"},{"label":"Length mm","value":"32.5"},{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-314"}]}),
  p("Padlock Smart Lock ST-13 rsl XLOCK", 167603, "access-control", {code:"40013936", tags:["access-control"], badges:["POPULAR"], specs:[{"label":"Finish","value":"Stainless steel look"},{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-317"}]}),
  p("Remote control board Smart Lock integration with XLOCK", 170577, "access-control", {code:"40013953", tags:["access-control"], specs:[{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"}]}),
  p("Circuit board Smart Lock incl. relay with XLOCK/TTLock", 170579, "access-control", {code:"40013954", tags:["access-control"], badges:["POPULAR"], specs:[{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"}]}),
  p("Gateway Smart Lock G2 white XLOCK WIFI", 163201, "access-control", {code:"40013955", tags:["access-control"], specs:[{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-452"}]}),
  p("Wall reader Smart Lock with face scanner XLOCK", 168844, "access-control", {code:"40013957", tags:["access-control"], specs:[{"label":"Type","value":"Smartlock"},{"label":"Series","value":"Smartlock"},{"label":"Code","value":"102-454"}]}),
  p("Door handle Smart Lock ST-15 black cc38 XLOCK", 170570, "access-control", {code:"40013975", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Centre distance mm","value":"38"}]}),
  p("Code handle Smart Lock silver ST-18", 236556, "access-control", {code:"40014045", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Finish","value":"Silver"},{"label":"Code","value":"102-510"}]}),
  p("Cylinder Smart Lock ST-12 euro dobb. Brass XLOCK", 172324, "access-control", {code:"40014067", tags:["access-control"], specs:[{"label":"Finish","value":"Brass"},{"label":"Length mm","value":"65"},{"label":"Type","value":"Smartlock"},{"label":"Code","value":"102-323"}]}),
  p("Cover plates RS 53x325xmm for Smart Lock ST-2/Euro, set x 2 pcs", 190173, "access-control", {code:"40014077", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"For","value":"Smart Lock ST-2"},{"label":"Type","value":"Euro"},{"label":"Code","value":"102-562"}]}),
  p("Long plate set Smart Lock ST-3 stainless for oval cylinder", 241405, "access-control", {code:"40014135", tags:["access-control"], badges:["POPULAR"], specs:[{"label":"Finish","value":"Stainless steel A2"},{"label":"For","value":"Oval cylinder"},{"label":"Series","value":"Smart Lock"},{"label":"Code","value":"102-676"}]}),
  p("Long plate set Smart Lock ST-3 black for oval cylinder", 265031, "access-control", {code:"40014136", tags:["access-control"], specs:[{"label":"Finish","value":"Black"},{"label":"For","value":"Oval cylinder"},{"label":"Series","value":"Smart Lock"},{"label":"Code","value":"102-677"}]}),
  p("Long plate set Smart Lock ST-3 stainless without cylinder hole", 265024, "access-control", {code:"40014137", tags:["access-control"], specs:[{"label":"Finish","value":"Stainless steel A2"},{"label":"Series","value":"Smart Lock"},{"label":"Code","value":"102-678"}]}),
  p("Long plate set Smart Lock ST-3 black without cylinder hole", 241409, "access-control", {code:"40014138", tags:["access-control"], specs:[{"label":"Finish","value":"Black"},{"label":"Series","value":"Smart Lock"},{"label":"Code","value":"102-679"}]}),
  p("Wireless keypad ST-21 Smart Lock with card reader & XLOCK", 197843, "access-control", {code:"40014160", tags:["access-control"], specs:[{"label":"Code","value":"102-755"}]}),
  p("Nylon bushing for long plate", 195165, "access-control", {code:"40014225", tags:["access-control"], badges:["POPULAR"], specs:[{"label":"Dimension mm","value":"Inner Ø16"},{"label":"Code","value":"Nylon bushing"}]}),
  p("Long plate set Smart Lock ST-2 mess XLOCK for Scandinavian lock", 232686, "access-control", {code:"40014321", tags:["access-control"], unit:"Set", specs:[{"label":"Finish","value":"Brushed brass"},{"label":"Width mm","value":"39"},{"label":"Height mm","value":"310"},{"label":"Thickness mm","value":"23"},{"label":"Door thickness mm","value":"35-85"}]}),
  p("Long plate set Smart Lock ST-2 brass XLOCK for European lock", 232688, "access-control", {code:"40014322", tags:["access-control"], unit:"Set", specs:[{"label":"Finish","value":"Brushed brass"},{"label":"Width mm","value":"39"},{"label":"Height mm","value":"310"},{"label":"Thickness mm","value":"23"},{"label":"Door thickness mm","value":"35-85"}]}),
  p("Long plate set Smart Lock ST-2 RS for Scandinavian lock, with knob", 242805, "access-control", {code:"40014387", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"Finish","value":"Stainless steel A2"},{"label":"Width mm","value":"39"},{"label":"Height mm","value":"310"},{"label":"Thickness mm","value":"23"},{"label":"Door thickness mm","value":"35-85"}]}),
  p("Cover plates mess 53x315,5mm for Smart Lock ST-2", 243094, "access-control", {code:"40014993", tags:["access-control"], unit:"Set", badges:["POPULAR"], specs:[{"label":"For","value":"ST-2"},{"label":"Type","value":"Brass"},{"label":"Series","value":"Smart Lock"}]}),
  p("Espagnolette handle Smart Lock silver V ST-17", 236550, "access-control", {code:"41012157", tags:["access-control"], specs:[{"label":"For","value":"Left"}]}),
  p("Sealant gun for cartridges 300-MF-1 without piston rod", 50667, "sealant", {code:"49000225", tags:["sealant"], specs:[{"label":"For","value":"Cartridges"},{"label":"Code","value":"100-416"}]}),
  p("Sealant gun NBS", 51795, "sealant", {code:"49000276", tags:["sealant"], specs:[{"label":"For","value":"NBS"},{"label":"Code","value":"CY-028T"}]}),
  p("Sealant gun NBS one-hand", 51796, "sealant", {code:"49000277", tags:["sealant"], badges:["POPULAR"], specs:[{"label":"For","value":"NBS"},{"label":"Code","value":"CY-099T"}]}),
  p("Painter's tape, indoor, 50m x 19mm", 63846, "tape", {code:"49009035", tags:["tape"], unit:"Roll", badges:["VALUE"], specs:[{"label":"Length m","value":"50"},{"label":"Width mm","value":"19"},{"label":"Code","value":"100-729"}]}),
  p("Painter's tape, UV, outdoor, 50x 25mm", 63851, "chemicals", {code:"49009040", tags:["chemicals","tape"], unit:"Roll", badges:["VALUE","POPULAR"], specs:[{"label":"Length m","value":"50"},{"label":"Width mm","value":"25"},{"label":"Code","value":"100-734"}]}),
  p("Smoothing fluid 500 ml", 129522, "sealant", {code:"49010957", tags:["sealant"], unit:"Can", badges:["VALUE"], specs:[{"label":"Contents","value":"500 ml"},{"label":"Code","value":"101-138"}]}),
  p("Smoothing fluid 1 L", 74028, "chemicals", {code:"49011076", tags:["chemicals","sealant"], unit:"Jug", badges:["VALUE","POPULAR"], specs:[{"label":"Contents","value":"1 L"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"101-229"}]}),
  p("MS construction sealant white 290 ml", 96828, "chemicals", {code:"49011269", tags:["chemicals","sealant"], badges:["VALUE","POPULAR","ECO"], specs:[{"label":"Contents ml","value":"290"},{"label":"Packaging","value":"Patron"},{"label":"Colour","value":"White"},{"label":"DGNB indicator","value":"13"},{"label":"DGNB quality level","value":"4"}]}),
  p("MS construction sealant grey 600 ml", 96838, "chemicals", {code:"49011272", tags:["chemicals","sealant"], unit:"Bag", badges:["VALUE","POPULAR","ECO"], specs:[{"label":"Contents ml","value":"600"},{"label":"Packaging","value":"Pose"},{"label":"Colour","value":"Grey"},{"label":"DGNB indicator","value":"13"},{"label":"DGNB quality level","value":"4"}]}),
  p("Acrylic sealant Extra white 300 ml", 96805, "chemicals", {code:"49011273", tags:["chemicals","sealant"], unit:"Cartridge", badges:["VALUE","ECO"], specs:[{"label":"Contents ml","value":"300"},{"label":"Packaging","value":"Patron"},{"label":"Colour","value":"White"},{"label":"DGNB indicator","value":"12"},{"label":"DGNB quality level","value":"4"}]}),
  p("Woodlim outdoor D3 750 ml", 96809, "chemicals", {code:"49011274", tags:["chemicals"], unit:"Bottle", badges:["VALUE","POPULAR","ECO"], specs:[{"label":"Contents","value":"750 ml"},{"label":"Type","value":"D3"},{"label":"DGNB indicator","value":"8"},{"label":"DGNB quality level","value":"4"},{"label":"Code","value":"101-305"}]}),
  p("Assembly adhesive Extra white 290 ml", 96799, "chemicals", {code:"49011275", tags:["chemicals"], unit:"Cartridge", badges:["VALUE","ECO"], specs:[{"label":"Contents ml","value":"290"},{"label":"Colour","value":"White"},{"label":"DGNB indicator","value":"11"},{"label":"DGNB quality level","value":"4"}]}),
  p("All-season foam NBS 750 ml", 96821, "chemicals", {code:"49011277", tags:["chemicals","sealant"], unit:"Can", badges:["VALUE","ECO"], specs:[{"label":"For","value":"NBS"},{"label":"Contents","value":"750 ml"},{"label":"DGNB indicator","value":"38"},{"label":"Code","value":"101-308"}]}),
  p("Reflective tape fluorescent yellow 50mm x 5 m", 130473, "tape", {code:"49011504", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"5"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Fluorescent yellow"},{"label":"Code","value":"101-425"}]}),
  p("Reflective tape fluorescent red/white 50mm x 5 m", 130476, "tape", {code:"49011505", tags:["tape"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Length m","value":"5"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Red/white"},{"label":"Code","value":"101-426"}]}),
  p("Warning tape, yellow/black 50mm x 25m", 130486, "tape", {code:"49011506", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"25"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Yellow/black"},{"label":"Code","value":"101-428"}]}),
  p("Protective tape UV PE Foam for battens 1x70mm, 20 m", 130479, "chemicals", {code:"49011507", tags:["chemicals","tape"], unit:"Roll", badges:["CAMPAIGN","POPULAR"], specs:[{"label":"Length m","value":"20"},{"label":"Width mm","value":"70"},{"label":"Colour","value":"Black"},{"label":"Code","value":"101-429"}]}),
  p("Smoothing fluid clear for brug, spray bottle with 500 ml", 114885, "chemicals", {code:"49011525", tags:["chemicals","sealant"], specs:[{"label":"Contents","value":"500 ml"},{"label":"Code","value":"101-637"}]}),
  p("Cleaning wipes White wipes, 250 pcs", 118378, "chemicals", {code:"49011556", tags:["chemicals"], unit:"Bucket", badges:["VALUE","POPULAR"], specs:[{"label":"Contents","value":"250"},{"label":"Code","value":"101-734"}]}),
  p("Cleaning wipes Bamboo Anti bakteriel wipes, 60 pcs", 116997, "chemicals", {code:"49011557", tags:["chemicals"], unit:"Pack", badges:["VALUE"], specs:[{"label":"Contents","value":"60"},{"label":"Code","value":"101-735"}]}),
  p("Cleaning wipes Bamboo Anti bakteriel XXL wipes, 60 pcs", 116987, "chemicals", {code:"49011558", tags:["chemicals"], unit:"Pack", badges:["VALUE","POPULAR"], specs:[{"label":"Contents","value":"60 pcs"},{"label":"Code","value":"101-736"}]}),
  p("Cleaning wipes Tough wipes, 80 pcs", 112610, "chemicals", {code:"49011559", tags:["chemicals"], unit:"Pack", badges:["POPULAR"], specs:[{"label":"Contents","value":"80"},{"label":"Code","value":"101-706"}]}),
  p("Silicone sealant smoother", 143439, "sealant", {code:"49011561", tags:["sealant"], specs:[{"label":"Colour","value":"Red"}]}),
  p("Sealant gun for cartridges", 143434, "sealant", {code:"49011562", tags:["sealant"], specs:[{"label":"For","value":"Cartridges"},{"label":"Code","value":"101-742"}]}),
  p("Sticky mat blue 60 x 90 cm, pack of 30 pcs", 168885, "painting-tools", {code:"49011679", tags:["painting-tools"], specs:[{"label":"Contents","value":"30"},{"label":"Dimension","value":"60 x 90 cm"},{"label":"Colour","value":"Blue"},{"label":"Recommended for","value":"Asbestos"},{"label":"Code","value":"102-481"}]}),
  p("Silicone spreader, pack x 4 pcs", 143437, "chemicals", {code:"49011680", tags:["chemicals","sealant"], unit:"Set", specs:[{"label":"Code","value":"101-740"}]}),
  p("Mounting tape EXTREME 13,6 kg 25 mm x 1,52 m", 187585, "tape", {code:"49011686", tags:["tape"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Length m","value":"1.52"},{"label":"Width mm","value":"25"},{"label":"Code","value":"102-381"}]}),
  p("Mounting tape Indoor 6,8 kg 25 mm x 1,39 m", 182263, "tape", {code:"49011687", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"1.39"},{"label":"Width mm","value":"25"},{"label":"Code","value":"102-382"}]}),
  p("Mounting tape strong, Transparent 3,3 kg 25 mm x 1,52 m", 187627, "tape", {code:"49011688", tags:["tape"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Length m","value":"1.52"},{"label":"Width mm","value":"25"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"102-383"}]}),
  p("Mounting tape Outdoor 6,8 kg 25 mm x 1,52 m", 187587, "tape", {code:"49011689", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"1.52"},{"label":"Width mm","value":"25"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"102-384"}]}),
  p("Mounting tape Outdoor, waterproof 3,3 kg 19 mm x 1,5 m", 187599, "tape", {code:"49011690", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"1.5"},{"label":"Width mm","value":"19"},{"label":"Code","value":"102-385"}]}),
  p("Reflective tape, red/white PC mikroprismatisk 5 cm x 5,14 m", 187597, "tape", {code:"49011691", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"5.14"},{"label":"Width mm","value":"50"},{"label":"Code","value":"102-390"}]}),
  p("Reflective tape, yellow/black PC mikroprismatisk 5 cm x 5,14 m", 187604, "tape", {code:"49011692", tags:["tape"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Length m","value":"5.14"},{"label":"Width mm","value":"50"},{"label":"Code","value":"102-391"}]}),
  p("Repair tape waterproof, black PE film with butyl adhesive 10cmx1,5m", 187600, "tape", {code:"49011693", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"1.5"},{"label":"Width mm","value":"100"},{"label":"Colour","value":"Black"},{"label":"Code","value":"102-392"}]}),
  p("Anti-slip tape with luminous stripe, black/green 5 cm x 5", 187593, "tape", {code:"49011694", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"5"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Black/green"},{"label":"Code","value":"102-393"}]}),
  p("Butyl tape double-sided black 2 x 10 mm x 20 m", 187596, "tape", {code:"49011695", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"20"},{"label":"Width mm","value":"10"},{"label":"Colour","value":"Black"},{"label":"Code","value":"102-394"}]}),
  p("Glass fibre tape single-sided white 50 mm x 25 m", 187601, "tape", {code:"49011696", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"25"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"White"},{"label":"Code","value":"102-395"}]}),
  p("Tape silikone self-fusing transparent 0,5 x 25 mm x 3 m", 187594, "tape", {code:"49011697", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"3"},{"label":"Width mm","value":"25"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"102-396"}]}),
  p("Alu tape, silver 50mm x 50m", 187588, "tape", {code:"49011698", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"50"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Silver"},{"label":"Code","value":"102-397"}]}),
  p("Masking film with tape 550mm x 33m", 187592, "painting-tools", {code:"49011699", tags:["painting-tools"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Contents","value":"33 m"},{"label":"Colour","value":"Clear plastic"},{"label":"Code","value":"102-398"}]}),
  p("PVC construction tape, orange 0,13 x 50 mm x 33 m", 187590, "tape", {code:"49011700", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"33"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Orange"},{"label":"Code","value":"102-399"}]}),
  p("Super tape acrylic transparent 1 x 19 mm, 5 m", 187595, "chemicals", {code:"49011701", tags:["chemicals","tape"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Length m","value":"5"},{"label":"Width mm","value":"19"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"102-400"}]}),
  p("Reflective tape red/white 10 lag PC Micro 30x5 cm", 187606, "tape", {code:"49011702", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"0.3"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Red/white"},{"label":"Code","value":"102-401"}]}),
  p("Nano tape double-sided, transparent 25 mm x 3 m", 187598, "chemicals", {code:"49011703", tags:["chemicals","tape"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Length m","value":"3"},{"label":"Width mm","value":"25"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"102-402"}]}),
  p("Anti-slip tape transparent 50 mm x 5 m", 187605, "tape", {code:"49011704", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"5"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"102-403"}]}),
  p("Warning tape ASBEST yellow/black, 50mmx66m", 196435, "tape", {code:"49011737", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"66"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"Yellow/black"},{"label":"Code","value":"102-536"}]}),
  p("Cloth tape double-sided, 50mmx25m", 196437, "tape", {code:"49011738", tags:["tape"], unit:"Roll", badges:["POPULAR"], specs:[{"label":"Length m","value":"25"},{"label":"Width mm","value":"50"},{"label":"Code","value":"102-537"}]}),
  p("Anti-slip underlay with adhesive, 50mmx2m", 196444, "tape", {code:"49011739", tags:["tape"], unit:"Roll", specs:[{"label":"Length m","value":"2"},{"label":"Width mm","value":"50"},{"label":"Colour","value":"White"},{"label":"Code","value":"102-540"}]}),
  p("Repair \"Wall patch\" 100x100mm", 196455, "painting-tools", {code:"49011740", tags:["painting-tools"], specs:[{"label":"Contents","value":"1"},{"label":"Dimension","value":"100x100 mm"},{"label":"Colour","value":"Grey"},{"label":"Code","value":"102-541"}]}),
  p("Painter's tape UV outdoor, 25mmx50m", 196477, "chemicals", {code:"49011744", tags:["chemicals","tape"], unit:"Roll", badges:["VALUE","POPULAR"], specs:[{"label":"Length m","value":"50"},{"label":"Width mm","value":"25"},{"label":"Colour","value":"Blue"},{"label":"Code","value":"102-545"}]}),
  p("Painter's tape indoor, 19mmx50 m", 196454, "chemicals", {code:"49011748", tags:["chemicals","tape"], unit:"Roll", badges:["VALUE","POPULAR"], specs:[{"label":"Length m","value":"50"},{"label":"Width mm","value":"19"},{"label":"Code","value":"102-548"}]}),
  p("Asbestos airlock inflatable with 3 chambers 270x200x90 cm", 233015, "chemicals", {code:"49011760", tags:["chemicals","painting-tools"], badges:["POPULAR"], specs:[{"label":"Contents","value":"1"},{"label":"Dimension","value":"270x200x90 cm"},{"label":"Colour","value":"Grey"},{"label":"Recommended for","value":"Asbestos"},{"label":"Code","value":"102-784"}]}),
  p("Assembly adhesive Clear Fix, 290 ml", 204790, "chemicals", {code:"49011773", tags:["chemicals"], unit:"Cartridge", badges:["VALUE","POPULAR"], specs:[{"label":"Contents ml","value":"290"},{"label":"Colour","value":"Transparent"},{"label":"DGNB indicator","value":"13"},{"label":"DGNB quality level","value":"4"},{"label":"Code","value":"102-829"}]}),
  p("Masking film 0,05mmx2,0x50 m", 207672, "painting-tools", {code:"49011780", tags:["painting-tools"], unit:"Roll", badges:["VALUE"], specs:[{"label":"Contents","value":"50 m"},{"label":"Dimension","value":"0,05 x 2,0 mm"},{"label":"Colour","value":"Transparent"},{"label":"Code","value":"102-864"}]}),
  p("Sealant gun for cartridges, 2-speed", 207566, "sealant", {code:"49011785", tags:["sealant"], specs:[{"label":"For","value":"Cartridges"},{"label":"Code","value":"102-863"}]}),
  p("Pop-up tent with alu frame 3x3 m, without roof", 237474, "painting-tools", {code:"49011821", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Dimension","value":"3x3 m"},{"label":"Code","value":"102-883"}]}),
  p("Roof white for tent 3x3 m", 237484, "painting-tools", {code:"49011822", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Dimension","value":"3x3 m"},{"label":"Colour","value":"White"},{"label":"Code","value":"102-884"}]}),
  p("Side panel white for tent gazebo, 3x3 m", 237479, "painting-tools", {code:"49011823", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Colour","value":"White"},{"label":"Code","value":"102-885"}]}),
  p("Roof black for tent 3x3 m", 237481, "painting-tools", {code:"49011824", tags:["painting-tools"], badges:["POPULAR"], specs:[{"label":"Dimension","value":"3x3 m"},{"label":"Colour","value":"Black"},{"label":"Code","value":"102-886"}]}),
  p("Side panel black for tent gazebo, 3x3 m", 237483, "painting-tools", {code:"49011825", tags:["painting-tools"], specs:[{"label":"Colour","value":"Black"},{"label":"Code","value":"102-887"}]}),
  p("Sealant gun for cartridges 300-MS-1", 73307, "sealant", {code:"49865930", tags:["sealant"], badges:["VALUE"], specs:[{"label":"For","value":"Cartridges 310 ml"},{"label":"Code","value":"100-012"}]}),
  p("Sealant gun for bags 600-MS-1", 73349, "sealant", {code:"49865940", tags:["sealant"], badges:["VALUE"], specs:[{"label":"For","value":"Bags 600 ml"},{"label":"Code","value":"100-014"}]}),
  p("Masking felt anti slip grey 1x10mtr - 250g/m²", 105242, "chemicals", {code:"49974525", tags:["chemicals","painting-tools"], unit:"Roll", badges:["VALUE"], specs:[{"label":"Dimension","value":"1 x 10 mtr"},{"label":"Thickness mm","value":"250 g/m²"},{"label":"Colour","value":"Grey"},{"label":"Code","value":"300-011"}]}),
  p("Charger USB BC-0807F for rechargeable batterier", 76407, "batteries", {code:"53010853", tags:["batteries"], unit:"Pack", badges:["VALUE"], specs:[{"label":"Code","value":"101-061"}]}),
  p("Batteri Alkaline AAA LR03 Extreme x 4 pcs", 51044, "batteries", {code:"55000172", tags:["batteries"], unit:"SB card", badges:["POPULAR"], specs:[{"label":"Type","value":"AAA - LR03"},{"label":"Qty per pack","value":"4"},{"label":"Code","value":"100-432"}]}),
  p("Batteri Alkaline AA LR6 Extreme x 4 pcs", 51041, "batteries", {code:"55000174", tags:["batteries"], unit:"SB card", specs:[{"label":"Type","value":"AA - LR06"},{"label":"Qty per pack","value":"4"},{"label":"Code","value":"100-434"}]}),
  p("Batteri Alkaline 9V Extreme x 1 pcs", 51048, "batteries", {code:"55000176", tags:["batteries"], unit:"SB card", badges:["POPULAR"], specs:[{"label":"Type","value":"6LF22"},{"label":"Code","value":"100-436"}]}),
  p("Batteri Alkaline C LR14 Extreme x 2 pcs", 51045, "batteries", {code:"55000178", tags:["batteries"], unit:"SB card", specs:[{"label":"Type","value":"C - LR14"},{"label":"Code","value":"100-438"}]}),
  p("Batteri Alkaline D LR20 Extreme x 2 pcs", 51046, "batteries", {code:"55000180", tags:["batteries"], unit:"SB card", specs:[{"label":"Type","value":"D - LR20"},{"label":"Code","value":"100-440"}]}),
  p("Work light LED 55 W - 600-6000 lumen", 51024, "lighting", {code:"55000195", tags:["lighting"], badges:["VALUE","POPULAR"], specs:[{"label":"Lumens","value":"6000"},{"label":"Watt","value":"60"},{"label":"Code","value":"100-776"}]}),
  p("Power bank/hand warmer, 5.200 mAh", 54994, "site-hut-supplies", {code:"55009003", tags:["site-hut-supplies"], specs:[{"label":"Capacity mAh","value":"5200"},{"label":"Colour","value":"Black"},{"label":"Code","value":"100-712"}]}),
  p("Charging cable 5m with quick coupling", 170580, "site-hut-supplies", {code:"55009020", tags:["site-hut-supplies"], badges:["OUTLET"], specs:[{"label":"Length cm","value":"500"},{"label":"Code","value":"100-219"}]}),
  p("Cable reel 25 m, with earth, 4 outlets, fixed core", 61110, "cable-reels", {code:"55009028", tags:["cable-reels"], specs:[{"label":"Dimension mm²","value":"3x1,5 mm2"},{"label":"Length m","value":"25"},{"label":"Type","value":"4 outlets"}]}),
  p("Cable reel 40 m, with earth, 4 outlets, fixed core", 61112, "cable-reels", {code:"55009029", tags:["cable-reels"], specs:[{"label":"Dimension mm²","value":"3x1,5 mm2"},{"label":"Length m","value":"40"},{"label":"Type","value":"4 outlets"}]}),
  p("Charging cable 5m for 30W arbejdslamper old model", 147437, "site-hut-supplies", {code:"55009041", tags:["site-hut-supplies"], specs:[{"label":"Length cm","value":"50"},{"label":"Code","value":"100-220"}]}),
  p("Work light rechargeable, 22 W", 67086, "lighting", {code:"55011127", tags:["lighting"], badges:["OUTLET"], specs:[{"label":"Lumens","value":"2100"},{"label":"Watt","value":"22"},{"label":"Kelvin","value":"4500"},{"label":"Classification","value":"IP65"},{"label":"Code","value":"100-772"}]}),
  p("Headlamp 200L", 62554, "lighting", {code:"55011140", tags:["lighting"], specs:[{"label":"Lumens","value":"200"},{"label":"Burn time hours","value":"190"},{"label":"Battery type","value":"AAA"},{"label":"Weight grams","value":"62"},{"label":"Code","value":"100-590"}]}),
  p("Rechargeable batteries 950 mAh AAA, x 4 pcs", 76376, "batteries", {code:"55011397", tags:["batteries"], unit:"Pack", badges:["VALUE"], specs:[{"label":"Type","value":"AAA"},{"label":"Qty per pack","value":"4"},{"label":"Code","value":"101-059"}]}),
  p("Rechargeable batteries 2600 Mah AA, x 4 pcs", 76381, "batteries", {code:"55011398", tags:["batteries"], unit:"Pack", badges:["VALUE"], specs:[{"label":"Type","value":"AA"},{"label":"Qty per pack","value":"4"},{"label":"Code","value":"101-060"}]}),
  p("Torch Aluminium 250L", 130499, "lighting", {code:"55011698", tags:["lighting"], specs:[{"label":"Lumens","value":"250/80"},{"label":"Battery type","value":"AA"},{"label":"Code","value":"101-432"}]}),
  p("Torch Aluminium 500L", 130508, "lighting", {code:"55011699", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"Lumens","value":"500/150"},{"label":"Battery type","value":"AA"},{"label":"Code","value":"101-433"}]}),
  p("Rechargeable headlamp 1200L", 130545, "lighting", {code:"55011703", tags:["lighting"], specs:[{"label":"Range m","value":"125"},{"label":"Lumens","value":"1200/400/80/10"},{"label":"Code","value":"101-439"}]}),
  p("Balloon work light 31000L complete", 114573, "lighting", {code:"55011708", tags:["lighting"], specs:[{"label":"Lumens","value":"31000"},{"label":"Watt","value":"100/180/250"},{"label":"Kelvin","value":"5000"},{"label":"Classification","value":"IP65"},{"label":"Cable length m","value":"5"}]}),
  p("Balloon for balloon arbejdslampe", 130584, "lighting", {code:"55011710", tags:["lighting"], specs:[{"label":"For","value":"Balloon work light"},{"label":"Code","value":"101-452"}]}),
  p("Sandbag for balloon trefod", 116107, "lighting", {code:"55011711", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"For","value":"Balloon tripod"},{"label":"Code","value":"101-453"}]}),
  p("LED strip 1500 L, 150W, 10m", 130608, "lighting", {code:"55011715", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"Lumens","value":"1500"},{"label":"Watt","value":"150"},{"label":"Classification","value":"IP65"},{"label":"Cable length m","value":"4.5"},{"label":"Code","value":"101-457"}]}),
  p("LED Strip 1500 L, 300W, 20m", 130629, "lighting", {code:"55011716", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"Lumens","value":"1500"},{"label":"Watt","value":"300"},{"label":"Classification","value":"IP65"},{"label":"Cable length m","value":"4.5"},{"label":"Code","value":"101-458"}]}),
  p("Led-strip Cable reel 1500 L, 150W, 10 m", 130637, "lighting", {code:"55011717", tags:["lighting"], specs:[{"label":"Lumens","value":"1500"},{"label":"Watt","value":"150"},{"label":"Classification","value":"IP65"},{"label":"Cable length m","value":"10"},{"label":"Code","value":"101-459"}]}),
  p("Driver for LED Strips", 130651, "lighting", {code:"55011722", tags:["lighting"], specs:[{"label":"For","value":"LED strips"},{"label":"Code","value":"101-464"}]}),
  p("Dimmer for LED strips", 130658, "lighting", {code:"55011724", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"For","value":"LED strips"},{"label":"Code","value":"101-466"}]}),
  p("Batteri coin cell CR2016, pack of 5 pcs", 143375, "batteries", {code:"55011754", tags:["batteries"], unit:"Pack", badges:["POPULAR"], specs:[{"label":"Type","value":"CR2016"},{"label":"Qty per pack","value":"5"},{"label":"Code","value":"101-717"}]}),
  p("Batteri coin cell CR2025, pack of 5 pcs", 143374, "batteries", {code:"55011755", tags:["batteries"], unit:"Pack", badges:["POPULAR"], specs:[{"label":"Type","value":"CR2025"},{"label":"Qty per pack","value":"5"},{"label":"Code","value":"101-718"}]}),
  p("Batteri coin cell CR2032, pack of 5 pcs", 143376, "batteries", {code:"55011756", tags:["batteries"], unit:"Pack", specs:[{"label":"Type","value":"CR2032"},{"label":"Qty per pack","value":"5"},{"label":"Code","value":"101-719"}]}),
  p("Charging cable USB-A for USB-C black 1,2 m", 144550, "site-hut-supplies", {code:"55011763", tags:["site-hut-supplies"], badges:["POPULAR"], specs:[{"label":"Length cm","value":"120"},{"label":"Type","value":"USB-A for USB-C"},{"label":"Code","value":"101-691"}]}),
  p("Charging cable USB-C for lightning black 1,2 m, fast charge 3 amp", 143381, "site-hut-supplies", {code:"55011766", tags:["site-hut-supplies"], specs:[{"label":"Length cm","value":"120"},{"label":"Type","value":"USB-C"},{"label":"Code","value":"101-694"}]}),
  p("Car charger black \"Fast Charge\" Input: DC 12-24V", 144479, "site-hut-supplies", {code:"55011767", tags:["site-hut-supplies"], badges:["OUTLET"], specs:[{"label":"Type","value":"DC 12-24V"},{"label":"Code","value":"101-695"}]}),
  p("Work light LED 4 lights, 14.000 Lumen, 230 V with trefod", 151942, "lighting", {code:"55011789", tags:["lighting"], unit:"Set", specs:[{"label":"Lumens","value":"14.000"},{"label":"Classification","value":"IP54"},{"label":"Cable length m","value":"3"},{"label":"Code","value":"102-195"}]}),
  p("Work light LED 2 Lights swivel, 5.500 Lumen, 230 V", 152580, "lighting", {code:"55011790", tags:["lighting"], specs:[{"label":"Lumens","value":"5.500"},{"label":"Watt","value":"30"},{"label":"Classification","value":"IP54"},{"label":"Cable length m","value":"1.8"},{"label":"Code","value":"102-197"}]}),
  p("Work light LED 360° Clips, 5.000 lumen, 230 V", 152587, "lighting", {code:"55011791", tags:["lighting"], specs:[{"label":"Lumens","value":"5.000"},{"label":"Classification","value":"IP55"},{"label":"Cable length m","value":"5"},{"label":"Code","value":"102-198"}]}),
  p("LED Strip 1500 L, 1500W, 100 m", 162843, "lighting", {code:"55011801", tags:["lighting"], unit:"Set", specs:[{"label":"Lumens","value":"1500"},{"label":"Watt","value":"1500"},{"label":"Cable length m","value":"4.5"},{"label":"Code","value":"102-339"}]}),
  p("Work light Mega power LED work light (360°), 400W", 168072, "lighting", {code:"55011802", tags:["lighting"], specs:[{"label":"Lumens","value":"48.000"},{"label":"Watt","value":"400"},{"label":"Code","value":"102-343"}]}),
  p("Work light Mega power LED (360°), 800W (2 x 400W)", 168071, "lighting", {code:"55011803", tags:["lighting"], specs:[{"label":"Lumens","value":"96.000"},{"label":"Watt","value":"800 (2x400)"},{"label":"Code","value":"102-344"}]}),
  p("Tripod adjustable 1,8-4,0 m for Mega power", 168067, "lighting", {code:"55011804", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"Max. height m","value":"4"},{"label":"Code","value":"102-345"}]}),
  p("Work light LED 3200L, 30W", 191197, "lighting", {code:"55011859", tags:["lighting"], specs:[{"label":"Lumens","value":"3200"},{"label":"Watt","value":"30"},{"label":"Classification","value":"IP54"},{"label":"Cable length m","value":"5"},{"label":"Code","value":"102-533"}]}),
  p("Work light LED 6500L, 60W", 191202, "lighting", {code:"55011860", tags:["lighting"], specs:[{"label":"Lumens","value":"6500"},{"label":"Watt","value":"60"},{"label":"Code","value":"102-534"}]}),
  p("Inspection light 1200L, rechargeable", 191219, "lighting", {code:"55011862", tags:["lighting"], badges:["POPULAR"], specs:[{"label":"Lumens","value":"1200"},{"label":"Weight grams","value":"430"},{"label":"Code","value":"102-561"}]}),
  p("Torch 1000L, rechargeable", 191225, "lighting", {code:"55011864", tags:["lighting"], specs:[{"label":"Lumens","value":"1000"},{"label":"Code","value":"102-595"}]}),
  p("Dust mask with valve FFP2-V x 12 pcs", 75299, "safety", {code:"60011254", tags:["safety"], unit:"Pack", badges:["VALUE","POPULAR"], specs:[{"label":"Type","value":"P2"},{"label":"Qty per pack","value":"12"},{"label":"Code","value":"100-572"}]}),
  p("Flexx glove size 10", 109506, "safety", {code:"62005457", tags:["safety"], unit:"Pair", badges:["VALUE","POPULAR"], specs:[{"label":"Size","value":"10"},{"label":"Code","value":"100-517"}]}),
  p("Winter glove size 10", 128258, "safety", {code:"62008430", tags:["safety"], unit:"Pair", specs:[{"label":"Size","value":"10"}]}),
  p("Winter glove yellow, size 11 (3Aktive)", 108385, "safety", {code:"62012130", tags:["safety"], unit:"Pair", specs:[{"label":"Size","value":"11"},{"label":"Colour","value":"Yellow"},{"label":"Code","value":"100-560"}]}),
  p("Knee pad EVA 450x270x30 mm", 38777, "workwear", {code:"62880502", tags:["workwear"], badges:["POPULAR"], specs:[{"label":"Colour","value":"Black"},{"label":"Size","value":"One size"},{"label":"Code","value":"STROXX"}]}),
  p("Knit beanie Black One size", 103127, "workwear", {code:"63016630", tags:["workwear"], badges:["VALUE"], specs:[{"label":"Size","value":"One size"},{"label":"Colour","value":"Black"}]}),
  p("Base layer top L/Æ Black/grey, size M", 122930, "workwear", {code:"63117583", tags:["workwear"], badges:["POPULAR"], specs:[{"label":"Size","value":"M"},{"label":"Colour","value":"Black"},{"label":"Gender","value":"Men"}]}),
  p("Base layer bottoms Black/grey, size L", 122797, "workwear", {code:"63117588", tags:["workwear"], unit:"Pair", specs:[{"label":"Size","value":"L"},{"label":"Colour","value":"Black"},{"label":"Gender","value":"Men"}]}),
  p("Beanie with headlamp Black, One size", 156523, "workwear", {code:"63143492", tags:["workwear"], badges:["NEW"], specs:[{"label":"Size","value":"One size"},{"label":"Colour","value":"Black"}]}),
  p("Hand dispenser with sensor + LED display 0,5L", 103157, "site-hut-supplies", {code:"64011335", tags:["site-hut-supplies"], badges:["OUTLET","POPULAR"], specs:[{"label":"Contents","value":"0,5 L"},{"label":"Code","value":"PW-MS"}]}),
  p("Thermos flask black, 500 ml", 129544, "site-hut-supplies", {code:"64011383", tags:["site-hut-supplies"], badges:["POPULAR"], specs:[{"label":"Contents","value":"500 ml"},{"label":"Code","value":"101-158"}]}),
  p("Hand cleaner Extreme 250 ml", 119292, "site-hut-supplies", {code:"64011709", tags:["site-hut-supplies"], badges:["POPULAR"], specs:[{"label":"Contents","value":"250 ml"},{"label":"Type","value":"Extreme"},{"label":"Code","value":"101-392"}]}),
  p("Hand cream lotion 250 ml", 119283, "site-hut-supplies", {code:"64011710", tags:["site-hut-supplies"], specs:[{"label":"Contents","value":"250 ml"},{"label":"Type","value":"Lotion"},{"label":"Code","value":"101-394"}]}),
  p("Cool box with kompressor 35 ltr, 60W", 237616, "site-hut-supplies", {code:"64012039", tags:["site-hut-supplies"], badges:["NEW","POPULAR"], specs:[{"label":"Contents","value":"35 L"},{"label":"Code","value":"102-766"}]}),
  p("Thermal mug black, 500 ml", 243229, "site-hut-supplies", {code:"64012064", tags:["site-hut-supplies"], specs:[{"label":"Contents","value":"500 ml"},{"label":"Code","value":"102-976"}]}),
];

export const productBySlug = (slug: string) => products.find((x) => x.slug === slug);
export const heroProducts = products.filter((x) => x.hero);
export const productsInCategory = (slug: string) => products.filter((x) => x.tags.includes(slug) || x.category === slug);

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

// quoteTopic: a category slug means the quote names that product/category and
// may ONLY be shown on matching products. Omitted = brand-generic, safe anywhere.
export type Specialist = { name: string; role: string; location: string; photo: string; quote: string; phone: string; email: string; quoteTopic?: string };

/** Pick the specialist to show on a product page: prefer one whose quote is
 *  about this product's category, otherwise only a brand-generic quote — never
 *  a quote that names an unrelated product. Deterministic per slug. */
export const specialistForProduct = (p: Product): Specialist => {
  const hash = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const onTopic = specialists.filter((s) => s.quoteTopic && p.tags.includes(s.quoteTopic));
  const generic = specialists.filter((s) => !s.quoteTopic);
  const pool = onTopic.length ? onTopic : generic;
  return pool[hash % pool.length];
};

export const specialists: Specialist[] = [
  { name: 'Niels Storm', role: 'Sourcing Manager', location: 'Herlev', photo: '/specialists/niels-storm.jpg', phone: '22767114', email: 'nst@carl-ras.dk',
    quote: 'I source tools all day. STROXX is the only place where the value surprises me more than the specs.' },
  { name: 'Andreas Carlson', role: 'Team Lead', location: 'Sydhavnen', photo: '/specialists/andreas-carlson.jpg', phone: '51350611', email: 'anca@carl-ras.dk',
    quote: 'My team uses it themselves. That is the best recommendation I can give.' },
  { name: 'Susan Christensen', role: 'Inside Sales', location: 'Næstved', photo: '/specialists/susan-christensen.jpg', phone: '81775550', email: 'susa@carl-ras.dk',
    quote: 'Tradespeople feel the difference between good and bad. STROXX feels right in the hand.' },
  { name: 'Rudi Olesen', role: 'Inside Sales', location: 'Århus', photo: '/specialists/rudi-olesen.jpg', phone: '81779180', email: 'ruol@carl-ras.dk',
    quote: 'A line laser at this level? I sold three yesterday.', quoteTopic: 'lasers' },
  { name: 'Ulrik Bjørnsson', role: 'Inside Sales', location: 'Hørsholm', photo: '/specialists/ulrik-bjornsson.jpg', phone: '81775302', email: 'ub@carl-ras.dk',
    quote: 'Customers come back grinning: “Why did I ever pay over the odds before?”' },
  { name: 'Martin Lübker', role: 'Inside Sales', location: 'Århus N.', photo: '/specialists/martin-lubker.jpg', phone: '81778687', email: 'malu@carl-ras.dk',
    quote: 'I recommend STROXX without blinking. It lasts, and it never lets you down.' },
  { name: 'Lea Ahrnkiel', role: 'Inside Sales', location: 'Sydhavnen', photo: '/specialists/lea-ahrnkiel.jpg', phone: '81775702', email: 'leah@carl-ras.dk',
    quote: 'People think there is a catch. There just is not any brand markup.' },
  { name: 'Theis Lindgren', role: 'Inside Sales', location: 'Amager', photo: '/specialists/theis-lindgren.jpg', phone: '81779713', email: 'thli@carl-ras.dk',
    quote: 'The knives alone are reason enough. Sharp, dependable, always in stock.', quoteTopic: 'knives' },
  { name: 'Nikolaj Ungermand', role: 'Sourcing & ESG', location: 'Herlev', photo: '/specialists/nikolaj-ungermand.jpg', phone: '51221002', email: 'nn@carl-ras.dk',
    quote: 'Same quality as the big brands, just without the brand markup. That is the whole point.' },
];

/** Featured categories for the homepage "bag fills" act — each with a hero product. */
export const featuredCategorySlugs = ['lasers', 'circular-saw-blades', 'knives', 'measuring-tools'];

/** Curated SINGLE-object product images for the particle reveal — a clean
 *  silhouette reads far better than a bundle/exploded shot. Falls back to the
 *  category's hero image when no override is set. */
const PARTICLE_IMG: Record<string, number> = {
  // 159146 (krydslaser) is a corrupt 18MB DAM export — never use it as a
  // particle source. These two are verified clean transparent renditions.
  lasere: 114346,         // Rotationslaser rød — one clean object
  maalevaerktoej: 134353, // Torpedo vaterpas — one clean object
};
export const particleImgId = (slug: string, fallback: number) => PARTICLE_IMG[slug] ?? fallback;

/** Some categories use a LOCAL pre-cut PNG (hand-exported from the DAM) as the
 *  particle source instead of the proxy — e.g. the krydslaser, whose CDN
 *  rendition is a corrupt 18MB export. */
const PARTICLE_SRC: Record<string, string> = {
  lasere: '/Images/bag-tools/159146.png',         // krydslaser (CDN rendition is a corrupt 18MB export)
  maalevaerktoej: '/Images/bag-tools/134353.png', // torpedo vaterpas — was wrongly the laser, so two homepage features assembled the same image
};
export const particleSrc = (slug: string, imgId: number) =>
  PARTICLE_SRC[slug] ?? toolTexture(particleImgId(slug, imgId));

export const featuredCategories = featuredCategorySlugs
  .map((slug) => {
    const cat = categories.find((c) => c.slug === slug)!;
    const items = products.filter((p) => p.tags.includes(slug) || p.category === slug);
    const hero = items.find((i) => i.hero) ?? items[0];
    return { cat, items, hero, particleImgId: hero ? particleImgId(slug, hero.imgId) : 0 };
  })
  .filter((f) => f.hero);
