'use client';

import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';

export default function LayoutContentOnlyLayout() {
  return (
    <XDSCard width={400} height={250}>
      <XDSLayout
        content={
          <XDSLayoutContent>
            <div style={{fontWeight: 600, fontSize: 18, marginBottom: 12}}>
              Simple Content
            </div>
            <p style={{fontSize: 14, lineHeight: 1.5, margin: 0}}>
              A layout can have just content without header or footer. This is
              useful for simple cards or content blocks that don't need
              structured sections.
            </p>
          </XDSLayoutContent>
        }
      />
    </XDSCard>
  );
}
