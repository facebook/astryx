import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BBk5Kqd0.js";import{t as a}from"./Button-CRpvXAU4.js";import{n as o,t as s}from"./Tokenizer-ChtJvo3G.js";import{W as c,t as l}from"./esm-DA7gAIBC.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;e((()=>{u=t(n()),s(),a(),l(),d=r(),f=[{id:`1`,label:`Alice Johnson`},{id:`2`,label:`Bob Smith`},{id:`3`,label:`Charlie Brown`},{id:`4`,label:`Diana Prince`},{id:`5`,label:`Eve Williams`},{id:`6`,label:`Frank Miller`},{id:`7`,label:`Grace Lee`},{id:`8`,label:`Henry Davis`}],p={search:e=>f.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>f.slice(0,5)},m={title:`Core/Tokenizer`,component:o,tags:[`autodocs`],argTypes:{label:{control:`text`},placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip.`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasClear:{control:`boolean`},maxEntries:{control:`number`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}},decorators:[e=>(0,d.jsx)(`div`,{style:{width:400},children:(0,d.jsx)(e,{})})]},h={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,placeholder:`Search people...`}},g={render:e=>{let[t,n]=(0,u.useState)([f[0],f[2]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Pre-selected Items`},_={...h,args:{...h.args,hasClear:!0},name:`With Clear All Button`},v={...h,args:{...h.args,maxEntries:3},name:`Max 3 Entries`},y={...h,args:{...h.args,isRequired:!0}},b={...h,args:{...h.args,description:`Select up to 5 team members for this project`}},x={...h,args:{...h.args,status:{type:`error`,message:`At least one member is required`}}},S={...h,args:{...h.args,status:{type:`warning`,message:`Some members may not have access`}}},C={...h,args:{...h.args,status:{type:`success`,message:`Team is ready!`}}},w={render:e=>{let[t]=(0,u.useState)([f[0],f[1]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:()=>{}})},args:{label:`Team Members`,isDisabled:!0}},T={...h,args:{...h.args,startIcon:c},name:`With Start Icon`},E={render:e=>{let[t,n]=(0,u.useState)([f[0],f[2]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,startIcon:c},name:`With Start Icon and Tokens`},D={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),hasEntriesOnFocus:!0})},args:{label:`Team Members`,placeholder:`Click to see suggestions...`},name:`With Entries On Focus`},O={render:e=>{let[t,n]=(0,u.useState)([f[0],f[1],f[2],f[3],f[4],f[5]]);return(0,d.jsxs)(`div`,{children:[(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),tokenOverflowBehavior:`unfocusedInline`}),(0,d.jsx)(`p`,{style:{marginTop:8},children:`This text will shift down when the tokenizer expands on focus.`})]})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Overflow Inline`},k={render:e=>{let[t,n]=(0,u.useState)([f[0],f[1],f[2],f[3],f[4],f[5]]);return(0,d.jsxs)(`div`,{children:[(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),tokenOverflowBehavior:`unfocusedLayer`}),(0,d.jsx)(`p`,{style:{marginTop:8},children:`This text should not shift when the tokenizer expands on focus.`})]})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Overflow Layer`},A={render:e=>{let[t,n]=(0,u.useState)([f[0],f[2]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),endContent:(0,d.jsx)(i,{label:`Apply`,variant:`primary`,size:`sm`})})},args:{label:`Team Members`},name:`With End Content`},j={search:()=>[],bootstrap:()=>[]},M={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsxs)(`div`,{children:[(0,d.jsx)(o,{...e,searchSource:j,value:t,onChange:(e,t)=>{n(e)},hasCreate:!0,placeholder:`Type a tag and press Enter...`}),(0,d.jsxs)(`p`,{style:{marginTop:8,fontSize:14,color:`#666`},children:[t.length,` tag`,t.length===1?``:`s`,` added`]})]})},args:{label:`Tags`},name:`Creatable (Free Text)`},N={render:()=>{let[e,t]=(0,u.useState)([]),[n,r]=(0,u.useState)([f[0],f[2]]),[i,a]=(0,u.useState)([]);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,d.jsx)(o,{label:`Small (28px)`,searchSource:p,value:e,onChange:e=>t(e),placeholder:`Small size`,size:`sm`,hasClear:!0}),(0,d.jsx)(o,{label:`Medium (32px)`,searchSource:p,value:n,onChange:e=>r(e),placeholder:`Medium size (default)`,size:`md`,hasClear:!0}),(0,d.jsx)(o,{label:`Large (36px)`,searchSource:p,value:i,onChange:e=>a(e),placeholder:`Large size`,size:`lg`,hasClear:!0})]})}},P={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:(e,t)=>{n(e)},hasCreate:!0,hasEntriesOnFocus:!0,placeholder:`Search or type a new name...`})},args:{label:`Team Members`},name:`Creatable + Search`},F={render:e=>{let[t]=(0,u.useState)([f[0],f[1]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:()=>{}})},args:{label:`Team Members`,isDisabled:!0,disabledMessage:`You need edit access to change members`}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Search people...'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Pre-selected Items'
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasClear: true
  },
  name: 'With Clear All Button'
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    maxEntries: 3
  },
  name: 'Max 3 Entries'
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isRequired: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    description: 'Select up to 5 team members for this project'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'error',
      message: 'At least one member is required'
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'warning',
      message: 'Some members may not have access'
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'success',
      message: 'Team is ready!'
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={() => {}} />;
  },
  args: {
    label: 'Team Members',
    isDisabled: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon'
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon and Tokens'
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} hasEntriesOnFocus />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Click to see suggestions...'
  },
  name: 'With Entries On Focus'
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[1], users[2], users[3], users[4], users[5]]);
    return <div>
        <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} tokenOverflowBehavior="unfocusedInline" />
        <p style={{
        marginTop: 8
      }}>
          This text will shift down when the tokenizer expands on focus.
        </p>
      </div>;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Overflow Inline'
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[1], users[2], users[3], users[4], users[5]]);
    return <div>
        <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} tokenOverflowBehavior="unfocusedLayer" />
        <p style={{
        marginTop: 8
      }}>
          This text should not shift when the tokenizer expands on focus.
        </p>
      </div>;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Overflow Layer'
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} endContent={<Button label="Apply" variant="primary" size="sm" />} />;
  },
  args: {
    label: 'Team Members'
  },
  name: 'With End Content'
}`,...A.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [tags, setTags] = useState<SearchableItem[]>([]);
    return <div>
        <Tokenizer {...args} searchSource={emptySource} value={tags} onChange={(items, _change) => {
        setTags(items);
      }} hasCreate placeholder="Type a tag and press Enter..." />
        <p style={{
        marginTop: 8,
        fontSize: 14,
        color: '#666'
      }}>
          {tags.length} tag{tags.length !== 1 ? 's' : ''} added
        </p>
      </div>;
  },
  args: {
    label: 'Tags'
  },
  name: 'Creatable (Free Text)'
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState<SearchableItem[]>([]);
    const [md, setMd] = useState<SearchableItem[]>([users[0], users[2]]);
    const [lg, setLg] = useState<SearchableItem[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <Tokenizer label="Small (28px)" searchSource={userSource} value={sm} onChange={items => setSm(items)} placeholder="Small size" size="sm" hasClear />
        <Tokenizer label="Medium (32px)" searchSource={userSource} value={md} onChange={items => setMd(items)} placeholder="Medium size (default)" size="md" hasClear />
        <Tokenizer label="Large (36px)" searchSource={userSource} value={lg} onChange={items => setLg(items)} placeholder="Large size" size="lg" hasClear />
      </div>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={(items, _change) => {
      setValue(items);
    }} hasCreate hasEntriesOnFocus placeholder="Search or type a new name..." />;
  },
  args: {
    label: 'Team Members'
  },
  name: 'Creatable + Search'
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={() => {}} />;
  },
  args: {
    label: 'Team Members',
    isDisabled: true,
    disabledMessage: 'You need edit access to change members'
  }
}`,...F.parameters?.docs?.source}}},I=[`Default`,`WithPreselected`,`WithClear`,`MaxEntries`,`Required`,`WithDescription`,`WithError`,`WithWarning`,`WithSuccess`,`Disabled`,`WithStartIcon`,`WithStartIconAndTokens`,`WithEntriesOnFocus`,`OverflowInline`,`OverflowLayer`,`WithEndContent`,`Creatable`,`SizeVariants`,`CreatableWithSearch`,`DisabledWithMessage`]}))();export{M as Creatable,P as CreatableWithSearch,h as Default,w as Disabled,F as DisabledWithMessage,v as MaxEntries,O as OverflowInline,k as OverflowLayer,y as Required,N as SizeVariants,_ as WithClear,b as WithDescription,A as WithEndContent,D as WithEntriesOnFocus,x as WithError,g as WithPreselected,T as WithStartIcon,E as WithStartIconAndTokens,C as WithSuccess,S as WithWarning,I as __namedExportsOrder,m as default};