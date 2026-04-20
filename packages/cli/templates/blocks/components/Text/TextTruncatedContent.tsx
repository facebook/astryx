'use client';

import {XDSText} from '@xds/core/Text';

export default function TextTruncatedContent() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 300,
      }}>
      <div>
        <XDSText type="label" display="block">
          1 Line:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: 8}}>
          <XDSText type="body" maxLines={1}>
            This is a very long text that will be truncated to one line with
            ellipsis.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          2 Lines:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: 8}}>
          <XDSText type="body" maxLines={2}>
            This is a very long text that will be truncated to two lines. The
            second line will end with an ellipsis if the content is too long.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          3 Lines:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: 8}}>
          <XDSText type="body" maxLines={3}>
            This is a very long text that will be truncated to three lines. It
            allows for more content to be shown but still limits the vertical
            space. The third line will end with an ellipsis.
          </XDSText>
        </div>
      </div>
    </div>
  );
}
