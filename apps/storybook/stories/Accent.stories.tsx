// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {Accent} from '@astryxdesign/core/theme';
import {Button} from '@astryxdesign/core/Button';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Stack} from '@astryxdesign/core/Stack';
import {Item} from '@astryxdesign/core/Item';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta = {
  title: 'Core/Accent',
  parameters: {
    docs: {
      description: {
        component:
          'Scoped accent context. `<Accent color="#RRGGBB">` re-derives the ' +
          'accent token family (`--color-accent`, `--color-accent-muted`, ' +
          '`--color-on-accent`, `--color-text-accent`, `--color-icon-accent`) ' +
          'for its subtree via HCT, without building a second theme. ' +
          'Everything that reads accent tokens — primary buttons, accent text, ' +
          'badges, selected items — picks up the new accent automatically.',
      },
    },
  },
};

export default meta;

// =============================================================================
// Shared demo content
// =============================================================================

/**
 * A sampler of accent-token consumers. Rendered inside and outside <Accent>
 * so the re-accenting is obvious:
 * - Primary Button — --color-accent background, --color-on-accent label
 * - Icon color="accent" — --color-accent
 * - Text color="accent" — --color-text-accent
 * - Selected Item — --color-accent-muted background
 *
 * No Badge here on purpose: themes may pin badge variants via component
 * overrides (neutral pins variant:info to blue), and class-based theme
 * overrides win over the token cascade — by design.
 */
function AccentSampler() {
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={2} align="center" wrap="wrap">
        <Button label="Primary action" variant="primary" />
        <Icon icon="info" size="md" color="accent" />
      </Stack>
      <Text color="accent" weight="semibold">
        Accent-colored text
      </Text>
      <Stack gap={1}>
        <Item
          label="Selected item"
          description="Uses the accent-muted background"
          isSelected
          onClick={() => {}}
        />
        <Item
          label="Unselected item"
          description="For comparison"
          onClick={() => {}}
        />
      </Stack>
    </Stack>
  );
}

function DemoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        padding: 16,
        backgroundColor: 'var(--color-background-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-container)',
      }}>
      <Stack gap={3}>
        <Text type="supporting" weight="semibold">
          {title}
        </Text>
        {children}
      </Stack>
    </div>
  );
}

// =============================================================================
// Default — side-by-side with the unwrapped theme accent
// =============================================================================

function DefaultDemo() {
  return (
    <Stack direction="horizontal" gap={3} wrap="wrap">
      <DemoPanel title="Theme accent (unwrapped)">
        <AccentSampler />
      </DemoPanel>
      <DemoPanel title={'Inside <Accent color="#DC2626">'}>
        <Accent color="#DC2626">
          <AccentSampler />
        </Accent>
      </DemoPanel>
    </Stack>
  );
}

export const Default: StoryObj = {
  render: () => <DefaultDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'The same content with and without an `Accent` wrapper. On the ' +
          'right, the primary button, badge, icon, accent text, and selected ' +
          'item all re-accent to the red seed — no theme changes, no prop ' +
          'changes on the components themselves.',
      },
    },
  },
};

// =============================================================================
// Nested — inner Accent wins
// =============================================================================

function NestedDemo() {
  return (
    <Accent color="#7C3AED">
      <DemoPanel title={'Outer <Accent color="#7C3AED">'}>
        <AccentSampler />
        <Accent color="#059669">
          <DemoPanel title={'Inner <Accent color="#059669"> — inner wins'}>
            <AccentSampler />
          </DemoPanel>
        </Accent>
      </DemoPanel>
    </Accent>
  );
}

export const Nested: StoryObj = {
  render: () => <NestedDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Accents nest like any CSS custom property scope: the innermost ' +
          '`Accent` wins for its subtree, while the outer accent continues ' +
          'to apply to everything outside it.',
      },
    },
  },
};

// =============================================================================
// MultiSection — different accent seeds per section
// =============================================================================

const SECTIONS = [
  {
    name: 'Growth',
    seed: '#DC2626',
    blurb: 'Campaigns, funnels, and experiments.',
  },
  {
    name: 'Platform',
    seed: '#0369A1',
    blurb: 'Services, deploys, and infrastructure.',
  },
  {
    name: 'Billing',
    seed: '#059669',
    blurb: 'Invoices, plans, and payouts.',
  },
];

function MultiSectionDemo() {
  return (
    <Stack gap={4}>
      <Text>
        One theme, three product areas — each section re-accents with its own
        seed so users always know which area they are in.
      </Text>
      <Stack direction="horizontal" gap={3} wrap="wrap">
        {SECTIONS.map(({name, seed, blurb}) => (
          <Accent key={name} color={seed}>
            <DemoPanel title={seed}>
              <Stack gap={2}>
                <Heading level={4}>{name}</Heading>
                <Text type="supporting">{blurb}</Text>
              </Stack>
              <Stack gap={1}>
                <Item
                  label="Overview"
                  isSelected
                  startContent={<Icon icon="info" size="sm" color="accent" />}
                  onClick={() => {}}
                />
                <Item label="Reports" onClick={() => {}} />
                <Item label="Settings" onClick={() => {}} />
              </Stack>
              <Stack direction="horizontal" gap={2} align="center">
                <Button label={`Open ${name}`} variant="primary" size="sm" />
                <Button label="Docs" variant="ghost" size="sm" />
              </Stack>
            </DemoPanel>
          </Accent>
        ))}
      </Stack>
    </Stack>
  );
}

export const MultiSection: StoryObj = {
  render: () => <MultiSectionDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'The motivating use-case: a multi-section surface where each ' +
          'section carries its own accent identity. Wrapping each section in ' +
          '`Accent` re-derives the accent family per section — selected ' +
          'items, primary buttons, and badges all follow their section seed.',
      },
    },
  },
};
