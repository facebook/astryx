// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {useLayer} from '@astryxdesign/core/Layer';
import {LayerProvider} from '@astryxdesign/core/Layer';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

const styles = stylex.create({
  popoverContent: {
    backgroundColor: 'var(--color-background-surface)',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid var(--color-border-default)',
  },
  demoArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});

const meta: Meta = {
  title: 'Core/Layer',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Layer is the core positioning hook for overlay content using CSS Anchor Positioning and the Popover API. Used as the foundation for Popover, HoverCard, and Tooltip.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function ContextModeDemo() {
  const layer = useLayer({mode: 'context', lightDismiss: true});

  return (
    <div {...stylex.props(styles.demoArea)}>
      <Button
        ref={layer.ref}
        label="Show layer"
        onClick={() => (layer.isOpen ? layer.hide() : layer.show())}
      />
      {layer.render(
        <div {...stylex.props(styles.popoverContent)}>
          <Text type="body">
            This layer is anchored to the button using CSS Anchor Positioning.
          </Text>
        </div>,
        {placement: 'below', alignment: 'center'},
      )}
    </div>
  );
}

export const ContextMode: Story = {
  render: () => <ContextModeDemo />,
};

function OffsetDemo() {
  const [placement, setPlacement] = useState<
    'above' | 'below' | 'start' | 'end'
  >('end');
  const flush = useLayer({mode: 'context', lightDismiss: true});
  const spaced = useLayer({mode: 'context', lightDismiss: true});

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{display: 'flex', gap: 8}}>
        {(['above', 'below', 'start', 'end'] as const).map(p => (
          <Button
            key={p}
            label={p}
            variant={placement === p ? 'primary' : 'secondary'}
            onClick={() => setPlacement(p)}
          />
        ))}
      </div>
      <div {...stylex.props(styles.demoArea)} style={{gap: 120}}>
        <div>
          <Button
            ref={flush.ref}
            label="offset: 0"
            onClick={() => (flush.isOpen ? flush.hide() : flush.show())}
          />
          {flush.render(
            <div {...stylex.props(styles.popoverContent)}>
              <Text type="body">Flush against the anchor</Text>
            </div>,
            {placement, alignment: 'center'},
          )}
        </div>
        <div>
          <Button
            ref={spaced.ref}
            label="offset: 12"
            onClick={() => (spaced.isOpen ? spaced.hide() : spaced.show())}
          />
          {spaced.render(
            <div {...stylex.props(styles.popoverContent)}>
              <Text type="body">12px of clearance, on either side</Text>
            </div>,
            {placement, alignment: 'center', offset: 12},
          )}
        </div>
      </div>
    </div>
  );
}

export const Offset: Story = {
  render: () => <OffsetDemo />,
};

function PlacementDemo() {
  const [placement, setPlacement] = useState<
    'above' | 'below' | 'start' | 'end'
  >('above');
  const layer = useLayer({mode: 'context', lightDismiss: true});

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
      }}>
      <div style={{display: 'flex', gap: 8}}>
        {(['above', 'below', 'start', 'end'] as const).map(p => (
          <Button
            key={p}
            label={p}
            variant={placement === p ? 'primary' : 'secondary'}
            onClick={() => setPlacement(p)}
          />
        ))}
      </div>
      <div {...stylex.props(styles.demoArea)}>
        <Button
          ref={layer.ref}
          label="Trigger"
          onClick={() => (layer.isOpen ? layer.hide() : layer.show())}
        />
        {layer.render(
          <div {...stylex.props(styles.popoverContent)}>
            <Text type="body">Placement: {placement}</Text>
          </div>,
          {placement, alignment: 'center'},
        )}
      </div>
    </div>
  );
}

export const Placements: Story = {
  render: () => <PlacementDemo />,
};

