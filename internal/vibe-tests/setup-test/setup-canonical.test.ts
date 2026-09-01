// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
// The fixture suite is a runtime JavaScript module covered by its own tests.
// @ts-expect-error -- fixture-suite.mjs intentionally has no declaration output.
import {copyFixture} from '../src/fixture-suite.mjs';
// @ts-expect-error -- public-artifact.mjs intentionally has no declaration output.
import {assertPublicArtifactSafe} from '../src/public-artifact.mjs';
// @ts-expect-error -- setup-integrity.mjs intentionally has no declaration output.
import {analyzeSetupIntegrity} from './setup-integrity.mjs';
// @ts-expect-error -- setup-workspace.mjs intentionally has no declaration output.
import {manifestDifferences, treeManifest} from './setup-workspace.mjs';
import {
  passesAcceptance,
  scoreArm,
  verdict,
  type Measurement,
} from './setup-eval.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');
const MEASURE = path.join(HERE, 'setup-measure.mjs');
const RUN_SETUP = path.join(HERE, 'run-setup.mjs');
const EVIDENCE_DIR = process.env.ASTRYX_SETUP_EVIDENCE_DIR
  ? path.resolve(process.env.ASTRYX_SETUP_EVIDENCE_DIR)
  : null;
const RUN_CANONICAL = process.env.ASTRYX_CANONICAL_SETUP_BROWSER === '1';
const temporaryDirectories: string[] = [];
const dependencyRoots = new Map<string, string>();

function run(command: string, args: string[], cwd: string) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'setup-canonical-tests',
      GIT_AUTHOR_EMAIL: 'setup-canonical-tests@example.com',
      GIT_COMMITTER_NAME: 'setup-canonical-tests',
      GIT_COMMITTER_EMAIL: 'setup-canonical-tests@example.com',
    },
  });
}

function edit(file: string, transform: (source: string) => string) {
  const source = fs.readFileSync(file, 'utf8');
  const next = transform(source);
  if (next === source) {
    throw new Error(`canonical edit did not apply: ${file}`);
  }
  fs.writeFileSync(file, next);
}

function ensurePackageBuilds() {
  if (
    !fs.existsSync(path.join(REPO_ROOT, 'packages/core/dist/Button/index.js'))
  ) {
    run('pnpm', ['-F', '@astryxdesign/core', 'build'], REPO_ROOT);
  }
  if (
    !fs.existsSync(
      path.join(REPO_ROOT, 'packages/themes/neutral/dist/theme.css'),
    )
  ) {
    run('pnpm', ['-F', '@astryxdesign/theme-neutral', 'build'], REPO_ROOT);
  }
}

function dependencyRoot(fixture: string) {
  const existing = dependencyRoots.get(fixture);
  if (existing) {
    return existing;
  }
  const parent = fs.mkdtempSync(
    path.join(os.tmpdir(), `setup-canonical-deps-${fixture}-`),
  );
  temporaryDirectories.push(parent);
  const root = path.join(parent, 'app');
  copyFixture(fixture, root);
  run('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts'], root);
  dependencyRoots.set(fixture, root);
  return root;
}

function preparePair(fixture: string) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), `setup-canonical-${fixture}-`),
  );
  temporaryDirectories.push(root);
  const deps = dependencyRoot(fixture);
  const baseline = path.join(root, 'baseline');
  const arm = path.join(root, 'arm');
  for (const destination of [baseline, arm]) {
    copyFixture(fixture, destination);
    run(
      'cp',
      [
        '-al',
        path.join(deps, 'node_modules'),
        path.join(destination, 'node_modules'),
      ],
      root,
    );
  }

  const scope = path.join(arm, 'node_modules', '@astryxdesign');
  fs.mkdirSync(scope, {recursive: true});
  fs.symlinkSync(
    path.join(REPO_ROOT, 'packages/core'),
    path.join(scope, 'core'),
    'dir',
  );
  fs.symlinkSync(
    path.join(REPO_ROOT, 'packages/themes/neutral'),
    path.join(scope, 'theme-neutral'),
    'dir',
  );
  edit(path.join(arm, 'vite.config.ts'), source =>
    source.includes('  resolve: {')
      ? source.replace(
          '  resolve: {',
          "  resolve: {\n    dedupe: ['react', 'react-dom'],",
        )
      : source.replace(
          'export default defineConfig({\n  plugins:',
          "export default defineConfig({\n  resolve: {dedupe: ['react', 'react-dom']},\n  plugins:",
        ),
  );
  fs.writeFileSync(path.join(arm, '.gitignore'), 'node_modules/\ndist/\n');
  run('git', ['init', '-q'], arm);
  run('git', ['add', '-A'], arm);
  run('git', ['commit', '-qm', 'baseline'], arm);
  return {root, baseline, arm};
}

