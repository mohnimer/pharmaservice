import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'

async function getProduct(slug: string) {
  const query = `*[_type == "product" && slug.current == $slug][0]{
    _id,
    name,
    slug,
    category,
    price,
    unit,
    shortDescription,
    whyWeChoseThis,
    mainImage,
    verdict,
    inStock,
    mohRegistration,
    fullDescription,
    ingredients,
    seoTitle,
    seoDescription
  }`
  
  return client.fetch(query, { slug })
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  
  if (!product) return {}
  
  return {
    title: product.seoTitle || `${product.name} | Pharma Service`,
    description: product.seoDescription || product.shortDescription,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  
  if (!product) {
    return <div>Product not found</div>
  }

  const categoryColors: any = {
    digestive: 'plantalax',
    elderly: 'underpad',
    dental: 'fittydent'
  }

  return (
    <>
      {/* NAV - Same as homepage */}
      <nav id="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Pharma <span>Service</span></Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/products" className="active">Products</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/about">About</Link>
            <Link href="#subscribe" className="nav-cta">Subscribe</Link>
          </div>
        </div>
      </nav>

      {/* PRODUCT DETAIL */}
      <div style={{ paddingTop: '100px', maxWidth: '1280px', margin: '0 auto', padding: '100px 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', marginBottom: '80px' }}>
          
          {/* Product Image */}
          <div className={`product-card-img ${categoryColors[product.category] || ''}`} style={{ height: '500px', borderRadius: '16px' }}>
            {product.mainImage && (
              <Image
                src={urlFor(product.mainImage).width(800).url()}
                alt={product.name}
                width={800}
                height={500}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
              />
            )}
            {product.verdict && (
              <span className="verdict"><span className="star">★</span> {product.verdict}</span>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--teal)', marginBottom: '16px' }}>
              {product.category}
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px', color: 'var(--navy)', marginBottom: '16px', letterSpacing: '-1px' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--textMuted)', marginBottom: '32px', lineHeight: 1.7 }}>
              {product.shortDescription}
            </p>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '32px' }}>
              <span style={{ fontSize: '42px', fontWeight: 600, color: 'var(--navy)' }}>{product.price} AED</span>
              <span style={{ fontSize: '18px', color: 'var(--textMuted)' }}>{product.unit}</span>
            </div>

            {/* Stock Status */}
            {product.inStock ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e8f4f2', padding: '8px 16px', borderRadius: '6px', marginBottom: '24px', color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal)' }}></span>
                In Stock - Next Day Delivery
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f4e8e8', padding: '8px 16px', borderRadius: '6px', marginBottom: '24px', color: '#c44', fontWeight: 600, fontSize: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c44' }}></span>
                Out of Stock
              </div>
            )}

            {/* Order Button */}
            <button className="btn-primary" style={{ width: '100%', fontSize: '16px', padding: '18px', marginBottom: '16px' }}>
              Order via WhatsApp
            </button>

            {/* Why We Chose This */}
            <div className="product-why" style={{ marginTop: '32px' }}>
              <strong>Why we chose this</strong>
              {product.whyWeChoseThis}
            </div>

            {/* MOH Registration */}
            {product.mohRegistration && (
              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bgWarm)', borderRadius: '8px', fontSize: '13px', color: 'var(--textMuted)' }}>
                <strong style={{ color: 'var(--navy)' }}>MOH Registration:</strong> {product.mohRegistration}
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        {product.fullDescription && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }} className="article-content">
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '32px', marginBottom: '24px' }}>Product Details</h2>
            <PortableText value={product.fullDescription} />
          </div>
        )}

        {/* Ingredients */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div style={{ maxWidth: '800px', margin: '48px auto 0' }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '24px', marginBottom: '16px' }}>Key Ingredients</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {product.ingredients.map((ingredient: string, index: number) => (
                <li key={index} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.shortDescription,
            brand: 'Pharma Service',
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'AED',
              availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
            }
          })
        }}
      />
    </>
  )
}
