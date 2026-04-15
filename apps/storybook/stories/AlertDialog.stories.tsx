import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';

const meta: Meta<typeof XDSAlertDialog> = {
  title: 'Core/XDSAlertDialog',
  component: XDSAlertDialog,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the dialog is shown',
    },
    width: {
      control: 'number',
      description: 'Width of the dialog (default: 400)',
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
          variant="danger"
          onClick={() => setIsOpen(true)}
        />
        <XDSAlertDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Delete item?"
          description="This action cannot be undone. The item and all its data will be permanently removed."
          cancel={<XDSButton variant="secondary" label="Cancel" />}
          action={
            <XDSButton
              variant="danger"
              label="Delete"
              onClick={() => setIsOpen(false)}
            />
          }
        />
      </>
    );
  },
};

/**
 * Async action with loading state.
 * The action button shows a loading spinner while the operation completes.
 */
export const Async: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRevoke = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      setIsOpen(false);
    };

    return (
      <>
        <XDSButton
          label="Revoke access"
          variant="danger"
          onClick={() => setIsOpen(true)}
        />
        <XDSAlertDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Revoke access?"
          description="This user will immediately lose access to all shared resources."
          cancel={
            <XDSButton
              variant="secondary"
              label="Cancel"
              isDisabled={isLoading}
            />
          }
          action={
            <XDSButton
              variant="danger"
              label="Revoke"
              isLoading={isLoading}
              onClick={handleRevoke}
            />
          }
        />
      </>
    );
  },
};

/**
 * Informational alert — no destructive action, just acknowledgment.
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
          cancel={<XDSButton variant="secondary" label="Cancel" />}
          action={
            <XDSButton
              variant="primary"
              label="Sign in"
              onClick={() => setIsOpen(false)}
            />
          }
        />
      </>
    );
  },
};

/**
 * Custom width dialog.
 */
export const Wide: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton
          label="Reset all settings"
          variant="danger"
          onClick={() => setIsOpen(true)}
        />
        <XDSAlertDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Reset all settings?"
          description="This will restore all preferences, themes, and configurations to their factory defaults. Any custom settings will be permanently lost."
          cancel={<XDSButton variant="secondary" label="Keep settings" />}
          action={
            <XDSButton
              variant="danger"
              label="Reset everything"
              onClick={() => setIsOpen(false)}
            />
          }
          width={500}
        />
      </>
    );
  },
};
