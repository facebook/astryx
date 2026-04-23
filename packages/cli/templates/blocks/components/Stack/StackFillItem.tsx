'use client';

import {XDSStack, XDSStackItem} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSAvatar} from '@xds/core/Avatar';

const USERS = [
  {name: 'Olivia Chen', role: 'Engineering Lead'},
  {name: 'Marcus Rivera', role: 'Product Designer'},
  {name: 'Aisha Patel', role: 'Marketing Manager'},
];

export default function StackFillItem() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {USERS.map(user => (
        <XDSStack
          key={user.name}
          direction="horizontal"
          gap={3}
          vAlign="center">
          <XDSStackItem size="static">
            <XDSAvatar name={user.name} size="small" />
          </XDSStackItem>
          <XDSStackItem size="fill">
            <XDSStack direction="vertical" gap={0}>
              <XDSText type="body" weight="bold">
                {user.name}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {user.role}
              </XDSText>
            </XDSStack>
          </XDSStackItem>
          <XDSStackItem size="static">
            <XDSButton label="View" variant="secondary" size="sm" />
          </XDSStackItem>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
