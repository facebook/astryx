// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const WORKFLOWS = path.join(ROOT, '.github', 'workflows');

function workflow(name) {
  return fs.readFileSync(path.join(WORKFLOWS, name), 'utf8');
}

describe('PR report and deployment workflow contracts', () => {
  it('publishes canonical CI artifacts without another capture, comparison, or status owner', () => {
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
    expect(value).not.toContain('visual-approved');
    const publisher = fs.readFileSync(
      path.join(ROOT, '.github/scripts/visual-gate/publish-pr-report.mjs'),
      'utf8',
    );
    expect(publisher).not.toMatch(/from ['"].*(?:capture|compare)\.mjs['"]/);
  });

  it('locks PR report resolution before any mutation', () => {
    const value = workflow('pr-comment.yml');
    const [header, jobs] = value.split('\njobs:\n');

    expect(header).toContain(
      'group: pr-report-head-${{ github.event.workflow_run.head_repository.id }}-${{ github.event.workflow_run.head_branch }}',
    );
    expect(header).toContain('cancel-in-progress: false');
    expect(jobs).not.toContain('visual-acceptance-pr-');
    expect(jobs).not.toContain('    concurrency:');
  });

  it('uses the shared metadata validator for exact and legacy PR artifacts', () => {
    const value = workflow('pr-comment.yml');
    const crossCheck = value.slice(
      value.indexOf('      - name: Cross-check artifact identity'),
      value.indexOf('      - name: Prepare canonical visual report'),
    );

    expect(crossCheck).toContain('import {validateAnalysisMetadata}');
    expect(crossCheck).toContain('validateAnalysisMetadata(metadata, {');
    expect(crossCheck).not.toContain('meta.headSha !==');
  });

  it('orders trusted preview publication before comment reconciliation', () => {
    const publisher = workflow('deploy-preview.yml');
    const comment = workflow('pr-comment.yml');

    expect(publisher).toContain('workflow_call:');
    expect(publisher).toContain('source_run_attempt:');
    expect(publisher).toContain('--result preview-deployment.json');
    expect(comment).toContain('uses: ./.github/workflows/deploy-preview.yml');
    expect(comment).toContain('needs: [resolve, deploy-preview]');
    expect(comment).toContain(
      "if: always() && steps.identity.outputs.valid == 'true'",
    );
    expect(comment).toContain('reconcilePrComment');
    expect(comment).not.toContain('const previewAvailable');
  });

  it('keeps spec-only checks lightweight while removing stale links', () => {
    const value = workflow('pr-comment.yml');
    const reconcile = value.slice(
      value.indexOf('  spec-only-reconcile:'),
      value.indexOf('  deploy-preview:'),
    );
    const deploy = value.slice(
      value.indexOf('  deploy-preview:'),
      value.indexOf('  comment:'),
    );

    expect(value).toContain("needs.resolve.outputs.spec_only == 'true'");
    expect(reconcile).toContain('reconcilePrComment');
    expect(reconcile).toContain('createIfMissing: false');
    expect(reconcile).not.toContain('Setup Node and pnpm');
    expect(deploy).toContain("needs.resolve.outputs.spec_only != 'true'");
  });

  it('enforces the main-push stable-site chain through the Actions Pages deployer', () => {
    const stableSite = workflow('deploy.yml');
    const pages = workflow('pages-deploy.yml');
    const stableSiteHeader = stableSite.slice(
      0,
      stableSite.indexOf('\npermissions:'),
    );

    expect(stableSiteHeader).toContain('name: Deploy');
    expect(stableSiteHeader).toContain("branches: ['main']");
    expect(stableSite).toContain(
      'node .github/scripts/gh-pages-publisher.mjs stable-site --source staged',
    );
    expect(pages).toContain("- 'Deploy'");
    expect(pages).toContain('ref: gh-pages');
    expect(pages).toContain('actions/upload-pages-artifact@v5');
    expect(pages).toContain('actions/deploy-pages@v5');
  });

  it('deploys the latest gh-pages snapshot without cancelling an active deployment', () => {
    const pages = workflow('pages-deploy.yml');
    const reusablePreview = workflow('deploy-preview.yml');
    const prComment = workflow('pr-comment.yml');
    const directPublisherNames = fs
      .readdirSync(WORKFLOWS)
      .filter(file => file.endsWith('.yml'))
      .filter(file => file !== 'deploy-preview.yml')
      .map(file => workflow(file))
      .filter(value => value.includes('gh-pages-publisher.mjs'))
      .map(value => value.match(/^name: (.+)$/m)?.[1])
      .filter(Boolean);

    for (const source of directPublisherNames) {
      expect(pages).toContain(`- '${source}'`);
    }
    expect(reusablePreview).toContain('workflow_call:');
    expect(prComment).toContain('uses: ./.github/workflows/deploy-preview.yml');
    expect(pages).toContain("- 'PR Comment'");
    expect(pages).toContain('workflow_dispatch:');
    const deployJob = pages.slice(pages.indexOf('  deploy:'));
    expect(deployJob).toContain('runs-on: ubuntu-latest');
    expect(deployJob).toContain('timeout-minutes: 60');
    expect(deployJob).not.toContain('runs-on: ubuntu-slim');
    expect(pages).toContain('group: github-pages-deployment');
    expect(pages).toContain('cancel-in-progress: false');
    expect(pages).toContain('pages: write');
    expect(pages).toContain('id-token: write');
    expect(pages).toContain('actions/configure-pages@v6');
  });

  it('queues an Actions deployment after the supported manual report publisher', () => {
    const report = fs.readFileSync(
      path.join(ROOT, 'internal/vibe-tests/src/deploy-report.ts'),
      'utf8',
    );
    const publish = report.indexOf('gh-pages-publisher.mjs vibe-report');
    const deploy = report.indexOf(
      'gh workflow run pages-deploy.yml --repo ${shellQuote(repository)} --ref main',
    );

    expect(publish).toBeGreaterThan(-1);
    expect(deploy).toBeGreaterThan(publish);
  });

  it('verifies exact source identity before checking preview artifacts', () => {
    const value = workflow('deploy-preview.yml');
    const resolve = value.indexOf(
      'Confirm trusted source and preview identity',
    );
    const metadata = value.indexOf(
      'Download PR metadata from the exact CI run',
    );
    const crossCheck = value.indexOf('Cross-check artifact identity');

    expect(value).toContain('workflow_call:');
    expect(value).toContain('confirmSourceRunIdentity');
    expect(value).toContain('head_repository_id:');
    expect(value).toContain('base_repository:');
    expect(value).toContain('source_run_attempt:');
    expect(value).not.toContain('listPullRequestsAssociatedWithCommit');
    expect(resolve).toBeGreaterThan(-1);
    expect(resolve).toBeLessThan(metadata);
    expect(metadata).toBeLessThan(crossCheck);
    expect(value).toContain('validateAnalysisMetadata');
    expect(value).toContain('steps.artifact.outputs.ready');
  });

  it('rechecks independent target readiness immediately before publishing', () => {
    const value = workflow('deploy-preview.yml');
    const detect = value.indexOf(
      'Detect independently available preview targets',
    );
    const final = value.indexOf(
      'Confirm preview target immediately before publication',
    );
    const publish = value.indexOf('Publish trusted preview result');
    const finalBlock = value.slice(final, publish);
    const publishBlock = value.slice(publish);

    expect(final).toBeGreaterThan(detect);
    expect(final).toBeLessThan(publish);
    expect(finalBlock).toContain('confirmSourceRunIdentity');
    expect(finalBlock).toContain('identity.draft');
    expect(finalBlock).toContain("'storybook',");
    expect(finalBlock).toContain("'sandbox',");
    expect(publishBlock).toContain(
      "if: always() && steps.final.outputs.ready == 'true'",
    );
    expect(publishBlock).toContain('--result preview-deployment.json');
  });

  it('keeps every remaining gh-pages writer behind the shared publisher', () => {
    const files = [
      '.github/workflows/deploy-preview.yml',
      '.github/workflows/redeploy-preview.yml',
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
    expect(combined).not.toContain('git clone --depth 1 --branch gh-pages');
  });

  it('grants remaining publisher jobs read access to overlapping workflow runs', () => {
    const jobs = [
      [workflow('cleanup-previews.yml'), '  cleanup:'],
      [workflow('compact-gh-pages.yml'), '  compact:'],
      [workflow('vibe-screenshots.yml'), '  deploy-screenshots:'],
    ];
    for (const [value, jobName] of jobs) {
      const job = value.slice(
        value.indexOf(jobName),
        value.indexOf('    steps:', value.indexOf(jobName)),
      );
      expect(job).toContain('actions: read');
      expect(job).toContain('contents: write');
    }
  });

  it('routes previews, cleanup, compaction, and vibe screenshots through the shared publisher', () => {
    const deployPreview = workflow('deploy-preview.yml');
    const redeployPreview = workflow('redeploy-preview.yml');
    const cleanup = workflow('cleanup-previews.yml');
    const compact = workflow('compact-gh-pages.yml');
    const vibe = workflow('vibe-screenshots.yml');

    expect(deployPreview).toContain(
      'node .github/scripts/gh-pages-publisher.mjs "${args[@]}"',
    );
    expect(deployPreview).toContain('--result preview-deployment.json');
    expect(redeployPreview).toContain(
      'node .github/scripts/gh-pages-publisher.mjs "${args[@]}"',
    );
    expect(redeployPreview).toContain('--result preview-deployment.json');
    expect(redeployPreview).toContain('Checkout trusted publisher');
    expect(redeployPreview).toContain('ref: main');
    expect(redeployPreview.indexOf('Checkout trusted publisher')).toBeLessThan(
      redeployPreview.indexOf('--result preview-deployment.json'),
    );
    expect(cleanup).toContain('gh-pages-publisher.mjs cleanup-previews');
    expect(compact).toContain('gh-pages-publisher.mjs compact');
    expect(vibe).toContain('gh-pages-publisher.mjs vibe-screenshots');
    for (const value of [
      deployPreview,
      redeployPreview,
      cleanup,
      compact,
      vibe,
    ]) {
      expect(value).not.toContain('git push origin gh-pages');
      expect(value).not.toContain('ref: gh-pages');
    }
  });
});
