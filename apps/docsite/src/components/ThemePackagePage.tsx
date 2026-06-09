// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {usePathname, useRouter} from 'next/navigation';
import {Sun, Moon} from 'lucide-react';
import {durationVars, easeVars} from '@xds/core/theme/tokens.stylex';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSTheme} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSSelectableCard} from '@xds/core/SelectableCard';
import {XDSSelector} from '@xds/core/Selector';
import {XDSDivider} from '@xds/core/Divider';
import {ThemeShowcasePreview} from './ThemeShowcasePreview';
import {ThemeCardShowcase} from './ThemeCardShowcase';
import {getThemeImages} from './themeImages';
import {packages} from '../generated/packageRegistry';
import {themeObjects} from '../generated/themeRegistry';

// Gallery order — themes are listed in the same canonical visual-
// closeness order used elsewhere (most restrained → most expressive).
// Lives here so the sidebar's theme list reads in the same order as
// /themes (Neutral → Stone → Gothic → Matcha → Y2K → Butter). Any
// theme not in this list falls to the end alphabetically.
const THEME_ORDER: ReadonlyArray<string> = [
  '@xds/theme-neutral',
  '@xds/theme-stone',
  '@xds/theme-gothic',
  '@xds/theme-matcha',
  '@xds/theme-y2k',
  '@xds/theme-butter',
];

// The package whose selection corresponds to the canonical bare
// `/themes` URL (no `?theme=` query string). Must agree with the
// `DEFAULT_THEME_PACKAGE` constant in `app/(site)/themes/page.tsx`,
// which uses the same value to seed the page when no query param
// is present — if these drift, the picker will round-trip the URL
// (selecting the "default" theme would write a query that the
// server then strips on reload, etc.).
const DEFAULT_THEME_PACKAGE = '@xds/theme-neutral';

// Strip "Theme: " prefix and " Theme" suffix from the registered
// displayName so the switcher labels read as the brand wordmark
// ("Neutral", "Butter") rather than the redundant decorations.
// Mirrors the same helper used on the /themes overview page.
function themeLabel(displayName: string): string {
  return displayName.replace(/^Theme:\s*/, '').replace(/\s*Theme$/, '');
}

// Strip the `@xds/theme-` prefix so the slug matches the URL form
// used by both the dynamic redirect route (`/themes/<slug>`) and
// the explorer's `?theme=<slug>` query param. Mirrored from the
// helper on the server-side page.tsx so the encode/decode stays in
// sync at a single import boundary.
function packageNameToSlug(packageName: string): string {
  return packageName.replace(/^@xds\/theme-/, '');
}

// Below this viewport width the sidebar collapses to a compact
// XDSSelector dropdown + inline action row above the preview. The
// sidebar is hidden via @media at the same breakpoint so the two
// surfaces don't double-render. Picked so the right pane keeps
// enough horizontal room for the themed preview's product grid.
const SIDEBAR_BREAKPOINT = '@media (max-width: 900px)';

// Fixed sidebar width — compact enough that the right pane gets the
// lion's share of horizontal space, wide enough to fit the longest
// theme name, the hero heading + description, and the full-width
// "Build a custom theme" / "How theming works" CTAs at size="md".
const SIDEBAR_WIDTH = 260;

// Sticky-top offset for the sidebar. Clears the docsite's sticky
// XDSAppShell top nav (which uses --appshell-header-height,
// populated post-hydration) plus a touch of breathing room so the
// sidebar pill doesn't look glued to the nav's bottom edge.
const SIDEBAR_STICKY_TOP =
  'calc(var(--appshell-header-height, 64px) + var(--spacing-4))';

// Sidebar-leave animation — slides the sidebar off the left edge
// and fades it out. Triggered when the user clicks Customize: the
// keyframe runs for one --duration-medium tick, then the click
// handler navigates to the playground. The right preview stays
// visually anchored during the leave, so the transition reads as
// "swap the left panel for the editor" rather than a generic page
// change — the playground page renders its own editor controls in
// roughly the same column when it mounts.
const sidebarLeaveKeyframes = stylex.keyframes({
  from: {transform: 'translateX(0)', opacity: 1},
  to: {transform: 'translateX(-100%)', opacity: 0},
});

