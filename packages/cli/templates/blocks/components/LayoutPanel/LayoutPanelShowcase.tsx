'use client';

import {
  XDSLayout,
  XDSLayoutPanel,
  XDSLayoutContent,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSList, XDSListItem} from '@xds/core/List';

export default function LayoutPanelShowcase() {
  return (
    <XDSLayout
      height="fill"
      start={
        <XDSLayoutPanel hasDivider width={180} role="navigation">
          <XDSList>
            <XDSListItem label="Overview" isSelected />
            <XDSListItem label="Analytics" />
            <XDSListItem label="Reports" />
            <XDSListItem label="Settings" />
          </XDSList>
        </XDSLayoutPanel>
      }
      content={
        <XDSLayoutContent role="main">
          <XDSVStack gap={2}>
            <XDSHeading level={5}>Overview</XDSHeading>
            <XDSText type="body" color="secondary">
              The side panel provides persistent navigation alongside the
              content area.
            </XDSText>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
