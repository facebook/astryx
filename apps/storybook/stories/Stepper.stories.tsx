// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSStepper, XDSStep, XDSStepStatus} from '@xds/lab/Stepper';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSStepper> = {
  title: 'Lab/Stepper',
  component: XDSStepper,
  tags: ['autodocs'],
  argTypes: {
    activeStep: {control: {type: 'number', min: 0, max: 5}},
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    density: {control: 'select', options: ['compact', 'balanced', 'spacious']},
  },
};

export default meta;
type Story = StoryObj<typeof XDSStepper>;

// ============================================================
// DEFAULT (auto indicator)
// ============================================================

export const Default: Story = {
  name: 'Default',
  render: () => {
    const [active, setActive] = useState(2);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep
            step={0}
            label="Create workspace"
            description="Name and configure your workspace"
          />
          <XDSStep
            step={1}
            label="Invite team members"
            description="Add collaborators by email"
          />
          <XDSStep
            step={2}
            label="Set up integrations"
            description="Connect Slack, GitHub, Jira"
          />
          <XDSStep
            step={3}
            label="Import data"
            description="Bring in existing projects"
          />
          <XDSStep
            step={4}
            label="Launch"
            description="Go live with your team"
          />
        </XDSStepper>
      </div>
    );
  },
};

export const DefaultHorizontal: Story = {
  name: 'Default — Horizontal',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 700}}>
        <XDSStepper
          activeStep={active}
          orientation="horizontal"
          onStepClick={setActive}>
          <XDSStep step={0} label="Workspace" />
          <XDSStep step={1} label="Team" />
          <XDSStep step={2} label="Integrations" />
          <XDSStep step={3} label="Import" />
          <XDSStep step={4} label="Launch" />
        </XDSStepper>
      </div>
    );
  },
};

// ============================================================
// NUMBERED (always number — procedural flows)
// ============================================================

export const NumberedVertical: Story = {
  name: 'Numbered — Deploy Pipeline',
  render: () => {
    const [active, setActive] = useState(2);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep
            step={0}
            label="Push to main"
            description="Merge your pull request"
            indicator="number"
          />
          <XDSStep
            step={1}
            label="Run CI checks"
            description="Lint, type-check, test"
            indicator="number"
          />
          <XDSStep
            step={2}
            label="Build container"
            description="Docker image to registry"
            indicator="number"
          />
          <XDSStep
            step={3}
            label="Deploy to staging"
            description="Verify in staging environment"
            indicator="number"
          />
          <XDSStep
            step={4}
            label="Promote to production"
            description="Canary → full rollout"
            indicator="number"
          />
        </XDSStepper>
      </div>
    );
  },
};

export const NumberedHorizontal: Story = {
  name: 'Numbered — Horizontal Checkout',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 600}}>
        <XDSStepper
          activeStep={active}
          orientation="horizontal"
          onStepClick={setActive}>
          <XDSStep step={0} label="Cart" indicator="number" />
          <XDSStep step={1} label="Shipping" indicator="number" />
          <XDSStep step={2} label="Payment" indicator="number" />
          <XDSStep step={3} label="Confirm" indicator="number" />
        </XDSStepper>
      </div>
    );
  },
};

// ============================================================
// STATUS (always status icons — validation flows)
// ============================================================

export const StatusVertical: Story = {
  name: 'Status — Account Verification',
  render: () => {
    const [active, setActive] = useState(3);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep
            step={0}
            label="Email verified"
            description="ernesttien@meta.com"
            indicator="status"
            status={XDSStepStatus.Completed}
          />
          <XDSStep
            step={1}
            label="Phone verified"
            description="+1 (555) 012-3456"
            indicator="status"
            status={XDSStepStatus.Completed}
          />
          <XDSStep
            step={2}
            label="Identity document"
            description="Passport upload failed"
            indicator="status"
            status={XDSStepStatus.Error}
          />
          <XDSStep
            step={3}
            label="Address verification"
            description="Pending review"
            indicator="status"
            status={XDSStepStatus.InProgress}
          />
          <XDSStep
            step={4}
            label="Background check"
            indicator="status"
            isOptional
            status={XDSStepStatus.Skipped}
          />
          <XDSStep
            step={5}
            label="Account activated"
            indicator="status"
            status={XDSStepStatus.NotStarted}
          />
        </XDSStepper>
      </div>
    );
  },
};

export const StatusAllStates: Story = {
  name: 'Status — All States Reference',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep
            step={0}
            label="Completed"
            description="Finished successfully"
            indicator="status"
            status={XDSStepStatus.Completed}
          />
          <XDSStep
            step={1}
            label="In Progress"
            description="Currently active"
            indicator="status"
            status={XDSStepStatus.InProgress}
          />
          <XDSStep
            step={2}
            label="Not Started"
            description="Pending"
            indicator="status"
            status={XDSStepStatus.NotStarted}
          />
          <XDSStep
            step={3}
            label="Error"
            description="Requires attention"
            indicator="status"
            status={XDSStepStatus.Error}
          />
          <XDSStep
            step={4}
            label="Warning"
            description="Needs review"
            indicator="status"
            status={XDSStepStatus.Warning}
          />
          <XDSStep
            step={5}
            label="Skipped"
            description="Intentionally bypassed"
            indicator="status"
            status={XDSStepStatus.Skipped}
          />
        </XDSStepper>
      </div>
    );
  },
};

