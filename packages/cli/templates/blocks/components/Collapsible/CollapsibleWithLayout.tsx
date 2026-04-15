'use client';

import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSLayout, XDSLayoutContent, XDSLayoutFooter} from '@xds/core/Layout';

export default function CollapsibleWithLayout() {
  return (
    <XDSCard>
      <XDSCollapsible trigger="Report Details" value="report">
        <XDSLayout
          content={<XDSLayoutContent>Report body</XDSLayoutContent>}
          footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
        />
      </XDSCollapsible>
    </XDSCard>
  );
}
