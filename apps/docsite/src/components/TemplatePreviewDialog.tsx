// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * TemplatePreviewDialog — opens a single template's live preview in a
 * large centered modal (instead of navigating to a full page), with
 * prev/next arrows to move quickly between templates in the gallery's
 * display order. Arrow keys (←/→) also navigate; Escape closes.
 *
 * The header surfaces template metadata (name, description) on
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
import {Icon} from '@astryxdesign/core/Icon';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Code} from '@astryxdesign/core/Code';
import {
  VStack,
  HStack,
  Layout,
  LayoutHeader,
  LayoutContent,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Tooltip} from '@astryxdesign/core/Tooltip';
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
  /** Dialog variant — pass 'fullscreen' on mobile for edge-to-edge preview. */
  variant?: 'fullscreen';
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
    position: 'relative' as const,
  },
  dialogHeader: {
    boxSizing: 'border-box',
    paddingInlineStart: '8px',
  },
  closeButton: {
    position: 'absolute' as const,
    top: 0,
    insetInlineEnd: 0,
  },
  desktopHeaderMeta: {
    flex: 1,
    minWidth: 0,
  },
  mobileHeaderMeta: {
    minWidth: 0,
    paddingInlineEnd: 48,
  },
  actionsRow: {
    width: '100%',
    minWidth: 0,
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

interface TemplatePreviewHeaderProps {
  item: TemplatePreviewItem;
  isFullscreen: boolean;
  cmdCopied: boolean;
  onCopyCommand: () => void;
  onClose: () => void;
}

function TemplatePreviewHeader({
  item,
  isFullscreen,
  cmdCopied,
  onCopyCommand,
  onClose,
}: TemplatePreviewHeaderProps) {
  const playgroundHref = item.source ? buildPlaygroundHref(item.source) : null;

  const metadata = (
    <VStack
      gap={0.5}
      xstyle={
        isFullscreen ? styles.mobileHeaderMeta : styles.desktopHeaderMeta
      }>
      <Heading level={2}>{item.name}</Heading>
      {item.description && (
        <Text type="body" color="secondary">
          {item.description}
        </Text>
      )}
    </VStack>
  );

  const copyButton = (
    <HStack gap={2} vAlign="center">
      <Code>{`npx astryx template ${item.slug}`}</Code>
      <Button
        variant="ghost"
        isIconOnly
        size="lg"
        label={cmdCopied ? 'Copied!' : 'Copy install command'}
        icon={<Icon icon={cmdCopied ? 'check' : 'copy'} color="inherit" />}
        onClick={onCopyCommand}
      />
    </HStack>
  );

  const playgroundButton = playgroundHref ? (
    <Button
      label="Open in Playground"
      variant="primary"
      size="lg"
      href={playgroundHref}
      onClick={() => {
        trackOpenPlayground({
          page: 'templates',
          item: item.slug,
          category: item.category,
        });
      }}
    />
  ) : null;

  const closeButton = (
    <Button
      variant="secondary"
      isIconOnly
      label="Close preview"
      size="lg"
      icon={<Icon icon="close" color="inherit" />}
      onClick={onClose}
      xstyle={isFullscreen ? styles.closeButton : undefined}
    />
  );

  const actions = (
    <HStack
      gap={2}
      vAlign="center"
      xstyle={isFullscreen ? styles.actionsRow : undefined}>
      {copyButton}
      {playgroundButton}
      {!isFullscreen && closeButton}
    </HStack>
  );

  return isFullscreen ? (
    <VStack gap={3} xstyle={styles.headerRow}>
      {metadata}
      {actions}
      {closeButton}
    </VStack>
  ) : (
    <HStack gap={4} vAlign="start" xstyle={styles.headerRow}>
      {metadata}
      {actions}
    </HStack>
  );
}

export function TemplatePreviewDialog({
  items,
  index,
  isOpen,
  onOpenChange,
  onIndexChange,
  variant,
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

  const useCommand = `npx astryx template ${current.slug} ./src/app/${current.slug}`;
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

  const isFullscreen = variant === 'fullscreen';

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variant={variant}
      width={isFullscreen ? undefined : 1400}
      maxHeight={isFullscreen ? undefined : '92vh'}
      xstyle={isFullscreen ? undefined : styles.dialogTall}
      aria-label={current.name}>
      <Layout
        height="fill"
        header={
          <LayoutHeader xstyle={styles.dialogHeader}>
            <TemplatePreviewHeader
              item={current}
              isFullscreen={isFullscreen}
              cmdCopied={cmdCopied}
              onCopyCommand={handleCopyCmd}
              onClose={() => onOpenChange(false)}
            />
          </LayoutHeader>
        }
        content={
          <LayoutContent isScrollable={false} padding={0}>
            <div {...stylex.props(styles.body)}>
              <TemplatePreviewSurface
                key={deferredCurrent.slug}
                slug={deferredCurrent.slug}
              />
              {isPending && (
                <div {...stylex.props(styles.skeletonOverlay)}>
                  <Skeleton width="100%" height="100%" />
                </div>
              )}
            </div>
          </LayoutContent>
        }
      />

      {count > 1 && !isFullscreen && (
        <>
          <div {...stylex.props(styles.navArrow, styles.navPrev)}>
            <Tooltip
              content={`Previous: ${items[(index - 1 + count) % count]?.name}`}
              placement="end">
              <Button
                variant="secondary"
                size="lg"
                isIconOnly
                label="Previous template"
                icon={<Icon icon="chevronLeft" color="inherit" />}
                onClick={() => go(-1)}
                xstyle={styles.navArrowButton}
              />
            </Tooltip>
          </div>
          <div {...stylex.props(styles.navArrow, styles.navNext)}>
            <Tooltip
              content={`Next: ${items[(index + 1) % count]?.name}`}
              placement="start">
              <Button
                variant="secondary"
                size="lg"
                isIconOnly
                label="Next template"
                icon={<Icon icon="chevronRight" color="inherit" />}
                onClick={() => go(1)}
                xstyle={styles.navArrowButton}
              />
            </Tooltip>
          </div>
        </>
      )}
    </Dialog>
  );
}
