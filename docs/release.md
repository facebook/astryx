## Releasing to npm via Trusted Publishing (OIDC)

astryx publishes its 12 public `@astryxdesign/*` packages to the public npm registry from GitHub Actions using **npm trusted publishing (OIDC)** — there is **no long-lived `NPM_TOKEN`** anywhere in CI. The publish job exchanges a short-lived GitHub OIDC token for a registry credential at publish time, and stamps **provenance** onto every package. A misconfigured trust relationship fails the publish loudly; there is no token to fall back to.

### How it fits together

- **Versioning is local and unchanged.** `pnpm run version-packages` (= `changeset version && format-changelogs`) only edits files and changelogs on disk. It needs no npm auth and is untouched by trusted publishing.
- **Publishing is pnpm-native and tokenless.** CI runs `pnpm publish ... --provenance --access public --no-git-checks` (not `changeset publish`, whose `npm whoami` precheck breaks under tokenless OIDC). pnpm natively fetches the OIDC token and attaches provenance.
- **Trust is per-package.** npm allows exactly **one** trust configuration per package, registered against the **calling** workflow. Each of the 12 packages must be configured individually.

### The publish workflow (`.github/workflows/deploy.yml`)

The `publish` job runs on push to `main` after `test` passes. The two requirements for OIDC are already present:

```yaml
permissions:
  contents: read
  id-token: write # required for npm trusted publishing (OIDC)
steps:
  - uses: actions/setup-node@v6
    with:
      node-version: 22
      registry-url: 'https://registry.npmjs.org' # writes .npmrc pointing at the registry
```

The publish step uses pnpm-native publishing and carries **no** `NODE_AUTH_TOKEN` / `secrets.NPM_TOKEN`:

```yaml
- name: Publish changed packages
  run: pnpm -r publish --provenance --access public --no-git-checks
```

`pnpm -r publish` resolves `workspace:*`/`catalog:` deps to real versions, skips already-published versions (so re-running is a no-op), respects `"private": true`, and publishes in dependency order.

> Why the `workflow_ref` claim matters: npm matches its stored trust config against the OIDC token's `workflow_ref` claim, which GitHub sets to the **calling** (entry) workflow — `deploy.yml` here — not any reusable workflow. astryx's publish runs directly in `deploy.yml` (no `workflow_call` indirection), so the trusted workflow filename to register is **`deploy.yml`**. If publishing is ever refactored into a reusable workflow, keep `deploy.yml` in the trust config (the caller) and grant `id-token: write` to both workflows.

### Version requirements

- **pnpm:** the repo pins `pnpm@10.34.1` (the Lexical-proven known-good 10.x floor). pnpm 10.16+ supports OIDC + provenance, and the 10.x line shells out to `npm publish` so it never hit the pnpm 11.0–11.1.2 OIDC 404 regression. If you move to the 11.x line you must be on **pnpm ≥ 11.1.3**.
- **npm (in the runner):** Node 22.14+/24.x runners bundle npm ≥ 11.5.1, which is what the 10.x publish path needs. No action required in CI.
- **npm (on the maintainer's machine, for setup only):** the setup script requires **npm ≥ 11.10** for `npm trust github`. Run `npm i -g npm@latest` before setup.

### The trusted-publishing maintainer script

`scripts/npm/setup-trusted-publishing.mjs` is a one-time/occasional script a maintainer runs **locally** (with an interactive npm session) to prepare every public package for trusted publishing. It is decoupled from CI — its only job is to make the CI publish succeed. It discovers the same 12 publishable packages CI does (`pnpm-workspace.yaml` globs, minus `private` packages and the `.changeset/config.json` `ignore` list).

There is no package.json script alias for it; run the file directly with Node:

```
node scripts/npm/setup-trusted-publishing.mjs [flags]
```

It has three modes, gated by flags:

| Mode                | Flag            | What it does                                                                                                                                                                                                                                                               |
| ------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Audit** (default) | _(none)_        | For each public package: probe the registry (HEAD), report which already exist and which already have a matching trust config, and print a manual-setup guide. No writes.                                                                                                  |
| **Bootstrap**       | `--bootstrap`   | npm trusted publishing cannot be configured on a name that does not exist (no PyPI-style pending publisher). For each package not yet on npm, publish a deprecated placeholder `0.0.0-bootstrap.0` stub under the `bootstrap` dist-tag (never `latest`) to claim the name. |
| **Setup trust**     | `--setup-trust` | Run `npm trust github <pkg> --file deploy.yml --repo facebook/astryx --allow-publish -y` for each package, skipping ones already correctly configured. `--replace` revokes a conflicting config first.                                                                     |

Other flags: `--dry-run`, `--registry <url>`, `--stub-version <v>`, `--workflow <file>` (default `deploy.yml`; single filename, no commas), `--repo <owner/name>` (default `facebook/astryx`). Because the script is invoked directly via `node`, pass flags straight through (no `--` separator).

**Preflights:** when it will write, it runs `npm whoami` (fails with a `npm login` hint if unauthenticated); for `--setup-trust` it also enforces npm ≥ 11.10 and verifies `npm trust` exists.

**2FA / the "skip for 5 minutes" prompt:** reading and writing trust config requires account-level 2FA. npm only runs its interactive web-auth/OTP flow when **both** stdin and stdout are TTYs, but per-package trust reads must capture stdout (a pipe). So the script does **one** fully-interactive warm-up read first and instructs you to choose **"Skip two-factor authentication for the next 5 minutes"** at that prompt, so all subsequent reads/writes in the run complete within that window without re-prompting.

**Idempotency & conflicts:** already-correctly-configured packages are skipped (no needless OTP). A non-matching existing config is reported as a CONFLICT (npm returns E409 if you POST a second config); re-run with `--replace` to revoke-then-add. E429 rate limits are retried with exponential backoff.

### Typical first-time run

```
npm i -g npm@latest
npm login --registry https://registry.npmjs.org
node scripts/npm/setup-trusted-publishing.mjs                              # audit only
node scripts/npm/setup-trusted-publishing.mjs --bootstrap --setup-trust    # claim names + register trust
```

After the first OIDC publish succeeds, the bootstrap stubs are superseded by the real versions (they remain only under the deprecated `bootstrap` dist-tag).

> Sequencing note: the legacy `NPM_TOKEN` secret stays in place until the pnpm-native OIDC change in `deploy.yml` has merged AND the first OIDC publish has succeeded with provenance. Remove `NPM_TOKEN` only AFTER that first green OIDC publish — never before — otherwise any push to main in the gap runs the still-token-based `pnpm changeset publish` (and the canary `npm publish`) with an empty token and breaks main.