function FixedModeDemo() {
  const [coords, setCoords] = useState({x: 0, y: 0});
  const layer = useLayer({mode: 'fixed', lightDismiss: true});

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 300,
        border: '1px dashed var(--color-border-default)',
        borderRadius: 8,
        cursor: 'crosshair',
      }}
      onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
          x: e.clientX - rect.left + rect.left,
          y: e.clientY - rect.top + rect.top,
        });
        layer.show();
      }}>
      <Text type="supporting" style={{padding: 16}}>
        Click anywhere in this area to show a fixed-position layer
      </Text>
      {layer.render(
        <div {...stylex.props(styles.popoverContent)}>
          <Text type="body">
            Fixed at ({Math.round(coords.x)}, {Math.round(coords.y)})
          </Text>
        </div>,
        {x: coords.x, y: coords.y},
      )}
    </div>
  );
}

export const FixedMode: Story = {
  render: () => <FixedModeDemo />,
};

function LayerProviderDemo() {
  return (
    <LayerProvider toast={{position: 'topEnd', maxVisible: 3}}>
      <div style={{padding: 16}}>
        <Text type="body">
          LayerProvider wraps your app to configure layer systems (toast
          positioning, max visible toasts). It is optional; hooks fall back to
          defaults when no provider exists.
        </Text>
      </div>
    </LayerProvider>
  );
}

export const Provider: Story = {
  render: () => <LayerProviderDemo />,
};

const FILLER =
  'Sequential focus follows DOM order, so where a layer is hosted decides what the browser does when focus moves into it. This paragraph is filler, so the container has something to scroll.';

interface HostingProbe {
  parentTag: string;
  insideParagraph: boolean;
  fontSize: string;
}

function describeFocus(): string {
  const el = document.activeElement as HTMLElement | null;
  if (!el || el === document.body) {
    return 'nothing';
  }
  const label = el.textContent?.trim().slice(0, 20);
  const tag = el.tagName.toLowerCase();
  return label ? `${tag} "${label}"` : tag;
}

