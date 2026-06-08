// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
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
  // Layout glue for the XDSGrid: cap at 1200px. Each grid cell now
  // holds a full-height column wrapper (XDSVStack with height:100%)
  // rather than a single card, so the grid auto-stretches all three
  // columns to the tallest column's natural content height — which
  // is what gives us visually-balanced column heights even when one
  // column has one tall card and another has a tall card plus a
  // short card stacked.
  // 3-column desktop bento, 1-column mobile stack.
  //
  //   <1024px: single column — every card stacks vertically.
  //   ≥1024px: 3 fixed columns. Each column has a wrapper
  //            (XDSVStack with column style) that holds 1-2
  //            cards. Grid is align-items:stretch by default,
  //            so each column wrapper takes the full row height
  //            (set by min-height below). Cards inside with
  //            flex:1 (isFlex / isTall) grow to fill column
  //            leftover space.
  //
  // The column wrapper style (`column` below) uses display:
  // contents at mobile to dissolve the wrapper so cards become
  // direct children of the grid and the 1-col gridTemplateColumns
  // can lay them all out in source order.
  gridLayout: {
    width: '100%',
    maxWidth: 1200,
    display: 'grid',
    gap: 32,
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 1024px)': '1fr 1fr 1fr',
    },
    minHeight: {
      default: 0,
      '@media (min-width: 1024px)': 720,
    },
  },
  // Column wrapper. At desktop it's a flex column that takes the
  // full grid-cell height and stacks its 1-2 child cards. At
  // mobile (<1024) display:contents dissolves the wrapper so
  // its children become direct grid children — combined with
  // the parent's gridTemplateColumns:1fr at mobile, every card
  // gets its own row at full width.
  column: {
    display: {
      default: 'contents',
      '@media (min-width: 1024px)': 'flex',
    },
    flexDirection: 'column',
    gap: 32,
    width: '100%',
    height: '100%',
  },
  // Heading cell — the top-left column starts with plain text on
  // the page background (no card wrapper) per the bento reference.
  // paddingBlockStart matches the cards' internal padding
  // (spacing-5 = 20px) so the heading baseline visually aligns
  // with the heading inside the top-center "Over 150 components"
  // card. NO inline padding: the reference shows the heading text
  // starting flush at the column's left edge (NOT inset to match
  // the cards' internal padding) — keeping the full column width
  // also gives the display heading enough room to break onto
  // natural lines without being clipped by a tighter inner width.
  headingCell: {
    paddingBlockStart: 'var(--spacing-5)',
    width: '100%',
    // On desktop the heading block sits in a side-by-side grid
    // with the cards, where flush-left reads as an editorial
    // section header. Under 1024px (single-column stack — same
    // breakpoint as the grid switch) the heading is standalone
    // above the cards and centering reads better — matches the
    // centering treatment used in the AboutShowcase mobile layout.
    alignItems: {
      default: 'center',
      '@media (min-width: 1024px)': 'flex-start',
    },
    textAlign: {
      default: 'center',
      '@media (min-width: 1024px)': 'start',
    },
  },
  // All cards use XDSCard padding={0} and apply their own padding
  // via the innerPadding* styles below. This is intentional: XDSCard's
  // `padding={N}` prop wires its `padding-bottom` through a
  // (0,5,0)-specificity selector (`.xds-card-XXX:not(#\#):not(#\#)
  // :not(#\#):not(#\#)`) which beats any xstyle override at (0,1,0).
  // The CSS variable indirection ALSO doesn't work because the card
  // sets `padding-bottom: var(--spacing-N)` directly (not via the
  // --container-padding-block-end var). So owning the padding via
  // the inner stack is the only reliable way to get 0 bottom padding
  // for image cards while leaving full padding on the text-only card.

  // Tall card variant — applied to the right-column "Themes" card.
  // flex:1 grows the card to fill its parent column wrapper, which
  // is stretched by the grid to match the tallest sibling column.
  cardTall: {
    flex: 1,
    backgroundColor: 'light-dark(#E6F0FF, #1A2333)',
    overflow: 'hidden',
  },
  // Regular image card. overflow:hidden because the image is
  // intended to sit flush at the card's bottom edge but NOT bleed
  // past it (the image's bottom aligns with the card's bottom
  // rounded corner).
  card: {
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'light-dark(#E6F0FF, #1A2333)',
  },
  // Flex variant of `card` — image card that grows to fill its
  // column's leftover height so a column with a short text-only
  // sibling can still match the height of an adjacent column with
  // only one tall card.
  cardFlex: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'light-dark(#E6F0FF, #1A2333)',
  },
  // Text-only feature card variant — no image, so overflow hidden
  // keeps the card contour tidy at the rounded corners.
  cardTextOnly: {
    height: 'auto',
    overflow: 'hidden',
    backgroundColor: 'light-dark(#E6F0FF, #1A2333)',
  },
  // Padding for image cards: 40px on top + sides + 0 on bottom so
  // the image wrapper inside sits flush at the card's bottom edge
  // and can then bleed past it via its own negative marginBottom.
  innerPaddingImage: {
    paddingBlockStart: 40,
    paddingInlineStart: 40,
    paddingInlineEnd: 40,
    paddingBlockEnd: 0,
  },
  // Padding for the text-only card: 40px on all sides (matches the
  // other cards' visual padding rhythm — image cards use the same
  // 40px on top + sides, the only difference is the missing bottom
  // padding for the bleed).
  innerPaddingText: {
    padding: 40,
  },
  // Explore link spacing — VStack gap holds heading↔description at
  // 4px, but the link below the description wants more breathing room
  // (16px). Adding a top margin on the link gives the +12px extra
  // beyond the 4px stack gap to reach the 16px total.
  exploreLink: {
    marginTop: 'calc(var(--spacing-3))',
  },
  // Image wrapper for the 3 feature cards with images. The wrapper
  // is a full-width flex row (alignSelf:stretch overrides the parent
  // VStack's align="start" so this wrapper spans the full card
  // interior width, then justifyContent positions the inner image
  // horizontally within that full-width row).
  //
  // Regular cards left-align the image (justifyContent:flex-start)
  // per the bento reference; the tall card centers its larger
  // composition (see imageWrapTall).
  //
  // marginTop:auto pushes the wrapper to the bottom of the card's
  // content stack so the image always sits at the bottom regardless
  // of how much text wraps above.
  //
  // paddingTop creates breathing room between the "Explore" link
  // and the image.
  //
  // marginBottom is a literal negative pixel value (not tied to a
  // spacing token) that bleeds the image past the card's bottom
  // edge — combined with overflow:visible on the card AND
  // paddingBlockEnd:0 on the card, the image visibly pops past the
  // rounded corner. Note the image already sits flush at the card's
  // bottom (paddingBlockEnd:0); the negative margin is the
  // additional overhang.
  imageWrap: {
    marginTop: 'auto',
    paddingTop: 24,
    alignSelf: 'stretch',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    // overflow:hidden keeps the image contained inside the wrapper
    // (and therefore inside the card, since the card itself uses
    // overflow:hidden too). No bleed past the card edges in any
    // direction; the image sits flush at the card's bottom.
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  // Tall-card image wrapper variant. Centered (the tall right card
  // gets a wider composition that reads better centered than
  // hugging an edge). More top padding because the tall card has
  // more vertical room above the image baseline that we want to
  // leave visually open. Slightly more bleed (-32 vs -24) so the
  // larger image's overhang reads proportionally to its size.
  imageWrapTall: {
    marginTop: 'auto',
    paddingTop: 40,
    alignSelf: 'stretch',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    // Hard clip so the tall card's image stays inside the card.
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
  },
  // Default image: capped at 320px so a single composition (badges,
  // a small UI sample, a stack of mocks) doesn't span the full
  // card width — the reference shows images occupying the left
  // ~70% of the card's interior with whitespace to the right.
  // height:auto preserves natural aspect ratio. display:block kills
  // the inline baseline gap so there's no mystery whitespace under
  // the image.
  featureImage: {
    width: '100%',
    maxWidth: 320,
    height: 'auto',
    display: 'block',
  },
  // Tall-card image: larger cap so the composition reads as the
  // dominant lower-half element of the tall card per the reference.
  // Still height:auto so the natural aspect ratio is preserved.
  featureImageTall: {
    width: '100%',
    maxWidth: 400,
    height: 'auto',
    display: 'block',
  },
});

