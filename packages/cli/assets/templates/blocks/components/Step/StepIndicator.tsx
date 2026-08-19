// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {Icon} from '@astryxdesign/core/Icon';

export default function StepIndicator() {
  const [active, setActive] = useState(3);
  return (
    <div style={{width: '100%', maxWidth: 400}}>
      <Stepper
        activeStep={active}
        orientation="vertical"
        onStepClick={setActive}>
        <Step
          step={0}
          label="auto"
          description="A number until the step is reached, then a check"
        />
        <Step
          step={1}
          label="number"
          description="Always the numbered badge, even once completed"
          indicator="number"
        />
        <Step
          step={2}
          label="A custom node"
          description="Any ReactNode — here an Icon, tinted by the step state"
          indicator={<Icon icon="wrench" size="sm" />}
        />
        <Step
          step={3}
          label="none"
          description="No indicator at all — just the progress bar and label"
          indicator="none"
        />
      </Stepper>
    </div>
  );
}
