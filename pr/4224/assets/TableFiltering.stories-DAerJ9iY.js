import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./jsx-runtime-cM__dR4X.js";import{t as i}from"./Table-DjDHccIx.js";import{n as a,t as o}from"./EmptyState-DKDHqncU.js";import{C as s,F as c,L as l,N as u,a as d,o as f,r as p,t as m,z as h}from"./Table-t0v56ewI.js";import{r as g,t as _}from"./PowerSearch-n-WZxzam.js";var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;t((()=>{v=e(n()),m(),_(),o(),y=r(),b=[{name:`Alice`,email:`alice@example.com`,role:`Engineer`,department:[`Platform`],level:5},{name:`Bob`,email:`bob@example.com`,role:`Designer`,department:[`Product`],level:4},{name:`Charlie`,email:`charlie@example.com`,role:`Manager`,department:[`Platform`],level:6},{name:`Diana`,email:`diana@example.com`,role:`Engineer`,department:[`Infrastructure`],level:5},{name:`Eve`,email:`eve@example.com`,role:`Admin`,department:[`Operations`],level:3}],x=[{key:`name`,type:`string`,label:`Name`},{key:`email`,type:`string`,label:`Email`},{key:`role`,type:`enum`,label:`Role`,enumValues:[{value:`Engineer`,label:`Engineer`},{value:`Designer`,label:`Designer`},{value:`Manager`,label:`Manager`},{value:`Admin`,label:`Admin`}]},{key:`department`,type:`enum_list`,label:`Department`,enumValues:[{value:`Platform`,label:`Platform`},{value:`Product`,label:`Product`},{value:`Infrastructure`,label:`Infrastructure`},{value:`Operations`,label:`Operations`}]},{key:`level`,type:`number`,label:`Level`}],S={title:`Core/TableFiltering`,tags:[`autodocs`]},C={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),a=[{key:`name`,header:`Name`,filter:`name`},{key:`email`,header:`Email`,filter:`email`},{key:`role`,header:`Role`},{key:`department`,header:`Department`}],o=f({filters:n,onFilterChange:r,searchConfig:e}),s=t(d(n,a,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Showing `,s.length,`/`,b.length,` rows.`]}),(0,y.jsx)(i,{data:s,columns:a,idKey:`name`,plugins:{filter:o}})]})}},w={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),a=[{key:`name`,header:`Name`},{key:`role`,header:`Role`,filter:`role`},{key:`department`,header:`Department`},{key:`level`,header:`Level`}],o=f({filters:n,onFilterChange:r,searchConfig:e}),s=t(d(n,a,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Enum → selector. Showing `,s.length,`/`,b.length,` rows.`]}),(0,y.jsx)(i,{data:s,columns:a,idKey:`name`,plugins:{filter:o}})]})}},T={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),a=[{key:`name`,header:`Name`},{key:`role`,header:`Role`},{key:`department`,header:`Department`,filter:`department`},{key:`level`,header:`Level`}],o=f({filters:n,onFilterChange:r,searchConfig:e}),s=t(d(n,a,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Enum list → multi-selector. Showing `,s.length,`/`,b.length,` `,`rows.`]}),(0,y.jsx)(i,{data:s,columns:a,idKey:`name`,plugins:{filter:o}})]})}},E={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),a=[{key:`name`,header:`Name`},{key:`role`,header:`Role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],o=f({filters:n,onFilterChange:r,searchConfig:e}),s=t(d(n,a,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Number field → numeric input. Showing `,s.length,`/`,b.length,` `,`rows.`]}),(0,y.jsx)(i,{data:s,columns:a,idKey:`name`,plugins:{filter:o}})]})}},D={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),a=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],o=f({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),s=t(d(n,a,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Inline variant. Showing `,s.length,`/`,b.length,` rows.`]}),(0,y.jsx)(i,{data:s,columns:a,idKey:`name`,plugins:{filter:o}})]})}},O={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),[a,o]=(0,v.useState)(new Set),s=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`department`,header:`Department`,filter:`department`},{key:`level`,header:`Level`}],c=f({filters:n,onFilterChange:r,searchConfig:e}),u=t(d(n,s,e),b),{selectionConfig:m}=l({data:u,idKey:`name`,selectedKeys:a,setSelectedKeys:o}),_=h(m);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Filtering + Selection. Selected: `,a.size,` | Showing`,` `,u.length,`/`,b.length,` rows.`]}),(0,y.jsx)(i,{data:u,columns:s,idKey:`name`,plugins:{selection:_,filter:c}})]})}},k={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),{sortedData:a,sort:o,sortConfig:s,applySort:l}=u({data:b}),m=[{key:`name`,header:`Name`,sortable:!0,filter:`name`},{key:`role`,header:`Role`,sortable:!0,filter:`role`},{key:`level`,header:`Level`,sortable:!0,filter:`level`},{key:`department`,header:`Department`}],h=f({filters:n,onFilterChange:r,searchConfig:e}),_=c(s),v=l(t(d(n,m,e),b));return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Filtering + Sorting. Showing `,v.length,`/`,b.length,` rows.`]}),(0,y.jsx)(i,{data:v,columns:m,idKey:`name`,plugins:{sort:_,filter:h}})]})}},A={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),[a,o]=(0,v.useState)({}),c=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],l=f({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),u=s({columnWidths:a,onColumnResizeEnd:e=>o(t=>({...t,...e})),columns:c}),m=t(d(n,c,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Inline filtering + Resize. Showing `,m.length,`/`,b.length,` `,`rows.`]}),(0,y.jsx)(i,{data:m,columns:c,idKey:`name`,plugins:{filter:l,resize:u}})]})}},j={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),{sortConfig:a,applySort:o}=u({data:b}),[m,_]=(0,v.useState)({}),[S,C]=(0,v.useState)(new Set),w=[{key:`name`,header:`Name`,sortable:!0,filter:`name`},{key:`role`,header:`Role`,sortable:!0,filter:`role`},{key:`level`,header:`Level`,sortable:!0,filter:`level`},{key:`department`,header:`Department`,sortable:!0}],T=f({filters:n,onFilterChange:r,searchConfig:e}),E=c(a),D=s({columnWidths:m,onColumnResizeEnd:e=>_(t=>({...t,...e})),columns:w}),O=o(t(d(n,w,e),b)),{selectionConfig:k}=l({data:O,idKey:`name`,selectedKeys:S,setSelectedKeys:C}),A=h(k);return(0,y.jsxs)(`div`,{style:{maxWidth:900},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`All plugins. Selected: `,S.size,` | Showing `,O.length,`/`,b.length,` rows.`]}),(0,y.jsx)(i,{data:O,columns:w,idKey:`name`,plugins:{selection:A,sort:E,filter:T,resize:D}})]})}},M={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),a=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],o=f({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),s=t(d(n,a,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Inline variant with clear buttons. Type to filter, then click ✕ to clear. Showing `,s.length,`/`,b.length,` rows.`]}),(0,y.jsx)(i,{data:s,columns:a,idKey:`name`,plugins:{filter:o}})]})}},N={render:()=>{let{config:e,applyFilters:t}=g(x),{filters:n,onFilterChange:r}=p(),o=[{key:`name`,header:`Name`,filter:`name`},{key:`role`,header:`Role`,filter:`role`},{key:`level`,header:`Level`,filter:`level`},{key:`department`,header:`Department`}],s=f({filters:n,onFilterChange:r,variant:`inline`,searchConfig:e}),c=t(d(n,o,e),b);return(0,y.jsxs)(`div`,{style:{maxWidth:800},children:[(0,y.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Try filtering to get zero results; empty state appears.`}),(0,y.jsx)(i,{data:c,columns:o,idKey:`name`,plugins:{filter:s},emptyState:(0,y.jsx)(a,{title:`No results`,description:`Try adjusting your filters to find what you're looking for.`,isCompact:!0})})]})}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P=[`TextFilter`,`SelectorFilter`,`MultiSelectorFilter`,`NumberFilter`,`InlineVariant`,`WithSelection`,`WithSorting`,`WithResize`,`WithAllPlugins`,`InlineWithClear`,`EmptyState`]}))();export{N as EmptyState,D as InlineVariant,M as InlineWithClear,T as MultiSelectorFilter,E as NumberFilter,w as SelectorFilter,C as TextFilter,j as WithAllPlugins,A as WithResize,O as WithSelection,k as WithSorting,P as __namedExportsOrder,S as default};