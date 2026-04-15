'use client';

import {XDSDivider} from '@xds/core/Divider';

export default function DividerStrongVariant() {
  return <XDSDivider variant="strong" />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: DividerStrongVariant,
};
