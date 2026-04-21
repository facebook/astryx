'use client';

import {XDSText} from '@xds/core/Text';

export default function TextMetricsDisplay() {
  return (
    <div style={{display: 'flex', gap: 24}}>
      <div style={{textAlign: 'start'}}>
        <XDSText type="body" color="secondary" display="block">
          Revenue
        </XDSText>
        <XDSText type="large" weight="bold" hasTabularNumbers>
          $1,234,567.89
        </XDSText>
      </div>
      <div style={{textAlign: 'start'}}>
        <XDSText type="body" color="secondary" display="block">
          Users
        </XDSText>
        <XDSText type="large" weight="bold" hasTabularNumbers>
          12,345
        </XDSText>
      </div>
      <div style={{textAlign: 'start'}}>
        <XDSText type="body" color="secondary" display="block">
          Conversion
        </XDSText>
        <XDSText type="large" weight="bold" color="active" hasTabularNumbers>
          23.4%
        </XDSText>
      </div>
    </div>
  );
}
