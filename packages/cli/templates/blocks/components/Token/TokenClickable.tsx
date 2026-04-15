'use client';

import {XDSToken} from '@xds/core/Token';

export default function TokenClickable() {
  return (
    // @ts-expect-error migrated example
    <XDSToken label="Category" onClick={() => navigate('/category')} />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: TokenClickable,
};
