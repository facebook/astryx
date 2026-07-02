import{a1 as e,ah as C}from"./iframe-Cm6U1NA5.js";import{T as l}from"./Table-C37HT0y5.js";import{a as i,u as d}from"./useTableSortableState-DFFAFdce.js";import{a as K,u as x}from"./useTableSelectionState-Bw6VpGIt.js";import"./preload-helper-Ct5FWWRu.js";import"./ContextMenu-DWLEfn2r.js";import"./renderDropdownItems-bQ0yesD3.js";import"./Divider-BVACQv4v.js";import"./Item-Cm2fUJ9g.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-DgEo17xf.js";import"./useTypeahead-t21n__Fr.js";import"./EmptyState-DF3oTAVm.js";import"./CheckboxInput-CUVbGjCZ.js";import"./FieldStatus-Bm1uxwg9.js";const a=[{id:"1",name:"Alice",email:"alice@example.com",role:"Engineer",age:32,isLocked:!1},{id:"2",name:"Bob",email:"bob@example.com",role:"Designer",age:28,isLocked:!1},{id:"3",name:"Charlie",email:"charlie@example.com",role:"Manager",age:45,isLocked:!1},{id:"4",name:"Diana",email:"diana@example.com",role:"Engineer",age:37,isLocked:!0},{id:"5",name:"Eve",email:"eve@example.com",role:"Admin",age:29,isLocked:!1}],u=[{key:"name",header:"Name",sortable:!0},{key:"email",header:"Email",sortable:!0},{key:"role",header:"Role",sortable:!0},{key:"age",header:"Age",sortable:!0}],M={title:"Core/TableSortable",tags:["autodocs"]},g={render:()=>{const{sortedData:n,sort:t,sortConfig:o}=i({data:a,defaultSort:[{sortKey:"name",direction:"ascending"}]}),r=d(o);return e.jsxs("div",{style:{maxWidth:700},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Click a column header to sort. Current:"," ",t.length>0?`${t[0].sortKey} ${t[0].direction}`:"none"]}),e.jsx(l,{data:n,columns:u,idKey:"id",plugins:{sortable:r}})]})}},y={render:()=>{const{sortedData:n,sort:t,sortConfig:o}=i({data:a,defaultSort:[{sortKey:"role",direction:"ascending"}],isMultiSortEnabled:!0}),r=d(o);return e.jsxs("div",{style:{maxWidth:700},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Shift+click column headers to add secondary sorts. Active sorts:"," ",t.map(s=>`${s.sortKey} (${s.direction})`).join(", ")||"none"]}),e.jsx(l,{data:n,columns:u,idKey:"id",plugins:{sortable:r}})]})}},p={render:()=>{const n=[{key:"name",header:"Name",sortable:!0},{key:"email",header:"Email",sortable:{sortKey:"emailSort"}},{key:"role",header:"Role",sortable:!0},{key:"age",header:"Age",sortable:{sortKey:"yearsOld"}}],{sortedData:t,sort:o,sortConfig:r}=i({data:a,defaultSort:[{sortKey:"yearsOld",direction:"ascending"}],comparators:{yearsOld:(c,m)=>c.age-m.age,emailSort:(c,m)=>c.email.localeCompare(m.email)}}),s=d(r);return e.jsxs("div",{style:{maxWidth:700},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:['Age column uses sortKey "yearsOld", Email uses "emailSort". Current:'," ",o.length>0?`${o[0].sortKey} ${o[0].direction}`:"none"]}),e.jsx(l,{data:t,columns:n,idKey:"id",plugins:{sortable:s}})]})}},S={render:()=>{const{sortedData:n,sort:t,sortConfig:o}=i({data:a,allowUnsortedState:!0}),r=d(o);return e.jsxs("div",{style:{maxWidth:700},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Cycles: ascending → descending → unsorted. Current:"," ",t.length>0?`${t[0].sortKey} ${t[0].direction}`:"unsorted"]}),e.jsx(l,{data:n,columns:u,idKey:"id",plugins:{sortable:r}})]})}},b={render:()=>{const[n,t]=C.useState(new Set),{sortedData:o,sort:r,sortConfig:s}=i({data:a,defaultSort:[{sortKey:"name",direction:"ascending"}]}),c=d(s),{selectionConfig:m}=K({data:o,idKey:"id",selectedKeys:n,setSelectedKeys:t}),f=x(m);return e.jsxs("div",{style:{maxWidth:700},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Sorting + Selection composed together. Selected: ",n.size," ","of ",a.length,". Sort:"," ",r.length>0?`${r[0].sortKey} ${r[0].direction}`:"none"]}),e.jsx(l,{data:o,columns:u,idKey:"id",plugins:{sortable:c,selection:f}})]})}},h={render:()=>{const[n,t]=C.useState([{sortKey:"age",direction:"descending"}]),{sortedData:o,sortConfig:r}=i({data:a,sort:n,onSortChange:t}),s=d(r);return e.jsxs("div",{style:{maxWidth:700},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Controlled mode — external state. Current:"," ",n.length>0?`${n[0].sortKey} ${n[0].direction}`:"none"]}),e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:8},children:[e.jsx("button",{onClick:()=>t([{sortKey:"name",direction:"ascending"}]),children:"Sort by Name ↑"}),e.jsx("button",{onClick:()=>t([{sortKey:"age",direction:"descending"}]),children:"Sort by Age ↓"}),e.jsx("button",{onClick:()=>t([]),children:"Clear Sort"})]}),e.jsx(l,{data:o,columns:u,idKey:"id",plugins:{sortable:s}})]})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};const N=["SingleSort","MultiSort","CustomSortKey","AllowUnsortedState","WithSelection","Controlled"];export{S as AllowUnsortedState,h as Controlled,p as CustomSortKey,y as MultiSort,g as SingleSort,b as WithSelection,N as __namedExportsOrder,M as default};
