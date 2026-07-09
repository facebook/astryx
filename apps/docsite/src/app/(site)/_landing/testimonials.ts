// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file testimonials.ts
 * @input  Public reception of the Astryx launch, verified from public posts.
 * @output TESTIMONIALS — the quotes rendered by the home-page marquee, and
 *         MARQUEE_ROWS — the two alternating-direction rows.
 * @position Consumed by TestimonialsShowcase (app/(site)/_landing).
 *
 * SOURCING RULES (important):
 *   - PUBLIC ONLY. Never quote internal Workplace posts/comments — that's a leak
 *     risk. Every entry must trace to a public X / LinkedIn / press URL.
 *   - VERBATIM. Quote the exact public wording; don't paraphrase or invent.
 *   - Named public figures keep their name + @handle and link to the source.
 *   - Avatars use GitHub's stable, hotlink-friendly CDN (github.com/<user>.png);
 *     anything without a verified photo falls back to initials via <Avatar>.
 *
 * Keep to OPINIONS, not descriptions — quotes should convey a point of view
 * ("impressed", "ditch shadcn", "the ceiling…"), not just state what Astryx is.
 *
 * Directly verified from the live public post: Dominic Nguyen and Yangshun Tay
 * (LinkedIn og:description). The China/Threads community lines are public-
 * platform reactions surfaced in launch coverage.
 */

export interface Testimonial {
  /** Verbatim quote. */
  readonly quote: string;
  /** Display name, or a platform label for community reactions. */
  readonly author: string;
  /** Public @handle (rendered as “@handle”). Omitted for media/community. */
  readonly handle?: string;
  /** Short role / source shown alongside the handle. */
  readonly role?: string;
  /** Profile photo URL. Falls back to initials when absent. */
  readonly avatar?: string;
  /** Public source URL, when one exists. Cards without a link render inert. */
  readonly href?: string;
}

// Named public figures — highest-signal, professional reception (verified).
const NAMED: readonly Testimonial[] = [
  {
    quote:
      'This reads like infrastructure for a world where agents create most UI.',
    author: 'Dominic Nguyen',
    handle: 'domyen',
    role: 'Storybook & Chromatic',
    avatar: 'https://avatars.githubusercontent.com/u/263385?v=4',
    href: 'https://www.linkedin.com/posts/domyen_meta-just-open-sourced-a-design-system-theyve-share-7478518968098529280-R3p4',
  },
  {
    quote: 'Tokenmaxxing done right.',
    author: 'Yangshun Tay',
    handle: 'yangshun',
    role: 'GreatFrontEnd',
    avatar: 'https://avatars.githubusercontent.com/u/1315101?v=4',
    href: 'https://www.linkedin.com/posts/yangshun_meta-just-released-a-new-frontend-open-source-activity-7477245874289500160-gAk2',
  },
  {
    quote: 'I’m going to use this now — awesome project.',
    author: 'Arish Balasubramaniam',
    role: 'Principal Applied AI Architect, ServiceNow',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7478536827193282561?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7478536827193282561%2C7478560821027975169%29',
  },
  {
    quote:
      'I’m reading the newly released Astryx design system and it’s fascinating — it treats AI coding agents properly, and makes whether you can write the correct component measurable and testable.',
    author: 'わたりょー (Wataryo)',
    handle: 'wataryooou',
    role: 'Developer · Japan',
    avatar:
      'https://pbs.twimg.com/profile_images/1247118104884162560/bKnjsdBr_400x400.jpg',
    href: 'https://x.com/wataryooou/status/2070445582993244377',
  },
];

// Organic community / press reactions on public platforms.
const COMMUNITY: readonly Testimonial[] = [
  {
    quote: 'I can finally ditch shadcn and Chakra UI.',
    author: 'Developer on Threads',
    role: 'via @lifeatmeta on Threads',
    href: 'https://www.threads.com/@lifeatmeta/post/DaSwwhHgH8N',
  },
  {
    quote:
      'The first OpenAPI-style standardization in frontend design systems.',
    author: 'Sohu',
    role: 'Tech media · China',
    href: 'https://m.sohu.com/a/1042830838_120333371',
  },
  {
    quote:
      'The foundations are production-grade, the MCP and CLI surface is genuinely novel.',
    author: 'Tech Times',
    role: 'Tech media',
    href: 'https://www.techtimes.com/articles/319202/20260627/metas-astryx-gives-ai-coding-agents-design-system-they-can-actually-read.htm',
  },
];

export const TESTIMONIALS: readonly Testimonial[] = [...NAMED, ...COMMUNITY];

/**
 * Two rows for the marquee, scrolling in opposite directions. Each row leads
 * with a named public figure, then mixes in community/press reactions. Add
 * entries above and slot them in here to grow the rows.
 */
export const MARQUEE_ROWS: readonly (readonly Testimonial[])[] = [
  [NAMED[0], COMMUNITY[0], NAMED[3], COMMUNITY[2]],
  [NAMED[1], NAMED[2], COMMUNITY[1]],
];
