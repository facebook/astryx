import{ah as d,a1 as l,af as ee,I as te,B as I}from"./iframe-Cw8JXX6x.js";import{f as re,T as g}from"./Table-Beogfujq.js";import{u as h}from"./usePowerSearchConfig-D2jz8ytp.js";import{E as le}from"./EmptyState-DYORGikM.js";import{P as ne}from"./Popover-DjPywt4F.js";import{T as oe}from"./TextInput-C1NdaOB7.js";import{N as $}from"./NumberInput-BvuCcn_x.js";import{D as se}from"./DateInput-Bmro_8k9.js";import{T as ie}from"./TimeInput-DUvNN_5q.js";import{S as M}from"./Selector-DGCTT5i3.js";import{M as ae}from"./MultiSelector-Dpb4r1q3.js";import{T as ce}from"./Tokenizer-DS9Qs-mJ.js";import{a as O,u as V}from"./useTableSortableState-CgQoLOZ-.js";import{u as q}from"./useTableColumnResize-CM2Ox5Y2.js";import{a as Z,u as G}from"./useTableSelectionState-BNPUgjaJ.js";import"./preload-helper-Ct5FWWRu.js";import"./ContextMenu-Cje6WKDr.js";import"./renderDropdownItems-Dejv9C11.js";import"./Divider-CXkzIgPQ.js";import"./Item-CXatCzfh.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-D1vlaBt6.js";import"./useTypeahead-B3b6_BOq.js";import"./usePopover-DBfyiMp1.js";import"./useFocusTrap-RYvdVaLT.js";import"./useInteractiveRole-GZ6CKFNP.js";import"./Field-DzUQIr9Z.js";import"./FieldStatus-C1k4mIkj.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./groupStyles-qg_3pR9p.js";import"./useInputContainer-CkOhfW92.js";import"./VisuallyHidden-DBBtUghY.js";import"./Calendar-CBZD9AfF.js";import"./plainDate-C-ANv9VG.js";import"./dateParser-XTIqkafj.js";import"./timeParser-CAi7zy_b.js";import"./utils-_uNaBhDK.js";import"./hooks-DEeqkSCs.js";import"./CheckboxInput-7ijgnJ1p.js";import"./Badge-CxIcCzHK.js";import"./BaseTypeahead-Bv_NsY66.js";import"./TypeaheadItem-5ZZXeH4z.js";import"./getKey-DyRdrWhf.js";import"./InputClearButton-C7Jnsij0.js";import"./Token-DSaeuArz.js";import"./OverflowList-DvS70mY7.js";function J(e,n){return n?e.operators.find(t=>t.key===n):e.defaultOperator?e.operators.find(t=>t.key===e.defaultOperator):e.operators[0]}function me(e,n){const t=typeof e=="string"?e:e.field,o=typeof e=="string"?void 0:e.operator,r=n.fields.find(i=>i.key===t);if(!r)return;const s=J(r,o);if(s)return s.value}function y(e,n,t){const o=[];for(const r of n){if(!r.filter)continue;const s=e[r.key];if(s==null)continue;const i=typeof r.filter=="string"?r.filter:r.filter.field,u=typeof r.filter=="string"?void 0:r.filter.operator,c=t.fields.find(p=>p.key===i);if(!c)continue;const a=J(c,u);if(!a)continue;const m=ue(s,a.value);m&&o.push({field:i,operator:a.key,value:m})}return o}function ue(e,n){switch(n.type){case"string":return typeof e=="string"?{type:"string",value:e}:void 0;case"integer":return typeof e=="number"?{type:"integer",value:e}:void 0;case"float":return typeof e=="number"?{type:"float",value:e}:void 0;case"enum":return typeof e=="string"?{type:"enum",value:e}:void 0;case"enum_list":return Array.isArray(e)?{type:"enum_list",value:e}:void 0;case"date_absolute":return typeof e=="string"?{type:"date_absolute",unixSeconds:Math.floor(new Date(e).getTime()/1e3)}:void 0;case"time":return typeof e=="string"?{type:"time",value:e}:void 0;case"string_list":return Array.isArray(e)?{type:"string_list",value:e}:void 0;case"entity_list":return Array.isArray(e)?{type:"entity_list",value:e.map(t=>({id:t,label:t}))}:void 0;case"nested":case"empty":case"date_relative":case"date_range":case"custom":return}}const N=d.createContext(null);N.displayName="FilterStoreContext";function F(){const e=d.use(N);if(!e)throw new Error("useFilterStore must be used within a Table with filtering");return e}const _=d.createContext("popover");_.displayName="FilterVariantContext";const H={placeholder:{kZKoxP:"astryx10w6t97",$$css:!0},placeholderCompact:{kZKoxP:"astryx1fgtraw",$$css:!0}};function de({columnKey:e,header:n,size:t,hasClear:o}){const r=F(),i=r.getConfig().filters[e],u=typeof i=="string"?i:"";return l.jsx(oe,{label:`Filter ${n}`,isLabelHidden:!0,value:u,onChange:c=>{r.getConfig().onFilterChange(e,c===""?null:c)},placeholder:`Filter ${n}`,size:t,hasClear:o})}function fe({columnKey:e,header:n,operatorValue:t,size:o,hasClear:r}){const s=F(),u=s.getConfig().filters[e],c=typeof u=="number"?u:null,a=t.type==="integer"?1:null,m=d.useCallback(p=>{s.getConfig().onFilterChange(e,p)},[s,e]);return r?l.jsx($,{label:`Filter ${n}`,isLabelHidden:!0,value:c,onChange:m,placeholder:`Filter ${n}`,min:t.minValue??null,max:t.maxValue??null,step:a,size:o,hasClear:!0}):l.jsx($,{label:`Filter ${n}`,isLabelHidden:!0,value:c,onChange:m,placeholder:`Filter ${n}`,min:t.minValue??null,max:t.maxValue??null,step:a,size:o})}function pe({columnKey:e,header:n,operatorValue:t,size:o,hasClear:r}){const s=F(),u=s.getConfig().filters[e],c=typeof u=="string"?u:"",a=t.values.map(p=>({value:p.value,label:p.label})),m=d.useCallback(p=>{s.getConfig().onFilterChange(e,p===""||p==null?null:p)},[s,e]);return r?l.jsx(M,{label:`Filter ${n}`,isLabelHidden:!0,options:a,value:c||null,onChange:m,placeholder:"All",size:o,hasClear:!0}):l.jsx(M,{label:`Filter ${n}`,isLabelHidden:!0,options:a,value:c,onChange:m,placeholder:"All",size:o})}function ge({columnKey:e,header:n,operatorValue:t,size:o,hasClear:r}){const s=F(),u=s.getConfig().filters[e],c=Array.isArray(u)?u:[],a=t.values.map(m=>({value:m.value,label:m.label}));return l.jsx(ae,{label:`Filter ${n}`,isLabelHidden:!0,options:a,value:c,onChange:m=>{s.getConfig().onFilterChange(e,m.length===0?null:m)},placeholder:"All",size:o,hasSelectAll:!0,hasSearch:!1,hasClear:r})}function he({columnKey:e,header:n,size:t,hasClear:o}){const r=F(),s=r.getConfig().filters[e];return l.jsx(se,{label:`Filter ${n}`,isLabelHidden:!0,value:s??void 0,onChange:i=>{r.getConfig().onFilterChange(e,i??null)},size:t,hasClear:o})}function ye({columnKey:e,header:n,size:t,hasClear:o}){const r=F(),s=r.getConfig().filters[e];return l.jsx(ie,{label:`Filter ${n}`,isLabelHidden:!0,value:s??void 0,onChange:i=>{r.getConfig().onFilterChange(e,i??null)},size:t,hasClear:o})}function Se({columnKey:e,header:n,operatorValue:t,size:o,hasClear:r}){const s=F(),i=s.getConfig().filters[e]??[],u=d.useMemo(()=>({search:async a=>a.trim()?[{id:a.trim(),label:a.trim()}]:[],bootstrap:()=>[]}),[]),c=t.searchSource??u;return l.jsx(ce,{label:`Filter ${n}`,isLabelHidden:!0,searchSource:c,value:i.map(a=>({id:a,label:a})),onChange:a=>{const m=a.map(p=>p.id);s.getConfig().onFilterChange(e,m.length>0?m:null)},size:o,hasClear:r})}function Q({columnKey:e,header:n,operatorValue:t,size:o,hasClear:r}){switch(t.type){case"string":return l.jsx(de,{columnKey:e,header:n,size:o,hasClear:r});case"integer":case"float":return l.jsx(fe,{columnKey:e,header:n,operatorValue:t,size:o,hasClear:r});case"enum":return l.jsx(pe,{columnKey:e,header:n,operatorValue:t,size:o,hasClear:r});case"enum_list":return l.jsx(ge,{columnKey:e,header:n,operatorValue:t,size:o,hasClear:r});case"date_absolute":return l.jsx(he,{columnKey:e,header:n,size:o,hasClear:r});case"time":return l.jsx(ye,{columnKey:e,header:n,size:o,hasClear:r});case"string_list":case"entity_list":return l.jsx(Se,{columnKey:e,header:n,operatorValue:t,size:o,hasClear:r});case"nested":case"empty":case"date_relative":case"date_range":case"custom":return null}}function Ce({columnKey:e,header:n,operatorValue:t}){const o=F(),s=o.getConfig().filters[e],i=s!=null,[u,c]=d.useState(!1),[a,m]=d.useState(null),p=d.useCallback(b=>{b&&m(s??null),c(b)},[s]),L=d.useCallback(()=>{o.getConfig().onFilterChange(e,a),c(!1)},[o,e,a]),B=d.useCallback(()=>{o.getConfig().onFilterChange(e,null),c(!1)},[o,e]),K=d.useMemo(()=>({getConfig(){return{...o.getConfig(),filters:{...o.getConfig().filters,[e]:a??void 0},onFilterChange:(b,A)=>{m(A)}}}}),[o,e,a,m]);return l.jsx(ne,{isOpen:u,onOpenChange:p,label:`Filter ${n}`,placement:"below",alignment:"start",content:l.jsx(N,{value:K,children:l.jsxs("div",{className:"astryxafpxmx",children:[l.jsx(Q,{columnKey:e,header:n,operatorValue:t,size:"md"}),l.jsxs("div",{className:"astryx78zum5 astryx1txdalj astryxtbrsbv",children:[l.jsx(I,{label:"Reset",variant:"ghost",size:"sm",onClick:B}),l.jsx("div",{className:"astryx98rzlu"}),l.jsx(I,{label:"Apply",variant:"primary",size:"sm",onClick:L})]})]})}),children:l.jsx("button",{type:"button","aria-label":`Filter ${n}`,"aria-haspopup":"dialog",...{0:{className:"astryx11g6tue astryx1gs6z28 astryx1ypdohk astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx1717udv astryxh6dtrn astryx2lah0s astryx1xrq5m astryx17aqpur astryx3onkmb astryxof6bs astryx25t5g8"},1:{className:"astryx11g6tue astryx1gs6z28 astryx1ypdohk astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx1717udv astryxh6dtrn astryx2lah0s astryx1xrq5m astryx17aqpur astryx1hc1fzr"}}[!!i<<0],children:l.jsx(te,{icon:"funnel",size:"xsm",color:i?"accent":"secondary"})})})}function ve(e){return typeof e.header=="string"?e.header:e.key}function Fe({columnKey:e,header:n,operatorValue:t}){return l.jsx("div",{className:"astryx78zum5 astryx6s0dn4 astryx2lah0s",children:l.jsx(Ce,{columnKey:e,header:n,operatorValue:t})})}function be({columnKey:e,header:n,operatorValue:t}){const o=d.use(_),r="sm",s=o==="inline-compact"?H.placeholderCompact:H.placeholder;return l.jsx("div",{className:"astryx78zum5 astryxdt5ytf astryxzye2dw astryxcsaf9d astryxeuugli",children:t!=null?l.jsx(Q,{columnKey:e,header:n,operatorValue:t,size:r,hasClear:!0}):l.jsx("div",{"aria-hidden":"true",...ee(s)})})}function S(e){const n=d.useRef(e);n.current=e;const t=d.useRef(null);t.current==null&&(t.current={getConfig(){return n.current}});const o=t.current,r=e.variant??"popover";return d.useMemo(()=>({transformColumns:r==="inline"||r==="inline-compact"?s=>s.map(i=>i.filter!=null&&i.width==null?{...i,width:re(1)}:i):void 0,transformTableContext(s){return l.jsx(N,{value:o,children:l.jsx(_,{value:r,children:s})})},transformHeaderCell(s,i){const u=i.filter,c=ve(i),a=u?me(u,o.getConfig().searchConfig):void 0;return r==="popover"?a?{...s,after:l.jsxs(l.Fragment,{children:[s.after,l.jsx(Fe,{columnKey:i.key,header:c,operatorValue:a})]})}:s:{...s,below:l.jsxs(l.Fragment,{children:[s.below,l.jsx(be,{columnKey:i.key,header:c,operatorValue:a})]})}}}),[o,r])}function C(e){const[n,t]=d.useState({}),o=d.useCallback((s,i)=>{t(u=>{if(i==null){const{[s]:c,...a}=u;return a}return{...u,[s]:i}})},[]),r=d.useCallback(()=>{t({})},[]);return{filters:n,onFilterChange:o,clearAll:r}}const f=[{name:"Alice",email:"alice@example.com",role:"Engineer",department:["Platform"],level:5},{name:"Bob",email:"bob@example.com",role:"Designer",department:["Product"],level:4},{name:"Charlie",email:"charlie@example.com",role:"Manager",department:["Platform"],level:6},{name:"Diana",email:"diana@example.com",role:"Engineer",department:["Infrastructure"],level:5},{name:"Eve",email:"eve@example.com",role:"Admin",department:["Operations"],level:3}],v=[{key:"name",type:"string",label:"Name"},{key:"email",type:"string",label:"Email"},{key:"role",type:"enum",label:"Role",enumValues:[{value:"Engineer",label:"Engineer"},{value:"Designer",label:"Designer"},{value:"Manager",label:"Manager"},{value:"Admin",label:"Admin"}]},{key:"department",type:"enum_list",label:"Department",enumValues:[{value:"Platform",label:"Platform"},{value:"Product",label:"Product"},{value:"Infrastructure",label:"Infrastructure"},{value:"Operations",label:"Operations"}]},{key:"level",type:"number",label:"Level"}],gt={title:"Core/TableFiltering",tags:["autodocs"]},x={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),r=[{key:"name",header:"Name",filter:"name"},{key:"email",header:"Email",filter:"email"},{key:"role",header:"Role"},{key:"department",header:"Department"}],s=S({filters:t,onFilterChange:o,searchConfig:e}),i=n(y(t,r,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Showing ",i.length,"/",f.length," rows."]}),l.jsx(g,{data:i,columns:r,idKey:"name",plugins:{filter:s}})]})}},k={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),r=[{key:"name",header:"Name"},{key:"role",header:"Role",filter:"role"},{key:"department",header:"Department"},{key:"level",header:"Level"}],s=S({filters:t,onFilterChange:o,searchConfig:e}),i=n(y(t,r,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Enum → selector. Showing ",i.length,"/",f.length," rows."]}),l.jsx(g,{data:i,columns:r,idKey:"name",plugins:{filter:s}})]})}},P={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),r=[{key:"name",header:"Name"},{key:"role",header:"Role"},{key:"department",header:"Department",filter:"department"},{key:"level",header:"Level"}],s=S({filters:t,onFilterChange:o,searchConfig:e}),i=n(y(t,r,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Enum list → multi-selector. Showing ",i.length,"/",f.length," ","rows."]}),l.jsx(g,{data:i,columns:r,idKey:"name",plugins:{filter:s}})]})}},T={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),r=[{key:"name",header:"Name"},{key:"role",header:"Role"},{key:"level",header:"Level",filter:"level"},{key:"department",header:"Department"}],s=S({filters:t,onFilterChange:o,searchConfig:e}),i=n(y(t,r,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Number field → numeric input. Showing ",i.length,"/",f.length," ","rows."]}),l.jsx(g,{data:i,columns:r,idKey:"name",plugins:{filter:s}})]})}},w={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),r=[{key:"name",header:"Name",filter:"name"},{key:"role",header:"Role",filter:"role"},{key:"level",header:"Level",filter:"level"},{key:"department",header:"Department"}],s=S({filters:t,onFilterChange:o,variant:"inline",searchConfig:e}),i=n(y(t,r,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Inline variant. Showing ",i.length,"/",f.length," rows."]}),l.jsx(g,{data:i,columns:r,idKey:"name",plugins:{filter:s}})]})}},j={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),[r,s]=d.useState(new Set),i=[{key:"name",header:"Name",filter:"name"},{key:"role",header:"Role",filter:"role"},{key:"department",header:"Department",filter:"department"},{key:"level",header:"Level"}],u=S({filters:t,onFilterChange:o,searchConfig:e}),c=n(y(t,i,e),f),{selectionConfig:a}=Z({data:c,idKey:"name",selectedKeys:r,setSelectedKeys:s}),m=G(a);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Filtering + Selection. Selected: ",r.size," | Showing"," ",c.length,"/",f.length," rows."]}),l.jsx(g,{data:c,columns:i,idKey:"name",plugins:{selection:m,filter:u}})]})}},z={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),{sortConfig:r,applySort:s}=O({data:f}),i=[{key:"name",header:"Name",sortable:!0,filter:"name"},{key:"role",header:"Role",sortable:!0,filter:"role"},{key:"level",header:"Level",sortable:!0,filter:"level"},{key:"department",header:"Department"}],u=S({filters:t,onFilterChange:o,searchConfig:e}),c=V(r),a=n(y(t,i,e),f),m=s(a);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Filtering + Sorting. Showing ",m.length,"/",f.length," rows."]}),l.jsx(g,{data:m,columns:i,idKey:"name",plugins:{sort:c,filter:u}})]})}},E={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),[r,s]=d.useState({}),i=[{key:"name",header:"Name",filter:"name"},{key:"role",header:"Role",filter:"role"},{key:"level",header:"Level",filter:"level"},{key:"department",header:"Department"}],u=S({filters:t,onFilterChange:o,variant:"inline",searchConfig:e}),c=q({columnWidths:r,onColumnResizeEnd:m=>s(p=>({...p,...m})),columns:i}),a=n(y(t,i,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Inline filtering + Resize. Showing ",a.length,"/",f.length," ","rows."]}),l.jsx(g,{data:a,columns:i,idKey:"name",plugins:{filter:u,resize:c}})]})}},D={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),{sortConfig:r,applySort:s}=O({data:f}),[i,u]=d.useState({}),[c,a]=d.useState(new Set),m=[{key:"name",header:"Name",sortable:!0,filter:"name"},{key:"role",header:"Role",sortable:!0,filter:"role"},{key:"level",header:"Level",sortable:!0,filter:"level"},{key:"department",header:"Department",sortable:!0}],p=S({filters:t,onFilterChange:o,searchConfig:e}),L=V(r),B=q({columnWidths:i,onColumnResizeEnd:X=>u(Y=>({...Y,...X})),columns:m}),K=n(y(t,m,e),f),b=s(K),{selectionConfig:A}=Z({data:b,idKey:"name",selectedKeys:c,setSelectedKeys:a}),U=G(A);return l.jsxs("div",{style:{maxWidth:900},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["All plugins. Selected: ",c.size," | Showing ",b.length,"/",f.length," rows."]}),l.jsx(g,{data:b,columns:m,idKey:"name",plugins:{selection:U,sort:L,filter:p,resize:B}})]})}},R={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),r=[{key:"name",header:"Name",filter:"name"},{key:"role",header:"Role",filter:"role"},{key:"level",header:"Level",filter:"level"},{key:"department",header:"Department"}],s=S({filters:t,onFilterChange:o,variant:"inline",searchConfig:e}),i=n(y(t,r,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Inline variant with clear buttons. Type to filter, then click ✕ to clear. Showing ",i.length,"/",f.length," rows."]}),l.jsx(g,{data:i,columns:r,idKey:"name",plugins:{filter:s}})]})}},W={render:()=>{const{config:e,applyFilters:n}=h(v),{filters:t,onFilterChange:o}=C(),r=[{key:"name",header:"Name",filter:"name"},{key:"role",header:"Role",filter:"role"},{key:"level",header:"Level",filter:"level"},{key:"department",header:"Department"}],s=S({filters:t,onFilterChange:o,variant:"inline",searchConfig:e}),i=n(y(t,r,e),f);return l.jsxs("div",{style:{maxWidth:800},children:[l.jsx("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:"Try filtering to get zero results; empty state appears."}),l.jsx(g,{data:i,columns:r,idKey:"name",plugins:{filter:s},emptyState:l.jsx(le,{title:"No results",description:"Try adjusting your filters to find what you're looking for.",isCompact:!0})})]})}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}};const ht=["TextFilter","SelectorFilter","MultiSelectorFilter","NumberFilter","InlineVariant","WithSelection","WithSorting","WithResize","WithAllPlugins","InlineWithClear","EmptyState"];export{W as EmptyState,w as InlineVariant,R as InlineWithClear,P as MultiSelectorFilter,T as NumberFilter,k as SelectorFilter,x as TextFilter,D as WithAllPlugins,E as WithResize,j as WithSelection,z as WithSorting,ht as __namedExportsOrder,gt as default};
