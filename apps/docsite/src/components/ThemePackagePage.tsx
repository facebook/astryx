// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {usePathname, useRouter} from 'next/navigation';
import {Sun, Moon} from 'lucide-react';
import {HStack, VStack} from '@xds/core/Layout';
import {Heading, Text} from '@xds/core/Text';
import {Card} from '@xds/core/Card';
import {Carousel} from '@xds/core/Carousel';
import {Theme} from '@xds/core/theme';
import type {DefinedTheme} from '@xds/core/theme';
import {Button} from '@xds/core/Button';
import {Link} from '@xds/core/Link';
import {SelectableCard} from '@xds/core/SelectableCard';
import {Selector} from '@xds/core/Selector';
import {Divider} from '@xds/core/Divider';
import {useMediaQuery} from '@xds/core/hooks';
import {ThemeShowcaseStore} from '../../../../packages/cli/templates/pages/theme-showcase/page';
import {getThemeShowcaseContent} from './themeShowcaseContent';
import {buildPlaygroundHref} from './playgroundLink';
import {packages} from '../generated/packageRegistry';
import {themeObjects} from '../generated/themeRegistry';
import {templates} from '../generated/templateRegistry';
import {trackOpenPlayground, trackToggle} from '../lib/analytics';
import {useThemeMode} from '../app/providers';

// Raw source of the theme-showcase page template (embedded as a string in
// the generated template registry). Used to prepopulate the playground's
// code editor when the user clicks "Open in Playground" from a theme.
const THEME_SHOWCASE_SOURCE =
  templates.find(t => t.slug === 'theme-showcase')?.source ?? '';

// CDN host for the per-theme picker banners (same host as the showcase
// product photos), so the artwork can be updated without a code change.
const PICKER_CDN = 'https://lookaside.facebook.com/assets/xds_oss';

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
// Selector dropdown + inline action row above the preview. The
// sidebar is hidden via @media at the same breakpoint so the two
// surfaces don't double-render. Picked so the right pane keeps
// enough horizontal room for the themed preview's product grid.
const SIDEBAR_QUERY = '(max-width: 900px)';
const SIDEBAR_BREAKPOINT = `@media ${SIDEBAR_QUERY}`;

// Fixed sidebar width — compact enough that the right pane gets the
// lion's share of horizontal space, wide enough to fit the longest
// theme name, the hero heading + description, and the full-width
// "Build a custom theme" / "How theming works" CTAs at size="md".
const SIDEBAR_WIDTH = 260;