function InlineHostingDemo() {
  const layer = useLayer({
    mode: 'context',
    lightDismiss: true,
    lazyMount: true,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [probe, setProbe] = useState<HostingProbe | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  // Samples the scroll offset on both sides of a frame: the browser's
  // scroll-into-view for the newly focused element lands in between.
  const record = (label: string, watchScroll = true) => {
    const before = Math.round(scrollRef.current?.scrollTop ?? 0);
    requestAnimationFrame(() => {
      const after = Math.round(scrollRef.current?.scrollTop ?? 0);
      const scroll = !watchScroll
        ? `scrollTop ${after}`
        : before === after
          ? `scrollTop ${after} (no jump)`
          : `scrollTop ${before} → ${after}`;
      const popover = document.getElementById(layer.id);
      setProbe(
        popover
          ? {
              parentTag: popover.parentElement?.tagName.toLowerCase() ?? '—',
              insideParagraph: paragraphRef.current?.contains(popover) ?? false,
              fontSize: window.getComputedStyle(popover).fontSize,
            }
          : null,
      );
      setEvents(prev =>
        [`${label} — focus: ${describeFocus()} — ${scroll}`, ...prev].slice(
          0,
          6,
        ),
      );
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 520,
      }}>
      <Button label="Before the article" />

      <div
        ref={scrollRef}
        onScroll={() => record('scrolled', false)}
        onFocusCapture={() => record('focus moved')}
        style={{
          height: 200,
          overflow: 'auto',
          padding: 16,
          border: '1px solid var(--color-border-default)',
          borderRadius: 8,
        }}>
        <p style={{fontSize: 13, textAlign: 'center'}}>{FILLER}</p>
        <p style={{fontSize: 13, textAlign: 'center'}}>{FILLER}</p>
        <p style={{fontSize: 13, textAlign: 'center'}}>{FILLER}</p>
        <p ref={paragraphRef} style={{fontSize: 13, textAlign: 'center'}}>
          Reviewed by{' '}
          <button
            ref={layer.ref}
            type="button"
            onClick={() => {
              if (layer.isOpen) {
                layer.hide();
              } else {
                layer.show();
              }
              record('toggled the card');
            }}
            style={{
              font: 'inherit',
              color: 'var(--color-content-link)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}>
            Jane Doe
          </button>{' '}
          earlier today, from inside a 13px centered paragraph.
          {layer.render(
            <div {...stylex.props(styles.popoverContent)} style={{width: 240}}>
              <Text type="body">Jane Doe</Text>
              <div style={{display: 'flex', gap: 8, marginTop: 8}}>
                <Button label="Follow" variant="primary" />
                <Button label="Message" />
              </div>
            </div>,
            {
              placement: 'below',
              alignment: 'start',
              offset: 8,
              role: 'dialog',
              'aria-label': 'Jane Doe',
            },
          )}
        </p>
        <p style={{fontSize: 13, textAlign: 'center'}}>{FILLER}</p>
        <p style={{fontSize: 13, textAlign: 'center'}}>{FILLER}</p>
        <p style={{fontSize: 13, textAlign: 'center'}}>{FILLER}</p>
      </div>

      <Button label="After the article" />

      <Text type="supporting">
        Tab in from the button above: the browser scrolls the trigger into view.
        Open the card, then Tab from the trigger into it and out the far side.
        Every move is logged with the container&apos;s scroll offset before and
        after the browser&apos;s scroll-into-view.
      </Text>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content max-content',
          gap: '2px 12px',
          fontSize: 13,
          margin: 0,
        }}>
        <dt>Layer&apos;s parent</dt>
        <dd style={{margin: 0}}>
          <code>{probe?.parentTag ?? 'not rendered yet'}</code>
        </dd>
        <dt>Inside the paragraph</dt>
        <dd style={{margin: 0}}>
          <code>{probe ? String(probe.insideParagraph) : '—'}</code>
        </dd>
        <dt>Card font size</dt>
        <dd style={{margin: 0}}>
          <code>{probe?.fontSize ?? '—'}</code>
        </dd>
      </dl>

      <ol style={{fontSize: 13, lineHeight: 1.6, paddingInlineStart: 20}}>
        {events.map((event, i) => (
          <li key={`${event}-${i}`}>{event}</li>
        ))}
      </ol>
    </div>
  );
}

export const InlineTriggerHosting: Story = {
  render: () => <InlineHostingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'A closed context layer leaves only an inert marker at its JSX position. When opened from this unsafe paragraph, the final layer is lazily portaled to the nearest ancestor that can contain it; a layer at a safe position would stay inline. The readout shows where the layer landed and what typography it inherits; the log shows what the browser scrolls as focus moves into and out of it.',
      },
    },
  },
};

// =============================================================================
// Viewport inset — spec:AST-059
// =============================================================================
//
// Each story below is a claim in `docs/specs/AST-059-layer-viewport-inset`
// a person can open and look at, and a geometry assertion the story play
// guard runs in real Chromium (jsdom has no layout). The viewport is 1280×900
// under the guard; triggers are placed so each case holds there.

const GUTTER = 16; // --spacing-4
const TOLERANCE = 1.5;

const viewportStyles = stylex.create({
  canvas: {
    position: 'relative',
    boxSizing: 'border-box',
    inlineSize: '100%',
    minBlockSize: '100dvh',
    overflow: 'clip',
  },
  wideCanvas: {
    inlineSize: 3000,
    minBlockSize: '100dvh',
    position: 'relative',
  },
  caption: {
    position: 'absolute',
    insetBlockStart: 16,
    insetInlineStart: 16,
    maxInlineSize: 480,
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  surface: {
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-surface)',
    border: '2px solid var(--color-border-accent, #6366f1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    lineHeight: 1.4,
  },
  nowrap: {whiteSpace: 'nowrap'},
  tall: {
    blockSize: 2000,
    background:
      'repeating-linear-gradient(to bottom, transparent 0 39px, var(--color-border-default) 39px 40px)',
  },
  // A surface inside a block-capped layer scrolls when its content is taller
  // than the layer; the cap it reads is the runtime's.
  scrollSurface: {
    overflow: 'auto',
    maxBlockSize: stylex.firstThatWorks(
      'calc(100dvb - 32px)',
      'calc(100vh - 32px)',
    ),
  },
  explicitWidth: (width: number) => ({width}),
  bottomBar: {
    position: 'fixed',
    insetBlockEnd: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    blockSize: 80,
    backgroundColor: 'var(--color-background-inverse, #111)',
    color: 'var(--color-text-inverse, #fff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
  },
});

