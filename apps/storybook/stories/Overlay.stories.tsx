import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSOverlay, XDSOverlayScrim, overlayScope} from '@xds/core/Overlay';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSGrid} from '@xds/core/Grid';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-6'],
  },
  storyWrapper: {
    display: 'flex',
    gap: spacingVars['--spacing-6'],
    flexWrap: 'wrap',
    alignItems: 'start',
  },
  image: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    display: 'block',
  },
  label: {
    margin: 0,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: 12,
    color: colorVars['--color-text-secondary'],
    marginBottom: spacingVars['--spacing-2'],
  },
  dropZone: {
    minHeight: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colorVars['--color-border'],
    borderRadius: 8,
    padding: spacingVars['--spacing-4'],
  },
  dropZoneText: {
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-secondary'],
  },
  durationBadge: {
    paddingBlock: 2,
    paddingInline: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    fontSize: 12,
    fontWeight: 600,
  },
  imageSection: {
    position: 'relative',
  },
  metadata: {
    padding: 16,
  },
});

const SAMPLE_IMAGE = 'https://picsum.photos/seed/xds-overlay/800/450';
const SAMPLE_IMAGE_2 = 'https://picsum.photos/seed/xds-overlay-2/800/450';
const SAMPLE_IMAGE_3 = 'https://picsum.photos/seed/xds-overlay-3/800/450';
const SAMPLE_HERO = 'https://picsum.photos/seed/xds-hero/1200/600';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof XDSOverlayScrim> = {
  title: 'Core/Overlay',
  component: XDSOverlayScrim,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    showOn: {
      control: 'select',
      options: ['always', 'hover', 'focus', 'hover-or-focus'],
      description: 'CSS-driven visibility trigger',
    },
    scrim: {
      control: 'select',
      options: ['dark', 'light', false],
      description: 'Scrim background mode',
    },
    position: {
      control: 'select',
      options: ['fill', 'bottom', 'top'],
      description: 'Scrim placement',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Content alignment',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSOverlayScrim>;

// =============================================================================
// Stories
// =============================================================================

/** Basic hover overlay on an image. Hover to see the scrim + button. */
export const HoverOnImage: Story = {
  render: () => (
    <div style={{width: 400}}>
      <XDSOverlay>
        <XDSAspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE}
            alt="Product"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
        <XDSOverlayScrim showOn="hover" align="center">
          <XDSButton label="Quick view" variant="ghost" />
        </XDSOverlayScrim>
      </XDSOverlay>
    </div>
  ),
};

/** Always-visible bottom strip with title and subtitle over a hero image. */
export const BottomStrip: Story = {
  render: () => (
    <div style={{width: 600}}>
      <XDSOverlay>
        <XDSAspectRatio ratio={2}>
          <img src={SAMPLE_HERO} alt="Hero" {...stylex.props(styles.image)} />
        </XDSAspectRatio>
        <XDSOverlayScrim position="bottom" align="start">
          <XDSVStack gap={1}>
            <XDSHeading level={3}>Gallery Collection</XDSHeading>
            <XDSText type="detail">24 items · Updated today</XDSText>
          </XDSVStack>
        </XDSOverlayScrim>
      </XDSOverlay>
    </div>
  ),
};

/** Full overlay on Card — clips to Card's rounded corners. Uses overlayScope via xstyle. */
export const CardOverlay: Story = {
  render: () => (
    <XDSCard width={360} xstyle={overlayScope}>
      <XDSLayout
        content={
          <XDSLayoutContent>
            <XDSVStack gap={2}>
              <XDSHeading level={3}>Project Alpha</XDSHeading>
              <XDSText>
                A comprehensive design system for building internal tools with
                consistent, accessible interfaces.
              </XDSText>
              <XDSText type="detail">
                Updated 2 hours ago · 12 contributors
              </XDSText>
            </XDSVStack>
          </XDSLayoutContent>
        }
      />
      <XDSOverlayScrim showOn="hover" align="center">
        <XDSButton label="View Details" variant="ghost" />
      </XDSOverlayScrim>
    </XDSCard>
  ),
};

/** Hover + focus overlay — also appears when the card receives keyboard focus. Tab to the button to see. */
export const HoverOrFocus: Story = {
  render: () => (
    <div style={{width: 400}}>
      <XDSOverlay>
        <XDSAspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE_2}
            alt="Photo"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
        <XDSOverlayScrim showOn="hover-or-focus" align="center">
          <XDSButton label="Edit" variant="ghost" />
        </XDSOverlayScrim>
      </XDSOverlay>
    </div>
  ),
};

