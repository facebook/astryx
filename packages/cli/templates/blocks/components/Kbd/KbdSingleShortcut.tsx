'use client';

import {XDSKbd} from '@xds/core/Kbd';

export default function KbdSingleShortcut() {
  return <XDSKbd keys="mod+k" />;
}

export const showcase = {
  aspectRatio: 1,
  render: KbdSingleShortcut,
};
