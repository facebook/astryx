---
'@astryxdesign/core': patch
---

[fix] Typeahead, Tokenizer: the busy indicator is a Spinner in the field's end lane, and the input keeps its text out from under it (#5555)

Three defects in one block. The indicator a search painted was `<Icon icon="clock">` — a static glyph, in a family where every other input paints busy with a `Spinner`, and where `clock` otherwise means _time_. It was an in-flow item at the row's inline end, which is where each field independently parks its clear button, so the two landed on each other: 17×20px of overlap in Typeahead and 19×20px in Tokenizer. The overlap is visual, not functional — the clear button is positioned, so it paints above the in-flow indicator and stays clickable across the whole covered band. And the combobox never carried `aria-busy`, unlike every sibling input.

The base engine now reports the busy state to the field, which paints it in the one inline-end lane it already owns beside its clear button and end content, and sets `aria-busy` on the input. A caller using `BaseTypeahead` directly is unaffected: it still renders its own visible, named "Loading" status, now a Spinner rather than the clock.

Typeahead puts both controls **in flow**, as ordinary flex siblings of the input, exactly as TextInput does with its own spinner and clear button — an in-flow box takes up room, so the input cannot run under it and there is nothing to measure. Getting there meant dropping `flex-wrap: wrap` from its wrapper, which the shared field base does not set and TextInput does not use: this field holds at most one token, so there is no second row to wrap to, and wrapping is what made an in-flow lane impossible, since flex moves an item to a new line rather than shrinking it. Measured in Chromium: with `flex-wrap` restored and a token too wide to share the row, the end controls drop to a second row and a 280px field grows from 32px to 46px tall. Unwrapped, a long value ellipsizes in the token instead.

Tokenizer's own pre-existing case of the overlap closes with it: at 280px with a token and no search running, its clear button covered 20px of the input's content box, and covers none now.

Tokenizer keeps a measured lane, because it cannot use the in-flow shape: its lane stays pinned to the field's first row while tokens wrap below it, so it has to be out of flow, and an out-of-flow box reserves nothing. Its width is measured with `offsetWidth` rather than `getBoundingClientRect()`. The rect is in viewport space — it carries every CSS transform above the element — while the padding it feeds is in local space, so mixing them broke under any transform: measured in Chromium, `scale(.5)` reserved half of what was needed and put the query back under the controls by 22.83px, and `scale(2)` left the caret in a 202.69px gap. `offsetWidth` is the untransformed border-box width and reports the same number at every scale.

The measurement reaches CSS as a custom property written to the field wrapper, never as React state, so a lane that grows or shrinks repaints without re-rendering the field. Held in state it cost a second commit every time the lane changed size — once as the spinner arrived and once as it left — which doubled the field's commits across a search for a value no JavaScript reads. The observation is shared too, through the same `observeResize` singleton `useTruncation` uses, so a page of fields costs one callback per frame rather than one observer each. The property is `--_tokenizer-end-lane-width`: private and component-named, like every other runtime layout var in the package, and never something a theme writes.

The busy indicator now appears in each field's documented anatomy, delegating its theming to `component:Spinner` rather than gaining a target of its own — the disposition `TextArea`, `CheckboxList` and `CommandPalette` already use for the same part.

@freddymeta
