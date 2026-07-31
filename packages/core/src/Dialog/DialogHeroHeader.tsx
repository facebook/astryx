// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DialogHeroHeader.tsx
 * @input Uses React, useEffect, useRef, LayoutHeader, Button, Icon, Heading, Text, DialogContext
 * @output Exports DialogHeroHeader component and DialogHeroHeaderProps
 * @position Dialog hero header component; prominent sibling of DialogHeader for featured/onboarding dialogs
 *
 * The high-emphasis counterpart to DialogHeader: a larger, "hero" treatment
 * for dialogs that open onto a featured/marketing/onboarding moment. Adds an
 * optional media/visual slot and an eyebrow overline above a prominent title,
 * and centers its content by default. Shares DialogHeader's contract — the
 * title receives focus on open, names the parent Dialog via aria-labelledby,
 * and the close button is onOpenChange-driven. Actions belong in LayoutFooter,
 * not the header (Astryx's Layout owns the actions slot).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Dialog/Dialog.doc.mjs
 * - /packages/core/src/Dialog/DialogHeroHeader.doc.mjs
 * - /packages/core/src/Dialog/DialogHeroHeader.test.tsx
 * - /packages/core/src/Dialog/index.ts
 * - /apps/storybook/stories/DialogHeroHeader.stories.tsx
 * - /packages/cli/templates/blocks/components/Dialog/ (Dialog-family showcase blocks)
 * - /packages/cli/templates/blocks/components/DialogHeroHeader/ (showcase blocks)
 */

import {useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, sizeVars} from '../theme/tokens.stylex';
import {LayoutHeader} from '../Layout/LayoutHeader';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Heading} from '../Heading/Heading';
import {Text} from '../Text/Text';
import type {BaseProps} from '../BaseProps';
import {useDialogContext} from './DialogContext';
import {useTranslator} from '../i18n';

