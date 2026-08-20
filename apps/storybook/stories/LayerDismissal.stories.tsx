// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LayerDismissal.stories.tsx
 * @input Uses Dialog, Popover, Tooltip, Button, Layout from @astryxdesign/core
 * @output Storybook stories demonstrating shared layer dismissal
 * @position Storybook; the visual contract for the layer dismissal stack
 *
 * Every story here answers the same question — "what does ONE Escape press
 * do?" — for a different mix of layers. They exist to be pressed, not just
 * read: the behavior is invisible in a screenshot of a single state.
 */

import {useState} from 'react';
import {
  Button,
  Dialog,
  DialogHeader,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  Popover,
  Text,
  Tooltip,
  VStack,
} from '@astryxdesign/core';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta = {
  title: 'Core/Layer Dismissal',
  parameters: {
    docs: {
      description: {
        component:
          'One Escape press dismisses exactly one layer — the top-most one. ' +
          'Every overlay family shares a single dismissal stack, so modals, ' +
          'popovers, menus and hover tips all peel off in the right order ' +
          'regardless of which primitive rendered them.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/**
 * A modal opened from inside another modal. One Escape closes the inner one and
 * leaves the outer open; a second Escape closes the outer.
 *
 * The inner Dialog is rendered INSIDE the outer's subtree, which is how this is
 * written in real code and the case that used to close both at once.
 */
function ModalInModalExample() {
  const [isOuterOpen, setIsOuterOpen] = useState(false);
  const [isInnerOpen, setIsInnerOpen] = useState(false);

  return (
    <>
      <Button
        label="Open outer modal"
        variant="secondary"
        onClick={() => setIsOuterOpen(true)}
      />
      <Dialog
        isOpen={isOuterOpen}
        onOpenChange={setIsOuterOpen}
        width={520}
        aria-label="Outer modal">
        <Layout
          header={
            <DialogHeader
              title="Outer modal"
              subtitle="Press Escape once — only the layer on top should close"
              onOpenChange={setIsOuterOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={3}>
                <Text type="body">
                  Open the inner modal, then press Escape. The inner one closes
                  and this one stays.
                </Text>
                <Button
                  label="Open inner modal"
                  variant="primary"
                  onClick={() => setIsInnerOpen(true)}
                />
              </VStack>

              <Dialog
                isOpen={isInnerOpen}
                onOpenChange={setIsInnerOpen}
                width={380}
                aria-label="Inner modal">
                <Layout
                  header={
                    <DialogHeader
                      title="Inner modal"
                      onOpenChange={setIsInnerOpen}
                    />
                  }
                  content={
                    <LayoutContent>
                      <Text type="body">Escape closes this one only.</Text>
                    </LayoutContent>
                  }
                />
              </Dialog>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

export const ModalInModal: Story = {render: () => <ModalInModalExample />};

/**
 * A popover opened inside a modal. Escape closes the popover and leaves the
 * modal — the two families share one stack, so a mixed nesting orders the same
 * way a same-family nesting does.
 */
function PopoverInModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width={520}
        aria-label="Modal hosting a popover">
        <Layout
          header={
            <DialogHeader
              title="Modal with a popover"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={3}>
                <Text type="body">
                  Open the popover, then press Escape: the popover closes and
                  this modal stays open.
                </Text>
                <Popover
                  content={
                    <VStack gap={2}>
                      <Text type="body">Popover content</Text>
                      <Text type="supporting">Escape closes just this.</Text>
                    </VStack>
                  }>
                  <Button label="Open popover" variant="primary" />
                </Popover>
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

export const PopoverInModal: Story = {
  render: () => <PopoverInModalExample />,
};

/**
 * A hover tip inside a modal. The visible tip is the top-most layer, so Escape
 * hides the tip and the modal stays open; a second Escape closes the modal.
 *
 * Escape affects exactly one layer here, same as everywhere else — hover layers
 * get no special case. The alternative (hide the tip AND close the modal on one
 * press) was considered and rejected: someone dismissing a stray tooltip over a
 * half-filled form would lose the form. One extra keystroke is the cheaper way
 * to be wrong.
 *
 * A tip that is NOT showing claims nothing: presence is read from the DOM at
 * press time, so merely having a tooltip in the tree never eats an Escape.
 */
function HoverTipInModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width={520}
        aria-label="Modal hosting a hover tip">
        <Layout
          header={
            <DialogHeader
              title="Modal with a hover tip"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={3}>
                <Text type="body">
                  Hover the button below to show its tip, then press Escape: the
                  tip hides and this modal stays open. Press Escape again to
                  close the modal.
                </Text>
                <Tooltip content="A hover tip — Escape hides just this">
                  <Button label="Hover me" variant="primary" />
                </Tooltip>
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

export const HoverTipInModal: Story = {
  render: () => <HoverTipInModalExample />,
};

/**
 * A `required` modal is a `block` layer: Escape neither dismisses it nor falls
 * through to anything behind it. Open it from inside another modal and press
 * Escape — nothing happens at all, which is the point. The user must choose.
 */
function RequiredModalExample() {
  const [isHostOpen, setIsHostOpen] = useState(false);
  const [isRequiredOpen, setIsRequiredOpen] = useState(false);

  return (
    <>
      <Button
        label="Open host modal"
        variant="secondary"
        onClick={() => setIsHostOpen(true)}
      />
      <Dialog
        isOpen={isHostOpen}
        onOpenChange={setIsHostOpen}
        width={520}
        aria-label="Host modal">
        <Layout
          header={
            <DialogHeader title="Host modal" onOpenChange={setIsHostOpen} />
          }
          content={
            <LayoutContent>
              <VStack gap={3}>
                <Text type="body">
                  Open the required dialog, then press Escape. Neither dialog
                  closes: a required layer swallows the press so it cannot leak
                  to the layer underneath.
                </Text>
                <Button
                  label="Open required dialog"
                  variant="primary"
                  onClick={() => setIsRequiredOpen(true)}
                />
              </VStack>

              <Dialog
                isOpen={isRequiredOpen}
                onOpenChange={setIsRequiredOpen}
                purpose="required"
                width={380}
                aria-label="Required dialog">
                <Layout
                  header={<DialogHeader title="Choose an option" />}
                  content={
                    <LayoutContent>
                      <Text type="body">
                        Escape does nothing here. Pick an action to continue.
                      </Text>
                    </LayoutContent>
                  }
                  footer={
                    <LayoutFooter>
                      <HStack gap={2} hAlign="end">
                        <Button
                          label="Decline"
                          variant="secondary"
                          onClick={() => setIsRequiredOpen(false)}
                        />
                        <Button
                          label="Accept"
                          variant="primary"
                          onClick={() => setIsRequiredOpen(false)}
                        />
                      </HStack>
                    </LayoutFooter>
                  }
                />
              </Dialog>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

export const RequiredModalBlocksEscape: Story = {
  render: () => <RequiredModalExample />,
};
