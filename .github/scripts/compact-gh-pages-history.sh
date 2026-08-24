#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.

set -euo pipefail

PAGES_BRANCH="${PAGES_BRANCH:-gh-pages}"
REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
REMOTE_URL="https://x-access-token:${TOKEN}@github.com/${REPO}.git"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-5}"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${WORK_DIR}"
}
trap cleanup EXIT

CURRENT_DIR="${WORK_DIR}/current"
COMPACT_DIR="${WORK_DIR}/compact"

# gh-pages has concurrent writers this workflow is not serialized against —
# preview deploys and cleanup runs sit in their own concurrency groups — and
# compaction takes ~10 minutes, so the lease taken at clone time regularly goes
# stale before the push ("[rejected] (stale info)"). The snapshot is of the tip
# it cloned, so a retry has to re-clone: pushing the old snapshot would silently
# revert whatever landed meanwhile. Same shape as the retry in
# cleanup-previews.yml.
for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  if [ "${attempt}" -gt 1 ]; then
    echo "Retrying compaction in $((attempt * 2))s (attempt ${attempt}/${MAX_ATTEMPTS})"
    sleep $((attempt * 2))
  fi

  rm -rf "${CURRENT_DIR}" "${COMPACT_DIR}"

  git clone --depth=1 --single-branch --branch "${PAGES_BRANCH}" "${REMOTE_URL}" "${CURRENT_DIR}"
  OLD_HEAD="$(git -C "${CURRENT_DIR}" rev-parse HEAD)"

  mkdir -p "${COMPACT_DIR}"
  rsync -a --delete --exclude='.git' "${CURRENT_DIR}/" "${COMPACT_DIR}/"

  (
    cd "${COMPACT_DIR}"
    git init -b "${PAGES_BRANCH}"
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add -A
    git commit --allow-empty -m "chore: compact ${PAGES_BRANCH} history"
    git remote add origin "${REMOTE_URL}"
  )

  if PUSH_OUT=$(git -C "${COMPACT_DIR}" push origin \
    "HEAD:refs/heads/${PAGES_BRANCH}" \
    "--force-with-lease=refs/heads/${PAGES_BRANCH}:${OLD_HEAD}" 2>&1); then
    echo "Compacted ${PAGES_BRANCH} to a single commit (previous tip ${OLD_HEAD})"
    exit 0
  fi
  echo "${PUSH_OUT}"

  # A permission denial is not a race; retrying can never clear it.
  if echo "${PUSH_OUT}" | grep -qiE 'denied|403|permission|not authorized'; then
    echo "::error::Push to ${PAGES_BRANCH} denied (403/permissions) — not a race, aborting."
    exit 1
  fi
done

echo "::error::Failed to compact ${PAGES_BRANCH} after ${MAX_ATTEMPTS} attempts"
exit 1
