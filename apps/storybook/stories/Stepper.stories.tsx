// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSStepper, XDSStep} from '@xds/core/Stepper';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSStepper> = {
  title: 'Core/Navigation/Stepper',
  component: XDSStepper,
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
type Story = StoryObj<typeof XDSStepper>;

export const Default: Story = {
  args: {activeStep: 1},
  render: args => (
    <XDSStepper activeStep={args.activeStep} orientation={args.orientation}>
      <XDSStep step={0} label="Account" />
      <XDSStep step={1} label="Profile" />
      <XDSStep step={2} label="Review" />
    </XDSStepper>
  ),
};

export const AllCompleted: Story = {
  render: () => (
    <XDSStepper activeStep={3}>
      <XDSStep step={0} label="Account" />
      <XDSStep step={1} label="Profile" />
      <XDSStep step={2} label="Review" />
    </XDSStepper>
  ),
};

export const FirstStep: Story = {
  render: () => (
    <XDSStepper activeStep={0}>
      <XDSStep step={0} label="Account" />
      <XDSStep step={1} label="Profile" />
      <XDSStep step={2} label="Review" />
    </XDSStepper>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <XDSStepper activeStep={1}>
      <XDSStep step={0} label="Account" description="Create your account" />
      <XDSStep step={1} label="Profile" description="Set up your profile" />
      <XDSStep step={2} label="Review" description="Review and confirm" />
    </XDSStepper>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{maxWidth: 400}}>
      <XDSStepper activeStep={1} orientation="vertical">
        <XDSStep step={0} label="Account" description="Create your account" />
        <XDSStep step={1} label="Profile" description="Set up your profile" />
        <XDSStep step={2} label="Review" description="Review and confirm" />
      </XDSStepper>
    </div>
  ),
};

export const NonLinear: Story = {
  name: 'Non-Linear (Clickable)',
  render: () => {
    const [activeStep, setActiveStep] = useState(1);
    return (
      <XDSStepper activeStep={activeStep} onStepClick={setActiveStep}>
        <XDSStep step={0} label="Account" />
        <XDSStep step={1} label="Profile" />
        <XDSStep step={2} label="Review" />
      </XDSStepper>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <XDSStepper activeStep={1}>
      <XDSStep step={0} label="Account" />
      <XDSStep step={1} label="Profile" hasError />
      <XDSStep step={2} label="Review" />
    </XDSStepper>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <XDSStepper activeStep={1}>
      <XDSStep step={0} label="Account" />
      <XDSStep step={1} label="Profile" />
      <XDSStep step={2} label="Review" isDisabled />
    </XDSStepper>
  ),
};

export const FiveSteps: Story = {
  render: () => (
    <XDSStepper activeStep={2}>
      <XDSStep step={0} label="Cart" />
      <XDSStep step={1} label="Shipping" />
      <XDSStep step={2} label="Payment" />
      <XDSStep step={3} label="Review" />
      <XDSStep step={4} label="Confirm" />
    </XDSStepper>
  ),
};

export const VerticalNonLinear: Story = {
  name: 'Vertical Non-Linear',
  render: () => {
    const [activeStep, setActiveStep] = useState(2);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={activeStep}
          orientation="vertical"
          onStepClick={setActiveStep}>
          <XDSStep step={0} label="Account" description="Create your account" />
          <XDSStep step={1} label="Profile" description="Set up your profile" />
          <XDSStep step={2} label="Review" description="Review and confirm" />
          <XDSStep step={3} label="Done" description="All finished!" />
        </XDSStepper>
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
        <XDSStepper activeStep={activeStep} orientation="vertical">
          <XDSStep step={0} label="Account" description="Create your account">
            {activeStep === 0 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <XDSTextInput label="Email" placeholder="you@example.com" />
                <XDSTextInput label="Password" placeholder="••••••••" />
                <div>
                  <XDSButton
                    label="Continue"
                    variant="primary"
                    onClick={() => setActiveStep(1)}
                  />
                </div>
              </div>
            )}
          </XDSStep>
          <XDSStep
            step={1}
            label="Profile"
            description="Tell us about yourself">
            {activeStep === 1 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <XDSTextInput label="Full name" placeholder="Jane Doe" />
                <XDSTextInput label="Company" placeholder="Acme Inc." />
                <XDSTextInput label="Role" placeholder="Engineer" />
                <div style={{display: 'flex', gap: 8}}>
                  <XDSButton
                    label="Back"
                    variant="secondary"
                    onClick={() => setActiveStep(0)}
                  />
                  <XDSButton
                    label="Continue"
                    variant="primary"
                    onClick={() => setActiveStep(2)}
                  />
                </div>
              </div>
            )}
          </XDSStep>
          <XDSStep step={2} label="Review" description="Confirm your details">
            {activeStep === 2 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <XDSText type="body">
                  Review your account details and click Finish to complete
                  setup.
                </XDSText>
                <div style={{display: 'flex', gap: 8}}>
                  <XDSButton
                    label="Back"
                    variant="secondary"
                    onClick={() => setActiveStep(1)}
                  />
                  <XDSButton
                    label="Finish"
                    variant="primary"
                    onClick={() => setActiveStep(3)}
                  />
                </div>
              </div>
            )}
          </XDSStep>
        </XDSStepper>
      </div>
    );
  },
};
