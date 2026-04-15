'use client';

import {XDSToken} from '@xds/core/Token';

const handleRemove = () => {};

export default function TokenRemovable() {
  return (
    // @ts-expect-error migrated example
    <XDSToken label="Filter" onRemove={(e) => handleRemove(e)} />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: TokenRemovable,
};
