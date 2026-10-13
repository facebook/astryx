#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# Does this pull request change a path matching PATTERN?
#
#   pr-scope-touches.sh BASE_SHA PATTERN
#
# Exit 0: the PR changes a matching path. Exit 1: it does not. Exit 2: the
# merge base could not be found (or the arguments are unusable), so the caller
# cannot tell and should run its evidence, as it did before.
#
# Callers load this script from BASE_SHA, not from the PR head: a PR step's
# body comes from the merge commit, but pr-a11y checks out the PR head, which
# on an older branch does not have this file.
#
# The PR's changes are the diff from its merge base with BASE_SHA to HEAD,
# not from BASE_SHA itself. A branch cut before the base moved would otherwise
# report every file the base added since as a file the PR deleted, and a step
# would run evidence for specs that do not exist at the PR head.
set -uo pipefail

if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
  echo 'usage: pr-scope-touches.sh BASE_SHA PATTERN' >&2
  exit 2
fi
base="$1"
pattern="$2"
depth="${PR_SCOPE_FETCH_DEPTH:-200}" # first fetch, then each deepening step
head="$(git rev-parse HEAD)" || exit 2

git fetch --quiet --no-tags --depth="$depth" origin "$base" "$head" 2>/dev/null || exit 2
# Deepen until the merge base is reachable, however far the branch is behind.
until merge_base="$(git merge-base "$base" "$head" 2>/dev/null)"; do
  # Complete history and still no merge base: genuinely unknown.
  [ "$(git rev-parse --is-shallow-repository)" = true ] || exit 2
  git fetch --quiet --no-tags --deepen="$depth" origin "$base" "$head" 2>/dev/null || exit 2
done

# --no-renames lists both sides of a move, so moving a file out of a pattern
# still counts as touching it.
changed="$(git diff --no-renames --name-only "$merge_base" "$head")" || exit 2
# Not piped into `grep -q`: under pipefail its early exit can fail the pipe.
grep -qE "$pattern" <<<"$changed"
case $? in
  0) exit 0 ;;
  1) exit 1 ;;
  *) exit 2 ;; # an invalid pattern must not read as out of scope
esac
