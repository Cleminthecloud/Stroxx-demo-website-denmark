/** Carl Ras Gruppen store locations.
 *  Source of truth: Webflow CMS, site "Carl Ras Gruppen" (68529f62457a7595e7f2e4f4),
 *  collection "Butikkers" (68529f62457a7595e7f2e71b). Snapshot 2026-06-04, 26 items.
 *  In production this file is replaced by a build-time fetch from the Webflow API
 *  so the finder always mirrors the CMS. */

export type StoreBrand = 'Carl Ras' | '3Aktive';
export type StoreRegion = string;
export type StoreCountry = 'dk' | 'de' | 'fr' | 'be';
export interface StoreSpecialist { name: string; role?: string; photo?: string; email?: string; phone?: string; }

export interface Store {
  id: string;
  name: string;
  brand: StoreBrand;
  country: StoreCountry;
  region?: string;
  address: string;
  zipCity: string;
  lat: number;
  lng: number;
  maps: string;
  manager: { name: string; email: string; phone: string; photo: string };
  /** Optional dedicated STROXX Specialist contact, shown on the store card. */
  specialist?: StoreSpecialist;
  /** [open, close] as decimal clock values from the CMS, e.g. 6.3 = 06:30 */
  monThu: [number, number];
  fri: [number, number];
  weekendClosed: boolean;
  festool: boolean;
  sikring: boolean;
  aktive3: boolean;
}

/** 6.3 → "06:30", 16 → "16:00" */
export const clock = (n: number) => {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 100);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const hoursLabel = (s: Store) =>
  `Mon-Thu ${clock(s.monThu[0])}-${clock(s.monThu[1])} · Fri ${clock(s.fri[0])}-${clock(s.fri[1])}`;

/** Great-circle distance in km */
export const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const cdn = 'https://cdn.prod.website-files.com/68529f62457a7595e7f2e714';