type Pos = {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
};

function ViewportLayer({
  at,
  placement = 'below',
  alignment = 'start',
  width,
  surfaceXstyle,
  children,
  caption,
  canvasXstyle,
  extra,
}: {
  at: Pos;
  placement?: 'above' | 'below' | 'start' | 'end';
  alignment?: 'start' | 'center' | 'end';
  width?: number;
  surfaceXstyle?: stylex.StyleXStyles;
  children: React.ReactNode;
  caption: string;
  canvasXstyle?: stylex.StyleXStyles;
  extra?: React.ReactNode;
}) {
  const layer = useLayer({mode: 'context', lightDismiss: true});
  return (
    <div
      {...stylex.props(viewportStyles.canvas, canvasXstyle)}
      data-testid="canvas">
      <p {...stylex.props(viewportStyles.caption)}>{caption}</p>
      <div style={{position: 'absolute', ...at}}>
        <Button
          ref={layer.ref}
          label="Open"
          size="sm"
          onClick={() => (layer.isOpen ? layer.hide() : layer.show())}
        />
      </div>
      {layer.render(
        <div {...stylex.props(viewportStyles.surface, surfaceXstyle)}>
          {children}
        </div>,
        {
          placement,
          alignment,
          offset: 4,
          xstyle: width != null ? viewportStyles.explicitWidth(width) : null,
        },
      )}
      {extra}
    </div>
  );
}

const nextFrame = () => new Promise(r => requestAnimationFrame(() => r(null)));
const settle = async () => {
  await nextFrame();
  await nextFrame();
};

function rects(canvasElement: HTMLElement) {
  const trigger = canvasElement.querySelector('button');
  const layer = document.querySelector<HTMLElement>('[popover]:popover-open');
  if (!trigger || !layer) {
    throw new Error('No open layer');
  }
  return {
    trigger: trigger.getBoundingClientRect(),
    layer: layer.getBoundingClientRect(),
    vw: window.innerWidth,
    vh: window.innerHeight,
  };
}

async function open(canvasElement: HTMLElement) {
  canvasElement.querySelector('button')?.click();
  await settle();
  return rects(canvasElement);
}

function assertOnScreen(
  r: ReturnType<typeof rects>,
  label: string,
  gutter = GUTTER,
) {
  const {layer, vw, vh} = r;
  if (
    layer.left < gutter - TOLERANCE ||
    layer.right > vw - gutter + TOLERANCE ||
    layer.top < gutter - TOLERANCE ||
    layer.bottom > vh - gutter + TOLERANCE
  ) {
    throw new Error(
      `${label}: layer ${Math.round(layer.left)}..${Math.round(layer.right)} × ${Math.round(layer.top)}..${Math.round(layer.bottom)} leaves the ${gutter}px gutter in a ${vw}×${vh} viewport`,
    );
  }
}

const viewportParameters = {
  layout: 'fullscreen',
  docs: {story: {inline: false, height: '600px'}},
};

export const ContentFitsBesideTrigger: Story = {
  name: 'Viewport inset: content-sized, fits beside the trigger',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, left: 200}}
      caption="FR2, FR4 — A content-sized layer with room beside its trigger sizes to its content and stays start-aligned to the trigger. Nothing caps it to the span; nothing moves it.">
      <span {...stylex.props(viewportStyles.nowrap)}>
        Four short menu rows would sit here
      </span>
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (Math.abs(r.layer.left - r.trigger.left) > TOLERANCE) {
      throw new Error(
        `Expected the layer to stay start-aligned to the trigger (${r.trigger.left}), got ${r.layer.left}`,
      );
    }
    if (r.layer.width < 200) {
      throw new Error(`Layer shrank to ${r.layer.width}px`);
    }
    assertOnScreen(r, 'fits beside');
  },
};

