'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutPanel,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSList, XDSListItem} from '@xds/core/List';

export default function LayoutSidebarLayout() {
  return (
    <XDSCard>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={4}>Settings</XDSHeading>
          </XDSLayoutHeader>
        }
        start={
          <XDSLayoutPanel hasDivider role="navigation" width={140}>
            <XDSList>
              <XDSListItem label="General" isSelected />
              <XDSListItem label="Account" />
              <XDSListItem label="Privacy" />
              <XDSListItem label="Notifications" />
              <XDSListItem label="Security" />
            </XDSList>
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap={3}>
              <XDSHeading level={5}>General Settings</XDSHeading>
              <XDSText type="body">
                Configure your general preferences here. The sidebar navigation
                allows you to switch between different settings sections.
              </XDSText>
            </XDSVStack>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Reset" variant="secondary">
                Reset
              </XDSButton>
              <XDSButton label="Save Changes" variant="primary">
                Save Changes
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
