// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';

export default function StepContent() {
  const [active, setActive] = useState(1);
  return (
    <div style={{width: '100%', maxWidth: 440}}>
      <Stepper
        activeStep={active}
        orientation="vertical"
        onStepClick={setActive}>
        <Step step={0} label="Build" description="Compiled in 42s">
          {active === 0 && (
            <Text type="supporting">
              1,204 modules bundled. No warnings reported.
            </Text>
          )}
        </Step>
        <Step step={1} label="Review" description="Two approvals required">
          {active === 1 && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              <Text type="supporting">
                Approved by Dana Whitfield. Waiting on one more reviewer before
                this can ship.
              </Text>
              <div>
                <Button
                  label="Request review"
                  variant="secondary"
                  onClick={() => setActive(2)}
                />
              </div>
            </div>
          )}
        </Step>
        <Step step={2} label="Deploy" description="Rolls out to production">
          {active === 2 && (
            <Text type="supporting">
              Deploys behind a feature flag, then ramps to 100% over an hour.
            </Text>
          )}
        </Step>
      </Stepper>
    </div>
  );
}
