import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{t as r}from"./Text-BUJwo4gL.js";import{n as i,t as a}from"./CircularProgress-UWd1Grbk.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;e((()=>{a(),r(),o=t(),s={title:`Lab/CircularProgress`,component:i,tags:[`autodocs`],argTypes:{value:{control:{type:`range`,min:0,max:100,step:1},description:`Current value`},max:{control:`number`,description:`Maximum value`},label:{control:`text`,description:`Accessible label`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Ring diameter`},variant:{control:`select`,options:[`accent`,`success`,`warning`,`error`,`neutral`],description:`Semantic color variant`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},hasValueLabel:{control:`boolean`,description:`Show the formatted value in the ring center`},isIndeterminate:{control:`boolean`,description:`Animated indicator for unknown progress`},isDisabled:{control:`boolean`,description:`Visually disabled ring and text`}}},c={args:{value:60,label:`Progress`}},l={args:{value:75,label:`Upload progress`,size:`lg`,children:`75%`}},u={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,o.jsx)(i,{value:60,size:`sm`,label:`Small`}),(0,o.jsx)(i,{value:60,size:`md`,label:`Medium`}),(0,o.jsx)(i,{value:60,size:`lg`,label:`Large`})]})},d={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,o.jsx)(i,{value:60,size:`sm`,label:`Small`,children:(0,o.jsx)(n,{type:`supporting`,style:{fontSize:8},children:`60%`})}),(0,o.jsx)(i,{value:60,size:`md`,label:`Medium`,children:(0,o.jsx)(n,{type:`supporting`,style:{fontSize:11},children:`60%`})}),(0,o.jsx)(i,{value:60,size:`lg`,label:`Large`,children:(0,o.jsx)(n,{type:`body`,children:`60%`})})]})},f={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,o.jsx)(i,{value:60,label:`Accent`,variant:`accent`}),(0,o.jsx)(i,{value:80,label:`Positive`,variant:`success`}),(0,o.jsx)(i,{value:50,label:`Warning`,variant:`warning`}),(0,o.jsx)(i,{value:92,label:`Negative`,variant:`error`}),(0,o.jsx)(i,{value:35,label:`Neutral`,variant:`neutral`})]})},p={args:{value:0,label:`Not started`}},m={args:{value:100,label:`Complete`,variant:`success`,size:`lg`,children:`100%`}},h={args:{value:75,label:`Upload progress`,size:`lg`,hasValueLabel:!0}},g={args:{value:3,max:5,label:`Steps completed`,size:`lg`,hasValueLabel:!0,formatValueLabel:(e,t)=>`${e}/${t}`}},_={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,o.jsx)(i,{value:30,label:`Canceled`,isDisabled:!0}),(0,o.jsx)(i,{value:30,label:`Canceled with value`,size:`lg`,isDisabled:!0,hasValueLabel:!0}),(0,o.jsx)(i,{isIndeterminate:!0,label:`Canceled loading`,isDisabled:!0})]})},v={args:{isIndeterminate:!0,label:`Loading...`}},y={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,o.jsx)(i,{isIndeterminate:!0,size:`sm`,label:`Loading small`}),(0,o.jsx)(i,{isIndeterminate:!0,size:`md`,label:`Loading medium`}),(0,o.jsx)(i,{isIndeterminate:!0,size:`lg`,label:`Loading large`})]})},b={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,o.jsx)(i,{isIndeterminate:!0,label:`Accent`,variant:`accent`}),(0,o.jsx)(i,{isIndeterminate:!0,label:`Positive`,variant:`success`}),(0,o.jsx)(i,{isIndeterminate:!0,label:`Warning`,variant:`warning`}),(0,o.jsx)(i,{isIndeterminate:!0,label:`Negative`,variant:`error`}),(0,o.jsx)(i,{isIndeterminate:!0,label:`Neutral`,variant:`neutral`})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Progress'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload progress',
    size: 'lg',
    children: '75%'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={60} size="sm" label="Small" />
      <CircularProgress value={60} size="md" label="Medium" />
      <CircularProgress value={60} size="lg" label="Large" />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={60} size="sm" label="Small">
        <Text type="supporting" style={{
        fontSize: 8
      }}>
          60%
        </Text>
      </CircularProgress>
      <CircularProgress value={60} size="md" label="Medium">
        <Text type="supporting" style={{
        fontSize: 11
      }}>
          60%
        </Text>
      </CircularProgress>
      <CircularProgress value={60} size="lg" label="Large">
        <Text type="body">60%</Text>
      </CircularProgress>
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={60} label="Accent" variant="accent" />
      <CircularProgress value={80} label="Positive" variant="success" />
      <CircularProgress value={50} label="Warning" variant="warning" />
      <CircularProgress value={92} label="Negative" variant="error" />
      <CircularProgress value={35} label="Neutral" variant="neutral" />
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'Not started'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Complete',
    variant: 'success',
    size: 'lg',
    children: '100%'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload progress',
    size: 'lg',
    hasValueLabel: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 3,
    max: 5,
    label: 'Steps completed',
    size: 'lg',
    hasValueLabel: true,
    formatValueLabel: (value, max) => \`\${value}/\${max}\`
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={30} label="Canceled" isDisabled />
      <CircularProgress value={30} label="Canceled with value" size="lg" isDisabled hasValueLabel />
      <CircularProgress isIndeterminate label="Canceled loading" isDisabled />
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading...'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress isIndeterminate size="sm" label="Loading small" />
      <CircularProgress isIndeterminate size="md" label="Loading medium" />
      <CircularProgress isIndeterminate size="lg" label="Loading large" />
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress isIndeterminate label="Accent" variant="accent" />
      <CircularProgress isIndeterminate label="Positive" variant="success" />
      <CircularProgress isIndeterminate label="Warning" variant="warning" />
      <CircularProgress isIndeterminate label="Negative" variant="error" />
      <CircularProgress isIndeterminate label="Neutral" variant="neutral" />
    </div>
}`,...b.parameters?.docs?.source}}},x=[`Default`,`WithCenterLabel`,`Sizes`,`SizesWithLabels`,`Variants`,`Empty`,`Full`,`WithValueLabel`,`CustomValueFormat`,`Disabled`,`Indeterminate`,`IndeterminateSizes`,`IndeterminateVariants`]}))();export{g as CustomValueFormat,c as Default,_ as Disabled,p as Empty,m as Full,v as Indeterminate,y as IndeterminateSizes,b as IndeterminateVariants,u as Sizes,d as SizesWithLabels,f as Variants,l as WithCenterLabel,h as WithValueLabel,x as __namedExportsOrder,s as default};