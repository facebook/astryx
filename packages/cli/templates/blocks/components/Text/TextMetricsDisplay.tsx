'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const METRICS = [
  {label: 'Revenue', value: '$1,234,567.89'},
  {label: 'Active users', value: '12,345'},
  {label: 'Conversion', value: '23.4%', color: 'active' as const},
];

export default function TextMetricsDisplay() {
  return (
    <XDSStack direction="horizontal" gap={6}>
      {METRICS.map(({label, value, color}) => (
        <XDSStack key={label} direction="vertical" gap={0}>
          <XDSText type="supporting" color="secondary" display="block">
            {label}
          </XDSText>
          <XDSText
            type="large"
            weight="bold"
            color={color}
            hasTabularNumbers
          >
            {value}
          </XDSText>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
