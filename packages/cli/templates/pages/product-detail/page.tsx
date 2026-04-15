'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSNumberInput} from '@xds/core/NumberInput';
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
// Main hero: B&W living room (unsplash pqyu59ZcbLU)
// Thumbnails: B&W interiors of similar tone
const IMAGES = [
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80',
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'https://images.unsplash.com/photo-1489171078254-c3365d6e359f?w=400&q=80',
];

// ─── Product Data ───────────────────────────────────────────────────────────
const PRODUCT = {
  name: 'Arc Floor Lamp',
  price: 249.0,
  originalPrice: 329.0,
  description:
    'A sculptural arc floor lamp that balances bold geometry with warm ambient light. The adjustable arm extends up to 72 inches, casting a wide pool of light over a reading nook, sofa, or desk. The weighted marble base keeps it stable without a bulky footprint. A built-in dimmer on the cord lets you shift from bright task lighting to a soft evening glow. Pairs beautifully with mid-century and minimalist interiors alike.',
  composition:
    'Powder-coated steel arm with a brushed brass finish at the joints. Natural Carrara marble base (each piece has unique veining). Linen drum shade lined in white for even light diffusion. UL-listed for dry locations. Uses one standard E26 bulb (LED recommended, up to 100W equivalent).',
  deliveryReturns:
    'Free white-glove delivery on all lighting orders. Professional assembly included. Returns accepted within 14 days — item must be unassembled in original packaging. Replacement shades available separately.',
  dimensions:
    'Overall height: 183 cm / 72 in (adjustable). Base diameter: 30 cm / 12 in. Shade diameter: 36 cm / 14 in. Shade height: 25 cm / 10 in. Arm reach: 100 cm / 39 in.',
};

const COLORS = [
  {value: 'matte-black', label: 'Matte Black'},
  {value: 'brass', label: 'Brass'},
  {value: 'white', label: 'White'},
  {value: 'walnut', label: 'Walnut'},
];

const FINISHES = [
  {value: 'linen', label: 'Linen'},
  {value: 'frosted', label: 'Frosted Glass'},
  {value: 'rattan', label: 'Rattan'},
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
          <XDSTopNavItem label="Lighting" href="#" isSelected />
          <XDSTopNavItem label="Furniture" href="#" />
          <XDSTopNavItem label="Decor" href="#" />
          <XDSTopNavItem label="About" href="#" />
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
            label="Wishlist"
            variant="ghost"
            icon={<HeartIcon style={{width: 16, height: 16}} />}
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
          backgroundColor: '#e8e8e8',
        }}
      />
      {/* Thumbnail grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}>
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
      </div>
    </div>
  );
}

// ─── Product Info ───────────────────────────────────────────────────────────
function ProductInfo() {
  const [color, setColor] = useState('matte-black');
  const [finish, setFinish] = useState('linen');
  const [quantity, setQuantity] = useState<number | null>(1);

  const decrement = () => setQuantity(q => Math.max(1, (q ?? 1) - 1));
  const increment = () => setQuantity(q => Math.min(10, (q ?? 1) + 1));

  return (
    <XDSVStack gap={5}>
      {/* Title & Rating */}
      <XDSVStack gap={2}>
        <p
          style={{
            fontSize: 'var(--font-size-4xl, 2.25rem)',
            lineHeight: 1.1,
            fontWeight: 700,
            margin: 0,
          }}>
          {PRODUCT.name}
        </p>
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
      {/* Color Selector */}
      <XDSVStack gap={2}>
        <XDSText type="label">Color</XDSText>
        <div style={{width: 'fit-content'}}>
          <XDSSegmentedControl value={color} onChange={setColor} label="Color">
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
      {/* Shade Finish Selector */}
      <XDSVStack gap={2}>
        <XDSText type="label">Shade Finish</XDSText>
        <div style={{width: 'fit-content'}}>
          <XDSSegmentedControl
            value={finish}
            onChange={setFinish}
            label="Shade Finish">
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
          icon={<MinusIcon style={{width: 16, height: 16}} />}
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
          icon={<PlusIcon style={{width: 16, height: 16}} />}
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
            icon={<HeartIcon style={{width: 16, height: 16}} />}
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
          <div
            style={{
              display: 'flex',
              gap: 40,
              alignItems: 'flex-start',
            }}>
            <div style={{flex: '1 1 55%', minWidth: 0}}>
              <ImageGallery
                selected={selectedThumb}
                onSelect={setSelectedThumb}
              />
            </div>
            <div
              style={{
                flex: '1 1 45%',
                minWidth: 0,
                position: 'sticky',
                top: 64,
              }}>
              <ProductInfo />
            </div>
          </div>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
