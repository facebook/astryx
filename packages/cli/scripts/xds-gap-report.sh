#!/bin/sh
# xds-gap-report.sh — Bridge from XDS CLI gap-report to GSD tasks
# Reads JSON from stdin, creates a GSD task via the Meta CLI.
#
# Installed by `xds init` or `xds gap-report setup` when targeting
# internal task management instead of GitHub Issues.
#
# Expected JSON on stdin:
#   { component, category, categoryLabel, intention, detail, source, timestamp }

set -u

PROJECT_ID="${XDS_GAP_PROJECT_ID:-911001608406378}"

section_for_category() {
  case "$1" in
    missing_component) echo "Missing Component" ;;
    missing_variant)   echo "Missing Variant or Prop" ;;
    layout_gap)        echo "Layout Gap" ;;
    styling_gap)       echo "Styling Gap" ;;
    a11y_gap)          echo "Accessibility Gap" ;;
    api_friction)      echo "API Friction" ;;
    docs_gap)          echo "Documentation Gap" ;;
    *)                 echo "Other" ;;
  esac
}

if ! command -v meta >/dev/null 2>&1; then
  echo "Error: meta CLI not found. Install it or run 'npx xds gap-report setup' to reconfigure." >&2
  exit 1
fi

json=$(cat)

component=$(echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin)['component'])")
category=$(echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin)['category'])")
category_label=$(echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin)['categoryLabel'])")
intention=$(echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin)['intention'])")
detail=$(echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('detail') or '')")
source=$(echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin)['source'])")

section=$(section_for_category "$category")
title="[gap] ${component}: $(echo "$intention" | cut -c1-180)"

description="**Component:** ${component}
**Category:** ${category_label}
**Source:** ${source}

## What was needed
${intention}"

if [ -n "$detail" ]; then
  description="${description}

## Additional context
${detail}"
fi

description="${description}

---
*Filed via xds gap-report CLI*"

result=$(meta tasks.gsd.task create \
  --title="$title" \
  --project-id="$PROJECT_ID" \
  --section="$section" \
  --priority=MID \
  --description="$description" \
  -o json 2>&1)

if [ $? -eq 0 ]; then
  task_num=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)['number'])" 2>/dev/null)
  echo "https://www.internalfb.com/tasks/${task_num}"
else
  echo "Error creating GSD task: $result" >&2
  exit 1
fi
