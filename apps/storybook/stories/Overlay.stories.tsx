// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import React, {useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {expect, fireEvent} from 'storybook/test';
import {
  Overlay,
  OverlayRegion,
  useOverlay,
  type OverlayRegionPlacement,
  type OverlayRegionPreset,
} from '@astryxdesign/core/Overlay';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {VStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Grid} from '@astryxdesign/core/Grid';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';

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
  regionMedia: {
    display: 'block',
    width: '100%',
    height: '100%',
    backgroundImage: `linear-gradient(135deg, ${colorVars['--color-icon-purple']}, ${colorVars['--color-icon-blue']})`,
  },
  captionBox: {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colorVars['--color-on-dark'],
    borderRadius: 4,
    color: colorVars['--color-on-dark'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: 600,
  },
  movableCaption: {
    cursor: 'move',
    touchAction: 'none',
    userSelect: 'none',
    backgroundColor: 'transparent',
    padding: 0,
  },
  pin: {
    display: 'block',
    paddingBlock: 2,
    paddingInline: 8,
    borderRadius: 999,
    backgroundColor: colorVars['--color-overlay'],
    color: colorVars['--color-on-dark'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: 12,
    fontWeight: 600,
  },
});

const SAMPLE_IMAGE = 'https://picsum.photos/seed/astryx-overlay/800/450';
const SAMPLE_IMAGE_2 = 'https://picsum.photos/seed/astryx-overlay-2/800/450';
const SAMPLE_IMAGE_3 = 'https://picsum.photos/seed/astryx-overlay-3/800/450';
const SAMPLE_HERO = 'https://picsum.photos/seed/astryx-hero/1200/600';

const meta: Meta<typeof Overlay> = {
  title: 'Core/Overlay',
  component: Overlay,
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
type Story = StoryObj<typeof Overlay>;

/** Basic hover overlay on an image. */
export const HoverOnImage: Story = {
  render: () => (
    <div style={{width: 400}}>
      <Overlay
        showOn="hover"
        align="center"
        content={<Button label="Quick view" variant="ghost" />}>
        <AspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE}
            alt="Product"
            {...stylex.props(styles.image)}
          />
        </AspectRatio>
      </Overlay>
    </div>
  ),
};

/** Always-visible bottom strip with title over a hero image. */
export const BottomStrip: Story = {
  render: () => (
    <div style={{width: 600}}>
      <Overlay
        position="bottom"
        align="start"
        content={
          <VStack gap={1}>
            <Heading level={3}>Gallery Collection</Heading>
            <Text type="supporting" color="secondary">
              24 items · Updated today
            </Text>
          </VStack>
        }>
        <AspectRatio ratio={2}>
          <img src={SAMPLE_HERO} alt="Hero" {...stylex.props(styles.image)} />
        </AspectRatio>
      </Overlay>
    </div>
  ),
};

/** Full overlay wrapping a Card. */
export const CardOverlay: Story = {
  render: () => (
    <Overlay
      showOn="hover"
      align="center"
      content={<Button label="View Details" variant="ghost" />}>
      <Card width={360}>
        <Layout
          content={
            <LayoutContent>
              <VStack gap={2}>
                <Heading level={3}>Project Alpha</Heading>
                <Text>
                  A comprehensive design system for building internal tools with
                  consistent, accessible interfaces.
                </Text>
                <Text type="supporting" color="secondary">
                  Updated 2 hours ago · 12 contributors
                </Text>
              </VStack>
            </LayoutContent>
          }
        />
      </Card>
    </Overlay>
  ),
};

/** Hover + focus — also appears on keyboard focus. */
export const HoverOrFocus: Story = {
  render: () => (
    <div style={{width: 400}}>
      <Overlay
        showOn="hover-or-focus"
        align="center"
        content={<Button label="Edit" variant="ghost" />}>
        <AspectRatio ratio={16 / 9}>
          <img
            src={SAMPLE_IMAGE_2}
            alt="Photo"
            {...stylex.props(styles.image)}
          />
        </AspectRatio>
      </Overlay>
    </div>
  ),
};

