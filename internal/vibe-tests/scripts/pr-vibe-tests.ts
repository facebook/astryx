#!/usr/bin/env node
/**
 * @file PR Vibe Tests - Run vibe tests via multiple LLM CLIs and attach to PR
 *
 * Supports: claude, codex, gemini CLI tools
 *
 * Usage:
 *   npx tsx scripts/pr-vibe-tests.ts [options]
 *
 * Options:
 *   --sample N         Run N tests (stratified sample)
 *   --parallel N       Max parallel tests (default: 5)
 *   --cli <name>       CLI to use: claude, codex, gemini, all (default: claude)
 *   --fuzz <component> Fuzz test a specific component with generated prompts
 *   --fuzz-count N     Number of fuzz prompts to generate (default: 20)
 *   --skip-pr          Skip PR creation/update
 *   --verbose          Show detailed output
 *
 * Examples:
 *   npx tsx scripts/pr-vibe-tests.ts --sample 10
 *   npx tsx scripts/pr-vibe-tests.ts --cli all --sample 5
 *   npx tsx scripts/pr-vibe-tests.ts --fuzz XDSSwitch --fuzz-count 30
 *   npx tsx scripts/pr-vibe-tests.ts --cli codex --fuzz XDSSelector
 *
 * @position internal/vibe-tests/scripts/pr-vibe-tests.ts
 */

import {execSync, spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_TESTS_DIR = path.dirname(__dirname);
const XDS_ROOT = path.dirname(path.dirname(VIBE_TESTS_DIR));

type CliTool = 'claude' | 'codex' | 'gemini';

interface Options {
  sample?: number;
  parallel: number;
  cli: CliTool | 'all';
  fuzz?: string; // Component name to fuzz test
  fuzzCount: number;
  skipPr: boolean;
  verbose: boolean;
}

interface TaskFile {
  promptId: string;
  category: string;
  prompt: string;
  expectedComponents: string[];
  persona: string;
  subagentPrompt: string;
}

interface TestResult {
  promptId: string;
  cli: CliTool;
  success: boolean;
  durationMs: number;
  error?: string;
}

/**
 * CLI tool configurations
 */
const CLI_CONFIGS: Record<CliTool, {cmd: string; args: (prompt: string) => string[]}> = {
  claude: {
    cmd: 'claude',
    args: prompt => ['-p', prompt, '--dangerously-skip-permissions'],
  },
  codex: {
    cmd: 'codex',
    args: prompt => ['--prompt', prompt, '--auto-approve'],
  },
  gemini: {
    cmd: 'gemini',
    args: prompt => ['--prompt', prompt],
  },
};

/**
 * Fuzz prompt templates for component testing
 */
const FUZZ_TEMPLATES = [
  // Basic usage patterns
  'Create a simple {component} that toggles between two states',
  'Make a {component} with a label that says "Enable notifications"',
  'Build a form with a {component} for accepting terms and conditions',
  'Show me a {component} that starts in the disabled state',
  'I need a {component} with custom styling using the XDS theme',

  // Integration patterns
  'Create a settings panel with multiple {component} elements for different preferences',
  'Build a {component} that updates state and shows a toast when changed',
  'Make a {component} that is controlled by parent component state',
  'Create a form with a {component} that validates before submission',
  'Build a {component} inside a card with proper spacing',

  // Edge cases
  'Create a {component} with a very long label that might wrap',
  'Make a {component} that is conditionally rendered based on user role',
  'Build a {component} that has an onChange handler that calls an API',
  'Create a {component} with custom colors using CSS variables',
  'Make a dense list of {component} elements with minimal spacing',

  // Responsive patterns
  'Create a {component} that looks good on mobile and desktop',
  'Build a layout with {component} elements that reflow on small screens',
  'Make a {component} with touch-friendly sizing for mobile',

  // State management
  'Create a {component} with loading state while data saves',
  'Build a {component} that shows error state on validation failure',
  'Make a {component} that syncs with localStorage',
  'Create an optimistic UI with {component} that reverts on error',

  // Composition
  'Build a {component} inside a modal dialog',
  'Create a table row with a {component} in one column',
  'Make a sidebar with {component} elements for feature flags',
  'Build a dropdown menu item that contains a {component}',
  'Create a {component} with an icon next to the label',

  // Advanced patterns
  'Build an accessible {component} with proper ARIA labels',
  'Create a {component} that integrates with react-hook-form',
  'Make a {component} with animation on state change',
  'Build a keyboard-navigable list of {component} elements',
  'Create a {component} with custom focus ring styling',
];

/**
 * Parse command line arguments
 */
function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    parallel: 5,
    cli: 'claude',
    fuzzCount: 20,
    skipPr: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--sample':
        options.sample = parseInt(args[++i]);
        break;
      case '--parallel':
        options.parallel = parseInt(args[++i]);
        break;
      case '--cli':
        options.cli = args[++i] as CliTool | 'all';
        break;
      case '--fuzz':
        options.fuzz = args[++i];
        break;
      case '--fuzz-count':
        options.fuzzCount = parseInt(args[++i]);
        break;
      case '--skip-pr':
        options.skipPr = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }

  return options;
}

