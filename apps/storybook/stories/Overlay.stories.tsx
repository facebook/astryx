import type {Meta, StoryObj} from '@storybook/react';
import React, {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSOverlay, useXDSOverlay} from '@xds/core/Overlay';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSGrid} from '@xds/core/Grid';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-6'],
  },
  image: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    display: 'block',
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
    backgroundColor: colorVars['--color-overlay'],
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

const meta: Meta<typeof XDSOverlay> = {
  title: 'Core/Overlay',
  component: XDSOverlay,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof XDSOverlay>;

/** Basic hover overlay on an image. */
export const HoverOnImage: Story = {
  render: () => (
    <div style={{width: 400}}>
      <XDSOverlay
        showOn="hover"
        align="center"
        content={<XDSButton label="Quick view" variant="ghost" />}>
        <XDSAspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE}
            alt="Product"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
      </XDSOverlay>
    </div>
  ),
};

/** Always-visible bottom strip with title over a hero image. */
export const BottomStrip: Story = {
  render: () => (
    <div style={{width: 600}}>
      <XDSOverlay
        position="bottom"
        align="start"
        content={
          <XDSVStack gap={1}>
            <XDSHeading level={3}>Gallery Collection</XDSHeading>
            <XDSText type="supporting" color="secondary">
              24 items · Updated today
            </XDSText>
          </XDSVStack>
        }>
        <XDSAspectRatio ratio={2}>
          <img src={SAMPLE_HERO} alt="Hero" {...stylex.props(styles.image)} />
        </XDSAspectRatio>
      </XDSOverlay>
    </div>
  ),
};

/** Full overlay wrapping a Card. */
export const CardOverlay: Story = {
  render: () => (
    <XDSOverlay
      showOn="hover"
      align="center"
      content={<XDSButton label="View Details" variant="ghost" />}>
      <XDSCard width={360}>
        <XDSLayout
          content={
            <XDSLayoutContent>
              <XDSVStack gap={2}>
                <XDSHeading level={3}>Project Alpha</XDSHeading>
                <XDSText>
                  A comprehensive design system for building internal tools with
                  consistent, accessible interfaces.
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Updated 2 hours ago · 12 contributors
                </XDSText>
              </XDSVStack>
            </XDSLayoutContent>
          }
        />
      </XDSCard>
    </XDSOverlay>
  ),
};

/** Hover + focus — also appears on keyboard focus. */
export const HoverOrFocus: Story = {
  render: () => (
    <div style={{width: 400}}>
      <XDSOverlay
        showOn="hover-or-focus"
        align="center"
        content={<XDSButton label="Edit" variant="ghost" />}>
        <XDSAspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE_2}
            alt="Photo"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
      </XDSOverlay>
    </div>
  ),
};

/** Light scrim for loading/upload states. */
export const LoadingOverlay: Story = {
  render: function LoadingOverlayStory() {
    const [isUploading, setIsUploading] = useState(false);
    return (
      <XDSVStack gap={4} style={{width: 300}}>
        <XDSButton
          label={isUploading ? 'Cancel upload' : 'Simulate upload'}
          onClick={() => setIsUploading(v => !v)}
        />
        <XDSOverlay
          isOpen={isUploading}
          scrim="light"
          align="center"
          content={
            <XDSVStack gap={2} hAlign="center">
              <XDSSpinner size="md" />
              <XDSText weight="bold">Uploading...</XDSText>
            </XDSVStack>
          }>
          <XDSAspectRatio ratio={1}>
            <img
              src={SAMPLE_IMAGE_3}
              alt="Upload"
              {...stylex.props(styles.image)}
            />
          </XDSAspectRatio>
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
          <XDSOverlay
            key={img.title}
            showOn="hover"
            position="bottom"
            align="start"
            content={<XDSText weight="bold">{img.title}</XDSText>}>
            <XDSAspectRatio ratio={1}>
              <img
                src={img.src}
                alt={img.title}
                {...stylex.props(styles.image)}
              />
            </XDSAspectRatio>
          </XDSOverlay>
        ))}
      </XDSGrid>
    );
  },
};

/** Video thumbnail with duration badge (always visible) + hover play overlay. */
export const VideoThumbnail: Story = {
  render: () => (
    <div style={{width: 400}}>
      <XDSOverlay
        showOn="hover"
        align="center"
        content={
          <XDSVStack gap={2} hAlign="center">
            <XDSText weight="bold" size="lg">
              ▶
            </XDSText>
            <XDSText weight="bold">Introduction to XDS</XDSText>
          </XDSVStack>
        }>
        <XDSAspectRatio ratio={16 / 9}>
          <img src={SAMPLE_IMAGE} alt="Video" {...stylex.props(styles.image)} />
        </XDSAspectRatio>
      </XDSOverlay>
    </div>
  ),
};

/** Disconnected hover — useXDSOverlay hook on Card. Hover Card reveals overlay on image. */
export const DisconnectedHover: Story = {
  render: function DisconnectedHoverStory() {
    const overlay = useXDSOverlay({
      showOn: 'hover',
      position: 'bottom',
      align: 'start',
      content: <XDSHeading level={4}>Featured Article</XDSHeading>,
    });

    return (
      <XDSCard
        width={360}
        ref={overlay.containerRef as React.RefObject<HTMLDivElement>}
        {...overlay.containerProps}>
        <div {...stylex.props(styles.imageSection)}>
          <XDSAspectRatio ratio={16 / 9}>
            <img
              src={SAMPLE_IMAGE_2}
              alt="Article"
              {...stylex.props(styles.image)}
            />
          </XDSAspectRatio>
          {overlay.element}
        </div>
        <XDSVStack gap={1} xstyle={styles.metadata}>
          <XDSText type="supporting" color="secondary">
            Jan 15, 2026 · 5 min read
          </XDSText>
          <XDSText type="supporting" color="secondary">
            By Jane Author
          </XDSText>
        </XDSVStack>
      </XDSCard>
    );
  },
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
        <XDSOverlay
          isOpen={isDragOver}
          align="center"
          content={
            <XDSVStack gap={2} hAlign="center">
              <XDSText size="lg">📁</XDSText>
              <XDSText weight="bold">Drop files here</XDSText>
            </XDSVStack>
          }>
          <div {...stylex.props(styles.dropZone)}>
            <p {...stylex.props(styles.dropZoneText)}>
              Drop files here or click to browse
            </p>
          </div>
        </XDSOverlay>
      </XDSVStack>
    );
  },
};

/** No scrim — content-only overlay without a background. */
export const NoScrim: Story = {
  render: () => (
    <div style={{width: 300}}>
      <XDSOverlay
        showOn="hover"
        scrim={false}
        align="center"
        content={<XDSButton label="♡" variant="ghost" />}>
        <XDSAspectRatio ratio={1}>
          <img
            src={SAMPLE_IMAGE_3}
            alt="Selected"
            {...stylex.props(styles.image)}
          />
        </XDSAspectRatio>
      </XDSOverlay>
    </div>
  ),
};
