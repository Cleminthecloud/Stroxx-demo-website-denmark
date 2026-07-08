import type { StructureResolver } from 'sanity/structure';
import {
  DocumentsIcon,
  HomeIcon,
  HelpCircleIcon,
  PackageIcon,
  EditIcon,
  UsersIcon,
  PinIcon,
  CogIcon,
  EarthGlobeIcon,
  TranslateIcon,
  ComponentIcon,
} from '@sanity/icons';

/** Custom Studio structure. The flat ~18-type list is grouped by what an editor
 *  thinks about (pages, support, products, news, proof, stores, settings,
 *  system), so the top level stays calm (~8 items) and related types sit
 *  together. Drilling into a group opens its types in the next column. A divider
 *  puts everyday content above config/system. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.documentTypeListItem('homePage').title('Homepage').icon(HomeIcon),
              S.documentTypeListItem('landingPage').title('Campaign / landing pages'),
              S.documentTypeListItem('trade').title('Trade pages (fag)'),
              S.documentTypeListItem('monthlyLineup').title('Monthly lineup'),
              S.documentTypeListItem('legalPage').title('Legal pages'),
            ]),
        ),
      S.listItem()
        .title('Support & QR codes')
        .icon(HelpCircleIcon)
        .child(
          S.list()
            .title('Support & QR codes')
            .items([
              S.documentTypeListItem('supportPage').title('Support pages'),
              S.documentTypeListItem('qrCode').title('QR codes'),
              S.documentTypeListItem('redirect').title('Redirects'),
            ]),
        ),
      S.documentTypeListItem('productAugment').title('Products').icon(PackageIcon),
      S.documentTypeListItem('post').title('News articles').icon(EditIcon),
      S.listItem()
        .title('Social proof & media')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Social proof & media')
            .items([
              S.documentTypeListItem('specialist').title('Specialists'),
              S.documentTypeListItem('testimonial').title('Testimonials'),
              S.documentTypeListItem('video').title('Films (YouTube)'),
            ]),
        ),
      S.documentTypeListItem('store').title('Stores').icon(PinIcon),
      S.divider(),
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Settings')
            .items([
              S.documentTypeListItem('siteSettings').title('Site settings'),
              S.documentTypeListItem('market').title('Markets').icon(EarthGlobeIcon),
            ]),
        ),
      S.listItem()
        .title('System')
        .icon(ComponentIcon)
        .child(
          S.list()
            .title('System')
            .items([
              S.documentTypeListItem('translation.metadata').title('Translation metadata').icon(TranslateIcon),
              S.documentTypeListItem('feedback').title('Feedback (test reports)'),
            ]),
        ),
    ]);
