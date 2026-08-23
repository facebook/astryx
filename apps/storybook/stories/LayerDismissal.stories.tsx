// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LayerDismissal.stories.tsx
 * @input Uses Dialog, Popover, Tooltip, Lightbox, MobileNav, BottomSheet,
 *   Button, Layout from @astryxdesign/core
 * @output Storybook stories demonstrating shared layer dismissal
 * @position Storybook; the visual contract for the layer dismissal stack
 *
 * Every story here answers the same question — "what does ONE Escape press
 * do?" — for a different mix of layers. They exist to be pressed, not just
 * read: the behavior is invisible in a screenshot of a single state.
 */

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Button,
  Dialog,
  DialogHeader,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  Lightbox,
  MobileNav,
  Popover,
  Text,
  Tooltip,
  VStack,
} from '@astryxdesign/core';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import type {Meta, StoryObj} from '@storybook/react-vite';

const sheetStyles = stylex.create({
  body: {padding: 24},
});

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

/**
 * A Lightbox opened from inside a `required` dialog. Escape closes the
 * Lightbox and leaves the required dialog exactly where it was.
 *
 * Lightbox used to close on the native `cancel` event alone, so the required
 * dialog — a `block` layer — swallowed the press and the Lightbox could only
 * be closed with the mouse.
 */
function RequiredModalWithLightboxExample() {
  const [isRequiredOpen, setIsRequiredOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <Button
        label="Open required dialog"
        variant="secondary"
        onClick={() => setIsRequiredOpen(true)}
      />
      <Dialog
        isOpen={isRequiredOpen}
        onOpenChange={setIsRequiredOpen}
        purpose="required"
        width={420}
        aria-label="Required dialog">
        <Layout
          header={<DialogHeader title="Confirm your evidence" />}
          content={
            <LayoutContent>
              <VStack gap={3}>
                <Text type="body">
                  Open the photo, then press Escape. The photo closes and this
                  dialog stays — it still requires an explicit choice.
                </Text>
                <Button
                  label="View photo"
                  variant="primary"
                  onClick={() => setIsLightboxOpen(true)}
                />
              </VStack>

              <Lightbox
                isOpen={isLightboxOpen}
                onOpenChange={setIsLightboxOpen}
                media={{
                  src: 'https://picsum.photos/id/1015/1200/800',
                  alt: 'A river through a canyon',
                }}
              />
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
    </>
  );
}

export const RequiredModalWithLightbox: Story = {
  render: () => <RequiredModalWithLightboxExample />,
};

/**
 * A mobile nav drawer opened over a `required` dialog. Same shape as the
 * Lightbox story: Escape closes the drawer, the required dialog stays.
 */
function RequiredModalWithMobileNavExample() {
  const [isRequiredOpen, setIsRequiredOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      <Button
        label="Open required dialog"
        variant="secondary"
        onClick={() => setIsRequiredOpen(true)}
      />
      <Dialog
        isOpen={isRequiredOpen}
        onOpenChange={setIsRequiredOpen}
        purpose="required"
        width={420}
        aria-label="Required dialog">
        <Layout
          header={<DialogHeader title="Confirm your choice" />}
          content={
            <LayoutContent>
              <VStack gap={3}>
                <Text type="body">
                  Open the navigation drawer, then press Escape. The drawer
                  closes and this dialog stays.
                </Text>
                <Button
                  label="Open navigation"
                  variant="primary"
                  onClick={() => setIsNavOpen(true)}
                />
              </VStack>

              <MobileNav
                isOpen={isNavOpen}
                onOpenChange={setIsNavOpen}
                header="Navigation">
                <Text type="body">Escape closes this drawer only.</Text>
              </MobileNav>
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
    </>
  );
}

export const RequiredModalWithMobileNav: Story = {
  render: () => <RequiredModalWithMobileNavExample />,
};

/** A Lightbox on its own. Escape closes it, as it always has. */
function LightboxAloneExample() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        label="View photo"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Lightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        media={{
          src: 'https://picsum.photos/id/1015/1200/800',
          alt: 'A river through a canyon',
        }}
      />
    </>
  );
}

export const LightboxAlone: Story = {render: () => <LightboxAloneExample />};

