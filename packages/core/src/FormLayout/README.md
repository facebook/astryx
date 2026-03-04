# FormLayout

A spatial layout container for arranging form fields with consistent spacing and direction.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Three Layout Modes**: Vertical (default), horizontal, and horizontal-labels
- **Direction Context**: Provides layout direction to children via React context
- **Responsive**: Horizontal-labels collapses to vertical on narrow viewports (≤480px)
- **Nestable**: FormLayout inside FormLayout works naturally — inner overrides context
- **Purely Spatial**: Does not manage form state or render `<form>` — form submission is separate
- **Styled with StyleX**: Uses XDS design tokens for consistent spacing

## Components

### XDSFormLayout

Arranges form fields with consistent spacing and direction.

```tsx
<XDSFormLayout direction="vertical">
  <XDSTextInput label="Name" value={name} onChange={setName} />
  <XDSTextInput label="Email" value={email} onChange={setEmail} />
</XDSFormLayout>
```

| Prop          | Type                                                | Default      | Description                            |
| ------------- | --------------------------------------------------- | ------------ | -------------------------------------- |
| `direction`   | `'vertical' \| 'horizontal' \| 'horizontal-labels'` | `'vertical'` | Direction of field arrangement         |
| `children`    | `ReactNode`                                         | —            | Form fields to arrange                 |
| `xstyle`      | `StyleXStyles`                                      | —            | StyleX styles for the layout container |
| `data-testid` | `string`                                            | —            | Test ID for the root element           |
| `ref`         | `Ref<HTMLDivElement>`                               | —            | Ref to the root div element            |

Also accepts standard HTML `div` attributes (`id`, `role`, `aria-*`, etc.).

## Layout Modes

### Vertical (default)

Fields stack top-to-bottom with consistent gap. Most common pattern for simple forms and dialogs.

```tsx
<XDSFormLayout>
  <XDSTextInput label="Name" ... />
  <XDSTextInput label="Email" ... />
</XDSFormLayout>
```

### Horizontal

Fields arrange left-to-right, each getting equal flex-grow. Wraps when the container is too narrow. Used for related fields (first/last name, city/state/zip).

```tsx
<XDSFormLayout direction="horizontal">
  <XDSTextInput label="First Name" ... />
  <XDSTextInput label="Last Name" ... />
</XDSFormLayout>
```

### Horizontal Labels

CSS Grid layout with labels to the left of inputs. Collapses to vertical on narrow viewports (≤480px). Used for settings panels and admin forms.

```tsx
<XDSFormLayout direction="horizontal-labels">
  <XDSTextInput label="Display Name" ... />
  <XDSSelector label="Timezone" ... />
</XDSFormLayout>
```

## Composition Patterns

### Nesting

```tsx
<XDSFormLayout direction="vertical">
  <XDSFormLayout direction="horizontal">
    <XDSTextInput label="First Name" ... />
    <XDSTextInput label="Last Name" ... />
  </XDSFormLayout>
  <XDSTextInput label="Email" ... />
</XDSFormLayout>
```

### With Custom Controls

Use `XDSField` to wrap custom controls that need labels:

```tsx
<XDSFormLayout>
  <XDSTextInput label="Name" ... />
  <XDSField label="Permissions" inputID="perms">
    <CheckboxGroup id="perms" ... />
  </XDSField>
</XDSFormLayout>
```

### Dialog Composition

FormLayout does not include buttons. In dialogs, connect buttons via the HTML `form` attribute:

```tsx
<XDSDialog>
  <form id="edit-form" onSubmit={handleSubmit}>
    <XDSFormLayout>
      <XDSTextInput label="Name" ... />
    </XDSFormLayout>
  </form>
  <XDSDialogFooter>
    <XDSButton label="Save" type="submit" form="edit-form" />
  </XDSDialogFooter>
</XDSDialog>
```

## Context

`XDSFormLayoutContext` provides `{ direction: XDSFormLayoutDirection }` to children. Import from `@xds/core/FormLayout` to read the current layout direction in custom components.

## Files

| File                      | Role    | Purpose                     |
| ------------------------- | ------- | --------------------------- |
| `index.ts`                | Entry   | Exports component and types |
| `XDSFormLayout.tsx`       | Core    | Component implementation    |
| `XDSFormLayoutContext.ts` | Context | Direction context           |
| `XDSFormLayout.test.tsx`  | Test    | Unit tests                  |
