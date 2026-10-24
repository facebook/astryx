// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AlertDialog.tsx
 * @input Uses React, StyleX, Dialog, Layout, Heading, Text, Button,
 *   useActionGroupTracking, useAlertMotion, the shared touch presentation
 *   resolver and the alert entries of the UIKit constants table
 * @output Exports AlertDialog component, AlertDialogProps type
 * @position Core implementation; consumed by index.ts, tested by AlertDialog.test.tsx
 *
 * Under a finger the two actions are tracked as one group, as UIKit tracks an
 * alert's actions: the action under the finger highlights at once, the
 * highlight follows the finger from one action to the other, and lifting runs
 * the action under the finger (none when it is off both). Tracking spans the
 * whole surface, so a touch that lands on the message can still slide onto an
 * action. A mouse, the keyboard and assistive technology keep the buttons'
 * own click.
 *
 * Under a finger it also appears and leaves the way UIKit's alert does
 * (useAlertMotion): it scales down from 1.2 and fades in with the dimming,
 * and leaves with a fade alone, both on the compositor; the dialog stays open
 * until the fade ends, and touches during either transition reach nothing.
 * Under a mouse the theme's entrance plays and the dialog closes at once.
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
import {useActionGroupTracking} from '../hooks/useActionGroupTracking';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {alertController} from '../motion/uikit/alert';
import {
  useMotionPresentation,
  useTouchPresentation,
} from '../utils/touchPresentation';
import {useAlertActionLayout} from './useAlertActionLayout';
import {useAlertMotion} from './useAlertMotion';

/** Marks the actions the touch tracking hit-tests. */
const ACTION_ATTRIBUTE = 'data-astryx-alert-action';

const styles = stylex.create({
  // The action tracking claims a touch on the surface the moment it lands, as
  // a long press does: the browser keeps panning and zooming a touch nobody
  // claims, and a held finger opens no callout and starts no text selection
  // (an alert's text is not selectable under a finger). A mouse keeps
  // selecting text, which is why the gesture host does not write these.
  trackingSurface: {
    touchAction: 'manipulation',
    WebkitTouchCallout: {default: null, '@media (pointer: coarse)': 'none'},
    WebkitUserSelect: {default: null, '@media (pointer: coarse)': 'none'},
    userSelect: {default: null, '@media (pointer: coarse)': 'none'},
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
   * Numbers are treated as pixels, strings are used as-is.
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
  width = 400,
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
  // Width stays delegated to Dialog. On a compact viewport the actions take
  // UIKit's layout (useAlertActionLayout): a row, Cancel leading, when each
  // label fits its half; a stack, Cancel at the bottom, when one does not.
  // The order follows available size, never pointer or hover capability, and
  // DOM and tab order always match the visual order.
  const {isCompact} = useTouchPresentation();

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // A finger is tracked across both actions as one group (UIKit's alert
  // tracking); the backdrop, where a touch targets the dialog itself, is not
  // part of it. Each action opts out of its own press tracking while the
  // group owns its touches, and runs through its own click at the lift.
  //
  // Under a finger the alert also appears and leaves the way UIKit's does
  // (useAlertMotion): it stays presented while it fades out, and touches
  // during either transition are taken and dropped.
  const motionPresentation = useMotionPresentation();
  const motion = useAlertMotion({
    isOpen,
    isEnabled: motionPresentation === 'uikit' && !isInline,
  });
  const surfaceRef = useRef<HTMLDialogElement>(null);
  const mergedRef = useMergedRefs(ref, surfaceRef, motion.ref);
  const isTracking = motion.isPresented && !isInline;
  useActionGroupTracking(surfaceRef, {
    itemSelector: `[${ACTION_ATTRIBUTE}]`,
    highlightOnsetMs: alertController.actions.highlightOnsetMs,
    highlightExpansion: alertController.actions.highlightExpansion,
    shouldTrack: target => target !== surfaceRef.current,
    isInert: () => !motion.acceptsTouches(),
    isEnabled: isTracking,
    manageStyle: false,
  });
  const actionRowRef = useRef<HTMLElement>(null);
  const isStacked =
    useAlertActionLayout(actionRowRef, {
      isCompact,
      itemSelector: `[${ACTION_ATTRIBUTE}]`,
      labels: [cancelLabel, actionLabel],
    }) === 'stack';
  const actionTrackingProps = {
    [ACTION_ATTRIBUTE]: '',
    // Overrides Button's own marker for the document press controller, which
    // would otherwise paint (and un-paint) the same attribute on its own clock.
    'data-astryx-pressable': isTracking ? undefined : '',
  };

  const buttonActionStyle = [
    styles.action,
    isCompact && (isStacked ? styles.stackedAction : styles.sharedRowAction),
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
      onClick={onAction}
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
      onOpenChange={onOpenChange}
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
                action semantics and order. A compact AlertDialog keeps UIKit's:
                Cancel leading in a row, at the bottom of a stack, because
                confirmation actions have component-specific meaning here. */}
            <Stack
              ref={actionRowRef}
              direction={isStacked ? 'vertical' : 'horizontal'}
              gap={2}
              hAlign={isCompact ? 'stretch' : 'end'}
              wrap={isCompact ? 'nowrap' : 'wrap'}>
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
