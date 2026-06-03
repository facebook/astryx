// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * ThemePreviewDialog — opens a single theme's live preview in a large
 * centered modal (instead of navigating to the dedicated /themes/<slug>
 * page), with prev/next arrows to move quickly between themes in the
 * gallery's display order. Arrow keys (←/→) also navigate; Escape closes.
 *
 * This is the themes analog of TemplatePreviewDialog. The body shows the
 * same content as the theme detail page (ThemePreviewSurface), the header
 * surfaces the theme name + description, an "Install" action (opens the
 * package README in a nested dialog), and a "Customize" action (opens the
 * theme playground). A floating close button sits at the top-right corner.
 *
 * The prev/next arrows are position:fixed inside the top-layer <dialog>,
 * so they sit in the backdrop gutters outside the dialog box.
 */

import {useEffect, useDeferredValue, useState, useTransition} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutHeader,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSTooltip} from '@xds/core/Tooltip';
import {ThemePreviewSurface} from './ThemePreviewSurface';

export interface ThemePreviewItem {
  /** Theme slug (matches XDSDefinedTheme.name and /themes/<slug>). */
  slug: string;
  /** Vanity display name shown as the dialog title (e.g. "Neutral"). */
  name: string;
  description?: string;
  /** Full npm package name (e.g. "@xds/theme-neutral"). */
  packageName: string;
  version?: string;
  /** Raw README markdown, rendered inside the Install dialog. */
  readme: string | null;
  theme: XDSDefinedTheme;
}

interface ThemePreviewDialogProps {
  items: ThemePreviewItem[];
  /** Index into `items` of the theme to show. */
  index: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Request a different theme (prev/next). */
  onIndexChange: (index: number) => void;
}

const styles = stylex.create({
  dialogTall: {
    height: '86vh',
    borderRadius: 'var(--radius-page)',
  },
  body: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
  },
  headerRow: {
    width: '100%',
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
  },
  skeletonOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'fixed',
    top: 'var(--spacing-5)',
    insetInlineEnd: 'var(--spacing-5)',
    zIndex: 1000,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
  },
  navArrow: {
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
  },
  navPrev: {
    insetInlineStart: 'var(--spacing-5)',
  },
  navNext: {
    insetInlineEnd: 'var(--spacing-5)',
  },
  navArrowButton: {
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
  },
});

export function ThemePreviewDialog({
  items,
  index,
  isOpen,
  onOpenChange,
  onIndexChange,
}: ThemePreviewDialogProps) {
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const count = items.length;
  const current = items[index];
  // The deferred index drives the heavy preview surface — it lags behind
  // the committed index during a transition, keeping the old theme
  // visible and the dialog interactive while the next one loads.
  const deferredIndex = useDeferredValue(index);
  const deferredCurrent = items[deferredIndex];

  const go = (delta: number) => {
    if (count === 0) {
      return;
    }
    startTransition(() => {
      onIndexChange((index + delta + count) % count);
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      // Don't steal arrow keys while the nested Install dialog is open.
      if (isInstallOpen) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, index, count, isInstallOpen]);

  // Close the Install dialog when switching themes.
  useEffect(() => {
    setIsInstallOpen(false);
  }, [index]);

  if (!current || !deferredCurrent) {
    return null;
  }

  // Strip the leading "# <title>" so the Install dialog header (which
  // already shows the title) isn't duplicated by the README's H1.
  const readmeBody = current.readme
    ? current.readme.replace(/^# .+\n+/, '')
    : null;
  const versionSuffix = current.version ? ` · ${current.version}` : '';

  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width={1400}
      maxHeight="92vh"
      xstyle={styles.dialogTall}
      aria-label={current.name}>
      <XDSLayout
        height="fill"
        content={
          <XDSLayoutContent isScrollable={false} padding={0}>
            <div {...stylex.props(styles.body)}>
              <ThemePreviewSurface
                key={deferredCurrent.slug}
                theme={deferredCurrent.theme}
              />
              {isPending && (
                <div {...stylex.props(styles.skeletonOverlay)}>
                  <XDSSkeleton width="100%" height="100%" />
                </div>
              )}
            </div>
          </XDSLayoutContent>
        }
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHStack gap={4} vAlign="center" xstyle={styles.headerRow}>
              <XDSVStack gap={0.5} xstyle={styles.headerMeta}>
                <XDSHeading level={2}>{current.name}</XDSHeading>
                {current.description && (
                  <XDSText type="body" color="primary">
                    {current.description}
                  </XDSText>
                )}
              </XDSVStack>
              <XDSHStack gap={2} vAlign="center">
                <XDSButton
                  label="Install"
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsInstallOpen(true)}
                />
                <XDSButton
                  label="Customize"
                  variant="primary"
                  size="lg"
                  href={`/themes/playground/${current.theme.name}`}
                />
              </XDSHStack>
            </XDSHStack>
          </XDSLayoutHeader>
        }
      />

      {/* Install dialog — renders the full package README inline, the
          same surface used on the dedicated /themes/<slug> page. */}
      <XDSDialog
        isOpen={isInstallOpen}
        onOpenChange={setIsInstallOpen}
        width={720}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title={`Install ${current.name}`}
              subtitle={`${current.packageName}${versionSuffix}`}
              onOpenChange={setIsInstallOpen}
            />
          }
          content={
            <XDSLayoutContent>
              {readmeBody ? (
                <XDSMarkdown headingLevelStart={3} contentWidth={680}>
                  {readmeBody}
                </XDSMarkdown>
              ) : (
                <XDSText type="body" color="secondary">
                  No setup documentation is available for this theme yet.
                </XDSText>
              )}
            </XDSLayoutContent>
          }
        />
      </XDSDialog>

      <div {...stylex.props(styles.closeButton)}>
        <XDSButton
          variant="ghost"
          isIconOnly
          label="Close preview"
          size="lg"
          icon={<XDSIcon icon="close" color="inherit" />}
          onClick={() => onOpenChange(false)}
        />
      </div>

      {count > 1 && (
        <>
          <div {...stylex.props(styles.navArrow, styles.navPrev)}>
            <XDSTooltip
              content={`Previous: ${items[(index - 1 + count) % count]?.name}`}
              placement="end">
              <XDSButton
                variant="secondary"
                size="lg"
                isIconOnly
                label="Previous theme"
                icon={<XDSIcon icon="chevronLeft" color="inherit" />}
                onClick={() => go(-1)}
                xstyle={styles.navArrowButton}
              />
            </XDSTooltip>
          </div>
          <div {...stylex.props(styles.navArrow, styles.navNext)}>
            <XDSTooltip
              content={`Next: ${items[(index + 1) % count]?.name}`}
              placement="start">
              <XDSButton
                variant="secondary"
                size="lg"
                isIconOnly
                label="Next theme"
                icon={<XDSIcon icon="chevronRight" color="inherit" />}
                onClick={() => go(1)}
                xstyle={styles.navArrowButton}
              />
            </XDSTooltip>
          </div>
        </>
      )}
    </XDSDialog>
  );
}
