'use client';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSIcon} from '@xds/core/Icon';

// ─── Icons ──────────────────────────────────────────────────────────────────

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Product Data ───────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Going places',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 75.0,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80',
  },
  {
    id: 2,
    name: 'Meeting people',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 80.0,
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  },
  {
    id: 3,
    name: 'Seeing things',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 75.0,
    image:
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&q=80',
  },
  {
    id: 4,
    name: 'Sharing ideas',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 75.0,
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
  },
  {
    id: 5,
    name: 'Making memories',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 60.0,
    image:
      'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&q=80',
  },
  {
    id: 6,
    name: 'Being free',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 80.0,
    image:
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80',
  },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({product}: {product: Product}) {
  return (
    <XDSVStack gap={3}>
      <XDSAspectRatio
        ratio={1}
        style={{
          borderRadius: 'var(--radius-container)',
          overflow: 'clip',
        }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--color-background-wash, #f0f0f0)',
          }}
        />
      </XDSAspectRatio>

      <XDSVStack gap={1}>
        <XDSText
          type="body"
          weight="medium"
          style={{fontSize: 'var(--font-size-xl)'}}>
          {product.name}
        </XDSText>
        <XDSText type="body" color="secondary" maxLines={2}>
          {product.description}
        </XDSText>
        <XDSText
          type="body"
          weight="bold"
          style={{fontSize: 'var(--font-size-xl)'}}>
          {fmt(product.price)}
        </XDSText>
      </XDSVStack>
    </XDSVStack>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProductGalleryTemplate() {
  return (
    <XDSCenter axis="horizontal">
      <div style={{maxWidth: 1200, width: '100%', padding: '32px 24px 64px'}}>
        <XDSVStack gap={6}>
          {/* Header — side-by-side on desktop, stacked on mobile */}
          <div className="product-gallery-header">
            <div className="product-gallery-header-title">
              <XDSText
                type="large"
                weight="bold"
                as="p"
                style={{fontSize: 'var(--font-size-2xl)'}}>
                Make every day a little more delightful, one small detail at a
                time.
              </XDSText>
            </div>
            <div className="product-gallery-header-body">
              <XDSVStack gap={3}>
                <XDSText type="body">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
                  ut enim ad minim exercitation.
                </XDSText>
                <div>
                  <XDSButton
                    label="Get started"
                    variant="primary"
                    endContent={
                      <XDSIcon icon={ArrowRightIcon} color="inherit" />
                    }
                  />
                </div>
              </XDSVStack>
            </div>
          </div>

          {/* Product Grid — 3 cols desktop, 2 cols mobile */}
          <div className="product-gallery-grid">
            <XDSGrid columns={3} gap={6}>
              {PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </XDSGrid>
          </div>
        </XDSVStack>

        {/* Responsive styles */}
        <style>{`
          .product-gallery-header {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }
          .product-gallery-header-title,
          .product-gallery-header-body {
            flex: 1 1 0%;
            min-width: 0;
          }
          @media (max-width: 640px) {
            .product-gallery-header {
              flex-direction: column;
            }
            .product-gallery-grid .xds-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </XDSCenter>
  );
}
