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
const IMAGES = [
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671222955_2145727732941085_520241325832272863_n.png?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=nPid9vxWiAAQ7kNvwEn9zAk&_nc_oc=Adpvs8c0_OPaD3OBM2-RuvQhsq_ZIQCuI4MIYJDHog2g0wbDnnKsQY18ujPRPRsUsCQaE3gnHXhybHYdgHyTPGcy&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=ydKBqwA5klQRsF7pHyaL9Q&_nc_ss=7a30f&oh=00_Af1MWCNR4BSpKvDiJrg4I7hrhPhvwUkpwRMPpGkexhKxpg&oe=69E5F2F2',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671222955_2145727732941085_520241325832272863_n.png?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=nPid9vxWiAAQ7kNvwEn9zAk&_nc_oc=Adpvs8c0_OPaD3OBM2-RuvQhsq_ZIQCuI4MIYJDHog2g0wbDnnKsQY18ujPRPRsUsCQaE3gnHXhybHYdgHyTPGcy&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=ydKBqwA5klQRsF7pHyaL9Q&_nc_ss=7a30f&oh=00_Af1MWCNR4BSpKvDiJrg4I7hrhPhvwUkpwRMPpGkexhKxpg&oe=69E5F2F2',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673826432_1199625442080268_2235614826141527510_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=7sfupHwtMWoQ7kNvwHq-oll&_nc_oc=AdorjEzWeonV_cTC82CQcP_97bhPEFri4gRyJuRCTm5tm4RrSHqZHinwq3cpLIVwwDqJGdLCeaezQOL1pCTdEurA&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=dhQMbNPZ6a4O8tvuG-zaQQ&_nc_ss=7a30f&oh=00_Af0jFaeYAmFWPUXPDLAx1wHlwVkoTPaVfUQircvONREAew&oe=69E5DFF1',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/672681263_1894137684571541_8624778644609428792_n.png?_nc_cat=109&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=O9FpOzmcuhIQ7kNvwHJc_5e&_nc_oc=AdohCQROsW1HA9oyV_P08xW-PZ7aRBaxKQDouJQeLqWBRg4s_diiKocTCXKFW6MrH29i-qmdKX4F1XacD-ZBr1aI&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=4Ho2VwbJyUMPRPg1_pYYXQ&_nc_ss=7a30f&oh=00_Af3rTWfTt78ZVlhHCjbjcvEMAmyt_Y5UApS2ezLwTSVDdw&oe=69E5F643',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/670399674_3883527348446559_364118105607949641_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=qjhrCslvBhEQ7kNvwGIRrYU&_nc_oc=AdqjfEPZizLmq2xSVhncfdeilisr9iS4xyW6xvESla6s72ctRLyjAdz_aUhs0_7GlT2wLRjFqotzo6mCRpj_zoev&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=p5rjWn-ZxsbEF4l-xiDkoA&_nc_ss=7a30f&oh=00_Af0dfW78AWBoDni-ydDYmjYYnu6TcBty9hI97oewb6OFfw&oe=69E5EB2D',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671457944_4516505268571219_6833232903201599778_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=2LiO931mC78Q7kNvwEClCGO&_nc_oc=AdoxCLopOX1C45nJksLqWaffKTeqizJ7joW-P2gbmknrVE5KqvaVXRzof8YTOZNW0OMuPUSnUEX0aQ32RhRv6xeF&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=AXiNN0rtQ-RZnfzDQS5AjA&_nc_ss=7a30f&oh=00_Af3DYuG7fKdv_a6uNNcfTO5iIV16d_65o0-9FZnZp4jQfg&oe=69E5E555',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673826432_1199625442080268_2235614826141527510_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=7sfupHwtMWoQ7kNvwHq-oll&_nc_oc=AdorjEzWeonV_cTC82CQcP_97bhPEFri4gRyJuRCTm5tm4RrSHqZHinwq3cpLIVwwDqJGdLCeaezQOL1pCTdEurA&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=dhQMbNPZ6a4O8tvuG-zaQQ&_nc_ss=7a30f&oh=00_Af0jFaeYAmFWPUXPDLAx1wHlwVkoTPaVfUQircvONREAew&oe=69E5DFF1',
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
