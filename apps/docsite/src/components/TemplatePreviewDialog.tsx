// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * TemplatePreviewDialog — opens a single template's live preview in a
 * large centered modal (instead of navigating to a full page), with
 * prev/next arrows to move quickly between templates in the gallery's
 * display order. Arrow keys (←/→) also navigate; Escape closes.
 *
 * The header surfaces template metadata (category + name, description) on
 * the left. All controls cluster on the right of the header: a
 * copy-to-clipboard CLI scaffold command, an Open in Playground action,
 * and the close button.
 *
 * The preview sits in a padded, framed (border + radius) surface below the
 * header. The prev/next arrows are position:fixed inside the top-layer
 * <dialog>, so they sit in the backdrop gutters outside the dialog box.
 */

import {
  useCallback,
  useEffect,
  useDeferredValue,
  useState,
  useTransition,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSTooltip} from '@xds/core/Tooltip';
import {TemplatePreviewSurface} from './TemplatePreviewSurface';
import {buildPlaygroundHref} from './playgroundLink';
import {trackCopy, trackOpenPlayground, trackNavigate} from '../lib/analytics';

export interface TemplatePreviewItem {
  slug: string;
  name: string;
  description?: string;
  source?: string;
  category?: string;
}

interface TemplatePreviewDialogProps {
  items: TemplatePreviewItem[];
  /** Index into `items` of the template to show. */
  index: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Request a different template (prev/next). */
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
    paddingInline: '16px',
    paddingBlockEnd: '16px',
  },
  headerRow: {
    width: '100%',
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
  },
  categoryPrefix: {
    color: 'var(--color-text-primary)',
  },
  copyPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-card)',
    borderRadius: 'var(--radius-element)',
    paddingInline: 'var(--spacing-3)',
    height: 'var(--size-element-lg, 36px)',
    cursor: 'pointer',
    borderWidth: 'var(--border-width, 1px)',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 'var(--font-size-sm, 13px)',
    color: 'var(--color-text-primary)',
    userSelect: 'none',
    transitionProperty: 'background-color, border-color',
    transitionDuration: 'var(--duration-fast-min, 130ms)',
    transitionTimingFunction:
      'var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
  },
  copyPillHover: {
    backgroundColor: {
      ':hover':
        'var(--color-background-card-hover, var(--color-background-muted))',
    },
  },
  copyPillText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  skeletonOverlay: {
    position: 'absolute',
    insetInline: '16px',
    insetBlockEnd: '16px',
    insetBlockStart: 0,
    zIndex: 5,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
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

export function TemplatePreviewDialog({
  items,
  index,
  isOpen,
  onOpenChange,
  onIndexChange,
}: TemplatePreviewDialogProps) {
  const [cmdCopied, setCmdCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const count = items.length;
  const current = items[index];
  // The deferred index drives the heavy preview surface — it lags behind
  // the committed index during a transition, keeping the old template
  // visible and the dialog interactive while the next one loads.
  const deferredIndex = useDeferredValue(index);
  const deferredCurrent = items[deferredIndex];

  const go = (delta: number) => {
    if (count === 0) {
      return;
    }
    const nextIndex = (index + delta + count) % count;
    trackNavigate({
      page: 'templates',
      target: 'prev_next',
      direction: delta > 0 ? 'next' : 'prev',
      item: items[nextIndex]?.slug,
    });
    startTransition(() => {
      onIndexChange(nextIndex);
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
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
  }, [isOpen, index, count]);

  // Reset the share-copied state when switching templates.
  useEffect(() => {
    setCmdCopied(false);
  }, [index]);

  if (!current) {
    return null;
  }

  const useCommand = `npx xds template ${current.slug} ./src/app/${current.slug}`;
  // Capture in a local const so the narrowing survives into the onClick
  // closure below (property access on `current` widens back to
  // `string | undefined` inside a deferred callback).
  const playgroundSource = current.source;

  const handleCopyCmd = useCallback(() => {
    navigator.clipboard.writeText(useCommand).then(() => {
      setCmdCopied(true);
      trackCopy({
        page: 'templates',
        target: 'cli_command',
        item: current.slug,
        category: current.category,
      });
      setTimeout(() => setCmdCopied(false), 2000);
    });
  }, [useCommand, current.slug, current.category]);

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
        header={
          <XDSLayoutHeader xstyle={styles.headerRow}>
            <XDSHStack gap={4} vAlign="start" xstyle={styles.headerRow}>
              <XDSVStack gap={0.5} xstyle={styles.headerMeta}>
                <XDSHeading level={2}>
                  {current.category && (
                    <span {...stylex.props(styles.categoryPrefix)}>
                      {current.category}{' '}
                    </span>
                  )}
                  {current.name}
                </XDSHeading>
                {current.description && (
                  <XDSText type="body" color="secondary">
                    {current.description}
                  </XDSText>
                )}
              </XDSVStack>
              <XDSHStack gap={2} vAlign="center">
                <button
                  type="button"
                  onClick={handleCopyCmd}
                  aria-label="Copy install command"
                  {...stylex.props(styles.copyPill, styles.copyPillHover)}>
                  <span {...stylex.props(styles.copyPillText)}>
                    {cmdCopied ? 'Copied!' : `npx xds template ${current.slug}`}
                  </span>
                  <XDSIcon
                    icon={cmdCopied ? 'check' : 'copy'}
                    size="sm"
                    color="inherit"
                  />
                </button>
                {playgroundSource && (
                  <XDSButton
                    label="Open in Playground"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      trackOpenPlayground({
                        page: 'templates',
                        item: current.slug,
                        category: current.category,
                      });
                      window.location.href =
                        buildPlaygroundHref(playgroundSource);
                    }}
                  />
                )}
                <XDSButton
                  variant="secondary"
                  isIconOnly
                  label="Close preview"
                  size="lg"
                  icon={<XDSIcon icon="close" color="inherit" />}
                  onClick={() => onOpenChange(false)}
                />
              </XDSHStack>
            </XDSHStack>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent isScrollable={false} padding={0}>
            <div {...stylex.props(styles.body)}>
              <TemplatePreviewSurface
                key={deferredCurrent.slug}
                slug={deferredCurrent.slug}
              />
              {isPending && (
                <div {...stylex.props(styles.skeletonOverlay)}>
                  <XDSSkeleton width="100%" height="100%" />
                </div>
              )}
            </div>
          </XDSLayoutContent>
        }
      />

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
                label="Previous template"
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
                label="Next template"
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
