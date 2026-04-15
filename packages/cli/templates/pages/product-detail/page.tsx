'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSGrid} from '@xds/core/Grid';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSIcon} from '@xds/core/Icon';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSNavIcon} from '@xds/core/NavIcon';

// ─── Icons ──────────────────────────────────────────────────────────────────
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

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const MinusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({rating, count}: {rating: number; count: number}) {
  const full = Math.floor(rating);
  const partial = rating - full;
  const empty = 5 - full - (partial > 0 ? 1 : 0);
  const starSize = 16;

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
      {Array.from({length: full}, (_, i) => (
        <svg
          key={`full-${i}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            width: starSize,
            height: starSize,
            color: 'var(--color-icon-primary)',
          }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {partial > 0 && (
        <svg
          key="partial"
          viewBox="0 0 24 24"
          style={{width: starSize, height: starSize}}>
          <defs>
            <clipPath id="star-clip">
              <rect x="0" y="0" width={24 * partial} height="24" />
            </clipPath>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="var(--color-icon-primary)"
            clipPath="url(#star-clip)"
          />
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="none"
            stroke="var(--color-icon-primary)"
            strokeWidth={1.5}
          />
        </svg>
      )}
      {Array.from({length: empty}, (_, i) => (
        <svg
          key={`empty-${i}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-icon-primary)"
          strokeWidth={1.5}
          style={{width: starSize, height: starSize}}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <XDSText type="body" color="secondary">
        {rating} ({count})
      </XDSText>
    </div>
  );
}

// ─── Image URLs ─────────────────────────────────────────────────────────────
// Light product photography from the xds_oss asset set (ceramics collection)
// Source: meta assets.file list -s xds_oss -g light-product-{1..5}
// IMAGES[0] = fallback hero; IMAGES[1..6] = thumbnails (first is selected by default)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const IMAGES = [
  `${basePath}/templates/light-product-1.png`,
  `${basePath}/templates/light-product-1.png`,
  `${basePath}/templates/light-product-2.png`,
  `${basePath}/templates/light-product-3.png`,
  `${basePath}/templates/light-product-4.png`,
  `${basePath}/templates/light-product-5.png`,
  `${basePath}/templates/light-product-2.png`,
];

// ─── Product Data ───────────────────────────────────────────────────────────
const PRODUCT = {
  name: 'Solstice Mug & Plate Set',
  price: 89.0,
  originalPrice: 119.0,
  description:
    'A hand-thrown mug and plate set that brings quiet warmth to every meal. The mug sits easy in the hand with a generous 12 oz capacity, while the 8-inch plate works for everything from toast to tapas. Each piece is kiln-fired at 2,300°F for a finish that resists chips and stains. Subtle variations in the reactive glaze mean no two sets are exactly alike. Dishwasher and microwave safe.',
  composition:
    'High-fire stoneware clay, wheel-thrown and trimmed by hand. Reactive glaze applied by dipping — color pools and breaks naturally over the clay body. Lead-free and food-safe. Unglazed foot ring reveals the raw clay underneath. Each piece is bisque-fired, glazed, then fired again to cone 10 in a gas reduction kiln.',
  deliveryReturns:
    'Free shipping on all ceramics orders over $75. Each piece is individually wrapped in recycled kraft paper and cushioned for transit. Returns accepted within 30 days — items must be unused and in original packaging. Replacement pieces available individually.',
  dimensions:
    'Mug height: 9.5 cm / 3.75 in. Mug diameter: 8.5 cm / 3.35 in. Capacity: 350 ml / 12 oz. Plate diameter: 20 cm / 8 in. Plate height: 2 cm / 0.75 in. Weight: 680 g / 1.5 lb (set).',
};

const COLORS = [
  {value: 'snow', label: 'Snow'},
  {value: 'oat', label: 'Oat'},
  {value: 'sage', label: 'Sage'},
  {value: 'charcoal', label: 'Charcoal'},
];

const FINISHES = [
  {value: 'matte', label: 'Matte'},
  {value: 'satin', label: 'Satin'},
  {value: 'speckled', label: 'Speckled'},
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── TopNav ─────────────────────────────────────────────────────────────────
function StoreTopNav() {
  return (
    <XDSTopNav
      label="Store navigation"
      heading={
        <XDSTopNavHeading
          heading="Kiln & Table"
          logo={
            <XDSNavIcon icon={<XDSIcon icon={BagIcon} size="sm" />} />
          }
          href="#"
        />
      }
      centerContent={
        <>
          <XDSTopNavItem label="New Arrivals" href="#" />
          <XDSTopNavItem label="Mugs" href="#" isSelected />
          <XDSTopNavItem label="Plates & Bowls" href="#" />
          <XDSTopNavItem label="Serveware" href="#" />
          <XDSTopNavItem label="About" href="#" />
        </>
      }
      endContent={
        <>
          <XDSButton
            label="Search"
            variant="ghost"
            icon={<XDSIcon icon={SearchIcon} size="sm" />}
            isIconOnly
          />
          <XDSButton
            label="Wishlist"
            variant="ghost"
            icon={<XDSIcon icon={HeartIcon} size="sm" />}
            isIconOnly
          />
          <XDSButton
            label="Account"
            variant="ghost"
            icon={<XDSIcon icon={UserIcon} size="sm" />}
            isIconOnly
          />
          <XDSButton
            label="Cart"
            variant="ghost"
            icon={<XDSIcon icon={BagIcon} size="sm" />}
            isIconOnly
          />
        </>
      }
    />
  );
}

// ─── Image Gallery ──────────────────────────────────────────────────────────
function ImageGallery({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (i: number) => void;
}) {
  const heroSrc = IMAGES[selected + 1] ?? IMAGES[0];
  const thumbnails = IMAGES.slice(1);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {/* Hero image */}
      <img
        src={heroSrc}
        alt={PRODUCT.name}
        style={{
          width: '100%',
          aspectRatio: '4 / 5',
          objectFit: 'cover',
          borderRadius: 'var(--radius-container, 12px)',
          backgroundColor: 'var(--color-surface-secondary)',
        }}
      />
      {/* Thumbnail grid */}
      <XDSGrid columns={3} gap={2}>
        {thumbnails.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Product image ${i + 1}`}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              cursor: 'pointer',
              borderRadius: 'var(--radius-element, 8px)',
              outline:
                selected === i
                  ? '2px solid var(--color-accent, #0866ff)'
                  : 'none',
              outlineOffset: selected === i ? 2 : 0,
            }}
            onClick={() => onSelect(i)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(i);
              }
            }}
          />
        ))}
      </XDSGrid>
    </div>
  );
}

// ─── Product Info ───────────────────────────────────────────────────────────
function ProductInfo() {
  const [color, setColor] = useState('snow');
  const [finish, setFinish] = useState('matte');
  const [quantity, setQuantity] = useState<number | null>(1);

  const decrement = () => setQuantity(q => Math.max(1, (q ?? 1) - 1));
  const increment = () => setQuantity(q => Math.min(10, (q ?? 1) + 1));

  return (
    <XDSVStack gap={5}>
      {/* Title & Rating */}
      <XDSVStack gap={2}>
        <XDSHeading level={1}>{PRODUCT.name}</XDSHeading>
        <StarRating rating={4.3} count={128} />
        <XDSHStack gap={2} style={{alignItems: 'center'}}>
          <XDSText type="large" weight="bold">
            {fmt(PRODUCT.price)}
          </XDSText>
          <XDSText type="body" color="secondary" hasStrikethrough>
            {fmt(PRODUCT.originalPrice)}
          </XDSText>
          <XDSBadge variant="error" label="Sale" />
        </XDSHStack>
      </XDSVStack>
      {/* Glaze Selector */}
      <XDSVStack gap={2}>
        <XDSText type="label">Glaze</XDSText>
        <div style={{width: 'fit-content'}}>
          <XDSSegmentedControl value={color} onChange={setColor} label="Glaze">
            {COLORS.map(c => (
              <XDSSegmentedControlItem
                key={c.value}
                value={c.value}
                label={c.label}
              />
            ))}
          </XDSSegmentedControl>
        </div>
      </XDSVStack>
      {/* Finish Selector */}
      <XDSVStack gap={2}>
        <XDSText type="label">Finish</XDSText>
        <div style={{width: 'fit-content'}}>
          <XDSSegmentedControl
            value={finish}
            onChange={setFinish}
            label="Finish">
            {FINISHES.map(f => (
              <XDSSegmentedControlItem
                key={f.value}
                value={f.value}
                label={f.label}
              />
            ))}
          </XDSSegmentedControl>
        </div>
      </XDSVStack>
      {/* Quantity */}
      <XDSHStack gap={1} vAlign="center">
        <XDSButton
          label="Decrease quantity"
          variant="ghost"
          icon={<XDSIcon icon={MinusIcon} size="sm" />}
          onClickAction={decrement}
          isDisabled={(quantity ?? 1) <= 1}
          isIconOnly
        />
        <div style={{width: 100}}>
          <XDSNumberInput
            label="Quantity"
            isLabelHidden
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={10}
            isIntegerOnly
          />
        </div>
        <XDSButton
          label="Increase quantity"
          variant="ghost"
          icon={<XDSIcon icon={PlusIcon} size="sm" />}
          onClickAction={increment}
          isDisabled={(quantity ?? 1) >= 10}
          isIconOnly
        />
      </XDSHStack>
      {/* Add to Cart + Buy it now (8px gap between them) */}
      <XDSVStack gap={2}>
        <XDSButton
          label="Add to Cart"
          variant="primary"
          size="lg"
          style={{display: 'flex', width: '100%'}}>
          Add to Cart
        </XDSButton>

        {/* Buy it now + Wishlist */}
        <XDSHStack gap={2}>
          <XDSButton
            label="Buy it now"
            variant="secondary"
            size="lg"
            style={{display: 'flex', flex: 1}}>
            Buy it now
          </XDSButton>
          <XDSButton
            label="Add to wishlist"
            variant="ghost"
            size="lg"
            icon={<XDSIcon icon={HeartIcon} size="sm" />}
            isIconOnly
          />
        </XDSHStack>
      </XDSVStack>
      {/* Description */}
      <XDSText type="body">{PRODUCT.description}</XDSText>
      {/* Collapsible Sections */}
      <XDSCollapsibleGroup type="multiple" defaultValue={['composition']}>
        <XDSDivider />
        <XDSCollapsible
          value="composition"
          trigger={<XDSHeading level={3}>Composition</XDSHeading>}>
          <XDSText type="body">{PRODUCT.composition}</XDSText>
        </XDSCollapsible>
        <XDSDivider />
        <XDSCollapsible
          value="delivery"
          defaultIsOpen={false}
          trigger={<XDSHeading level={3}>Delivery &amp; Returns</XDSHeading>}>
          <XDSText type="body">{PRODUCT.deliveryReturns}</XDSText>
        </XDSCollapsible>
        <XDSDivider />
        <XDSCollapsible
          value="dimensions"
          defaultIsOpen={false}
          trigger={<XDSHeading level={3}>Dimensions</XDSHeading>}>
          <XDSText type="body">{PRODUCT.dimensions}</XDSText>
        </XDSCollapsible>
        <XDSDivider />
      </XDSCollapsibleGroup>
    </XDSVStack>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ProductDetailTemplate() {
  const [selectedThumb, setSelectedThumb] = useState(0);

  return (
    <XDSAppShell
      topNav={<StoreTopNav />}
      height="auto"
      contentPadding={0}
      variant="surface">
      <XDSCenter axis="horizontal">
        <div
          style={{
            maxWidth: 1200,
            width: '100%',
            padding: '32px 24px',
          }}>
          <XDSGrid columns={2} gap={5}>
            <div style={{minWidth: 0}}>
              <ImageGallery
                selected={selectedThumb}
                onSelect={setSelectedThumb}
              />
            </div>
            <div
              style={{
                minWidth: 0,
                position: 'sticky',
                top: 64,
                alignSelf: 'start',
              }}>
              <ProductInfo />
            </div>
          </XDSGrid>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
