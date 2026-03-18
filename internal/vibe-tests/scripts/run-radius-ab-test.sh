#!/usr/bin/env bash
# @file Run radius token naming A/B vibe test
# @position internal/vibe-tests/scripts/run-radius-ab-test.sh
#
# Runs two iterations of the radius-tokens test set:
#   1. "semantic" — current naming (--radius-container, --radius-element, etc.)
#   2. "numeric"  — proposed naming (--radius-1, --radius-2, --radius-3, etc.)
#
# After both complete, compare results with:
#   yarn workspace @xds/vibe-tests compare --iterations <id-A>,<id-B>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VIBE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Radius Token Naming A/B Test ==="
echo ""
echo "This sets up two iterations for comparison:"
echo "  A) Semantic names (--radius-container, --radius-element, etc.)"
echo "  B) Numeric scale  (--radius-1, --radius-2, --radius-3, etc.)"
echo ""

# Generate fresh skill doc from current source
echo "Step 1: Generating skill docs..."
bash "$SCRIPT_DIR/generate-skill-doc.sh"

echo ""
echo "Step 2: Setting up iteration A (semantic radius tokens)..."
cd "$VIBE_DIR"
npx tsx src/interactive.ts \
  --test-set radius-tokens \
  --label "radius-semantic" \
  --skill-doc .generated/xds-skill-radius-semantic.md

echo ""
echo "Step 3: Setting up iteration B (numeric radius tokens)..."
npx tsx src/interactive.ts \
  --test-set radius-tokens \
  --label "radius-numeric" \
  --skill-doc .generated/xds-skill-radius-numeric.md

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Run each iteration's tests with subagents (see task manifests above)"
echo "  2. After both complete, aggregate and compare results"
