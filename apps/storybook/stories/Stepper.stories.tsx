// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Stepper, Step} from '@xds/lab/Stepper';
import {TextInput} from '@xds/core/TextInput';
import {Button} from '@xds/core/Button';
import {Text} from '@xds/core/Text';
import {Icon} from '@xds/core/Icon';

const meta: Meta<typeof Stepper> = {
  title: 'Lab/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    activeStep: {control: {type: 'number', min: 0, max: 5}},
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    density: {control: 'select', options: ['compact', 'balanced', 'spacious']},
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

// ============================================================
// DEFAULT (auto indicator)
// ============================================================

export const Default: Story = {
  name: 'Default',
  render: () => {
    const [active, setActive] = useState(2);
    return (
      <div style={{maxWidth: 400}}>
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step
            step={0}
            label="Create workspace"
            description="Name and configure your workspace"
          />
          <Step
            step={1}
            label="Invite team members"
            description="Add collaborators by email"
          />
          <Step
            step={2}
            label="Set up integrations"
            description="Connect Slack, GitHub, Jira"
          />
          <Step
            step={3}
            label="Import data"
            description="Bring in existing projects"
          />
          <Step
            step={4}
            label="Launch"
            description="Go live with your team"
          />
        </Stepper>
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
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step
            step={0}
            label="Push to main"
            description="Merge your pull request"
            indicator="number"
          />
          <Step
            step={1}
            label="Run CI checks"
            description="Lint, type-check, test"
            indicator="number"
          />
          <Step
            step={2}
            label="Build container"
            description="Docker image to registry"
            indicator="number"
          />
          <Step
            step={3}
            label="Deploy to staging"
            description="Verify in staging environment"
            indicator="number"
          />
          <Step
            step={4}
            label="Promote to production"
            description="Canary → full rollout"
            indicator="number"
          />
        </Stepper>
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
        <Stepper
          activeStep={active}
          orientation="horizontal"
          onStepClick={setActive}>
          <Step step={0} label="Cart" indicator="number" />
          <Step step={1} label="Shipping" indicator="number" />
          <Step step={2} label="Payment" indicator="number" />
          <Step step={3} label="Confirm" indicator="number" />
        </Stepper>
      </div>
    );
  },
};

// ============================================================
// STATUS (semantic color + generic icons — validation flows)
//
// `status` controls color only (accent/success/warning/error). The
// indicator accepts any icon, so validation flows pass an explicit
// <Icon /> rather than relying on a fixed status-driven icon set.
// ============================================================

export const StatusVertical: Story = {
  name: 'Status — Account Verification',
  render: () => {
    const [active, setActive] = useState(3);
    return (
      <div style={{maxWidth: 400}}>
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step
            step={0}
            label="Email verified"
            description="ernesttien@meta.com"
            status="success"
            icon={<Icon icon="check" size="sm" />}
          />
          <Step
            step={1}
            label="Phone verified"
            description="+1 (555) 012-3456"
            status="success"
            icon={<Icon icon="check" size="sm" />}
          />
          <Step
            step={2}
            label="Identity document"
            description="Passport upload failed"
            status="error"
            icon={<Icon icon="warning" size="sm" />}
          />
          <Step
            step={3}
            label="Address verification"
            description="Pending review"
            status="accent"
          />
          <Step
            step={4}
            label="Background check"
            isOptional
            description="Skipped"
          />
          <Step step={5} label="Account activated" />
        </Stepper>
      </div>
    );
  },
};

export const StatusAllStates: Story = {
  name: 'Status — Semantic Colors Reference',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 400}}>
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step
            step={0}
            label="Accent"
            description="--color-accent"
            status="accent"
          />
          <Step
            step={1}
            label="Success"
            description="--color-success"
            status="success"
            icon={<Icon icon="check" size="sm" />}
          />
          <Step
            step={2}
            label="Warning"
            description="--color-warning"
            status="warning"
            icon={<Icon icon="warning" size="sm" />}
          />
          <Step
            step={3}
            label="Error"
            description="--color-error"
            status="error"
            icon={<Icon icon="warning" size="sm" />}
          />
          <Step
            step={4}
            label="Default (no status)"
            description="progress-derived color"
          />
        </Stepper>
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
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step
            step={0}
            label="Phone screen"
            description="30 min with recruiter"
            indicator="none"
          />
          <Step
            step={1}
            label="Technical interview"
            description="1 hour coding session"
            indicator="none"
          />
          <Step
            step={2}
            label="System design"
            description="45 min whiteboard"
            indicator="none"
          />
          <Step
            step={3}
            label="Team match"
            description="Meet potential teammates"
            indicator="none"
          />
          <Step step={4} label="Offer" indicator="none" />
        </Stepper>
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
        <Stepper
          activeStep={active}
          orientation="horizontal"
          onStepClick={setActive}>
          <Step step={0} label="Upload" indicator="none" />
          <Step step={1} label="Details" indicator="none" />
          <Step step={2} label="Audience" indicator="none" />
          <Step step={3} label="Publish" indicator="none" />
        </Stepper>
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
          <Text type="label">Auto (default)</Text>
          <Stepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}>
            <Step step={0} label="Account" />
            <Step step={1} label="Profile" />
            <Step step={2} label="Settings" />
            <Step step={3} label="Review" />
            <Step step={4} label="Done" />
          </Stepper>
        </div>
        <div style={{maxWidth: 280}}>
          <Text type="label">Number</Text>
          <Stepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}>
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Settings" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
            <Step step={4} label="Done" indicator="number" />
          </Stepper>
        </div>
        <div style={{maxWidth: 280}}>
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
              icon={<Icon icon="clock" size="sm" />}
            />
            <Step
              step={4}
              label="Done"
              icon={<Icon icon="check" size="sm" />}
            />
          </Stepper>
        </div>
        <div style={{maxWidth: 280}}>
          <Text type="label">None</Text>
          <Stepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}>
            <Step step={0} label="Account" indicator="none" />
            <Step step={1} label="Profile" indicator="none" />
            <Step step={2} label="Settings" indicator="none" />
            <Step step={3} label="Review" indicator="none" />
            <Step step={4} label="Done" indicator="none" />
          </Stepper>
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
                  Ready to deploy. This will create a production build and push
                  to your configured hosting.
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
          <Text type="label">Compact</Text>
          <Stepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}
            density="compact">
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Payment" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
          </Stepper>
        </div>
        <div style={{maxWidth: 250}}>
          <Text type="label">Balanced</Text>
          <Stepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}
            density="balanced">
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Payment" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
          </Stepper>
        </div>
        <div style={{maxWidth: 250}}>
          <Text type="label">Spacious</Text>
          <Stepper
            activeStep={active}
            orientation="vertical"
            onStepClick={setActive}
            density="spacious">
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Payment" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
          </Stepper>
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
        <Stepper
          activeStep={active}
          orientation="horizontal"
          onStepClick={setActive}>
          <Step step={0} label="Before" />
          <Step step={1} label="After" />
        </Stepper>
      </div>
    );
  },
};

