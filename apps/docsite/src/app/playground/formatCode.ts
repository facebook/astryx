// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file formatCode.ts
 * @input Playground editor source (TSX), the Monaco instance, the live editor
 * @output Prettier-formatted source + the Monaco document-formatting provider
 * @position Playground Code editor — the "Format code" action (issue #2684).
 *
 * Runs the repo's own Prettier config (`.prettierrc.json`, mirrored in
 * PLAYGROUND_PRETTIER_OPTIONS below and pinned to it by
 * `src/__tests__/playground-format.test.ts`) over the editor contents, so code
 * tidied in the playground comes out in the same house style as code in the
 * repo.
 *
 * Prettier runs in the browser here, so it must be the standalone build plus
 * explicit parser plugins (`typescript` for TSX, `estree` for printing). Both
 * are imported lazily on first format: the TypeScript parser is ~1MB, and it
 * has no business sitting in the playground's initial bundle.
 *
 * Wiring: `registerPrettierFormatter` registers this as a Monaco
 * DocumentFormattingEditProvider, which (a) enables Monaco's built-in
 * Shift+Alt+F / `editor.action.formatDocument` keybinding — the standalone
 * editor's formatter selector picks the first *real* document formatter, and
 * ours is the only one (Monaco's TypeScript worker contributes a *range*
 * formatter, which is only used synthetically as a fallback) — and (b) gives
 * the toolbar button something to drive via `runFormatAction`, so the button
 * and the shortcut can never diverge.
 *
 * Failures are not all alike. Unparseable source is the playground's normal
 * resting state (the user is mid-keystroke) and Monaco already squiggles it, so
 * it is swallowed. Prettier failing to *load* — offline, CSP, a stale chunk hash
 * after a deploy — is a real outage in which the button is simply dead, so it is
 * reported (console + an optional handler the host wires to a toast). See
 * `isSourceSyntaxError`.
 *
 * SYNC: PLAYGROUND_PRETTIER_OPTIONS must match `.prettierrc.json` at the repo
 * root (the drift test above will fail if it doesn't).
 */

import type * as MonacoTypes from 'monaco-editor';
import type {Options} from 'prettier';
import type {MonacoInstance} from './monacoSetup';

/** Monaco's built-in "Format Document" action — bound to Shift+Alt+F. */
export const FORMAT_DOCUMENT_ACTION_ID = 'editor.action.formatDocument';

/** The repo's `.prettierrc.json`, as passed to Prettier in the browser. */
export const PLAYGROUND_PRETTIER_OPTIONS: Options = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: false,
  trailingComma: 'all',
  singleQuote: true,
};

/**
 * Notified when Prettier could not run *at all* — never for a user syntax error.
 * The host wires this to a user-visible surface; see PlaygroundClient.
 */
export type FormatFailureHandler = (error: unknown) => void;

/**
 * Is this Prettier telling us the *user's* source is unparseable, rather than
 * Prettier itself failing?
 *
 * Prettier parse errors carry a `loc` describing where in the source it gave up
 * (`{start: {line, column}, end: {…}}`) — see the `SyntaxError` it throws with
 * own keys `loc`, `cause`, `codeFrame`. Nothing else that can go wrong here has
 * one: a failed chunk import throws a bare Error/TypeError. So `loc` is the
 * discriminator, and anything without it is treated as a real failure and
 * reported rather than silently swallowed.
 */
export function isSourceSyntaxError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('loc' in error)) {
    return false;
  }
  const {loc} = error as {loc: unknown};
  return typeof loc === 'object' && loc !== null && 'start' in loc;
}

/**
 * The chord Monaco actually bound "Format Document" to on this platform.
 *
 * Monaco uses Shift+Alt+F everywhere except Linux, where it is Ctrl+Shift+I
 * (`vs/editor/contrib/format/browser/formatActions.js`:
 * `primary: Shift|Alt|KeyF, linux: {primary: CtrlCmd|Shift|KeyI}`), and it picks
 * the OS off the user-agent — Macintosh, else Windows, else Linux
 * (`vs/base/common/platform.js`). This mirrors that rule exactly rather than
 * inventing its own, so the tooltip can never advertise a chord that does
 * nothing.
 *
 * Takes the user-agent rather than reading `navigator` so it stays pure — and so
 * the caller is forced to decide what to do during SSR, where there is no
 * `navigator` at all.
 */
export function formatShortcutHint(userAgent: string): string {
  const isMacintosh =
    userAgent.includes('Macintosh') ||
    userAgent.includes('iPad') ||
    userAgent.includes('iPhone');
  const isWindows = userAgent.includes('Windows');
  return isMacintosh || isWindows ? 'Shift+Alt+F' : 'Ctrl+Shift+I';
}

/**
 * Tooltip for the "Format code" button. `null` means the platform is not known
 * yet (the server render — `navigator` only exists after mount), in which case
 * the chord is omitted rather than guessed, which would hydrate-mismatch.
 */
export function formatButtonTooltip(shortcutHint: string | null): string {
  return shortcutHint ? `Format code (${shortcutHint})` : 'Format code';
}

/**
 * Lazily load the standalone Prettier build + the plugins it needs to parse and
 * print TSX. Cached, so only the first format pays the download.
 */
let prettierPromise: Promise<{
  format: (source: string, options: Options) => Promise<string>;
  plugins: NonNullable<Options['plugins']>;
}> | null = null;

