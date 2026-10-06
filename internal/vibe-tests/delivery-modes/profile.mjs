// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';

const SCHEMA_VERSION = 1;

export async function loadRunnerProfile({env = process.env} = {}) {
  const inline = env.VIBE_RUNNER_PROFILE_JSON;
  const file = env.VIBE_RUNNER_PROFILE;
  if (!inline && !file) {
    throw new Error(
      'Set VIBE_RUNNER_PROFILE to a local JSON file or VIBE_RUNNER_PROFILE_JSON to inline JSON.',
    );
  }
  let profile;
  try {
    profile = JSON.parse(
      inline ?? (await fs.promises.readFile(path.resolve(file), 'utf8')),
    );
  } catch (error) {
    throw new Error(
      `Could not parse runner profile: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return validateRunnerProfile(profile);
}

export function validateRunnerProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    throw new Error('Runner profile must be a JSON object.');
  }
  if (profile.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Runner profile schemaVersion must be ${SCHEMA_VERSION}.`);
  }
  if (!profile.sandbox || typeof profile.sandbox !== 'object') {
    throw new Error('Runner profile requires sandbox settings.');
  }
  for (const key of ['root', 'projectDir']) {
    if (!isNonEmptyString(profile.sandbox[key])) {
      throw new Error(`Runner profile sandbox.${key} must be a string.`);
    }
  }
  validateCommand(profile.launcher, 'launcher', {allowWrappedArgs: true});
  validateCommand(profile.preflight, 'preflight');
  if (!profile.runners || typeof profile.runners !== 'object') {
    throw new Error('Runner profile requires at least one runner.');
  }
  const entries = Object.entries(profile.runners);
  if (entries.length === 0) {
    throw new Error('Runner profile requires at least one runner.');
  }
  for (const [name, runner] of entries) {
    validateName(name, 'runner');
    validateCommand(runner, `runners.${name}`);
    validateTranscript(runner.transcript, `runners.${name}.transcript`);
    validateAudit(runner.audit, `runners.${name}.audit`);
  }
  if (profile.judge != null) {
    validateCommand(profile.judge, 'judge');
    validateTranscript(profile.judge.transcript, 'judge.transcript');
    if (profile.judge.resultPath != null) {
      validatePath(profile.judge.resultPath, 'judge.resultPath');
    }
    validateAudit(profile.judge.audit, 'judge.audit');
  }
  if (
    profile.browserCommand != null &&
    !isNonEmptyString(profile.browserCommand)
  ) {
    throw new Error('browserCommand must be a non-empty string.');
  }
  return profile;
}

function validateName(name, label) {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
    throw new Error(`${label} name contains unsupported characters: ${name}`);
  }
}

function validateCommand(command, label, {allowWrappedArgs = false} = {}) {
  if (!command || typeof command !== 'object' || Array.isArray(command)) {
    throw new Error(`${label} must be a command object.`);
  }
  if (!isNonEmptyString(command.command)) {
    throw new Error(`${label}.command must be a non-empty string.`);
  }
  if (!Array.isArray(command.args) || !command.args.every(isString)) {
    throw new Error(`${label}.args must be an array of strings.`);
  }
  if (command.stdin != null && !['none', 'prompt'].includes(command.stdin)) {
    throw new Error(`${label}.stdin must be "none" or "prompt".`);
  }
  if (command.env != null) {
    if (
      typeof command.env !== 'object' ||
      Array.isArray(command.env) ||
      !Object.values(command.env).every(isString)
    ) {
      throw new Error(`${label}.env must map names to strings.`);
    }
    if (
      Object.keys(command.env).some(name =>
        name.startsWith('VIBE_RUNNER_PROFILE'),
      )
    ) {
      throw new Error(`${label}.env cannot expose the runner profile.`);
    }
  }
  if (
    command.versionArgs != null &&
    (!Array.isArray(command.versionArgs) ||
      !command.versionArgs.every(isString))
  ) {
    throw new Error(`${label}.versionArgs must be an array of strings.`);
  }
  if (!allowWrappedArgs && command.args.includes('{runnerArgs}')) {
    throw new Error(`${label}.args cannot contain {runnerArgs}.`);
  }
}

