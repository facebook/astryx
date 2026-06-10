// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSBadge} from '@xds/core/Badge';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {FeaturesShowcase} from './_landing/FeaturesShowcase';
import {AboutShowcase} from './_landing/AboutShowcase';
import {DiscoverShowcase} from './_landing/DiscoverShowcase';

const styles = stylex.create({
  // Wraps hero + showcase together so the sticky hero (position: sticky)
  // bounds its sticky range to this container. Without the wrapper, the
  // hero would stay pinned through the footer (a sibling further down
  // the AppShell main content), which on mobile shows up as the hero
  // bleeding underneath the footer at the bottom of the page.
  heroScope: {
    position: 'relative',
    backgroundColor: 'var(--color-background-body)',
  },
  // Hero content column. maxWidth: 800 is an editorial reading-
  // measure cap (≈ display-1 + body at a comfortable line length);
  // not derivable from the spacing scale, kept as a literal
  // because it's a marketing-section measure, not a system primitive.
  // paddingBlock = --spacing-12 * 3 → 144px top/bottom; expressed
  // as a calc() over the spacing token so the rhythm scales with
  // any future spacing-scale theme override.
  heroContent: {
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    maxWidth: 800,
    marginInline: 'auto',
    paddingBlock: `calc(${spacingVars['--spacing-12']} * 3)`,
    paddingInline: spacingVars['--spacing-6'],
    textAlign: 'center',
    gap: spacingVars['--spacing-6'],
    // Lock the hero block to a fixed minimum height so the showcase
    // below has a stable starting offset across viewports and the
    // sticky pin-and-cover reveal reads consistently.
    minHeight: 600,
  },
  // Wrapper around the wordmark + floating Beta badge. Sized
  // exactly to the wordmark image (display:inline-block with no
  // explicit width, so the inline element shrinks to the image's
  // natural rendered width) and centered horizontally by the
  // parent VStack's align:stretch + the wrapper's marginInline:
  // auto. position:relative establishes the positioning context
  // for the absolutely-positioned Beta badge.
  heroWordmarkWrap: {
    position: 'relative',
    display: 'inline-block',
    alignSelf: 'center',
  },
  heroWordmark: {
    display: 'block',
    // Responsive: scale down on narrow viewports so the wordmark
    // doesn't overflow the hero column. 80px at desktop is the
    // designed size; 56px keeps the wordmark visible without
    // clipping on phones at ~375px viewport.
    height: {
      default: 80,
      '@media (max-width: 480px)': 56,
    },
    width: 'auto',
    maxWidth: '100%',
  },
  // Floating Beta badge wrapper — positions the XDSBadge above
  // the wordmark (bottom anchored to the wordmark's top edge)
  // and offset right so it reads as a callout attached to the
  // brand mark without overlapping any of the glyphs. The XDS
  // Badge component carries the pill chrome (background, radius,
  // typography); only positioning + rotation lives here.
  //
  // right: -24 is a literal pixel offset (not a spacing token)
  // because the badge anchor is tied to the wordmark glyph
  // geometry — the badge needs to clear the rightmost ligature
  // by a precise visual margin that doesn't correspond to any
  // spacing-scale step. Negative spacing tokens don't exist in
  // the scale anyway, so even the symmetric "24px" would be a
  // literal here.
  heroWordmarkBeta: {
    position: 'absolute',
    bottom: '100%',
    right: -24,
    marginBottom: spacingVars['--spacing-1'],
    transform: 'rotate(8deg)',
    transformOrigin: 'bottom right',
  },
  // Hero CTA button grid. maxWidth: 420 caps the two-up button
  // row at a comfortable thumb-reachable width so the buttons
  // don't stretch edge-to-edge on wide hero columns; literal
  // because the cap is a button-pair ergonomics value, not a
  // spacing-scale step.
  heroButtons: {
    width: '100%',
    maxWidth: 420,
  },
  // Lighter display weight for the leading half of the hero
  // headline ("An open source design system that's"). Astryx's
  // theme override pushes display-1 to semibold (600); we want
  // the leading copy to read as a softer editorial setup so the
  // value-prop tail ("fully customizable and agent ready") can
  // land harder. Applied per-span via xstyle, not as a theme
  // token change, so the rest of the site keeps Astryx's display
  // semibold default.
  heroHeadline: {
    fontWeight: 'var(--font-weight-normal)',
  },
  // The showcase overlay paints the surface that scrolls UP over
  // the pinned hero (pin-and-cover reveal). Surface color +
  // top-rounded corners + body padding all sit on tokens, but
  // paddingBlockStart and gap use the marketing-section rhythm
  // token (--xds-marketing-section-gap) — these are marketing-
  // section rhythm, NOT primitives in the spacing scale.
  showcaseOverlay: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 'var(--radius-page)',
    borderTopRightRadius: 'var(--radius-page)',
    backgroundColor: 'var(--color-background-surface)',
    paddingBlockStart: 'var(--xds-marketing-section-gap)',
    paddingBlockEnd: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-6'],
    gap: 'var(--xds-marketing-section-gap)',
  },
});

