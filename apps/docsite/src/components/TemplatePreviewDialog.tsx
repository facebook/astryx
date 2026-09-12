// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * TemplatePreviewDialog — opens a single template's live preview in a
 * large centered modal (instead of navigating to a full page), with
 * prev/next arrows to move quickly between templates in the gallery's
 * display order. Arrow keys (←/→) also navigate; Escape closes.
 *
 * @input Template metadata, selected index, open state, and navigation callbacks.
 * @output A responsive dialog with immediate selected previews, selection-scoped
 * pending navigation, and template actions.
 * @position Shared preview controller for the templates gallery.
 *
 * The header surfaces template metadata (name, description) on
 * the left. All controls cluster on the right of the header: a
 * copy-to-clipboard CLI scaffold command, an Open in Playground action,
 * and the close button. The row wraps when the controls no longer fit
 * beside the title, and the fullscreen (phone) variant stacks the commands
 * and the primary action full width, with the close button pinned to the
 * top-inline-end corner — the header must never widen the dialog.
 *
 * The preview sits in a padded, framed (border + radius) surface below the
 * header. The prev/next arrows are position:fixed inside the top-layer
 * <dialog>, so they sit in the backdrop gutters outside the dialog box.
 */

import {
  useCallback,
  useEffect,
  useDeferredValue,
  useRef,
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
import {buildTemplatePlaygroundHref} from './playgroundLink';
import {trackCopy, trackOpenPlayground, trackNavigate} from '../lib/analytics';
import {CURRENT_TARGET} from '../lib/docsVersions';
import {
  shadcnRegistryIsPreview,
  shadcnRegistryOrigin,
} from '../generated/shadcnRegistry';
import {
  shadcnInstallCommand,
  shadcnPageItemPath,
} from '../lib/shadcnRegistry.mjs';

export interface TemplatePreviewItem {
  slug: string;
  name: string;
  description?: string;
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
    // The header never widens the dialog: a long command or a wide action row
    // shrinks or truncates instead. Without this the fullscreen dialog's
    // clipped body can be scrolled sideways by focus and never scrolled back.
    maxWidth: '100%',
    minWidth: 0,
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
    // Grow into the free space, but keep a readable floor: when the actions
    // no longer fit beside a 240px title block the header wraps instead of
    // squeezing the title to nothing.
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '240px',
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
  // Standard (desktop) header: the action cluster shares one line with the
  // title, so it has to be allowed to shrink — otherwise a narrow window
  // pushes "Open in Playground" past the dialog edge.
  actionsGroup: {
    flexShrink: 1,
    minWidth: 0,
  },
  // Command rows and the primary action stack on the fullscreen (mobile)
  // header, so each one gets the full width instead of competing for it.
  commandStack: {
    flexShrink: 1,
    minWidth: 0,
  },
  // The CLI command shrinks before the buttons do, and stays on one line.
  commandGroup: {
    flexShrink: 1,
    minWidth: 0,
  },
  commandLabel: {
    flexShrink: 0,
  },
  commandCode: {
    flexShrink: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noShrink: {
    flexShrink: 0,
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

type CopiedCommand = 'astryx' | 'shadcn' | null;

interface TemplatePreviewHeaderProps {
  item: TemplatePreviewItem;
  isFullscreen: boolean;
  copiedCommand: CopiedCommand;
  onCopyCommand: (kind: Exclude<CopiedCommand, null>) => void;
  onClose: () => void;
}

function TemplatePreviewHeader({
  item,
  isFullscreen,
  copiedCommand,
  onCopyCommand,
  onClose,
}: TemplatePreviewHeaderProps) {
  const playgroundHref = buildTemplatePlaygroundHref(item.slug);

  const metadata = (
    <VStack
      gap={0.5}
      xstyle={
        isFullscreen ? styles.mobileHeaderMeta : styles.desktopHeaderMeta
      }>
      <Heading level={2}>{item.name}</Heading>
      {item.description && (
        <Text type="body" color="secondary" maxLines={2}>
          {item.description}
        </Text>
      )}
    </VStack>
  );

  const copyButton = (
    <VStack gap={1} xstyle={styles.commandStack}>
      <HStack gap={2} vAlign="center" xstyle={styles.commandGroup}>
        <Text type="supporting" color="secondary" xstyle={styles.commandLabel}>
          Astryx CLI
        </Text>
        <Code
          xstyle={
            styles.commandCode
          }>{`npx @astryxdesign/cli template ${item.slug}`}</Code>
        <Button
          variant="ghost"
          isIconOnly
          size="lg"
          label={copiedCommand === 'astryx' ? 'Copied!' : 'Copy Astryx command'}
          icon={
            <Icon
              icon={copiedCommand === 'astryx' ? 'check' : 'copy'}
              color="inherit"
            />
          }
          onClick={() => onCopyCommand('astryx')}
          xstyle={styles.noShrink}
        />
      </HStack>
      {CURRENT_TARGET === 'canary' && (
        <HStack gap={2} vAlign="center" xstyle={styles.commandGroup}>
          <Text
            type="supporting"
            color="secondary"
            xstyle={styles.commandLabel}>
            {shadcnRegistryIsPreview ? 'shadcn preview (expires)' : 'shadcn'}
          </Text>
          <Code xstyle={styles.commandCode}>
            {shadcnInstallCommand(
              shadcnPageItemPath(item.slug),
              shadcnRegistryOrigin,
            )}
          </Code>
          <Button
            variant="ghost"
            isIconOnly
            size="lg"
            label={
              copiedCommand === 'shadcn'
                ? 'Copied!'
                : 'Copy ShadCN install command'
            }
            icon={
              <Icon
                icon={copiedCommand === 'shadcn' ? 'check' : 'copy'}
                color="inherit"
              />
            }
            onClick={() => onCopyCommand('shadcn')}
            xstyle={styles.noShrink}
          />
        </HStack>
      )}
    </VStack>
  );

  const playgroundButton = (
    <Button
      label="Open in Playground"
      variant="primary"
      size="lg"
      href={playgroundHref}
      width={isFullscreen ? '100%' : undefined}
      onClick={() => {
        trackOpenPlayground({
          page: 'templates',
          item: item.slug,
          category: item.category,
        });
      }}
      xstyle={styles.noShrink}
    />
  );

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

  // Fullscreen (mobile) stacks the actions: a phone cannot fit the command
  // rows and the primary action on one line, and squeezing them there is what
  // pushed the header past the viewport.
  const actions = isFullscreen ? (
    <VStack gap={2} xstyle={styles.actionsRow}>
      {copyButton}
      {playgroundButton}
    </VStack>
  ) : (
    <HStack gap={2} vAlign="center" xstyle={styles.actionsGroup}>
      {copyButton}
      {playgroundButton}
      {closeButton}
    </HStack>
  );

  return isFullscreen ? (
    <VStack gap={3} xstyle={styles.headerRow}>
      {metadata}
      {actions}
      {closeButton}
    </VStack>
  ) : (
    <HStack gap={4} vAlign="start" wrap="wrap" xstyle={styles.headerRow}>
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
  const [copiedCommand, setCopiedCommand] = useState<CopiedCommand>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingPreviewItem, setPendingPreviewItem] =
    useState<TemplatePreviewItem | null>(null);

  // Release the top layer when this dialog is torn down while still open.
  //
  // `showModal()` makes the rest of the document inert, and `close()` is the
  // only thing that undoes it — removing the element does not. Dialog closes on
  // an `isOpen` transition, which never happens here: "Open in Playground" is a
  // client-side navigation, so React tears this subtree down with the dialog
  // still open and the playground arrives with an invisible modal holding the
  // whole page inert, unclickable until a reload.
  //
  // The element is captured on mount rather than read during cleanup, because
  // by cleanup time this tree is on its way out and `closest()` may no longer
  // reach it. Teardown, not unmount: React destroys effects when a subtree is
  // hidden too, which is what a router does to the outgoing route — and that is
  // the path that was breaking.
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dialog = hostRef.current?.closest('dialog');
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  const count = items.length;
  const current = items[index];
  // Router work may outlive closing or selecting another card. Retire its
  // preview state during render so it cannot cover a newer selection.
  if (
    pendingPreviewItem !== null &&
    (!isOpen || pendingPreviewItem !== current)
  ) {
    setPendingPreviewItem(null);
  }
  const isPreviewPending =
    isPending && isOpen && pendingPreviewItem === current;
  // Only pending prev/next navigation may retain the deferred preview beneath
  // its skeleton. Opening a card or syncing a URL must show the current item
  // immediately, even if the mounted dialog's deferred index is still stale.
  const deferredIndex = useDeferredValue(index);
  const deferredCurrent = items[deferredIndex];
  const previewCurrent = isPreviewPending ? deferredCurrent : current;

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
    setPendingPreviewItem(current);
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

  // Reset copied state when switching templates.
  useEffect(() => {
    setCopiedCommand(null);
  }, [index]);

  if (!current) {
    return null;
  }

  const astryxCommand = `npx @astryxdesign/cli template ${current.slug} ./src/app/${current.slug}`;
  const shadcnCommand = shadcnInstallCommand(
    shadcnPageItemPath(current.slug),
    shadcnRegistryOrigin,
  );
  const handleCopyCmd = useCallback(
    (kind: Exclude<CopiedCommand, null>) => {
      if (kind === 'shadcn' && CURRENT_TARGET !== 'canary') {
        return;
      }
      const command = kind === 'astryx' ? astryxCommand : shadcnCommand;
      navigator.clipboard.writeText(command).then(() => {
        setCopiedCommand(kind);
        trackCopy({
          page: 'templates',
          target: kind === 'astryx' ? 'cli_command' : 'install_command',
          item: current.slug,
          category: current.category,
        });
        setTimeout(() => setCopiedCommand(null), 2000);
      });
    },
    [astryxCommand, shadcnCommand, current.slug, current.category],
  );

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
              copiedCommand={copiedCommand}
              onCopyCommand={handleCopyCmd}
              onClose={() => onOpenChange(false)}
            />
          </LayoutHeader>
        }
        content={
          <LayoutContent isScrollable={false} padding={0}>
            <div {...stylex.props(styles.body)} ref={hostRef}>
              <TemplatePreviewSurface
                key={previewCurrent.slug}
                slug={previewCurrent.slug}
              />
              {isPreviewPending && (
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
