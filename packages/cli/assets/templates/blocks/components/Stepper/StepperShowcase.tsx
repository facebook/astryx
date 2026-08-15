// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/lab';

export default function StepperShowcase() {
  const [active, setActive] = useState(2);
  return (
    <div style={{width: '100%', maxWidth: 640}}>
      <Stepper
        activeStep={active}
        orientation="horizontal"
        indicatorPosition="on-track"
        onStepClick={setActive}>
        <Step step={0} label="Cart" indicator="number" />
        <Step step={1} label="Shipping" indicator="number" />
        <Step step={2} label="Payment" indicator="number" />
        <Step step={3} label="Review" indicator="number" />
        <Step step={4} label="Confirm" indicator="number" />
      </Stepper>
    </div>
  );
}
