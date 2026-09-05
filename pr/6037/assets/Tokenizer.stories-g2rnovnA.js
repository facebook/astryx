import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-CJ0yeiFV.js";import{t as a}from"./Button-DBQO7xlr.js";import{n as o,t as s}from"./Tokenizer-b73hVuOM.js";import{K as c,t as l}from"./esm-BNuSW8ar.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;e((()=>{u=t(n()),s(),a(),l(),d=r(),f=[{id:`1`,label:`Alice Johnson`},{id:`2`,label:`Bob Smith`},{id:`3`,label:`Charlie Brown`},{id:`4`,label:`Diana Prince`},{id:`5`,label:`Eve Williams`},{id:`6`,label:`Frank Miller`},{id:`7`,label:`Grace Lee`},{id:`8`,label:`Henry Davis`}],p={search:e=>f.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>f.slice(0,5)},m={search:e=>new Promise(t=>{setTimeout(()=>t(f.filter(t=>t.label.toLowerCase().includes(e.toLowerCase()))),1200)}),bootstrap:()=>new Promise(e=>setTimeout(()=>e(f.slice(0,5)),1200))},h={title:`Core/Tokenizer`,component:o,tags:[`autodocs`],argTypes:{label:{control:`text`},placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip.`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasClear:{control:`boolean`},maxEntries:{control:`number`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}},decorators:[e=>(0,d.jsx)(`div`,{style:{width:400},children:(0,d.jsx)(e,{})})]},g={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,placeholder:`Search people...`}},_={render:e=>{let[t,n]=(0,u.useState)([f[0],f[2]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Pre-selected Items`},v={...g,args:{...g.args,hasClear:!0},name:`With Clear All Button`},y={...g,args:{...g.args,maxEntries:3},name:`Max 3 Entries`},b={...g,args:{...g.args,isRequired:!0}},x={...g,args:{...g.args,description:`Select up to 5 team members for this project`}},S={...g,args:{...g.args,status:{type:`error`,message:`At least one member is required`}}},C={...g,args:{...g.args,status:{type:`warning`,message:`Some members may not have access`}}},w={...g,args:{...g.args,status:{type:`success`,message:`Team is ready!`}}},T={render:e=>{let[t]=(0,u.useState)([f[0],f[1]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:()=>{}})},args:{label:`Team Members`,isDisabled:!0}},E={...g,args:{...g.args,startIcon:c},name:`With Start Icon`},D={render:e=>{let[t,n]=(0,u.useState)([f[0],f[2]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,startIcon:c},name:`With Start Icon and Tokens`},O={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),hasEntriesOnFocus:!0})},args:{label:`Team Members`,placeholder:`Click to see suggestions...`},name:`With Entries On Focus`},k={render:e=>{let[t,n]=(0,u.useState)([f[0],f[1],f[2],f[3],f[4],f[5]]);return(0,d.jsxs)(`div`,{children:[(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),tokenOverflowBehavior:`unfocusedInline`}),(0,d.jsx)(`p`,{style:{marginTop:8},children:`This text will shift down when the tokenizer expands on focus.`})]})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Overflow Inline`},A={render:e=>{let[t,n]=(0,u.useState)([f[0],f[1],f[2],f[3],f[4],f[5]]);return(0,d.jsxs)(`div`,{children:[(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),tokenOverflowBehavior:`unfocusedLayer`}),(0,d.jsx)(`p`,{style:{marginTop:8},children:`This text should not shift when the tokenizer expands on focus.`})]})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Overflow Layer`},j={render:e=>{let[t,n]=(0,u.useState)([f[0],f[2]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e),endContent:(0,d.jsx)(i,{label:`Apply`,variant:`primary`,size:`sm`})})},args:{label:`Team Members`},name:`With End Content`},M={search:()=>[],bootstrap:()=>[]},N={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsxs)(`div`,{children:[(0,d.jsx)(o,{...e,searchSource:M,value:t,onChange:(e,t)=>{n(e)},hasCreate:!0,placeholder:`Type a tag and press Enter...`}),(0,d.jsxs)(`p`,{style:{marginTop:8,fontSize:14,color:`var(--color-text-secondary)`},children:[t.length,` tag`,t.length===1?``:`s`,` added`]})]})},args:{label:`Tags`},name:`Creatable (Free Text)`},P={render:()=>{let[e,t]=(0,u.useState)([]),[n,r]=(0,u.useState)([f[0],f[2]]),[i,a]=(0,u.useState)([]);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,d.jsx)(o,{label:`Small (28px)`,searchSource:p,value:e,onChange:e=>t(e),placeholder:`Small size`,size:`sm`,hasClear:!0}),(0,d.jsx)(o,{label:`Medium (32px)`,searchSource:p,value:n,onChange:e=>r(e),placeholder:`Medium size (default)`,size:`md`,hasClear:!0}),(0,d.jsx)(o,{label:`Large (36px)`,searchSource:p,value:i,onChange:e=>a(e),placeholder:`Large size`,size:`lg`,hasClear:!0})]})}},F={render:e=>{let[t,n]=(0,u.useState)([]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:(e,t)=>{n(e)},hasCreate:!0,hasEntriesOnFocus:!0,placeholder:`Search or type a new name...`})},args:{label:`Team Members`},name:`Creatable + Search`},I={render:e=>{let[t]=(0,u.useState)([f[0],f[1]]);return(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:()=>{}})},args:{label:`Team Members`,isDisabled:!0,disabledMessage:`You need edit access to change members`}},L={render:()=>{let[e,t]=(0,u.useState)([]),[n,r]=(0,u.useState)([]);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:320},children:[(0,d.jsx)(o,{label:`Attached (default)`,searchSource:p,value:e,onChange:e=>t(e),status:{type:`error`,message:`Select at least one member`}}),(0,d.jsx)(o,{label:`Detached`,searchSource:p,value:n,onChange:e=>r(e),status:{type:`error`,message:`Select at least one member`},statusVariant:`detached`})]})}},R={render:e=>{let[t,n]=(0,u.useState)([f[0]]);return(0,d.jsx)(o,{...e,searchSource:m,value:t,onChange:e=>n(e),hasClear:!0,endContent:(0,d.jsxs)(`span`,{children:[t.length,` selected`]})})},args:{label:`Team Members`,placeholder:`Search people...`},name:`Loading (async source, with clear and end content)`},z={render:e=>{let[t,n]=(0,u.useState)([f[0],f[2]]);return(0,d.jsx)(`div`,{style:{width:420},children:(0,d.jsx)(o,{...e,searchSource:p,value:t,onChange:e=>n(e)})})},args:{label:`Team Members`,placeholder:`Add more...`,hasClear:!0},name:`Logical order`},B={render:e=>(0,d.jsx)(o,{...e,searchSource:p,value:[f[0]],onChange:()=>{},hasClear:!0}),args:{label:`Team Members`,placeholder:`Search people...`},name:`RTL end lane (token + clear)`},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Search people...'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Pre-selected Items'
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasClear: true
  },
  name: 'With Clear All Button'
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    maxEntries: 3
  },
  name: 'Max 3 Entries'
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isRequired: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    description: 'Select up to 5 team members for this project'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'error',
      message: 'At least one member is required'
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'warning',
      message: 'Some members may not have access'
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'success',
      message: 'Team is ready!'
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={() => {}} />;
  },
  args: {
    label: 'Team Members',
    isDisabled: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon'
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon and Tokens'
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} hasEntriesOnFocus />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Click to see suggestions...'
  },
  name: 'With Entries On Focus'
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} endContent={<Button label="Apply" variant="primary" size="sm" />} />;
  },
  args: {
    label: 'Team Members'
  },
  name: 'With End Content'
}`,...j.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [tags, setTags] = useState<SearchableItem[]>([]);
    return <div>
        <Tokenizer {...args} searchSource={emptySource} value={tags} onChange={(items, _change) => {
        setTags(items);
      }} hasCreate placeholder="Type a tag and press Enter..." />
        <p style={{
        marginTop: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          {tags.length} tag{tags.length !== 1 ? 's' : ''} added
        </p>
      </div>;
  },
  args: {
    label: 'Tags'
  },
  name: 'Creatable (Free Text)'
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={() => {}} />;
  },
  args: {
    label: 'Team Members',
    isDisabled: true,
    disabledMessage: 'You need edit access to change members'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<SearchableItem[]>([]);
    const [b, setB] = useState<SearchableItem[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 320
    }}>
        <Tokenizer label="Attached (default)" searchSource={userSource} value={a} onChange={items => setA(items)} status={{
        type: 'error',
        message: 'Select at least one member'
      }} />
        <Tokenizer label="Detached" searchSource={userSource} value={b} onChange={items => setB(items)} status={{
        type: 'error',
        message: 'Select at least one member'
      }} statusVariant="detached" />
      </div>;
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0]]);
    return <Tokenizer {...args} searchSource={slowUserSource} value={value} onChange={items => setValue(items)} hasClear endContent={<span>{value.length} selected</span>} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Search people...'
  },
  name: 'Loading (async source, with clear and end content)'
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <div style={{
      width: 420
    }}>
        <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />
      </div>;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...',
    hasClear: true
  },
  name: 'Logical order'
}`,...z.parameters?.docs?.source},description:{story:`Tokens plus a clear-all button — the two ends of the field. Under RTL they
must swap sides; this is the story the RTL audit measures as a D2
layout-order-flip.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => <Tokenizer {...args} searchSource={userSource} value={[users[0]]} onChange={() => {}} hasClear />,
  args: {
    label: 'Team Members',
    placeholder: 'Search people...'
  },
  name: 'RTL end lane (token + clear)'
}`,...B.parameters?.docs?.source},description:{story:`The inline-end lane, populated at rest, for the RTL audit's D4 pass.

Tokenizer's lane is absolutely positioned — it has to be, so it stays on the
field's first row while tokens wrap below it — which makes its side entirely
a matter of the writing mode. The busy Spinner shares that lane, and busy
only exists mid-search, so a selected token with \`hasClear\` is what puts the
lane on screen for a measurement that can be held still.`,...B.parameters?.docs?.description}}},V=[`Default`,`WithPreselected`,`WithClear`,`MaxEntries`,`Required`,`WithDescription`,`WithError`,`WithWarning`,`WithSuccess`,`Disabled`,`WithStartIcon`,`WithStartIconAndTokens`,`WithEntriesOnFocus`,`OverflowInline`,`OverflowLayer`,`WithEndContent`,`Creatable`,`SizeVariants`,`CreatableWithSearch`,`DisabledWithMessage`,`StatusVariantComparison`,`Loading`,`LogicalOrder`,`RtlEndLane`]}))();export{N as Creatable,F as CreatableWithSearch,g as Default,T as Disabled,I as DisabledWithMessage,R as Loading,z as LogicalOrder,y as MaxEntries,k as OverflowInline,A as OverflowLayer,b as Required,B as RtlEndLane,P as SizeVariants,L as StatusVariantComparison,v as WithClear,x as WithDescription,j as WithEndContent,O as WithEntriesOnFocus,S as WithError,_ as WithPreselected,E as WithStartIcon,D as WithStartIconAndTokens,w as WithSuccess,C as WithWarning,V as __namedExportsOrder,h as default};