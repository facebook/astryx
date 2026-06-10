// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

// Editorial-style "about" section: a left-anchored heading block sits
// alongside three feature columns. Each feature column leads with a
// small pastel decorative shape, then a bold title, body copy, and a
// "→" CTA link. The four blocks share a single CSS grid so they snap
// to a clean 1fr / 1fr / 1fr / 1fr layout at >=720px and reflow into
// a single stacked column below that. We skip an intermediate 2-col
// breakpoint on purpose — with 1 heading + 3 features, a 2-col grid
// produces an awkward orphan column on the last row.
//
// Decorative shape fills — pulled from the categorical
// (non-semantic) background tokens so the shapes pick up each
// theme's pink / purple / yellow ramp automatically and invert
// for dark mode without hand-rolled palettes. These tokens are
// 33% alpha pastel washes by default, which read perfectly as
// soft decorative blobs on the white showcase surface, and any
// theme can retint them centrally without touching this file.
const PINK_PASTEL = 'var(--color-background-pink)';
const LAVENDER_PASTEL = 'var(--color-background-purple)';
const YELLOW_PASTEL = 'var(--color-background-yellow)';

const SHAPE_SIZE = 40;

const styles = stylex.create({
  // Cap the section at the same 1200px maxWidth used by sibling
  // showcases (Features, Discover) so all three sections line up
  // vertically inside the showcaseOverlay container.
  sectionLayout: {
    width: '100%',
    maxWidth: 1200,
  },
  // Responsive grid for the heading + 3 feature columns.
  //
  // Breakpoints (mirrors FeaturesShowcase):
  //   < 1024px  -> 1 column (everything stacks vertically)
  //   >= 1024px -> heading 1fr | 3-feature-grid 2fr side-by-side
  //
  // We skip the intermediate 2-col arrangement because at
  // 720-1023 the 1fr / 2fr split squishes each sub-column to
  // ~150px which makes the body copy unreadable. Going straight
  // from 1-col stack to the full desktop layout keeps the design
  // legible at every width.
  grid: {
    width: '100%',
    display: 'grid',
    gap: spacingVars['--spacing-8'],
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 1024px)': '1fr 2fr',
    },
  },
  // Inner sub-grid for the three feature columns — split evenly
  // inside the 2/3 cell on the right of the parent grid. Same
  // breakpoint as the outer grid so the stack/3-col switch
  // happens together.
  columnsGrid: {
    display: 'grid',
    gap: spacingVars['--spacing-8'],
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 1024px)': 'repeat(3, 1fr)',
    },
  },
  // Each feature column: shape on top, then a small gap, then title,
  // body, and link. Always flush-left at every viewport — at desktop
  // it reads as a side-by-side editorial layout; at mobile the
  // columns stack vertically but stay left-aligned for consistency.
  column: {
    width: '100%',
    alignItems: 'flex-start',
    textAlign: 'start',
  },
  // Mobile centering for the section heading + description block.
  // Same breakpoint as the column stack — when everything is in a
  // single vertical column, the eye expects centered content; the
  // start-aligned look only makes sense in the side-by-side grid.
  headingBlock: {
    width: '100%',
    alignItems: {
      default: 'center',
      '@media (min-width: 1024px)': 'flex-start',
    },
    textAlign: {
      default: 'center',
      '@media (min-width: 1024px)': 'start',
    },
  },
  // Decorative shape slot — fixed 40x40 box so the SVG renders at
  // the expected size and the column header sits at a consistent
  // baseline across all three feature columns.
  //
  // Rendered as a raw <span> in the JSX because XDS has no
  // primitive for "fixed-size inline-block decorative SVG wrapper"
  // (XDSIcon is glyph-only and bound to its registry; XDSThumbnail
  // is chat-attachment chrome). The wrapper exists purely to reserve
  // space and clip the shape — there is no semantic content here.
  shapeSlot: {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    display: 'block',
    flexShrink: 0,
  },
  // "→" arrow trail on the CTA link. Astryx's XDSLink renders inline
  // by default; the arrow lives inside the link label so it inherits
  // the link color + hover state automatically.
  cta: {
    // Bump the CTA away from the body text. The XDSVStack gap holds
    // title↔body at 8px; the CTA wants more breathing room (16px)
    // so the link reads as a separate action zone rather than part
    // of the paragraph.
    marginTop: spacingVars['--spacing-2'],
  },
});

