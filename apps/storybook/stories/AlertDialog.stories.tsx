// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSAlertDialog,
  useXDSImperativeAlertDialog,
} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';

const meta: Meta<typeof XDSAlertDialog> = {
  title: 'Core/Dialogs/AlertDialog',
  component: XDSAlertDialog,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {control: 'boolean'},
    width: {control: 'number'},
    actionVariant: {
      control: 'select',
      options: ['destructive', 'primary', 'secondary', 'ghost'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAlertDialog>;

/**
 * Delete confirmation — the most common alert dialog pattern.
 */
export const Delete: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton
          label="Delete item"
          variant="destructive"
          onClick={() => setIsOpen(true)}
        />
        <XDSAlertDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Delete item?"
          description="This action cannot be undone. The item and all its data will be permanently removed."
          actionLabel="Delete"
          onAction={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Async action with loading state.
 */
export const Async: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    return (
      <>
        <XDSButton
          label="Revoke access"
          variant="destructive"
          onClick={() => setIsOpen(true)}
        />
        <XDSAlertDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Revoke access?"
          description="This user will immediately lose access to all shared resources."
          actionLabel="Revoke"
          isActionLoading={isLoading}
          onAction={async () => {
            setIsLoading(true);
            await new Promise(r => setTimeout(r, 2000));
            setIsLoading(false);
            setIsOpen(false);
          }}
        />
      </>
    );
  },
};

/**
 * Non-destructive confirmation with a primary action button.
 */
export const Informational: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton
          label="Show notice"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        />
        <XDSAlertDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Session expired"
          description="Your session has expired. You will be redirected to the login page."
          actionLabel="Sign in"
          actionVariant="primary"
          onAction={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Imperative API — no state management needed.
 */
export const Imperative: Story = {
  render: () => {
    const alert = useXDSImperativeAlertDialog();
    return (
      <>
        <XDSButton
          label="Delete item"
          variant="destructive"
          onClick={() =>
            alert.show({
              title: 'Delete item?',
              description: 'This action cannot be undone.',
              actionLabel: 'Delete',
              onAction: () => alert.hide(),
            })
          }
        />
        {alert.element}
      </>
    );
  },
};
