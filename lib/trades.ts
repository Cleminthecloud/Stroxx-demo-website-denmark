/** Trade ("fag") landing pages: the job-first navigation competitors like
 *  Milwaukee structure their whole catalog around. Each trade maps to the
 *  existing category slugs in lib/data.ts; products are pulled from those.
 *  Copy follows the brand voice: name the job, sell the outcome, no hype. */

export type Trade = {
  slug: string;
  name: string;
  title: string; // h1
  blurb: string;
  categories: string[]; // category slugs from lib/data.ts
  faq: { q: string; a: string }[]; // rendered as accordion + FAQPage JSON-LD
};

export const trades: Trade[] = [
  {
    slug: 'toemrer',
    name: 'Tømrer og snedker',
    title: 'Til dig, der bygger i træ.',
    blurb:
      'Klinger der holder kanten, bor der ikke vandrer, og mål der passer i begge ender. Værktøjet til træfolket, uden mærke-tillæg.',
    categories: ['rundsavklinger', 'bor-borsaet', 'bits-skruetraekkere', 'maalevaerktoej', 'knive', 'lasere'],
    faq: [
      {
        q: 'Hvilket STROXX-værktøj bruger tømrere mest?',
        a: 'Rundsavklinger til træ og laminat, træbor og borsæt, slagfaste bits, vaterpas og vinkler samt knive med autolås. Alt sammen professionel kvalitet uden mærke-tillæg, til priser fra under 50 kr.',
      },
      {
        q: 'Holder en rundsavklinge til en lavere pris virkelig?',
        a: 'Tolerancer, hårdmetal og tandgeometri afgør kvaliteten, ikke logoet. Derfor får du 30 dages tilfredshedsgaranti: brug klingen på rigtigt arbejde, og er du ikke tilfreds, får du pengene tilbage hos Carl Ras.',
      },
    ],
  },
  {
    slug: 'elektriker',
    name: 'Elektriker',
    title: 'Strøm på arbejdet. Ikke på prisen.',
    blurb:
      'Hulsave til dåser, bits der bider, kabeltromler der holder til pladsen og lys, der gør natarbejde til dagarbejde.',
    categories: ['hulsave', 'bits-skruetraekkere', 'kabeltromler', 'belysning', 'multicutterklinger', 'maalevaerktoej'],
    faq: [
      {
        q: 'Hvilket STROXX-værktøj er mest relevant for elektrikere?',
        a: 'Hulsavsæt til dåser og gennemføringer (19-83 mm), slagfaste bits og bitsholdere, kabeltromler, arbejdslamper og pandelamper samt multicutterklinger. Købes hos Carl Ras i 26 butikker eller online.',
      },
      {
        q: 'Findes der et hulsavsæt målrettet el-arbejde?',
        a: 'Ja, STROXX har et HSS bimetal hulsavsæt til elektrikere med 13 dele fra 19 til 83 mm, der dækker de gængse dåse- og rørdimensioner. Det er omfattet af 30 dages tilfredshedsgaranti.',
      },
    ],
  },
  {
    slug: 'vvs',
    name: 'VVS og blik',
    title: 'Tæt arbejde. Tætte priser.',
    blurb:
      'Topnøgler der griber, hulsave til gennemføringer, fugemasse der tætner og måleværktøj du kan stole på i en våd kælder.',
    categories: ['topnoegler', 'hulsave', 'bor-borsaet', 'fugemasse', 'maalevaerktoej', 'knive'],
    faq: [
      {
        q: 'Hvad har STROXX til VVS og blik?',
        a: 'Topnøglesæt i 1/4", 3/8" og 1/2", hulsave til gennemføringer, metalbor, fugemasse og fugepistoler samt torpedo-vaterpas, der kan stå fast på rør. Alt købes hos Carl Ras.',
      },
      {
        q: 'Kan jeg prøve et topnøglesæt af, før jeg beslutter mig?',
        a: 'Ja. Med 30 dages tilfredshedsgaranti kan du bruge sættet på rigtigt arbejde i en måned. Er grebet eller skraldet ikke som forventet, afleverer du det i din Carl Ras butik og får pengene tilbage.',
      },
    ],
  },
  {
    slug: 'maler',
    name: 'Maler',
    title: 'Rene linjer. Ren samvittighed.',
    blurb:
      'Ruller, pensler, tape og kemi til et resultat, kunden kan spejle sig i. Og knive til alt det, der skal skæres rent først.',
    categories: ['malergrej', 'tape', 'kemi', 'fugemasse', 'knive'],
    faq: [
      {
        q: 'Hvad dækker STROXX malergrej over?',
        a: 'Ruller, pensler, malertape, afdækning, fugemasse og kemi som rens og sprayprodukter, plus skarpe knive til tilskæring. Professionel kvalitet til en pris, der ikke æder dækningsbidraget.',
      },
      {
        q: 'Er billig malertape ikke lig med vedhæftningsproblemer?',
        a: 'Prisen siger ikke noget om klæberen. STROXX tape er lavet til at klæbe rent og slippe rent, og du kan teste den på en hel opgave i 30 dage. Ikke tilfreds? Pengene tilbage hos Carl Ras.',
      },
    ],
  },
  {
    slug: 'murer',
    name: 'Murer og beton',
    title: 'Hårdt underlag. Blød pris.',
    blurb:
      'Murbor og hammerbor der æder beton, lasere der sætter linjen, og sikkerhedsudstyr så du kommer hel hjem.',
    categories: ['bor-borsaet', 'lasere', 'maalevaerktoej', 'sikkerhed', 'kemi'],
    faq: [
      {
        q: 'Hvilket STROXX-værktøj passer til murer- og betonarbejde?',
        a: 'SDS hammerbor med 2 og 4 skær, murbor og multiconstruction-bor, rotations- og streglasere til linjer og koter, vaterpas samt sikkerhedsudstyr som hjelme, briller og handsker.',
      },
      {
        q: 'Holder budget-hammerbor i armeret beton?',
        a: 'STROXX SDS-bor fås med 4 skær netop til armeret beton. Og du behøver ikke tro på det: brug dem i 30 dage på pladsen, og få pengene tilbage hos Carl Ras, hvis de ikke leverer.',
      },
    ],
  },
];

export const tradeBySlug = (slug: string) => trades.find((t) => t.slug === slug);
