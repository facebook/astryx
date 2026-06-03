// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSPagination} from '@xds/core/Pagination';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSBanner} from '@xds/core/Banner';
import {XDSItem} from '@xds/core/Item';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';

const noop = () => {};

const styles = stylex.create({
  headingBlock: {
    width: '100%',
    maxWidth: 680,
    textAlign: 'center',
  },
  fillWidth: {
    width: '100%',
  },
  outerCard: {
    width: '100%',
    maxWidth: 1200,
  },
  subTile: {
    width: '100%',
  },
  captionDivider: {
    height: '1.125em',
  },
  swatchRow: {
    flexWrap: 'wrap',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    flexShrink: 0,
  },
  paletteCol: {
    alignItems: 'center',
    minWidth: 48,
  },
  hexLabel: {
    fontSize: 10,
    letterSpacing: '0.02em',
  },
  swatchPairWrap: {
    aspectRatio: '1 / 1',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swatchPairInner: {
    width: '62%',
    height: '62%',
    borderRadius: 'var(--radius-element)',
  },
  bigAaWrap: {
    aspectRatio: '1 / 1',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 64,
    lineHeight: 1,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // Both Aa tiles read their font from the active theme's typography
  // tokens so the sample stays accurate as themes are swapped instead
  // of hardcoding a specific font name.
  bigAaHeading: {
    fontFamily: 'var(--font-family-heading)',
  },
  bigAaBody: {
    fontFamily: 'var(--font-family-body)',
  },
  radiusBlock: {
    width: 44,
    height: 44,
    backgroundColor: 'var(--color-text-primary)',
  },
  photoCell: {
    aspectRatio: '4 / 5',
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  stoneWord: {
    fontFamily:
      'Fraunces, "PT Serif", Georgia, "Times New Roman", Times, serif',
    fontWeight: 600,
    letterSpacing: '0.02em',
    fontSize: 40,
    lineHeight: 1,
    color: 'var(--color-text-primary)',
  },
});

// =============================================================================
// Heading
// =============================================================================

function ShowcaseHeading() {
  return (
    <XDSVStack gap={4} align="center" xstyle={styles.headingBlock}>
      <XDSHeading
        level={2}
        type="display-2"
        color="primary"
        xstyle={styles.fillWidth}>
        Custom styles as unique as your app
      </XDSHeading>
      <XDSVStack gap={4} align="center" xstyle={styles.fillWidth}>
        <XDSText
          display="block"
          type="body"
          color="secondary"
          style={{maxWidth: 560}}>
          Astryx makes it effortless to apply your brand — no rewrites needed.
          Customize your theme at the token level: color, typography, radius,
          and motion.
        </XDSText>
        <XDSHStack gap={4} align="center">
          <XDSLink type="body" href="/themes" color="primary" hasUnderline>
            Explore all themes
          </XDSLink>
          <XDSDivider orientation="vertical" xstyle={styles.captionDivider} />
          <XDSLink type="body" href="/docs/theme" color="primary" hasUnderline>
            Create a custom theme
          </XDSLink>
        </XDSHStack>
      </XDSVStack>
    </XDSVStack>
  );
}

// =============================================================================
// Column 1
// =============================================================================

const PALETTE_GRAYS = [
  '#28282A',
  '#84848B',
  '#D8D8DB',
  '#F5F5F3',
  '#FFFFFF',
] as const;

const PALETTE_ACCENTS = [
  {hex: '#009936', label: '#009936'},
  {hex: '#FFB600', label: '#FFB600'},
  {hex: '#FD0000', label: '#FD0000'},
] as const;

function StoneSampleTile() {
  return (
    <XDSCard variant="muted" padding={5}>
      <XDSVStack gap={4}>
        <XDSVStack gap={1}>
          <div {...stylex.props(styles.stoneWord)}>STONE</div>
          <XDSLink
            type="supporting"
            color="secondary"
            href="/themes"
            hasUnderline>
            Try Theme
          </XDSLink>
        </XDSVStack>

        <XDSHStack gap={2} wrap="wrap">
          <XDSButton variant="primary" size="sm" label="Primary" />
          <XDSButton variant="secondary" size="sm" label="Secondary" />
          <XDSButton
            variant="ghost"
            size="sm"
            label="Ghost"
            icon={<XDSIcon icon="wrench" size="sm" />}
          />
        </XDSHStack>

        <XDSProgressBar
          value={75}
          label="Progress"
          hasValueLabel
          variant="accent"
        />

        <XDSTextInput
          label="Example"
          description="Description text"
          placeholder="Type something..."
          value=""
          onChange={noop}
        />

        <XDSHStack gap={1} wrap="wrap" xstyle={styles.swatchRow}>
          <XDSBadge variant="info" label="Badge" />
          <XDSBadge variant="success" label="Badge" />
          <XDSBadge variant="warning" label="Badge" />
          <XDSBadge variant="error" label="Badge" />
          <XDSBadge variant="purple" label="Badge" />
        </XDSHStack>

        <XDSPagination
          page={3}
          onChange={noop}
          totalPages={10}
          size="sm"
          siblingCount={0}
        />
      </XDSVStack>
    </XDSCard>
  );
}

function PaletteTile() {
  return (
    <XDSCard variant="muted" padding={5}>
      <XDSVStack gap={4}>
        <XDSHStack gap={3} justify="between" wrap="wrap">
          {PALETTE_GRAYS.map(hex => (
            <XDSVStack
              key={hex}
              gap={1}
              xstyle={styles.paletteCol}
              align="center">
              <div
                {...stylex.props(styles.swatch)}
                style={{backgroundColor: hex}}
              />
              <XDSText
                type="supporting"
                color="secondary"
                xstyle={styles.hexLabel}>
                {hex}
              </XDSText>
            </XDSVStack>
          ))}
        </XDSHStack>
        <XDSHStack gap={3} justify="start" wrap="wrap">
          {PALETTE_ACCENTS.map(({hex, label}) => (
            <XDSVStack
              key={hex}
              gap={1}
              xstyle={styles.paletteCol}
              align="center">
              <div
                {...stylex.props(styles.swatch)}
                style={{backgroundColor: hex}}
              />
              <XDSText
                type="supporting"
                color="secondary"
                xstyle={styles.hexLabel}>
                {label}
              </XDSText>
            </XDSVStack>
          ))}
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Column 2
// =============================================================================

function SettingsTogglesTile() {
  return (
    <XDSCard variant="muted" padding={5}>
      <XDSVStack gap={3}>
        <XDSSwitch
          label="Light mode"
          value={true}
          onChange={noop}
          labelSpacing="spread"
        />
        <XDSSwitch
          label="Animations"
          value={true}
          onChange={noop}
          labelSpacing="spread"
        />
        <XDSSwitch
          label="Compact"
          value={false}
          onChange={noop}
          labelSpacing="spread"
        />
      </XDSVStack>
    </XDSCard>
  );
}

function CardActionsTile() {
  return (
    <XDSCard variant="muted" padding={5}>
      <XDSCard variant="default" padding={4}>
        <XDSVStack gap={3}>
          <XDSHeading level={4}>Card Title</XDSHeading>
          <XDSText type="body" color="secondary">
            A flexible surface for grouping related content and actions.
          </XDSText>
          <XDSHStack gap={2}>
            <XDSButton variant="primary" size="sm" label="Primary" />
            <XDSButton variant="secondary" size="sm" label="Secondary" />
          </XDSHStack>
        </XDSVStack>
      </XDSCard>
    </XDSCard>
  );
}

function SearchFilterBannersTile() {
  return (
    <XDSCard variant="muted" padding={5}>
      <XDSVStack gap={3}>
        <XDSTextInput
          label="Search"
          isLabelHidden
          placeholder="Search..."
          value=""
          onChange={noop}
          startIcon={<XDSIcon icon="search" size="sm" />}
          hasClear
        />

        <XDSVStack gap={1}>
          <XDSItem
            media={<XDSStatusDot variant="accent" label="Status" />}
            label="Status"
            description="Filter by status"
          />
          <XDSItem
            media={<XDSStatusDot variant="neutral" label="Type" />}
            label="Type"
            description="Filter by type"
          />
        </XDSVStack>

        <XDSVStack gap={2}>
          <XDSBanner status="success" title="Banner Title" />
          <XDSBanner status="warning" title="Banner Title" />
          <XDSBanner status="error" title="Banner Title" />
        </XDSVStack>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Column 3
// =============================================================================

const SWATCH_PAIRS: ReadonlyArray<{bg: string; fg: string}> = [
  {bg: '#D9E8E2', fg: '#2F5D52'}, // teal-on-mint
  {bg: '#F4D9C4', fg: '#5A3A28'}, // brown-on-peach
  {bg: '#EFEAD4', fg: '#5C5A30'}, // olive-on-cream
  {bg: '#F4C77A', fg: '#7A4B12'}, // mustard-on-orange
];

function PaletteGridTile() {
  return (
    <XDSCard variant="muted" padding={4}>
      <XDSGrid columns={2} gap={3}>
        {SWATCH_PAIRS.map(({bg, fg}, i) => (
          <div
            key={i}
            {...stylex.props(styles.swatchPairWrap)}
            style={{backgroundColor: bg}}>
            <div
              {...stylex.props(styles.swatchPairInner)}
              style={{backgroundColor: fg}}
            />
          </div>
        ))}
      </XDSGrid>
    </XDSCard>
  );
}

// Sample swatches for the radius row — each one references an XDS radius
// token so the rendered shapes track the active theme (Astryx overrides
// the default scale by +4, so what's labelled `--radius-element` here
// resolves to 12px under Astryx vs 8px under the default theme).
const RADIUS_SAMPLES: ReadonlyArray<{label: string; radiusVar: string}> = [
  {label: '--radius-inner', radiusVar: 'var(--radius-inner)'},
  {label: '--radius-element', radiusVar: 'var(--radius-element)'},
  {label: '--radius-container', radiusVar: 'var(--radius-container)'},
  {label: '--radius-page', radiusVar: 'var(--radius-page)'},
  {label: '--radius-full', radiusVar: 'var(--radius-full)'},
];

function TypographyRadiusTile() {
  return (
    <XDSCard variant="muted" padding={5}>
      <XDSVStack gap={4}>
        <XDSGrid columns={2} gap={3}>
          <XDSVStack gap={2} align="center">
            <div {...stylex.props(styles.bigAaWrap, styles.bigAaHeading)}>
              Aa
            </div>
            <XDSText type="supporting" color="secondary">
              --font-family-heading
            </XDSText>
          </XDSVStack>
          <XDSVStack gap={2} align="center">
            <div {...stylex.props(styles.bigAaWrap, styles.bigAaBody)}>Aa</div>
            <XDSText type="supporting" color="secondary">
              --font-family-body
            </XDSText>
          </XDSVStack>
        </XDSGrid>

        <XDSHStack gap={2} justify="between" align="center">
          {RADIUS_SAMPLES.map(({label, radiusVar}) => (
            <XDSVStack key={label} gap={1} align="center">
              <div
                {...stylex.props(styles.radiusBlock)}
                style={{borderRadius: radiusVar}}
              />
              <XDSText type="supporting" color="secondary">
                {label}
              </XDSText>
            </XDSVStack>
          ))}
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}

function LifestylePhotoTile() {
  return (
    <XDSCard variant="muted" padding={4}>
      <XDSGrid columns={2} gap={3}>
        <div {...stylex.props(styles.photoCell)}>
          {/* Plain <img> to avoid next/image remote host configuration changes. */}
          <img
            src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=70"
            alt="A cream-toned minimal living room"
            {...stylex.props(styles.photoImg)}
            loading="lazy"
          />
        </div>
        <div {...stylex.props(styles.photoCell)}>
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=70"
            alt="A potted plant still life"
            {...stylex.props(styles.photoImg)}
            loading="lazy"
          />
        </div>
      </XDSGrid>
    </XDSCard>
  );
}

// =============================================================================
// Pagination dots
// =============================================================================

function ShowcaseDots() {
  return (
    <XDSPagination
      page={2}
      onChange={noop}
      totalPages={4}
      variant="dots"
      size="sm"
    />
  );
}

// =============================================================================
// Showcase root
// =============================================================================

export function ThemingShowcase() {
  return (
    <XDSVStack
      as="section"
      gap={10}
      align="center"
      data-theming-showcase="true">
      <ShowcaseHeading />

      <XDSTheme theme={neutralTheme} mode="light">
        <XDSVStack gap={5} align="center" xstyle={styles.outerCard}>
          <div {...stylex.props(styles.outerCard)}>
            <XDSGrid columns={{minWidth: 320, repeat: 'fit'}} gap={3}>
              {/* Column 1 */}
              <XDSVStack gap={3} xstyle={styles.subTile}>
                <StoneSampleTile />
                <PaletteTile />
              </XDSVStack>

              {/* Column 2 */}
              <XDSVStack gap={3} xstyle={styles.subTile}>
                <SettingsTogglesTile />
                <CardActionsTile />
                <SearchFilterBannersTile />
              </XDSVStack>

              {/* Column 3 */}
              <XDSVStack gap={3} xstyle={styles.subTile}>
                <PaletteGridTile />
                <TypographyRadiusTile />
                <LifestylePhotoTile />
              </XDSVStack>
            </XDSGrid>
          </div>

          <ShowcaseDots />
        </XDSVStack>
      </XDSTheme>
    </XDSVStack>
  );
}
