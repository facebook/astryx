# @astryxdesign/cli

The CLI is the primary interface for working with the design system, for humans and machines alike. It provides component documentation, design tokens, page templates, theming tools, and upgrade codemods, all accessible via terminal commands, a typed JSON API, or programmatic imports. AI agents and build tools use the same API that powers the CLI, enabling end-to-end frontend development loops.

```bash
npx astryx --help
npx astryx search button
npx astryx component Button
npx astryx docs tokens
npx astryx docs migration
npx astryx template --list
```

## Finding things: `astryx search`

When you don't know whether what you need is a component, a hook, a docs topic,
or a template, search across all of them at once. Results are ranked by
relevance (name and keyword matches outrank incidental prose mentions, with
fuzzy matching for typos) and tagged with their domain plus the follow-up
command to run:

```bash
$ npx astryx search button

Results for "button" (20):

  [component]  Button
               Button triggers an action when clicked. Use it for form submissions…
               → npx astryx component Button

  [component]  IconButton
               A button that shows only an icon with no visible text…
               → npx astryx component IconButton

  [hook]       useClickableContainer
               Makes a container element clickable while preserving nested…
               → npx astryx hook useClickableContainer

  [template]   Banner — Collapsible
               Combine an action button, dismiss control, and expandable detail area…
               → npx astryx template BannerCollapsibleContent
```

Options:

- `--type <component|hook|doc|template>`: restrict to a single domain
- `--limit <n>`: cap the number of results (default 20)
- `--detail`: include the import path and the match reason/score
- `--json`: typed `{ type: 'search', data: { query, results } }` envelope

## Commands

| Command       | Description                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `init`        | Initialize the design system in your project: installs packages, sets up theming, adds AI agent docs |
| `component`   | List components or print detailed docs, props, usage examples, and source                            |
| `search`      | Find components, hooks, docs, and templates in one ranked, cross-domain result set                   |
| `docs`        | Print reference documentation (tokens, theme, color, typography, spacing, etc.)                      |
| `template`    | Inject page or block templates into your project                                                     |
| `hook`        | List hooks and print hook documentation                                                              |
| `swizzle`     | Copy component source into your project for deep customization                                       |
| `upgrade`     | Run codemods to migrate between versions                                                             |
| `theme build` | Compile a defineTheme file to production CSS and JS                                                  |
| `discover`    | Discover external packages and components                                                            |
| `doctor`      | Diagnose your Astryx setup and report problems with fixes (CI-friendly via exit code)                |

### Global options

These flags work with any command:

- `--json`: Output as typed JSON envelope: `{ type, data }` (errors: `{ error, code, suggestions? }`)
- `--detail <level>`: Detail level for list views, increasing in size: `brief` (names only, default for `--list`) < `compact` (names + 1-line descriptions) < `full` (full docs per entry). Single-item views default to `full`.
- `--zh`: Output docs in Chinese Simplified
- `--dense`: Compressed format (token-efficient, useful for AI agents)
- `--lang <locale>`: Language/format shorthand (`en`, `zh`, `dense`)

## JSON API

Every command supports `--json` for machine-readable output. Responses are typed envelopes:

```json
{"type": "component.detail", "data": {"name": "Button", ...}}
```

Errors:

```json
{
  "error": "No component named \"Buttn\"",
  "code": "ERR_UNKNOWN_COMPONENT",
  "suggestions": [{"name": "Button", "reason": "similar name"}]
}
```

The `code` field is a **stable, machine-readable identifier**. Branch on it,
never on the human-readable `error` string, which changes freely as we improve
wording. Every error envelope carries a `code` (falling back to `ERR_UNKNOWN`
when no more specific code applies). The same `code` is exposed on thrown
`AstryxError` instances from the programmatic API, so both surfaces agree.

Codes are **append-only**: once shipped, a code's meaning never changes and a
code is never removed. New error conditions get new codes.

