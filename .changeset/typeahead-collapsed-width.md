---
'@astryxdesign/core': patch
---

[fix] Typeahead: the field keeps its width when a value is selected, and the value stays out of the end controls (#5560)

Two halves of one promise from the input-field family contract
(`docs/families/input-fields.md`): **FR1**, a field's available width does not
change because its value did; and **FR2**, a visible end affordance does not have
field content painted under it.

**FR1 — the input keeps its place.** Every other field in the family gets a
stable width for free: the `<input>` stays in flow, and the field is as wide as
the input's own intrinsic width. Typeahead took the input out of flow and zeroed
its width while a token showed, so the field was left measuring the token. In any
shrink-to-fit parent it snapped to the value's length. Block-level parents hid
it, because they fill their container whatever their content is, which is why no
story caught it. The input now keeps its place in the row and its own width — it
is only made invisible and inert — and the token is painted over that space
rather than beside it. In flow the token would add its own width instead, which
is the same value-dependent sizing from the other direction: a long value would
grow the field.

**FR2 — the value is bounded by a content lane.** The input and the token share
a content lane: an ordinary flex item, `flex: 1` with `min-width: 0`, that ends
exactly where the end lane begins. That is TextInput's own arrangement — the lane
takes the free space so the end controls sit in the corner, and yields all of it
when the field is narrow, so a narrow field cannot overflow. The token is
anchored at both of the lane's inline edges, so a long value ellipsizes at the
lane's edge instead of reaching the controls. Positioned against the whole field
instead, as the first revision of this change did, it had no idea where those
controls start.

Measured in Chromium. Widths are the field's border box, field in a `max-content`
parent, `Field.width` otherwise unset:

|                                   | empty | short value | long value   |
| --------------------------------- | ----- | ----------- | ------------ |
| TextInput (family baseline)       | 199px | 227px       | 227px        |
| Typeahead before                  | 199px | **54.7px**  | **224.09px** |
| Typeahead after                   | 199px | 223px       | 223px        |
| Typeahead in `InputGroup`, before | 397px | **252.7px** | **422.09px** |
| Typeahead in `InputGroup`, after  | 397px | 421px       | 421px        |

The 24px between the empty and valued columns is the clear button entering the
row — ordinary for any field whose clear is conditional, it does not vary with the
value, and TextInput's is 28px.

Overlap is the value's trailing edge past the clear button's leading edge; escape
is how far the value reaches past the field's border. The middle column is this
change's own first revision, which fixed the width and made the overlap worse:

| field, long value | overlap on main | first revision | now             |
| ----------------- | --------------- | -------------- | --------------- |
| shrink-to-fit     | 12px            | 28.09px        | none, 7px clear |
| in `InputGroup`   | 12px            | 33px           | none, 7px clear |
| 220px             | 12px            | 31.09px        | none, 7px clear |
| 180px             | 12px            | 33px           | none, 7px clear |
| 140px             | 12px            | 33px           | none, 7px clear |
| escape, 140–220px | none            | up to 4px      | none            |

No new API and no constants. An earlier revision floored the field with a
`--typeahead-min-width` public var defaulting to 200px, which review rightly
rejected: it was a second sizing contract beside the documented `Field.width`
prop, it was hand-derived (the empty field measures 199, so the floor overshot by
1), `InputGroup` cancelled it, and it could not help `Tokenizer`. Nothing here
states a width; the lane's `min-width: 0` is the opposite of a floor.

`Tokenizer` is **not** fixed here. It shares the family promise and breaks it —
199px empty to 114.7px with one token, in the same probe — but by a different
mechanism: its tokens are in flow and wrap, and its input deliberately becomes a
40px continuation lane after them, so what a wrapping multi-value field's width
should be is a design question rather than this bug. Its numbers are identical
before and after this change.

@freddymeta
