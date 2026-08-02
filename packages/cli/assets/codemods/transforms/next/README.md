# Next release codemods

Put new core codemods here while normal feature PRs are in flight.

Why: the folder that ships a codemod is the **target package version** that will
include the breaking change. Feature PRs usually do not know that version yet;
the Version Packages PR decides it after `changeset version` resolves all pending
changesets. This `next` folder works like Changesets: contributors stage work
here, then the release/versioning step promotes it into the actual versioned
folder.

## Authoring rules

- Add new transform modules directly under this directory.
- Add or update this directory's `index.mjs` so it exports the transforms in the
  order they should run.
- Keep tests next to the transform, following existing version-folder patterns.
- Do **not** guess a future `v0.x.y` folder in feature PRs.
- Do **not** put release-specific content in this README; it stays in `next`.

## Release promotion

`pnpm version-packages` runs `scripts/promote-codemod-next.mjs` after
`changeset version`. The script copies every entry in this directory except this
README into `packages/cli/assets/codemods/transforms/v<new-core-version>/` and
removes the promoted files from `next`.

After promotion, the Version Packages PR should review the generated version
folder and add it to `packages/cli/assets/codemods/registry.mjs` if it is a new
version folder.