```typescript
import {isError} from '@astryxdesign/cli/json';

const result = parseResponse(raw);
if (isError(result)) {
  switch (result.code) {
    case 'ERR_UNKNOWN_COMPONENT':
      // suggest the closest match
      break;
    case 'ERR_CORE_NOT_FOUND':
      // prompt the user to install @astryxdesign/core
      break;
    default:
      console.error(result.error);
  }
}
```

### Error codes

| Code                     | Meaning                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `ERR_UNKNOWN`            | Generic fallback for any error without a more specific code.                           |
| `ERR_UNKNOWN_COMMAND`    | A top-level command name was not recognized (e.g. `astryx bogus`).                     |
| `ERR_UNKNOWN_SUBCOMMAND` | A subcommand under a group was not recognized (e.g. `astryx theme bogus`).             |
| `ERR_INVALID_OPTION`     | An unknown flag was passed, or `--json` was used on a command that doesn't support it. |
| `ERR_INVALID_ARGUMENT`   | An option/argument value was rejected, or required flags were missing.                 |
| `ERR_MISSING_ARGUMENT`   | A required positional argument was omitted (e.g. `astryx theme build` with no file).   |
| `ERR_INVALID_LANG`       | `--lang` was given a value outside its choices (`en`, `zh`, `dense`).                  |
| `ERR_INVALID_DETAIL`     | `--detail` was given a value outside its choices (`full`, `compact`, `brief`).         |
| `ERR_NODE_VERSION`       | The running Node.js version is below the supported minimum.                            |
| `ERR_CORE_NOT_FOUND`     | `@astryxdesign/core` could not be located (not installed / not in a monorepo).         |
| `ERR_UNKNOWN_COMPONENT`  | No component matched the requested name.                                               |
| `ERR_UNKNOWN_HOOK`       | No hook matched the requested name.                                                    |
| `ERR_UNKNOWN_TOPIC`      | No docs topic matched the requested name.                                              |
| `ERR_UNKNOWN_SECTION`    | A docs topic exists but the requested section within it does not.                      |
| `ERR_UNKNOWN_CATEGORY`   | A `--category` filter value did not match any known category.                          |
| `ERR_UNKNOWN_TEMPLATE`   | No template matched the requested name.                                                |
| `ERR_UNKNOWN_PACKAGE`    | No package matched the requested name (discover).                                      |
| `ERR_UNKNOWN_AGENT`      | An unrecognized `--agent` value was passed (agent docs / init).                        |
| `ERR_UNKNOWN_FEATURE`    | An unrecognized `--features` value was passed to `init`.                               |
| `ERR_UNKNOWN_CODEMOD`    | A `--codemod` value did not match any registered codemod (upgrade).                    |
| `ERR_NOT_FOUND`          | A discover/lookup query matched nothing in any package.                                |
| `ERR_NO_DOC`             | A component exists but has no typed `.doc.mjs` file.                                   |
| `ERR_NO_SHOWCASE`        | No showcase exists for the requested component.                                        |
| `ERR_NO_SOURCE`          | No source file could be located for the component/template.                            |
| `ERR_INVALID_DOC`        | A component's docs failed validation (malformed `.doc.mjs`).                           |
| `ERR_FILE_NOT_FOUND`     | A required input file did not exist.                                                   |
| `ERR_FILE_EXISTS`        | Refused to overwrite an existing file in non-interactive mode.                         |
| `ERR_PATH_TRAVERSAL`     | A path escaped its allowed root, or a name contained traversal markers.                |
| `ERR_WRITE_FAILED`       | Writing output files failed (and was rolled back).                                     |
| `ERR_THEME_INVALID`      | A theme definition was missing a required property (e.g. `name`).                      |
| `ERR_THEME_LOAD`         | A theme file could not be loaded / parsed into a `defineTheme` result.                 |
| `ERR_TEMPLATE_CONFIG`    | `template.get` is not configured in `astryx.config.mjs` (fetch-by-id).                 |
| `ERR_TEMPLATE_GET`       | A configured `template.get` threw or returned an invalid value.                        |
| `ERR_VERSION_DETECT`     | The current `@astryxdesign/core` version could not be detected.                        |
| `ERR_INVALID_VERSION`    | A `--from`/`--to` value was not a valid semver string.                                 |
| `ERR_DEP_MISSING`        | A required external dependency (e.g. jscodeshift) is missing.                          |
| `ERR_GH_CLI`             | GitHub CLI (`gh`) is not installed or not authenticated.                               |

