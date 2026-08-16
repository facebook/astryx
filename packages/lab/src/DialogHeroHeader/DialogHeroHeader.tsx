// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DialogHeroHeader.tsx
 * @input Uses React, StyleX, theme tokens, LayoutHeader, Button, Icon,
 *   Heading, MediaTheme, VisuallyHidden, useDialogContext, useTranslator
 * @output Exports DialogHeroHeader component, DialogHeroHeaderProps, and
 *   DialogHeroHeaderMediaMode
 * @position Lab implementation; consumed by index.ts, tested by
 *   DialogHeroHeader.test.tsx, demonstrated in Storybook
 *
 * Hero-style header for Dialog, ported from the internal XDSModalHeroHeader
 * (facebook/astryx#4182). The high-emphasis sibling of DialogHeader: a
 * full-bleed media slot sits above the title, and the close button overlays
 * the media's top-trailing corner.
 *
 * The media bleeds to the dialog's edges by cancelling the surrounding
 * LayoutHeader padding with negative margins driven by the
 * `--container-padding-*` custom properties (the same container-compensation
 * contract Section uses), so it tracks theme and per-dialog padding
 * automatically. Corner rounding comes free from the Dialog inner wrapper's
 * `overflow: hidden` + inherited radius.
 *
 * Content overlaid on the media (the close button) can't rely on ambient
 * theme tokens for contrast; `mediaMode` describes the media's luminance and
 * composes MediaTheme under the hood so the overlay picks up inverted tokens
 * (including its focus ring) when the media is dark.
 *
 * Title handshake: mirrors DialogHeader. The title row renders with the
 * parent Dialog's published title id (via the Dialog context) so the dialog
 * names itself through aria-labelledby, and the row receives focus on mount
 * for screen reader announcement, suppressed for inline documentation
 * previews.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/DialogHeroHeader/DialogHeroHeader.doc.mjs (props, usage)
 * - /packages/lab/src/DialogHeroHeader/DialogHeroHeader.test.tsx (behavior)
 * - /packages/lab/src/DialogHeroHeader/index.ts (exports if types change)
 * - /apps/storybook/stories/DialogHeroHeader.stories.tsx (examples)
 */

import {useEffect, useRef, type ReactElement, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {LayoutHeader} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Heading} from '@astryxdesign/core/Heading';
import {MediaTheme} from '@astryxdesign/core/theme';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {useDialogContext} from '@astryxdesign/core/Dialog/DialogContext';
import {useTranslator} from '@astryxdesign/core/i18n';

const styles = stylex.create({
  // Media container: full width of the header, media centered. Negative
  // margins cancel the LayoutHeader padding (published as
  // --container-padding-* custom properties) so the media bleeds to the
  // dialog's edges — the same compensation contract Section uses. Layout-only
  // wrapper: all paint lives on the caller's media and the Button.
  mediaArea: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginInlineStart: 'calc(-1 * var(--container-padding-inline-start, 0px))',
    marginInlineEnd: 'calc(-1 * var(--container-padding-inline-end, 0px))',
    marginBlockStart: 'calc(-1 * var(--container-padding-block-start, 0px))',
  },
  // Close button floats over the media's top-trailing corner (logical
  // properties keep it trailing under RTL, matching Drawer's controls).
  closeButton: {
    position: 'absolute',
    insetBlockStart: spacingVars['--spacing-2'],
    insetInlineEnd: spacingVars['--spacing-2'],
    zIndex: 1,
  },
  // Title row below the media. Programmatic focus target (tabIndex={-1});
  // outline suppressed like DialogHeader's focusable title.
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    marginBlockStart: spacingVars['--spacing-4'],
    outline: 'none',
  },
  startContent: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  // Allow the heading to shrink and truncate inside the flex row.
  titleHeading: {
    minWidth: 0,
  },
});

/**
 * Luminance of the media surface, forwarded to MediaTheme for content
 * rendered over the media (the close button).
 */
export type DialogHeroHeaderMediaMode = 'light' | 'dark';

