import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Badge-C-kFxK9W.js";import{i as o,t as s}from"./Link-BpwNxEwl.js";import{lr as c,or as l,sr as u}from"./iframe-C9K_Xcjh.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{d=t(n()),l(),a(),s(),f=r(),p={title:`Core/RadioList`,component:c,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},value:{control:`text`,description:`The currently selected value`},orientation:{control:`select`,options:[`vertical`,`horizontal`],description:`Layout direction of the radio items`},isDisabled:{control:`boolean`,description:`Whether all radio items are disabled`},disabledMessage:{control:`text`,description:`Explains why the group is disabled (whole-group state, not per item). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the radios focusable via aria-disabled (selection stays blocked). Use this instead of wrapping a disabled RadioList in Tooltip.`},isRequired:{control:`boolean`,description:`Whether the radio group is required`},isOptional:{control:`boolean`,description:`Whether the field is optional`}}},m={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`}),(0,f.jsx)(u,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`}},h={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`,description:`Receive notifications via email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`,description:`Standard messaging rates apply`}),(0,f.jsx)(u,{label:`Push notification`,value:`push`,description:`Instant alerts on your device`})]})},args:{label:`Notification preference`,description:`Choose how you would like to be notified`}},g={render:e=>{let[t,n]=(0,d.useState)(e.value??`pro`),{value:r,onChange:a,...s}=e;return(0,f.jsxs)(c,{...s,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Starter`,value:`starter`,description:(0,f.jsxs)(f.Fragment,{children:[`Free forever. `,(0,f.jsx)(o,{href:`#pricing`,children:`Compare plans`})]})}),(0,f.jsx)(u,{label:(0,f.jsxs)(f.Fragment,{children:[`Pro `,(0,f.jsx)(o,{href:`#pro-details`,children:`details`}),` `,(0,f.jsx)(i,{label:`Popular`})]}),"aria-label":`Pro`,value:`pro`,description:(0,f.jsxs)(f.Fragment,{children:[`$12 per seat. `,(0,f.jsx)(o,{href:`#pricing`,children:`See what is included`})]}),endContent:(0,f.jsx)(`span`,{"data-testid":`radio-end-content`,children:`$12/mo`})})]})},args:{label:`Plan`,description:`A ReactNode label or description can carry links and other rich content. Nested controls keep their own behavior without selecting the option.`}},_={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Small`,value:`sm`}),(0,f.jsx)(u,{label:`Medium`,value:`md`}),(0,f.jsx)(u,{label:`Large`,value:`lg`})]})},args:{label:`Size`,orientation:`horizontal`}},v={render:e=>{let[t,n]=(0,d.useState)(e.value??`email`),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`}),(0,f.jsx)(u,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isDisabled:!0}},y={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`,isDisabled:!0}),(0,f.jsx)(u,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`}},b={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`}),(0,f.jsx)(u,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isRequired:!0}},x={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`}),(0,f.jsx)(u,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isOptional:!0}},S={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`}),(0,f.jsx)(u,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isRequired:!0,status:{type:`error`,message:`Please select a notification method`}}},C={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`,startContent:(0,f.jsx)(`span`,{children:`📧`})}),(0,f.jsx)(u,{label:`SMS`,value:`sms`,startContent:(0,f.jsx)(`span`,{children:`💬`})}),(0,f.jsx)(u,{label:`Push notification`,value:`push`,startContent:(0,f.jsx)(`span`,{children:`🔔`})})]})},args:{label:`Notification preference`}},w={render:e=>{let[t,n]=(0,d.useState)(e.value??``),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Free`,value:`free`,endContent:(0,f.jsx)(`span`,{style:{color:`#0D8626`},children:`$0/mo`})}),(0,f.jsx)(u,{label:`Pro`,value:`pro`,endContent:(0,f.jsx)(`span`,{style:{color:`#0064E0`},children:`$9/mo`})}),(0,f.jsx)(u,{label:`Enterprise`,value:`enterprise`,endContent:(0,f.jsx)(`span`,{style:{color:`#5B08D8`},children:`Custom`})})]})},args:{label:`Plan`}},T={render:()=>{let[e,t]=(0,d.useState)(``),[n,r]=(0,d.useState)(`email`),[i,a]=(0,d.useState)(``),[o,s]=(0,d.useState)(`sm`);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,f.jsxs)(c,{label:`Unselected`,value:e,onChange:t,children:[(0,f.jsx)(u,{label:`Option A`,value:`a`}),(0,f.jsx)(u,{label:`Option B`,value:`b`})]}),(0,f.jsxs)(c,{label:`Pre-selected`,value:n,onChange:r,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`})]}),(0,f.jsxs)(c,{label:`Disabled group`,value:``,onChange:()=>{},isDisabled:!0,children:[(0,f.jsx)(u,{label:`Option A`,value:`a`}),(0,f.jsx)(u,{label:`Option B`,value:`b`})]}),(0,f.jsxs)(c,{label:`With descriptions`,value:i,onChange:a,children:[(0,f.jsx)(u,{label:`Email`,value:`email`,description:`Delivered to your inbox`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`,description:`Standard rates apply`})]}),(0,f.jsxs)(c,{label:`Horizontal`,value:o,onChange:s,orientation:`horizontal`,children:[(0,f.jsx)(u,{label:`S`,value:`sm`}),(0,f.jsx)(u,{label:`M`,value:`md`}),(0,f.jsx)(u,{label:`L`,value:`lg`})]}),(0,f.jsxs)(c,{label:`With error`,value:``,onChange:()=>{},isRequired:!0,status:{type:`error`,message:`Please select an option`},children:[(0,f.jsx)(u,{label:`Option A`,value:`a`}),(0,f.jsx)(u,{label:`Option B`,value:`b`})]})]})}},E={render:e=>{let[t,n]=(0,d.useState)(e.value??`email`),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(c,{...a,value:t,onChange:n,children:[(0,f.jsx)(u,{label:`Email`,value:`email`}),(0,f.jsx)(u,{label:`SMS`,value:`sms`}),(0,f.jsx)(u,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isDisabled:!0,disabledMessage:`Upgrade your account to change preferences`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" description="Receive notifications via email" />
        <RadioListItem label="SMS" value="sms" description="Standard messaging rates apply" />
        <RadioListItem label="Push notification" value="push" description="Instant alerts on your device" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    description: 'Choose how you would like to be notified'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'pro');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Starter" value="starter" description={<>
              Free forever. <Link href="#pricing">Compare plans</Link>
            </>} />
        <RadioListItem label={<>
              Pro <Link href="#pro-details">details</Link>{' '}
              <Badge label="Popular" />
            </>} aria-label="Pro" value="pro" description={<>
              $12 per seat. <Link href="#pricing">See what is included</Link>
            </>} endContent={<span data-testid="radio-end-content">$12/mo</span>} />
      </RadioList>;
  },
  args: {
    label: 'Plan',
    description: 'A ReactNode label or description can carry links and other rich content. Nested controls keep their own behavior without selecting the option.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Small" value="sm" />
        <RadioListItem label="Medium" value="md" />
        <RadioListItem label="Large" value="lg" />
      </RadioList>;
  },
  args: {
    label: 'Size',
    orientation: 'horizontal'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'email');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isDisabled: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" isDisabled />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isRequired: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isOptional: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isRequired: true,
    status: {
      type: 'error',
      message: 'Please select a notification method'
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" startContent={<span>📧</span>} />
        <RadioListItem label="SMS" value="sms" startContent={<span>💬</span>} />
        <RadioListItem label="Push notification" value="push" startContent={<span>🔔</span>} />
      </RadioList>;
  },
  args: {
    label: 'Notification preference'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Free" value="free" endContent={<span style={{
        color: '#0D8626'
      }}>$0/mo</span>} />
        <RadioListItem label="Pro" value="pro" endContent={<span style={{
        color: '#0064E0'
      }}>$9/mo</span>} />
        <RadioListItem label="Enterprise" value="enterprise" endContent={<span style={{
        color: '#5B08D8'
      }}>Custom</span>} />
      </RadioList>;
  },
  args: {
    label: 'Plan'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('email');
    const [value3, setValue3] = useState('');
    const [value4, setValue4] = useState('sm');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <RadioList label="Unselected" value={value1} onChange={setValue1}>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
        </RadioList>
        <RadioList label="Pre-selected" value={value2} onChange={setValue2}>
          <RadioListItem label="Email" value="email" />
          <RadioListItem label="SMS" value="sms" />
        </RadioList>
        <RadioList label="Disabled group" value="" onChange={() => {}} isDisabled>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
        </RadioList>
        <RadioList label="With descriptions" value={value3} onChange={setValue3}>
          <RadioListItem label="Email" value="email" description="Delivered to your inbox" />
          <RadioListItem label="SMS" value="sms" description="Standard rates apply" />
        </RadioList>
        <RadioList label="Horizontal" value={value4} onChange={setValue4} orientation="horizontal">
          <RadioListItem label="S" value="sm" />
          <RadioListItem label="M" value="md" />
          <RadioListItem label="L" value="lg" />
        </RadioList>
        <RadioList label="With error" value="" onChange={() => {}} isRequired status={{
        type: 'error',
        message: 'Please select an option'
      }}>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
        </RadioList>
      </div>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'email');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isDisabled: true,
    disabledMessage: 'Upgrade your account to change preferences'
  }
}`,...E.parameters?.docs?.source}}},D=[`Default`,`WithDescription`,`RichContent`,`Horizontal`,`Disabled`,`DisabledItem`,`Required`,`Optional`,`WithErrorStatus`,`WithStartContent`,`WithEndContent`,`AllVariations`,`DisabledWithMessage`]}))();export{T as AllVariations,m as Default,v as Disabled,y as DisabledItem,E as DisabledWithMessage,_ as Horizontal,x as Optional,b as Required,g as RichContent,h as WithDescription,w as WithEndContent,S as WithErrorStatus,C as WithStartContent,D as __namedExportsOrder,p as default};