// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Stepper, Step} from '@astryxdesign/core/Stepper';

export default function StepStates() {
  // activeStep is fixed here so each Step lands on a different state.
  return (
    <div style={{width: '100%', maxWidth: 400}}>
      <Stepper activeStep={2} orientation="vertical" onStepClick={() => {}}>
        <Step
          step={0}
          label="Completed"
          description="Behind activeStep — indicator resolves to a check"
        />
        <Step
          step={1}
          label="Completed with a warning"
          description="Progress and status are separate axes"
          status="warning"
        />
        <Step
          step={2}
          label="Current"
          description="Matches activeStep — carries aria-current"
        />
        <Step
          step={3}
          label="Upcoming"
          description="Ahead of activeStep — indicator resolves to its number"
        />
        <Step
          step={4}
          label="Disabled"
          description="Not clickable and skipped in the tab order"
          isDisabled
        />
      </Stepper>
    </div>
  );
}
