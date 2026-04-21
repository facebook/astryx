'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';

export default function CodeInstructionalText() {
  return (
    <XDSVStack gap={4}>
      <XDSText type="body">
        Install the package with <XDSCode>npm install @xds/core</XDSCode>, then
        import the component:
      </XDSText>
      <XDSText type="body">
        Add <XDSCode>{'<XDSButton label="Save">Save</XDSButton>'}</XDSCode> to
        your JSX. The <XDSCode>label</XDSCode> prop is required for
        accessibility.
      </XDSText>
    </XDSVStack>
  );
}
