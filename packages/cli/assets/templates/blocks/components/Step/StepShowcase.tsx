// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {Text} from '@astryxdesign/core/Text';

export default function StepShowcase() {
  const [active, setActive] = useState(2);
  return (
    <div style={{width: '100%', maxWidth: 420}}>
      <Stepper
        activeStep={active}
        orientation="vertical"
        onStepClick={setActive}>
        <Step
          step={0}
          label="Contract signed"
          description="Countersigned by both parties"
          endContent={<Text type="supporting">Mar 4</Text>}
        />
        <Step
          step={1}
          label="Deposit received"
          description="$4,200 cleared"
          endContent={<Text type="supporting">Mar 6</Text>}
        />
        <Step
          step={2}
          label="Onboarding call"
          description="Walk through the workspace setup"
          endContent={<Text type="supporting">Today</Text>}
        />
        <Step
          step={3}
          label="Data migration"
          description="Import records from the old system"
          isOptional
        />
        <Step
          step={4}
          label="Go live"
          description="Switch production traffic"
        />
      </Stepper>
    </div>
  );
}
