// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `debug: event => {}` — the whole feature.
 *
 * A project sets one function in `astryx.config` and receives every command
 * run. That function's parameter is a published contract, so these cover what
 * it promises: the handler is called with a complete, scrubbed event, and a
 * handler that misbehaves can never affect the command that triggered it.
 *
 * @position packages/cli/foundation/debug — behaviour coverage
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {
  begin,
  finish,
  setCommand,
  setArgs,
  setOptions,
  setGlobalOptions,
  setOutcome,
  setEventHandler,
  recordEnvelope,
  recordHelp,
  resetRecorder,
  MAX_CAPTURED_OUTPUT,
} from './recorder.mjs';
import {parseDebugEvent} from '../../authoring/debug/parse.mjs';
import {parseConfig} from '../../authoring/config/parse.mjs';



/** Collect every event a run delivers. */
function collect() {
  /** @type {any[]} */
  const seen = [];
  setEventHandler(e => seen.push(e));
  return seen;
}

beforeEach(() => {
  resetRecorder();
});

afterEach(() => {
  resetRecorder();
});

describe('delivery', () => {
  it('hands each run to the function', () => {
    const seen = collect();
    begin({argv: ['docs', 'tokens']});
    setCommand('docs');
    expect(finish({exitCode: 0})).toBe(true);

    expect(seen).toHaveLength(1);
    expect(seen[0].command).toBe('docs');
  });

  it('does nothing at all when no function is configured', () => {
    begin({argv: ['docs']});
    setCommand('docs');
    expect(finish({exitCode: 0})).toBe(false);
  });

  it('delivers at most once', () => {
    const seen = collect();
    begin({argv: []});
    expect(finish({exitCode: 0})).toBe(true);
    expect(finish({exitCode: 0})).toBe(false);
    expect(seen).toHaveLength(1);
  });

  it('accepts a function registered after the run started', () => {
    // This is the real order: the config is read during the command, not
    // before it, so a handler always arrives mid-flight.
    begin({argv: ['docs']});
    setCommand('docs');
    const seen = collect();
    finish({exitCode: 0});
    expect(seen).toHaveLength(1);
  });

  it('delivers one event per invocation', () => {
    /** @type {any[]} */
    const seen = [];
    for (const name of ['docs', 'component', 'hook']) {
      resetRecorder();
      setEventHandler(e => seen.push(e));
      begin({argv: [name]});
      setCommand(name);
      finish({exitCode: 0});
    }
    expect(seen.map(e => e.command)).toEqual(['docs', 'component', 'hook']);
  });
});

describe('what the event carries', () => {
  it('carries the whole invocation', () => {
    const seen = collect();
    begin({argv: ['theme', 'build', 'x.ts', '--check'], cliVersion: '9.9.9'});
    setCommand('theme build');
    setArgs({file: 'x.ts'});
    setOptions({check: true}, {check: 'cli'});
    setGlobalOptions({json: true, detail: 'full'});
    recordEnvelope('theme.build');
    finish({exitCode: 0});

    const [e] = seen;
    expect(e.command).toBe('theme build');
    expect(e.commandPath).toEqual(['theme', 'build']);
    expect(e.args).toEqual({file: 'x.ts'});
    expect(e.options).toEqual({check: true});
    expect(e.optionSources).toEqual({check: 'cli'});
    expect(e.globalOptions).toEqual({json: true, detail: 'full'});
    expect(e.output.jsonMode).toBe(true);
    expect(e.output.envelopeTypes).toEqual(['theme.build']);
    expect(e.env.cliVersion).toBe('9.9.9');
    expect(e.outcome).toBe('ok');
    expect(typeof e.durationMs).toBe('number');
  });

  it('satisfies the published contract', () => {
    const seen = collect();
    begin({argv: ['docs']});
    setCommand('docs');
    finish({exitCode: 0});
    // Drift-locked to the exported type, so this is the same guarantee a
    // consumer gets from importing DebugEvent.
    expect(() => parseDebugEvent(seen[0])).not.toThrow();
  });

  it('drops an option source outside the published set', () => {
    const seen = collect();
    begin({argv: []});
    setOptions({a: 1, b: 2}, {a: 'cli', b: 'from-the-future'});
    finish({exitCode: 0});
    expect(seen[0].optionSources).toEqual({a: 'cli'});
  });

  it('flags a help invocation', () => {
    const seen = collect();
    begin({argv: []});
    recordHelp();
    finish({exitCode: 0});
    expect(seen[0].output.helpDisplayed).toBe(true);
  });
});

