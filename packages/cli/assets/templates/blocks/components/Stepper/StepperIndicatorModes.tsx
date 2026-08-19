// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';

export default function StepperIndicatorModes() {
  const [active, setActive] = useState(2);
  return (
    <div style={{display: 'flex', gap: 48, flexWrap: 'wrap'}}>
      <div style={{maxWidth: 220}}>
        <Text type="label">Auto</Text>
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step step={0} label="Account" />
          <Step step={1} label="Profile" />
          <Step step={2} label="Settings" />
          <Step step={3} label="Review" />
        </Stepper>
      </div>
      <div style={{maxWidth: 220}}>
        <Text type="label">Number</Text>
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step step={0} label="Account" indicator="number" />
          <Step step={1} label="Profile" indicator="number" />
          <Step step={2} label="Settings" indicator="number" />
          <Step step={3} label="Review" indicator="number" />
        </Stepper>
      </div>
      <div style={{maxWidth: 220}}>
        <Text type="label">Custom icon</Text>
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step
            step={0}
            label="Account"
            icon={<Icon icon="info" size="sm" />}
          />
          <Step
            step={1}
            label="Profile"
            icon={<Icon icon="search" size="sm" />}
          />
          <Step
            step={2}
            label="Settings"
            icon={<Icon icon="wrench" size="sm" />}
          />
          <Step
            step={3}
            label="Review"
            icon={<Icon icon="check" size="sm" />}
          />
        </Stepper>
      </div>
    </div>
  );
}