type Feature = {
  title: string;
  description: string;
  href: string;
  /**
   * Optional supporting image rendered below the description. When
   * present, the image is centered horizontally and bleeds past
   * the card's bottom edge per the bento layout reference. When
   * omitted, the card renders as text-only.
   */
  image?: {
    src: string;
    alt: string;
  };
};

// Looked up by slot key in the JSX below so each card's position in
// the bento grid is self-documenting. Keyed strings instead of an
// ordered array because the visual order in the grid is not the
// same as any obvious data order — explicit slot mapping is clearer
// than counting indices.
const features: Record<string, Feature> = {
  components: {
    title: `Over ${CORE_COMPONENT_COUNT_ROUNDED} components`,
    description:
      'Accessible and themeable React components with built-in spacing, dark mode, and flexible styling.',
    href: '/components',
    image: {
      src: '/feature-components.png',
      alt: 'Sample XDS components — Badge, Switch, Secondary button, Primary button, Search input',
    },
  },
  themes: {
    title: 'Themes that fit your brand',
    description:
      'Fully customizable themes ready for use. Make it yours without starting from scratch.',
    href: '/themes',
    image: {
      src: '/feature-brand.png',
      alt: 'Butter theme applied to a full product landing page with display script, primary CTA, and three product cards',
    },
  },
  templates: {
    title: 'Ready to ship templates',
    description:
      'Production-ready templates for common pages, just plug in your content.',
    href: '/templates',
    image: {
      src: '/feature-templates.png',
      alt: 'Stacked theme preview pages cascading toward a fully designed Butter theme example',
    },
  },
  cli: {
    title: 'A design system that your agent can use',
    description:
      'Scaffold projects, browse templates, generate themes, and get agent-ready docs from the command line or MCP.',
    href: '/docs/cli',
    // No image — this card is intentionally text-only per the bento
    // reference. The text-only card sits in the middle-bottom slot
    // and acts as visual counterweight against the three image-
    // anchored cards.
  },
};

