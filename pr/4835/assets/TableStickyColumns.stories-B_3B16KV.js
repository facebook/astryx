import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{i as r,r as i}from"./columnUtils-BDDG7zo5.js";import{n as a,t as o}from"./Table-ClbWztQk.js";import{n as s,t as c}from"./useTableColumnResize-xrKCKQfH.js";function l(e){let t=e.width;return t?t.type===`pixel`?t.value:t.minWidth??120:120}function u(e,t){if(!e||e.length===0||t.length===0)return null;let n=-1;for(let r=0;r<e.length;r++)t.includes(e[r].key)&&(n=r);if(n===-1)return null;let r=new Map,i=0;for(let t=0;t<=n;t++)r.set(e[t].key,i),i+=l(e[t]);return r}function d(e,t){if(!e||e.length===0||t.length===0)return null;let n=-1;for(let r=0;r<e.length;r++)if(t.includes(e[r].key)){n=r;break}if(n===-1)return null;let r=new Map,i=0;for(let t=e.length-1;t>=n;t--)r.set(e[t].key,i),i+=l(e[t]);return r}function f(e,t,n,r){let i=u(e,n);if(i?.has(t))return{edge:`start`,offset:i.get(t)??0};let a=d(e,r);return a?.has(t)?{edge:`end`,offset:a.get(t)??0}:null}function p(e){let{startKeys:t,endKeys:n}=e,r=t??y,i=n??y,a=r.length>0,o=i.length>0,s=(0,m.useRef)({start:r,end:i,hasStart:a,hasEnd:o});s.current={start:r,end:i,hasStart:a,hasEnd:o};let c=(0,m.useRef)(null),l=(0,m.useCallback)(e=>{if(c.current?.(),c.current=null,!e)return;let t=()=>{let{hasStart:t,hasEnd:n}=s.current,r=e.scrollWidth-e.clientWidth,i=r>1,a=Math.abs(e.scrollLeft);t&&e.style.setProperty(h,i&&a>1?`1`:`0`),n&&e.style.setProperty(g,i&&a<r-1?`1`:`0`)};e.addEventListener(`scroll`,t,{passive:!0});let n=typeof ResizeObserver<`u`?new ResizeObserver(t):null;n?.observe(e),t(),c.current=()=>{e.removeEventListener(`scroll`,t),n?.disconnect()}},[]);return(0,m.useMemo)(()=>({transformHeaderCell(e,t){let{start:n,end:r}=s.current,i=f(e.columns,t.key,n,r);if(!i)return e;let a=i.edge===`start`?{insetInlineStart:`${i.offset}px`}:{insetInlineEnd:`${i.offset}px`};return{...e,htmlProps:{...e.htmlProps,style:{...e.htmlProps.style,...a}},xstyle:[...e.xstyle,_.cell,_.headerCell,i.edge===`start`?v.start:v.end]}},transformBodyCell(e,t){let{start:n,end:r}=s.current,i=f(e.columns,t.key,n,r);if(!i)return e;let a=i.edge===`start`?{insetInlineStart:`${i.offset}px`}:{insetInlineEnd:`${i.offset}px`};return{...e,htmlProps:{...e.htmlProps,style:{...e.htmlProps.style,...a}},xstyle:[...e.xstyle,_.cell,_.bodyCell,i.edge===`start`?v.start:v.end]}},transformScrollWrapper(e){if(!s.current.hasStart&&!s.current.hasEnd)return e;let t=e.htmlProps.ref,n=e=>{l(e),typeof t==`function`?t(e):t!=null&&(t.current=e)};return{...e,htmlProps:{...e.htmlProps,ref:n}}}}),[l])}var m,h,g,_,v,y;function b(){return(b=e((()=>{m=t(),i(),h=`--table-sticky-shadow-start`,g=`--table-sticky-shadow-end`,_={cell:{kVAEAm:`astryx7wzq59`,kWkggS:`astryx1fd97le`,kgeoSG:`astryx1cpjm7i`,kEoFBp:`astryx1hmns74`,kFcpXp:`astryxxx281p`,kpsdNU:null,kSJ0CW:null,koaPKo:null,k75S9Q:null,kLBHJ3:null,kGOzcv:null,k96MEf:null,k5Ofw7:null,kxmVGU:`astryxy5mcqj`,km8f2m:`astryxkk1bqk`,kLkRvE:`astryx1uvfo0n`,k7KCAZ:`astryxxcwgru`,kKXxxB:`astryx1y1nw7a`,kqUdNP:`astryxa5v58t`,kHypHr:`astryxx83zyx`,kVQacm:`astryx1rea2x4`,kXHlph:null,kORKVm:null,$$css:!0},headerCell:{kY2c9j:`astryxzkaem6`,$$css:!0},bodyCell:{kY2c9j:`astryx1vjfegm`,$$css:!0}},v={start:{k5JduY:`astryx1s928wv`,kwXMNM:`astryx1j6awrg`,k3foIR:`astryx1m1drc7`,k8Iv0R:`astryx1xrz1ek`,kH8aOt:`astryx1unh1gc`,kH8cDV:null,kLxBhq:null,kkgrvl:`astryxzkji8o`,kLigFv:`astryx1qyefdi astryx1c108yo`,kloYau:`astryx2q1x1w`,kFJxch:`astryx17s1k9h`,kNpwOb:null,kdBEeP:null,kPNhGg:null,kRicXK:null,kA8PQs:null,kypkao:`astryx1sggmfs`,kNctxI:`astryx156sm4c astryx1yg02dn`,$$css:!0},end:{k5JduY:`astryx1s928wv`,kwXMNM:`astryx1j6awrg`,k3foIR:`astryx1m1drc7`,k8Iv0R:`astryx1xrz1ek`,kc1e00:`astryx1iygr5g`,kH8cDV:null,kLxBhq:null,kkgrvl:`astryxzkji8o`,kLigFv:`astryxvs0bi2 astryx12ayhd5`,kloYau:`astryx2q1x1w`,kFJxch:`astryx17s1k9h`,kNpwOb:null,kdBEeP:null,kPNhGg:null,kRicXK:null,kA8PQs:null,kypkao:`astryx1c2idit`,kNctxI:`astryx14ofgck astryx169mozk`,$$css:!0}},y=[]})))()}var x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{x=t(),a(),b(),c(),i(),S=n(),C=[{id:`1`,name:`Alice Nguyen`,email:`alice@example.com`,team:`Design Systems`,role:`Staff Engineer`,location:`San Francisco`,startDate:`2019-03-12`,manager:`Priya Patel`,status:`Active`},{id:`2`,name:`Bob Martinez`,email:`bob@example.com`,team:`Design Systems`,role:`Senior Designer`,location:`New York`,startDate:`2020-07-01`,manager:`Priya Patel`,status:`Active`},{id:`3`,name:`Charlie Okafor`,email:`charlie@example.com`,team:`Platform`,role:`Engineering Manager`,location:`London`,startDate:`2017-11-20`,manager:`Sam Lee`,status:`On leave`},{id:`4`,name:`Diana Rossi`,email:`diana@example.com`,team:`Platform`,role:`Staff Engineer`,location:`Remote`,startDate:`2021-01-15`,manager:`Sam Lee`,status:`Active`},{id:`5`,name:`Ehsan Karimi`,email:`ehsan@example.com`,team:`Growth`,role:`Product Engineer`,location:`Berlin`,startDate:`2022-05-30`,manager:`Mei Chen`,status:`Active`}],w=[{key:`name`,header:`Name`,width:r(180)},{key:`email`,header:`Email`,width:r(220)},{key:`team`,header:`Team`,width:r(180)},{key:`role`,header:`Role`,width:r(200)},{key:`location`,header:`Location`,width:r(160)},{key:`startDate`,header:`Start date`,width:r(140)},{key:`manager`,header:`Manager`,width:r(180)},{key:`status`,header:`Status`,width:r(140)}],T={title:`Core/TableStickyColumns`,tags:[`autodocs`]},E={marginBottom:8,fontSize:14,color:`#666`},D={render:()=>{let e=p({startKeys:[`name`]});return(0,S.jsxs)(`div`,{style:{maxWidth:720},children:[(0,S.jsxs)(`p`,{style:E,children:[(0,S.jsx)(`code`,{children:`startKeys: ['name']`}),` — scroll right to see the Name column stay pinned with a drop shadow.`]}),(0,S.jsx)(o,{data:C,columns:w,idKey:`id`,plugins:{stickyColumns:e}})]})}},O={render:()=>{let e=p({endKeys:[`status`]});return(0,S.jsxs)(`div`,{style:{maxWidth:720},children:[(0,S.jsxs)(`p`,{style:E,children:[(0,S.jsx)(`code`,{children:`endKeys: ['status']`}),` — the Status column stays pinned to the right edge while the rest scrolls.`]}),(0,S.jsx)(o,{data:C,columns:w,idKey:`id`,plugins:{stickyColumns:e}})]})}},k={render:()=>{let e=p({startKeys:[`name`,`email`],endKeys:[`status`]});return(0,S.jsxs)(`div`,{style:{maxWidth:720},children:[(0,S.jsxs)(`p`,{style:E,children:[(0,S.jsx)(`code`,{children:`startKeys: ['name', 'email']`}),` +`,` `,(0,S.jsx)(`code`,{children:`endKeys: ['status']`}),` — two columns pinned left with cumulative offsets, one pinned right.`]}),(0,S.jsx)(o,{data:C,columns:w,idKey:`id`,plugins:{stickyColumns:e}})]})}},A={render:()=>{let[e,t]=(0,x.useState)({}),n=s({columnWidths:e,columns:w,onColumnResizeEnd:e=>t(t=>({...t,...e}))}),r=p({startKeys:[`name`]});return(0,S.jsxs)(`div`,{style:{maxWidth:720},children:[(0,S.jsxs)(`p`,{style:E,children:[`Resize columns by dragging header edges; the pinned Name column stays sticky. Plugins compose:`,` `,(0,S.jsx)(`code`,{children:`{ columnResize, stickyColumns }`}),`.`]}),(0,S.jsx)(o,{data:C,columns:w,idKey:`id`,plugins:{columnResize:n,stickyColumns:r}})]})}},j={render:()=>{let e=p({});return(0,S.jsxs)(`div`,{style:{maxWidth:720},children:[(0,S.jsxs)(`p`,{style:E,children:[(0,S.jsxs)(`code`,{children:[`useTableStickyColumns(`,`{}`,`)`]}),` — no pinned columns; the table behaves as if the plugin weren't installed.`]}),(0,S.jsx)(o,{data:C,columns:w,idKey:`id`,plugins:{stickyColumns:e}})]})}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:"Pin the leading `Name` column to the start edge. Scroll horizontally — the\nname stays put and a drop shadow appears over the scrolling content.",...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:"Pin the trailing `Status` column to the end edge.",...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:"Pin both edges at once. `startKeys`/`endKeys` each define a contiguous run\nfrom their edge inward; columns get cumulative offsets so multiple pinned\ncolumns stack correctly.",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Sticky columns composed with column resize. Resizing a pinned column keeps it
pinned; the plugin order (sticky after resize) ensures the sticky inline
offset wins over the resize handle's inline width.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`Empty config is a valid no-op — nothing is pinned, every cell passes through
untouched. Lets callers compute keys conditionally without branching on
whether to install the plugin.`,...j.parameters?.docs?.description}}},M=[`PinStart`,`PinEnd`,`PinBothEdges`,`WithColumnResize`,`NoOpEmptyConfig`]})))()}N();export{j as NoOpEmptyConfig,k as PinBothEdges,O as PinEnd,D as PinStart,A as WithColumnResize,M as __namedExportsOrder,T as default};