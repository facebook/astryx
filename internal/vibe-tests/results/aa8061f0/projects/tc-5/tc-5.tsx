// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {Theme} from '@astryxdesign/core/Theme';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';

const customTheme = defineTheme({
  components: {
    card: {
      base: {
        borderRadius: '16px',
        borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
        borderWidth: '2px',
        borderStyle: 'solid',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
      },
    },
  },
});

export default function CustomCard() {
  return (
    <Theme theme={customTheme}>
      <Card padding={5}>
        <VStack gap={2}>
          <Heading level={2}>Custom Themed Card</Heading>
          <Text color="secondary">This card uses a gradient border and increased shadow via defineTheme.</Text>
        </VStack>
      </Card>
    </Theme>
  );
}