function installAstryxCss(arm: string) {
  edit(path.join(arm, 'src', 'index.css'), source =>
    source.replace(
      "@import 'tailwindcss';",
      [
        '@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;',
        '',
        "@import 'tailwindcss';",
        "@import '@astryxdesign/core/reset.css';",
        "@import '@astryxdesign/core/astryx.css';",
        "@import '@astryxdesign/theme-neutral/theme.css';",
      ].join('\n'),
    ),
  );
}

function applyButtonAddition(arm: string) {
  installAstryxCss(arm);
  edit(path.join(arm, 'src', 'App.tsx'), source =>
    source
      .replace(
        'const activity = [',
        "import {Button} from '@astryxdesign/core/Button';\n\nconst activity = [",
      )
      .replace(
        `            <button
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
              data-vibe-probe="primary-action">
              Create item
            </button>`,
        `            <div className="flex gap-2">
              <button
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
                data-vibe-probe="primary-action">
                Create item
              </button>
              <Button
                data-vibe-result="astryx-button"
                label="Deploy"
                size="md"
                variant="secondary"
              />
            </div>`,
      ),
  );
}

function applyStatusReplacement(arm: string, fixture: string) {
  installAstryxCss(arm);
  edit(path.join(arm, 'src', 'App.tsx'), source => {
    if (fixture === 'tailwind-v4-control') {
      return source
        .replace(
          'const activity = [',
          "import {Badge} from '@astryxdesign/core/Badge';\n\nconst activity = [",
        )
        .replace(
          `                      <span
                        data-vibe-probe={
                          row.item === 'Quarterly plan' ? 'status' : undefined
                        }>
                        {row.state}
                      </span>`,
          `                      {row.item === 'Quarterly plan' ? (
                        <span
                          className="relative inline-block"
                          data-vibe-replacement>
                          <span className="invisible">{row.state}</span>
                          <Badge
                            className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap"
                            data-vibe-result="astryx-status"
                            label={row.state}
                            variant="neutral"
                          />
                        </span>
                      ) : (
                        row.state
                      )}`,
        );
    }
    if (fixture === 'shadcn-tailwind-v4-established') {
      return source
        .replace(
          "import {createPortal} from 'react-dom';",
          "import {createPortal} from 'react-dom';\nimport {Badge} from '@astryxdesign/core/Badge';",
        )
        .replace(
          `                          <span
                            className={\`inline-flex rounded-full px-2 py-1 text-xs font-medium \${statusClasses[request.status as keyof typeof statusClasses]}\`}
                            data-vibe-probe={
                              request.id === 'REQ-104' ? 'status' : undefined
                            }>
                            {request.status}
                          </span>`,
          `                          {request.id === 'REQ-104' ? (
                            <span
                              className="relative inline-block"
                              data-vibe-replacement>
                              <span
                                aria-hidden
                                className={\`invisible inline-flex rounded-full px-2 py-1 text-xs font-medium \${statusClasses[request.status as keyof typeof statusClasses]}\`}>
                                {request.status}
                              </span>
                              <Badge
                                className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap"
                                data-vibe-result="astryx-status"
                                label={request.status}
                                variant="neutral"
                              />
                            </span>
                          ) : (
                            <span
                              className={\`inline-flex rounded-full px-2 py-1 text-xs font-medium \${statusClasses[request.status as keyof typeof statusClasses]}\`}>
                              {request.status}
                            </span>
                          )}`,
        );
    }
    if (fixture === 'enterprise-scoped-synthetic') {
      return source
        .replace(
          "import {createPortal} from 'react-dom';",
          "import {createPortal} from 'react-dom';\nimport {Badge} from '@astryxdesign/core/Badge';",
        )
        .replace(
          `                      <span
                        className={\`inline-flex rounded px-2 py-1 text-xs font-semibold \${healthClasses[service.health]}\`}
                        data-vibe-probe={
                          service.name === 'Aster' ? 'status' : undefined
                        }>
                        {service.health}
                      </span>`,
          `                      {service.name === 'Aster' ? (
                        <span
                          className="relative inline-block"
                          data-vibe-replacement>
                          <span
                            aria-hidden
                            className={\`invisible inline-flex rounded px-2 py-1 text-xs font-semibold \${healthClasses[service.health]}\`}>
                            {service.health}
                          </span>
                          <Badge
                            className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap"
                            data-vibe-result="astryx-status"
                            label={service.health}
                            variant="neutral"
                          />
                        </span>
                      ) : (
                        <span
                          className={\`inline-flex rounded px-2 py-1 text-xs font-semibold \${healthClasses[service.health]}\`}>
                          {service.health}
                        </span>
                      )}`,
        );
    }
    throw new Error(`unsupported status fixture: ${fixture}`);
  });
}

