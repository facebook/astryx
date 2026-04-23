'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const NUMBERS = ['1,234.56', '78.90', '100,000.00'];

export default function TextTabularNumbers() {
  return (
    <XDSStack direction="horizontal" gap={6}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Proportional
        </XDSText>
        {NUMBERS.map(n => (
          <XDSText key={n} type="body" display="block">
            {n}
          </XDSText>
        ))}
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Tabular
        </XDSText>
        {NUMBERS.map(n => (
          <XDSText key={n} type="body" display="block" hasTabularNumbers>
            {n}
          </XDSText>
        ))}
      </XDSStack>
    </XDSStack>
  );
}
