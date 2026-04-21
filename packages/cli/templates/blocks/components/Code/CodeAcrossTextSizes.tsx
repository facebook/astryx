'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';

export default function CodeAcrossTextSizes() {
  return (
    <XDSVStack gap={3}>
      <XDSHeading level={3}>
        Heading with <XDSCode>inline code</XDSCode>
      </XDSHeading>
      <XDSText type="body">
        Body text with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="supporting">
        Supporting text with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="label">
        Label text with <XDSCode>inline code</XDSCode>
      </XDSText>
    </XDSVStack>
  );
}
