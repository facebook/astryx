// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Stepper, Step} from '@xds/lab/Stepper';
import {TextInput} from '@xds/core/TextInput';
import {Button} from '@xds/core/Button';
import {Text} from '@xds/core/Text';

const meta: Meta<typeof Stepper> = {
  title: 'Lab/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    activeStep: {
      control: {type: 'number', min: 0, max: 4},
      description: 'Zero-based index of the active step',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  args: {activeStep: 1},
  render: args => (
    <Stepper activeStep={args.activeStep} orientation={args.orientation}>
      <Step step={0} label="Account" />
      <Step step={1} label="Profile" />
      <Step step={2} label="Review" />
    </Stepper>
  ),
};

export const AllCompleted: Story = {
  render: () => (
    <Stepper activeStep={3}>
      <Step step={0} label="Account" />
      <Step step={1} label="Profile" />
      <Step step={2} label="Review" />
    </Stepper>
  ),
};

export const FirstStep: Story = {
  render: () => (
    <Stepper activeStep={0}>
      <Step step={0} label="Account" />
      <Step step={1} label="Profile" />
      <Step step={2} label="Review" />
    </Stepper>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <Stepper activeStep={1}>
      <Step step={0} label="Account" description="Create your account" />
      <Step step={1} label="Profile" description="Set up your profile" />
      <Step step={2} label="Review" description="Review and confirm" />
    </Stepper>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{maxWidth: 400}}>
      <Stepper activeStep={1} orientation="vertical">
        <Step step={0} label="Account" description="Create your account" />
        <Step step={1} label="Profile" description="Set up your profile" />
        <Step step={2} label="Review" description="Review and confirm" />
      </Stepper>
    </div>
  ),
};

export const NonLinear: Story = {
  name: 'Non-Linear (Clickable)',
  render: () => {
    const [activeStep, setActiveStep] = useState(1);
    return (
      <Stepper activeStep={activeStep} onStepClick={setActiveStep}>
        <Step step={0} label="Account" />
        <Step step={1} label="Profile" />
        <Step step={2} label="Review" />
      </Stepper>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <Stepper activeStep={1}>
      <Step step={0} label="Account" />
      <Step step={1} label="Profile" hasError />
      <Step step={2} label="Review" />
    </Stepper>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Stepper activeStep={1}>
      <Step step={0} label="Account" />
      <Step step={1} label="Profile" />
      <Step step={2} label="Review" isDisabled />
    </Stepper>
  ),
};

export const FiveSteps: Story = {
  render: () => (
    <Stepper activeStep={2}>
      <Step step={0} label="Cart" />
      <Step step={1} label="Shipping" />
      <Step step={2} label="Payment" />
      <Step step={3} label="Review" />
      <Step step={4} label="Confirm" />
    </Stepper>
  ),
};

export const VerticalNonLinear: Story = {
  name: 'Vertical Non-Linear',
  render: () => {
    const [activeStep, setActiveStep] = useState(2);
    return (
      <div style={{maxWidth: 400}}>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          onStepClick={setActiveStep}>
          <Step step={0} label="Account" description="Create your account" />
          <Step step={1} label="Profile" description="Set up your profile" />
          <Step step={2} label="Review" description="Review and confirm" />
          <Step step={3} label="Done" description="All finished!" />
        </Stepper>
      </div>
    );
  },
};

export const VerticalWithContent: Story = {
  name: 'Vertical with Content',
  render: () => {
    const [activeStep, setActiveStep] = useState(1);
    return (
      <div style={{maxWidth: 480}}>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step step={0} label="Account" description="Create your account">
            {activeStep === 0 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  value=""
                />
                <TextInput
                  label="Password"
                  placeholder="••••••••"
                  value=""
                />
                <div>
                  <Button
                    label="Continue"
                    variant="primary"
                    onClick={() => setActiveStep(1)}
                  />
                </div>
              </div>
            )}
          </Step>
          <Step
            step={1}
            label="Profile"
            description="Tell us about yourself">
            {activeStep === 1 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <TextInput
                  label="Full name"
                  placeholder="Jane Doe"
                  value=""
                />
                <TextInput
                  label="Company"
                  placeholder="Acme Inc."
                  value=""
                />
                <TextInput label="Role" placeholder="Engineer" value="" />
                <div style={{display: 'flex', gap: 8}}>
                  <Button
                    label="Back"
                    variant="secondary"
                    onClick={() => setActiveStep(0)}
                  />
                  <Button
                    label="Continue"
                    variant="primary"
                    onClick={() => setActiveStep(2)}
                  />
                </div>
              </div>
            )}
          </Step>
          <Step step={2} label="Review" description="Confirm your details">
            {activeStep === 2 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <Text type="body">
                  Review your account details and click Finish to complete
                  setup.
                </Text>
                <div style={{display: 'flex', gap: 8}}>
                  <Button
                    label="Back"
                    variant="secondary"
                    onClick={() => setActiveStep(1)}
                  />
                  <Button
                    label="Finish"
                    variant="primary"
                    onClick={() => setActiveStep(3)}
                  />
                </div>
              </div>
            )}
          </Step>
        </Stepper>
      </div>
    );
  },
};
