import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Table-ClbWztQk.js";import{i as a,n as o,r as s,t as c}from"./useTableSelectionState-BSKEXSen.js";import{n as l,t as u}from"./useTablePagination-DtNcJCv4.js";function d(e,t,n){let r=Number.isFinite(n)?Math.max(1,Math.floor(n)):10,i=((Number.isFinite(t)?Math.max(1,Math.floor(t)):1)-1)*r;return e.slice(i,i+r)}function f({variant:e=`pages`,position:t=`below`,align:n=`start`}){let[r,a]=(0,p.useState)(1),o=l({page:r,onPageChange:a,totalItems:h.length,pageSize:10,variant:e,position:t,align:n});return(0,m.jsx)(i,{data:d(h,r,10),columns:g,idKey:`id`,plugins:{pagination:o}})}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{p=t(),r(),u(),s(),c(),m=n(),h=Array.from({length:50},(e,t)=>({id:String(t+1),name:`User ${t+1}`,email:`user${t+1}@example.com`,role:[`Engineer`,`Designer`,`Manager`,`Admin`,`Analyst`][t%5]})),g=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`}],_={title:`Core/TablePagination`,tags:[`autodocs`]},v={render:()=>{let[e,t]=(0,p.useState)(1),n=l({page:e,onPageChange:t,totalItems:h.length,pageSize:10});return(0,m.jsx)(`div`,{style:{maxWidth:600},children:(0,m.jsx)(i,{data:d(h,e,10),columns:g,idKey:`id`,plugins:{pagination:n}})})}},y={render:()=>{let[e,t]=(0,p.useState)(1),n=h.slice((e-1)*10,e*10),r=l({page:e,onPageChange:t,totalItems:h.length,pageSize:10});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Server-side: data is pre-sliced, no paginatedData() needed.`}),(0,m.jsx)(i,{data:n,columns:g,idKey:`id`,plugins:{pagination:r}})]})}},b={render:()=>{let[e,t]=(0,p.useState)(1),[n,r]=(0,p.useState)(10),a=l({page:e,onPageChange:t,totalItems:h.length,pageSize:n,onPageSizeChange:r,pageSizeOptions:[5,10,25,50]});return(0,m.jsx)(`div`,{style:{maxWidth:600},children:(0,m.jsx)(i,{data:d(h,e,n),columns:g,idKey:`id`,plugins:{pagination:a}})})}},x={render:()=>{let[e,t]=(0,p.useState)(1),n=e*10<h.length,r=l({page:e,onPageChange:t,hasMore:n,pageSize:10});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Cursor-based: total unknown, only hasMore=`,String(n),`.`]}),(0,m.jsx)(i,{data:d(h,e,10),columns:g,idKey:`id`,plugins:{pagination:r}})]})}},S={render:()=>{let[e,t]=(0,p.useState)(1),n=l({page:e,onPageChange:t,totalItems:h.length,pageSize:10,position:`above`});return(0,m.jsx)(`div`,{style:{maxWidth:600},children:(0,m.jsx)(i,{data:d(h,e,10),columns:g,idKey:`id`,plugins:{pagination:n}})})}},C={render:()=>{let[e,t]=(0,p.useState)(1),n=l({page:e,onPageChange:t,totalItems:h.length,pageSize:10,position:`both`});return(0,m.jsx)(`div`,{style:{maxWidth:600},children:(0,m.jsx)(i,{data:d(h,e,10),columns:g,idKey:`id`,plugins:{pagination:n}})})}},w={render:()=>{let[e,t]=(0,p.useState)(1),[n,r]=(0,p.useState)(new Set),s=l({page:e,onPageChange:t,totalItems:h.length,pageSize:10}),c=d(h,e,10),{selectionConfig:u}=o({data:c,idKey:`id`,selectedKeys:n,setSelectedKeys:r}),f=a(u);return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Pagination + Selection composed. Selected: `,n.size]}),(0,m.jsx)(i,{data:c,columns:g,idKey:`id`,plugins:{selection:f,pagination:s}})]})}},T={argTypes:{variant:{control:`select`,options:[`pages`,`count`,`compact`,`dots`,`none`],description:`What appears between prev/next buttons`},position:{control:`select`,options:[`below`,`above`,`both`,`none`],description:`Where pagination renders relative to the table`},align:{control:`select`,options:[`start`,`center`,`end`],description:`Horizontal alignment of the pagination controls`}},args:{variant:`pages`,position:`below`,align:`center`},render:e=>(0,m.jsx)(`div`,{style:{maxWidth:700},children:(0,m.jsx)(f,{variant:e.variant,position:e.position,align:e.align})})},E=[`pages`,`count`,`compact`,`dots`],D=[`below`,`above`,`both`],O=[`start`,`center`,`end`],k={render:()=>(0,m.jsx)(`div`,{style:{fontFamily:`sans-serif`,maxWidth:700},children:E.flatMap(e=>D.flatMap(t=>O.map(n=>(0,m.jsxs)(`div`,{style:{marginBottom:48,paddingBottom:48,borderBottom:`1px solid #e5e5e5`},children:[(0,m.jsx)(`div`,{style:{display:`inline-flex`,gap:8,marginBottom:12,flexWrap:`wrap`},children:[{label:`variant`,value:e},{label:`position`,value:t},{label:`align`,value:n}].map(({label:e,value:t})=>(0,m.jsxs)(`span`,{style:{fontSize:11,fontFamily:`monospace`,background:`#f0f0f0`,borderRadius:4,padding:`2px 6px`,color:`#555`},children:[e,`="`,t,`"`]},e))}),(0,m.jsx)(f,{variant:e,position:t,align:n})]},`${e}-${t}-${n}`))))})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const plugin = useTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize
    });
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={paginateData(users, page, pageSize)} columns={columns} idKey="id" plugins={{
        pagination: plugin
      }} />
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const serverData = users.slice((page - 1) * pageSize, page * pageSize);
    const plugin = useTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Server-side: data is pre-sliced, no paginatedData() needed.
        </p>
        <Table data={serverData} columns={columns} idKey="id" plugins={{
        pagination: plugin
      }} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const plugin = useTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize,
      onPageSizeChange: setPageSize,
      pageSizeOptions: [5, 10, 25, 50]
    });
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={paginateData(users, page, pageSize)} columns={columns} idKey="id" plugins={{
        pagination: plugin
      }} />
      </div>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const hasMore = page * pageSize < users.length;
    const plugin = useTablePagination<User>({
      page,
      onPageChange: setPage,
      hasMore,
      pageSize
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Cursor-based: total unknown, only hasMore={String(hasMore)}.
        </p>
        <Table data={paginateData(users, page, pageSize)} columns={columns} idKey="id" plugins={{
        pagination: plugin
      }} />
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const plugin = useTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize,
      position: 'above'
    });
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={paginateData(users, page, pageSize)} columns={columns} idKey="id" plugins={{
        pagination: plugin
      }} />
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const plugin = useTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize,
      position: 'both'
    });
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={paginateData(users, page, pageSize)} columns={columns} idKey="id" plugins={{
        pagination: plugin
      }} />
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [page, setPage] = useState(1);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const pageSize = 10;
    const plugin = useTablePagination<User>({
      page,
      onPageChange: setPage,
      totalItems: users.length,
      pageSize
    });
    const pageData = paginateData(users, page, pageSize);
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: pageData,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Pagination + Selection composed. Selected: {selectedKeys.size}
        </p>
        <Table data={pageData} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin,
        pagination: plugin
      }} />
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  argTypes: {
    variant: {
      control: 'select',
      options: ['pages', 'count', 'compact', 'dots', 'none'],
      description: 'What appears between prev/next buttons'
    },
    position: {
      control: 'select',
      options: ['below', 'above', 'both', 'none'],
      description: 'Where pagination renders relative to the table'
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Horizontal alignment of the pagination controls'
    }
  },
  args: {
    variant: 'pages',
    position: 'below',
    align: 'center'
  },
  render: args => <div style={{
    maxWidth: 700
  }}>
      <PaginatedDemo variant={args.variant} position={args.position} align={args.align} />
    </div>
}`,...T.parameters?.docs?.source},description:{story:`Interactive playground — use the controls panel to explore every combination
of variant, position, and align.`,...T.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    fontFamily: 'sans-serif',
    maxWidth: 700
  }}>
      {VARIANTS.flatMap(variant => POSITIONS.flatMap(position => ALIGNS.map(align => <div key={\`\${variant}-\${position}-\${align}\`} style={{
      marginBottom: 48,
      paddingBottom: 48,
      borderBottom: '1px solid #e5e5e5'
    }}>
              <div style={{
        display: 'inline-flex',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap'
      }}>
                {[{
          label: 'variant',
          value: variant
        }, {
          label: 'position',
          value: position
        }, {
          label: 'align',
          value: align
        }].map(({
          label,
          value
        }) => <span key={label} style={{
          fontSize: 11,
          fontFamily: 'monospace',
          background: '#f0f0f0',
          borderRadius: 4,
          padding: '2px 6px',
          color: '#555'
        }}>
                    {label}=&quot;{value}&quot;
                  </span>)}
              </div>
              <PaginatedDemo variant={variant} position={position} align={align} />
            </div>)))}
    </div>
}`,...k.parameters?.docs?.source},description:{story:"All variant × position × align combinations in one scrollable view.\nOne row per combination, labelled clearly. The `none` values are omitted.",...k.parameters?.docs?.description}}},A=[`Default`,`ServerSide`,`PageSizeSelector`,`CursorBased`,`PositionAbove`,`PositionBoth`,`WithSelection`,`Playground`,`OptionsMatrix`]})))()}j();export{x as CursorBased,v as Default,k as OptionsMatrix,b as PageSizeSelector,T as Playground,S as PositionAbove,C as PositionBoth,y as ServerSide,w as WithSelection,A as __namedExportsOrder,_ as default};