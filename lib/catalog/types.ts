// lib/catalog/types.ts
// The catalogue contract: the ONE shape product data must arrive in, whatever
// the source (today's curated snapshot, tomorrow's Carl Ras PIM export).
// Carl Ras IT implements a PimAdapter/DamAdapter against these types; nothing
// else in the codebase changes when the source swaps. See
// docs/STROXX-pim-dam-integration.md for the IT-facing proposal.
//
// THE PRICE FIREWALL
// This type has NO price-shaped slot BY DESIGN and must never gain one.
// No price, list price, campaign price, cost, currency, VAT, margin, or live
// stock field may be added here, under any name, in any language (moms
// included). The brand site convinces; the dealer sells. The allowlist
// normalizer (lib/catalog/normalize.ts) drops any such field arriving in a
// feed, and tests/catalog.test.ts locks the contract: a price-shaped key
// anywhere in the emitted catalogue fails the build. If a future feature
// seems to need a price field, it belongs on the dealer's platform, not here.

/** Reference to a product image in the Carl Ras DAM (Digizuite).
 *  `assetId` is the numeric Digizuite asset id used across the site today
 *  (crImage / toolTexture in lib/data.ts). `rendition` is an optional
 *  Digizuite rendition/format id hint (e.g. '50384' for the 800px JPG,
 *  '50391' for the transparent PNG cut-out); resolvers fall back to their
 *  own default when it is absent. */
export type CatalogImageRef = {
  assetId: number;
  rendition?: string;
};

/** One product as the platform consumes it. Field-for-field this mirrors the
 *  agreed PIM field contract in docs/STROXX-pim-dam-integration.md. */
export type CatalogProduct = {
  /** Item number (Carl Ras "varenummer"). The primary key across the site,
   *  the CMS decoration layer (productAugment) and every SKU picker. */
  sku: string;
  name: string;
  /** URL slug, unique across the catalogue (routing + stable React keys). */
  slug: string;
  /** All category slugs this product belongs to; the first is the primary. */
  categorySlugs: string[];
  specs: { label: string; value: string }[];
  images: CatalogImageRef[];
  /** EAN/GTIN, when the feed provides it (feeds schema.org Product). */
  ean?: string;
  /** In-assortment flag. NOT live inventory; live stock never enters. */
  status: 'active' | 'discontinued';
  badges?: string[];
  /** Sales unit display label, e.g. 'Piece', 'Set', 'Pack'. */
  unit?: string;
  blurb?: string;
};

/** A raw record as delivered by a source, before the allowlist normalizer.
 *  Deliberately untyped: adapters pass feeds through as-is and normalization
 *  decides what survives. */
export type RawProductRecord = Record<string, unknown>;

/** Context handed to adapters for one sync run. */
export type SyncContext = {
  /** When this sync run started (for logging and snapshot stamping). */
  startedAt: Date;
  /** Sink for adapter diagnostics; the sync runner decides where it goes. */
  log: (message: string) => void;
};

/** A product-data source. Implementations fetch the raw assortment; they do
 *  NOT normalize or filter fields, that is the normalizer's job, so the
 *  price firewall cannot depend on adapter discipline. */
export interface PimAdapter {
  name: string;
  fetchProducts(ctx: SyncContext): Promise<RawProductRecord[]>;
}

/** An image source. Resolves a CatalogImageRef to a servable URL. */
export interface DamAdapter {
  name: string;
  resolveImage(ref: CatalogImageRef, opts: { w?: number; transparent?: boolean }): string;
}
