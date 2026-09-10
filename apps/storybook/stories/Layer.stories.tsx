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
