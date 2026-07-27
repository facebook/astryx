---
'@astryxdesign/cli': minor
---

[breaking] cli/json: remove the central `CLIAnyResponse`, `CLIResponseType`, and `CLIResponseDataMap` types. `jsonOut` is now a structural serializer and `parseResponse` / `assertResponse` return the structural `CLIResponse` (`{type, data, meta?}`) instead of the discriminated union, so `result.data` is `unknown` until you narrow it yourself.

Runtime output is unchanged (every `--json` envelope is byte-identical). This only affects consumers importing those types or relying on `parseResponse` / `assertResponse` to auto-narrow `.data`.

To keep discriminated-union narrowing, rebuild it from the individual per-command response types, which are still exported from `@astryxdesign/cli/json`:

```typescript
import type {
  ComponentDetailResponse,
  ComponentListResponse,
  DocsListResponse,
  // ...import the responses you consume
} from '@astryxdesign/cli/json';

// Reconstruct the union you care about (replaces CLIAnyResponse):
type MyResponse =
  ComponentDetailResponse | ComponentListResponse | DocsListResponse;

// Narrow parseResponse output by casting to your union:
const raw = parseResponse(stdout);
if (!isError(raw)) {
  const r = raw as MyResponse;
  if (r.type === 'component.detail') r.data.name; // ✅ narrowed
}

// Or wrap assertResponse for narrowing at the call site:
function assertTyped<T extends MyResponse['type']>(raw: unknown, type: T) {
  return assertResponse(raw, type) as Extract<MyResponse, {type: T}>;
}
```

@josephfarina
