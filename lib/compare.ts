/** Anonymous price comparison: "tilsvarende A-mærke fra X,-".
 *  No brands are named, which keeps us clear of comparative-marketing rules
 *  while still making the value claim concrete.
 *
 *  DEMO PLACEHOLDERS: reference prices below are realistic ballparks for an
 *  equivalent A-brand product, set by hand for the campaign proof products.
 *  Before production these must be validated (and ideally maintained as a
 *  CMS/PIM field per product) so every figure is verifiable. */

export interface Compare {
  /** equivalent A-brand street price, DKK, "fra"-price */
  ref: number;
  /** savings vs STROXX price, % (precomputed, keep in sync with ref) */
  savePct: number;
}

const COMPARE: Record<string, Compare> = {
  // Rundsavklinge Ø160 Z42W (336,25) vs A-mærke 160mm/42T klinge
  '34011573': { ref: 595, savePct: 43 },
  // Kniv Black 25mm autolås (73,75) vs A-mærke 25mm kniv
  '34009021': { ref: 149, savePct: 50 },
  // Torpedo vaterpas 250mm (148,75) vs A-mærke torpedo
  '35011812': { ref: 259, savePct: 43 },
  // Speed vinkel 175mm (136,25) vs A-mærke speed square
  '35011846': { ref: 229, savePct: 41 },
  // Streglaser 3D Green (2.498,75) vs A-mærke grøn 3D-streglaser — månedens hero
  '35011932': { ref: 4495, savePct: 44 },
};

export const getCompare = (code?: string): Compare | null => (code && COMPARE[code]) || null;