/** Light scrim for loading/upload states. */
export const LoadingOverlay: Story = {
  render: function LoadingOverlayStory() {
    const [isUploading, setIsUploading] = useState(false);
    return (
      <VStack gap={4} style={{width: 300}}>
        <Button
          label={isUploading ? 'Cancel upload' : 'Simulate upload'}
          onClick={() => setIsUploading(v => !v)}
        />
        <Overlay
          isOpen={isUploading}
          scrim="light"
          align="center"
          content={
            <VStack gap={2} hAlign="center">
              <Spinner size="md" />
              <Text weight="bold">Uploading...</Text>
            </VStack>
          }>
          <AspectRatio ratio={1}>
            <img
              src={SAMPLE_IMAGE_3}
              alt="Upload"
              {...stylex.props(styles.image)}
            />
          </AspectRatio>
        </Overlay>
      </VStack>
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
      <Grid columns={3} gap={4}>
        {images.map(img => (
          <Overlay
            key={img.title}
            showOn="hover"
            position="bottom"
            align="start"
            content={<Text weight="bold">{img.title}</Text>}>
            <AspectRatio ratio={1}>
              <img
                src={img.src}
                alt={img.title}
                {...stylex.props(styles.image)}
              />
            </AspectRatio>
          </Overlay>
        ))}
      </Grid>
    );
  },
};

/** Video thumbnail with duration badge (always visible) + hover play overlay. */
export const VideoThumbnail: Story = {
  render: () => (
    <div style={{width: 400}}>
      <Overlay
        showOn="hover"
        align="center"
        content={
          <VStack gap={2} hAlign="center">
            <Text weight="bold" size="lg">
              ▶
            </Text>
            <Text weight="bold">Introduction to Astryx</Text>
          </VStack>
        }>
        <AspectRatio ratio={16 / 9}>
          <img src={SAMPLE_IMAGE} alt="Video" {...stylex.props(styles.image)} />
        </AspectRatio>
      </Overlay>
    </div>
  ),
};

/** Disconnected hover — useOverlay hook on Card. Hover Card reveals overlay on image. */
export const DisconnectedHover: Story = {
  render: function DisconnectedHoverStory() {
    const overlay = useOverlay({
      showOn: 'hover',
      position: 'bottom',
      align: 'start',
      content: <Heading level={4}>Featured Article</Heading>,
    });

    return (
      <Card
        width={360}
        ref={overlay.containerRef as React.RefObject<HTMLDivElement>}
        {...overlay.containerProps}>
        <div {...stylex.props(styles.imageSection)}>
          <AspectRatio ratio={16 / 9}>
            <img
              src={SAMPLE_IMAGE_2}
              alt="Article"
              {...stylex.props(styles.image)}
            />
          </AspectRatio>
          {overlay.element}
        </div>
        <VStack gap={1} xstyle={styles.metadata}>
          <Text type="supporting" color="secondary">
            Jan 15, 2026 · 5 min read
          </Text>
          <Text type="supporting" color="secondary">
            By Jane Author
          </Text>
        </VStack>
      </Card>
    );
  },
};

/** Drag-and-drop overlay — simulated with a toggle button. */
export const DragAndDrop: Story = {
  render: function DragAndDropStory() {
    const [isDragOver, setIsDragOver] = useState(false);
    return (
      <VStack gap={4} style={{width: 400}}>
        <Button
          label={isDragOver ? 'Simulate drag leave' : 'Simulate drag enter'}
          variant="secondary"
          onClick={() => setIsDragOver(v => !v)}
        />
        <Overlay
          isOpen={isDragOver}
          align="center"
          content={
            <VStack gap={2} hAlign="center">
              <Text size="lg">📁</Text>
              <Text weight="bold">Drop files here</Text>
            </VStack>
          }>
          <div {...stylex.props(styles.dropZone)}>
            <p {...stylex.props(styles.dropZoneText)}>
              Drop files here or click to browse
            </p>
          </div>
        </Overlay>
      </VStack>
    );
  },
};

/** No scrim — content-only overlay without a background. */
export const NoScrim: Story = {
  render: () => (
    <div style={{width: 300}}>
      <Overlay
        showOn="hover"
        scrim={false}
        align="center"
        content={<Button label="♡" variant="ghost" />}>
        <AspectRatio ratio={1}>
          <img
            src={SAMPLE_IMAGE_3}
            alt="Selected"
            {...stylex.props(styles.image)}
          />
        </AspectRatio>
      </Overlay>
    </div>
  ),
};

