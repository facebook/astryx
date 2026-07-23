// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file playground-format.test.ts
 *
 * Coverage for the playground's "Format code" action (issue #2684): the editor
 * had no way to tidy code, so a Prettier-backed formatter is registered with
 * Monaco and surfaced as a toolbar button + Monaco's built-in Format Document
 * (`editor.action.formatDocument`) keybinding.
 *
 * The invariants pinned here:
 *  1. The browser-side Prettier options are the repo's OWN `.prettierrc` — the
 *     playground must not drift into a different house style.
 *  2. `formatPlaygroundCode` applies those options to TSX playground source.
 *  3. The Monaco document-formatting provider replaces the full model range,
 *     and — importantly — stays out of the way when there is nothing to do
 *     (already formatted / empty) or when the source cannot be parsed (the
 *     common case: the user is mid-keystroke with broken syntax).
 *  4. The toolbar button drives Monaco's own `editor.action.formatDocument`
 *     action, which is what the keybinding is bound to — so the button and the
 *     shortcut can never diverge.
 *  5. THE WIRING: `configureMonaco` actually registers the formatter. Without
 *     this, every test above can pass against a feature that is 100% dead to
 *     the user — no provider, so no Shift+Alt+F and nothing for the button to
 *     drive. It is also the only registration seam, so it pins that the guard
 *     de-dupes on the Monaco instance rather than the module (Fast Refresh
 *     re-evaluates the module and would otherwise stack duplicate providers).
 *  6. A user syntax error is swallowed (Monaco already squiggles it), but
 *     Prettier failing to LOAD is reported — otherwise the button is silently
 *     dead for a whole cohort of users and nobody ever finds out.
 *  7. The tooltip advertises the chord Monaco actually bound on this platform
 *     (Ctrl+Shift+I on Linux, Shift+Alt+F elsewhere).
 *
 * NOT covered here: the `<Button>` in PlaygroundClient.tsx itself. The docsite
 * suite is node-env with no jsdom/RTL, and standing that up to render a
 * Monaco-hosting page is disproportionate. Deleting the button would still go
 * green — see the PR description, where this is called out explicitly.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  PLAYGROUND_PRETTIER_OPTIONS,
  createPrettierFormattingProvider,
  formatButtonTooltip,
  formatPlaygroundCode,
  formatShortcutHint,
  isSourceSyntaxError,
  registerPrettierFormatter,
  runFormatAction,
  FORMAT_DOCUMENT_ACTION_ID,
} from '../app/playground/formatCode';
import {configureMonaco} from '../app/playground/monacoSetup';

// The single Prettier config that governs every file in the repo — including
// apps/docsite (`prettier --find-config-path` on PlaygroundClient.tsx resolves
// here). The playground's browser-side options must stay equal to it.
const PRETTIERRC_PATH = path.resolve(__dirname, '../../../../.prettierrc.json');

/** Minimal stand-in for a Monaco text model (getValue + getFullModelRange). */
function fakeModel(value: string) {
  const lines = value.split('\n');
  return {
    getValue: () => value,
    getFullModelRange: () => ({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: lines.length,
      endColumn: lines[lines.length - 1].length + 1,
    }),
  };
}

/**
 * Stand-in for the Monaco runtime object handed to `onMount`. Fresh per call —
 * registration de-dupes on the instance, so a shared one would leak across tests.
 */
function fakeMonaco() {
  return {
    languages: {
      registerDocumentFormattingEditProvider: vi.fn(
        (
          _languages: string | string[],
          _provider: {provideDocumentFormattingEdits: unknown},
        ) => ({dispose: vi.fn()}),
      ),
      typescript: {
        typescriptDefaults: {
          setCompilerOptions: vi.fn(),
          setDiagnosticsOptions: vi.fn(),
          addExtraLib: vi.fn(),
        },
        ScriptTarget: {ESNext: 99},
        ModuleKind: {ESNext: 99},
        JsxEmit: {ReactJSX: 4},
        ModuleResolutionKind: {NodeJs: 2},
      },
    },
  };
}

/** Run the provider against a source string and hand back the edits. */
async function formatVia(
  provider: ReturnType<typeof createPrettierFormattingProvider>,
  source: string,
) {
  return provider.provideDocumentFormattingEdits(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fakeModel(source) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.doUnmock('prettier/standalone');
  vi.resetModules();
});

const MESSY_CODE = [
  'import { Button } from "@astryxdesign/core/Button"',
  'export default function Example(  ) {',
  'const items = [ 1,2,3 ]',
  'return <Button label="Hi" onClick={ (e) => console.log(e, items) } />',
  '}',
].join('\n');

