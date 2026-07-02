import{ah as v,a1 as n}from"./iframe-Cw8JXX6x.js";import{D as T,T as w,p as m}from"./Table-Beogfujq.js";import{u as L}from"./useTableColumnResize-CM2Ox5Y2.js";import"./preload-helper-Ct5FWWRu.js";import"./ContextMenu-Cje6WKDr.js";import"./renderDropdownItems-Dejv9C11.js";import"./Divider-CXkzIgPQ.js";import"./Item-CXatCzfh.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-D1vlaBt6.js";import"./useTypeahead-B3b6_BOq.js";import"./EmptyState-DYORGikM.js";function D(e){const r=e.width;return r?r.type==="pixel"?r.value:r.minWidth??T:T}function A(e,r){if(!e||e.length===0||r.length===0)return null;let i=-1;for(let s=0;s<e.length;s++)r.includes(e[s].key)&&(i=s);if(i===-1)return null;const o=new Map;let a=0;for(let s=0;s<=i;s++)o.set(e[s].key,a),a+=D(e[s]);return o}function M(e,r){if(!e||e.length===0||r.length===0)return null;let i=-1;for(let s=0;s<e.length;s++)if(r.includes(e[s].key)){i=s;break}if(i===-1)return null;const o=new Map;let a=0;for(let s=e.length-1;s>=i;s--)o.set(e[s].key,a),a+=D(e[s]);return o}function N(e,r,i,o){const a=A(e,i);if(a?.has(r))return{edge:"start",offset:a.get(r)??0};const s=M(e,o);return s?.has(r)?{edge:"end",offset:s.get(r)??0}:null}const I="--table-sticky-shadow-start",$="--table-sticky-shadow-end",P={cell:{kVAEAm:"astryx7wzq59",kWkggS:"astryx1fd97le",kgeoSG:"astryx1cpjm7i",kEoFBp:"astryx1hmns74",kFcpXp:"astryxxx281p",kpsdNU:null,kSJ0CW:null,koaPKo:null,k75S9Q:null,kLBHJ3:null,kGOzcv:null,k96MEf:null,k5Ofw7:null,kxmVGU:"astryxy5mcqj",km8f2m:"astryxkk1bqk",kLkRvE:"astryx1uvfo0n",k7KCAZ:"astryxxcwgru",kKXxxB:"astryx1y1nw7a",kqUdNP:"astryxa5v58t",kHypHr:"astryxx83zyx",kVQacm:"astryx1rea2x4",kXHlph:null,kORKVm:null,$$css:!0},headerCell:{kY2c9j:"astryxzkaem6",$$css:!0},bodyCell:{kY2c9j:"astryx1vjfegm",$$css:!0}},R={start:{k5JduY:"astryx1s928wv",kwXMNM:"astryx1j6awrg",k3foIR:"astryx1m1drc7",k8Iv0R:"astryx1xrz1ek",kH8aOt:"astryx1unh1gc",kH8cDV:null,kLxBhq:null,kkgrvl:"astryxzkji8o",kLigFv:"astryx1qyefdi",kloYau:"astryx2q1x1w",kFJxch:"astryx17s1k9h",kNpwOb:null,kdBEeP:null,kPNhGg:null,kRicXK:null,kA8PQs:null,kypkao:"astryx1sggmfs",kNctxI:"astryx156sm4c",$$css:!0},end:{k5JduY:"astryx1s928wv",kwXMNM:"astryx1j6awrg",k3foIR:"astryx1m1drc7",k8Iv0R:"astryx1xrz1ek",kc1e00:"astryx1iygr5g",kH8cDV:null,kLxBhq:null,kkgrvl:"astryxzkji8o",kLigFv:"astryxvs0bi2",kloYau:"astryx2q1x1w",kFJxch:"astryx17s1k9h",kNpwOb:null,kdBEeP:null,kPNhGg:null,kRicXK:null,kA8PQs:null,kypkao:"astryx1c2idit",kNctxI:"astryx14ofgck",$$css:!0}},O=[];function C(e){const{startKeys:r,endKeys:i}=e,o=r??O,a=i??O,s=o.length>0,z=a.length>0,y=v.useRef({start:o,end:a,hasStart:s,hasEnd:z});y.current={start:o,end:a,hasStart:s,hasEnd:z};const K=v.useRef(null),j=v.useCallback(t=>{if(K.current?.(),K.current=null,!t)return;const l=()=>{const{hasStart:d,hasEnd:c}=y.current,h=t.scrollWidth-t.clientWidth,W=h>1;d&&t.style.setProperty(I,W&&t.scrollLeft>1?"1":"0"),c&&t.style.setProperty($,W&&t.scrollLeft<h-1?"1":"0")};t.addEventListener("scroll",l,{passive:!0});const u=typeof ResizeObserver<"u"?new ResizeObserver(l):null;u?.observe(t),l(),K.current=()=>{t.removeEventListener("scroll",l),u?.disconnect()}},[]);return v.useMemo(()=>({transformHeaderCell(t,l){const{start:u,end:d}=y.current,c=N(t.columns,l.key,u,d);if(!c)return t;const h=c.edge==="start"?{insetInlineStart:`${c.offset}px`}:{insetInlineEnd:`${c.offset}px`};return{...t,htmlProps:{...t.htmlProps,style:{...t.htmlProps.style,...h}},styles:[...t.styles,P.cell,P.headerCell,c.edge==="start"?R.start:R.end]}},transformBodyCell(t,l){const{start:u,end:d}=y.current,c=N(t.columns,l.key,u,d);if(!c)return t;const h=c.edge==="start"?{insetInlineStart:`${c.offset}px`}:{insetInlineEnd:`${c.offset}px`};return{...t,htmlProps:{...t.htmlProps,style:{...t.htmlProps.style,...h}},styles:[...t.styles,P.cell,P.bodyCell,c.edge==="start"?R.start:R.end]}},transformScrollWrapper(t){if(!y.current.hasStart&&!y.current.hasEnd)return t;const l=t.htmlProps.ref,u=d=>{j(d),typeof l=="function"?l(d):l!=null&&(l.current=d)};return{...t,htmlProps:{...t.htmlProps,ref:u}}}}),[j])}const b=[{id:"1",name:"Alice Nguyen",email:"alice@example.com",team:"Design Systems",role:"Staff Engineer",location:"San Francisco",startDate:"2019-03-12",manager:"Priya Patel",status:"Active"},{id:"2",name:"Bob Martinez",email:"bob@example.com",team:"Design Systems",role:"Senior Designer",location:"New York",startDate:"2020-07-01",manager:"Priya Patel",status:"Active"},{id:"3",name:"Charlie Okafor",email:"charlie@example.com",team:"Platform",role:"Engineering Manager",location:"London",startDate:"2017-11-20",manager:"Sam Lee",status:"On leave"},{id:"4",name:"Diana Rossi",email:"diana@example.com",team:"Platform",role:"Staff Engineer",location:"Remote",startDate:"2021-01-15",manager:"Sam Lee",status:"Active"},{id:"5",name:"Ehsan Karimi",email:"ehsan@example.com",team:"Growth",role:"Product Engineer",location:"Berlin",startDate:"2022-05-30",manager:"Mei Chen",status:"Active"}],p=[{key:"name",header:"Name",width:m(180)},{key:"email",header:"Email",width:m(220)},{key:"team",header:"Team",width:m(180)},{key:"role",header:"Role",width:m(200)},{key:"location",header:"Location",width:m(160)},{key:"startDate",header:"Start date",width:m(140)},{key:"manager",header:"Manager",width:m(180)},{key:"status",header:"Status",width:m(140)}],Z={title:"Core/TableStickyColumns",tags:["autodocs"]},E={marginBottom:8,fontSize:14,color:"#666"},k={render:()=>{const e=C({startKeys:["name"]});return n.jsxs("div",{style:{maxWidth:720},children:[n.jsxs("p",{style:E,children:[n.jsx("code",{children:"startKeys: ['name']"})," — scroll right to see the Name column stay pinned with a drop shadow."]}),n.jsx(w,{data:b,columns:p,idKey:"id",plugins:{stickyColumns:e}})]})}},f={render:()=>{const e=C({endKeys:["status"]});return n.jsxs("div",{style:{maxWidth:720},children:[n.jsxs("p",{style:E,children:[n.jsx("code",{children:"endKeys: ['status']"})," — the Status column stays pinned to the right edge while the rest scrolls."]}),n.jsx(w,{data:b,columns:p,idKey:"id",plugins:{stickyColumns:e}})]})}},g={render:()=>{const e=C({startKeys:["name","email"],endKeys:["status"]});return n.jsxs("div",{style:{maxWidth:720},children:[n.jsxs("p",{style:E,children:[n.jsx("code",{children:"startKeys: ['name', 'email']"})," +"," ",n.jsx("code",{children:"endKeys: ['status']"})," — two columns pinned left with cumulative offsets, one pinned right."]}),n.jsx(w,{data:b,columns:p,idKey:"id",plugins:{stickyColumns:e}})]})}},x={render:()=>{const[e,r]=v.useState({}),i=L({columnWidths:e,columns:p,onColumnResizeEnd:a=>r(s=>({...s,...a}))}),o=C({startKeys:["name"]});return n.jsxs("div",{style:{maxWidth:720},children:[n.jsxs("p",{style:E,children:["Resize columns by dragging header edges; the pinned Name column stays sticky. Plugins compose:"," ",n.jsx("code",{children:"{ columnResize, stickyColumns }"}),"."]}),n.jsx(w,{data:b,columns:p,idKey:"id",plugins:{columnResize:i,stickyColumns:o}})]})}},S={render:()=>{const e=C({});return n.jsxs("div",{style:{maxWidth:720},children:[n.jsxs("p",{style:E,children:[n.jsxs("code",{children:["useTableStickyColumns(","{}",")"]})," — no pinned columns; the table behaves as if the plugin weren't installed."]}),n.jsx(w,{data:b,columns:p,idKey:"id",plugins:{stickyColumns:e}})]})}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({
      startKeys: ['name']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>startKeys: ['name']</code> — scroll right to see the Name column
          stay pinned with a drop shadow.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...k.parameters?.docs?.source},description:{story:"Pin the leading `Name` column to the start edge. Scroll horizontally — the\nname stays put and a drop shadow appears over the scrolling content.",...k.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({
      endKeys: ['status']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>endKeys: ['status']</code> — the Status column stays pinned to
          the right edge while the rest scrolls.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...f.parameters?.docs?.source},description:{story:"Pin the trailing `Status` column to the end edge.",...f.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({
      startKeys: ['name', 'email'],
      endKeys: ['status']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>startKeys: ['name', 'email']</code> +{' '}
          <code>endKeys: ['status']</code> — two columns pinned left with
          cumulative offsets, one pinned right.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...g.parameters?.docs?.source},description:{story:"Pin both edges at once. `startKeys`/`endKeys` each define a contiguous run\nfrom their edge inward; columns get cumulative offsets so multiple pinned\ncolumns stack correctly.",...g.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resize = useTableColumnResize<Employee>({
      columnWidths,
      columns: columns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates => setColumnWidths(prev => ({
        ...prev,
        ...updates
      }))
    });
    const sticky = useTableStickyColumns<Employee>({
      startKeys: ['name']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          Resize columns by dragging header edges; the pinned Name column stays
          sticky. Plugins compose:{' '}
          <code>{'{ columnResize, stickyColumns }'}</code>.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        columnResize: resize,
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...x.parameters?.docs?.source},description:{story:`Sticky columns composed with column resize. Resizing a pinned column keeps it
pinned; the plugin order (sticky after resize) ensures the sticky inline
offset wins over the resize handle's inline width.`,...x.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({});
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>useTableStickyColumns({'{}'})</code> — no pinned columns; the
          table behaves as if the plugin weren't installed.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...S.parameters?.docs?.source},description:{story:`Empty config is a valid no-op — nothing is pinned, every cell passes through
untouched. Lets callers compute keys conditionally without branching on
whether to install the plugin.`,...S.parameters?.docs?.description}}};const ee=["PinStart","PinEnd","PinBothEdges","WithColumnResize","NoOpEmptyConfig"];export{S as NoOpEmptyConfig,g as PinBothEdges,f as PinEnd,k as PinStart,x as WithColumnResize,ee as __namedExportsOrder,Z as default};
