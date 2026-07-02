import{ah as c,a1 as s,B as j}from"./iframe-j1EZkcGb.js";import{T as l}from"./Tokenizer-Dj1j8Uui.js";import{F as D}from"./MagnifyingGlassIcon-5UUgslOc.js";import"./preload-helper-Ct5FWWRu.js";import"./BaseTypeahead-CQlnsefV.js";import"./usePopover-Db3MCAxh.js";import"./useAnnounce-ByqLgiM2.js";import"./TypeaheadItem-DWF7LU8l.js";import"./getKey-DyRdrWhf.js";import"./Field-MJLQjcWT.js";import"./FieldStatus-BgagH4tV.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./InputClearButton-Ddipwdfa.js";import"./Token-B5ps0r5q.js";import"./useInteractiveRole-Dd_xIN8b.js";import"./OverflowList-DljQlBUk.js";const a=[{id:"1",label:"Alice Johnson"},{id:"2",label:"Bob Smith"},{id:"3",label:"Charlie Brown"},{id:"4",label:"Diana Prince"},{id:"5",label:"Eve Williams"},{id:"6",label:"Frank Miller"},{id:"7",label:"Grace Lee"},{id:"8",label:"Henry Davis"}],u={search:e=>a.filter(r=>r.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>a.slice(0,5)},X={title:"Core/Tokenizer",component:l,tags:["autodocs"],argTypes:{label:{control:"text"},placeholder:{control:"text"},isDisabled:{control:"boolean"},isRequired:{control:"boolean"},isOptional:{control:"boolean"},hasClear:{control:"boolean"},maxEntries:{control:"number"},size:{control:"radio",options:["sm","md","lg"],description:"Input size"}},decorators:[e=>s.jsx("div",{style:{width:400},children:s.jsx(e,{})})]},t={render:e=>{const[r,n]=c.useState([]);return s.jsx(l,{...e,searchSource:u,value:r,onChange:o=>n(o)})},args:{label:"Team Members",placeholder:"Search people..."}},m={render:e=>{const[r,n]=c.useState([a[0],a[2]]);return s.jsx(l,{...e,searchSource:u,value:r,onChange:o=>n(o)})},args:{label:"Team Members",placeholder:"Add more..."},name:"Pre-selected Items"},d={...t,args:{...t.args,hasClear:!0},name:"With Clear All Button"},h={...t,args:{...t.args,maxEntries:3},name:"Max 3 Entries"},p={...t,args:{...t.args,isRequired:!0}},g={...t,args:{...t.args,description:"Select up to 5 team members for this project"}},S={...t,args:{...t.args,status:{type:"error",message:"At least one member is required"}}},b={...t,args:{...t.args,status:{type:"warning",message:"Some members may not have access"}}},v={...t,args:{...t.args,status:{type:"success",message:"Team is ready!"}}},C={render:e=>{const[r]=c.useState([a[0],a[1]]);return s.jsx(l,{...e,searchSource:u,value:r,onChange:()=>{}})},args:{label:"Team Members",isDisabled:!0}},f={...t,args:{...t.args,startIcon:D},name:"With Start Icon"},T={render:e=>{const[r,n]=c.useState([a[0],a[2]]);return s.jsx(l,{...e,searchSource:u,value:r,onChange:o=>n(o)})},args:{label:"Team Members",startIcon:D},name:"With Start Icon and Tokens"},x={render:e=>{const[r,n]=c.useState([]);return s.jsx(l,{...e,searchSource:u,value:r,onChange:o=>n(o),hasEntriesOnFocus:!0})},args:{label:"Team Members",placeholder:"Click to see suggestions..."},name:"With Entries On Focus"},y={render:e=>{const[r,n]=c.useState([a[0],a[1],a[2],a[3],a[4],a[5]]);return s.jsxs("div",{children:[s.jsx(l,{...e,searchSource:u,value:r,onChange:o=>n(o),tokenOverflowBehavior:"unfocusedInline"}),s.jsx("p",{style:{marginTop:8},children:"This text will shift down when the tokenizer expands on focus."})]})},args:{label:"Team Members",placeholder:"Add more..."},name:"Overflow Inline"},z={render:e=>{const[r,n]=c.useState([a[0],a[1],a[2],a[3],a[4],a[5]]);return s.jsxs("div",{children:[s.jsx(l,{...e,searchSource:u,value:r,onChange:o=>n(o),tokenOverflowBehavior:"unfocusedLayer"}),s.jsx("p",{style:{marginTop:8},children:"This text should not shift when the tokenizer expands on focus."})]})},args:{label:"Team Members",placeholder:"Add more..."},name:"Overflow Layer"},W={render:e=>{const[r,n]=c.useState([a[0],a[2]]);return s.jsx(l,{...e,searchSource:u,value:r,onChange:o=>n(o),endContent:s.jsx(j,{label:"Apply",variant:"primary",size:"sm"})})},args:{label:"Team Members"},name:"With End Content"},V={search:()=>[],bootstrap:()=>[]},I={render:e=>{const[r,n]=c.useState([]);return s.jsxs("div",{children:[s.jsx(l,{...e,searchSource:V,value:r,onChange:(o,w)=>{n(o)},hasCreate:!0,placeholder:"Type a tag and press Enter..."}),s.jsxs("p",{style:{marginTop:8,fontSize:14,color:"#666"},children:[r.length," tag",r.length!==1?"s":""," added"]})]})},args:{label:"Tags"},name:"Creatable (Free Text)"},M={render:()=>{const[e,r]=c.useState([]),[n,o]=c.useState([a[0],a[2]]),[w,E]=c.useState([]);return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[s.jsx(l,{label:"Small (28px)",searchSource:u,value:e,onChange:i=>r(i),placeholder:"Small size",size:"sm",hasClear:!0}),s.jsx(l,{label:"Medium (32px)",searchSource:u,value:n,onChange:i=>o(i),placeholder:"Medium size (default)",size:"md",hasClear:!0}),s.jsx(l,{label:"Large (36px)",searchSource:u,value:w,onChange:i=>E(i),placeholder:"Large size",size:"lg",hasClear:!0})]})}},k={render:e=>{const[r,n]=c.useState([]);return s.jsx(l,{...e,searchSource:u,value:r,onChange:(o,w)=>{n(o)},hasCreate:!0,hasEntriesOnFocus:!0,placeholder:"Search or type a new name..."})},args:{label:"Team Members"},name:"Creatable + Search"};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Search people...'
  }
}`,...t.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Pre-selected Items'
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasClear: true
  },
  name: 'With Clear All Button'
}`,...d.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    maxEntries: 3
  },
  name: 'Max 3 Entries'
}`,...h.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isRequired: true
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    description: 'Select up to 5 team members for this project'
  }
}`,...g.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'error',
      message: 'At least one member is required'
    }
  }
}`,...S.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'warning',
      message: 'Some members may not have access'
    }
  }
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'success',
      message: 'Team is ready!'
    }
  }
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={() => {}} />;
  },
  args: {
    label: 'Team Members',
    isDisabled: true
  }
}`,...C.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon'
}`,...f.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon and Tokens'
}`,...T.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} hasEntriesOnFocus />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Click to see suggestions...'
  },
  name: 'With Entries On Focus'
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} endContent={<Button label="Apply" variant="primary" size="sm" />} />;
  },
  args: {
    label: 'Team Members'
  },
  name: 'With End Content'
}`,...W.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};const Y=["Default","WithPreselected","WithClear","MaxEntries","Required","WithDescription","WithError","WithWarning","WithSuccess","Disabled","WithStartIcon","WithStartIconAndTokens","WithEntriesOnFocus","OverflowInline","OverflowLayer","WithEndContent","Creatable","SizeVariants","CreatableWithSearch"];export{I as Creatable,k as CreatableWithSearch,t as Default,C as Disabled,h as MaxEntries,y as OverflowInline,z as OverflowLayer,p as Required,M as SizeVariants,d as WithClear,g as WithDescription,W as WithEndContent,x as WithEntriesOnFocus,S as WithError,m as WithPreselected,f as WithStartIcon,T as WithStartIconAndTokens,v as WithSuccess,b as WithWarning,Y as __namedExportsOrder,X as default};