describe('playground format — Prettier options', () => {
  it('uses the repo’s own .prettierrc values', () => {
    const repoConfig = JSON.parse(fs.readFileSync(PRETTIERRC_PATH, 'utf8'));
    expect(PLAYGROUND_PRETTIER_OPTIONS).toEqual(repoConfig);
  });
});

describe('formatPlaygroundCode', () => {
  it('formats messy TSX in the repo’s house style', async () => {
    const formatted = await formatPlaygroundCode(MESSY_CODE);

    // singleQuote
    expect(formatted).toContain("from '@astryxdesign/core/Button'");
    expect(formatted).not.toContain('"@astryxdesign/core/Button"');
    // bracketSpacing: false
    expect(formatted).toContain('import {Button}');
    // arrowParens: avoid
    expect(formatted).toContain('onClick={e =>');
    // semicolons + normalized whitespace
    expect(formatted).toContain('const items = [1, 2, 3];');
    expect(formatted).toContain('export default function Example() {');
    expect(formatted.endsWith('\n')).toBe(true);
  });

  it('is idempotent — formatting formatted code is a no-op', async () => {
    const once = await formatPlaygroundCode(MESSY_CODE);
    expect(once).not.toBe(MESSY_CODE);
    const twice = await formatPlaygroundCode(once);
    expect(twice).toBe(once);
  });

  it('honors bracketSameLine on wrapped JSX', async () => {
    const formatted = await formatPlaygroundCode(
      'export default function E() { return <Button label="a-very-long-label-that-forces-a-wrap" variant="primary" size="md" onClick={() => {}} isDisabled>Click me</Button> }',
    );
    // The props are long enough that Prettier must break them onto their own
    // lines — proving this really wrapped rather than passing through.
    expect(formatted).toMatch(/\n\s+variant="primary"/);
    // bracketSameLine: true — the `>` hugs the last prop instead of sitting
    // alone on the next line (which is what the Prettier default would do).
    // Note it deliberately does NOT apply to self-closing elements.
    expect(formatted).toContain('isDisabled>');
    expect(formatted).not.toMatch(/\n\s*>\n/);
  });

  it('rejects on unparseable source rather than returning junk', async () => {
    await expect(formatPlaygroundCode('const = ??? <')).rejects.toThrow();
  });

  /**
   * The end-to-end guarantee the issue actually asks for: the browser-side
   * (standalone + parser plugins) formatter must produce byte-identical output
   * to the repo's own Prettier — config resolved from disk the same way the
   * `prettier` CLI resolves it for a docsite source file. If the standalone
   * build, the parser choice, or the options ever drift, this fails.
   */
  it('matches the repo’s own Prettier byte-for-byte', async () => {
    const prettier = await import('prettier');
    const repoConfig = await prettier.resolveConfig(
      path.resolve(__dirname, '../app/playground/PlaygroundClient.tsx'),
    );
    expect(repoConfig).not.toBeNull();

    const viaRepoPrettier = await prettier.format(MESSY_CODE, {
      ...repoConfig,
      parser: 'typescript',
    });

    expect(await formatPlaygroundCode(MESSY_CODE)).toBe(viaRepoPrettier);
  });
});

