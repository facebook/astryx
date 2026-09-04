// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for RTL contextual decorations and applicability coverage.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {JSDOM} from 'jsdom';
import {afterEach, describe, expect, it} from 'vitest';
import {
  buildAuditedComponentRoster,
  buildComponentCoverage,
  classifyDirectionalDecorationPair,
  collectDirectionalDecorations,
} from '../../apps/storybook/rtl-audit/rtl-audit-coverage.mjs';
import {
  buildCurrentVerifiedNaEvidence,
  evidenceFilesForDeclaration,
  validateVerifiedNaRegistry,
} from '../../apps/storybook/rtl-audit/verified-na-evidence.mjs';

const IDENTITY = [1, 0, 0, 1];
const MIRROR = [-1, 0, 0, 1];
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

function writeFixture(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

function evidenceFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-rtl-evidence-'));
  temporaryDirectories.push(root);
  writeFixture(
    root,
    'packages/core/src/Text/Text.tsx',
    "import './textStyles';\nexport function Text() { return null; }\n",
  );
  writeFixture(
    root,
    'packages/core/src/Text/textStyles.ts',
    "export const direction = 'logical';\n",
  );
  writeFixture(
    root,
    'apps/storybook/stories/Text.stories.tsx',
    "export default {title: 'Core/Text'};\n",
  );
  return {
    root,
    declarations: [
      {
        component: 'core/Text',
        reason: 'Text has no direction-sensitive visual or behavior.',
      },
    ],
    sourceComponents: ['core/Text'],
    storyEntries: [
      {
        id: 'core-text--default',
        type: 'story',
        title: 'Core/Text',
        importPath: './stories/Text.stories.tsx',
      },
    ],
  };
}

function decoration(glyph, policy, matrix = IDENTITY) {
  return {glyph, policy, matrix};
}

describe('collectDirectionalDecorations', () => {
  it('detects a slash used between repeated list items', () => {
    const dom = new JSDOM(`
      <ol>
        <li><span aria-hidden="true">/</span><a>Home</a></li>
        <li><span aria-hidden="true">/</span><a>Docs</a></li>
      </ol>
      <p>Control: and/or · 08/24 · /settings</p>
    `);
    const found = collectDirectionalDecorations({
      root: dom.window.document,
      requireVisible: false,
    });
    expect(found).toHaveLength(2);
    expect(found[0]).toMatchObject({glyph: '/', policy: 'explicit'});
  });

  it('follows a nested glyph element that carries the mirror transform', () => {
    const dom = new JSDOM(`
      <ol>
        <li><span aria-hidden="true"><span style="transform: matrix(-1, 0, 0, 1, 0, 0)">→</span></span><a>Home</a></li>
        <li><span aria-hidden="true"><span style="transform: matrix(-1, 0, 0, 1, 0, 0)">→</span></span><a>Docs</a></li>
      </ol>
    `);
    const found = collectDirectionalDecorations({
      root: dom.window.document,
      requireVisible: false,
    });
    expect(found[0].matrix).toEqual(MIRROR);
  });

  it('ignores the same slash without a directional decoration context', () => {
    const dom = new JSDOM('<p aria-hidden="true">/</p><p>and/or</p>');
    expect(
      collectDirectionalDecorations({
        root: dom.window.document,
        requireVisible: false,
      }),
    ).toEqual([]);
  });
});

describe('classifyDirectionalDecorationPair', () => {
  it('fails a bare contextual arrow', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('→', 'explicit'),
        decoration('→', 'explicit'),
      ),
    ).toMatchObject({verdict: 'fail'});
  });

  it('passes a mirrored contextual arrow', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('→', 'explicit'),
        decoration('→', 'explicit', MIRROR),
      ),
    ).toMatchObject({verdict: 'pass'});
  });

  it('passes an unchanged Unicode-mirrored angle quote', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('›', 'auto-bidi'),
        decoration('›', 'auto-bidi'),
      ),
    ).toMatchObject({verdict: 'pass'});
  });

  it('fails an explicitly mirrored Unicode-mirrored angle quote', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('›', 'auto-bidi'),
        decoration('›', 'auto-bidi', MIRROR),
      ),
    ).toMatchObject({verdict: 'fail'});
  });
});