/**
 * Generate a unique iteration ID
 */
function generateIterationId(cli: string, fuzz?: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toISOString().slice(11, 19).replace(/:/g, '');
  const suffix = fuzz ? `-fuzz-${fuzz.replace(/^XDS/, '')}` : '';
  return `pr-${cli}-${date}-${time}${suffix}`;
}

/**
 * Generate fuzz test prompts for a component
 */
function generateFuzzPrompts(component: string, count: number): TaskFile[] {
  const prompts: TaskFile[] = [];

  // Shuffle and select templates
  const shuffled = [...FUZZ_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // If we need more than templates available, repeat with variations
  while (selected.length < count) {
    const base = shuffled[selected.length % shuffled.length];
    selected.push(`${base} (variant ${Math.floor(selected.length / shuffled.length) + 1})`);
  }

  for (let i = 0; i < count; i++) {
    const template = selected[i];
    const prompt = template.replace(/\{component\}/g, component);
    const promptId = `fuzz-${component.replace(/^XDS/, '').toLowerCase()}-${String(i + 1).padStart(2, '0')}`;

    const subagentPrompt = `First read AGENTS.md in this directory for component library guidance.

${prompt}

Write the code to: results/\${ITERATION_ID}/results/${promptId}.tsx

After writing the code, create results/\${ITERATION_ID}/results/${promptId}.meta.json listing any doc files you read:
{"docsRead": ["filename1.md", "filename2.md"]}`;

    prompts.push({
      promptId,
      category: 'fuzz-test',
      prompt,
      expectedComponents: [component],
      persona: 'naive',
      subagentPrompt,
    });
  }

  return prompts;
}

/**
 * Run the interactive setup to create task files
 */
function setupIteration(
  iterationId: string,
  sample?: number,
  fuzz?: string,
  fuzzCount?: number,
): {tasksDir: string; resultsDir: string} {
  const resultsDir = path.join(VIBE_TESTS_DIR, 'results', iterationId);
  const tasksDir = path.join(resultsDir, 'tasks');
  const outputDir = path.join(resultsDir, 'results');

  // Create directories
  fs.mkdirSync(tasksDir, {recursive: true});
  fs.mkdirSync(outputDir, {recursive: true});

  // Generate AGENTS.md
  const agentsScript = path.join(
    XDS_ROOT,
    'packages',
    'agent-tools',
    'bin',
    'agents-md.mjs',
  );
  if (fs.existsSync(agentsScript)) {
    try {
      execSync(`node ${agentsScript}`, {
        cwd: VIBE_TESTS_DIR,
        stdio: 'pipe',
      });
      console.log('Generated AGENTS.md');
    } catch {
      console.warn('Warning: Could not generate AGENTS.md');
    }
  }

  if (fuzz) {
    // Generate fuzz test prompts
    const count = fuzzCount ?? 20;
    console.log(`Generating ${count} fuzz prompts for ${fuzz}...`);
    const prompts = generateFuzzPrompts(fuzz, count);

    // Write task files
    for (const task of prompts) {
      // Replace ${ITERATION_ID} placeholder
      task.subagentPrompt = task.subagentPrompt.replace(
        /\$\{ITERATION_ID\}/g,
        iterationId,
      );
      fs.writeFileSync(
        path.join(tasksDir, `${task.promptId}.json`),
        JSON.stringify(task, null, 2),
      );
    }

    // Write manifest
    const manifest = {
      iterationId,
      createdAt: new Date().toISOString(),
      config: {fuzz, fuzzCount: count, persona: 'naive'},
      prompts: prompts.map(p => ({
        id: p.promptId,
        category: p.category,
        prompt: p.prompt,
        expectedComponents: p.expectedComponents,
        status: 'pending',
      })),
      totalPrompts: prompts.length,
      completedPrompts: 0,
    };
    fs.writeFileSync(
      path.join(resultsDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
    );
  } else {
    // Run interactive to create tasks
    const sampleArg = sample ? `--sample ${sample}` : '';
    try {
      execSync(`npx tsx src/interactive.ts ${sampleArg}`, {
        cwd: VIBE_TESTS_DIR,
        stdio: 'pipe',
      });
    } catch (e) {
      // Interactive might exit with warnings, that's OK
    }

    // Find the latest iteration if ours wasn't created
    if (!fs.existsSync(tasksDir) || fs.readdirSync(tasksDir).length === 0) {
      const resultsBaseDir = path.join(VIBE_TESTS_DIR, 'results');
      const dirs = fs
        .readdirSync(resultsBaseDir)
        .filter(d => fs.statSync(path.join(resultsBaseDir, d)).isDirectory())
        .filter(d => d !== iterationId)
        .sort()
        .reverse();

      if (dirs.length > 0) {
        const latestDir = path.join(resultsBaseDir, dirs[0]);
        const latestTasks = path.join(latestDir, 'tasks');
        if (fs.existsSync(latestTasks)) {
          fs.cpSync(latestTasks, tasksDir, {recursive: true});
          console.log(`Using tasks from ${dirs[0]}`);
        }
      }
    }
  }

  return {tasksDir, resultsDir};
}

/**
 * Check if a CLI tool is available
 */
function checkCli(cli: CliTool): boolean {
  try {
    execSync(`which ${CLI_CONFIGS[cli].cmd}`, {stdio: 'pipe'});
    return true;
  } catch {
    return false;
  }
}

/**
 * Run a single test via the specified CLI
 */
async function runTest(
  taskFile: string,
  outputDir: string,
  cli: CliTool,
  verbose: boolean,
): Promise<TestResult> {
  const promptId = path.basename(taskFile, '.json');
  const startTime = Date.now();
  const config = CLI_CONFIGS[cli];

  try {
    const taskContent = fs.readFileSync(taskFile, 'utf-8');
    const task: TaskFile = JSON.parse(taskContent);

    if (!task.subagentPrompt) {
      return {
        promptId,
        cli,
        success: false,
        durationMs: Date.now() - startTime,
        error: 'No subagentPrompt in task file',
      };
    }

    return new Promise(resolve => {
      const proc = spawn(config.cmd, config.args(task.subagentPrompt), {
        cwd: VIBE_TESTS_DIR,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {...process.env, FORCE_COLOR: '0'},
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', data => {
        stdout += data.toString();
      });

      proc.stderr.on('data', data => {
        stderr += data.toString();
      });

      proc.on('close', code => {
        const durationMs = Date.now() - startTime;

        if (verbose) {
          console.log(`[${cli}:${promptId}] Exit code: ${code}`);
          if (stderr)
            console.log(`[${cli}:${promptId}] Stderr: ${stderr.slice(0, 200)}`);
        }

        // Create cli-specific output directory
        const cliOutputDir = path.join(outputDir, cli);
        fs.mkdirSync(cliOutputDir, {recursive: true});

        // Save raw output
        fs.writeFileSync(path.join(cliOutputDir, `${promptId}.raw.txt`), stdout);

        // Extract code from output
        let code_content = stdout;
        const tsxMatch = stdout.match(/```tsx\n([\s\S]*?)```/);
        const codeMatch = stdout.match(/```\n([\s\S]*?)```/);

        if (tsxMatch) {
          code_content = tsxMatch[1];
        } else if (codeMatch) {
          code_content = codeMatch[1];
        }

        // Write result files
        fs.writeFileSync(path.join(cliOutputDir, `${promptId}.tsx`), code_content);
        fs.writeFileSync(
          path.join(cliOutputDir, `${promptId}.meta.json`),
          JSON.stringify({docsRead: ['AGENTS.md'], cli}, null, 2),
        );

        // Also write to main results dir for aggregation
        fs.writeFileSync(path.join(outputDir, `${promptId}-${cli}.tsx`), code_content);
        fs.writeFileSync(
          path.join(outputDir, `${promptId}-${cli}.meta.json`),
          JSON.stringify({docsRead: ['AGENTS.md'], cli}, null, 2),
        );

        resolve({
          promptId,
          cli,
          success: true,
          durationMs,
        });
      });

      proc.on('error', err => {
        resolve({
          promptId,
          cli,
          success: false,
          durationMs: Date.now() - startTime,
          error: err.message,
        });
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        proc.kill();
        resolve({
          promptId,
          cli,
          success: false,
          durationMs: Date.now() - startTime,
          error: 'Timeout (5 minutes)',
        });
      }, 5 * 60 * 1000);
    });
  } catch (err) {
    return {
      promptId,
      cli,
      success: false,
      durationMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Run tests with controlled parallelism
 */
async function runTests(
  taskFiles: string[],
  outputDir: string,
  clis: CliTool[],
  parallel: number,
  verbose: boolean,
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Create work items: each task × each CLI
  const workItems: {taskFile: string; cli: CliTool}[] = [];
  for (const taskFile of taskFiles) {
    for (const cli of clis) {
      workItems.push({taskFile, cli});
    }
  }

  const queue = [...workItems];
  const inProgress = new Set<Promise<void>>();

  while (queue.length > 0 || inProgress.size > 0) {
    while (queue.length > 0 && inProgress.size < parallel) {
      const {taskFile, cli} = queue.shift()!;
      const promptId = path.basename(taskFile, '.json');
      console.log(`[${cli}:${promptId}] Starting...`);

      const promise = runTest(taskFile, outputDir, cli, verbose).then(result => {
        results.push(result);
        inProgress.delete(promise);

        if (result.success) {
          console.log(
            `[${result.cli}:${result.promptId}] Done (${(result.durationMs / 1000).toFixed(1)}s)`,
          );
        } else {
          console.log(`[${result.cli}:${result.promptId}] Failed: ${result.error}`);
        }
      });

      inProgress.add(promise);
    }

    if (inProgress.size > 0) {
      await Promise.race(inProgress);
    }
  }

  return results;
}

/**
 * Run aggregation and generate report
 */
function runAggregation(iterationId: string): boolean {
  try {
    execSync(`npx tsx src/aggregate.ts --iteration ${iterationId}`, {
      cwd: VIBE_TESTS_DIR,
      stdio: 'inherit',
    });
    return true;
  } catch {
    console.error('Aggregation failed');
    return false;
  }
}

/**
 * Upload report to GitHub Gist
 */
function uploadToGist(reportPath: string, iterationId: string): string | null {
  try {
    const output = execSync(
      `gh gist create "${reportPath}" --public -d "XDS Vibe Test Results - ${iterationId}"`,
      {encoding: 'utf-8'},
    );

    const match = output.match(/https:\/\/gist\.github\.com\/\S+/);
    return match ? match[0] : null;
  } catch {
    console.warn('Warning: Could not upload to gist');
    return null;
  }
}

/**
 * Create or update PR with results
 */
function updatePr(
  iterationId: string,
  resultsDir: string,
  gistUrl: string | null,
  clis: CliTool[],
  testResults: TestResult[],
): string | null {
  const aggregatePath = path.join(resultsDir, 'aggregate.json');

  let stats = {
    successRate: 'N/A',
    totalTests: 'N/A',
    gold: 0,
    green: 0,
    yellow: 0,
    red: 0,
  };

  if (fs.existsSync(aggregatePath)) {
    const aggregate = JSON.parse(fs.readFileSync(aggregatePath, 'utf-8'));
    stats = {
      successRate: `${aggregate.successRate}`,
      totalTests: `${aggregate.totalTests}`,
      gold: aggregate.tiers?.gold ?? 0,
      green: aggregate.tiers?.green ?? 0,
      yellow: aggregate.tiers?.yellow ?? 0,
      red: aggregate.tiers?.red ?? 0,
    };
  }

  // CLI breakdown
  const cliBreakdown = clis
    .map(cli => {
      const cliResults = testResults.filter(r => r.cli === cli);
      const success = cliResults.filter(r => r.success).length;
      return `| ${cli} | ${success}/${cliResults.length} | ${((success / cliResults.length) * 100).toFixed(0)}% |`;
    })
    .join('\n');

  const reportLink = gistUrl
    ? `[View HTML Report](${gistUrl})`
    : `Report saved locally in results/${iterationId}/report.html`;

  const prBody = `## Vibe Test Results

**Iteration:** \`${iterationId}\`
**Success Rate:** ${stats.successRate}%
**Total Tests:** ${stats.totalTests}
**CLIs Tested:** ${clis.join(', ')}

### Quality Tiers

| Tier | Count | Description |
|------|-------|-------------|
| Gold | ${stats.gold} | Pure XDS, no escape hatches |
| Green | ${stats.green} | Acceptable escape hatches |
| Yellow | ${stats.yellow} | Anti-patterns (break theming) |
| Red | ${stats.red} | Critical failures |

### CLI Comparison

| CLI | Success | Rate |
|-----|---------|------|
${cliBreakdown}

### Full Report

${reportLink}

---
*Generated by \`pr-vibe-tests.ts\`*`;

  try {
    const prJson = execSync('gh pr view --json number,url 2>/dev/null || true', {
      encoding: 'utf-8',
    });

    if (prJson.trim()) {
      const pr = JSON.parse(prJson);
      execSync(`gh pr comment ${pr.number} --body "${prBody.replace(/"/g, '\\"')}"`, {
        stdio: 'pipe',
      });
      console.log(`Updated PR #${pr.number}: ${pr.url}`);
      return pr.url;
    } else {
      const output = execSync(
        `gh pr create --title "Vibe Tests: ${iterationId}" --body "${prBody.replace(/"/g, '\\"')}"`,
        {encoding: 'utf-8'},
      );

      const match = output.match(/https:\/\/github\.com\/\S+/);
      const prUrl = match ? match[0] : null;
      if (prUrl) {
        console.log(`Created PR: ${prUrl}`);
      }
      return prUrl;
    }
  } catch (err) {
    console.warn('Could not create/update PR:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  // Determine which CLIs to use
  let clis: CliTool[];
  if (options.cli === 'all') {
    clis = (['claude', 'codex', 'gemini'] as CliTool[]).filter(checkCli);
    if (clis.length === 0) {
      console.error('No CLI tools found. Install claude, codex, or gemini.');
      process.exit(1);
    }
    console.log(`Found CLIs: ${clis.join(', ')}`);
  } else {
    if (!checkCli(options.cli)) {
      console.error(`CLI not found: ${options.cli}`);
      process.exit(1);
    }
    clis = [options.cli];
  }

  const cliLabel = clis.length > 1 ? 'multi' : clis[0];
  const iterationId = generateIterationId(cliLabel, options.fuzz);

  console.log('=== XDS Vibe Tests for PR ===');
  console.log(`Iteration: ${iterationId}`);
  console.log(`CLIs: ${clis.join(', ')}`);
  console.log(`Parallel: ${options.parallel}`);
  if (options.sample) console.log(`Sample: ${options.sample}`);
  if (options.fuzz) console.log(`Fuzz: ${options.fuzz} (${options.fuzzCount} prompts)`);
  console.log('');

  // Setup iteration
  console.log('Setting up iteration...');
  const {tasksDir, resultsDir} = setupIteration(
    iterationId,
    options.sample,
    options.fuzz,
    options.fuzzCount,
  );
  const outputDir = path.join(resultsDir, 'results');

  // Get task files
  const taskFiles = fs
    .readdirSync(tasksDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(tasksDir, f));

  if (taskFiles.length === 0) {
    console.error('No task files found');
    process.exit(1);
  }

  const totalTests = taskFiles.length * clis.length;
  console.log(`Running ${totalTests} tests (${taskFiles.length} prompts × ${clis.length} CLIs)...`);
  console.log('');

  // Run tests
  const results = await runTests(
    taskFiles,
    outputDir,
    clis,
    options.parallel,
    options.verbose,
  );

  const successCount = results.filter(r => r.success).length;
  console.log('');
  console.log(`Completed: ${successCount}/${results.length} tests succeeded`);

  // Show CLI breakdown
  for (const cli of clis) {
    const cliResults = results.filter(r => r.cli === cli);
    const cliSuccess = cliResults.filter(r => r.success).length;
    console.log(`  ${cli}: ${cliSuccess}/${cliResults.length}`);
  }
  console.log('');

  // Aggregate results
  console.log('Aggregating results...');
  const aggregated = runAggregation(iterationId);

  if (!aggregated) {
    console.error('Failed to aggregate results');
    process.exit(1);
  }

  // Upload report
  const reportPath = path.join(resultsDir, 'report.html');
  let gistUrl: string | null = null;

  if (fs.existsSync(reportPath)) {
    console.log('');
    console.log('Uploading report to GitHub Gist...');
    gistUrl = uploadToGist(reportPath, iterationId);
    if (gistUrl) {
      console.log(`Report: ${gistUrl}`);
    }
  }

  // Update PR
  if (!options.skipPr) {
    console.log('');
    console.log('Updating PR...');
    updatePr(iterationId, resultsDir, gistUrl, clis, results);
  }

  console.log('');
  console.log('=== Done ===');
  console.log(`Results: ${resultsDir}`);
  if (gistUrl) console.log(`Report: ${gistUrl}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