export const stores: Store[] = [
  {
    id: 'carl-ras-amager', name: 'Carl Ras Amager', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Vermlandsgade 75', zipCity: '2300 København S', lat: 55.666837, lng: 12.612292,
    maps: 'https://maps.app.goo.gl/MfZ1g973sTWGuSsG7',
    manager: { name: 'Jens Holst', email: 'jboe@carl-ras.dk', phone: '28435650', photo: `${cdn}/692701988258e1e155fdfe76_6904891f41c6d54f6fe0efdc_Jens-Holst_SYDHAVN_ALR5299_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-osterbro', name: 'Carl Ras Østerbro', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Emdrupvej 23', zipCity: '2100 København Ø', lat: 55.718706, lng: 12.55357,
    maps: 'https://maps.app.goo.gl/j9BFThoJPL3HEHoQ6',
    manager: { name: 'Asger Buch-Sørensen', email: 'asbu@carl-ras.dk', phone: '81771214', photo: `${cdn}/6927019ad669f55875142a6b_690488f00f68469190edcaf5_Asger-Buch-S%25C3%25B8rensen_-%25C3%2598STERBRO_ALR4869_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: true, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-sydhavnen', name: 'Carl Ras Sydhavnen', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Bådehavnsgade 12', zipCity: '2450 København SV', lat: 55.64445, lng: 12.540153,
    maps: 'https://maps.app.goo.gl/57vvG6kvkqbzXqav7',
    manager: { name: 'Jens Holst', email: 'jeho@carl-ras.dk', phone: '52402180', photo: `${cdn}/692701988258e1e155fdfe76_6904891f41c6d54f6fe0efdc_Jens-Holst_SYDHAVN_ALR5299_cropped_300x300_headshot_web.jpeg` },
    monThu: [5.3, 16], fri: [5, 15], weekendClosed: true, festool: true, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-frederiksberg', name: 'Carl Ras Frederiksberg', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Peter Bangs Vej 47', zipCity: '2000 Frederiksberg', lat: 55.678733, lng: 12.511973,
    maps: 'https://maps.app.goo.gl/3xMMb8pV2oVrze9G6',
    manager: { name: 'Jens Holst', email: 'jeho@carl-ras.dk', phone: '52402180', photo: `${cdn}/692701988258e1e155fdfe76_6904891f41c6d54f6fe0efdc_Jens-Holst_SYDHAVN_ALR5299_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: false, festool: false, sikring: true, aktive3: false,
  },
  {
    id: 'carl-ras-herlev', name: 'Carl Ras Herlev', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Mileparken 31', zipCity: '2730 Herlev', lat: 55.716733, lng: 12.433199,
    maps: 'https://maps.app.goo.gl/F9zdH4WGrF5WDhpH7',
    manager: { name: 'Jonas Ørneborg', email: 'jboe@carl-ras.dk', phone: '28435650', photo: `${cdn}/6927019938ff869cf476b2ff_690495f1efbc7338fd00b10c_Jonas-%25C3%2598rneborg-_HERLEV_ALR4900_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: true, sikring: true, aktive3: false,
  },
  {
    id: 'carl-ras-ishoj', name: 'Carl Ras Ishøj', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Industribuen 7A', zipCity: '2635 Ishøj', lat: 55.617724, lng: 12.333758,
    maps: 'https://maps.app.goo.gl/EbjCEBrhVCm8UnEr6',
    manager: { name: 'Andreas Skytte Ritzau', email: 'askr@carl-ras.dk', phone: '81778811', photo: `${cdn}/6a195c8dd7e9f8e09879534d_askr_cropped_SQ_300_web.jpg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-farum', name: 'Carl Ras Farum', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Hørmarken 11', zipCity: '3520 Farum', lat: 55.821782, lng: 12.370277,
    maps: 'https://maps.app.goo.gl/KauaPCTBVHv6rXmN7',
    manager: { name: 'Jesper Lassen', email: 'jel@carl-ras.dk', phone: '21788632', photo: `${cdn}/6927019947d7b7d4aab9d22a_6904965bc34e359f07bfdaa7_Jesper-Lassen-FARUM_ALR5430_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-horsholm', name: 'Carl Ras Hørsholm', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Kokkedal Industripark 18', zipCity: '2980 Kokkedal', lat: 55.902434, lng: 12.4817,
    maps: 'https://maps.app.goo.gl/mKGgTb6FaL1uUmap8',
    manager: { name: 'Chris Warburg', email: 'cw@carl-ras.dk', phone: '51960206', photo: `${cdn}/69270199ad96e482db0297af_690b20ea528a28fc89e529d9_Chris-W_-H%25C3%2598RSHOLM_ALR4935_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: true, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-hillerod', name: 'Carl Ras Hillerød', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Vølundsvej 4', zipCity: '3400 Hillerød', lat: 55.93255, lng: 12.273847,
    maps: 'https://maps.app.goo.gl/bFR23RSCDJE7P2gT7',
    manager: { name: 'Pia Wennemoes', email: 'pim@carl-ras.dk', phone: '21434160', photo: `${cdn}/6927019859e4bcdb0de13a5d_690495daf05f1e2e707dd73b_Pia-Wenkemoes__ALR6264_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-roskilde', name: 'Carl Ras Roskilde', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Byleddet 1A', zipCity: '4000 Roskilde', lat: 55.643322, lng: 12.109706,
    maps: 'https://maps.app.goo.gl/Uv7EZaJ5qrGKjgix8',
    manager: { name: 'Jens Holst', email: 'jeho@carl-ras.dk', phone: '52402180', photo: `${cdn}/692701988258e1e155fdfe76_6904891f41c6d54f6fe0efdc_Jens-Holst_SYDHAVN_ALR5299_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-holbaek', name: 'Carl Ras Holbæk', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Stenhusvej 51', zipCity: '4300 Holbæk', lat: 55.702158, lng: 11.67204,
    maps: 'https://maps.app.goo.gl/3zAh4WQdoycwcipP7',
    manager: { name: 'Anders Lundberg', email: 'anlu@carl-ras.dk', phone: '30326992', photo: `${cdn}/69270199e7b98d1915c1a56d_690495724ac18686221b612a_Anders-Lundberg_-HOLB%25C3%2586KALR4966_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: false, sikring: false, aktive3: true,
  },
  {
    id: 'carl-ras-ringsted', name: 'Carl Ras Ringsted', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Huginsvej 2', zipCity: '4100 Ringsted', lat: 55.425459, lng: 11.789747,
    maps: 'https://maps.app.goo.gl/mfWrDM3C8biqgJTh8',
    manager: { name: 'Nicklas Rifseim', email: 'niri@carl-ras.dk', phone: '81775009', photo: `${cdn}/6927019ad6886d1726f08260_690b1f5b72a12bd9307755bb_Nicklas-Rifseim_RINGSTED_ALR6215_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-slagelse', name: 'Carl Ras Slagelse', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Skovsøviadukten 1A', zipCity: '4200 Slagelse', lat: 55.414266, lng: 11.399425,
    maps: 'https://maps.app.goo.gl/VJjb5Dy6yYSu6eH68',
    manager: { name: 'Jacob Dragby', email: 'jadr@carl-ras.dk', phone: '35778339', photo: `${cdn}/692701992892e45b41fa1034_69048931e313ac4497ddf287_Jacob-Drogby_SLAGELSE_ALR5543_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-naestved', name: 'Carl Ras Næstved', brand: 'Carl Ras', region: 'Sjælland', country: 'dk',
    address: 'Gammel Holstedvej 24', zipCity: '4700 Næstved', lat: 55.248878, lng: 11.786766,
    maps: 'https://maps.app.goo.gl/SQ6bcaAhogPeP1jR7',
    manager: { name: 'Peter Thunø', email: 'pett@carl-ras.dk', phone: '35778266', photo: `${cdn}/6927019a55556e67d45586f3_6904955f196479efa98ad9a4_Peter-Thun%25C3%25B8_N%25C3%2586STVED_ALR5893_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-odense', name: 'Carl Ras Odense', brand: 'Carl Ras', region: 'Fyn', country: 'dk',
    address: 'Hvidkærvej 24', zipCity: '5250 Odense SV', lat: 55.360129, lng: 10.340363,
    maps: 'https://maps.app.goo.gl/Tw2wbL3FjvGNgiGv5',
    manager: { name: 'Mads Petersen', email: 'mape@carl-ras.dk', phone: '54556807', photo: `${cdn}/69270199c49794c5fd41e457_6904954edb80d8a84b227614_Mads-Petersen_Odense_Esbjerg_ALR6137_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-esbjerg', name: 'Carl Ras Esbjerg', brand: 'Carl Ras', region: 'Jylland', country: 'dk',
    address: 'Østre Gjesingvej 9A', zipCity: '6715 Esbjerg', lat: 55.504106, lng: 8.456737,
    maps: 'https://maps.app.goo.gl/Qp8tpbGpJ3guE3Zf6',
    manager: { name: 'Mads Petersen', email: 'mape@carl-ras.dk', phone: '54556807', photo: `${cdn}/69270199c49794c5fd41e457_6904954edb80d8a84b227614_Mads-Petersen_Odense_Esbjerg_ALR6137_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: true,
  },
  {
    id: 'carl-ras-kolding', name: 'Carl Ras Kolding', brand: 'Carl Ras', region: 'Jylland', country: 'dk',
    address: 'Fabriksvej 6', zipCity: '6000 Kolding', lat: 55.470626, lng: 9.474935,
    maps: 'https://maps.app.goo.gl/jc1AtT6uUZKWkmxEA',
    manager: { name: 'Thomas Haubjerg Madsen', email: 'tham@carl-ras.dk', phone: '81778593', photo: `${cdn}/6926f639b66b3e49248f4905_690495a52624294a15d28ed8_Thomas-H-Madsen_-KOLDING_ALR5457_cropped_300x300_headshot_web.jpeg` },
    monThu: [6, 16], fri: [6, 15], weekendClosed: true, festool: true, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-aarhus', name: 'Carl Ras Aarhus', brand: 'Carl Ras', region: 'Jylland', country: 'dk',
    address: 'Søren Frichs Vej 49', zipCity: '8230 Åbyhøj', lat: 56.150714, lng: 10.17171,
    maps: 'https://maps.app.goo.gl/udPnX738d6ySCN6A9',
    manager: { name: 'René Lyngby Jensen', email: 'rlje@carl-ras.dk', phone: '20514211', photo: `${cdn}/69270198184a98188a34f7f0_690495c6b4a3dba75db0ada1_Ren%25C3%25A9-Jensen_-MIDT-JYLLAND_ALR5382_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: true, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-aarhus-nord', name: 'Carl Ras Aarhus Nord', brand: 'Carl Ras', region: 'Jylland', country: 'dk',
    address: 'Johann Gutenbergs Vej 3', zipCity: '8200 Aarhus N', lat: 56.204801, lng: 10.183569,
    maps: 'https://maps.app.goo.gl/E1zUZueN3aSM8xNdA',
    manager: { name: 'René Lyngby Jensen', email: 'rlje@carl-ras.dk', phone: '20514211', photo: `${cdn}/69270198184a98188a34f7f0_690495c6b4a3dba75db0ada1_Ren%25C3%25A9-Jensen_-MIDT-JYLLAND_ALR5382_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-randers', name: 'Carl Ras Randers', brand: 'Carl Ras', region: 'Jylland', country: 'dk',
    address: 'Lucernevej 83', zipCity: '8920 Randers N', lat: 56.483821, lng: 10.025746,
    maps: 'https://maps.app.goo.gl/9z3Q93NtyY4r7o6o9',
    manager: { name: 'Ole Bjørn Jacobsen', email: 'obj@carl-ras.dk', phone: '40181181', photo: `${cdn}/6927019880f848515f0e0440_69049528b4697fade5a362b7_Ole-Bj%25C3%25B8rn_Jacobsen_-%25C3%2585LBORG_RANDERS_ALR6179_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-aalborg', name: 'Carl Ras Aalborg', brand: 'Carl Ras', region: 'Jylland', country: 'dk',
    address: 'Blytækkervej 10', zipCity: '9000 Aalborg', lat: 57.037965, lng: 9.924873,
    maps: 'https://maps.app.goo.gl/oW4hnAuNZTuQVVbm6',
    manager: { name: 'Ole Bjørn Jacobsen', email: 'obj@carl-ras.dk', phone: '40181181', photo: `${cdn}/6927019880f848515f0e0440_69049528b4697fade5a362b7_Ole-Bj%25C3%25B8rn_Jacobsen_-%25C3%2585LBORG_RANDERS_ALR6179_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: true, sikring: false, aktive3: false,
  },
  {
    id: 'carl-ras-holstebro', name: 'Carl Ras Holstebro', brand: 'Carl Ras', region: 'Jylland', country: 'dk',
    address: 'Sletten 31', zipCity: '7500 Holstebro', lat: 56.361433, lng: 8.66086,
    maps: 'https://maps.app.goo.gl/uQMLpzFngLeBNGfD9',
    manager: { name: 'René Lyngby Jensen', email: 'rlje@carl-ras.dk', phone: '20514211', photo: `${cdn}/69270198184a98188a34f7f0_690495c6b4a3dba75db0ada1_Ren%25C3%25A9-Jensen_-MIDT-JYLLAND_ALR5382_cropped_300x300_headshot_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 14], weekendClosed: true, festool: true, sikring: false, aktive3: false,
  },
  {
    id: '3aktive-brondby', name: '3Aktive Brøndby', brand: '3Aktive', region: 'Sjælland', country: 'dk',
    address: 'Vallensbækvej 18A', zipCity: '2605 Brøndby', lat: 55.643921, lng: 12.393614,
    maps: 'https://maps.app.goo.gl/Z9YqnCWdo94hziaL6',
    manager: { name: 'Brian E. Andersen', email: 'brea@3aktive.dk', phone: '30924943', photo: `${cdn}/6926f638ff82d241af08e5f3_68c94059f9b99e0cf1fa8c79_68c80b85b6742cb4acc7a43c_BREA_300x400.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: true,
  },
  {
    id: '3aktive-odense', name: '3Aktive Odense', brand: '3Aktive', region: 'Fyn', country: 'dk',
    address: 'Rolundsvej 15', zipCity: '5260 Odense S', lat: 55.35037, lng: 10.407406,
    maps: 'https://maps.app.goo.gl/5wFyxPZ2v2c7Fx6n8',
    manager: { name: 'Tonny M. Eriksen', email: 'tme@3aktive.dk', phone: '24298130', photo: `${cdn}/6926f638f1afb2167ec6990a_69120df4d346bd5122113496_TME_UltraSmall.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: true,
  },
  {
    id: '3aktive-kolding', name: '3Aktive Kolding', brand: '3Aktive', region: 'Jylland', country: 'dk',
    address: 'Platinvej 6', zipCity: '6000 Kolding', lat: 55.507796, lng: 9.453385,
    maps: 'https://maps.app.goo.gl/aMMSrBrNnBD8HsVv5',
    manager: { name: 'Casper P. Thygesen', email: 'cpt@3aktive.dk', phone: '24298138', photo: `${cdn}/6926f638726dc3e3f8933aac_68c9405904f3ec1c73fbf2f9_68c80c287d0f64f27921e0f8_CPT_300x400.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: true,
  },
  {
    id: '3aktive-aarhus', name: '3Aktive Aarhus', brand: '3Aktive', region: 'Jylland', country: 'dk',
    address: 'Søren Frichs Vej 49', zipCity: '8230 Åbyhøj', lat: 56.150714, lng: 10.17171,
    maps: 'https://maps.app.goo.gl/NaLn4RX2cepBuyAb6',
    manager: { name: 'Carsten Ramsdahl', email: 'cra@3aktive.dk', phone: '30924931', photo: `${cdn}/6926f638cb092b185ccb34d7_69120de34b6837cb3a9e2e4f_CRA_cropped_SQ_300x300_web.jpeg` },
    monThu: [6.3, 16], fri: [6.3, 15], weekendClosed: true, festool: false, sikring: false, aktive3: true,
  },
];
