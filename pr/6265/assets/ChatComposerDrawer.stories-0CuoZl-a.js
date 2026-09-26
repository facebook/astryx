import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Token-M4ExxfLV.js";import{ei as i,xi as a}from"./iframe-D02JPsSO.js";var o,s,c,l,u,d,f,p,m,h,g;e((()=>{i(),r(),o=t(),{expect:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Core/ChatComposerDrawer`,component:a,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,o.jsx)(`div`,{style:{width:480},children:(0,o.jsx)(e,{})})]},d=(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n,{label:`design-spec.pdf`,onRemove:()=>{}}),(0,o.jsx)(n,{label:`api-schema.json`,onRemove:()=>{}})]}),f={args:{count:2,label:`Attachments`,children:d}},p={args:{count:1,label:`Attachment`,defaultIsCollapsed:!0,children:(0,o.jsx)(`button`,{type:`button`,"data-audit-child":``,children:`Remove attachment`})},render:e=>(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(a,{...e}),(0,o.jsx)(`button`,{type:`button`,"data-audit-after":``,children:`After drawer`})]}),play:async({canvasElement:e})=>{let t=l(e).getByRole(`button`,{name:/Attachment/}),n=document.getElementById(t.getAttribute(`aria-controls`)),r=e.querySelector(`[data-audit-child]`),i=e.querySelector(`[data-audit-after]`);await s(t).toHaveAttribute(`aria-expanded`,`false`),await s(n).toHaveAttribute(`inert`),await c.tab(),await s(t).toHaveFocus(),await c.tab(),await s(i).toHaveFocus(),await c.click(t),await s(t).toHaveAttribute(`aria-expanded`,`true`),await s(n).not.toHaveAttribute(`inert`),await c.tab(),await s(r).toHaveFocus()}},m={tags:[`visual-baseline`],args:{count:2,label:`Attachments`,collapsedSummary:(0,o.jsx)(`span`,{children:`2 files ready`}),defaultIsCollapsed:!0,children:d}},h={args:{count:2,label:`Attachments`,children:d},play:async({canvasElement:e})=>{let t=l(e);await c.tab();let n=t.getByRole(`button`,{name:/Attachments/});await s(n).toHaveFocus();let r=getComputedStyle(n);await s(Number.parseFloat(r.outlineWidth)).toBeGreaterThanOrEqual(2),await s(r.outlineStyle).not.toBe(`none`)}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    count: 2,
    label: 'Attachments',
    children: attachments
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    count: 1,
    label: 'Attachment',
    defaultIsCollapsed: true,
    children: <button type="button" data-audit-child="">
        Remove attachment
      </button>
  },
  render: args => <>
      <ChatComposerDrawer {...args} />
      <button type="button" data-audit-after="">
        After drawer
      </button>
    </>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {
      name: /Attachment/
    });
    const region = document.getElementById(toggle.getAttribute('aria-controls') as string);
    const child = canvasElement.querySelector<HTMLElement>('[data-audit-child]');
    const after = canvasElement.querySelector<HTMLElement>('[data-audit-after]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(region).toHaveAttribute('inert');
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.tab();
    await expect(after).toHaveFocus();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(region).not.toHaveAttribute('inert');
    await userEvent.tab();
    await expect(child).toHaveFocus();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  tags: ['visual-baseline'],
  args: {
    count: 2,
    label: 'Attachments',
    collapsedSummary: <span>2 files ready</span>,
    defaultIsCollapsed: true,
    children: attachments
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    count: 2,
    label: 'Attachments',
    children: attachments
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const toggle = canvas.getByRole('button', {
      name: /Attachments/
    });
    await expect(toggle).toHaveFocus();
    const style = getComputedStyle(toggle);
    await expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
    await expect(style.outlineStyle).not.toBe('none');
  }
}`,...h.parameters?.docs?.source}}},g=[`Expanded`,`Collapsed`,`CustomCollapsedSummary`,`KeyboardFocus`]}))();export{p as Collapsed,m as CustomCollapsedSummary,f as Expanded,h as KeyboardFocus,g as __namedExportsOrder,u as default};