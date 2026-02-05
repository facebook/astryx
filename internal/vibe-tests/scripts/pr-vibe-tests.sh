#!/bin/bash
# PR Vibe Tests Script
#
# Runs vibe tests using `claude -p` and attaches results to a PR.
# Results are uploaded as a GitHub Gist and linked in the PR body.
#
# Usage:
#   ./scripts/pr-vibe-tests.sh [--sample N] [--branch NAME] [--base BRANCH]
#
# Examples:
#   ./scripts/pr-vibe-tests.sh --sample 5             # Run 5 tests, create PR
#   ./scripts/pr-vibe-tests.sh --sample 10 --base develop  # PR against develop

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VIBE_TESTS_DIR="$(dirname "$SCRIPT_DIR")"
XDS_ROOT="$(dirname "$(dirname "$VIBE_TESTS_DIR")")"
MAX_PARALLEL=5
SAMPLE_SIZE=""
BASE_BRANCH="main"
BRANCH_NAME=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --sample)
      SAMPLE_SIZE="$2"
      shift 2
      ;;
    --branch)
      BRANCH_NAME="$2"
      shift 2
      ;;
    --base)
      BASE_BRANCH="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Generate iteration ID
ITERATION_ID="pr-$(date +%Y%m%d-%H%M%S)"
RESULTS_DIR="$VIBE_TESTS_DIR/results/$ITERATION_ID"

echo "=== XDS Vibe Tests for PR ==="
echo "Iteration: $ITERATION_ID"
echo "Results: $RESULTS_DIR"

# Ensure results directories exist
mkdir -p "$RESULTS_DIR/tasks"
mkdir -p "$RESULTS_DIR/results"

# Change to vibe-tests directory for AGENTS.md
cd "$VIBE_TESTS_DIR"

# Generate AGENTS.md if needed
echo "Generating AGENTS.md..."
if [[ -f "$XDS_ROOT/packages/agent-tools/bin/agents-md.mjs" ]]; then
  node "$XDS_ROOT/packages/agent-tools/bin/agents-md.mjs" 2>/dev/null || true
fi

# Set up the iteration using interactive mode
echo "Setting up test iteration..."
SAMPLE_ARG=""
if [[ -n "$SAMPLE_SIZE" ]]; then
  SAMPLE_ARG="--sample $SAMPLE_SIZE"
fi

# Run interactive to create task files
yarn tsx src/interactive.ts $SAMPLE_ARG 2>&1 | head -50

