// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  AlertDialog,
  useImperativeAlertDialog,
} from '@astryxdesign/core/AlertDialog';
import {Button} from '@astryxdesign/core/Button';

const meta: Meta<typeof AlertDialog> = {
  title: 'Core/AlertDialog',
  component: AlertDialog,
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
type Story = StoryObj<typeof AlertDialog>;

/**
 * Delete confirmation — the most common alert dialog pattern.
 */
export const Delete: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button
          label="Delete item"
          variant="destructive"
          onClick={() => setIsOpen(true)}
        />
        <AlertDialog
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
        <Button
          label="Revoke access"
          variant="destructive"
          onClick={() => setIsOpen(true)}
        />
        <AlertDialog
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
        <Button
          label="Show notice"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        />
        <AlertDialog
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
    const alert = useImperativeAlertDialog();
    return (
      <>
        <Button
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
