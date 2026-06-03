// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import stylex from '@stylexjs/stylex';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNumberInput} from '@xds/core/NumberInput';
import type {ThemeImageSet} from './themeImages';
const styles = stylex.create({
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  cardBody: {
    padding: 'var(--spacing-4)',
    // Body fills the remaining vertical space below the image so
    // descriptions of different lengths don't push the "Learn more"
    // button to different vertical positions across cards.
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardStack: {
    // Card content stack fills the card height so cardBody (flex:1)
    // can stretch — without this the stack collapses to its content
    // height and the body doesn't have room to grow.
    height: '100%',
  },
  cardDescription: {
    // Pushes the bottom action row (quantity + Add to cart) to the
    // bottom of the card by absorbing any extra vertical space, so
    // every card's action row aligns horizontally regardless of
    // description length.
    flex: 1,
  },
  // Compact quantity stepper to the left of the Add to cart button.
  // Capped width keeps the stepper from competing with the button
  // for the row's horizontal space.
  quantityInput: {
    width: 40,
    flexShrink: 0,
  },
  // Cart button grows to fill the remaining row width next to the
  // quantity stepper so the action stays the dominant target.
  cartButton: {
    flex: 1,
  },
  heroText: {
    textAlign: 'center' as const,
    maxWidth: 560,
  },
  content: {
    maxWidth: 960,
    marginInline: 'auto',
  },
  // Fluid mode used by the theme playground. Caps the showcase at
  // a sensible max-width so the product grid (3 cards at 240px min +
  // 16px gap) fills the container naturally — wider caps left a
  // gutter of unused space on the trailing edge because XDSGrid's
  // auto-fill column algorithm pads tracks to the start of the row.
  // Stays centered via the base `content` rule's marginInline:auto.
  contentFluid: {
    maxWidth: 880,
  },
  // Center-align the text inside each product card. The parent VStack
  // pinches block-level children to the centre via hAlign="center",
  // but heading/description text still anchors to the start of its
  // own block unless `text-align: center` is applied. We use a
  // stylex rule instead of the XDSHeading/XDSText `justify` prop
  // because the docsite consumes the published @xds/core build,
  // which doesn't expose `justify` yet.
  centerText: {
    textAlign: 'center',
  },
});

// Keys into the active ThemeImageSet, in the same order as PRODUCTS.
// The actual URLs are resolved per-theme via the `images` prop.
const PRODUCT_IMAGE_KEYS: ReadonlyArray<keyof ThemeImageSet> = [
  'watch',
  'headphones',
  'backpack',
];

const PRODUCTS = [
  {
    name: 'Minimalist Watch',
    description: 'Clean design meets everyday durability.',
    badge: 'New',
    badgeVariant: 'blue' as const,
  },
  {
    name: 'Wireless Headphones',
    description: 'Immersive sound, all-day comfort.',
    badge: 'Popular',
    badgeVariant: 'green' as const,
  },
  {
    name: 'Canvas Backpack',
    description: 'Water-resistant canvas with a quiet, modern profile.',
    badge: 'Limited',
    badgeVariant: 'yellow' as const,
  },
];

interface ThemeShowcasePreviewProps {
  images: ThemeImageSet;
  /**
   * When true, the hero + product grid fill the full available width rather
   * than capping at 960px. Used by the theme playground preview pane.
   */
  fluid?: boolean;
}

export function ThemeShowcasePreview({
  images,
  fluid = false,
}: ThemeShowcasePreviewProps) {
  return (
    <div data-theme-preview="true">
      <XDSVStack gap={0}>
        {/* Fake app top nav — sits at the top of the preview so the
          surface reads like a real product chrome (brand · primary
          nav · actions) rather than a bare design canvas. The
          brand wordmark, nav items, and end-content actions stay
          generic so the same nav makes sense across every theme
          (neutral, butter, y2k, stone, etc.). */}
        <XDSTopNav
          label="Theme preview navigation"
          heading={<XDSTopNavHeading heading="Studio" />}
          centerContent={
            <>
              <XDSTopNavItem label="Shop" href="#" isSelected />
              <XDSTopNavItem label="New In" href="#" />
              <XDSTopNavItem label="Stories" href="#" />
              <XDSTopNavItem label="Help" href="#" />
            </>
          }
          endContent={
            <XDSHStack gap={2} vAlign="center">
              <XDSHStack gap={0.5}>
                <XDSButton
                  label="Search"
                  variant="ghost"
                  isIconOnly
                  icon={<MagnifyingGlassIcon width={20} height={20} />}
                  href="#"
                />
                <XDSButton
                  label="Account"
                  variant="ghost"
                  isIconOnly
                  icon={<UserIcon width={20} height={20} />}
                  href="#"
                />
                <XDSButton
                  label="Cart"
                  variant="ghost"
                  isIconOnly
                  icon={<ShoppingBagIcon width={20} height={20} />}
                  href="#"
                />
              </XDSHStack>
              <XDSButton label="Sign in" variant="primary" href="#" />
            </XDSHStack>
          }
        />

        <XDSSection padding={8} variant="transparent">
          <XDSVStack
            gap={10}
            xstyle={
              fluid ? [styles.content, styles.contentFluid] : styles.content
            }>
            <XDSCenter>
              <XDSVStack gap={4} hAlign="center" xstyle={styles.heroText}>
                <XDSText type="display-3">
                  Little joys,
                  <br />
                  everywhere you go
                </XDSText>
                <XDSText type="body" color="secondary">
                  We believe the smallest details are the ones that matter most.
                  Turn an ordinary day into something worth remembering.
                </XDSText>
              </XDSVStack>
            </XDSCenter>

            <XDSGrid columns={{minWidth: 240}} gap={4}>
              {PRODUCTS.map((p, i) => (
                <XDSCard key={p.name} padding={0} height="100%">
                  <XDSVStack gap={0} xstyle={styles.cardStack}>
                    <XDSAspectRatio ratio={1}>
                      <img
                        src={images[PRODUCT_IMAGE_KEYS[i]]}
                        alt={p.name}
                        {...stylex.props(styles.productImage)}
                      />
                    </XDSAspectRatio>
                    <div {...stylex.props(styles.cardBody)}>
                      <XDSVStack
                        gap={2}
                        hAlign="center"
                        xstyle={styles.cardStack}>
                        <XDSHStack>
                          <XDSBadge label={p.badge} variant={p.badgeVariant} />
                        </XDSHStack>
                        <XDSHeading level={2} xstyle={styles.centerText}>
                          {p.name}
                        </XDSHeading>
                        <XDSText
                          type="supporting"
                          color="secondary"
                          xstyle={[styles.cardDescription, styles.centerText]}>
                          {p.description}
                        </XDSText>
                        <XDSHStack gap={2} vAlign="center" hAlign="center">
                          <XDSNumberInput
                            label="Quantity"
                            isLabelHidden
                            value={1}
                            onChange={() => {}}
                            min={1}
                            max={99}
                            size="sm"
                            xstyle={styles.quantityInput}
                          />
                          <XDSButton
                            label="Add to cart"
                            variant="secondary"
                            href="#"
                            xstyle={styles.cartButton}
                          />
                        </XDSHStack>
                      </XDSVStack>
                    </div>
                  </XDSVStack>
                </XDSCard>
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSSection>
      </XDSVStack>
    </div>
  );
}
