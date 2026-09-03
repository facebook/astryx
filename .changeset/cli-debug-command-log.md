---
'@astryxdesign/cli': patch
---

[feat] CLI: record every command run and hand it to a function you supply. (#4812)

```js
// astryx.config.mjs
export default {
  debug: event => appendFileSync('runs.ndjson', JSON.stringify(event) + '\n'),
};
```

That is the whole feature. Setting `debug` opts in; the function receives one `DebugEvent` per invocation and decides what happens to it. The CLI stores nothing.

Each event carries the command, its arguments and flags (with their Commander source, so you can tell a typed flag from a default), the outcome, exit code, duration, error code, a coarse environment snapshot including which coding agent invoked the CLI, and — under `output` — everything the command printed to stdout and stderr. That last part is the answer the user actually got, which is what makes a record useful for improving the output rather than just counting invocations. Streams are captured separately with their true byte counts, and truncated past 32KB per stream so a command that prints a whole file does not dominate the record. Coverage is the point: handled errors, parse errors, `--help`, rejected invocations, uncaught throws, and Ctrl-C all report. The event is delivered from a `process.on('exit')` listener because the CLI's error path exits synchronously — anything hooked to normal completion would report successes and almost no failures — and the handler is loaded before parsing, because parse errors and `--help` short-circuit before any hook runs.

`event` is a published contract: `DebugEvent` is exported from `@astryxdesign/cli/debug` with a sealed zod validator, `parseDebugEvent`, drift-locked to the type so the recorder cannot add a field without publishing it. `schemaVersion` is a literal, so widening it turns every consumer's branch into a compile error rather than a silent misread.

The handler runs synchronously at exit — a returned promise is never awaited, so network delivery from inside it will not work; write a file or spawn a detached child. It receives a copy, so a handler that throws, or mutates what it was given, can neither fail the command nor affect anything else. Follow-up hardening keeps a handler from replacing the command's exit code and routes handler writes away from stdout so a `--json` envelope stays valid. (#5929)

Nothing changes for a project that has not set `debug`. Startup is unmoved: the environment probe is deferred to delivery rather than run in `begin`, because its first `Intl` call initialises ICU and that alone was ~9% of the CLI's startup for everyone. Nor does the config run: `Project.load` evaluates the config module and loads its integrations, which most commands never did, so the file is read as text first and only loaded when the word `debug` appears in it. Measured across eight commands, no command evaluates a config that did not already.

Values are scrubbed before delivery: home paths, absolute paths inside stack frames, email addresses, URL credentials, credential-shaped strings, and the value half of a sensitive assignment wherever it appears — including where an error message, a stack frame and the captured stderr all quote the flag that was rejected. Sensitive names are matched with `-` and `_` stripped, so `--api-key`, `--api_key` and `--apiKey` are one rule; `key`, `pat` and `pw` are matched whole so they do not take `--keyboard` and `--path` with them. `argv` is scrubbed pairwise, so `--token hunter2` loses its value the way `--token=hunter2` does. Oversized values are clamped.

Hardened against three adversarial chaos runs and an independent review, each finding mutation-tested before its fix landed: a `__proto__` key silently reparenting the record that carried it, one oversized value discarding the whole event, an exit that bypassed `cliError` being indistinguishable from a classified failure, a signal-terminated run leaving no record at all, a sensitive `--flag=value` scrubbed in `argv` but written back out in full through the error message and captured stderr that quote it, absolute paths surviving inside stack frames — where nothing puts whitespace in front of them — and taking the machine's username with them, a graceful Ctrl-C recorded as a failure with an exit code the process never returned, `--api-key` and `--token value` reaching a handler intact, and the two startup costs above.

One change reaches beyond this feature: `installJsonShim` now shims commands as they join the command tree rather than in a single walk at startup, so a command registered later can no longer silently fall out of the `--json` contract.

@josephfarina
