'use client';

import {
  XDSLayout,
  XDSLayoutPanel,
  XDSLayoutContent,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSCard,
} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSList, XDSListItem} from '@xds/core/List';

export default function LayoutPanelShowcase() {
  return (
    <XDSCenter width={400}>
      <XDSLayout
        style={{width: '100%'}}
        height="fill"
        header={
          <XDSLayoutHeader hasDivider>
            <XDSCard variant="muted" />
          </XDSLayoutHeader>
        }
        start={
          <XDSLayoutPanel hasDivider width={140} role="navigation">
            <XDSList>
              <XDSListItem label="Overview" isSelected />
              <XDSListItem label="Analytics" />
              <XDSListItem label="Reports" />
              <XDSListItem label="Settings" />
            </XDSList>
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <XDSCard variant="muted" />
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSCard variant="muted" />
          </XDSLayoutFooter>
        }
      />
    </XDSCenter>
  );
}