const styles = stylex.create({
  // Vertical stack of media, eyebrow, title, and subtitle. position:relative
  // anchors the absolutely-positioned close button to the header edge.
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  center: {
    alignItems: 'center',
  },
  start: {
    alignItems: 'flex-start',
  },
  // Reserve horizontal room so centered content never slides under the
  // corner close button. Center reserves both sides to stay symmetric;
  // start only needs the trailing edge cleared.
  reserveBoth: {
    paddingInline: sizeVars['--size-element-md'],
  },
  reserveEnd: {
    paddingInlineEnd: sizeVars['--size-element-md'],
  },
  // Media/visual slot: illustration, image, or icon tile above the title.
  media: {
    display: 'flex',
    // Extra breathing room below the visual before the text block.
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  titleFocusable: {
    outline: 'none',
  },
  // Close button floats in the top-trailing corner (above any media). The
  // negative offsets pull the icon button's visual edge out to the header's
  // padded boundary — same optical compensation as DialogHeader.
  closeButton: {
    position: 'absolute',
    insetBlockStart: `calc(-1 * ${spacingVars['--spacing-2']})`,
    insetInlineEnd: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
});

export interface DialogHeroHeaderProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * The title of the dialog, rendered at hero (display) scale.
   * This title receives focus when the dialog opens for screen reader
   * accessibility, and names the parent Dialog via aria-labelledby unless the
   * consumer passes an explicit aria-label/aria-labelledby to the Dialog.
   */
  title: string;

  /**
   * Optional supporting text displayed below the title in secondary color.
   * Use for a sentence or two of context on the featured moment.
   */
  subtitle?: string;

  /**
   * Optional short overline rendered above the title in accent color
   * (e.g. a category, "New", or a step label).
   */
  eyebrow?: string;

  /**
   * Optional media/visual slot rendered above the eyebrow and title —
   * an illustration, image, or icon tile. Provide your own sizing/visual;
   * the header only positions it per `align`.
   */
  media?: ReactNode;

  /**
   * Horizontal alignment of the hero content.
   * - `'center'` (default) — the classic centered hero treatment.
   * - `'start'` — left-aligned (inline-start), like DialogHeader.
   * @default 'center'
   */
  align?: 'center' | 'start';

  /**
   * Callback fired when the dialog visibility changes.
   * Called with `false` when the close button is clicked.
   * If not provided, no close button will be rendered.
   */
  onOpenChange?: (isOpen: boolean) => unknown;

  /**
   * Adds a themed border at the bottom edge.
   * When false, spacing collapse is applied automatically for seamless visual flow.
   * Defaults to the parent Layout's `defaultHasDividers` context value.
   */
  hasDivider?: boolean;
}

/**
 * Prominent, "hero"-style header for Dialog — the high-emphasis sibling of
 * DialogHeader.
 *
 * Renders an optional media/visual slot and eyebrow above a display-scale
 * title, with optional supporting text, centered by default. Like
 * DialogHeader, the title receives focus when a modal dialog opens (for
 * screen reader accessibility; inline documentation previews suppress this
 * autofocus), is an h2 with tabIndex={-1} so it can be programmatically
 * focused without entering the tab order, and names the parent Dialog via
 * aria-labelledby (unless the Dialog receives an explicit
 * aria-label/aria-labelledby). The close button is onOpenChange-driven.
 *
 * Uses LayoutHeader internally for consistent styling with other layout
 * headers. Actions (CTAs) belong in LayoutFooter, not here.
 *
 * @example
 * ```
 * <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
 *   <Layout
 *     header={
 *       <DialogHeroHeader
 *         media={<Icon icon="success" size="lg" color="accent" />}
 *         eyebrow="Welcome"
 *         title="You're all set up"
 *         subtitle="Your workspace is ready. Invite your team to get started."
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
  subtitle,
  eyebrow,
  media,
  align = 'center',
  onOpenChange,
  hasDivider,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DialogHeroHeaderProps) {
  const t = useTranslator();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dialogContext = useDialogContext();
  const shouldAutoFocus = dialogContext?.isInline !== true;
  const titleId = dialogContext?.titleId;
  const isCentered = align === 'center';
  const justify = isCentered ? 'center' : 'start';

  // Auto-focus the title when mounted for screen reader accessibility.
  // Inline dialogs are documentation/showcase previews, so suppress focus to
  // avoid stealing scroll position from the surrounding page. Mirrors
  // DialogHeader — the parent Dialog detects this title (by `titleId`) via a
  // callback ref to set its default aria-labelledby.
  useEffect(() => {
    if (shouldAutoFocus && titleRef.current) {
      titleRef.current.focus();
    }
  }, [shouldAutoFocus]);

  return (
    <LayoutHeader
      ref={ref}
      hasDivider={hasDivider}
      xstyle={xstyle}
      className={className}
      style={style}
      {...rest}>
      <div
        {...stylex.props(
          styles.container,
          isCentered ? styles.center : styles.start,
          onOpenChange && (isCentered ? styles.reserveBoth : styles.reserveEnd),
        )}>
        {media && <div {...stylex.props(styles.media)}>{media}</div>}
        {eyebrow && (
          <Text
            type="label"
            size="sm"
            color="accent"
            weight="semibold"
            justify={justify}>
            {eyebrow}
          </Text>
        )}
        <Heading
          ref={titleRef}
          id={titleId}
          level={2}
          type="display-3"
          tabIndex={-1}
          justify={justify}
          textWrap="balance"
          xstyle={styles.titleFocusable}>
          {title}
        </Heading>
        {subtitle && (
          <Text type="body" color="secondary" justify={justify}>
            {subtitle}
          </Text>
        )}
        {onOpenChange && (
          <Button
            variant="ghost"
            label={t('@astryx.dialog.close')}
            tooltip={t('@astryx.dialog.close')}
            icon={<Icon icon="close" color="inherit" />}
            onClick={() => {
              onOpenChange?.(false);
            }}
            isIconOnly
            xstyle={styles.closeButton}
          />
        )}
      </div>
    </LayoutHeader>
  );
}

DialogHeroHeader.displayName = 'DialogHeroHeader';
