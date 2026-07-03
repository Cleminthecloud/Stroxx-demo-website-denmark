import imageUrlBuilder from '@sanity/image-url';
import { projectId, dataset } from '../env';

const builder = imageUrlBuilder({ projectId, dataset });

/** CDN URL for an uploaded Sanity image, or null when the field is empty.
 *  Editors upload/browse/crop in the Studio; we serve the sized rendition. */
export function assetUrl(img: unknown, width = 2200): string | null {
  const i = img as { asset?: { _ref?: string } } | null | undefined;
  if (!i?.asset?._ref) return null;
  try {
    return builder.image(i).width(width).auto('format').url();
  } catch {
    return null;
  }
}