describe('createPrettierFormattingProvider', () => {
  it('replaces the full model range with the formatted source', async () => {
    const provider = createPrettierFormattingProvider();
    const model = fakeModel(MESSY_CODE);

    const edits = await provider.provideDocumentFormattingEdits(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    expect(edits).toHaveLength(1);
    expect(edits![0].range).toEqual(model.getFullModelRange());
    expect(edits![0].text).toBe(await formatPlaygroundCode(MESSY_CODE));
  });

  it('returns no edits when the source is already formatted (no phantom undo step)', async () => {
    const provider = createPrettierFormattingProvider();
    const clean = await formatPlaygroundCode(MESSY_CODE);

    const edits = await provider.provideDocumentFormattingEdits(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fakeModel(clean) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    expect(edits).toEqual([]);
  });

  it('leaves the buffer untouched when the source has a syntax error', async () => {
    const provider = createPrettierFormattingProvider();

    const edits = await provider.provideDocumentFormattingEdits(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fakeModel('export default function Broken( {') as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    expect(edits).toEqual([]);
  });

  it('returns no edits for an empty document', async () => {
    const provider = createPrettierFormattingProvider();

    const edits = await provider.provideDocumentFormattingEdits(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fakeModel('') as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    expect(edits).toEqual([]);
  });

  it('empties a whitespace-only document, exactly as Prettier does to a blank file', async () => {
    // A distinct path from the empty document above: Prettier returns '' here
    // too, but it DIFFERS from the source, so this really does emit an edit and
    // clear the buffer. Pinned so the blanking is a decision, not a surprise.
    const provider = createPrettierFormattingProvider();

    const edits = await formatVia(provider, '   \n\n\t  \n');

    expect(edits).toHaveLength(1);
    expect(edits![0].text).toBe('');
  });
});

describe('registerPrettierFormatter', () => {
  it('registers a document formatting provider for the editor’s language', () => {
    const monaco = fakeMonaco();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerPrettierFormatter(monaco as any);

    const register = monaco.languages.registerDocumentFormattingEditProvider;
    expect(register).toHaveBeenCalledTimes(1);

    const [languages, provider] = register.mock.calls[0];
    // The playground editor is `defaultLanguage="typescript"`.
    expect(languages).toContain('typescript');
    expect(typeof provider.provideDocumentFormattingEdits).toBe('function');
  });

  it('hands back the same disposable rather than registering a second provider', () => {
    // A duplicate registration is not harmless: with two document formatters
    // Monaco stops auto-picking ours and puts the format behind a "select a
    // formatter" choice. The cached handle is what a second caller must get.
    const monaco = fakeMonaco();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const first = registerPrettierFormatter(monaco as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const second = registerPrettierFormatter(monaco as any);

    expect(second).toBe(first);
    expect(
      monaco.languages.registerDocumentFormattingEditProvider,
    ).toHaveBeenCalledTimes(1);
  });
});

describe('runFormatAction', () => {
  it('runs Monaco’s format-document action (the Shift+Alt+F binding)', () => {
    expect(FORMAT_DOCUMENT_ACTION_ID).toBe('editor.action.formatDocument');

    const run = vi.fn(() => Promise.resolve());
    const getAction = vi.fn(() => ({run}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void runFormatAction({getAction} as any);

    expect(getAction).toHaveBeenCalledWith(FORMAT_DOCUMENT_ACTION_ID);
    expect(run).toHaveBeenCalledTimes(1);
  });

  /**
   * The first format downloads Prettier's TypeScript parser (~1MB), so the
   * action is genuinely slow exactly once — and Monaco CANCELS an in-flight
   * format the moment the model or the cursor moves
   * (format.js: `EditorStateCancellationTokenSource(Value | Position)`). A user
   * who gets no feedback clicks into the editor to see if it worked, and that
   * click silently kills the format. So the caller has to be able to show
   * progress, which means waiting on the action rather than firing and
   * forgetting it — this is what lets Button drive it with `clickAction`.
   */
  it('resolves only once the format has finished, so the caller can show progress', async () => {
    const order: string[] = [];
    let finishFormatting!: () => void;
    const run = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finishFormatting = () => {
            order.push('format finished');
            resolve();
          };
        }),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pending = runFormatAction({getAction: () => ({run})} as any);
    expect(pending).toBeInstanceOf(Promise);

    finishFormatting();
    await pending;
    order.push('caller resumed');

    expect(order).toEqual(['format finished', 'caller resumed']);
  });

  /**
   * The caller is Button's `clickAction`, which awaits inside a React
   * `startTransition` with a `try/finally` and no `catch` — so a rejection here
   * would reach an error boundary and take the whole playground down over a
   * failed tidy-up. Report it and resolve. (Real format failures never get this
   * far: the provider already handles them with a console warning + a toast.)
   */
  it('never rejects — a broken action is reported, not thrown at the caller', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const run = vi.fn(() => Promise.reject(new Error('monaco exploded')));

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runFormatAction({getAction: () => ({run})} as any),
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('no-ops when the editor is not mounted', async () => {
    await expect(runFormatAction(null)).resolves.toBeUndefined();
  });

  it('no-ops when the action is unavailable', async () => {
    const getAction = vi.fn(() => null);
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runFormatAction({getAction} as any),
    ).resolves.toBeUndefined();
  });
});

/**
 * THE WIRING. Everything above tests formatCode.ts in isolation, which says
 * nothing about whether the app ever calls it. `configureMonaco` is the single
 * seam between the playground and Monaco (PlaygroundClient's `onMount` calls it
 * and nothing else), so pinning the registration here is what stops the feature
 * from being silently unwired: delete `registerPrettierFormatter` from
 * `configureMonaco` and Shift+Alt+F dies (its precondition is
 * `hasDocumentFormattingProvider`) — these tests go red.
 */
describe('configureMonaco — Prettier formatter wiring', () => {
  it('registers Prettier as Monaco’s document formatter', () => {
    const monaco = fakeMonaco();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureMonaco(monaco as any);

    const register = monaco.languages.registerDocumentFormattingEditProvider;
    expect(register).toHaveBeenCalledTimes(1);

    const [languages, provider] = register.mock.calls[0];
    expect(languages).toContain('typescript');
    expect(typeof provider.provideDocumentFormattingEdits).toBe('function');
  });

  it('still configures the TypeScript service (the formatter doesn’t displace it)', () => {
    const monaco = fakeMonaco();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureMonaco(monaco as any);

    const ts = monaco.languages.typescript.typescriptDefaults;
    expect(ts.setCompilerOptions).toHaveBeenCalledTimes(1);
    expect(ts.addExtraLib).toHaveBeenCalled();
  });

  it('registers once per Monaco instance, even across module re-evaluation', async () => {
    // Monaco is a page-level singleton whose provider registry is NOT reset by
    // Next.js Fast Refresh, but the *module* IS re-evaluated — so a module-level
    // "already registered" flag resets to false and stacks a duplicate provider
    // on every edit in dev. The guard has to live on the Monaco instance.
    //
    // Both calls go through freshly-evaluated modules so the test cannot pass by
    // accident on leftover module state from an earlier test in this file.
    const monaco = fakeMonaco();

    vi.resetModules();
    const first = await import('../app/playground/monacoSetup');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    first.configureMonaco(monaco as any);

    vi.resetModules();
    const second = await import('../app/playground/monacoSetup');
    // Guard the guard: if this ever stops being a real re-evaluation, the test
    // below would silently stop testing anything.
    expect(second.configureMonaco).not.toBe(first.configureMonaco);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    second.configureMonaco(monaco as any);

    expect(
      monaco.languages.registerDocumentFormattingEditProvider,
    ).toHaveBeenCalledTimes(1);
  });

  it('passes the failure handler through to the provider', async () => {
    const monaco = fakeMonaco();
    const onFormatFailure = vi.fn();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureMonaco(monaco as any, {onFormatFailure});

    const [, provider] =
      monaco.languages.registerDocumentFormattingEditProvider.mock.calls[0];

    // Drive the provider the way Monaco would, with Prettier unable to load.
    vi.resetModules();
    vi.doMock('prettier/standalone', () => {
      throw new Error('ChunkLoadError: Loading chunk 42 failed');
    });
    const {createPrettierFormattingProvider: create} =
      await import('../app/playground/formatCode');
    expect(typeof provider.provideDocumentFormattingEdits).toBe('function');

    const wired = create(onFormatFailure);
    await formatVia(wired, MESSY_CODE);
    expect(onFormatFailure).toHaveBeenCalledTimes(1);
  });
});

/**
 * A blanket `catch { return [] }` conflates two very different failures: the
 * user's source has a syntax error (expected, constant, and already flagged by
 * Monaco's red squiggles) versus Prettier itself failing to load (offline, CSP,
 * or a stale chunk hash after a deploy — the button is simply dead and NOTHING
 * tells anyone). Only the first is a non-event.
 */
describe('format failure reporting', () => {
  it('classifies a Prettier parse error as the user’s syntax error', async () => {
    const parseError = await formatPlaygroundCode('const = ??? <').catch(
      (e: unknown) => e,
    );
    expect(isSourceSyntaxError(parseError)).toBe(true);
  });

  it('does not classify a chunk-load failure as a syntax error', () => {
    expect(
      isSourceSyntaxError(new Error('ChunkLoadError: Loading chunk 42 failed')),
    ).toBe(false);
    expect(isSourceSyntaxError(new TypeError('Failed to fetch'))).toBe(false);
    expect(isSourceSyntaxError(undefined)).toBe(false);
  });

  it('stays silent when the user’s source simply has a syntax error', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onFormatFailure = vi.fn();
    const provider = createPrettierFormattingProvider(onFormatFailure);

    const edits = await formatVia(
      provider,
      'export default function Broken( {',
    );

    expect(edits).toEqual([]);
    // Monaco already squiggles this. Warning on every broken keystroke would be
    // noise, and a toast would be worse.
    expect(warn).not.toHaveBeenCalled();
    expect(onFormatFailure).not.toHaveBeenCalled();
  });

  it('reports — loudly — when Prettier itself cannot load', async () => {
    vi.resetModules();
    vi.doMock('prettier/standalone', () => {
      throw new Error('ChunkLoadError: Loading chunk 42 failed');
    });
    const {createPrettierFormattingProvider: create} =
      await import('../app/playground/formatCode');

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onFormatFailure = vi.fn();
    const provider = create(onFormatFailure);

    const edits = await formatVia(provider, MESSY_CODE);

    // Still no edits — but the failure must not be swallowed silently.
    expect(edits).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(onFormatFailure).toHaveBeenCalledTimes(1);
    expect(onFormatFailure.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('still warns when no handler is wired (console is the floor, not the ceiling)', async () => {
    vi.resetModules();
    vi.doMock('prettier/standalone', () => {
      throw new Error('ChunkLoadError: Loading chunk 42 failed');
    });
    const {createPrettierFormattingProvider: create} =
      await import('../app/playground/formatCode');

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await formatVia(create(), MESSY_CODE);

    expect(warn).toHaveBeenCalledTimes(1);
  });

  /**
   * The load is cached so only the first format pays the ~1MB download — but a
   * FAILED load must not be. Cache the rejection and one flaky moment (a dropped
   * connection, a stale chunk hash mid-deploy) leaves the button dead for the
   * rest of the session, with a toast that says "try again" and a retry that can
   * never succeed.
   */
  it('retries the download after a failed load instead of staying dead all session', async () => {
    vi.resetModules();
    let attempts = 0;
    vi.doMock('prettier/standalone', async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error('ChunkLoadError: Loading chunk 42 failed');
      }
      return await vi.importActual('prettier/standalone');
    });
    const {formatPlaygroundCode: format} =
      await import('../app/playground/formatCode');

    await expect(format(MESSY_CODE)).rejects.toThrow();
    await expect(format(MESSY_CODE)).resolves.toContain(
      'const items = [1, 2, 3];',
    );
    expect(attempts).toBe(2);
  });
});

/**
 * Monaco binds Format Document to Shift+Alt+F everywhere EXCEPT Linux, where it
 * is Ctrl+Shift+I (monaco-editor/esm/vs/editor/contrib/format/browser/
 * formatActions.js: `primary: Shift|Alt|KeyF, linux: {primary: CtrlCmd|Shift|KeyI}`).
 * Monaco picks the OS from the user-agent — Macintosh, else Windows, else Linux
 * (vs/base/common/platform.js) — so the hint mirrors exactly that rule rather
 * than inventing its own, and a Linux user is never shown a chord that does
 * nothing.
 */
describe('formatShortcutHint', () => {
  it('is Shift+Alt+F on macOS', () => {
    expect(
      formatShortcutHint(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ),
    ).toBe('Shift+Alt+F');
  });

  it('is Shift+Alt+F on Windows', () => {
    expect(
      formatShortcutHint('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
    ).toBe('Shift+Alt+F');
  });

  it('is Ctrl+Shift+I on Linux', () => {
    expect(formatShortcutHint('Mozilla/5.0 (X11; Linux x86_64)')).toBe(
      'Ctrl+Shift+I',
    );
  });

  it('is Shift+Alt+F on iOS — platform.js folds iPad/iPhone into Macintosh', () => {
    expect(
      formatShortcutHint(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ),
    ).toBe('Shift+Alt+F');
    expect(
      formatShortcutHint(
        'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ),
    ).toBe('Shift+Alt+F');
  });

  it('is Ctrl+Shift+I on Android — its UA says Linux, and Monaco believes it', () => {
    // Not a curiosity: Android is the one platform where the UA says one thing
    // (Linux) and the user experiences another (a phone). Monaco reads the same
    // string we do, so agreeing with it is what keeps the two in lockstep.
    expect(
      formatShortcutHint(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
      ),
    ).toBe('Ctrl+Shift+I');
  });

  it('falls back to Monaco’s own default (Linux) for an unknown platform', () => {
    // platform.js resolves anything that is not Macintosh/Windows to Linux, so
    // the hint must too — otherwise the two disagree on exactly the platforms
    // nobody tests on.
    expect(formatShortcutHint('Mozilla/5.0 (Unknown)')).toBe('Ctrl+Shift+I');
  });
});

describe('formatButtonTooltip', () => {
  it('names the shortcut once the platform is known', () => {
    expect(formatButtonTooltip('Ctrl+Shift+I')).toBe(
      'Format code (Ctrl+Shift+I)',
    );
  });

  it('omits the chord before the platform is known (server render)', () => {
    // The platform can only be read from `navigator`, which does not exist
    // during SSR — so the first paint must claim no shortcut at all rather than
    // guess one and cause a hydration mismatch.
    expect(formatButtonTooltip(null)).toBe('Format code');
  });
});
