/** Partner films (fallback data). CMS `video` documents take over when
 *  present; see lib/cms.ts getVideos(). First entry = the featured player. */

export type Video = { id: string; title: string; by: string };

export const videos: Video[] = [
  { id: 'egSu462a-rI', title: 'STROXX Powertools', by: 'Lecot' },
  { id: 'LR4bsAip9bI', title: 'Borehoved, produktvideo', by: 'Meesenburg' },
  { id: 'q5v1MhyKHoQ', title: 'Kniv, teaser', by: 'Meesenburg' },
  { id: 'o4AEU1-H56w', title: 'Trappestige, teaser', by: 'Meesenburg' },
  { id: 'fuaFnPv9rIQ', title: 'Bits, teaser', by: 'Meesenburg' },
  { id: '9nBiA4joKlc', title: 'Slukspray, teaser', by: 'Meesenburg' },
];
