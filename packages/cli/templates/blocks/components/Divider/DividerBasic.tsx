'use client';

import {XDSDivider} from '@xds/core/Divider';

export default function DividerBasic() {
  return <XDSDivider />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: DividerBasic,
};