// =============================================================================
// Regions: preset and open placement
// =============================================================================

type OpenCase = {label: string; position: OverlayRegionPlacement};

const OPEN_CASES: readonly OpenCase[] = [
  {label: 'Caption', position: {x: 0.1, y: 0.04, width: 0.8, height: 0.16}},
  // Asks for x 0.9 with width 0.3: clamped flush with the right edge.
  {label: 'Edge', position: {x: 0.9, y: 0.6, width: 0.3, height: 0.2}},
  {label: 'Pin', position: {x: 0.25, y: 0.78}},
  // Written before a positioned in-flow Button that it overlaps (FR10).
  {label: 'Above', position: {x: 0.25, y: 0.4, width: 0.5, height: 0.22}},
];

const PRESETS: readonly OverlayRegionPreset[] = [
  'top',
  'bottom',
  'center',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
];

function Media() {
  return (
    <AspectRatio ratio={4 / 3}>
      <div {...stylex.props(styles.regionMedia)} />
    </AspectRatio>
  );
}

function OpenSurface({width, dir}: {width: number; dir?: 'rtl'}) {
  return (
    <div dir={dir} data-region-surface={`open-${width}${dir ?? ''}`}>
      <Overlay
        scrim={false}
        align="center"
        style={{width}}
        content={
          <>
            {OPEN_CASES.map(region => (
              <OverlayRegion key={region.label} position={region.position}>
                <span
                  data-region={region.label}
                  {...stylex.props(
                    region.position.width === undefined
                      ? styles.pin
                      : styles.captionBox,
                  )}>
                  {region.label}
                </span>
              </OverlayRegion>
            ))}
            <Button
              label={dir === 'rtl' ? 'زر في التدفق' : 'In-flow button'}
              size="sm"
              variant="secondary"
            />
          </>
        }>
        <Media />
      </Overlay>
    </div>
  );
}

function PresetSurface({dir}: {dir?: 'rtl'}) {
  return (
    <div dir={dir} data-region-surface={`presets${dir ?? ''}`}>
      <Overlay
        scrim={false}
        style={{width: 480}}
        content={
          <>
            {PRESETS.map(preset => (
              <OverlayRegion key={preset} position={preset}>
                <span data-region={preset} {...stylex.props(styles.pin)}>
                  {preset}
                </span>
              </OverlayRegion>
            ))}
          </>
        }>
        <Media />
      </Overlay>
    </div>
  );
}

/** Finds an element the story rendered, or fails the play function. */
function mustFind<T extends HTMLElement = HTMLElement>(
  root: Element,
  selector: string,
): T {
  const el = root.querySelector<T>(selector);
  if (el === null) {
    throw new Error(`story element not found: ${selector}`);
  }
  return el;
}

function regionBoxOf(host: Element, label: string): DOMRect {
  const region = mustFind(host, `[data-region="${label}"]`).parentElement;
  if (region === null) {
    throw new Error(`${label} has no region`);
  }
  return region.getBoundingClientRect();
}

function near(actual: number, expected: number, what: string) {
  expect(
    Math.abs(actual - expected),
    `${what}: ${actual} vs ${expected}`,
  ).toBeLessThanOrEqual(0.5);
}

/** Open placement: the region's top-left corner at its fractions. */
function assertOpen(canvasElement: HTMLElement, key: string) {
  const host = mustFind(canvasElement, `[data-region-surface="${key}"]`);
  const surface = mustFind(host, '.astryx-overlay').getBoundingClientRect();
  for (const {label, position} of OPEN_CASES) {
    const box = regionBoxOf(host, label);
    const axis = (start: number, size: number | undefined) =>
      size === undefined ? start : Math.min(start, 1 - size);
    near(
      box.left,
      surface.left + axis(position.x, position.width) * surface.width,
      `${key} ${label} left`,
    );
    near(
      box.top,
      surface.top + axis(position.y, position.height) * surface.height,
      `${key} ${label} top`,
    );
    if (position.width !== undefined) {
      near(box.width, position.width * surface.width, `${key} ${label} width`);
      expect(box.right).toBeLessThanOrEqual(surface.right + 0.5);
    }
    if (position.height !== undefined) {
      near(
        box.height,
        position.height * surface.height,
        `${key} ${label} height`,
      );
    }
  }
}

