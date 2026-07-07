# Headless CMS — anbefaling for Carl Ras Gruppen & STROXX

> **Historisk beslutningsgrundlag.** Dette dokument sammenligner CMS-muligheder som de stod tidligere. Beslutningen er nu truffet: sitet kører på **Sanity** (bygget og live) oven på **Next.js 16**. Webflow og de øvrige blev vurderet, men ikke valgt. Se **00 START HERE** for den aktuelle opsætning.


*Udarbejdet juni 2026. Priser og features ændrer sig hurtigt — alt herunder er verificeret via kilderne nederst, men tjek de officielle prissider, før I beslutter.*

---

## Kort fortalt (TL;DR)

- **Det store spørgsmål er ikke "hvilket CMS"** — det er "git-baseret eller cloud-baseret CMS", og **at de nuværende sider skal bygges på et framework** (Astro/Next.js) for overhovedet at kunne bruge et CMS. Carl Ras-sitet er i dag håndkodet HTML; den reelle omkostning er ombygningen, ikke abonnementet.
- **Anbefaling, hvis I vil have nem redigering + AI-workflow + lav pris:** **Sanity** (gratis-niveauet rækker sandsynligvis langt) på **Astro** for Carl Ras, og **Sanity på Next.js** for STROXX. Ét CMS på tværs af begge brands, styret centralt fra Carl Ras.
- **Billigste vej, der bevarer "AI henter repo og redigerer"-modellen:** et **git-baseret CMS (Keystatic eller TinaCMS)** — indholdet ligger som filer i jeres eget git-repo, redaktører får en UI, og AI (Claude) kan redigere de samme filer. ~0 kr./md.
- **No-code vej:** **Webflow** — alt-i-én (design + CMS + hosting), men det betyder at bygge sitet om *i* Webflow og giver mindre AI/git-frihed.
- **Apollo er ikke et CMS.** Apollo GraphOS er en GraphQL-API-gateway/datalag — den redigerer ikke indhold. Den kan i en stor opsætning ligge *foran* flere datakilder, men løser ikke jeres behov her.

---

## 1. Forstå valget først: to arkitekturer

Et "headless CMS" adskiller **indholdet** (tekst, billeder, priser) fra **frontenden** (selve sitet). Der er to familier, og de passer til to forskellige arbejdsgange:

**A) Git-baseret CMS** — indholdet gemmes som filer (Markdown/JSON) **i jeres git-repo**. Hver redigering bliver et git-commit med fuld historik og rollback. Redaktøren bruger en UI, men gemmer i virkeligheden til git.
*Eksempler: Keystatic, TinaCMS, Decap.*
→ Passer perfekt til jeres nuværende model ("træk repo'et ned, AI + Claude redigerer"), fordi AI'en og redaktøren arbejder i **samme filer**. Næsten gratis. Til gengæld svagere redaktionelle funktioner (planlægning, roller, godkendelsesflow, billed-CDN).

**B) Cloud/API-baseret CMS** — indholdet bor i CMS'ets sky og hentes via API ved build/runtime. Bedst mulige redaktør-oplevelse, roller, planlægning, asset-CDN, oversættelse og AI-assist. Koster penge, og indholdet ligger **uden for** git.
*Eksempler: Sanity, Storyblok, Contentful, Webflow.*
→ Passer bedst, hvis ikke-tekniske marketingfolk skal vedligeholde det dagligt. AI-adgang sker via API/MCP frem for via repo'et.

> **Den ærlige version af jeres "er en UI nemmere end git?"-spørgsmål:** For ikke-tekniske kolleger, der skal passe sitet i årevis: ja, en UI er nemmere og mere sikker end at redigere kode i git. For den AI-assisterede arbejdsgang, I kører nu, er git-baseret indhold ideelt, fordi AI'en redigerer de samme filer. Et **git-baseret CMS giver begge dele** (UI *og* git) — mod at give afkald på de fineste redaktionelle funktioner. Et cloud-CMS som **Sanity** giver AI-adgang via "Agent Actions"/MCP i stedet.

---

## 2. Den skjulte forudsætning: et framework

