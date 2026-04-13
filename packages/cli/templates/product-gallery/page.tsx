'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M4 6h16M6 12h12M8 18h8" strokeLinecap="round" />
  </svg>
);

// ─── Product Data ───────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: 'New' | 'Sale';
  category: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Arc Floor Lamp',
    description:
      'Sculptural brass arc lamp with a linen drum shade and marble base.',
    price: 249.0,
    originalPrice: 329.0,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80',
    badge: 'Sale',
    category: 'Lighting',
  },
  {
    id: 2,
    name: 'Woven Rattan Chair',
    description: 'Hand-woven rattan accent chair with a solid oak frame.',
    price: 389.0,
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    badge: 'New',
    category: 'Furniture',
  },
  {
    id: 3,
    name: 'Ceramic Table Vase',
    description: 'Minimalist stoneware vase with a matte glaze finish.',
    price: 64.0,
    image:
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&q=80',
    category: 'Decor',
  },
  {
    id: 4,
    name: 'Linen Throw Blanket',
    description: 'Stonewashed French linen throw in a soft neutral palette.',
    price: 89.0,
    originalPrice: 120.0,
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
    badge: 'Sale',
    category: 'Textiles',
  },
  {
    id: 5,
    name: 'Walnut Side Table',
    description: 'Solid walnut side table with turned legs and a lower shelf.',
    price: 275.0,
    image:
      'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&q=80',
    badge: 'New',
    category: 'Furniture',
  },
  {
    id: 6,
    name: 'Pendant Light Cluster',
    description: 'Three handblown glass pendants on a brushed steel canopy.',
    price: 349.0,
    image:
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80',
    category: 'Lighting',
  },
  {
    id: 7,
    name: 'Cotton Rug — 5×8',
    description: 'Flatweave cotton area rug with a geometric pattern.',
    price: 195.0,
    originalPrice: 260.0,
    image:
      'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
    badge: 'Sale',
    category: 'Textiles',
  },
  {
    id: 8,
    name: 'Brass Desk Organizer',
    description:
      'Brushed brass organizer with three compartments for pens and cards.',
    price: 48.0,
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    category: 'Decor',
  },
  {
    id: 9,
    name: 'Oak Bookshelf',
    description:
      'Open-frame white oak bookshelf with five shelves and steel joints.',
    price: 599.0,
    image:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',
    badge: 'New',
    category: 'Furniture',
  },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── TopNav ─────────────────────────────────────────────────────────────────

function StoreTopNav() {
  return (
    <XDSTopNav
      label="Store navigation"
      heading={
        <XDSTopNavHeading
          heading="Haus Studio"
          logo={
            <XDSNavIcon icon={<BagIcon style={{width: 16, height: 16}} />} />
          }
          href="#"
        />
      }
      centerContent={
        <>
          <XDSTopNavItem label="New Arrivals" href="#" />
          <XDSTopNavItem label="Lighting" href="#" />
          <XDSTopNavItem label="Furniture" href="#" />
          <XDSTopNavItem label="Decor" href="#" />
          <XDSTopNavItem label="Sale" href="#" />
        </>
      }
      endContent={
        <>
          <XDSButton
            label="Search"
            variant="ghost"
            icon={<SearchIcon style={{width: 16, height: 16}} />}
            isIconOnly
          />
          <XDSButton
            label="Account"
            variant="ghost"
            icon={<UserIcon style={{width: 16, height: 16}} />}
            isIconOnly
          />
          <XDSButton
            label="Cart"
            variant="ghost"
            icon={<BagIcon style={{width: 16, height: 16}} />}
            isIconOnly
          />
        </>
      }
    />
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({product}: {product: Product}) {
  return (
    <XDSCard padding={0}>
      {/* Image area with optional badge overlay */}
      <div style={{position: 'relative'}}>
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
        {product.badge && (
          <div style={{position: 'absolute', top: 12, left: 12}}>
            <XDSBadge
              variant={product.badge === 'Sale' ? 'error' : 'info'}
              label={product.badge}
            />
          </div>
        )}
      </div>

      {/* Product info */}
      <div style={{padding: 12}}>
        <XDSVStack gap={0.5}>
          <XDSText type="supporting" color="secondary">
            {product.category}
          </XDSText>
          <XDSText type="label" weight="bold">
            {product.name}
          </XDSText>
          <XDSText type="body" color="secondary" maxLines={2}>
            {product.description}
          </XDSText>
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="body" weight="bold">
              {fmt(product.price)}
            </XDSText>
            {product.originalPrice && (
              <XDSText type="body" color="secondary" hasStrikethrough>
                {fmt(product.originalPrice)}
              </XDSText>
            )}
          </XDSHStack>
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProductGalleryTemplate() {
  return (
    <XDSAppShell
      topNav={<StoreTopNav />}
      height="auto"
      contentPadding={0}
      variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1200, width: '100%', padding: '32px 24px 64px'}}>
          <XDSVStack gap={6}>
            {/* Page Header */}
            <XDSHStack gap={3} vAlign="center">
              <XDSVStack gap={1}>
                <XDSHeading level={1}>Shop All</XDSHeading>
                <XDSText type="body" color="secondary">
                  {PRODUCTS.length} products
                </XDSText>
              </XDSVStack>
              <div style={{marginLeft: 'auto'}}>
                <XDSButton
                  label="Filter"
                  variant="secondary"
                  icon={<FilterIcon style={{width: 16, height: 16}} />}
                />
              </div>
            </XDSHStack>

            {/* Product Grid */}
            <XDSGrid columns={3} gap={4}>
              {PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </XDSGrid>

            {/* Load More */}
            <XDSCenter axis="horizontal">
              <XDSButton label="Load more" variant="secondary" />
            </XDSCenter>
          </XDSVStack>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
