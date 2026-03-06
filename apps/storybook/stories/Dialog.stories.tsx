import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  acceptedMessage: {
    marginTop: 12,
  },
});

const meta: Meta<typeof XDSDialog> = {
  title: 'Core/XDSDialog',
  component: XDSDialog,
  tags: ['autodocs'],
  argTypes: {
    isShown: {
      control: 'boolean',
      description: 'Whether the dialog is shown',
    },
    width: {
      control: 'number',
      description: 'Width of the dialog (default: 400)',
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of the dialog (default: 75vh)',
    },
    variant: {
      control: 'select',
      options: ['standard', 'fullscreen'],
      description: 'Dialog variant',
    },
    purpose: {
      control: 'select',
      options: ['required', 'form', 'info'],
      description: 'Dismissal behavior configuration',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSDialog>;

/**
 * Basic modal example with XDSDialogHeader
 */
function BasicModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Modal"
        variant="primary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog isShown={isShown} onOpenChange={open => setIsShown(open)}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Modal Title"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This is a modal using the native &lt;dialog&gt; element with
                XDSLayout for structured content. Click outside or press Escape
                to close.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsShown(false)}
                />
                <XDSButton
                  label="Confirm"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const Default: Story = {
  render: () => <BasicModalExample />,
};

/**
 * Dialog with subtitle example
 */
function SubtitleModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Modal with Subtitle"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog isShown={isShown} onOpenChange={open => setIsShown(open)}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Edit User Profile"
              subtitle="Make changes to your account settings"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                The subtitle appears below the title in smaller, secondary text.
                It provides additional context about the dialog&apos;s purpose.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsShown(false)}
                />
                <XDSButton
                  label="Save Changes"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const WithSubtitle: Story = {
  render: () => <SubtitleModalExample />,
};

/**
 * Custom width example
 */
function WideModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Wide Modal (600px)"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        width={600}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Wide Modal"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This modal has a custom width of 600px.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack hAlign="end">
                <XDSButton
                  label="Close"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const CustomWidth: Story = {
  render: () => <WideModalExample />,
};

/**
 * Fullscreen variant
 */
function FullscreenModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Fullscreen Modal"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        variant="fullscreen">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Fullscreen Modal"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This modal takes up the entire viewport. The width, maxHeight,
                and position props are ignored in fullscreen mode.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack hAlign="end">
                <XDSButton
                  label="Close"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const Fullscreen: Story = {
  render: () => <FullscreenModalExample />,
};

/**
 * Purpose: required - cannot be dismissed
 */
function RequiredModalExample() {
  const [isShown, setIsShown] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setIsShown(false);
  };

  return (
    <>
      <XDSButton
        label="Open Required Modal"
        variant="destructive"
        onClick={() => setIsShown(true)}
      />
      {accepted && (
        <XDSText type="body" color="primary" xstyle={styles.acceptedMessage}>
          ✓ Terms accepted
        </XDSText>
      )}
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        purpose="required">
        <XDSLayout
          header={<XDSDialogHeader title="Accept Terms" />}
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This is a required modal. You cannot dismiss it by clicking
                outside or pressing Escape. You must complete the action.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack hAlign="end">
                <XDSButton
                  label="I Accept"
                  variant="primary"
                  onClick={handleAccept}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const PurposeRequired: Story = {
  render: () => <RequiredModalExample />,
};

/**
 * Purpose: form - prevents backdrop click
 */
function FormModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Form Modal"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        purpose="form"
        width={500}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Edit Profile"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This modal uses purpose=&quot;form&quot;. Clicking outside
                won&apos;t close it (to prevent accidental data loss), but you
                can still press Escape. Try clicking outside vs pressing Escape.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsShown(false)}
                />
                <XDSButton
                  label="Save"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const PurposeForm: Story = {
  render: () => <FormModalExample />,
};

/**
 * Purpose: info - allows all dismissals
 */
function InfoModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Info Modal"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        purpose="info">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Information"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This modal uses purpose=&quot;info&quot; (default). You can
                close it by clicking outside, pressing Escape, or using the
                button.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack hAlign="end">
                <XDSButton
                  label="Got it"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const PurposeInfo: Story = {
  render: () => <InfoModalExample />,
};

/**
 * Custom position example
 */
function PositionedModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Positioned Modal"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        position={{top: 100, right: 20}}
        width={350}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Positioned Modal"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This modal is positioned at top: 100px, right: 20px instead of
                being centered.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack hAlign="end">
                <XDSButton
                  label="Close"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const CustomPosition: Story = {
  render: () => <PositionedModalExample />,
};

/**
 * Scrolling content example
 */
function ScrollingModalExample() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Scrolling Modal"
        variant="secondary"
        onClick={() => setIsShown(true)}
      />
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        maxHeight="50vh">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Terms and Conditions"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <div
                style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {Array.from({length: 20}, (_, i) => (
                  <XDSText type="body" key={i}>
                    {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo
                    consequat. Duis aute irure dolor in reprehenderit in
                    voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </XDSText>
                ))}
              </div>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton
                  label="Decline"
                  variant="secondary"
                  onClick={() => setIsShown(false)}
                />
                <XDSButton
                  label="Accept"
                  variant="primary"
                  onClick={() => setIsShown(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}

export const ScrollingContent: Story = {
  render: () => <ScrollingModalExample />,
};

/**
 * Confirmation dialog pattern
 */
function ConfirmationModalExample() {
  const [isShown, setIsShown] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = () => {
    setDeleted(true);
    setIsShown(false);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <XDSButton
        label="Delete Item"
        variant="destructive"
        onClick={() => setIsShown(true)}
      />
      {deleted && (
        <XDSText type="body" color="primary">
          ✓ Item deleted (demo)
        </XDSText>
      )}
      <XDSDialog
        isShown={isShown}
        onOpenChange={open => setIsShown(open)}
        width={350}
        purpose="form">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Confirm Delete"
              onOpenChange={open => setIsShown(open)}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsShown(false)}
                />
                <XDSButton
                  label="Delete"
                  variant="destructive"
                  onClick={handleDelete}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </div>
  );
}

export const ConfirmationDialog: Story = {
  render: () => <ConfirmationModalExample />,
};

/**
 * All purpose variants side by side
 */
export const AllPurposes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
      <RequiredModalExample />
      <FormModalExample />
      <InfoModalExample />
    </div>
  ),
};