# Get list of task files
TASK_FILES=("$RESULTS_DIR/tasks"/*.json)
TOTAL_TASKS=${#TASK_FILES[@]}

echo ""
echo "Running $TOTAL_TASKS tests via claude -p..."
echo ""

# Function to run a single test
run_test() {
  local task_file="$1"
  local prompt_id=$(basename "$task_file" .json)
  local result_file="$RESULTS_DIR/results/${prompt_id}.tsx"
  local meta_file="$RESULTS_DIR/results/${prompt_id}.meta.json"

  # Extract the subagent prompt from the task file
  local prompt=$(jq -r '.subagentPrompt' "$task_file")

  if [[ -z "$prompt" || "$prompt" == "null" ]]; then
    echo "[$prompt_id] No subagentPrompt found, skipping"
    return 1
  fi

  echo "[$prompt_id] Starting..."

  # Run claude -p with the prompt
  # Use --dangerously-skip-permissions to avoid interactive prompts
  local output
  if output=$(claude -p "$prompt" --dangerously-skip-permissions 2>&1); then
    # Extract code from the response (look for TSX code blocks or file content)
    # The response should contain the generated code
    echo "$output" > "$RESULTS_DIR/results/${prompt_id}.raw.txt"

    # Try to extract just the TSX code
    # Look for code between ```tsx and ``` or the whole output if no code blocks
    local code
    if echo "$output" | grep -q '```tsx'; then
      code=$(echo "$output" | sed -n '/```tsx/,/```/p' | sed '1d;$d')
    elif echo "$output" | grep -q '```'; then
      code=$(echo "$output" | sed -n '/```/,/```/p' | sed '1d;$d')
    else
      # Just use the output as-is, it might be raw code
      code="$output"
    fi

    echo "$code" > "$result_file"

    # Create a minimal meta file (docs read can't be tracked via CLI)
    echo '{"docsRead": ["AGENTS.md"]}' > "$meta_file"

    echo "[$prompt_id] Done"
    return 0
  else
    echo "[$prompt_id] Failed: $output"
    return 1
  fi
}

export -f run_test
export RESULTS_DIR

# Run tests in parallel with limited concurrency
# Using xargs for portable parallel execution
printf '%s\n' "${TASK_FILES[@]}" | xargs -P "$MAX_PARALLEL" -I {} bash -c 'run_test "$@"' _ {}

echo ""
echo "Tests complete. Aggregating results..."

# Run aggregation
AGGREGATE_OUTPUT=$(yarn tsx src/aggregate.ts --iteration "$ITERATION_ID" 2>&1) || true
echo "$AGGREGATE_OUTPUT"

# Check if report was generated
REPORT_FILE="$RESULTS_DIR/report.html"
if [[ ! -f "$REPORT_FILE" ]]; then
  echo "Error: Report not generated at $REPORT_FILE"
  exit 1
fi

echo ""
echo "Uploading report to GitHub Gist..."

# Create a gist with the HTML report
GIST_RESPONSE=$(gh gist create "$REPORT_FILE" --public -d "XDS Vibe Test Results - $ITERATION_ID" 2>&1)
GIST_URL=$(echo "$GIST_RESPONSE" | grep -o 'https://gist.github.com/[^ ]*' | head -1)

if [[ -z "$GIST_URL" ]]; then
  echo "Warning: Could not create gist. Report saved locally at: $REPORT_FILE"
  GIST_URL="file://$REPORT_FILE"
fi

# Get raw gist URL for embedding
GIST_ID=$(basename "$GIST_URL")
RAW_GIST_URL="https://gist.githubusercontent.com/$(gh api user -q .login)/$GIST_ID/raw/report.html"

echo "Report URL: $GIST_URL"
echo "Raw URL: $RAW_GIST_URL"

# Extract aggregate stats for PR body
AGGREGATE_FILE="$RESULTS_DIR/aggregate.json"
if [[ -f "$AGGREGATE_FILE" ]]; then
  SUCCESS_RATE=$(jq -r '.successRate' "$AGGREGATE_FILE")
  TOTAL_TESTS=$(jq -r '.totalTests' "$AGGREGATE_FILE")
  GOLD=$(jq -r '.tiers.gold' "$AGGREGATE_FILE")
  GREEN=$(jq -r '.tiers.green' "$AGGREGATE_FILE")
  YELLOW=$(jq -r '.tiers.yellow' "$AGGREGATE_FILE")
  RED=$(jq -r '.tiers.red' "$AGGREGATE_FILE")
else
  SUCCESS_RATE="N/A"
  TOTAL_TESTS="N/A"
  GOLD="0"
  GREEN="0"
  YELLOW="0"
  RED="0"
fi

# Generate PR body
PR_BODY=$(cat <<EOF
## Vibe Test Results

**Iteration:** \`$ITERATION_ID\`
**Success Rate:** ${SUCCESS_RATE}%
**Total Tests:** $TOTAL_TESTS

### Quality Tiers

| Tier | Count | Description |
|------|-------|-------------|
| Gold | $GOLD | Pure XDS, no escape hatches |
| Green | $GREEN | Acceptable escape hatches |
| Yellow | $YELLOW | Anti-patterns (break theming) |
| Red | $RED | Critical failures |

### Full Report

[View HTML Report]($GIST_URL)

---
*Generated by \`pr-vibe-tests.sh\`*
EOF
)

# Check if we should create a PR
if [[ -n "$BRANCH_NAME" ]] || git rev-parse --abbrev-ref HEAD | grep -qv "^main$\|^master$"; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

  # Check if branch has unpushed commits
  if git log origin/$CURRENT_BRANCH..$CURRENT_BRANCH --oneline 2>/dev/null | grep -q .; then
    echo ""
    echo "Pushing branch to remote..."
    git push -u origin "$CURRENT_BRANCH"
  fi

  # Check if PR already exists
  EXISTING_PR=$(gh pr view --json number -q .number 2>/dev/null || echo "")

  if [[ -n "$EXISTING_PR" ]]; then
    echo ""
    echo "Updating existing PR #$EXISTING_PR with vibe test results..."

    # Add comment to existing PR
    gh pr comment "$EXISTING_PR" --body "$PR_BODY"

    PR_URL=$(gh pr view --json url -q .url)
    echo "PR updated: $PR_URL"
  else
    echo ""
    echo "Creating new PR with vibe test results..."

    # Create new PR
    PR_URL=$(gh pr create \
      --base "$BASE_BRANCH" \
      --title "Vibe Tests: $ITERATION_ID" \
      --body "$PR_BODY" \
      2>&1 | grep -o 'https://github.com/[^ ]*' | head -1)

    echo "PR created: $PR_URL"
  fi
else
  echo ""
  echo "Not on a feature branch. Skipping PR creation."
  echo "Switch to a feature branch and run again to create a PR."
fi

echo ""
echo "=== Done ==="
echo "Report: $GIST_URL"
echo "Local: $REPORT_FILE"
