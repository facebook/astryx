// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';

export default function StepperStatus() {
  const [active, setActive] = useState(3);
  return (
    <div style={{width: '100%', maxWidth: 400}}>
      <Stepper
        activeStep={active}
        orientation="vertical"
        onStepClick={setActive}>
        <Step
          step={0}
          label="Email verified"
          description="you@example.com"
          status="success"
        />
        <Step
          step={1}
          label="Phone verified"
          description="+1 (555) 012-3456"
          status="success"
        />
        <Step
          step={2}
          label="Identity document"
          description="Passport upload failed"
          status="error"
        />
        <Step
          step={3}
          label="Address verification"
          description="Pending review"
          status="accent"
        />
        <Step
          step={4}
          label="Background check"
          isOptional
          description="Skipped"
        />
        <Step step={5} label="Account activated" />
      </Stepper>
    </div>
  );
}
