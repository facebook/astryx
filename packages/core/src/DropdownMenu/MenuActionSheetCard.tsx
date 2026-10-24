// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MenuActionSheetCard.tsx
 * @input Menu data entries, the menu's label, Dialog, Button, Heading,
 *   AlertDialog's touch motion (useAlertMotion) and the shared action-group
 *   tracking (useActionGroupTracking)
 * @output Exports MenuActionSheetCard and isActionSheetCardEligible: the
 *   action sheet as UIKit presents it on a phone since iOS 26
 * @position Internal to DropdownMenu's bottom-sheet (action sheet)
 *   presentation, which renders it on a compact touch screen for a flat list
 *   of actions
 *
 * On iOS 26 an action sheet with no source view no longer slides up from the
 * bottom (iOS 18 and earlier did): it presents exactly as an alert does, a
 * card centered on the screen (measured on the iOS 26.2 simulator):
 *
 * - it scales from 1.2 to 1 and fades in while the dimming fades in, on the
 *   alert's spring, and leaves with a fade on the same spring; touches during
 *   either transition reach nothing (useAlertMotion);
 * - the actions are one stack with Cancel last, at the same weight;
 * - a finger is tracked across the actions as one group: the action under it
 *   highlights, sliding moves the highlight, the lift runs the action under
 *   it (useActionGroupTracking, with the alert's onset and expansion);
 * - a tap outside the card dismisses it, as does Escape.
 *
 * A menu whose rows open sub-menus, link elsewhere or carry a header or
 * footer keeps the bottom sheet: UIKit's action sheet has none of them.
 *
 * SYNC: When modified, update MenuActionSheetCard.test.tsx and
 * __tests__/DropdownMenuActionSheet.interaction.browser.spec.ts
 */

import React, {useId, useRef, type ReactElement, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useAlertMotion} from '../AlertDialog/useAlertMotion';
import {Button} from '../Button';
import {Dialog} from '../Dialog';
import {Divider} from '../Divider';
import {Heading} from '../Heading/Heading';
import {renderIconSlot} from '../Icon';
import {Layout} from '../Layout/Layout';
import {LayoutContent} from '../Layout/LayoutContent';
import {Stack} from '../Stack';
import {Text} from '../Text/Text';
import {useActionGroupTracking} from '../hooks/useActionGroupTracking';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {alertController} from '../motion/uikit/alert';
import {spacingVars} from '../theme/tokens.stylex';
import {useMotionPresentation} from '../utils/touchPresentation';
import type {
  DropdownMenuItemData,
  DropdownMenuOption,
  DropdownMenuSection,
} from './DropdownMenu';
import {opensSubMenu} from './opensSubMenu';

/** Marks the actions the touch tracking hit-tests. */
const ACTION_ATTRIBUTE = 'data-astryx-action-sheet-action';

const styles = stylex.create({
  // The tracking claims a touch on the card the moment it lands, as a long
  // press does: no callout, no text selection under a finger, no pan.
  trackingSurface: {
    touchAction: 'manipulation',
    WebkitTouchCallout: {default: null, '@media (pointer: coarse)': 'none'},
    WebkitUserSelect: {default: null, '@media (pointer: coarse)': 'none'},
    userSelect: {default: null, '@media (pointer: coarse)': 'none'},
  },
  // UIKit's alert motion drives the card: the theme's entrance stands down.
  uikitMotion: {
    animationName: 'none',
  },
  action: {
    width: '100%',
    minWidth: 0,
  },
  sectionTitle: {
    paddingBlockStart: spacingVars['--spacing-1'],
  },
});

function isSection(option: DropdownMenuOption): option is DropdownMenuSection {
  return 'type' in option && option.type === 'section';
}

function isDivider(option: DropdownMenuOption): boolean {
  return 'type' in option && option.type === 'divider';
}

/**
 * A row UIKit's action sheet can show: an action with a text label, not a
 * link or a level.
 */
function isPlainAction(item: DropdownMenuItemData): boolean {
  return (
    typeof item.label === 'string' &&
    item.href == null &&
    !opensSubMenu(item, {showsRegions: true}) &&
    item.header == null &&
    item.footer == null
  );
}

/**
 * Whether a menu's level can present as the action-sheet card: every row is
 * a plain action (sections and dividers allowed), and the level has no header
 * or footer of its own.
 */
export function isActionSheetCardEligible(
  items: ReadonlyArray<DropdownMenuOption>,
  {hasRegions}: {hasRegions: boolean},
): boolean {
  if (hasRegions || items.length === 0) {
    return false;
  }
  return items.every(option => {
    if (isDivider(option)) {
      return true;
    }
    if (isSection(option)) {
      return option.items.every(isPlainAction);
    }
    return isPlainAction(option as DropdownMenuItemData);
  });
}

export interface MenuActionSheetCardProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** The card's title and accessible name: the menu's label. */
  label: ReactNode;
  /** The flat actions (see isActionSheetCardEligible). */
  items: ReadonlyArray<DropdownMenuOption>;
  /** Runs a chosen action; the host closes the card unless it stays open. */
  onSelect: (item: DropdownMenuItemData, event: React.MouseEvent) => void;
  cancelLabel: string;
  /** Spread onto the card's content (the id the trigger's aria-controls names). */
  contentProps?: React.HTMLAttributes<HTMLDivElement> & {
    'data-testid'?: string;
  };
}