export const ContentDoesNotFitBesideTrigger: Story = {
  name: 'Viewport inset: content-sized, does not fit beside the trigger',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, right: 60}}
      caption="FR2, FR4 — The trigger sits 60px from the inline-end edge and the layer's content cannot wrap below ~340px. The layer keeps its size and flips to end alignment instead of being squeezed into the 44px beside the trigger.">
      <span {...stylex.props(viewportStyles.nowrap)}>
        Unbreakable-label-that-cannot-wrap-to-fit-beside-the-trigger
      </span>
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (r.layer.width < 300) {
      throw new Error(`Layer was squeezed to ${r.layer.width}px`);
    }
    if (Math.abs(r.layer.right - r.trigger.right) > TOLERANCE) {
      throw new Error(
        `Expected a flip to end alignment (right ${r.trigger.right}), got right ${r.layer.right}`,
      );
    }
    assertOnScreen(r, 'does not fit beside');
  },
};

export const ExplicitSizeNearEdge: Story = {
  name: 'Viewport inset: explicit size near an edge (352px)',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, left: 45}}
      alignment="end"
      width={352}
      caption="FR2 — An end-aligned layer given width 352 on a trigger 45px from the inline-start edge. The span beside the trigger is 45px + the trigger; the layer renders at 352px anyway, flipped to start alignment, never shrunk to 274px.">
      A 352px panel
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (Math.abs(r.layer.width - 352) > TOLERANCE) {
      throw new Error(
        `Explicit width was not honoured: layer is ${r.layer.width}px wide`,
      );
    }
    assertOnScreen(r, 'explicit size');
  },
};

export const TriggerNearEdgeFlips: Story = {
  name: 'Viewport inset: trigger near an edge flips',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, right: 80}}
      width={320}
      caption="FR4 — A start-aligned 320px layer on a trigger 80px from the inline-end edge flips to end alignment: its inline-end edge meets the trigger's, and it keeps the 16px gutter from the viewport edge.">
      Flipped to the other side
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (Math.abs(r.layer.width - 320) > TOLERANCE) {
      throw new Error(`Layer width changed: ${r.layer.width}px`);
    }
    if (Math.abs(r.layer.right - r.trigger.right) > TOLERANCE) {
      throw new Error(
        `Expected the flipped layer's end edge at ${r.trigger.right}, got ${r.layer.right}`,
      );
    }
    assertOnScreen(r, 'flip');
  },
};

export const NeitherSideFits: Story = {
  name: 'Viewport inset: neither side fits',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, left: 'calc(50% - 20px)'}}
      width={1000}
      caption="FR4 — A 1000px layer on a centred trigger fits on neither side of it. It keeps its size and slides along the inline axis the least distance that brings it inside the gutters.">
      Too wide for either side; slid into view
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (Math.abs(r.layer.width - 1000) > TOLERANCE) {
      throw new Error(`Layer width changed: ${r.layer.width}px`);
    }
    assertOnScreen(r, 'neither side fits');
  },
};

export const TallerThanTheViewport: Story = {
  name: 'Viewport inset: taller than the viewport',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, left: 200}}
      surfaceXstyle={viewportStyles.scrollSurface}
      caption="FR3 — Content 2000px tall. The layer box is capped to the viewport minus both block gutters; the surface inside reads the same cap and scrolls.">
      <div {...stylex.props(viewportStyles.tall)} />
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (r.layer.height > r.vh - 2 * GUTTER + TOLERANCE) {
      throw new Error(
        `Layer block size ${r.layer.height}px exceeds the viewport minus gutters (${r.vh - 2 * GUTTER}px)`,
      );
    }
  },
};

