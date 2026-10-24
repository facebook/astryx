// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {Stack} from '@astryxdesign/core/Stack';
import {Badge} from '@astryxdesign/core/Badge';
import {Heading, Text} from '@astryxdesign/core/Text';
import {neutralTheme} from '@astryxdesign/theme-neutral';

const meta: Meta = {
  title: 'Core/Themes/Dynamic Type',
};

export default meta;

const dynamicTypeTheme = defineTheme({
  name: 'neutral-dynamic-type',
  extends: neutralTheme,
  typography: {dynamicType: true},
});

/**
 * On iPhone and iPad, a theme with `typography.dynamicType` follows the
 * reader's text size (Settings › Display & Text Size › Larger Text): every
 * size grows or shrinks on the curve of the iOS text style it plays. At the
 * default size, and in every other browser, these are the theme's own sizes.
 */
export const DynamicType: StoryObj = {
  render: function DynamicTypeStory() {
    const [category, setCategory] = React.useState<string | null>(null);
    React.useEffect(() => {
      const html = document.documentElement;
      const read = () =>
        setCategory(html.getAttribute('data-astryx-text-size'));
      read();
      const observer = new MutationObserver(read);
      observer.observe(html, {
        attributes: true,
        attributeFilter: ['data-astryx-text-size'],
      });
      return () => observer.disconnect();
    }, []);
    return (
      <Theme theme={dynamicTypeTheme}>
        <Stack direction="vertical" gap={3} style={{padding: 16}}>
          <Text type="supporting" data-testid="text-size-category">
            Text size: {category ?? 'not set (not iOS)'}
          </Text>
          <Heading level={1} type="display-1">
            Display 1
          </Heading>
          <Heading level={1}>Heading 1</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Text type="large">Large text</Text>
          <Text type="body">
            Body text follows the size the reader picked in Settings.
          </Text>
          <Text type="supporting">Supporting text and timestamps</Text>
          <Stack direction="horizontal" gap={2} data-testid="badges">
            <Badge label="Ready" />
            <Badge variant="success" label="Shipped" />
          </Stack>
        </Stack>
      </Theme>
    );
  },
};
