---
'@astryxdesign/core': patch
---

[feat] AspectRatio, Badge, Blockquote, Card, Center, Code, Divider, Grid, Section, Skeleton and VisuallyHidden no longer carry `'use client'` (#823). Each was verified against its transitive import graph to use no React client API, no client-only dependency and no module-level mutable state, so they can now render in a React Server Component without forcing a client boundary. A new `serverSafeComponents.test.ts` derives the server-safe set from the import graph and fails if one of these components later gains a client dependency without restoring the directive — including the transitive case `scripts/check-use-client.mjs` cannot see.

Not a breaking change: no prop, type or export changed, and `'use client'` is inert outside an RSC bundler. Client consumers keep working identically, though bundlers may lay these modules out in different chunks now that they are no longer client entry points.

@AKnassa
