'use client';

import {XDSBadge} from '@xds/core/Badge';

export default function BadgeTextBadge() {
  return <XDSBadge label="Default" />;
}

export const showcase = {
  aspectRatio: 1,
  render: BadgeTextBadge,
};
