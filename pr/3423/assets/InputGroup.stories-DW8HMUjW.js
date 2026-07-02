import{aL as N,ah as a,a1 as e,c as E,a6 as H,af as W,ay as k,I as M}from"./iframe-FpdBIrKz.js";import{F as _}from"./Field-aJnAslJ5.js";import{I as F}from"./groupStyles-C176OdEO.js";import{T as u}from"./TextInput-9l97PzER.js";import{N as O}from"./NumberInput-Bp2M4usE.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-DWE8xW4u.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./useInputContainer-BioBew49.js";import"./useClickableContainer-k5V8_ZgW.js";const V={group:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx1qjc9v5",kWkggS:"astryxjbqb8w",$$css:!0},disabled:{kkrTdU:"astryx1h6gzvc",kSiTet:"astryxbyyjgo",$$css:!0}},X={sm:{kZKoxP:"astryx6k0iem",$$css:!0},md:{kZKoxP:"astryx1ueg155",$$css:!0},lg:{kZKoxP:"astryxssyfek",$$css:!0}};function l({children:t,label:r,isLabelHidden:s=!1,description:i,isDisabled:o=!1,isOptional:p=!1,isRequired:G=!1,size:S,status:d,labelTooltip:C,xstyle:P,className:q,style:R,ref:$,"data-testid":A,...D}){const j=N(S,"md"),w=a.useId(),L=a.useId(),z=a.useId(),U=a.useMemo(()=>({isInGroup:!0}),[]);return e.jsx(F,{value:U,children:e.jsx(E,{value:j,children:e.jsx(_,{label:r,isLabelHidden:s,description:i,inputID:w,labelID:L,isGroupLabel:!0,isOptional:p,isRequired:G,isDisabled:o,status:d?{type:d.type,message:d.message,messageID:d.message?z:void 0}:void 0,statusVariant:"detached",labelTooltip:C,children:e.jsx("div",{ref:$,role:"group","aria-labelledby":L,"data-testid":A,...D,...H(k("input-group",{size:j,status:d?.type??null}),W(V.group,X[j],o&&V.disabled,P),q,R),children:t})})})})}l.displayName="InputGroup";l.__docgenInfo={description:`Groups an input with prefix/suffix addons in a visually connected
container with shared border and focus ring.

@example
\`\`\`
<InputGroup label="Price">
  <InputGroupText>$</InputGroupText>
  <TextInput label="Price" isLabelHidden value={price} onChange={setPrice} />
</InputGroup>
\`\`\``,methods:[],displayName:"InputGroup",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the group container element"},children:{required:!0,tsType:{name:"ReactNode"},description:"Input and addon children."},label:{required:!0,tsType:{name:"string"},description:"Label text for the group (required for accessibility)."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether to visually hide the label.
@default false`,defaultValue:{value:"false",computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text displayed between the label and input group."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the group is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isOptional:{required:!1,tsType:{name:"boolean"},description:`Whether the field is optional.
@default false`,defaultValue:{value:"false",computed:!1}},isRequired:{required:!1,tsType:{name:"boolean"},description:`Whether the field is required.
@default false`,defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:`Default size for inputs in the group.
@default 'md'`},status:{required:!1,tsType:{name:"InputStatus"},description:"Status indicator applied to the group border."},labelTooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text at the end of the label."},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for testing frameworks."}},composes:["Omit"]};const Y={text:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kg3NbH:"astryxf314gf",kWkggS:"astryxwmxj5m",kMv6JI:"astryx9ynric",kGuDYH:"astryxjm74w1",kLWn49:"astryxw6l6zx",kMwMTN:"astryxv1l7n4",khDVqt:"astryxuxw1ft",kmuXW:"astryx2lah0s",kMzoRj:"astryx1litavf",ksu8eU:"astryx1y0btm7",kVAM5u:"astryxvy26l8",keTefX:"astryxd10s4z astryx1pwwqoy",krdFHd:"astryx15mokao astryx8eehn2",kVL7Gh:"astryxbiv7yw astryx1xrp5p4",kfmiAY:"astryx1ga7v0g astryx11xp8u1",kT0f0o:"astryx16uus16 astryx747jw7",$$css:!0}};function n({ref:t,children:r,xstyle:s,className:i,style:o,...p}){return e.jsx("div",{ref:t,...p,...H(k("input-group-text"),W(Y.text,s),i,o),children:r})}n.displayName="InputGroupText";n.__docgenInfo={description:`A prefix or suffix text element for use inside InputGroup.

@example
\`\`\`
<InputGroup label="URL">
  <InputGroupText>https://</InputGroupText>
  <TextInput label="URL" isLabelHidden value={url} onChange={setUrl} />
</InputGroup>
\`\`\``,methods:[],displayName:"InputGroupText",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:`Content to render in the text slot.
Can be text or an icon.`}},composes:["Omit"]};const ne={title:"Core/InputGroup",component:l,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label"},description:{control:"text",description:"Description text"},isDisabled:{control:"boolean",description:"Disable the group"},size:{control:"radio",options:["sm","md","lg"],description:"Input size"}}},c={render:t=>{const[r,s]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(n,{children:"$"}),e.jsx(u,{label:"Amount",isLabelHidden:!0,value:r,onChange:s,placeholder:"0.00"})]})},args:{label:"Price"}},x={render:t=>{const[r,s]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(u,{label:"Weight",isLabelHidden:!0,value:r,onChange:s,placeholder:"0"}),e.jsx(n,{children:"kg"})]})},args:{label:"Weight"}},m={render:t=>{const[r,s]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(n,{children:"https://"}),e.jsx(u,{label:"URL",isLabelHidden:!0,value:r,onChange:s,placeholder:"example"}),e.jsx(n,{children:".com"})]})},args:{label:"Website"}},h={render:t=>{const[r,s]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(n,{children:e.jsx(M,{icon:"search",size:"sm",color:"secondary"})}),e.jsx(u,{label:"Search",isLabelHidden:!0,value:r,onChange:s,placeholder:"Search..."})]})},args:{label:"Search",isLabelHidden:!0}},g={render:t=>{const[r,s]=a.useState(void 0);return e.jsxs(l,{...t,children:[e.jsx(n,{children:"$"}),e.jsx(O,{label:"Amount",isLabelHidden:!0,value:r,onChange:s,placeholder:"0.00"})]})},args:{label:"Budget"}},b={render:t=>{const[r,s]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(n,{children:"@"}),e.jsx(u,{label:"Username",isLabelHidden:!0,value:r,onChange:s,placeholder:"username"})]})},args:{label:"Username",description:"Your public display name"}},I={render:t=>{const[r,s]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(n,{children:"$"}),e.jsx(u,{label:"Amount",isLabelHidden:!0,value:r,onChange:s,placeholder:"0.00"})]})},args:{label:"Price",status:{type:"error",message:"Price is required"}}},f={render:t=>{const[r,s]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(n,{children:"$"}),e.jsx(u,{label:"Amount",isLabelHidden:!0,value:r,onChange:s,placeholder:"0.00"})]})},args:{label:"Price",size:"sm"}},v={render:t=>{const[r,s]=a.useState("");return e.jsx("div",{style:{maxWidth:500},children:e.jsxs(l,{...t,children:[e.jsx(n,{children:"https://"}),e.jsx(u,{label:"URL",isLabelHidden:!0,value:r,onChange:s,placeholder:"example.com"})]})})},args:{label:"Website URL"}},y={render:t=>{const[r,s]=a.useState(""),[i,o]=a.useState("");return e.jsxs(l,{...t,children:[e.jsx(u,{label:"Address",isLabelHidden:!0,value:r,onChange:s,placeholder:"Address"}),e.jsx(n,{children:"@"}),e.jsx(u,{label:"Domain",isLabelHidden:!0,value:i,onChange:o,placeholder:"Domain"})]})},args:{label:"Email"}},T={render:()=>{const[t,r]=a.useState(""),[s,i]=a.useState(""),[o,p]=a.useState(""),[G,S]=a.useState("");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsxs(l,{label:"Price",children:[e.jsx(n,{children:"$"}),e.jsx(u,{label:"Amount",isLabelHidden:!0,value:t,onChange:r,placeholder:"0.00"})]}),e.jsxs(l,{label:"Website",children:[e.jsx(n,{children:"https://"}),e.jsx(u,{label:"URL",isLabelHidden:!0,value:s,onChange:i,placeholder:"example"}),e.jsx(n,{children:".com"})]}),e.jsxs(l,{label:"Weight",children:[e.jsx(u,{label:"Weight",isLabelHidden:!0,value:o,onChange:p,placeholder:"0"}),e.jsx(n,{children:"kg"})]}),e.jsxs(l,{label:"Price",status:{type:"error",message:"Price is required"},children:[e.jsx(n,{children:"$"}),e.jsx(u,{label:"Amount",isLabelHidden:!0,value:G,onChange:S,placeholder:"0.00"})]})]})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Price'
  }
}`,...c.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <TextInput label="Weight" isLabelHidden value={value} onChange={setValue} placeholder="0" />
        <InputGroupText>kg</InputGroupText>
      </InputGroup>;
  },
  args: {
    label: 'Weight'
  }
}`,...x.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput label="URL" isLabelHidden value={value} onChange={setValue} placeholder="example" />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>;
  },
  args: {
    label: 'Website'
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>
          <Icon icon="search" size="sm" color="secondary" />
        </InputGroupText>
        <TextInput label="Search" isLabelHidden value={value} onChange={setValue} placeholder="Search..." />
      </InputGroup>;
  },
  args: {
    label: 'Search',
    isLabelHidden: true
  }
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <NumberInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Budget'
  }
}`,...g.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>@</InputGroupText>
        <TextInput label="Username" isLabelHidden value={value} onChange={setValue} placeholder="username" />
      </InputGroup>;
  },
  args: {
    label: 'Username',
    description: 'Your public display name'
  }
}`,...b.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Price',
    status: {
      type: 'error',
      message: 'Price is required'
    }
  }
}`,...I.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Price',
    size: 'sm'
  }
}`,...f.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <div style={{
      maxWidth: 500
    }}>
        <InputGroup {...args}>
          <InputGroupText>https://</InputGroupText>
          <TextInput label="URL" isLabelHidden value={value} onChange={setValue} placeholder="example.com" />
        </InputGroup>
      </div>;
  },
  args: {
    label: 'Website URL'
  }
}`,...v.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [left, setLeft] = useState('');
    const [right, setRight] = useState('');
    return <InputGroup {...args}>
        <TextInput label="Address" isLabelHidden value={left} onChange={setLeft} placeholder="Address" />
        <InputGroupText>@</InputGroupText>
        <TextInput label="Domain" isLabelHidden value={right} onChange={setRight} placeholder="Domain" />
      </InputGroup>;
  },
  args: {
    label: 'Email'
  }
}`,...y.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('');
    const [v3, setV3] = useState('');
    const [v4, setV4] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <InputGroup label="Price">
          <InputGroupText>$</InputGroupText>
          <TextInput label="Amount" isLabelHidden value={v1} onChange={setV1} placeholder="0.00" />
        </InputGroup>
        <InputGroup label="Website">
          <InputGroupText>https://</InputGroupText>
          <TextInput label="URL" isLabelHidden value={v2} onChange={setV2} placeholder="example" />
          <InputGroupText>.com</InputGroupText>
        </InputGroup>
        <InputGroup label="Weight">
          <TextInput label="Weight" isLabelHidden value={v3} onChange={setV3} placeholder="0" />
          <InputGroupText>kg</InputGroupText>
        </InputGroup>
        <InputGroup label="Price" status={{
        type: 'error',
        message: 'Price is required'
      }}>
          <InputGroupText>$</InputGroupText>
          <TextInput label="Amount" isLabelHidden value={v4} onChange={setV4} placeholder="0.00" />
        </InputGroup>
      </div>;
  }
}`,...T.parameters?.docs?.source}}};const le=["WithPrefix","WithSuffix","WithPrefixAndSuffix","WithIconPrefix","WithNumberInput","WithDescription","WithErrorStatus","SmallSize","FullWidth","TwoInputs","AllVariations"];export{T as AllVariations,v as FullWidth,f as SmallSize,y as TwoInputs,b as WithDescription,I as WithErrorStatus,h as WithIconPrefix,g as WithNumberInput,c as WithPrefix,m as WithPrefixAndSuffix,x as WithSuffix,le as __namedExportsOrder,ne as default};