const styles = stylex.create({
  // Outer two-column container. Sidebar (fixed width) sits left,
  // right pane (flex:1) holds the existing preview + showcase. The
  // gap keeps the two surfaces from butting against each other.
  // alignItems:flex-start so the sticky sidebar's vertical reference
  // is the column top, not the (potentially shorter) sidebar height.
  twoColumn: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
    [SIDEBAR_BREAKPOINT]: {
      flexDirection: 'column' as const,
    },
  },
  // Applied to the sidebar while the leave animation is playing.
  // Slides the sidebar off the left edge + fades it out so the
  // right preview stays put visually until the playground replaces
  // it. Forward fill-mode holds the end state so there's no flash
  // of the sidebar reverting before the navigation swaps the route.
  // Honors prefers-reduced-motion by collapsing to a zero-duration
  // animation so the leave is instant for users who'd find the
  // slide motion distracting.
  sidebarLeaving: {
    animationName: sidebarLeaveKeyframes,
    animationDuration: durationVars['--duration-medium'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'forwards',
    pointerEvents: 'none' as const,
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0s',
    },
  },
  // Sticky sidebar wrapper. position:sticky keeps the panel in view
  // while the right pane scrolls past; top offset clears the docsite
  // top nav so the sidebar doesn't disappear behind it. flex:0 0 auto
  // pins the width to SIDEBAR_WIDTH; the right pane (flex:1) absorbs
  // any leftover horizontal space. Hidden at narrow viewports — the
  // mobile selector + actions row takes its place above the preview.
  //
  // Caps the sidebar at the viewport height (minus the top nav and
  // matching bottom breathing room) and gives it its own scroll
  // container via overflowY:auto. Without that, the sticky panel
  // tracks the viewport but its own contents extend off the bottom
  // edge — users have to scroll the whole page to the bottom before
  // the rest of the sidebar comes into view. With the cap + inner
  // overflow, the sidebar scrolls independently of the page.
  sidebar: {
    flex: '0 0 auto',
    width: SIDEBAR_WIDTH,
    position: 'sticky' as const,
    top: SIDEBAR_STICKY_TOP,
    maxHeight: `calc(100dvh - var(--appshell-header-height, 64px) - var(--spacing-4) * 2)`,
    overflowY: 'auto' as const,
    [SIDEBAR_BREAKPOINT]: {
      display: 'none',
    },
  },
  // Sidebar card — surface chrome (background, border, radius).
  // Padding is generous-but-compact so the inner action stack +
  // theme list breathe without burning horizontal space the right
  // pane needs.
  sidebarCard: {
    padding: 'var(--spacing-4)',
  },
  // Right column — takes the rest of the horizontal space. The
  // inner preview + showcase blocks keep their own 1200px caps so
  // the right pane just hosts them; it doesn't impose its own
  // width constraint. minWidth:0 lets flex shrink it correctly
  // when the viewport is narrow.
  rightColumn: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-8)',
  },
  // Theme list — vertical stack of themed cards, one per theme.
  // gap separates each card so the inset accent border of the
  // selected card has breathing room around it (rather than
  // bumping into neighboring cards).
  themeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-2)',
  },
  // Make every action button (hero CTAs, mode toggle, Customize)
  // stretch to the sidebar width and left-align its label
  // (XDSButton's default is centered, which looks off in a vertical
  // nav-style list).
  themeListButton: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  // Hero primary CTA — sits on a flex row beside the icon-only
  // mode toggle. flex:1 + minWidth:0 lets it absorb the leading
  // horizontal space so the icon button stays pinned to the
  // trailing edge regardless of label length.
  heroPrimaryButton: {
    flex: 1,
    minWidth: 0,
  },
  // Themed theme-row card. The XDSSelectableCard wrapper itself
  // stays variant="transparent" + padding=0 so it doesn't paint a
  // surface from the OUTER docsite theme; the inner themedSurface
  // div (rendered inside its own <XDSTheme>) does the painting using
  // the theme being represented. That way each card reads as a
  // miniature brand preview rather than a docsite-Astryx card with
  // theme-colored text on top.
  themeCard: {
    width: '100%',
  },
  // Inner card surface — lives inside the per-card <XDSTheme>
  // wrapper so the theme's heading typography (used by the
  // wordmark) + brand color tokens (used by the gradient) all
  // resolve to the represented theme's values. Each card becomes
  // a mood tile: soft multi-radial gradient backdrop made from
  // the theme's accent + categorical hues, with the wordmark
  // centered on top in the theme's heading font.
  //
  // Fixed height so every card lines up identically regardless of
  // the theme's heading font (cursive themes render glyphs taller
  // than sans-serif themes). 120px reads as a hero tile rather
  // than a list row.
  //
  // Gradient is a stack of 5 radial gradients placed at the
  // corners + center, using semi-transparent theme colors so they
  // blend into each other (rather than stacking as discrete
  // blobs). Mixed with surface as the base so light + dark themes
  // both get a soft, painterly look.
  themedSurface: {
    height: 120,
    padding: 'var(--spacing-4)',
    // Hardcoded radius rather than var(--radius-container) so each
    // card matches the others regardless of the represented theme's
    // own container radius. (Matcha uses a smaller container
    // radius than Neutral, which would otherwise visibly differ
    // when its card lives in the picker beside the others.) The
    // outer XDSSelectableCard's selected-state inset shadow uses
    // the same radius implicitly via its own borderRadius, so this
    // value should stay in sync with the docsite's container
    // radius (12px in Astryx).
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
    backgroundImage: [
      // Top-left: accent
      'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--color-accent) 65%, transparent), transparent 60%)',
      // Top-right: orange categorical
      'radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-background-orange) 70%, transparent), transparent 60%)',
      // Bottom-left: green categorical
      'radial-gradient(circle at 0% 100%, color-mix(in srgb, var(--color-background-green) 70%, transparent), transparent 60%)',
      // Bottom-right: blue categorical
      'radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--color-background-blue) 70%, transparent), transparent 60%)',
      // Center: accent-muted bloom that softens everything else
      'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-accent-muted) 50%, transparent), transparent 70%)',
    ].join(', '),
  },
  // Per-theme bespoke picker artwork — one rule per theme that
  // has a custom photo (vs. the multi-radial-gradient default).
  // Each rule sets the picker card's background to a dedicated
  // /theme-<slug>-picker.png image. These are SEPARATE files from
  // the /theme-<slug>-preview.png images used on the /themes
  // overview + detail page hero — these picker assets are sized
  // and art-directed for the small 120px-tall picker card.
  // background-size:cover so each image always fills the card
  // regardless of the source's intrinsic dimensions.
  surfaceButter: {
    backgroundColor: 'transparent',
    backgroundImage: 'url(/theme-butter-picker.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceGothic: {
    backgroundColor: 'transparent',
    backgroundImage: 'url(/theme-gothic-picker.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceY2k: {
    backgroundColor: 'transparent',
    backgroundImage: 'url(/theme-y2k-picker.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceStone: {
    backgroundColor: 'transparent',
    backgroundImage: 'url(/theme-stone-picker.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceNeutral: {
    backgroundColor: 'transparent',
    backgroundImage: 'url(/theme-neutral-picker.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceMatcha: {
    backgroundColor: 'transparent',
    backgroundImage: 'url(/theme-matcha-picker.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  // Per-theme wordmark color override. Most image-backed cards use
  // --color-accent for the wordmark so the brand signature reads
  // as the dominant text element on top of the photo backdrop
  // (the default --color-text-primary often disappears into a
  // busy image, whereas the theme's accent provides natural
  // contrast against the rest of the brand-colored artwork).
  // The token resolves inside each card's own <XDSTheme> wrapper,
  // so each card picks up its theme's accent — Butter's brand
  // blue, Gothic's accent, etc.
  labelAccent: {
    color: 'var(--color-accent)',
  },
  // White wordmark override for cards whose photo backdrop is too
  // dark / busy for the theme accent to read against (e.g. Stone's
  // dark thistle photo). Uses --color-on-dark which resolves to
  // white in both modes.
  labelOnDark: {
    color: 'var(--color-on-dark)',
  },
  // Theme name on top of the gradient — rendered in the theme's
  // heading font so the wordmark previews the brand at a glance.
  // Color uses --color-text-primary so it reads against the soft
  // gradient backdrop in both light and dark themes.
  //
  // Fixed fontSize (24px) overrides each theme's own heading type-
  // scale so the picker reads at a uniform size across all 6 cards.
  // Without this, themes with larger heading defaults (e.g. Gothic's
  // Manufacturing Consent display family) render noticeably bigger
  // than themes with smaller defaults. Wide-glyph cursive fonts
  // (e.g. Matcha's script) still render visually wider than sans-
  // serif fonts at the same nominal size — that's a function of
  // the font's character widths, not the size — so we add ellipsis
  // truncation as a defensive measure for the longest wordmarks.
  //
  // position:relative + zIndex:1 keeps the wordmark sitting cleanly
  // on top of the multi-gradient stack underneath.
  themeCardLabel: {
    // Don't pin fontFamily — let each theme's type:display-3
    // component override drive the typography. That way Butter
    // renders in Sarina (cursive), Gothic in Manufacturing Consent
    // (distressed display), and themes without a display family
    // override fall back to their heading font (Outfit, system,
    // etc.). The XDSText below uses type="display-3" so the
    // .xds-text.display-3 selector in each theme's @scope'd CSS
    // applies the right family per card.
    fontSize: 32,
    lineHeight: 1.2,
    color: 'var(--color-text-primary)',
    maxWidth: '100%',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    position: 'relative' as const,
    zIndex: 1,
  },
  // Mobile-only top bar that replaces the sidebar at narrow
  // viewports. Holds the back link + theme dropdown + the same
  // action cluster (mode toggle, Customize, Install) in a single
  // horizontal row, wrapping if needed.
  mobileBar: {
    display: 'none',
    [SIDEBAR_BREAKPOINT]: {
      display: 'flex',
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      alignItems: 'center',
      gap: 'var(--spacing-2)',
      padding: 'var(--spacing-3)',
      borderRadius: 'var(--radius-container)',
      borderWidth: 'var(--border-width)',
      borderStyle: 'solid',
      borderColor: 'var(--color-border)',
      backgroundColor: 'var(--color-background-card)',
    },
  },
  // Mobile selector grows to take the leading flex space so the
  // action buttons cluster on the trailing edge of the bar.
  mobileSelector: {
    flex: 1,
    minWidth: 160,
  },
  // Preview card — unchanged from the floating-toolbar version.
  // Matches the "wide content" max-width used across the site
  // (home page showcases, docs index). Keeps the showcase from
  // running viewport-edge to viewport-edge on very wide screens
  // while staying noticeably wider than the 800px prose column
  // above it so the showcase grid still has room to breathe.
  previewCard: {
    overflow: 'hidden',
    maxWidth: 1200,
    width: '100%',
    marginInline: 'auto',
    // Use the theme's body background (not the card/muted surface)
    // so the preview reads as a real themed app — the surrounding
    // chrome (top nav, hero, etc.) sits on the theme's true body
    // color, which is what users would see in their own app.
    backgroundColor: 'var(--color-background-body)',
  },
  // Matches the preview card's 1200px max-width so the card
  // showcase visually aligns with the preview above it.
  showcaseBlock: {
    width: '100%',
    maxWidth: 1200,
    marginInline: 'auto',
  },
});

