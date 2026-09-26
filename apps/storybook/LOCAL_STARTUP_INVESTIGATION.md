# Local Storybook startup reliability investigation

Date: 2026-08-15

## Summary

Local Storybook is usually not failing to compile. The recurring failure mode is
that `storybook dev` announces that Storybook is ready after the manager and
preview shell are available, while Vite is still optimizing dependencies and
the requested story is still being transformed. Opening the URL at that point
can show a manager with an incomplete or indefinitely loading preview.

Cold worktree caches make this frequent in the Astryx workspace. Storybook's
cache is stored inside each worktree, the workspace aliases large packages to
source, and the default development command always asks for port 6006. Together,
those choices make a fresh or recently updated worktree slow to become usable
and make it easy to open a stale server from another worktree.

The Bottom Sheet story that prompted this investigation is not a compile
failure. TypeScript, ESLint, formatting, and a full production Storybook build
all passed.

## Evidence from this incident

### Storybook reported ready before optimization finished

The development server printed:

```text
Storybook ready!
- Local: http://localhost:6007/
2.71 s for manager and 295 ms for preview
Vite [optimizer] bundling dependencies...
```

The URL was shared after the ready banner, but before the final optimizer line
had settled. The manager, `index.json`, and the story iframe shell all returned
HTTP 200; that only proved that the server and HTML shell were available. It did
not prove that the story module had executed in the browser.

This is expected dev-server behavior: stories and much of their dependency
graph are transformed on demand. The ready banner is therefore not a reliable
"selected story is rendered" signal.

### The worktree required dependency re-optimization

Startup also printed:

```text
Vite Re-optimizing dependencies because lockfile has changed
```

The resulting worktree-local optimizer cache contained 136 generated files.
There are currently 17 separate Storybook cache roots across Astryx worktrees.
A new worktree, a dependency install, a lockfile update, a Storybook version
change, or a relevant Vite configuration change can create another cold cache.

Vite's metadata explicitly keys this cache from both the lockfile and resolved
configuration hashes. Frequent rebases onto `main` therefore make cold starts a
normal part of local work rather than an exceptional event.

### Astryx has a large transform graph

The full build succeeded, but it transformed 4,077 modules and took 21.10
seconds for the Vite build alone. Plugin timing reported these largest shares:

- Storybook project annotations: 53%
- Storybook mock loader: 14%
- StyleX: 13%
- React docgen: 12%
- CSF processing: 6%

The Storybook configuration aliases Core, Lab, Charts, Vega, and themes to their
source trees. That is useful for component development, but a cold preview must
process a substantial source and StyleX graph before some stories can render.

### The default port can point at the wrong worktree

`apps/storybook/package.json` hardcodes port 6006. During this incident, port
6006 was already owned by a two-day-old Storybook process from the
`bottom-sheet-orchestrator` worktree. The requested preview had to use 6007.

Without an exact-port check and an explicit URL, a developer can either fail to
start Storybook or open a valid-looking but stale Storybook from another
worktree.

### Dependency setup can add more churn

The first formatting, lint, and typecheck commands in this worktree reconciled
the pnpm workspace and ran postinstall hooks. Concurrent invocations also
contended on the shared bare repository's Git config during `husky install`.
Those commands eventually passed and did not cause the story failure, but they
are another reason not to start or assess Storybook while first-use dependency
setup is still running.

## Existing mitigation and unrelated warnings

The repository already sets `optimizeDeps.holdUntilCrawlEnd` to `false`. This is
a valid Vite 8 option and was added specifically because StyleX transforms had
previously kept the dependency crawl open. It mitigates the worst spinner case,
but it does not make the ready banner wait for a selected story to render.

The following warnings appeared but did not fail the full build:

- no `stories/**/*.mdx` files were found;
- `optimizeDeps.esbuildOptions` is deprecated in Vite 8 in favor of Rolldown
  options;
- Lexical has pure-annotation placement warnings;
- some production chunks exceed 500 kB;
- the neutral theme uses runtime style injection in development.

They should not be used as evidence that a local preview failed. The deprecated
optimizer configuration deserves cleanup, but it did not block this build.

## Recommendations

### 1. Verify the story, not the server banner

For local review automation, do not share the URL as soon as Storybook prints
`ready`. Load the exact story and wait for a browser-level assertion, such as
the expected trigger text appearing without a Storybook error screen. An HTTP
200 from `/`, `index.json`, or `iframe.html` is insufficient because those can
all succeed before the story module renders.

Where browser automation is unavailable, use a full static build before
sharing a review URL:

```sh
pnpm -F @astryxdesign/storybook build
```

Serve `apps/storybook/dist` only after that command completes successfully.
This is slower and has no hot reload, but it proves every story compiled.

### 2. Make port ownership explicit

Use an explicitly selected free port and Storybook's `--exact-port` option for
development. Print the worktree path and final URL together. This turns a stale
6006 process into an obvious startup failure instead of a plausible but wrong
preview.

### 3. Add a deterministic local-review command

Add a repository script that performs one of these flows:

- development: select an unused port, start with `--exact-port`, navigate to a
  requested story ID, and wait for a browser-level ready assertion;
- static review: build all of Storybook, serve `dist` on an unused port, and
  verify that the requested story ID exists in `index.json`.

The static flow is the better default for review handoff. The development flow
is better when the user needs hot reload.

### 4. Stabilize dependency setup before startup

Run one workspace install/reconciliation to completion before launching
parallel lint, typecheck, or Storybook processes in a fresh worktree. Avoid
multiple simultaneous first-use pnpm commands because their lifecycle hooks
share the bare repository's Git configuration.

### 5. Profile cold development startup before changing optimization

The current crawl workaround is still supported. Do not remove it based on the
Vite 8 deprecation warning, which applies to `esbuildOptions`, not
`holdUntilCrawlEnd`.

As a separate performance task, measure whether an explicit
`optimizeDeps.include` list plus `noDiscovery` improves cold startup. That can
avoid a full crawl, but it is only safe if every CommonJS dependency needed by
Storybook is listed. Also evaluate narrower package subpath imports or aliases
to reduce the amount of Core, Lab, Charts, and Rich Text source transformed for
an individual story.

### 6. Migrate the deprecated optimizer target configuration

Move or remove the Vite 7-era `optimizeDeps.esbuildOptions.target` setting after
verifying the equivalent Vite 8 Rolldown configuration. This is maintenance,
not the immediate reliability fix, but it will keep the local startup path on
supported configuration and make future warnings more actionable.

## Conclusion

The recurring impression that Storybook is "not fully built" is accurate, but
the primary issue is the handoff timing and local workflow rather than broken
stories. Astryx's dev server is intentionally lazy, its readiness signal is too
early for review handoff, and worktree-local caches make cold optimization
common. A browser-level story readiness check or a completed static build is the
reliable gate.
