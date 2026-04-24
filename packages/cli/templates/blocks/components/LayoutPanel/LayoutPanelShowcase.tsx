'use client';

import {
  XDSLayout,
  XDSLayoutPanel,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
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
          <XDSCard variant="muted" padding={3}>
            <XDSText type="supporting" color="secondary">
              Content area
            </XDSText>
          </XDSCard>
        </XDSLayoutContent>
      }
    />
  );
}