## Capability manifest (agent discovery)

Agents don't have to scrape `--help` to learn the CLI. A single call returns a
**self-describing manifest**: every command, its arguments, flags (with types,
choices, and defaults), whether it supports `--json`, and the response `type`
discriminators each command can emit. Think of it as an OpenAPI spec for the CLI.

```bash
astryx manifest --json        # dedicated surface — type: "manifest"
astryx --json                 # bare invocation — embeds the same payload under data.manifest
```

Shape:

```jsonc
{
  "apiVersion": 1,
  "type": "manifest",
  "data": {
    "name": "astryx",
    "version": "0.0.14",
    "description": "Design system CLI — components, themes, and tooling",
    "globalOptions": [
      {
        "flag": "--json",
        "type": "boolean",
        "description": "Output as typed JSON…",
      },
      {
        "flag": "--lang <locale>",
        "type": "enum",
        "choices": ["en", "zh", "dense"],
      },
      {
        "flag": "--detail <level>",
        "type": "enum",
        "choices": ["full", "compact", "brief"],
        "default": "full",
      },
    ],
    "commands": [
      {
        "name": "component",
        "description": "List components or print component docs",
        "arguments": [
          {
            "name": "name",
            "required": false,
            "variadic": false,
            "description": "",
          },
        ],
        "options": [
          {
            "flag": "--props",
            "type": "boolean",
            "description": "Print only the props table",
          },
        ],
        "json": true,
        "responseTypes": [
          "component.list",
          "component.detail",
          "component.detail.props",
          "…",
        ],
        "examples": ["astryx component Button --props --json"],
      },
      // …one entry per command; subcommands (e.g. `theme build`) nest under `subcommands`
    ],
    "jsonSupported": ["component", "docs", "…"],
    "responseTypes": {
      "component": ["component.list", "…"],
      "theme build": ["theme.build"],
    },
  },
}
```

The manifest is **derived from Commander metadata** (commands, arguments, options)
so it can't drift from the real command definitions. The two facts Commander
doesn't track (`--json` support and emitted response types) are layered on from
the `JSON_SUPPORTED` allowlist and a small declarative `RESPONSE_TYPES` map in
`src/lib/manifest.mjs`, guarded by a drift test (`manifest.test.mjs`) so adding a
command without describing it fails CI.

**Backwards-compat:** the bare `astryx --json` envelope keeps `type: "help"` and its
original shallow fields (`name`, `version`, `commands` as a `string[]` of names,
`jsonSupported`); the full structured manifest is additive under `data.manifest`.
For the standalone manifest envelope (`type: "manifest"`), use `astryx manifest --json`.

## Programmatic API

The same logic that powers `astryx --json` is available as importable, type-safe functions:

```typescript
import {
  component,
  docs,
  discover,
  template,
  hook,
  search,
  AstryxError,
} from '@astryxdesign/cli/api';

// Same result as: astryx --json component Button
const btn = await component('Button');
btn.type; // 'component.detail'
btn.data.name; // 'Button' (typed as ComponentDoc)

// Same result as: astryx --json component --list
const list = await component(undefined, {list: true});
list.data; // Record<string, string[]>

// Same result as: astryx --json docs principles
const principles = await docs('principles');
principles.data.title; // 'Principles'

// Same result as: astryx --json hook useMediaQuery
const useMediaQuery = await hook('useMediaQuery');
useMediaQuery.data.params; // typed as HookParamDoc[]

// Errors throw AstryxError with a stable .code and optional .suggestions
try {
  await component('Buttn');
} catch (e) {
  e.message; // 'No component named "Buttn"'
  e.code; // 'ERR_UNKNOWN_COMPONENT' (stable; branch on this)
  e.suggestions; // [{ name: 'Button', reason: 'similar name' }]
}
```

