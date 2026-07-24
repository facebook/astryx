// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Badge} from '@astryxdesign/core/Badge';

const brutalistTheme = defineTheme({
  name: 'brutalist',
  color: {
    accent: '#000000',
    neutralStyle: 'neutral',
    contrast: 'high',
  },
  radius: {
    base: 0,
    multiplier: 0,
  },
  tokens: {
    '--color-background': ['#FFFFFF', '#000000'],
    '--color-text': ['#000000', '#FFFFFF'],
    '--color-border': ['#000000', '#FFFFFF'],
    '--color-accent': ['#000000', '#FFFFFF'],
  },
  components: {
    button: {
      'variant:primary': {
        borderWidth: '3px',
        borderColor: '#000000',
        fontWeight: '900',
        textTransform: 'uppercase',
      },
      'variant:secondary': {
        borderWidth: '3px',
        borderColor: '#000000',
        fontWeight: '900',
        textTransform: 'uppercase',
      },
    },
    card: {
      borderWidth: '3px',
      borderColor: '#000000',
    },
  },
});

export function BrutalistDemo() {
  return (
    <div data-theme={brutalistTheme}>
      <Stack gap={4} padding={6}>
        <Heading level={1}>BRUTALIST ASTRYX</Heading>
        <Text>Zero radius. High contrast. Bold borders. Nothing else.</Text>
        <Stack direction="row" gap={3}>
          <Button label="PRIMARY ACTION" variant="primary" />
          <Button label="SECONDARY" variant="secondary" />
          <Button label="GHOST" variant="ghost" />
        </Stack>
        <Card padding={4}>
          <Stack gap={3}>
            <Heading level={3}>CARD ELEMENT</Heading>
            <Text>Content with bold borders and no rounded corners.</Text>
            <Badge label="BRUTALIST" />
          </Stack>
        </Card>
        <TextInput label="INPUT FIELD" placeholder="Type here..." />
      </Stack>
    </div>
  );
}

export default BrutalistDemo;
