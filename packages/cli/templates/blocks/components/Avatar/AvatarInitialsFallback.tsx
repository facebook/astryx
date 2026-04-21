'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const NAMES = [
  {name: 'John Doe', note: 'First + last'},
  {name: 'Alice', note: 'Single name'},
  {name: 'Bob Smith Johnson', note: 'Multi-word'},
  {name: 'Dr. Sarah Connor', note: 'Prefixed'},
];

export default function AvatarInitialsFallback() {
  return (
    <XDSStack direction="horizontal" gap={6} vAlign="center">
      {NAMES.map(({name, note}) => (
        <XDSStack key={name} direction="vertical" gap={2} hAlign="center">
          <XDSAvatar name={name} size="medium" />
          <XDSText type="supporting" color="secondary">
            {note}
          </XDSText>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
