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
  filmEyebrow: string; filmHeadline: string;
  films?: unknown[]; // editor-picked films (dereferenced in getHomePage)
  guaranteeHeadline: string; guaranteeText: string;
  sealLine1: string; sealConnector: string; sealLine2: string; sealSub1: string; sealSub2: string;
  monthHeadline: string; monthText: string;
  categoriesHeadline: string;
  ctaLabel: string;
  campaignEyebrow: string;
  campaignHeadline: string;
  campaignText: string;
  campaignPrimaryLabel: string;
  campaignSecondaryLabel: string;
  campaignHref: string; // resolved "Read more" target (from campaignLink reference)
  campaignImages?: unknown[];
  /* per-market section switches; the hero has no switch on purpose */
  showClaim: boolean;
  showMarquee: boolean;
  showRange: boolean;
  showScale: boolean;
  showSpecialists: boolean;
  showFilm: boolean;
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
    "Serious tools, seriously fair. Only at your STROXX dealer. And remember: always the 30-day satisfaction guarantee, so there's not much to think twice about.",
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
    "Whether you need a Viking arm or clean hands, we've got what you're after. In your dealer's webshop and in more than 227 stores across Europe.",
  scaleCol2Label: 'The best',
  scaleCol2Text:
    "Some products are an easy call when you just don't want to overpay. Others are for those who compare specs, performance and value, and want the best.",
  stats: [
    { value: 1400, suffix: '+', label: 'product numbers' },
    { value: 26, suffix: '', label: 'stores in Denmark' },
    { value: 227, suffix: '+', label: 'stores in Europe' },
  ],
  specialistsHeadline: 'Masters of the trade, majoring in STROXX',
  filmEyebrow: 'On the job',
  filmHeadline: 'See it *at work.*',
  guaranteeHeadline: '*100%* satisfaction \n or your money back.',
  guaranteeText:
    "We'll stand behind it. If you're not happy with your STROXX tool, you get your money back. So there's not much to think over. Just get started.",
  sealLine1: 'SATISFIED', sealConnector: 'or', sealLine2: 'REFUNDED',
  sealSub1: 'Not happy with STROXX?', sealSub2: 'Your money back, right away.',
  monthHeadline: 'Check it out.\n*Green line laser 3D*',
  monthText:
    'Every month, one tool gets the full story: why it wins, where it earns its keep, and what the trade says. The rest of the month takes care of itself.',
  categoriesHeadline: "All you'll *need.* Category \n by category.",
  // English base = the international site: buy labels stay dealer-neutral here.
  // A market's own locale doc may name its dealer ("Køb hos Carl Ras").
  ctaLabel: 'Where to buy',
  campaignEyebrow: 'Campaign',
  // Positioning: STROXX is not the cheap option, it is the one that earns its
  // place on the van. Lead on the guarantee, never on costing less. See
  // docs/STROXX-positioning-change-plan.md.
  campaignHeadline: 'Take it to work.\n*Then* decide.',
  campaignText:
    'STROXX is built for people who use their tools all day and judge them accordingly. So do not take our word for it. Put it to work: *TRY IT.* Not for you, or not happy? You get your money back. Simple as that.',
  campaignPrimaryLabel: '', // empty = automatic: "Buy at <dealer>", or "Where to buy" internationally
  campaignSecondaryLabel: 'Read more',
  campaignHref: '/try-it',
  showClaim: true,
  showMarquee: true,
  showRange: true,
  showScale: true,
  showSpecialists: true,
  showFilm: false, // net-new section, off until an editor enables it
  showGuarantee: true,
  showCampaign: true,
  showMonth: true,
  showCategories: true,
  showFinalCta: true,
};
