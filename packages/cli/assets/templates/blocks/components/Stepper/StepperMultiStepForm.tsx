// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

export default function StepperMultiStepForm() {
  const [active, setActive] = useState(0);
  return (
    <div style={{width: '100%', maxWidth: 480}}>
      <Stepper
        activeStep={active}
        orientation="vertical"
        onStepClick={setActive}>
        <Step step={0} label="Project details" indicator="number">
          {active === 0 && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <TextInput
                label="Project name"
                placeholder="My awesome project"
                value=""
              />
              <TextInput
                label="Repository URL"
                placeholder="https://github.com/..."
                value=""
              />
              <div>
                <Button
                  label="Continue"
                  variant="primary"
                  onClick={() => setActive(1)}
                />
              </div>
            </div>
          )}
        </Step>
        <Step step={1} label="Environment" indicator="number">
          {active === 1 && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <TextInput label="Node version" placeholder="20" value="" />
              <TextInput
                label="Build command"
                placeholder="npm run build"
                value=""
              />
              <div style={{display: 'flex', gap: 8}}>
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setActive(0)}
                />
                <Button
                  label="Continue"
                  variant="primary"
                  onClick={() => setActive(2)}
                />
              </div>
            </div>
          )}
        </Step>
        <Step step={2} label="Deploy" indicator="number">
          {active === 2 && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <Text type="body">
                Ready to deploy. This creates a production build and pushes to
                your configured hosting.
              </Text>
              <div style={{display: 'flex', gap: 8}}>
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setActive(1)}
                />
                <Button
                  label="Deploy now"
                  variant="primary"
                  onClick={() => setActive(3)}
                />
              </div>
            </div>
          )}
        </Step>
        <Step step={3} label="Done" indicator="number" />
      </Stepper>
    </div>
  );
}
