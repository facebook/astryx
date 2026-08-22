import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-C0ieOok5.js";import{t as a}from"./Button-DvNCRfsw.js";import{o,t as s}from"./Stack-lUuMxHZ4.js";import{n as c,t as ee}from"./Token-iYaTiGKd.js";import{$ as l,X as te}from"./iframe-CZeap-LS.js";import{W as u,t as d}from"./esm-CL1f8dHF.js";function f({filter:e,field:t,operator:n,maxLength:r,onClick:i,onRemove:a,isDisabled:o}){let s=e.value.type===`enum`?e.value.value:`?`;return(0,m.jsx)(c,{label:`${t.label}: ${n.label}`,endContent:(0,m.jsx)(`span`,{style:{fontWeight:600,color:{open:`#22c55e`,in_progress:`#3b82f6`,review:`#a855f7`,closed:`#6b7280`,blocked:`#ef4444`}[s]??`inherit`},children:s}),onClick:i?e=>{e.stopPropagation(),i()}:void 0,onRemove:a,isDisabled:o})}function ne({config:e,filter:t,mode:n,onSave:r,onCancel:i,saveButtonLabel:a,isReadOnly:s}){let c=t.value?.type===`integer`?t.value.value:50;return(0,m.jsxs)(`div`,{style:{padding:16},children:[(0,m.jsx)(`p`,{style:{margin:`0 0 12px`,fontSize:13},children:`Custom range editor for integer fields:`}),(0,m.jsxs)(o,{gap:2,vAlign:`center`,children:[(0,m.jsx)(`input`,{type:`range`,min:0,max:1e3,value:c,onChange:e=>{t.operator!=null&&r({field:t.field,operator:t.operator,value:{type:`integer`,value:Number(e.target.value)}})},style:{flex:1},disabled:s}),(0,m.jsx)(`span`,{style:{fontSize:12,whiteSpace:`nowrap`},children:c})]}),(0,m.jsx)(`div`,{style:{marginTop:12,display:`flex`,gap:8,justifyContent:`flex-end`},children:(0,m.jsx)(`button`,{onClick:i,children:`Cancel`})})]})}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;e((()=>{p=t(n()),te(),a(),d(),m=r(),ee(),s(),h=[{value:`open`,label:`Open`},{value:`in_progress`,label:`In Progress`},{value:`review`,label:`In Review`},{value:`closed`,label:`Closed`},{value:`blocked`,label:`Blocked`}],g=[{value:`p0`,label:`P0 - Critical`},{value:`p1`,label:`P1 - High`},{value:`p2`,label:`P2 - Medium`},{value:`p3`,label:`P3 - Low`}],_=[{value:`bug`,label:`Bug`},{value:`feature`,label:`Feature`},{value:`docs`,label:`Documentation`},{value:`perf`,label:`Performance`},{value:`security`,label:`Security`},{value:`ux`,label:`UX`},{value:`infra`,label:`Infrastructure`}],v=[{id:`user-1`,label:`Alice Johnson`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=alice`}},{id:`user-2`,label:`Bob Smith`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=bob`}},{id:`user-3`,label:`Charlie Brown`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=charlie`}},{id:`user-4`,label:`Diana Prince`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=diana`}},{id:`user-5`,label:`Eve Williams`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=eve`}},{id:`user-6`,label:`Frank Miller`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=frank`}}],y={search:e=>v.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>v},b={name:`BasicSearch`,fields:[{key:`status`,label:`Status`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:h}},{key:`is_not`,label:`is not`,value:{type:`enum`,values:h}}]},{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}},{key:`not_contains`,label:`does not contain`,value:{type:`string`}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:g}}]}]},x={name:`FullSearch`,fields:[{key:`status`,label:`Status`,defaultOperator:`any_of`,operators:[{key:`any_of`,label:`is any of`,value:{type:`enum_list`,values:h}},{key:`none_of`,label:`is none of`,value:{type:`enum_list`,values:h}}]},{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}},{key:`not_contains`,label:`does not contain`,value:{type:`string`}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:g}}]},{key:`assignee`,label:`Assignee`,defaultOperator:`any_of`,typeaheadAliases:[`owner`,`assigned`],operators:[{key:`any_of`,label:`is any of`,value:{type:`entity_list`,searchSource:y}},{key:`none_of`,label:`is none of`,value:{type:`entity_list`,searchSource:y}}]},{key:`tags`,label:`Tags`,defaultOperator:`include`,operators:[{key:`include`,label:`include`,value:{type:`enum_list`,values:_}},{key:`exclude`,label:`exclude`,value:{type:`enum_list`,values:_}}]},{key:`line_count`,label:`Line count`,defaultOperator:`gt`,operators:[{key:`gt`,label:`is greater than`,value:{type:`integer`,minValue:0,maxValue:1e4,units:`lines`}},{key:`lt`,label:`is less than`,value:{type:`integer`,minValue:0,maxValue:1e4,units:`lines`}}]},{key:`cost`,label:`Cost`,defaultOperator:`gt`,operators:[{key:`gt`,label:`>`,value:{type:`float`,minValue:0,maxValue:1e5,units:`USD`}},{key:`lt`,label:`<`,value:{type:`float`,minValue:0,maxValue:1e5,units:`USD`}}]},{key:`created`,label:`Created`,defaultOperator:`after`,operators:[{key:`after`,label:`is after`,value:{type:`date_absolute`,isDateOnly:!0}},{key:`newer_than`,label:`is newer than`,value:{type:`date_relative`,isPastAllowed:!0,isFutureAllowed:!1}}]},{key:`ids`,label:`ID`,defaultOperator:`in`,operators:[{key:`in`,label:`is any of`,value:{type:`string_list`}}]},{key:`unread`,label:`Unread only`,defaultOperator:`yes`,operators:[{key:`yes`,label:``,value:{type:`empty`}}]}]},S={title:`Core/PowerSearch`,component:l,tags:[`autodocs`],decorators:[e=>(0,m.jsx)(`div`,{style:{width:600},children:(0,m.jsx)(e,{})})],argTypes:{placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the search is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled PowerSearch in Tooltip.`},isReadOnly:{control:`boolean`},hasClear:{control:`boolean`},maxTokenLength:{control:`number`},menuWidth:{control:`text`,description:`Field-search menu width (number for px or CSS string)`},popoverSaveButtonLabel:{control:`text`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Search input size`}}},C={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Search by status, title, priority...`}},w={render:e=>{let[t,n]=(0,p.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p1`}}]);return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},name:`Pre-set Filters`},T={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(l,{...e,config:x,filters:t,onChange:(e,t,r)=>{n([...e])}}),t.length>0&&(0,m.jsx)(`pre`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,overflow:`auto`},children:JSON.stringify(t,null,2)})]})},args:{placeholder:`Search...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Full Featured (All Field Types)`},E={render:e=>{let[t,n]=(0,p.useState)([{field:`status`,operator:`any_of`,value:{type:`enum_list`,value:[`open`,`in_progress`]}},{field:`tags`,operator:`include`,value:{type:`enum_list`,value:[`bug`,`security`]}}]);return(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Multi-value Filters`},D={render:e=>{let[t,n]=(0,p.useState)([{field:`assignee`,operator:`any_of`,value:{type:`entity_list`,value:[{id:`user-1`,label:`Alice Johnson`},{id:`user-3`,label:`Charlie Brown`}]}}]);return(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Entity Filters`},O={render:e=>{let[t,n]=(0,p.useState)([{field:`line_count`,operator:`gt`,value:{type:`integer`,value:100}},{field:`cost`,operator:`lt`,value:{type:`float`,value:500.5}}]);return(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Numeric Filters`},k={render:e=>{let[t,n]=(0,p.useState)([{field:`created`,operator:`after`,value:{type:`date_absolute`,unixSeconds:Math.floor(new Date(`2025-01-15`).getTime()/1e3)}}]);return(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Date Filters`},A={render:e=>{let[t,n]=(0,p.useState)([{field:`unread`,operator:`yes`,value:{type:`empty`}}]);return(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Boolean / Empty Filters`},j={render:e=>{let t=[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p0`}}];return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:()=>{},isReadOnly:!0})},args:{placeholder:`Search...`},name:`Read Only`},M={render:e=>{let t=[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}];return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:()=>{},isDisabled:!0})},args:{placeholder:`Search...`}},N={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:e=>n([...e]),status:{type:`error`,message:`Invalid filter combination`}})},args:{placeholder:`Search...`},name:`With Error Status`},P={render:e=>{let[t,n]=(0,p.useState)([{field:`title`,operator:`contains`,value:{type:`string`,value:`test`}}]);return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:e=>n([...e]),status:{type:`warning`,message:`Broad search may be slow`}})},args:{placeholder:`Search...`},name:`With Warning Status`},F={render:e=>{let[t,n]=(0,p.useState)([{field:`status`,operator:`any_of`,value:{type:`enum_list`,value:[`open`,`in_progress`]}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p1`}},{field:`title`,operator:`contains`,value:{type:`string`,value:`login`}},{field:`assignee`,operator:`any_of`,value:{type:`entity_list`,value:[{id:`user-1`,label:`Alice Johnson`}]}},{field:`tags`,operator:`include`,value:{type:`enum_list`,value:[`bug`]}},{field:`line_count`,operator:`gt`,value:{type:`integer`,value:50}},{field:`created`,operator:`after`,value:{type:`date_absolute`,unixSeconds:Math.floor(new Date(`2025-06-01`).getTime()/1e3)}}]);return(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:800},children:(0,m.jsx)(e,{})})],name:`Many Filters`},I={render:e=>{let[t,n]=(0,p.useState)([]),[r,i]=(0,p.useState)([]);return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(l,{...e,config:b,filters:t,onChange:(e,t,r)=>{n([...e]),i(n=>[...n,`${t} at index ${r} (${e.length} filters total)`])}}),r.length>0&&(0,m.jsxs)(`div`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,maxHeight:200,overflow:`auto`},children:[(0,m.jsx)(`strong`,{children:`Change log:`}),(0,m.jsx)(`ul`,{style:{margin:`4px 0`,paddingInlineStart:20},children:r.map((e,t)=>(0,m.jsx)(`li`,{children:e},t))})]})]})},args:{placeholder:`Try adding, editing, and removing filters...`},name:`Change Tracking`},L={name:`NestedSearch`,fields:[{key:`status`,label:`Status`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:h}},{key:`is_not`,label:`is not`,value:{type:`enum`,values:h}}]},{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:g}}]},{key:`or_group`,label:`Any of (OR)`,defaultOperator:`match_any`,operators:[{key:`match_any`,label:`match any`,value:{type:`nested`}}]},{key:`and_group`,label:`All of (AND)`,defaultOperator:`match_all`,operators:[{key:`match_all`,label:`match all`,value:{type:`nested`}}]}]},R={render:e=>{let[t,n]=(0,p.useState)([{field:`or_group`,operator:`match_any`,value:{type:`nested`,value:[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`status`,operator:`is`,value:{type:`enum`,value:`in_progress`}}]}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p0`}},{field:`and_group`,operator:`match_all`,value:{type:`nested`,value:[{field:`title`,operator:`contains`,value:{type:`string`,value:`login`}},{field:`status`,operator:`is_not`,value:{type:`enum`,value:`closed`}}]}}]);return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(l,{...e,config:L,filters:t,onChange:e=>n([...e])}),t.length>0&&(0,m.jsx)(`pre`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,overflow:`auto`},children:JSON.stringify(t,null,2)})]})},args:{placeholder:`Add filters...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Nested Filters`},z={name:`ContentSearch`,contentSearchFieldKey:`title`,fields:[{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}},{key:`not_contains`,label:`does not contain`,value:{type:`string`}}]},{key:`status`,label:`Status`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:h}},{key:`is_not`,label:`is not`,value:{type:`enum`,values:h}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:g}}]}]},B={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(l,{...e,config:z,filters:t,onChange:e=>n([...e])}),t.length>0&&(0,m.jsx)(`pre`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,overflow:`auto`},children:JSON.stringify(t,null,2)})]})},args:{placeholder:`Type to search by title, or pick a field...`},name:`Content Search Field Key`},V={render:()=>{let[e,t]=(0,p.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]),[n,r]=(0,p.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]),[i,a]=(0,p.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,m.jsx)(l,{label:`Small (28px)`,config:b,filters:e,onChange:e=>t([...e]),placeholder:`Small size`,size:`sm`}),(0,m.jsx)(l,{label:`Medium (32px)`,config:b,filters:n,onChange:e=>r([...e]),placeholder:`Medium size (default)`,size:`md`}),(0,m.jsx)(l,{label:`Large (36px)`,config:b,filters:i,onChange:e=>a([...e]),placeholder:`Large size`,size:`lg`})]})}},H={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:e=>n([...e]),startIcon:u})},args:{label:`Search`,isLabelHidden:!0,placeholder:`Search...`},name:`With Start Icon`},U={decorators:[e=>(0,m.jsx)(`div`,{style:{width:900},children:(0,m.jsx)(e,{})})],render:()=>{let[e,t]=(0,p.useState)([]),[n,r]=(0,p.useState)([]),[i,a]=(0,p.useState)([]),[o,s]=(0,p.useState)([]);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24},children:[(0,m.jsx)(`div`,{style:{width:360},children:(0,m.jsx)(l,{label:`Default width`,isLabelHidden:!1,config:b,filters:e,onChange:e=>t([...e])})}),(0,m.jsx)(`div`,{style:{width:360},children:(0,m.jsx)(l,{label:`Wider than the input`,isLabelHidden:!1,menuWidth:640,config:b,filters:n,onChange:e=>r([...e])})}),(0,m.jsx)(`div`,{style:{width:360},children:(0,m.jsx)(l,{label:`Narrower than the input`,isLabelHidden:!1,menuWidth:200,config:b,filters:i,onChange:e=>a([...e])})}),(0,m.jsx)(`div`,{style:{width:360},children:(0,m.jsx)(l,{label:`A CSS length`,isLabelHidden:!1,menuWidth:`34rem`,config:b,filters:o,onChange:e=>s([...e])})})]})},name:`Menu Width`},W={render:e=>{let[t,n]=(0,p.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]);return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:e=>n([...e]),resultCount:1234,startIcon:u})},args:{label:`Search`,isLabelHidden:!0,placeholder:`Search...`},name:`With Result Count`},G={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:e=>n([...e]),resultCount:42,endContent:(0,m.jsx)(i,{label:`Save`,variant:`primary`,size:`sm`,style:{height:`20px`}})})},args:{label:`Search`,isLabelHidden:!0,placeholder:`Search...`,size:`lg`},name:`With End Content and Result Count`},K=[{field:`status`,operator:`any_of`,value:{type:`enum_list`,value:[`open`,`in_progress`]}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p1`}},{field:`title`,operator:`contains`,value:{type:`string`,value:`login`}},{field:`assignee`,operator:`any_of`,value:{type:`entity_list`,value:[{id:`user-1`,label:`Alice Johnson`}]}},{field:`tags`,operator:`include`,value:{type:`enum_list`,value:[`bug`]}}],q={render:e=>{let[t,n]=(0,p.useState)(K);return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e]),tokenOverflowBehavior:`unfocusedInline`}),(0,m.jsx)(`p`,{style:{marginTop:8},children:`This text will shift down when the search bar expands on focus.`})]})},args:{placeholder:`Add more filters...`},name:`Overflow Inline`},J={render:e=>{let[t,n]=(0,p.useState)(K);return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e]),tokenOverflowBehavior:`unfocusedLayer`}),(0,m.jsx)(`p`,{style:{marginTop:8},children:`This text should not shift when the search bar expands on focus.`})]})},args:{placeholder:`Add more filters...`},name:`Overflow Layer`},Y={enum:{Token:f},integer:{Editor:ne}},X={render:e=>{let[t,n]=(0,p.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`line_count`,operator:`gt`,value:{type:`integer`,value:200}}]);return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(l,{...e,config:x,filters:t,onChange:e=>n([...e]),components:Y}),(0,m.jsxs)(`p`,{style:{marginTop:16,fontSize:13,color:`#666`},children:[(0,m.jsx)(`strong`,{children:`Custom overrides:`}),` Status tokens show colored text (custom Token). Integer fields use a range slider editor (custom Editor).`]})]})},args:{placeholder:`Search with custom components...`},decorators:[e=>(0,m.jsx)(`div`,{style:{width:700},children:(0,m.jsx)(e,{})})],name:`Custom Components Map`},Z={render:e=>{let t=[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}];return(0,m.jsx)(l,{...e,config:b,filters:t,onChange:()=>{},isDisabled:!0,disabledMessage:`You need edit access to search`})},args:{placeholder:`Search...`}},Q={render:()=>{let[e,t]=(0,p.useState)([]),[n,r]=(0,p.useState)([]);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:400},children:[(0,m.jsx)(l,{config:b,filters:e,onChange:e=>t([...e]),isLabelHidden:!1,label:`Attached (default)`,status:{type:`error`,message:`Add at least one filter`}}),(0,m.jsx)(l,{config:b,filters:n,onChange:e=>r([...e]),isLabelHidden:!1,label:`Detached`,status:{type:`error`,message:`Add at least one filter`},statusVariant:`detached`})]})}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Search by status, title, priority...'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div style={{
    width: 900
  }}>
        <Story />
      </div>],
  render: () => {
    const [a, setA] = useState<PowerSearchFilter[]>([]);
    const [b, setB] = useState<PowerSearchFilter[]>([]);
    const [c, setC] = useState<PowerSearchFilter[]>([]);
    const [d, setD] = useState<PowerSearchFilter[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }}>
        <div style={{
        width: 360
      }}>
          <PowerSearch label="Default width" isLabelHidden={false} config={basicConfig} filters={a} onChange={next => setA([...next])} />
        </div>
        <div style={{
        width: 360
      }}>
          <PowerSearch label="Wider than the input" isLabelHidden={false} menuWidth={640} config={basicConfig} filters={b} onChange={next => setB([...next])} />
        </div>
        <div style={{
        width: 360
      }}>
          <PowerSearch label="Narrower than the input" isLabelHidden={false} menuWidth={200} config={basicConfig} filters={c} onChange={next => setC([...next])} />
        </div>
        <div style={{
        width: 360
      }}>
          <PowerSearch label="A CSS length" isLabelHidden={false} menuWidth="34rem" config={basicConfig} filters={d} onChange={next => setD([...next])} />
        </div>
      </div>;
  },
  name: 'Menu Width'
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const filters: PowerSearchFilter[] = [{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }];
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={() => {}} isDisabled disabledMessage="You need edit access to search" />;
  },
  args: {
    placeholder: 'Search...'
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<PowerSearchFilter[]>([]);
    const [b, setB] = useState<PowerSearchFilter[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 400
    }}>
        <PowerSearch config={basicConfig} filters={a} onChange={newFilters => setA([...newFilters])} isLabelHidden={false} label="Attached (default)" status={{
        type: 'error',
        message: 'Add at least one filter'
      }} />
        <PowerSearch config={basicConfig} filters={b} onChange={newFilters => setB([...newFilters])} isLabelHidden={false} label="Detached" status={{
        type: 'error',
        message: 'Add at least one filter'
      }} statusVariant="detached" />
      </div>;
  }
}`,...Q.parameters?.docs?.source}}},$=`Default.WithPresetFilters.FullFeatured.WithEnumListFilters.WithEntityFilters.WithNumericFilters.WithDateFilters.WithEmptyFilter.ReadOnly.Disabled.WithError.WithWarning.ManyFilters.WithOnChangeTracking.WithNestedFilters.WithContentSearchFieldKey.SizeVariants.WithStartIcon.MenuWidth.WithResultCount.WithEndContentPowerSearch.OverflowInline.OverflowLayer.WithCustomComponents.DisabledWithMessage.StatusVariantComparison`.split(`.`)}))();export{C as Default,M as Disabled,Z as DisabledWithMessage,T as FullFeatured,F as ManyFilters,U as MenuWidth,q as OverflowInline,J as OverflowLayer,j as ReadOnly,V as SizeVariants,Q as StatusVariantComparison,B as WithContentSearchFieldKey,X as WithCustomComponents,k as WithDateFilters,A as WithEmptyFilter,G as WithEndContentPowerSearch,D as WithEntityFilters,E as WithEnumListFilters,N as WithError,R as WithNestedFilters,O as WithNumericFilters,I as WithOnChangeTracking,w as WithPresetFilters,W as WithResultCount,H as WithStartIcon,P as WithWarning,$ as __namedExportsOrder,S as default};