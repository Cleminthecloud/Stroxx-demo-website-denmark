/**
 * Validation for AI-drafted Focus on… pages (scripts/focus-draft.mjs).
 * Pure functions, no I/O, unit-tested in tests/focus-draft.test.ts, which also
 * checks that ALLOWED_TYPES matches the block menu in the Sanity schema, so a
 * new block can not be forgotten here (or a removed one linger).
 *
 * The spec format (one JSON file per page and language) is documented in
 * .claude/skills/focus-page/REFERENCE.md and the focus-page skill.
 */

/** Every section block a focus page may use. */
export const ALLOWED_TYPES = [
  'photoHero',
  'statement',
  'reframe',
  'splitMedia',
  'featureGrid',
  'productProof',
  'videoProof',
  'quote',
  'testimonialProof',
  'photoBreak',
  'ctaBanner',
  'guaranteeAsk',
  'guaranteeSeal',
  'faqSection',
  'newsletter',
  'contactForm',
  'beforeAfter',
  'storyCards',
  'hotspotImage',
  'logoMarquee',
  'embed',
  'spacer',
  'textIntro',
  'numberedTabs',
  'filmSection',
  'comparisonTable',
  'bentoCompare',
  'specGrid',
  'modelCards',
  'rangeAdvisor',
  'safetyNotice',
  'stepList',
  'imageMosaic',
  'linkCards',
  'explainer',
  'peopleCards',
];

export const LANGS = ['en', 'da-DK', 'de-DE', 'fr-FR', 'nl-BE', 'fr-BE'];

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MONTH = /^20\d\d-(0[1-9]|1[0-2])-01$/;
/* a price: a number next to a currency, either order ("499 kr", "DKK 1.299", "€49,95", "kr. 199,-") */
const PRICE = /(\d[\d.,\s]*(,-)?\s*(kr\.?|dkk|eur|€|sek|nok)\b)|((kr\.?|dkk|eur|€)\s*\d)/i;
const SCRIPTISH = /<\s*script|javascript:|on\w+\s*=/i;
const LONG_DASH = /[–—]/;

/** Walk every string in a value with its path. */
function* strings(v, path = '') {
  if (typeof v === 'string') yield [path, v];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* strings(v[i], `${path}[${i}]`);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* strings(x, path ? `${path}.${k}` : k);
}

const isUrlKey = (k) => /(^|\.)(href|ctaHref|primaryHref|secondaryHref|noteLinkHref|videoUrl\w*|url)$/.test(k);

/**
 * Check a page spec. Returns { errors, warnings }: errors block the draft,
 * warnings are printed for the editor to look at.
 */
export function validateSpec(spec) {
  const errors = [];
  const warnings = [];
  if (!spec || typeof spec !== 'object') return { errors: ['The spec is not a JSON object.'], warnings };

  if (!LANGS.includes(spec.language)) errors.push(`language must be one of ${LANGS.join(', ')}`);
  if (!spec.title || typeof spec.title !== 'string') errors.push('title is required');
  if (!SLUG.test(spec.slug || '')) errors.push('slug must be English, lowercase, single dashes, e.g. "smart-lock-st-3"');
  if (!MONTH.test(spec.month || '')) errors.push('month must be the first of a month, e.g. 2026-12-01');
  if (spec.categoryKey && !SLUG.test(spec.categoryKey)) errors.push('categoryKey must be an existing filter key, e.g. lighting');
  if (spec.teaser && spec.teaser.length > 160) warnings.push('teaser is over 160 characters and will be cut on the card');
  if (spec.seoTitle && spec.seoTitle.length > 60) warnings.push('seoTitle is over 60 characters');
  if (spec.seoDescription && spec.seoDescription.length > 160) warnings.push('seoDescription is over 160 characters');

  const sections = Array.isArray(spec.sections) ? spec.sections : [];
  if (!sections.length) errors.push('sections must be a non-empty list');
  sections.forEach((s, i) => {
    if (!s || typeof s !== 'object') return errors.push(`sections[${i}] is not an object`);
    if (!ALLOWED_TYPES.includes(s._type)) errors.push(`sections[${i}]._type "${s._type}" is not a block in the Studio`);
  });
  if (sections[0] && sections[0]._type !== 'photoHero') warnings.push('the page does not open with a hero; the first block is the first impression');

  for (const [p, v] of strings(spec)) {
    if (PRICE.test(v)) errors.push(`${p}: looks like a price ("${v.slice(0, 60)}"). The brand site never shows prices.`);
    if (SCRIPTISH.test(v)) errors.push(`${p}: contains script or event-handler text`);
    if (LONG_DASH.test(v)) warnings.push(`${p}: uses a long dash; STROXX copy uses commas, colons or full stops instead`);
    if (isUrlKey(p) && v && !(v.startsWith('/') && !v.startsWith('//')) && !/^https:\/\//.test(v) && !/^(mailto|tel):/.test(v))
      errors.push(`${p}: links must be https:// or a /path ("${v.slice(0, 60)}")`);
  }

  /* the English base renders on the international site: no dealer names in it */
  if (spec.language === 'en') {
    for (const [p, v] of strings(spec)) {
      if (/carl\s*ras|carl-ras\.dk/i.test(v) && !/(^|\.)url$/.test(p)) errors.push(`${p}: the English version must stay dealer-neutral (no "Carl Ras"); use itemNumber and "Where to buy"`);
    }
  }
  return { errors, warnings };
}

/** Deterministic document ids, shared by the seed and the draft writer. */
export const focusDocId = (slug, language) => `focusPage-${slug}-${language}`;
export const draftId = (id) => `drafts.${id}`;
