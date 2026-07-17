# Authoring an Astryx integration

> **Status:** working notes. This should eventually move to the public wiki
> alongside the rest of the integration-authoring guidance; it lives here for
> now so it ships and is versioned with the CLI.

An **integration** is an npm package that contributes components, templates, or
codemods to a consumer's design-system workflow. It declares its contributions
in a root `astryx.integration.{ts,mjs,js}` manifest sibling to its
`package.json`:

```js
// astryx.integration.mjs
export default {
  components: './components',
  templates: './templates',
  codemods: './codemods',
  issuesUrl: 'https://github.com/acme/widgets/issues',
};
```

## Block templates ship TypeScript source

Integration packages in this ecosystem ship **TypeScript source** — a block
template is a `.tsx` file (plus a same-stem `.template.{ts,mjs,js}` doc), with
**no compiled `.d.ts`**. Consumers run their own bundler (Next.js/Turbopack,
Vite, esbuild) and type-check with `moduleResolution: bundler`.

A block template lives under the declared `templates` root as a pair:

```
templates/
  Gauge/
    GaugeShowcase.template.ts   # the template-spec doc (createBlockTemplate)
    GaugeShowcase.tsx           # the same-stem source a preview import()s
```

## Requirement: export your block templates for deep import

Tooling renders showcase/template previews by a **real dynamic `import()`** of a
block's `.tsx` source — no `eval`, no reading-source-as-text. For that
`import()` to resolve, your `package.json#exports` map must **gate the deep
path**. Node/bundler resolution will refuse `@acme/widgets/templates/…` unless an
`exports` entry matches it.

### Canonical recipe

Add this single entry to your integration's `package.json`:

```jsonc
{
  "exports": {
    // …your existing entries…
    "./templates/*.tsx": "./templates/*.tsx",
  },
}
```

and let consumers (and generated import maps) import **with the `.tsx`
extension**:

```ts
import('@acme/widgets/templates/Gauge/GaugeShowcase.tsx');
```

This is the **minimal** form that satisfies _both_ gates:

| Recipe                                         | Import shape                    | `tsc --noEmit` (bundler) | bundler build |
| ---------------------------------------------- | ------------------------------- | :----------------------: | :-----------: |
| **`"./templates/*.tsx": "./templates/*.tsx"`** | **`…/GaugeShowcase.tsx`** (ext) |          **✅**          |    **✅**     |
| `"./templates/*.tsx": "./templates/*.tsx"`     | `…/GaugeShowcase` (no ext)      |       ❌ `TS2307`        |      ❌       |
| `"./templates/*": "./templates/*"`             | `…/GaugeShowcase.tsx` (ext)     |      ❌ `TS5097`\*       |      ✅       |
| `"./templates/*": "./templates/*"`             | `…/GaugeShowcase` (no ext)      |       ❌ `TS2307`        |      ❌       |
| _(no exports map)_                             | either                          |            ❌            | ✅ (unscoped) |

\* A bare `./templates/*` mapping does not tell TypeScript the resolved file is a
`.tsx`, so importing with the extension trips `TS5097` ("An import path can only
end with a '.tsx' extension when 'allowImportingTsExtensions' is enabled"). The
extensionful `./templates/*.tsx` entry is what lets TS accept the `.tsx` import
**without** requiring consumers to set `allowImportingTsExtensions` — the
extension is legitimized by the matched `exports` pattern. This is why the
extensionful export is the canonical choice: it type-checks against an
**unmodified** consumer tsconfig (the profile used by the repo's Next.js example
apps).

### Why the extension is unavoidable (without a barrel)

Because integration packages ship raw `.tsx` with no `.d.ts`, `moduleResolution:
bundler` will not silently append `.tsx` to a bare deep specifier — an
extensionless import of `@acme/widgets/templates/Gauge/GaugeShowcase` fails to
type-check (`TS2307`) and fails to bundle regardless of the exports map. The
resolvable, type-checking shape is the **extensionful** one.

### Optional: a no-extension barrel

If you want consumers to import **without** an extension, ship an index barrel
per block and export the directory:

```jsonc
{"exports": {"./templates/*": "./templates/*/index.ts"}}
```

```ts
// templates/Gauge/index.ts
export {default} from './GaugeShowcase'; // no extension — resolved by the bundler
```

```ts
import('@acme/widgets/templates/Gauge'); // clean, extensionless
```

This type-checks under bundler resolution and bundles. The trade-off: it adds a
hand-written (or generated) barrel file per block, and — like the direct `.tsx`
recipe — it still requires a bundler/loader to _execute_ the TS source (raw
`node` cannot type-strip files inside `node_modules`;
`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`). For **generated import maps**,
prefer the direct extensionful recipe: it needs no per-block barrel and no build
step in the integration package.

## Recommended import shape for generated code

**Emit the extensionful, direct form:**

```ts
import('@acme/widgets/templates/Gauge/GaugeShowcase.tsx');
```

paired with the canonical `"./templates/*.tsx": "./templates/*.tsx"` export. It is the
one shape that resolves for a real bundler `import()` **and** type-checks under
an unmodified `moduleResolution: bundler` consumer tsconfig, with no barrel
files to generate and no `allowImportingTsExtensions` opt-in required of
consumers.

## Hazard for consumers of `exports` (stale entries)

A star pattern like `./templates/*.tsx` is resolved **structurally** — Node's
`import.meta.resolve` returns a path for
`@acme/widgets/templates/Gauge/GaugeShowcase.tsx` even if that file has since been
**deleted** (it only throws when you actually load it). A generator or consumer
that walks a package's declared block exports must therefore **tolerate and skip
dead entries**: verify the target exists on disk (or catch the load failure)
before emitting an `import()` for it. Do not assume every listed/expected export
target is present.
