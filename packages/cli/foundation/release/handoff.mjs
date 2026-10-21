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
 * run with `--json` prints none and carries `meta.answeredBy` instead. After a
 * successful command, the copy that started the run prints any update notice
 * (notices.mjs); a global copy also starts the daily update check, which
 * installs nothing (global-state.mjs).
 *
 * @input  the running copy, argv, the working folder
 * @output returns when this copy answers; otherwise never returns
 * @position foundation/release — called once by clients/cli/bin/astryx.mjs.
 */

import {spawn} from 'node:child_process';
import {writeSync} from 'node:fs';
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
  maybeFetchCore,
  maybeKeepAgentText,
  maybeStartCheck,
} from './global-state.mjs';
import {recordRunChoice} from './run-context.mjs';
import {noticeLines} from './notices.mjs';
import {cliDoor, runWithCliDoor} from '../env/cli-command.mjs';

/** Where each release's notes are published. */

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
  console.error(progressText(event, version));
}

/**
 * The text of {@link progressLine}.
 * @param {'install' | 'wait'} event
 * @param {string} version
 * @returns {string}
 */
export function progressText(event, version) {
  return event === 'install'
    ? `astryx: installing CLI release ${version} into the per-user cache (once)...`
    : `astryx: waiting for another run to finish installing CLI release ${version}...`;
}

/**
 * The warning a run prints, in text mode, when the release that matches the
 * project's Core cannot be obtained and the copy that answered before global
 * mode answers instead (spec AST-081 FR2).
 * @param {string} wanted the matched release, or the range it was read from
 * @param {string} reason why it cannot be obtained
 * @param {string} answering the version that answers instead
 * @returns {string}
 */
export function fallbackLine(wanted, reason, answering) {
  return `astryx: could not get Astryx ${wanted} to match this project's Core (${reason}); answering with CLI ${answering} instead`;
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
      maybeStartCheck();
    } catch {
      // A check that cannot start never fails a run.
    }
    try {
      // The global copy keeps the computer-level agent text on its own
      // release's text, so it follows each upgrade of the copy (FR8).
      maybeKeepAgentText({release: self});
    } catch {
      // Nor does the agent text.
    }
    // And its own Core, so component reads work offline outside a project
    // after one online run (FR3). Started as the run ends, so it never takes
    // the install lock from this run's own Core read, nor holds anything the
    // command's caller waits on while the command runs.
    process.once('exit', () => {
      try {
        maybeFetchCore({release: self, cacheDir});
      } catch {
        // Nor does the Core download.
      }
    });
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

  if (choice.unavailable && choice.copy === 'project') {
    failUnavailable(
      `This project's CLI ${choice.version} could not be started: ${choice.unavailable}. Reinstall the project's dependencies.`,
      json,
    );
  }

  // A host's door holds only inside the call that set it; notices print as
  // the process exits, outside it, so the door this run started under is
  // kept and set again for them (FR5).
  const door = cliDoor();
  /** FR10: after a successful command, at most once a day per notice. */
  const notify = () => {
    const print = () => {
      for (const line of noticeLines({
        cwd: process.cwd(),
        self,
        choice: computer ? {...choice, inProject: false} : choice,
        json,
        cacheDir,
      })) {
        // Synchronous: the process is exiting.
        writeSync(2, `${line}\n`);
      }
    };
    try {
      if (door) runWithCliDoor(door, print);
      else print();
    } catch {
      // A notice never fails a run.
    }
  };
  /**
   * The matched release cannot be obtained: the copy that started the run
   * answers instead, as before global mode, announced (FR2).
   * @param {string} reason
   * @returns {Promise<void>}
   */
  const fallBack = async reason => {
    recordRunChoice({
      ...choice,
      copy: 'fallback',
      answer: 'self',
      version: self.version,
      bin: null,
      coreVersion: null,
      unavailable: null,
    });
    if (!json) {
      console.error(fallbackLine(choice.version, reason, self.version));
    }
    process.once('exit', code => {
      if (code === 0) notify();
    });
  };

  if (choice.unavailable) {
    await fallBack(choice.unavailable);
    return;
  }

  if (choice.answer === 'self') {
    recordRunChoice(choice);
    // A project with no CLI of its own is answered as released, with no
    // line; a hint after the command, once a day, says how to match it.
    if (!json && (choice.copy === 'matched' || choice.copy === 'carried'))
      console.error(whoAnsweredLine(choice, computer));
    process.once('exit', code => {
      if (code === 0) notify();
    });
    return;
  }

  let bin = choice.bin;
  if (!bin) {
    const release = ensureRelease(choice.version, {
      cacheDir,
      onProgress: json ? undefined : progressLine,
    });
    if (!('bin' in release)) {
      await fallBack(release.reason);
      return;
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

  await handOff(bin, argv, choice, json, notify);
}

/**
 * How long a hand-off waits after an interrupt before passing it on to a CLI
 * that is still running. An interrupt sent to the whole process group (a
 * terminal's Ctrl-C, a process manager) already reached that CLI, and one that
 * stops within this time is never interrupted twice; one sent to this process
 * alone (an agent's `kill('SIGINT')`) stops the run once it is passed on.
 */
export const INTERRUPT_GRACE_MS = 5000;

/**
 * Run `bin` as this run and end with its exit status.
 * @param {string} bin
 * @param {string[]} argv
 * @param {import('./choose.mjs').ReleaseChoice} choice
 * @param {boolean} json
 * @param {() => void} [notify] prints update notices after a successful run
 * @returns {Promise<never>}
 */
function handOff(bin, argv, choice, json, notify = () => {}) {
  return new Promise(() => {
    const child = spawn(process.execPath, [bin, ...argv], {
      stdio: 'inherit',
      windowsHide: false,
    });
    /** @param {NodeJS.Signals} signal */
    const forward = signal => {
      try {
        child.kill(signal);
      } catch {
        // The child is already gone.
      }
    };
    const running = () => child.exitCode === null && child.signalCode === null;
    // An interrupt is passed on only to a CLI still running after the grace
    // (see INTERRUPT_GRACE_MS): one sent to this process alone then stops the
    // run, and one the whole process group got is not delivered twice to a CLI
    // that stops in time. On Windows, Ctrl-C reaches every process in the
    // console and a forwarded SIGINT would end the child abruptly, so this
    // process only outlives it.
    const onInterrupt = () => {
      if (process.platform === 'win32' || !running()) return;
      setTimeout(() => {
        if (running()) forward('SIGINT');
      }, INTERRUPT_GRACE_MS).unref();
    };
    process.on('SIGINT', onInterrupt);
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
      process.off('SIGINT', onInterrupt);
      process.off('SIGTERM', forward);
      process.off('SIGHUP', forward);
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }
      if (code === 0) notify();
      process.exit(code ?? 1);
    });
  });
}
