// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Capability manifest — self-describing CLI surface for agents.
 *
 * `astryx --json` (and `astryx manifest --json`) emit a structured manifest that
 * lets an AI agent drive the entire CLI WITHOUT scraping `--help` text. It is
 * to the CLI what an OpenAPI spec is to an HTTP API.
 *
 * Most of the manifest is DERIVED from Commander metadata (program.commands,
 * cmd.options, cmd.registeredArguments, cmd.description()) so it cannot drift
 * out of sync with the real command definitions. The two pieces Commander does
 * not know about — whether a command supports `--json`, and which response
 * `type` discriminators it can emit — are layered on from:
 *
 *   - JSON_SUPPORTED  (the allowlist in index.mjs), and
 *   - RESPONSE_TYPES  (the declarative map below).
 *
 * A drift-guard test (manifest.test.mjs) asserts every registered command
 * appears in the manifest and every JSON-supported command has a response-type
 * entry, so adding a command without describing it fails CI.
 *
 * @input  a configured Commander `program` + the JSON_SUPPORTED allowlist
 * @output a `{ name, version, globalOptions, commands, responseTypes }` object
 * @position consumed by the bare `astryx --json` action and the `manifest` command
 */

import {API_VERSION} from './json.mjs';

/**
 * Response `type` discriminators each fully-qualified command can emit in
 * `--json` mode. Keyed by the same name Commander reports (parent + leaf,
 * space-joined), e.g. `theme build`. Commander has no knowledge of these —
 * they come from each command's `jsonOut(...)` call sites — so we keep them
 * here, close to the JSON_SUPPORTED allowlist, and guard them with a test.
 *
 * @type {Record<string, string[]>}
 */
export const RESPONSE_TYPES = {
  component: [
    'component.list',
    'component.brief',
    'component.full',
    'component.detail',
    'component.detail.props',
    'component.detail.source',
    'component.detail.showcase',
    'component.detail.blocks',
  ],
  docs: ['docs.list', 'docs.detail', 'docs.detail.section'],
  discover: ['discover.list', 'discover.detail', 'discover.detail.doc', 'discover.search'],
  search: ['search'],
  swizzle: ['swizzle.list', 'swizzle.copy'],
  template: [
    'template.list',
    'template.show',
    'template.skeleton',
    'template.copy',
    'template.get',
  ],
  hook: ['hook.list', 'hook.brief', 'hook.full', 'hook.detail', 'hook.detail.params'],
  'theme build': ['theme.build'],
  upgrade: ['upgrade.list', 'upgrade.status', 'upgrade.run'],
  'gap-report': ['gap-report.categories', 'gap-report.dryRun', 'gap-report.file'],
  manifest: ['manifest'],
  doctor: ['doctor'],
};

/**
 * Example invocations per fully-qualified command. Optional, agent-facing.
 * @type {Record<string, string[]>}
 */
const EXAMPLES = {
  component: ['astryx component', 'astryx component XDSButton', 'astryx component XDSButton --props --json'],
  docs: ['astryx docs', 'astryx docs spacing --json'],
  discover: ['astryx discover --json'],
  search: ['astryx search modal --json', 'astryx search button --type component --json'],
  swizzle: ['astryx swizzle XDSButton'],
  template: ['astryx template --json', 'astryx template dashboard ./src/app'],
  hook: ['astryx hook', 'astryx hook useToggle --json'],
  'theme build': ['astryx theme build ./src/themes/ocean.ts --out ./dist/ocean.css'],
  upgrade: ['astryx upgrade --json'],
  manifest: ['astryx manifest --json', 'astryx --json'],
  doctor: ['astryx doctor', 'astryx doctor --json'],
  init: ['astryx init'],
};

/**
 * Map a Commander Option to a flag descriptor. Derives type from whether the
 * option takes a value (boolean vs string), surfaces `choices` and `default`.
 *
 * @param {import('commander').Option} opt
 * @returns {{flag: string, description: string, type: string, choices?: string[], default?: unknown, negate?: boolean}}
 */
function describeOption(opt) {
  const o = /** @type {any} */ (opt);
  const takesValue = o.required || o.optional;
  /** @type {any} */
  const d = {
    flag: o.flags,
    description: o.description || '',
    type: takesValue ? 'string' : 'boolean',
  };
  if (Array.isArray(o.argChoices) && o.argChoices.length > 0) {
    d.choices = [...o.argChoices];
    d.type = 'enum';
  }
  if (o.defaultValue !== undefined) d.default = o.defaultValue;
  // `--no-foo` style negation flags
  if (o.negate) d.negate = true;
  return d;
}

