// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx upgrade`. The terminal binding of the `upgrade()`
 * function (referenced via `fn`); its args/flags map to that function's params
 * so a converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'upgrade',
  displayName: 'astryx upgrade',
  namespace: 'cli/commands',
  summary:
    'Update your code after upgrading Astryx, and refresh ShadCN-copied components',
  description:
    'Migrates project source from a previous Astryx version to the installed one by ' +
    'running the registered codemods, and refreshes the fully rendered managed ' +
    'agent-docs block when Core or configured integration guidance changes. ' +
    'Dry-run by default. --apply writes codemod and receipt changes, runs hooks, then refreshes agent docs. ' +
    'Anything a post-codemod hook prints goes to stderr, so stdout carries only the result. ' +
    'ShadCN-copied compositions are checked automatically during a normal upgrade, or alone with --registry.',
  fn: 'upgrade',
  options: [
    {
      flag: '--from <version>',
      param: 'options.from',
      description:
        'Previous version before the dependency upgrade; required unless --list or --registry is set. ' +
        'The target is the installed @astryxdesign/core version, or legacy @xds/core when @astryxdesign/core is not installed',
    },
    {
      flag: '--apply',
      param: 'options.apply',
      description: 'Write changes to disk; without it, the run is a dry run',
      default: false,
    },
    {
      flag: '--force',
      param: 'options.force',
      description:
        'Run codemods even if --from is newer than the installed version',
      default: false,
    },
    {
      flag: '--codemod <name>',
      param: 'options.codemod',
      description:
        'Run only the named codemod. Optional codemods run only when named here; a normal run skips them. ' +
        'Also skips the check of ShadCN-copied compositions. An unknown name exits 1 with ERR_UNKNOWN_CODEMOD when the version range has codemods',
    },
    {
      flag: '--skip-codemod <name...>',
      param: 'options.skipCodemod',
      description:
        'Exclude named codemods (repeatable). Re-run past a failed codemod by skipping it.',
    },
    {
      flag: '--integration <package>',
      param: 'options.integration',
      description:
        'Explicit integration specifier (repeatable). Resolved beneath node_modules; absolute paths and `.` or `..` segments are rejected.',
      default: [],
    },
    {
      flag: '--path <dir>',
      param: 'options.path',
      description: 'Source directory to scan',
      default: './src',
    },
    {
      flag: '--install-deps',
      param: 'options.installDeps',
      description:
        'Install jscodeshift when it is missing. Without it, a missing jscodeshift fails the command with ERR_DEP_MISSING',
      default: false,
    },
    {
      flag: '--registry',
      param: 'options.registry',
      description:
        'Only update ShadCN-copied compositions from their install receipts: unchanged files are updated, ' +
        'edits that do not overlap are merged, and conflicts are left untouched; --from is not required. ' +
        'Combining it with --list, --from, --force, --codemod, --skip-codemod, --integration or --install-deps exits 1 with ERR_INVALID_ARGUMENT',
      default: false,
    },
    {
      flag: '--list',
      param: 'options.list',
      description:
        'List available codemods and do nothing else. Every other flag is refused, as is --registry (exit 1)',
      default: false,
    },
  ],
  examples: [
    {label: 'List available codemods', cli: 'astryx upgrade --list --json'},
    {
      label: 'Update ShadCN-copied compositions',
      cli: 'astryx upgrade --registry --apply',
    },
    {label: 'Apply a migration', cli: 'astryx upgrade --from 0.1.0 --apply'},
  ],
  exitCodes: [
    {code: 0, when: 'success, including complete dry-run previews'},
    {
      code: 1,
      when:
        'missing or invalid --from, --registry with --list or a migration flag, a --path escape, ' +
        'no installed @astryxdesign/core (or legacy @xds/core), jscodeshift missing and not installed by --install-deps, ' +
        'an astryx.config that fails validation and that no pending config codemod repairs, ' +
        'an unreadable or invalid protection declaration, a protected file that still requires a codemod change, ' +
        'an unknown codemod, a codemod or post-codemod hook failure, or unresolved registry items',
    },
  ],
  related: ['init', 'doctor'],
  notes: [
    {type: 'heading', level: 3, text: 'Protected files'},
    {
      type: 'prose',
      text:
        'Codemods never write to a file your project marks as generated, vendored, or ignored. ' +
        'upgrade reads these marks from the files on disk, so the answer is the same with any version control, or none. ' +
        'A file is protected when:',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        'a `.gitattributes` file marks it `linguist-generated` or `linguist-vendored`',
        'its leading comment says `@generated`, `@partially-generated`, or `Code generated ... DO NOT EDIT.`',
        'a `.gitignore`, or the `.hgignore` at the project root, excludes it',
        'it is an installed dependency (such as anything in `node_modules`), is inside `.git`, `.hg`, or `.sl`, is a symbolic link, or is outside the project',
      ],
    },
    {
      type: 'prose',
      text:
        'Rules work as they do in Git: a later rule wins, so `linguist-generated=false` or a `!` line in an ignore file ' +
        'returns a file to normal handling. A folder name such as `dist` or `generated` protects nothing by itself. ' +
        'If a protection file cannot be read or parsed, upgrade stops with ERR_CODEMOD_PROTECTION_SOURCE before it writes anything.',
    },
    {
      type: 'code',
      lang: 'text',
      code:
        '# .gitattributes\n' +
        'generated/** linguist-generated=true\n' +
        'vendor/** linguist-vendored=true\n' +
        '\n' +
        '# A later rule returns one authored file to normal handling\n' +
        'generated/hand-authored.ts linguist-generated=false',
    },
    {
      type: 'prose',
      text:
        'When a codemod would change a protected file, upgrade makes the change only in memory and leaves the file as it is. ' +
        'The rest of the upgrade goes ahead. With --apply, your other files are written, then upgrade runs the ' +
        '`hooks.postCodemod` commands from astryx.config (see `astryx docs authoring config`) and checks the protected ' +
        'files again. If one still needs the change, the run is incomplete: it exits 1, prints ' +
        'ERR_CODEMOD_PROTECTED with each file and the rule that protects it, and does not refresh the agent docs. ' +
        'Regenerate or edit those files, then run the same upgrade again. A dry run reports the same files and writes nothing.',
    },
    {
      type: 'prose',
      text:
        'With --json, the receipt says `complete: false` and `errorCode: "ERR_CODEMOD_PROTECTED"`. `modifiedFiles` lists the files ' +
        'upgrade changed (or would change), and `protectedFiles` lists each blocked file with its `reasons`, `declarations` ' +
        '(the rules that protect it), `codemods`, and `commands`. A generated file can name the command that rebuilds it on a ' +
        '`Command:` line in its header, such as `// Command: pnpm run gen:panel`; upgrade prints it as ' +
        '`Regenerate with: <command>` and lists it in `commands`.',
    },
  ],
};
