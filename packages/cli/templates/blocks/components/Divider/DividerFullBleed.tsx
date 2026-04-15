'use client';

import {XDSDivider} from '@xds/core/Divider';

export default function DividerFullBleed() {
  return <XDSDivider isFullBleed />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: DividerFullBleed,
};
