// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonA11y.stories.tsx
 * @input Uses Button, IconButton, ClickableCard, SideNavCollapseButton,
 *   ChatSendButton
 * @output One story per state in the shared button-pattern binding inventory,
 *   each counting its own activations.
 * @position The reproduction path for the Chromium half of the button-pattern
 *   contract (`docs/specs/AST-009/spec.md` FR30: a browser claim is checked
 *   against a checked-in story, not a page a test builds and throws away).
 *
 * Every story renders through `Counted`, which shows how many times the
 * component's own handler has run and republishes it as `data-a11y-activations` on a
 * wrapper. A button's action leaves no trace on the button, so that counter is
 * the only honest way to ask "did pressing it actually do anything" — and
 * having it visible means a person opening the story sees the same fact the
 * test reads.
 *
 * SYNC: Story ids are named by
 * - /packages/core/src/Button/__tests__/Button.a11y.states.ts
 */

import {useState, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {SideNavCollapseButton} from '@astryxdesign/core/SideNav';
import {ChatSendButton} from '@astryxdesign/core/Chat';
import {TrashIcon} from '@heroicons/react/24/outline';

/**
 * Renders one control and counts how many times its action ran.
 *
 * The count is both visible text and a `data-a11y-activations` attribute: a person
 * reading the story and a test reading the DOM see the same number.
 */
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
  title: 'a11y/Button pattern',
  parameters: {
    docs: {
      description: {
        component:
          'Binding states for the shared button-pattern accessibility contract. Each story counts its own activations, because a button leaves no trace of having been pressed.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---- Button ---------------------------------------------------------------

export const ButtonText: Story = {
  render: () => (
    <Counted>
      {activate => <Button label="Save changes" onClick={activate} />}
    </Counted>
  ),
};

export const ButtonIconOnly: Story = {
  render: () => (
    <Counted>
      {activate => (
        <Button
          label="Delete conversation"
          isIconOnly
          icon={<TrashIcon />}
          onClick={activate}
        />
      )}
    </Counted>
  ),
};

export const ButtonComposedLabel: Story = {
  render: () => (
    <Counted>
      {activate => (
        <Button label="Save changes" onClick={activate}>
          Save changes
        </Button>
      )}
    </Counted>
  ),
};

export const ButtonDisabled: Story = {
  render: () => (
    <Counted>
      {activate => (
        <Button label="Save changes" isDisabled onClick={activate} />
      )}
    </Counted>
  ),
};

export const ButtonDisabledWithTooltip: Story = {
  render: () => (
    <Counted>
      {activate => (
        <Button
          label="Save changes"
          isDisabled
          tooltip="Fill in every required field first"
          onClick={activate}
        />
      )}
    </Counted>
  ),
};

export const ButtonLoading: Story = {
  render: () => (
    <Counted>
      {activate => <Button label="Save changes" isLoading onClick={activate} />}
    </Counted>
  ),
};

export const ButtonAsLink: Story = {
  render: () => (
    <Counted>
      {activate => (
        <Button label="Read the guide" href="#guide" onClick={activate} />
      )}
    </Counted>
  ),
};

// ---- IconButton -----------------------------------------------------------

export const IconButtonDefault: Story = {
  name: 'Icon button',
  render: () => (
    <Counted>
      {activate => (
        <IconButton
          label="Delete conversation"
          icon={<TrashIcon />}
          onClick={activate}
        />
      )}
    </Counted>
  ),
};

export const IconButtonDisabled: Story = {
  render: () => (
    <Counted>
      {activate => (
        <IconButton
          label="Delete conversation"
          icon={<TrashIcon />}
          isDisabled
          onClick={activate}
        />
      )}
    </Counted>
  ),
};

export const IconButtonLoading: Story = {
  render: () => (
    <Counted>
      {activate => (
        <IconButton
          label="Delete conversation"
          icon={<TrashIcon />}
          isLoading
          onClick={activate}
        />
      )}
    </Counted>
  ),
};

// ---- ClickableCard --------------------------------------------------------

export const ClickableCardDefault: Story = {
  name: 'Clickable card',
  render: () => (
    <Counted>
      {activate => (
        <ClickableCard label="Open billing settings" onClick={activate}>
          <p>Billing</p>
        </ClickableCard>
      )}
    </Counted>
  ),
};

export const ClickableCardDisabled: Story = {
  render: () => (
    <Counted>
      {activate => (
        <ClickableCard
          label="Open billing settings"
          isDisabled
          onClick={activate}>
          <p>Billing</p>
        </ClickableCard>
      )}
    </Counted>
  ),
};

export const ClickableCardAsLink: Story = {
  render: () => (
    <Counted>
      {activate => (
        <ClickableCard
          label="Open billing settings"
          href="#billing"
          onClick={activate}>
          <p>Billing</p>
        </ClickableCard>
      )}
    </Counted>
  ),
};

// ---- SideNavCollapseButton ------------------------------------------------

/**
 * Rendered outside a SideNav with its own controlled config, which is the
 * supported standalone usage — the contract is about the button, not about what
 * collapsing does to a sidebar.
 */
function CollapseHarness({
  label,
  onActivate,
}: {
  label?: string;
  onActivate: () => void;
}): ReactNode {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <SideNavCollapseButton
      label={label}
      collapsible={{
        isCollapsed,
        onCollapsedChange: next => {
          setIsCollapsed(next);
          onActivate();
        },
      }}
    />
  );
}

export const SidenavCollapseIcon: Story = {
  render: () => (
    <Counted>{activate => <CollapseHarness onActivate={activate} />}</Counted>
  ),
};

export const SidenavCollapseLabelled: Story = {
  render: () => (
    <Counted>
      {activate => (
        <CollapseHarness label="Collapse sidebar" onActivate={activate} />
      )}
    </Counted>
  ),
};

// ---- ChatSendButton -------------------------------------------------------

export const ChatSend: Story = {
  render: () => (
    <Counted>
      {activate => <ChatSendButton isDisabled={false} onSend={activate} />}
    </Counted>
  ),
};

export const ChatSendDisabled: Story = {
  render: () => (
    <Counted>
      {activate => <ChatSendButton isDisabled onSend={activate} />}
    </Counted>
  ),
};

export const ChatSendStop: Story = {
  render: () => (
    <Counted>
      {activate => <ChatSendButton isStopShown onStop={activate} />}
    </Counted>
  ),
};
