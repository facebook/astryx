'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeCountBadge() {
  return <XDSBadge variant="info" label={42} />;
}

export const showcase = {
  aspectRatio: 1,
  render: BadgeCountBadge,
};
