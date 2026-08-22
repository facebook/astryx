import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./NumberInput-BrP87x9d.js";import{It as o,ct as s,t as c}from"./esm-CL1f8dHF.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;e((()=>{l=t(n()),a(),c(),u=r(),d={title:`Core/NumberInput`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},value:{control:`number`,description:`Current input value (number, null, or undefined)`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size variant`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},isReadOnly:{control:`boolean`,description:`Whether the input is read-only. The value still submits with the form but cannot be edited. Unlike isDisabled it is not dimmed and stays in the tab order.`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (the field becomes read-only). Use this instead of wrapping a disabled NumberInput in Tooltip.`},status:{control:`object`,description:`Status indicator with type (warning/error/success) and optional message`},labelTooltip:{control:`text`,description:`Tooltip text to display in an info icon at the end of the label`},min:{control:`number`,description:`Minimum value allowed`},max:{control:`number`,description:`Maximum value allowed`},step:{control:`number`,description:`Step increment for the input`},formatValue:{control:!1,description:`Formats the committed value while the input is not focused`},isWheelEnabled:{control:`boolean`,description:`Whether a wheel gesture over the focused input steps the value`},hasNumberSteppers:{control:`boolean`,description:`Shows increment and decrement buttons`},units:{control:`text`,description:`Units text to display at the end of the input (e.g., "%" or "GB")`},isIntegerOnly:{control:`boolean`,description:`Only allow integer values (no floating point)`},autoComplete:{control:`text`,description:`HTML autocomplete attribute`}}},f={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Quantity`,placeholder:`Enter quantity`}},p={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Age`,description:`Enter your age in years`,placeholder:`Enter your age`}},m={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Rating`,placeholder:`1-5`,min:1,max:5,description:`Rate from 1 to 5`}},h={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Price`,placeholder:`0.00`,min:0,step:.01,startIcon:o}},g={render:e=>{let[t,n]=(0,l.useState)(e.value??1234.56);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Monthly revenue`,value:1234.56,min:0,step:.01,description:`Focus the input to edit the raw numeric value`,formatValue:e=>new Intl.NumberFormat(`en-US`,{style:`currency`,currency:`USD`}).format(e)}},_={render:e=>{let[t,n]=(0,l.useState)(e.value??2);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Quantity`,value:2,min:0,max:10,hasNumberSteppers:!0}},v={render:()=>{let[e,t]=(0,l.useState)(2),[n,r]=(0,l.useState)(2);return(0,u.jsxs)(`div`,{style:{width:360,height:260,overflowY:`auto`,padding:16,border:`1px solid #ccd3db`},children:[(0,u.jsx)(`div`,{style:{height:140},children:`Scroll down to the focused examples.`}),(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,u.jsx)(i,{label:`Wheel stepping enabled (default)`,description:`Focus, then use the wheel to change the value`,value:e,onChange:t}),(0,u.jsx)(i,{label:`Wheel stepping disabled`,description:`Focused wheel gestures continue scrolling`,value:n,onChange:r,isWheelEnabled:!1})]}),(0,u.jsx)(`div`,{style:{height:180}})]})}},y={render:e=>{let[t,n]=(0,l.useState)(e.value??50);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Discount`,placeholder:`Enter discount`,min:0,max:100,units:`%`}},b={render:e=>{let[t,n]=(0,l.useState)(e.value??128);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Storage`,placeholder:`Enter storage`,min:0,units:`GB`}},x={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Count`,placeholder:`Enter count`,isIntegerOnly:!0,description:`Only accepts whole numbers`}},S={render:e=>{let[t,n]=(0,l.useState)(e.value??42);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Quantity`,value:42}},C={render:()=>{let[e,t]=(0,l.useState)(null),[n,r]=(0,l.useState)(null),[a,o]=(0,l.useState)(100),[s,c]=(0,l.useState)(null),[d,f]=(0,l.useState)(null),[p,m]=(0,l.useState)(null),[h,g]=(0,l.useState)(null),[_,v]=(0,l.useState)(50),[y,b]=(0,l.useState)(75);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,u.jsx)(i,{label:`Visible label`,value:e,onChange:t,placeholder:`Enter number...`}),(0,u.jsx)(i,{label:`With description`,description:`Helpful description text`,value:s,onChange:c,placeholder:`Enter number...`}),(0,u.jsx)(i,{label:`Hidden label`,isLabelHidden:!0,value:n,onChange:r,placeholder:`Hidden label input`}),(0,u.jsx)(i,{label:`With value`,value:a,onChange:o}),(0,u.jsx)(i,{label:`Optional field`,isOptional:!0,value:d,onChange:f,placeholder:`Optional...`}),(0,u.jsx)(i,{label:`Required field`,isRequired:!0,value:p,onChange:m,placeholder:`Required...`}),(0,u.jsx)(i,{label:`With min/max`,description:`Enter a value between 1 and 10`,min:1,max:10,value:h,onChange:g,placeholder:`1-10`}),(0,u.jsx)(i,{label:`Disabled field`,isDisabled:!0,value:_,onChange:v}),(0,u.jsx)(i,{label:`With units`,value:y,onChange:b,units:`%`})]})}},w={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Phone Extension`,isOptional:!0,placeholder:`Enter extension`}},T={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Quantity`,isRequired:!0,placeholder:`Enter quantity`}},E={render:e=>{let[t,n]=(0,l.useState)(e.value??1024);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Allocated storage (GB)`,isReadOnly:!0,value:1024}},D={render:e=>{let[t,n]=(0,l.useState)(e.value??100);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Locked Amount`,isDisabled:!0,value:100}},O={render:e=>{let[t,n]=(0,l.useState)(e.value??100);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Quantity`,isDisabled:!0,disabledMessage:`Editing is locked while the order is processing`,value:100}},k={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Count`,placeholder:`Enter count...`,startIcon:s}},A={render:()=>{let[e,t]=(0,l.useState)(null),[n,r]=(0,l.useState)(null),[a,o]=(0,l.useState)(null);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,u.jsx)(i,{label:`Small (28px)`,value:e,onChange:t,placeholder:`Small size`,size:`sm`}),(0,u.jsx)(i,{label:`Medium (32px)`,value:n,onChange:r,placeholder:`Medium size (default)`,size:`md`}),(0,u.jsx)(i,{label:`Large (36px)`,value:a,onChange:o,placeholder:`Large size`,size:`lg`})]})}},j={render:e=>{let[t,n]=(0,l.useState)(e.value??-5);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Age`,placeholder:`Enter your age`,min:0,status:{type:`error`,message:`Age must be a positive number`}}},M={render:e=>{let[t,n]=(0,l.useState)(e.value??150);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Age`,placeholder:`Enter your age`,status:{type:`warning`,message:`This value seems unusually high`}}},N={render:e=>{let[t,n]=(0,l.useState)(e.value??25);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Age`,placeholder:`Enter your age`,status:{type:`success`,message:`Valid age`}}},P={render:()=>{let[e,t]=(0,l.useState)(-5),[n,r]=(0,l.useState)(150),[a,o]=(0,l.useState)(25),[s,c]=(0,l.useState)(0);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,u.jsx)(i,{label:`Error with message`,value:e,onChange:t,status:{type:`error`,message:`Must be positive`}}),(0,u.jsx)(i,{label:`Warning with message`,value:n,onChange:r,status:{type:`warning`,message:`Value seems high`}}),(0,u.jsx)(i,{label:`Success with message`,value:a,onChange:o,status:{type:`success`,message:`Looks good`}}),(0,u.jsx)(i,{label:`Error without message`,value:s,onChange:c,status:{type:`error`}})]})}},F={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`API Rate Limit`,placeholder:`Enter rate limit`,labelTooltip:`Maximum number of API requests per minute`}},I={render:e=>{let[t,n]=(0,l.useState)(e.value??null);return(0,u.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Price`,placeholder:`0.00`,min:0,step:.01,startIcon:o,description:`Enter amount in dollars`}},L={render:e=>{let[t,n]=(0,l.useState)(e.value??null),[r,a]=(0,l.useState)([]),o=e=>{a(t=>[...t.slice(-4),e])};return(0,u.jsxs)(`div`,{style:{maxWidth:`300px`},children:[(0,u.jsx)(i,{label:e.label,placeholder:e.placeholder,description:e.description,value:t,onChange:e=>{n(e),o(`onChange: ${e}`)},onFocus:()=>o(`onFocus`),onBlur:()=>o(`onBlur`),onEnter:()=>o(`onEnter`)}),(0,u.jsxs)(`div`,{style:{marginTop:`16px`,fontSize:`12px`,color:`#666`},children:[(0,u.jsx)(`strong`,{children:`Events:`}),(0,u.jsx)(`ul`,{style:{margin:`4px 0`,paddingLeft:`20px`},children:r.map((e,t)=>(0,u.jsx)(`li`,{children:e},t))})]})]})},args:{label:`Interactive`,placeholder:`Type and press Enter`,description:`Events are logged below`}},R={render:e=>{let[t,n]=(0,l.useState)(e.value??42);return(0,u.jsx)(i,{...e,value:t,onChange:n,hasClear:!0})},args:{label:`Quantity`,placeholder:`Enter a number`}},z={render:e=>{let[t,n]=(0,l.useState)(e.value??75);return(0,u.jsx)(i,{...e,value:t,onChange:n,hasClear:!0})},args:{label:`Progress`,units:`%`,min:0,max:100}},B={render:()=>{let[e,t]=(0,l.useState)(-5),[n,r]=(0,l.useState)(-5);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:280},children:[(0,u.jsx)(i,{label:`Attached (default)`,value:e,onChange:t,status:{type:`error`,message:`Must be a positive number`}}),(0,u.jsx)(i,{label:`Detached`,value:n,onChange:r,status:{type:`error`,message:`Must be a positive number`},statusVariant:`detached`})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    placeholder: 'Enter quantity'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    description: 'Enter your age in years',
    placeholder: 'Enter your age'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Rating',
    placeholder: '1-5',
    min: 1,
    max: 5,
    description: 'Rate from 1 to 5'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price',
    placeholder: '0.00',
    min: 0,
    step: 0.01,
    startIcon: CurrencyDollarIcon
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 1234.56);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Monthly revenue',
    value: 1234.56,
    min: 0,
    step: 0.01,
    description: 'Focus the input to edit the raw numeric value',
    formatValue: value => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 2);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    value: 2,
    min: 0,
    max: 10,
    hasNumberSteppers: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [enabledValue, setEnabledValue] = useState<number | null>(2);
    const [disabledValue, setDisabledValue] = useState<number | null>(2);
    return <div style={{
      width: 360,
      height: 260,
      overflowY: 'auto',
      padding: 16,
      border: '1px solid #ccd3db'
    }}>
        <div style={{
        height: 140
      }}>Scroll down to the focused examples.</div>
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
          <NumberInput label="Wheel stepping enabled (default)" description="Focus, then use the wheel to change the value" value={enabledValue} onChange={setEnabledValue} />
          <NumberInput label="Wheel stepping disabled" description="Focused wheel gestures continue scrolling" value={disabledValue} onChange={setDisabledValue} isWheelEnabled={false} />
        </div>
        <div style={{
        height: 180
      }} />
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 50);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Discount',
    placeholder: 'Enter discount',
    min: 0,
    max: 100,
    units: '%'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 128);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Storage',
    placeholder: 'Enter storage',
    min: 0,
    units: 'GB'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Count',
    placeholder: 'Enter count',
    isIntegerOnly: true,
    description: 'Only accepts whole numbers'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 42);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    value: 42
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<number | null>(null);
    const [value2, setValue2] = useState<number | null>(null);
    const [value3, setValue3] = useState<number | null>(100);
    const [value4, setValue4] = useState<number | null>(null);
    const [value5, setValue5] = useState<number | null>(null);
    const [value6, setValue6] = useState<number | null>(null);
    const [value7, setValue7] = useState<number | null>(null);
    const [value8, setValue8] = useState<number | null>(50);
    const [value9, setValue9] = useState<number | null>(75);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <NumberInput label="Visible label" value={value1} onChange={setValue1} placeholder="Enter number..." />
        <NumberInput label="With description" description="Helpful description text" value={value4} onChange={setValue4} placeholder="Enter number..." />
        <NumberInput label="Hidden label" isLabelHidden value={value2} onChange={setValue2} placeholder="Hidden label input" />
        <NumberInput label="With value" value={value3} onChange={setValue3} />
        <NumberInput label="Optional field" isOptional value={value5} onChange={setValue5} placeholder="Optional..." />
        <NumberInput label="Required field" isRequired value={value6} onChange={setValue6} placeholder="Required..." />
        <NumberInput label="With min/max" description="Enter a value between 1 and 10" min={1} max={10} value={value7} onChange={setValue7} placeholder="1-10" />
        <NumberInput label="Disabled field" isDisabled value={value8} onChange={setValue8} />
        <NumberInput label="With units" value={value9} onChange={setValue9} units="%" />
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Phone Extension',
    isOptional: true,
    placeholder: 'Enter extension'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    isRequired: true,
    placeholder: 'Enter quantity'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 1024);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Allocated storage (GB)',
    isReadOnly: true,
    value: 1024
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 100);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked Amount',
    isDisabled: true,
    value: 100
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 100);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    isDisabled: true,
    disabledMessage: 'Editing is locked while the order is processing',
    value: 100
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Count',
    placeholder: 'Enter count...',
    startIcon: HashtagIcon
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState<number | null>(null);
    const [md, setMd] = useState<number | null>(null);
    const [lg, setLg] = useState<number | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <NumberInput label="Small (28px)" value={sm} onChange={setSm} placeholder="Small size" size="sm" />
        <NumberInput label="Medium (32px)" value={md} onChange={setMd} placeholder="Medium size (default)" size="md" />
        <NumberInput label="Large (36px)" value={lg} onChange={setLg} placeholder="Large size" size="lg" />
      </div>;
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? -5);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    min: 0,
    status: {
      type: 'error',
      message: 'Age must be a positive number'
    }
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 150);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    status: {
      type: 'warning',
      message: 'This value seems unusually high'
    }
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 25);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    status: {
      type: 'success',
      message: 'Valid age'
    }
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [error, setError] = useState<number | null>(-5);
    const [warning, setWarning] = useState<number | null>(150);
    const [success, setSuccess] = useState<number | null>(25);
    const [errorNoMsg, setErrorNoMsg] = useState<number | null>(0);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <NumberInput label="Error with message" value={error} onChange={setError} status={{
        type: 'error',
        message: 'Must be positive'
      }} />
        <NumberInput label="Warning with message" value={warning} onChange={setWarning} status={{
        type: 'warning',
        message: 'Value seems high'
      }} />
        <NumberInput label="Success with message" value={success} onChange={setSuccess} status={{
        type: 'success',
        message: 'Looks good'
      }} />
        <NumberInput label="Error without message" value={errorNoMsg} onChange={setErrorNoMsg} status={{
        type: 'error'
      }} />
      </div>;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Rate Limit',
    placeholder: 'Enter rate limit',
    labelTooltip: 'Maximum number of API requests per minute'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price',
    placeholder: '0.00',
    min: 0,
    step: 0.01,
    startIcon: CurrencyDollarIcon,
    description: 'Enter amount in dollars'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    const [events, setEvents] = useState<string[]>([]);
    const addEvent = (event: string) => {
      setEvents(prev => [...prev.slice(-4), event]);
    };
    return <div style={{
      maxWidth: '300px'
    }}>
        <NumberInput label={args.label} placeholder={args.placeholder} description={args.description} value={value} onChange={v => {
        setValue(v);
        addEvent(\`onChange: \${v}\`);
      }} onFocus={() => addEvent('onFocus')} onBlur={() => addEvent('onBlur')} onEnter={() => addEvent('onEnter')} />
        <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#666'
      }}>
          <strong>Events:</strong>
          <ul style={{
          margin: '4px 0',
          paddingLeft: '20px'
        }}>
            {events.map((event, i) => <li key={i}>{event}</li>)}
          </ul>
        </div>
      </div>;
  },
  args: {
    label: 'Interactive',
    placeholder: 'Type and press Enter',
    description: 'Events are logged below'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 42);
    return <NumberInput {...args} value={value} onChange={setValue} hasClear />;
  },
  args: {
    label: 'Quantity',
    placeholder: 'Enter a number'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 75);
    return <NumberInput {...args} value={value} onChange={setValue} hasClear />;
  },
  args: {
    label: 'Progress',
    units: '%',
    min: 0,
    max: 100
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<number | null>(-5);
    const [b, setB] = useState<number | null>(-5);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 280
    }}>
        <NumberInput label="Attached (default)" value={a} onChange={setA} status={{
        type: 'error',
        message: 'Must be a positive number'
      }} />
        <NumberInput label="Detached" value={b} onChange={setB} status={{
        type: 'error',
        message: 'Must be a positive number'
      }} statusVariant="detached" />
      </div>;
  }
}`,...B.parameters?.docs?.source}}},V=`Default.WithDescription.WithMinMax.WithStep.FormattedDisplay.WithNumberSteppers.WheelBehavior.WithUnits.WithUnitsGB.IntegerOnly.WithValue.AllVariations.OptionalField.RequiredField.ReadOnly.Disabled.DisabledWithMessage.WithStartIcon.SizeVariants.ErrorStatus.WarningStatus.SuccessStatus.StatusVariations.WithTooltip.DecimalInput.WithEventHandlers.Clearable.ClearableWithUnits.StatusVariantComparison`.split(`.`)}))();export{C as AllVariations,R as Clearable,z as ClearableWithUnits,I as DecimalInput,f as Default,D as Disabled,O as DisabledWithMessage,j as ErrorStatus,g as FormattedDisplay,x as IntegerOnly,w as OptionalField,E as ReadOnly,T as RequiredField,A as SizeVariants,B as StatusVariantComparison,P as StatusVariations,N as SuccessStatus,M as WarningStatus,v as WheelBehavior,p as WithDescription,L as WithEventHandlers,m as WithMinMax,_ as WithNumberSteppers,k as WithStartIcon,h as WithStep,F as WithTooltip,y as WithUnits,b as WithUnitsGB,S as WithValue,V as __namedExportsOrder,d as default};