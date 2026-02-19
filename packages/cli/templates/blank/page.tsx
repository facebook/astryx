'use client';

import {XDSLayout, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';

export default function Page() {
  return (
    <XDSLayout
      content={
        <XDSLayoutContent>
          <XDSText type="large">New Page</XDSText>
        </XDSLayoutContent>
      }
    />
  );
}
