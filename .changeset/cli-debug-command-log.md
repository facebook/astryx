---
'@astryxdesign/cli': patch
---

[feat] CLI: record every command run and hand it to a function you supply.

```js
// astryx.config.mjs
export default {
  debug: event => appendFileSync('runs.ndjson', JSON.stringify(event) + '\n'),
};
```

That is the whole feature. Setting `debug` opts in; the function receives one `DebugEvent` per invocation and decides what happens to it. The CLI stores nothing.

Each event carries the command, its arguments and flags (with their Commander source, so you can tell a typed flag from a default), the outcome, exit code, duration, error code, a coarse environment snapshot including which coding agent invoked the CLI, and — under `output` — everything the command printed to stdout and stderr. That last part is the answer the user actually got, which is what makes a record useful for improving the output rather than just counting invocations. Streams are captured separately with their true byte counts, and truncated past 32KB per stream so a command that prints a whole file does not dominate the record. Coverage is the point: handled errors, parse errors, `--help`, rejected invocations, uncaught throws, and Ctrl-C all report. The event is delivered from a `process.on('exit')` listener because the CLI's error path exits synchronously — anything hooked to normal completion would report successes and almost no failures — and the handler is loaded before parsing, because parse errors and `--help` short-circuit before any hook runs.

`event` is a published contract: `DebugEvent` is exported from `@astryxdesign/cli/debug` with a sealed zod validator, `parseDebugEvent`, drift-locked to the type so the recorder cannot add a field without publishing it. `schemaVersion` is a literal, so widening it turns every consumer's branch into a compile error rather than a silent misread.

The handler runs synchronously at exit — a returned promise is never awaited, so network delivery from inside it will not work; write a file or spawn a detached child. It receives a copy, so a handler that throws, or mutates what it was given, can neither fail the command nor affect anything else. Values are scrubbed before delivery: home paths, email addresses, and credential-shaped strings are replaced, and oversized values clamped.

Hardened against an adversarial chaos run, each finding mutation-tested before its fix landed: a `__proto__` key silently reparenting the record that carried it, one oversized value discarding the whole event, an exit that bypassed `cliError` being indistinguishable from a classified failure, and a signal-terminated run leaving no record at all.

One change reaches beyond this feature: `installJsonShim` now shims commands as they join the command tree rather than in a single walk at startup, so a command registered later can no longer silently fall out of the `--json` contract.

@josephfarina