// Sticky-top offset for the sidebar. Clears the docsite's sticky
// AppShell top nav (which uses --appshell-header-height,
// populated post-hydration) plus a touch of breathing room so the
// sidebar pill doesn't look glued to the nav's bottom edge.
const SIDEBAR_STICKY_TOP =
  'calc(var(--appshell-header-height, 64px) + var(--spacing-4))';

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
    width: '100%',
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
  // Make every action button (hero CTAs, mode toggle, Open in Playground)
  // stretch to the sidebar width and left-align its label
  // (Button's default is centered, which looks off in a vertical
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
  // Themed theme-row card. The SelectableCard wrapper itself
  // stays variant="transparent" + padding=0 so it doesn't paint a
  // surface from the OUTER docsite theme; the inner themedSurface
  // div (rendered inside its own <Theme>) does the painting using
  // the theme being represented. That way each card reads as a
  // miniature brand preview rather than a docsite-Astryx card with
  // theme-colored text on top.
  themeCard: {
    width: '100%',
  },
  // Inner card surface — lives inside the per-card <Theme>
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
    // outer SelectableCard's selected-state inset shadow uses
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
  // theme-<slug>-picker.png banner hosted on the XDS asset CDN
  // (see PICKER_CDN). These are SEPARATE files from the
  // theme-<slug>-preview.png images used on the /themes overview +
  // detail page hero — these picker assets are sized and
  // art-directed for the small 120px-tall picker card.
  // background-size:cover so each image always fills the card
  // regardless of the source's intrinsic dimensions.
  surfaceButter: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${PICKER_CDN}/theme-butter-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceGothic: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${PICKER_CDN}/theme-gothic-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceY2k: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${PICKER_CDN}/theme-y2k-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceStone: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${PICKER_CDN}/theme-stone-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceNeutral: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${PICKER_CDN}/theme-neutral-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceMatcha: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${PICKER_CDN}/theme-matcha-picker.png)`,
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
  // The token resolves inside each card's own <Theme> wrapper,
  // so each card picks up its theme's accent — Butter's brand
  // blue, Gothic's accent, etc.
  labelAccent: {
    color: 'var(--color-accent)',
  },
  // Theme name on top of the gradient — rendered in the theme's
  // heading font so the wordmark previews the brand at a glance.
  // Color uses --color-text-primary so it reads against the soft
  // gradient backdrop in both light and dark themes.
  //
  // Fixed fontSize (24px desktop / 20px narrow) overrides each theme's own
  // heading type-scale so the picker reads at a uniform size across all 6 cards.
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
    // etc.). The Text below uses type="display-3" so the
    // .xds-text.display-3 selector in each theme's @scope'd CSS (legacy class
    // selector; text also emits data-type="display-3")
    // applies the right family per card.
    fontSize: 24,
    lineHeight: 1.2,
    color: 'var(--color-text-primary)',
    maxWidth: '100%',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    position: 'relative' as const,
    zIndex: 1,
  },
  mobileThemeCardLabel: {
    fontSize: 20,
  },
  // Mobile-only floating toolbar that replaces the sidebar at
  // narrow viewports. position:fixed so it stays pinned to the
  // bottom of the viewport as the user scrolls the right pane;
  // horizontally centered with inset + auto margins instead of
  // transform so CSS-anchor-positioned popovers inside it (like
  // Selector's menu) anchor to the visible trigger location.
  // Floating toolbar — appears when the theme carousel scrolls out of
  // view. Hidden by default (opacity:0, pointer-events:none) and becomes
  // visible when the `data-visible` attribute is set.
  mobileBar: {
    display: 'none',
    [SIDEBAR_BREAKPOINT]: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: 'var(--spacing-2)',
      padding: 'var(--spacing-2)',
      borderRadius: 'var(--radius-full)',
      borderWidth: 'var(--border-width)',
      borderStyle: 'solid',
      borderColor: 'var(--color-border)',
      backgroundColor: 'var(--color-background-card)',
      boxShadow: 'var(--shadow-high)',
      position: 'fixed' as const,
      bottom: 'var(--spacing-4)',
      left: 0,
      right: 0,
      marginInline: 'auto',
      zIndex: 100,
      width: 'fit-content',
      maxWidth: `calc(100vw - var(--spacing-4) * 2)`,
      opacity: 0,
      pointerEvents: 'none' as const,
      transition: 'opacity 0.2s ease',
    },
  },
  // Visible state for the floating toolbar.
  mobileBarVisible: {
    [SIDEBAR_BREAKPOINT]: {
      opacity: 1,
      pointerEvents: 'auto' as const,
    },
  },
  // Mobile selector — fixed minimum so the dropdown trigger has
  // room for the longest theme label without forcing the floating
  // pill to span the entire viewport. No flex:1 here (the parent
  // is fit-content sized, not a stretched row).
  mobileSelector: {
    minWidth: 160,
  },
  // Mobile theme carousel — horizontal row of theme cards. Carousel
  // owns scrolling, snapping, overflow affordances, and scrollbar behavior;
  // this wrapper style only controls breakpoint visibility.
  mobileCarousel: {
    display: 'none',
    [SIDEBAR_BREAKPOINT]: {
      display: 'flex',
      width: '100%',
    },
  },
  // Individual card in the mobile carousel — fixed width so cards
  // are uniformly sized and scroll-snappable.
  mobileCarouselCard: {
    flexShrink: 0,
    width: 140,
  },
  // Showcase card — clips the theme-showcase template's own
  // backgrounds (top nav, sections) to the card's rounded corners.
  // The card's default variant supplies the border + radius; the
  // template paints its own themed body background inside.
  showcaseCard: {
    overflow: 'hidden',
  },
  // Caps the showcase at the site's "wide content" max-width (1200px,
  // matching home-page showcases / docs index) and centers it so it
  // doesn't run viewport-edge to viewport-edge on very wide screens.
  // overflow:hidden clips any template content that exceeds the
  // available width on mobile (e.g. inventory filter rows, tables).
  showcaseBlock: {
    width: '100%',
    maxWidth: 1200,
    marginInline: 'auto',
    overflow: 'hidden',
    borderRadius: 'var(--radius-container)',
  },
  // Mobile-only context heading — shown above the preview at narrow
  // viewports. Includes the heading, description, and action row
  // (Open in Playground + mode toggle) mirroring the sidebar's hero.
  mobileContext: {
    display: 'none',
    [SIDEBAR_BREAKPOINT]: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--spacing-3)',
    },
  },
});

// Per-theme override registry for the picker cards. Themes without
// an entry here render with the default radial-gradient backdrop
// + default --color-text-primary wordmark. Themes WITH an entry
// can swap the card's `surface` (background image) and the `label`
// color (most use labelAccent so the wordmark reads as a brand
// signature on top of the photo). Adding artwork for a new theme
// is a two-step addition: upload a theme-<slug>-picker.png banner to
// the asset CDN (PICKER_CDN) + add a `surface<Name>` rule into the
// styles block above, then reference both here.
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
  '@xds/theme-stone': {surface: styles.surfaceStone, label: styles.labelAccent},
  '@xds/theme-neutral': {
    surface: styles.surfaceNeutral,
    label: styles.labelAccent,
  },
  '@xds/theme-matcha': {
    surface: styles.surfaceMatcha,
    label: styles.labelAccent,
  },
};

function ThemeHeading({
  align = 'start',
  isMobile = false,
}: {
  align?: 'start' | 'center';
  isMobile?: boolean;
}) {
  const isCentered = align === 'center';

  return (
    <VStack gap={2} hAlign={isCentered ? 'center' : undefined}>
      {/* display-3 in the desktop sidebar (display-2 wraps in the 260px
          column); display-2 in the narrow layout to match /templates and
          /components. Driven by the same SIDEBAR_QUERY mobile check the rest
          of the component uses, not a separate CSS breakpoint. */}
      <Heading
        level={1}
        type={isMobile ? 'display-2' : 'display-3'}
        justify={align}>
        Themes
      </Heading>
      <Text
        type="body"
        color="secondary"
        display={isCentered ? 'block' : 'inline'}
        justify={align}>
        Preview each theme, then start from one and make it your own.{' '}
        <Link type="body" color="secondary" href="/docs/theme" hasUnderline>
          Learn how theming works
        </Link>
        .
      </Text>
    </VStack>
  );
}

interface ThemePackagePageProps {
  /** Full npm package name — seeds the initial selected theme. */
  packageName: string;
  theme: DefinedTheme;
}

export function ThemePackagePage({packageName, theme}: ThemePackagePageProps) {
  // Preview color mode. `siteMode` is the docsite's already-resolved concrete
  // light/dark — the provider maps its default `system` to the OS preference
  // (falling back to light on the first paint), so the preview never sees
  // `system`. `localMode` is null until the user toggles the preview's own
  // control; the effective mode falls through to `siteMode` until then, so
  // opening /themes in dark mode shows the demos in dark mode without an effect.
  const {mode: siteMode} = useThemeMode();
  const [localMode, setLocalMode] = useState<'light' | 'dark' | null>(null);
  const mode: 'light' | 'dark' = localMode ?? siteMode;

  const handleToggleMode = useCallback(() => {
    setLocalMode(mode === 'light' ? 'dark' : 'light');
  }, [mode]);
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

  // Ref for the mobile theme carousel — observed by IntersectionObserver
  // to toggle the floating toolbar visibility.
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showMobileBar, setShowMobileBar] = useState(false);

  // Narrow-viewport check — the same SIDEBAR_QUERY breakpoint that hides the
  // sidebar and shows the mobile context block. Drives the heading's type so
  // the JS render matches the layout swap (no parallel CSS breakpoint). Server
  // default is desktop (false), matching the sidebar shown on first paint.
  const isMobile = useMediaQuery(SIDEBAR_QUERY);

  // Show the floating toolbar when the carousel scrolls out of view.
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileBar(!entry.isIntersecting);
      },
      {threshold: 0},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Open in Playground destination: the main /playground seeded with
  // the theme-showcase template in the code editor (#code) and the
  // selected theme in the theme editor (?theme=<slug>). Navigation goes
  // through the framework — Button's href renders the docsite's Next
  // <Link> (via LinkProvider), so this is a soft, client-side
  // transition rather than a full-page reload. The playground reads the
  // seeded code from window.location.hash in a mount effect (the
  // App-Router-safe way to read a fragment — useSearchParams only sees
  // the query string), which runs after the navigation has committed the
  // new URL, so the hash is reliably present when it's read.
  const customizeHref = buildPlaygroundHref(
    THEME_SHOWCASE_SOURCE,
    packageNameToSlug(selectedPkgName),
  );

  return (
    <div {...stylex.props(styles.twoColumn)}>
      {/* Sidebar — sticky on desktop, hidden on narrow viewports
          (the mobile bar in the right column takes over). Holds:
          hero block (heading + description + Open in Playground CTA + mode
          toggle), divider, and the theme picker (one card per
          theme). */}
      <aside {...stylex.props(styles.sidebar)} aria-label="Theme picker">
        <Card variant="default" padding={0} xstyle={styles.sidebarCard}>
          <VStack gap={4}>
            {/* Hero block — page-level heading + description + CTAs.
                Heading is display-3 in this sidebar (display-2 wraps in the
                260px column); the narrow layout uses display-2 (see isMobile).
                CTAs stack full-width. */}
            <VStack gap={3}>
              <ThemeHeading isMobile={isMobile} />
              {/* Action row — primary CTA takes the leading flex
                  space, mode toggle (icon-only) sits on the trailing
                  edge. Both belong here because they're page-level
                  preview controls; the theme list below stays a
                  pure picker. */}
              <HStack gap={2} vAlign="center">
                <Button
                  variant="primary"
                  size="lg"
                  label="Open in Playground"
                  href={customizeHref}
                  xstyle={styles.heroPrimaryButton}
                  onClick={() => {
                    trackOpenPlayground({
                      page: 'themes',
                      item: selectedPkgName,
                      source: 'theme-showcase',
                    });
                  }}
                />
                <Button
                  variant="ghost"
                  size="lg"
                  isIconOnly
                  label={modeToggleLabel}
                  tooltip={modeToggleLabel}
                  icon={modeToggleIcon}
                  onClick={() => {
                    const next = mode === 'light' ? 'dark' : 'light';
                    trackToggle({
                      page: 'themes',
                      target: 'mode',
                      item: selectedPkgName,
                      value: next,
                    });
                    setLocalMode(next);
                  }}
                />
              </HStack>
            </VStack>

            <Divider />

            {/* Theme list — one SelectableCard per theme. Each
                card's inner content is wrapped in <Theme> so the
                background color + heading typography reflect the
                theme it represents, giving users a miniature brand
                preview right in the picker. SelectableCard
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
                  <SelectableCard
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
                      <Theme theme={cardTheme} mode="light">
                        <div
                          {...stylex.props(
                            styles.themedSurface,
                            // StyleX's props() walks rest args strictly;
                            // pass `false` (not `undefined`) when there's
                            // no override so the call doesn't choke.
                            override?.surface ?? false,
                          )}>
                          <Text
                            type="display-3"
                            weight="bold"
                            xstyle={[
                              styles.themeCardLabel,
                              override?.label ?? false,
                            ]}>
                            {label}
                          </Text>
                        </div>
                      </Theme>
                    ) : (
                      <div {...stylex.props(styles.themedSurface)}>
                        <Text
                          type="display-3"
                          weight="bold"
                          xstyle={styles.themeCardLabel}>
                          {label}
                        </Text>
                      </div>
                    )}
                  </SelectableCard>
                );
              })}
            </div>
          </VStack>
        </Card>
      </aside>

      {/* Right column — themed preview + card showcase. The mobile
          bar lives at the top of this column and takes over for the
          hidden sidebar at narrow viewports. */}
      <div {...stylex.props(styles.rightColumn)}>
        {/* Mobile floating toolbar — hidden until the carousel scrolls
            out of view, then animates in from below. Contains the theme
            selector dropdown + mode toggle so users always have access
            to theme switching as they scroll the long preview. */}
        <div
          {...stylex.props(
            styles.mobileBar,
            showMobileBar && styles.mobileBarVisible,
          )}>
          <div {...stylex.props(styles.mobileSelector)}>
            <Selector
              label="Theme"
              isLabelHidden
              size="sm"
              placement="above"
              options={switcherOptions}
              value={selectedPkgName}
              onChange={handleSelectPkg}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            label={modeToggleLabel}
            tooltip={modeToggleLabel}
            icon={modeToggleIcon}
            onClick={handleToggleMode}
          />
        </div>

        {/* Mobile context heading — visible only at narrow viewports.
            Mirrors the sidebar's hero: heading, description, and
            action buttons (Open in Playground + mode toggle). */}
        <div {...stylex.props(styles.mobileContext)}>
          <ThemeHeading align="center" isMobile={isMobile} />
          <HStack gap={2} vAlign="center">
            <Button
              variant="primary"
              size="lg"
              label="Open in Playground"
              href={customizeHref}
              xstyle={styles.heroPrimaryButton}
              onClick={() => {
                trackOpenPlayground({
                  page: 'themes',
                  item: selectedPkgName,
                  source: 'theme-showcase',
                });
              }}
            />
            <Button
              variant="ghost"
              size="lg"
              isIconOnly
              label={modeToggleLabel}
              tooltip={modeToggleLabel}
              icon={modeToggleIcon}
              onClick={() => {
                const next = mode === 'light' ? 'dark' : 'light';
                trackToggle({
                  page: 'themes',
                  target: 'mode',
                  item: selectedPkgName,
                  value: next,
                });
                setLocalMode(next);
              }}
            />
          </HStack>
        </div>

        {/* Mobile theme carousel — horizontal row of theme cards.
            When this scrolls out of view, the floating toolbar appears.
            Carousel owns scroll behavior and snap affordances. */}
        <Carousel
          ref={carouselRef}
          gap={3}
          hasButtons={false}
          hasSnap
          aria-label="Themes"
          xstyle={styles.mobileCarousel}>
          {themePackages.map(pkg => {
            const cardTheme = themeObjects[pkg.name];
            const isActive = pkg.name === selectedPkgName;
            const label = themeLabel(pkg.displayName) || pkg.displayName;
            const override = PICKER_OVERRIDES[pkg.name];
            return (
              <div key={pkg.name} {...stylex.props(styles.mobileCarouselCard)}>
                <SelectableCard
                  label={`Preview ${label} theme`}
                  isSelected={isActive}
                  onChange={() => handleSelectPkg(pkg.name)}
                  padding={0}
                  variant="transparent">
                  {cardTheme ? (
                    <Theme theme={cardTheme} mode="light">
                      <div
                        {...stylex.props(
                          styles.themedSurface,
                          override?.surface ?? false,
                        )}>
                        <Text
                          type="display-3"
                          weight="bold"
                          xstyle={[
                            styles.themeCardLabel,
                            styles.mobileThemeCardLabel,
                            override?.label ?? false,
                          ]}>
                          {label}
                        </Text>
                      </div>
                    </Theme>
                  ) : (
                    <div {...stylex.props(styles.themedSurface)}>
                      <Text
                        type="display-3"
                        weight="bold"
                        xstyle={[
                          styles.themeCardLabel,
                          styles.mobileThemeCardLabel,
                        ]}>
                        {label}
                      </Text>
                    </div>
                  )}
                </SelectableCard>
              </div>
            );
          })}
        </Carousel>

        {/* Themed preview — the theme-showcase template rendered with
            the selected theme, wrapped in a bordered, rounded card so
            it reads as a contained app surface against the docsite
            chrome. overflow:hidden (showcaseCard) clips the template's
            own backgrounds (top nav, sections) to the card's radius. */}
        <div {...stylex.props(styles.showcaseBlock)}>
          <Card padding={0} xstyle={styles.showcaseCard}>
            <Theme theme={selectedTheme} mode={mode}>
              {/* Bespoke per-theme content (e.g. Matcha's café menu); falls
                  back to the template's neutral defaults when undefined. */}
              <ThemeShowcaseStore
                {...getThemeShowcaseContent(
                  selectedPkgName.replace('@xds/theme-', ''),
                )}
              />
            </Theme>
          </Card>
        </div>
      </div>
    </div>
  );
}
