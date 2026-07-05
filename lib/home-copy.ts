/** Homepage copy defaults: the exact pre-CMS wording. Lives in its own file
 *  (no imports) so the seed script can use it under `sanity exec`, where
 *  next-sanity's live module (imported by lib/cms) refuses to load. */

export type HomeStat = { value: number; suffix: string; label: string };
export type HomeCopy = {
  heroHeadline: string;
  claim: string; claimSub: string;
  marqueeText: string;
  rangeHeadline: string; rangeCol1Label: string; rangeCol1Text: string; rangeCol2Label: string; rangeCol2Text: string;
  scaleHeadline: string; scaleCol1Label: string; scaleCol1Text: string; scaleCol2Label: string; scaleCol2Text: string;
  stats: HomeStat[];
  specialistsHeadline: string;
  guaranteeHeadline: string; guaranteeText: string;
  monthHeadline: string; monthText: string;
  categoriesHeadline: string;
  ctaLabel: string;
  campaignImages?: unknown[];
  /* per-market section switches; the hero has no switch on purpose */
  showClaim: boolean;
  showMarquee: boolean;
  showRange: boolean;
  showScale: boolean;
  showSpecialists: boolean;
  showGuarantee: boolean;
  showCampaign: boolean;
  showMonth: boolean;
  showCategories: boolean;
  showFinalCta: boolean;
  _id?: string;
};

/** Any field left empty in the Studio renders this. */
export const HOME_DEFAULTS: HomeCopy = {
  heroHeadline: 'A *great* headline\nwill be here',
  claim: 'Here we have another great headline *for the reader.*',
  claimSub:
    "Serious tools, seriously fair. Only at Carl Ras BYG. And remember: always 100% satisfaction guarantee, so there's not much to think twice about.",
  marqueeText: 'A great headline will be here',
  rangeHeadline: 'You got what \n it takes \n ...so do *we*',
  rangeCol1Label: 'The selection',
  rangeCol1Text:
    'Tools, equipment, accessories and consumables. From laser measures and saw blades to hand tools, socket sets and protective gear. STROXX has most of it.',
  rangeCol2Label: 'The service',
  rangeCol2Text:
    "And we have your back. So you never walk away empty-handed or with the wrong thing. It's not just the tools that are sharp.",
  scaleHeadline: 'More than \n *1,400* product numbers.',
  scaleCol1Label: 'Every day',
  scaleCol1Text:
    "Whether you need a Viking arm or clean hands, we've got what you're after. In the webshop at carl-ras.dk and in 26 stores across the country.",
  scaleCol2Label: 'The best',
  scaleCol2Text:
    "Some products are an easy call when you just don't want to overpay. Others are for those who compare specs, performance and value, and want the best.",
  stats: [
    { value: 1400, suffix: '+', label: 'product numbers' },
    { value: 26, suffix: '', label: 'stores in Denmark' },
    { value: 227, suffix: '+', label: 'stores in Europe' },
  ],
  specialistsHeadline: 'Masters of the trade, majoring in STROXX',
  guaranteeHeadline: '*100%* satisfaction \n or your money back.',
  guaranteeText:
    "We'll stand behind it. If you're not happy with your STROXX tool, you get your money back. So there's not much to think over. Just get started.",
  monthHeadline: 'Check it out.\n*Green line laser 3D*',
  monthText:
    'Every month, one tool gets the full story: why it wins, where it earns its keep, and what the trade says. The rest of the month takes care of itself.',
  categoriesHeadline: "All you'll *need.* Category \n by category.",
  ctaLabel: 'Buy STROXX at Carl Ras',
  showClaim: true,
  showMarquee: true,
  showRange: true,
  showScale: true,
  showSpecialists: true,
  showGuarantee: true,
  showCampaign: true,
  showMonth: true,
  showCategories: true,
  showFinalCta: true,
};