/** A mobile nav drawer on its own. Escape closes it, as it always has. */
function MobileNavAloneExample() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        label="Open navigation"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <MobileNav isOpen={isOpen} onOpenChange={setIsOpen} header="Navigation">
        <Text type="body">Escape closes this drawer.</Text>
      </MobileNav>
    </>
  );
}

export const MobileNavAlone: Story = {render: () => <MobileNavAloneExample />};

/**
 * A non-modal bottom sheet with a hover tip showing inside it. The standalone
 * sheet is the one family not on the shared stack yet, so it still owns its own
 * Escape: the press closes the sheet, and the tip goes with the content it was
 * anchored to. That is two layers on one press — the exception this stack
 * exists to remove, and it closes when the sheet migrates.
 *
 * What this story pins today is the narrower promise: a tip being up must not
 * stop the sheet from closing, which is what happened when
 * `hasActiveFocusTrapEscape()` counted every layer instead of focus traps only.
 */
function SheetWithHoverTipExample() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  return (
    <>
      <Button
        label="Open sheet"
        variant="secondary"
        onClick={() => setActiveSheet('details')}
      />
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}
        hasScrim={false}>
        <BottomSheet sheetId="details" label="Details" height="hug">
          <VStack gap={3} xstyle={sheetStyles.body}>
            <Text type="body">
              Hover the button to show the tip, then press Escape. The sheet
              closes — this sheet is not on the shared stack yet, so the press
              takes it and the tip together.
            </Text>
            <Tooltip content="A hover tip, showing">
              <Button label="Hover me" variant="secondary" />
            </Tooltip>
          </VStack>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}

export const SheetWithHoverTip: Story = {
  render: () => <SheetWithHoverTipExample />,
};

/**
 * Three layers deep, in two different families: a modal, a modal opened from
 * inside it, and a popover opened from inside that. Three Escape presses peel
 * them off one at a time, innermost first — the ordering has to hold past the
 * two-layer case that is easy to get right by accident.
 */
function ThreeDeepExample() {
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
            <DialogHeader title="Outer modal" onOpenChange={setIsOuterOpen} />
          }
          content={
            <LayoutContent>
              <VStack gap={3}>
                <Text type="body">
                  Open the inner modal, then the popover inside it. Three
                  Escapes, one layer each.
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
                width={400}
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
                      <Popover content={<Text type="body">Deepest layer</Text>}>
                        <Button label="Open popover" variant="primary" />
                      </Popover>
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

export const ThreeDeep: Story = {render: () => <ThreeDeepExample />};

/**
 * A dialog whose `purpose` changes while it is open re-registers with the
 * stack. Its place in the order must not move: a second modal opened over it
 * still takes the next Escape, and a flip to `required` must not let the older
 * dialog start swallowing presses meant for the newer one.
 *
 * Open the first modal, open the second, flip the first to required, then
 * press Escape — the second closes, as it would have without the flip.
 */
function PurposeFlipsWhileOpenExample() {
  const [isFirstOpen, setIsFirstOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isFirstRequired, setIsFirstRequired] = useState(false);

  return (
    <>
      <HStack gap={2}>
        <Button
          label="Open first modal"
          variant="secondary"
          onClick={() => setIsFirstOpen(true)}
        />
        <Button
          label="Open second modal"
          variant="secondary"
          onClick={() => setIsSecondOpen(true)}
        />
        <Button
          label="Make first required"
          variant="secondary"
          onClick={() => setIsFirstRequired(true)}
        />
      </HStack>
      <Dialog
        isOpen={isFirstOpen}
        onOpenChange={setIsFirstOpen}
        purpose={isFirstRequired ? 'required' : undefined}
        width={460}
        aria-label="First modal">
        <Layout
          header={<DialogHeader title="First modal" />}
          content={
            <LayoutContent>
              <Text type="body">
                Opened first. Flipping this to required re-registers it and must
                not promote it above the modal opened after it.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Close"
                  variant="secondary"
                  onClick={() => setIsFirstOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
      <Dialog
        isOpen={isSecondOpen}
        onOpenChange={setIsSecondOpen}
        width={380}
        aria-label="Second modal">
        <Layout
          header={
            <DialogHeader title="Second modal" onOpenChange={setIsSecondOpen} />
          }
          content={
            <LayoutContent>
              <Text type="body">Escape closes this one.</Text>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

export const PurposeFlipsWhileOpen: Story = {
  render: () => <PurposeFlipsWhileOpenExample />,
};
