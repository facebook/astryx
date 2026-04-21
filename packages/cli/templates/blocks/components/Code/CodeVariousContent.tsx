'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';

export default function CodeVariousContent() {
  return (
    <XDSVStack gap={3}>
      <XDSText type="body">
        Variable: <XDSCode>const count = 0</XDSCode>
      </XDSText>
      <XDSText type="body">
        Terminal: <XDSCode>yarn build --watch</XDSCode>
      </XDSText>
      <XDSText type="body">
        CSS property: <XDSCode>border-radius: 8px</XDSCode>
      </XDSText>
      <XDSText type="body">
        File path: <XDSCode>packages/core/src/CodeBlock/XDSCode.tsx</XDSCode>
      </XDSText>
      <XDSText type="body">
        Keyboard shortcut: <XDSCode>Ctrl+Shift+P</XDSCode>
      </XDSText>
    </XDSVStack>
  );
}
