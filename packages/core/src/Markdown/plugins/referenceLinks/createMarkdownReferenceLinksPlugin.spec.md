---
schema_version: 3
template_version: 1
kind: module
id: module:Markdown/createMarkdownReferenceLinksPlugin
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, performance]
verified_by: [scripts/check-knowledge.mjs]
parent_component: component:Markdown
references:
  [
    family:navigation-destinations,
    architecture:public-component-api,
    architecture:component-test-sufficiency,
    spec:AST-036/DEC-1,
  ]
---

# createMarkdownReferenceLinksPlugin module contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `createMarkdownReferenceLinksPlugin({prefixes})` returns one colocated `text` plugin. Callers provide explicit public prefix definitions for standalone numeric references such as `BUG-123` or `DOC123`.                                                                                                                                                                                                                                                                                                                              |
| Behavior                | Indexed prefix matching runs only on remaining built-in prose, preserves the exact visible/copyable token, and sends resolved destinations through Markdown's existing Link/navigation policy. Invalid/refused destinations stay literal.                                                                                                                                                                                                                                                                                              |
| End-user impact         | Readers get consistent links for configured references without links inside code/existing links or changes to heading/Outline text. Copying still yields the authored token.                                                                                                                                                                                                                                                                                                                                                           |
| Builder impact          | Builders configure prefixes, numeric boundaries, and a synchronous destination resolver; no preprocessing, network lookup, registry, or custom AST node is required.                                                                                                                                                                                                                                                                                                                                                                   |
| Compatibility/readiness | Draft and unimplemented. This is the canonical initial `text` module and the migration exemplar for `inlinePlugins`; soft deprecation waits for exact parity, adapter, docs, codemod, and performance evidence.                                                                                                                                                                                                                                                                                                                        |
| Review checks           | Reject hardcoded product prefixes, network/global lookup, catastrophic or per-prefix-per-character regex scans, matches inside code/links/protected nodes, changed visible text, bypassed Link policy, AST nodes for display-only references, or ambiguous overlap/order.                                                                                                                                                                                                                                                              |
| Governing rules         | [`component:Markdown`](../../Markdown.spec.md); [`spec:AST-036`](../../../../../../docs/specs/AST-036/spec.md); [`family:navigation-destinations`](../../../../../../docs/families/navigation-destinations.md); [AST-002 FR4 — Existing composition and styling seams come first](../../../../../../docs/specs/AST-002/spec.md); [AST-002 FR8 — The result is predictable](../../../../../../docs/specs/AST-002/spec.md); [AST-002 FR15 — Invalid states are prevented where practical](../../../../../../docs/specs/AST-002/spec.md). |

This table is a review projection; the body below is authoritative.

## Intent

`createMarkdownReferenceLinksPlugin` turns explicitly configured standalone
prefix-plus-number tokens into Markdown links without preprocessing source or
creating a semantic AST node. It is the first-party `text` capability exemplar and
the before/after migration target for released `inlinePlugins` use cases where
visible/source meaning is unchanged.

Consumer signatures and reference examples belong in the eventual
`createMarkdownReferenceLinksPlugin.doc.mjs`; this draft owns behavior and evidence.

## Compatibility and migration

- Released default preserved: `yes`; the module is opt-in.
- Compatibility class: additive colocated `text` module.
- Migration decision: no `inlinePlugins` deprecation until exact parity, synthetic
  final adaptation, docs, codemod, and performance evidence exist.
- No network, registry, or first-party product-prefix catalog exists.

## Ownership boundary

**Owns**

- The factory, explicit prefix definitions, standalone-token matching, deterministic
  prefix order, destination resolution, literal fallback, and module performance.
- Link creation through existing Markdown Link/navigation plumbing.
- The canonical `inlinePlugins` migration example for display-only reference links.

**Does not own / non-goals**

- Product-specific prefixes, destinations, permissions, fetching, entity display,
  hovercards, or a global reference registry.
- Structured references whose source semantics change headings/Outline; those use
  `syntax.inline`, `toText`, and a renderer.
- Links in inline/fenced code, existing links, images, citations, other protected
  nodes, or arbitrary source preprocessing.

## Public API and concepts

