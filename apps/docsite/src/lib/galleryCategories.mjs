// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file galleryCategories.mjs
 *
 * Authored configuration for the /components gallery: the order categories
 * appear in, and how many of the resulting tiles render eagerly.
 *
 * @input  nothing — this is hand-authored, not derived
 * @output GALLERY_CATEGORIES, EAGER_SHOWCASE_COUNT
 * @position read by src/app/(docs)/components/page.tsx (renders the
 *   categories in this order) and by scripts/generate-data.mjs (counts off
 *   the first EAGER_SHOWCASE_COUNT tiles in that same order to decide which
 *   showcases to statically import)
 *
 * It lives here, in one hand-written module both sides import, precisely
 * because those two uses have to agree: the eager set is defined as "the
 * tiles at the top of the page", so a second copy of the order could put
 * the eager imports on tiles that are no longer at the top — shipping the
 * chunk cost without removing any loading state. `.mjs` so the data
 * generator can import it directly, the same arrangement as
 * src/lib/typeDefinitions.mjs.
 *
 * Reordering the gallery is a normal edit to this file.
 */

/**
 * Category display order for the /components gallery.
 * Sourced from component .doc.mjs `category` fields.
 *
 * @type {readonly string[]}
 */
export const GALLERY_CATEGORIES = [
  'Action',
  'Chat',
  'Container',
  'Content',
  'Data Input',
  'Data Visualization',
  'Feedback & Status',
  'Layout',
  'Navigation',
  'Overlay',
  'Table & List',
  'Utility',
];

/**
 * How many gallery tiles are rendered eagerly — statically imported, so they
 * are part of the page chunk and server-render into the prerendered HTML
 * instead of waiting for hydration plus a chunk fetch.
 *
 * 12 covers everything in the viewport up to a 2560x1440 display (measured:
 * 6 tiles in view at 1440x900, 9 at 1920x1080, 10 at 2560x1440) and lands on
 * a category boundary — all of Action, plus the first two of Chat. The 12
 * showcase sources total ~9 KB of TSX.
 *
 * Raising this is cheap but not free: every eager showcase pulls the
 * components it uses into the initial page chunk.
 *
 * @type {number}
 */
export const EAGER_SHOWCASE_COUNT = 12;
