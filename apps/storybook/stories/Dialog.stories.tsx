// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  HStack,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  acceptedMessage: {
    marginTop: 12,
  },
});

const meta: Meta<typeof Dialog> = {
  title: 'Core/Dialog',
  component: Dialog,
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
type Story = StoryObj<typeof Dialog>;

/**
 * Basic modal example with DialogHeader
 */
function BasicModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <Layout
          header={
            <DialogHeader
              title="Modal Title"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                This is a modal using the native &lt;dialog&gt; element with
                Layout for structured content. Click outside or press Escape
                to close.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <Button
                  label="Confirm"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Modal with Subtitle"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <Layout
          header={
            <DialogHeader
              title="Edit User Profile"
              subtitle="Make changes to your account settings"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                The subtitle appears below the title in smaller, secondary text.
                It provides additional context about the dialog&apos;s purpose.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <Button
                  label="Save Changes"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Wide Modal (600px)"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        width={600}>
        <Layout
          header={
            <DialogHeader
              title="Wide Modal"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                This modal has a custom width of 600px.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack hAlign="end">
                <Button
                  label="Close"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Fullscreen Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        variant="fullscreen">
        <Layout
          header={
            <DialogHeader
              title="Fullscreen Modal"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <div
                style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <Text type="body">
                  This modal takes up the entire viewport. The width, maxHeight,
                  and position props are ignored in fullscreen mode.
                </Text>
                {Array.from({length: 30}, (_, i) => (
                  <Text type="body" key={i}>
                    {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris.
                  </Text>
                ))}
              </div>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack hAlign="end">
                <Button
                  label="Close"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        label="Open Required Modal"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      {accepted && (
        <Text type="body" color="primary" xstyle={styles.acceptedMessage}>
          ✓ Terms accepted
        </Text>
      )}
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        purpose="required">
        <Layout
          header={<DialogHeader title="Accept Terms" />}
          content={
            <LayoutContent>
              <Text type="body">
                This is a required modal. You cannot dismiss it by clicking
                outside or pressing Escape. You must complete the action.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack hAlign="end">
                <Button
                  label="I Accept"
                  variant="primary"
                  onClick={handleAccept}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Form Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        purpose="form"
        width={500}>
        <Layout
          header={
            <DialogHeader
              title="Edit Profile"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                This modal uses purpose=&quot;form&quot;. Clicking outside
                won&apos;t close it (to prevent accidental data loss), but you
                can still press Escape. Try clicking outside vs pressing Escape.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <Button
                  label="Save"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Info Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        purpose="info">
        <Layout
          header={
            <DialogHeader
              title="Information"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                This modal uses purpose=&quot;info&quot; (default). You can
                close it by clicking outside, pressing Escape, or using the
                button.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack hAlign="end">
                <Button
                  label="Got it"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Positioned Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        position={{top: 100, right: 20}}
        width={350}>
        <Layout
          header={
            <DialogHeader
              title="Positioned Modal"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                This modal is positioned at top: 100px, right: 20px instead of
                being centered.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack hAlign="end">
                <Button
                  label="Close"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open Scrolling Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        maxHeight="50vh">
        <Layout
          header={
            <DialogHeader
              title="Terms and Conditions"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <div
                style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {Array.from({length: 20}, (_, i) => (
                  <Text type="body" key={i}>
                    {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo
                    consequat. Duis aute irure dolor in reprehenderit in
                    voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </Text>
                ))}
              </div>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Decline"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <Button
                  label="Accept"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = () => {
    setDeleted(true);
    setIsOpen(false);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <Button
        label="Delete Item"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      {deleted && (
        <Text type="body" color="primary">
          ✓ Item deleted (demo)
        </Text>
      )}
      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        width={350}
        purpose="form">
        <Layout
          header={
            <DialogHeader
              title="Confirm Delete"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <Button
                  label="Delete"
                  variant="destructive"
                  onClick={handleDelete}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
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

/**
 * Dialog with auto-focused input
 */
function AutoFocusInputExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  return (
    <>
      <Button
        label="Open Dialog"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <Layout
          header={
            <DialogHeader
              title="Auto-focused Input"
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <TextInput
                label="Name"
                placeholder="This input is focused on mount"
                value={value}
                onChange={setValue}
                hasAutoFocus
              />
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

export const AutoFocusInput: Story = {
  render: () => <AutoFocusInputExample />,
};
