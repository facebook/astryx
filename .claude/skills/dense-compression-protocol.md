# Astryx Translation Protocol

Apply this protocol to create a dense translation for an Astryx component `.doc.mjs` file. The dense translation lives in the same file as a `docsDense` export and is the source the CLI reads when called with `--lang dense`.

## Purpose

Produce a `docsDense` `TranslationDoc` that compresses the prose of a component's `docs` export while preserving every piece of guidance an agent needs to call the API correctly. Dense is a translation, not a different document — same information, fewer tokens.

## TranslationDoc Shape

```js
/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'compressed component description',
  features: ['compressed feature 1', 'compressed feature 2'],
  notes: ['compressed note 1', 'compressed note 2'],
  accessibility: ['compressed a11y item 1'],
  keyboard: 'compressed keyboard string',
  // 1:1 with docs.usage.bestPractices — same length, same order
  usage: {
    bestPractices: [
      {guidance: true, description: 'compressed Do bullet 1'},
      {guidance: true, description: 'compressed Do bullet 2'},
      {guidance: false, description: "compressed Don't bullet 1"},
    ],
  },
  propDescriptions: {
    label: 'compressed desc',
    variant: 'compressed desc',
  },
  components: [
    {
      name: 'DialogHeader',
      description: 'compressed sub-component desc',
      propDescriptions: {title: 'compressed desc'},
    },
  ],
};
```

## Compression Rules

Drop:

- Articles (`a`, `the`, `an`)
- Filler verbs (`is used for`, `provides`, `supports`, `displays`, `whether`)
- Subject when context is obvious

Use fragments, not full sentences. Shorthand: `w/`, `w/o`, `+` for "and", `;` for clause break, `/` for tight lists.

## Hard Rules — What MUST Be Preserved

### 1. Counts must match

- `bestPractices` length = `docs.usage.bestPractices` length (1:1, never pack two bullets into one)
- `features` length = `docs.features` length
- `notes` length = `docs.notes` length
- `accessibility` length = `docs.accessibility` length
- `components` length = `docs.components` length
- `propDescriptions` has an entry for every prop in `docs.props` that has a description (except universal: `children`, `ref`, `key`, `style`, `className`, `xstyle`)

### 2. Signal words — keep these even when compressing

These words change _behavior_. They must survive compression.

| Category               | Words                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Conditionals           | `if`, `when`, `unless`, `only`                                                        |
| Constraints            | `must`, `cannot`, `never`, `always`, `required`                                       |
| Cross-references       | `instead`, `instead of`, plus full component+prop refs like `ChatMessage's name prop` |
| Defaults & inheritance | `defaults to`, `override`, `inherit`, `context`, `automatically`                      |
| Accessibility          | `keyboard`, `accessibility`, `aria-*`, `role=`                                        |

❌ Bad: "use on first bubble in message"  
✅ Good: "use on first bubble; **if** first child is raw, use ChatMessage's `name` **instead**"

### 3. Cross-component references survive

If full prose says "use Foo's `bar` prop instead", dense MUST keep both the component name (`Foo`) and the prop name (`bar`) and the relationship word (`instead`).

### 4. (required) markers preserved

Required props must say so in dense propDescriptions, e.g. `'<desc> **(required)*'` or include `required: true` in the prop entry. Required guidance is load-bearing.

### 5. Sub-components are not optional

If `docs.components` includes hooks like `useImperativeDialog` or `useTableSelectionState`, `docsDense.components` must include them too. Hooks are part of the API.

## What NEVER Changes

- Prop names, types, defaults — these stay in `docs`, not in the translation
- Example code — stays in `docs`
- Sub-component names — copy exactly from `docs.components[n].name`

## Coverage Rule

**Every component in `packages/core/src/` MUST have a `docsDense` export.** The CLI silently falls back to English when missing — the user has no way to know dense mode isn't actually compressed. There is no "optional" tier.

## Common Mistakes to Avoid

These patterns score as fidelity loss in vibe tests against the protocol. Do not do them.

### ❌ Synonym swaps that lose meaning

| Wrong (loses meaning)                                     | Right (keeps signal)                                |
| --------------------------------------------------------- | --------------------------------------------------- |
| `instead of X` → `not X`                                  | `instead of X` → keep `instead`                     |
| `when X` → implicit (drop it)                             | `when X` → `if X` or keep `when`                    |
| `must` → drop word entirely                               | keep `must` or use `req'd`                          |
| `always provide X` → `provide X`                          | keep `always`                                       |
| `never` → `don't` (when prose already starts with Don't:) | keep both: "Don't: never X" reads fine; or use `no` |

The signal words list isn't suggestion — every word in it changes behavior. `instead` says "use this alternative." Replacing it with `not` or `,` removes the recommendation pointer.

### ❌ Truncating component names

| Wrong                                             | Right          |
| ------------------------------------------------- | -------------- |
| `ChatSystemMessage` → `SystemMessage`             | keep full name |
| `ChatMessageBubble` → `MessageBubble` or `bubble` | keep full name |
| `ChatMessage's name prop` → `bubble's name`       | keep full ref  |

Cross-refs to other components MUST keep the full PascalCase component name. The name is how an agent reaches the docs for it. `MessageBubble` is unsearchable; `ChatMessageBubble` is.

The only acceptable shortening: in the second mention within the SAME bullet, you may drop the family prefix. First mention always full.

❌ Bad: "Don't use SystemMessage for sender content. Use ChatMessage instead."  
✅ Good: "Don't use ChatSystemMessage for sender content. Use ChatMessage instead."  
✅ Also fine: "Don't use ChatSystemMessage for sender content. Use ChatMessage instead — SystemMessage is for status only."

### ✅ Acceptable compressions

These don't lose meaning:

- "tightens the corner radius" → "tightens corner radius" (drop article)
- "the sender's name" → "sender name"
- "and provides X" → "+ X"
- "with X and Y" → "w/ X + Y"
- "or" → "/" (in tight lists like "first/middle/last")
