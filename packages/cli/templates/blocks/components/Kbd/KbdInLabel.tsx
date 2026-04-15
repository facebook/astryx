'use client';

import {XDSKbd} from '@xds/core/Kbd';

export default function KbdInLabel() {
  return (
    <span>
      Search <XDSKbd keys="mod+k" />
    </span>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: KbdInLabel,
};
