import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Table-Bm3Jrdqf.js";import{$t as a,Yt as o,Zt as s,ft as c,qt as l}from"./iframe-DRSfIdhd.js";var u,d,f,p,m,h,g,_,v,y,b,x;e((()=>{u=t(n()),c(),d=r(),f=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,age:32,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,age:28,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,age:45,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,age:37,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,age:29,isLocked:!1}],p=[{key:`name`,header:`Name`,sortable:!0},{key:`email`,header:`Email`,sortable:!0},{key:`role`,header:`Role`,sortable:!0},{key:`age`,header:`Age`,sortable:!0}],m={title:`Core/TableSortable`,tags:[`autodocs`]},h={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=l({data:f,defaultSort:[{sortKey:`name`,direction:`ascending`}]}),r=o(n);return(0,d.jsxs)(`div`,{style:{maxWidth:700},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Click a column header to sort. Current:`,` `,t.length>0?`${t[0].sortKey} ${t[0].direction}`:`none`]}),(0,d.jsx)(i,{data:e,columns:p,idKey:`id`,plugins:{sortable:r}})]})}},g={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=l({data:f,defaultSort:[{sortKey:`role`,direction:`ascending`}],isMultiSortEnabled:!0}),r=o(n);return(0,d.jsxs)(`div`,{style:{maxWidth:700},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Shift+click column headers to add secondary sorts. Active sorts:`,` `,t.map(e=>`${e.sortKey} (${e.direction})`).join(`, `)||`none`]}),(0,d.jsx)(i,{data:e,columns:p,idKey:`id`,plugins:{sortable:r}})]})}},_={render:()=>{let e=[{key:`name`,header:`Name`,sortable:!0},{key:`email`,header:`Email`,sortable:{sortKey:`emailSort`}},{key:`role`,header:`Role`,sortable:!0},{key:`age`,header:`Age`,sortable:{sortKey:`yearsOld`}}],{sortedData:t,sort:n,sortConfig:r}=l({data:f,defaultSort:[{sortKey:`yearsOld`,direction:`ascending`}],comparators:{yearsOld:(e,t)=>e.age-t.age,emailSort:(e,t)=>e.email.localeCompare(t.email)}}),a=o(r);return(0,d.jsxs)(`div`,{style:{maxWidth:700},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Age column uses sortKey "yearsOld", Email uses "emailSort". Current:`,` `,n.length>0?`${n[0].sortKey} ${n[0].direction}`:`none`]}),(0,d.jsx)(i,{data:t,columns:e,idKey:`id`,plugins:{sortable:a}})]})}},v={render:()=>{let{sortedData:e,sort:t,sortConfig:n}=l({data:f,allowUnsortedState:!0}),r=o(n);return(0,d.jsxs)(`div`,{style:{maxWidth:700},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Cycles: ascending → descending → unsorted. Current:`,` `,t.length>0?`${t[0].sortKey} ${t[0].direction}`:`unsorted`]}),(0,d.jsx)(i,{data:e,columns:p,idKey:`id`,plugins:{sortable:r}})]})}},y={render:()=>{let[e,t]=(0,u.useState)(new Set),{sortedData:n,sort:r,sortConfig:c}=l({data:f,defaultSort:[{sortKey:`name`,direction:`ascending`}]}),m=o(c),{selectionConfig:h}=s({data:n,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),g=a(h);return(0,d.jsxs)(`div`,{style:{maxWidth:700},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Sorting + Selection composed together. Selected: `,e.size,` `,`of `,f.length,`. Sort:`,` `,r.length>0?`${r[0].sortKey} ${r[0].direction}`:`none`]}),(0,d.jsx)(i,{data:n,columns:p,idKey:`id`,plugins:{sortable:m,selection:g}})]})}},b={render:()=>{let[e,t]=(0,u.useState)([{sortKey:`age`,direction:`descending`}]),{sortedData:n,sortConfig:r}=l({data:f,sort:e,onSortChange:t}),a=o(r);return(0,d.jsxs)(`div`,{style:{maxWidth:700},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Controlled mode — external state. Current:`,` `,e.length>0?`${e[0].sortKey} ${e[0].direction}`:`none`]}),(0,d.jsxs)(`div`,{style:{display:`flex`,gap:8,marginBottom:8},children:[(0,d.jsx)(`button`,{onClick:()=>t([{sortKey:`name`,direction:`ascending`}]),children:`Sort by Name ↑`}),(0,d.jsx)(`button`,{onClick:()=>t([{sortKey:`age`,direction:`descending`}]),children:`Sort by Age ↓`}),(0,d.jsx)(`button`,{onClick:()=>t([]),children:`Clear Sort`})]}),(0,d.jsx)(i,{data:n,columns:p,idKey:`id`,plugins:{sortable:a}})]})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x=[`SingleSort`,`MultiSort`,`CustomSortKey`,`AllowUnsortedState`,`WithSelection`,`Controlled`]}))();export{v as AllowUnsortedState,b as Controlled,_ as CustomSortKey,g as MultiSort,h as SingleSort,y as WithSelection,x as __namedExportsOrder,m as default};