#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.

set -euo pipefail

PAGES_BRANCH="${PAGES_BRANCH:-gh-pages}"
REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
REMOTE_URL="https://x-access-token:${TOKEN}@github.com/${REPO}.git"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${WORK_DIR}"
}
trap cleanup EXIT

CURRENT_DIR="${WORK_DIR}/current"
COMPACT_DIR="${WORK_DIR}/compact"

git clone --depth=1 --single-branch --branch "${PAGES_BRANCH}" "${REMOTE_URL}" "${CURRENT_DIR}"
OLD_HEAD="$(git -C "${CURRENT_DIR}" rev-parse HEAD)"

mkdir -p "${COMPACT_DIR}"
rsync -a --delete --exclude='.git' "${CURRENT_DIR}/" "${COMPACT_DIR}/"

cd "${COMPACT_DIR}"
git init -b "${PAGES_BRANCH}"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add -A
git commit --allow-empty -m "chore: compact ${PAGES_BRANCH} history"
git remote add origin "${REMOTE_URL}"
git push origin "HEAD:refs/heads/${PAGES_BRANCH}" "--force-with-lease=refs/heads/${PAGES_BRANCH}:${OLD_HEAD}"
