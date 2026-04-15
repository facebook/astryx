'use client';

import {XDSToken} from '@xds/core/Token';

export default function TokenAsLink() {
  return (
    <XDSToken label="Profile" href="/user/123" />
  );
}
