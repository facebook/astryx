'use client';

import {XDSToken} from '@xds/core/Token';

export default function TokenColored() {
  return (
    <XDSToken label="Status" color="green" />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: TokenColored,
};
