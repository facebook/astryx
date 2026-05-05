'use client';

import {XDSHStack, XDSStackItem} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

export default function StackItemShowcase() {
  return (
    <XDSHStack gap={3} vAlign="center" width="100%" style={{maxWidth: 500}}>
      <XDSStackItem size="static">
        <XDSCard padding={3}>
          <XDSText type="supporting" color="secondary">
            Static Width
          </XDSText>
        </XDSCard>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <XDSCard padding={3}>
          <XDSText type="supporting" color="secondary">
            Fills remaining space
          </XDSText>
        </XDSCard>
      </XDSStackItem>
      <XDSStackItem size="static">
        <XDSCard padding={3}>
          <XDSText type="supporting" color="secondary">
            Static Width
          </XDSText>
        </XDSCard>
      </XDSStackItem>
    </XDSHStack>
  );
}
