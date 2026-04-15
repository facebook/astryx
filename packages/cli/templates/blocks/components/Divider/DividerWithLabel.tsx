'use client';

import {XDSDivider} from '@xds/core/Divider';

export default function DividerWithLabel() {
  return <XDSDivider label="or" />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: DividerWithLabel,
};
