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

### Consumer utilities

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

### 1. Create the command

Add a file in `src/commands/` and register it in `src/index.mjs`:

```javascript
// src/commands/my-command.mjs
import {jsonOut, jsonError} from '../lib/json.mjs';

export function registerMyCommand(program) {
  program
    .command('my-command [name]')
    .description('Does something')
    .action(async (name, options) => {
      const json = program.opts().json || false;

      // ... your logic ...

      if (json) return jsonOut('my-command.list', data);
      console.log(textOutput);
    });
}
```

### 2. Define response types

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

### 4. That's it

If you skip steps 2-3, the command still works -- the global fallback hook returns a clean `CLIUnsupportedError` when someone passes `--json`. No crashes, no broken output.

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

```
src/
  index.mjs              # Commander setup, --json flag, fallback hook
  lib/
    json.mjs             # jsonOut(type, data), jsonError(msg) -- internal
    parse.mjs            # parseResponse, isError, assertResponse -- consumer
  types/
    base.d.ts            # CLIError, CLIResult<T>, CLIAnyResponse, CLIResponseType
    component.d.ts       # ComponentListResponse, ComponentDetailResponse, ...
    discover.d.ts        # DiscoverListResponse, ...
    docs.d.ts            # DocsListResponse, ...
    template.d.ts        # TemplateListResponse, TemplateCopyResponse
    swizzle.d.ts         # SwizzleListResponse, SwizzleCopyResponse
    theme.d.ts           # ThemeBuildResponse
    upgrade.d.ts         # UpgradeListResponse, UpgradeRunResponse
    gap-report.d.ts      # GapReportCategoriesResponse, GapReportFileResponse
    index.d.ts           # barrel re-export
  commands/
    component/index.mjs  # uses jsonOut('component.list', ...) etc.
    discover.mjs
    docs.mjs
    template.mjs
    swizzle.mjs
    build-theme.mjs
    upgrade.mjs
    gap-report.mjs
    init.mjs             # no --json (interactive only, fallback hook handles it)
```

### How the fallback hook works

1. Command runs normally
2. If it called `jsonOut()` or `jsonError()`, `process.__xdsJsonHandled` is `true` -> done
3. If not, the `postAction` hook fires and outputs `CLIUnsupportedError`
4. New commands that don't know about `--json` automatically get a clean error

### CI enforcement

- `tsconfig.json-api.json` typechecks `json.mjs` and `parse.mjs` against the `.d.ts` declarations
- `.github/scripts/cli-json-smoke-test.mjs` validates every `--json` command outputs valid JSON with correct envelope shape
- Both run in the `cli-smoke-test.yml` workflow on every PR

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
