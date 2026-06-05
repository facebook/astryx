// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {components} from '../../../generated/componentRegistry';

// Count of public @xds/core components (excluding hooks and hidden entries).
// Sourced from the generated registry so the number stays accurate as the
// library grows.
const CORE_COMPONENT_COUNT = (components['@xds/core'] ?? []).filter(
  c => !c.hidden && !c.name.startsWith('use'),
).length;
// Round down to the nearest 10 for marketing copy ("Over X components"
// reads better than "Over 87 components" and avoids the displayed number
// going stale every time a single component lands.
const CORE_COMPONENT_COUNT_ROUNDED = Math.floor(CORE_COMPONENT_COUNT / 10) * 10;

const styles = stylex.create({
  headingBlock: {
    textAlign: 'center',
    width: '100%',
    maxWidth: 680,
  },
  // Layout glue for the XDSGrid: cap at 1200px. gridAutoRows: 1fr is
  // intentionally NOT set here — it would force the tall first card
  // (which spans 2 rows) to make every row at LEAST half its height,
  // ballooning the regular cards out. With auto rows each row sizes
  // to its actual content, and the tall card stretches naturally to
  // fill both rows of whatever the regular row heights end up being.
  gridLayout: {
    width: '100%',
    maxWidth: 1200,
  },
  // Feature cards use the categorical "gray" variant, which Astryx
  // re-tints to a warm beige via --color-background-gray (see
  // astryxTheme.ts) so the cards sit as a recessed beige surface
  // on the cream body background.
  //
  // overflow:hidden lets bleeding images (negative margin) clip
  // cleanly at the rounded corners.
  cardTall: {
    height: '100%',
    overflow: 'hidden',
    gridRow: {
      default: 'auto',
      '@media (min-width: 720px)': 'span 2',
    },
  },
  card: {
    height: '100%',
    overflow: 'hidden',
  },
  // "KEY FEATURES" eyebrow heading above the section title. Uppercase
  // + tracked, replacing the previous XDSBadge for a flatter editorial
  // treatment that doesn't compete visually with the cards' own
  // badge-like accents.
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  // Constrain the description copy under the section heading so it
  // doesn't run too wide. 420px reads as ~55 characters per line —
  // a tighter cap than the other sections because the Features
  // heading is short and a narrow description column visually
  // balances it.
  descriptionWidth: {
    maxWidth: 420,
  },
  // Inner stack of the tall card — pushes the heading/text block to
  // the top and lets the image grow into the leftover vertical space.
  // height:100% so the stack itself fills the card body (cards are
  // gridAutoRows: 1fr, so the row has a known height it can stretch
  // into).
  tallStack: {
    height: '100%',
  },
  // Explore link spacing — VStack gap holds heading↔description at
  // 4px, but the link below the description wants more breathing room
  // (16px). Adding a top margin on the link gives the +12px extra
  // beyond the 4px stack gap to reach the 16px total.
  exploreLink: {
    marginTop: 'calc(var(--spacing-3))',
  },
  // Shared image wrapper styles for any feature card with an image.
  // marginTop:auto pushes the wrapper to the bottom of the card so
  // every card's image sits on the same baseline regardless of how
  // much text wraps above it. paddingTop:16 guarantees a 16px gap
  // between the "Explore →" link and the image even on short cards.
  // No fixed height — the inner <img> uses height:auto + width:100%
  // so the wrapper grows to exactly the image's natural rendered
  // height (preserves each composition's aspect ratio without
  // distortion or empty padding). The negative marginBottom bleeds
  // the image toward the card's bottom edge with a 16px gutter.
  imageWrap: {
    marginTop: 'auto',
    paddingTop: 16,
    marginBottom: 'calc(var(--spacing-5) * -1 + 16px)',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  // Tall-card variant: image bleeds flush to the right edge of the
  // card (full bleed right) but keeps a 16px inset on the left so
  // the composition reads as anchored to the left padding rim.
  // marginTop:auto + marginBottom:auto vertically centers the image
  // in the leftover space below the heading/link content, so the
  // tall card's empty space splits equally above and below the
  // composition instead of all collecting at top or bottom.
  imageWrapTall: {
    marginInlineStart: 'calc(var(--spacing-5) * -1 + 16px)',
    marginInlineEnd: 'calc(var(--spacing-5) * -1)',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  // Regular-card variant: 16px inset on BOTH sides so the image
  // sits inside the card text padding minus the outer rim.
  imageWrapRegular: {
    marginInlineStart: 'calc(var(--spacing-5) * -1 + 16px)',
    marginInlineEnd: 'calc(var(--spacing-5) * -1 + 16px)',
  },
  // Bleed-to-corner variant: drops the 16px right + bottom insets
  // so the image runs flush to the card's right and bottom edges.
  imageWrapBleedCorner: {
    marginInlineEnd: 'calc(var(--spacing-5) * -1)',
    marginBottom: 'calc(var(--spacing-5) * -1)',
  },
  // Bleed-bottom variant: drops only the 16px bottom inset so the
  // image runs flush to the bottom edge while keeping the right
  // inset.
  imageWrapBleedBottom: {
    marginBottom: 'calc(var(--spacing-5) * -1)',
  },
  // Image: full container width, natural aspect-ratio-derived
  // height. No maxHeight cap — each composition was sized at design
  // time to render correctly inside its card variant (the tall
  // card's composition is intentionally taller than the regular
  // cards' wide-and-short compositions). A blanket maxHeight cap
  // shrinks the tall + bleed images to a tiny strip in the corner
  // because object-fit:contain inside the cap can't enlarge a
  // smaller image — the wrappers (imageWrap + variants) already
  // handle the positioning + bleed at the card edges.
  tallImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
});

type Feature = {
  title: string;
  description: string;
  href: string;
  /**
   * Optional supporting image rendered below the description. Used to
   * give each card a visual anchor (code samples, component swatches,
   * a cascading template stack, etc.).
   */
  image?: {
    src: string;
    alt: string;
    /**
     * When true, the image bleeds flush to the card's right and
     * bottom edges (no 16px breathing room). Used by image
     * compositions that are designed as "running off the corner"
     * artwork — e.g. the cascading template stack — where the
     * visual intent depends on having the corner clip.
     */
    bleedToCorner?: boolean;
    /**
     * When true, the image bleeds flush to the card's bottom edge
     * only. Used for compositions that should keep their right-
     * side breathing room but feel "rooted" at the bottom of the
     * card — e.g. a full themed page mockup that reads as
     * extending below the visible card frame.
     */
    bleedBottom?: boolean;
  };
};

const features: Feature[] = [
  {
    title: 'Measured and tested',
    description:
      'Every API choice is measured against real usage by people and LLMs before it ships.',
    href: '/docs',
    image: {
      src: '/feature-measured-and-tested.png',
      alt: 'A typescript code sample alongside a card preview and People / AI agents checks',
    },
  },
  {
    title: `Over ${CORE_COMPONENT_COUNT_ROUNDED} components`,
    description:
      'Accessible and themeable React components with built-in spacing, dark mode, and StyleX styling.',
    href: '/components',
    image: {
      src: '/feature-components.png',
      alt: 'Sample XDS components — Badge, Switch, Secondary button, Primary button, Search input',
    },
  },
  {
    title: 'Your design system on the command line',
    description:
      'Scaffold projects, browse templates, generate themes, and get agent-ready docs from the command line.',
    href: '/docs/cli',
    image: {
      src: '/feature-cli.png',
      alt: 'AI prompt input asking "Can you create me a table page" with a send button',
    },
  },
  {
    title: 'Ready to ship templates',
    description:
      'Production-ready templates for common pages, just plug in your content.',
    href: '/templates',
    image: {
      src: '/feature-templates.png',
      alt: 'Stacked theme preview pages cascading toward a fully designed Butter theme example',
      bleedToCorner: true,
    },
  },
  {
    title: 'Themes that fit your brand',
    description:
      'Fully customizable themes ready for use. Make it yours without starting from scratch.',
    href: '/themes',
    image: {
      src: '/feature-brand.png',
      alt: 'Butter theme applied to a full product landing page with display script, primary CTA, and three product cards',
      bleedBottom: true,
    },
  },
];

function FeatureCard({feature, isTall}: {feature: Feature; isTall?: boolean}) {
  const showImage = feature.image != null;
  return (
    <XDSCard
      variant="gray"
      padding={5}
      xstyle={isTall ? styles.cardTall : styles.card}>
      <XDSVStack
        gap={1}
        align="start"
        xstyle={showImage ? styles.tallStack : undefined}>
        <XDSHeading level={2} color="primary">
          {feature.title}
        </XDSHeading>
        <XDSText type="body" color="primary">
          {feature.description}
        </XDSText>
        <XDSLink
          type="body"
          color="primary"
          href={feature.href}
          hasUnderline={false}
          xstyle={styles.exploreLink}>
          Explore →
        </XDSLink>
        {showImage && feature.image && (
          <div
            {...stylex.props(
              styles.imageWrap,
              isTall ? styles.imageWrapTall : styles.imageWrapRegular,
              feature.image.bleedToCorner && styles.imageWrapBleedCorner,
              feature.image.bleedBottom && styles.imageWrapBleedBottom,
            )}>
            <img
              src={feature.image.src}
              alt={feature.image.alt}
              {...stylex.props(styles.tallImage)}
            />
          </div>
        )}
      </XDSVStack>
    </XDSCard>
  );
}

function FeaturesHeading() {
  return (
    <XDSVStack gap={4} align="center" xstyle={styles.headingBlock}>
      <XDSHeading level={4} color="primary" xstyle={styles.eyebrow}>
        Key features
      </XDSHeading>
      <XDSHeading level={2} type="display-2" color="primary">
        Start&nbsp;anywhere. Change&nbsp;anything.&nbsp;Ship&nbsp;faster.
      </XDSHeading>
      <XDSText
        display="block"
        type="body"
        color="secondary"
        xstyle={styles.descriptionWidth}>
        A design system that adapts to your workflow, not the other way around.
        Built for speed, clarity, and creative freedom.
      </XDSText>
    </XDSVStack>
  );
}

export function FeaturesShowcase() {
  return (
    <XDSVStack as="section" align="center" gap={10} width="100%">
      <FeaturesHeading />
      <XDSGrid
        columns={{minWidth: 320, repeat: 'fit'}}
        gap={4}
        xstyle={styles.gridLayout}>
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} isTall={i === 0} />
        ))}
      </XDSGrid>
    </XDSVStack>
  );
}
