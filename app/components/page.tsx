import type { Metadata } from 'next';
import Link from 'next/link';
import LandingSections from '@/components/cms/LandingSections';
import { LandingSection } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Component library',
  robots: { index: false, follow: false },
};

/** Internal reference page: every landing-page block rendered live with its
 *  Studio name and a short description. Editors browse this to learn what
 *  each block looks like before adding it. Not linked in navigation. */

type Demo = { studioName: string; description: string; section: LandingSection };

const DEMOS: Demo[] = [
  {
    studioName: 'Hero: full-screen photo or video',
    description:
      'Full-bleed opener. Photo or looping video background, text position left/center/right, three heights. This sample: photo, left, tall.',
    section: {
      _type: 'photoHero', _key: 'd1', height: 'tall', align: 'left',
      eyebrow: 'Component · Hero',
      headline: 'A hero headline\nwith a *blue* word.',
      sub: 'A short subline that sets up the page. One or two sentences at most.',
      ctaLabel: 'Primary button', secondaryLabel: 'Secondary link',
      image: '/Images/campaign/rings.jpg',
    },
  },
  {
    studioName: 'Big statement (huge headline + paragraphs)',
    description:
      'The signature typographic section. Headline animates in on scroll; the last paragraph renders white for emphasis. Alignment left or right.',
    section: {
      _type: 'statement', _key: 'd2', align: 'left',
      eyebrow: 'Component · Big statement',
      headline: 'A very big statement \n lands *here.*',
      paragraphs: [
        'A supporting paragraph in the muted grey. Use it to carry the argument forward in two or three sentences.',
        'The final paragraph renders in white, so end on the line you want remembered.',
      ],
    },
  },
  {
    studioName: 'Headline + animated number stats',
    description: 'Two columns: headline and paragraphs left, counting-up numbers right.',
    section: {
      _type: 'reframe', _key: 'd3',
      eyebrow: 'Component · Stats',
      headline: 'Numbers that \n *count up.*',
      paragraphs: ['A short paragraph next to the stats. The numbers animate when they scroll into view.'],
      stats: [
        { _type: 'stat', _key: 'a', value: 4, suffix: '', label: 'countries behind it' },
        { _type: 'stat', _key: 'b', value: 227, suffix: '+', label: 'stores in Europe' },
        { _type: 'stat', _key: 'c', value: 1400, suffix: '+', label: 'item numbers' },
      ],
    },
  },
  {
    studioName: 'Image + text, side by side',
    description: 'Classic 50/50 split with an optional button. Image side is switchable.',
    section: {
      _type: 'splitMedia', _key: 'd4', imageSide: 'right',
      eyebrow: 'Component · Split',
      headline: 'Image one side, \n *story* the other.',
      body: 'Two to four sentences of supporting copy. Good for telling one focused story with a strong visual.',
      ctaLabel: 'Optional button', image: '/Images/campaign/tea.jpg',
    },
  },
  {
    studioName: 'Feature cards (3-up glass grid)',
    description: 'Frosted-glass cards for USPs, benefits or service promises. Up to six cards.',
    section: {
      _type: 'featureGrid', _key: 'd5',
      eyebrow: 'Component · Features',
      headline: 'Three reasons, \n three *cards.*',
      items: [
        { title: 'First benefit', body: 'One or two sentences on why this matters to the customer.' },
        { title: 'Second benefit', body: 'Keep the card texts about the same length so the row sits evenly.' },
        { title: 'Third benefit', body: 'End with the strongest one. People remember the last card.' },
      ],
    },
  },
  {
    studioName: 'Product cards (by SKU)',
    description: 'Live product cards from Carl Ras item numbers. Unknown SKUs are skipped silently.',
    section: {
      _type: 'productProof', _key: 'd6',
      eyebrow: 'Component · Products',
      headline: 'Real products, \n by *item number.*',
      sub: 'These four cards are fetched live from the product data.',
      skus: ['34011573', '34009021', '35011812', '35011846'],
    },
  },
  {
    studioName: 'Video gallery (partner films)',
    description: 'The partner film section in a lightweight player.',
    section: {
      _type: 'videoProof', _key: 'd7',
      eyebrow: 'Component · Video',
      headline: 'Films go \n *here.*',
      sub: 'The videos come from the partner YouTube channels.',
    },
  },
  {
    studioName: 'Pull quote (one big citation)',
    description: 'One large quote with attribution. Use when a single line carries more weight than a grid of testimonials.',
    section: {
      _type: 'quote', _key: 'd8',
      text: 'One strong sentence from a real customer beats three paragraphs of marketing.',
      attribution: 'Firstname Lastname', role: 'Carpenter, Copenhagen',
    },
  },
  {
    studioName: 'Testimonials (customer quotes grid)',
    description: 'The curated testimonial cards from the testimonial collection.',
    section: {
      _type: 'testimonialProof', _key: 'd9',
      eyebrow: 'Component · Testimonials',
      headline: 'What the *trade* \n says.',
    },
  },
  {
    studioName: 'Photo break (full-width image + caption)',
    description: 'A cinematic breather between heavy sections. Full-width photo, short caption bottom-left.',
    section: {
      _type: 'photoBreak', _key: 'd10',
      eyebrow: 'Component · Photo break',
      headline: 'A moment of *calm.*',
      sub: 'One caption line. Let the photo do the talking.',
      image: '/Images/campaign/tea.jpg',
    },
  },
  {
    studioName: 'Call-to-action banner (blue glow + buttons)',
    description: 'Centered conversion moment with primary and secondary buttons. Links resolve to the current market’s dealer (or the dealer chooser) and the store finder.',
    section: {
      _type: 'ctaBanner', _key: 'd11',
      eyebrow: 'Component · CTA',
      headline: 'Ready to *try* it?',
      sub: 'One line that removes the last doubt.',
      primaryLabel: 'Where to buy', secondaryLabel: 'Find your store',
    },
  },
  {
    studioName: 'Guarantee + numbered steps',
    description: 'The risk-reversal section: promise, numbered step cards, buttons and the guarantee modal.',
    section: {
      _type: 'guaranteeAsk', _key: 'd12',
      eyebrow: 'Component · Guarantee',
      headline: '*100%* happy. Or \n your money back.',
      sub: 'The step cards number themselves.',
      steps: [
        { title: 'Step one', body: 'Short and concrete. What does the customer do first?' },
        { title: 'Step two', body: 'Keep each step to one action.' },
        { title: 'Step three', body: 'End with the payoff.' },
      ],
      ctaLabel: 'Where to buy', secondaryLabel: 'Find your store',
    },
  },
  {
    studioName: 'Guarantee seal (peeling sticker)',
    description: 'The animated satisfaction-guarantee sticker. Peels open when scrolled into view; the lines are edited on the block, so each market shows its own. Tilt and peel depth are adjustable, and the text auto-fits so it never breaks out of the circle.',
    section: {
      _type: 'guaranteeSeal', _key: 'd12b',
      line1: 'SATISFIED', connector: 'or', line2: 'REFUNDED',
      subLine1: 'Not happy with STROXX?', subLine2: 'Your money back, right away.',
      tilt: -8, peelDepth: 0.22,
    },
  },
  {
    studioName: 'FAQ accordion',
    description: 'Questions and answers. Also feeds Google and AI answer engines via structured data.',
    section: {
      _type: 'faqSection', _key: 'd13',
      eyebrow: 'Component · FAQ',
      headline: 'Answers, \n *up front.*',
      items: [
        { q: 'How does a FAQ item look?', a: 'Like this. Question in the bar, answer folds out.' },
        { q: 'How many should a page have?', a: 'Four to six. Answer the real objections, skip the filler.' },
      ],
    },
  },
  {
    studioName: 'Newsletter signup',
    description:
      'Email signup form sending to the market’s email platform (chosen in Site settings → Newsletter). Also available site-wide as the band above the footer and an optional popup.',
    section: {
      _type: 'newsletter', _key: 'd15',
      eyebrow: 'Component · Newsletter',
      headline: 'Sharp offers, \n no *spam.*',
      sub: 'The monthly lineup and the sharpest prices, straight to your inbox.',
      buttonLabel: 'Sign up',
      disclaimer: 'Unsubscribe anytime. We only write when it is worth your time.',
    },
  },
  {
    studioName: 'Contact form',
    description:
      'Name/email/message form. Submissions POST to the webhook configured in the hosting environment (FORM_WEBHOOK_URL), e.g. a Zapier/Make flow into an inbox or CRM. Until it is configured, the form points politely to the phone.',
    section: {
      _type: 'contactForm', _key: 'd16',
      eyebrow: 'Component · Contact form',
      headline: 'Talk to \n *real people.*',
      sub: 'Project questions, bulk orders, or something the FAQ missed. Write, and a tradesperson answers.',
      topic: 'component-demo',
      buttonLabel: 'Send',
      successMessage: 'Thanks, we will get back to you within one working day.',
    },
  },
  {
    studioName: 'Spacer (empty breathing room)',
    description: 'Adds vertical space between sections. Three sizes. (Rendered below as the gap you are looking at.)',
    section: { _type: 'spacer', _key: 'd14', size: 'l' },
  },
  {
    studioName: 'Before / after slider (drag to compare)',
    description:
      'Two photos, a draggable divider. Proof beats claims: the reader sees the difference with their own hands. Works with mouse, touch and keyboard.',
    section: {
      _type: 'beforeAfter', _key: 'd17',
      eyebrow: 'Component · Before/after',
      headline: 'Drag. *See it yourself.*',
      sub: 'Swap these photos for a real before/after from a job.',
      beforeImage: '/Images/campaign/rings.jpg', afterImage: '/Images/campaign/tea.jpg',
      beforeLabel: 'Before', afterLabel: 'After',
    },
  },
  {
    studioName: 'Story cards (stack as you scroll)',
    description:
      'A 3-5 chapter narrative where each card stacks on the previous while scrolling. Built for job stories: the job, the tool, the result.',
    section: {
      _type: 'storyCards', _key: 'd18',
      eyebrow: 'Component · Story cards',
      headline: 'One job. *Three chapters.*',
      cards: [
        { title: 'The job', body: 'Set the scene in two sentences: the site, the deadline, the problem that needed solving.' },
        { title: 'The tool', body: 'Which STROXX tool went to work, and what it had to prove.', image: '/Images/campaign/rings.jpg' },
        { title: 'The result', body: 'What the customer got, in their own words if you have them. End on the outcome, not the product.' },
      ],
    },
  },
  {
    studioName: 'Logo band (partners, scrolling)',
    description:
      'Slow scrolling band of partner names or logos for instant credibility. Names render as wordmarks until logo files are uploaded.',
    section: {
      _type: 'logoMarquee', _key: 'd19',
      eyebrow: 'Component · Logo band',
      logos: [{ name: 'Carl Ras' }, { name: 'Meesenburg' }, { name: 'Foussier' }, { name: 'Lecot' }],
    },
  },
  {
    studioName: 'Hotspot image (clickable points on a photo)',
    description:
      'One photo with numbered points the visitor opens. Editors place the points by clicking the picture in the Studio; each point can link to a product by item number. Add more angles and the switcher above the photo appears, each angle carrying its own spots. Reusable: the same block sits on the Monthly lineup hero.',
    section: {
      _type: 'hotspotImage', _key: 'd21',
      eyebrow: 'Component · Hotspot image',
      headline: 'Every detail, *explained.*',
      sub: 'Tap a point on the photo. Each one carries its own title, text and, when you set one, a link to the product. This sample has two angles, so the switcher shows.',
      viewLabel: 'On site',
      image: '/Images/campaign/rings.jpg',
      spots: [
        { _key: 's1', title: 'The grip', body: 'Where the point sits on the photo is set by clicking the picture in the Studio.', x: 34, y: 38 },
        { _key: 's2', title: 'The head', body: 'Keep each card to a sentence or two: it opens small, on a phone as well.', x: 62, y: 30 },
        { _key: 's3', title: 'Link a product', body: 'Add an item number and the card links straight to that product page.', x: 48, y: 68 },
      ],
      moreViews: [
        {
          _key: 'v2', _type: 'hotspotView', label: 'In the hand',
          image: '/Images/campaign/glasses.jpg',
          spots: [
            { _key: 's4', title: 'Its own spots', body: 'Each angle carries its own points, so the back of a tool can be explained separately from the front.', x: 55, y: 42 },
            { _key: 's5', title: 'Switching closes the card', body: 'A card pinned to a point on the front would mean nothing over a photo of the back.', x: 30, y: 66 },
          ],
        },
      ],
    },
  },
  {
    studioName: 'Embed (form, map or video from another service)',
    description:
      'Sandboxed iframe from an approved provider with click-to-load (GDPR-clean: nothing loads before the visitor chooses). Script widgets go via GTM instead.',
    section: {
      _type: 'embed', _key: 'd20',
      eyebrow: 'Component · Embed',
      headline: 'A form, map or film *right here.*',
      sub: 'This sample embeds a YouTube player; forms and maps work the same way.',
      url: 'https://www.youtube-nocookie.com/embed/egSu462a-rI',
      height: 480,
    },
  },
];

export default function ComponentLibraryPage() {
  return (
    <main className="bg-ink">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-36 pb-10">
        <div className="eyebrow mb-6">Internal · Component library</div>
        <h1 className="h-display text-white text-[clamp(2.4rem,6vw,5rem)] leading-[0.92] mb-6">
          Every building block, <span className="text-stroxx-blue">live.</span>
        </h1>
        <p className="text-fog text-lg max-w-2xl">
          Every landing-page block rendered live with sample content; the name above each block is
          exactly what it's called in the Studio's &ldquo;Add item&rdquo; menu. The colors, typography and
          brand rules live on the <Link href="/brand" className="text-stroxx-blue underline underline-offset-2">brand guide</Link>.
          This page is internal and hidden from search engines.
        </p>
      </div>
      {DEMOS.map((d) => (
        <div key={d.section._key}>
          <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-16 pb-2">
            <div className="border-t border-line pt-6 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <div className="text-white font-medium">{d.studioName}</div>
              <div className="text-fog text-sm max-w-2xl">{d.description}</div>
            </div>
          </div>
          <LandingSections sections={[d.section]} />
        </div>
      ))}
    </main>
  );
}
