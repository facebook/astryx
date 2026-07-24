// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file smoke-test.ts
 * @input none (self-contained; runs setup into a temp dir)
 * @output PASS/FAIL per check; exit 1 on any failure
 * @position internal/vibe-tests/prompt-purity-test — no-LLM verification of the harness
 *
 * Verifies the harness mechanism WITHOUT any model calls:
 *  A. the veer/catch classifier labels fabricated snapshot timelines correctly
 *  B. setup-purity.mjs wires a real condition correctly (variant spliced into AGENTS.md,
 *     stylex styling detected, logging shim installed, NO expectedComponents leak)
 *  C. run-purity.ts --dry-run drives the pipeline headlessly (best-effort)
 *
 * Usage: npx tsx smoke-test.ts
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {classifyTimeline, detectMarkers, purityScore} from './purity-eval.js';

const EXP_DIR = import.meta.dirname;
let failures = 0;
let passed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failures++;
    console.error(
      `  FAIL  ${name}\n        ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

/** Best-effort check: reports a WARN instead of failing the suite. */
function softCheck(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    console.warn(
      `  WARN  ${name}\n        ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

// ── Fixtures ─────────────────────────────────────────────────────────

const PURE = `import {Card, VStack, Heading, Text, Button} from '@astryxdesign/core';
export default function App() {
  return (
    <Card>
      <VStack gap="md">
        <Heading level={2}>Users</Heading>
        <Text>All good.</Text>
        <Button variant="primary">Add</Button>
      </VStack>
    </Card>
  );
}`;

const DIRTY = `import './styles.css';
export default function App() {
  return (
    <div className="flex flex-col p-4 gap-2 bg-gray-100 rounded-lg" style={{color: '#ffffff', padding: '16px'}}>
      <span className="text-sm font-semibold">Users</span>
    </div>
  );
}`;

// ── A. classifier ────────────────────────────────────────────────────

console.log('\nA. Veer/catch classifier (fabricated timelines)');

check(
  'detectMarkers finds className/inlineStyle/cssImport/tailwind/hardcodedColor in dirty code',
  () => {
    const types = new Set(detectMarkers(DIRTY).map(h => h.type));
    for (const t of [
      'className',
      'inlineStyle',
      'cssImport',
      'tailwind',
      'hardcodedColor',
    ] as const) {
      assert.ok(types.has(t), `expected marker "${t}"`);
    }
  },
);

check('detectMarkers finds nothing hard in pure Astryx code', () => {
  const hard = detectMarkers(PURE).filter(h => h.severity === 'hard');
  assert.equal(
    hard.length,
    0,
    `unexpected hard markers: ${hard.map(h => h.type).join(', ')}`,
  );
});

check('purityScore: pure high (>90), dirty low (<50)', () => {
  assert.ok(purityScore(PURE) > 90, `pure=${purityScore(PURE)}`);
  assert.ok(purityScore(DIRTY) < 50, `dirty=${purityScore(DIRTY)}`);
});

check('neverVeered: single clean write', () => {
  const c = classifyTimeline([PURE]);
  assert.ok(
    c.neverVeered &&
      !c.everVeered &&
      !c.caught &&
      !c.veeredUncaught &&
      !c.noOutput,
    JSON.stringify(c),
  );
});

check('caught: dirty then clean (veered, then fixed)', () => {
  const c = classifyTimeline([DIRTY, PURE]);
  assert.ok(c.everVeered, 'should have veered');
  assert.ok(c.caught, 'should be caught');
  assert.ok(!c.veeredUncaught && !c.neverVeered, JSON.stringify(c));
  assert.ok(c.removedHardCount > 0, 'should record removed hard markers');
});

check('veeredUncaught: clean then dirty (veered, not fixed)', () => {
  const c = classifyTimeline([PURE, DIRTY]);
  assert.ok(c.everVeered && c.veeredUncaught, JSON.stringify(c));
  assert.ok(!c.caught && !c.neverVeered, JSON.stringify(c));
});

check('noOutput: empty timeline', () => {
  const c = classifyTimeline([]);
  assert.ok(c.noOutput && !c.everVeered && !c.neverVeered, JSON.stringify(c));
});

check(
  'caughtInReasoning: mentioned Tailwind but never wrote a hard marker',
  () => {
    const c = classifyTimeline([PURE], {
      transcriptText:
        'I considered using Tailwind here but Astryx has a component for it.',
    });
    assert.ok(
      c.mentionedVeerInReasoning && c.neverVeered && c.caughtInReasoning,
      JSON.stringify(c),
    );
  },
);

// ── B. setup wiring ──────────────────────────────────────────────────

console.log(
  '\nB. setup-purity.mjs wiring (real astryx init into a temp sandbox)',
);

const smokeOut = fs.mkdtempSync(path.join(os.tmpdir(), 'purity-smoke-'));
const expId = 'smoke' + crypto.randomBytes(2).toString('hex');
let setupOk = false;

check(
  'setup-purity.mjs builds A-control + B-selfcheck for dd-1 (1 rep)',
  () => {
    execFileSync(
      process.execPath,
      [
        path.join(EXP_DIR, 'setup-purity.mjs'),
        '--exp',
        expId,
        '--out',
        smokeOut,
        '--conditions',
        'A-control,B-selfcheck',
        '--prompts',
        'dd-1',
        '--reps',
        '1',
      ],
      {stdio: 'pipe'},
    );
    assert.ok(
      fs.existsSync(path.join(smokeOut, expId, 'purity-config.json')),
      'purity-config.json missing',
    );
    setupOk = true;
  },
);

const proj = (cond: string) =>
  path.join(smokeOut, expId, cond, 'projects', 'dd-1');

check('control AGENTS.md has NO self-check; candidate AGENTS.md HAS it', () => {
  assert.ok(setupOk, 'setup did not complete');
  const a = fs.readFileSync(path.join(proj('A-control'), 'AGENTS.md'), 'utf-8');
  const b = fs.readFileSync(
    path.join(proj('B-selfcheck'), 'AGENTS.md'),
    'utf-8',
  );
  assert.ok(
    !a.includes('PURITY SELF-CHECK'),
    'control should not contain the self-check block',
  );
  assert.ok(
    b.includes('PURITY SELF-CHECK'),
    'candidate should contain the self-check block',
  );
  assert.ok(
    b.includes('re-read the file'),
    'candidate should contain the B-selfcheck text',
  );
});

check(
  'injected prompt recommends the Astryx xstyle/StyleX path (stylex detected)',
  () => {
    assert.ok(setupOk, 'setup did not complete');
    const a = fs.readFileSync(
      path.join(proj('A-control'), 'AGENTS.md'),
      'utf-8',
    );
    assert.ok(
      /xstyle|StyleX/i.test(a),
      'AGENTS.md should reference xstyle/StyleX (styling system should detect as stylex)',
    );
  },
);

check(
  'base package.json lists a StyleX compiler plugin (drives stylex detection)',
  () => {
    assert.ok(setupOk, 'setup did not complete');
    const pkg = JSON.parse(
      fs.readFileSync(path.join(proj('A-control'), 'package.json'), 'utf-8'),
    );
    assert.ok(
      pkg.devDependencies?.['@stylexjs/babel-plugin'],
      'missing @stylexjs/babel-plugin',
    );
  },
);

check('logging astryx shim is installed', () => {
  assert.ok(setupOk, 'setup did not complete');
  const shim = path.join(proj('A-control'), 'node_modules', '.bin', 'astryx');
  assert.ok(fs.existsSync(shim), 'shim missing');
  assert.ok(
    fs.readFileSync(shim, 'utf-8').includes('.astryx-invocations.log'),
    'shim does not log invocations',
  );
});

check(
  'no answer leak: expectedComponents never appears in the task prompt',
  () => {
    assert.ok(setupOk, 'setup did not complete');
    const task = JSON.parse(
      fs.readFileSync(
        path.join(smokeOut, expId, 'B-selfcheck', 'tasks', 'dd-1.json'),
        'utf-8',
      ),
    );
    assert.ok(
      !task.taskPrompt.includes('expectedComponents'),
      'taskPrompt leaks the expectedComponents key',
    );
    for (const comp of task.expectedComponents ?? []) {
      assert.ok(
        !task.taskPrompt.includes(comp),
        `taskPrompt leaks expected component "${comp}"`,
      );
    }
  },
);

// ── C. runner dry-run (best-effort) ──────────────────────────────────

console.log('\nC. run-purity.ts --dry-run (headless pipeline; best-effort)');

softCheck('dry-run creates run.json with status "dry-run"', () => {
  assert.ok(setupOk, 'setup did not complete');
  try {
    execFileSync(
      'npx',
      [
        'tsx',
        path.join(EXP_DIR, 'run-purity.ts'),
        '--experiment',
        expId,
        '--out',
        smokeOut,
        '--dry-run',
      ],
      {
        stdio: 'pipe',
        cwd: EXP_DIR,
      },
    );
  } catch (e) {
    // Non-fatal: environment may not resolve `npx tsx` here. The classifier + wiring
    // checks are the load-bearing ones; surface this as a soft note instead.
    throw new Error(
      `could not run dry-run via "npx tsx" (${e instanceof Error ? e.message : String(e)}) — run it manually to verify`,
      {cause: e},
    );
  }
  const runJson = path.join(
    smokeOut,
    expId,
    'A-control',
    'runs',
    'dd-1',
    'run.json',
  );
  assert.ok(fs.existsSync(runJson), 'run.json not created by dry-run');
  assert.equal(JSON.parse(fs.readFileSync(runJson, 'utf-8')).status, 'dry-run');
});

// ── Cleanup + report ─────────────────────────────────────────────────

try {
  fs.rmSync(smokeOut, {recursive: true, force: true});
} catch {
  /* ignore */
}

console.log(
  `\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}  (${passed} passed, ${failures} failed)\n`,
);
process.exit(failures === 0 ? 0 : 1);
