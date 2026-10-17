// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The first thing every run does: choose the release that answers and,
 * when it is not this copy, hand the run to it (spec AST-081 FR2, FR6, FR9).
 *
 * Runs in the bin right after the Node version gate, before the CLI loads
 * the folder's `astryx.config`, its integrations, or its Core. A hand-off
 * starts the chosen CLI with exactly this run's arguments, working folder, and
 * standard streams, adds nothing to its environment, options, or
 * configuration, and ends this process with that CLI's exit status. The
 * chosen copy makes the same choice and finds itself, so a run is handed off
 * at most once.
 *
 * In text mode a run that a copy other than the project's own CLI answers
 * prints one line on standard error naming the CLI and Core that answered; a
 * run with `--json` prints none and carries `meta.answeredBy` instead.
 *
 * @input  the running copy, argv, the working folder
 * @output returns when this copy answers; otherwise never returns
 * @position foundation/release — called once by clients/cli/bin/astryx.mjs.
 */

import {spawn} from 'node:child_process';
import {
  chooseRelease,
  isComputerLevel,
  isGlobalCopy,
  namesWhoAnswered,
  packageRootOf,
  runningCopy,
} from './choose.mjs';
import {ensureRelease, userCacheDir} from './cache.mjs';
import {
  maybeStartCheck,
  readGlobalState,
  updateGlobalState,
} from './global-state.mjs';
import {recordRunChoice} from './run-context.mjs';

/** Where each release's notes are published. */
const RELEASE_NOTES = 'https://github.com/facebook/astryx/releases/tag/v';

/**
 * The who-answered line for a run a copy other than the project's own CLI
 * answers.
 * @param {import('./choose.mjs').ReleaseChoice} choice
 * @param {boolean} [computer] the command acts on the computer, not the folder
 * @returns {string}
 */
export function whoAnsweredLine(choice, computer = false) {
  const core = choice.coreVersion ?? choice.version;
  if (computer) {
    return `astryx: answered by CLI ${choice.version} with Core ${core}, for this computer`;
  }
  return choice.copy === 'matched'
    ? `astryx: answered by CLI ${choice.version} with Core ${core}, the release that matches this project's Core`
    : `astryx: answered by CLI ${choice.version} with Core ${core}, outside a project`;
}

/**
 * The line for a run handed to the project's own CLI.
 * @param {string} projectVersion
 * @param {string} startedIn the version of the copy the run started in
 * @returns {string}
 */
export function handedToProjectLine(projectVersion, startedIn) {
  return `astryx: answered by this project's CLI ${projectVersion}, handed over from CLI ${startedIn}`;
}

/**
 * One line on standard error while a release installs, so a slow download
 * never looks like a hang. Text mode only.
 * @param {'install' | 'wait'} event
 * @param {string} version
 */
export function progressLine(event, version) {
  console.error(
    event === 'install'
      ? `astryx: installing CLI release ${version} into the per-user cache (once)...`
      : `astryx: waiting for another run to finish installing CLI release ${version}...`,
  );
}

/**
 * What to do about a release that is not available.
 * @param {string} reason
 * @returns {string}
 */
function nextStep(reason) {
  return /cannot be written/.test(reason)
    ? "Make that folder writable, or install the project's dependencies."
    : "Install the project's dependencies, or run again when the package registry can be reached.";
}

/**
 * Fail the run before any command starts, in the shape every command fails
 * in: the JSON error envelope on stdout with `--json`, else `Error: …` on
 * standard error. Exit status 1.
 * @param {string} message
 * @param {boolean} json
 * @returns {never}
 */
function failUnavailable(message, json) {
  if (json) {
    process.stdout.write(
      `${JSON.stringify(
        {apiVersion: 1, error: message, code: 'ERR_VERSIONS_UNAVAILABLE'},
        null,
        2,
      )}\n`,
    );
  } else {
    console.error(`Error: ${message}`);
  }
  process.exit(1);
}

/**
 * Print the global copy's pending switch notice once, in text mode.
 * @param {string} cacheDir
 * @param {string} selfVersion the installed copy, which answered before the
 *   first switch
 */
