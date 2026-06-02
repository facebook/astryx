// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * TemplatePreviewPage — the full-bleed preview experience for a single
 * page template (/templates/<slug>).
 *
 * Mirrors the themes preview layout (ThemePackagePage): a large live
 * preview surface fills the page while a fixed "floating footer" pill
 * anchored to the bottom of the viewport carries the chrome — back
 * button, template name + description, "Open in Playground", and
 * "Use". There is intentionally no light/dark toggle here; the preview
 * follows the site's current mode.
 *
 * The live preview renders the template's real page.tsx component
 * (shared TEMPLATE_COMPONENTS map) at true scale inside a tall,
 * internally-scrollable frame so it reads like a real app window.
 *
 * "Use" opens a dialog showing the XDS CLI command that scaffolds the
 * template into a consumer app (`npx xds template <slug> <path>` →
 * copies the template's page.tsx into the target directory).
 */

import {Suspense, useState} from 'react';
import stylex from '@stylexjs/stylex';
import {ArrowLeftIcon} from '@heroicons/react/24/outline';
import {XDSText} from '@xds/core/Text';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';
import {useThemeMode} from '../app/providers';
import {getTemplateComponent} from './templateComponents';
import {buildPlaygroundHref} from './playgroundLink';
import css from './TemplatePreviewPage.module.css';

const styles = stylex.create({
  // Outer page wrapper. Locked to the viewport region below the site top
  // nav via position:fixed so it can't push the document taller (the
  // surrounding site layout uses an auto-height/document-scroll model with
  // its own content padding, which a plain calc height can't account for).
  // A flex column so the frame fills the remaining space; bottom padding
  // reserves room for the fixed footer pill.
  page: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 64px)',
    insetInline: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
    paddingInline: 'var(--spacing-4)',
    paddingTop: 'var(--spacing-4)',
    paddingBottom: 'calc(64px + var(--spacing-4) * 2)',
  },
  // Fallback shown when a template has no live component (e.g. WIP).
  emptyState: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-8)',
  },
  skeleton: {
    width: '100%',
    height: '100%',
  },
  // Floating footer wrapper — fixed strip across the viewport bottom.
  // pointerEvents:none lets clicks pass through the empty gutters; the
  // pill re-enables them.
  floatingFooter: {
    position: 'fixed',
    bottom: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    right: 'var(--spacing-4)',
    zIndex: 100,
    pointerEvents: 'none',
  },
  floatingFooterCard: {
    pointerEvents: 'auto',
    maxWidth: 960,
    marginInline: 'auto',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-high)',
  },
  floatingFooterTitle: {
    flex: 1,
    minWidth: 0,
  },
  // Single-line truncation keeps the pill compact; the description
  // hides on narrow viewports so the actions stay reachable.
  floatingFooterDescription: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: {
      default: 'block',
      '@media (max-width: 640px)': 'none',
    },
  },
  dialogIntro: {
    marginBottom: 'var(--spacing-4)',
  },
  dialogNote: {
    marginTop: 'var(--spacing-4)',
  },
});

interface TemplatePreviewPageProps {
  /** Template directory name — identical to the XDS CLI template name. */
  slug: string;
  /** Display name shown in the footer pill + Use dialog. */
  name: string;
  description?: string;
  /** Raw page.tsx source, used for the "Open in Playground" deep link. */
  source?: string;
}

export function TemplatePreviewPage({
  slug,
  name,
  description,
  source,
}: TemplatePreviewPageProps) {
  const {mode} = useThemeMode();
  const [isUseOpen, setIsUseOpen] = useState(false);
  const Component = getTemplateComponent(slug);

  // Suggested scaffold target — drops the template under the app's
  // route tree using the template's own slug as the segment name.
  const targetPath = `./src/app/${slug}`;
  const useCommand = `npx xds template ${slug} ${targetPath}`;

  return (
    <div {...stylex.props(styles.page)}>
      <div className={css.frame}>
        {Component ? (
          <Suspense
            fallback={
              <div {...stylex.props(styles.skeleton)}>
                <XDSSkeleton width="100%" height="100%" />
              </div>
            }>
            <XDSTheme theme={neutralTheme} mode={mode}>
              <Component />
            </XDSTheme>
          </Suspense>
        ) : (
          <div {...stylex.props(styles.emptyState)}>
            <XDSText type="body" color="secondary">
              A live preview isn&rsquo;t available for this template yet.
            </XDSText>
          </div>
        )}
      </div>

      {/* Use dialog — the canonical surface for the scaffold command.
          Static export can't write to the user's filesystem, so we
          surface the copy-pasteable XDS CLI command instead. */}
      <XDSDialog isOpen={isUseOpen} onOpenChange={setIsUseOpen} width={640}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title={`Use ${name}`}
              subtitle="Scaffold this template with the XDS CLI"
              onOpenChange={setIsUseOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText
                type="body"
                color="secondary"
                xstyle={styles.dialogIntro}>
                Run this in your project root. It copies the template&rsquo;s{' '}
                <code>page.tsx</code> into{' '}
                <code>{targetPath}</code>.
              </XDSText>
              <XDSCodeBlock
                code={useCommand}
                language="bash"
                hasCopyButton
              />
              <XDSText
                type="supporting"
                color="secondary"
                xstyle={styles.dialogNote}>
                Tip: run{' '}
                <code>npx xds template {slug}</code> to print the source, or{' '}
                <code>npx xds template {slug} --skeleton</code> for an
                annotated layout reference.
              </XDSText>
            </XDSLayoutContent>
          }
        />
      </XDSDialog>

      {/* Floating footer pill — back + title/description + actions.
          XDSToolbar inside an XDSCard for the pill chrome, matching the
          themes preview footer. No mode toggle by design. */}
      <div {...stylex.props(styles.floatingFooter)}>
        <XDSCard
          padding={3}
          variant="default"
          xstyle={styles.floatingFooterCard}>
          <XDSToolbar
            label="Template actions"
            gap={3}
            startContent={
              <XDSHStack gap={3} vAlign="center">
                <XDSButton
                  variant="ghost"
                  size="md"
                  label="Back to all templates"
                  isIconOnly
                  icon={<ArrowLeftIcon />}
                  href="/templates"
                />
                <XDSVStack gap={0} xstyle={styles.floatingFooterTitle}>
                  <XDSText type="body" weight="bold">
                    {name}
                  </XDSText>
                  {description && (
                    <XDSText
                      type="supporting"
                      color="secondary"
                      xstyle={styles.floatingFooterDescription}>
                      {description}
                    </XDSText>
                  )}
                </XDSVStack>
              </XDSHStack>
            }
            endContent={
              <XDSHStack gap={2} vAlign="center">
                {source && (
                  <XDSButton
                    label="Open in Playground"
                    variant="secondary"
                    onClick={() => {
                      window.location.href = buildPlaygroundHref(source);
                    }}
                  />
                )}
                <XDSButton
                  label="Use"
                  variant="primary"
                  onClick={() => setIsUseOpen(true)}
                />
              </XDSHStack>
            }
          />
        </XDSCard>
      </div>
    </div>
  );
}
