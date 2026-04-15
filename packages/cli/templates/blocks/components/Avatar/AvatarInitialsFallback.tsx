'use client';

import {XDSAvatar} from '@xds/core/Avatar';

export default function AvatarInitialsFallback() {
  return <XDSAvatar name="Jane Smith" size="large" />;
}

export const showcase = {
  aspectRatio: 1,
  render: AvatarInitialsFallback,
};
