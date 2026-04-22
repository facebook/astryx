'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSSection} from '@xds/core/Section';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function LayoutFullBleedContent() {
  return (
    <XDSCard>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={4}>Full Bleed Example</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent padding={0}>
            <XDSSection variant="wash">
              <XDSText type="body">
                XDSSection automatically escapes the parent container padding
                to fill edge-to-edge. Useful for wash backgrounds, tables, or
                images that need to span the full width.
              </XDSText>
            </XDSSection>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Close" variant="secondary">
                Close
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