function applySelectorReplacement(arm: string) {
  installAstryxCss(arm);
  edit(path.join(arm, 'src', 'App.tsx'), source =>
    source
      .replace(
        'const activity = [',
        "import {useState} from 'react';\nimport {Selector} from '@astryxdesign/core/Selector';\n\nconst activity = [",
      )
      .replace(
        'export default function App() {',
        "export default function App() {\n  const [reviewer, setReviewer] = useState('avery');",
      )
      .replace(
        `            <label className="block text-sm font-medium">
              Reviewer
              <select className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2">
                <option>Avery</option>
                <option>Morgan</option>
              </select>
            </label>`,
        `            <Selector
              data-vibe-result="astryx-selector"
              label="Reviewer"
              onChange={setReviewer}
              options={[
                {value: 'avery', label: 'Avery'},
                {value: 'morgan', label: 'Morgan'},
              ]}
              size="md"
              value={reviewer}
              width="100%"
            />`,
      ),
  );
}

function applyShadcnComposition(arm: string) {
  installAstryxCss(arm);
  edit(path.join(arm, 'src', 'App.tsx'), source =>
    source
      .replace(
        "import {Button} from '@/components/ui/button';",
        [
          "import {Selector} from '@astryxdesign/core/Selector';",
          "import {Tooltip} from '@astryxdesign/core/Tooltip';",
          "import {Button} from '@/components/ui/button';",
        ].join('\n'),
      )
      .replace(
        '  const [popoverOpen, setPopoverOpen] = useState(false);',
        "  const [popoverOpen, setPopoverOpen] = useState(false);\n  const [route, setRoute] = useState('operations');",
      )
      .replace(
        `                <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3">`,
        `                <div className="mt-4 flex items-end gap-3">
                  <Tooltip
                    content={
                      <span data-vibe-result="astryx-tooltip-surface">
                        Approval routing details
                      </span>
                    }
                    delay={0}>
                    <button
                      aria-label="Explain Astryx routing"
                      className="grid size-9 place-items-center rounded-md border border-input bg-background text-sm font-semibold"
                      data-vibe-result="astryx-tooltip-trigger"
                      type="button">
                      i
                    </button>
                  </Tooltip>
                  <Selector
                    data-vibe-result="astryx-selector-trigger"
                    isLabelHidden
                    label="Approval route"
                    onChange={setRoute}
                    options={[
                      {value: 'operations', label: 'Operations'},
                      {value: 'research', label: 'Research'},
                      {value: 'facilities', label: 'Facilities'},
                    ]}
                    renderOption={option => (
                      <span
                        data-vibe-result={
                          option.value === 'operations'
                            ? 'astryx-selector-surface'
                            : undefined
                        }>
                        {option.label}
                      </span>
                    )}
                    value={route}
                    width={180}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3">`,
      ),
  );
}

