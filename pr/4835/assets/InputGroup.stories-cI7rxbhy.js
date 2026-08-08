import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{n as s,t as c}from"./InputGroupContext-CDHZwJED.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{n as u,r as d,t as ee}from"./SizeContext-Dp2usO2O.js";import{n as f,t as p}from"./Icon-C24cO4CC.js";import{n as m,t as te}from"./Field-DZ-q02Vq.js";import{n as h,t as g}from"./TextInput-BwKW_f5i.js";import{n as _,t as v}from"./Selector-CXBa_P0j.js";import{n as ne,t as re}from"./DateInput-BhvRwEmD.js";import{n as y,t as ie}from"./MultiSelector-BmMbiZNG.js";import{n as b,t as x}from"./TimeInput-BumYusjs.js";import{n as S,t as C}from"./NumberInput-2V04Odci.js";import{n as ae,t as w}from"./Typeahead-DYlW9JTQ.js";function T({children:e,label:t,isLabelHidden:r=!1,description:o,isDisabled:s=!1,isOptional:l=!1,isRequired:u=!1,size:f,status:p,labelTooltip:m,xstyle:h,className:g,style:_,ref:v,"data-testid":ne,...re}){let y=d(f,`md`),ie=(0,E.useId)(),b=(0,E.useId)(),x=(0,E.useId)(),S=(0,E.useId)(),C=[o?x:null,p?.message?S:null].filter(Boolean).join(` `)||void 0,ae=(0,E.useMemo)(()=>({isInGroup:!0,labelID:b,describedByIDs:C}),[b,C]);return(0,D.jsx)(c,{value:ae,children:(0,D.jsx)(ee,{value:y,children:(0,D.jsx)(te,{label:t,isLabelHidden:r,description:o,inputID:ie,labelID:b,descriptionID:o?x:void 0,isGroupLabel:!0,isOptional:l,isRequired:u,isDisabled:s,status:p?{type:p.type,message:p.message,messageID:p.message?S:void 0}:void 0,statusVariant:`detached`,labelTooltip:m,children:(0,D.jsx)(`div`,{ref:v,"data-testid":ne,...re,role:`group`,"aria-labelledby":b,"aria-describedby":C,...i(a(`input-group`,{size:y,status:p?.type??null}),n(O.group,oe[y],s&&O.disabled,h),g,_),children:e})})})})}var E,D,O,oe;function se(){return(se=e((()=>{E=t(),r(),m(),u(),s(),o(),D=l(),O={group:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx1qjc9v5`,kWkggS:`astryxjbqb8w`,$$css:!0},disabled:{kkrTdU:`astryx1h6gzvc`,kSiTet:`astryxbyyjgo`,$$css:!0}},oe={sm:{kZKoxP:`astryx6k0iem`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,$$css:!0}},T.displayName=`InputGroup`,T.__docgenInfo={description:`Groups an input with prefix/suffix addons in a visually connected
container with shared border and focus ring.

@example
\`\`\`
<InputGroup label="Price">
  <InputGroupText>$</InputGroupText>
  <TextInput label="Price" isLabelHidden value={price} onChange={setPrice} />
</InputGroup>
\`\`\``,methods:[],displayName:`InputGroup`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the group container element`},children:{required:!0,tsType:{name:`ReactNode`},description:`Input and addon children.`},label:{required:!0,tsType:{name:`string`},description:`Label text for the group (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label.
@default false`,defaultValue:{value:`false`,computed:!1}},description:{required:!1,tsType:{name:`string`},description:`Description text displayed between the label and input group.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the group is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},isOptional:{required:!1,tsType:{name:`boolean`},description:`Whether the field is optional.
@default false`,defaultValue:{value:`false`,computed:!1}},isRequired:{required:!1,tsType:{name:`boolean`},description:`Whether the field is required.
@default false`,defaultValue:{value:`false`,computed:!1}},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:`Default size for inputs in the group.
@default 'md'`},status:{required:!1,tsType:{name:`InputStatus`},description:`Status indicator applied to the group border.`},labelTooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text at the end of the label.`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}})))()}function k({ref:e,children:t,xstyle:r,className:o,style:s,...c}){return(0,ce.jsx)(`div`,{ref:e,...c,...i(a(`input-group-text`),n(A.text,r),o,s),children:t})}var ce,A;function j(){return(j=e((()=>{t(),r(),o(),ce=l(),A={text:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kg3NbH:`astryxf314gf`,kWkggS:`astryxwmxj5m`,kMv6JI:`astryx9ynric`,kGuDYH:`astryxjm74w1`,kLWn49:`astryxw6l6zx`,kMwMTN:`astryxv1l7n4`,khDVqt:`astryxuxw1ft`,kmuXW:`astryx2lah0s`,kMzoRj:`astryx1litavf`,ksu8eU:`astryx1y0btm7`,kVAM5u:`astryxvy26l8`,keTefX:`astryxd10s4z astryx1pwwqoy`,krdFHd:`astryx15mokao astryx8eehn2`,kVL7Gh:`astryxbiv7yw astryx1xrp5p4`,kfmiAY:`astryx1ga7v0g astryx11xp8u1`,kT0f0o:`astryx16uus16 astryx747jw7`,$$css:!0}},k.displayName=`InputGroupText`,k.__docgenInfo={description:`A prefix or suffix text element for use inside InputGroup.

