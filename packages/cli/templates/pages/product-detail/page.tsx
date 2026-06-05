// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
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

import {MinusIcon, PlusIcon, StarIcon} from '@heroicons/react/24/outline';
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
  'https://lookaside.facebook.com/assets/xds_oss/light-home-horizontal-1.png',
  // light-product-1 (thumbnail 1)
  'https://lookaside.facebook.com/assets/xds_oss/light-home-horizontal-1.png',
  // light-product-2
  'https://lookaside.facebook.com/assets/xds_oss/light-product-2.png',
  // light-product-3
  'https://lookaside.facebook.com/assets/xds_oss/light-product-3.png',
  // light-product-4
  'https://lookaside.facebook.com/assets/xds_oss/light-product-4.png',
  // light-product-5
  'https://lookaside.facebook.com/assets/xds_oss/light-product-5.png',
  // light-product-1 (gallery variety)
  'https://lookaside.facebook.com/assets/xds_oss/light-product-1.png',
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
    <XDSLayout
      height="auto"
      content={
        <XDSLayoutContent padding={0}>
          <XDSCenter axis="horizontal">
            <XDSVStack gap={0} xstyle={pageStyles.pageWrapper}>
              <XDSGrid columns={{minWidth: 400}} gap={5}>
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
        </XDSLayoutContent>
      }
    />
  );
}
