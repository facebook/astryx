'use client';

import {XDSCard} from '@xds/core/Card';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading} from '@xds/core/Text';

export default function CardWithInnerLayout() {
  return (
    <XDSCard width={350}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={3}>Card with Layout</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <p style={{margin: 0, fontSize: 14, color: '#666'}}>
              When using XDSLayout inside a card, the layout manages its own
              padding and provides structured header, content, and footer areas.
            </p>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Cancel" variant="secondary" />
              <XDSButton label="Save" variant="primary" />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
