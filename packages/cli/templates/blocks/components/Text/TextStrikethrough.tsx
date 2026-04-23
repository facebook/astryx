'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

export default function TextStrikethrough() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="body" display="block">
        Regular body text without strikethrough
      </XDSText>
      <XDSText type="body" display="block" hasStrikethrough>
        Body text with strikethrough applied
      </XDSText>
    </XDSStack>
  );
}
