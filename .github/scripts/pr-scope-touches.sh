#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# Does this pull request change a path matching PATTERN?
#
#   pr-scope-touches.sh BASE_SHA PATTERN
#
# Exit 0: the PR changes a matching path. Exit 1: it does not. Exit 2: the
# merge base could not be found, so the caller cannot tell and should run its
# evidence, as it did before.
#
# The PR's changes are the diff from its merge base with BASE_SHA to HEAD,
# not from BASE_SHA itself. A branch cut before the base moved would otherwise
# report every file the base added since as a file the PR deleted, and a step
# would run evidence for specs that do not exist at the PR head.
set -uo pipefail

base="${1:?usage: pr-scope-touches.sh BASE_SHA PATTERN}"
pattern="${2:?usage: pr-scope-touches.sh BASE_SHA PATTERN}"
depth="${PR_SCOPE_FETCH_DEPTH:-200}"
head="$(git rev-parse HEAD)" || exit 2

git fetch --quiet --no-tags --depth="$depth" origin "$base" "$head" 2>/dev/null || exit 2
merge_base="$(git merge-base "$base" "$head" 2>/dev/null)" || exit 2

changed="$(git diff --name-only "$merge_base" "$head")" || exit 2
# Not piped into `grep -q`: under pipefail its early exit can fail the pipe.
if grep -qE "$pattern" <<<"$changed"; then
  exit 0
fi
exit 1
