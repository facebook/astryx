'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

export default function CodeAcrossTextSizes() {
  return (
    <XDSStack gap="sm">
      <XDSText type="heading3">
        Heading with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="body">
        Body text with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="detail">
        Detail text with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="label">
        Label text with <XDSCode>inline code</XDSCode>
      </XDSText>
    </XDSStack>
  );
}