@example
\`\`\`
<InputGroup label="URL">
  <InputGroupText>https://</InputGroupText>
  <TextInput label="URL" isLabelHidden value={url} onChange={setUrl} />
</InputGroup>
\`\`\``,methods:[],displayName:`InputGroupText`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:`Content to render in the text slot.
Can be text or an icon.`}},composes:[`Omit`]}})))()}var M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,le;function ue(){return(ue=e((()=>{M=t(),se(),j(),h(),S(),b(),ne(),ae(),_(),y(),f(),N=l(),P=[{id:`1`,label:`Apple`},{id:`2`,label:`Banana`},{id:`3`,label:`Cherry`},{id:`4`,label:`Date`},{id:`5`,label:`Elderberry`},{id:`6`,label:`Fig`},{id:`7`,label:`Grape`}],F={search:e=>P.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>P.slice(0,5)},I={title:`Core/InputGroup`,component:T,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},description:{control:`text`,description:`Description text`},isDisabled:{control:`boolean`,description:`Disable the group`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}}},L=[`Design Systems`,`Infrastructure`,`Product`],R={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`$`}),(0,N.jsx)(g,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`}},z={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(g,{label:`Weight`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0`}),(0,N.jsx)(k,{children:`kg`})]})},args:{label:`Weight`}},B={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`https://`}),(0,N.jsx)(g,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example`}),(0,N.jsx)(k,{children:`.com`})]})},args:{label:`Website`}},V={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:(0,N.jsx)(p,{icon:`search`,size:`sm`,color:`secondary`})}),(0,N.jsx)(g,{label:`Search`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Search...`})]})},args:{label:`Search`,isLabelHidden:!0}},H={render:e=>{let[t,n]=(0,M.useState)(null);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`Fruit`}),(0,N.jsx)(w,{label:`Selection`,isLabelHidden:!0,searchSource:F,value:t,onChange:n,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]})},args:{label:`Favorite fruit`,description:`Select one fruit from the list`}},U={render:e=>{let[t,n]=(0,M.useState)(void 0);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`$`}),(0,N.jsx)(C,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Budget`}},W={render:e=>{let[t,n]=(0,M.useState)(`09:00`);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`Starts`}),(0,N.jsx)(x,{label:`Start time`,isLabelHidden:!0,value:t,onChange:n,hourFormat:`24h`,placeholder:`09:00`})]})},args:{label:`Schedule`,description:`Use local time`}},G={render:e=>{let[t,n]=(0,M.useState)(void 0);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`Due`}),(0,N.jsx)(re,{label:`Date`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Select date`})]})},args:{label:`Deadline`,description:`Pick the due date`}},K={render:e=>{let[t,n]=(0,M.useState)(void 0);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`Team`}),(0,N.jsx)(v,{label:`Owner`,isLabelHidden:!0,options:L,value:t,onChange:n,placeholder:`Choose owner`})]})},args:{label:`Default owner`}},q={render:e=>{let[t,n]=(0,M.useState)([]);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`Teams`}),(0,N.jsx)(ie,{label:`Owners`,isLabelHidden:!0,options:L,value:t,onChange:n,placeholder:`Choose owners`})]})},args:{label:`Default owners`,description:`Select one or more teams`}},J={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`@`}),(0,N.jsx)(g,{label:`Username`,isLabelHidden:!0,value:t,onChange:n,placeholder:`username`})]})},args:{label:`Username`,description:`Your public display name`}},Y={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`$`}),(0,N.jsx)(g,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,status:{type:`error`,message:`Price is required`}}},X={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`$`}),(0,N.jsx)(g,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,size:`sm`}},Z={render:e=>{let[t,n]=(0,M.useState)(``);return(0,N.jsx)(`div`,{style:{maxWidth:500},children:(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(k,{children:`https://`}),(0,N.jsx)(g,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example.com`})]})})},args:{label:`Website URL`}},Q={render:e=>{let[t,n]=(0,M.useState)(``),[r,i]=(0,M.useState)(``);return(0,N.jsxs)(T,{...e,children:[(0,N.jsx)(g,{label:`Address`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Address`}),(0,N.jsx)(k,{children:`@`}),(0,N.jsx)(g,{label:`Domain`,isLabelHidden:!0,value:r,onChange:i,placeholder:`Domain`})]})},args:{label:`Email`}},$={render:()=>{let[e,t]=(0,M.useState)(``),[n,r]=(0,M.useState)(``),[i,a]=(0,M.useState)(``),[o,s]=(0,M.useState)(``),[c,l]=(0,M.useState)(null),[u,d]=(0,M.useState)(void 0);return(0,N.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,N.jsxs)(T,{label:`Price`,children:[(0,N.jsx)(k,{children:`$`}),(0,N.jsx)(g,{label:`Amount`,isLabelHidden:!0,value:e,onChange:t,placeholder:`0.00`})]}),(0,N.jsxs)(T,{label:`Website`,children:[(0,N.jsx)(k,{children:`https://`}),(0,N.jsx)(g,{label:`URL`,isLabelHidden:!0,value:n,onChange:r,placeholder:`example`}),(0,N.jsx)(k,{children:`.com`})]}),(0,N.jsxs)(T,{label:`Favorite fruit`,children:[(0,N.jsx)(k,{children:`Fruit`}),(0,N.jsx)(w,{label:`Selection`,isLabelHidden:!0,searchSource:F,value:c,onChange:l,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]}),(0,N.jsxs)(T,{label:`Weight`,children:[(0,N.jsx)(g,{label:`Weight`,isLabelHidden:!0,value:i,onChange:a,placeholder:`0`}),(0,N.jsx)(k,{children:`kg`})]}),(0,N.jsxs)(T,{label:`Price`,status:{type:`error`,message:`Price is required`},children:[(0,N.jsx)(k,{children:`$`}),(0,N.jsx)(g,{label:`Amount`,isLabelHidden:!0,value:o,onChange:s,placeholder:`0.00`})]}),(0,N.jsxs)(T,{label:`Default owner`,children:[(0,N.jsx)(k,{children:`Team`}),(0,N.jsx)(v,{label:`Owner`,isLabelHidden:!0,options:L,value:u,onChange:d,placeholder:`Choose owner`})]})]})}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return <InputGroup {...args}>
        <InputGroupText>Fruit</InputGroupText>
        <Typeahead label="Selection" isLabelHidden searchSource={fruitSource} value={value} onChange={setValue} placeholder="Search fruits..." hasEntriesOnFocus />
      </InputGroup>;
  },
  args: {
    label: 'Favorite fruit',
    description: 'Select one fruit from the list'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('09:00' as ISOTimeString);
    return <InputGroup {...args}>
        <InputGroupText>Starts</InputGroupText>
        <TimeInput label="Start time" isLabelHidden value={value} onChange={setValue} hourFormat="24h" placeholder="09:00" />
      </InputGroup>;
  },
  args: {
    label: 'Schedule',
    description: 'Use local time'
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <InputGroup {...args}>
        <InputGroupText>Due</InputGroupText>
        <DateInput label="Date" isLabelHidden value={value} onChange={setValue} placeholder="Select date" />
      </InputGroup>;
  },
  args: {
    label: 'Deadline',
    description: 'Pick the due date'
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return <InputGroup {...args}>
        <InputGroupText>Team</InputGroupText>
        <Selector label="Owner" isLabelHidden options={TEAM_OPTIONS} value={value} onChange={setValue} placeholder="Choose owner" />
      </InputGroup>;
  },
  args: {
    label: 'Default owner'
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>([]);
    return <InputGroup {...args}>
        <InputGroupText>Teams</InputGroupText>
        <MultiSelector label="Owners" isLabelHidden options={TEAM_OPTIONS} value={value} onChange={setValue} placeholder="Choose owners" />
      </InputGroup>;
  },
  args: {
    label: 'Default owners',
    description: 'Select one or more teams'
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('');
    const [v3, setV3] = useState('');
    const [v4, setV4] = useState('');
    const [v5, setV5] = useState<SearchableItem | null>(null);
    const [v6, setV6] = useState<string | undefined>(undefined);
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
        <InputGroup label="Favorite fruit">
          <InputGroupText>Fruit</InputGroupText>
          <Typeahead label="Selection" isLabelHidden searchSource={fruitSource} value={v5} onChange={setV5} placeholder="Search fruits..." hasEntriesOnFocus />
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
        <InputGroup label="Default owner">
          <InputGroupText>Team</InputGroupText>
          <Selector label="Owner" isLabelHidden options={TEAM_OPTIONS} value={v6} onChange={setV6} placeholder="Choose owner" />
        </InputGroup>
      </div>;
  }
}`,...$.parameters?.docs?.source}}},le=[`WithPrefix`,`WithSuffix`,`WithPrefixAndSuffix`,`WithIconPrefix`,`WithTypeahead`,`WithNumberInput`,`WithTimeInput`,`WithDateInput`,`WithSelector`,`WithMultiSelector`,`WithDescription`,`WithErrorStatus`,`SmallSize`,`FullWidth`,`TwoInputs`,`AllVariations`]})))()}ue();export{$ as AllVariations,Z as FullWidth,X as SmallSize,Q as TwoInputs,G as WithDateInput,J as WithDescription,Y as WithErrorStatus,V as WithIconPrefix,q as WithMultiSelector,U as WithNumberInput,R as WithPrefix,B as WithPrefixAndSuffix,K as WithSelector,z as WithSuffix,W as WithTimeInput,H as WithTypeahead,le as __namedExportsOrder,I as default};