function applyEnterpriseComposition(arm: string) {
  installAstryxCss(arm);
  edit(
    path.join(arm, 'src', 'index.css'),
    source =>
      `${source}\n[data-vibe-result='astryx-dialog-surface']::backdrop {\n  z-index: 40;\n}\n`,
  );
  edit(path.join(arm, 'src', 'App.tsx'), source => {
    let next = source
      .replace(
        "import {useState} from 'react';\nimport {createPortal} from 'react-dom';",
        "import {useRef, useState} from 'react';\nimport {Dialog} from '@astryxdesign/core/Dialog';",
      )
      .replace(
        '  const [popoverOpen, setPopoverOpen] = useState(false);',
        '  const [popoverOpen, setPopoverOpen] = useState(false);\n  const hostMenuRef = useRef<HTMLDivElement>(null);',
      )
      .replace(
        `  const closeDialog = () => {
    setDialogOpen(false);
    setPopoverOpen(false);
  };`,
        `  const closeDialog = () => {
    if (hostMenuRef.current?.matches(':popover-open')) {
      hostMenuRef.current.hidePopover();
    }
    setDialogOpen(false);
    setPopoverOpen(false);
  };

  const toggleHostMenu = () => {
    const menu = hostMenuRef.current;
    if (!menu) return;
    const isOpen = menu.matches(':popover-open');
    if (isOpen) {
      menu.hidePopover();
    } else {
      menu.showPopover();
    }
    setPopoverOpen(!isOpen);
  };`,
      )
      .replace(
        `            data-vibe-probe="dialog-trigger"
            onClick={() => setDialogOpen(true)}`,
        `            data-vibe-probe="dialog-trigger"
            data-vibe-result="astryx-dialog-trigger"
            onClick={() => setDialogOpen(true)}`,
      );
    const start = next.indexOf('      {dialogOpen\n        ? createPortal(');
    const end = next.indexOf('    </div>\n  );', start);
    if (start === -1 || end === -1) {
      throw new Error('canonical enterprise dialog edit did not apply');
    }
    next = `${next.slice(0, start)}      {dialogOpen ? (
        <Dialog
          aria-labelledby="service-dialog-title"
          className="fixture-shell block z-[50] rounded-lg border border-border bg-panel p-6 text-foreground shadow-2xl"
          data-guest-design-system
          data-mode={mode}
          data-vibe-probe="dialog-surface"
          data-vibe-result="astryx-dialog-surface"
          isOpen
          onOpenChange={open => {
            if (!open) closeDialog();
          }}
          width="min(30rem, calc(100% - 2rem))">
          <div data-vibe-probe="dialog-backdrop">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">
              Guest action
            </p>
            <h2 className="text-lg font-semibold" id="service-dialog-title">
              Service actions
            </h2>
          </div>
          <p
            className="mt-3 text-sm opacity-75"
            data-vibe-probe="dialog-body">
            This guest dialog is portaled across the host boundary.
          </p>
          <div
            className="mt-4 rounded-md border border-border bg-subtle p-3 text-sm"
            data-vibe-probe="dialog-callout">
            Restarting a service pauses its queued work.
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-panel p-3">
            <div>
              <p className="text-sm font-semibold">Target service</p>
              <p className="text-xs opacity-75">Aster · North</p>
            </div>
            <button
              aria-controls="guest-service-menu"
              aria-expanded={popoverOpen}
              aria-haspopup="menu"
              className="rounded-md border border-border bg-panel px-3 py-2 text-sm font-medium"
              data-vibe-probe="popover-trigger"
              data-vibe-result="host-menu-trigger"
              onClick={toggleHostMenu}
              type="button">
              Select service
            </button>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              className="rounded-md border border-border px-3 py-2 text-sm font-medium"
              onClick={closeDialog}
              type="button">
              Cancel
            </button>
            <button
              className="rounded-md bg-error px-3 py-2 text-sm font-semibold text-white"
              data-vibe-probe="destructive-action"
              type="button">
              Restart service
            </button>
          </div>
          <div
            ref={hostMenuRef}
            aria-label="Guest service options"
            className="fixture-shell fixed left-[calc(50%+1.5rem)] top-[calc(50%+2rem)] z-[70] w-52 rounded-md border border-border bg-panel p-1 text-foreground shadow-2xl"
            data-guest-design-system
            data-mode={mode}
            data-vibe-probe="popover-surface"
            data-vibe-result="host-menu-surface"
            id="guest-service-menu"
            popover="manual"
            role="menu">
            {['Aster', 'Briar', 'Cedar'].map(service => (
              <button
                className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-subtle"
                data-vibe-probe={
                  service === 'Aster' ? 'popover-menu-item' : undefined
                }
                key={service}
                role="menuitem"
                type="button">
                {service}
              </button>
            ))}
          </div>
        </Dialog>
      ) : null}
${next.slice(end)}`;
    return next;
  });
}

function measure(
  app: string,
  fixture: string,
  out: string,
  provenance?: string,
  screenshotDir?: string,
): Measurement {
  run(
    process.execPath,
    [
      MEASURE,
      '--app',
      app,
      '--fixture',
      fixture,
      '--out',
      out,
      ...(provenance ? ['--provenance', provenance] : []),
      ...(screenshotDir ? ['--screenshot-dir', screenshotDir] : []),
    ],
    REPO_ROOT,
  );
  const serialized = fs.readFileSync(out, 'utf8');
  expect(serialized).not.toContain(path.resolve(app));
  const measurement = JSON.parse(serialized) as Measurement & {app?: string};
  expect(measurement.app).toBe(fixture);
  if (provenance) {
    const exportedProvenance = JSON.parse(
      fs.readFileSync(out.replace(/\.json$/, '.provenance.json'), 'utf8'),
    );
    expect(exportedProvenance.usage?.source).toBe('runner-reported');
    expect(JSON.stringify(exportedProvenance)).not.toContain(path.resolve(app));
  }
  return measurement;
}

