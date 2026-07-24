import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-BBk5Kqd0.js";import{t as r}from"./Button-CRpvXAU4.js";import{n as i,t as a}from"./EmptyState-C3mnr_dO.js";var o,s,c,l,u,d,f,p,m,h;e((()=>{a(),r(),o=t(),s={title:`Core/EmptyState`,component:i,tags:[`autodocs`],argTypes:{title:{control:`text`,description:`Primary message`},description:{control:`text`,description:`Optional secondary text`},isCompact:{control:`boolean`,description:`Compact variant with reduced spacing`}}},c={args:{title:`No results found`,description:`Try adjusting your search or filters to find what you need.`}},l={args:{title:`Nothing here yet`}},u={args:{icon:(0,o.jsx)(`span`,{style:{fontSize:`48px`},children:`📭`}),title:`No messages`,description:`You're all caught up!`}},d={args:{icon:(0,o.jsx)(`span`,{style:{fontSize:`48px`},children:`🔍`}),title:`No results found`,description:`Try adjusting your search or filters.`,actions:(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n,{label:`Go back`,variant:`secondary`}),(0,o.jsx)(n,{label:`Clear filters`,variant:`primary`})]})}},f={args:{icon:(0,o.jsx)(`span`,{style:{fontSize:`32px`},children:`📋`}),title:`No items`,description:`Nothing to show here.`,isCompact:!0}},p={args:{title:`No data`,description:`Add some data to get started.`,actions:(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n,{label:`Import`,variant:`secondary`}),(0,o.jsx)(n,{label:`Add item`,variant:`primary`})]}),isCompact:!0}},m={render:()=>(0,o.jsx)(`div`,{style:{border:`1px dashed #ccc`,borderRadius:`12px`,maxWidth:`480px`},children:(0,o.jsx)(i,{icon:(0,o.jsx)(`span`,{style:{fontSize:`48px`},children:`📬`}),title:`No notifications`,description:`When you receive notifications, they will appear here. Check back later!`,actions:(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n,{label:`Settings`,variant:`secondary`}),(0,o.jsx)(n,{label:`Refresh`,variant:`primary`})]})})})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you need.'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Nothing here yet'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <span style={{
      fontSize: '48px'
    }}>📭</span>,
    title: 'No messages',
    description: "You're all caught up!"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <span style={{
      fontSize: '48px'
    }}>🔍</span>,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
    actions: <>
        <Button label="Go back" variant="secondary" />
        <Button label="Clear filters" variant="primary" />
      </>
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <span style={{
      fontSize: '32px'
    }}>📋</span>,
    title: 'No items',
    description: 'Nothing to show here.',
    isCompact: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No data',
    description: 'Add some data to get started.',
    actions: <>
        <Button label="Import" variant="secondary" />
        <Button label="Add item" variant="primary" />
      </>,
    isCompact: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    border: '1px dashed #ccc',
    borderRadius: '12px',
    maxWidth: '480px'
  }}>
      <EmptyState icon={<span style={{
      fontSize: '48px'
    }}>📬</span>} title="No notifications" description="When you receive notifications, they will appear here. Check back later!" actions={<>
            <Button label="Settings" variant="secondary" />
            <Button label="Refresh" variant="primary" />
          </>} />
    </div>
}`,...m.parameters?.docs?.source}}},h=[`Default`,`TitleOnly`,`WithIcon`,`WithActions`,`Compact`,`CompactWithActions`,`FullExample`]}))();export{f as Compact,p as CompactWithActions,c as Default,m as FullExample,l as TitleOnly,d as WithActions,u as WithIcon,h as __namedExportsOrder,s as default};