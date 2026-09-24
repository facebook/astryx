// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const WORKFLOWS = path.join(ROOT, '.github/workflows');

function workflow(name) {
  return fs.readFileSync(path.join(WORKFLOWS, name), 'utf8');
}

describe('PR report and deployment workflow contracts', () => {
  it('publishes canonical CI visual artifacts without taking over capture, comparison, or status', () => {
    const value = workflow('pr-comment.yml');
    expect(value).toContain('name: visual-pr-report');
    expect(value).toContain('run-id: ${{ steps.identity.outputs.run_id }}');
    expect(value).toContain('--head-sha "$HEAD_SHA"');
    expect(value).toContain('--base-sha "$BASE_SHA"');
    expect(value).toContain('--run-attempt "$RUN_ATTEMPT"');
    expect(value).toContain('publish-pr-report.mjs');
    expect(value).toContain('types: [completed]');
    expect(value).not.toMatch(/gate\.mjs (?:check|capture|release)/);
    expect(value).not.toContain('playwright');
    expect(value).not.toContain('createCommitStatus');
  });

  it('serializes early preview and later CI enrichment per PR, not across PRs', () => {
    const value = yaml.parse(workflow('pr-comment.yml'));
    expect(value.on.deployment_status).toBeDefined();
    expect(value.on.workflow_run.types).toEqual(['completed']);
    expect(value.concurrency).toBeUndefined();
    expect(value.jobs['preview-comment'].concurrency.group).toBe(
      'pr-report-${{ needs.resolve-preview.outputs.pr_number }}',
    );
    for (const job of ['comment', 'spec-only-reconcile']) {
      expect(value.jobs[job].concurrency.group).toBe(
        'pr-report-${{ needs.resolve.outputs.pr_number }}',
      );
      expect(value.jobs[job].concurrency['cancel-in-progress']).toBe(false);
    }
    expect(workflow('pr-comment.yml')).toContain(
      'validateAnalysisMetadata(metadata, {',
    );
  });

  it('routes Vercel success directly to a trusted early comment and CI completion to enrichment', () => {
    const value = workflow('pr-comment.yml');
    const jobs = yaml.parse(value).jobs;
    expect(jobs['resolve-preview'].if).toContain(
      "github.event_name == 'deployment_status'",
    );
    expect(jobs['resolve-preview'].if).toContain(
      "github.event.deployment.environment == 'Preview'",
    );
    expect(jobs['resolve-preview'].if).toContain(
      "github.event.deployment.creator.login == 'vercel[bot]'",
    );
    expect(jobs['resolve-preview'].steps[0].with.ref).toBe('main');
    expect(jobs['resolve-preview'].steps[1].with.script).toContain(
      'resolveVercelDeploymentEvent',
    );
    expect(jobs['preview-comment'].needs).toBe('resolve-preview');
    expect(jobs['preview-comment'].steps[1].with.script).toContain(
      'reconcileEarlyPreviewComment',
    );
    expect(jobs.resolve.if).toContain("github.event_name == 'workflow_run'");
    expect(jobs.comment.needs).toBe('resolve');
    expect(jobs.comment.permissions.deployments).toBe('read');
  });

  it('reconciles spec-only comments without creating a preview or extra build', () => {
    const value = workflow('pr-comment.yml');
    const reconcile = value.slice(
      value.indexOf('  spec-only-reconcile:'),
      value.indexOf('  comment:'),
    );
    expect(reconcile).toContain('reconcilePrComment');
    expect(reconcile).toContain('createIfMissing: false');
    expect(reconcile).not.toContain('Setup Node and pnpm');
    expect(value).toContain("needs.resolve.outputs.spec_only != 'true'");
  });

  it('keeps visual checks on their canonical CI Storybook artifact', () => {
    const value = workflow('ci.yml');
    const visual = value.slice(
      value.indexOf('  pr-visual:'),
      value.indexOf('  pr-rtl-shard:'),
    );
    expect(visual).toContain(
      'needs: [build-storybook, check-components, maintenance-request]',
    );
    expect(visual).toContain(
      'name: storybook-${{ needs.build-storybook.outputs.short_hash }}',
    );
    expect(visual).toContain('name: visual-pr-report');
    expect(value).toContain('name: pr-analysis');
    expect(value).not.toContain(
      'storybook_url=https://${REPO_OWNER}.github.io',
    );
    expect(value).not.toContain(
      'name: sandbox-${{ steps.urls.outputs.short_hash }}',
    );
  });

  it('moves both human PR previews to the existing Vercel docsite, not Pages', () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'apps/docsite/vercel.json'), 'utf8'),
    );
    expect(config.buildCommand).toContain(
      'node apps/docsite/scripts/build-previews.mjs',
    );
    expect(config.buildCommand).toContain(
      'pnpm -F @astryxdesign/docsite build',
    );
    const builder = fs.readFileSync(
      path.join(ROOT, 'apps/docsite/scripts/build-previews.mjs'),
      'utf8',
    );
    expect(builder).toContain("deploymentEnv !== 'preview'");
    expect(builder).toContain("'@astryxdesign/storybook', 'build'");
    expect(builder).toContain("'@astryxdesign/sandbox', 'build'");
    const comment = workflow('pr-comment.yml');
    expect(comment).not.toContain('deploy-preview.yml');
    expect(comment).not.toContain('preview-deployment-');
    expect(comment).toContain('deployments: read');
    expect(fs.existsSync(path.join(WORKFLOWS, 'deploy-preview.yml'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(WORKFLOWS, 'redeploy-preview.yml'))).toBe(
      false,
    );
    const publisher = fs.readFileSync(
      path.join(ROOT, '.github/scripts/lib/gh-pages-publisher.mjs'),
      'utf8',
    );
    expect(publisher).not.toContain("command === 'pr-preview'");
    const reconciler = fs.readFileSync(
      path.join(ROOT, '.github/scripts/lib/pr-preview.mjs'),
      'utf8',
    );
    expect(reconciler).toContain('resolveVercelPreview');
    expect(reconciler).toContain('`${previewOrigin}/storybook/`');
    expect(reconciler).toContain('`${previewOrigin}/sandbox/`');
  });

  it('defers full-tree cleanup and retains required visual evidence and stable-site writers', () => {
    const cleanup = yaml.parse(workflow('cleanup-previews.yml'));
    expect(cleanup.on.schedule).toEqual([{cron: '0 6 * * *'}]);
    expect(cleanup.on.workflow_dispatch).toBeDefined();
    expect(cleanup.on.workflow_run).toBeUndefined();
    const stable = workflow('deploy.yml');
    const pages = workflow('pages-deploy.yml');
    expect(stable).toContain(
      'gh-pages-publisher.mjs stable-site --source staged',
    );
    expect(pages).toContain("- 'Deploy'");
    expect(pages).toContain("- 'PR Comment'");
    expect(pages).not.toContain("- 'Re-deploy Preview'");
    expect(pages).toContain(
      "github.event.workflow_run.event == 'workflow_dispatch'",
    );
    expect(pages).toContain('actions/deploy-pages@v5');
    expect(workflow('pr-comment.yml')).toContain(
      'gh-pages-publisher.mjs immutable-path',
    );
    expect(workflow('ci.yml')).toContain(
      'gh-pages-publisher.mjs visual-baseline-manual',
    );
  });

  it('retains the remaining Pages publishers behind the shared publisher', () => {
    const files = [
      '.github/workflows/cleanup-previews.yml',
      '.github/workflows/compact-gh-pages.yml',
      '.github/workflows/vibe-screenshots.yml',
      'internal/vibe-tests/src/deploy-report.ts',
    ];
    const combined = files
      .map(file => fs.readFileSync(path.join(ROOT, file), 'utf8'))
      .join('\n');
    expect(combined).toContain('gh-pages-publisher.mjs');
    expect(combined).not.toContain('git push origin gh-pages');
    expect(combined).not.toContain('ref: gh-pages');
    for (const [file, job] of [
      ['cleanup-previews.yml', 'cleanup'],
      ['compact-gh-pages.yml', 'compact'],
      ['vibe-screenshots.yml', 'deploy-screenshots'],
    ]) {
      const permissions = yaml.parse(workflow(file)).jobs[job].permissions;
      expect(permissions).toMatchObject({actions: 'read', contents: 'write'});
    }
  });
});
