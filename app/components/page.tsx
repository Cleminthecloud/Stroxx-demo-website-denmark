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
  /* ── Focus on… blocks (October 2026), also available on campaign pages ── */
  {
    studioName: 'Text: headline + paragraph (+ button)',
    description: 'The quiet block between the louder ones: eyebrow, headline, one paragraph, optional button and a small note.',
    section: {
      _type: 'textIntro', _key: 'f1',
      eyebrow: 'Component · Text',
      headline: 'Say one thing *clearly.*',
      intro: 'Two or three sentences that carry one idea. No more, or it stops being a quiet block.',
      ctaLabel: 'Optional button', ctaHref: '/focus-on',
      note: 'An optional note in small print, e.g. where a number comes from.',
    },
  },
  {
    studioName: 'Numbered points with photo (tabs)',
    description: 'Three or four numbered selling points; on desktop the photo follows the selected point, on phones every point shows in full.',
    section: {
      _type: 'numberedTabs', _key: 'f2',
      eyebrow: 'Component · Numbered points',
      headline: 'Three reasons, *one tool.*',
      items: [
        { _key: 'a', title: 'The first point', body: 'One or two sentences. Each point gets its own photo in the Studio.' },
        { _key: 'b', title: 'The second point', body: 'Keep the titles short: they are the buttons on desktop.' },
        { _key: 'c', title: 'The third point', body: 'Arrow keys move between points, for keyboard users.' },
      ],
    },
  },
  {
    studioName: 'Comparison table (2 to 4 options)',
    description: 'Options side by side. Type + for a tick and - for a cross. One column can be highlighted. Scrolls sideways on phones with the row labels pinned.',
    section: {
      _type: 'comparisonTable', _key: 'f3',
      eyebrow: 'Component · Compare',
      headline: 'Which one *fits the job?*',
      cornerLabel: 'STROXX',
      columns: [
        { _key: 'a', name: '20 m on reel', note: 'Item 55011718', tag: 'Focus product', highlight: true },
        { _key: 'b', name: '50 m on reel', note: 'Item 55011719' },
        { _key: 'c', name: '20 m without reel', note: 'Item 55011716' },
      ],
      rows: [
        { _key: 'r1', label: 'Length', cells: ['20 m', '50 m', '20 m'] },
        { _key: 'r2', label: 'Supplied on a reel', cells: ['+', '+', '-'] },
        { _key: 'r3', label: 'Extendable with couplers', cells: ['+', '-', '+'] },
      ],
      notes: [{ _key: 'n1', title: 'A note under the table', body: 'Explain the one number people misread.' }],
    },
  },
  {
    studioName: 'Two-way comparison tiles (A versus B)',
    description: 'Each tile asks one question and answers it for two approaches. Wide tiles carry a "why it matters" line.',
    section: {
      _type: 'bentoCompare', _key: 'f4', title: 'The difference, tile by tile', labelA: 'Finger', labelB: 'Palm',
      tiles: [
        { _key: 'a', question: 'How much is read?', a: 'One fingertip. A small area.', b: 'The whole palm. Far more detail.', why: 'More detail, fewer false rejections.', wide: true },
        { _key: 'b', question: 'Worn or cracked hands', a: 'Ridges wear down.', b: 'Veins sit under the skin.', why: 'Works for hands that work.', wide: true },
        { _key: 'c', question: 'Wet or dirty hands', a: 'Dirt on the sensor', b: 'Held in front of the sensor' },
        { _key: 'd', question: 'Print left on the glass', a: 'Can be lifted', b: 'Nothing to copy' },
        { _key: 'e', question: 'Other ways in', a: 'Code or card', b: 'Code, card or app' },
      ],
    },
  },
  {
    studioName: 'Specifications (big numbers)',
    description: 'The hard facts as large numbers; pure whole numbers count up when scrolled into view.',
    section: {
      _type: 'specGrid', _key: 'f5', eyebrow: 'Component · Specs', headline: 'The numbers *behind it.*',
      specs: [
        { _key: 'a', value: '1500', unit: 'lumen', body: 'Per metre, 180 LEDs per metre.' },
        { _key: 'b', value: 'IP65', unit: 'sealing', body: 'Dust-tight and water-jet proof.' },
        { _key: 'c', value: '230 V', unit: 'ordinary socket', body: 'One plug for the whole length.' },
      ],
      note: 'An optional note under the numbers, e.g. that a total is calculated.',
    },
  },
  {
    studioName: 'Variant / fact cards (key-value rows)',
    description: 'A name, a one-line use and key/value rows per card; each card can link to the product at the visitor\u2019s dealer.',
    section: {
      _type: 'modelCards', _key: 'f6', title: 'Three lengths', intro: 'Same light per metre. Length changes total power and reach.',
      cards: [
        { _key: 'a', name: '10 metres', use: 'Corridor, basement', rows: [{ _key: '1', key: 'Length', value: '10 m' }, { _key: '2', key: 'Power', value: '150 W' }] },
        { _key: 'b', name: '20 metres', use: 'Our focus product', highlight: true, rows: [{ _key: '1', key: 'Length', value: '20 m' }, { _key: '2', key: 'Power', value: '300 W' }] },
        { _key: 'c', name: '50 metres', use: 'The whole floor', rows: [{ _key: '1', key: 'Length', value: '50 m' }, { _key: '2', key: 'Power', value: '750 W' }] },
      ],
    },
  },
  {
    studioName: 'Slider advisor (value → recommendation)',
    description: 'The visitor drags a slider and gets a recommendation. You set the steps as "up to X, recommend Y".',
    section: {
      _type: 'rangeAdvisor', _key: 'f7', title: 'Does it fit your door?', label: 'Door thickness', unit: 'mm', min: 40, max: 100, step: 1, defaultValue: 55,
      bands: [50, 60, 70, 80, 90, 100].map((u, i) => ({ _key: String(i), upTo: u, result: String(70 + i * 10) })),
      resultTemplate: 'Use spindle 8x8x{result} mm', valueLabel: '{value} mm door', resultLabel: '{result} mm spindle',
    },
  },
  {
    studioName: 'Safety notice (important box)',
    description: 'The one thing people must do, framed in red. Use sparingly.',
    section: { _type: 'safetyNotice', _key: 'f8', eyebrow: 'Important', headline: 'Always unroll fully *before switching on.*', body: 'Heat cannot escape a coiled reel.', sub: 'This applies to every length.' },
  },
  {
    studioName: 'Step-by-step list',
    description: 'Numbered steps with a bold lead-in, for installation and set-up.',
    section: {
      _type: 'stepList', _key: 'f9', eyebrow: 'Component · Steps', headline: 'Installed in *an afternoon.*',
      steps: [
        { _key: 'a', lead: 'Check the door.', body: '40 to 100 mm thick, flat and true.' },
        { _key: 'b', lead: 'Fit the case.', body: 'Then the cylinder and the strike plate.' },
        { _key: 'c', lead: 'Test.', body: 'Try the key, press the handle.' },
      ],
    },
  },
  {
    studioName: 'Explainer (levels, colour temperature, notes)',
    description: 'Teach one concept: a scale of levels (lux) or a colour-temperature strip (Kelvin), two notes and a read-more button.',
    section: {
      _type: 'explainer', _key: 'f10', eyebrow: 'Worth knowing', headline: 'What does *Kelvin* mean?', visual: 'kelvin',
      levels: [
        { _key: 'a', value: '3,000 K', kelvin: 3000, body: 'Warm, yellowish light.' },
        { _key: 'b', value: '4,000 K', kelvin: 4000, body: 'Neutral light.', chips: ['Workshop', 'Site'] },
        { _key: 'c', value: '5,000 K', kelvin: 5000, body: 'Closer to daylight.', chips: ['Detail'] },
        { _key: 'd', value: '6,500 K', kelvin: 6500, body: 'Cool, bluish white.' },
      ],
      axisLow: 'Lower Kelvin, warmer light', axisHigh: 'Higher Kelvin, cooler light',
      notes: [
        { _key: 'n1', title: 'For professional work light', body: 'Around 4,000 K suits most tasks.' },
        { _key: 'n2', title: 'Kelvin is not the amount of light', body: 'That is lumen.' },
      ],
    },
  },
  {
    studioName: 'People to call (specialists)',
    description: 'Named people with photo, store, role, short bio, tap-to-call and tap-to-mail.',
    section: {
      _type: 'peopleCards', _key: 'f11', eyebrow: 'Ask a specialist', headline: 'Call someone who has *seen it before.*',
      people: [
        { _key: 'a', name: 'Sample Person', role: 'Sales', location: 'Store, City', bio: 'One line on why to call them.', phone: '+45 00 00 00 00', email: 'name@example.com' },
      ],
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
