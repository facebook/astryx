import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Table-DPpibL4M.js";import{$t as a,Bt as o,Ht as s,Zt as c,ft as l}from"./iframe-DDpBXOWV.js";function u({variant:e=`pages`,position:t=`below`,align:n=`start`}){let[r,a]=(0,d.useState)(1),c=s({page:r,onPageChange:a,totalItems:p.length,pageSize:10,variant:e,position:t,align:n});return(0,f.jsx)(i,{data:o(p,r,10),columns:m,idKey:`id`,plugins:{pagination:c}})}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;e((()=>{d=t(n()),l(),f=r(),p=Array.from({length:50},(e,t)=>({id:String(t+1),name:`User ${t+1}`,email:`user${t+1}@example.com`,role:[`Engineer`,`Designer`,`Manager`,`Admin`,`Analyst`][t%5]})),m=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`}],h={title:`Core/TablePagination`,tags:[`autodocs`]},g={render:()=>{let[e,t]=(0,d.useState)(1),n=s({page:e,onPageChange:t,totalItems:p.length,pageSize:10});return(0,f.jsx)(`div`,{style:{maxWidth:600},children:(0,f.jsx)(i,{data:o(p,e,10),columns:m,idKey:`id`,plugins:{pagination:n}})})}},_={render:()=>{let[e,t]=(0,d.useState)(1),n=p.slice((e-1)*10,e*10),r=s({page:e,onPageChange:t,totalItems:p.length,pageSize:10});return(0,f.jsxs)(`div`,{style:{maxWidth:600},children:[(0,f.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Server-side: data is pre-sliced, no paginatedData() needed.`}),(0,f.jsx)(i,{data:n,columns:m,idKey:`id`,plugins:{pagination:r}})]})}},v={render:()=>{let[e,t]=(0,d.useState)(1),[n,r]=(0,d.useState)(10),a=s({page:e,onPageChange:t,totalItems:p.length,pageSize:n,onPageSizeChange:r,pageSizeOptions:[5,10,25,50]});return(0,f.jsx)(`div`,{style:{maxWidth:600},children:(0,f.jsx)(i,{data:o(p,e,n),columns:m,idKey:`id`,plugins:{pagination:a}})})}},y={render:()=>{let[e,t]=(0,d.useState)(1),n=e*10<p.length,r=s({page:e,onPageChange:t,hasMore:n,pageSize:10});return(0,f.jsxs)(`div`,{style:{maxWidth:600},children:[(0,f.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Cursor-based: total unknown, only hasMore=`,String(n),`.`]}),(0,f.jsx)(i,{data:o(p,e,10),columns:m,idKey:`id`,plugins:{pagination:r}})]})}},b={render:()=>{let[e,t]=(0,d.useState)(1),n=s({page:e,onPageChange:t,totalItems:p.length,pageSize:10,position:`above`});return(0,f.jsx)(`div`,{style:{maxWidth:600},children:(0,f.jsx)(i,{data:o(p,e,10),columns:m,idKey:`id`,plugins:{pagination:n}})})}},x={render:()=>{let[e,t]=(0,d.useState)(1),n=s({page:e,onPageChange:t,totalItems:p.length,pageSize:10,position:`both`});return(0,f.jsx)(`div`,{style:{maxWidth:600},children:(0,f.jsx)(i,{data:o(p,e,10),columns:m,idKey:`id`,plugins:{pagination:n}})})}},S={render:()=>{let[e,t]=(0,d.useState)(1),[n,r]=(0,d.useState)(new Set),l=s({page:e,onPageChange:t,totalItems:p.length,pageSize:10}),u=o(p,e,10),{selectionConfig:h}=c({data:u,idKey:`id`,selectedKeys:n,setSelectedKeys:r}),g=a(h);return(0,f.jsxs)(`div`,{style:{maxWidth:600},children:[(0,f.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Pagination + Selection composed. Selected: `,n.size]}),(0,f.jsx)(i,{data:u,columns:m,idKey:`id`,plugins:{selection:g,pagination:l}})]})}},C={argTypes:{variant:{control:`select`,options:[`pages`,`count`,`compact`,`dots`,`none`],description:`What appears between prev/next buttons`},position:{control:`select`,options:[`below`,`above`,`both`,`none`],description:`Where pagination renders relative to the table`},align:{control:`select`,options:[`start`,`center`,`end`],description:`Horizontal alignment of the pagination controls`}},args:{variant:`pages`,position:`below`,align:`center`},render:e=>(0,f.jsx)(`div`,{style:{maxWidth:700},children:(0,f.jsx)(u,{variant:e.variant,position:e.position,align:e.align})})},w=[`pages`,`count`,`compact`,`dots`],T=[`below`,`above`,`both`],E=[`start`,`center`,`end`],D={render:()=>(0,f.jsx)(`div`,{style:{fontFamily:`sans-serif`,maxWidth:700},children:w.flatMap(e=>T.flatMap(t=>E.map(n=>(0,f.jsxs)(`div`,{style:{marginBottom:48,paddingBottom:48,borderBottom:`1px solid #e5e5e5`},children:[(0,f.jsx)(`div`,{style:{display:`inline-flex`,gap:8,marginBottom:12,flexWrap:`wrap`},children:[{label:`variant`,value:e},{label:`position`,value:t},{label:`align`,value:n}].map(({label:e,value:t})=>(0,f.jsxs)(`span`,{style:{fontSize:11,fontFamily:`monospace`,background:`#f0f0f0`,borderRadius:4,padding:`2px 6px`,color:`#555`},children:[e,`="`,t,`"`]},e))}),(0,f.jsx)(u,{variant:e,position:t,align:n})]},`${e}-${t}-${n}`))))})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`Interactive playground — use the controls panel to explore every combination
of variant, position, and align.`,...C.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:"All variant × position × align combinations in one scrollable view.\nOne row per combination, labelled clearly. The `none` values are omitted.",...D.parameters?.docs?.description}}},O=[`Default`,`ServerSide`,`PageSizeSelector`,`CursorBased`,`PositionAbove`,`PositionBoth`,`WithSelection`,`Playground`,`OptionsMatrix`]}))();export{y as CursorBased,g as Default,D as OptionsMatrix,v as PageSizeSelector,C as Playground,b as PositionAbove,x as PositionBoth,_ as ServerSide,S as WithSelection,O as __namedExportsOrder,h as default};