```ts
export interface MarkdownReferencePrefix {
  readonly prefix: string;
  /** Default: "-". Use "" for forms such as DOC123. */
  readonly separator?: '-' | '';
  /** Default: 1. */
  readonly minimumDigits?: number;
  /** Default: "non-word". */
  readonly beforeBoundary?: 'non-word' | 'whitespace';
  /** Default: "non-word". */
  readonly afterBoundary?: 'non-word' | 'whitespace';
  readonly resolveHref: (reference: {
    token: string;
    prefix: string;
    number: string;
  }) => string | null;
}

export interface CreateMarkdownReferenceLinksPluginOptions {
  readonly prefixes: readonly [
    MarkdownReferencePrefix,
    ...MarkdownReferencePrefix[],
  ];
}
```

Prefix order is caller-authored and stable. Omitted `separator` means `"-"`;
omitted `minimumDigits` means `1`; omitted before/after boundaries mean
`"non-word"`, where an adjacent Unicode letter, number, or underscore blocks the
match. `"whitespace"` is the stricter option and accepts only source start/end or
Unicode whitespace on that side. Callers cannot supply regular expressions.

## Behavioral contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                             | Evidence state                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| FR1  | The factory returns one `text` plugin exported from Markdown/Core. It has no syntax, fence, renderer, decoration, network, or registry capability.                                                                                                                                                                                                    | Type/export evidence pending.         |
| FR2  | Prefix definitions are explicit non-empty public strings. Omitted `separator` is `"-"`, omitted positive finite `minimumDigits` is `1`, and omitted before/after boundaries are `"non-word"`; callers may choose empty separator or stricter `"whitespace"` boundaries. Duplicate exact definitions fail; overlapping prefixes preserve caller order. | Validation evidence pending.          |
| FR3  | Matching recognizes a configured prefix plus at least the configured decimal digit count as one standalone token. Under `"non-word"`, adjacent Unicode letters/numbers/underscore prevent a match; under `"whitespace"`, only source edge or Unicode whitespace passes. Punctuation outside the token remains prose.                                  | Boundary evidence pending.            |
| FR4  | Matching runs only on remaining built-in prose in the shared text phase. It never runs inside inline/fenced code, existing links, images, citations, extension nodes, or other protected nodes.                                                                                                                                                       | Context evidence pending.             |
| FR5  | The exact authored token is the visible link text and copyable text. No normalization, label substitution, hidden semantic node, or heading/Outline text change occurs.                                                                                                                                                                               | Render/copy/Outline evidence pending. |
| FR6  | For a match, `resolveHref` runs synchronously with the exact token/prefix/number. A non-string, empty, thrown, unsafe, or refused destination leaves the exact token as literal text and emits no navigation sink.                                                                                                                                    | Failure/security evidence pending.    |
| FR7  | An accepted destination renders through Markdown's existing Link component, router substitution, click handling, and navigation policy. The plugin does not create a raw anchor or duplicate URL sanitization.                                                                                                                                        | Link-family evidence pending.         |
| FR8  | Text plugins resolve in shared plugin/contribution order. Within this module, configured prefix order breaks an otherwise identical start; the first complete valid match claims the token. Prefix overlap never depends on object-key order or regex alternation behavior.                                                                           | Collision evidence pending.           |
| FR9  | The matcher compiles/indexes prefixes once per stable configuration and scans prose by prefix candidates. It does not run every prefix regex at every character, construct catastrophic caller-derived regex, or perform network/async work.                                                                                                          | Performance evidence pending.         |
| FR10 | Invalid plugin configuration fails before rendering. Invalid or refused per-token destinations degrade locally to literal source without affecting sibling prose/links.                                                                                                                                                                               | Failure isolation pending.            |

### Performance and resources

- Compile a trie/prefix index or equivalent bounded matcher once per stable options
  identity.
- Benchmark long prose with many nodes and zero matches, frequent matches,
  overlapping prefixes, short/long digit runs, Unicode boundaries, and rerenders.
- Core/module work scales with prose length plus candidates/matches, not prose length
  multiplied by configured prefix count.
- Destination resolution is synchronous, local, and called only after a valid token
  match.

## Accessibility contract

- The exact token remains the link's accessible and visible name unless the host's
  existing Link contract adds standard context.
- Link semantics, focus, keyboard activation, router behavior, external-link
  behavior, and blocked destination handling remain with Markdown/Link.
- Literal fallback is indistinguishable from ordinary authored prose and remains
  selectable/copyable.

## Migration from inlinePlugins

Before:

