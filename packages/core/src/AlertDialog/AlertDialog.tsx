// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AlertDialog.tsx
 * @input Uses React, StyleX, Dialog, Layout, Heading, Text, Button, the touch
 *   presentation resolver, the action-group tracking
 *   (hooks/useActionGroupTracking), the group item marker
 *   (utils/pressFeedback), its touch layer (AlertDialogTouch) and the alert
 *   entries of the UIKit constants table
 * @output Exports AlertDialog component, AlertDialogProps type
 * @position Core implementation; consumed by index.ts, tested by AlertDialog.test.tsx
 *
 * The two actions are tracked as one group under every pointer, a finger, a
 * pen or a mouse (`family:action-groups`), as UIKit tracks an alert's
 * actions: the action under the pointer highlights at once, the highlight
 * follows it from one action to the other, and the release runs the action
 * under it (none when it is off both). Only the actions are tracked: a press
 * on the title or the message is not part of the group. The keyboard and
 * assistive technology keep the buttons' own click.
 *
 * Under a finger (a coarse primary pointer: useTouchPresentation) it also
 * appears and leaves the way UIKit's alert does (useAlertMotion): it scales
 * down from 1.2 and fades in with the dimming, and leaves with a fade alone,
 * both on the compositor; the dialog stays open until the fade ends. A touch
 * reaches nothing while it appears (keys and assistive technology still act),
 * and no input reaches it while it leaves. One touch model on every touch
 * device. With a mouse the theme's entrance plays and the dialog closes at
 * once, as before.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AlertDialog/AlertDialog.doc.mjs (props table, features, examples)
 * - /packages/core/src/AlertDialog/AlertDialog.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/AlertDialog/index.ts (exports if types change)
 * - /packages/core/src/AlertDialog/__tests__/AlertDialog.interaction.browser.spec.ts (touch tracking)
 * - /packages/core/src/AlertDialog/__tests__/AlertDialog.motion.interaction.browser.spec.ts (touch motion)
 * - /apps/storybook/stories/AlertDialog.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/AlertDialog/ (showcase blocks)
 */

import React, {useId, useCallback, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Dialog} from '../Dialog';
import {Layout} from '../Layout/Layout';
import {LayoutContent} from '../Layout/LayoutContent';
import {LayoutFooter} from '../Layout/LayoutFooter';
import {Stack} from '../Stack';
import {Heading} from '../Heading/Heading';
import {Text} from '../Text/Text';
import {Button, type ButtonVariant} from '../Button';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {useActionGroupTracking} from '../hooks/useActionGroupTracking';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {alertController} from '../motion/uikit/alert';
import {
  PRESS_GROUP_ITEM_ATTRIBUTE,
  pressGroupItemProps,
} from '../utils/pressFeedback';
import {useTouchPresentation} from '../utils/touchPresentation';
import {useAlertDialogTouch} from './AlertDialogTouch';

const SMALL_SCREEN_QUERY = '(max-width: 640px)';

