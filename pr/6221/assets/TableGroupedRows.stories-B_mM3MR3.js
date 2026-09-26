import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{a as i,i as a}from"./columnUtils-cuTFfh7_.js";import{t as o}from"./Table-Nz1Wbf7n.js";import{Ht as s,Kt as c,Tt as l,Wt as u}from"./iframe-fn0hSiz8.js";function d(e=[]){let[t,n]=(0,f.useState)(new Set(e));return{collapsedGroups:t,onToggleGroup:(0,f.useCallback)(e=>{n(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[])}}var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{f=t(n()),l(),p=r(),m=[{id:`1`,name:`Ava Chen`,team:`Design Systems`,role:`Staff Eng`},{id:`2`,name:`Liam Park`,team:`Design Systems`,role:`Engineer`},{id:`3`,name:`Zoe Vega`,team:`Design Systems`,role:`Manager`},{id:`4`,name:`Max Ross`,team:`Infra`,role:`Senior Eng`},{id:`5`,name:`Mia Cole`,team:`Infra`,role:`Engineer`},{id:`6`,name:`Leo Nash`,team:`Growth`,role:`PM`}],h=[{key:`name`,header:`Name`,width:i(2)},{key:`role`,header:`Role`,width:a(140)}],g={title:`Core/TableGroupedRows`,tags:[`autodocs`]},_={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=d(),n=s({data:m,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id});return(0,p.jsx)(o,{data:n.data,columns:h,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},v={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=d([`Infra`]),n=s({data:m,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id});return(0,p.jsx)(o,{data:n.data,columns:h,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},y={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=d(),n=s({data:m,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id,groupOrder:[`Growth`,`Infra`],renderGroupHeader:(e,t,n)=>(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`strong`,{children:e}),` — `,t,` `,t===1?`person`:`people`,n?` (hidden)`:``]})});return(0,p.jsx)(o,{data:n.data,columns:h,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin}})}},b=[`Design Systems`,`Infra`,`Growth`,`Payments`],x=[`Engineer`,`Senior Eng`,`Staff Eng`,`Manager`,`PM`],S=Array.from({length:48},(e,t)=>({id:String(t+1),name:`Person ${String(t+1).padStart(2,`0`)}`,team:b[Math.floor(t/12)],role:x[t%x.length]})),C=[{key:`name`,header:`Name`,width:a(200)},{key:`team`,header:`Team`,width:a(180)},{key:`role`,header:`Role`,width:a(180)}],w={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=d(),n=s({data:S,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id,hasStickyGroupHeaders:!0}),r=u({maxHeight:320});return(0,p.jsx)(o,{data:n.data,columns:h,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin,stickyHeader:r}})}},T={render:()=>{let{collapsedGroups:e,onToggleGroup:t}=d(),n=s({data:S,groupBy:e=>e.team,collapsedGroups:e,onToggleGroup:t,getRowKey:e=>e.id,hasStickyGroupHeaders:!0}),r=u({maxHeight:320}),i=c({startKeys:[`name`]});return(0,p.jsx)(`div`,{style:{maxWidth:420},children:(0,p.jsx)(o,{data:n.data,columns:C,idKey:n.idKey,hasHover:!0,plugins:{grouped:n.plugin,stickyHeader:r,stickyColumns:i}})})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Rows are grouped into collapsible sections by \`groupBy\`. Each section gets a
full-width header with a chevron, the group label, and a member count.
Click a header (or its chevron) to collapse/expand that group.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:'Groups can start collapsed — pass their keys in the initial `collapsedGroups`\nset. Here "Infra" begins collapsed.',...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"`groupOrder` pins specific groups to the front; `renderGroupHeader`\ncustomizes the header content shown to the right of the chevron.",...y.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      collapsedGroups,
      onToggleGroup
    } = useCollapsed();
    const grouped = useTableGroupedRows<Person>({
      data: staff,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id,
      hasStickyGroupHeaders: true
    });
    const stickyHeader = useTableStickyHeader<Person>({
      maxHeight: 320
    });
    return <Table data={grouped.data} columns={columns} idKey={grouped.idKey} hasHover plugins={{
      grouped: grouped.plugin,
      stickyHeader
    }} />;
  }
}`,...w.parameters?.docs?.source},description:{story:"`hasStickyGroupHeaders` pins each heading to the top of the scrollport while\nits section is on screen, so scrolling deep into a long group never loses\nwhich group it is. The heading needs somewhere to pin, which is what\n`useTableStickyHeader`'s `maxHeight` gives it — and with that plugin\ninstalled the heading comes to rest below the header row rather than over\nit, because the header publishes its measured height for it to clear.",...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      collapsedGroups,
      onToggleGroup
    } = useCollapsed();
    const grouped = useTableGroupedRows<Person>({
      data: staff,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id,
      hasStickyGroupHeaders: true
    });
    const stickyHeader = useTableStickyHeader<Person>({
      maxHeight: 320
    });
    const stickyColumns = useTableStickyColumns<Person>({
      startKeys: ['name']
    });
    return <div style={{
      maxWidth: 420
    }}>
        <Table data={grouped.data} columns={wideColumns} idKey={grouped.idKey} hasHover plugins={{
        grouped: grouped.plugin,
        stickyHeader,
        stickyColumns
      }} />
      </div>;
  }
}`,...T.parameters?.docs?.source},description:{story:`All three at once. Scrolling down pins the header row and the heading under
it; scrolling sideways holds the \`Name\` column and keeps the heading's label
at the start edge. The heading stays above the pinned column as rows pass
beneath, and below the pinned header rather than covering it.`,...T.parameters?.docs?.description}}},E=[`Default`,`InitiallyCollapsed`,`CustomOrderAndHeader`,`StickyGroupHeadings`,`StickyGroupHeadingsWithStickyColumn`]}))();export{y as CustomOrderAndHeader,_ as Default,v as InitiallyCollapsed,w as StickyGroupHeadings,T as StickyGroupHeadingsWithStickyColumn,E as __namedExportsOrder,g as default};