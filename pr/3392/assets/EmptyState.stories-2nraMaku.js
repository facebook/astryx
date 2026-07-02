import{a1 as e,B as t}from"./iframe-BAsU9Dt9.js";import{E as p}from"./EmptyState-CSTAW-0C.js";import"./preload-helper-Ct5FWWRu.js";const u={title:"Core/EmptyState",component:p,tags:["autodocs"],argTypes:{title:{control:"text",description:"Primary message"},description:{control:"text",description:"Optional secondary text"},isCompact:{control:"boolean",description:"Compact variant with reduced spacing"}}},r={args:{title:"No results found",description:"Try adjusting your search or filters to find what you need."}},a={args:{title:"Nothing here yet"}},s={args:{icon:e.jsx("span",{style:{fontSize:"48px"},children:"📭"}),title:"No messages",description:"You're all caught up!"}},o={args:{icon:e.jsx("span",{style:{fontSize:"48px"},children:"🔍"}),title:"No results found",description:"Try adjusting your search or filters.",actions:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Go back",variant:"secondary"}),e.jsx(t,{label:"Clear filters",variant:"primary"})]})}},i={args:{icon:e.jsx("span",{style:{fontSize:"32px"},children:"📋"}),title:"No items",description:"Nothing to show here.",isCompact:!0}},n={args:{title:"No data",description:"Add some data to get started.",actions:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Import",variant:"secondary"}),e.jsx(t,{label:"Add item",variant:"primary"})]}),isCompact:!0}},c={render:()=>e.jsx("div",{style:{border:"1px dashed #ccc",borderRadius:"12px",maxWidth:"480px"},children:e.jsx(p,{icon:e.jsx("span",{style:{fontSize:"48px"},children:"📬"}),title:"No notifications",description:"When you receive notifications, they will appear here. Check back later!",actions:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Settings",variant:"secondary"}),e.jsx(t,{label:"Refresh",variant:"primary"})]})})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you need.'
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Nothing here yet'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <span style={{
      fontSize: '48px'
    }}>📭</span>,
    title: 'No messages',
    description: "You're all caught up!"
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <span style={{
      fontSize: '32px'
    }}>📋</span>,
    title: 'No items',
    description: 'Nothing to show here.',
    isCompact: true
  }
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No data',
    description: 'Add some data to get started.',
    actions: <>
        <Button label="Import" variant="secondary" />
        <Button label="Add item" variant="primary" />
      </>,
    isCompact: true
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const h=["Default","TitleOnly","WithIcon","WithActions","Compact","CompactWithActions","FullExample"];export{i as Compact,n as CompactWithActions,r as Default,c as FullExample,a as TitleOnly,o as WithActions,s as WithIcon,h as __namedExportsOrder,u as default};