Carl Ras-konceptsitet er i dag **håndkodet HTML/CSS/JS**. Et CMS kan ikke koble sig på statisk HTML — sitet skal bygges på et framework, der kan trække indhold fra CMS'et:

- **Astro** — "content-first", sender 0 JavaScript som udgangspunkt, Lighthouse 97-100, billig hosting. **Det rette valg til Carl Ras' marketing- og Indsigt-magasin.**
- **Next.js** — "app-first", React-runtime, bedst til app-/webshop-agtige sider med login, kurv, dynamik. **STROXX' demo er allerede dette** og bør blive der pga. produkter/handel.

Begge spiller med ethvert af CMS'erne nedenfor. Ombygningen er det reelle arbejde (og den reelle pris) — selve CMS-abonnementet er småpenge til sammenligning.

---

## 3. Mulighederne sammenlignet (juni 2026)

| CMS | Pris (indgang) | Redaktør-UX | AI | Git-workflow | Bedst til |
|---|---|---|---|---|---|
| **Sanity** | **Gratis** (20 seats, 10k docs); Growth **$15/seat/md** | God, men udvikler-tilpasset Studio | Stærk: Content Agent, Agent Actions API, **MCP** til AI-assistenter, Functions | Indhold i sky (ikke i git), men AI-API + MCP | Struktureret indhold + AI-native, lav pris, begge brands |
| **Storyblok** | Growth **€99/md**; Growth+ €349/md | **Bedst for marketingfolk** — visuel block-editor med live preview | FlowMotion (2026): visuelle AI-workflows, no-code | Sky | Marketing-tunge, flersprogede sites; ikke-tekniske redaktører |
| **Contentful** | Gratis → **$300/md** Lite → custom | Solid, enterprise | AI-felter | Sky | Store enterprises med governance-krav (dyrest indgang) |
| **Webflow** | Premium **$25/md** (årligt) pr. site; lokalisering $9-29/locale | **No-code, alt-i-én** design+CMS+host | AI-credits (2026) | Nej (lukket platform) | Hvis marketing selv skal designe *og* redigere uden udviklere |
| **Git-baseret** (Keystatic / TinaCMS / Decap) | **~Gratis** (Tina Cloud gratis ≤2 brugere; Team Plus $49/md for workflow) | Enkel UI; Tina har visuel redigering | AI redigerer filerne **direkte i repo'et** (jeres nuværende model) | **Ja — indhold = filer i jeres git** | Lav pris + bevare AI/repo-arbejdsgangen; tekniske/små teams |
| **WordPress (headless)** | "Gratis" software, men hosting + WPGraphQL + vedligehold koster i praksis | Velkendt, men tungt headless | Plugins | Nej | Hvis I allerede har WP-kompetencer (ellers overkill) |

---

## 4. Anbefaling

### Carl Ras Gruppen (brand, ESG, Indsigt-magasin)
**Astro + Sanity.** Begrundelse:
- Sanitys **gratis-niveau** (20 seats, 10k dokumenter) dækker sandsynligvis hele behovet i lang tid — reelt 0 kr.
- **AI-native**: Sanitys Agent Actions + MCP betyder, at I beholder den AI-drevne arbejdsgang — Claude kan generere, omskrive og oversætte indhold via API'et, præcis som I arbejder nu, bare mod et struktureret CMS i stedet for rå HTML.
- Astro holder sitet lynhurtigt og hosting-regningen nær nul.
- Struktureret indhold (artikler, sponsorerede historier, ESG-tal) passer Indsigt-formatet perfekt og gør fremtidig DA/EN-oversættelse let.

*Alternativ, hvis I prioriterer "billigst + behold git/AI-modellen over alt andet":* **Astro + Keystatic** — indholdet bliver liggende i repo'et, Claude redigerer samme filer, redaktører får en simpel UI, ~0 kr. Mod færre redaktionelle funktioner (ingen indbygget planlægning/godkendelse).

*Alternativ, hvis marketing skal kunne designe siderne selv uden udviklere:* **Webflow** — men det betyder at genopbygge det nuværende custom-design i Webflow og at give køb på AI/git-friheden.

