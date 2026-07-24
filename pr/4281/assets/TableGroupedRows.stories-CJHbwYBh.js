import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{_ as i,g as a,t as o}from"./Table-DPpibL4M.js";import{At as s,ft as c}from"./iframe-CPRczjHQ.js";function l(e=[]){let[t,n]=(0,u.useState)(new Set(e));return{collapsedGroups:t,onToggleGroup:(0,u.useCallback)(e=>{n(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[])}}var u,d,f,p,m,h,g,_,v;e((()=>{u=t(n()),c(),d=r(),f=[{id:`1`,name:`Ava Chen`,team:`Design Systems`,role:`Staff Eng`},{id:`2`,name:`Liam Park`,team:`Design Systems`,role:`Engineer`},{id:`3`,name:`Zoe Vega`,team:`Design Systems`,role:`Manager`},{id:`4`,name:`Max Ross`,team:`Infra`,role:`Senior Eng`},{id:`5`,name:`Mia Cole`,team:`Infra`,role:`Engineer`},{id:`6`,name:`Leo Nash`,team:`Growth`,role:`PM`}],p=[{key:`name`,header:`Name`,width:i(2)},{key:`role`,header:`Role`,width:a(140)}],m={title:`Core/TableGroupedRows`,tags:[`autodocs`]},h={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=l(),n=s({data:f,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id});return(0,d.jsx)(o,{data:n.data,columns:p,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},g={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=l([`Infra`]),n=s({data:f,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id});return(0,d.jsx)(o,{data:n.data,columns:p,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},_={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=l(),n=s({data:f,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id,groupOrder:[`Growth`,`Infra`],renderGroupHeader:(e,t,n)=>(0,d.jsxs)(`span`,{children:[(0,d.jsx)(`strong`,{children:e}),` — `,t,` `,t===1?`person`:`people`,n?` (hidden)`:``]})});return(0,d.jsx)(o,{data:n.data,columns:p,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Rows are grouped into collapsible sections by \`groupBy\`. Each section gets a
full-width header with a chevron, the group label, and a member count.
Click a header (or its chevron) to collapse/expand that group.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:'Groups can start collapsed — pass their keys in the initial `collapsedGroups`\nset. Here "Infra" begins collapsed.',...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:"`groupOrder` pins specific groups to the front; `renderGroupHeader`\ncustomizes the header content shown to the right of the chevron.",..._.parameters?.docs?.description}}},v=[`Default`,`InitiallyCollapsed`,`CustomOrderAndHeader`]}))();export{_ as CustomOrderAndHeader,h as Default,g as InitiallyCollapsed,v as __namedExportsOrder,m as default};