export const ManySteps: Story = {
  name: 'Edge — Seven Steps (Horizontal)',
  render: () => {
    const [active, setActive] = useState(3);
    return (
      <Stepper
        activeStep={active}
        orientation="horizontal"
        onStepClick={setActive}>
        <Step step={0} label="Idea" indicator="number" />
        <Step step={1} label="Design" indicator="number" />
        <Step step={2} label="Build" indicator="number" />
        <Step step={3} label="Test" indicator="number" />
        <Step step={4} label="Review" indicator="number" />
        <Step step={5} label="Deploy" indicator="number" />
        <Step step={6} label="Monitor" indicator="number" />
      </Stepper>
    );
  },
};

export const DisabledSteps: Story = {
  name: 'Edge — Disabled Steps',
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <div style={{maxWidth: 400}}>
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step step={0} label="Basic info" />
          <Step step={1} label="Permissions" />
          <Step
            step={2}
            label="Admin settings"
            description="Requires admin role"
            isDisabled
          />
          <Step step={3} label="Confirm" />
        </Stepper>
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
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step step={0} label="Basic profile" />
          <Step
            step={1}
            label="Profile photo"
            isOptional
            description="Skipped"
          />
          <Step step={2} label="Connect socials" isOptional />
          <Step step={3} label="Preferences" />
          <Step step={4} label="All done" />
        </Stepper>
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
        <Stepper
          activeStep={active}
          orientation="vertical"
          onStepClick={setActive}>
          <Step
            step={0}
            label="Configure your development environment"
            description="Install dependencies, set up local database, configure environment variables"
          />
          <Step
            step={1}
            label="Create initial data migration"
            description="Define schema, seed data, and run migrations against staging"
          />
          <Step
            step={2}
            label="Submit for code review"
            description="Open pull request and address reviewer feedback"
          />
        </Stepper>
      </div>
    );
  },
};
