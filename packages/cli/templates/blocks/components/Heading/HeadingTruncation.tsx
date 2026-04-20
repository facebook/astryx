'use client';

import {XDSHeading} from '@xds/core/Text';

export default function HeadingTruncation() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <div style={{width: 300, border: '1px solid #ccc', padding: 12}}>
        <XDSHeading level={2} maxLines={1}>
          Very Long Heading That Will Be Truncated To One Line With Ellipsis
        </XDSHeading>
      </div>
      <div style={{width: 300, border: '1px solid #ccc', padding: 12}}>
        <XDSHeading level={2} maxLines={2}>
          Very Long Heading That Will Be Truncated To Two Lines To Keep Card
          Layout Compact
        </XDSHeading>
      </div>
    </div>
  );
}