/** Light scrim for loading/upload states. Toggle the button to simulate upload. */
export const LoadingOverlay: Story = {
  render: function LoadingOverlayStory() {
    const [isUploading, setIsUploading] = useState(false);

    return (
      <XDSVStack gap={4} style={{width: 300}}>
        <XDSButton
          label={isUploading ? 'Cancel upload' : 'Simulate upload'}
          onClick={() => setIsUploading(v => !v)}
        />
        <XDSOverlay>
          <XDSAspectRatio ratio={1}>
            <img
              src={SAMPLE_IMAGE_3}
              alt="Upload preview"
              {...stylex.props(styles.image)}
            />
          </XDSAspectRatio>
          <XDSOverlayScrim isOpen={isUploading} scrim="light" align="center">
            <XDSVStack gap={2} hAlign="center">
              <XDSSpinner size="md" />
              <XDSText weight="bold">Uploading...</XDSText>
            </XDSVStack>
          </XDSOverlayScrim>
        </XDSOverlay>
      </XDSVStack>
    );
  },
};

/** Gallery grid — each image has its own hover overlay. */
export const GalleryGrid: Story = {
  render: () => {
    const images = [
      {src: 'https://picsum.photos/seed/g1/400/400', title: 'Mountain Lake'},
      {src: 'https://picsum.photos/seed/g2/400/400', title: 'Forest Path'},
      {src: 'https://picsum.photos/seed/g3/400/400', title: 'Ocean Sunset'},
      {src: 'https://picsum.photos/seed/g4/400/400', title: 'City Skyline'},
      {src: 'https://picsum.photos/seed/g5/400/400', title: 'Desert Dunes'},
      {src: 'https://picsum.photos/seed/g6/400/400', title: 'Snowy Peaks'},
    ];

    return (
      <XDSGrid columns={3} gap={4}>
        {images.map(img => (
          <XDSOverlay key={img.title}>
            <XDSAspectRatio ratio={1}>
              <img
                src={img.src}
                alt={img.title}
                {...stylex.props(styles.image)}
              />
            </XDSAspectRatio>
            <XDSOverlayScrim showOn="hover" position="bottom" align="start">
              <XDSText weight="bold">{img.title}</XDSText>
            </XDSOverlayScrim>
          </XDSOverlay>
        ))}
      </XDSGrid>
    );
  },
};

/** Video thumbnail with two overlays: always-visible duration badge + hover play button. */
export const VideoThumbnail: Story = {
  render: () => (
    <div style={{width: 400}}>
      <XDSOverlay>
        <XDSAspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE}
            alt="Video thumbnail"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
        <XDSOverlayScrim
          showOn="always"
          position="bottom"
          scrim={false}
          align="end">
          <div {...stylex.props(styles.durationBadge)}>
            <XDSText type="detail">12:34</XDSText>
          </div>
        </XDSOverlayScrim>
        <XDSOverlayScrim showOn="hover" align="center">
          <XDSVStack gap={2} hAlign="center">
            <XDSText weight="bold" size="lg">
              ▶
            </XDSText>
            <XDSText weight="bold">Introduction to XDS</XDSText>
          </XDSVStack>
        </XDSOverlayScrim>
      </XDSOverlay>
    </div>
  ),
};

/** Disconnected hover — hovering anywhere on the Card reveals the overlay on the image only. */
export const DisconnectedHover: Story = {
  render: () => (
    <XDSCard width={360} xstyle={overlayScope}>
      <div {...stylex.props(styles.imageSection)}>
        <XDSAspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE_2}
            alt="Article hero"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
        <XDSOverlayScrim showOn="hover" position="bottom" align="start">
          <XDSHeading level={4}>Featured Article</XDSHeading>
        </XDSOverlayScrim>
      </div>
      <XDSVStack gap={1} xstyle={styles.metadata}>
        <XDSText type="detail">Jan 15, 2026 · 5 min read</XDSText>
        <XDSText type="detail">By Jane Author</XDSText>
      </XDSVStack>
    </XDSCard>
  ),
};

/** Drag-and-drop overlay — simulated with a toggle button. */
export const DragAndDrop: Story = {
  render: function DragAndDropStory() {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
      <XDSVStack gap={4} style={{width: 400}}>
        <XDSButton
          label={isDragOver ? 'Simulate drag leave' : 'Simulate drag enter'}
          variant="secondary"
          onClick={() => setIsDragOver(v => !v)}
        />
        <XDSOverlay>
          <div {...stylex.props(styles.dropZone)}>
            <p {...stylex.props(styles.dropZoneText)}>
              Drop files here or click to browse
            </p>
          </div>
          <XDSOverlayScrim isOpen={isDragOver} scrim="dark" align="center">
            <XDSVStack gap={2} hAlign="center">
              <XDSText size="lg">📁</XDSText>
              <XDSText weight="bold">Drop files here</XDSText>
            </XDSVStack>
          </XDSOverlayScrim>
        </XDSOverlay>
      </XDSVStack>
    );
  },
};

/** No scrim — content-only overlay without a background. */
export const NoScrim: Story = {
  render: () => (
    <div style={{width: 300}}>
      <XDSOverlay>
        <XDSAspectRatio ratio={1}>
          <img
            src={SAMPLE_IMAGE_3}
            alt="Selected"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
        <XDSOverlayScrim showOn="hover" scrim={false} align="center">
          <XDSButton label="♡" variant="ghost" />
        </XDSOverlayScrim>
      </XDSOverlay>
    </div>
  ),
};
