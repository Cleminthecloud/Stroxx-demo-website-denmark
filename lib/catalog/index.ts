// lib/catalog: the single product feed seam. Consumers import from here;
// the source behind it (curated snapshot today, Carl Ras PIM tomorrow)
// swaps without touching them. See lib/catalog/types.ts for the contract
// and the price firewall, tests/catalog.test.ts for the lock.

export type {
  CatalogImageRef,
  CatalogProduct,
  DamAdapter,
  PimAdapter,
  RawProductRecord,
  SyncContext,
} from './types';

export {
  assertNoPriceLikeKeys,
  normalizeProduct,
  validateCatalog,
  type CatalogRecordError,
  type CatalogValidation,
  type FieldMap,
} from './normalize';

export { curatedPimAdapter, getCatalog } from './curated';
