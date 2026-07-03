import { notFound } from 'next/navigation';
import ProductExperience from '@/components/ProductExperience';
import {
  products,
  productBySlug,
  categoryBySlug,
  productBuyUrl,
  toolTexture,
  specialistForProduct,
} from '@/lib/data';
import { testimonials } from '@/lib/testimonials';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = productBySlug((await params).slug);
  if (!p) return { title: 'STROXX' };
  const cat = categoryBySlug(p.category);
  const desc = `${p.name} from STROXX${cat ? ` · ${cat.name}` : ''}. Pro quality, only at Carl Ras. 100% satisfaction guarantee.`;
  // OG image via our own proxy: the Carl Ras CDN fetch needs a Referer header,
  // which OG scrapers don't send — the proxy is same-origin and always works.
  const og = `${SITE_URL}${toolTexture(p.imgId, '50383')}`;
  return {
    // layout.tsx's title template appends " — STROXX"
    title: p.name,
    description: desc,
    alternates: { canonical: `/produkt/${p.slug}` },
    openGraph: { title: `${p.name} — STROXX`, description: desc, images: [og], type: 'website' },
  };
}

export default async function FocusProduct({ params }: { params: Promise<{ slug: string }> }) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();

  const cat = categoryBySlug(product.category);
  const buyUrl = productBuyUrl(product.code);
  const related = products
    .filter((p) => p.slug !== product.slug && p.tags.some((t) => product.tags.includes(t)))
    .slice(0, 4);
  const spec = specialistForProduct(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: `${SITE_URL}${toolTexture(product.imgId, '50383')}`,
    sku: product.code,
    mpn: product.code,
    brand: { '@type': 'Brand', name: 'STROXX' },
    category: cat?.name,
    ...(product.specs.length ? { additionalProperty: product.specs.map((s) => ({ '@type': 'PropertyValue', name: s.label, value: s.value })) } : {}),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: buyUrl,
      seller: { '@type': 'Organization', name: 'Carl Ras' },
    },
    // Real customer reviews for THIS product (from Pro Club, verified against
    // sales data in production). Only attached when a quote names this product.
    ...(() => {
      const revs = testimonials.filter((t) => t.productCode === product.code);
      if (!revs.length) return {};
      return {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (revs.reduce((s, r) => s + r.rating, 0) / revs.length).toFixed(1),
          reviewCount: revs.length,
        },
        review: revs.map((r) => ({
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
          author: { '@type': 'Person', name: r.name },
          reviewBody: r.quote,
        })),
      };
    })(),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/produkter` },
      ...(cat ? [{ '@type': 'ListItem', position: 3, name: cat.name, item: `${SITE_URL}/produkter?cat=${cat.slug}` }] : []),
      { '@type': 'ListItem', position: cat ? 4 : 3, name: product.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ProductExperience
        product={product}
        related={related}
        spec={spec}
        buyUrl={buyUrl}
        categoryName={cat?.name ?? 'STROXX'}
        categorySlug={cat?.slug ?? ''}
      />
    </>
  );
}
