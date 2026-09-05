import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{a as r}from"./i18n-Cudh4L8I.js";import{t as i}from"./jsx-runtime-DqZldVDK.js";import{t as a}from"./Table-DMj6-9Z7.js";import{Gt as o,Yt as s,Zt as c,dt as l,qt as u,u as d}from"./iframe-DgRPfpsc.js";var f,p,m,h,g,_,v,y,b,x,S,C;e((()=>{f=t(n()),l(),d(),p=i(),m=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,age:32,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,age:28,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,age:45,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,age:37,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,age:29,isLocked:!1}],h=[{key:`name`,header:`Name`,sortable:!0},{key:`email`,header:`Email`,sortable:!0},{key:`role`,header:`Role`,sortable:!0},{key:`age`,header:`Age`,sortable:!0}],g={title:`Core/TableSortable`,tags:[`autodocs`]},_={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=o({data:m,defaultSort:[{sortKey:`name`,direction:`ascending`}]}),r=u(n);return(0,p.jsxs)(`div`,{style:{maxWidth:700},children:[(0,p.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Click a column header to sort. Current:`,` `,t.length>0?`${t[0].sortKey} ${t[0].direction}`:`none`]}),(0,p.jsx)(a,{data:e,columns:h,idKey:`id`,plugins:{sortable:r}})]})}},v={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=o({data:m,defaultSort:[{sortKey:`role`,direction:`ascending`}],isMultiSortEnabled:!0}),r=u(n);return(0,p.jsxs)(`div`,{style:{maxWidth:700},children:[(0,p.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Shift+click column headers to add secondary sorts. Active sorts:`,` `,t.map(e=>`${e.sortKey} (${e.direction})`).join(`, `)||`none`]}),(0,p.jsx)(a,{data:e,columns:h,idKey:`id`,plugins:{sortable:r}})]})}},y={render:()=>{let e=r(),t=[{key:`name`,header:`Name`,sortable:!0},{key:`email`,header:`Email`,sortable:{sortKey:`emailSort`}},{key:`role`,header:`Role`,sortable:!0},{key:`age`,header:`Age`,sortable:{sortKey:`yearsOld`}}],{sortedData:n,sort:i,sortConfig:s}=o({data:m,defaultSort:[{sortKey:`yearsOld`,direction:`ascending`}],comparators:{yearsOld:(e,t)=>e.age-t.age,emailSort:(t,n)=>e.compare(t.email,n.email)}}),c=u(s);return(0,p.jsxs)(`div`,{style:{maxWidth:700},children:[(0,p.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Age column uses sortKey "yearsOld", Email uses "emailSort". Current:`,` `,i.length>0?`${i[0].sortKey} ${i[0].direction}`:`none`]}),(0,p.jsx)(a,{data:n,columns:t,idKey:`id`,plugins:{sortable:c}})]})}},b={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=o({data:m,allowUnsortedState:!0}),r=u(n);return(0,p.jsxs)(`div`,{style:{maxWidth:700},children:[(0,p.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Cycles: ascending → descending → unsorted. Current:`,` `,t.length>0?`${t[0].sortKey} ${t[0].direction}`:`unsorted`]}),(0,p.jsx)(a,{data:e,columns:h,idKey:`id`,plugins:{sortable:r}})]})}},x={render:()=>{let[e,t]=(0,f.useState)(new Set),{sortedData:n,sort:r,sortConfig:i}=o({data:m,defaultSort:[{sortKey:`name`,direction:`ascending`}]}),l=u(i),{selectionConfig:d}=s({data:n,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),g=c(d);return(0,p.jsxs)(`div`,{style:{maxWidth:700},children:[(0,p.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Sorting + Selection composed together. Selected: `,e.size,` `,`of `,m.length,`. Sort:`,` `,r.length>0?`${r[0].sortKey} ${r[0].direction}`:`none`]}),(0,p.jsx)(a,{data:n,columns:h,idKey:`id`,plugins:{sortable:l,selection:g}})]})}},S={render:()=>{let[e,t]=(0,f.useState)([{sortKey:`age`,direction:`descending`}]),{sortedData:n,sortConfig:r}=o({data:m,sort:e,onSortChange:t}),i=u(r);return(0,p.jsxs)(`div`,{style:{maxWidth:700},children:[(0,p.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Controlled mode — external state. Current:`,` `,e.length>0?`${e[0].sortKey} ${e[0].direction}`:`none`]}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:8,marginBottom:8},children:[(0,p.jsx)(`button`,{onClick:()=>t([{sortKey:`name`,direction:`ascending`}]),children:`Sort by Name ↑`}),(0,p.jsx)(`button`,{onClick:()=>t([{sortKey:`age`,direction:`descending`}]),children:`Sort by Age ↓`}),(0,p.jsx)(`button`,{onClick:()=>t([]),children:`Clear Sort`})]}),(0,p.jsx)(a,{data:n,columns:h,idKey:`id`,plugins:{sortable:i}})]})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      sortedData,
      sort,
      sortConfig
    } = useTableSortableState<Employee>({
      data: employees,
      defaultSort: [{
        sortKey: 'name',
        direction: 'ascending'
      }]
    });
    const sortablePlugin = useTableSortable<Employee>(sortConfig);
    return <div style={{
      maxWidth: 700
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Click a column header to sort. Current:{' '}
          {sort.length > 0 ? \`\${sort[0].sortKey} \${sort[0].direction}\` : 'none'}
        </p>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      sortedData,
      sort,
      sortConfig
    } = useTableSortableState<Employee>({
      data: employees,
      defaultSort: [{
        sortKey: 'role',
        direction: 'ascending'
      }],
      isMultiSortEnabled: true
    });
    const sortablePlugin = useTableSortable<Employee>(sortConfig);
    return <div style={{
      maxWidth: 700
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Shift+click column headers to add secondary sorts. Active sorts:{' '}
          {sort.map(s => \`\${s.sortKey} (\${s.direction})\`).join(', ') || 'none'}
        </p>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const collator = useCollator();
    const customColumns: TableColumn<Employee>[] = [{
      key: 'name',
      header: 'Name',
      sortable: true
    }, {
      key: 'email',
      header: 'Email',
      sortable: {
        sortKey: 'emailSort'
      }
    }, {
      key: 'role',
      header: 'Role',
      sortable: true
    }, {
      key: 'age',
      header: 'Age',
      sortable: {
        sortKey: 'yearsOld'
      }
    }];
    const {
      sortedData,
      sort,
      sortConfig
    } = useTableSortableState<Employee>({
      data: employees,
      defaultSort: [{
        sortKey: 'yearsOld',
        direction: 'ascending'
      }],
      comparators: {
        yearsOld: (a, b) => a.age - b.age,
        emailSort: (a, b) => collator.compare(a.email, b.email)
      }
    });
    const sortablePlugin = useTableSortable<Employee>(sortConfig);
    return <div style={{
      maxWidth: 700
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Age column uses sortKey &quot;yearsOld&quot;, Email uses
          &quot;emailSort&quot;. Current:{' '}
          {sort.length > 0 ? \`\${sort[0].sortKey} \${sort[0].direction}\` : 'none'}
        </p>
        <Table data={sortedData} columns={customColumns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      sortedData,
      sort,
      sortConfig
    } = useTableSortableState<Employee>({
      data: employees,
      allowUnsortedState: true
    });
    const sortablePlugin = useTableSortable<Employee>(sortConfig);
    return <div style={{
      maxWidth: 700
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Cycles: ascending → descending → unsorted. Current:{' '}
          {sort.length > 0 ? \`\${sort[0].sortKey} \${sort[0].direction}\` : 'unsorted'}
        </p>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      sortedData,
      sort,
      sortConfig
    } = useTableSortableState<Employee>({
      data: employees,
      defaultSort: [{
        sortKey: 'name',
        direction: 'ascending'
      }]
    });
    const sortablePlugin = useTableSortable<Employee>(sortConfig);
    const {
      selectionConfig
    } = useTableSelectionState<Employee>({
      data: sortedData,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<Employee>(selectionConfig);
    return <div style={{
      maxWidth: 700
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Sorting + Selection composed together. Selected: {selectedKeys.size}{' '}
          of {employees.length}. Sort:{' '}
          {sort.length > 0 ? \`\${sort[0].sortKey} \${sort[0].direction}\` : 'none'}
        </p>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin,
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sort, setSort] = useState<TableSortState>([{
      sortKey: 'age',
      direction: 'descending'
    }]);
    const {
      sortedData,
      sortConfig
    } = useTableSortableState<Employee>({
      data: employees,
      sort,
      onSortChange: setSort
    });
    const sortablePlugin = useTableSortable<Employee>(sortConfig);
    return <div style={{
      maxWidth: 700
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Controlled mode — external state. Current:{' '}
          {sort.length > 0 ? \`\${sort[0].sortKey} \${sort[0].direction}\` : 'none'}
        </p>
        <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 8
      }}>
          <button onClick={() => setSort([{
          sortKey: 'name',
          direction: 'ascending'
        }])}>
            Sort by Name ↑
          </button>
          <button onClick={() => setSort([{
          sortKey: 'age',
          direction: 'descending'
        }])}>
            Sort by Age ↓
          </button>
          <button onClick={() => setSort([])}>Clear Sort</button>
        </div>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C=[`SingleSort`,`MultiSort`,`CustomSortKey`,`AllowUnsortedState`,`WithSelection`,`Controlled`]}))();export{b as AllowUnsortedState,S as Controlled,y as CustomSortKey,v as MultiSort,_ as SingleSort,x as WithSelection,C as __namedExportsOrder,g as default};