/** Presets: Overlay's places inside the content inset; corners are logical. */
function assertPresets(canvasElement: HTMLElement, isRtl: boolean) {
  const key = `presets${isRtl ? 'rtl' : ''}`;
  const host = mustFind(canvasElement, `[data-region-surface="${key}"]`);
  const surface = mustFind(host, '.astryx-overlay').getBoundingClientRect();
  const inset = parseFloat(
    getComputedStyle(mustFind(host, '.astryx-overlay-scrim')).paddingTop,
  );
  const left = surface.left + inset;
  const right = surface.right - inset;
  const top = surface.top + inset;
  const bottom = surface.bottom - inset;
  const start = (box: DOMRect) => (isRtl ? box.right : box.left);
  const end = (box: DOMRect) => (isRtl ? box.left : box.right);
  const startEdge = isRtl ? right : left;
  const endEdge = isRtl ? left : right;

  const topBox = regionBoxOf(host, 'top');
  near(topBox.left, left, `${key} top left`);
  near(topBox.right, right, `${key} top right`);
  near(topBox.top, top, `${key} top top`);
  const bottomBox = regionBoxOf(host, 'bottom');
  near(bottomBox.left, left, `${key} bottom left`);
  near(bottomBox.bottom, bottom, `${key} bottom bottom`);
  const center = regionBoxOf(host, 'center');
  near(center.left + center.width / 2, (left + right) / 2, `${key} center x`);
  near(center.top + center.height / 2, (top + bottom) / 2, `${key} center y`);
  for (const [preset, vertical, inline] of [
    ['top-start', 'top', 'start'],
    ['top-end', 'top', 'end'],
    ['bottom-start', 'bottom', 'start'],
    ['bottom-end', 'bottom', 'end'],
  ] as const) {
    const box = regionBoxOf(host, preset);
    near(
      vertical === 'top' ? box.top : box.bottom,
      vertical === 'top' ? top : bottom,
      `${key} ${preset} block`,
    );
    near(
      inline === 'start' ? start(box) : end(box),
      inline === 'start' ? startEdge : endEdge,
      `${key} ${preset} inline`,
    );
  }
}

/**
 * `OverlayRegion` places content over a fill Overlay. `position` is a preset
 * (Overlay's own `fill`/`top`/`bottom`, plus `center` and the logical
 * corners, which flip in right-to-left) or open placement `{x, y, width?,
 * height?}`: the region's top-left corner at fractions of the media, measured
 * physically, so it does not mirror. A sized open region stays inside the
 * media ("Edge" sits flush with the right edge). In a top or bottom strip a
 * region is not placed and warns in development. The play function measures
 * every region in a real browser.
 */
