// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import stylex from '@stylexjs/stylex';
import {ArrowLeft, Sun, Moon} from 'lucide-react';
import {XDSText} from '@xds/core/Text';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSTheme} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSButton} from '@xds/core/Button';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {ThemeShowcasePreview} from './ThemeShowcasePreview';
import {ThemeCardShowcase} from './ThemeCardShowcase';
import {getThemeImages} from './themeImages';

const styles = stylex.create({
  // Reserves bottom space equal to the floating footer's height +
  // surrounding margin so the last card row can scroll clear of the
  // pinned footer rather than disappearing behind it.
  page: {
    paddingBottom: 'calc(72px + var(--spacing-6))',
  },
  // Matches the preview card's 1200px max-width so the card
  // showcase visually aligns with the preview above it.
  showcaseBlock: {
    width: '100%',
    maxWidth: 1200,
    marginInline: 'auto',
  },
  previewCard: {
    overflow: 'hidden',
    // Match the "wide content" max-width used across the site
    // (home page showcases, docs index). Keeps the showcase from
    // running viewport-edge to viewport-edge on very wide screens
    // while staying noticeably wider than the 800px prose column
    // above it so the showcase grid still has room to breathe.
    maxWidth: 1200,
    width: '100%',
    marginInline: 'auto',
    // Use the theme's body background (not the card/muted surface)
    // so the preview reads as a real themed app — the surrounding
    // chrome (top nav, hero, etc.) sits on the theme's true body
    // color, which is what users would see in their own app.
    backgroundColor: 'var(--color-background-body)',
  },
  // Floating footer wrapper — fixed-positioned strip across the
  // viewport bottom. `pointerEvents: 'none'` lets clicks pass
  // through the empty space on either side of the centered pill;
  // the pill itself overrides this back to 'auto'.
  floatingFooter: {
    position: 'fixed',
    bottom: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    right: 'var(--spacing-4)',
    zIndex: 100,
    pointerEvents: 'none',
  },
  // Pill chrome — uses XDSCard default variant (which already
  // applies --color-background-card + --color-border) wrapped in
  // an XDSToolbar for layout + a11y. We layer max-width, centering,
  // pill radius, and shadow on top via xstyle.
  floatingFooterCard: {
    pointerEvents: 'auto',
    maxWidth: 960,
    marginInline: 'auto',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-high)',
  },
  // Take the remaining horizontal space between the back button
  // and the action cluster so title/description align nicely.
  floatingFooterTitle: {
    flex: 1,
    minWidth: 0,
  },
  // Single-line truncation keeps the pill compact; on narrow
  // viewports the description hides entirely so the action
  // cluster stays reachable.
  floatingFooterDescription: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: {
      default: 'block',
      '@media (max-width: 640px)': 'none',
    },
  },
});

interface ThemePackagePageProps {
  /** Vanity display title shown as the page heading (e.g. "Neutral"). */
  title: string;
  /** Full npm package name shown as small metadata below the title. */
  packageName: string;
  description?: string;
  version?: string;
  /**
   * Raw README markdown for the package. Rendered inside the Install
   * dialog (verbatim minus the top-level H1) — the dedicated page
   * itself doesn't surface README content inline, so the brand
   * experience (title + description + live themed preview) isn't
   * crowded by setup docs.
   */
  readme: string | null;
  theme: XDSDefinedTheme;
}

export function ThemePackagePage({
  title,
  packageName,
  description,
  version,
  readme,
  theme,
}: ThemePackagePageProps) {
  // Strip the leading "# <title>" since the dialog header already
  // shows the title — avoids a redundant heading at the top of the
  // rendered markdown body.
  const readmeBody = readme ? readme.replace(/^# .+\n+/, '') : null;
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const versionSuffix = version ? ` · ${version}` : '';
  // Resolve the product image set for this theme (falls back to
  // neutral if the theme doesn't have its own set yet).
  const images = getThemeImages(theme.name);

  return (
    <XDSVStack gap={8} xstyle={styles.page}>
      <XDSTheme theme={theme} mode={mode}>
        <XDSCard padding={0} variant="transparent" xstyle={styles.previewCard}>
          <ThemeShowcasePreview images={images} />
        </XDSCard>
      </XDSTheme>

      {/* Real-world card showcase — sits OUTSIDE the live preview
          card so it renders on the docsite's own astryx chrome
          rather than nested inside the theme's body color.
          Inventory + Checkout + Top customers cards flip light/
          dark in sync with the preview above via the mode prop. */}
      <div {...stylex.props(styles.showcaseBlock)}>
        <ThemeCardShowcase theme={theme} images={images} mode={mode} />
      </div>

      {/* Install dialog — the single canonical surface for setup
          info. Renders the full README inline so the dedicated
          page stays focused on the brand/preview experience and
          all install + advanced setup docs live behind the
          explicit "Install" CTA. */}
      <XDSDialog
        isOpen={isInstallOpen}
        onOpenChange={setIsInstallOpen}
        width={720}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title={`Install ${title}`}
              subtitle={`${packageName}${versionSuffix}`}
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

      {/* Floating footer — pinned to the bottom of the viewport with
          the page's title, description, mode toggle, and Install
          CTA. Uses XDSToolbar (for layout slots + roving tabindex
          a11y) nested inside an XDSCard (for the pill chrome —
          card surface, border, and shadow tokens). Bottom padding
          on the outer page wrapper (styles.page) ensures the last
          card row can scroll clear of the footer. */}
      <div {...stylex.props(styles.floatingFooter)}>
        <XDSCard
          padding={3}
          variant="default"
          xstyle={styles.floatingFooterCard}>
          <XDSToolbar
            label="Theme actions"
            gap={3}
            startContent={
              // Back button + title cluster. Lives together in
              // startContent so the title stays left-aligned with
              // the back button rather than centered between the
              // slots (XDSToolbar's centerContent uses an auto-
              // width center column, which would shrink the title
              // instead of letting it fill the space).
              <XDSHStack gap={3} vAlign="center">
                <XDSButton
                  variant="ghost"
                  size="md"
                  label="Back to all themes"
                  isIconOnly
                  icon={<ArrowLeft />}
                  href="/themes"
                />
                <XDSVStack gap={0} xstyle={styles.floatingFooterTitle}>
                  <XDSText type="body" weight="bold">
                    {title}
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
                <XDSButton
                  variant="ghost"
                  isIconOnly
                  label={
                    mode === 'light'
                      ? 'Switch preview to dark mode'
                      : 'Switch preview to light mode'
                  }
                  icon={
                    mode === 'light' ? <Moon size={20} /> : <Sun size={20} />
                  }
                  onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                />
                <XDSButton
                  label="Customize"
                  variant="secondary"
                  href={`/themes/playground/${theme.name}`}
                />
                <XDSButton
                  label="Install"
                  variant="primary"
                  onClick={() => setIsInstallOpen(true)}
                />
              </XDSHStack>
            }
          />
        </XDSCard>
      </div>
    </XDSVStack>
  );
}
