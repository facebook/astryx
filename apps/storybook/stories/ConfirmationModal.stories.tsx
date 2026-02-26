import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSConfirmationModal} from '@xds/core/ConfirmationModal';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
  },
  result: {
    marginTop: 12,
  },
});

const meta: Meta<typeof XDSConfirmationModal> = {
  title: 'Core/XDSConfirmationModal',
  component: XDSConfirmationModal,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'destructive'],
      description: 'Visual variant controlling the confirm button appearance',
    },
    isLoading: {
      control: 'boolean',
      description: 'External loading state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSConfirmationModal>;

/**
 * Basic confirmation modal with default labels.
 */
function BasicExample() {
  const [isShown, setIsShown] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <>
      <XDSButton
        label="Save changes"
        variant="primary"
        onClick={() => setIsShown(true)}
      />
      {confirmed && (
        <XDSText type="body" color="primary" xstyle={styles.result}>
          ✓ Changes saved
        </XDSText>
      )}
      <XDSConfirmationModal
        isShown={isShown}
        title="Save changes?"
        description="Your unsaved changes will be applied."
        onConfirm={() => {
          setConfirmed(true);
          setIsShown(false);
        }}
        onCancel={() => setIsShown(false)}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <BasicExample />,
};

/**
 * Destructive confirmation with custom labels.
 */
function DestructiveExample() {
  const [isShown, setIsShown] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <>
      <XDSButton
        label="Delete project"
        variant="destructive"
        onClick={() => setIsShown(true)}
      />
      {deleted && (
        <XDSText type="body" color="primary" xstyle={styles.result}>
          ✓ Project deleted
        </XDSText>
      )}
      <XDSConfirmationModal
        isShown={isShown}
        title="Delete project?"
        description="This action cannot be undone. All data associated with this project will be permanently removed."
        onConfirm={() => {
          setDeleted(true);
          setIsShown(false);
        }}
        onCancel={() => setIsShown(false)}
        variant="destructive"
        confirmLabel="Delete"
        cancelLabel="Keep"
      />
    </>
  );
}

export const Destructive: Story = {
  render: () => <DestructiveExample />,
};

/**
 * Async confirm with automatic loading state.
 */
function AsyncExample() {
  const [isShown, setIsShown] = useState(false);
  const [removed, setRemoved] = useState(false);

  const handleConfirm = async () => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRemoved(true);
    setIsShown(false);
  };

  return (
    <>
      <XDSButton
        label="Remove item"
        variant="destructive"
        onClick={() => {
          setRemoved(false);
          setIsShown(true);
        }}
      />
      {removed && (
        <XDSText type="body" color="primary" xstyle={styles.result}>
          ✓ Item removed
        </XDSText>
      )}
      <XDSConfirmationModal
        isShown={isShown}
        title="Remove item?"
        description="This will remove the item from your list."
        onConfirm={handleConfirm}
        onCancel={() => setIsShown(false)}
        variant="destructive"
        confirmLabel="Remove"
      />
    </>
  );
}

export const AsyncConfirm: Story = {
  render: () => <AsyncExample />,
};

/**
 * Rich description with ReactNode content.
 */
function RichDescriptionExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Transfer ownership"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSConfirmationModal
        isShown={isShown}
        title="Transfer ownership?"
        description={
          <XDSVStack gap="sm">
            <XDSText type="body">
              You are transferring ownership to <strong>Jane Doe</strong>.
            </XDSText>
            <XDSText type="body" color="secondary">
              You will lose admin access immediately.
            </XDSText>
          </XDSVStack>
        }
        onConfirm={() => setIsShown(false)}
        onCancel={() => setIsShown(false)}
      />
    </>
  );
}

export const RichDescription: Story = {
  render: () => <RichDescriptionExample />,
};

/**
 * External loading state control.
 */
function ExternalLoadingExample() {
  const [isShown, setIsShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsShown(false);
    }, 2000);
  };

  return (
    <>
      <XDSButton
        label="Submit form"
        variant="primary"
        onClick={() => setIsShown(true)}
      />
      <XDSConfirmationModal
        isShown={isShown}
        title="Submit form?"
        description="Your form data will be submitted for review."
        onConfirm={handleConfirm}
        onCancel={() => setIsShown(false)}
        isLoading={isLoading}
        confirmLabel="Submit"
      />
    </>
  );
}

export const ExternalLoading: Story = {
  render: () => <ExternalLoadingExample />,
};