```tsx
<Markdown
  inlinePlugins={[
    {
      pattern: /\bBUG-(\d+)\b/g,
      render: (match, key) => (
        <Link key={key} href={`/bugs/${match[1]}`}>
          {match[0]}
        </Link>
      ),
    },
  ]}>
  {source}
</Markdown>
```

After:

```tsx
const bugLinks = createMarkdownReferenceLinksPlugin({
  prefixes: [
    {
      prefix: 'BUG',
      separator: '-',
      minimumDigits: 1,
      resolveHref: ({number}) => `/bugs/${number}`,
    },
  ],
});

<Markdown plugins={[bugLinks]}>{source}</Markdown>;
```

The codemod applies only when a legacy entry matches this recognized static pattern
and link shape. Other `inlinePlugins` remain on the compatibility adapter for manual
migration.

## Design relationships

| Anatomy or state  | Design requirement                                                                | Representation authority                               | Module contract |
| ----------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------- |
| Reference link    | Preserves the exact token while using existing Link semantics and focus behavior. | This module selects destination; Markdown/Link renders | FR5–FR7         |
| Literal fallback  | Remains ordinary selectable/copyable prose.                                       | `component:Markdown`                                   | FR6, FR10       |
| Protected context | Code, links, images, citations, and extension nodes remain unchanged.             | AST-036 phase contract                                 | FR4             |

No direct theme target or alternate visual label is introduced.

## Parent and system relationships

- AST-036 owns text phase ordering, plugin identity/indexing, legacy synthetic-last
  adaptation, and soft-deprecation gates.
- `family:navigation-destinations` and Markdown's Link path own accepted/refused URL
  behavior.
- This module owns only configured token recognition and destination requests.

## Verification map

| Contract   | Required evidence                           | Representative states                                                                                           | Failure signal                                                                                                          |
| ---------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| FR1–FR2    | Public type/export and invalid-config tests | static plugin; empty/duplicate/overlapping prefix; separators/minimum digits                                    | Wrong capabilities appear, invalid config renders, or prefix order is unstable.                                         |
| FR3–FR5    | Parser/render/copy/Outline context matrix   | `BUG-123`, `DOC123`; punctuation; Unicode/alphanumeric adjacency; heading; emphasis; code; link; image/citation | Protected text links, boundaries overmatch, visible/copy text changes, or heading/Outline diverges.                     |
| FR6–FR7    | Link-policy/failure integration tests       | safe relative/external; empty/unsafe/refused; resolver throw; router; onLinkClick                               | Raw anchor/sanitizer is duplicated, unsafe navigation activates, or fallback loses text.                                |
| FR8–FR10   | Collision, failure, and performance suite   | plugin order; `DOC`/`DOCS`; many prose nodes/no matches; many prefixes; frequent matches; rerender              | Claim order changes, one bad token breaks siblings, every regex scans every character, or matching becomes superlinear. |
| Migration  | Legacy parity and codemod fixtures          | recognized reference-link entry; overlapping legacy plugins; unsupported custom render                          | Migrated output/order changes or codemod rewrites an unsupported case.                                                  |
| Structural | `pnpm check:knowledge` and parent backlink  | canonical colocated module/public name                                                                          | Module is orphaned, misnamed, or duplicated.                                                                            |

## Decision log

### DEC-1 — Reference links are a text capability

**Reference:** `module:Markdown/createMarkdownReferenceLinksPlugin/DEC-1`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

The exact visible/source token does not change meaning, so the module uses `text`
rather than a custom AST node. Prefix definitions are explicit caller data and links
flow through existing Markdown navigation.

Rejected: source preprocessing, generic syntax nodes, hardcoded product prefixes,
network lookup, raw anchors, or a registry.

### DEC-2 — Use the module as the safe inlinePlugins migration exemplar

**Reference:** `module:Markdown/createMarkdownReferenceLinksPlugin/DEC-2`
**Direction owner:** `cixzhang`, `2026-09-13`; exact-head approval pending

After text parity and synthetic-last adaptation exist, the module supplies the
recognizable before/after docs and codemod path for prefixed numeric reference links.
Unsupported custom legacy plugins remain compatible and migrate manually.

Rejected: deprecating first, changing precedence, or codemodding arbitrary render
callbacks whose intent cannot be proven.

## Open questions

None. The module remains draft and unimplemented pending exact-head approval.

## Content boundary

This record does not duplicate shared text-phase mechanics, Link URL policy,
consumer reference tables, or implementation architecture. Those stay with AST-036,
the navigation family, eventual `.doc.mjs`, and implementation evidence.
