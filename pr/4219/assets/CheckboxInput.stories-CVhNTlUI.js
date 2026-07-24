import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./CheckboxInput-DImPD3fv.js";import{t as a}from"./CheckboxInput-CJNf_FJg.js";import{E as o,St as s,gn as c,t as l}from"./esm-DA7gAIBC.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;e((()=>{u=t(n()),a(),l(),d=r(),f={title:`Core/CheckboxInput`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},value:{control:`select`,options:[!0,!1,`indeterminate`],description:`Whether the checkbox is checked, unchecked, or indeterminate`},isDisabled:{control:`boolean`,description:`Whether the checkbox is disabled`},disabledMessage:{control:`text`,description:`Explains why the checkbox is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkbox focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxInput in Tooltip.`},isRequired:{control:`boolean`,description:`Whether the checkbox is required`},size:{control:`select`,options:[`sm`,`md`],description:`Size of the checkbox`}}},p={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`}},m={render:e=>{let[t,n]=(0,u.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`I agree to the terms`,value:!0}},h={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Subscribe to newsletter`,description:`Receive weekly updates about new features and announcements.`}},g={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Select row`,isLabelHidden:!0}},_={render:e=>{let[t,n]=(0,u.useState)(e.value??`indeterminate`),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Select all items`,description:`Some items are selected`,value:`indeterminate`}},v={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Premium feature`,description:`Upgrade to enable this option`,isDisabled:!0}},y={render:e=>{let[t,n]=(0,u.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Feature enabled`,value:!0,isDisabled:!0}},b={render:()=>{let[e,t]=(0,u.useState)(!1),[n,r]=(0,u.useState)(!0),[a,o]=(0,u.useState)(`indeterminate`),[s,c]=(0,u.useState)(!1),[l,f]=(0,u.useState)(!0);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,d.jsx)(i,{label:`Unchecked`,value:e,onChange:t}),(0,d.jsx)(i,{label:`Checked`,value:n,onChange:r}),(0,d.jsx)(i,{label:`Indeterminate`,description:`Some items are selected`,value:a,onChange:o}),(0,d.jsx)(i,{label:`Disabled unchecked`,value:s,onChange:c,isDisabled:!0}),(0,d.jsx)(i,{label:`Disabled checked`,value:l,onChange:f,isDisabled:!0})]})}},x={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Compact checkbox`,size:`sm`}},S={render:()=>{let[e,t]=(0,u.useState)(!1),[n,r]=(0,u.useState)(!1),[a,o]=(0,u.useState)(!0),[s,c]=(0,u.useState)(!0);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,d.jsx)(i,{label:`Medium size (default)`,value:e,onChange:t,size:`md`}),(0,d.jsx)(i,{label:`Small size`,value:n,onChange:r,size:`sm`}),(0,d.jsx)(i,{label:`Medium size checked`,value:a,onChange:o,size:`md`}),(0,d.jsx)(i,{label:`Small size checked`,value:s,onChange:c,size:`sm`})]})}},C={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`,description:`Receive alerts when important events occur`,labelIcon:c}},w={render:()=>{let[e,t]=(0,u.useState)(!1),[n,r]=(0,u.useState)(!0),[a,l]=(0,u.useState)(!1);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,d.jsx)(i,{label:`Email notifications`,description:`Receive updates via email`,value:e,onChange:t,labelIcon:s}),(0,d.jsx)(i,{label:`Push notifications`,description:`Get instant alerts on your device`,value:n,onChange:r,labelIcon:c}),(0,d.jsx)(i,{label:`Two-factor authentication`,description:`Add an extra layer of security`,value:a,onChange:l,labelIcon:o,isDisabled:!0})]})}},T={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`,status:{type:`error`,message:`You must accept the terms to continue`}}},E={render:e=>{let[t,n]=(0,u.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,status:{type:`warning`,message:`This data may be shared with partners`}}},D={render:e=>{let[t,n]=(0,u.useState)(e.value??!0),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Email verified`,status:{type:`success`,message:`Your email has been verified`}}},O={render:()=>{let[e,t]=(0,u.useState)(!1),[n,r]=(0,u.useState)(!0),[a,o]=(0,u.useState)(!0);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,d.jsx)(i,{label:`Accept terms and conditions`,value:e,onChange:t,status:{type:`error`,message:`You must accept the terms to continue`}}),(0,d.jsx)(i,{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,value:n,onChange:r,status:{type:`warning`,message:`This data may be shared with partners`}}),(0,d.jsx)(i,{label:`Email verified`,value:a,onChange:o,status:{type:`success`,message:`Your email has been verified`}})]})}},k={render:e=>{let[t,n]=(0,u.useState)(e.value??!1),{value:r,onChange:a,...o}=e;return(0,d.jsx)(i,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms`,isDisabled:!0,disabledMessage:`Terms are managed by your administrator`}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
    label: 'Select row',
    isLabelHidden: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
    label: 'Email verified',
    status: {
      type: 'success',
      message: 'Your email has been verified'
    }
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A=[`Default`,`Checked`,`WithDescription`,`WithHiddenLabel`,`Indeterminate`,`Disabled`,`DisabledChecked`,`AllVariations`,`SmallSize`,`SizeComparison`,`WithStartIcon`,`StartIconVariations`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`StatusVariations`,`DisabledWithMessage`]}))();export{b as AllVariations,m as Checked,p as Default,v as Disabled,y as DisabledChecked,k as DisabledWithMessage,_ as Indeterminate,S as SizeComparison,x as SmallSize,w as StartIconVariations,O as StatusVariations,h as WithDescription,T as WithErrorStatus,g as WithHiddenLabel,C as WithStartIcon,D as WithSuccessStatus,E as WithWarningStatus,A as __namedExportsOrder,f as default};