import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';
import {XDSMediaTheme} from '@xds/core/theme';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const meta: Meta = {
  title: 'Core/Grid/Masonry Gallery',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = stylex.create({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'clip',
    borderRadius: radiusVars['--radius-element'],
  },
  img: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: spacingVars['--spacing-5'],
    opacity: {
      default: 0,
      ':hover': 1,
    },
    transition: 'opacity 0.2s ease',
  },
  overlayAlwaysOn: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: spacingVars['--spacing-5'],
  },
  tag: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    left: spacingVars['--spacing-3'],
    backgroundColor: colorVars['--color-accent-muted'],
    color: colorVars['--color-on-accent'],
    padding: `${spacingVars['--spacing-0-5']} ${spacingVars['--spacing-2']}`,
    borderRadius: radiusVars['--radius-element'],
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

interface GalleryImage {
  src: string;
  title: string;
  category: string;
}

const IMAGES: GalleryImage[] = [
  {
    src: 'https://picsum.photos/seed/xds-travel/600/800',
    title: 'Going places',
    category: 'Travel',
  },
  {
    src: 'https://picsum.photos/seed/xds-home/600/400',
    title: 'Making memories',
    category: 'Home',
  },
  {
    src: 'https://picsum.photos/seed/xds-lifestyle/600/600',
    title: 'Seeing things',
    category: 'Lifestyle',
  },
  {
    src: 'https://picsum.photos/seed/xds-ideas/600/900',
    title: 'Sharing ideas',
    category: 'Lifestyle',
  },
  {
    src: 'https://picsum.photos/seed/xds-nature/600/700',
    title: 'Being free',
    category: 'Nature',
  },
];

// ─── Gallery Card ───────────────────────────────────────────────────────────

function GalleryCard({
  image,
  showOverlay = false,
}: {
  image: GalleryImage;
  showOverlay?: boolean;
}) {
  return (
    <div {...stylex.props(styles.card)}>
      <img src={image.src} alt={image.title} {...stylex.props(styles.img)} />
      <span {...stylex.props(styles.tag)}>{image.category}</span>
      <div
        {...stylex.props(
          showOverlay ? styles.overlayAlwaysOn : styles.overlay,
        )}>
        <XDSMediaTheme mode="dark">
          <XDSVStack gap={1}>
            <XDSText type="label">{image.title}</XDSText>
          </XDSVStack>
        </XDSMediaTheme>
      </div>
    </div>
  );
}

// ─── Stories ────────────────────────────────────────────────────────────────

/**
 * A Pinterest-style masonry gallery using XDSGrid with row spans.
 *
 * The key technique: define explicit row tracks with `gridTemplateRows`,
 * then use `XDSGridSpan` with different `rows` values to create items of
 * varying heights. This produces the characteristic staggered masonry layout
 * without any JavaScript height calculation.
 */
export const MasonryGallery: Story = {
  render: () => (
    <XDSSection variant="muted" padding={6}>
      <XDSVStack gap={5}>
        <XDSVStack gap={2}>
          <XDSHeading level={2}>Mixed Gallery</XDSHeading>
          <XDSText type="body">
            A masonry-style gallery using CSS Grid row spans. Each item spans a
            different number of rows to create a staggered, Pinterest-like
            layout.
          </XDSText>
        </XDSVStack>

        <XDSGrid columns={3} rowHeight={80} gap={3}>
          {/* Column 1: 4 + 2 = 6 rows */}
          <XDSGridSpan rows={4}>
            <GalleryCard image={IMAGES[0]} />
          </XDSGridSpan>
          <XDSGridSpan rows={2}>
            <GalleryCard image={IMAGES[1]} />
          </XDSGridSpan>

          {/* Column 2: 2 + 4 = 6 rows */}
          <XDSGridSpan rows={2}>
            <GalleryCard image={IMAGES[2]} />
          </XDSGridSpan>
          <XDSGridSpan rows={4}>
            <GalleryCard image={IMAGES[3]} />
          </XDSGridSpan>

          {/* Column 3: 3 + 3 = 6 rows */}
          <XDSGridSpan rows={3}>
            <GalleryCard image={IMAGES[4]} />
          </XDSGridSpan>
          <XDSGridSpan rows={3}>
            <GalleryCard image={IMAGES[0]} />
          </XDSGridSpan>
        </XDSGrid>
      </XDSVStack>
    </XDSSection>
  ),
};

/**
 * A denser masonry layout with a 4-column grid and smaller row tracks.
 * Uses `rowHeight={60}` for unlimited content.
 */
export const DenseMasonry: Story = {
  render: () => {
    return (
      <XDSSection variant="muted" padding={6}>
        <XDSVStack gap={5}>
          <XDSVStack gap={2}>
            <XDSHeading level={2}>Dense Masonry</XDSHeading>
            <XDSText type="body">
              A 4-column layout with <code>rowHeight={60}</code>. Each item gets
              a different row span for natural visual rhythm.
            </XDSText>
          </XDSVStack>

          <XDSGrid columns={4} rowHeight={60} gap={3}>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[2]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={5}>
              <GalleryCard image={IMAGES[3]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={2}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[2]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[3]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={5}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={4}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
          </XDSGrid>
        </XDSVStack>
      </XDSSection>
    );
  },
};

/**
 * A featured masonry layout combining column and row spans.
 * The hero image spans 2 columns and 4 rows, with smaller items
 * arranged around it.
 */
export const FeaturedMasonry: Story = {
  render: () => {
    return (
      <XDSSection variant="muted" padding={6}>
        <XDSVStack gap={5}>
          <XDSVStack gap={2}>
            <XDSHeading level={2}>Featured Masonry</XDSHeading>
            <XDSText type="body">
              Combines column spans and row spans for a featured hero layout.
              The primary image spans 2 columns × 5 rows.
            </XDSText>
          </XDSVStack>

          <XDSGrid columns={3} rowHeight={70} gap={3}>
            {/* Hero — 2 cols × 5 rows */}
            <XDSGridSpan columns={2} rows={5}>
              <GalleryCard image={IMAGES[2]} showOverlay />
            </XDSGridSpan>

            {/* Sidebar items */}
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[0]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={2}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>

            {/* Bottom row */}
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[3]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[4]} showOverlay />
            </XDSGridSpan>
            <XDSGridSpan rows={3}>
              <GalleryCard image={IMAGES[1]} showOverlay />
            </XDSGridSpan>
          </XDSGrid>
        </XDSVStack>
      </XDSSection>
    );
  },
};
