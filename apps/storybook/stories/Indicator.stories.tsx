// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState, type ReactNode} from 'react';
import {
  CheckboxIndicator,
  CheckIndicator,
  RadioIndicator,
} from '@astryxdesign/core/Indicator';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';

/**
 * Indicators are the componentized selection visuals shared by CheckboxInput,
 * RadioList, Selector and menu selection rows. They are decorative: the owning
 * component keeps the input, role, accessible name, focus and keyboard
 * behavior, while the indicator turns `state` into a picture.
 *
 * These stories render them directly, which no other story file does — every
 * other one reaches an indicator through a host. That matters for the
 * `children` slot in particular: it is the path a host uses to show a pending
 * Spinner, and it had no rendered coverage anywhere until this file existed.
 */
const meta: Meta<typeof CheckIndicator> = {
  title: 'Core/Indicator',
  component: CheckIndicator,
  parameters: {layout: 'padded'},
  tags: ['autodocs'],
};

export default meta;
// Keyed to the component, not to `meta`, matching the other 122 story files —
// `StoryObj<typeof meta>` would require `args` on every render-only story, and
// `state` is required on an indicator.
type Story = StoryObj<typeof CheckIndicator>;

const cellStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 40,
  minHeight: 32,
} as const;

function Row({label, children}: {label: string; children: ReactNode}) {
  return (
    <HStack gap={4} vAlign="center">
      <span style={{minWidth: 260}}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </span>
      {children}
    </HStack>
  );
}

/** Every indicator, in every state its family defines. */
export const AllStates: Story = {
  render: () => (
    <VStack gap={4}>
      <Row label="CheckIndicator — unchecked, checked">
        <span style={cellStyle}>
          <CheckIndicator state="unchecked" />
        </span>
        <span style={cellStyle}>
          <CheckIndicator state="checked" />
        </span>
      </Row>
      <Row label="CheckboxIndicator — unchecked, checked, indeterminate">
        <span style={cellStyle}>
          <CheckboxIndicator state="unchecked" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="indeterminate" />
        </span>
      </Row>
      <Row label="RadioIndicator — unchecked, checked">
        <span style={cellStyle}>
          <RadioIndicator state="unchecked" />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" />
        </span>
      </Row>
    </VStack>
  ),
};

/** Both control sizes, side by side. */
export const Sizes: Story = {
  render: () => (
    <VStack gap={4}>
      <Row label="sm">
        <span style={cellStyle}>
          <CheckIndicator state="checked" size="sm" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" size="sm" />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" size="sm" />
        </span>
      </Row>
      <Row label="md (default)">
        <span style={cellStyle}>
          <CheckIndicator state="checked" size="md" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" size="md" />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" size="md" />
        </span>
      </Row>
    </VStack>
  ),
};

/** Disabled is purely visual — the owner keeps the real disabled semantics. */
export const Disabled: Story = {
  render: () => (
    <VStack gap={4}>
      <Row label="disabled — unchecked">
        <span style={cellStyle}>
          <CheckIndicator state="unchecked" isDisabled />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="unchecked" isDisabled />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="unchecked" isDisabled />
        </span>
      </Row>
      <Row label="disabled — checked">
        <span style={cellStyle}>
          <CheckIndicator state="checked" isDisabled />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" isDisabled />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" isDisabled />
        </span>
      </Row>
    </VStack>
  ),
};

/**
 * The `children` slot, and the reason it needs a story.
 *
 * A host shows a pending change by passing a Spinner through `children`, and
 * the idiom it writes is `children={isBusy && <Spinner/>}`. When `isBusy` is
 * false that passes `false` — which is neither `null` nor caught by `??`. Every
 * indicator used to take the children path on it, render nothing there, and
 * DELETE its state mark (#4893).
 *
 * Read the first column: each cell must still show its mark. Only the second
 * column should show a spinner in place of one.
 */
export const BusyChildren: Story = {
  render: () => {
    const idiom = (isBusy: boolean) =>
      isBusy && <Spinner size="sm" shade="inherit" />;

    return (
      <VStack gap={4}>
        <Text type="supporting" color="secondary">
          Column 1 keeps its mark (children renders nothing). Column 2 shows the
          spinner instead of the mark.
        </Text>
        <Row label="CheckIndicator — checked">
          <span style={cellStyle}>
            <CheckIndicator state="checked">{idiom(false)}</CheckIndicator>
          </span>
          <span style={cellStyle}>
            <CheckIndicator state="checked">{idiom(true)}</CheckIndicator>
          </span>
        </Row>
        <Row label="CheckboxIndicator — checked">
          <span style={cellStyle}>
            <CheckboxIndicator state="checked">
              {idiom(false)}
            </CheckboxIndicator>
          </span>
          <span style={cellStyle}>
            <CheckboxIndicator state="checked">{idiom(true)}</CheckboxIndicator>
          </span>
        </Row>
        <Row label="CheckboxIndicator — indeterminate">
          <span style={cellStyle}>
            <CheckboxIndicator state="indeterminate">
              {idiom(false)}
            </CheckboxIndicator>
          </span>
          <span style={cellStyle}>
            <CheckboxIndicator state="indeterminate">
              {idiom(true)}
            </CheckboxIndicator>
          </span>
        </Row>
        <Row label="RadioIndicator — checked">
          <span style={cellStyle}>
            <RadioIndicator state="checked">{idiom(false)}</RadioIndicator>
          </span>
          <span style={cellStyle}>
            <RadioIndicator state="checked">{idiom(true)}</RadioIndicator>
          </span>
        </Row>
      </VStack>
    );
  },
};

/**
 * A live toggle of the same idiom: flip busy and the spinner replaces the mark,
 * flip it back and the mark returns. Before #4893 the mark did not come back —
 * it never rendered in the first place.
 */
export const BusyToggle: Story = {
  render: function BusyToggleStory() {
    const [isBusy, setIsBusy] = useState(false);
    const busy = isBusy && <Spinner size="sm" shade="inherit" />;

    return (
      <VStack gap={4}>
        <label>
          <input
            type="checkbox"
            checked={isBusy}
            onChange={e => setIsBusy(e.target.checked)}
          />{' '}
          <Text type="supporting">isBusy</Text>
        </label>
        <HStack gap={4} vAlign="center">
          <span style={cellStyle}>
            <CheckIndicator state="checked">{busy}</CheckIndicator>
          </span>
          <span style={cellStyle}>
            <CheckboxIndicator state="checked">{busy}</CheckboxIndicator>
          </span>
          <span style={cellStyle}>
            <RadioIndicator state="checked">{busy}</RadioIndicator>
          </span>
        </HStack>
      </VStack>
    );
  },
};
