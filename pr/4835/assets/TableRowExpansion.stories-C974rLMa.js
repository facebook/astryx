import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i,t as a}from"./rtlStyles-Dba7YIbF.js";import{t as o}from"./jsx-runtime-DeHZSEgm.js";import{n as s,t as c}from"./useTranslator-BMnme3me.js";import{n as l,t as u}from"./Icon-C24cO4CC.js";import{a as d,i as f,r as p}from"./columnUtils-BDDG7zo5.js";import{d as m,f as h,n as g,t as _}from"./Table-ClbWztQk.js";function v({baseData:e,getChildren:t,getRowKey:n,getIsItemExpandable:r,expandedKeys:i,setExpandedKeys:a}){let o=(0,x.useCallback)(e=>r?r(e):t(e).length>0,[r,t]),s=(0,x.useMemo)(()=>{let r=new Map,a=new Set;function o(e,s){for(let c of e){let e=n(c);a.has(e)||(r.set(e,s),i.has(e)&&(a.add(e),o(t(c),s+1),a.delete(e)))}}return o(e,0),r},[e,t,n,i]),c=(0,x.useMemo)(()=>{let r=[],a=new Set;function o(e){for(let s of e){let e=n(s);a.has(e)||(r.push(s),i.has(e)&&(a.add(e),o(t(s)),a.delete(e)))}}return o(e),r},[e,t,n,i]),l=(0,x.useMemo)(()=>{let r=[],i=new Set;function a(e){for(let s of e){let e=n(s);i.has(e)||o(s)&&(r.push(e),i.add(e),a(t(s)),i.delete(e))}}return a(e),r},[e,t,n,o]),u=(0,x.useCallback)(e=>s.get(n(e))??0,[s,n]),d=(0,x.useCallback)(e=>{a(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[a]),f=(0,x.useMemo)(()=>{if(l.length===0)return!1;let e=l.filter(e=>i.has(e)).length;return e===0?!1:e===l.length||`indeterminate`},[l,i]),p=(0,x.useCallback)(e=>{a(e?new Set(l):new Set)},[a,l]);return{data:c,expansionConfig:(0,x.useMemo)(()=>({expandedKeys:i,onToggle:d,getRowKey:n,getChildren:t,getDepth:u,getIsItemExpandable:r,isAllExpanded:f,onToggleExpandAll:p}),[i,d,n,t,u,r,f,p])}}function y({isExpanded:e,onToggle:t,ariaLabel:r}){return(0,S.jsx)(`button`,{type:`button`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryxvy4d1p astryxxk0z11 astryx1md70p1 astryx1gs6z28 astryxx3sua9 astryx1ypdohk astryxv9yike astryxefglzl astryxx6bhzk astryx1717udv astryx2lah0s astryx1ilzqfv astryx1cqbx0l`,onClick:e=>{e.stopPropagation(),t()},"aria-label":r,"aria-expanded":e,children:(0,S.jsx)(`span`,{...n(i.mirror),children:(0,S.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk`},1:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk astryx1iffjtl`}}[!!e<<0],children:(0,S.jsx)(u,{icon:`chevronRight`,size:`xsm`})})})})}function b(e){let t=s(),{expandedKeys:r,onToggle:a,getRowKey:o,getChildren:c,getDepth:l,getIsItemExpandable:d,hasRowClickExpansion:f=!1,isAllExpanded:p,onToggleExpandAll:m}=e,g=(0,x.useRef)(null),_=(0,x.useMemo)(()=>({key:`__expansion`,header:``,width:C,resizable:!1,renderCell:e=>{if((l?l(e):0)>0)return null;let n=o(e);if(!(d?d(e):c(e).length>0))return null;let i=r.has(n);return(0,S.jsx)(y,{isExpanded:i,onToggle:()=>a(n),ariaLabel:t(i?`@astryx.tableRowExpansion.collapseRow`:`@astryx.tableRowExpansion.expandRow`)})}}),[r,a,o,c,d,l,t]);return(0,x.useMemo)(()=>({transformColumns(e){let i=e.find(e=>!e.key.startsWith(`__`));g.current=i?.key??null;let s=e.map(e=>{if(e.key!==g.current)return e;let i=e.renderCell;return{...e,renderCell:s=>{let u=l?l(s):0,f=i?i(s):String(s[e.key]??``);if(u===0)return f;let p=(u-1)*w,m=o(s),h=r.has(m),g=(d?d(s):c(s).length>0)?(0,S.jsx)(y,{isExpanded:h,onToggle:()=>a(m),ariaLabel:t(h?`@astryx.tableRowExpansion.collapseRow`:`@astryx.tableRowExpansion.expandRow`)}):(0,S.jsx)(`span`,{className:`astryx1rg5ohu astryxvy4d1p astryxxk0z11 astryx2lah0s`});return(0,S.jsxs)(`div`,{...n(E.indentedCell,p>0&&E.indent(p)),children:[g,f]})}}});return[_,...s]},transformHeaderCell(e,r){if(r.key!==`__expansion`)return e;if(p!==void 0&&m){let r=p===!0;return{...e,content:(0,S.jsx)(`button`,{type:`button`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryxvy4d1p astryxxk0z11 astryx1md70p1 astryx1gs6z28 astryxx3sua9 astryx1ypdohk astryxv9yike astryxefglzl astryxx6bhzk astryx1717udv astryx2lah0s astryx1ilzqfv astryx1cqbx0l`,onClick:()=>m(!r),"aria-label":t(r?`@astryx.tableRowExpansion.collapseAllRows`:`@astryx.tableRowExpansion.expandAllRows`),children:(0,S.jsx)(`span`,{...n(i.mirror),children:(0,S.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk`},1:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk astryx1iffjtl`}}[!!r<<0],children:(0,S.jsx)(u,{icon:`chevronRight`,size:`xsm`})})})})}}return{...e,content:null}},transformBodyCell(e,n,s){if(!(d?d(s):c(s).length>0))return e;let l=o(s),f=r.has(l);return{...e,contextMenuActions:()=>[...h(e.contextMenuActions),{id:`row-expansion-toggle`,group:`row-expansion`,label:t(f?`@astryx.tableRowExpansion.collapseRow`:`@astryx.tableRowExpansion.expandRow`),icon:(0,S.jsx)(u,{icon:f?`chevronDown`:`chevronRight`,size:`xsm`,"aria-hidden":!0,xstyle:i.mirror}),onSelect:()=>a(l)}]}},transformBodyRow(e,t){if(!f||!(d?d(t):c(t).length>0))return e;let n=o(t);return{...e,htmlProps:{...e.htmlProps,onClick:()=>a(n)},xstyle:[...e.xstyle,E.clickableRow]}}}),[r,o,a,c,l,d,f,p,m,_,t])}var x,S,C,w,T,E;function D(){return(D=e((()=>{x=t(),r(),l(),a(),m(),c(),S=o(),C={type:`pixel`,value:40},w=24,T={kZCmMZ:`astryxnvo3vl`,kE3dHu:``,kpe85a:``,$$css:!0},E={indentedCell:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,$$css:!0},indent:e=>[T,{"--x-paddingInlineStart":(e=>typeof e==`number`?e+`px`:e??void 0)(`${e}px`)}],clickableRow:{kkrTdU:`astryx1ypdohk`,$$css:!0}}})))()}var O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{O=t(),g(),D(),p(),k=o(),A=[{id:`src`,name:`src`,type:`folder`,size:`—`,modified:`2026-06-20`,children:[{id:`src/components`,name:`components`,type:`folder`,size:`—`,modified:`2026-06-19`,children:[{id:`src/components/Button.tsx`,name:`Button.tsx`,type:`file`,size:`4.2 KB`,modified:`2026-06-18`,children:[]},{id:`src/components/Table.tsx`,name:`Table.tsx`,type:`file`,size:`12.8 KB`,modified:`2026-06-20`,children:[]},{id:`src/components/Dialog.tsx`,name:`Dialog.tsx`,type:`file`,size:`6.1 KB`,modified:`2026-06-15`,children:[]}]},{id:`src/utils`,name:`utils`,type:`folder`,size:`—`,modified:`2026-06-17`,children:[{id:`src/utils/format.ts`,name:`format.ts`,type:`file`,size:`1.3 KB`,modified:`2026-06-17`,children:[]},{id:`src/utils/merge.ts`,name:`merge.ts`,type:`file`,size:`0.8 KB`,modified:`2026-06-10`,children:[]}]},{id:`src/index.ts`,name:`index.ts`,type:`file`,size:`0.4 KB`,modified:`2026-06-20`,children:[]}]},{id:`public`,name:`public`,type:`folder`,size:`—`,modified:`2026-06-01`,children:[{id:`public/favicon.ico`,name:`favicon.ico`,type:`file`,size:`15 KB`,modified:`2026-05-20`,children:[]}]},{id:`package.json`,name:`package.json`,type:`file`,size:`1.8 KB`,modified:`2026-06-22`,children:[]},{id:`tsconfig.json`,name:`tsconfig.json`,type:`file`,size:`0.6 KB`,modified:`2026-06-01`,children:[]}],j=[{key:`name`,header:`Name`,width:d(2)},{key:`type`,header:`Type`,width:f(80)},{key:`size`,header:`Size`,width:f(90)},{key:`modified`,header:`Modified`,width:f(120)}],M={title:`Core/TableRowExpansion`,tags:[`autodocs`]},N={render:()=>{let[e,t]=(0,O.useState)(new Set([`src`])),{data:n,expansionConfig:r}=v({baseData:A,getChildren:e=>e.children??[],getRowKey:e=>e.id,expandedKeys:e,setExpandedKeys:t}),i=b(r);return(0,k.jsx)(_,{data:n,columns:j,idKey:`id`,hasHover:!0,plugins:{expansion:i}})}},P={render:()=>{let[e,t]=(0,O.useState)(new Set([`src`,`src/components`])),{data:n,expansionConfig:r}=v({baseData:A,getChildren:e=>e.children??[],getRowKey:e=>e.id,getIsItemExpandable:e=>e.type===`folder`,expandedKeys:e,setExpandedKeys:t}),i=b(r);return(0,k.jsx)(_,{data:n,columns:j,idKey:`id`,hasHover:!0,plugins:{expansion:i}})}},F={render:()=>{let[e,t]=(0,O.useState)(new Set),{data:n,expansionConfig:r}=v({baseData:A,getChildren:e=>e.children??[],getRowKey:e=>e.id,expandedKeys:e,setExpandedKeys:t}),i=b({...r,hasRowClickExpansion:!0});return(0,k.jsx)(_,{data:n,columns:j,idKey:`id`,hasHover:!0,plugins:{expansion:i}})}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['src']));

    // The state hook flattens the tree, tracks depth, and derives the
    // expand/collapse + expand-all handlers — no boilerplate in the consumer.
    const {
      data,
      expansionConfig
    } = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      expandedKeys,
      setExpandedKeys
    });
    const expansion = useTableRowExpansion(expansionConfig);
    return <Table data={data} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,...N.parameters?.docs?.source},description:{story:`A file tree rendered as a table with expandable folder rows. Child rows
inherit the parent's columns and are indented based on depth. Click the
chevron (or right-click → "Expand/Collapse row") to expand a folder.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['src', 'src/components']));

    // \`getIsItemExpandable\` restricts expandability (and expand-all) to folders.
    const {
      data,
      expansionConfig
    } = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      getIsItemExpandable: item => item.type === 'folder',
      expandedKeys,
      setExpandedKeys
    });
    const expansion = useTableRowExpansion(expansionConfig);
    return <Table data={data} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,...P.parameters?.docs?.source},description:{story:`Only folders are expandable (files have no children). The chevron and
context-menu action are hidden for leaf nodes.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const {
      data,
      expansionConfig
    } = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      expandedKeys,
      setExpandedKeys
    });

    // Opt into row-click expansion by extending the derived config.
    const expansion = useTableRowExpansion({
      ...expansionConfig,
      hasRowClickExpansion: true
    });
    return <Table data={data} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,...F.parameters?.docs?.source},description:{story:"`hasRowClickExpansion: true` — clicking anywhere on the row toggles expansion\n(in addition to the chevron). The row shows a pointer cursor.",...F.parameters?.docs?.description}}},I=[`InheritedColumns`,`LeafNodesNotExpandable`,`ExpandOnRowClick`]})))()}L();export{F as ExpandOnRowClick,N as InheritedColumns,P as LeafNodesNotExpandable,I as __namedExportsOrder,M as default};