type AboutColumn = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  shape: ReactNode;
};

// All three decorative shapes are inherited verbatim from the
// pre-redesign AboutShowcase (origin/main) — the original file
// defined three soft, organic silhouettes (a 16-bump rounded
// flower/blob, a pillow-shaped rounded square with concave sides,
// and a rounded-corner diamond) that already match the "irregular
// pastel splat" treatment in the new design reference. We reuse
// the exact path data here, swap the orange-channel to pink, and
// render each shape at SHAPE_SIZE (40px) — same viewBox the
// original used so the path math stays unchanged.
//
// Mapping (original color -> new categorical token):
//   BlobIcon    (orange) -> --color-background-pink   "Design for speed"
//   SquareIcon  (purple) -> --color-background-purple "Built by the people who use it"
//   DiamondIcon (yellow) -> --color-background-yellow "Ready for what's next"

// Pink "rounded flower" blob — 16 alternating bumps around a circle.
// Reused verbatim from origin/main's BlobIcon (40x40 viewBox), just
// re-tinted from the orange categorical token to the pink one.
function PinkBlobShape() {
  return (
    <svg
      width={SHAPE_SIZE}
      height={SHAPE_SIZE}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true">
      <path
        fill={PINK_PASTEL}
        d="M17.081 1.19166C18.7027 -0.397219 21.2973 -0.397219 22.919 1.19166C23.9616 2.21324 25.4625 2.61539 26.8763 2.25201C29.0751 1.68683 31.3221 2.98415 31.9321 5.17099C32.3243 6.57703 33.423 7.67574 34.829 8.06792C37.0159 8.67788 38.3132 10.9249 37.748 13.1237C37.3846 14.5375 37.7868 16.0384 38.8083 17.081C40.3972 18.7027 40.3972 21.2973 38.8083 22.919C37.7868 23.9616 37.3846 25.4625 37.748 26.8763C38.3132 29.0751 37.0159 31.3221 34.829 31.9321C33.423 32.3243 32.3243 33.423 31.9321 34.829C31.3221 37.0159 29.0751 38.3132 26.8763 37.748C25.4625 37.3846 23.9616 37.7868 22.919 38.8083C21.2973 40.3972 18.7027 40.3972 17.081 38.8083C16.0384 37.7868 14.5375 37.3846 13.1237 37.748C10.9249 38.3132 8.67788 37.0159 8.06792 34.829C7.67574 33.423 6.57703 32.3243 5.17099 31.9321C2.98415 31.3221 1.68683 29.0751 2.25201 26.8763C2.61539 25.4625 2.21324 23.9616 1.19166 22.919C-0.397219 21.2973 -0.397219 18.7027 1.19166 17.081C2.21324 16.0384 2.61539 14.5375 2.25201 13.1237C1.68683 10.9249 2.98415 8.67788 5.17099 8.06792C6.57703 7.67574 7.67574 6.57703 8.06792 5.17099C8.67788 2.98415 10.9249 1.68683 13.1237 2.25201C14.5375 2.61539 16.0384 2.21324 17.081 1.19166Z"
      />
    </svg>
  );
}

// Lavender pillow / "soft cloud" — chunky rounded square with concave
// indents on each side. Reused verbatim from origin/main's SquareIcon,
// re-tinted from purple to lavender.
function LavenderCloudShape() {
  return (
    <svg
      width={SHAPE_SIZE}
      height={SHAPE_SIZE}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true">
      <path
        fill={LAVENDER_PASTEL}
        d="M33.0469 0C36.8869 0.00014921 39.9999 3.11308 40 6.95312C40 9.9458 38.109 12.4963 35.457 13.4766C38.109 14.4568 39.9999 17.0074 40 20C40 22.9927 38.109 25.5431 35.457 26.5234C38.109 27.5037 39.9999 30.0542 40 33.0469C40 36.887 36.887 39.9998 33.0469 40H6.95312C3.113 39.9999 0 36.887 0 33.0469C9.21712e-05 30.0545 1.89042 27.5039 4.54199 26.5234C1.89043 25.5429 0 22.9924 0 20C9.21712e-05 17.0077 1.89042 14.457 4.54199 13.4766C1.89043 12.496 0 9.94549 0 6.95312C0.000107288 3.11307 3.11307 0.000125546 6.95312 0H33.0469Z"
      />
    </svg>
  );
}

