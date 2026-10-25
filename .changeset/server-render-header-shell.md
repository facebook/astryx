---
'@astryxdesign/core': patch
---

[perf] Text, Heading, Kbd, Button, IconButton, TopNav and TopNavItem render in React Server Components. Text, Heading and Kbd are server modules: truncation with a tooltip and the `mod` key glyph load as small client parts only when used. `@astryxdesign/core/Button`, `@astryxdesign/core/IconButton` and `@astryxdesign/core/TopNav` gain a `react-server` export condition. Imported from those subpaths in a Server Component, a Button, IconButton, TopNav bar or TopNavItem whose props are data renders on the server with the markup the client component renders. The client component loads only where it is needed: for `clickAction`, `isLoading`, `tooltip`, an event handler or a `ref`; inside a ButtonGroup, InputGroup, size provider or LinkProvider; and in AppShell's drawer. The package root entry and `withAstryx()` source builds still resolve the client components. Client imports and the public API are unchanged.
@rhagigi
