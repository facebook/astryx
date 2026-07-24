# @astryxdesign/richtext

Astryx rich text — a Lexical-based rich text editor and viewer.

> **Status: empty scaffold.** This package is bootstrapped but does not export
> anything yet. It will house the rich text editor and viewer that currently
> live in `@astryxdesign/lab`; that code will move here without a fresh package
> rollout.

It will ship to npm **only under the `@canary` dist-tag** — there is never a
stable (`latest`) release yet.

## Trying richtext in your own project (canary)

Once components land, `@astryxdesign/richtext` will be published **only** under
the `@canary` dist-tag, so you must request that tag explicitly. There is no
`latest` version to install.

```bash
npm install @astryxdesign/richtext@canary @astryxdesign/core@canary
```

> Canary builds track the latest commit on `main` (`0.x.y-canary.<sha>`). They
> can break between any two versions — pin an exact version if you need
> stability.

## Why no stable release?

`package.json` keeps `"private": true` plus an `"astryx": { "canaryOnly": true }`
marker. The release workflow's stable (`latest`) job skips both private and
`canaryOnly` packages, while the canary job strips `private` in its ephemeral CI
checkout only (never in git) to publish the `@canary` tag. The committed
`private: true` is npm's hard guarantee that no stable publish can ever happen —
**do not remove it.**

## Publishing publicly (when the editor/view are ready)

When maintainers are ready to promote richtext to a stable public release:

1. Move the editor/view source from `@astryxdesign/lab` into `src/` and export
   it from `src/index.ts`. Add the StyleX CSS build wiring (see below).
2. Remove `"private": true` **and** the `"astryx": { "canaryOnly": true }`
   marker from `package.json`.
3. Add a changeset (`pnpm changeset`) selecting `@astryxdesign/richtext` so the
   release workflow versions and publishes it to the `latest` dist-tag.
4. The stable (`latest`) release job (`.github/workflows/release.yml`) will then
   include richtext on the next release.

### Adding the StyleX CSS build (deferred until the first component)

This scaffold intentionally omits the `build:css` step. `build-css.mjs` exits
with an error ("No StyleX rules found") when a package has zero StyleX
components, which would break CI for an empty package. When the first StyleX
component lands:

1. Register a `richtext` target in `scripts/build-css.mjs` (mirror the `lab` /
   `charts` entries — same core token alias).
2. Add `"build:css": "node ../../scripts/build-css.mjs --package richtext"` to
   the `scripts` block and append `&& pnpm build:css` to the `build` script
   (before `check-no-dev-jsx`).
3. Add a `"./richtext.css"` entry to `exports` and add `richtext.css` under
   `files` if needed.

The babel config is already StyleX-ready, so this is a small, mechanical add.
