#!/usr/bin/env node
/**
 * @file LLM-driven correction of type errors in vibe test results
 *
 * Reads build-errors.json (from tsc pass in build-previews.ts), generates
 * correction task files for each file with errors. These tasks are run by
 * Navi sub-agents during the night watch pipeline — NOT as interactive API
 * calls.
 *
 * Flow:
 *   1. Navi sub-agents generate raw .tsx files
 *   2. `build-previews.ts --tsc-only` runs tsc, writes build-errors.json
 *   3. THIS SCRIPT reads errors, generates correction tasks
 *   4. Navi spawns correction sub-agents (same pattern as generation)
 *   5. Corrected files overwrite the originals
 *   6. GHA builds previews from corrected code (no blank pages)
 *
 * Scoring uses build-errors.json from the RAW output (step 2) — corrections
 * don't inflate the Correctness score.
 *
 * Usage:
 *   tsx src/correct-previews.ts --iteration <id>
 *   tsx src/correct-previews.ts --iteration <id> --dry-run
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(VIBE_DIR, '../..');

interface TscError {
  line: number;
  message: string;
  code: string;
}

interface TscResult {
  target: string;
  errors: TscError[];
  errorCount: number;
  buildSuccess: boolean;
}

type BuildErrors = Record<string, TscResult>;

interface CorrectionTask {
  promptId: string;
  target: string;
  sourceFile: string;
  errors: TscError[];
  prompt: string;
}

/**
 * Load component docs for the correction prompt context.
 * Gives the LLM the actual API surface to fix against.
 */
function getComponentDocs(code: string, target: string): string {
  if (target !== 'xds') return '';

  // Extract XDS component names used in the file
  const components = new Set<string>();
  const re = /\bXDS\w+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    components.add(m[0]);
  }

  // Try to get docs via CLI
  const docs: string[] = [];
  for (const comp of components) {
    try {
      const output = execSync(
        `npx xds component ${comp.replace('XDS', '')} --compact 2>/dev/null`,
        {cwd: REPO_ROOT, encoding: 'utf-8', timeout: 5000},
      );
      if (output.trim()) {
        docs.push(`### ${comp}\n${output.trim()}`);
      }
    } catch {
      // Component might not exist — that's part of the error
    }
  }

  return docs.length > 0
    ? `\n## XDS Component API Reference\n\n${docs.join('\n\n')}`
    : '';
}

/**
 * Generate correction task prompt for a file with tsc errors.
 */
function generateCorrectionPrompt(
  promptId: string,
  code: string,
  errors: TscError[],
  target: string,
): string {
  const errorList = errors
    .map(e => `  Line ${e.line}: ${e.code} — ${e.message}`)
    .join('\n');

  const docs = getComponentDocs(code, target);

  return `Fix the TypeScript errors in this ${target.toUpperCase()} component.

## Errors (from tsc --noEmit)

${errorList}

## Source Code

\`\`\`tsx
${code}
\`\`\`
${docs}

## Rules

1. Fix ONLY the type errors listed above. Don't redesign the component.
2. Keep the same visual intent and structure.
3. If a prop name is wrong, use the correct one from the docs.
4. If a prop value is wrong (e.g. "small" → "sm"), use the correct value.
5. If a component doesn't exist, replace with the closest real equivalent.
6. Output ONLY the corrected .tsx file — no explanation, no markdown fences.
`;
}

async function main() {
  const args = process.argv.slice(2);
  const iterIndex = args.indexOf('--iteration');
  if (iterIndex === -1) {
    console.error('Usage: tsx src/correct-previews.ts --iteration <id>');
    process.exit(1);
  }
  const iteration = args[iterIndex + 1];
  const dryRun = args.includes('--dry-run');

  const iterDir = path.join(VIBE_DIR, 'results', iteration);
  const errorsPath = path.join(iterDir, 'build-errors.json');

  if (!fs.existsSync(errorsPath)) {
    console.error(`No build-errors.json found at ${errorsPath}`);
    console.error(
      'Run `build-previews.ts --tsc-only` first to generate tsc results.',
    );
    process.exit(1);
  }

  const buildErrors: BuildErrors = JSON.parse(
    fs.readFileSync(errorsPath, 'utf-8'),
  );

  // Filter to files that have errors
  const needsCorrection = Object.entries(buildErrors).filter(
    ([, result]) => result.errorCount > 0,
  );

  if (needsCorrection.length === 0) {
    console.log('✅ All files pass tsc — no corrections needed.');
    return;
  }

  console.log(`\n🔧 Correction Tasks`);
  console.log(`====================`);
  console.log(
    `${needsCorrection.length}/${Object.keys(buildErrors).length} files need correction\n`,
  );

  const tasksDir = path.join(iterDir, 'correction-tasks');
  fs.mkdirSync(tasksDir, {recursive: true});

  const tasks: CorrectionTask[] = [];

  for (const [promptId, result] of needsCorrection) {
    const sourceFile = path.join(iterDir, 'results', `${promptId}.tsx`);
    if (!fs.existsSync(sourceFile)) {
      console.warn(`  ⚠ Source not found: ${sourceFile}`);
      continue;
    }

    const code = fs.readFileSync(sourceFile, 'utf-8');
    const prompt = generateCorrectionPrompt(
      promptId,
      code,
      result.errors,
      result.target,
    );

    const task: CorrectionTask = {
      promptId,
      target: result.target,
      sourceFile,
      errors: result.errors,
      prompt,
    };
    tasks.push(task);

    // Write task file for sub-agent consumption
    const taskPath = path.join(tasksDir, `${promptId}.json`);
    fs.writeFileSync(taskPath, JSON.stringify(task, null, 2));

    console.log(
      `  📝 ${promptId}: ${result.errorCount} error(s) → ${taskPath}`,
    );
  }

  // Write summary manifest
  const manifestPath = path.join(tasksDir, 'manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        iteration,
        totalFiles: Object.keys(buildErrors).length,
        filesWithErrors: needsCorrection.length,
        totalErrors: needsCorrection.reduce(
          (sum, [, r]) => sum + r.errorCount,
          0,
        ),
        tasks: tasks.map(t => ({
          promptId: t.promptId,
          errorCount: t.errors.length,
        })),
      },
      null,
      2,
    ),
  );

  if (dryRun) {
    console.log(`\n✅ Dry run complete. ${tasks.length} tasks written.`);
    console.log(`   Tasks dir: ${tasksDir}`);
    return;
  }

  // Output sub-agent spawn instructions (for Navi night watch)
  console.log(`\n## Correction Sub-Agent Instructions\n`);
  console.log(
    `Spawn ${tasks.length} correction sub-agents with the following pattern:\n`,
  );

  for (const task of tasks) {
    console.log(`Task: correct-${task.promptId}`);
    console.log(`  Read: ${path.join(tasksDir, `${task.promptId}.json`)}`);
    console.log(`  Write corrected .tsx to: ${task.sourceFile}`);
    console.log(`  Errors: ${task.errors.length}`);
    console.log('');
  }

  console.log(`After all corrections complete, push to data branch and`);
  console.log(`trigger GHA vibe-screenshots workflow.`);
}

main().catch(console.error);
