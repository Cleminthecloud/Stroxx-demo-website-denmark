import { siteSettings } from './siteSettings';
import { landingPage } from './landingPage';
import { monthlyLineup } from './monthlyLineup';
import { productAugment } from './productAugment';
import { homePage } from './homePage';
import { store } from './store';
import { market } from './market';
import { trade } from './trade';
import { tradesIndex } from './tradesIndex';
import { specialist, testimonial, video, legalPage } from './collections';
import { post } from './post';
import { redirect } from './redirect';
import { supportPage } from './supportPage';
import { qrCode } from './qrCode';
import { feedback } from './feedback';
import { dataSources } from './dataSources';
import { permission } from './permission';
import { campaign } from './campaign';
import { hotspotImage } from './hotspotImage';
/* brandPage removed from the Studio: /brand is now fully code-owned (we manage it) */

export const schemaTypes = [
  /* shared object types first: documents below reference them by name */
  hotspotImage,
  siteSettings,
  landingPage,
  campaign,
  monthlyLineup,
  productAugment,
  homePage,
  market,
  store,
  trade,
  tradesIndex,
  specialist,
  testimonial,
  video,
  legalPage,
  post,
  redirect,
  supportPage,
  qrCode,
  feedback,
  dataSources,
  permission,
];
