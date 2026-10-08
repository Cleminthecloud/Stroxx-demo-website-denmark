/** Interface words for the Focus on… pages, per language (htmlLang). Content
 *  lives in the CMS; these are the few labels the code owns (badges, filter
 *  names, the strip heading). Unknown languages fall back to English. */

export type FocusCopy = {
  section: string; // "Focus on…"
  overviewTitle: string;
  overviewIntro: string;
  all: string;
  category: string;
  topic: string;
  year: string;
  current: string;
  upcoming: string;
  more: string;
  seeAll: string;
  read: string;
  empty: string;
  emptyReset: string;
  count: (n: number) => string;
  whereToBuy: string;
  filters: string;
};

const en: FocusCopy = {
  section: 'Focus on…',
  overviewTitle: 'Focus on…',
  overviewIntro: 'One product at a time, looked at properly. Every focus page we have made, newest first.',
  all: 'All',
  category: 'Category',
  topic: 'Topic',
  year: 'Year',
  current: 'Current',
  upcoming: 'Coming',
  more: 'More focus products',
  seeAll: 'See all',
  read: 'Read more',
  empty: 'Nothing matches that filter yet.',
  emptyReset: 'Show all',
  count: (n) => (n === 1 ? '1 focus product' : `${n} focus products`),
  whereToBuy: 'Where to buy',
  filters: 'Filter focus products',
};

const da: FocusCopy = {
  section: 'Fokus på…',
  overviewTitle: 'Fokus på…',
  overviewIntro: 'Ét produkt ad gangen, set ordentligt efter i sømmene. Alle vores fokussider, nyeste først.',
  all: 'Alle',
  category: 'Kategori',
  topic: 'Emne',
  year: 'År',
  current: 'Aktuel',
  upcoming: 'Kommer',
  more: 'Flere fokusprodukter',
  seeAll: 'Se alle',
  read: 'Læs mere',
  empty: 'Intet matcher det filter endnu.',
  emptyReset: 'Vis alle',
  count: (n) => (n === 1 ? '1 fokusprodukt' : `${n} fokusprodukter`),
  whereToBuy: 'Hvor kan jeg købe',
  filters: 'Filtrér fokusprodukter',
};

const de: FocusCopy = {
  ...en,
  section: 'Im Fokus…',
  overviewTitle: 'Im Fokus…',
  overviewIntro: 'Ein Produkt nach dem anderen, genau hingeschaut. Alle unsere Fokusseiten, die neueste zuerst.',
  all: 'Alle',
  category: 'Kategorie',
  topic: 'Thema',
  year: 'Jahr',
  current: 'Aktuell',
  upcoming: 'Demnächst',
  more: 'Weitere Fokusprodukte',
  seeAll: 'Alle ansehen',
  read: 'Mehr lesen',
  empty: 'Zu diesem Filter gibt es noch nichts.',
  emptyReset: 'Alle zeigen',
  count: (n) => (n === 1 ? '1 Fokusprodukt' : `${n} Fokusprodukte`),
  whereToBuy: 'Wo kaufen',
  filters: 'Fokusprodukte filtern',
};

const fr: FocusCopy = {
  ...en,
  section: 'Focus sur…',
  overviewTitle: 'Focus sur…',
  overviewIntro: 'Un produit à la fois, regardé de près. Toutes nos pages focus, la plus récente en premier.',
  all: 'Tous',
  category: 'Catégorie',
  topic: 'Thème',
  year: 'Année',
  current: 'Actuel',
  upcoming: 'Bientôt',
  more: 'Autres produits en focus',
  seeAll: 'Tout voir',
  read: 'En savoir plus',
  empty: 'Rien ne correspond encore à ce filtre.',
  emptyReset: 'Tout afficher',
  count: (n) => (n === 1 ? '1 produit en focus' : `${n} produits en focus`),
  whereToBuy: 'Où acheter',
  filters: 'Filtrer les produits en focus',
};

const nl: FocusCopy = {
  ...en,
  section: 'In de kijker…',
  overviewTitle: 'In de kijker…',
  overviewIntro: 'Eén product tegelijk, goed bekeken. Al onze focuspagina’s, de nieuwste eerst.',
  all: 'Alle',
  category: 'Categorie',
  topic: 'Onderwerp',
  year: 'Jaar',
  current: 'Actueel',
  upcoming: 'Binnenkort',
  more: 'Meer producten in de kijker',
  seeAll: 'Alles bekijken',
  read: 'Lees meer',
  empty: 'Nog niets voor deze filter.',
  emptyReset: 'Alles tonen',
  count: (n) => (n === 1 ? '1 product' : `${n} producten`),
  whereToBuy: 'Waar kopen',
  filters: 'Producten filteren',
};

const BY_LANG: Record<string, FocusCopy> = { en, da, de, fr, nl };

export function focusCopy(htmlLang: string | undefined): FocusCopy {
  return BY_LANG[(htmlLang || 'en').slice(0, 2)] ?? en;
}