function announceSwitch(cacheDir, selfVersion) {
  const {notice, current} = readGlobalState(cacheDir);
  if (!notice) return;
  if (notice.to) {
    const from = notice.from ?? selfVersion;
    const was = from && from !== notice.to ? ` (was ${from})` : '';
    console.error(
      `astryx: now using ${notice.to}${was}. What changed: ${RELEASE_NOTES}${notice.to}`,
    );
    updateGlobalState({notice: null}, cacheDir);
  } else if (notice.blockedVersion && !notice.announced) {
    console.error(
      `astryx: ${notice.blockedVersion} is out, but ${notice.blockedReason}; staying on ${current ?? 'this release'}.`,
    );
    updateGlobalState({notice: {...notice, announced: true}}, cacheDir);
  }
}

/**
 * Choose who answers and hand off when it is not this copy.
 * @param {{cliRoot: string, argv: string[]}} input argv after `node astryx`
 * @returns {Promise<void>} resolves when this copy answers
 */
export async function startRun({cliRoot, argv}) {
  const json = argv.includes('--json');
  const self = runningCopy(cliRoot);
  const cacheDir = userCacheDir();
  const global = isGlobalCopy(cliRoot, cacheDir);
  if (global) {
    try {
      maybeStartCheck({cacheDir});
    } catch {
      // A check that cannot start never fails a run.
    }
  }

  const computer = isComputerLevel(argv);
  /** @type {import('./choose.mjs').ReleaseChoice} */
  let choice;
  try {
    choice = chooseRelease({
      cwd: process.cwd(),
      self,
      cacheDir,
      computer,
    });
  } catch {
    choice = {
      copy: 'carried',
      answer: 'self',
      version: self.version,
      bin: null,
      coreVersion: null,
      inProject: false,
      unavailable: null,
    };
  }

  if (choice.unavailable) {
    failUnavailable(
      choice.copy === 'project'
        ? `This project's CLI ${choice.version} could not be started: ${choice.unavailable}. Reinstall the project's dependencies.`
        : `This project needs CLI release ${choice.version}, which is not available: ${choice.unavailable}. ${nextStep(choice.unavailable)}`,
      json,
    );
  }

  if (!json && global && !choice.inProject)
    announceSwitch(cacheDir, self.version);

  if (choice.answer === 'self') {
    recordRunChoice(choice);
    if (!json && choice.copy !== 'project')
      console.error(whoAnsweredLine(choice, computer));
    return;
  }

  let bin = choice.bin;
  if (!bin) {
    const release = ensureRelease(choice.version, {
      cacheDir,
      onProgress: json ? undefined : progressLine,
    });
    if (!('bin' in release)) {
      failUnavailable(
        `This project needs CLI release ${choice.version}, which is not available: ${release.reason}. ${nextStep(release.reason)}`,
        json,
      );
    }
    bin = release.bin;
  }

  if (!json) {
    if (choice.copy === 'project') {
      console.error(handedToProjectLine(choice.version, self.version));
    } else if (!namesWhoAnswered(packageRootOf(bin))) {
      console.error(whoAnsweredLine(choice, computer));
    }
  }

  await handOff(bin, argv, choice, json);
}

/**
 * Run `bin` as this run and end with its exit status.
 * @param {string} bin
 * @param {string[]} argv
 * @param {import('./choose.mjs').ReleaseChoice} choice
 * @param {boolean} json
 * @returns {Promise<never>}
 */
function handOff(bin, argv, choice, json) {
  return new Promise(() => {
    const child = spawn(process.execPath, [bin, ...argv], {
      stdio: 'inherit',
      windowsHide: false,
    });
    // The terminal sends Ctrl-C to the whole process group, so the child
    // already has it; this process only has to outlive it.
    const ignore = () => {};
    /** @param {NodeJS.Signals} signal */
    const forward = signal => {
      try {
        child.kill(signal);
      } catch {
        // The child is already gone.
      }
    };
    process.on('SIGINT', ignore);
    process.on('SIGTERM', forward);
    process.on('SIGHUP', forward);
    child.on('error', error => {
      failUnavailable(
        choice.copy === 'project'
          ? `This project's CLI ${choice.version} could not be started: ${error.message}. Reinstall the project's dependencies.`
          : `CLI release ${choice.version} could not be started: ${error.message}.`,
        json,
      );
    });
    child.on('exit', (code, signal) => {
      process.off('SIGINT', ignore);
      process.off('SIGTERM', forward);
      process.off('SIGHUP', forward);
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }
      process.exit(code ?? 1);
    });
  });
}
