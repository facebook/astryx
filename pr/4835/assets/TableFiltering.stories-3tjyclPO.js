import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Button-BVMvoKVE.js";import{n as s,t as c}from"./useTranslator-BMnme3me.js";import{n as l,t as u}from"./Icon-C24cO4CC.js";import{n as d,t as f}from"./Popover-Dzrapr1u.js";import{n as p,t as m}from"./TextInput-BwKW_f5i.js";import{n as h,t as g}from"./Selector-CXBa_P0j.js";import{a as _,r as v}from"./columnUtils-BDDG7zo5.js";import{n as ee,t as y}from"./Table-ClbWztQk.js";import{n as te,t as ne}from"./EmptyState-BhVkQYUa.js";import{n as re,t as ie}from"./DateInput-BhvRwEmD.js";import{n as ae,t as oe}from"./MultiSelector-BmMbiZNG.js";import{n as se,t as ce}from"./TimeInput-BumYusjs.js";import{n as le,t as b}from"./NumberInput-2V04Odci.js";import{i as x,n as ue,r as de,t as fe}from"./useTableSelectionState-BSKEXSen.js";import{i as pe,n as S,r as me,t as he}from"./useTableSortableState-CHVlCziu.js";import{n as C,t as ge}from"./useTableColumnResize-xrKCKQfH.js";import{n as _e,t as ve}from"./Tokenizer-CjzPOoii.js";import{n as w,t as ye}from"./usePowerSearchConfig-Bn6AxN9E.js";function T(e,t){return t?e.operators.find(e=>e.key===t):e.defaultOperator?e.operators.find(t=>t.key===e.defaultOperator):e.operators[0]}function be(e,t){let n=typeof e==`string`?e:e.field,r=typeof e==`string`?void 0:e.operator,i=t.fields.find(e=>e.key===n);if(!i)return;let a=T(i,r);if(a)return a.value}function E(e,t,n){let r=[];for(let i of t){if(!i.filter)continue;let t=e[i.key];if(t==null)continue;let a=typeof i.filter==`string`?i.filter:i.filter.field,o=typeof i.filter==`string`?void 0:i.filter.operator,s=n.fields.find(e=>e.key===a);if(!s)continue;let c=T(s,o);if(!c)continue;let l=xe(t,c.value);l&&r.push({field:a,operator:c.key,value:l})}return r}function xe(e,t){switch(t.type){case`string`:return typeof e==`string`?{type:`string`,value:e}:void 0;case`integer`:return typeof e==`number`?{type:`integer`,value:e}:void 0;case`float`:return typeof e==`number`?{type:`float`,value:e}:void 0;case`enum`:return typeof e==`string`?{type:`enum`,value:e}:void 0;case`enum_list`:return Array.isArray(e)?{type:`enum_list`,value:e}:void 0;case`date_absolute`:return typeof e==`string`?{type:`date_absolute`,unixSeconds:Math.floor(new Date(e).getTime()/1e3)}:void 0;case`time`:return typeof e==`string`?{type:`time`,value:e}:void 0;case`string_list`:return Array.isArray(e)?{type:`string_list`,value:e}:void 0;case`entity_list`:return Array.isArray(e)?{type:`entity_list`,value:e.map(e=>({id:e,label:e}))}:void 0;case`nested`:case`empty`:case`date_relative`:case`date_range`:case`custom`:return}}function D(){let e=(0,A.use)(M);if(!e)throw Error(`useFilterStore must be used within a Table with filtering`);return e}function Se({columnKey:e,header:t,size:n,hasClear:r}){let i=s(),a=D(),o=a.getConfig().filters[e],c=typeof o==`string`?o:``;return(0,j.jsx)(m,{label:i(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,value:c,onChange:t=>{a.getConfig().onFilterChange(e,t===``?null:t)},placeholder:i(`@astryx.tableFiltering.filterByColumn`,{header:t}),size:n,hasClear:r})}function Ce({columnKey:e,header:t,operatorValue:n,size:r,hasClear:i}){let a=s(),o=D(),c=o.getConfig().filters[e],l=typeof c==`number`?c:null,u=n.type===`integer`?1:null,d=(0,A.useCallback)(t=>{o.getConfig().onFilterChange(e,t)},[o,e]);return i?(0,j.jsx)(b,{label:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,value:l,onChange:d,placeholder:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),min:n.minValue??null,max:n.maxValue??null,step:u,size:r,hasClear:!0}):(0,j.jsx)(b,{label:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,value:l,onChange:d,placeholder:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),min:n.minValue??null,max:n.maxValue??null,step:u,size:r})}function we({columnKey:e,header:t,operatorValue:n,size:r,hasClear:i}){let a=s(),o=D(),c=o.getConfig().filters[e],l=typeof c==`string`?c:``,u=n.values.map(e=>({value:e.value,label:e.label})),d=(0,A.useCallback)(t=>{o.getConfig().onFilterChange(e,t===``||t==null?null:t)},[o,e]);return i?(0,j.jsx)(g,{label:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,options:u,value:l||null,onChange:d,placeholder:a(`@astryx.table.filter.allPlaceholder`),size:r,hasClear:!0}):(0,j.jsx)(g,{label:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,options:u,value:l,onChange:d,placeholder:a(`@astryx.table.filter.allPlaceholder`),size:r})}function Te({columnKey:e,header:t,operatorValue:n,size:r,hasClear:i}){let a=s(),o=D(),c=o.getConfig().filters[e],l=Array.isArray(c)?c:[],u=n.values.map(e=>({value:e.value,label:e.label}));return(0,j.jsx)(oe,{label:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,options:u,value:l,onChange:t=>{o.getConfig().onFilterChange(e,t.length===0?null:t)},placeholder:a(`@astryx.table.filter.allPlaceholder`),size:r,hasSelectAll:!0,hasSearch:!1,hasClear:i})}function Ee({columnKey:e,header:t,size:n,hasClear:r}){let i=s(),a=D(),o=a.getConfig().filters[e];return(0,j.jsx)(ie,{label:i(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,value:o??void 0,onChange:t=>{a.getConfig().onFilterChange(e,t??null)},size:n,hasClear:r})}function De({columnKey:e,header:t,size:n,hasClear:r}){let i=s(),a=D(),o=a.getConfig().filters[e];return(0,j.jsx)(ce,{label:i(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,value:o??void 0,onChange:t=>{a.getConfig().onFilterChange(e,t??null)},size:n,hasClear:r})}function Oe({columnKey:e,header:t,operatorValue:n,size:r,hasClear:i}){let a=s(),o=D(),c=o.getConfig().filters[e]??[],l=(0,A.useMemo)(()=>({search:async e=>e.trim()?[{id:e.trim(),label:e.trim()}]:[],bootstrap:()=>[]}),[]),u=n.searchSource??l;return(0,j.jsx)(ve,{label:a(`@astryx.tableFiltering.filterByColumn`,{header:t}),isLabelHidden:!0,searchSource:u,value:c.map(e=>({id:e,label:e})),onChange:t=>{let n=t.map(e=>e.id);o.getConfig().onFilterChange(e,n.length>0?n:null)},size:r,hasClear:i})}function O({columnKey:e,header:t,operatorValue:n,size:r,hasClear:i}){switch(n.type){case`string`:return(0,j.jsx)(Se,{columnKey:e,header:t,size:r,hasClear:i});case`integer`:case`float`:return(0,j.jsx)(Ce,{columnKey:e,header:t,operatorValue:n,size:r,hasClear:i});case`enum`:return(0,j.jsx)(we,{columnKey:e,header:t,operatorValue:n,size:r,hasClear:i});case`enum_list`:return(0,j.jsx)(Te,{columnKey:e,header:t,operatorValue:n,size:r,hasClear:i});case`date_absolute`:return(0,j.jsx)(Ee,{columnKey:e,header:t,size:r,hasClear:i});case`time`:return(0,j.jsx)(De,{columnKey:e,header:t,size:r,hasClear:i});case`string_list`:case`entity_list`:return(0,j.jsx)(Oe,{columnKey:e,header:t,operatorValue:n,size:r,hasClear:i});case`nested`:case`empty`:case`date_relative`:case`date_range`:case`custom`:return null}}function ke({columnKey:e,header:t,operatorValue:n}){let r=s(),i=D(),a=i.getConfig().filters[e],c=a!=null,[l,d]=(0,A.useState)(!1),[p,m]=(0,A.useState)(null),h=(0,A.useCallback)(e=>{e&&m(a??null),d(e)},[a]),g=(0,A.useCallback)(()=>{i.getConfig().onFilterChange(e,p),d(!1)},[i,e,p]),_=(0,A.useCallback)(()=>{i.getConfig().onFilterChange(e,null),d(!1)},[i,e]),v=(0,A.useMemo)(()=>({getConfig(){return{...i.getConfig(),filters:{...i.getConfig().filters,[e]:p??void 0},onFilterChange:(e,t)=>{m(t)}}}}),[i,e,p,m]);return(0,j.jsx)(f,{isOpen:l,onOpenChange:h,label:r(`@astryx.tableFiltering.filterByColumn`,{header:t}),placement:`below`,alignment:`start`,content:(0,j.jsx)(M,{value:v,children:(0,j.jsxs)(`div`,{className:`astryxafpxmx`,children:[(0,j.jsx)(O,{columnKey:e,header:t,operatorValue:n,size:`md`}),(0,j.jsxs)(`div`,{className:`astryx78zum5 astryx1txdalj astryxtbrsbv`,children:[(0,j.jsx)(o,{label:r(`@astryx.table.filter.reset`),variant:`ghost`,size:`sm`,onClick:_}),(0,j.jsx)(`div`,{className:`astryx98rzlu`}),(0,j.jsx)(o,{label:r(`@astryx.table.filter.apply`),variant:`primary`,size:`sm`,onClick:g})]})]})}),children:(0,j.jsx)(`button`,{type:`button`,"aria-label":r(`@astryx.tableFiltering.filterByColumn`,{header:t}),"aria-haspopup":`dialog`,...{0:{className:`astryx11g6tue astryx1gs6z28 astryx1ypdohk astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx1717udv astryxh6dtrn astryx2lah0s astryx1xrq5m astryx17aqpur astryx3onkmb astryxof6bs astryx25t5g8`},1:{className:`astryx11g6tue astryx1gs6z28 astryx1ypdohk astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx1717udv astryxh6dtrn astryx2lah0s astryx1xrq5m astryx17aqpur astryx1hc1fzr`}}[!!c<<0],children:(0,j.jsx)(u,{icon:`funnel`,size:`xsm`,color:c?`accent`:`secondary`})})})}function Ae(e){return typeof e.header==`string`?e.header:e.key}function je({columnKey:e,header:t,operatorValue:n}){return(0,j.jsx)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryx2lah0s`,children:(0,j.jsx)(ke,{columnKey:e,header:t,operatorValue:n})})}function Me({columnKey:e,header:t,operatorValue:r}){let i=(0,A.use)(N)===`inline-compact`?P.placeholderCompact:P.placeholder;return(0,j.jsx)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxzye2dw astryxcsaf9d astryxeuugli`,children:r==null?(0,j.jsx)(`div`,{"aria-hidden":`true`,...n(i)}):(0,j.jsx)(O,{columnKey:e,header:t,operatorValue:r,size:`sm`,hasClear:!0})})}function k(e){let t=(0,A.useRef)(e);t.current=e;let n=(0,A.useRef)(null);n.current??={getConfig(){return t.current}};let r=n.current,i=e.variant??`popover`;return(0,A.useMemo)(()=>({transformColumns:i===`inline`||i===`inline-compact`?e=>e.map(e=>e.filter!=null&&e.width==null?{...e,width:_(1)}:e):void 0,transformTableContext(e){return(0,j.jsx)(M,{value:r,children:(0,j.jsx)(N,{value:i,children:e})})},transformHeaderCell(e,t){let n=t.filter,a=Ae(t),o=n?be(n,r.getConfig().searchConfig):void 0;return i===`popover`?o?{...e,after:(0,j.jsxs)(j.Fragment,{children:[e.after,(0,j.jsx)(je,{columnKey:t.key,header:a,operatorValue:o})]})}:e:{...e,below:(0,j.jsxs)(j.Fragment,{children:[e.below,(0,j.jsx)(Me,{columnKey:t.key,header:a,operatorValue:o})]})}}}),[r,i])}var A,j,M,N,P;function Ne(){return(Ne=e((()=>{A=t(),r(),l(),a(),d(),p(),le(),re(),se(),h(),ae(),_e(),v(),c(),j=i(),M=(0,A.createContext)(null),M.displayName=`FilterStoreContext`,N=(0,A.createContext)(`popover`),N.displayName=`FilterVariantContext`,P={placeholder:{kZKoxP:`astryx10w6t97`,$$css:!0},placeholderCompact:{kZKoxP:`astryx1fgtraw`,$$css:!0}}})))()}function F(e){let[t,n]=(0,I.useState)(e??{});return{filters:t,onFilterChange:(0,I.useCallback)((e,t)=>{n(n=>{if(t==null){let{[e]:t,...r}=n;return r}return{...n,[e]:t}})},[]),clearAll:(0,I.useCallback)(()=>{n({})},[])}}var I;function L(){return(L=e((()=>{I=t()})))()}var R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,Pe;function Fe(){return(Fe=e((()=>{R=t(),ee(),Ne(),L(),de(),fe(),me(),he(),ge(),ye(),te(),z=i(),B=[{name:`Alice`,email:`alice@example.com`,role:`Engineer`,department:[`Platform`],level:5},{name:`Bob`,email:`bob@example.com`,role:`Designer`,department:[`Product`],level:4},{name:`Charlie`,email:`charlie@example.com`,role:`Manager`,department:[`Platform`],level:6},{name:`Diana`,email:`diana@example.com`,role:`Engineer`,department:[`Infrastructure`],level:5},{name:`Eve`,email:`eve@example.com`,role:`Admin`,department:[`Operations`],level:3}],V=[{key:`name`,type:`string`,label:`Name`},{key:`email`,type:`string`,label:`Email`},{key:`role`,type:`enum`,label:`Role`,enumValues:[{value:`Engineer`,label:`Engineer`},{value:`Designer`,label:`Designer`},{value:`Manager`,label:`Manager`},{value:`Admin`,label:`Admin`}]},{key:`department`,type:`enum_list`,label:`Department`,enumValues:[{value:`Platform`,label:`Platform`},{value:`Product`,label:`Product`},{value:`Infrastructure`,label:`Infrastructure`},{value:`Operations`,label:`Operations`}]},{key:`level`,type:`number`,label:`Level`}],H={title:`Core/TableFiltering`,tags:[`autodocs`]},U={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),i=[{key:`name`,header:`Name`,filter:`name`},{key:`email`,header:`Email`,filter:`email`},{key:`role`,header:`Role`},{key:`department`,header:`Department`}],a=k({filters:n,onFilterChange:r,searchConfig:e}),o=t(E(n,i,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Showing `,o.length,`/`,B.length,` rows.`]}),(0,z.jsx)(y,{data:o,columns:i,idKey:`name`,plugins:{filter:a}})]})}},W={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),i=[{key:`name`,header:`Name`},{key:`role`,header:`Role`,filter:`role`},{key:`department`,header:`Department`},{key:`level`,header:`Level`}],a=k({filters:n,onFilterChange:r,searchConfig:e}),o=t(E(n,i,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Enum → selector. Showing `,o.length,`/`,B.length,` rows.`]}),(0,z.jsx)(y,{data:o,columns:i,idKey:`name`,plugins:{filter:a}})]})}},G={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),i=[{key:`name`,header:`Name`},{key:`role`,header:`Role`},{key:`department`,header:`Department`,filter:`department`},{key:`level`,header:`Level`}],a=k({filters:n,onFilterChange:r,searchConfig:e}),o=t(E(n,i,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Enum list → multi-selector. Showing `,o.length,`/`,B.length,` `,`rows.`]}),(0,z.jsx)(y,{data:o,columns:i,idKey:`name`,plugins:{filter:a}})]})}},K={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),i=[{key:`name`,header:`Name`},{key:`role`,header:`Role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],a=k({filters:n,onFilterChange:r,searchConfig:e}),o=t(E(n,i,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Number field → numeric input. Showing `,o.length,`/`,B.length,` `,`rows.`]}),(0,z.jsx)(y,{data:o,columns:i,idKey:`name`,plugins:{filter:a}})]})}},q={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),i=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],a=k({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),o=t(E(n,i,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Inline variant. Showing `,o.length,`/`,B.length,` rows.`]}),(0,z.jsx)(y,{data:o,columns:i,idKey:`name`,plugins:{filter:a}})]})}},J={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),[i,a]=(0,R.useState)(new Set),o=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`department`,header:`Department`,filter:`department`},{key:`level`,header:`Level`}],s=k({filters:n,onFilterChange:r,searchConfig:e}),c=t(E(n,o,e),B),{selectionConfig:l}=ue({data:c,idKey:`name`,selectedKeys:i,setSelectedKeys:a}),u=x(l);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Filtering + Selection. Selected: `,i.size,` | Showing`,` `,c.length,`/`,B.length,` rows.`]}),(0,z.jsx)(y,{data:c,columns:o,idKey:`name`,plugins:{selection:u,filter:s}})]})}},Y={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),{sortedData:i,sort:a,sortConfig:o,applySort:s}=S({data:B}),c=[{key:`name`,header:`Name`,sortable:!0,filter:`name`},{key:`role`,header:`Role`,sortable:!0,filter:`role`},{key:`level`,header:`Level`,sortable:!0,filter:`level`},{key:`department`,header:`Department`}],l=k({filters:n,onFilterChange:r,searchConfig:e}),u=pe(o),d=s(t(E(n,c,e),B));return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Filtering + Sorting. Showing `,d.length,`/`,B.length,` rows.`]}),(0,z.jsx)(y,{data:d,columns:c,idKey:`name`,plugins:{sort:u,filter:l}})]})}},X={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),[i,a]=(0,R.useState)({}),o=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],s=k({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),c=C({columnWidths:i,onColumnResizeEnd:e=>a(t=>({...t,...e})),columns:o}),l=t(E(n,o,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Inline filtering + Resize. Showing `,l.length,`/`,B.length,` `,`rows.`]}),(0,z.jsx)(y,{data:l,columns:o,idKey:`name`,plugins:{filter:s,resize:c}})]})}},Z={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),{sortConfig:i,applySort:a}=S({data:B}),[o,s]=(0,R.useState)({}),[c,l]=(0,R.useState)(new Set),u=[{key:`name`,header:`Name`,sortable:!0,filter:`name`},{key:`role`,header:`Role`,sortable:!0,filter:`role`},{key:`level`,header:`Level`,sortable:!0,filter:`level`},{key:`department`,header:`Department`,sortable:!0}],d=k({filters:n,onFilterChange:r,searchConfig:e}),f=pe(i),p=C({columnWidths:o,onColumnResizeEnd:e=>s(t=>({...t,...e})),columns:u}),m=a(t(E(n,u,e),B)),{selectionConfig:h}=ue({data:m,idKey:`name`,selectedKeys:c,setSelectedKeys:l}),g=x(h);return(0,z.jsxs)(`div`,{style:{maxWidth:900},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`All plugins. Selected: `,c.size,` | Showing `,m.length,`/`,B.length,` rows.`]}),(0,z.jsx)(y,{data:m,columns:u,idKey:`name`,plugins:{selection:g,sort:f,filter:d,resize:p}})]})}},Q={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),i=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],a=k({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),o=t(E(n,i,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Inline variant with clear buttons. Type to filter, then click ✕ to clear. Showing `,o.length,`/`,B.length,` rows.`]}),(0,z.jsx)(y,{data:o,columns:i,idKey:`name`,plugins:{filter:a}})]})}},$={render:()=>{let{config:e,applyFilters:t}=w(V),{filters:n,onFilterChange:r}=F(),i=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],a=k({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),o=t(E(n,i,e),B);return(0,z.jsxs)(`div`,{style:{maxWidth:800},children:[(0,z.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Try filtering to get zero results; empty state appears.`}),(0,z.jsx)(y,{data:o,columns:i,idKey:`name`,plugins:{filter:a},emptyState:(0,z.jsx)(ne,{title:`No results`,description:`Try adjusting your filters to find what you're looking for.`,isCompact:!0})})]})}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      filter: 'name'
    }, {
      key: 'email',
      header: 'Email',
      filter: 'email'
    }, {
      key: 'role',
      header: 'Role'
    }, {
      key: 'department',
      header: 'Department'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Showing {data.length}/{employees.length} rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name'
    }, {
      key: 'role',
      header: 'Role',
      filter: 'role'
    }, {
      key: 'department',
      header: 'Department'
    }, {
      key: 'level',
      header: 'Level'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Enum → selector. Showing {data.length}/{employees.length} rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name'
    }, {
      key: 'role',
      header: 'Role'
    }, {
      key: 'department',
      header: 'Department',
      filter: 'department'
    }, {
      key: 'level',
      header: 'Level'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Enum list → multi-selector. Showing {data.length}/{employees.length}{' '}
          rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name'
    }, {
      key: 'role',
      header: 'Role'
    }, {
      key: 'level',
      header: 'Level',
      filter: 'level'
    }, {
      key: 'department',
      header: 'Department'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Number field → numeric input. Showing {data.length}/{employees.length}{' '}
          rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      filter: 'name'
    }, {
      key: 'role',
      header: 'Role',
      filter: 'role'
    }, {
      key: 'level',
      header: 'Level',
      filter: 'level'
    }, {
      key: 'department',
      header: 'Department'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Inline variant. Showing {data.length}/{employees.length} rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const [selectedKeys, setSelectedKeys] = useState(new Set<string>());
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      filter: 'name'
    }, {
      key: 'role',
      header: 'Role',
      filter: 'role'
    }, {
      key: 'department',
      header: 'Department',
      filter: 'department'
    }, {
      key: 'level',
      header: 'Level'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    const {
      selectionConfig
    } = useTableSelectionState({
      data,
      idKey: 'name',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<Employee>(selectionConfig);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Filtering + Selection. Selected: {selectedKeys.size} | Showing{' '}
          {data.length}/{employees.length} rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        selection: selectionPlugin,
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const {
      sortedData: _unused,
      sort: _sort,
      sortConfig,
      applySort
    } = useTableSortableState<Employee>({
      data: employees
    });
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      sortable: true,
      filter: 'name'
    }, {
      key: 'role',
      header: 'Role',
      sortable: true,
      filter: 'role'
    }, {
      key: 'level',
      header: 'Level',
      sortable: true,
      filter: 'level'
    }, {
      key: 'department',
      header: 'Department'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config
    });
    const sortPlugin = useTableSortable<Employee>(sortConfig);
    const filtered = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    const data = applySort(filtered);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Filtering + Sorting. Showing {data.length}/{employees.length} rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        sort: sortPlugin,
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      filter: 'name'
    }, {
      key: 'role',
      header: 'Role',
      filter: 'role'
    }, {
      key: 'level',
      header: 'Level',
      filter: 'level'
    }, {
      key: 'department',
      header: 'Department'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config
    });
    const resizePlugin = useTableColumnResize<Employee>({
      columnWidths,
      onColumnResizeEnd: updates => setColumnWidths(prev => ({
        ...prev,
        ...updates
      })),
      columns: columns as TableColumn<Record<string, unknown>>[]
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Inline filtering + Resize. Showing {data.length}/{employees.length}{' '}
          rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin,
        resize: resizePlugin
      }} />
      </div>;
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const {
      sortConfig,
      applySort
    } = useTableSortableState<Employee>({
      data: employees
    });
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [selectedKeys, setSelectedKeys] = useState(new Set<string>());
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      sortable: true,
      filter: 'name'
    }, {
      key: 'role',
      header: 'Role',
      sortable: true,
      filter: 'role'
    }, {
      key: 'level',
      header: 'Level',
      sortable: true,
      filter: 'level'
    }, {
      key: 'department',
      header: 'Department',
      sortable: true
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      searchConfig: config
    });
    const sortPlugin = useTableSortable<Employee>(sortConfig);
    const resizePlugin = useTableColumnResize<Employee>({
      columnWidths,
      onColumnResizeEnd: updates => setColumnWidths(prev => ({
        ...prev,
        ...updates
      })),
      columns: columns as TableColumn<Record<string, unknown>>[]
    });
    const filtered = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    const data = applySort(filtered);
    const {
      selectionConfig
    } = useTableSelectionState({
      data,
      idKey: 'name',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<Employee>(selectionConfig);
    return <div style={{
      maxWidth: 900
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          All plugins. Selected: {selectedKeys.size} | Showing {data.length}/
          {employees.length} rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        selection: selectionPlugin,
        sort: sortPlugin,
        filter: filterPlugin,
        resize: resizePlugin
      }} />
      </div>;
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      filter: 'name'
    }, {
      key: 'role',
      header: 'Role',
      filter: 'role'
    }, {
      key: 'level',
      header: 'Level',
      filter: 'level'
    }, {
      key: 'department',
      header: 'Department'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Inline variant with clear buttons. Type to filter, then click ✕ to
          clear. Showing {data.length}/{employees.length} rows.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin
      }} />
      </div>;
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs);
    const {
      filters,
      onFilterChange
    } = useTableFilterState();
    const columns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      filter: 'name'
    }, {
      key: 'role',
      header: 'Role',
      filter: 'role'
    }, {
      key: 'level',
      header: 'Level',
      filter: 'level'
    }, {
      key: 'department',
      header: 'Department'
    }];
    const filterPlugin = useTableFiltering<Employee>({
      filters,
      onFilterChange,
      variant: 'inline',
      searchConfig: config
    });
    const data = applyFilters(toSearchFilters(filters, columns, config) as PowerSearchFilter[], employees);
    return <div style={{
      maxWidth: 800
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Try filtering to get zero results; empty state appears.
        </p>
        <Table data={data} columns={columns} idKey="name" plugins={{
        filter: filterPlugin
      }} emptyState={<EmptyStateComponent title="No results" description="Try adjusting your filters to find what you're looking for." isCompact />} />
      </div>;
  }
}`,...$.parameters?.docs?.source}}},Pe=[`TextFilter`,`SelectorFilter`,`MultiSelectorFilter`,`NumberFilter`,`InlineVariant`,`WithSelection`,`WithSorting`,`WithResize`,`WithAllPlugins`,`InlineWithClear`,`EmptyState`]})))()}Fe();export{$ as EmptyState,q as InlineVariant,Q as InlineWithClear,G as MultiSelectorFilter,K as NumberFilter,W as SelectorFilter,U as TextFilter,Z as WithAllPlugins,X as WithResize,J as WithSelection,Y as WithSorting,Pe as __namedExportsOrder,H as default};