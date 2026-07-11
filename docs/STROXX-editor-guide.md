# STROXX website: editor guide
How to edit the site, build landing pages, manage stores, run the monthly lineup, and handle tracking. No coding needed.

Version 1.13 · July 2026

---

## 1. What you're working with

The STROXX site is code (that's what makes it feel premium), but everything an editor should change lives in a content studio called Sanity. You edit on a live preview of the real site: click text, type, watch it update as you type. Nothing goes public until you press Publish.

Two golden rules:

1. **You can't break the design.** Layout, animations and brand styling are locked in code. You edit words, images, products, stores and the order of sections.
2. **Nothing is live until you publish.** Every change is a draft first. Publish when ready, or schedule it.

## 2. Getting in

1. Go to the site URL followed by `/studio`.
2. Log in with your invited account (Google login works).
3. You land in the Studio. Your first stop is the **Welcome** tab: a personal hello, the two golden rules, and three steps that take you from zero to editing. After that, the two tabs you'll live in:
   - **Edit site**: the visual editor. The live site on the left, editing panel on the right. This is where you'll spend 95% of your time.
   - **Content**: every document, grouped into labelled sections so it reads top to bottom the way you think about the site, Pages, Support & QR codes, Products, News, Social proof & media, Stores, then Settings and System at the bottom. Open a group to see what's inside. Useful for creating new things and finding things. Each document in a list shows its live address and its language under the title (a campaign page reads "/campaign/sommer · Dansk", a trade page "/trades/toemrer · English (base)"), so you always know where a document publishes and which translation you are looking at before you open it.

## 3. Editing text on a page

1. Open **Edit site**.
2. Steer the preview to the page you want (use the address bar above the preview, or click through the site like a visitor).
3. Hover over any text: a blue outline appears. Click it.
4. The matching field opens on the right. Type. Your keystrokes stream into the preview live.
5. Done? Press **Publish** (bottom right of the panel). Until then it's a draft only editors see.

### Text formatting codes
Two small codes give you the site's signature typography:

- Wrap a word in asterisks for the blue accent: `Without the *brand* tax.` renders "brand" in STROXX blue. One word per headline reads best.
- Press Enter inside a headline field for a line break exactly where you want it.

## 3b. Images and media

Image fields (the hero background, photo break, split block, specialist and store manager portraits) have an **"Image (upload or pick from media library)"** field: click it to upload from your computer or browse everything already uploaded, then drag the crop/focus point so the important part stays visible at every screen size. Uploaded images override the technical "path" fallback fields below them, which you can ignore.

Video works two ways: the **Film (YouTube)** collection for the film sections (paste a YouTube ID), and the hero block's **background video URL** for a looping ambient .mp4 behind the headline (your uploaded image doubles as its poster).

Photography ground rules: the design converts photos to black and white automatically, use high-resolution originals (2000px+ wide for full-bleed), and landscape orientation for heroes and photo breaks.

## 4. Editing the homepage

The homepage is one document ("Homepage" under Content, or click any headline on the front page in Edit site). Editable: the giant hero headline (one field, press Enter where the line should break, each line animates in separately), the claim and its subtext, the marquee text, the range and scale sections with their two-column texts, the stats band (numbers, suffixes, labels), the specialists headline, the guarantee headline and text (and the peeling guarantee sticker's lines), the Tool of the Month intro, the categories headline, and the final buy-button label.

Headlines that mix white and blue (the claim, the Tool of the Month headline) are one field: the part you wrap in *asterisks* renders blue, and Enter breaks the line.

**The campaign band (box 8 · Campaign photo band) is fully editable and swappable.** Its eyebrow, headline, text and both button labels are their own fields now, so you can click any of them on the page and edit them, and the cross-fading photos are uploadable (three recommended). The "Read more" button is wired to a campaign landing page rather than a fixed address: set **Read more → campaign page** to whichever Landing page the band should promote, and the button links straight to that page's /campaign/… address. To **swap the campaign**, point that one reference at a different, or brand-new, Landing page, no developer and nothing else to touch. The current campaign, "Campaign: Try It", lives at /campaign/try-it (the older /try-it address redirects there automatically).

The panel is organised as **ten numbered, collapsible boxes in the order the page scrolls** (1 · Hero down to 10 · Categories + final CTA), so what you see in the panel mirrors what you see on the page. They start collapsed for the overview; clicking text on the page opens the right one automatically.

**Showing and hiding sections (per market).** Every section except the hero has a "Shown on the site" switch at the top of its box. Markets differ, so a market that has no specialists yet, or no campaign photos, simply switches those sections off; nothing else moves. Two rules: if a menu link points at a hidden section (e.g. Tool of the Month), remove that link too under Site settings → menus, and remember the switch hides the section for everyone visiting that market's site, it is not a draft.

Not editable by design: the bag animation and all motion, the category data and product cards (they come from the product feed), and the order of the homepage sections (the flagship's composition is locked; landing pages are where you reorder freely). Any field left empty simply shows the original copy, so you can never blank the front page.

## 5. Moving, adding and removing blocks (landing pages)

Landing pages are built from **sections** (blocks). The full menu:

- **Hero: full-screen photo or video**, with text position (left/center/right) and three heights
- **Big statement**, the signature huge scroll-animated headline with paragraphs
- **Headline + animated number stats**
- **Image + text, side by side**, with switchable image side and optional button
- **Feature cards**, a 3-up frosted-glass grid for USPs and promises
- **Product cards (by SKU)**, live products from item numbers
- **Video gallery**, the partner films
- **Pull quote**, one big citation
- **Testimonials**, the customer quote grid
- **Photo break**, a full-width cinematic image with caption
- **Call-to-action banner**, headline + buttons on the blue glow
- **Guarantee + numbered steps**
- **Guarantee seal (peeling sticker)**, the animated satisfaction sticker that peels open when scrolled into view; edit its lines here so each market shows its own, and set its tilt and peel depth
- **FAQ accordion**
- **Before / after slider**, two photos with a draggable divider, let people see the difference
- **Story cards**, a 3-5 chapter narrative that stacks as the reader scrolls (the job, the tool, the result)
- **Logo band**, a slow scrolling strip of partner names or logos
- **Embed**, a form, map or video from another service (see the embed rules below)
- **Spacer**, empty breathing room in three sizes

**Embed rules.** The Embed block accepts pages from **approved providers only** (Typeform, Microsoft and Google forms, Google Maps, YouTube, Vimeo, and Carl Ras/STROXX pages). Paste the provider's https share/embed address and set a height. Visitors see a "Load content" card first and nothing is fetched, and no cookies are set, until they click, which keeps embeds GDPR-clean. Need another provider? Ask the developer to approve it (one line of code, deliberately). Anything that wants a `<script>` tag never goes in the CMS; those widgets are installed via Google Tag Manager.

**The brand itself** lives at **/brand** (also the Studio's **Brand** tab): the colors and rules, downloadable Adobe swatches and CSS tokens for designers and developers, and the written brand guide, which grows over the summer, including when you speak as STROXX the brand and when as the STROXX dealer.

**See them all live**: open **/components** on the site. Every block is rendered there with sample content, its exact Studio name and a short description. Browse it before building a page.

1. In Edit site, click any section on the page (anywhere in the block works, not just text). The section opens on the right.
2. Click **Sections** in the breadcrumb at the top of the panel to see the whole list of blocks on the page.
3. **Reorder**: grab the dots handle on the left of a block and drag it up or down. The preview reorders instantly.
4. **Add**: press **Add item**, pick a block type, fill in the fields.
5. **Remove**: the three-dot menu on a block, then Remove.
6. Publish when the page is right.

### Picking products for a block
Product blocks (Product proof, and the monthly lineup) reference products by their **item number (SKU)**, for example `34011573`. The site fetches name, photo and specs automatically. A typo'd SKU is simply skipped, it never breaks the page, but double-check the numbers against the webshop.

## 6. Creating a new landing page

1. Go to **Content** → **Landing page** → create a new one.
2. Give it an internal title (e.g. "Summer campaign") and press Generate next to the slug. The slug becomes the address: slug `sommer` publishes at **/campaign/sommer**.
3. Add sections (start with a Photo hero, end with Guarantee + steps and FAQ, that arc converts).
4. Fill in SEO title and SEO description, that's what Google shows. They live in the page's **SEO + sharing** tab (the editing panel has two tabs: Content for the sections, SEO + sharing for search and social), and the Studio warns you when a title or description is long enough that Google would cut it off, fix it before publishing. Optionally upload a Share image (1200x630) for how the page looks when shared on LinkedIn or Facebook; empty means the site-wide one is used. The live Google/share preview under the fields shows the address exactly as this language's market publishes it: a Danish page previews /dk/campaign/…, the English base previews the root address.
5. Open **Edit site** and steer the preview to /campaign/your-slug to fine-tune visually.
6. Publish. The page is live at its address immediately. Share the link in newsletters and SoMe.

Tip: fastest way to a new page is duplicating an existing one: three-dot menu on "Campaign: Try It" → Duplicate, then change slug and copy.

**Nesting and moving pages**: use / in the slug to nest, slug `sommer/tilbud` publishes at /campaign/sommer/tilbud. Moving a page is simply editing its slug, and when you publish, the site automatically creates a permanent redirect from the old address to the new one, so shared links keep working. (Support pages are the exception to casual renaming: their addresses are printed on packaging QR codes, so leave those slugs alone.)

## 7. The store finder (map)

Every store on /stores is a **Store** document (Content → Store). The map, the list, the search and the "nearest store" suggestions all read from these documents.

- **Country decides where a store shows.** Every store has a **Country** (Denmark, Germany, France or Belgium). Each local site shows only its own country's stores; the international (English) site shows every store across Europe and zooms out to the whole map, which is the point, it puts STROXX's real reach on show. So set the country correctly and the store lands on the right maps automatically. (Fallback if a market has no stores of its own yet: all countries, all stores.)
- **Edit a store**: the form is grouped into collapsible boxes, Location, Contact (store), Store manager, Opening hours, and Shop-in-shop + visibility, so the map fields and the people fields stay apart. Opening hours use a decimal clock (6.3 means 06:30, 16 means 16:00, the fields explain it); latitude and longitude come from Google Maps (right-click the store on the map, the two numbers at the top of the menu, first is latitude), and the Studio flags a number that can't be a European coordinate.
- **Add a store**: create a new Store document. It needs a **Country**, coordinates (latitude/longitude, copy them from Google Maps: right-click the location → the numbers at the top), and address. Region is a free-text label (optional) used to group stores in the list. Publish and it appears on the map.
- **STROXX Specialist (optional).** Each store can name one person as its STROXX Specialist, a dedicated contact who knows the range. Open the collapsible "STROXX Specialist" block on the store and fill in name, role, photo, email and phone. When set, it shows as a small card on that store, so customers reach the right person directly. Leave it empty and the store simply shows no specialist. This replaced the old separate "Specialists" page: specialists now live on the store they belong to. The count of stores that have a named specialist also feeds the Dashboard's brand-footprint tiles (section 9).
- **Named manager vs store contact.** Danish stores show a named store manager with a photo. The dealer stores abroad (Meesenburg in Germany, Foussier in France, Lecot in Belgium) usually have no named manager, so leave the manager fields empty and fill **Store phone / Store email** instead, they show as a plain "Contact the store" line. Set **Brand** to the local dealer for those. Opening hours are optional: leave them empty and the hours line simply doesn't show.
- **Take a store off the site**: flip "Active" off, no deleting needed.
- **Privacy matters**: both the manager's and the STROXX Specialist's photo and direct phone are personal data. The relevant "consent given" flag must be on before publishing those details; while it is off, the site quietly hides them. The flag sits right next to the photo and phone it governs, and the Studio shows a warning if a photo or direct phone is filled in while consent is off. If someone leaves or withdraws consent, clear the fields or flip the flag.

## 7b. People, voices, films and legal pages

Four more collections under Content, all with the same pattern (edit, Active on/off, publish):

- **Specialist**: the trade specialists on the homepage cards and product pages (this is separate from a store's STROXX Specialist in section 7, which is the per-store contact). The "Quote topic" field matters: if a quote names a product or category, pick that category from the list (it is a picklist now, no slugs to remember) so the quote only ever appears on matching products. Consent flag before publishing photo and direct phone; the Studio warns if details are filled while the flag is off. Specialists are per language/market: each market shows its own people, and until a market has any, visitors there see the English base set. To reuse a specialist in another market, open them and use the globe translations menu (section 7d).
- **Testimonial**: customer quotes. Link one to a product SKU and the product page shows it as a review, including to Google. The trades picklist controls which trade pages show it: tick the trades the quote suits. Testimonials are per language/market too, so a Danish carpenter's quote only appears on the Danish site; share one into another market with the globe translations menu (section 7d) and translate the quote.
- **Trade (fag page)**: the trade areas on /trades, each with its own page at /trades/<slug> (Carpenter, Electrician, Plumber, Painter, Bricklayer today). You can add a trade, retire one (Active off), reorder them (Sort order) and edit the headline, blue accent, blurb and trade FAQ. Tick the product categories the trade buys from and the product cards pick themselves, top 3 on the card, top 8 on the page. The "Blue part of the headline" must be the exact ending of the headline, letter for letter; the Studio warns you when it isn't, and the blue accent simply won't show until it matches. Testimonials ticked with the trade appear on the page automatically.
- **Film (YouTube)**: the partner films. Paste the YouTube video ID, mark one as featured for the big player. Films are per language/market like specialists: each market's film sections show its own films (a Lecot film belongs to Belgium), with the English base set as the fallback; copy one into another market with the globe translations menu (section 7d). Films you pick by hand on a page (the film pickers) are not filtered, a picked film always shows on that page.
- **Legal page**: privacy, cookies and terms, formatted text served at /privacy, /cookies and /terms (also linked in the footer). Placeholder text renders until legal delivers the real content.
- **News article**: news and stories at /news, newest first, shown as glass cards matching the product pages. Articles render as long-form editorial: images you add in the body automatically display WIDER than the text for that magazine feel, a **Product slider** block can be added anywhere in the article (type 3+ item numbers, the cards with photos and buy links build themselves), articles with 3+ subheadings get an automatic "In this article" jump list, and readers see reading time and a progress bar. Headline, hero image (fill in the alt text), excerpt, formatted article with inline images, own SEO fields and share image. The editing panel is split into three tabs, Article (the text and images), Products + tags, and SEO + sharing, and the SEO fields warn when Google would cut the title or description short. **Tags** (type + Enter) become the filter chips on the news page automatically: tag by trade and topic (Carpentry, Electrical, Plumbing, Painting, Masonry, Tips, Specialist advice, Safety, Regulations, Tools) and reuse existing tags rather than inventing near-duplicates, that keeps the filter row useful. The news index only appears in the sitemap once the first article is published. Tip: add /news to the menu or footer under Site settings when you start publishing.
- **Redirect**: send an old URL to a new one, live within a minute, no developer needed. The classic use: a campaign page gets renamed but the printed QR code or newsletter link must keep working. "From" is the old path on this site, "To" is the new path or a full https:// address. Keep "Permanent" on unless it is a short-lived swap.
- **Support page**: manuals, software guides and brochures for a product, served at /support/<slug> (with an overview at /support). You upload the PDFs (or a video, MP4, which plays inline) straight into the page, grouped by language; swapping a file updates every download link instantly. The MMEXO exoskeleton films live this way at /support/mmexo. Section 10e has the full workflow, including the packaging QR codes.
- **QR code**: a managed short link for print, stroxx.eu/qr/<code>. Change its target any time and every printed code follows along; every scan is counted in the Dashboard. Section 10e explains when to create one.

Also worth knowing: the **Contact form** block (in the landing-page "Add item" menu) gives any page a name/email/message form. Where submissions land (inbox, CRM) is configured once by the developer; until then the form politely points to the phone.

## 7c. Where to buy and the dealer chooser

Buy is market-aware, and you do not set it per button. On a single-dealer market the Buy buttons link straight to that market's dealer: Denmark to Carl Ras, Germany to Meesenburg, France to Foussier, Belgium to Lecot. On the international site there is no single dealer, so every Buy opens a **Where to buy** chooser that lists all the dealers with their phone and website, and the homepage carries the same directory as a section. Dealer names and contact details live on the **Market** documents; they are looked after by the developer (a change is pushed to the CMS with a short seed step), so if a dealer detail is ever wrong, tell the developer rather than hunting for a field. The guarantee seal, the guarantee text and page copy stay yours to edit as normal.

The Market document also carries your market's operations, and these two boxes ARE editable in the Studio (Settings, then Markets, open your market):

- **Tracking + consent**: the market's Google Tag Manager container ID and its Cookiebot consent banner ID. One market, one set of IDs; Belgium's Dutch and French pages share them. The consent banner gates the tracking automatically. The international version normally leaves both empty.
- **Newsletter (provider + keys)**: the signup on/off switch, the email platform (Mailchimp, Klaviyo, Adobe Marketo or a webhook), its keys (encrypted in your browser before saving) and the audience/list ID, with a connection status light at the top. The signup form's words stay per language in Site settings (section 10a).

One writing rule that keeps the international site honest: **the English version of any page is also the international site**, so English button labels and copy never name one dealer ("Where to buy", not "Buy at Carl Ras"). Your own market's language version is exactly where the dealer name belongs.

## 7d. Languages: translating a page

The site publishes in English (the international reference) plus each market's language, and every page lives once per language. To create a language version of a page: open the page, use the **translations menu** (the globe icon in the document's top bar) and pick the language; the Studio creates a linked copy you translate and publish. Translate the content, keep the structure: blocks, images and product pickers carry over. Two habits make this painless. Translate from the English version (it is the reference the site falls back to while a translation does not exist yet), and never touch the small read-only "language" field on documents, it is how the site knows which market sees what. Support-page addresses are printed on packaging, so their slugs stay identical across languages. Content lists make translations easy to tell apart: every document shows its language next to its live address, and the SEO/share previews on a translated page show that market's own address (a Danish campaign page previews /dk/campaign/…).

## 8. Månedens STROXX (the monthly lineup)

The document **Monthly lineup** drives the Tool of the Month page and the homepage section. Changing the month is one edit:

1. Content → **Monthly lineup (Månedens STROXX)** → open the current document (or duplicate it for the new month).
2. Work through its four boxes, top to bottom: **When it goes live** (month name as it should read on the page, four-digit year, and the optional go-live date), **Hero of the month** (the hero SKU plus its claims/cases/FAQ, the story), **The five winners** (the five SKUs, drag order is display order), and **News + films**.
3. Publish. Homepage and /monthly update together, same lineup everywhere.

## 9. Site settings (footer, hours, microcopy)

Content → **Site settings**. One document per language that feeds the whole site, organized in tabs. It opens on the everyday tab, Menu + footer; the others follow in order of how often you need them (Microcopy, SEO + AI engines, Newsletter, Technical (developer)):

- **Dealer name, customer service phone, footer legal line and dealer logo come from the MARKET document** (Settings → Markets), not from here: edit the market and the footer, mobile menu, chat handoff and guarantee pop-up all update together. The international version deliberately has no dealer, so those spots simply hide there. **The market's tracking IDs (GTM, Cookiebot) and its newsletter setup (provider, keys, on/off) also live on the Market document** since these are per market, not per language; sections 10 and 10a explain where.
- **Menu and footer links** (Menu + footer tab): the top navigation (first four show on desktop, all in the mobile menu) and the footer's Pages and Buy columns. Leave empty to use the built-in lists. The header logo override lives here too.
- **Customer service hours** (Menu + footer tab): the localized hours text under the dealer's phone in the footer. This is per-language display copy, which is why it lives here rather than on the market. Leave it empty on the international version, the seed keeps the English base dealer-neutral by clearing it. (Store opening hours are separate: each store document carries its own hours, shown in the store finder.)
- **News section enabled** (Menu + footer tab): markets without a blog switch news off here; /news and every article return "page not found" and leave the sitemap. Remove News menu/footer links too.
- **The guarantee's full terms are their own page**: the Legal page document with the slug "satisfaction-guarantee" renders at /satisfaction-guarantee, and every "Read the full terms" link on the site points there. Edit the text like any other page; each market gets its own translated version. (This replaced the old static PDF, whose address now forwards to the page.)
- **Microcopy tab**: every small text on the site lives here, grouped into collapsible boxes by the page it appears on (Footer, Chat, Pro Club, News page, Newsletter form, Products page, Stores page, Service page, Support index, Trades page, 404 page). Open the box for the page you are editing: the footer's about paragraph (partner names turn into links automatically), the chat switches plus its button label, panel copy, greeting and fallback answer, the Pro Club box on product pages, the page headlines and intros for Products, Stores, Service and Trades (*word* = blue accent), the whole Service page (guarantee, returns, FAQ, documents and contact copy), the Support index headline and intro, the news page headline and empty state, the newsletter success message, and even the 404 page. Change the words, publish, done.
- **Chat switches** (Microcopy tab, Chat box, next to the chat copy): "Show Talk to a specialist chat" hides or shows the floating chat button on the whole site. The separate "AI specialist chat" toggle controls whether it answers with AI (section 10b).
- **SEO: site title and description** (SEO + AI engines tab): the defaults Google and social shares use when a page has no specific ones. Individual landing pages set their own in their SEO fields. The site-wide share image is a developer-managed file path on the Technical (developer) tab; the live preview here still shows it.
- **AEO: llms.txt content** (SEO + AI engines tab): the brand summary AI answer engines (ChatGPT, Perplexity, Google AI) read at /llms.txt. Keep the facts identical to the site, consistency is what makes engines quote you. This same text is also the brain of the site's own AI chat (see section 10b).
- **Newsletter tab**: the signup form's words for this language (headline, text, button label, consent line) plus the band and popup switches and the popup rules. The provider, its keys and the master on/off switch live on the Market document (section 10a).
- **Technical (developer) tab**: the developer's shelf, not part of everyday editing. It holds the planned PIM product feed URL and DAM image base URL (where this market's product data and images will come from once those integrations ship; URLs only, API keys and secrets never go in the CMS, they live in the secured hosting environment) and the site-wide share image path. If something there looks wrong, tell the developer rather than editing it.

## 10. Analytics and tracking (GTM)

The site loads Google Tag Manager when a container ID is set on your market's **Market** document. Per market on purpose: each market has its own container, and Belgium's two languages share one. That means marketing can add and change tags without anyone touching the website:

1. Create a container at tagmanager.google.com (or use the existing one). Copy the ID, it looks like `GTM-XXXXXXX`.
2. Studio → Content → Settings → **Markets** → open your market → **Tracking + consent** box → paste it into **Google Tag Manager container ID** → Publish.
3. From now on, everything happens inside GTM: GA4, Meta pixel, LinkedIn tag, conversion events. No deploys, no developer.
4. Leave the field empty to switch tracking off entirely.

What to measure first: clicks on the **Buy** button (the site's money event, market-aware: it links to the local dealer, or opens the "Where to buy" chooser on the international site, and the dealer links carry UTM tags), store-finder usage, and visits to the guarantee terms page.

The cookie consent banner sits right next to it: paste your market's Cookiebot ID (CBID from manage.cookiebot.com) into **Cookiebot consent banner ID** in the same Tracking + consent box, and the banner appears on your market's pages, auto-blocking tracking until visitors consent (it gates GTM). Required before real traffic in the EU. Empty = off. The international version normally leaves both fields empty.

## 10a. Newsletter signups

The newsletter is split by ownership. **The setup is per market** and lives on the Market document (Settings → Markets → your market → **Newsletter (provider + keys)** box): choose the email platform (Mailchimp, Klaviyo, Adobe Marketo, or "Other", a webhook for anything else, e.g. via Zapier), enter its key (encrypted in your browser before saving, so it is safe to enter there), set the audience/list ID and switch the signup on. A status light at the top of the box tells you whether the connection works. Belgium sets this up once; both languages use it. **The words are per language** and stay in Site settings → Newsletter tab: headline, text, button label, consent line, plus the band and popup switches and the popup rules.

Where signups appear:

- **The band above the footer**: a designed full-width signup section on every page. On/off in the Newsletter tab.
- **The popup**: optional, with behavior rules you control: show after N seconds or after scrolling N% (whichever comes first), at most once per N days, and never again for people who subscribed. Off by default, popups convert but annoy, use with taste.
- **The landing-page block**: add a "Newsletter signup" section to any campaign page, with its own copy.

All three send to the same platform, your market's. Switching provider later is changing one radio button on the Market document and entering the new platform's key in the fields that appear.

## 10b. The AI assistant, and how to train it

The "Talk to a specialist" chat is a hybrid. Practical questions (guarantee, nearest store, product search) get instant built-in answers with cards and links. Free-form questions are answered by AI, grounded strictly in your content, and the human handoff is always one "yes" away.

**Training it is editing text, not machine learning.** The AI reads, live, from:

1. **The "AEO: llms.txt content" field in Site settings**, its main brain. Write everything it should know here in plain language: what STROXX is, the guarantee terms, who sells STROXX in each market (Carl Ras in Denmark, Meesenburg in Germany, Foussier in France, Lecot in Belgium), what makes the price possible, tone of voice. If the AI gives a wrong or missing answer, add or correct the fact here and it knows it immediately.
2. **The market's dealer facts** (dealer name and customer service phone come from the Market document) and the product category list.

Rules it always follows: it never invents prices, stock or specifications (it points to the shop instead), it stays on topic, and it offers the human handoff for anything sensitive. Test it after editing: open the chat and ask the question a customer would.

Switches: "Show Talk to a specialist chat" (the button itself) and "AI specialist chat" (AI on/off; when off, the built-in answers still work), both in Site settings → Microcopy → Chat, right next to the chat's copy. The AI also requires a one-time API key set up by your administrator in the hosting environment. Already have a chat product like Intercom or Zendesk? Its widget can be added through Google Tag Manager instead, no code needed; just switch the built-in chat off here.

## 10c. The Article AI (ideas, drafts and LinkedIn posts)

The **Article AI** tab in the Studio's top bar is your writing partner for the news section. Four modes:

1. **Article ideas**: six recommendations for what to write this week, per market or all markets combined. It searches the live web for what the trades world is discussing right now (regulations, seasons, industry news) and shapes ideas around it, each with a headline, the angle, real search phrases, a LinkedIn hook and hashtags. Question-shaped headlines are deliberate: articles that answer a question directly are what AI assistants (ChatGPT, Perplexity, Google AI) quote, which puts the brand inside AI answers in every market.
2. **Draft an article**: paste an idea and get a complete draft: article, excerpt, SEO title + description, a share-image suggestion and a ready LinkedIn post. Paste the pieces into a new News article document, add the image, publish.
3. **Polish my draft**: wrote it yourself? It keeps your voice, tightens the opening, and tells you what it changed so you learn for next time.
4. **LinkedIn post**: paste a finished article and its address; get two post variants with hooks and hashtags (the hook matters more than hashtags these days).

The LinkedIn workflow that drives traffic: publish the article → open it on the site → use the Share row at the bottom (LinkedIn button or Copy link) → paste the post from the Article AI. The link preview card on LinkedIn is built from the article's SEO title and share image, so fill both in before sharing; a good share image does half the work.

**See the card before you post:** every article shows a live preview of its link card at the bottom of its own editing form, built from the SEO title and share image as you type. If the card looks thin, fix those fields right above it and publish. The same kind of live preview (Google result + shared-link card) sits under the SEO fields on Site settings and on every landing page. Instagram note: no link cards in the feed, so use the share image as the post and put the link in a Story sticker or the bio.

It follows the same rules as the chat: grounded in your llms.txt brand facts, and it never invents prices, specs or statistics.

## 10d. The Dashboard (your site's own numbers)

The **Dashboard** tab shows what is happening on the site, counted by the site itself: daily pageviews, where visitors come from (LinkedIn, Facebook/Instagram, X, WhatsApp, search, AI assistants, email, direct), the most read pages, article performance, and clicks out to the partner webshops. No setup, no cookies, no consent banner needed, it is anonymous counting.

How to read it, the customer journey in one line: **source → article or landing page → product page → partner webshop click**. When you share an article on LinkedIn (section 10c), check the Dashboard the next day: the LinkedIn source and that article's reads should move, and ideally the partner clicks follow. That connection, from post to shop click, is the whole game.

**Copy report** turns any period (7, 30 or 90 days) into a tidy text summary you can paste into an email or a meeting note, and **Download PDF** produces a designed one-pager (KPIs, charts, the journey note) ready to attach or print for a meeting: pick "Save as PDF" in the print dialog that opens. A weekly rhythm works well: share Monday, report Friday.

This dashboard teaches the basics honestly. When the team wants funnels, conversion goals and ad audiences, that is what Google Tag Manager plus a consented analytics tool adds (section 10), on top of, not instead of, these numbers.

Also on articles, and the card rules (so pages always look intentional):

- **Tools mentioned** (the "Related products" field on an article): the **first 4** SKUs show as one clean card row, so put the most relevant first.
- **Read next**: always the **3 latest** other articles, fully automatic, nothing to maintain.
- **Product slider** (inside the article text): **all** the SKUs you add are shown; the row scrolls and gets arrows. 3-8 products read best.
- **News page**: every published article, newest first; the tag chips filter them.

Every product card links on to the partner webshop, and those clicks show up in the Dashboard.

The Dashboard always shows the full layout, even before the first visit: zeroed cards are the map of what will fill up. A **QR scans** card counts every scan of the managed /qr/ short links (section 10e).

A **Brand footprint** row shows two live totals pulled straight from your content: **STROXX stores** (every active Store document) and **STROXX specialists** (the active stores that have a named STROXX Specialist, section 7). They update themselves as you add stores and name specialists, a running measure of the brand's real-world reach, good for a meeting slide or a partner update.

## 10e. Support pages and QR codes (the packaging workflow)

Product packaging carries QR codes, and those codes carry real traffic: the ST-2 Smart Lock support page alone gets roughly 390 scans a month. This section is how that world is managed here, without ever breaking a code that is already printed.

**Support pages (Content → Support page).** Each page is a product's manuals and guides at stroxx.eu/support/<slug>: a headline, an intro line, and download groups (one per language) where you upload the PDFs, or a video (MP4) that plays inline, directly (the MMEXO instruction and promo films are set up this way at /support/mmexo). Set each file's Language on the download so the site knows what language it is, and can show each market its own language later. Swapping a file updates every link on the site instantly, and old links to the previous file keep working too. Two pages exist from day one, ST-2 Smart Lock and the XLOCK software guide, at the exact addresses the printed QR codes already point to. That address rule matters: **if a printed code points at an old /pages/<something> address, give the support page that exact slug** and the code keeps working, the site forwards it automatically.

**QR codes (Content → QR code), for everything printed from now on.** A QR code document maps a short link like stroxx.eu/qr/st2 to any target: a support page, a campaign page, even an external address. The printed artwork encodes the short link, never the final page, so you can repoint a code per campaign, per season or per language forever, without reprinting a single box. Every scan is counted in the Dashboard's QR scans card, which nobody could see before. Two golden rules: **never change a code that is already in print** (change its target instead), and never point print at an internal file address, always at a /qr/ short link.

**The print workflow with the packaging designer.** New packaging, flyer or display with a QR code on it:

1. Create the support page (or campaign page) the code should land on, and publish it.
2. Create the QR code document: a short code (e.g. st2-v2), a label people understand ("ST-2 packaging 2027"), and the target.
3. Send the designer the full short link (https://stroxx.eu/qr/st2-v2), and ask her to generate the QR graphic from exactly that address.
4. When the PDFs behind the page change (a new manual version, a new language), upload the new file on the support page. Nothing in print changes.
5. Watch the scans in the Dashboard; if a campaign ends, repoint the code rather than letting it dead-end.

Today the packaging design and the PDFs are produced externally (Kreativ Zone / Meena Bøgh Søderstrøm has done this for STROXX). The handshake with any designer stays the same: **they get the /qr/ short link from you, and you get the PDFs (and any videos, like the MMEXO films) from them** and upload them to the support page yourself, so the files live in the CMS, not on a designer's server or an old webshop.

**Where the documents come from.** Three sources, in order:

1. **The one-time rescue import.** The nine manuals and software guides that exist today (ST-2 Smart Lock in five languages, XLOCK software incl. Spanish) live on the old stroxx.eu webshop's file storage, which disappears when that shop is closed. The developer runs a one-time import that downloads them and creates the two support pages with the files attached; from that moment the CMS is the only home the files need. If /support says "Nothing published yet", this import simply has not been run yet.
2. **Product suppliers, via Carl Ras.** Going forward, manuals, declarations and software guides for a product come from whoever sources that product (purchasing/product management at Carl Ras, or the supplier directly). Whoever receives a new or updated PDF sends it to an editor, and the editor uploads it to the product's support page, two minutes, no developer. Which department officially owns "manuals source of truth" is one of the open questions Carl Ras IT is asked in the technical hand-over document; until it is answered, the working rule is: the person who receives the file uploads it (or mails it to whoever has Studio access).
3. **The packaging designer**, for anything created as part of new packaging or campaigns, per the workflow above.

## 10f. The test page and feedback (finding bugs together)

The site has a hidden test-drive page at **/test**: a short guide of six real journeys to try (find a tool, find a store, scan the QR, read and share an article, ask the assistant, judge the guarantee) and a report form at the bottom. Testers can attach up to four images (PNG/JPG/WebP, large photos are downscaled automatically in the browser) and paste links straight into the text. It is not in any menu and not in Google; you invite testers simply by sending them the link. No account or login is needed, testing the site and editing the site are two different things.

**Where the reports go.** Every submission lands in Content → **Feedback (test reports)**, newest first, with the tester's device and browser attached automatically (so "it looked odd on my phone" arrives with the phone included). Reviewing is a two-minute routine:

1. Open Content → Feedback. New reports are marked with a dot.
2. Read the report, look at the page it mentions on the device type it mentions.
3. Set the status: **Reviewed** (seen, on the list), **Fixed** (done), or **Won't fix** (a choice, not a bug). Add an internal note if the reasoning is worth keeping, the tester never sees it.

Reports are read-only by design (the record of what testers actually said stays intact); only status and the internal note are yours to edit. Rule of thumb for inviting: send /test to colleagues, friendly customers and the client team, and ask for bluntness. One report per finding beats one long email.

## 11. Products, prices and images (PIM and DAM)

**You never maintain products by hand.** The site reads the Carl Ras product range (358 STROXX products today) with names, specs, categories and photos. Editors only ever point at products by SKU.

- **PIM (product data)**: currently a snapshot of the Carl Ras range. The production build connects directly to the Carl Ras product API on a schedule, so new products, name changes and assortment changes flow in automatically. If the feed ever fails, the site keeps the last good catalogue, it never goes blank.
- **DAM (images)**: product photos come from the Carl Ras media bank (Digizuite), preferring the transparent cut-out renditions that make the dark design work. Production moves to a pre-processed image pipeline. Waiting on: API access and a bulk export of transparent renditions from the Carl Ras DAM team.
- **Product augment (in the Studio now)**: a marketing layer per SKU: copy overrides, comparison reference prices, featured flags. The product feed stays the source of truth; this only decorates it. Comparison prices need legal sign-off per market before going live.

## 12. Publishing, history and roles

- **Draft vs published**: drafts are private to editors. Publish makes it public within a minute.
- **History**: every document keeps its revision history, open the three-dot menu → Review changes to compare and restore. You can always roll back.
- **Scheduled publishing**: set a publish time on a draft (campaign launches at 06:00 without anyone awake).
- **Inviting new team members** (administrators): open the **Welcome** tab and follow "Invite a colleague": one button opens Sanity's member management (choose the **Editor** role for content people), and a ready-made welcome message points the newcomer straight back to the Welcome tab so they onboard themselves.
- **Roles**: Administrators manage everything; Editors create and publish content; Contributors draft but can't publish; Viewers see previews. Ask your site administrator for invites.

## 12b. The team: inviting and removing members (administrators)

The whole invite flow, start to finish:

1. **Start in the Studio**: open the **Welcome** tab → "Invite a colleague" → **Open member management**. (This goes to sanity.io/manage, the account console where seats and roles live. You can also go there directly and pick the STROXX project.)
2. Press **Invite members**, enter their work email, and choose the role:
   - **Editor** (pick this for everyone on the content team): creates, edits and publishes content.
   - **Viewer**: read-only, for stakeholders who want to look without touching.
   - **Administrator**: everything, including members and Site settings (the tracking and technical (developer) settings live there), keep this circle small.
3. **Send them the welcome message**: back in the Welcome tab, press "Copy welcome message" and send it by mail or Teams. It tells them what to expect and links straight to the Welcome tab, so they onboard themselves in minutes.
4. **They accept the Sanity email invite** and log in, with the same email address the invite was sent to (Google login works). First stop: the Welcome tab, then they're editing.

Good to know:

- **Seats** depend on the Sanity plan; if an invite is refused for seat reasons, that's a plan upgrade conversation, not a bug.
- **Invite didn't arrive or expired?** Member management shows pending invites; resend from there. Wrong email? Remove the pending invite and send a fresh one.
- **"I can't see anything"** usually means they're logged into the wrong account: the avatar in the Studio's top right shows who's signed in.
- **When someone leaves the team**: member management → find the person → Remove, the same day. If an administrator leaves, also ask your developer to rotate the API tokens.

## 13. Do's and don'ts

Do: duplicate before big rewrites, check SKUs against the webshop, keep headlines short (they're huge on screen), fill SEO fields on new pages, use the blue accent sparingly (one word per headline), keep manager consent flags honest.

Don't: paste text with exotic formatting from Word (paste as plain text), publish half-finished pages (drafts cost nothing), share your login, delete store documents when "Active off" does the job.

## 14. Help and learning more

First stop: this guide and the live block gallery at /components. Second: your site administrator. The Studio itself can't break the live site, worst case a page is unpublished or rolled back in one click.

Want to go deeper into Sanity itself?

- **Sanity Learn** (free official courses): https://www.sanity.io/learn. Note that most courses are aimed at developers building studios; the "Day one content operations" course is the gentlest introduction if you're curious how it all works.
- **Sanity documentation**: https://www.sanity.io/docs, the reference for everything the Studio can do (drafts, history, comments, tasks, real-time collaboration).
- Honestly though: for editing THIS site, this guide plus fifteen minutes of clicking around in Edit site teaches you more than any course. The Studio is built so you can't break anything.

## 15. Ownership and hand-over

The platform is built to be owned by you. The code is standard Next.js in a Git repository that transfers to your organization with full history. The content lives in your Sanity project, which transfers between organizations in their dashboard (content, media and users included) and is exportable as plain files at any time. Hosting is a standard Vercel project that transfers to your team. There are no proprietary pieces and no lock-in: your IT department or any web agency can take over the whole thing in an afternoon, whenever you choose.
