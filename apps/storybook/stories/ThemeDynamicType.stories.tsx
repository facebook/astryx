// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import {y2kTheme} from '@astryxdesign/theme-y2k';

const meta: Meta = {
  title: 'Core/Themes/Dynamic Type',
};

export default meta;

const dynamicTypeTheme = defineTheme({
  name: 'neutral-dynamic-type',
  extends: neutralTheme,
  typography: {dynamicType: true},
});

// Y2K fixes supporting text at 12px rather than reading a step of its scale.
const fixedSizeTheme = defineTheme({
  name: 'y2k-dynamic-type',
  extends: y2kTheme,
  typography: {dynamicType: true},
});

// When this page was loaded: it changes only on a reload, so a text size
// change that restyles the page while it stays open leaves it alone.
const LOADED_AT = new Date().toLocaleTimeString('en-US', {hour12: false});

// The readout is instrumentation rather than sample text, so it keeps one
// small fixed size at every text size.
const readoutStyle: React.CSSProperties = {
  font: '12px/16px system-ui, sans-serif',
  color: '#555',
};

/**
 * The samples, in `theme`, under a readout of the reader's category; without
 * `headings`, only the text sizes, so the page fits on a phone at AX5.
 */
function DynamicTypeSamples({
  theme,
  headings = true,
}: {
  theme: React.ComponentProps<typeof Theme>['theme'];
  headings?: boolean;
}) {
  const [category, setCategory] = React.useState<string | null>(null);
  React.useEffect(() => {
    const html = document.documentElement;
    const read = () => setCategory(html.getAttribute('data-astryx-text-size'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-astryx-text-size'],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <Theme theme={theme}>
      <Stack direction="vertical" gap={3} style={{padding: 16}}>
        <div style={readoutStyle}>
          <span data-testid="text-size-category">
            Text size: {category ?? 'not reported by this browser'}
          </span>
          {' · '}
          <span data-testid="page-loaded-at">page loaded at {LOADED_AT}</span>
        </div>
        {headings && (
          <>
            <Heading level={1} type="display-1">
              Display 1
            </Heading>
            <Heading level={1}>Heading 1</Heading>
            <Heading level={2}>Heading 2</Heading>
            <Heading level={3}>Heading 3</Heading>
          </>
        )}
        <Text type="body">Body text</Text>
        <Text type="supporting">Supporting text</Text>
      </Stack>
    </Theme>
  );
}

/**
 * On iPhone and iPad, a theme with `typography.dynamicType` follows the
 * reader's text size (Settings › Display & Text Size › Larger Text): every
 * size grows or shrinks on the curve of the iOS text style it plays. At the
 * default size, and wherever the browser does not expose the reader's text
 * size (`font: -apple-system-body`), these are the theme's own sizes.
 * Change the text size with this page open: it restyles in place, and the
 * time it was loaded stays the same.
 */
export const DynamicType: StoryObj = {
  render: () => <DynamicTypeSamples theme={dynamicTypeTheme} />,
};

/**
 * Y2K fixes supporting text at 12px instead of reading a step of its type
 * scale. A size a theme fixes at a length scales on the curve of the step it
 * reads by default, so here supporting text follows the reader like Footnote
 * rather than staying 12px while the rest grows.
 */
export const FixedSupportingSize: StoryObj = {
  render: () => <DynamicTypeSamples theme={fixedSizeTheme} headings={false} />,
};
