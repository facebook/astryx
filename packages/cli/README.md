# @xds/cli

XDS design system CLI -- components, themes, and tooling.

```bash
npx xds --help
npx xds component Button
npx xds docs tokens
npx xds template --list
```

## JSON API

Every command supports `--json` for machine-readable output. Responses are typed envelopes:

```json
{"type": "component.detail", "data": {"name": "Button", ...}}
```

Errors:

```json
{
  "error": "No component named \"Buttn\"",
  "suggestions": [{"name": "Button", "reason": "similar name"}]
}
```

### Programmatic API

The same logic that powers `xds --json` is available as importable, type-safe functions:

```typescript
import {component, docs, discover, XDSError} from '@xds/cli/api';

// Same result as: xds --json component Button
const btn = await component('Button');
btn.type; // 'component.detail'
btn.data.name; // 'Button' (typed as ComponentDoc)

// Same result as: xds --json component --list
const list = await component(undefined, {list: true});
list.data; // Record<string, string[]>

// Same result as: xds --json docs principles
const principles = await docs('principles');
principles.data.title; // 'XDS Principles'

// Errors throw XDSError with optional .suggestions
try {
  await component('Buttn');
} catch (e) {
  e.message; // 'No component named "Buttn"'
  e.suggestions; // [{ name: 'Button', reason: 'similar name' }]
}
```

The CLI command handlers are thin wrappers around these functions — they parse args, call the API, then format the output (JSON or text). This guarantees that `@xds/cli/api` and `xds --json` always return identical data.

### Consumer utilities (for parsing CLI stdout)

If you're spawning the CLI as a subprocess rather than importing the API directly:

```typescript
import {parseResponse, isError, assertResponse} from '@xds/cli/json';
import type {ComponentDetailResponse, CLIResult} from '@xds/cli/json';

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

| Command                                   | Type                      | Response                        |
| ----------------------------------------- | ------------------------- | ------------------------------- |
| `xds --json component [--list]`           | `component.list`          | `ComponentListResponse`         |
| `xds --json component --detail brief`     | `component.brief`         | `ComponentBriefResponse`        |
| `xds --json component <name>`             | `component.detail`        | `ComponentDetailResponse`       |
| `xds --json component <name> --props`     | `component.detail.props`  | `ComponentDetailPropsResponse`  |
| `xds --json component <name> --source`    | `component.detail.source` | `ComponentDetailSourceResponse` |
| `xds --json discover`                     | `discover.list`           | `DiscoverListResponse`          |
| `xds --json discover @scope/name`         | `discover.detail`         | `DiscoverDetailResponse`        |
| `xds --json discover @scope/name/Comp`    | `discover.detail.doc`     | `DiscoverDetailDocResponse`     |
| `xds --json discover <search>`            | `discover.search`         | `DiscoverSearchResponse`        |
| `xds --json docs`                         | `docs.list`               | `DocsListResponse`              |
| `xds --json docs <topic>`                 | `docs.detail`             | `DocsDetailResponse`            |
| `xds --json docs <topic> <section>`       | `docs.detail.section`     | `DocsDetailSectionResponse`     |
| `xds --json template [--list]`            | `template.list`           | `TemplateListResponse`          |
| `xds --json template <name>`              | `template.show`           | `TemplateShowResponse`          |
| `xds --json template <name> --skeleton`   | `template.skeleton`       | `TemplateSkeletonResponse`      |
| `xds --json template <name> [path]`       | `template.copy`           | `TemplateCopyResponse`          |
| `xds --json swizzle [--list]`             | `swizzle.list`            | `SwizzleListResponse`           |
| `xds --json swizzle <component>`          | `swizzle.copy`            | `SwizzleCopyResponse`           |
| `xds --json theme build <file>`           | `theme.build`             | `ThemeBuildResponse`            |
| `xds --json upgrade --list`               | `upgrade.list`            | `UpgradeListResponse`           |
| `xds --json upgrade [--apply]`            | `upgrade.run`             | `UpgradeRunResponse`            |
| `xds --json gap-report --list-categories` | `gap-report.categories`   | `GapReportCategoriesResponse`   |
| `xds --json gap-report --component X ...` | `gap-report.file`         | `GapReportFileResponse`         |
| any error                                 | --                        | `CLIError`                      |
| unsupported command                       | --                        | `CLIUnsupportedError`           |

---

## Adding a new command

### Does it need an API function?

**Yes** if the command returns data that consumers might want programmatically — component docs, template source, lists, search results. Put the logic in `src/api/`, export from `@xds/cli/api`, and make the CLI handler a thin wrapper.

**No** if the command is purely interactive or only makes sense in a terminal — `init` (interactive prompts), `gap-report setup` (config wizard). These can live entirely in `src/commands/`.

**Rule of thumb:** if it supports `--json`, it should have an API function. The parity test (`api-cli-parity-test.mjs`) will flag any `--json` type that doesn't have API coverage.

### 1. Write the API function

Add a file in `src/api/` with all the logic. It returns `{ type, data }` on success and throws `XDSError` on failure. The CLI handler should have zero logic — just arg parsing and text formatting:

```javascript
// src/api/my-command.mjs
import {XDSError} from './error.mjs';