The CLI command handlers are thin wrappers around these functions: they parse args, call the API, then format the output (JSON or text). This guarantees that `@astryxdesign/cli/api` and `astryx --json` always return identical data.

### Consumer utilities

If you're spawning the CLI as a subprocess rather than importing the API directly:

```typescript
import {parseResponse, isError, assertResponse} from '@astryxdesign/cli/json';
import type {ComponentDetailResponse, CLIResult} from '@astryxdesign/cli/json';

const result = parseResponse(stdout);
if (isError(result)) {
  console.error(result.error);
} else {
  switch (result.type) {
    case 'component.detail':
      result.data.name; // TypeScript: ComponentDoc
      break;
  }
}

// Or assert directly (throws on error/mismatch):
const detail = assertResponse(stdout, 'component.detail');
detail.data.name; // already narrowed
```

### Type discriminators

Every response has a `type` string that uniquely identifies it:

| Command                                           | Type                        | Response                          |
| ------------------------------------------------- | --------------------------- | --------------------------------- |
| `astryx --json component [--list]`                | `component.list`            | `ComponentListResponse`           |
| `astryx --json component --list --detail compact` | `component.brief`           | `ComponentBriefResponse`          |
| `astryx --json component --list --detail full`    | `component.full`            | `ComponentFullResponse`           |
| `astryx --json component <name>`                  | `component.detail`          | `ComponentDetailResponse`         |
| `astryx --json component <name> --props`          | `component.detail.props`    | `ComponentDetailPropsResponse`    |
| `astryx --json component <name> --source`         | `component.detail.source`   | `ComponentDetailSourceResponse`   |
| `astryx --json component <name> --showcase`       | `component.detail.showcase` | `ComponentDetailShowcaseResponse` |
| `astryx --json component <name> --blocks`         | `component.detail.blocks`   | `ComponentDetailBlocksResponse`   |
| `astryx --json discover`                          | `discover.list`             | `DiscoverListResponse`            |
| `astryx --json discover @scope/name`              | `discover.detail`           | `DiscoverDetailResponse`          |
| `astryx --json discover @scope/name/Comp`         | `discover.detail.doc`       | `DiscoverDetailDocResponse`       |
| `astryx --json discover <search>`                 | `discover.search`           | `DiscoverSearchResponse`          |
| `astryx --json docs`                              | `docs.list`                 | `DocsListResponse`                |
| `astryx --json docs <topic>`                      | `docs.detail`               | `DocsDetailResponse`              |
| `astryx --json docs <topic> <section>`            | `docs.detail.section`       | `DocsDetailSectionResponse`       |
| `astryx --json template [--list]`                 | `template.list`             | `TemplateListResponse`            |
| `astryx --json template <name>`                   | `template.show`             | `TemplateShowResponse`            |
| `astryx --json template <name> --skeleton`        | `template.skeleton`         | `TemplateSkeletonResponse`        |
| `astryx --json template <name> [path]`            | `template.copy`             | `TemplateCopyResponse`            |
| `astryx --json hook [--list]`                     | `hook.list`                 | `HookListResponse`                |
| `astryx --json hook --list --detail compact`      | `hook.brief`                | `HookBriefResponse`               |
| `astryx --json hook --list --detail full`         | `hook.full`                 | `HookFullResponse`                |
| `astryx --json hook <name>`                       | `hook.detail`               | `HookDetailResponse`              |
| `astryx --json hook <name> --params`              | `hook.detail.params`        | `HookDetailParamsResponse`        |
| `astryx --json search <query>`                    | `search`                    | `SearchResponse`                  |
| `astryx --json swizzle [--list]`                  | `swizzle.list`              | `SwizzleListResponse`             |
| `astryx --json swizzle <component>`               | `swizzle.copy`              | `SwizzleCopyResponse`             |
| `astryx --json theme build <file>`                | `theme.build`               | `ThemeBuildResponse`              |
| `astryx --json upgrade --list`                    | `upgrade.list`              | `UpgradeListResponse`             |
| `astryx --json upgrade [--apply]`                 | `upgrade.run`               | `UpgradeRunResponse`              |
| `astryx --json doctor`                            | `doctor`                    | `DoctorResponse`                  |
| any error                                         | —                           | `CLIError`                        |
| unsupported command                               | —                           | `CLIUnsupportedError`             |

