#!/usr/bin/env bash
# @file Generate XDS skill doc from CLI for vibe tests
# @position internal/vibe-tests/scripts/generate-skill-doc.sh
#
# Generates a skill doc by combining CLI outputs:
#   - component list (component catalog with brief summaries)
#   - docs principles (design rules)
#   - docs tokens (token reference)
#   - docs theme (theme system)
#
# Output: .generated/xds-skill.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VIBE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$VIBE_DIR/../.." && pwd)"
CLI="$REPO_ROOT/packages/cli/bin/xds.mjs"
OUT_DIR="$VIBE_DIR/.generated"
OUT_FILE="$OUT_DIR/xds-skill.md"

mkdir -p "$OUT_DIR"

echo "Generating XDS skill doc from CLI..." >&2

cat > "$OUT_FILE" <<'HEADER'
# XDS Design System

React design system for building internal tools. All components use the `XDS` prefix.

> This document is auto-generated from source. Do not edit manually.
> Regenerate with: `yarn generate:skill-doc`

## CLI Reference

Run these commands to get detailed docs on any component:
- `npx xds component metadata <Name>` — description, features, notes, a11y
- `npx xds component props <Name>` — props table
- `npx xds component examples <Name>` — list example titles
- `npx xds component example <Name> N` — get example code
- `npx xds component list` — all components by category
- `npx xds component search "<query>"` — find by name or description
- `npx xds docs principles` — design rules and anti-patterns
- `npx xds docs tokens` — token reference (spacing, color, radius)
- `npx xds docs theme` — theme system reference

HEADER

# Principles
echo "## Principles" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
node "$CLI" docs principles 2>/dev/null | tail -n +3 >> "$OUT_FILE"
echo "" >> "$OUT_FILE"

# Component catalog (brief summaries)
echo "## Component Catalog" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
echo "Brief summaries of all available components. Run \`npx xds component metadata <Name>\` for full docs." >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
node "$CLI" component catalog 2>/dev/null >> "$OUT_FILE"
echo "" >> "$OUT_FILE"

# Tokens
echo "## Token Reference" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
node "$CLI" docs tokens 2>/dev/null | tail -n +3 >> "$OUT_FILE"
echo "" >> "$OUT_FILE"

# Theme
echo "## Theme System" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
node "$CLI" docs theme 2>/dev/null | tail -n +3 >> "$OUT_FILE"

SIZE=$(wc -c < "$OUT_FILE")
LINES=$(wc -l < "$OUT_FILE")
echo "Generated $OUT_FILE ($SIZE bytes, $LINES lines)" >&2
