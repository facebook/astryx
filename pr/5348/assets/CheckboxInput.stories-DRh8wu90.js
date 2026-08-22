import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./useTheme-DGoEJzg8.js";import{t as a,x as o}from"./theme-eko9KzGp.js";import{t as s}from"./CheckboxInput-BouFmNSU.js";import{t as c}from"./CheckboxInput-LM5YkTfI.js";import{E as l,t as u,vn as d,wt as f}from"./esm-CL1f8dHF.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;e((()=>{p=t(n()),c(),a(),u(),m=r(),h={title:`Core/CheckboxInput`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},value:{control:`select`,options:[!0,!1,`indeterminate`],description:`Whether the checkbox is checked, unchecked, or indeterminate`},isDisabled:{control:`boolean`,description:`Whether the checkbox is disabled`},disabledMessage:{control:`text`,description:`Explains why the checkbox is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkbox focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxInput in Tooltip.`},isRequired:{control:`boolean`,description:`Whether the checkbox is required`},size:{control:`select`,options:[`sm`,`md`],description:`Size of the checkbox`}}},g={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`}},_={render:e=>{let[t,n]=(0,p.useState)(e.value??!0),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`I agree to the terms`,value:!0}},v={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Subscribe to newsletter`,description:`Receive weekly updates about new features and announcements.`}},y={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Select row`,isLabelHidden:!0}},b={render:e=>{let[t,n]=(0,p.useState)(e.value??`indeterminate`),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Select all items`,description:`Some items are selected`,value:`indeterminate`}},x={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Premium feature`,description:`Upgrade to enable this option`,isDisabled:!0}},S={render:e=>{let[t,n]=(0,p.useState)(e.value??!0),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Feature enabled`,value:!0,isDisabled:!0}},C={render:()=>{let[e,t]=(0,p.useState)(!1),[n,r]=(0,p.useState)(!0),[i,a]=(0,p.useState)(`indeterminate`),[o,c]=(0,p.useState)(!1),[l,u]=(0,p.useState)(!0);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,m.jsx)(s,{label:`Unchecked`,value:e,onChange:t}),(0,m.jsx)(s,{label:`Checked`,value:n,onChange:r}),(0,m.jsx)(s,{label:`Indeterminate`,description:`Some items are selected`,value:i,onChange:a}),(0,m.jsx)(s,{label:`Disabled unchecked`,value:o,onChange:c,isDisabled:!0}),(0,m.jsx)(s,{label:`Disabled checked`,value:l,onChange:u,isDisabled:!0})]})}},w={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Compact checkbox`,size:`sm`}},T={render:()=>{let[e,t]=(0,p.useState)(!1),[n,r]=(0,p.useState)(!1),[i,a]=(0,p.useState)(!0),[o,c]=(0,p.useState)(!0);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,m.jsx)(s,{label:`Medium size (default)`,value:e,onChange:t,size:`md`}),(0,m.jsx)(s,{label:`Small size`,value:n,onChange:r,size:`sm`}),(0,m.jsx)(s,{label:`Medium size checked`,value:i,onChange:a,size:`md`}),(0,m.jsx)(s,{label:`Small size checked`,value:o,onChange:c,size:`sm`})]})}},E={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`,description:`Receive alerts when important events occur`,labelIcon:d}},D={render:()=>{let[e,t]=(0,p.useState)(!1),[n,r]=(0,p.useState)(!0),[i,a]=(0,p.useState)(!1);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,m.jsx)(s,{label:`Email notifications`,description:`Receive updates via email`,value:e,onChange:t,labelIcon:f}),(0,m.jsx)(s,{label:`Push notifications`,description:`Get instant alerts on your device`,value:n,onChange:r,labelIcon:d}),(0,m.jsx)(s,{label:`Two-factor authentication`,description:`Add an extra layer of security`,value:i,onChange:a,labelIcon:l,isDisabled:!0})]})}},O={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`,status:{type:`error`,message:`You must accept the terms to continue`}}},k={render:e=>{let[t,n]=(0,p.useState)(e.value??!0),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,status:{type:`warning`,message:`This data may be shared with partners`}}},A={render:e=>{let[t,n]=(0,p.useState)(e.value??!0),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Email verified`,status:{type:`success`,message:`Your email has been verified`}}},j={render:()=>{let[e,t]=(0,p.useState)(!1),[n,r]=(0,p.useState)(!0),[i,a]=(0,p.useState)(!0);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,m.jsx)(s,{label:`Accept terms and conditions`,value:e,onChange:t,status:{type:`error`,message:`You must accept the terms to continue`}}),(0,m.jsx)(s,{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,value:n,onChange:r,status:{type:`warning`,message:`This data may be shared with partners`}}),(0,m.jsx)(s,{label:`Email verified`,value:i,onChange:a,status:{type:`success`,message:`Your email has been verified`}})]})}},M={render:e=>{let[t,n]=(0,p.useState)(e.value??!1),{value:r,onChange:i,...a}=e;return(0,m.jsx)(s,{...a,value:t,onChange:e=>n(e)})},args:{label:`Accept terms`,isDisabled:!0,disabledMessage:`Terms are managed by your administrator`}},N=i({name:`checkbox-indicator-demo`,indicators:{checkbox:({state:e,size:t,isDisabled:n})=>(0,m.jsx)(`span`,{"aria-hidden":`true`,style:{display:`inline-flex`,alignItems:`center`,justifyContent:`center`,width:t===`sm`?20:24,height:t===`sm`?20:24,border:`1px solid currentColor`,borderRadius:6,color:`#7c3aed`,opacity:n?.5:1},children:e===`checked`?`★`:e===`indeterminate`?`–`:``})}}),P={render:()=>(0,m.jsx)(o,{theme:N,mode:`light`,children:(0,m.jsxs)(`div`,{style:{display:`grid`,gap:12},children:[(0,m.jsx)(s,{label:`Custom checked glyph`,value:!0}),(0,m.jsx)(s,{label:`Custom indeterminate glyph`,value:`indeterminate`}),(0,m.jsx)(s,{label:`Unchecked`,value:!1}),(0,m.jsx)(s,{label:`Disabled`,value:!0,isDisabled:!0})]})})},F=i({name:`checkbox-round-demo`,components:{checkbox:{base:{borderRadius:`var(--radius-full)`},checked:{backgroundColor:`var(--color-positive)`,borderColor:`var(--color-positive)`}}}}),I={render:()=>(0,m.jsx)(o,{theme:F,mode:`light`,children:(0,m.jsxs)(`div`,{style:{display:`grid`,gap:12},children:[(0,m.jsx)(s,{label:`Round, positive when checked`,value:!0}),(0,m.jsx)(s,{label:`Unchecked`,value:!1})]})})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
    label: 'Subscribe to newsletter',
    description: 'Receive weekly updates about new features and announcements.'
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
    label: 'Select row',
    isLabelHidden: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
    label: 'Premium feature',
    description: 'Upgrade to enable this option',
    isDisabled: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
    label: 'Compact checkbox',
    size: 'sm'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
    label: 'Enable notifications',
    description: 'Receive alerts when important events occur',
    labelIcon: BellIcon
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={brandIndicatorTheme} mode="light">
      <div style={{
      display: 'grid',
      gap: 12
    }}>
        <CheckboxInput label="Custom checked glyph" value={true} />
        <CheckboxInput label="Custom indeterminate glyph" value="indeterminate" />
        <CheckboxInput label="Unchecked" value={false} />
        <CheckboxInput label="Disabled" value={true} isDisabled />
      </div>
    </Theme>
}`,...P.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={roundCheckboxTheme} mode="light">
      <div style={{
      display: 'grid',
      gap: 12
    }}>
        <CheckboxInput label="Round, positive when checked" value={true} />
        <CheckboxInput label="Unchecked" value={false} />
      </div>
    </Theme>
}`,...I.parameters?.docs?.source}}},L=[`Default`,`Checked`,`WithDescription`,`WithHiddenLabel`,`Indeterminate`,`Disabled`,`DisabledChecked`,`AllVariations`,`SmallSize`,`SizeComparison`,`WithStartIcon`,`StartIconVariations`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`StatusVariations`,`DisabledWithMessage`,`ThemedIndicator`,`ThemedCheckboxTarget`]}))();export{C as AllVariations,_ as Checked,g as Default,x as Disabled,S as DisabledChecked,M as DisabledWithMessage,b as Indeterminate,T as SizeComparison,w as SmallSize,D as StartIconVariations,j as StatusVariations,I as ThemedCheckboxTarget,P as ThemedIndicator,v as WithDescription,O as WithErrorStatus,y as WithHiddenLabel,E as WithStartIcon,A as WithSuccessStatus,k as WithWarningStatus,L as __namedExportsOrder,h as default};