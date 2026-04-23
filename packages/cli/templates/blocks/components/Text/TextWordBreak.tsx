'use client';

import {XDSText} from '@xds/core/Text';

export default function TextWordBreak() {
  return (
    <div style={{display: 'flex', gap: 16, maxWidth: 600}}>
      <div style={{flex: 1}}>
        <XDSText type="label" display="block">
          break-word (default for multi-line):
        </XDSText>
        <div style={{width: 150, border: '1px solid #ccc', padding: 8}}>
          <XDSText type="body" maxLines={2} wordBreak="break-word">
            Thisisaverylongwordthatneedstobreakatwordlevel
          </XDSText>
        </div>
      </div>
      <div style={{flex: 1}}>
        <XDSText type="label" display="block">
          break-all (default for single-line):
        </XDSText>
        <div style={{width: 150, border: '1px solid #ccc', padding: 8}}>
          <XDSText type="body" maxLines={2} wordBreak="break-all">
            Thisisaverylongwordthatneedstobreakatanylevel
          </XDSText>
        </div>
      </div>
    </div>
  );
}
