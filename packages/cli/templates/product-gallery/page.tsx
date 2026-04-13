'use client';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
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
    <XDSCard padding={0} variant="muted">
      <XDSAspectRatio ratio={4 / 3}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </XDSAspectRatio>

      <div style={{padding: 12}}>
        <XDSVStack gap={1}>
          <XDSText type="body" size="2xl" weight="medium">
            {product.name}
          </XDSText>
          <XDSText type="body" color="secondary" maxLines={2}>
            {product.description}
          </XDSText>
          <XDSText type="body" size="2xl" weight="bold">
            {fmt(product.price)}
          </XDSText>
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProductGalleryTemplate() {
  return (
    <XDSCenter axis="horizontal">
      <div style={{maxWidth: 1200, width: '100%', padding: '32px 24px 64px'}}>
        <XDSVStack gap={6}>
          {/* Header — title left, description + CTA right */}
          <XDSHStack gap={4} vAlign="start">
            <div style={{flex: '1 1 0%', minWidth: 0}}>
              <XDSText type="large" size="3xl" weight="bold" as="p">
                Make every day a little more delightful, one detail at a time.
              </XDSText>
            </div>
            <div style={{flex: '1 1 0%', minWidth: 0}}>
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
          </XDSHStack>

          {/* Product Grid */}
          <XDSGrid columns={3} gap={4}>
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </XDSGrid>
        </XDSVStack>
      </div>
    </XDSCenter>
  );
}
