// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {useRef, useState} from 'react';
import {Toast} from '@astryxdesign/core/Toast';
import {
  MediaTheme,
  Theme,
  defineTheme,
  useTheme,
} from '@astryxdesign/core/theme';
// useContrastMode is deliberately not part of the package's public surface —
// Toast is its only consumer. The story reaches into source the way other
// internal-mechanism stories in this repo do.
import {useContrastMode} from '../../../packages/core/src/hooks/useContrastMode';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';

const meta: Meta = {
  title: 'Core/Toast Contrast Theming',
  parameters: {
    docs: {
      description: {
        component:
          'Toast asks for a media context; the guard hands it back unless the surface the browser actually painted makes it unreadable. It is a bug catcher — white-on-pale-grey — not a contrast enforcer: anything above a 3:1 floor is left to the theme. `MediaTheme` gained an `off` mode so a correction is a prop change, not a tree change.',
      },
    },
  },
};

export default meta;

// A theme whose "inverted" background is barely inverted at all — the case
// the static rule gets wrong. Light mode: pale grey surface, so the old rule
// paints white text on it.
const flatSurfaceTheme = defineTheme({
  name: 'flat-surface',
  tokens: {
    '--color-background-inverted': ['#E4E6EB', '#1C1F24'],
  },
});

const noop = () => {};

function SurfacePanel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap={2}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

/**
 * The surface the static rule produces: MediaTheme, unconditionally — with
 * the same dark/light choice Toast made before this prototype.
 */
function StaticRuleToast({type = 'info'}: {type?: 'info' | 'error'}) {
  const {mode} = useTheme();
  const staticMode = type === 'error' || mode === 'light' ? 'dark' : 'light';
  return (
    <div
      style={{
        backgroundColor:
          type === 'error'
            ? 'var(--color-background-error-inverted)'
            : 'var(--color-background-inverted)',
        borderRadius: 'var(--radius-container)',
        padding: 16,
        width: 400,
        maxWidth: '100%',
        boxShadow: 'var(--shadow-med)',
      }}>
      <MediaTheme mode={staticMode}>
        <Stack direction="horizontal" gap={3} align="center">
          <Text>Your changes were saved</Text>
          <Button label="Undo" variant="ghost" size="sm" />
        </Stack>
      </MediaTheme>
    </div>
  );
}

function ContrastAwareToast() {
  return (
    <Toast
      type="info"
      body="Your changes were saved"
      endContent={<Button label="Undo" variant="ghost" size="sm" />}
      isAutoHide={false}
      autoHideDuration={0}
      onDismiss={noop}
    />
  );
}

// =============================================================================
// Side by side
// =============================================================================

export const FlatSurfaceTheme: StoryObj = {
  render: function FlatSurfaceStory() {
    const {mode} = useTheme();
    return (
      <Theme theme={flatSurfaceTheme} mode={mode}>
        <Stack gap={5}>
          <Text>
            This theme sets <code>--color-background-inverted</code> to a pale
            grey in light mode. The static rule paints white text on it; the
            guarded toast measures the mode it asked for and corrects it.
          </Text>
          <SurfacePanel label="Static rule — MediaTheme applied unconditionally">
            <StaticRuleToast />
          </SurfacePanel>
          <SurfacePanel label="Guarded — corrects the unreadable request">
            <ContrastAwareToast />
          </SurfacePanel>
        </Stack>
      </Theme>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The failure the guard targets: a theme whose inverted background is not inverted. The static rule paints white on pale grey (~1.25:1); the guarded toast measures the mode it asked for, finds it unreadable, and corrects to the side that matches the surface.',
      },
    },
  },
};

export const StockTheme: StoryObj = {
  render: function StockThemeStory() {
    return (
      <Stack gap={5}>
        <Text>
          With a theme whose inverted surface really is inverted, the measured
          result matches the static rule — no visible change.
        </Text>
        <SurfacePanel label="Static rule">
          <StaticRuleToast />
        </SurfacePanel>
        <SurfacePanel label="Guarded">
          <ContrastAwareToast />
        </SurfacePanel>
      </Stack>
    );
  },
};

export const ErrorVariant: StoryObj = {
  render: function ErrorVariantStory() {
    return (
      <Stack gap={5}>
        <SurfacePanel label="Static rule">
          <StaticRuleToast type="error" />
        </SurfacePanel>
        <SurfacePanel label="Guarded">
          <Toast
            type="error"
            body="Could not reach the server"
            isAutoHide={false}
            autoHideDuration={0}
            onDismiss={noop}
          />
        </SurfacePanel>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The error surface is dark in both color modes, so measurement keeps MediaTheme on — the regression check for the common path.',
      },
    },
  },
};

