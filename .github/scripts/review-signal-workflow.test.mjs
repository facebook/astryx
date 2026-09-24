// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const workflow = fs.readFileSync(
  path.join(root, '.github/workflows/review-signal.yml'),
  'utf8',
);

describe('review-signal appearance-only contract', () => {
  it('keeps the embedded privileged script syntactically valid', () => {
    const parsed = YAML.parse(workflow);
    const script = parsed.jobs.flag.steps.find(
      step => step.name === 'Detect signals and route',
    ).with.script;
    expect(
      () =>
        new Function(
          'github',
          'context',
          'core',
          'process',
          'Buffer',
          `return (async () => {\n${script}\n})();`,
        ),
    ).not.toThrow();
  });

  it('loads the dependency-free classifier and trusted base/head source bytes', () => {
    expect(workflow).not.toContain('ref: pr.base.ref');
    expect(workflow).toContain('ref: pr.base.sha');
    expect(workflow).toContain(
      "path: '.github/scripts/lib/classify-visual.js'",
    );
    expect(workflow).toContain('pr.base.repo.full_name');
    expect(workflow).toContain('pr.base.sha');
    expect(workflow).toContain('pr.head.repo.full_name');
    expect(workflow).toContain('pr.head.sha');
    expect(workflow).toContain(
      'sources[file.filename] = {base: baseSource, head: headSource}',
    );
    expect(workflow).toContain('if (coreChange || designReasons.length === 0)');
    expect(workflow).toContain(
      "throw new Error('classify-visual.js must stay dependency-free')",
    );
  });

  it('resolves engineering and design approvals only for the current head', () => {
    expect(workflow).toContain(
      "path: '.github/scripts/review-signal-decision.cjs'",
    );
    expect(workflow).toContain('headSha: pr.head.sha');
    expect(workflow).toContain('codeHighRisk && codeApproved');
    expect(workflow).toContain("'Cleared by code-owner approval.'");
    expect(workflow).toContain(
      "throw new Error('review-signal-decision.cjs must stay dependency-free')",
    );
  });

  it('routes safe-space changes using both current and previous paths', () => {
    expect(workflow).toContain(
      'reviewDecision.classifyReviewSignalPaths(allFiles)',
    );
    expect(workflow).toContain('hasSafeBoundaryRename');
    expect(workflow).toContain(
      "codeReasons.push('safe-space boundary rename')",
    );
    expect(workflow).toContain(
      'const isSafeSpace = reviewDecision.isSafeSpace',
    );
    expect(workflow).not.toContain('!isLab(f.filename)');
  });

  it('anchors approval, changes-requested, and dismissal review events', () => {
    expect(workflow).toContain('types: [submitted, dismissed]');
    expect(workflow).toContain(
      'contains(fromJSON(\'["approved","changes_requested","dismissed"]\'), github.event.review.state)',
    );
  });

  it('limits self-service to a DESIGNOWNER with only the proven Core visual reason', () => {
    expect(workflow).toContain(
      'const appearanceOnly = visualClassification?.appearanceOnly === true',
    );
    expect(workflow).toContain(
      "codeReasons.length === 1 && codeReasons[0] === 'core visual change'",
    );
    expect(workflow).toContain(
      'authorIsDesign && appearanceOnly && onlyCoreVisualChange',
    );
    expect(workflow).toContain('!designOwnerAppearanceSelfServe');
  });

  it('keeps contributors and classifier failures on the engineering gate', () => {
    const communityReason = workflow.indexOf(
      "codeReasons.push('community contribution')",
    );
    const narrowReasonCheck = workflow.indexOf(
      "codeReasons.length === 1 && codeReasons[0] === 'core visual change'",
    );
    expect(communityReason).toBeGreaterThan(-1);
    expect(narrowReasonCheck).toBeGreaterThan(communityReason);
    expect(workflow).toContain('let visualClassification = null');
    expect(workflow).toContain(
      'Content-based visual classification failed closed',
    );
  });
});
