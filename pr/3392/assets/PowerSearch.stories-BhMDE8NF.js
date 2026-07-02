import{ah as l,a1 as e,B as $}from"./iframe-BAsU9Dt9.js";import{P as s}from"./PowerSearch-CSJsT69M.js";import{T as K}from"./Token-CJ8PY0n7.js";import{F as V}from"./MagnifyingGlassIcon-C0bHGiwr.js";import{H as U}from"./HStack-DcM5fpvG.js";import"./preload-helper-Ct5FWWRu.js";import"./Tokenizer-DNdyGZ6J.js";import"./BaseTypeahead-DJARFGPW.js";import"./usePopover-qonIs2hK.js";import"./TypeaheadItem-DjkPb8d8.js";import"./getKey-DyRdrWhf.js";import"./Field-Bd0RC8XH.js";import"./FieldStatus-DPPaimU9.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./InputClearButton-DupPdaqY.js";import"./OverflowList-DUhDhIyJ.js";import"./Avatar-emX6hJz9.js";import"./Selector-D-2w30F8.js";import"./Divider-DKRULhsH.js";import"./utils-_uNaBhDK.js";import"./hooks-0ex-cRYX.js";import"./Item-DMS7wat6.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./TreeList-BX7P6MGL.js";import"./TextInput-CrAjnNz1.js";import"./groupStyles-BV6S2ney.js";import"./useInputContainer-BSVyswTT.js";import"./NumberInput-VF-yxkyj.js";import"./DateInput-DocTme4w.js";import"./Calendar-CgW5CX8o.js";import"./plainDate-C-ANv9VG.js";import"./dateParser-XTIqkafj.js";import"./TimeInput-BgvlAdwx.js";import"./timeParser-CAi7zy_b.js";import"./Typeahead-D4OpaC0W.js";import"./VStack-DJ3kH3RZ.js";import"./Stack-CKRWU4oS.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./useInteractiveRole-CiLoEOvF.js";const p=[{value:"open",label:"Open"},{value:"in_progress",label:"In Progress"},{value:"review",label:"In Review"},{value:"closed",label:"Closed"},{value:"blocked",label:"Blocked"}],R=[{value:"p0",label:"P0 - Critical"},{value:"p1",label:"P1 - High"},{value:"p2",label:"P2 - Medium"},{value:"p3",label:"P3 - Low"}],M=[{value:"bug",label:"Bug"},{value:"feature",label:"Feature"},{value:"docs",label:"Documentation"},{value:"perf",label:"Performance"},{value:"security",label:"Security"},{value:"ux",label:"UX"},{value:"infra",label:"Infrastructure"}],B=[{id:"user-1",label:"Alice Johnson",auxiliaryData:{photo:"https://i.pravatar.cc/150?u=alice"}},{id:"user-2",label:"Bob Smith",auxiliaryData:{photo:"https://i.pravatar.cc/150?u=bob"}},{id:"user-3",label:"Charlie Brown",auxiliaryData:{photo:"https://i.pravatar.cc/150?u=charlie"}},{id:"user-4",label:"Diana Prince",auxiliaryData:{photo:"https://i.pravatar.cc/150?u=diana"}},{id:"user-5",label:"Eve Williams",auxiliaryData:{photo:"https://i.pravatar.cc/150?u=eve"}},{id:"user-6",label:"Frank Miller",auxiliaryData:{photo:"https://i.pravatar.cc/150?u=frank"}}],N={search:r=>B.filter(t=>t.label.toLowerCase().includes(r.toLowerCase())),bootstrap:()=>B},i={name:"BasicSearch",fields:[{key:"status",label:"Status",defaultOperator:"is",operators:[{key:"is",label:"is",value:{type:"enum",values:p}},{key:"is_not",label:"is not",value:{type:"enum",values:p}}]},{key:"title",label:"Title",defaultOperator:"contains",operators:[{key:"contains",label:"contains",value:{type:"string"}},{key:"not_contains",label:"does not contain",value:{type:"string"}}]},{key:"priority",label:"Priority",defaultOperator:"is",operators:[{key:"is",label:"is",value:{type:"enum",values:R}}]}]},c={name:"FullSearch",fields:[{key:"status",label:"Status",defaultOperator:"any_of",operators:[{key:"any_of",label:"is any of",value:{type:"enum_list",values:p}},{key:"none_of",label:"is none of",value:{type:"enum_list",values:p}}]},{key:"title",label:"Title",defaultOperator:"contains",operators:[{key:"contains",label:"contains",value:{type:"string"}},{key:"not_contains",label:"does not contain",value:{type:"string"}}]},{key:"priority",label:"Priority",defaultOperator:"is",operators:[{key:"is",label:"is",value:{type:"enum",values:R}}]},{key:"assignee",label:"Assignee",defaultOperator:"any_of",typeaheadAliases:["owner","assigned"],operators:[{key:"any_of",label:"is any of",value:{type:"entity_list",searchSource:N}},{key:"none_of",label:"is none of",value:{type:"entity_list",searchSource:N}}]},{key:"tags",label:"Tags",defaultOperator:"include",operators:[{key:"include",label:"include",value:{type:"enum_list",values:M}},{key:"exclude",label:"exclude",value:{type:"enum_list",values:M}}]},{key:"line_count",label:"Line count",defaultOperator:"gt",operators:[{key:"gt",label:"is greater than",value:{type:"integer",minValue:0,maxValue:1e4,units:"lines"}},{key:"lt",label:"is less than",value:{type:"integer",minValue:0,maxValue:1e4,units:"lines"}}]},{key:"cost",label:"Cost",defaultOperator:"gt",operators:[{key:"gt",label:">",value:{type:"float",minValue:0,maxValue:1e5,units:"USD"}},{key:"lt",label:"<",value:{type:"float",minValue:0,maxValue:1e5,units:"USD"}}]},{key:"created",label:"Created",defaultOperator:"after",operators:[{key:"after",label:"is after",value:{type:"date_absolute",isDateOnly:!0}},{key:"newer_than",label:"is newer than",value:{type:"date_relative",isPastAllowed:!0,isFutureAllowed:!1}}]},{key:"ids",label:"ID",defaultOperator:"in",operators:[{key:"in",label:"is any of",value:{type:"string_list"}}]},{key:"unread",label:"Unread only",defaultOperator:"yes",operators:[{key:"yes",label:"",value:{type:"empty"}}]}]},Me={title:"Core/PowerSearch",component:s,tags:["autodocs"],decorators:[r=>e.jsx("div",{style:{width:600},children:e.jsx(r,{})})],argTypes:{placeholder:{control:"text"},isDisabled:{control:"boolean"},isReadOnly:{control:"boolean"},hasClear:{control:"boolean"},maxTokenLength:{control:"number"},popoverSaveButtonLabel:{control:"text"},size:{control:"radio",options:["sm","md","lg"],description:"Search input size"}}},h={render:r=>{const[t,a]=l.useState([]);return e.jsx(s,{...r,config:i,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Search by status, title, priority..."}},m={render:r=>{const[t,a]=l.useState([{field:"status",operator:"is",value:{type:"enum",value:"open"}},{field:"priority",operator:"is",value:{type:"enum",value:"p1"}}]);return e.jsx(s,{...r,config:i,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Add more filters..."},name:"Pre-set Filters"},y={render:r=>{const[t,a]=l.useState([]);return e.jsxs("div",{children:[e.jsx(s,{...r,config:c,filters:t,onChange:(n,d,u)=>{a([...n])}}),t.length>0&&e.jsx("pre",{style:{marginTop:16,padding:12,backgroundColor:"#f5f5f5",borderRadius:8,fontSize:12,overflow:"auto"},children:JSON.stringify(t,null,2)})]})},args:{placeholder:"Search..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Full Featured (All Field Types)"},v={render:r=>{const[t,a]=l.useState([{field:"status",operator:"any_of",value:{type:"enum_list",value:["open","in_progress"]}},{field:"tags",operator:"include",value:{type:"enum_list",value:["bug","security"]}}]);return e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Add more filters..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Multi-value Filters"},S={render:r=>{const[t,a]=l.useState([{field:"assignee",operator:"any_of",value:{type:"entity_list",value:[{id:"user-1",label:"Alice Johnson"},{id:"user-3",label:"Charlie Brown"}]}}]);return e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Add more filters..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Entity Filters"},F={render:r=>{const[t,a]=l.useState([{field:"line_count",operator:"gt",value:{type:"integer",value:100}},{field:"cost",operator:"lt",value:{type:"float",value:500.5}}]);return e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Add more filters..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Numeric Filters"},b={render:r=>{const[t,a]=l.useState([{field:"created",operator:"after",value:{type:"date_absolute",unixSeconds:Math.floor(new Date("2025-01-15").getTime()/1e3)}}]);return e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Add more filters..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Date Filters"},w={render:r=>{const[t,a]=l.useState([{field:"unread",operator:"yes",value:{type:"empty"}}]);return e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Add more filters..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Boolean / Empty Filters"},C={render:r=>{const t=[{field:"status",operator:"is",value:{type:"enum",value:"open"}},{field:"priority",operator:"is",value:{type:"enum",value:"p0"}}];return e.jsx(s,{...r,config:i,filters:t,onChange:()=>{},isReadOnly:!0})},args:{placeholder:"Search..."},name:"Read Only"},x={render:r=>{const t=[{field:"status",operator:"is",value:{type:"enum",value:"open"}}];return e.jsx(s,{...r,config:i,filters:t,onChange:()=>{},isDisabled:!0})},args:{placeholder:"Search..."}},_={render:r=>{const[t,a]=l.useState([]);return e.jsx(s,{...r,config:i,filters:t,onChange:n=>a([...n]),status:{type:"error",message:"Invalid filter combination"}})},args:{placeholder:"Search..."},name:"With Error Status"},k={render:r=>{const[t,a]=l.useState([{field:"title",operator:"contains",value:{type:"string",value:"test"}}]);return e.jsx(s,{...r,config:i,filters:t,onChange:n=>a([...n]),status:{type:"warning",message:"Broad search may be slow"}})},args:{placeholder:"Search..."},name:"With Warning Status"},j={render:r=>{const[t,a]=l.useState([{field:"status",operator:"any_of",value:{type:"enum_list",value:["open","in_progress"]}},{field:"priority",operator:"is",value:{type:"enum",value:"p1"}},{field:"title",operator:"contains",value:{type:"string",value:"login"}},{field:"assignee",operator:"any_of",value:{type:"entity_list",value:[{id:"user-1",label:"Alice Johnson"}]}},{field:"tags",operator:"include",value:{type:"enum_list",value:["bug"]}},{field:"line_count",operator:"gt",value:{type:"integer",value:50}},{field:"created",operator:"after",value:{type:"date_absolute",unixSeconds:Math.floor(new Date("2025-06-01").getTime()/1e3)}}]);return e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n])})},args:{placeholder:"Add more filters..."},decorators:[r=>e.jsx("div",{style:{width:800},children:e.jsx(r,{})})],name:"Many Filters"},P={render:r=>{const[t,a]=l.useState([]),[n,d]=l.useState([]);return e.jsxs("div",{children:[e.jsx(s,{...r,config:i,filters:t,onChange:(u,o,g)=>{a([...u]),d(f=>[...f,`${o} at index ${g} (${u.length} filters total)`])}}),n.length>0&&e.jsxs("div",{style:{marginTop:16,padding:12,backgroundColor:"#f5f5f5",borderRadius:8,fontSize:12,maxHeight:200,overflow:"auto"},children:[e.jsx("strong",{children:"Change log:"}),e.jsx("ul",{style:{margin:"4px 0",paddingInlineStart:20},children:n.map((u,o)=>e.jsx("li",{children:u},o))})]})]})},args:{placeholder:"Try adding, editing, and removing filters..."},name:"Change Tracking"},G={name:"NestedSearch",fields:[{key:"status",label:"Status",defaultOperator:"is",operators:[{key:"is",label:"is",value:{type:"enum",values:p}},{key:"is_not",label:"is not",value:{type:"enum",values:p}}]},{key:"title",label:"Title",defaultOperator:"contains",operators:[{key:"contains",label:"contains",value:{type:"string"}}]},{key:"priority",label:"Priority",defaultOperator:"is",operators:[{key:"is",label:"is",value:{type:"enum",values:R}}]},{key:"or_group",label:"Any of (OR)",defaultOperator:"match_any",operators:[{key:"match_any",label:"match any",value:{type:"nested"}}]},{key:"and_group",label:"All of (AND)",defaultOperator:"match_all",operators:[{key:"match_all",label:"match all",value:{type:"nested"}}]}]},O={render:r=>{const[t,a]=l.useState([{field:"or_group",operator:"match_any",value:{type:"nested",value:[{field:"status",operator:"is",value:{type:"enum",value:"open"}},{field:"status",operator:"is",value:{type:"enum",value:"in_progress"}}]}},{field:"priority",operator:"is",value:{type:"enum",value:"p0"}},{field:"and_group",operator:"match_all",value:{type:"nested",value:[{field:"title",operator:"contains",value:{type:"string",value:"login"}},{field:"status",operator:"is_not",value:{type:"enum",value:"closed"}}]}}]);return e.jsxs("div",{children:[e.jsx(s,{...r,config:G,filters:t,onChange:n=>a([...n])}),t.length>0&&e.jsx("pre",{style:{marginTop:16,padding:12,backgroundColor:"#f5f5f5",borderRadius:8,fontSize:12,overflow:"auto"},children:JSON.stringify(t,null,2)})]})},args:{placeholder:"Add filters..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Nested Filters"},X={name:"ContentSearch",contentSearchFieldKey:"title",fields:[{key:"title",label:"Title",defaultOperator:"contains",operators:[{key:"contains",label:"contains",value:{type:"string"}},{key:"not_contains",label:"does not contain",value:{type:"string"}}]},{key:"status",label:"Status",defaultOperator:"is",operators:[{key:"is",label:"is",value:{type:"enum",values:p}},{key:"is_not",label:"is not",value:{type:"enum",values:p}}]},{key:"priority",label:"Priority",defaultOperator:"is",operators:[{key:"is",label:"is",value:{type:"enum",values:R}}]}]},T={render:r=>{const[t,a]=l.useState([]);return e.jsxs("div",{children:[e.jsx(s,{...r,config:X,filters:t,onChange:n=>a([...n])}),t.length>0&&e.jsx("pre",{style:{marginTop:16,padding:12,backgroundColor:"#f5f5f5",borderRadius:8,fontSize:12,overflow:"auto"},children:JSON.stringify(t,null,2)})]})},args:{placeholder:"Type to search by title, or pick a field..."},name:"Content Search Field Key"},W={render:()=>{const[r,t]=l.useState([{field:"status",operator:"is",value:{type:"enum",value:"open"}}]),[a,n]=l.useState([{field:"status",operator:"is",value:{type:"enum",value:"open"}}]),[d,u]=l.useState([{field:"status",operator:"is",value:{type:"enum",value:"open"}}]);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsx(s,{label:"Small (28px)",config:i,filters:r,onChange:o=>t([...o]),placeholder:"Small size",size:"sm"}),e.jsx(s,{label:"Medium (32px)",config:i,filters:a,onChange:o=>n([...o]),placeholder:"Medium size (default)",size:"md"}),e.jsx(s,{label:"Large (36px)",config:i,filters:d,onChange:o=>u([...o]),placeholder:"Large size",size:"lg"})]})}},A={render:r=>{const[t,a]=l.useState([]);return e.jsx(s,{...r,config:i,filters:t,onChange:n=>a([...n]),startIcon:V})},args:{label:"Search",isLabelHidden:!0,placeholder:"Search..."},name:"With Start Icon"},L={render:r=>{const[t,a]=l.useState([{field:"status",operator:"is",value:{type:"enum",value:"open"}}]);return e.jsx(s,{...r,config:i,filters:t,onChange:n=>a([...n]),resultCount:1234,startIcon:V})},args:{label:"Search",isLabelHidden:!0,placeholder:"Search..."},name:"With Result Count"},z={render:r=>{const[t,a]=l.useState([]);return e.jsx(s,{...r,config:i,filters:t,onChange:n=>a([...n]),resultCount:42,endContent:e.jsx($,{label:"Save",variant:"primary",size:"sm",style:{height:"20px"}})})},args:{label:"Search",isLabelHidden:!0,placeholder:"Search...",size:"lg"},name:"With End Content and Result Count"},J=[{field:"status",operator:"any_of",value:{type:"enum_list",value:["open","in_progress"]}},{field:"priority",operator:"is",value:{type:"enum",value:"p1"}},{field:"title",operator:"contains",value:{type:"string",value:"login"}},{field:"assignee",operator:"any_of",value:{type:"entity_list",value:[{id:"user-1",label:"Alice Johnson"}]}},{field:"tags",operator:"include",value:{type:"enum_list",value:["bug"]}}],D={render:r=>{const[t,a]=l.useState(J);return e.jsxs("div",{children:[e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n]),tokenOverflowBehavior:"unfocusedInline"}),e.jsx("p",{style:{marginTop:8},children:"This text will shift down when the search bar expands on focus."})]})},args:{placeholder:"Add more filters..."},name:"Overflow Inline"},I={render:r=>{const[t,a]=l.useState(J);return e.jsxs("div",{children:[e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n]),tokenOverflowBehavior:"unfocusedLayer"}),e.jsx("p",{style:{marginTop:8},children:"This text should not shift when the search bar expands on focus."})]})},args:{placeholder:"Add more filters..."},name:"Overflow Layer"};function q({filter:r,field:t,operator:a,maxLength:n,onClick:d,onRemove:u,isDisabled:o}){const g=r.value.type==="enum"?r.value.value:"?",f={open:"#22c55e",in_progress:"#3b82f6",review:"#a855f7",closed:"#6b7280",blocked:"#ef4444"};return e.jsx(K,{label:`${t.label}: ${a.label}`,endContent:e.jsx("span",{style:{fontWeight:600,color:f[g]??"inherit"},children:g}),onClick:d?H=>{H.stopPropagation(),d()}:void 0,onRemove:u,isDisabled:o})}function Q({config:r,filter:t,mode:a,onSave:n,onCancel:d,saveButtonLabel:u,isReadOnly:o}){const g=t.value?.type==="integer"?t.value.value:50;return e.jsxs("div",{style:{padding:16},children:[e.jsx("p",{style:{margin:"0 0 12px",fontSize:13},children:"Custom range editor for integer fields:"}),e.jsxs(U,{gap:2,vAlign:"center",children:[e.jsx("input",{type:"range",min:0,max:1e3,value:g,onChange:f=>{t.operator!=null&&n({field:t.field,operator:t.operator,value:{type:"integer",value:Number(f.target.value)}})},style:{flex:1},disabled:o}),e.jsx("span",{style:{fontSize:12,whiteSpace:"nowrap"},children:g})]}),e.jsx("div",{style:{marginTop:12,display:"flex",gap:8,justifyContent:"flex-end"},children:e.jsx("button",{onClick:d,children:"Cancel"})})]})}const Y={enum:{Token:q},integer:{Editor:Q}},E={render:r=>{const[t,a]=l.useState([{field:"status",operator:"is",value:{type:"enum",value:"open"}},{field:"line_count",operator:"gt",value:{type:"integer",value:200}}]);return e.jsxs("div",{children:[e.jsx(s,{...r,config:c,filters:t,onChange:n=>a([...n]),components:Y}),e.jsxs("p",{style:{marginTop:16,fontSize:13,color:"#666"},children:[e.jsx("strong",{children:"Custom overrides:"})," Status tokens show colored text (custom Token). Integer fields use a range slider editor (custom Editor)."]})]})},args:{placeholder:"Search with custom components..."},decorators:[r=>e.jsx("div",{style:{width:700},children:e.jsx(r,{})})],name:"Custom Components Map"};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Search by status, title, priority...'
  }
}`,...h.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }, {
      field: 'priority',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'p1'
      }
    }]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  name: 'Pre-set Filters'
}`,...m.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <div>
        <PowerSearch {...args} config={fullConfig} filters={filters} onChange={(newFilters, _changeType, _index) => {
        setFilters([...newFilters]);
      }} />
        {filters.length > 0 && <pre style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        fontSize: 12,
        overflow: 'auto'
      }}>
            {JSON.stringify(filters, null, 2)}
          </pre>}
      </div>;
  },
  args: {
    placeholder: 'Search...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Full Featured (All Field Types)'
}`,...y.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'any_of',
      value: {
        type: 'enum_list',
        value: ['open', 'in_progress']
      }
    }, {
      field: 'tags',
      operator: 'include',
      value: {
        type: 'enum_list',
        value: ['bug', 'security']
      }
    }]);
    return <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Multi-value Filters'
}`,...v.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'assignee',
      operator: 'any_of',
      value: {
        type: 'entity_list',
        value: [{
          id: 'user-1',
          label: 'Alice Johnson'
        }, {
          id: 'user-3',
          label: 'Charlie Brown'
        }]
      }
    }]);
    return <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Entity Filters'
}`,...S.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'line_count',
      operator: 'gt',
      value: {
        type: 'integer',
        value: 100
      }
    }, {
      field: 'cost',
      operator: 'lt',
      value: {
        type: 'float',
        value: 500.5
      }
    }]);
    return <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Numeric Filters'
}`,...F.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'created',
      operator: 'after',
      value: {
        type: 'date_absolute',
        unixSeconds: Math.floor(new Date('2025-01-15').getTime() / 1000)
      }
    }]);
    return <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Date Filters'
}`,...b.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'unread',
      operator: 'yes',
      value: {
        type: 'empty'
      }
    }]);
    return <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Boolean / Empty Filters'
}`,...w.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const filters: PowerSearchFilter[] = [{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }, {
      field: 'priority',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'p0'
      }
    }];
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={() => {}} isReadOnly />;
  },
  args: {
    placeholder: 'Search...'
  },
  name: 'Read Only'
}`,...C.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const filters: PowerSearchFilter[] = [{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }];
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={() => {}} isDisabled />;
  },
  args: {
    placeholder: 'Search...'
  }
}`,...x.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} status={{
      type: 'error',
      message: 'Invalid filter combination'
    }} />;
  },
  args: {
    placeholder: 'Search...'
  },
  name: 'With Error Status'
}`,..._.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'title',
      operator: 'contains',
      value: {
        type: 'string',
        value: 'test'
      }
    }]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} status={{
      type: 'warning',
      message: 'Broad search may be slow'
    }} />;
  },
  args: {
    placeholder: 'Search...'
  },
  name: 'With Warning Status'
}`,...k.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'any_of',
      value: {
        type: 'enum_list',
        value: ['open', 'in_progress']
      }
    }, {
      field: 'priority',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'p1'
      }
    }, {
      field: 'title',
      operator: 'contains',
      value: {
        type: 'string',
        value: 'login'
      }
    }, {
      field: 'assignee',
      operator: 'any_of',
      value: {
        type: 'entity_list',
        value: [{
          id: 'user-1',
          label: 'Alice Johnson'
        }]
      }
    }, {
      field: 'tags',
      operator: 'include',
      value: {
        type: 'enum_list',
        value: ['bug']
      }
    }, {
      field: 'line_count',
      operator: 'gt',
      value: {
        type: 'integer',
        value: 50
      }
    }, {
      field: 'created',
      operator: 'after',
      value: {
        type: 'date_absolute',
        unixSeconds: Math.floor(new Date('2025-06-01').getTime() / 1000)
      }
    }]);
    return <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  decorators: [Story => <div style={{
    width: 800
  }}>
        <Story />
      </div>],
  name: 'Many Filters'
}`,...j.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    const [log, setLog] = useState<string[]>([]);
    return <div>
        <PowerSearch {...args} config={basicConfig} filters={filters} onChange={(newFilters, changeType, index) => {
        setFilters([...newFilters]);
        setLog(prev => [...prev, \`\${changeType} at index \${index} (\${newFilters.length} filters total)\`]);
      }} />
        {log.length > 0 && <div style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        fontSize: 12,
        maxHeight: 200,
        overflow: 'auto'
      }}>
            <strong>Change log:</strong>
            <ul style={{
          margin: '4px 0',
          paddingInlineStart: 20
        }}>
              {log.map((entry, i) => <li key={i}>{entry}</li>)}
            </ul>
          </div>}
      </div>;
  },
  args: {
    placeholder: 'Try adding, editing, and removing filters...'
  },
  name: 'Change Tracking'
}`,...P.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'or_group',
      operator: 'match_any',
      value: {
        type: 'nested',
        value: [{
          field: 'status',
          operator: 'is',
          value: {
            type: 'enum',
            value: 'open'
          }
        }, {
          field: 'status',
          operator: 'is',
          value: {
            type: 'enum',
            value: 'in_progress'
          }
        }]
      }
    }, {
      field: 'priority',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'p0'
      }
    }, {
      field: 'and_group',
      operator: 'match_all',
      value: {
        type: 'nested',
        value: [{
          field: 'title',
          operator: 'contains',
          value: {
            type: 'string',
            value: 'login'
          }
        }, {
          field: 'status',
          operator: 'is_not',
          value: {
            type: 'enum',
            value: 'closed'
          }
        }]
      }
    }]);
    return <div>
        <PowerSearch {...args} config={nestedConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />
        {filters.length > 0 && <pre style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        fontSize: 12,
        overflow: 'auto'
      }}>
            {JSON.stringify(filters, null, 2)}
          </pre>}
      </div>;
  },
  args: {
    placeholder: 'Add filters...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Nested Filters'
}`,...O.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <div>
        <PowerSearch {...args} config={contentSearchConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />
        {filters.length > 0 && <pre style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        fontSize: 12,
        overflow: 'auto'
      }}>
            {JSON.stringify(filters, null, 2)}
          </pre>}
      </div>;
  },
  args: {
    placeholder: 'Type to search by title, or pick a field...'
  },
  name: 'Content Search Field Key'
}`,...T.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [smFilters, setSmFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }]);
    const [mdFilters, setMdFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }]);
    const [lgFilters, setLgFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <PowerSearch label="Small (28px)" config={basicConfig} filters={smFilters} onChange={newFilters => setSmFilters([...newFilters])} placeholder="Small size" size="sm" />
        <PowerSearch label="Medium (32px)" config={basicConfig} filters={mdFilters} onChange={newFilters => setMdFilters([...newFilters])} placeholder="Medium size (default)" size="md" />
        <PowerSearch label="Large (36px)" config={basicConfig} filters={lgFilters} onChange={newFilters => setLgFilters([...newFilters])} placeholder="Large size" size="lg" />
      </div>;
  }
}`,...W.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} startIcon={MagnifyingGlassIcon} />;
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...'
  },
  name: 'With Start Icon'
}`,...A.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} resultCount={1234} startIcon={MagnifyingGlassIcon} />;
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...'
  },
  name: 'With Result Count'
}`,...L.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} resultCount={42} endContent={<Button label="Save" variant="primary" size="sm" style={{
      height: '20px'
    }} />} />;
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...',
    size: 'lg'
  },
  name: 'With End Content and Result Count'
}`,...z.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>(overflowFilters);
    return <div>
        <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} tokenOverflowBehavior="unfocusedInline" />
        <p style={{
        marginTop: 8
      }}>
          This text will shift down when the search bar expands on focus.
        </p>
      </div>;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  name: 'Overflow Inline'
}`,...D.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>(overflowFilters);
    return <div>
        <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} tokenOverflowBehavior="unfocusedLayer" />
        <p style={{
        marginTop: 8
      }}>
          This text should not shift when the search bar expands on focus.
        </p>
      </div>;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  name: 'Overflow Layer'
}`,...I.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }, {
      field: 'line_count',
      operator: 'gt',
      value: {
        type: 'integer',
        value: 200
      }
    }]);
    return <div>
        <PowerSearch {...args} config={fullConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} components={customComponents} />
        <p style={{
        marginTop: 16,
        fontSize: 13,
        color: '#666'
      }}>
          <strong>Custom overrides:</strong> Status tokens show colored text
          (custom Token). Integer fields use a range slider editor (custom
          Editor).
        </p>
      </div>;
  },
  args: {
    placeholder: 'Search with custom components...'
  },
  decorators: [Story => <div style={{
    width: 700
  }}>
        <Story />
      </div>],
  name: 'Custom Components Map'
}`,...E.parameters?.docs?.source}}};const Be=["Default","WithPresetFilters","FullFeatured","WithEnumListFilters","WithEntityFilters","WithNumericFilters","WithDateFilters","WithEmptyFilter","ReadOnly","Disabled","WithError","WithWarning","ManyFilters","WithOnChangeTracking","WithNestedFilters","WithContentSearchFieldKey","SizeVariants","WithStartIcon","WithResultCount","WithEndContentPowerSearch","OverflowInline","OverflowLayer","WithCustomComponents"];export{h as Default,x as Disabled,y as FullFeatured,j as ManyFilters,D as OverflowInline,I as OverflowLayer,C as ReadOnly,W as SizeVariants,T as WithContentSearchFieldKey,E as WithCustomComponents,b as WithDateFilters,w as WithEmptyFilter,z as WithEndContentPowerSearch,S as WithEntityFilters,v as WithEnumListFilters,_ as WithError,O as WithNestedFilters,F as WithNumericFilters,P as WithOnChangeTracking,m as WithPresetFilters,L as WithResultCount,A as WithStartIcon,k as WithWarning,Be as __namedExportsOrder,Me as default};