// ============================================================
// MINIMAL (no indicator — content-focused)
// ============================================================

export const MinimalVertical: Story = {
  name: 'Minimal — Interview Process',
  render: () => {
    const [active, setActive] = useState(2);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep
            step={0}
            label="Phone screen"
            description="30 min with recruiter"
            indicator="none"
          />
          <XDSStep
            step={1}
            label="Technical interview"
            description="1 hour coding session"
            indicator="none"
          />
          <XDSStep
            step={2}
            label="System design"
            description="45 min whiteboard"
            indicator="none"
          />
          <XDSStep
            step={3}
            label="Team match"
            description="Meet potential teammates"
            indicator="none"
          />
          <XDSStep step={4} label="Offer" indicator="none" />
        </XDSStepper>
      </div>
    );
  },
};

export const MinimalHorizontal: Story = {
  name: 'Minimal — Video Upload',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 500}}>
        <XDSStepper
          activeStep={active}
          orientation="horizontal"
          onStepClick={setActive}>
          <XDSStep step={0} label="Upload" indicator="none" />
          <XDSStep step={1} label="Details" indicator="none" />
          <XDSStep step={2} label="Audience" indicator="none" />
          <XDSStep step={3} label="Publish" indicator="none" />
        </XDSStepper>
      </div>
    );
  },
};

// ============================================================
// INDICATOR COMPARISON
// ============================================================

export const IndicatorComparison: Story = {
  name: 'Indicator Modes — Side by Side',
  render: () => {
    const [active, setActive] = useState(2);
    return (
      <div style={{display: 'flex', gap: 48}}>
        <div style={{maxWidth: 280}}>
          <XDSText type="label">Auto (default)</XDSText>
          <XDSStepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}>
            <XDSStep step={0} label="Account" />
            <XDSStep step={1} label="Profile" />
            <XDSStep step={2} label="Settings" />
            <XDSStep step={3} label="Review" />
            <XDSStep step={4} label="Done" />
          </XDSStepper>
        </div>
        <div style={{maxWidth: 280}}>
          <XDSText type="label">Number</XDSText>
          <XDSStepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}>
            <XDSStep step={0} label="Account" indicator="number" />
            <XDSStep step={1} label="Profile" indicator="number" />
            <XDSStep step={2} label="Settings" indicator="number" />
            <XDSStep step={3} label="Review" indicator="number" />
            <XDSStep step={4} label="Done" indicator="number" />
          </XDSStepper>
        </div>
        <div style={{maxWidth: 280}}>
          <XDSText type="label">Status</XDSText>
          <XDSStepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}>
            <XDSStep step={0} label="Account" indicator="status" />
            <XDSStep step={1} label="Profile" indicator="status" />
            <XDSStep step={2} label="Settings" indicator="status" />
            <XDSStep step={3} label="Review" indicator="status" />
            <XDSStep step={4} label="Done" indicator="status" />
          </XDSStepper>
        </div>
        <div style={{maxWidth: 280}}>
          <XDSText type="label">None</XDSText>
          <XDSStepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}>
            <XDSStep step={0} label="Account" indicator="none" />
            <XDSStep step={1} label="Profile" indicator="none" />
            <XDSStep step={2} label="Settings" indicator="none" />
            <XDSStep step={3} label="Review" indicator="none" />
            <XDSStep step={4} label="Done" indicator="none" />
          </XDSStepper>
        </div>
      </div>
    );
  },
};

// ============================================================
// WITH CONTENT SLOT
// ============================================================

export const WithContentSlot: Story = {
  name: 'With Content — Multi-Step Form',
  render: () => {
    const [active, setActive] = useState(0);
    return (
      <div style={{maxWidth: 480}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep step={0} label="Project details" indicator="number">
            {active === 0 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <XDSTextInput
                  label="Project name"
                  placeholder="My awesome project"
                />
                <XDSTextInput
                  label="Repository URL"
                  placeholder="https://github.com/..."
                />
                <div>
                  <XDSButton
                    label="Continue"
                    variant="primary"
                    onClick={() => setActive(1)}
                  />
                </div>
              </div>
            )}
          </XDSStep>
          <XDSStep step={1} label="Environment" indicator="number">
            {active === 1 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <XDSTextInput label="Node version" placeholder="20" />
                <XDSTextInput
                  label="Build command"
                  placeholder="npm run build"
                />
                <div style={{display: 'flex', gap: 8}}>
                  <XDSButton
                    label="Back"
                    variant="secondary"
                    onClick={() => setActive(0)}
                  />
                  <XDSButton
                    label="Continue"
                    variant="primary"
                    onClick={() => setActive(2)}
                  />
                </div>
              </div>
            )}
          </XDSStep>
          <XDSStep step={2} label="Deploy" indicator="number">
            {active === 2 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <XDSText type="body">
                  Ready to deploy. This will create a production build and push
                  to your configured hosting.
                </XDSText>
                <div style={{display: 'flex', gap: 8}}>
                  <XDSButton
                    label="Back"
                    variant="secondary"
                    onClick={() => setActive(1)}
                  />
                  <XDSButton
                    label="Deploy now"
                    variant="primary"
                    onClick={() => setActive(3)}
                  />
                </div>
              </div>
            )}
          </XDSStep>
          <XDSStep step={3} label="Done" indicator="number" />
        </XDSStepper>
      </div>
    );
  },
};