const styles = stylex.create({
  // The group tracking claims a press on the actions the moment it lands, as
  // a long press does: the browser may pinch-zoom there but never pans (Chrome
  // on Android cancels a pointer it pans, which would cancel the group's
  // press), and a double tap zooms nothing (`spec:AST-094` FR18: the gesture
  // host never allows more than this). A press that slides across the
  // actions selects none of their labels, for a mouse too (`spec:AST-094`
  // FR41: the hold does something); the title and the message stay
  // selectable.
  trackingRow: {
    touchAction: 'pinch-zoom',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  // UIKit's alert motion drives the dialog (useAlertMotion): the theme's
  // entrance keyframes stand down.
  uikitMotion: {
    animationName: 'none',
    // The motion animator promotes the dimming while it moves through this
    // custom property on the dialog: Mobile Safari keeps an unlayered
    // ::backdrop's animation on the main thread at its first commit.
    '::backdrop': {
      willChange: 'var(--astryx-motion-will-change-backdrop, auto)',
    },
  },
  action: {
    maxWidth: '100%',
    minWidth: 0,
  },
  stackedAction: {
    width: '100%',
  },
});

/**
 * How AlertDialog presents under a finger: `'adaptive'` follows the device,
 * `'dialog'` keeps the dialog a mouse gets on every device.
 */
export type AlertDialogPresentation = 'adaptive' | 'dialog';

export interface AlertDialogProps extends BaseProps<HTMLDialogElement> {
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the dialog is open.
   */
  isOpen: boolean;

  /**
   * Renders alert dialog content inline without modal behavior.
   * For documentation previews and showcases only. The inline path is not a
   * modal, so it renders `role="group"` rather than `role="alertdialog"`.
   * @default false
   */
  isInline?: boolean;

  /**
   * Callback fired when the dialog visibility changes.
   * Called with `false` when cancel is clicked or Escape is pressed.
   */
  onOpenChange: (isOpen: boolean) => unknown;

  /**
   * Dialog title. Linked to the dialog via `aria-labelledby`.
   */
  title: string;

  /**
   * Consequence description. Linked to the dialog via `aria-describedby`.
   */
  description: string;

  /**
   * Label for the cancel button. Rendered as a ghost Button.
   * Clicking cancel calls `onOpenChange(false)`.
   * @default 'Cancel'
   */
  cancelLabel?: string;

  /**
   * Label for the action button.
   */
  actionLabel: string;

  /**
   * Variant for the action button.
   * @default 'destructive'
   */
  actionVariant?: ButtonVariant;

  /**
   * Whether the action button shows a loading spinner.
   */
  isActionLoading?: boolean;

  /**
   * Callback fired when the action button is clicked.
   * The dialog does NOT auto-close — call `onOpenChange(false)` when done.
   */
  onAction: () => unknown;

  /**
   * The width of the dialog.
   * Numbers are treated as pixels, strings are used as-is. By default 400,
   * and on a phone (a compact width under a finger) with
   * `presentation="adaptive"` UIKit's alert width, 320.
   * @default 400
   */
  width?: number | string;
  /**
   * How the alert presents under a finger. `'adaptive'` gives a touch screen
   * the native alert: it appears and leaves the way an iOS alert does, and
   * it is 320 wide on a phone. `'dialog'` keeps the dialog a mouse gets on
   * every device: the theme's motion, 400 wide. Either way the actions are
   * tracked as one group under every pointer (`family:action-groups`).
   * @default 'adaptive'
   */
  presentation?: AlertDialogPresentation;
}

/**
 * A confirmation dialog for destructive or irreversible actions.
 *
 * Implements the WAI-ARIA APG Alert Dialog pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 *
 * Uses `role="alertdialog"` and requires explicit user action to dismiss.
 * Cannot be dismissed by clicking outside. Escape key triggers cancel.
 * Initial focus goes to the cancel button (least destructive action), pinned
 * with `data-autofocus` so it survives any change to the footer's order.
 *
 * The `isInline` preview path is not modal, so it renders `role="group"`
 * instead — the alertdialog role would promise modality it does not have.
 *
 * @example
 * ```
 * <AlertDialog
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete item?"
 *   description="This action cannot be undone."
 *   actionLabel="Delete"
 *   onAction={async () => { await deleteItem(); setIsOpen(false); }}
 * />
 * ```
 */
export function AlertDialog({
  ref,
  isOpen,
  isInline,
  onOpenChange,
  title,
  description,
  cancelLabel: cancelLabelFromProps,
  actionLabel,
  actionVariant = 'destructive',
  isActionLoading,
  onAction,
  width: widthProp,
  presentation = 'adaptive',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...rest
}: AlertDialogProps) {
  const t = useTranslator();
  const cancelLabel = cancelLabelFromProps ?? t('@astryx.alertDialog.cancel');
  const titleId = useId();
  const descriptionId = useId();
  // Width stays delegated to Dialog: this query exists only so AlertDialog can
  // keep narrow visual, DOM, and tab order aligned for its destructive/cancel
  // semantics without coupling action order to pointer or hover capability.
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);

  // Under a finger the alert appears and leaves the way UIKit's does (the
  // touch layer's useAlertMotion): it stays presented while it fades out.
  // Only under a touch presentation (a coarse primary pointer, after
  // hydration): where the primary pointer is fine nothing of it attaches
  // (`spec:AST-094` FR13, FR19). A caller's `presentation="dialog"` keeps the
  // fine-pointer dialog on every device (`architecture:public-component-api`
  // INV16).
  const touch = useTouchPresentation();
  const isTouch = presentation !== 'dialog' && touch.isTouch;
  // On a phone (a compact width under a finger), UIKit's alert width in
  // every theme (alertController.width), so the presentation's 1.2 start
  // stays on screen; on a wider touch screen and with a mouse, Dialog's 400.
  const width =
    widthProp ?? (isTouch && touch.isCompact ? alertController.width : 400);
  const {motion} = useAlertDialogTouch({
    isOpen,
    isInline: isInline === true,
    isTouch,
  });
  // The two actions are an action group (`family:action-groups`): a held
  // pointer, a finger, a pen or a mouse, is tracked across them the way UIKit
  // tracks an alert's actions. The action under it highlights, the highlight
  // follows it from one action to the other, and the lift runs the action
  // under it, through its own click (none off both). Only the actions are
  // tracked: a press on the title or the message is not part of the group,
  // so their text stays selectable. Each tracked action carries the group
  // item marker from its first render: the document press controller leaves
  // a pointer's press there to the tracker, the one painter, and still
  // records the touch for the scroll brake. The inline preview is not
  // tracked, and its actions keep the controller's press.
  // Tracked while presented, leaving included: a press during either
  // transition is taken and dropped (`isInert`) rather than reaching the
  // button under it.
  const actionsRef = useRef<HTMLElement>(null);
  const isTracking = motion.isPresented && isInline !== true;
  useActionGroupTracking(actionsRef, {
    itemSelector: `[${PRESS_GROUP_ITEM_ATTRIBUTE}]`,
    highlightOnsetMs: alertController.actions.highlightOnsetMs,
    highlightExpansion: alertController.actions.highlightExpansion,
    isInert: () => !motion.acceptsTouches(),
    isEnabled: isTracking,
    // The row's touch-action is its own style (trackingRow); a held finger
    // or pen selects nothing while it holds (`spec:AST-094` FR41), and the
    // actions keep their default styles otherwise.
    manageStyle: false,
  });
  // While the alert leaves (closed by the caller, still presented while it
  // fades out under a finger), UIKit delivers no input to it: a click, Enter
  // or an assistive-technology activation on an action, and Escape, do
  // nothing until it is hidden. Focus stays where it is, so Dialog returns it
  // to the opener when the fade ends.
  const isLeaving = motion.isDriving && motion.isPresented && !isOpen;
  const handleCancel = useCallback(() => {
    if (!isLeaving) {
      onOpenChange(false);
    }
  }, [isLeaving, onOpenChange]);
  const handleAction = useCallback(() => {
    if (!isLeaving) {
      void onAction();
    }
  }, [isLeaving, onAction]);
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isLeaving) {
        onOpenChange(next);
      }
    },
    [isLeaving, onOpenChange],
  );
  const mergedRef = useMergedRefs(ref, motion.ref);
  const actionTrackingProps = isTracking ? pressGroupItemProps : undefined;

  const buttonActionStyle = [
    styles.action,
    isSmallScreen && styles.stackedAction,
  ];
  const cancelButton = (
    <Button
      key="cancel"
      variant="ghost"
      label={cancelLabel}
      onClick={handleCancel}
      xstyle={buttonActionStyle}
      {...actionTrackingProps}
      // Dialog focuses [data-autofocus] itself after showModal(), because
      // React's autoFocus runs during commit while the dialog is invisible.
      // Cancel is least destructive, so it remains the autofocus target even
      // when small-screen visual order places the destructive action above it.
      data-autofocus
    />
  );
  const actionButton = (
    <Button
      key="action"
      variant={actionVariant}
      label={actionLabel}
      onClick={handleAction}
      isLoading={isActionLoading}
      xstyle={buttonActionStyle}
      {...actionTrackingProps}
    />
  );

  return (
    <Dialog
      {...rest}
      ref={mergedRef}
      isOpen={motion.isPresented}
      isInline={isInline}
      onOpenChange={handleOpenChange}
      width={width}
      purpose="form"
      // `alertdialog` is a modal role: it promises an interruption the user
      // has to deal with, a focus trap, and an inert page behind it. The
      // inline path renders a plain always-present div with none of that, so
      // the role would misdescribe it. `group` keeps the title and
      // description associated with a container without claiming a dialog.
      role={isInline ? 'group' : 'alertdialog'}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...mergeProps(themeProps('alert-dialog'), {className, style})}
      xstyle={[motion.isDriving && styles.uikitMotion, xstyle]}
      data-testid={testId}>
      <Layout
        content={
          <LayoutContent>
            <Heading level={2} id={titleId}>
              {title}
            </Heading>
            <Text type="body" color="secondary" id={descriptionId}>
              {description}
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            {/* Generic Dialog footers should wrap, but their consumers own
                action semantics and order. AlertDialog keeps this
                destructive-above-Cancel narrow order because confirmation
                actions have component-specific meaning here. */}
            <Stack
              ref={actionsRef}
              xstyle={isTracking && styles.trackingRow}
              direction={isSmallScreen ? 'vertical' : 'horizontal'}
              gap={2}
              hAlign={isSmallScreen ? 'stretch' : 'end'}
              wrap={isSmallScreen ? 'nowrap' : 'wrap'}>
              {isSmallScreen
                ? [actionButton, cancelButton]
                : [cancelButton, actionButton]}
            </Stack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

AlertDialog.displayName = 'AlertDialog';
