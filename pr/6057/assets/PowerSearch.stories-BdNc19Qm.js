import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-CJ0yeiFV.js";import{t as a}from"./Button-DBQO7xlr.js";import{o,t as s}from"./Stack-Dntpv-r2.js";import{n as c,t as l}from"./Token-D4p2BQPs.js";import{Q as u,Y as d}from"./iframe-CVUeBm0w.js";import{K as f,t as p}from"./esm-BNuSW8ar.js";function m(e,t,n){return{key:e,label:t,group:n,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}},{key:`not_contains`,label:`does not contain`,value:{type:`string`}}]}}function h(e,t){return{key:e,label:t,group:`People`,defaultOperator:`any_of`,operators:[{key:`any_of`,label:`is any of`,value:{type:`entity_list`,searchSource:re}}]}}function ee({filter:e,field:t,operator:n,maxLength:r,onClick:i,onRemove:a,isDisabled:o}){let s=e.value.type===`enum`?e.value.value:`?`;return(0,v.jsx)(c,{label:`${t.label}: ${n.label}`,endContent:(0,v.jsx)(`span`,{style:{fontWeight:600,color:{open:`#22c55e`,in_progress:`#3b82f6`,review:`#a855f7`,closed:`#6b7280`,blocked:`#ef4444`}[s]??`inherit`},children:s}),onClick:i?e=>{e.stopPropagation(),i()}:void 0,onRemove:a,isDisabled:o})}function g({config:e,filter:t,mode:n,onSave:r,onCancel:i,saveButtonLabel:a,isReadOnly:s}){let c=t.value?.type===`integer`?t.value.value:50;return(0,v.jsxs)(`div`,{style:{padding:16},children:[(0,v.jsx)(`p`,{style:{margin:`0 0 12px`,fontSize:13},children:`Custom range editor for integer fields:`}),(0,v.jsxs)(o,{gap:2,vAlign:`center`,children:[(0,v.jsx)(`input`,{type:`range`,min:0,max:1e3,value:c,onChange:e=>{t.operator!=null&&r({field:t.field,operator:t.operator,value:{type:`integer`,value:Number(e.target.value)}})},style:{flex:1},disabled:s}),(0,v.jsx)(`span`,{style:{fontSize:12,whiteSpace:`nowrap`},children:c})]}),(0,v.jsx)(`div`,{style:{marginTop:12,display:`flex`,gap:8,justifyContent:`flex-end`},children:(0,v.jsx)(`button`,{onClick:i,children:`Cancel`})})]})}var _,v,y,b,x,te,ne,S,C,w,re,ie,ae,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,oe,H,se,U,W,G,K,q,J,Y,X,ce,Z,Q,$,le;e((()=>{_=t(n()),d(),a(),p(),v=r(),l(),s(),y=[{value:`open`,label:`Open`},{value:`in_progress`,label:`In Progress`},{value:`review`,label:`In Review`},{value:`closed`,label:`Closed`},{value:`blocked`,label:`Blocked`}],b=[{value:`p0`,label:`P0 - Critical`},{value:`p1`,label:`P1 - High`},{value:`p2`,label:`P2 - Medium`},{value:`p3`,label:`P3 - Low`}],x=[{value:`bug`,label:`Bug`},{value:`feature`,label:`Feature`},{value:`docs`,label:`Documentation`},{value:`perf`,label:`Performance`},{value:`security`,label:`Security`},{value:`ux`,label:`UX`},{value:`infra`,label:`Infrastructure`}],te=[{id:`user-1`,label:`Alice Johnson`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=alice`}},{id:`user-2`,label:`Bob Smith`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=bob`}},{id:`user-3`,label:`Charlie Brown`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=charlie`}},{id:`user-4`,label:`Diana Prince`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=diana`}},{id:`user-5`,label:`Eve Williams`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=eve`}},{id:`user-6`,label:`Frank Miller`,auxiliaryData:{photo:`https://i.pravatar.cc/150?u=frank`}}],ne={search:e=>te.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>te},S={name:`BasicSearch`,fields:[{key:`status`,label:`Status`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:y}},{key:`is_not`,label:`is not`,value:{type:`enum`,values:y}}]},{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}},{key:`not_contains`,label:`does not contain`,value:{type:`string`}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:b}}]}]},C={name:`FullSearch`,fields:[{key:`status`,label:`Status`,defaultOperator:`any_of`,operators:[{key:`any_of`,label:`is any of`,value:{type:`enum_list`,values:y}},{key:`none_of`,label:`is none of`,value:{type:`enum_list`,values:y}}]},{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}},{key:`not_contains`,label:`does not contain`,value:{type:`string`}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:b}}]},{key:`assignee`,label:`Assignee`,defaultOperator:`any_of`,typeaheadAliases:[`owner`,`assigned`],operators:[{key:`any_of`,label:`is any of`,value:{type:`entity_list`,searchSource:ne}},{key:`none_of`,label:`is none of`,value:{type:`entity_list`,searchSource:ne}}]},{key:`tags`,label:`Tags`,defaultOperator:`include`,operators:[{key:`include`,label:`include`,value:{type:`enum_list`,values:x}},{key:`exclude`,label:`exclude`,value:{type:`enum_list`,values:x}}]},{key:`line_count`,label:`Line count`,defaultOperator:`gt`,operators:[{key:`gt`,label:`is greater than`,value:{type:`integer`,minValue:0,maxValue:1e4,units:`lines`}},{key:`lt`,label:`is less than`,value:{type:`integer`,minValue:0,maxValue:1e4,units:`lines`}}]},{key:`cost`,label:`Cost`,defaultOperator:`gt`,operators:[{key:`gt`,label:`>`,value:{type:`float`,minValue:0,maxValue:1e5,units:`USD`}},{key:`lt`,label:`<`,value:{type:`float`,minValue:0,maxValue:1e5,units:`USD`}}]},{key:`created`,label:`Created`,defaultOperator:`after`,operators:[{key:`after`,label:`is after`,value:{type:`date_absolute`,isDateOnly:!0}},{key:`newer_than`,label:`is newer than`,value:{type:`date_relative`,isPastAllowed:!0,isFutureAllowed:!1}},{key:`between`,label:`is between`,value:{type:`date_range`}}]},{key:`ids`,label:`ID`,defaultOperator:`in`,operators:[{key:`in`,label:`is any of`,value:{type:`string_list`}}]},{key:`unread`,label:`Unread only`,defaultOperator:`yes`,operators:[{key:`yes`,label:``,value:{type:`empty`}}]}]},w=Array.from({length:25},(e,t)=>({id:`person-${t+1}`,label:`Person ${String(t+1).padStart(2,`0`)}`})),re={search:e=>w.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>w},ie={name:`IssueTrackerSearch`,fields:[{key:`status`,label:`Status`,defaultOperator:`any_of`,operators:[{key:`any_of`,label:`is any of`,value:{type:`enum_list`,values:y}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:b}}]},m(`title`,`Title`),m(`labels`,`Labels`),h(`owner`,`Owner`),h(`creator`,`Creator`),h(`subscriber`,`Subscriber`),h(`reviewer`,`Reviewer`),m(`project`,`Project`,`Planning`),m(`milestone`,`Milestone`,`Planning`),m(`sprint`,`Sprint`,`Planning`),m(`estimate`,`Estimate`,`Planning`),{key:`due_date`,label:`Due date`,group:`Planning`,defaultOperator:`before`,operators:[{key:`before`,label:`is before`,value:{type:`date_absolute`,isDateOnly:!0}}]},{key:`created`,label:`Created`,group:`Activity`,defaultOperator:`after`,operators:[{key:`after`,label:`is after`,value:{type:`date_absolute`,isDateOnly:!0}}]},{key:`updated`,label:`Updated`,group:`Activity`,defaultOperator:`after`,operators:[{key:`after`,label:`is after`,value:{type:`date_absolute`,isDateOnly:!0}}]},{key:`comment_count`,label:`Comment count`,group:`Activity`,defaultOperator:`gt`,operators:[{key:`gt`,label:`is greater than`,value:{type:`integer`,minValue:0}}]},m(`linked_items`,`Linked items`,`Activity`)]},ae={title:`Core/PowerSearch`,component:u,tags:[`autodocs`],decorators:[e=>(0,v.jsx)(`div`,{style:{width:600},children:(0,v.jsx)(e,{})})],argTypes:{placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the search is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled PowerSearch in Tooltip.`},isReadOnly:{control:`boolean`},hasClear:{control:`boolean`},maxTokenLength:{control:`number`},maxSearchResults:{control:`number`,description:`Main ranked results shown after typing a query.`},maxOperatorMenuItems:{control:`number`,description:`Value results shown after selecting a field, such as people in the Owner picker.`},menuWidth:{control:`number`,description:`Main field/search menu width in pixels.`},popoverSaveButtonLabel:{control:`text`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Search input size`}}},T={render:e=>{let[t,n]=(0,_.useState)([]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Search by status, title, priority...`}},E={render:e=>{let[t,n]=(0,_.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p1`}}]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},name:`Pre-set Filters`},D={render:e=>{let[t,n]=(0,_.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p1`}},{field:`title`,operator:`contains`,value:{type:`string`,value:`aaaaaaaaaaaaaaaaaa`}}]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},name:`Near-full Token Row`,play:async({canvasElement:e})=>{let t=e.querySelector(`.astryx-tokenizer`),n=t?.querySelector(`[role="combobox"]`),r=t?.querySelectorAll(`:scope > span`),i=r?.item(0),a=r?.item((r?.length??0)-1),o=t?.querySelector(`button[aria-label="Clear all"]`);if(!t||!n||!i||!a||!o)throw Error(`Near-full token-row fixture did not render as expected`);let s=matchMedia(`(pointer: coarse)`).matches;if(new URLSearchParams(window.location.search).get(`storyPlayPointer`)===`coarse`&&!s)throw Error(`Near-full token-row guard requires a coarse pointer`);await document.fonts.ready;let c=performance.now()+2e3;for(;t.style.getPropertyValue(`--_tokenizer-end-lane-reserve`)===``;){if(performance.now()>=c)throw Error(`Clear-all lane reserve was not measured`);await new Promise(e=>requestAnimationFrame(()=>e()))}await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e())));let l=n.getBoundingClientRect(),u=i.getBoundingClientRect(),d=a.getBoundingClientRect(),f=o.getBoundingClientRect(),p=0,m=0;if(s){let e=getComputedStyle(o,`::after`);if(p=Number.parseFloat(e.left),m=Number.parseFloat(e.right),e.content===`none`||!Number.isFinite(p)||!Number.isFinite(m))throw Error(`Clear all did not expose its coarse-pointer hit area`)}let h={left:f.left+p,right:f.right-m};if(Math.abs(u.top-d.top)>.5)throw Error(`Fixture tokens wrapped before the empty combobox check: first token top ${u.top.toFixed(2)}, final token top ${d.top.toFixed(2)}`);if(l.top>=d.bottom)throw Error(`Empty combobox wrapped onto a blank row: input top ${l.top.toFixed(2)}, final token bottom ${d.bottom.toFixed(2)}`);if(l.width<=0)throw Error(`Empty combobox has no pointer hit target`);let ee=Math.min(l.right,h.right)-Math.max(l.left,h.left);if(ee>0)throw Error(`Empty combobox overlaps the coarse-pointer Clear all hit area by ${ee.toFixed(2)}px`);let g=document.elementFromPoint(f.left+f.width/2,f.top+f.height/2);if(!g||!o.contains(g))throw Error(`Clear all center is hit-tested as ${g?.tagName??`nothing`}`);let _=document.elementFromPoint(d.left+d.width/2,d.top+d.height/2);if(!_||!a.contains(_))throw Error(`Final token center is hit-tested as ${_?.tagName??`nothing`}`);let v=l.top+l.height/2,y=null;for(let e=Math.ceil(l.left);e<l.right;e+=1){let t=document.elementFromPoint(e+.5,v);if(t===n){y=t;break}}if(!y)throw Error(`Empty combobox has no exposed pointer hit target`);if(y.dispatchEvent(new MouseEvent(`click`,{bubbles:!0})),document.activeElement!==n)throw Error(`Clicking the empty combobox did not focus it`)}},O={...D,decorators:[e=>(0,v.jsx)(`div`,{dir:`rtl`,children:(0,v.jsx)(e,{})})],name:`Near-full Token Row (RTL)`},k={render:e=>{let[t,n]=(0,_.useState)([]);return(0,v.jsxs)(`div`,{children:[(0,v.jsx)(u,{...e,config:C,filters:t,onChange:(e,t,r)=>{n([...e])}}),t.length>0&&(0,v.jsx)(`pre`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,overflow:`auto`},children:JSON.stringify(t,null,2)})]})},args:{placeholder:`Search...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Full Featured (All Field Types)`},A={render:e=>{let[t,n]=(0,_.useState)([]);return(0,v.jsx)(u,{...e,config:ie,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Filter issues...`,hasAutoFocus:!0,maxSearchResults:2,maxOperatorMenuItems:2,menuWidth:700},parameters:{docs:{description:{story:`A realistic issue-tracker field set. Open the empty search to browse ungrouped fields first, followed by optional People, Planning, and Activity sections. Typing switches back to a flat ranked list. Use maxSearchResults to cap the main ranked list; use maxOperatorMenuItems for values after selecting a field, such as Owner.`}}},decorators:[e=>(0,v.jsx)(`div`,{style:{width:500,minHeight:420},children:(0,v.jsx)(e,{})})],name:`Issue Tracker (Grouped Fields)`},j={render:e=>{let[t,n]=(0,_.useState)([{field:`status`,operator:`any_of`,value:{type:`enum_list`,value:[`open`,`in_progress`]}},{field:`tags`,operator:`include`,value:{type:`enum_list`,value:[`bug`,`security`]}}]);return(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Multi-value Filters`},M={render:e=>{let[t,n]=(0,_.useState)([{field:`assignee`,operator:`any_of`,value:{type:`entity_list`,value:[{id:`user-1`,label:`Alice Johnson`},{id:`user-3`,label:`Charlie Brown`}]}}]);return(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Entity Filters`},N={render:e=>{let[t,n]=(0,_.useState)([{field:`line_count`,operator:`gt`,value:{type:`integer`,value:100}},{field:`cost`,operator:`lt`,value:{type:`float`,value:500.5}}]);return(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Numeric Filters`},P={render:e=>{let[t,n]=(0,_.useState)([{field:`created`,operator:`between`,value:{type:`date_range`,value:{start:{type:`ABSOLUTE`,unixSeconds:Date.parse(`2026-01-05T00:00:00Z`)/1e3},end:{type:`ABSOLUTE`,unixSeconds:Date.parse(`2026-01-07T00:00:00Z`)/1e3}}}}]);return(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Date Filters`},F={render:e=>{let[t,n]=(0,_.useState)([{field:`unread`,operator:`yes`,value:{type:`empty`}}]);return(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Boolean / Empty Filters`},I={render:e=>{let t=[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p0`}}];return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:()=>{},isReadOnly:!0})},args:{placeholder:`Search...`},name:`Read Only`},L={render:e=>{let t=[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}];return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:()=>{},isDisabled:!0})},args:{placeholder:`Search...`}},R={render:e=>{let[t,n]=(0,_.useState)([]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e]),status:{type:`error`,message:`Invalid filter combination`}})},args:{placeholder:`Search...`},name:`With Error Status`},z={render:e=>{let[t,n]=(0,_.useState)([{field:`title`,operator:`contains`,value:{type:`string`,value:`test`}}]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e]),status:{type:`warning`,message:`Broad search may be slow`}})},args:{placeholder:`Search...`},name:`With Warning Status`},B={render:e=>{let[t,n]=(0,_.useState)([{field:`status`,operator:`any_of`,value:{type:`enum_list`,value:[`open`,`in_progress`]}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p1`}},{field:`title`,operator:`contains`,value:{type:`string`,value:`login`}},{field:`assignee`,operator:`any_of`,value:{type:`entity_list`,value:[{id:`user-1`,label:`Alice Johnson`}]}},{field:`tags`,operator:`include`,value:{type:`enum_list`,value:[`bug`]}},{field:`line_count`,operator:`gt`,value:{type:`integer`,value:50}},{field:`created`,operator:`after`,value:{type:`date_absolute`,unixSeconds:Math.floor(new Date(`2025-06-01`).getTime()/1e3)}}]);return(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e])})},args:{placeholder:`Add more filters...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:800},children:(0,v.jsx)(e,{})})],name:`Many Filters`},V={render:e=>{let[t,n]=(0,_.useState)([]),[r,i]=(0,_.useState)([]);return(0,v.jsxs)(`div`,{children:[(0,v.jsx)(u,{...e,config:S,filters:t,onChange:(e,t,r)=>{n([...e]),i(n=>[...n,`${t} at index ${r} (${e.length} filters total)`])}}),r.length>0&&(0,v.jsxs)(`div`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,maxHeight:200,overflow:`auto`},children:[(0,v.jsx)(`strong`,{children:`Change log:`}),(0,v.jsx)(`ul`,{style:{margin:`4px 0`,paddingInlineStart:20},children:r.map((e,t)=>(0,v.jsx)(`li`,{children:e},t))})]})]})},args:{placeholder:`Try adding, editing, and removing filters...`},name:`Change Tracking`},oe={name:`NestedSearch`,fields:[{key:`status`,label:`Status`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:y}},{key:`is_not`,label:`is not`,value:{type:`enum`,values:y}}]},{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:b}}]},{key:`or_group`,label:`Any of (OR)`,defaultOperator:`match_any`,operators:[{key:`match_any`,label:`match any`,value:{type:`nested`}}]},{key:`and_group`,label:`All of (AND)`,defaultOperator:`match_all`,operators:[{key:`match_all`,label:`match all`,value:{type:`nested`}}]}]},H={render:e=>{let[t,n]=(0,_.useState)([{field:`or_group`,operator:`match_any`,value:{type:`nested`,value:[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`status`,operator:`is`,value:{type:`enum`,value:`in_progress`}}]}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p0`}},{field:`and_group`,operator:`match_all`,value:{type:`nested`,value:[{field:`title`,operator:`contains`,value:{type:`string`,value:`login`}},{field:`status`,operator:`is_not`,value:{type:`enum`,value:`closed`}}]}}]);return(0,v.jsxs)(`div`,{children:[(0,v.jsx)(u,{...e,config:oe,filters:t,onChange:e=>n([...e])}),t.length>0&&(0,v.jsx)(`pre`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,overflow:`auto`},children:JSON.stringify(t,null,2)})]})},args:{placeholder:`Add filters...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Nested Filters`},se={name:`ContentSearch`,contentSearchFieldKey:`title`,fields:[{key:`title`,label:`Title`,defaultOperator:`contains`,operators:[{key:`contains`,label:`contains`,value:{type:`string`}},{key:`not_contains`,label:`does not contain`,value:{type:`string`}}]},{key:`status`,label:`Status`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:y}},{key:`is_not`,label:`is not`,value:{type:`enum`,values:y}}]},{key:`priority`,label:`Priority`,defaultOperator:`is`,operators:[{key:`is`,label:`is`,value:{type:`enum`,values:b}}]}]},U={render:e=>{let[t,n]=(0,_.useState)([]);return(0,v.jsxs)(`div`,{children:[(0,v.jsx)(u,{...e,config:se,filters:t,onChange:e=>n([...e])}),t.length>0&&(0,v.jsx)(`pre`,{style:{marginTop:16,padding:12,backgroundColor:`#f5f5f5`,borderRadius:8,fontSize:12,overflow:`auto`},children:JSON.stringify(t,null,2)})]})},args:{placeholder:`Type to search by title, or pick a field...`},name:`Content Search Field Key`},W={render:()=>{let[e,t]=(0,_.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]),[n,r]=(0,_.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]),[i,a]=(0,_.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,v.jsx)(u,{label:`Small (28px)`,config:S,filters:e,onChange:e=>t([...e]),placeholder:`Small size`,size:`sm`}),(0,v.jsx)(u,{label:`Medium (32px)`,config:S,filters:n,onChange:e=>r([...e]),placeholder:`Medium size (default)`,size:`md`}),(0,v.jsx)(u,{label:`Large (36px)`,config:S,filters:i,onChange:e=>a([...e]),placeholder:`Large size`,size:`lg`})]})}},G={render:e=>{let[t,n]=(0,_.useState)([]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e]),startIcon:f})},args:{label:`Search`,isLabelHidden:!0,placeholder:`Search...`},name:`With Start Icon`},K={render:e=>{let[t,n]=(0,_.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e]),resultCount:1234,startIcon:f})},args:{label:`Search`,isLabelHidden:!0,placeholder:`Search...`},name:`With Result Count`},q={render:e=>{let[t,n]=(0,_.useState)([]);return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:e=>n([...e]),resultCount:42,endContent:(0,v.jsx)(i,{label:`Save`,variant:`primary`,size:`sm`,style:{height:`20px`}})})},args:{label:`Search`,isLabelHidden:!0,placeholder:`Search...`,size:`lg`},name:`With End Content and Result Count`},J=[{field:`status`,operator:`any_of`,value:{type:`enum_list`,value:[`open`,`in_progress`]}},{field:`priority`,operator:`is`,value:{type:`enum`,value:`p1`}},{field:`title`,operator:`contains`,value:{type:`string`,value:`login`}},{field:`assignee`,operator:`any_of`,value:{type:`entity_list`,value:[{id:`user-1`,label:`Alice Johnson`}]}},{field:`tags`,operator:`include`,value:{type:`enum_list`,value:[`bug`]}}],Y={render:e=>{let[t,n]=(0,_.useState)(J);return(0,v.jsxs)(`div`,{children:[(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e]),tokenOverflowBehavior:`unfocusedInline`}),(0,v.jsx)(`p`,{style:{marginTop:8},children:`This text will shift down when the search bar expands on focus.`})]})},args:{placeholder:`Add more filters...`},name:`Overflow Inline`},X={render:e=>{let[t,n]=(0,_.useState)(J);return(0,v.jsxs)(`div`,{children:[(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e]),tokenOverflowBehavior:`unfocusedLayer`}),(0,v.jsx)(`p`,{style:{marginTop:8},children:`This text should not shift when the search bar expands on focus.`})]})},args:{placeholder:`Add more filters...`},name:`Overflow Layer`},ce={enum:{Token:ee},integer:{Editor:g}},Z={render:e=>{let[t,n]=(0,_.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`line_count`,operator:`gt`,value:{type:`integer`,value:200}}]);return(0,v.jsxs)(`div`,{children:[(0,v.jsx)(u,{...e,config:C,filters:t,onChange:e=>n([...e]),components:ce}),(0,v.jsxs)(`p`,{style:{marginTop:16,fontSize:13,color:`var(--color-text-secondary)`},children:[(0,v.jsx)(`strong`,{children:`Custom overrides:`}),` Status tokens show colored text (custom Token). Integer fields use a range slider editor (custom Editor).`]})]})},args:{placeholder:`Search with custom components...`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:700},children:(0,v.jsx)(e,{})})],name:`Custom Components Map`},Q={render:e=>{let t=[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}];return(0,v.jsx)(u,{...e,config:S,filters:t,onChange:()=>{},isDisabled:!0,disabledMessage:`You need edit access to search`})},args:{placeholder:`Search...`}},$={render:()=>{let[e,t]=(0,_.useState)([]),[n,r]=(0,_.useState)([]);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:400},children:[(0,v.jsx)(u,{config:S,filters:e,onChange:e=>t([...e]),isLabelHidden:!1,label:`Attached (default)`,status:{type:`error`,message:`Add at least one filter`}}),(0,v.jsx)(u,{config:S,filters:n,onChange:e=>r([...e]),isLabelHidden:!1,label:`Detached`,status:{type:`error`,message:`Add at least one filter`},statusVariant:`detached`})]})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Search by status, title, priority...'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
    }, {
      field: 'title',
      operator: 'contains',
      value: {
        type: 'string',
        value: 'aaaaaaaaaaaaaaaaaa'
      }
    }]);
    return <PowerSearch {...args} config={basicConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Add more filters...'
  },
  name: 'Near-full Token Row',
  play: async ({
    canvasElement
  }) => {
    const wrapper = canvasElement.querySelector<HTMLElement>('.astryx-tokenizer');
    const input = wrapper?.querySelector<HTMLInputElement>('[role="combobox"]');
    const tokens = wrapper?.querySelectorAll<HTMLElement>(':scope > span');
    const firstToken = tokens?.item(0);
    const finalToken = tokens?.item((tokens?.length ?? 0) - 1);
    const clearButton = wrapper?.querySelector<HTMLButtonElement>('button[aria-label="Clear all"]');
    if (!wrapper || !input || !firstToken || !finalToken || !clearButton) {
      throw new Error('Near-full token-row fixture did not render as expected');
    }
    const isCoarsePointer = matchMedia('(pointer: coarse)').matches;
    const requiresCoarsePointer = new URLSearchParams(window.location.search).get('storyPlayPointer') === 'coarse';
    if (requiresCoarsePointer && !isCoarsePointer) {
      throw new Error('Near-full token-row guard requires a coarse pointer');
    }
    await document.fonts.ready;
    const reserveDeadline = performance.now() + 2000;
    while (wrapper.style.getPropertyValue('--_tokenizer-end-lane-reserve') === '') {
      if (performance.now() >= reserveDeadline) {
        throw new Error('Clear-all lane reserve was not measured');
      }
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const inputRect = input.getBoundingClientRect();
    const firstTokenRect = firstToken.getBoundingClientRect();
    const tokenRect = finalToken.getBoundingClientRect();
    const clearRect = clearButton.getBoundingClientRect();
    let clearHitLeft = 0;
    let clearHitRight = 0;
    if (isCoarsePointer) {
      const clearHitStyle = getComputedStyle(clearButton, '::after');
      clearHitLeft = Number.parseFloat(clearHitStyle.left);
      clearHitRight = Number.parseFloat(clearHitStyle.right);
      if (clearHitStyle.content === 'none' || !Number.isFinite(clearHitLeft) || !Number.isFinite(clearHitRight)) {
        throw new Error('Clear all did not expose its coarse-pointer hit area');
      }
    }
    const clearHitRect = {
      left: clearRect.left + clearHitLeft,
      right: clearRect.right - clearHitRight
    };
    if (Math.abs(firstTokenRect.top - tokenRect.top) > 0.5) {
      throw new Error(\`Fixture tokens wrapped before the empty combobox check: first token top \${firstTokenRect.top.toFixed(2)}, final token top \${tokenRect.top.toFixed(2)}\`);
    }
    if (inputRect.top >= tokenRect.bottom) {
      throw new Error(\`Empty combobox wrapped onto a blank row: input top \${inputRect.top.toFixed(2)}, final token bottom \${tokenRect.bottom.toFixed(2)}\`);
    }
    if (inputRect.width <= 0) {
      throw new Error('Empty combobox has no pointer hit target');
    }
    const overlap = Math.min(inputRect.right, clearHitRect.right) - Math.max(inputRect.left, clearHitRect.left);
    if (overlap > 0) {
      throw new Error(\`Empty combobox overlaps the coarse-pointer Clear all hit area by \${overlap.toFixed(2)}px\`);
    }
    const clearHitTarget = document.elementFromPoint(clearRect.left + clearRect.width / 2, clearRect.top + clearRect.height / 2);
    if (!clearHitTarget || !clearButton.contains(clearHitTarget)) {
      throw new Error(\`Clear all center is hit-tested as \${clearHitTarget?.tagName ?? 'nothing'}\`);
    }
    const tokenHitTarget = document.elementFromPoint(tokenRect.left + tokenRect.width / 2, tokenRect.top + tokenRect.height / 2);
    if (!tokenHitTarget || !finalToken.contains(tokenHitTarget)) {
      throw new Error(\`Final token center is hit-tested as \${tokenHitTarget?.tagName ?? 'nothing'}\`);
    }
    const hitY = inputRect.top + inputRect.height / 2;
    let inputHitTarget: Element | null = null;
    for (let x = Math.ceil(inputRect.left); x < inputRect.right; x += 1) {
      const candidate = document.elementFromPoint(x + 0.5, hitY);
      if (candidate === input) {
        inputHitTarget = candidate;
        break;
      }
    }
    if (!inputHitTarget) {
      throw new Error('Empty combobox has no exposed pointer hit target');
    }
    inputHitTarget.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));
    if (document.activeElement !== input) {
      throw new Error('Clicking the empty combobox did not focus it');
    }
  }
}`,...D.parameters?.docs?.source},description:{story:`A nearly full token row keeps its empty combobox on that row instead of
growing the field with a blank trailing row. Typing still restores the
input's normal editing width and may wrap visibly when space is exhausted.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  ...NearFullTokenRow,
  decorators: [Story => <div dir="rtl">
        <Story />
      </div>],
  name: 'Near-full Token Row (RTL)'
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return <PowerSearch {...args} config={issueTrackerConfig} filters={filters} onChange={newFilters => setFilters([...newFilters])} />;
  },
  args: {
    placeholder: 'Filter issues...',
    hasAutoFocus: true,
    maxSearchResults: 2,
    maxOperatorMenuItems: 2,
    menuWidth: 700
  },
  parameters: {
    docs: {
      description: {
        story: 'A realistic issue-tracker field set. Open the empty search to browse ungrouped fields first, followed by optional People, Planning, and Activity sections. Typing switches back to a flat ranked list. Use maxSearchResults to cap the main ranked list; use maxOperatorMenuItems for values after selecting a field, such as Owner.'
      }
    }
  },
  decorators: [Story => <div style={{
    width: 500,
    minHeight: 420
  }}>
        <Story />
      </div>],
  name: 'Issue Tracker (Grouped Fields)'
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'created',
      operator: 'between',
      value: {
        type: 'date_range',
        value: {
          start: {
            type: 'ABSOLUTE',
            unixSeconds: Date.parse('2026-01-05T00:00:00Z') / 1000
          },
          end: {
            type: 'ABSOLUTE',
            unixSeconds: Date.parse('2026-01-07T00:00:00Z') / 1000
          }
        }
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
        color: 'var(--color-text-secondary)'
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
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}},le=`Default.WithPresetFilters.NearFullTokenRow.NearFullTokenRowRTL.FullFeatured.IssueTracker.WithEnumListFilters.WithEntityFilters.WithNumericFilters.WithDateFilters.WithEmptyFilter.ReadOnly.Disabled.WithError.WithWarning.ManyFilters.WithOnChangeTracking.WithNestedFilters.WithContentSearchFieldKey.SizeVariants.WithStartIcon.WithResultCount.WithEndContentPowerSearch.OverflowInline.OverflowLayer.WithCustomComponents.DisabledWithMessage.StatusVariantComparison`.split(`.`)}))();export{T as Default,L as Disabled,Q as DisabledWithMessage,k as FullFeatured,A as IssueTracker,B as ManyFilters,D as NearFullTokenRow,O as NearFullTokenRowRTL,Y as OverflowInline,X as OverflowLayer,I as ReadOnly,W as SizeVariants,$ as StatusVariantComparison,U as WithContentSearchFieldKey,Z as WithCustomComponents,P as WithDateFilters,F as WithEmptyFilter,q as WithEndContentPowerSearch,M as WithEntityFilters,j as WithEnumListFilters,R as WithError,H as WithNestedFilters,N as WithNumericFilters,V as WithOnChangeTracking,E as WithPresetFilters,K as WithResultCount,G as WithStartIcon,z as WithWarning,le as __namedExportsOrder,ae as default};