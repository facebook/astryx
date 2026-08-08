import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Table-ClbWztQk.js";import{i as a,n as o,r as s,t as c}from"./useTableSelectionState-BSKEXSen.js";import{i as l,n as u,r as d,t as f}from"./useTableSortableState-CHVlCziu.js";var p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{p=t(),r(),d(),f(),s(),c(),m=n(),h=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,age:32,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,age:28,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,age:45,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,age:37,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,age:29,isLocked:!1}],g=[{key:`name`,header:`Name`,sortable:!0},{key:`email`,header:`Email`,sortable:!0},{key:`role`,header:`Role`,sortable:!0},{key:`age`,header:`Age`,sortable:!0}],_={title:`Core/TableSortable`,tags:[`autodocs`]},v={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=u({data:h,defaultSort:[{sortKey:`name`,direction:`ascending`}]}),r=l(n);return(0,m.jsxs)(`div`,{style:{maxWidth:700},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Click a column header to sort. Current:`,` `,t.length>0?`${t[0].sortKey} ${t[0].direction}`:`none`]}),(0,m.jsx)(i,{data:e,columns:g,idKey:`id`,plugins:{sortable:r}})]})}},y={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=u({data:h,defaultSort:[{sortKey:`role`,direction:`ascending`}],isMultiSortEnabled:!0}),r=l(n);return(0,m.jsxs)(`div`,{style:{maxWidth:700},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Shift+click column headers to add secondary sorts. Active sorts:`,` `,t.map(e=>`${e.sortKey} (${e.direction})`).join(`, `)||`none`]}),(0,m.jsx)(i,{data:e,columns:g,idKey:`id`,plugins:{sortable:r}})]})}},b={render:()=>{let e=[{key:`name`,header:`Name`,sortable:!0},{key:`email`,header:`Email`,sortable:{sortKey:`emailSort`}},{key:`role`,header:`Role`,sortable:!0},{key:`age`,header:`Age`,sortable:{sortKey:`yearsOld`}}],{sortedData:t,sort:n,sortConfig:r}=u({data:h,defaultSort:[{sortKey:`yearsOld`,direction:`ascending`}],comparators:{yearsOld:(e,t)=>e.age-t.age,emailSort:(e,t)=>e.email.localeCompare(t.email)}}),a=l(r);return(0,m.jsxs)(`div`,{style:{maxWidth:700},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Age column uses sortKey "yearsOld", Email uses "emailSort". Current:`,` `,n.length>0?`${n[0].sortKey} ${n[0].direction}`:`none`]}),(0,m.jsx)(i,{data:t,columns:e,idKey:`id`,plugins:{sortable:a}})]})}},x={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=u({data:h,allowUnsortedState:!0}),r=l(n);return(0,m.jsxs)(`div`,{style:{maxWidth:700},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Cycles: ascending → descending → unsorted. Current:`,` `,t.length>0?`${t[0].sortKey} ${t[0].direction}`:`unsorted`]}),(0,m.jsx)(i,{data:e,columns:g,idKey:`id`,plugins:{sortable:r}})]})}},S={render:()=>{let[e,t]=(0,p.useState)(new Set),{sortedData:n,sort:r,sortConfig:s}=u({data:h,defaultSort:[{sortKey:`name`,direction:`ascending`}]}),c=l(s),{selectionConfig:d}=o({data:n,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),f=a(d);return(0,m.jsxs)(`div`,{style:{maxWidth:700},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Sorting + Selection composed together. Selected: `,e.size,` `,`of `,h.length,`. Sort:`,` `,r.length>0?`${r[0].sortKey} ${r[0].direction}`:`none`]}),(0,m.jsx)(i,{data:n,columns:g,idKey:`id`,plugins:{sortable:c,selection:f}})]})}},C={render:()=>{let[e,t]=(0,p.useState)([{sortKey:`age`,direction:`descending`}]),{sortedData:n,sortConfig:r}=u({data:h,sort:e,onSortChange:t}),a=l(r);return(0,m.jsxs)(`div`,{style:{maxWidth:700},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Controlled mode — external state. Current:`,` `,e.length>0?`${e[0].sortKey} ${e[0].direction}`:`none`]}),(0,m.jsxs)(`div`,{style:{display:`flex`,gap:8,marginBottom:8},children:[(0,m.jsx)(`button`,{onClick:()=>t([{sortKey:`name`,direction:`ascending`}]),children:`Sort by Name ↑`}),(0,m.jsx)(`button`,{onClick:()=>t([{sortKey:`age`,direction:`descending`}]),children:`Sort by Age ↓`}),(0,m.jsx)(`button`,{onClick:()=>t([]),children:`Clear Sort`})]}),(0,m.jsx)(i,{data:n,columns:g,idKey:`id`,plugins:{sortable:a}})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
        color: '#666'
      }}>
          Click a column header to sort. Current:{' '}
          {sort.length > 0 ? \`\${sort[0].sortKey} \${sort[0].direction}\` : 'none'}
        </p>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
        color: '#666'
      }}>
          Shift+click column headers to add secondary sorts. Active sorts:{' '}
          {sort.map(s => \`\${s.sortKey} (\${s.direction})\`).join(', ') || 'none'}
        </p>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
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
        emailSort: (a, b) => a.email.localeCompare(b.email)
      }
    });
    const sortablePlugin = useTableSortable<Employee>(sortConfig);
    return <div style={{
      maxWidth: 700
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
        color: '#666'
      }}>
          Cycles: ascending → descending → unsorted. Current:{' '}
          {sort.length > 0 ? \`\${sort[0].sortKey} \${sort[0].direction}\` : 'unsorted'}
        </p>
        <Table data={sortedData} columns={columns} idKey="id" plugins={{
        sortable: sortablePlugin
      }} />
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
        color: '#666'
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
        color: '#666'
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
}`,...C.parameters?.docs?.source}}},w=[`SingleSort`,`MultiSort`,`CustomSortKey`,`AllowUnsortedState`,`WithSelection`,`Controlled`]})))()}T();export{x as AllowUnsortedState,C as Controlled,b as CustomSortKey,y as MultiSort,v as SingleSort,S as WithSelection,w as __namedExportsOrder,_ as default};