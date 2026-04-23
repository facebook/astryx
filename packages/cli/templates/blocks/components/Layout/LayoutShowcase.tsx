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
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSList, XDSListItem} from '@xds/core/List';

export default function LayoutShowcase() {
  return (
    <XDSLayout
      height="fill"
      header={
        <XDSLayoutHeader hasDivider>
          <XDSHStack gap={2} vAlign="center">
            <XDSHeading level={4}>Projects</XDSHeading>
            <XDSBadge variant="info" label="3 active" />
          </XDSHStack>
        </XDSLayoutHeader>
      }
      start={
        <XDSLayoutPanel hasDivider width={140}>
          <XDSList>
            <XDSListItem label="Dashboard" isSelected />
            <XDSListItem label="Analytics" />
            <XDSListItem label="Settings" />
          </XDSList>
        </XDSLayoutPanel>
      }
      content={
        <XDSLayoutContent>
          <XDSVStack gap={2}>
            <XDSHeading level={5}>Welcome back</XDSHeading>
            <XDSText type="body" color="secondary">
              You have 3 active projects and 2 pending reviews.
            </XDSText>
          </XDSVStack>
        </XDSLayoutContent>
      }
      footer={
        <XDSLayoutFooter hasDivider>
          <XDSHStack gap={2} hAlign="end">
            <XDSButton label="New Project" variant="primary">
              New Project
            </XDSButton>
          </XDSHStack>
        </XDSLayoutFooter>
      }
    />
  );
}
