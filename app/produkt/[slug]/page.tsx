import { notFound } from 'next/navigation';
import ProductExperience from '@/components/ProductExperience';
import {
  products,
  productBySlug,
  categoryBySlug,
  productBuyUrl,
  crImage,
  specialists,
} from '@/lib/data';

const priceNum = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.'));

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = productBySlug(params.slug);
  if (!p) return { title: 'STROXX' };
  const cat = categoryBySlug(p.category);
  const desc = `${p.name} fra STROXX${cat ? ` · ${cat.name}` : ''}. ${p.price} DKK inkl. moms. Pro-kvalitet til en skarp pris — kun hos Carl Ras. 100% tilfredsgaranti.`;
  return {
    title: `${p.name} — STROXX`,
    description: desc,
    openGraph: { title: `${p.name} — STROXX`, description: desc, images: [crImage(p.imgId)], type: 'website' },
  };
}

export default function FocusProduct({ params }: { params: { slug: string } }) {
  const product = productBySlug(params.slug);
  if (!product) notFound();

  const cat = categoryBySlug(product.category);
  const buyUrl = productBuyUrl(product.code);
  const related = products
    .filter((p) => p.slug !== product.slug && p.tags.some((t) => product.tags.includes(t)))
    .slice(0, 4);
  const sIdx = product.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % specialists.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: crImage(product.imgId),
    sku: product.code,
    mpn: product.code,
    brand: { '@type': 'Brand', name: 'STROXX' },
    category: cat?.name,
    ...(product.specs.length ? { additionalProperty: product.specs.map((s) => ({ '@type': 'PropertyValue', name: s.label, value: s.value })) } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'DKK',
      price: priceNum(product.price).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: buyUrl,
      seller: { '@type': 'Organization', name: 'Carl Ras' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductExperience
        product={product}
        related={related}
        spec={specialists[sIdx]}
        buyUrl={buyUrl}
        categoryName={cat?.name ?? 'STROXX'}
        categorySlug={cat?.slug ?? ''}
      />
    </>
  );
}
