import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./jsx-runtime-cM__dR4X.js";import{i,n as a,t as o}from"./RadioList-BRfXICv-.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;t((()=>{s=e(n()),o(),c=r(),l={title:`Core/RadioList`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},value:{control:`text`,description:`The currently selected value`},orientation:{control:`select`,options:[`vertical`,`horizontal`],description:`Layout direction of the radio items`},isDisabled:{control:`boolean`,description:`Whether all radio items are disabled`},disabledMessage:{control:`text`,description:`Explains why the group is disabled (whole-group state, not per item). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the radios focusable via aria-disabled (selection stays blocked). Use this instead of wrapping a disabled RadioList in Tooltip.`},isRequired:{control:`boolean`,description:`Whether the radio group is required`},isOptional:{control:`boolean`,description:`Whether the field is optional`}}},u={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`}),(0,c.jsx)(a,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`}},d={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`,description:`Receive notifications via email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`,description:`Standard messaging rates apply`}),(0,c.jsx)(a,{label:`Push notification`,value:`push`,description:`Instant alerts on your device`})]})},args:{label:`Notification preference`,description:`Choose how you would like to be notified`}},f={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Small`,value:`sm`}),(0,c.jsx)(a,{label:`Medium`,value:`md`}),(0,c.jsx)(a,{label:`Large`,value:`lg`})]})},args:{label:`Size`,orientation:`horizontal`}},p={render:e=>{let[t,n]=(0,s.useState)(e.value??`email`),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`}),(0,c.jsx)(a,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isDisabled:!0}},m={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`,isDisabled:!0}),(0,c.jsx)(a,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`}},h={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`}),(0,c.jsx)(a,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isRequired:!0}},g={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`}),(0,c.jsx)(a,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isOptional:!0}},_={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`}),(0,c.jsx)(a,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isRequired:!0,status:{type:`error`,message:`Please select a notification method`}}},v={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`,startContent:(0,c.jsx)(`span`,{children:`📧`})}),(0,c.jsx)(a,{label:`SMS`,value:`sms`,startContent:(0,c.jsx)(`span`,{children:`💬`})}),(0,c.jsx)(a,{label:`Push notification`,value:`push`,startContent:(0,c.jsx)(`span`,{children:`🔔`})})]})},args:{label:`Notification preference`}},y={render:e=>{let[t,n]=(0,s.useState)(e.value??``),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Free`,value:`free`,endContent:(0,c.jsx)(`span`,{style:{color:`#0D8626`},children:`$0/mo`})}),(0,c.jsx)(a,{label:`Pro`,value:`pro`,endContent:(0,c.jsx)(`span`,{style:{color:`#0064E0`},children:`$9/mo`})}),(0,c.jsx)(a,{label:`Enterprise`,value:`enterprise`,endContent:(0,c.jsx)(`span`,{style:{color:`#5B08D8`},children:`Custom`})})]})},args:{label:`Plan`}},b={render:()=>{let[e,t]=(0,s.useState)(``),[n,r]=(0,s.useState)(`email`),[o,l]=(0,s.useState)(``),[u,d]=(0,s.useState)(`sm`);return(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,c.jsxs)(i,{label:`Unselected`,value:e,onChange:t,children:[(0,c.jsx)(a,{label:`Option A`,value:`a`}),(0,c.jsx)(a,{label:`Option B`,value:`b`})]}),(0,c.jsxs)(i,{label:`Pre-selected`,value:n,onChange:r,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`})]}),(0,c.jsxs)(i,{label:`Disabled group`,value:``,onChange:()=>{},isDisabled:!0,children:[(0,c.jsx)(a,{label:`Option A`,value:`a`}),(0,c.jsx)(a,{label:`Option B`,value:`b`})]}),(0,c.jsxs)(i,{label:`With descriptions`,value:o,onChange:l,children:[(0,c.jsx)(a,{label:`Email`,value:`email`,description:`Delivered to your inbox`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`,description:`Standard rates apply`})]}),(0,c.jsxs)(i,{label:`Horizontal`,value:u,onChange:d,orientation:`horizontal`,children:[(0,c.jsx)(a,{label:`S`,value:`sm`}),(0,c.jsx)(a,{label:`M`,value:`md`}),(0,c.jsx)(a,{label:`L`,value:`lg`})]}),(0,c.jsxs)(i,{label:`With error`,value:``,onChange:()=>{},isRequired:!0,status:{type:`error`,message:`Please select an option`},children:[(0,c.jsx)(a,{label:`Option A`,value:`a`}),(0,c.jsx)(a,{label:`Option B`,value:`b`})]})]})}},x={render:e=>{let[t,n]=(0,s.useState)(e.value??`email`),{value:r,onChange:o,...l}=e;return(0,c.jsxs)(i,{...l,value:t,onChange:n,children:[(0,c.jsx)(a,{label:`Email`,value:`email`}),(0,c.jsx)(a,{label:`SMS`,value:`sms`}),(0,c.jsx)(a,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preference`,isDisabled:!0,disabledMessage:`Upgrade your account to change preferences`}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithDescription`,`Horizontal`,`Disabled`,`DisabledItem`,`Required`,`Optional`,`WithErrorStatus`,`WithStartContent`,`WithEndContent`,`AllVariations`,`DisabledWithMessage`]}))();export{b as AllVariations,u as Default,p as Disabled,m as DisabledItem,x as DisabledWithMessage,f as Horizontal,g as Optional,h as Required,d as WithDescription,y as WithEndContent,_ as WithErrorStatus,v as WithStartContent,S as __namedExportsOrder,l as default};