// Yellow rounded diamond — a rotated rounded square. Reused verbatim
// from origin/main's DiamondIcon (28x28 inner rect, 6px corner
// radius, rotated 45deg around the 40x40 center), just re-tinted
// with a saturated pastel yellow.
function YellowDiamondShape() {
  return (
    <svg
      width={SHAPE_SIZE}
      height={SHAPE_SIZE}
      viewBox="0 0 40 40"
      aria-hidden="true">
      <rect
        x={6}
        y={6}
        width={28}
        height={28}
        rx={6}
        fill={YELLOW_PASTEL}
        transform="rotate(45 20 20)"
      />
    </svg>
  );
}

const columns: AboutColumn[] = [
  {
    title: 'Design for speed',
    description:
      'Foundations you can trust, speed you can feel. The system is built so teams stop reinventing the basics and start shipping the ideas that matter.',
    ctaLabel: 'Get started in minutes →',
    ctaHref: '/docs/getting-started',
    shape: <PinkBlobShape />,
  },
  {
    title: 'Built by the people who use it',
    description:
      'The system gets sharper when we put it to work in the real world. Using it in context strengthens the whole system for everyone.',
    ctaLabel: 'Learn how to contribute →',
    ctaHref: '/community',
    shape: <LavenderCloudShape />,
  },
  {
    title: "Ready for what's next",
    description:
      'The quality bar is accelerating. Astryx pairs opinionated foundations with flexible patterns so your system keeps pace — no matter how the craft evolves.',
    ctaLabel: "See what's new →",
    ctaHref: '/changelog',
    shape: <YellowDiamondShape />,
  },
];

function AboutHeading() {
  return (
    <XDSVStack gap={4} xstyle={styles.headingBlock}>
      <XDSHeading level={2} type="display-2" color="primary">
        Astryx powers over 13,000 apps
      </XDSHeading>
      <XDSText type="large" weight="normal" color="secondary">
        Astryx has grown inside Meta over the last eight years, shaped by the
        engineers, designers, and product teams who depend on it every day.
      </XDSText>
    </XDSVStack>
  );
}

function AboutColumn({column}: {column: AboutColumn}) {
  return (
    <XDSVStack gap={3} xstyle={styles.column}>
      <span {...stylex.props(styles.shapeSlot)}>{column.shape}</span>
      <XDSVStack gap={2}>
        <XDSHeading level={2} color="primary">
          {column.title}
        </XDSHeading>
        <XDSText type="body" color="primary">
          {column.description}
        </XDSText>
      </XDSVStack>
      <XDSLink
        type="body"
        color="primary"
        href={column.ctaHref}
        hasUnderline={false}
        xstyle={styles.cta}>
        {column.ctaLabel}
      </XDSLink>
    </XDSVStack>
  );
}

export function AboutShowcase() {
  return (
    <XDSVStack as="section" align="center" width="100%">
      {/* sectionLayout / grid / columnsGrid are kept as plain <div>s
          because each is a CSS-grid container with responsive
          `grid-template-columns` (see styles below). XDSGrid hardcodes
          a single integer column count and a single gap, so it can't
          express the 1fr-stack → 1fr/2fr → repeat(3, 1fr) responsive
          patterns this section needs. */}
      <div {...stylex.props(styles.sectionLayout)}>
        <div {...stylex.props(styles.grid)}>
          <AboutHeading />
          <div {...stylex.props(styles.columnsGrid)}>
            {columns.map(col => (
              <AboutColumn key={col.title} column={col} />
            ))}
          </div>
        </div>
      </div>
    </XDSVStack>
  );
}
