// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';

export default function StepperShowcase() {
  const [active, setActive] = useState(2);
  return (
    <div style={{width: '100%', maxWidth: 640}}>
      <Stepper
        activeStep={active}
        orientation="horizontal"
        onStepClick={setActive}>
        <Step step={0} label="Cart" />
        <Step step={1} label="Shipping" />
        <Step step={2} label="Payment" />
        <Step step={3} label="Review" />
        <Step step={4} label="Confirm" />
      </Stepper>
    </div>
  );
}
