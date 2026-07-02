import{ah as t,a1 as r}from"./iframe-DVtWfngO.js";import{N as s}from"./NumberInput-C0gE8E1S.js";import"./preload-helper-Ct5FWWRu.js";import"./Field-ClHo92iR.js";import"./FieldStatus-D14qdZVC.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./useInputContainer-398x-tRg.js";import"./groupStyles-DfllKD80.js";function U({title:e,titleId:n,...a},l){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":n},a),e?t.createElement("title",{id:n},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))}const R=t.forwardRef(U);function G({title:e,titleId:n,...a},l){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":n},a),e?t.createElement("title",{id:n},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"}))}const $=t.forwardRef(G),ae={title:"Core/NumberInput",component:s,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text displayed between the label and input"},value:{control:"number",description:"Current input value (number, null, or undefined)"},size:{control:"select",options:["sm","md","lg"],description:"Size variant"},isOptional:{control:"boolean",description:"Whether the field is optional (mutually exclusive with isRequired)"},isRequired:{control:"boolean",description:"Whether the field is required (mutually exclusive with isOptional)"},isDisabled:{control:"boolean",description:"Whether the input is disabled"},status:{control:"object",description:"Status indicator with type (warning/error/success) and optional message"},labelTooltip:{control:"text",description:"Tooltip text to display in an info icon at the end of the label"},min:{control:"number",description:"Minimum value allowed"},max:{control:"number",description:"Maximum value allowed"},step:{control:"number",description:"Step increment for the input"},units:{control:"text",description:'Units text to display at the end of the input (e.g., "%" or "GB")'},isIntegerOnly:{control:"boolean",description:"Only allow integer values (no floating point)"},autoComplete:{control:"text",description:"HTML autocomplete attribute"}}},d={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Quantity",placeholder:"Enter quantity"}},p={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Age",description:"Enter your age in years",placeholder:"Enter your age"}},m={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Rating",placeholder:"1-5",min:1,max:5,description:"Rate from 1 to 5"}},g={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Price",placeholder:"0.00",min:0,step:.01,startIcon:R}},v={render:e=>{const[n,a]=t.useState(e.value??50);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Discount",placeholder:"Enter discount",min:0,max:100,units:"%"}},h={render:e=>{const[n,a]=t.useState(e.value??128);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Storage",placeholder:"Enter storage",min:0,units:"GB"}},b={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Count",placeholder:"Enter count",isIntegerOnly:!0,description:"Only accepts whole numbers"}},x={render:e=>{const[n,a]=t.useState(e.value??42);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Quantity",value:42}},S={render:()=>{const[e,n]=t.useState(null),[a,l]=t.useState(null),[i,u]=t.useState(100),[o,c]=t.useState(null),[q,z]=t.useState(null),[A,H]=t.useState(null),[T,k]=t.useState(null),[P,B]=t.useState(50),[F,Q]=t.useState(75);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[r.jsx(s,{label:"Visible label",value:e,onChange:n,placeholder:"Enter number..."}),r.jsx(s,{label:"With description",description:"Helpful description text",value:o,onChange:c,placeholder:"Enter number..."}),r.jsx(s,{label:"Hidden label",isLabelHidden:!0,value:a,onChange:l,placeholder:"Hidden label input"}),r.jsx(s,{label:"With value",value:i,onChange:u}),r.jsx(s,{label:"Optional field",isOptional:!0,value:q,onChange:z,placeholder:"Optional..."}),r.jsx(s,{label:"Required field",isRequired:!0,value:A,onChange:H,placeholder:"Required..."}),r.jsx(s,{label:"With min/max",description:"Enter a value between 1 and 10",min:1,max:10,value:T,onChange:k,placeholder:"1-10"}),r.jsx(s,{label:"Disabled field",isDisabled:!0,value:P,onChange:B}),r.jsx(s,{label:"With units",value:F,onChange:Q,units:"%"})]})}},V={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Phone Extension",isOptional:!0,placeholder:"Enter extension"}},C={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Quantity",isRequired:!0,placeholder:"Enter quantity"}},y={render:e=>{const[n,a]=t.useState(e.value??100);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Locked Amount",isDisabled:!0,value:100}},E={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Count",placeholder:"Enter count...",startIcon:$}},I={render:()=>{const[e,n]=t.useState(null),[a,l]=t.useState(null),[i,u]=t.useState(null);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[r.jsx(s,{label:"Small (28px)",value:e,onChange:n,placeholder:"Small size",size:"sm"}),r.jsx(s,{label:"Medium (32px)",value:a,onChange:l,placeholder:"Medium size (default)",size:"md"}),r.jsx(s,{label:"Large (36px)",value:i,onChange:u,placeholder:"Large size",size:"lg"})]})}},f={render:e=>{const[n,a]=t.useState(e.value??-5);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Age",placeholder:"Enter your age",min:0,status:{type:"error",message:"Age must be a positive number"}}},j={render:e=>{const[n,a]=t.useState(e.value??150);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Age",placeholder:"Enter your age",status:{type:"warning",message:"This value seems unusually high"}}},W={render:e=>{const[n,a]=t.useState(e.value??25);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Age",placeholder:"Enter your age",status:{type:"success",message:"Valid age"}}},N={render:()=>{const[e,n]=t.useState(-5),[a,l]=t.useState(150),[i,u]=t.useState(25),[o,c]=t.useState(0);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[r.jsx(s,{label:"Error with message",value:e,onChange:n,status:{type:"error",message:"Must be positive"}}),r.jsx(s,{label:"Warning with message",value:a,onChange:l,status:{type:"warning",message:"Value seems high"}}),r.jsx(s,{label:"Success with message",value:i,onChange:u,status:{type:"success",message:"Looks good"}}),r.jsx(s,{label:"Error without message",value:o,onChange:c,status:{type:"error"}})]})}},w={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"API Rate Limit",placeholder:"Enter rate limit",labelTooltip:"Maximum number of API requests per minute"}},D={render:e=>{const[n,a]=t.useState(e.value??null);return r.jsx(s,{...e,value:n,onChange:a})},args:{label:"Price",placeholder:"0.00",min:0,step:.01,startIcon:R,description:"Enter amount in dollars"}},M={render:e=>{const[n,a]=t.useState(e.value??null),[l,i]=t.useState([]),u=o=>{i(c=>[...c.slice(-4),o])};return r.jsxs("div",{style:{maxWidth:"300px"},children:[r.jsx(s,{label:e.label,placeholder:e.placeholder,description:e.description,value:n,onChange:o=>{a(o),u(`onChange: ${o}`)},onFocus:()=>u("onFocus"),onBlur:()=>u("onBlur"),onEnter:()=>u("onEnter")}),r.jsxs("div",{style:{marginTop:"16px",fontSize:"12px",color:"#666"},children:[r.jsx("strong",{children:"Events:"}),r.jsx("ul",{style:{margin:"4px 0",paddingLeft:"20px"},children:l.map((o,c)=>r.jsx("li",{children:o},c))})]})]})},args:{label:"Interactive",placeholder:"Type and press Enter",description:"Events are logged below"}},L={render:e=>{const[n,a]=t.useState(e.value??42);return r.jsx(s,{...e,value:n,onChange:a,hasClear:!0})},args:{label:"Quantity",placeholder:"Enter a number"}},O={render:e=>{const[n,a]=t.useState(e.value??75);return r.jsx(s,{...e,value:n,onChange:a,hasClear:!0})},args:{label:"Progress",units:"%",min:0,max:100}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    placeholder: 'Enter quantity'
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    description: 'Enter your age in years',
    placeholder: 'Enter your age'
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 42);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    value: 42
  }
}`,...x.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Phone Extension',
    isOptional: true,
    placeholder: 'Enter extension'
  }
}`,...V.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    isRequired: true,
    placeholder: 'Enter quantity'
  }
}`,...C.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 100);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked Amount',
    isDisabled: true,
    value: 100
  }
}`,...y.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Count',
    placeholder: 'Enter count...',
    startIcon: HashtagIcon
  }
}`,...E.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Rate Limit',
    placeholder: 'Enter rate limit',
    labelTooltip: 'Maximum number of API requests per minute'
  }
}`,...w.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 42);
    return <NumberInput {...args} value={value} onChange={setValue} hasClear />;
  },
  args: {
    label: 'Quantity',
    placeholder: 'Enter a number'
  }
}`,...L.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};const te=["Default","WithDescription","WithMinMax","WithStep","WithUnits","WithUnitsGB","IntegerOnly","WithValue","AllVariations","OptionalField","RequiredField","Disabled","WithStartIcon","SizeVariants","ErrorStatus","WarningStatus","SuccessStatus","StatusVariations","WithTooltip","DecimalInput","WithEventHandlers","Clearable","ClearableWithUnits"];export{S as AllVariations,L as Clearable,O as ClearableWithUnits,D as DecimalInput,d as Default,y as Disabled,f as ErrorStatus,b as IntegerOnly,V as OptionalField,C as RequiredField,I as SizeVariants,N as StatusVariations,W as SuccessStatus,j as WarningStatus,p as WithDescription,M as WithEventHandlers,m as WithMinMax,E as WithStartIcon,g as WithStep,w as WithTooltip,v as WithUnits,h as WithUnitsGB,x as WithValue,te as __namedExportsOrder,ae as default};
