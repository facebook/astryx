import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{N as n,P as r}from"./iframe-CER2Y08S.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;e((()=>{n(),i=t(),a={title:`Core/ProgressBar`,component:r,tags:[`autodocs`],argTypes:{value:{control:{type:`range`,min:0,max:100,step:1},description:`Current value`},max:{control:`number`,description:`Maximum value`},label:{control:`text`,description:`Accessible label`},variant:{control:`select`,options:[`accent`,`success`,`warning`,`error`,`neutral`],description:`Semantic color variant`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},hasValueLabel:{control:`boolean`,description:`Show formatted value`},isDisabled:{control:`boolean`,description:`Disabled state (grayed out)`}}},o={args:{value:60,label:`Progress`}},s={args:{value:75,label:`Storage used`,hasValueLabel:!0}},c={args:{value:3.2,max:5,label:`Disk usage`,hasValueLabel:!0,formatValueLabel:(e,t)=>`${e} GB / ${t} GB`}},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`300px`},children:[(0,i.jsx)(r,{value:60,label:`Accent`,variant:`accent`,hasValueLabel:!0}),(0,i.jsx)(r,{value:80,label:`Success`,variant:`success`,hasValueLabel:!0}),(0,i.jsx)(r,{value:50,label:`Warning`,variant:`warning`,hasValueLabel:!0}),(0,i.jsx)(r,{value:92,label:`Error`,variant:`error`,hasValueLabel:!0}),(0,i.jsx)(r,{value:35,label:`Neutral`,variant:`neutral`,hasValueLabel:!0})]})},u={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`300px`},children:[(0,i.jsx)(r,{value:30,label:`Upload canceled`,isDisabled:!0,hasValueLabel:!0}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Processing disabled`,isDisabled:!0})]})},d={name:`Composed: with description`,render:()=>(0,i.jsxs)(`div`,{style:{width:`300px`},children:[(0,i.jsx)(r,{value:40,max:100,label:`Download progress`,hasValueLabel:!0}),(0,i.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,marginTop:`4px`},children:`40 MB / 100 MB downloaded`})]})},f={args:{value:50,label:`Loading progress`,isLabelHidden:!0}},p={args:{value:75,label:`Upload`,isLabelHidden:!0,hasValueLabel:!0}},m={args:{value:0,label:`Not started`,hasValueLabel:!0}},h={args:{value:100,label:`Complete`,hasValueLabel:!0,variant:`success`}},g={args:{isIndeterminate:!0,label:`Loading...`}},_={args:{isIndeterminate:!0,label:`Loading`,isLabelHidden:!0}},v={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`300px`},children:[(0,i.jsx)(r,{isIndeterminate:!0,label:`Accent`,variant:`accent`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Success`,variant:`success`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Warning`,variant:`warning`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Error`,variant:`error`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Neutral`,variant:`neutral`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Progress'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Storage used',
    hasValueLabel: true
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 3.2,
    max: 5,
    label: 'Disk usage',
    hasValueLabel: true,
    formatValueLabel: (value: number, max: number) => \`\${value} GB / \${max} GB\`
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px'
  }}>
      <ProgressBar value={30} label="Upload canceled" isDisabled hasValueLabel />
      <ProgressBar isIndeterminate label="Processing disabled" isDisabled />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: 50,
    label: 'Loading progress',
    isLabelHidden: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload',
    isLabelHidden: true,
    hasValueLabel: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'Not started',
    hasValueLabel: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Complete',
    hasValueLabel: true,
    variant: 'success'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading...'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading',
    isLabelHidden: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y=[`Default`,`WithValueLabel`,`CustomFormat`,`Variants`,`Disabled`,`ComposedWithDescription`,`HiddenLabel`,`HiddenLabelWithValue`,`Empty`,`Full`,`Indeterminate`,`IndeterminateHiddenLabel`,`IndeterminateVariants`]}))();export{d as ComposedWithDescription,c as CustomFormat,o as Default,u as Disabled,m as Empty,h as Full,f as HiddenLabel,p as HiddenLabelWithValue,g as Indeterminate,_ as IndeterminateHiddenLabel,v as IndeterminateVariants,l as Variants,s as WithValueLabel,y as __namedExportsOrder,a as default};