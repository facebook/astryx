'use client';

import {XDSBanner} from '@xds/core/Banner';

export default function Dismissable() {
  return (
    <XDSBanner
      status="warning"
      title="Your session will expire soon."
      description="Please save your work to avoid losing changes."
      isDismissable
    />
  );
}
