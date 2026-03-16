#!/usr/bin/env bash
# @file Generate XDS skill doc from CLI for vibe tests
# @position internal/vibe-tests/scripts/generate-skill-doc.sh
#
# Generates a skill doc by combining CLI outputs:
#   - init --features agents framing (AGENTS.md index)
#   - component list --detail brief (component catalog)
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

# No CLI rebuild needed — the CLI uses raw .mjs files and discovers
# components by scanning packages/core/src/ directly via readdirSync.

mkdir -p "$OUT_DIR"

echo "Generating XDS skill doc from CLI..." >&2

cat > "$OUT_FILE" <<'HEADER'
# XDS Design System

React design system for building internal tools. All components use the `XDS` prefix.

> This document is auto-generated from source. Do not edit manually.
> Regenerate with: `yarn generate:skill-doc`

## CLI Reference

Run these commands to get detailed docs on any component:
- `npx xds component <Name>` — full docs (props, usage, examples)
- `npx xds --detail compact component <Name>` — condensed reference
- `npx xds component --list` — all components by category
- `npx xds docs principles` — design rules and anti-patterns
- `npx xds docs tokens` — token reference (spacing, color, radius)
- `npx xds docs theme` — theme system reference

HEADER

# Principles
echo "## Principles" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
node "$CLI" docs principles 2>/dev/null | tail -n +3 >> "$OUT_FILE"
echo "" >> "$OUT_FILE"

# Component catalog
echo "## Component Catalog" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
echo "Brief summaries of all available components. Run \`npx xds component <Name>\` for full docs." >> "$OUT_FILE"
echo "" >> "$OUT_FILE"
node "$CLI" --detail brief component --list 2>/dev/null >> "$OUT_FILE"
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
