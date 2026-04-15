'use client';

import {XDSCenter} from '@xds/core/Center';

export default function CenterBothAxes() {
  return (
    <XDSCenter width={300} height={200}>
      <div>Centered content</div>
    </XDSCenter>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: CenterBothAxes,
};