export interface DialogHeroHeaderProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * The title of the dialog. A string is wrapped in a level 2 Heading
   * (matching DialogHeader); pass a pre-styled Heading element to customize
   * the heading treatment. Provides the accessible label for the parent
   * Dialog via aria-labelledby (unless the Dialog receives an explicit
   * aria-label/aria-labelledby) and receives focus when the dialog opens for
   * screen reader accessibility.
   */
  title: string | ReactElement;

  /**
   * The full-bleed visual rendered above the title (image, illustration, or
   * icon). Stretches to the dialog's padded edges; the close button overlays
   * its top-trailing corner. Size the media itself (e.g. width 100%) to fill
   * the slot.
   */
  media: ReactNode;

  /**
   * Luminance of the media surface. Composes MediaTheme under the hood so
   * content overlaid on the media (the close button) picks up contrast-safe
   * inverted tokens: 'dark' media gets light overlay content, 'light' media
   * gets dark overlay content. Omit to keep the ambient theme tokens.
   */
  mediaMode?: DialogHeroHeaderMediaMode;

  /**
   * Visually hides the title row while keeping it available to screen
   * readers, so the dialog stays named by the title.
   * @default false
   */
  isTitleHidden?: boolean;

  /**
   * Content placed before the title (e.g. an icon), inline with the heading.
   */
  startContent?: ReactNode;

  /**
   * Max lines before the title truncates with an ellipsis. Only applies when
   * `title` is a string (auto-wrapped in a Heading).
   */
  maxLines?: number;

  /**
   * Callback fired when the dialog visibility changes.
   * Called with `false` when the close button is clicked.
   * If not provided, no close button will be rendered.
   */
  onOpenChange?: (isOpen: boolean) => unknown;

  /**
   * Adds a themed border at the bottom edge.
   * Defaults to the parent Layout's `defaultHasDividers` context value.
   */
  hasDivider?: boolean;
}

/**
 * Hero-style header designed specifically for Dialog — the high-emphasis
 * sibling of DialogHeader.
 *
 * Renders a full-bleed media slot above the title for dialogs that open onto
 * a featured, marketing, or onboarding moment. The close button overlays the
 * media's top-trailing corner; set `mediaMode` so it composes MediaTheme and
 * stays legible over dark or light media. The title names the parent Dialog
 * via aria-labelledby and receives focus when a modal dialog opens (inline
 * documentation previews suppress this autofocus), exactly like DialogHeader.
 *
 * Uses LayoutHeader internally, so it drops into Layout's `header` slot the
 * same way DialogHeader does.
 *
 * @example
 * ```
 * <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
 *   <Layout
 *     header={
 *       <DialogHeroHeader
 *         title="Welcome aboard"
 *         media={<img src={hero} alt="" width="100%" />}
 *         mediaMode="dark"
 *         onOpenChange={open => setIsOpen(open)}
 *       />
 *     }
 *     content={<LayoutContent>Content</LayoutContent>}
 *     footer={<LayoutFooter hasDivider>Actions</LayoutFooter>}
 *   />
 * </Dialog>
 * ```
 */
export function DialogHeroHeader({
  title,
  media,
  mediaMode,
  isTitleHidden = false,
  startContent,
  maxLines,
  onOpenChange,
  hasDivider,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DialogHeroHeaderProps) {
  const t = useTranslator();
  const titleRowRef = useRef<HTMLDivElement>(null);
  const dialogContext = useDialogContext();
  const shouldAutoFocus = dialogContext?.isInline !== true;
  const titleId = dialogContext?.titleId;

  // Auto-focus the title row when mounted for screen reader accessibility,
  // mirroring DialogHeader. Inline dialogs are documentation/showcase
  // previews, so suppress focus to avoid stealing scroll position from the
  // surrounding page. The parent Dialog detects the title row (by `titleId`)
  // via a callback ref to set its default aria-labelledby — no registration
  // handshake needed here.
  useEffect(() => {
    if (shouldAutoFocus && titleRowRef.current) {
      titleRowRef.current.focus();
    }
  }, [shouldAutoFocus]);

  const closeButton = onOpenChange != null && (
    <Button
      variant="ghost"
      label={t('@astryx.dialog.close')}
      tooltip={t('@astryx.dialog.close')}
      icon={<Icon icon="close" color="inherit" />}
      onClick={() => {
        onOpenChange(false);
      }}
      isIconOnly
      xstyle={styles.closeButton}
    />
  );

  // The row (not the heading) carries the dialog's title id and the focus
  // target so a caller-provided Heading element participates in the
  // aria-labelledby handshake without prop injection.
  const titleRow = (
    <div
      ref={titleRowRef}
      id={titleId}
      tabIndex={-1}
      {...stylex.props(styles.titleRow)}>
      {startContent && (
        <div {...stylex.props(styles.startContent)}>{startContent}</div>
      )}
      {typeof title === 'string' ? (
        <Heading level={2} maxLines={maxLines} xstyle={styles.titleHeading}>
          {title}
        </Heading>
      ) : (
        title
      )}
    </div>
  );

  return (
    <LayoutHeader
      ref={ref}
      hasDivider={hasDivider}
      xstyle={xstyle}
      className={className}
      style={style}
      {...rest}>
      <div {...stylex.props(styles.mediaArea)}>
        {media}
        {closeButton &&
          (mediaMode != null ? (
            <MediaTheme mode={mediaMode}>{closeButton}</MediaTheme>
          ) : (
            closeButton
          ))}
      </div>
      {isTitleHidden ? (
        <VisuallyHidden as="div">{titleRow}</VisuallyHidden>
      ) : (
        titleRow
      )}
    </LayoutHeader>
  );
}

DialogHeroHeader.displayName = 'DialogHeroHeader';