describe('outcomes', () => {
  it('keeps the first terminal outcome', () => {
    const seen = collect();
    begin({argv: []});
    setOutcome('error', {exitCode: 1, code: 'ERR_FIRST'});
    setOutcome('fatal', {exitCode: 70, code: 'ERR_SECOND'});
    finish();
    expect(seen[0].outcome).toBe('error');
    expect(seen[0].error.code).toBe('ERR_FIRST');
  });

  it('captures a thrown error', () => {
    const seen = collect();
    begin({argv: []});
    setOutcome('fatal', {exitCode: 1, error: new TypeError('bad thing')});
    finish();
    expect(seen[0].error.name).toBe('TypeError');
    expect(seen[0].error.message).toBe('bad thing');
  });

  it('infers failure from a non-zero exit', () => {
    const seen = collect();
    begin({argv: []});
    finish({exitCode: 1});
    expect(seen[0].outcome).toBe('error');
  });

  it('marks an exit that bypassed the error path', () => {
    const seen = collect();
    begin({argv: []});
    finish({exitCode: 1}); // no cliError, no setOutcome
    expect(seen[0].error.code).toBe('ERR_UNCLASSIFIED_EXIT');
  });

  it('leaves a clean exit with no error', () => {
    const seen = collect();
    begin({argv: []});
    finish({exitCode: 0});
    expect(seen[0].outcome).toBe('ok');
    expect(seen[0].error).toBe(null);
  });
});

describe('scrubbing', () => {
  it('scrubs by default', () => {
    const seen = collect();
    begin({argv: ['--token=ghp_abcdefghijklmnopqrstuvwxyz01']});
    setOptions({out: 'ghp_abcdefghijklmnopqrstuvwxyz01'});
    finish({exitCode: 0});
    expect(seen[0].redacted).toBe(true);
    expect(JSON.stringify(seen[0])).not.toContain('ghp_abcdef');
  });


  it('clamps an oversized value instead of dropping the run', () => {
    const seen = collect();
    begin({argv: []});
    setCommand('docs');
    setOptions({blob: 'x'.repeat(500_000)});
    finish({exitCode: 0});
    expect(seen[0].command).toBe('docs');
    expect(String(seen[0].options.blob)).toContain('chars]');
  });
});

describe('a broken handler cannot break the CLI', () => {
  it('swallows a handler that throws', () => {
    setEventHandler(() => {
      throw new Error('handler blew up');
    });
    begin({argv: []});
    setCommand('docs');
    expect(() => finish({exitCode: 0})).not.toThrow();
  });

  it('ignores a handler that is not a function', () => {
    setEventHandler(/** @type {any} */ ('not a function'));
    begin({argv: []});
    expect(finish({exitCode: 0})).toBe(false);
  });

  it('cannot corrupt anything by mutating the event it was given', () => {
    /** @type {any[]} */
    const seen = [];
    setEventHandler(e => {
      seen.push(e);
      e.command = 'MUTATED';
    });
    begin({argv: []});
    setCommand('docs');
    finish({exitCode: 0});
    // It got a copy; the sealed record is untouched.
    expect(seen[0].command).toBe('MUTATED');
  });

  it('survives a circular structure in the captured options', () => {
    collect();
    begin({argv: []});
    /** @type {any} */
    const circular = {name: 'loop'};
    circular.self = circular;
    setOptions({circular});
    expect(() => finish({exitCode: 0})).not.toThrow();
  });

  it('is dropped by resetRecorder so it cannot leak between runs', () => {
    const handler = vi.fn();
    setEventHandler(handler);
    resetRecorder();
    begin({argv: []});
    finish({exitCode: 0});
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores lifecycle calls made before begin', () => {
    expect(() => {
      setCommand('docs');
      setArgs({a: 1});
      setOptions({b: 2});
      setOutcome('error', {exitCode: 1});
      recordEnvelope('x');
      recordHelp();
    }).not.toThrow();
  });
});



