// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Dialog, DialogHeroHeader} from '@astryxdesign/core/Dialog';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  HStack,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof DialogHeroHeader> = {
  title: 'Core/DialogHeroHeader',
  component: DialogHeroHeader,
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['center', 'start'],
      description: 'Horizontal alignment of the hero content',
    },
    hasDivider: {
      control: 'boolean',
      description: 'Adds a border at the bottom edge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DialogHeroHeader>;

/**
 * The prominent hero treatment: media, eyebrow, display-scale title, and
 * supporting text, centered by default. Actions live in LayoutFooter.
 */
function CenteredExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open hero dialog"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <Layout
          header={
            <DialogHeroHeader
              media={<Icon icon="success" size="lg" color="accent" />}
              eyebrow="Welcome"
              title="You're all set up"
              subtitle="Your workspace is ready. Invite your team to start collaborating."
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body" color="secondary">
                Body content for the featured moment goes here.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Maybe later"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <Button
                  label="Invite team"
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
  render: () => <CenteredExample />,
};

/**
 * Start-aligned variant — left-aligned like DialogHeader, but at hero scale.
 */
function StartAlignedExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open start-aligned"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <Layout
          header={
            <DialogHeroHeader
              align="start"
              eyebrow="New feature"
              title="Introducing Insights"
              subtitle="Track how your team uses the workspace over time."
              onOpenChange={open => setIsOpen(open)}
            />
          }
          content={
            <LayoutContent>
              <Text type="body" color="secondary">
                Body content goes here.
              </Text>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

export const StartAligned: Story = {
  render: () => <StartAlignedExample />,
};

/**
 * Inline preview (isInline) — the same rendering used by docs/showcases, with
 * autofocus suppressed. Handy for visual review without opening a modal.
 */
export const InlinePreview: Story = {
  render: () => (
    <Dialog isOpen isInline onOpenChange={() => {}}>
      <Layout
        header={
          <DialogHeroHeader
            media={<Icon icon="success" size="lg" color="accent" />}
            eyebrow="Payment received"
            title="Thanks for your order"
            subtitle="A receipt has been sent to your email. Your plan is now active."
            onOpenChange={() => {}}
          />
        }
        content={
          <LayoutContent>
            <Text type="body" color="secondary">
              Dialog body content goes here.
            </Text>
          </LayoutContent>
        }
      />
    </Dialog>
  ),
};
