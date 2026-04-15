'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';

export default function LayoutBasicPage() {
  return (
    <XDSLayout
      header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
      content={<XDSLayoutContent>Body content</XDSLayoutContent>}
      footer={<XDSLayoutFooter hasDivider>Footer</XDSLayoutFooter>}
    />
  );
}