describe('config: the whole surface is one function', () => {
  it('accepts a function', () => {
    expect(parseConfig({debug: () => {}}).debug).toBeTypeOf('function');
  });

  it.each([
    ['a string', 'nope'],
    ['a number', 42],
    ['an object', {onEvent: () => {}}],
    ['an array', [() => {}]],
    ['null', null],
    ['true', true],
  ])('rejects %s', (_label, value) => {
    expect(() => parseConfig({debug: value})).toThrow(/debug/);
  });

  it('treats a missing debug value as no opt-in', () => {
    expect(parseConfig({}).debug).toBeUndefined();
  });
});

describe('captured output — what the CLI answered', () => {
  // Writes go straight to the streams rather than through console.log,
  // because Vitest replaces console.* with its own collectors and they never
  // reach process.stdout — the very seam the tee sits on. In a real CLI run
  // console.log does bottom out here; the subprocess case at the end of this
  // block proves that path.
  const say = (out = '', err = '') => {
    if (out) process.stdout.write(`${out}\n`);
    if (err) process.stderr.write(`${err}\n`);
  };

  it('captures stdout', () => {
    const seen = collect();
    begin({argv: ['docs']});
    say('the answer');
    finish({exitCode: 0});
    expect(seen[0].output.stdout).toContain('the answer');
  });

  it('captures stderr separately', () => {
    const seen = collect();
    begin({argv: ['docs']});
    say('', 'Error: nope');
    finish({exitCode: 1});
    expect(seen[0].output.stderr).toContain('Error: nope');
    expect(seen[0].output.stdout).toBe('');
  });

  it('records true byte counts', () => {
    const seen = collect();
    begin({argv: []});
    say('12345');
    finish({exitCode: 0});
    // console.log appends a newline.
    expect(seen[0].output.stdoutBytes).toBe(6);
    expect(seen[0].output.truncated).toBe(false);
  });

  it('truncates a huge answer but reports its real size', () => {
    const seen = collect();
    begin({argv: []});
    say('x'.repeat(MAX_CAPTURED_OUTPUT * 2));
    finish({exitCode: 0});

    const {output} = seen[0];
    expect(output.truncated).toBe(true);
    expect(output.stdoutBytes).toBeGreaterThan(MAX_CAPTURED_OUTPUT);
    expect(output.stdout).toContain('truncated');
    expect(output.stdout.length).toBeLessThan(MAX_CAPTURED_OUTPUT + 200);
  });

  it('scrubs captured output like every other value', () => {
    const seen = collect();
    begin({argv: []});
    say('wrote ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA to disk');
    finish({exitCode: 0});
    expect(seen[0].output.stdout).not.toContain('ghp_AAAA');
  });

  it('keeps a long answer intact below the cap, unlike other fields', () => {
    // Ordinary values clamp at ~2KB; an answer is the point of the record, so
    // it only clamps at MAX_CAPTURED_OUTPUT.
    const seen = collect();
    begin({argv: []});
    say('y'.repeat(8000));
    finish({exitCode: 0});
    expect(seen[0].output.stdout.length).toBeGreaterThan(7000);
  });

  it('still lets the output reach the real stream', () => {
    const written = [];
    const original = process.stdout.write;
    // @ts-expect-error - test-only monkeypatch, installed before the tee
    process.stdout.write = chunk => {
      written.push(String(chunk));
      return true;
    };
    try {
      collect();
      begin({argv: []});
      say('visible');
      finish({exitCode: 0});
    } finally {
      process.stdout.write = original;
    }
    expect(written.join('')).toContain('visible');
  });

  it('does not capture what the handler itself prints', () => {
    /** @type {any} */
    let received;
    setEventHandler(e => {
      received = e;
      process.stdout.write('handler noise\n');
    });
    begin({argv: []});
    say('command output');
    finish({exitCode: 0});
    expect(received.output.stdout).toContain('command output');
    expect(received.output.stdout).not.toContain('handler noise');
  });

  it('restores the real writers once the run ends', () => {
    const before = process.stdout.write;
    collect();
    begin({argv: []});
    expect(process.stdout.write).not.toBe(before);
    finish({exitCode: 0});
    expect(process.stdout.write).toBe(before);
  });
});
