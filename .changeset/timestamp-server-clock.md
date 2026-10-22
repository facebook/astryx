---
'@astryxdesign/core': patch
---

[fix] Timestamp no longer reads the current time while rendering on the server. Absolute formats (`date`, `time`, `date_time` and the other fixed formats) never read the clock, so pages that use them prerender in Next.js with `cacheComponents` turned on, the default for new Next.js 16 apps, where they used to fail the build. `relative`, `relative_short` and `auto` read the clock on the client only: a server render or static prerender shows the full date and time in UTC, labelled, and the client switches to the format's normal output right after hydration, so server and client markup now always match. Client-only rendering is unchanged. No API changes.

@josephfarina
