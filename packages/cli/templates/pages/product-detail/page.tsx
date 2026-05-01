'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack, XDSStackItem} from '@xds/core/Layout';
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
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import * as stylex from '@stylexjs/stylex';

const pageStyles = stylex.create({
  pageWrapper: {
    maxWidth: 1200,
    width: '100%',
    padding: '32px 24px',
  },
  stickyInfo: {
    position: 'sticky',
    top: 64,
    alignSelf: 'start',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-container, 12px)',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-element, 8px)',
    cursor: 'pointer',
  },
  thumbSelected: {
    outline: '2px solid var(--color-accent, #0866ff)',
    outlineOffset: 2,
  },
});

import {
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {StarIcon as StarIconSolid} from '@heroicons/react/24/solid';

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({rating, count}: {rating: number; count: number}) {
  const filled = Math.round(rating);
  const empty = 5 - filled;

  return (
    <XDSHStack gap={1} vAlign="center">
      {Array.from({length: filled}, (_, i) => (
        <XDSIcon key={`full-${i}`} icon={StarIconSolid} size="sm" />
      ))}
      {Array.from({length: empty}, (_, i) => (
        <XDSIcon key={`empty-${i}`} icon={StarIcon} size="sm" />
      ))}
      <XDSText type="body" color="secondary">
        {rating} ({count})
      </XDSText>
    </XDSHStack>
  );
}

// ─── Image URLs ─────────────────────────────────────────────────────────────
// Light product photography from the xds_oss asset set (ceramics collection)
// Source: meta assets.file list -s xds_oss -g light-product-{1..5}
// IMAGES[0] = fallback hero; IMAGES[1..6] = thumbnails (first is selected by default)
const IMAGES = [
  // light-product-1 (fallback hero)
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671222955_2145727732941085_520241325832272863_n.png?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=_Ch_acjT1BcQ7kNvwFADCvm&_nc_oc=AdqqylHdxZ9J4WaGETpiBq1DXGTxM7xNmhKft8oBFP39swimIWZ7AZdZ1AKvHLbY4fQmrgJ5x2ERsTFv98HzMFN8&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=EcLE5fhnvnLjNTYpUQKeXw&_nc_ss=7a30f&oh=00_Af3jxqjOZaUZaSNIGpa3Aet1Uddvdujkk7oegd-_A0bOZA&oe=69EC5232',
  // light-product-1 (thumbnail 1)
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671222955_2145727732941085_520241325832272863_n.png?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=_Ch_acjT1BcQ7kNvwFADCvm&_nc_oc=AdqqylHdxZ9J4WaGETpiBq1DXGTxM7xNmhKft8oBFP39swimIWZ7AZdZ1AKvHLbY4fQmrgJ5x2ERsTFv98HzMFN8&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=EcLE5fhnvnLjNTYpUQKeXw&_nc_ss=7a30f&oh=00_Af3jxqjOZaUZaSNIGpa3Aet1Uddvdujkk7oegd-_A0bOZA&oe=69EC5232',
  // light-product-2
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673826432_1199625442080268_2235614826141527510_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=_wjLv5Lhh_8Q7kNvwGWRhyt&_nc_oc=AdpFiVWrB2w5PwJdvE3h9DoYN3IzJZB9W1TTvnhK4i5q0t83dp8bbLsfNTHtktLDqMrgdp6mMWKLZ7oJO_YNqje2&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=QNknQFLa-qbjgo-aYr3B3w&_nc_ss=7a30f&oh=00_Af2pOYyfoeSW61DtYM8HQox8tAFI5lUk5aX-TiLvgr1cjQ&oe=69EC3F31',
  // light-product-3
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/672681263_1894137684571541_8624778644609428792_n.png?_nc_cat=109&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=w9acCjHivWUQ7kNvwHr7aPX&_nc_oc=Adr2brJxtVS4X0T6nifDX4ilMvUWwNKMXZh6ZuLoyqWqe7tjHD5o7cQuzNQYrIEIb6_QIW5YLaq2CTx55-fGzg0B&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=3toqnQ2Xkolb6jv7QsUzdw&_nc_ss=7a30f&oh=00_Af2x_-4uoy7Vr0QQ1F6Fs9JENKFc2--Hv3wUfmKymSXuxA&oe=69EC5583',
  // light-product-4
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/670399674_3883527348446559_364118105607949641_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=o3njmHZr7gYQ7kNvwGbioqf&_nc_oc=Ado4I-fGsoF4PuhuxLx6SAboigPu9Xsdnosy866WWRM5aulLrmQRc5xh7EQJrx4YDx_pK1qvGCQd_m9WDcEbzZ-D&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=C0OA-Y0wfGERdXCxRnfkMA&_nc_ss=7a30f&oh=00_Af2mjuba1-uIEO0x8d6kQtGHcS0rxRK0FsSFULQ43xApew&oe=69EC4A6D',
  // light-product-5
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671457944_4516505268571219_6833232903201599778_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=70oaCchmPvkQ7kNvwEhnyV5&_nc_oc=AdpnM83UaG_26EX-nNlHboZr9lIWze8y13UKAwTsJsDkR4zFGSk__UK8FN_f_W06xnx2eHRbElX9xyop69nEylZA&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=iolShmKEPYHkXdhBqc0ynQ&_nc_ss=7a30f&oh=00_Af22qlucAlsFv61LJs7RFu-eXP8RgSILrqeE-uLtJsthBQ&oe=69EC4495',
  // light-product-2 (duplicate for gallery)
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673826432_1199625442080268_2235614826141527510_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=_wjLv5Lhh_8Q7kNvwGWRhyt&_nc_oc=AdpFiVWrB2w5PwJdvE3h9DoYN3IzJZB9W1TTvnhK4i5q0t83dp8bbLsfNTHtktLDqMrgdp6mMWKLZ7oJO_YNqje2&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=QNknQFLa-qbjgo-aYr3B3w&_nc_ss=7a30f&oh=00_Af2pOYyfoeSW61DtYM8HQox8tAFI5lUk5aX-TiLvgr1cjQ&oe=69EC3F31',
];

// ─── Product Data ───────────────────────────────────────────────────────────
const PRODUCT = {
  name: 'Solstice Mug & Plate Set',
  price: 89.0,
  originalPrice: 119.0,
  description:
    'A hand-thrown mug and plate set that brings quiet warmth to every meal. The mug sits easy in the hand with a generous 12 oz capacity, while the 8-inch plate works for everything from toast to tapas. Each piece is kiln-fired at 2,300\u00B0F for a finish that resists chips and stains. Subtle variations in the reactive glaze mean no two sets are exactly alike. Dishwasher and microwave safe.',
  composition:
    'High-fire stoneware clay, wheel-thrown and trimmed by hand. Reactive glaze applied by dipping \u2014 color pools and breaks naturally over the clay body. Lead-free and food-safe. Unglazed foot ring reveals the raw clay underneath. Each piece is bisque-fired, glazed, then fired again to cone 10 in a gas reduction kiln.',
  deliveryReturns:
    'Free shipping on all ceramics orders over $75. Each piece is individually wrapped in recycled kraft paper and cushioned for transit. Returns accepted within 30 days \u2014 items must be unused and in original packaging. Replacement pieces available individually.',
  dimensions:
    'Mug height: 9.5 cm / 3.75 in. Mug diameter: 8.5 cm / 3.35 in. Capacity: 350 ml / 12 oz. Plate diameter: 20 cm / 8 in. Plate height: 2 cm / 0.75 in. Weight: 680 g / 1.5 lb (set).',
};

const COLORS = [
  {value: 'snow', label: 'Snow'},
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
            <XDSNavIcon
              icon={
                <XDSIcon icon={ShoppingBagIcon} size="sm" color="inherit" />
              }
            />
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
        <XDSHStack gap={2}>
          <XDSButton
            label="Search"
            variant="ghost"
            icon={<XDSIcon icon={MagnifyingGlassIcon} size="sm" />}
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
            icon={<XDSIcon icon={ShoppingBagIcon} size="sm" />}
            isIconOnly
          />
        </XDSHStack>
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
    <XDSVStack gap={3}>
      <XDSAspectRatio ratio={4 / 5}>
        <img
          {...stylex.props(pageStyles.heroImage)}
          src={heroSrc}
          alt={PRODUCT.name}
        />
      </XDSAspectRatio>
      <XDSGrid columns={3} gap={2}>
        {thumbnails.map((src, i) => (
          <XDSAspectRatio key={i} ratio={1}>
            <img
              {...stylex.props(
                pageStyles.thumbImage,
                selected === i && pageStyles.thumbSelected,
              )}
              src={src}
              alt={`Product image ${i + 1}`}
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
          </XDSAspectRatio>
        ))}
      </XDSGrid>
    </XDSVStack>
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
      <XDSVStack gap={2}>
        <XDSText type="display-2" as="h1">
          {PRODUCT.name}
        </XDSText>
        <StarRating rating={4.3} count={128} />
        <XDSHStack gap={2} vAlign="center">
          <XDSText type="large" weight="bold">
            {fmt(PRODUCT.price)}
          </XDSText>
          <XDSText type="body" color="secondary" hasStrikethrough>
            {fmt(PRODUCT.originalPrice)}
          </XDSText>
          <XDSBadge variant="error" label="Sale" />
        </XDSHStack>
      </XDSVStack>

      <XDSText type="large" weight="normal">
        {PRODUCT.description}
      </XDSText>

      <XDSVStack gap={2}>
        <XDSText type="label">Glaze</XDSText>
        <XDSVStack hAlign="start">
          <XDSSegmentedControl value={color} onChange={setColor} label="Glaze">
            {COLORS.map(c => (
              <XDSSegmentedControlItem
                key={c.value}
                value={c.value}
                label={c.label}
              />
            ))}
          </XDSSegmentedControl>
        </XDSVStack>
      </XDSVStack>

      <XDSVStack gap={2}>
        <XDSText type="label">Finish</XDSText>
        <XDSVStack hAlign="start">
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
        </XDSVStack>
      </XDSVStack>

      <XDSVStack gap={2}>
        <XDSText type="label">Quantity</XDSText>
        <XDSHStack gap={1} vAlign="center">
          <XDSButton
            label="Decrease quantity"
            variant="ghost"
            icon={<XDSIcon icon={MinusIcon} size="sm" />}
            clickAction={decrement}
            isDisabled={(quantity ?? 1) <= 1}
            isIconOnly
          />
          <XDSCenter width={100}>
            <XDSNumberInput
              label="Quantity"
              isLabelHidden
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={10}
              isIntegerOnly
            />
          </XDSCenter>
          <XDSButton
            label="Increase quantity"
            variant="ghost"
            icon={<XDSIcon icon={PlusIcon} size="sm" />}
            clickAction={increment}
            isDisabled={(quantity ?? 1) >= 10}
            isIconOnly
          />
        </XDSHStack>
      </XDSVStack>

      <XDSVStack gap={2}>
        <XDSButton label="Add to Cart" variant="primary" size="lg" />
        <XDSButton label="Buy it now" size="lg" />
      </XDSVStack>

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
        <XDSVStack gap={0} xstyle={pageStyles.pageWrapper}>
          <XDSGrid minChildWidth={400} gap={5}>
            <ImageGallery
              selected={selectedThumb}
              onSelect={setSelectedThumb}
            />
            <XDSVStack gap={0} xstyle={pageStyles.stickyInfo}>
              <ProductInfo />
            </XDSVStack>
          </XDSGrid>
        </XDSVStack>
      </XDSCenter>
    </XDSAppShell>
  );
}
