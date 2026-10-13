// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file One isolated in-process Astryx CLI invocation.
 *
 * Builds a fresh Commander program, preserves the binary's JSON and error
 * boundaries, and restores every process-wide value it temporarily changes.
 * Calls are single-flight because cwd, argv, streams, and exit handling are
 * process-wide even though package resolution itself is async-local.
 *
 * @input CLI arguments, caller working directory, and output streams.
 * @output The exact CLI exit status after one complete invocation.
 * @position clients/cli — shared execution boundary for the binary host API.
 */

import * as fs from 'node:fs';
import {format} from 'node:util';
import {handleCommanderError} from './lib/json-shim.mjs';
import {
  isJsonMode,
  setJsonMode,
  toErrorEnvelope,
} from '../../foundation/response/json.mjs';
import * as debug from '../../foundation/debug/index.mjs';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
);

let running = false;

class ExitSignal extends Error {
  /** @param {number} code */
  constructor(code) {
    super(`process.exit(${code})`);
    this.name = 'ExitSignal';
    this.code = code;
  }
}

/** @param {unknown} chunk */
function textOf(chunk) {
  if (typeof chunk === 'string') return chunk;
  if (chunk instanceof Uint8Array) return Buffer.from(chunk).toString();
  return String(chunk);
}

/**
 * Run one complete CLI invocation without installing the binary's permanent
 * uncaught-error handlers or leaving caller process state behind.
 *
 * @param {readonly string[]} argv arguments after `astryx`
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {{write(chunk: string): unknown}} [options.stdout]
 * @param {{write(chunk: string): unknown}} [options.stderr]
 * @returns {Promise<number>}
 */
export async function runCliInProcess(
  argv,
  {cwd = process.cwd(), stdout = process.stdout, stderr = process.stderr} = {},
) {
  if (running) {
    throw new Error(
      'astryx: another in-process CLI invocation is already running.',
    );
  }
  running = true;

  // Importing the program starts a provisional recorder for binary callers.
  // Replace it with one whose argv belongs to this invocation before patching
  // streams, otherwise resetRecorder would restore over our own patches.
  debug.resetRecorder();

  const original = {
    argv: process.argv,
    cwd: process.cwd(),
    exit: process.exit,
    exitCode: process.exitCode,
    stdoutWrite: process.stdout.write,
    stderrWrite: process.stderr.write,
    log: console.log,
    error: console.error,
    jsonMode: isJsonMode(),
    hadJsonHandled: Object.hasOwn(process, '__xdsJsonHandled'),
    jsonHandled: process.__xdsJsonHandled,
  };

  /** @param {unknown} chunk */
  const writeStdout = chunk => {
    const text = textOf(chunk);
    if (stdout === process.stdout) {
      original.stdoutWrite.call(process.stdout, text);
    } else {
      stdout.write(text);
    }
  };
  /** @param {unknown} chunk */
  const writeStderr = chunk => {
    const text = textOf(chunk);
    if (stderr === process.stderr) {
      original.stderrWrite.call(process.stderr, text);
    } else {
      stderr.write(text);
    }
  };

  let status = 0;
  /** @param {unknown} error */
  const handleFatal = error => {
    debug.setOutcome('fatal', {exitCode: 1, error});
    if (isJsonMode() || argv.includes('--json')) {
      if (!process.__xdsJsonHandled) {
        process.__xdsJsonHandled = true;
        writeStdout(`${JSON.stringify(toErrorEnvelope(error), null, 2)}\n`);
      }
    } else {
      writeStderr(
        `${error instanceof Error ? error.stack || error.message : String(error)}\n`,
      );
    }
    status = 1;
  };

  try {
    console.log = (...args) => writeStdout(`${format(...args)}\n`);
    console.error = (...args) => writeStderr(`${format(...args)}\n`);
    process.stdout.write = chunk => {
      writeStdout(chunk);
      return true;
    };
    process.stderr.write = chunk => {
      writeStderr(chunk);
      return true;
    };
    process.exit = code => {
      throw new ExitSignal(Number(code) || 0);
    };

    setJsonMode(false);
    process.exitCode = 0;
    process.__xdsJsonHandled = false;
    process.argv = [process.execPath, 'astryx', ...argv];
    process.chdir(cwd);

    // index.mjs keeps the binary's eager singleton for compatibility and starts
    // a provisional recorder at module evaluation. Load it only after this call
    // starts, then replace that recorder with this invocation's exact argv.
    const {createProgram, handleVersionJsonPreflight, loadProjectDebugHandler} =
      await import('./index.mjs');
    debug.resetRecorder();
    debug.begin({argv: [...argv], cliVersion: pkg.version});

    const program = await createProgram();
    program.exitOverride();
    await loadProjectDebugHandler();
    handleVersionJsonPreflight([...argv]);
    await program.parseAsync([process.execPath, 'astryx', ...argv]);
    if (process.exitCode) status = Number(process.exitCode) || 0;
  } catch (error) {
    if (error instanceof ExitSignal) {
      status = error.code;
    } else {
      try {
        if (!handleCommanderError(error)) handleFatal(error);
      } catch (handled) {
        if (handled instanceof ExitSignal) status = handled.code;
        else handleFatal(handled);
      }
    }
  } finally {
    debug.finish({exitCode: status});
    process.chdir(original.cwd);
    process.argv = original.argv;
    process.exit = original.exit;
    process.exitCode = original.exitCode;
    process.stdout.write = original.stdoutWrite;
    process.stderr.write = original.stderrWrite;
    console.log = original.log;
    console.error = original.error;
    setJsonMode(original.jsonMode);
    if (original.hadJsonHandled) {
      process.__xdsJsonHandled = original.jsonHandled;
    } else {
      delete process.__xdsJsonHandled;
    }
    running = false;
  }

  return status;
}
