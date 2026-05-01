# @xds/cli

The XDS CLI is the primary interface for working with the XDS design system — for humans and machines alike. It provides component documentation, design tokens, page templates, theming tools, and upgrade codemods, all accessible via terminal commands, a typed JSON API, or programmatic imports. AI agents and build tools use the same API that powers the CLI, enabling end-to-end frontend development loops.

```bash
npx xds --help
npx xds component Button
npx xds docs tokens
npx xds template --list
```

## Commands

| Command       | Description                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| `init`        | Initialize XDS in your project — installs packages, sets up theming, adds AI agent docs |
| `component`   | List components or print detailed docs, props, usage examples, and source               |
| `docs`        | Print reference documentation (tokens, theme, color, typography, spacing, etc.)         |
| `template`    | Inject page or block templates into your project                                        |
| `hook`        | List hooks and print hook documentation                                                 |
| `swizzle`     | Copy component source into your project for deep customization                          |
| `upgrade`     | Run codemods to migrate between XDS versions                                            |
| `theme build` | Compile a defineTheme file to production CSS and JS                                     |
| `discover`    | Discover external XDS packages and components                                           |
| `gap-report`  | Report a gap when a component doesn't meet your needs                                   |

### Global options

These flags work with any command:

- `--json` — Output as typed JSON envelope: `{ type, data }`
- `--detail <level>` — Detail level: `full`, `compact`, or `brief`
- `--zh` — Output docs in Chinese Simplified
- `--dense` — Compressed format (token-efficient, useful for AI agents)
- `--lang <locale>` — Language/format shorthand (`en`, `zh`, `dense`)

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

## Programmatic API

The same logic that powers `xds --json` is available as importable, type-safe functions:

```typescript
import {component, docs, discover, template, XDSError} from '@xds/cli/api';

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

### Consumer utilities

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

| Command                                   | Type                        | Response                          |
| ----------------------------------------- | --------------------------- | --------------------------------- |
| `xds --json component [--list]`           | `component.list`            | `ComponentListResponse`           |
| `xds --json component --detail brief`     | `component.brief`           | `ComponentBriefResponse`          |
| `xds --json component <name>`             | `component.detail`          | `ComponentDetailResponse`         |
| `xds --json component <name> --props`     | `component.detail.props`    | `ComponentDetailPropsResponse`    |
| `xds --json component <name> --source`    | `component.detail.source`   | `ComponentDetailSourceResponse`   |
| `xds --json component <name> --showcase`  | `component.detail.showcase` | `ComponentDetailShowcaseResponse` |
| `xds --json component <name> --blocks`    | `component.detail.blocks`   | `ComponentDetailBlocksResponse`   |
| `xds --json discover`                     | `discover.list`             | `DiscoverListResponse`            |
| `xds --json discover @scope/name`         | `discover.detail`           | `DiscoverDetailResponse`          |
| `xds --json discover @scope/name/Comp`    | `discover.detail.doc`       | `DiscoverDetailDocResponse`       |
| `xds --json discover <search>`            | `discover.search`           | `DiscoverSearchResponse`          |
| `xds --json docs`                         | `docs.list`                 | `DocsListResponse`                |
| `xds --json docs <topic>`                 | `docs.detail`               | `DocsDetailResponse`              |
| `xds --json docs <topic> <section>`       | `docs.detail.section`       | `DocsDetailSectionResponse`       |
| `xds --json template [--list]`            | `template.list`             | `TemplateListResponse`            |
| `xds --json template <name>`              | `template.show`             | `TemplateShowResponse`            |
| `xds --json template <name> --skeleton`   | `template.skeleton`         | `TemplateSkeletonResponse`        |
| `xds --json template <name> [path]`       | `template.copy`             | `TemplateCopyResponse`            |
| `xds --json hook [--list]`                | `hook.list`                 | `HookListResponse`                |
| `xds --json hook <name>`                  | `hook.detail`               | `HookDetailResponse`              |
| `xds --json swizzle [--list]`             | `swizzle.list`              | `SwizzleListResponse`             |
| `xds --json swizzle <component>`          | `swizzle.copy`              | `SwizzleCopyResponse`             |
| `xds --json theme build <file>`           | `theme.build`               | `ThemeBuildResponse`              |
| `xds --json upgrade --list`               | `upgrade.list`              | `UpgradeListResponse`             |
| `xds --json upgrade [--apply]`            | `upgrade.run`               | `UpgradeRunResponse`              |
| `xds --json gap-report --list-categories` | `gap-report.categories`     | `GapReportCategoriesResponse`     |
| `xds --json gap-report --component X ...` | `gap-report.file`           | `GapReportFileResponse`           |
| any error                                 | —                           | `CLIError`                        |
| unsupported command                       | —                           | `CLIUnsupportedError`             |

## Configuration

The CLI reads from an optional `xds.config.mjs` in your project root:

```javascript
export default {
  templates: {
    get: async id => fetchTemplateFromAPI(id),
  },
  gapReport: {
    url: 'https://your-api.com/gaps',
  },
};
```
