'use client';

import {XDSCard} from '@xds/core/Card';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';

export default function CardBasicWithLayout() {
  return (
    <XDSCard width={400} height={300}>
      <XDSLayout
        header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
        content={<XDSLayoutContent>Content</XDSLayoutContent>}
        footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
      />
    </XDSCard>
  );
}
