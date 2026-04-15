'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';

export default function CodeBlockInlineCodeInText() {
  return (
    <XDSText type="body">
      Use <XDSCode>const</XDSCode> for block-scoped declarations.
    </XDSText>
  );
}
