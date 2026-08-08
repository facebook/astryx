import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./CheckboxInput-DJd8Fdr_.js";import{n as a,t as o}from"./BellIcon-Bd5nOtNP.js";import{n as s,t as c}from"./EnvelopeIcon-Cl5_Sctl.js";import{n as l,t as u}from"./ShieldCheckIcon-CbhrdRm2.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{d=t(),r(),a(),s(),l(),f=n(),p={title:`Core/CheckboxInput`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},value:{control:`select`,options:[!0,!1,`indeterminate`],description:`Whether the checkbox is checked, unchecked, or indeterminate`},isDisabled:{control:`boolean`,description:`Whether the checkbox is disabled`},disabledMessage:{control:`text`,description:`Explains why the checkbox is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkbox focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxInput in Tooltip.`},isRequired:{control:`boolean`,description:`Whether the checkbox is required`},size:{control:`select`,options:[`sm`,`md`],description:`Size of the checkbox`}}},m={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`}},h={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`I agree to the terms`,value:!0}},g={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Subscribe to newsletter`,description:`Receive weekly updates about new features and announcements.`}},_={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Select row`,isLabelHidden:!0}},v={render:e=>{let[t,n]=(0,d.useState)(e.value??`indeterminate`),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Select all items`,description:`Some items are selected`,value:`indeterminate`}},y={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Premium feature`,description:`Upgrade to enable this option`,isDisabled:!0}},b={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Feature enabled`,value:!0,isDisabled:!0}},x={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[a,o]=(0,d.useState)(`indeterminate`),[s,c]=(0,d.useState)(!1),[l,u]=(0,d.useState)(!0);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,f.jsx)(i,{label:`Unchecked`,value:e,onChange:t}),(0,f.jsx)(i,{label:`Checked`,value:n,onChange:r}),(0,f.jsx)(i,{label:`Indeterminate`,description:`Some items are selected`,value:a,onChange:o}),(0,f.jsx)(i,{label:`Disabled unchecked`,value:s,onChange:c,isDisabled:!0}),(0,f.jsx)(i,{label:`Disabled checked`,value:l,onChange:u,isDisabled:!0})]})}},S={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Compact checkbox`,size:`sm`}},C={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!1),[a,o]=(0,d.useState)(!0),[s,c]=(0,d.useState)(!0);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,f.jsx)(i,{label:`Medium size (default)`,value:e,onChange:t,size:`md`}),(0,f.jsx)(i,{label:`Small size`,value:n,onChange:r,size:`sm`}),(0,f.jsx)(i,{label:`Medium size checked`,value:a,onChange:o,size:`md`}),(0,f.jsx)(i,{label:`Small size checked`,value:s,onChange:c,size:`sm`})]})}},w={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`,description:`Receive alerts when important events occur`,labelIcon:o}},T={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[a,s]=(0,d.useState)(!1);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,f.jsx)(i,{label:`Email notifications`,description:`Receive updates via email`,value:e,onChange:t,labelIcon:c}),(0,f.jsx)(i,{label:`Push notifications`,description:`Get instant alerts on your device`,value:n,onChange:r,labelIcon:o}),(0,f.jsx)(i,{label:`Two-factor authentication`,description:`Add an extra layer of security`,value:a,onChange:s,labelIcon:u,isDisabled:!0})]})}},E={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`,status:{type:`error`,message:`You must accept the terms to continue`}}},D={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,status:{type:`warning`,message:`This data may be shared with partners`}}},O={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Email verified`,status:{type:`success`,message:`Your email has been verified`}}},k={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[a,o]=(0,d.useState)(!0);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,f.jsx)(i,{label:`Accept terms and conditions`,value:e,onChange:t,status:{type:`error`,message:`You must accept the terms to continue`}}),(0,f.jsx)(i,{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,value:n,onChange:r,status:{type:`warning`,message:`This data may be shared with partners`}}),(0,f.jsx)(i,{label:`Email verified`,value:a,onChange:o,status:{type:`success`,message:`Your email has been verified`}})]})}},A={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,f.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms`,isDisabled:!0,disabledMessage:`Terms are managed by your administrator`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Accept terms and conditions'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'I agree to the terms',
    value: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Subscribe to newsletter',
    description: 'Receive weekly updates about new features and announcements.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Select row',
    isLabelHidden: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? 'indeterminate');
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Select all items',
    description: 'Some items are selected',
    value: 'indeterminate'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Premium feature',
    description: 'Upgrade to enable this option',
    isDisabled: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Feature enabled',
    value: true,
    isDisabled: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>('indeterminate');
    const [value4, setValue4] = useState<boolean | 'indeterminate'>(false);
    const [value5, setValue5] = useState<boolean | 'indeterminate'>(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Unchecked" value={value1} onChange={setValue1} />
        <CheckboxInput label="Checked" value={value2} onChange={setValue2} />
        <CheckboxInput label="Indeterminate" description="Some items are selected" value={value3} onChange={setValue3} />
        <CheckboxInput label="Disabled unchecked" value={value4} onChange={setValue4} isDisabled />
        <CheckboxInput label="Disabled checked" value={value5} onChange={setValue5} isDisabled />
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Compact checkbox',
    size: 'sm'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(false);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(true);
    const [value4, setValue4] = useState<boolean | 'indeterminate'>(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Medium size (default)" value={value1} onChange={setValue1} size="md" />
        <CheckboxInput label="Small size" value={value2} onChange={setValue2} size="sm" />
        <CheckboxInput label="Medium size checked" value={value3} onChange={setValue3} size="md" />
        <CheckboxInput label="Small size checked" value={value4} onChange={setValue4} size="sm" />
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Enable notifications',
    description: 'Receive alerts when important events occur',
    labelIcon: BellIcon
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Email notifications" description="Receive updates via email" value={value1} onChange={setValue1} labelIcon={EnvelopeIcon} />
        <CheckboxInput label="Push notifications" description="Get instant alerts on your device" value={value2} onChange={setValue2} labelIcon={BellIcon} />
        <CheckboxInput label="Two-factor authentication" description="Add an extra layer of security" value={value3} onChange={setValue3} labelIcon={ShieldCheckIcon} isDisabled />
      </div>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Accept terms and conditions',
    status: {
      type: 'error',
      message: 'You must accept the terms to continue'
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Share usage data',
    description: 'Help us improve by sharing anonymous usage statistics',
    status: {
      type: 'warning',
      message: 'This data may be shared with partners'
    }
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Email verified',
    status: {
      type: 'success',
      message: 'Your email has been verified'
    }
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Accept terms and conditions" value={value1} onChange={setValue1} status={{
        type: 'error',
        message: 'You must accept the terms to continue'
      }} />
        <CheckboxInput label="Share usage data" description="Help us improve by sharing anonymous usage statistics" value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'This data may be shared with partners'
      }} />
        <CheckboxInput label="Email verified" value={value3} onChange={setValue3} status={{
        type: 'success',
        message: 'Your email has been verified'
      }} />
      </div>;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Accept terms',
    isDisabled: true,
    disabledMessage: 'Terms are managed by your administrator'
  }
}`,...A.parameters?.docs?.source}}},j=[`Default`,`Checked`,`WithDescription`,`WithHiddenLabel`,`Indeterminate`,`Disabled`,`DisabledChecked`,`AllVariations`,`SmallSize`,`SizeComparison`,`WithStartIcon`,`StartIconVariations`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`StatusVariations`,`DisabledWithMessage`]})))()}M();export{x as AllVariations,h as Checked,m as Default,y as Disabled,b as DisabledChecked,A as DisabledWithMessage,v as Indeterminate,C as SizeComparison,S as SmallSize,T as StartIconVariations,k as StatusVariations,g as WithDescription,E as WithErrorStatus,_ as WithHiddenLabel,w as WithStartIcon,O as WithSuccessStatus,D as WithWarningStatus,j as __namedExportsOrder,p as default};