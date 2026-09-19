#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.

set -euo pipefail

# Publish a vibe test report to GitHub Pages.
#
# Usage:
#   ./scripts/publish-report.sh <astryx-iteration> [baseline-iteration]
#
# The report is always published under reports/<astryx-iteration>/ on gh-pages.
# No --slug, no --name, no override — just the hash.
#
# Examples:
#   ./scripts/publish-report.sh a87fa578
#   ./scripts/publish-report.sh a87fa578 446469c7

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VIBE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <astryx-iteration> [baseline-iteration]"
  echo ""
  echo "Builds and deploys a vibe test report to GitHub Pages."
  echo "Report URL: https://facebook.github.io/astryx/reports/<astryx-iteration>/"
  exit 1
fi

ASTRYX_ITER="$1"
BASELINE_ITER="${2:-}"

ARGS="--iteration $ASTRYX_ITER"
if [ -n "$BASELINE_ITER" ]; then
  ARGS="$ARGS --baseline $BASELINE_ITER"
fi

echo ""
echo "📊 Publishing vibe test report"
echo "   Astryx iteration:      $ASTRYX_ITER"
if [ -n "$BASELINE_ITER" ]; then
  echo "   Baseline iteration: $BASELINE_ITER"
fi
echo "   Deploy to:          reports/$ASTRYX_ITER/"
echo ""

cd "$VIBE_DIR"
exec npx tsx src/deploy-report.ts $ARGS