// Per-theme override registry for the picker cards. Themes without
// an entry here render with the default radial-gradient backdrop
// + default --color-text-primary wordmark. Themes WITH an entry
// can swap the card's `surface` (background image) and the `label`
// color (most use labelAccent so the wordmark reads as a brand
// signature on top of the photo). Adding artwork for a new theme
// is a two-step addition: drop a public/theme-<slug>-picker.png
// file + a `surface<Name>` rule into the styles block above, then
// reference both here.
const PICKER_OVERRIDES: Record<
  string,
  {surface: StyleXStyles; label?: StyleXStyles}
> = {
  '@xds/theme-butter': {
    surface: styles.surfaceButter,
    label: styles.labelAccent,
  },
  '@xds/theme-gothic': {
    surface: styles.surfaceGothic,
    label: styles.labelAccent,
  },
  '@xds/theme-y2k': {surface: styles.surfaceY2k, label: styles.labelAccent},
  '@xds/theme-stone': {surface: styles.surfaceStone, label: styles.labelOnDark},
  '@xds/theme-neutral': {
    surface: styles.surfaceNeutral,
    label: styles.labelAccent,
  },
  '@xds/theme-matcha': {
    surface: styles.surfaceMatcha,
    label: styles.labelAccent,
  },
};

interface ThemePackagePageProps {
  /** Full npm package name — seeds the initial selected theme. */
  packageName: string;
  theme: XDSDefinedTheme;
}

