'use client';

import {XDSHStack, XDSStackItem} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

export default function StackItemShowcase() {
  return (
    <XDSHStack gap={3} vAlign="center">
      <XDSStackItem size="static">
        <XDSCard variant="muted" padding={3}>
          <XDSText type="supporting" color="secondary">
            Static
          </XDSText>
        </XDSCard>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <XDSCard variant="muted" padding={3}>
          <XDSText type="supporting" color="secondary">
            Fills remaining space
          </XDSText>
        </XDSCard>
      </XDSStackItem>
      <XDSStackItem size="static">
        <XDSCard variant="muted" padding={3}>
          <XDSText type="supporting" color="secondary">
            Static
          </XDSText>
        </XDSCard>
      </XDSStackItem>
    </XDSHStack>
  );
}
