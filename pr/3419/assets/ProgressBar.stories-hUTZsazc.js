import{a1 as e}from"./iframe-JfpySt6L.js";import{P as a}from"./ProgressBar-CnuyBs37.js";import"./preload-helper-Ct5FWWRu.js";const V={title:"Core/ProgressBar",component:a,tags:["autodocs"],argTypes:{value:{control:{type:"range",min:0,max:100,step:1},description:"Current value"},max:{control:"number",description:"Maximum value"},label:{control:"text",description:"Accessible label"},variant:{control:"select",options:["accent","success","warning","error","neutral"],description:"Semantic color variant"},isLabelHidden:{control:"boolean",description:"Visually hide the label"},hasValueLabel:{control:"boolean",description:"Show formatted value"},isDisabled:{control:"boolean",description:"Disabled state (grayed out)"}}},r={args:{value:60,label:"Progress"}},s={args:{value:75,label:"Storage used",hasValueLabel:!0}},l={args:{value:3.2,max:5,label:"Disk usage",hasValueLabel:!0,formatValueLabel:(g,v)=>`${g} GB / ${v} GB`}},t={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"300px"},children:[e.jsx(a,{value:60,label:"Accent",variant:"accent",hasValueLabel:!0}),e.jsx(a,{value:80,label:"Success",variant:"success",hasValueLabel:!0}),e.jsx(a,{value:50,label:"Warning",variant:"warning",hasValueLabel:!0}),e.jsx(a,{value:92,label:"Error",variant:"error",hasValueLabel:!0}),e.jsx(a,{value:35,label:"Neutral",variant:"neutral",hasValueLabel:!0})]})},n={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"300px"},children:[e.jsx(a,{value:30,label:"Upload canceled",isDisabled:!0,hasValueLabel:!0}),e.jsx(a,{isIndeterminate:!0,label:"Processing disabled",isDisabled:!0})]})},o={name:"Composed: with description",render:()=>e.jsxs("div",{style:{width:"300px"},children:[e.jsx(a,{value:40,max:100,label:"Download progress",hasValueLabel:!0}),e.jsx("div",{style:{fontSize:"12px",color:"var(--color-text-secondary)",marginTop:"4px"},children:"40 MB / 100 MB downloaded"})]})},i={args:{value:50,label:"Loading progress",isLabelHidden:!0}},c={args:{value:75,label:"Upload",isLabelHidden:!0,hasValueLabel:!0}},d={args:{value:0,label:"Not started",hasValueLabel:!0}},u={args:{value:100,label:"Complete",hasValueLabel:!0,variant:"success"}},m={args:{isIndeterminate:!0,label:"Loading..."}},p={args:{isIndeterminate:!0,label:"Loading",isLabelHidden:!0}},b={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"300px"},children:[e.jsx(a,{isIndeterminate:!0,label:"Accent",variant:"accent"}),e.jsx(a,{isIndeterminate:!0,label:"Success",variant:"success"}),e.jsx(a,{isIndeterminate:!0,label:"Warning",variant:"warning"}),e.jsx(a,{isIndeterminate:!0,label:"Error",variant:"error"}),e.jsx(a,{isIndeterminate:!0,label:"Neutral",variant:"neutral"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Progress'
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Storage used',
    hasValueLabel: true
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 3.2,
    max: 5,
    label: 'Disk usage',
    hasValueLabel: true,
    formatValueLabel: (value: number, max: number) => \`\${value} GB / \${max} GB\`
  }
}`,...l.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px'
  }}>
      <ProgressBar value={60} label="Accent" variant="accent" hasValueLabel />
      <ProgressBar value={80} label="Success" variant="success" hasValueLabel />
      <ProgressBar value={50} label="Warning" variant="warning" hasValueLabel />
      <ProgressBar value={92} label="Error" variant="error" hasValueLabel />
      <ProgressBar value={35} label="Neutral" variant="neutral" hasValueLabel />
    </div>
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px'
  }}>
      <ProgressBar value={30} label="Upload canceled" isDisabled hasValueLabel />
      <ProgressBar isIndeterminate label="Processing disabled" isDisabled />
    </div>
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Composed: with description',
  render: () => <div style={{
    width: '300px'
  }}>
      <ProgressBar value={40} max={100} label="Download progress" hasValueLabel />
      <div style={{
      fontSize: '12px',
      color: 'var(--color-text-secondary)',
      marginTop: '4px'
    }}>
        40 MB / 100 MB downloaded
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    value: 50,
    label: 'Loading progress',
    isLabelHidden: true
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload',
    isLabelHidden: true,
    hasValueLabel: true
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'Not started',
    hasValueLabel: true
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Complete',
    hasValueLabel: true,
    variant: 'success'
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading...'
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading',
    isLabelHidden: true
  }
}`,...p.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px'
  }}>
      <ProgressBar isIndeterminate label="Accent" variant="accent" />
      <ProgressBar isIndeterminate label="Success" variant="success" />
      <ProgressBar isIndeterminate label="Warning" variant="warning" />
      <ProgressBar isIndeterminate label="Error" variant="error" />
      <ProgressBar isIndeterminate label="Neutral" variant="neutral" />
    </div>
}`,...b.parameters?.docs?.source}}};const y=["Default","WithValueLabel","CustomFormat","Variants","Disabled","ComposedWithDescription","HiddenLabel","HiddenLabelWithValue","Empty","Full","Indeterminate","IndeterminateHiddenLabel","IndeterminateVariants"];export{o as ComposedWithDescription,l as CustomFormat,r as Default,n as Disabled,d as Empty,u as Full,i as HiddenLabel,c as HiddenLabelWithValue,m as Indeterminate,p as IndeterminateHiddenLabel,b as IndeterminateVariants,t as Variants,s as WithValueLabel,y as __namedExportsOrder,V as default};
