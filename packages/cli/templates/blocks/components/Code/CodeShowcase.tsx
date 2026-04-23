'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';

export default function CodeShowcase() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="body">
        Run <XDSCode>npm install @xds/core</XDSCode> to add the package.
      </XDSText>
      <XDSText type="body">
        Use the <XDSCode>variant</XDSCode> prop to switch between{' '}
        <XDSCode>primary</XDSCode>, <XDSCode>secondary</XDSCode>, and{' '}
        <XDSCode>ghost</XDSCode> styles.
      </XDSText>
    </XDSStack>
  );
}