function loadPrettier() {
  if (!prettierPromise) {
    prettierPromise = Promise.all([
      import('prettier/standalone'),
      import('prettier/plugins/typescript'),
      import('prettier/plugins/estree'),
    ])
      .then(([standalone, typescriptPlugin, estreePlugin]) => ({
        format: standalone.format,
        plugins: [typescriptPlugin, estreePlugin] as NonNullable<
          Options['plugins']
        >,
      }))
      .catch(error => {
        // Don't cache a transient chunk-load failure — let the next format retry.
        prettierPromise = null;
        throw error;
      });
  }
  return prettierPromise;
}

/**
 * Format playground source with the repo's Prettier config.
 * Rejects if the source can't be parsed (the caller decides what to do).
 */
export async function formatPlaygroundCode(code: string): Promise<string> {
  const {format, plugins} = await loadPrettier();
  return format(code, {
    ...PLAYGROUND_PRETTIER_OPTIONS,
    parser: 'typescript',
    plugins,
  });
}

/**
 * Monaco document-formatting provider backed by Prettier.
 *
 * Returns no edits when there is nothing to do — an already-formatted or empty
 * buffer, or source Prettier can't parse (the user is mid-keystroke with broken
 * syntax, which is the normal state of a playground). Returning an identical
 * full-range edit would push a pointless entry onto the undo stack; throwing
 * would surface an editor error for a non-event.
 *
 * A *real* failure (Prettier could not load) also yields no edits — there is
 * nothing to apply — but is reported rather than swallowed, because otherwise
 * the button is dead and absolutely nothing says so.
 */
export function createPrettierFormattingProvider(
  onFormatFailure?: FormatFailureHandler,
): MonacoTypes.languages.DocumentFormattingEditProvider {
  return {
    displayName: 'Prettier',
    async provideDocumentFormattingEdits(model) {
      const original = model.getValue();
      let formatted: string;
      try {
        formatted = await formatPlaygroundCode(original);
      } catch (error) {
        if (!isSourceSyntaxError(error)) {
          // Prettier itself never ran. Console first — it is the floor, and it
          // reaches devtools and error telemetry even with no handler wired.
          console.warn(
            '[playground] Format code failed: Prettier could not run.',
            error,
          );
          onFormatFailure?.(error);
        }
        return [];
      }
      if (formatted === original) {
        return [];
      }
      return [{range: model.getFullModelRange(), text: formatted}];
    },
  };
}

/**
 * Marks a Monaco instance as already carrying our formatter.
 *
 * This lives on the Monaco object — not in a module-level `let` — on purpose.
 * Monaco is a page-level singleton whose provider registry survives Next.js Fast
 * Refresh, but the *module* is re-evaluated on every edit in dev, which resets a
 * module-level flag to `false` and stacks a fresh duplicate provider each time.
 * A global-registry symbol survives re-evaluation exactly as Monaco itself does.
 */
const FORMATTER_REGISTERED = Symbol.for(
  'astryx.playground.prettierFormatterRegistered',
);

type FormatterRegistry = MonacoInstance['languages'] & {
  [FORMATTER_REGISTERED]?: MonacoTypes.IDisposable;
};

/**
 * Register Prettier as the playground's document formatter, at most once per
 * Monaco instance. Registering a real DocumentFormattingEditProvider is also
 * what enables Monaco's Shift+Alt+F keybinding (its precondition is
 * `hasDocumentFormattingProvider`).
 *
 * Returns the provider's disposable. Nothing disposes it: the formatter is
 * page-scoped, exactly like the Monaco singleton it hangs off, and it must
 * outlive any individual editor mount. It is returned (and cached) so a second
 * caller gets the same handle instead of a duplicate registration.
 */
export function registerPrettierFormatter(
  monaco: MonacoInstance,
  onFormatFailure?: FormatFailureHandler,
): MonacoTypes.IDisposable {
  const registry = monaco.languages as FormatterRegistry;
  const existing = registry[FORMATTER_REGISTERED];
  if (existing) {
    return existing;
  }

  const disposable = monaco.languages.registerDocumentFormattingEditProvider(
    ['typescript', 'javascript'],
    createPrettierFormattingProvider(onFormatFailure),
  );
  registry[FORMATTER_REGISTERED] = disposable;
  return disposable;
}

/**
 * Run "Format Document" on the live editor — the same action Shift+Alt+F fires,
 * so the toolbar button and the keybinding share one code path. No-ops when the
 * editor isn't mounted yet, or when the action is unavailable (no formatter
 * registered for the current language).
 *
 * Resolves when the format has actually finished, so the caller can show
 * progress for the duration. That matters more than it looks: the first format
 * downloads the ~1MB TypeScript parser, and Monaco cancels an in-flight format
 * as soon as the model or the cursor moves (`format.js`:
 * `EditorStateCancellationTokenSource(Value | Position)`). A user given no
 * feedback clicks into the editor to check whether anything happened — and that
 * click is what kills the format. So the button holds a spinner instead; see
 * PlaygroundClient's `clickAction`.
 *
 * Never rejects. The caller is Button's `clickAction`, which awaits inside a
 * React transition with no `catch`, so a rejection would reach an error boundary
 * and take the playground down over a failed tidy-up. Genuine format failures
 * never reach here anyway — the provider above reports them itself.
 */
export async function runFormatAction(
  editor: MonacoTypes.editor.IStandaloneCodeEditor | null,
): Promise<void> {
  const action = editor?.getAction(FORMAT_DOCUMENT_ACTION_ID);
  if (!action) {
    return;
  }
  try {
    await action.run();
  } catch (error) {
    console.warn('[playground] Format code action failed.', error);
  }
}