// =============================================================================
// Interactive probe
// =============================================================================

const readoutRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  fontFamily: 'var(--font-family-mono, monospace)',
  fontSize: 12,
};

function Swatch({color}: {color: string}) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: 3,
        backgroundColor: color,
        border: '1px solid var(--color-border-subtle)',
        verticalAlign: 'middle',
        marginInlineEnd: 6,
      }}
    />
  );
}

export const Playground: StoryObj = {
  render: function PlaygroundStory() {
    const [surface, setSurface] = useState('#E4E6EB');
    const [text, setText] = useState('#1C2B33');
    const [requested, setRequested] = useState<'dark' | 'light'>('dark');
    const [minContrast, setMinContrast] = useState(3);
    const ref = useRef<HTMLDivElement>(null);
    const contrast = useContrastMode(ref, requested, {
      minContrast,
      watch: [surface, text],
    });

    return (
      <Stack gap={4}>
        <Stack direction="horizontal" gap={4} align="center" wrap="wrap">
          <label style={{fontSize: 13}}>
            Surface{' '}
            <input
              type="color"
              value={surface}
              onChange={e => setSurface(e.target.value)}
            />
          </label>
          <label style={{fontSize: 13}}>
            Ambient text{' '}
            <input
              type="color"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </label>
          <label style={{fontSize: 13}}>
            Requested{' '}
            <select
              value={requested}
              onChange={e =>
                setRequested(e.target.value === 'light' ? 'light' : 'dark')
              }>
              <option value="dark">dark</option>
              <option value="light">light</option>
            </select>
          </label>
          <label style={{fontSize: 13}}>
            Broken below {minContrast.toFixed(1)}{' '}
            <input
              type="range"
              min={1}
              max={7}
              step={0.5}
              value={minContrast}
              onChange={e => setMinContrast(Number(e.target.value))}
            />
          </label>
        </Stack>

        <div
          ref={ref}
          style={
            {
              // The ambient control sets the token children read, not just
              // `color`: Text paints with --color-text-primary.
              '--color-text-primary': text,
              backgroundColor: surface,
              color: text,
              borderRadius: 'var(--radius-container)',
              padding: 16,
              width: 400,
              maxWidth: '100%',
            } as React.CSSProperties
          }>
          <MediaTheme mode={contrast?.mode ?? requested}>
            <Stack direction="horizontal" gap={3} align="center">
              <Text>Your changes were saved</Text>
              <Button label="Undo" variant="ghost" size="sm" />
            </Stack>
          </MediaTheme>
        </div>

        <Stack gap={1} style={{maxWidth: 400}}>
          <div style={readoutRow}>
            <span>surface</span>
            <span>
              <Swatch color={contrast?.background ?? surface} />
              {contrast?.background ?? '—'}
            </span>
          </div>
          <div style={readoutRow}>
            <span>ambient text</span>
            <span>
              <Swatch color={contrast?.foreground ?? text} />
              {contrast?.foreground ?? '—'}
            </span>
          </div>
          <div style={readoutRow}>
            <span>requested ({requested})</span>
            <span>
              {contrast ? `${contrast.requestedRatio.toFixed(2)}:1` : '—'}
            </span>
          </div>
          <div style={readoutRow}>
            <span>ambient</span>
            <span>
              {contrast ? `${contrast.ambientRatio.toFixed(2)}:1` : '—'}
            </span>
          </div>
          <div style={readoutRow}>
            <span>applied</span>
            <span>
              {contrast ? `${contrast.resolvedRatio.toFixed(2)}:1` : '—'}
            </span>
          </div>
          <div style={{...readoutRow, fontWeight: 700}}>
            <span>MediaTheme</span>
            <span>
              {contrast?.mode ?? '—'}
              {contrast?.isCorrected ? ' (corrected)' : ''}
            </span>
          </div>
        </Stack>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The requested mode is what a component asks for; the hook hands it straight back unless the painted surface makes it unreadable. Pale surface + requested `dark` is the bug — watch it correct. Drag "broken below" down to 1 and the guard stops firing entirely: nothing is ever unreadable enough, and the request always stands.',
      },
    },
  },
};