function provenanceFor(arm: string, fixture: string, promptId: string) {
  const digest = analyzeSetupIntegrity(arm).diffSha256;
  const file = path.join(path.dirname(arm), `${promptId}.provenance.json`);
  fs.writeFileSync(
    file,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        task: {id: promptId, sha256: 'a'.repeat(64)},
        fixture: {id: fixture, sha256: 'b'.repeat(64)},
        condition: 'candidate',
        rep: 1,
        executor: {harness: 'fixture-test', model: 'deterministic'},
        matrix: {stage: 'confirmation', bundle: 'fixture-test'},
        execution: {
          status: 'succeeded',
          attempt: 1,
          retry: 0,
          agentDiffSha256: digest,
        },
        usage: {
          complete: true,
          inputTokens: 1,
          outputTokens: 1,
          source: arm,
        },
        environmentHash: 'c'.repeat(64),
      },
      null,
      2,
    )}\n`,
  );
  return file;
}

function outputPaths(root: string, task: string) {
  const directory = EVIDENCE_DIR ? path.join(EVIDENCE_DIR, task) : root;
  fs.mkdirSync(directory, {recursive: true});
  return {
    directory,
    baseline: path.join(directory, `${task}-baseline.json`),
    arm: path.join(directory, `${task}-canonical.json`),
  };
}

function hostProbe(measurement: Measurement, probeName: string) {
  const probe = measurement.schemes.light.probes[probeName];
  if (!probe || 'missing' in probe) {
    throw new Error(`missing ${probeName}`);
  }
  return probe;
}

function writeFalsePositiveEvidence(
  paths: ReturnType<typeof outputPaths>,
  task: string,
  baseline: Measurement,
  arm: Measurement,
  flags: Array<{probe: string; field: string}>,
) {
  if (!EVIDENCE_DIR) {
    return;
  }
  const oldEvaluatorFlags = flags.map(({probe, field}) => {
    const before = hostProbe(baseline, probe);
    const after = hostProbe(arm, probe);
    const read = (reading: typeof before) => {
      if (field === 'textContent') {
        return reading.descendantText;
      }
      const geometryField = field.replace(
        'geometry.',
        '',
      ) as keyof typeof reading.geometry;
      return reading.geometry[geometryField];
    };
    return {probe, field, before: read(before), after: read(after)};
  });
  fs.writeFileSync(
    path.join(paths.directory, 'false-positive-evidence.json'),
    `${JSON.stringify(
      {
        task,
        viewport: {width: 1280, height: 720},
        baselineScreenshot: path.join(
          paths.directory,
          `${task}-baseline-light.png`,
        ),
        canonicalScreenshot: path.join(
          paths.directory,
          `${task}-canonical-light.png`,
        ),
        oldEvaluatorFlags,
        strictAcceptance: passesAcceptance(scoreArm(baseline, arm)),
      },
      null,
      2,
    )}\n`,
  );
}

function assertStyleMutationFails(
  baseline: Measurement,
  arm: Measurement,
  probeName: string,
) {
  const mutations = [
    ['color', 'rgb(255, 0, 0)', 'rgb(0, 255, 0)'],
    ['borderTopLeftRadius', '999px', '777px'],
    ['boxShadow', 'rgb(255, 0, 0) 0px 0px 1px 0px', 'none'],
    ['borderTopWidth', '9px', '7px'],
    ['fontFamily', 'Mutation Font', 'Other Font'],
  ];
  for (const [property, first, second] of mutations) {
    const mutated = structuredClone(arm);
    for (const scheme of ['light', 'dark'] as const) {
      const probe = mutated.schemes[scheme].probes[probeName];
      if (!probe || 'missing' in probe) {
        throw new Error(`missing ${probeName}`);
      }
      probe.style[property] = probe.style[property] === first ? second : first;
    }
    expect(
      passesAcceptance(scoreArm(baseline, mutated)),
      `${probeName}:${property}`,
    ).toBe(false);
  }
}

const describeCanonical = RUN_CANONICAL ? describe : describe.skip;

describeCanonical('canonical intended changes', () => {
  beforeAll(ensurePackageBuilds, 180_000);
  afterAll(() => {
    for (const directory of temporaryDirectories) {
      fs.rmSync(directory, {recursive: true, force: true});
    }
  });
  it('writes a portable setup config with a resolvable matrix reference', () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), 'setup-canonical-public-config-'),
    );
    temporaryDirectories.push(root);
    run(
      process.execPath,
      [
        RUN_SETUP,
        '--stage',
        'separation',
        '--fixtures',
        'tailwind-v4-control',
        '--conditions',
        'floor',
        '--prompts',
        's1',
        '--bundles',
        'native-claude',
        '--reps',
        '1',
        '--out',
        root,
      ],
      REPO_ROOT,
    );
    const configFile = fs
      .readdirSync(root)
      .find(file => file.startsWith('setup-config-'));
    if (!configFile) {
      throw new Error('missing generated setup config');
    }
    const config = JSON.parse(
      fs.readFileSync(path.join(root, configFile), 'utf8'),
    );
    expect(() =>
      assertPublicArtifactSafe(config, {
        label: 'generated setup config',
        privateValues: [
          root,
          REPO_ROOT,
          process.env.HOME,
          process.env.USER,
          process.env.HOSTNAME,
        ],
      }),
    ).not.toThrow();
    expect(path.isAbsolute(config.matrixFile)).toBe(false);
    expect(fs.existsSync(path.join(root, config.matrixFile))).toBe(true);
    const taskText = fs.readFileSync(
      path.join(root, config.runs[0].taskFile),
      'utf8',
    );
    expect(taskText).toContain(
      'Treat the current working directory as the project',
    );
    expect(taskText).not.toContain(root);
    expect(() =>
      assertPublicArtifactSafe(taskText, {
        label: 'generated task',
        privateValues: [root, REPO_ROOT],
      }),
    ).not.toThrow();
    for (const reference of [
      ...Object.values(config.baselines),
      ...config.runs.flatMap((entry: Record<string, string>) => [
        entry.sandboxDir,
        entry.taskFile,
        entry.provenanceFile,
      ]),
    ] as string[]) {
      expect(path.isAbsolute(reference)).toBe(false);
      expect(fs.existsSync(path.join(root, reference))).toBe(true);
    }
  }, 120_000);

  /**
   * The measurer must not build in the sandbox it measures.
   *
   * That sandbox is the attested artifact: the runner digested its bytes, the
   * integrity checker reads them, and a re-measurement has to be able to read
   * them again. A build in place regenerates the app-owned theme over the
   * executor's copy, writes `dist/`, appends to the CLI's invocation log, and
   * caches into `node_modules`, after which the tree no longer hashes to the
   * digest that attested it.
   *
   * This runs the real measurer, with a real build, against a real fixture arm,
   * and compares a full byte-and-mtime manifest of the sandbox taken before and
   * after — every entry, tracked and ignored alike, since the debris is ignored
   * by construction.
   */
  it('measures a real arm without changing one byte of its sandbox', () => {
    const {root, arm} = preparePair('tailwind-v4-control');
    applyButtonAddition(arm);
    const provenance = provenanceFor(arm, 'tailwind-v4-control', 's1');
    const digestBefore = analyzeSetupIntegrity(arm).diffSha256;
    const before = treeManifest(arm);

    const result = measure(
      arm,
      'tailwind-v4-control',
      path.join(root, 'immutability-arm.json'),
      provenance,
    );
    expect(
      result.build.ok,
      `${result.build.stdout}\n${result.build.stderr}`,
    ).toBe(true);
    // The build really produced what the measurement read.
    expect(result.layerOrder.length).toBeGreaterThan(0);

    expect(manifestDifferences(before, treeManifest(arm))).toEqual([]);
    // The digest that attested this tree still describes it, so the cell can be
    // re-measured or recovered from these same bytes.
    expect(analyzeSetupIntegrity(arm).diffSha256).toBe(digestBefore);
    // Nothing was left behind for the next measurement to trip over.
    expect(fs.existsSync(path.join(arm, 'dist'))).toBe(false);
  }, 180_000);

  it('leaves the sandbox untouched when the build fails', () => {
    const {root, arm} = preparePair('tailwind-v4-control');
    applyButtonAddition(arm);
    // Break the build after the sandbox is attested, the way a real failing
    // executor change would.
    edit(
      path.join(arm, 'src', 'App.tsx'),
      source => `${source}\nconst broken: number = 'not a number';\n`,
    );
    const provenance = provenanceFor(arm, 'tailwind-v4-control', 's1');
    const digestBefore = analyzeSetupIntegrity(arm).diffSha256;
    const before = treeManifest(arm);

    const result = measure(
      arm,
      'tailwind-v4-control',
      path.join(root, 'immutability-failed.json'),
      provenance,
    );
    expect(result.build.ok).toBe(false);

    expect(manifestDifferences(before, treeManifest(arm))).toEqual([]);
    expect(analyzeSetupIntegrity(arm).diffSha256).toBe(digestBefore);
  }, 180_000);

  it('builds, measures, and accepts a correct s1 button insertion', () => {
    const {
      root,
      baseline: baselineApp,
      arm,
    } = preparePair('tailwind-v4-control');
    applyButtonAddition(arm);
    const paths = outputPaths(root, 's1');
    const baseline = measure(
      baselineApp,
      'tailwind-v4-control',
      paths.baseline,
      undefined,
      EVIDENCE_DIR ? paths.directory : undefined,
    );
    const provenance = provenanceFor(arm, 'tailwind-v4-control', 's1');
    const result = measure(
      arm,
      'tailwind-v4-control',
      paths.arm,
      provenance,
      EVIDENCE_DIR ? paths.directory : undefined,
    );
    writeFalsePositiveEvidence(paths, 's1', baseline, result, [
      {probe: 'host-shell', field: 'textContent'},
      {probe: 'primary-action', field: 'geometry.x'},
    ]);
    const score = scoreArm(baseline, result);
    expect(score.regressionDetails).toEqual([]);
    expect(verdict(score)).toBe('clean');
    expect(passesAcceptance(score)).toBe(true);
    assertStyleMutationFails(baseline, result, 'primary-action');
    const geometryMutation = structuredClone(result);
    for (const scheme of ['light', 'dark'] as const) {
      const probe = geometryMutation.schemes[scheme].probes['primary-action'];
      if ('missing' in probe) {
        throw new Error('missing primary-action');
      }
      probe.geometry.width += 1;
    }
    expect(passesAcceptance(scoreArm(baseline, geometryMutation))).toBe(false);
  }, 120_000);

  it.each([
    'tailwind-v4-control',
    'shadcn-tailwind-v4-established',
    'enterprise-scoped-synthetic',
  ])(
    'builds, measures, and accepts a correct s2 status replacement in %s',
    fixture => {
      const {root, baseline: baselineApp, arm} = preparePair(fixture);
      applyStatusReplacement(arm, fixture);
      const baseline = measure(
        baselineApp,
        fixture,
        path.join(root, 's2-baseline.json'),
      );
      const provenance = provenanceFor(arm, fixture, 's2');
      const result = measure(
        arm,
        fixture,
        path.join(root, 's2-canonical.json'),
        provenance,
      );
      const score = scoreArm(baseline, result);
      expect(
        result.build.ok,
        `${result.build.stdout}\n${result.build.stderr}`,
      ).toBe(true);
      expect(score.regressionDetails, JSON.stringify(score, null, 2)).toEqual(
        [],
      );
      expect(verdict(score)).toBe('clean');
      expect(passesAcceptance(score)).toBe(true);
      for (const scheme of ['light', 'dark'] as const) {
        expect(result.schemes[scheme].probes.status).toEqual({missing: true});
        expect(
          result.schemes[scheme].taskResults?.['astryx-status'],
        ).toMatchObject({count: 1, visible: true});
      }
      const neighbor =
        fixture === 'tailwind-v4-control' ? 'table-cell' : 'table-header';
      assertStyleMutationFails(baseline, result, neighbor);
    },
    120_000,
  );

  it('builds, measures, and accepts a correct s3 selector replacement', () => {
    const {
      root,
      baseline: baselineApp,
      arm,
    } = preparePair('tailwind-v4-control');
    applySelectorReplacement(arm);
    const paths = outputPaths(root, 's3');
    const baseline = measure(
      baselineApp,
      'tailwind-v4-control',
      paths.baseline,
      undefined,
      EVIDENCE_DIR ? paths.directory : undefined,
    );
    const provenance = provenanceFor(arm, 'tailwind-v4-control', 's3');
    const result = measure(
      arm,
      'tailwind-v4-control',
      paths.arm,
      provenance,
      EVIDENCE_DIR ? paths.directory : undefined,
    );
    writeFalsePositiveEvidence(paths, 's3', baseline, result, [
      {probe: 'form-control', field: 'geometry.y'},
      {probe: 'form-control', field: 'geometry.bottom'},
    ]);
    const score = scoreArm(baseline, result);
    expect(score.regressionDetails).toEqual([]);
    expect(verdict(score)).toBe('clean');
    expect(passesAcceptance(score)).toBe(true);
    assertStyleMutationFails(baseline, result, 'form-control');
    const geometryMutation = structuredClone(result);
    for (const scheme of ['light', 'dark'] as const) {
      const probe = geometryMutation.schemes[scheme].probes['form-control'];
      if ('missing' in probe) {
        throw new Error('missing form-control');
      }
      probe.geometry.width += 1;
    }
    expect(passesAcceptance(scoreArm(baseline, geometryMutation))).toBe(false);
  }, 120_000);

  it('builds, interacts with, and accepts Astryx surfaces in a host dialog', () => {
    const {
      root,
      baseline: baselineApp,
      arm,
    } = preparePair('shadcn-tailwind-v4-established');
    applyShadcnComposition(arm);
    const baseline = measure(
      baselineApp,
      'shadcn-tailwind-v4-established',
      path.join(root, 's4-baseline.json'),
    );
    const provenance = provenanceFor(
      arm,
      'shadcn-tailwind-v4-established',
      's4',
    );
    const result = measure(
      arm,
      'shadcn-tailwind-v4-established',
      path.join(root, 's4-canonical.json'),
      provenance,
    );
    const score = scoreArm(baseline, result);
    expect(
      result.build.ok,
      `${result.build.stdout}\n${result.build.stderr}`,
    ).toBe(true);
    expect(score.regressionDetails, JSON.stringify(score, null, 2)).toEqual([]);
    expect(score.layeringFailures).toEqual([]);
    expect(score.taskFailures).toEqual([]);
    expect(verdict(score)).toBe('clean');
    expect(passesAcceptance(score)).toBe(true);

    const baselineDialog =
      baseline.schemes.light.interaction?.surfaces['dialog-surface'];
    const resultDialog =
      result.schemes.light.interaction?.surfaces['dialog-surface'];
    if (
      !baselineDialog ||
      'missing' in baselineDialog ||
      !resultDialog ||
      'missing' in resultDialog
    ) {
      throw new Error('missing host dialog surface');
    }
    expect(resultDialog.bounds.height).not.toBe(baselineDialog.bounds.height);
    const baselineHostText = hostProbe(baseline, 'host-shell').text;
    expect(hostProbe(result, 'host-shell').text).toBe(baselineHostText);
    expect(baselineHostText.indexOf('Save settings')).toBeGreaterThan(200);

    const widthDamage = structuredClone(result);
    const styleDamage = structuredClone(result);
    const backdropDamage = structuredClone(result);
    for (const scheme of ['light', 'dark'] as const) {
      const widthSurface =
        widthDamage.schemes[scheme].interaction?.surfaces['dialog-surface'];
      const styleSurface =
        styleDamage.schemes[scheme].interaction?.surfaces['dialog-surface'];
      const backdropSurface =
        backdropDamage.schemes[scheme].interaction?.surfaces['dialog-backdrop'];
      if (
        !widthSurface ||
        'missing' in widthSurface ||
        !styleSurface ||
        'missing' in styleSurface ||
        !backdropSurface ||
        'missing' in backdropSurface
      ) {
        throw new Error('missing host overlay surface');
      }
      widthSurface.bounds.width += 1;
      styleSurface.style.boxShadow = 'none';
      backdropSurface.style.backgroundColor = 'rgb(255, 0, 0)';
    }
    expect(passesAcceptance(scoreArm(baseline, widthDamage))).toBe(false);
    expect(passesAcceptance(scoreArm(baseline, styleDamage))).toBe(false);
    expect(passesAcceptance(scoreArm(baseline, backdropDamage))).toBe(false);

    edit(path.join(arm, 'src', 'App.tsx'), source =>
      source.replace('Save settings', 'Publish settings'),
    );
    const textDamage = measure(
      arm,
      'shadcn-tailwind-v4-established',
      path.join(root, 's4-host-text-damage.json'),
      provenanceFor(arm, 'shadcn-tailwind-v4-established', 's4'),
    );
    expect(scoreArm(baseline, textDamage).regressionDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({probe: 'host-shell', property: 'text'}),
      ]),
    );
    expect(passesAcceptance(scoreArm(baseline, textDamage))).toBe(false);
  }, 180_000);

  it('builds, interacts with, and accepts a host menu in an Astryx dialog', () => {
    const {
      root,
      baseline: baselineApp,
      arm,
    } = preparePair('enterprise-scoped-synthetic');
    applyEnterpriseComposition(arm);
    const baseline = measure(
      baselineApp,
      'enterprise-scoped-synthetic',
      path.join(root, 's5-baseline.json'),
    );
    const provenance = provenanceFor(arm, 'enterprise-scoped-synthetic', 's5');
    const result = measure(
      arm,
      'enterprise-scoped-synthetic',
      path.join(root, 's5-canonical.json'),
      provenance,
    );
    const score = scoreArm(baseline, result);
    expect(
      result.build.ok,
      `${result.build.stdout}\n${result.build.stderr}`,
    ).toBe(true);
    expect(score.regressionDetails, JSON.stringify(score, null, 2)).toEqual([]);
    expect(score.layeringFailures).toEqual([]);
    expect(score.taskFailures).toEqual([]);
    expect(verdict(score)).toBe('clean');
    expect(passesAcceptance(score)).toBe(true);

    for (const scheme of ['light', 'dark'] as const) {
      const interaction =
        result.schemes[scheme].taskInteractions?.['host-menu-in-astryx-dialog'];
      expect(interaction?.keyboardReached).toEqual({
        'astryx-dialog-trigger': true,
        'host-menu-trigger': true,
      });
      const menu = interaction?.surfaces['host-menu-surface'];
      if (!menu || 'missing' in menu) {
        throw new Error('missing host menu surface');
      }
      expect(menu.topLayer.inTopLayer).toBe(true);
    }
  }, 180_000);
});
