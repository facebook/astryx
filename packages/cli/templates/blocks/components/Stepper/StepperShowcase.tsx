// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSStepper, XDSStep} from '@xds/core/Stepper';

export default function StepperShowcase() {
  return (
    <XDSStepper activeStep={1}>
      <XDSStep step={0} label="Account" />
      <XDSStep step={1} label="Profile" />
      <XDSStep step={2} label="Review" />
    </XDSStepper>
  );
}
