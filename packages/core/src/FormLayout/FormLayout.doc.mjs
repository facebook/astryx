/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'FormLayout',
  description:
    'A spatial layout container for arranging form fields with consistent spacing and direction.',
  props: [
    {
      name: 'direction',
      type: "'vertical' | 'horizontal' | 'horizontal-labels'",
      description:
        'Controls field arrangement. Vertical stacks top-to-bottom, horizontal arranges left-to-right with equal flex-grow, and horizontal-labels uses CSS Grid with labels to the left of inputs (collapses to vertical on narrow viewports <=480px).',
      default: "'vertical'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Form fields to arrange. Accepts XDS inputs (XDSTextInput, XDSSelector, etc.) and XDSField-wrapped custom controls.',
    },
  ],
  examples: [
    {
      label: 'Vertical layout (default)',
      code: `<XDSFormLayout>
  <XDSTextInput label="Name" value={name} onChange={setName} />
  <XDSTextInput label="Email" value={email} onChange={setEmail} />
</XDSFormLayout>`,
    },
    {
      label: 'Horizontal layout for related fields',
      code: `<XDSFormLayout direction="horizontal">
  <XDSTextInput label="First Name" value={first} onChange={setFirst} />
  <XDSTextInput label="Last Name" value={last} onChange={setLast} />
</XDSFormLayout>`,
    },
    {
      label: 'Horizontal labels for settings panels',
      code: `<XDSFormLayout direction="horizontal-labels">
  <XDSTextInput label="Display Name" value={name} onChange={setName} />
  <XDSSelector label="Timezone" value={tz} onChange={setTz} options={tzs} />
</XDSFormLayout>`,
    },
    {
      label: 'Nested layouts',
      code: `<XDSFormLayout direction="vertical">
  <XDSFormLayout direction="horizontal">
    <XDSTextInput label="First Name" value={first} onChange={setFirst} />
    <XDSTextInput label="Last Name" value={last} onChange={setLast} />
  </XDSFormLayout>
  <XDSTextInput label="Email" value={email} onChange={setEmail} />
</XDSFormLayout>`,
    },
    {
      label: 'Dialog composition via HTML form attribute',
      code: `<XDSDialog>
  <form id="edit-form" onSubmit={handleSubmit}>
    <XDSFormLayout>
      <XDSTextInput label="Name" value={name} onChange={setName} />
    </XDSFormLayout>
  </form>
  <XDSDialogFooter>
    <XDSButton label="Save" type="submit" form="edit-form" />
  </XDSDialogFooter>
</XDSDialog>`,
    },
  ],
  features: [
    "Three layout modes: 'vertical' (default), 'horizontal', and 'horizontal-labels'",
    'Direction context via XDSFormLayoutContext — children can read the current layout direction',
    'Responsive: horizontal-labels collapses to vertical on narrow viewports (<=480px)',
    'Nestable: inner FormLayout overrides context for its children',
    'Purely spatial: does not manage form state or render <form> — form submission is separate',
  ],
  notes: [
    'Renders a <div>, not a <form>. Use a separate <form> element and connect submit buttons via the HTML form attribute.',
    'XDSFormLayoutContext provides { direction } to children. Import from @xds/core/FormLayout to read layout direction in custom components.',
    'Also accepts standard HTML div attributes (id, role, aria-*, etc.) via rest props.',
  ],
};
