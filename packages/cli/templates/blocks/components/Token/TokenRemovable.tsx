'use client';

import {XDSToken} from '@xds/core/Token';

const handleRemove = () => {};

export default function TokenRemovable() {
  return <XDSToken label="Filter" onRemove={handleRemove} />;
}

export const showcase = {
  aspectRatio: 1,
  render: TokenRemovable,
};
