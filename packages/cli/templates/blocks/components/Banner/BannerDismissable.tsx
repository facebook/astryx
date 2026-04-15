'use client';

import {XDSBanner} from '@xds/core/Banner';

export default function BannerDismissable() {
  return (
    <XDSBanner
      status="error"
      title="Something went wrong"
      description="Please try again later."
      isDismissable
      onDismiss={() => console.log('dismissed')}
    />
  );
}