export async function myCommand(name, options = {}) {
  if (!name) {
    return {type: 'my-command.list', data: getAllItems()};
  }

  const item = findItem(name);
  if (!item) {
    throw new XDSError(`Item "${name}" not found`, suggestions);
  }

  return {type: 'my-command.detail', data: item};
}
```

Export it from `src/api/index.mjs`:

```javascript
export {myCommand} from './my-command.mjs';
```

### 2. Create the CLI wrapper

The CLI handler just parses args, calls the API function, and formats the result. No business logic here:

```javascript
// src/commands/my-command.mjs
import {jsonOut, jsonError} from '../lib/json.mjs';
import {myCommand} from '../api/my-command.mjs';

export function registerMyCommand(program) {
  program
    .command('my-command [name]')
    .description('Does something')
    .action(async (name, options) => {
      const json = program.opts().json || false;

      let result;
      try {
        result = await myCommand(name, options);
      } catch (e) {
        if (json) return jsonError(e.message, e.suggestions);
        console.error(e.message);
        process.exit(1);
      }

      if (json) return jsonOut(result.type, result.data);
      console.log(formatText(result));
    });
}
```

### 3. Define response types

Create `src/types/my-command.d.ts`:

```typescript
/**
 * My-command JSON responses.
 *
 * Invocation                          -> type discriminator
 * ------------------------------------------------------------------
 * xds --json my-command               -> my-command.list
 * xds --json my-command <name>        -> my-command.detail
 * (not found)                         -> CLIError
 */

/** xds --json my-command */
export interface MyCommandListResponse {
  type: 'my-command.list';
  data: MyCommandListEntry[];
}

export interface MyCommandListEntry {
  name: string;
  description: string;
}

/** xds --json my-command <name> */
export interface MyCommandDetailResponse {
  type: 'my-command.detail';
  data: {name: string; content: string};
}
```

### 3. Wire it up

Add to `src/types/index.d.ts`:

```typescript
export * from './my-command';
```

Add to `CLIAnyResponse` in `src/types/base.d.ts`:

```typescript
import type { MyCommandListResponse, MyCommandDetailResponse } from './my-command';

export type CLIAnyResponse =
  | ...existing types...
  | MyCommandListResponse
  | MyCommandDetailResponse;
```

### 5. That's it

If you skip the type steps, the command still works — the global fallback hook returns a clean `CLIUnsupportedError` when someone passes `--json`. No crashes, no broken output.

---

## Playbook — common changes

### Adding a prop to a component

Nothing to do in the CLI. Props come from `.doc.mjs` files in `packages/core/src/`. The CLI reads them at runtime. If the `.doc.mjs` is updated, the CLI and API automatically reflect the change.

### Adding a new component

1. Create the component in `packages/core/src/{Name}/`
2. Add a `{Name}.doc.mjs` in the same directory (or add to the parent's `.doc.mjs` if it's a sub-component)
3. Done — the CLI auto-discovers it, the API auto-discovers it, the parity test auto-discovers it

If the component has no `.doc.mjs`, `xds component {Name}` returns a clean error and CI's smoke test skips it.

### Adding a new doc topic

1. Add `{topic}.doc.mjs` in `packages/cli/docs/`
2. Done — auto-discovered by `xds docs` and the `docs()` API function

### Adding a new template

Every template is exactly **two files** — no exceptions:

```
packages/cli/templates/{name}/
├── page.tsx              ← the template code (single self-contained file)
└── template.doc.mjs      ← metadata (name, description, isReady)
```

1. Create `packages/cli/templates/{name}/page.tsx` with a default-exported React component
2. Create `packages/cli/templates/{name}/template.doc.mjs` with a `doc` export (`TemplateDoc`)
3. Done — auto-discovered by `xds template --list` and the `template()` API function

**Rules:**
- No extra files — no CSS, no images, no other assets. Everything lives in `page.tsx`.
- Images must use external URLs (e.g. Unsplash), not local imports.
- All styles must use stylex or inline styles, not separate CSS files.

### Adding a new option to an existing API function

1. Add the option to the API function in `src/api/{command}.mjs`
2. Pass it through from the CLI handler in `src/commands/{command}.mjs`
3. Update the types in `src/types/api.d.ts` (add to the options interface)
4. If it produces a new response type, also update `src/types/{command}.d.ts` and `src/types/base.d.ts`

### Adding a new response type (e.g. `component.detail.variants`)

1. Add the logic in `src/api/{command}.mjs` — return `{type: 'component.detail.variants', data: ...}`
2. Add a TypeScript interface in `src/types/{command}.d.ts`
3. Add it to `CLIAnyResponse` in `src/types/base.d.ts`
4. Add it to the result union in `src/types/api.d.ts`
5. The parity test will auto-detect the new type and verify API=CLI

### Renaming or removing a response type

This is a breaking change for `@xds/cli/api` consumers. Bump the version.

### What CI catches automatically

- **New component without docs** → smoke test skips it with a message (not a failure)
- **New CLI `--json` type without API coverage** → parity test flags it as a coverage gap
- **API and CLI returning different data** → parity test fails with both payloads shown
- **Invalid JSON envelope shape** → json smoke test fails
- **Type mismatches** → `tsconfig.json-api.json` typecheck fails

---

## Naming conventions

### Response types: `{Command}{Mode}{SubMode?}Response`

| Part    | Rule                    | Examples                                                                          |
| ------- | ----------------------- | --------------------------------------------------------------------------------- |
| Command | PascalCase command name | `Component`, `Discover`, `ThemeBuild`                                             |
| Mode    | What the response IS    | `List`, `Brief`, `Detail`, `Search`, `Copy`, `Build`, `Run`, `Categories`, `File` |
| SubMode | Narrower view of Mode   | `Props`, `Source`, `Doc`, `Section`                                               |
| Suffix  | Always `Response`       |                                                                                   |

### Entry types: `{Command}{What}Entry`

Sub-objects in arrays. No `Response` suffix.

### Type discriminators: dot-separated lowercase

```
{command}.{mode}              -> component.list
{command}.{mode}.{submode}    -> component.detail.props
```

### How flags compose

`--json` is an output format, not a mode. All other flags still work:

- `--json + --category X` filters the same response type (no new type needed)
- `--json + --lang zh` applies translation before dumping
- `--json + --props` narrows to `component.detail.props` (sub-mode)
- `--json + --source` narrows to `component.detail.source` (sub-mode)

---

## Architecture

The CLI is a thin wrapper around type-safe API functions. Each command follows the same pattern:

```
User calls API function        User runs CLI
        |                            |
        v                            v
  api/component.mjs ◄──────── commands/component/index.mjs
        |                            |
        v                            v
  { type, data }              jsonOut(type, data) or formatText(data)