export const AnchorLeavesTheViewport: Story = {
  name: 'Viewport inset: anchor leaves the viewport',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, left: 200}}
      width={320}
      canvasXstyle={viewportStyles.wideCanvas}
      caption="FR5 — Scroll the page sideways until the trigger leaves the viewport. The open layer goes with it and keeps its 320px: it does not slide toward the edge and pin itself into the strip that is left. Scroll back and it is where it was.">
      Holds position and size
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const before = await open(canvasElement);
    window.scrollTo(700, 0);
    await settle();
    await new Promise(resolve => setTimeout(resolve, 250));
    await settle();
    const away = rects(canvasElement);
    if (away.trigger.right > 0) {
      throw new Error(
        `Fixture: trigger still in view at ${away.trigger.left}..${away.trigger.right}`,
      );
    }
    if (Math.abs(away.layer.width - before.layer.width) > TOLERANCE) {
      throw new Error(
        `Layer changed size with its anchor off-screen: ${before.layer.width} → ${away.layer.width}`,
      );
    }
    if (away.layer.left >= 0) {
      throw new Error(
        `Layer slid toward the viewport edge (left ${away.layer.left}) while its anchor is at ${away.trigger.left}`,
      );
    }
    window.scrollTo(0, 0);
    await settle();
    await new Promise(resolve => setTimeout(resolve, 250));
    await settle();
    const back = rects(canvasElement);
    if (Math.abs(back.layer.left - before.layer.left) > TOLERANCE) {
      throw new Error(
        `Layer did not return with its anchor: ${before.layer.left} → ${back.layer.left}`,
      );
    }
  },
};

export const AppDeclaredInset: Story = {
  name: 'Viewport inset: app-declared inset (floating bar)',
  parameters: viewportParameters,
  render: () => (
    // The app's one declaration (FR6): inset on the LayerProvider it already
    // mounts. Anchored layers and toasts both clear the bar.
    <LayerProvider inset={{blockEnd: 80}}>
      <ViewportLayer
        at={{bottom: 140, left: 200}}
        caption="FR6 — The app floats an 80px bar over the bottom edge and declares it once: <LayerProvider inset={{blockEnd: 80}}>. The layer's bottom gutter becomes 96px, so a layer that would have ended under the bar flips above its trigger instead; a toast under the same provider rises by the same 80px. Remove the declaration and the layer opens below, under the bar."
        extra={
          <div {...stylex.props(viewportStyles.bottomBar)}>
            persistent bar — 80px, outside layout flow
          </div>
        }>
        <div style={{blockSize: 200}}>200px of rows</div>
      </ViewportLayer>
    </LayerProvider>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (r.layer.bottom > r.vh - 80 - GUTTER + TOLERANCE) {
      throw new Error(
        `Layer ends at ${r.layer.bottom}px, under the 80px bar (viewport ${r.vh}px)`,
      );
    }
    if (r.layer.bottom > r.trigger.top) {
      throw new Error('Expected the layer to flip above the trigger');
    }
  },
};

export const GutterAtTheEdge: Story = {
  name: 'Viewport inset: the gutter',
  parameters: viewportParameters,
  render: () => (
    <ViewportLayer
      at={{top: 120, right: 0}}
      caption="FR1 — The trigger is flush with the inline-end edge. The layer's content can wrap, so it fits beside the trigger by wrapping, and its inline-end edge stops 16px short of the viewport. (The device safe-area term of the gutter cannot be shown here: Chromium emulation does not populate env(safe-area-inset-*).)">
      <span>
        Prose that wraps keeps the gutter rather than flipping or sliding, so a
        layer never touches the viewport edge.
      </span>
    </ViewportLayer>
  ),
  play: async ({canvasElement}) => {
    const r = await open(canvasElement);
    if (r.layer.right > r.vw - GUTTER + TOLERANCE) {
      throw new Error(
        `Layer end edge ${r.layer.right} is inside the ${GUTTER}px gutter (viewport ${r.vw})`,
      );
    }
  },
};
