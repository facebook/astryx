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

// ─── Image URLs ─────────────────────────────────────────────────────────────
// TODO: Swap placeholder gray rectangles for real product images when merging.

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

// ─── Placeholder image style ────────────────────────────────────────────────
const placeholderStyle: React.CSSProperties = {
  backgroundColor: '#e8e8e8',
  borderRadius: 'var(--radius-element, 8px)',
  border: '1px solid #d4d4d4',
};

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
          />
          <XDSButton
            label="Wishlist"
            variant="ghost"
            icon={<HeartIcon style={{width: 16, height: 16}} />}
          />
          <XDSButton
            label="Account"
            variant="ghost"
            icon={<UserIcon style={{width: 16, height: 16}} />}
          />
          <XDSButton
            label="Cart"
            variant="ghost"
            icon={<BagIcon style={{width: 16, height: 16}} />}
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
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {/* Hero image */}
      <div
        style={{
          ...placeholderStyle,
          width: '100%',
          aspectRatio: '4 / 5',
          borderRadius: 'var(--radius-container, 12px)',
        }}
      />
      {/* Thumbnail grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}>
        {Array.from({length: 6}, (_, i) => (
          <div
            key={i}
            style={{
              ...placeholderStyle,
              aspectRatio: '1 / 1',
              cursor: 'pointer',
              outline:
                selected === i
                  ? '2px solid var(--color-accent, #0866ff)'
                  : 'none',
              outlineOffset: selected === i ? 2 : 0,
            }}
            onClick={() => onSelect(i)}
            role="button"
            tabIndex={0}
            aria-label={`Product image ${i + 1}`}
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

  return (
    <XDSVStack gap={5}>
      {/* Title & Price */}
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
        <XDSHStack gap={2} style={{alignItems: 'baseline'}}>
          <XDSText type="large" weight="bold">
            {fmt(PRODUCT.price)}
          </XDSText>
          <XDSText type="body" color="secondary" hasStrikethrough>
            {fmt(PRODUCT.originalPrice)}
          </XDSText>
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
      <XDSNumberInput
        label="Quantity"
        value={quantity}
        onChange={setQuantity}
        min={1}
        max={10}
        isIntegerOnly
      />

      {/* Add to Cart */}
      <XDSButton
        label="Add to Cart"
        variant="primary"
        size="lg"
        style={{display: 'flex', width: '100%'}}>
        Add to Cart
      </XDSButton>

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