export const Regions: Story = {
  render: () => (
    <VStack gap={6}>
      <OpenSurface width={480} />
      <OpenSurface width={240} />
      <OpenSurface width={480} dir="rtl" />
      <PresetSurface />
      <PresetSurface dir="rtl" />
      <div data-region-surface="fill-preset">
        <Overlay
          scrim={false}
          style={{width: 240}}
          content={
            <OverlayRegion position="fill">
              <span data-region="fill" {...stylex.props(styles.pin)}>
                fill
              </span>
            </OverlayRegion>
          }>
          <Media />
        </Overlay>
      </div>
      <div data-region-surface="wrapped">
        <Overlay
          scrim={false}
          style={{width: 240}}
          content={
            <div
              data-region-wrapper=""
              style={{position: 'relative', width: 120, height: 60}}>
              <OverlayRegion
                position={{x: 0.25, y: 0.25, width: 0.5, height: 0.5}}>
                <span data-region="Wrapped" {...stylex.props(styles.pin)}>
                  Wrapped
                </span>
              </OverlayRegion>
            </div>
          }>
          <Media />
        </Overlay>
      </div>
      <div data-region-surface="strip">
        <Overlay
          position="bottom"
          style={{width: 240}}
          content={
            <OverlayRegion position={{x: 0.1, y: 0.1, width: 0.5}}>
              <span data-region="Strip" {...stylex.props(styles.pin)}>
                In a strip
              </span>
            </OverlayRegion>
          }>
          <Media />
        </Overlay>
      </div>
      <div data-region-surface="none">
        <Overlay
          scrim={false}
          style={{width: 240}}
          content={<span {...stylex.props(styles.pin)}>No regions</span>}>
          <Media />
        </Overlay>
      </div>
    </VStack>
  ),
  play: async ({canvasElement}) => {
    assertOpen(canvasElement, 'open-480');
    assertOpen(canvasElement, 'open-240');
    assertOpen(canvasElement, 'open-480rtl');
    assertPresets(canvasElement, false);
    assertPresets(canvasElement, true);

    // fill covers the content inset box.
    const fillHost = mustFind(
      canvasElement,
      '[data-region-surface="fill-preset"]',
    );
    const fillSurface = mustFind(
      fillHost,
      '.astryx-overlay',
    ).getBoundingClientRect();
    const fillInset = parseFloat(
      getComputedStyle(mustFind(fillHost, '.astryx-overlay-scrim')).paddingTop,
    );
    const fillBox = regionBoxOf(fillHost, 'fill');
    near(fillBox.left, fillSurface.left + fillInset, 'fill left');
    near(fillBox.bottom, fillSurface.bottom - fillInset, 'fill bottom');

    // Open placement lands on the same spot in both directions.
    const ltr = regionBoxOf(
      mustFind(canvasElement, '[data-region-surface="open-480"]'),
      'Pin',
    );
    const rtl = regionBoxOf(
      mustFind(canvasElement, '[data-region-surface="open-480rtl"]'),
      'Pin',
    );
    const ltrSurface = mustFind(
      canvasElement,
      '[data-region-surface="open-480"] .astryx-overlay',
    ).getBoundingClientRect();
    const rtlSurface = mustFind(
      canvasElement,
      '[data-region-surface="open-480rtl"] .astryx-overlay',
    ).getBoundingClientRect();
    near(ltr.left - ltrSurface.left, rtl.left - rtlSurface.left, 'open RTL');

    // A positioned wrapper in the content becomes the region's box.
    const wrapper = mustFind(
      canvasElement,
      '[data-region-wrapper]',
    ).getBoundingClientRect();
    const wrapped = regionBoxOf(
      mustFind(canvasElement, '[data-region-surface="wrapped"]'),
      'Wrapped',
    );
    near(wrapped.left, wrapper.left + wrapper.width * 0.25, 'wrapped left');
    near(wrapped.top, wrapper.top + wrapper.height * 0.25, 'wrapped top');

    // In a strip a region is not placed: it flows with the strip content.
    const stripRegion = mustFind(
      canvasElement,
      '[data-region="Strip"]',
    ).parentElement;
    expect(stripRegion ? getComputedStyle(stripRegion).position : null).toBe(
      'static',
    );

    // An Overlay without regions stacks as before: no isolation.
    expect(
      getComputedStyle(
        mustFind(canvasElement, '[data-region-surface="none"] .astryx-overlay'),
      ).isolation,
    ).toBe('auto');

    // A region paints above the positioned in-flow Button written after it,
    // inside a container that isolates that paint order from the page.
    for (const key of ['open-480', 'open-240', 'open-480rtl']) {
      const container = mustFind(
        canvasElement,
        `[data-region-surface="${key}"] .astryx-overlay`,
      );
      expect(
        getComputedStyle(container).isolation,
        `${key} container isolation`,
      ).toBe('isolate');
      const above = mustFind(
        canvasElement,
        `[data-region-surface="${key}"] [data-region="Above"]`,
      );
      const rect = above.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      expect(
        hit?.closest('[data-region="Above"]'),
        `${key}: the region is under the in-flow button`,
      ).toBe(above);
    }

    // A live resize keeps every region on its fraction with no re-render.
    const resized = mustFind(
      canvasElement,
      '[data-region-surface="open-480"] .astryx-overlay',
    );
    resized.style.width = '360px';
    try {
      assertOpen(canvasElement, 'open-480');
    } finally {
      resized.style.width = '480px';
    }
  },
};

const MOVE_STEP = 0.02;
const MOVE_KEYS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-MOVE_STEP, 0],
  ArrowRight: [MOVE_STEP, 0],
  ArrowUp: [0, -MOVE_STEP],
  ArrowDown: [0, MOVE_STEP],
};

/**
 * The callsite pattern for moving a region: pointer drags, a click on the
 * media, and arrow keys turn into new fractions measured against the
 * Overlay's `ref`, and the region receives them as `position`. Overlay itself
 * never moves a region.
 */
