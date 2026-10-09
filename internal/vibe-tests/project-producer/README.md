# Delivery-mode project producer

This directory contains the project producer defined by AST-067. It prepares an
isolated consumer project, runs one configured coding agent, and emits one
immutable `VibeArtifactV2` bundle. It does **not** build or serve the authored
result, choose scored files, open a scoring browser, run accessibility checks,
compute metrics, invoke a judge, aggregate cells, or build reports. Those are
shared-evaluator responsibilities in later AST-067 phases.

The existing `/vibe-test` command is unchanged. This producer is additive:

```sh
pnpm -F @astryxdesign/vibe-tests project:produce --sample 3 --dry-run

VIBE_RUNNER_PROFILE=/absolute/path/to/runner-profile.json \
  pnpm -F @astryxdesign/vibe-tests project:produce \
  --configs react-build,react-nobuild \
  --runners runner-a,runner-b \
  --sample 15 \
  --seed 20261003 \
  --concurrency 1
```

Real runs require an uncommitted runner profile shaped like
[`runner-profile.example.json`](runner-profile.example.json). Profiles describe
the isolation launcher, preflight, commands, transcript adapters, usage fields,
and runner identity. Profiles cannot define a judge. Private profile environment
variables are removed from every child process.

## Producer lifecycle

Each matrix cell:

1. creates a mode-`0700` private root;
2. scaffolds a standalone consumer project using public packages or assets;
3. commits the complete scaffold as one private Git baseline;
4. exports that commit's tracked regular files as the portable baseline tree;
5. runs the selected coding agent against the project;
6. copies every portable runner output except `.git`, installed dependencies,
   and the producer-owned `TASK.md`; and
7. writes and validates an immutable artifact bundle before deleting the private
   run root.

Runner failure or timeout is provenance, not a producer-selected score. If a
portable source tree still exists, the producer emits it with `failed` or
`timed_out` execution status so the shared evaluator can apply one failure
policy across delivery modes.

## Bundle shape

```text
bundles/<prompt>-<delivery>-<runner>/
├── artifact.json
├── baseline/                 # exported baseline commit
├── source/                   # runner-authored project
└── provenance/
    └── usage.json            # executor-neutral numeric receipt
```

The artifact stores only prompt identity plus SHA-256, never the full prompt.
Raw transcripts stay inside the private run and are not bundled because they can
repeat prompts or machine-local paths. The usage receipt contains status,
timing, token counts, tool counts, and audit result counts without command output
or local audit labels. Runner profile identity fields are artifact provenance and
must use public-safe harness and model names.

For local `static`, `build`, and `serve` views, `integrity.viewInput` is the
canonical digest of the complete portable `source` tree. Raw runner output is
never replaced: if the runner created a cache or build output, those bytes stay
in the artifact. The shared evaluator later materializes a fresh view without
mutating that source tree.

## Git-tree baseline digest

A `git-tree` baseline is the regular-file snapshot exported from exactly one Git
commit. Its digest is **not** a Git object ID. It uses the same portable
`sha256TreeV2` byte stream as a bundled tree:

1. encode each POSIX-relative path as UTF-8;
2. sort paths by their UTF-8 bytes;
3. append `path + NUL + lowercase SHA-256(file bytes) + LF` for each file; and
4. SHA-256 the concatenated records.

Git object format, executable mode, empty directories, untracked files,
submodules, symlinks, and `.git` metadata do not participate. Symlinks and
submodules are rejected instead of silently changing meaning. Identical tracked
paths and bytes therefore produce the same artifact digest in SHA-1 and SHA-256
repositories.