export function ThemePackagePage({packageName, theme}: ThemePackagePageProps) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  // Selected theme — seeded once from the parent's `packageName`
  // prop (the /themes page resolves it from the `?theme=<slug>`
  // query param, or Neutral if absent), then user-mutable via the
  // sidebar / mobile dropdown. State is locally owned; the URL is
  // an OUTPUT that we update imperatively in `handleSelectPkg`
  // below — we intentionally do NOT subscribe to `useSearchParams`
  // here, since that would create a feedback loop (URL change →
  // state sync → URL change → ...).
  const [selectedPkgName, setSelectedPkgName] = useState<string>(packageName);
  const router = useRouter();
  const pathname = usePathname();

  // Sync the URL with the active picker selection so it can be
  // copied, bookmarked, reloaded, or shared. The default theme
  // (DEFAULT_THEME_PACKAGE) renders as the bare `/themes` URL —
  // the seed the server uses when no query param is present — and
  // every other theme renders as `/themes?theme=<slug>`. Matches
  // the canonical URL the deep-link redirect at /themes/[name]
  // sends users to, so internal links, share URLs, and the
  // picker-driven URL all agree.
  //
  // `replace` (not `push`): theme selection reads as a filter on
  // the explorer, not a navigation step. Rapid clicks shouldn't
  // pollute the back stack — one Back press should exit the
  // explorer entirely (matching how Vercel / Linear / Sentry
  // handle in-page filters), not rewind through every preview
  // the user skimmed.
  //
  // `scroll: false`: the sidebar is sticky and the right pane is
  // tall, so we don't want a picker click to yank the user back
  // to the top of the page.
  const handleSelectPkg = useCallback(
    (nextPkgName: string) => {
      setSelectedPkgName(nextPkgName);
      const url =
        nextPkgName === DEFAULT_THEME_PACKAGE
          ? pathname
          : `${pathname}?theme=${encodeURIComponent(packageNameToSlug(nextPkgName))}`;
      router.replace(url, {scroll: false});
    },
    [router, pathname],
  );

  // Sorted list of all theme packages — feeds the sidebar list and
  // the mobile dropdown. Order matches the /themes overview gallery.
  const themePackages = useMemo(() => {
    return packages
      .filter(
        p =>
          p.name.startsWith('@xds/theme-') && p.name !== '@xds/theme-default',
      )
      .sort((a, b) => {
        const ai = THEME_ORDER.indexOf(a.name);
        const bi = THEME_ORDER.indexOf(b.name);
        if (ai === -1 && bi === -1) {
          return a.name.localeCompare(b.name);
        }
        if (ai === -1) {
          return 1;
        }
        if (bi === -1) {
          return -1;
        }
        return ai - bi;
      });
  }, []);

  // Resolve the currently-selected theme object. Falls back to the
  // SSR-seeded prop if the lookup ever misses (shouldn't happen —
  // the selector only offers options sourced from the same packages
  // list — but the guard keeps the page from crashing if the
  // registry drifts).
  const selectedTheme = themeObjects[selectedPkgName] ?? theme;
  // Resolve the product image set for the selected theme (falls back
  // to neutral if the theme doesn't have its own set yet).
  const images = getThemeImages(selectedTheme.name);

  // Mobile dropdown options — mirror the sidebar list. Value is the
  // full @xds/theme-<slug> package name (matches state), label is
  // the friendly brand wordmark ("Neutral", "Butter").
  const switcherOptions = useMemo(
    () =>
      themePackages.map(p => ({
        value: p.name,
        label: themeLabel(p.displayName) || p.displayName,
      })),
    [themePackages],
  );

  // Shared action cluster reused by both the sidebar (vertical
  // stack) and the mobile bar (inline row). Hoisted so the two
  // placements stay byte-identical — adding a button updates both.
  const modeToggleLabel =
    mode === 'light'
      ? 'Switch preview to dark mode'
      : 'Switch preview to light mode';
  const modeToggleIcon =
    mode === 'light' ? <Moon size={20} /> : <Sun size={20} />;

  // Plays a slide-left + fade-out animation on the whole page when
  // the user clicks Customize, then navigates to the playground
  // after the animation duration. Reads as 'launching into the
  // playground' rather than an abrupt route change.
  //
  // CSS-only; the animation uses XDS motion tokens
  // (--duration-medium + --ease-standard) so it stays in sync with
  // the rest of the app's motion. Modifier-clicks (cmd/middle)
  // skip the animation and open in a new tab normally.
  const [isLeaving, setIsLeaving] = useState(false);
  const customizeHref = `/themes/playground/${selectedTheme.name}`;
  const handleCustomizeClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }
      event.preventDefault();
      setIsLeaving(true);
      // Wait for the leave animation to play, then navigate. Length
      // matches --duration-medium (~410ms); we use a slight buffer
      // so the navigation kicks in just as the animation ends. The
      // destination playground page handles its own entry animation
      // declaratively via CSS @starting-style (no cross-page state
      // signaling needed — first paint of the editor + preview
      // panels animates in unconditionally).
      window.setTimeout(() => {
        router.push(customizeHref);
      }, 420);
    },
    [router, customizeHref],
  );

  return (
    <div {...stylex.props(styles.twoColumn)}>
      {/* Sidebar — sticky on desktop, hidden on narrow viewports
          (the mobile bar in the right column takes over). Holds:
          hero block (heading + description + Customize CTA + mode
          toggle), divider, and the theme picker (one card per
          theme). */}
      <aside
        {...stylex.props(styles.sidebar, isLeaving && styles.sidebarLeaving)}
        aria-label="Theme picker">
        <XDSCard variant="default" padding={0} xstyle={styles.sidebarCard}>
          <XDSVStack gap={4}>
            {/* Hero block — page-level heading + description + CTAs.
                Heading uses display-3 instead of display-2 because
                the narrow sidebar column would wrap display-2 mid-
                word; CTAs stack vertically + full-width because the
                side-by-side hero treatment doesn't fit in 260px. */}
            <XDSVStack gap={3}>
              <XDSVStack gap={2}>
                <XDSHeading level={1} type="display-3">
                  Themes
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  Preview each theme, then start from one and make it your own.{' '}
                  <XDSLink
                    type="body"
                    color="secondary"
                    href="/docs/theme"
                    hasUnderline>
                    Learn how theming works
                  </XDSLink>
                  .
                </XDSText>
              </XDSVStack>
              {/* Action row — primary CTA takes the leading flex
                  space, mode toggle (icon-only) sits on the trailing
                  edge. Both belong here because they're page-level
                  preview controls; the theme list below stays a
                  pure picker. */}
              <XDSHStack gap={2} vAlign="center">
                <XDSButton
                  variant="primary"
                  size="lg"
                  label="Customize"
                  href={customizeHref}
                  onClick={handleCustomizeClick}
                  xstyle={styles.heroPrimaryButton}
                />
                <XDSButton
                  variant="ghost"
                  size="lg"
                  isIconOnly
                  label={modeToggleLabel}
                  tooltip={modeToggleLabel}
                  icon={modeToggleIcon}
                  onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                />
              </XDSHStack>
            </XDSVStack>

            <XDSDivider />

            {/* Theme list — one XDSSelectableCard per theme. Each
                card's inner content is wrapped in <XDSTheme> so the
                background color + heading typography reflect the
                theme it represents, giving users a miniature brand
                preview right in the picker. XDSSelectableCard
                handles selection state (inset accent border),
                aria-selected, and focus chrome. */}
            <div {...stylex.props(styles.themeList)}>
              {themePackages.map(pkg => {
                const cardTheme = themeObjects[pkg.name];
                const isActive = pkg.name === selectedPkgName;
                const label = themeLabel(pkg.displayName) || pkg.displayName;
                // Per-theme bespoke artwork lookup. Themes without an
                // entry render with the default radial-gradient
                // backdrop + default wordmark color; themes WITH an
                // entry get a custom photo background + brand-accent
                // wordmark.
                const override = PICKER_OVERRIDES[pkg.name];
                return (
                  <XDSSelectableCard
                    key={pkg.name}
                    label={`Preview ${label} theme`}
                    isSelected={isActive}
                    onChange={() => handleSelectPkg(pkg.name)}
                    padding={0}
                    variant="transparent"
                    xstyle={styles.themeCard}>
                    {cardTheme ? (
                      // Always render mini cards in light mode so the
                      // picker reads as a stable swatch palette,
                      // even when the user has flipped the preview
                      // mode toggle to dark. (The dark-mode brand
                      // colors for some themes are much darker,
                      // which would make the picker look gloomy.)
                      <XDSTheme theme={cardTheme} mode="light">
                        <div
                          {...stylex.props(
                            styles.themedSurface,
                            // StyleX's props() walks rest args strictly;
                            // pass `false` (not `undefined`) when there's
                            // no override so the call doesn't choke.
                            override?.surface ?? false,
                          )}>
                          <XDSText
                            type="display-3"
                            weight="bold"
                            xstyle={[
                              styles.themeCardLabel,
                              override?.label ?? false,
                            ]}>
                            {label}
                          </XDSText>
                        </div>
                      </XDSTheme>
                    ) : (
                      <div {...stylex.props(styles.themedSurface)}>
                        <XDSText
                          type="display-3"
                          weight="bold"
                          xstyle={styles.themeCardLabel}>
                          {label}
                        </XDSText>
                      </div>
                    )}
                  </XDSSelectableCard>
                );
              })}
            </div>
          </XDSVStack>
        </XDSCard>
      </aside>

      {/* Right column — themed preview + card showcase. The mobile
          bar lives at the top of this column and takes over for the
          hidden sidebar at narrow viewports. */}
      <div {...stylex.props(styles.rightColumn)}>
        {/* Mobile bar — replaces the sidebar at narrow viewports.
            Theme switcher collapses to an XDSSelector dropdown +
            mode toggle icon button. (Customize is reached via the
            sidebar's "Build a custom theme" CTA at desktop sizes;
            on mobile the hero CTAs live above the preview already.) */}
        <div {...stylex.props(styles.mobileBar)}>
          <div {...stylex.props(styles.mobileSelector)}>
            <XDSSelector
              label="Theme"
              isLabelHidden
              size="sm"
              options={switcherOptions}
              value={selectedPkgName}
              onChange={handleSelectPkg}
            />
          </div>
          <XDSButton
            variant="ghost"
            size="sm"
            isIconOnly
            label={modeToggleLabel}
            tooltip={modeToggleLabel}
            icon={modeToggleIcon}
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          />
        </div>

        <XDSTheme theme={selectedTheme} mode={mode}>
          <XDSCard
            padding={0}
            variant="transparent"
            xstyle={styles.previewCard}>
            <ThemeShowcasePreview images={images} />
          </XDSCard>
        </XDSTheme>

        {/* Real-world card showcase — sits OUTSIDE the live preview
            card so it renders on the docsite's own astryx chrome
            rather than nested inside the theme's body color.
            Inventory + Checkout + Top customers cards flip light/
            dark in sync with the preview above via the mode prop. */}
        <div {...stylex.props(styles.showcaseBlock)}>
          <ThemeCardShowcase
            theme={selectedTheme}
            images={images}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
}
