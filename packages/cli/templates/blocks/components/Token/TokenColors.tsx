'use client';

import {XDSToken} from '@xds/core/Token';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const COLORS = [
  {color: 'default' as const, label: 'Default'},
  {color: 'red' as const, label: 'Red'},
  {color: 'orange' as const, label: 'Orange'},
  {color: 'yellow' as const, label: 'Yellow'},
  {color: 'green' as const, label: 'Green'},
  {color: 'teal' as const, label: 'Teal'},
  {color: 'cyan' as const, label: 'Cyan'},
  {color: 'blue' as const, label: 'Blue'},
  {color: 'purple' as const, label: 'Purple'},
  {color: 'pink' as const, label: 'Pink'},
  {color: 'gray' as const, label: 'Gray'},
];

export default function TokenColors() {
  return (
    <XDSStack
      direction="vertical"
      gap={10}
      width="100%"
      style={{maxWidth: 400}}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
        <XDSStack direction="horizontal" gap={1} wrap="wrap">
          {COLORS.map(({color, label}) => (
            <XDSToken key={color} label={label} color={color} />
          ))}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Disabled
        </XDSText>
        <XDSStack direction="horizontal" gap={1} wrap="wrap">
          {COLORS.map(({color, label}) => (
            <XDSToken key={color} label={label} color={color} isDisabled />
          ))}
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
