# XDS Dense Compression Protocol

Apply this protocol to compress the given XDS component `.doc.mjs` file.

## Task

Read the `docs` export. Produce a tweet-format dense string. Replace `docsDense` with it.

## Output Format

Line 1: `import{XDSName}from'@xds/core/Path' //6 word max description`

Then sections in this EXACT order (skip any that don't exist in original):

1. Top-level P lines (if docs.props exists)
2. For each sub-component (if docs.components exists):
   - C line with name + description
   - P lines for that sub-component's props
   - X lines for that sub-component's examples
3. Top-level X lines (docs.examples)
4. A line (accessibility)
5. K line (keyboard)
6. N line (notes + features)

| Prefix | Content       | Rules                                                                                              |
| ------ | ------------- | -------------------------------------------------------------------------------------------------- |
| P      | Props         | `P name:type='default' desc \| name:type desc` Group related props with \|. ALL props must appear. |
| C      | Sub-component | `C Name //short desc` followed by its P and X lines                                                |
| A      | Accessibility | `A item1\|item2\|item3` ALL items on ONE line with \|                                              |
| X      | Examples      | `X <JSX/> \| <JSX/>` Minimum lines. JSX UNCHANGED.                                                 |
| K      | Keyboard      | `K Key=action;Key=action`                                                                          |
| N      | Notes         | `N note1\|note2\|note3` ALL notes+features on ONE line with \|                                     |

No blank lines between sections.

## Import Name Rule

The import name is `XDS` + `docs.name`. Examples:

- docs.name = 'Button' → `import{XDSButton}from'@xds/core/Button'`
- docs.name = 'DateInput' → `import{XDSDateInput}from'@xds/core/DateInput'`
- docs.name = 'Switch' → `import{XDSSwitch}from'@xds/core/Switch'`

## Example Deduplication

When the same JSX code appears in both top-level `docs.examples` and a sub-component's `components[n].examples`, include it ONLY ONCE at whichever level it first appears. Do not duplicate.

Count unique examples, not total appearances.

## What to Compress (prose only)

- Component description → 6 word max fragment after //
- Prop descriptions → fragment after type/default, drop articles + filler
- Feature strings → fold into N segments (or skip if already covered by a prop description)
- Note text → keep meaning, compress to fragments
- Accessibility text → keep meaning, compress to fragments
- Example labels → dropped (JSX is self-documenting)

Compression shorthand: w/ w/o + → ; no articles (a/the/an). No filler (is used for/provides/supports/displays/whether/when set to). Fragments only.

## What NEVER Changes (copy verbatim)

- Prop names
- Type signatures (exact characters)
- Default values (exact characters)
- JSX code in examples (every character, every space, every newline flattened to one line)
- Import paths

## What NEVER Gets Removed

Every single one of these must appear in your output:

- Every prop (count them)
- Every unique example (count them after dedup)
- Every note (count them, each becomes one N segment)
- Every accessibility item (count them)
- Every keyboard shortcut
- Every sub-component and ALL its props
- Every feature (fold into N, or skip if covered by prop desc)

## Prop Line Rules

- Mark required props with ! after type: `P name:type! desc`
- Skip description for obvious props: isDisabled, children, className
- Group 2-3 related props per P line with |
- Props with long type signatures can be alone on their line
- ALL props must be listed. No limit.

## Sub-Component Rules

- `C Name //desc` on its own line
- Followed by P lines for that sub-component's props
- Then X lines for that sub-component's examples
- Then next C section (or top-level X/A/K/N)

## Example (X) Line Rules

- Flatten multi-line JSX to single line
- Separate short examples with | on same X line
- Long JSX examples get their own X line
- NEVER modify JSX code. Copy it exactly.

## Template Literal Escaping

The output goes inside a JS template literal (\`...\`). Escape:

- \` → \\`
- ${ → \\${

## Mandatory Verification

Before writing the file, count and verify:

```
ORIGINAL: [N] props (list names), [N] unique examples, [N] notes, [N] features, [N] a11y, [N] kbd, [N] sub-components
OUTPUT:   [N] props (list names), [N] unique examples, [N] N-segments, [N] a11y, [N] kbd, [N] sub-components
PROPS MATCH: yes/no
EXAMPLES MATCH: yes/no (after dedup)
```

If prop or example counts don't match, fix before writing.

## File Edit

Replace or add the `docsDense` export:

```js
/** @type {string} */
export const docsDense = `<your compressed output>`;
```

Do NOT touch `docs` or `docsZh` exports.