### STROXX (produkt-/kampagnesite)
**Next.js + Sanity** (samme CMS-organisation som Carl Ras). Vigtig pointe:
- **Produkterne selv bør ikke ligge i CMS'et** — de kommer fra Carl Ras' handels-/PIM-system (carl-ras.dk). CMS'et styrer **marketingsiderne, kampagner og produkt-berigelse** (tekster, billeder, "prøv det"-historier), ikke prisdata.
- Ét Sanity-setup på tværs af begge brands = ét team, ét sæt kompetencer, central styring fra Carl Ras (flere projekter i samme Sanity-organisation).

### Den fælles opsætning (det I bad om)
- **Ét Sanity-organisation hos Carl Ras**, med to projekter (Carl Ras Gruppen + STROXX). Roller styrer, hvem der må røre hvad.
- **AI/repo-laget**: frontenderne bliver i jeres git (Vercel deployer som nu). Indholdet i Sanity styres af AI via **MCP/Agent Actions** + Sanity **Functions** (serverless logik). Det er det tætteste på et "AI-backend, der trækker data og kører automatik", uden at I selv skal bygge en backend.
- Hvis I i stedet vælger git-baseret (Keystatic/Tina), bliver **alt** liggende i jeres egne repos, og AI'en arbejder direkte i filerne — endnu tættere på jeres nuværende model, men I selv står for analytics/automatik.

---

## 5. Analytics
Hold analytics adskilt fra CMS'et. Anbefaling: **Vercel Web Analytics** (I er allerede på Vercel) eller **Plausible** (privatlivsvenligt, GDPR-let, ingen cookie-banner-behov, billigt). GA4 hvis I skal integrere med annoncering. Et dashboard kan samle disse + CMS-data senere.

---

## 6. Pris-overblik (cirka, pr. måned)

- **Astro + Keystatic/Tina:** ~0 kr. (hosting på Vercel/Cloudflare gratis-niveau; evt. Tina Team Plus ~$49 hvis I vil have godkendelsesflow).
- **Astro/Next + Sanity:** 0 kr. på gratis-niveau; ellers $15/seat/md når I vokser. Hosting nær 0 på Astro, $20+ på Next ved trafik.
- **Storyblok:** fra €99/md.
- **Webflow:** ~$25/md pr. site + $9-29/locale ved oversættelse.
- I alle tilfælde: **engangsomkostningen til ombygning på framework** er den største post.

---

## 7. Anbefalet næste skridt
1. Beslut **arkitektur**: cloud-CMS (Sanity) for bedst redaktør-UX + AI-API, eller git-baseret (Keystatic) for laveste pris + maksimal git/AI-nærhed.
2. **Pilot på Indsigt-magasinet**: flyt artikel-formatet til det valgte CMS som test — det er afgrænset, og det er her redigering sker oftest.
3. Hvis piloten holder, **migrér Carl Ras-sitet til Astro** og kobl resten af indholdet på.
4. **Spejl opsætningen til STROXX** på Next.js i samme CMS-organisation.

---

### Kilder
- [Sanity pricing](https://www.sanity.io/pricing) · [Sanity CMS pricing 2026 (Rob-O-Studio)](https://robotostudio.com/blog/sanity-cms-pricing-which-plan-is-right-for-you) · [Sanity Agent Actions/Functions (FocusReactive)](https://focusreactive.com/sanity-agent-actions-functions-and-blueprints/)
- [Storyblok / Sanity / Contentful comparison 2026 (Monterail)](https://www.monterail.com/blog/which-cms-to-choose) · [Best Headless CMS in the Age of AI (Lushbinary)](https://lushbinary.com/blog/best-headless-cms-ai-era-comparison/)
- [Git-based CMS 2026 (Statichunt)](https://statichunt.com/blog/git-based-headless-cms) · [Keystatic review (Lucky Media)](https://www.luckymedia.dev/insights/keystatic) · [TinaCMS](https://tina.io/)
- [Webflow 2026 pricing update](https://help.webflow.com/hc/en-us/articles/51059955082387-Updated-pricing-and-simplified-plans-for-May-2026) · [Webflow pricing](https://webflow.com/pricing)
- [Astro vs Next.js for content sites 2026 (Cosmic)](https://www.cosmicjs.com/blog/astro-vs-nextjs-2026)
