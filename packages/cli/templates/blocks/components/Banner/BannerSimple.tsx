'use client';

import {XDSBanner} from '@xds/core/Banner';

export default function BannerSimple() {
  return <XDSBanner status="info" title="New update available" />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: BannerSimple,
};