describe('buildComponentCoverage', () => {
  it('classifies measured, verified N/A, unexplained gaps, and stale declarations', () => {
    const coverage = buildComponentCoverage({
      components: [
        'core/Breadcrumbs',
        'core/Button',
        'core/Text',
        'core/Pagination',
      ],
      decorationResults: [
        {
          component: 'core/Breadcrumbs',
          storyId: 'core-breadcrumbs--default',
          verdict: 'pass',
        },
      ],
      autoResults: [
        {
          component: 'core/Pagination',
          storyId: 'core-pagination--default',
          verdict: 'pass',
        },
      ],
      verifiedNa: [
        {
          component: 'core/Text',
          reason: 'Text has no direction-sensitive visual or behavior.',
          evidence: {
            'packages/core/src/Text/Text.tsx': `sha256:${'a'.repeat(64)}`,
          },
        },
        {component: 'core/Pagination', reason: 'stale reason'},
      ],
      currentVerifiedNaEvidence: new Map([
        [
          'core/text',
          {'packages/core/src/Text/Text.tsx': `sha256:${'a'.repeat(64)}`},
        ],
      ]),
    });

    expect(coverage).toMatchObject({
      total: 4,
      measured: 1,
      verifiedNa: 1,
      gaps: 1,
      staleVerifiedNa: 1,
    });
    expect(
      Object.fromEntries(
        coverage.results.map(result => [result.component, result.status]),
      ),
    ).toEqual({
      'core/Breadcrumbs': 'measured',
      'core/Button': 'coverage-gap',
      'core/Pagination': 'stale-verified-na',
      'core/Text': 'verified-na',
    });
  });

  it('never treats empty evidence as a verified declaration', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Text'],
      verifiedNa: [
        {
          component: 'core/Text',
          reason: 'Text has no direction-sensitive behavior.',
          evidence: {},
        },
      ],
      currentVerifiedNaEvidence: new Map([['core/text', {}]]),
    });
    expect(coverage.results[0]).toMatchObject({status: 'coverage-gap'});
  });

  it('returns a changed declared component to a gap until it is re-verified', () => {
    const fixture = evidenceFixture();
    const initial = buildCurrentVerifiedNaEvidence({
      ...fixture,
      projectRoot: fixture.root,
    });
    expect(initial.errors).toEqual([]);
    fixture.declarations[0].evidence =
      initial.evidenceByComponent.get('core/text');

    const before = buildComponentCoverage({
      components: ['core/Text'],
      verifiedNa: fixture.declarations,
      currentVerifiedNaEvidence: initial.evidenceByComponent,
    });
    expect(before.results[0]).toMatchObject({status: 'verified-na'});

    writeFixture(
      fixture.root,
      'packages/core/src/Text/Text.tsx',
      'import \'./textStyles\';\nexport function Text() { return "changed"; }\n',
    );
    const changed = buildCurrentVerifiedNaEvidence({
      ...fixture,
      projectRoot: fixture.root,
    });
    const unverified = buildComponentCoverage({
      components: ['core/Text'],
      verifiedNa: fixture.declarations,
      currentVerifiedNaEvidence: changed.evidenceByComponent,
    });
    expect(unverified).toMatchObject({verifiedNa: 0, gaps: 1});
    expect(unverified.results[0]).toMatchObject({
      status: 'coverage-gap',
      evidence: {
        changed: ['packages/core/src/Text/Text.tsx'],
      },
    });

    fixture.declarations[0].evidence =
      changed.evidenceByComponent.get('core/text');
    const reverified = buildComponentCoverage({
      components: ['core/Text'],
      verifiedNa: fixture.declarations,
      currentVerifiedNaEvidence: changed.evidenceByComponent,
    });
    expect(reverified.results[0]).toMatchObject({status: 'verified-na'});
  });

  it('invalidates a declaration when a local source dependency changes', () => {
    const fixture = evidenceFixture();
    const initial = buildCurrentVerifiedNaEvidence({
      ...fixture,
      projectRoot: fixture.root,
    });
    fixture.declarations[0].evidence =
      initial.evidenceByComponent.get('core/text');

    writeFixture(
      fixture.root,
      'packages/core/src/Text/textStyles.ts',
      "export const direction = 'physical';\n",
    );
    const changed = buildCurrentVerifiedNaEvidence({
      ...fixture,
      projectRoot: fixture.root,
    });
    const coverage = buildComponentCoverage({
      components: ['core/Text'],
      verifiedNa: fixture.declarations,
      currentVerifiedNaEvidence: changed.evidenceByComponent,
    });
    expect(coverage.results[0]).toMatchObject({
      status: 'coverage-gap',
      evidence: {
        changed: ['packages/core/src/Text/textStyles.ts'],
      },
    });
  });

  it('invalidates a declaration when an owned story changes or is added', () => {
    const fixture = evidenceFixture();
    const initial = buildCurrentVerifiedNaEvidence({
      ...fixture,
      projectRoot: fixture.root,
    });
    fixture.declarations[0].evidence =
      initial.evidenceByComponent.get('core/text');

    writeFixture(
      fixture.root,
      'apps/storybook/stories/Text.stories.tsx',
      "export default {title: 'Core/Text', tags: ['changed']};\n",
    );
    writeFixture(
      fixture.root,
      'apps/storybook/stories/TextOverflow.stories.tsx',
      "export default {title: 'Core/Text'};\n",
    );
    fixture.storyEntries.push({
      id: 'core-text--overflow',
      type: 'story',
      title: 'Core/Text',
      importPath: './stories/TextOverflow.stories.tsx',
    });
    const changed = buildCurrentVerifiedNaEvidence({
      ...fixture,
      projectRoot: fixture.root,
    });
    const coverage = buildComponentCoverage({
      components: ['core/Text'],
      verifiedNa: fixture.declarations,
      currentVerifiedNaEvidence: changed.evidenceByComponent,
    });
    expect(coverage.results[0]).toMatchObject({
      status: 'coverage-gap',
      evidence: {
        added: ['apps/storybook/stories/TextOverflow.stories.tsx'],
        changed: ['apps/storybook/stories/Text.stories.tsx'],
      },
    });
  });

  it('keeps missing stories and audit errors as coverage gaps', () => {
    const coverage = buildComponentCoverage({
      components: ['core/MissingStory', 'core/BrokenAudit'],
      autoResults: [
        {
          component: 'core/BrokenAudit',
          storyId: 'core-broken--default',
          verdict: 'ERROR',
        },
      ],
      curatedResults: [
        {
          component: 'core/MissingStory',
          storyId: 'core-missing--default',
          rollup: 'MISSING-STORY',
        },
      ],
    });
    expect(coverage.measured).toBe(0);
    expect(coverage.gaps).toBe(2);
  });

  it('keeps same-named Core and Lab components distinct', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Chat', 'lab/Chat'],
    });
    expect(coverage.results.map(result => result.component)).toEqual([
      'core/Chat',
      'lab/Chat',
    ]);
    expect(coverage.gaps).toBe(2);
  });
});