function MovableCaption({dir}: {dir?: 'rtl'}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const size = {width: 0.6, height: 0.18};
  const [corner, setCorner] = useState({x: 0.2, y: 0.11});
  const [drag, setDrag] = useState<{
    pointerX: number;
    pointerY: number;
    x: number;
    y: number;
  } | null>(null);
  // Keep the whole box on the image.
  const moveTo = (x: number, y: number) =>
    setCorner({
      x: Math.min(Math.max(x, 0), 1 - size.width),
      y: Math.min(Math.max(y, 0), 1 - size.height),
    });

  return (
    // A single click on the media centers the caption there: the non-drag
    // pointer path. Clicks on the caption itself are its own.
    <div
      dir={dir}
      data-movable={dir ?? 'ltr'}
      style={{width: 'fit-content'}}
      onClick={event => {
        const rect = surfaceRef.current?.getBoundingClientRect();
        if (
          rect === undefined ||
          rect.width === 0 ||
          (event.target as HTMLElement).closest('button') !== null
        ) {
          return;
        }
        moveTo(
          (event.clientX - rect.left) / rect.width - size.width / 2,
          (event.clientY - rect.top) / rect.height - size.height / 2,
        );
      }}>
      <Overlay
        ref={surfaceRef}
        scrim={false}
        style={{width: 360}}
        content={
          <OverlayRegion position={{...corner, ...size}}>
            <button
              type="button"
              aria-label="Move caption. Drag, or use the arrow keys."
              {...stylex.props(styles.captionBox, styles.movableCaption)}
              onKeyDown={event => {
                const step = MOVE_KEYS[event.key];
                if (step === undefined) {
                  return;
                }
                event.preventDefault();
                // Media coordinates are physical: ArrowRight moves right in
                // both directions.
                moveTo(corner.x + step[0], corner.y + step[1]);
              }}
              onPointerDown={event => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDrag({
                  pointerX: event.clientX,
                  pointerY: event.clientY,
                  ...corner,
                });
              }}
              onPointerMove={event => {
                const rect = surfaceRef.current?.getBoundingClientRect();
                if (drag === null || rect === undefined || rect.width === 0) {
                  return;
                }
                moveTo(
                  drag.x + (event.clientX - drag.pointerX) / rect.width,
                  drag.y + (event.clientY - drag.pointerY) / rect.height,
                );
              }}
              onPointerUp={() => setDrag(null)}
              onPointerCancel={() => setDrag(null)}>
              Caption
            </button>
          </OverlayRegion>
        }>
        <Media />
      </Overlay>
    </div>
  );
}

/**
 * Drag the caption, click a spot on the image, or focus the caption and use
 * the arrow keys. The move logic lives in the story (the callsite), not in
 * Overlay.
 */
export const MovableRegion: Story = {
  render: () => (
    <VStack gap={6}>
      <MovableCaption />
      <MovableCaption dir="rtl" />
    </VStack>
  ),
  play: async ({canvasElement}) => {
    for (const dir of ['ltr', 'rtl']) {
      const button = mustFind<HTMLButtonElement>(
        canvasElement,
        `[data-movable="${dir}"] button`,
      );
      const before = button.getBoundingClientRect().left;
      button.focus();
      fireEvent.keyDown(button, {key: 'ArrowRight'});
      await new Promise(resolve => requestAnimationFrame(resolve));
      const after = button.getBoundingClientRect().left;
      // One 2% step of a 360px surface, toward the right in both directions.
      expect(after - before, `${dir} ArrowRight`).toBeCloseTo(7.2, 0);

      // A single click on the media centers the caption there.
      const host = mustFind(canvasElement, `[data-movable="${dir}"]`);
      const surface = mustFind(host, '.astryx-overlay').getBoundingClientRect();
      const target = {
        x: surface.left + surface.width * 0.5,
        y: surface.top + surface.height * 0.7,
      };
      fireEvent.click(host, {clientX: target.x, clientY: target.y});
      await new Promise(resolve => requestAnimationFrame(resolve));
      const moved = button.getBoundingClientRect();
      near(moved.left + moved.width / 2, target.x, `${dir} activation x`);
      near(moved.top + moved.height / 2, target.y, `${dir} activation y`);
    }
  },
};
