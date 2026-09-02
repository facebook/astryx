---
'@astryxdesign/cli': patch
---

[fix] CLI: close the redaction and containment holes left open in the `debug` hook.

Follow-up to #4812. Two independent reviews of that PR left findings that were real but not merge-blocking, plus the residuals they turned up along the way. All of them are here.

**A secret with nothing to identify it by.** `astryx docs <token>` put the token in `args`, the error message and the captured stderr at once: no key to match, no flag in front of it, no recognizable prefix. Randomness is the only signal left, so a high-entropy standalone word is now redacted on its own. The gates around the measurement are what make that usable — hex-only strings are shas, uuids and content hashes rather than credentials; a digit is what separates a random token from a CamelCase identifier; and the threshold scales with length, because Shannon entropy is bounded by log2(length) for a short sample. Measured, the gap is wide: the lowest scoring real token sits at 4.58 bits per character and the highest scoring ordinary string — a branch name — at 4.16. Commit shas, uuids, versions, timestamps, StyleX class names, component and hook names, filenames and relative paths all survive intact, and each is pinned by a test.

Ten more credential formats are recognized outright: GitLab, Stripe, Google API keys, npm and Hugging Face tokens, SendGrid, Twilio, Anthropic-style dashed keys (the plain `sk-` rule stopped at the first dash and left the rest of the key standing), and a PEM private key block however it was line-wrapped.

**The machine's identity.** A path outside home and the project keeps its last two segments, and one of them is often the username: `/mnt/corp/ada/notes.txt`. The username is now removed wherever it appears, whole-word, skipping names too short or too ordinary to replace without mangling help text. Windows paths were never rewritten at all — no leading slash, backslash separators — so on Windows every absolute path in a stack trace survived whole; drive-letter and UNC paths now collapse like posix ones.

**A handler could still reach its own command.** Two ways, both through the process rather than through the recorder. `process.exit` inside an exit listener replaced the code the command returned, which is a logging handler turning a green CI run red; it is inert while the handler runs now, and the attempt is reported on stderr rather than swallowed. Anything the handler writes to stdout is sent to stderr, because stdout belongs to the command and under `--json` it carries exactly one envelope — a handler's `console.log` broke that envelope for whatever was parsing it.

**A config the gate cannot see.** The pre-parse gate loads `astryx.config` only when the file contains the word `debug`, so a project that has not opted in never pays to evaluate its own config. A handler spread in from another module defeats that test, and the runs it costs are the ones nobody notices are missing. Commands that read the config for their own reasons still get their handler; when one of them does, and the gate had declined, the CLI now says so once on stderr. A config with no `debug` key stays silent, which is the case that must not become noise.

**One deliberate narrowing.** The short whole-word sensitive names — `key`, `pwd`, `sig`, `pat`, `pw`, `creds` — now apply only where a name was GIVEN: an object field, a declared option, an explicit `--flag`. They no longer fire on a bare `word=value` found in captured text. Scrubbing 1.1MB of this CLI's own real output found two false positives from the text case, both of them the feature eating the answers it exists to record: every React example the CLI prints contains `<Avatar key={user.id}>`, and `astryx --help` documents its own output format as aligned `key: value` lines. `--key <secret>`, `--key=<secret>` and `{key: secret}` are all still redacted, which is how a value actually reaches the recorder; what is given up is a LOW-entropy secret sitting under a bare `key=` label inside captured output. A high-entropy one is still caught by the entropy rule, and a recognizably-formatted one by its own pattern. The substring list is untouched — nothing ordinary is called `token` or `password`.

Also: the assignment rule's key bound goes from 64 to 128 characters, past any real flag or environment variable name. Scrubbing stays linear — the worst hostile shape is 306ms for 500KB and doubles exactly with input size — and a 32KB captured stream, which is the size that actually ships, takes 1.5ms.

@josephfarina