export function MenuActionSheetCard({
  isOpen,
  onOpenChange,
  label,
  items,
  onSelect,
  cancelLabel,
  contentProps,
}: MenuActionSheetCardProps): ReactElement {
  const titleId = useId();
  // UIKit's alert motion under a finger; the card only renders on a compact
  // touch screen, so a mouse reaching it (a docked tablet) keeps the theme's.
  const motion = useAlertMotion({
    isOpen,
    isEnabled: useMotionPresentation() === 'uikit',
  });
  const surfaceRef = useRef<HTMLDialogElement>(null);
  const mergedRef = useMergedRefs(surfaceRef, motion.ref);
  const isTracking = motion.isPresented;
  // The actions are tracked as one group, as an alert's are; a touch on the
  // backdrop (it targets the dialog itself) is not part of it.
  useActionGroupTracking(surfaceRef, {
    itemSelector: `[${ACTION_ATTRIBUTE}]`,
    highlightOnsetMs: alertController.actions.highlightOnsetMs,
    highlightExpansion: alertController.actions.highlightExpansion,
    shouldTrack: target => target !== surfaceRef.current,
    isInert: () => !motion.acceptsTouches(),
    isEnabled: isTracking,
    manageStyle: false,
  });
  const actionProps = {
    [ACTION_ATTRIBUTE]: '',
    // The group owns the press paint while it tracks; Button's own marker
    // would paint the same attribute on its own clock.
    'data-astryx-pressable': isTracking ? undefined : '',
  };

  const renderAction = (item: DropdownMenuItemData, key: string) => (
    <Button
      key={key}
      // Eligible rows have text labels (isPlainAction).
      label={item.label as string}
      variant={item.variant === 'destructive' ? 'destructive' : 'secondary'}
      icon={
        item.icon != null
          ? renderIconSlot(item.icon, {size: 'sm', color: 'inherit'})
          : undefined
      }
      isDisabled={item.isDisabled}
      onClick={event => onSelect(item, event)}
      xstyle={styles.action}
      {...actionProps}
    />
  );

  const rows: ReactNode[] = [];
  // Dividers carry no identity of their own: they are keyed by their order
  // among the dividers, which is stable for a given list of items.
  let dividers = 0;
  items.forEach((option, index) => {
    if (isDivider(option)) {
      dividers += 1;
      rows.push(<Divider key={`divider-${dividers}`} />);
      return;
    }
    if (isSection(option)) {
      if (option.title != null) {
        rows.push(
          <Text
            key={`section-${option.id ?? index}`}
            type="supporting"
            color="secondary"
            xstyle={styles.sectionTitle}>
            {option.title}
          </Text>,
        );
      }
      option.items.forEach((item, itemIndex) => {
        rows.push(
          renderAction(
            item,
            `item-${option.id ?? index}-${item.id ?? itemIndex}`,
          ),
        );
      });
      return;
    }
    const item = option as DropdownMenuItemData;
    rows.push(renderAction(item, `item-${item.id ?? index}`));
  });

  return (
    <Dialog
      ref={mergedRef}
      isOpen={motion.isPresented}
      onOpenChange={onOpenChange}
      // A tap on the dimming outside the card dismisses it, and Escape.
      purpose="info"
      aria-labelledby={titleId}
      xstyle={[
        isTracking && styles.trackingSurface,
        motion.isDriving && styles.uikitMotion,
      ]}>
      <Layout
        content={
          <LayoutContent>
            <div {...contentProps}>
              <Stack direction="vertical" gap={2} hAlign="stretch">
                <Heading level={2} id={titleId}>
                  {label}
                </Heading>
                {rows}
                <Button
                  label={cancelLabel}
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  xstyle={styles.action}
                  {...actionProps}
                  // Least destructive: where focus lands when the card opens.
                  data-autofocus
                />
              </Stack>
            </div>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

MenuActionSheetCard.displayName = 'MenuActionSheetCard';
