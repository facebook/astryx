// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ToggleButtonDisabledA11y.stories.tsx
 * @input Uses ToggleButton and ToggleButtonGroup from core
 * @output The four disabled/enabled fixtures the ToggleButton disabled-state
 *   regression spec drives in a real browser.
 * @position The reproduction path for
 *   `packages/core/src/ToggleButton/__tests__/ToggleButton.a11y.chromium.spec.ts`
 *   (`docs/specs/AST-009/spec.md` FR30: a browser claim is checked against a
 *   checked-in story, not a page a test builds and throws away).
 *
 * Each story counts its own activations and publishes the count as
 * `data-a11y-activations`, so a person opening the story reads the same number
 * the spec does. A toggle that refuses a press leaves no trace on itself, so
 * counting the handler is the only honest way to ask whether pressing it did
 * anything.
 *
 * The two disabled fixtures cover the two halves of `docs/families/buttons.md`
 * FR3 that regressed together: a member's own disabled state must survive an
 * enabled group, and a disabled toggle kept focusable by a tooltip must still
 * refuse a pointer press. The two enabled fixtures are the control — they fail
 * if a fix over-disables.
 *
 * SYNC: The spec navigates to these story ids by name. Nothing at compile time
 *   catches a renamed export — the Chromium spec does, when it finds no story.
 */

import {useState, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ToggleButton, ToggleButtonGroup} from '@astryxdesign/core/ToggleButton';

/** Render one fixture and count how many times its handler ran. */
function Counted({
  children,
}: {
  children: (activate: () => void) => ReactNode;
}): ReactNode {
  const [count, setCount] = useState(0);
  return (
    <div data-a11y-activations={count}>
      {children(() => {
        setCount(current => current + 1);
      })}
      <p>
        activations: <output>{count}</output>
      </p>
    </div>
  );
}

const meta: Meta = {
  title: 'a11y/ToggleButton disabled state',
  // These fixtures exist to be DRIVEN by the regression spec, not photographed:
  // a disabled control inside an enabled group is a state no product ships on
  // purpose, so a baseline frame would be a picture nobody reviews. Excluding
  // them costs no coverage — every one is still driven in a real browser.
  tags: ['no-visual'],
  parameters: {
    docs: {
      description: {
        component:
          'Disabled-state fixtures for ToggleButton and ToggleButtonGroup. Each story counts its own activations, because a toggle that refuses a press leaves no trace of having been pressed.',
      },
    },
  },
};

export default meta;

/**
 * A member that disables itself, inside a group that does not disable anything.
 * The group must not hand the member its availability back.
 */
export const GroupEnabledMemberDisabled: StoryObj = {
  name: 'group enabled — member disabled',
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Counted>
        {activate => (
          <ToggleButtonGroup
            label="View mode"
            value={value}
            onChange={next => {
              activate();
              setValue(next);
            }}>
            <ToggleButton value="list" label="List" isDisabled />
            <ToggleButton value="grid" label="Grid" />
          </ToggleButtonGroup>
        )}
      </Counted>
    );
  },
};

/**
 * The other half of the same rule: a group that disables everything still
 * disables a member that says nothing about its own availability.
 */
export const GroupDisabledMemberSilent: StoryObj = {
  name: 'group disabled — member silent',
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Counted>
        {activate => (
          <ToggleButtonGroup
            label="View mode"
            value={value}
            isDisabled
            onChange={next => {
              activate();
              setValue(next);
            }}>
            <ToggleButton value="list" label="List" />
          </ToggleButtonGroup>
        )}
      </Counted>
    );
  },
};

/**
 * A disabled toggle kept focusable by its tooltip, so the reason it is
 * unavailable stays reachable. Focusable is not operable: a pointer press must
 * still be refused.
 */
export const DisabledWithTooltip: StoryObj = {
  name: 'disabled — kept focusable by a tooltip',
  render: function Render() {
    const [isPressed, setIsPressed] = useState(false);
    return (
      <Counted>
        {activate => (
          <ToggleButton
            label="Bold"
            tooltip="Formatting is locked for this document"
            isDisabled
            isPressed={isPressed}
            onPressedChange={next => {
              activate();
              setIsPressed(next);
            }}
          />
        )}
      </Counted>
    );
  },
};

/**
 * The control. An enabled toggle carrying the same tooltip must still toggle —
 * this is the story that fails if a fix disables too much.
 */
export const EnabledWithTooltip: StoryObj = {
  name: 'enabled — with a tooltip',
  render: function Render() {
    const [isPressed, setIsPressed] = useState(false);
    return (
      <Counted>
        {activate => (
          <ToggleButton
            label="Bold"
            tooltip="Bold the selected text"
            isPressed={isPressed}
            onPressedChange={next => {
              activate();
              setIsPressed(next);
            }}
          />
        )}
      </Counted>
    );
  },
};
