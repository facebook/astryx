#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @description Summarizes a full-suite accessibility audit report for the
 *   weekly a11y scan workflow. Reads the JSON report produced by
 *   accessibility-audit.js, writes a markdown summary (used for both the
 *   GitHub step summary and the tracking issue body), and emits step outputs
 *   (status, total_violations, components_audited) so the workflow can decide
 *   whether to open-or-update the tracking issue and whether to fail the job.
 * @input --report <file> --audit-outcome <success|failure> --summary-output <file>
 *   [--github-output <file>]
 * @output Markdown summary file + GitHub Actions step outputs
 *
 * Status semantics:
 *   clean      — report present, audit step succeeded, zero violations
 *   violations — report present, audit step succeeded, violations found
 *   failed     — report present but the audit step exited non-zero (e.g.
 *                --fail-on-new tripped once baseline gating exists)
 *   crashed    — no usable report (script crashed before writing one, or the
 *                report itself records a fatal error)
 */

const fs = require('node:fs');
const {buildA11ySection} = require('./lib/a11y-format');

// GitHub issue bodies max out at 65536 characters — leave headroom for the
// run link and footer the workflow appends after this summary.
const MAX_SUMMARY_CHARS = 60000;

const args = process.argv.slice(2);
const getArg = name => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const reportFile = getArg('report') || 'a11y-weekly-report.json';
const auditOutcome = getArg('audit-outcome') || 'success';
const summaryFile = getArg('summary-output') || 'a11y-weekly-summary.md';
const githubOutputFile = getArg('github-output');

function readReport(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function a11yIntegrity(report) {
  const summary = report?.summary;
  if (!summary || summary.scanStatus !== 'complete') {
    return {ok: false, reason: 'scan did not complete'};
  }
  if (summary.indexStatus !== 'parsed') {
    return {ok: false, reason: 'Storybook index was not parsed'};
  }
  if (
    !Number.isSafeInteger(summary.expectedStories) ||
    summary.expectedStories <= 0
  ) {
    return {ok: false, reason: 'no eligible stories were found'};
  }
  for (const field of [
    'auditedStories',
    'failedStories',
    'resultStories',
    'uniqueResultStories',
  ]) {
    if (!Number.isSafeInteger(summary[field])) {
      return {ok: false, reason: `${field} is missing`};
    }
  }
  if (summary.failedStories !== 0) {
    return {ok: false, reason: `${summary.failedStories} story/stories failed`};
  }
  if (summary.auditedStories !== summary.expectedStories) {
    return {ok: false, reason: 'audited story count does not match expected'};
  }
  if (
    summary.resultStories !== summary.expectedStories ||
    summary.uniqueResultStories !== summary.expectedStories
  ) {
    return {ok: false, reason: 'per-story result integrity mismatch'};
  }
  const seen = new Set();
  let details = 0;
  for (const [componentName, component] of Object.entries(
    report.components || {},
  )) {
    const storyDetails = component.storyDetails;
    if (!Array.isArray(storyDetails)) {
      return {ok: false, reason: `${componentName} has no story details`};
    }
    if (component.storiesAudited !== storyDetails.length) {
      return {ok: false, reason: `${componentName} story count mismatch`};
    }
    for (const story of storyDetails) {
      if (!story?.id || !Array.isArray(story.violations)) {
        return {
          ok: false,
          reason: `${componentName} has malformed story result`,
        };
      }
      if (seen.has(story.id)) {
        return {ok: false, reason: `duplicate story result ${story.id}`};
      }
      seen.add(story.id);
      details++;
    }
  }
  if (
    details !== summary.resultStories ||
    seen.size !== summary.uniqueResultStories
  ) {
    return {ok: false, reason: 'reported story totals do not match details'};
  }
  return {ok: true, reason: 'complete'};
}

function computeStatus(report, outcome) {
  if (!report || report.error) return 'crashed';
  if (!a11yIntegrity(report).ok) return 'crashed';
  if (outcome !== 'success') return 'failed';
  const total = report.summary?.totalViolations ?? 0;
  return total > 0 ? 'violations' : 'clean';
}

function countStoryErrors(report) {
  let errors = 0;
  for (const comp of Object.values(report?.components || {})) {
    for (const storyResult of comp.storyDetails || []) {
      if (storyResult.error) errors++;
    }
  }
  return errors;
}

function buildSummary(report, status) {
  const lines = ['## Weekly full-suite accessibility scan', ''];

  if (status === 'crashed' && (!report || report.error)) {
    lines.push(
      '**Status:** the audit did not produce a usable report — the audit ' +
        'script crashed or the Storybook build was missing. See the workflow ' +
        'run logs for details.',
    );
    if (report?.error) {
      lines.push('', `Reported error: \`${report.error}\``);
    }
    return lines.join('\n') + '\n';
  }

  const componentsAudited = report.summary?.componentsAudited ?? 0;
  const auditedAt = report.summary?.auditedAt || 'unknown';
  const storyErrors = countStoryErrors(report);
  const integrity = a11yIntegrity(report);

  if (status === 'crashed') {
    lines.push(
      '**Status:** the audit did not complete every expected story. Zero ' +
        'violations is only clean when the scan is complete.',
      '',
      `**Reason:** ${integrity.reason}.`,
      `**Coverage:** ${report.summary?.auditedStories ?? 0}/${report.summary?.expectedStories ?? 0} story/stories audited; ${report.summary?.failedStories ?? storyErrors} failed.`,
      '',
    );
    return lines.join('\n') + '\n';
  }

  lines.push(
    `**Scope:** full component library — ${componentsAudited} component(s) audited (${auditedAt}).`,
    '',
  );

  if (status === 'failed') {
    lines.push(
      '**Status:** the audit step exited non-zero — violations exceeded the ' +
        'configured gate (or the run failed after writing the report).',
      '',
    );
  }

  if (storyErrors > 0) {
    lines.push(
      `**Warning:** ${storyErrors} ${storyErrors === 1 ? 'story' : 'stories'} failed to load and could not be audited.`,
      '',
    );
  }

  lines.push(buildA11ySection(report));

  let summary = lines.join('\n');
  if (summary.length > MAX_SUMMARY_CHARS) {
    summary =
      summary.slice(0, MAX_SUMMARY_CHARS) +
      '\n\n_…summary truncated — download the `a11y-weekly-report` artifact for the full report._\n';
  }
  return summary;
}

function writeOutputs(status, report) {
  const outputs = [
    `status=${status}`,
    `total_violations=${report?.summary?.totalViolations ?? 0}`,
    `components_audited=${report?.summary?.componentsAudited ?? 0}`,
  ];
  if (githubOutputFile) {
    fs.appendFileSync(githubOutputFile, outputs.join('\n') + '\n');
  }
  console.log(outputs.join('\n'));
}

const report = readReport(reportFile);
const status = computeStatus(report, auditOutcome);
const summary = buildSummary(report, status);

fs.writeFileSync(summaryFile, summary);
writeOutputs(status, report);
console.log(`Summary written to ${summaryFile} (status: ${status})`);