describe('evidenceFilesForDeclaration', () => {
  it('tracks the component module and its owned grouped stories only', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-rtl-owned-'));
    temporaryDirectories.push(root);
    writeFixture(
      root,
      'packages/core/src/Chat/ChatDictationButton.tsx',
      'export function ChatDictationButton() { return null; }\n',
    );
    for (const story of ['Chat', 'ChatDictation', 'Card']) {
      writeFixture(
        root,
        `apps/storybook/stories/${story}.stories.tsx`,
        `export default {title: 'Core/${story}'};\n`,
      );
    }
    const files = evidenceFilesForDeclaration({
      declaration: {
        component: 'core/ChatDictationButton',
        reason: 'reviewed',
      },
      projectRoot: root,
      sourceComponents: ['core/ChatDictationButton'],
      storyEntries: ['Chat', 'ChatDictation', 'Card'].map(story => ({
        id: `core-${story.toLowerCase()}--default`,
        type: 'story',
        title: `Core/${story}`,
        importPath: `./stories/${story}.stories.tsx`,
      })),
    });
    expect(files).toEqual([
      'apps/storybook/stories/Chat.stories.tsx',
      'apps/storybook/stories/ChatDictation.stories.tsx',
      'packages/core/src/Chat/ChatDictationButton.tsx',
    ]);
  });

  it('falls back to stories that reference a source component with no owned title', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-rtl-usage-'));
    temporaryDirectories.push(root);
    writeFixture(
      root,
      'packages/core/src/FieldStatus/FieldStatus.tsx',
      'export function FieldStatus() { return null; }\n',
    );
    writeFixture(
      root,
      'apps/storybook/stories/TextInput.stories.tsx',
      'import {FieldStatus} from "@astryxdesign/core/FieldStatus";\n',
    );
    expect(
      evidenceFilesForDeclaration({
        declaration: {component: 'core/FieldStatus', reason: 'reviewed'},
        projectRoot: root,
        sourceComponents: ['core/FieldStatus'],
        storyEntries: [
          {
            id: 'core-textinput--default',
            type: 'story',
            title: 'Core/TextInput',
            importPath: './stories/TextInput.stories.tsx',
          },
        ],
      }),
    ).toEqual([
      'apps/storybook/stories/TextInput.stories.tsx',
      'packages/core/src/FieldStatus/FieldStatus.tsx',
    ]);
  });

  it('tracks an exact story-only surface without inventing source evidence', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-rtl-story-'));
    temporaryDirectories.push(root);
    writeFixture(
      root,
      'apps/storybook/stories/useClipboard.stories.tsx',
      "export default {title: 'Core/Hooks/useClipboard'};\n",
    );
    expect(
      evidenceFilesForDeclaration({
        declaration: {
          component: 'core/hooks-useclipboard',
          reason: 'reviewed',
        },
        projectRoot: root,
        sourceComponents: [],
        storyEntries: [
          {
            id: 'core-hooks-useclipboard--default',
            type: 'story',
            title: 'Core/Hooks/useClipboard',
            importPath: './stories/useClipboard.stories.tsx',
          },
        ],
      }),
    ).toEqual(['apps/storybook/stories/useClipboard.stories.tsx']);
  });
});

