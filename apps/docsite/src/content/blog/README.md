# Adding a Blog Post

The Astryx docsite blog lives at `/blog` (index) and `/blog/<slug>` (post detail).
Posts are human-authored. Adding one is intentionally close to "drop in one
Markdown file."

> **Principle:** metadata organizes the blog; humans write the prose. There is
> no required article template — structure each post however reads best.

## 1. Create the post file

Add a Markdown file under:

```
apps/docsite/src/content/blog/posts/<slug>.md
```

The filename (minus `.md`) becomes the URL slug, e.g.
`introducing-astryx.md` → `/blog/introducing-astryx`.

Start it with YAML frontmatter, then write the body in Markdown:

```md
---
title: 'Designing agent-ready components'
description: 'How Astryx structures component APIs and docs so humans and agents can build with confidence.'
date: '2026-06-17'
type: 'guide'
authors:
  - 'your-handle'
tags:
  - 'AI'
  - 'Components'
  - 'Docs'
---

Write the post in human-authored prose here. Use any structure that fits —
headings, code blocks, lists, links. The body is rendered with `Markdown`.
```

## 2. Frontmatter reference

### Required

| Field         | Type           | Notes                                                                      |
| ------------- | -------------- | -------------------------------------------------------------------------- |
| `title`       | string         | Article `h1`, card title, default page/social title.                       |
| `description` | string         | Card excerpt, article dek, default meta description.                       |
| `date`        | `YYYY-MM-DD`   | Publish date and default sort key (latest first).                          |
| `type`        | enum           | One of `update`, `guide`, `design`, `story`, `perspective`, `engineering`. |
| `authors`     | string[]       | One or more author keys from the author registry (see step 3).             |
| `tags`        | string[] (1–4) | Topical tags for chips and discovery.                                      |

### Optional

| Field         | Type             | Notes                                                           |
| ------------- | ---------------- | --------------------------------------------------------------- |
| `updatedAt`   | `YYYY-MM-DD`     | Shows an "Updated" date; does not replace `date`.               |
| `draft`       | boolean          | `true` keeps the post in the repo but out of production output. |
| `coverImage`  | string           | Path to a custom cover image (e.g. `/blog/<slug>/cover.png`).   |
| `coverAlt`    | string           | **Required when `coverImage` is set.** Alt text for the cover.  |
| `relatedDocs` | `{title,href}[]` | Curated related-doc links rendered near the end of the article. |

Required frontmatter is validated at build time (`pnpm generate`) and in tests.
A missing or malformed field fails the build with a clear, slug-prefixed error.

### Post types

| Type          | Use for                                                       |
| ------------- | ------------------------------------------------------------- |
| `update`      | Functionality improvements, releases, new capabilities.       |
| `guide`       | Practical, educational posts.                                 |
| `design`      | Visual and design-craft posts: composition, color, motion.    |
| `story`       | User stories, community examples, adoption stories.           |
| `perspective` | Design-system philosophy, industry observations, opinions.    |
| `engineering` | Implementation details, infrastructure, technical deep dives. |

Each post has exactly one `type`. Type filters only appear on the index when
more than one type has published content.

## 3. Add yourself to the author registry (once)

Authors are referenced by key so profile metadata lives in one place:

```
apps/docsite/src/content/blog/authors.ts
```

```ts
export const authors = {
  'your-handle': {
    name: 'Your Name',
    github: 'your-handle', // avatar + profile link are derived from GitHub
    role: 'Design', // optional
  },
} as const satisfies Record<string, AuthorProfile>;
```

For GitHub-backed authors, the avatar and profile link default to
`https://github.com/<handle>.png` and `https://github.com/<handle>` — no
build-time profile fetching. Then reference the key from your post:

```yaml
authors:
  - 'your-handle'
```

## 4. Cover images

A custom cover is optional. If you omit `coverImage`, the site renders a calm,
deterministic default cover derived from the post `type` and `slug` — so every
post has visual presence without bespoke artwork.

To use a custom cover, put the image under `public/blog/<slug>/` and reference
it with alt text:

```yaml
coverImage: '/blog/<slug>/cover.png'
coverAlt: 'Short description of the image'
```

## 5. Preview locally

```bash
cd apps/docsite
pnpm dev            # runs `pnpm generate` first, then starts Next.js
```

Visit `/blog` and `/blog/<slug>`. Drafts (`draft: true`) render in dev but are
excluded from production builds.

## 6. Validate before you push

```bash
pnpm generate       # discovers + validates posts into src/generated/blogRegistry.ts
pnpm test           # runs blog discovery/validation tests
pnpm typecheck
```

That's it — no index pages to edit, no manual wiring. The post is discovered
automatically and sorted into place by date.
