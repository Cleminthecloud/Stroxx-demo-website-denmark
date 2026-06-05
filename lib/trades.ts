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
};

export const trades: Trade[] = [
  {
    slug: 'toemrer',
    name: 'Tømrer og snedker',
    title: 'Til dig, der bygger i træ.',
    blurb:
      'Klinger der holder kanten, bor der ikke vandrer, og mål der passer i begge ender. Værktøjet til træfolket, uden mærke-tillæg.',
    categories: ['rundsavklinger', 'bor-borsaet', 'bits-skruetraekkere', 'maalevaerktoej', 'knive', 'lasere'],
  },
  {
    slug: 'elektriker',
    name: 'Elektriker',
    title: 'Strøm på arbejdet. Ikke på prisen.',
    blurb:
      'Hulsave til dåser, bits der bider, kabeltromler der holder til pladsen og lys, der gør natarbejde til dagarbejde.',
    categories: ['hulsave', 'bits-skruetraekkere', 'kabeltromler', 'belysning', 'multicutterklinger', 'maalevaerktoej'],
  },
  {
    slug: 'vvs',
    name: 'VVS og blik',
    title: 'Tæt arbejde. Tætte priser.',
    blurb:
      'Topnøgler der griber, hulsave til gennemføringer, fugemasse der tætner og måleværktøj du kan stole på i en våd kælder.',
    categories: ['topnoegler', 'hulsave', 'bor-borsaet', 'fugemasse', 'maalevaerktoej', 'knive'],
  },
  {
    slug: 'maler',
    name: 'Maler',
    title: 'Rene linjer. Ren samvittighed.',
    blurb:
      'Ruller, pensler, tape og kemi til et resultat, kunden kan spejle sig i. Og knive til alt det, der skal skæres rent først.',
    categories: ['malergrej', 'tape', 'kemi', 'fugemasse', 'knive'],
  },
  {
    slug: 'murer',
    name: 'Murer og beton',
    title: 'Hårdt underlag. Blød pris.',
    blurb:
      'Murbor og hammerbor der æder beton, lasere der sætter linjen, og sikkerhedsudstyr så du kommer hel hjem.',
    categories: ['bor-borsaet', 'lasere', 'maalevaerktoej', 'sikkerhed', 'kemi'],
  },
];

export const tradeBySlug = (slug: string) => trades.find((t) => t.slug === slug);
