import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i,t as a}from"./rtlStyles-Dba7YIbF.js";import{t as o}from"./jsx-runtime-DeHZSEgm.js";import{n as s,t as c}from"./useTranslator-BMnme3me.js";import{n as l,t as u}from"./Icon-C24cO4CC.js";import{a as d,i as f,r as p}from"./columnUtils-BDDG7zo5.js";import{n as m,t as h}from"./Table-ClbWztQk.js";function g(e){return typeof e==`object`&&!!e&&e[x]===!0}function _(e,t){return new Proxy({[x]:!0,groupKey:e,count:t},S)}function v(e){let t=s(),{data:r,groupBy:a,collapsedGroups:o,onToggleGroup:c,renderGroupHeader:l,getRowKey:d,groupOrder:f}=e,p=(0,y.useMemo)(()=>{if(r.length===0)return[];let e=new Map;for(let t of r){let n=a(t),r=e.get(n);r?r.push(t):e.set(n,[t])}let t=[...e.keys()];if(f&&f.length>0){let n=f.filter(t=>e.has(t)),r=t.filter(e=>!f.includes(e));t=[...n,...r]}let n=[];for(let r of t){let t=e.get(r)??[];n.push(_(r,t.length)),o.has(r)||n.push(...t)}return n},[r,a,o,f]),m=(0,y.useMemo)(()=>{if(d)return null;let e=new Map;for(let t=0;t<p.length;t++)e.set(p[t],t);return e},[p,d]),h=(0,y.useCallback)(e=>g(e)?`__group_${e.groupKey}`:d?d(e):String(m?.get(e)??-1),[d,m]);return{plugin:(0,y.useMemo)(()=>({transformBodyRow(e,r){if(!g(r))return e;let a=r,s=o.has(a.groupKey),d=()=>c(a.groupKey),f=l?l(a.groupKey,a.count,s):(0,b.jsxs)(`span`,{className:`astryx2mo6ok astryx1tgivj0`,children:[a.groupKey,` `,(0,b.jsxs)(`span`,{className:`astryx1sodnla astryxv1l7n4`,children:[`(`,a.count,`)`]})]});return{...e,htmlProps:{...e.htmlProps,onClick:d,"aria-expanded":!s},xstyle:[...e.xstyle,C.headerRow],children:(0,b.jsx)(`td`,{colSpan:999,className:`astryxce4md1 astryx1vsv5vr astryx1t818jl`,children:(0,b.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw`,children:[(0,b.jsx)(`button`,{type:`button`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx1717udv astryx1ghz6dp astryx1md70p1 astryx1gs6z28 astryx1ypdohk astryxv9yike astryx1cqbx0l`,onClick:e=>{e.stopPropagation(),d()},"aria-label":t(s?`@astryx.tableGroupedRows.expandGroup`:`@astryx.tableGroupedRows.collapseGroup`,{groupKey:a.groupKey}),"aria-expanded":!s,children:(0,b.jsx)(`span`,{...n(i.mirror),children:(0,b.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk`},1:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk astryx1iffjtl`}}[!s<<0],children:(0,b.jsx)(u,{icon:`chevronRight`,size:`xsm`})})})}),f]})})}}}),[o,c,l,t]),data:p,idKey:h}}var y,b,x,S,C;function w(){return(w=e((()=>{y=t(),r(),l(),a(),c(),b=o(),x=Symbol(`tableGroupHeader`),S={get(e,t){return t===x||t===`groupKey`||t===`count`||t in e?e[t]:``}},C={headerRow:{kkrTdU:`astryx1ypdohk`,kfSwDN:`astryx87ps6o`,kWkggS:`astryxwmxj5m`,kt9PQ7:`astryxso031l`,kfdmCh:`astryx1q0q8m5`,kL6WhQ:`astryxw8gpjh`,$$css:!0}}})))()}function T(e=[]){let[t,n]=(0,E.useState)(new Set(e));return{collapsedGroups:t,onToggleGroup:(0,E.useCallback)(e=>{n(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[])}}var E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{E=t(),m(),w(),p(),D=o(),O=[{id:`1`,name:`Ava Chen`,team:`Design Systems`,role:`Staff Eng`},{id:`2`,name:`Liam Park`,team:`Design Systems`,role:`Engineer`},{id:`3`,name:`Zoe Vega`,team:`Design Systems`,role:`Manager`},{id:`4`,name:`Max Ross`,team:`Infra`,role:`Senior Eng`},{id:`5`,name:`Mia Cole`,team:`Infra`,role:`Engineer`},{id:`6`,name:`Leo Nash`,team:`Growth`,role:`PM`}],k=[{key:`name`,header:`Name`,width:d(2)},{key:`role`,header:`Role`,width:f(140)}],A={title:`Core/TableGroupedRows`,tags:[`autodocs`]},j={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=T(),n=v({data:O,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id});return(0,D.jsx)(h,{data:n.data,columns:k,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},M={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=T([`Infra`]),n=v({data:O,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id});return(0,D.jsx)(h,{data:n.data,columns:k,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},N={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=T(),n=v({data:O,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id,groupOrder:[`Growth`,`Infra`],renderGroupHeader:(e,t,n)=>(0,D.jsxs)(`span`,{children:[(0,D.jsx)(`strong`,{children:e}),` — `,t,` `,t===1?`person`:`people`,n?` (hidden)`:``]})});return(0,D.jsx)(h,{data:n.data,columns:k,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      collapsedGroups,
      onToggleGroup
    } = useCollapsed();
    const grouped = useTableGroupedRows<Person>({
      data: people,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id
    });
    return <Table data={grouped.data} columns={columns} idKey={grouped.idKey} hasHover plugins={{
      grouped: grouped.plugin
    }} />;
  }
}`,...j.parameters?.docs?.source},description:{story:`Rows are grouped into collapsible sections by \`groupBy\`. Each section gets a
full-width header with a chevron, the group label, and a member count.
Click a header (or its chevron) to collapse/expand that group.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      collapsedGroups,
      onToggleGroup
    } = useCollapsed(['Infra']);
    const grouped = useTableGroupedRows<Person>({
      data: people,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id
    });
    return <Table data={grouped.data} columns={columns} idKey={grouped.idKey} hasHover plugins={{
      grouped: grouped.plugin
    }} />;
  }
}`,...M.parameters?.docs?.source},description:{story:'Groups can start collapsed — pass their keys in the initial `collapsedGroups`\nset. Here "Infra" begins collapsed.',...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      collapsedGroups,
      onToggleGroup
    } = useCollapsed();
    const grouped = useTableGroupedRows<Person>({
      data: people,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id,
      groupOrder: ['Growth', 'Infra'],
      renderGroupHeader: (key, count, collapsed) => <span>
          <strong>{key}</strong> — {count} {count === 1 ? 'person' : 'people'}
          {collapsed ? ' (hidden)' : ''}
        </span>
    });
    return <Table data={grouped.data} columns={columns} idKey={grouped.idKey} hasHover plugins={{
      grouped: grouped.plugin
    }} />;
  }
}`,...N.parameters?.docs?.source},description:{story:"`groupOrder` pins specific groups to the front; `renderGroupHeader`\ncustomizes the header content shown to the right of the chevron.",...N.parameters?.docs?.description}}},P=[`Default`,`InitiallyCollapsed`,`CustomOrderAndHeader`]})))()}F();export{N as CustomOrderAndHeader,j as Default,M as InitiallyCollapsed,P as __namedExportsOrder,A as default};