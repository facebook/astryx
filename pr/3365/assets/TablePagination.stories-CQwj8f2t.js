import{ah as r,a1 as t,af as F}from"./iframe-CF49Wwf0.js";import{T as l}from"./Table-BNg0XaZU.js";import{P as _}from"./Pagination-BzWk0YWl.js";import{a as q,u as G}from"./useTableSelectionState-ELQeGGRv.js";import"./preload-helper-Ct5FWWRu.js";import"./ContextMenu-BZk9skAV.js";import"./renderDropdownItems-BK_aigRT.js";import"./Divider-B8NVXNDK.js";import"./Item-D1VdvwZp.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-BOVcRWcC.js";import"./useTypeahead-CaUdhu09.js";import"./EmptyState-B3qqYJ5J.js";import"./Selector-BgH8Yu_I.js";import"./usePopover-dK0N4tGE.js";import"./useFocusTrap-CTs8glkB.js";import"./Field-B4k7n2cG.js";import"./FieldStatus-R68hTSFm.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./utils-_uNaBhDK.js";import"./hooks-B_H1mpPn.js";import"./CheckboxInput-CuQs2wdN.js";const S={wrapper:{k1xSpc:"astryx78zum5",$$css:!0},marginTop:{keoZOQ:"astryxtbrsbv",$$css:!0},marginBottom:{k1K539:"astryx1p37lm5",$$css:!0},alignStart:{kjj79g:"astryx1nhvcw1",$$css:!0},alignCenter:{kjj79g:"astryxl56j7k",$$css:!0},alignEnd:{kjj79g:"astryx13a6bvl",$$css:!0}};function g(e){const{page:n,onPageChange:a,totalItems:s,totalPages:o,hasMore:m,pageSize:c=10,onPageSizeChange:C,pageSizeOptions:W,variant:U="pages",size:N="md",position:w="below",align:D="center",label:R="Table pagination"}=e,M=Number.isFinite(c)?Math.max(1,Math.floor(c)):10,E=o??(s!=null?Math.ceil(s/M):void 0),$={page:n,onChange:a,totalItems:s,totalPages:E,hasMore:m,pageSize:M,onPageSizeChange:C,pageSizeOptions:W,variant:U,size:N,label:R},B=r.useRef({paginationProps:$,position:w,align:D});return B.current={paginationProps:$,position:w,align:D},r.useMemo(()=>({transformTableContext(I){const{position:h,paginationProps:d,align:K}=B.current;if(h==="none"||(d.totalPages??(d.totalItems!=null&&d.pageSize!=null?Math.ceil(d.totalItems/d.pageSize):void 0))===1&&d.hasMore!==!0)return I;const k=A=>t.jsx("div",{...F(S.wrapper,A==="below"&&S.marginTop,A==="above"&&S.marginBottom,K==="center"&&S.alignCenter,K==="end"&&S.alignEnd,K==="start"&&S.alignStart),children:t.jsx(_,{...d})});return t.jsxs(t.Fragment,{children:[(h==="above"||h==="both")&&k("above"),I,(h==="below"||h==="both")&&k("below")]})}}),[])}function u(e,n,a){const s=Number.isFinite(a)?Math.max(1,Math.floor(a)):10,o=(n-1)*s;return e.slice(o,o+s)}const i=Array.from({length:50},(e,n)=>({id:String(n+1),name:`User ${n+1}`,email:`user${n+1}@example.com`,role:["Engineer","Designer","Manager","Admin","Analyst"][n%5]})),p=[{key:"name",header:"Name"},{key:"email",header:"Email"},{key:"role",header:"Role"}];function O({variant:e="pages",position:n="below",align:a="start"}){const[s,o]=r.useState(1),m=10,c=g({page:s,onPageChange:o,totalItems:i.length,pageSize:m,variant:e,position:n,align:a});return t.jsx(l,{data:u(i,s,m),columns:p,idKey:"id",plugins:{pagination:c}})}const Pe={title:"Core/TablePagination",tags:["autodocs"]},P={render:()=>{const[e,n]=r.useState(1),a=10,s=g({page:e,onPageChange:n,totalItems:i.length,pageSize:a});return t.jsx("div",{style:{maxWidth:600},children:t.jsx(l,{data:u(i,e,a),columns:p,idKey:"id",plugins:{pagination:s}})})}},b={render:()=>{const[e,n]=r.useState(1),a=10,s=i.slice((e-1)*a,e*a),o=g({page:e,onPageChange:n,totalItems:i.length,pageSize:a});return t.jsxs("div",{style:{maxWidth:600},children:[t.jsx("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:"Server-side: data is pre-sliced, no paginatedData() needed."}),t.jsx(l,{data:s,columns:p,idKey:"id",plugins:{pagination:o}})]})}},x={render:()=>{const[e,n]=r.useState(1),[a,s]=r.useState(10),o=g({page:e,onPageChange:n,totalItems:i.length,pageSize:a,onPageSizeChange:s,pageSizeOptions:[5,10,25,50]});return t.jsx("div",{style:{maxWidth:600},children:t.jsx(l,{data:u(i,e,a),columns:p,idKey:"id",plugins:{pagination:o}})})}},z={render:()=>{const[e,n]=r.useState(1),a=10,s=e*a<i.length,o=g({page:e,onPageChange:n,hasMore:s,pageSize:a});return t.jsxs("div",{style:{maxWidth:600},children:[t.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Cursor-based: total unknown, only hasMore=",String(s),"."]}),t.jsx(l,{data:u(i,e,a),columns:p,idKey:"id",plugins:{pagination:o}})]})}},f={render:()=>{const[e,n]=r.useState(1),a=10,s=g({page:e,onPageChange:n,totalItems:i.length,pageSize:a,position:"above"});return t.jsx("div",{style:{maxWidth:600},children:t.jsx(l,{data:u(i,e,a),columns:p,idKey:"id",plugins:{pagination:s}})})}},j={render:()=>{const[e,n]=r.useState(1),a=10,s=g({page:e,onPageChange:n,totalItems:i.length,pageSize:a,position:"both"});return t.jsx("div",{style:{maxWidth:600},children:t.jsx(l,{data:u(i,e,a),columns:p,idKey:"id",plugins:{pagination:s}})})}},T={render:()=>{const[e,n]=r.useState(1),[a,s]=r.useState(new Set),o=10,m=g({page:e,onPageChange:n,totalItems:i.length,pageSize:o}),c=u(i,e,o),{selectionConfig:C}=q({data:c,idKey:"id",selectedKeys:a,setSelectedKeys:s}),W=G(C);return t.jsxs("div",{style:{maxWidth:600},children:[t.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Pagination + Selection composed. Selected: ",a.size]}),t.jsx(l,{data:c,columns:p,idKey:"id",plugins:{selection:W,pagination:m}})]})}},v={argTypes:{variant:{control:"select",options:["pages","count","compact","dots","none"],description:"What appears between prev/next buttons"},position:{control:"select",options:["below","above","both","none"],description:"Where pagination renders relative to the table"},align:{control:"select",options:["start","center","end"],description:"Horizontal alignment of the pagination controls"}},args:{variant:"pages",position:"below",align:"center"},render:e=>t.jsx("div",{style:{maxWidth:700},children:t.jsx(O,{variant:e.variant,position:e.position,align:e.align})})},H=["pages","count","compact","dots"],L=["below","above","both"],V=["start","center","end"],y={render:()=>t.jsx("div",{style:{fontFamily:"sans-serif",maxWidth:700},children:H.flatMap(e=>L.flatMap(n=>V.map(a=>t.jsxs("div",{style:{marginBottom:48,paddingBottom:48,borderBottom:"1px solid #e5e5e5"},children:[t.jsx("div",{style:{display:"inline-flex",gap:8,marginBottom:12,flexWrap:"wrap"},children:[{label:"variant",value:e},{label:"position",value:n},{label:"align",value:a}].map(({label:s,value:o})=>t.jsxs("span",{style:{fontSize:11,fontFamily:"monospace",background:"#f0f0f0",borderRadius:4,padding:"2px 6px",color:"#555"},children:[s,'="',o,'"']},s))}),t.jsx(O,{variant:e,position:n,align:a})]},`${e}-${n}-${a}`))))})};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Interactive playground — use the controls panel to explore every combination
of variant, position, and align.`,...v.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"All variant × position × align combinations in one scrollable view.\nOne row per combination, labelled clearly. The `none` values are omitted.",...y.parameters?.docs?.description}}};const be=["Default","ServerSide","PageSizeSelector","CursorBased","PositionAbove","PositionBoth","WithSelection","Playground","OptionsMatrix"];export{z as CursorBased,P as Default,y as OptionsMatrix,x as PageSizeSelector,v as Playground,f as PositionAbove,j as PositionBoth,b as ServerSide,T as WithSelection,be as __namedExportsOrder,Pe as default};