// ============================================================
// DENSITY
// ============================================================

export const DensityComparison: Story = {
  name: 'Density — Compact / Balanced / Spacious',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{display: 'flex', gap: 48}}>
        <div style={{maxWidth: 250}}>
          <XDSText type="label">Compact</XDSText>
          <XDSStepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}
            density="compact">
            <XDSStep step={0} label="Account" indicator="number" />
            <XDSStep step={1} label="Profile" indicator="number" />
            <XDSStep step={2} label="Payment" indicator="number" />
            <XDSStep step={3} label="Review" indicator="number" />
          </XDSStepper>
        </div>
        <div style={{maxWidth: 250}}>
          <XDSText type="label">Balanced</XDSText>
          <XDSStepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}
            density="balanced">
            <XDSStep step={0} label="Account" indicator="number" />
            <XDSStep step={1} label="Profile" indicator="number" />
            <XDSStep step={2} label="Payment" indicator="number" />
            <XDSStep step={3} label="Review" indicator="number" />
          </XDSStepper>
        </div>
        <div style={{maxWidth: 250}}>
          <XDSText type="label">Spacious</XDSText>
          <XDSStepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}
            density="spacious">
            <XDSStep step={0} label="Account" indicator="number" />
            <XDSStep step={1} label="Profile" indicator="number" />
            <XDSStep step={2} label="Payment" indicator="number" />
            <XDSStep step={3} label="Review" indicator="number" />
          </XDSStepper>
        </div>
      </div>
    );
  },
};

// ============================================================
// EDGE CASES
// ============================================================

export const TwoSteps: Story = {
  name: 'Edge — Two Steps',
  render: () => {
    const [active, setActive] = useState(0);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="horizontal"
          onStepClick={setActive}>
          <XDSStep step={0} label="Before" />
          <XDSStep step={1} label="After" />
        </XDSStepper>
      </div>
    );
  },
};

export const ManySteps: Story = {
  name: 'Edge — Seven Steps (Horizontal)',
  render: () => {
    const [active, setActive] = useState(3);
    return (
      <XDSStepper
        activeStep={active}
        orientation="horizontal"
        onStepClick={setActive}>
        <XDSStep step={0} label="Idea" indicator="number" />
        <XDSStep step={1} label="Design" indicator="number" />
        <XDSStep step={2} label="Build" indicator="number" />
        <XDSStep step={3} label="Test" indicator="number" />
        <XDSStep step={4} label="Review" indicator="number" />
        <XDSStep step={5} label="Deploy" indicator="number" />
        <XDSStep step={6} label="Monitor" indicator="number" />
      </XDSStepper>
    );
  },
};

export const DisabledSteps: Story = {
  name: 'Edge — Disabled Steps',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep step={0} label="Basic info" />
          <XDSStep step={1} label="Permissions" />
          <XDSStep
            step={2}
            label="Admin settings"
            description="Requires admin role"
            isDisabled
          />
          <XDSStep step={3} label="Confirm" />
        </XDSStepper>
      </div>
    );
  },
};

export const OptionalSteps: Story = {
  name: 'Edge — Optional + Skipped',
  render: () => {
    const [active, setActive] = useState(3);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep step={0} label="Basic profile" />
          <XDSStep
            step={1}
            label="Profile photo"
            isOptional
            status={XDSStepStatus.Skipped}
          />
          <XDSStep step={2} label="Connect socials" isOptional />
          <XDSStep step={3} label="Preferences" />
          <XDSStep step={4} label="All done" />
        </XDSStepper>
      </div>
    );
  },
};

export const LongLabels: Story = {
  name: 'Edge — Long Labels & Descriptions',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 400}}>
        <XDSStepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <XDSStep
            step={0}
            label="Configure your development environment"
            description="Install dependencies, set up local database, configure environment variables"
          />
          <XDSStep
            step={1}
            label="Create initial data migration"
            description="Define schema, seed data, and run migrations against staging"
          />
          <XDSStep
            step={2}
            label="Submit for code review"
            description="Open pull request and address reviewer feedback"
          />
        </XDSStepper>
      </div>
    );
  },
};