function validateTranscript(transcript, label) {
  if (
    !transcript ||
    typeof transcript !== 'object' ||
    Array.isArray(transcript)
  ) {
    throw new Error(`${label} must be an object.`);
  }
  if (transcript.format !== 'jsonl') {
    throw new Error(`${label}.format must be "jsonl".`);
  }
  if (!Array.isArray(transcript.toolCalls)) {
    throw new Error(`${label}.toolCalls must be an array.`);
  }
  for (const [index, rule] of transcript.toolCalls.entries()) {
    if (rule.recordsPath != null) {
      validatePath(
        rule.recordsPath,
        `${label}.toolCalls[${index}].recordsPath`,
      );
    }
    validateMatches(rule.matches, `${label}.toolCalls[${index}].matches`);
    validatePath(rule.commandPath, `${label}.toolCalls[${index}].commandPath`);
  }
  if (transcript.usage != null) {
    if (
      typeof transcript.usage !== 'object' ||
      Array.isArray(transcript.usage)
    ) {
      throw new Error(`${label}.usage must be an object.`);
    }
    validateMatches(transcript.usage.matches, `${label}.usage.matches`);
    validatePath(
      transcript.usage.inputTokensPath,
      `${label}.usage.inputTokensPath`,
    );
    validatePath(
      transcript.usage.outputTokensPath,
      `${label}.usage.outputTokensPath`,
    );
  }
}

function validateMatches(matches, label) {
  if (!Array.isArray(matches)) {
    throw new Error(`${label} must be an array.`);
  }
  for (const [index, match] of matches.entries()) {
    validatePath(match.path, `${label}[${index}].path`);
    const operators = ['equals', 'startsWith', 'exists'].filter(
      operator => operator in match,
    );
    if (operators.length !== 1) {
      throw new Error(`${label}[${index}] requires exactly one operator.`);
    }
    if ('startsWith' in match && typeof match.startsWith !== 'string') {
      throw new Error(`${label}[${index}].startsWith must be a string.`);
    }
    if ('exists' in match && typeof match.exists !== 'boolean') {
      throw new Error(`${label}[${index}].exists must be a boolean.`);
    }
    if (
      'equals' in match &&
      match.equals !== null &&
      !['string', 'number', 'boolean'].includes(typeof match.equals)
    ) {
      throw new Error(`${label}[${index}].equals must be a scalar.`);
    }
  }
}

function validatePath(value, label) {
  if (
    !isNonEmptyString(value) ||
    !value.split('.').every(part => /^[A-Za-z0-9_-]+$/.test(part))
  ) {
    throw new Error(`${label} must be a dotted JSON field path.`);
  }
}

function validateAudit(audit, label) {
  if (audit == null) {
    return;
  }
  if (!audit || typeof audit !== 'object' || Array.isArray(audit)) {
    throw new Error(`${label} must be an object.`);
  }
  if (!Array.isArray(audit.rules ?? [])) {
    throw new Error(`${label}.rules must be an array.`);
  }
  for (const [index, rule] of (audit.rules ?? []).entries()) {
    if (!['stdout', 'stderr', 'combined', 'command'].includes(rule.source)) {
      throw new Error(`${label}.rules[${index}].source is invalid.`);
    }
    if (!['required', 'forbidden'].includes(rule.kind)) {
      throw new Error(`${label}.rules[${index}].kind is invalid.`);
    }
    if (!['strict', 'adjusted'].includes(rule.class)) {
      throw new Error(`${label}.rules[${index}].class is invalid.`);
    }
    if (!isNonEmptyString(rule.label) || !isNonEmptyString(rule.pattern)) {
      throw new Error(
        `${label}.rules[${index}] requires string label and pattern.`,
      );
    }
    try {
      new RegExp(rule.pattern, rule.flags ?? '');
    } catch (error) {
      throw new Error(
        `${label}.rules[${index}] has an invalid pattern: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export function renderCommand(command, values) {
  return {
    command: interpolate(command.command, values),
    args: command.args.flatMap(argument =>
      argument === '{runnerArgs}'
        ? (values.runnerArgs ?? [])
        : [interpolate(argument, values)],
    ),
    cwd: command.cwd ? interpolate(command.cwd, values) : undefined,
    env: Object.fromEntries(
      Object.entries(command.env ?? {}).map(([key, value]) => [
        key,
        interpolate(value, values),
      ]),
    ),
    input: command.stdin === 'prompt' ? values.prompt : undefined,
  };
}

export function wrapCommand(launcher, rendered, values) {
  const launcherValues = {
    ...values,
    runnerCommand: rendered.command,
    runnerArgs: rendered.args,
    runnerCwd: rendered.cwd ?? values.sandboxProject,
  };
  const wrapped = renderCommand(launcher, launcherValues);
  return {
    ...wrapped,
    env: {...rendered.env, ...wrapped.env},
    input: rendered.input,
  };
}

function interpolate(value, values) {
  return value.replaceAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (_, key) => {
    const replacement = values[key];
    if (replacement == null) {
      throw new Error(`Missing profile placeholder value: {${key}}`);
    }
    if (Array.isArray(replacement)) {
      throw new Error(
        `Array placeholder {${key}} must occupy a full argument.`,
      );
    }
    return String(replacement);
  });
}

function isString(value) {
  return typeof value === 'string';
}

function isNonEmptyString(value) {
  return isString(value) && value.length > 0;
}
