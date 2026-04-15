'use client';

import {XDSToken} from '@xds/core/Token';

export default function TokenClickable() {
  return (
    <XDSToken
      label="Category"
      onClick={() => {
        window.location.href = '/category';
      }}
    />
  );
}
