# @astryxdesign/formentor

Schema-aware forms for Astryx. Describe your data once as a schema, cross it with
the Astryx design system, and get renderable, validated form fields — with full
escape hatches when you need them.

Formentor is not a replacement for Astryx inputs; it's a thin layer on top of
them. You keep `TextInput`, `Selector`, `NumberInput`, and the rest — Formentor
wires them to your schema so you write less glue.

## Install

```
pnpm add @astryxdesign/formentor
```

Peer dependencies: `@astryxdesign/core`, `react`, `react-dom`.

## Quick start

Every form starts from a schema and an input set. The default `XDSInputSet` maps
each schema type to an Astryx component.

```tsx
import {
  useFormentorForm,
  object,
  string,
  XDSInputSet,
} from '@astryxdesign/formentor';

const schema = object({
  properties: {
    email: string({format: 'email'}),
    password: string({format: 'password', minLength: 8}),
  },
});

function LoginForm() {
  const form = useFormentorForm({
    schema,
    inputSet: XDSInputSet,
    onSubmit: value => {
      // `value` is fully typed: { email: string; password: string }
      console.log(value);
    },
  });

  return form.render();
}
```

`form.render()` with no arguments lays out every field in declaration order and
adds a submit button. That's the whole form.

## Defining schemas

Schemas are plain functions. They exist at runtime and carry their own
constraints, so the same object drives validation _and_ rendering.

```tsx
import {
  object,
  string,
  number,
  boolean,
  enumOf,
  omissible,
  nullable,
} from '@astryxdesign/formentor';

const schema = object({
  properties: {
    title: string({minLength: 1, maxLength: 80}),
    quantity: number({minimum: 1, maximum: 99, scale: 0}), // integer 1–99
    subscribe: boolean(),
    priority: enumOf({
      members: [
        {const: 'low', key: 'LOW', title: 'Low'},
        {const: 'high', key: 'HIGH', title: 'High'},
      ],
    }),
    note: omissible(string({format: 'multiline'})), // optional field
  },
});
```

### Field metadata

Pass `title` and `description` in a schema's constraints to control the label and
help text. Without a `title`, Formentor title-cases the field name
(`displayName` → "Display Name").

```tsx
string({title: 'Full Name', description: 'As it appears on your ID'});
```

### Optionality

- `omissible(s)` — the property may be absent from the object (renders as
  "Optional", never required).
- `nullable(s)` — the value may be `null`.

Fields that are neither are treated as required.

## Rendering and customization

Each field is a **renderable**: a component with its props already bound
(`value`, `onChange`, `errorMessage`, `label`, …). You render it in one of three
ways.

### 1. Auto layout

```tsx
return form.render();
```

### 2. Explicit order / custom layout

Destructure the fields you want and render them yourself. Anything you don't
render is simply omitted.

```tsx
const {fields, submitButton} = form;

return form.render({
  children: (
    <>
      {fields.title.render()}
      {fields.priority.render()}
      {submitButton.render()}
    </>
  ),
});
```

### 3. Prop overlay

Pass an object to add or override props on the default input.

```tsx
{
  fields.title.render({placeholder: 'e.g. Ship it'});
}
```

### 4. Render callback (full escape hatch)

Pass a function. It receives the bound props and the default input component, and
whatever you return is what renders. Use this to swap the control entirely.

```tsx
import {RadioList} from '@astryxdesign/core';

{
  fields.priority.render(props => (
    <RadioList
      label={props.label}
      value={props.value}
      onChange={props.onChange}
      items={[
        {value: 'low', label: 'Low'},
        {value: 'high', label: 'High'},
      ]}
    />
  ));
}
```

## View / edit mode

Set `mode` on the form to flip the whole form between an editable and a
read-only presentation. Individual fields can override it via a prop overlay.

```tsx
const form = useFormentorForm({schema, inputSet: XDSInputSet, mode: 'view'});
```

## Validation

Formentor offers a ladder. Use the simplest rung that does the job.

### 1. Schema constraints

Built into the schema (`minLength`, `minimum`, `scale`, `format: 'email'`,
required-ness from optionality). Checked on change and on submit automatically.

### 2. Field-level validation

Pass a `validate` function when rendering a field. It receives the value and
`{pass, fail}` helpers.

```tsx
{
  fields.username.render({
    validate: (value, {pass, fail}) =>
      /^[a-z0-9]+$/i.test(value ?? '')
        ? pass()
        : fail('Letters and numbers only'),
  });
}
```

### 3. Cross-field validation

Use the form-level `validate`. Attach an error to a specific field with its
`valuePath`, or omit the path for a form-level error.

```tsx
const form = useFormentorForm({
  schema,
  inputSet: XDSInputSet,
  validate: (value, {pass, fail}) =>
    value.password === value.confirm
      ? pass()
      : fail({
          message: 'Passwords do not match',
          valuePath: schema.getValuePath().property('confirm'),
        }),
});
```

You can also build the path directly:

```tsx
import {rootPath} from '@astryxdesign/formentor';
// rootPath().property('confirm')
```

### 4. Submit-time async validation

The most powerful rung. Your `onSubmit` receives the fully validated value plus
`{pass, fail, signal}`, where `signal` is an `AbortSignal`. Return `fail(...)` to
surface a server-side error.

```tsx
const form = useFormentorForm({
  schema,
  inputSet: XDSInputSet,
  onSubmit: async (value, {pass, fail, signal}) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify(value),
      signal,
    });
    if (!res.ok) return fail((await res.json()).message);
    return pass();
  },
});
```

While an async submit is in flight, `form.state.isSubmitting` is `true` and the
submit button shows a loading state automatically.

## Form state

`form.state` exposes:

- `values` — the current (partial) form value
- `errors` — a map of field name → error message
- `isSubmitting`, `isSubmitted`, `isValid`, `isDirty`

Use it to drive UI, e.g. disabling submit until valid:

```tsx
{
  submitButton.render();
}
{
  /* already disabled while submitting */
}
{
  !form.state.isValid && form.state.isSubmitted && <p>Fix the errors above.</p>;
}
```

## Accessibility

Because fields render through Astryx `TextInput` / `Selector` / etc., you get
their built-in label association, error wiring (`aria-invalid`,
`aria-describedby`), and required/optional semantics for free. Errors appear only
after a field is touched or the form is submitted.

## Supported schema types (this release)

`string` (incl. `email` / `password` / `multiline` formats), `number`,
`boolean`, `enum`, and single-level `object`. Field arrays, nested objects,
typeahead, and file upload are not in this release.
