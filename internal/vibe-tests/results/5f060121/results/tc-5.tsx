// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineTheme} from '@astryxdesign/core/theme';
import {Theme} from '@astryxdesign/core/Theme';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

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
      <div className="p-8">
        <Card padding={5}>
          <div className="flex flex-col gap-3">
            <Heading level={2}>Custom Themed Card</Heading>
            <Text color="secondary">This card uses a gradient border and increased shadow via defineTheme.</Text>
          </div>
        </Card>
      </div>
    </Theme>
  );
}
