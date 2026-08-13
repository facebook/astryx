// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/lab';

export default function StepperHorizontal() {
  const [active, setActive] = useState(1);
  return (
    <div style={{width: '100%', maxWidth: 600}}>
      <Stepper
        activeStep={active}
        orientation="horizontal"
        onStepClick={setActive}>
        <Step step={0} label="Workspace" />
        <Step step={1} label="Team" />
        <Step step={2} label="Integrations" />
        <Step step={3} label="Import" />
        <Step step={4} label="Launch" />
      </Stepper>
    </div>
  );
}
