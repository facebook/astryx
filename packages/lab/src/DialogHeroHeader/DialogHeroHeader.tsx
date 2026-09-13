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
 * Hero-style header for Dialog. The high-emphasis sibling of DialogHeader: a
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
 * The title alone carries Dialog's title id. A visible title declares default
 * focus intent; Dialog applies it after opening, with explicit descendant
 * focus requests taking priority. Hidden, inline, and standalone headers do
 * not request focus. MediaTheme stays mounted across media-mode changes so
 * the close button retains DOM identity and keyboard focus.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/DialogHeroHeader/DialogHeroHeader.doc.mjs (props, usage)
 * - /packages/lab/src/DialogHeroHeader/DialogHeroHeader.test.tsx (behavior)
 * - /packages/lab/src/DialogHeroHeader/index.ts (exports if types change)
 * - /apps/storybook/stories/DialogHeroHeader.stories.tsx (examples)
 */

import type {ReactElement, ReactNode} from 'react';
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
  // Title row below the media; startContent is outside the accessible label.
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    marginBlockStart: spacingVars['--spacing-4'],
  },
  startContent: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  // Allow the heading to shrink and truncate inside the flex row.
  titleHeading: {
    minWidth: 0,
    outline: 'none',
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
   * aria-label/aria-labelledby). The visible title is the default initial
   * focus target after the modal opens; an explicit descendant request wins.
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
 * via aria-labelledby. The visible title supplies the default initial focus
 * target after the modal opens; hidden titles and inline previews skip it.
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
  const dialogContext = useDialogContext();
  const shouldAutoFocus = dialogContext?.isInline === false && !isTitleHidden;
  const titleId = dialogContext?.titleId;
  const titleProps = {
    id: titleId,
    tabIndex: shouldAutoFocus ? -1 : undefined,
    // Private coordination with Dialog, which owns modal focus timing.
    'data-autofocus': shouldAutoFocus ? 'dialog-title' : undefined,
  };

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

  // Custom headings keep their own props. Their wrapper supplies the title
  // handshake without introspection and without naming the start-content slot.
  const titleRow = (
    <div {...stylex.props(styles.titleRow)}>
      {startContent != null && (
        <div {...stylex.props(styles.startContent)}>{startContent}</div>
      )}
      {typeof title === 'string' ? (
        <Heading
          {...titleProps}
          level={2}
          maxLines={maxLines}
          xstyle={styles.titleHeading}>
          {title}
        </Heading>
      ) : (
        <div {...titleProps} {...stylex.props(styles.titleHeading)}>
          {title}
        </div>
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
        {closeButton && (
          <MediaTheme mode={mediaMode ?? 'off'}>{closeButton}</MediaTheme>
        )}
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
