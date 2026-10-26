// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AlertDialog.tsx
 * @input Uses React, StyleX, Dialog, Layout, Heading, Text, Button, the touch
 *   presentation resolver, its touch layer (AlertDialogTouch) and the alert
 *   entries of the UIKit constants table
 * @output Exports AlertDialog component, AlertDialogProps type
 * @position Core implementation; consumed by index.ts, tested by AlertDialog.test.tsx
 *
 * Under a finger or a pen the two actions are tracked as one group, as UIKit tracks an
 * alert's actions: the action under the finger highlights at once, the
 * highlight follows the finger from one action to the other, and lifting runs
 * the action under the finger (none when it is off both). Tracking spans the
 * whole surface, so a touch that lands on the message can still slide onto an
 * action. A mouse, the keyboard and assistive technology keep the buttons'
 * own click.
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
 * - /packages/core/src/AlertDialog/AlertDialogTouch.ts (the touch layer)
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
import {useMediaQuery} from '../hooks';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {alertController} from '../motion/uikit/alert';
import {useTouchPresentation} from '../utils/touchPresentation';
import {useAlertDialogTouch} from './AlertDialogTouch';

const SMALL_SCREEN_QUERY = '(max-width: 640px)';

/** Marks the actions the touch tracking hit-tests. */
const ACTION_ATTRIBUTE = 'data-astryx-alert-action';

const styles = stylex.create({
  // The action tracking claims a touch on the surface the moment it lands, as
  // a long press does: the browser may pinch-zoom there but never pans (Chrome
  // on Android cancels a pointer it pans, which would cancel the group's
  // touch), and a double tap zooms nothing. A long alert's content keeps its
  // pan (see `isBodyScrollable`). The group's hold does something, so a held
  // finger or pen starts no text selection and opens no callout there
  // (`spec:AST-094` FR41; useActionGroupTracking); a mouse keeps selecting
  // text, which is why the host's permanent long-press styles stay off
  // (`manageStyle: false`).
  trackingSurface: {
    touchAction: 'pinch-zoom',
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
  // A compact row: the two actions split it evenly, as UIKit's do.
  sharedRowAction: {
    flexGrow: 1,
    flexBasis: 0,
  },
});

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
   * and under a finger UIKit's alert width, 320.
   * @default 400
   */
  width?: number | string;
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
  // Width stays delegated to Dialog. These queries exist only so AlertDialog
  // can keep its visual, DOM and tab order aligned for its destructive/cancel
  // semantics. Under a finger on a compact viewport the alert takes UIKit's
  // layout (the touch layer's useAlertActionLayout): a row, Cancel leading,
  // when each label fits its half; a stack, Cancel at the bottom, when one
  // does not. With a mouse the actions stack at 640px and below, the action
  // above Cancel, and that breakpoint follows the width alone.
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);

  // A finger is tracked across both actions as one group (UIKit's alert
  // tracking, in the touch layer); the backdrop, where a touch targets the
  // dialog itself, is not part of it. Each action opts out of its own press
  // tracking while the group owns its touches, and runs through its own click
  // at the lift. Under a finger the alert also appears and leaves the way
  // UIKit's does (the touch layer's useAlertMotion): it stays presented while
  // it fades out, and touches during either transition are taken and dropped.
  // Only under a touch presentation (a coarse primary pointer, after
  // hydration): where the primary pointer is fine nothing attaches, and a
  // finger keeps the browser's click (`spec:AST-094` FR13, FR19).
  const {isTouch, isCompact} = useTouchPresentation();
  // UIKit's action layout needs both a finger and a compact viewport (the
  // active theme's compact definition).
  const isCompactTouch = isTouch && isCompact;
  // UIKit's alert width under a finger (alertController.width), so the
  // presentation's 1.2 start stays on screen; with a mouse Dialog's 400.
  const width = widthProp ?? (isTouch ? alertController.width : 400);
  const surfaceRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const actionRowRef = useRef<HTMLElement>(null);
  const {isTracking, isBodyScrollable, motion, actionLayout} =
    useAlertDialogTouch(surfaceRef, {
      isOpen,
      isInline: isInline === true,
      isTouch,
      isCompactTouch,
      itemSelector: `[${ACTION_ATTRIBUTE}]`,
      bodyRef,
      actionRowRef,
      labels: [cancelLabel, actionLabel],
    });
  const isStacked = isCompactTouch ? actionLayout === 'stack' : isSmallScreen;
  // The actions fill the footer: a stack, or UIKit's shared row.
  const isFullWidth = isCompactTouch || isSmallScreen;
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
  const mergedRef = useMergedRefs(ref, surfaceRef, motion.ref);
  const actionTrackingProps = {
    [ACTION_ATTRIBUTE]: '',
    // Overrides Button's own marker for the document press controller, which
    // would otherwise paint (and un-paint) the same attribute on its own clock.
    'data-astryx-pressable': isTracking ? undefined : '',
  };

  const buttonActionStyle = [
    styles.action,
    isFullWidth && (isStacked ? styles.stackedAction : styles.sharedRowAction),
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
      xstyle={[
        isTracking && styles.trackingSurface,
        motion.isDriving && styles.uikitMotion,
        xstyle,
      ]}
      data-testid={testId}>
      <Layout
        content={
          <LayoutContent
            ref={bodyRef}
            xstyle={isTracking && !isBodyScrollable && styles.trackingSurface}>
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
                action semantics and order. AlertDialog keeps Cancel leading
                in a row and the destructive action above Cancel in a stack
                (UIKit's rule under a finger on a compact screen), because
                confirmation actions have component-specific meaning here. */}
            <Stack
              ref={actionRowRef}
              direction={isStacked ? 'vertical' : 'horizontal'}
              gap={2}
              hAlign={isFullWidth ? 'stretch' : 'end'}
              wrap={isFullWidth ? 'nowrap' : 'wrap'}>
              {isStacked
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