```

Both paths run identical code. The CLI handler just adds argument parsing and output formatting.

```
src/
  api/                         # Programmatic API (exported as @xds/cli/api)
    index.mjs                  # barrel: component, docs, discover, template, XDSError
    component.mjs              # component(name?, opts?) → { type, data }
    docs.mjs                   # docs(topic?, section?, opts?) → { type, data }
    discover.mjs               # discover(query?, opts?) → { type, data }
    template.mjs               # template(name?, opts?) → { type, data }
    error.mjs                  # XDSError class (carries .suggestions)
  commands/                    # CLI wrappers (thin: parse args → call API → format output)
    component/index.mjs        # calls api/component.mjs
    docs.mjs                   # calls api/docs.mjs
    discover.mjs               # calls api/discover.mjs
    template.mjs               # calls api/template.mjs
    swizzle.mjs                # CLI-only (side-effect: copies + rewrites imports)
    build-theme.mjs            # CLI-only (side-effect: compiles theme to CSS)
    upgrade.mjs                # CLI-only (side-effect: runs codemods)
    gap-report.mjs             # CLI-only (side-effect: files GitHub issues)
    init.mjs                   # CLI-only (interactive prompts)
  lib/
    json.mjs                   # jsonOut(type, data), jsonError(msg) — internal
    parse.mjs                  # parseResponse, isError, assertResponse — consumer
  types/
    api.d.ts                   # API function signatures + XDSError
    base.d.ts                  # CLIError, CLIResult<T>, CLIAnyResponse, CLIResponseType
    component.d.ts             # ComponentListResponse, ComponentDetailResponse, ...
    discover.d.ts              # DiscoverListResponse, ...
    docs.d.ts                  # DocsListResponse, ...
    template.d.ts              # TemplateListResponse, TemplateShowResponse, TemplateSkeletonResponse, TemplateCopyResponse
    swizzle.d.ts               # SwizzleListResponse, SwizzleCopyResponse
    theme.d.ts                 # ThemeBuildResponse
    upgrade.d.ts               # UpgradeListResponse, UpgradeRunResponse
    gap-report.d.ts            # GapReportCategoriesResponse, GapReportFileResponse
    index.d.ts                 # barrel re-export
```

### How the fallback hook works

1. Command runs normally
2. If it called `jsonOut()` or `jsonError()`, `process.__xdsJsonHandled` is `true` -> done
3. If not, the `postAction` hook fires and outputs `CLIUnsupportedError`
4. New commands that don't know about `--json` automatically get a clean error

### CI enforcement

- `tsconfig.json-api.json` typechecks `json.mjs` and `parse.mjs` against the `.d.ts` declarations
- `.github/scripts/cli-json-smoke-test.mjs` validates every `--json` command outputs valid JSON with correct envelope shape
- `.github/scripts/api-cli-parity-test.mjs` verifies the programmatic API returns identical data to `xds --json` for every command
- All three run in the `cli-smoke-test.yml` workflow on every PR

### Suppressing stdout for --json

When `--json` is active, human-readable output must not contaminate stdout:

```javascript
// Simple commands: guard console.log
if (!json) console.log(`✓ Done`);

// Clack-based commands: skip Clack calls
if (!json) p.intro('Welcome');
if (!json) p.log.step('Running...');

// Side-effect commands: still run the work, just suppress output
// and collect results into a receipt object
```