/**
 * Map a Commander positional argument to an arg descriptor.
 * @param {import('commander').Argument} arg
 * @returns {{name: string, required: boolean, variadic: boolean, description: string}}
 */
function describeArgument(arg) {
  const a = /** @type {any} */ (arg);
  return {
    name: a.name(),
    required: a.required === true,
    variadic: a.variadic === true,
    description: a.description || '',
  };
}

/**
 * Compute the fully-qualified command name relative to the root program,
 * e.g. `theme build`. The root program itself maps to ''.
 * @param {import('commander').Command} cmd
 * @param {import('commander').Command} root
 * @returns {string}
 */
function fullName(cmd, root) {
  const parts = [];
  /** @type {import('commander').Command | null} */
  let c = cmd;
  while (c && c !== root) {
    parts.unshift(c.name());
    c = c.parent;
  }
  return parts.join(' ');
}

/**
 * Recursively describe a Commander command and its subcommands.
 *
 * @param {import('commander').Command} cmd
 * @param {import('commander').Command} root
 * @param {Set<string>} jsonSupported  fully-qualified names that support --json
 * @returns {object | null}  null for hidden/internal commands
 */
function describeCommand(cmd, root, jsonSupported) {
  const name = fullName(cmd, root);
  // Skip the auto-generated help command and any hidden/internal commands
  // (e.g. the postinstall shim) — agents never invoke these directly.
  // `_hidden` is a Commander internal not present on its public types.
  if (!name || /** @type {any} */ (cmd)._hidden || name === 'help') return null;

  const subcommands = /** @type {object[]} */ ((cmd.commands || [])
    .map((sub) => describeCommand(sub, root, jsonSupported))
    .filter(Boolean));

  // `registeredArguments` is Commander 12's public-ish accessor; `_args` is the
  // older internal. Cast through any to read whichever exists.
  const args =
    /** @type {any[]} */ (/** @type {any} */ (cmd).registeredArguments || /** @type {any} */ (cmd)._args || []);

  /** @type {any} */
  const entry = {
    name,
    description: cmd.description() || '',
    arguments: args.map(describeArgument),
    options: (cmd.options || []).map(describeOption),
    json: jsonSupported.has(name),
  };

  const aliases = cmd.aliases ? cmd.aliases() : [];
  if (aliases && aliases.length > 0) entry.aliases = [...aliases];

  // Response types this command can emit in --json mode (only meaningful for
  // JSON-supported leaves). Subcommand groups (e.g. bare `theme`) have none.
  if (RESPONSE_TYPES[name]) entry.responseTypes = [...RESPONSE_TYPES[name]];

  if (EXAMPLES[name]) entry.examples = [...EXAMPLES[name]];

  if (subcommands.length > 0) entry.subcommands = subcommands;

  return entry;
}

/**
 * Describe the global options declared on the root program (--json, --lang,
 * --detail, --zh, --dense, --version). Documented once at top level so each
 * command entry doesn't repeat them.
 *
 * @param {import('commander').Command} program
 * @returns {Array<object>}
 */
function describeGlobalOptions(program) {
  const opts = (program.options || []).map(describeOption);
  // Commander registers a built-in --version flag; if for some reason it
  // isn't present in program.options, surface it so the manifest is complete.
  if (!opts.some((o) => /(^|[\s,])--version\b/.test(o.flag))) {
    opts.push({
      flag: '-V, --version',
      description: 'Output the version number',
      type: 'boolean',
    });
  }
  return opts;
}

/**
 * Build the full capability manifest from a configured Commander program.
 *
 * @param {import('commander').Command} program  the root program
 * @param {object} [opts]
 * @param {Set<string>} [opts.jsonSupported]  the JSON_SUPPORTED allowlist
 * @param {string} [opts.version]  CLI version (defaults to program.version())
 * @returns {object}  the manifest `data` payload (sans envelope)
 */
export function buildManifest(program, opts = {}) {
  const jsonSupported = opts.jsonSupported || new Set();
  const version = opts.version || /** @type {any} */ (program)._version || '';

  const commands = /** @type {any[]} */ ((program.commands || [])
    .map((cmd) => describeCommand(cmd, program, jsonSupported))
    .filter(Boolean))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    name: 'astryx',
    version,
    apiVersion: API_VERSION,
    description: program.description() || '',
    globalOptions: describeGlobalOptions(program),
    commands,
    jsonSupported: [...jsonSupported].sort(),
    // Flat index of every response `type` discriminator the CLI can emit,
    // keyed by command — lets an agent know what to expect back per call.
    responseTypes: Object.fromEntries(
      Object.entries(RESPONSE_TYPES).map(([k, v]) => [k, [...v]]),
    ),
  };
}