## Doctor

`astryx doctor` runs a series of health checks against your project and
environment and reports `PASS` / `WARN` / `FAIL` for each, with an actionable
fix for anything that isn't passing. It's read-only; it never installs or
mutates anything, so it's safe to run anywhere, including CI.

```
$ astryx doctor
astryx doctor — diagnosing your setup

  ✓ Node.js version
      Node v22.13.0 meets the minimum (>=22.13.0).
  ✓ @astryxdesign/core installed
      @astryxdesign/core resolved (v0.0.14).
  ✓ @astryxdesign/core <-> @astryxdesign/cli alignment
      @astryxdesign/core v0.0.14 is in step with @astryxdesign/cli v0.0.14.
  ⚠ Theme packages
      No @astryxdesign/theme-* packages are installed.
      → fix: Install a theme, e.g. `npm install @astryxdesign/theme-neutral`, then import its CSS or set astryx.theme.
  ℹ astryx.config.mjs
      No astryx.config.mjs found — using defaults.
  ℹ AI agent docs
      No agent docs (CLAUDE.md / AGENTS.md / .cursorrules) found.
      → fix: Generate agent docs with `astryx init --features agents`.
  ✓ @astryxdesign/core peer dependencies
      All peer dependencies satisfied (react, react-dom).
  ℹ Package manager
      Detected package manager: yarn.

Summary: 4 passed, 1 warning, 0 failures, 3 info

No failures — but review the ⚠ warnings above when you can.
```

### Checks

| Check                        | Status it can return | What it verifies                                                     |
| ---------------------------- | -------------------- | -------------------------------------------------------------------- |
| Node.js version              | pass / fail          | Running Node meets the CLI's minimum                                 |
| @astryxdesign/core installed | pass / fail          | `@astryxdesign/core` is resolvable from the project                  |
| Version alignment            | pass / warn / info   | Installed `@astryxdesign/core` is in step with `@astryxdesign/cli`   |
| Theme packages               | pass / warn          | An `@astryxdesign/theme-*` package is installed and a theme is wired |
| astryx.config.mjs            | pass / fail / info   | Config (if present) loads cleanly with a valid shape                 |
| AI agent docs                | pass / warn / info   | Agent docs exist and contain the Astryx section markers              |
| Peer dependencies            | pass / warn / info   | `@astryxdesign/core`'s peer deps (react, …) are installed            |
| Package manager              | info                 | Reports the detected package manager                                 |

### CI gate

The exit code is the contract: `astryx doctor` exits `0` when there are no
failures (warnings are fine) and `1` when any check fails. That makes it
usable directly as a CI step:

```yaml
- run: npx astryx doctor
```

Use `--json` for a structured envelope (`{ apiVersion, type: "doctor",
data: { checks, summary } }`) that AI agents and scripts can parse.

## Configuration

The CLI reads from an optional `astryx.config.mjs` in your project root:

```javascript
export default {
  templates: {
    get: async id => fetchTemplateFromAPI(id),
  },
  issuesUrl: 'https://github.com/your-org/your-repo/issues',
};
```