describe('CI wiring', () => {
  it("checks N/A evidence in Storybook's required build command", () => {
    const storybookPackage = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'apps/storybook/package.json'),
        'utf8',
      ),
    );
    expect(storybookPackage.scripts.build).toContain(
      'node rtl-audit/verify-na-evidence.mjs',
    );
  });
});

describe('validateVerifiedNaRegistry', () => {
  it('rejects missing evidence, empty reasons, and duplicate components', () => {
    const errors = validateVerifiedNaRegistry([
      {component: 'core/Text', reason: 'reviewed'},
      {
        component: 'core/text',
        reason: '',
        evidence: {
          'packages/core/src/Text/Text.tsx': `sha256:${'a'.repeat(64)}`,
        },
      },
      {
        component: 'lab/Foo',
        reason: 'reviewed',
        evidence: {'../outside.ts': 'not-a-digest'},
      },
    ]);
    expect(errors).toEqual([
      'core/Text: evidence manifest is required',
      'core/text: duplicate declaration',
      'core/text: reason must be non-empty',
      'lab/Foo: invalid evidence path ../outside.ts',
      'lab/Foo: invalid evidence digest for ../outside.ts',
    ]);
  });
});

describe('buildAuditedComponentRoster', () => {
  it('uses an umbrella Storybook surface without adding an unknown duplicate', () => {
    expect(
      buildAuditedComponentRoster({
        sourceComponents: ['core/ChatComposer', 'core/ChatMessage'],
        storyComponents: ['core/chat', 'core/chatcomposer'],
        filters: ['chat'],
      }),
    ).toEqual(['core/chat']);
  });

  it('retains an unknown entry when neither source nor stories match', () => {
    expect(
      buildAuditedComponentRoster({
        sourceComponents: ['core/Button'],
        storyComponents: ['core/button'],
        filters: ['missing'],
      }),
    ).toEqual(['unknown/missing']);
  });
});