function FeatureCard({
  feature,
  isTall = false,
  isFlex = false,
}: {
  feature: Feature;
  /**
   * Renders the card with the tall-variant image treatment (larger
   * image cap + more top padding above the image). Used by the
   * right-column "Themes" card which is the only card with a wider
   * vertical canvas for its composition.
   */
  isTall?: boolean;
  /**
   * When true, the card uses flex:1 so it grows to fill any leftover
   * vertical space inside its parent column. Used for the image
   * cards that need to balance against a short text-only sibling in
   * an adjacent column. Has no effect for the tall card (cardTall
   * already includes flex:1) or the text-only card (which is
   * intentionally shrink-to-content).
   */
  isFlex?: boolean;
}) {
  const hasImage = feature.image != null;
  // Style precedence:
  //   1. isTall   → cardTall (right-column dominant card)
  //   2. isFlex   → cardFlex (grow-to-fill image card)
  //   3. hasImage → card     (natural-height image card)
  //   4. else     → cardTextOnly (shrink-to-content text-only card)
  // Only one of these applies at a time.
  const cardStyle = isTall
    ? styles.cardTall
    : isFlex
      ? styles.cardFlex
      : hasImage
        ? styles.card
        : styles.cardTextOnly;

  return (
    <XDSCard variant="blue" padding={0} xstyle={cardStyle}>
      <XDSVStack
        gap={1}
        align="start"
        height="100%"
        xstyle={hasImage ? styles.innerPaddingImage : styles.innerPaddingText}>
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
        {hasImage && feature.image && (
          <div
            {...stylex.props(isTall ? styles.imageWrapTall : styles.imageWrap)}>
            <img
              src={feature.image.src}
              alt={feature.image.alt}
              {...stylex.props(
                isTall ? styles.featureImageTall : styles.featureImage,
              )}
            />
          </div>
        )}
      </XDSVStack>
    </XDSCard>
  );
}

// Plain heading block — sits in the top-left grid slot on the page
// background (no card wrapper) per the bento reference. The text is
// flush-left to the grid column edge (no inline padding) so the
// display heading has the full column width to break onto natural
// lines. The block's paddingBlockStart matches the cards' internal
// top padding so the heading and the adjacent card titles sit on
// roughly the same vertical baseline at the top of the row.
function HeadingBlock() {
  return (
    <XDSVStack gap={4} xstyle={styles.headingCell}>
      <XDSHeading level={2} type="display-2" color="primary">
        Start anywhere.
        <br />
        Change anything.
        <br />
        Ship faster.
      </XDSHeading>
      <XDSText display="block" type="large" weight="normal" color="secondary">
        A design system that adapts to your workflow, not the other way around.
        Built for speed, clarity, and creative freedom.
      </XDSText>
    </XDSVStack>
  );
}

export function FeaturesShowcase() {
  // Each grid cell holds a full-height column wrapper (XDSVStack
  // height:100%) rather than a single card, so the grid stretches
  // all three columns to the height of the tallest column. Cards
  // marked isFlex / isTall use flex:1 to grow into any leftover
  // vertical space inside their column, which is what visually
  // balances the column heights: the "Over 150 components" card in
  // the middle column grows to fill the space the short "CLI"
  // sibling leaves behind, matching the heights of the dedicated
  // "Templates" card on the left and the "Themes" card on the
  // right.
  //
  // Layout on desktop (≥720px):
  //   col 1: HeadingBlock + Templates (flex)
  //   col 2: Components (flex) + CLI (text-only, natural height)
  //   col 3: Themes (tall, flex)
  //
  // Below 720px the grid collapses to 1 column. Each column wrapper
  // renders top-to-bottom in DOM order, so the cards stack as:
  // heading → templates → components → CLI → themes.
  return (
    <XDSVStack as="section" align="center" gap={10} width="100%">
      <div {...stylex.props(styles.gridLayout)}>
        <div {...stylex.props(styles.column)}>
          <HeadingBlock />
          <FeatureCard feature={features.templates} isFlex />
        </div>
        <div {...stylex.props(styles.column)}>
          <FeatureCard feature={features.components} isFlex />
          <FeatureCard feature={features.cli} />
        </div>
        <div {...stylex.props(styles.column)}>
          <FeatureCard feature={features.themes} isTall />
        </div>
      </div>
    </XDSVStack>
  );
}