export default function HomePage() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) {
      return;
    }

    function readNavHeight() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        '--appshell-header-height',
      );
      return parseFloat(raw) || 64;
    }

    function update() {
      if (!el) {
        return;
      }
      const navHeight = readNavHeight();
      const top = el.getBoundingClientRect().top;
      const reached = top <= navHeight;
      if (reached) {
        document.body.setAttribute('data-nav-mode', 'surface');
      } else {
        document.body.removeAttribute('data-nav-mode');
      }
    }

    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update, {passive: true});

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.body.removeAttribute('data-nav-mode');
    };
  }, []);

  return (
    <div {...stylex.props(styles.heroScope)}>
      <XDSVStack
        data-home-page="true"
        align="stretch"
        xstyle={styles.heroContent}>
        {/* heroWordmarkWrap is a raw <div> because its sole job is
            to establish a `position: relative` context for the
            absolutely-positioned Beta badge while sizing exactly to
            the inline wordmark image's natural width. XDSVStack /
            XDSHStack would impose flex semantics that fight the
            inline-block sizing; no other XDS primitive represents
            "positioning context that hugs an inline child". */}
        <div {...stylex.props(styles.heroWordmarkWrap)}>
          {/* Raw <img> — @xds/core does not export a general-purpose
              image component (XDSThumbnail is chat-attachment chrome;
              XDSIcon is a glyph registry). Sizing + responsive
              breakpoints come from the heroWordmark xstyle. */}
          <img
            src="/astryx-logo.svg"
            alt="Astryx"
            {...stylex.props(styles.heroWordmark)}
          />
          {/* heroWordmarkBeta is a raw <span> because we need an
              inline-level element that establishes its own
              position:absolute context for the XDSBadge — a stack
              would force flex children and break the floating
              callout placement. */}
          <span {...stylex.props(styles.heroWordmarkBeta)}>
            <XDSBadge label="Beta" variant="blue" />
          </span>
        </div>
        <XDSHeading
          level={1}
          type="display-1"
          color="primary"
          xstyle={styles.heroHeadline}>
          An open source design system that's{' '}
          {/* XDSText emphasis span — type/color="inherit" picks up
              the heading's display-1 size + color so only the
              weight changes, and weight="semibold" provides the
              contrast against the parent heading's normal weight
              (set via styles.heroHeadline above). Using XDSText
              keeps the inline emphasis on a typed XDS primitive
              instead of a raw <span> + xstyle escape. */}
          <XDSText as="span" type="inherit" color="inherit" weight="semibold">
            fully customizable and agent ready
          </XDSText>
        </XDSHeading>
        <XDSVStack gap={4} align="center">
          <XDSGrid columns={2} gap={3} xstyle={styles.heroButtons}>
            <XDSButton
              variant="primary"
              size="lg"
              label="Get started"
              href="/docs/getting-started"
            />
            <XDSButton
              variant="secondary"
              size="lg"
              label="Browse components"
              href="/components"
            />
          </XDSGrid>
          <XDSText display="block">
            Built on{' '}
            <XDSLink
              type="body"
              color="primary"
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              hasUnderline>
              React
            </XDSLink>{' '}
            and{' '}
            <XDSLink
              type="body"
              color="primary"
              href="https://stylexjs.com"
              target="_blank"
              rel="noopener noreferrer"
              hasUnderline>
              StyleX
            </XDSLink>
          </XDSText>
        </XDSVStack>
      </XDSVStack>
      <XDSVStack ref={showcaseRef} xstyle={styles.showcaseOverlay}>
        <FeaturesShowcase />
        <AboutShowcase />
        <DiscoverShowcase />
      </XDSVStack>
    </div>
  );
}
