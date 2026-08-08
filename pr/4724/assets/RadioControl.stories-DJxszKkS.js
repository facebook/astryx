import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{pr as i,ur as a}from"./iframe-BJ87rZAk.js";var o,s,c,l,u,d,f,p,m;e((()=>{o=t(n()),a(),s=r(),c={title:`Core/RadioControl`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Accessible name (aria-label) for the control`},value:{control:`text`,description:`Value reported when this radio is selected`},htmlName:{control:`text`,description:`HTML name shared by the radio group`},isChecked:{control:`boolean`,description:`Whether the radio is selected`},size:{control:`select`,options:[`sm`,`md`],description:`Size of the radio control`},isDisabled:{control:`boolean`,description:`Whether the radio is disabled`},isRequired:{control:`boolean`,description:`Whether the radio is required`},disabledMessage:{control:`text`,description:`Reason shown when disabled (keeps the control focusable)`}}},l={args:{label:`Email`,htmlName:`notify`,value:`email`,isChecked:!0},render:e=>(0,s.jsx)(i,{...e,onChange:()=>{}})},u={render:()=>(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:24},children:[(0,s.jsx)(i,{label:`Small`,htmlName:`sizes`,value:`sm`,size:`sm`,isChecked:!0,onChange:()=>{}}),(0,s.jsx)(i,{label:`Medium`,htmlName:`sizes`,value:`md`,size:`md`,isChecked:!0,onChange:()=>{}})]})},d={render:()=>(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:24},children:[(0,s.jsx)(i,{label:`Disabled unchecked`,htmlName:`disabled`,value:`a`,isChecked:!1,isDisabled:!0,onChange:()=>{}}),(0,s.jsx)(i,{label:`Disabled checked`,htmlName:`disabled`,value:`b`,isChecked:!0,isDisabled:!0,onChange:()=>{}})]})},f={render:()=>(0,s.jsx)(i,{label:`Legacy mode`,htmlName:`mode`,value:`legacy`,isChecked:!1,isDisabled:!0,disabledMessage:`Locked by your administrator`,onChange:()=>{}})},p={render:()=>{let[e,t]=(0,o.useState)(`email`);return(0,s.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[{label:`Email`,value:`email`},{label:`SMS`,value:`sms`},{label:`Push`,value:`push`}].map(n=>(0,s.jsxs)(`label`,{style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,s.jsx)(i,{label:n.label,htmlName:`channel`,value:n.value,isChecked:e===n.value,onChange:t}),n.label]},n.value))})}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    htmlName: 'notify',
    value: 'email',
    isChecked: true
  },
  render: args => <RadioControl {...args} onChange={() => {}} />
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 24
  }}>
      <RadioControl label="Small" htmlName="sizes" value="sm" size="sm" isChecked onChange={() => {}} />
      <RadioControl label="Medium" htmlName="sizes" value="md" size="md" isChecked onChange={() => {}} />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 24
  }}>
      <RadioControl label="Disabled unchecked" htmlName="disabled" value="a" isChecked={false} isDisabled onChange={() => {}} />
      <RadioControl label="Disabled checked" htmlName="disabled" value="b" isChecked isDisabled onChange={() => {}} />
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <RadioControl label="Legacy mode" htmlName="mode" value="legacy" isChecked={false} isDisabled disabledMessage="Locked by your administrator" onChange={() => {}} />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('email');
    const options = [{
      label: 'Email',
      value: 'email'
    }, {
      label: 'SMS',
      value: 'sms'
    }, {
      label: 'Push',
      value: 'push'
    }];
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        {options.map(opt => <label key={opt.value} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
            <RadioControl label={opt.label} htmlName="channel" value={opt.value} isChecked={value === opt.value} onChange={setValue} />
            {opt.label}
          </label>)}
      </div>;
  }
}`,...p.parameters?.docs?.source}}},m=[`Default`,`Sizes`,`Disabled`,`DisabledWithReason`,`ControlledGroup`]}))();export{p as ControlledGroup,l as Default,d as Disabled,f as DisabledWithReason,u as Sizes,m as __namedExportsOrder,c as default};