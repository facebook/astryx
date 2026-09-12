import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{i as n}from"./columnUtils-cuTFfh7_.js";import{t as r}from"./Table-D9iKVpqq.js";import{jt as i,kt as a,ut as o}from"./iframe-DWEweYTA.js";var s,c,l,u,d,f,p,m,h,g,_,v;e((()=>{o(),s=t(),c=[`Bay`,`Ridge`,`Harbor`,`Mesa`],l=[`A. Nguyen`,`B. Martinez`,`C. Okafor`,`D. Silva`],u=Array.from({length:40},(e,t)=>({id:String(t+1),sensor:`SNR-${String(t+1).padStart(3,`0`)}`,site:c[t%c.length],reading:`${(18+t%9*1.4).toFixed(1)} °C`,threshold:`${(24+t%4).toFixed(1)} °C`,drift:`${(t%7*.13).toFixed(2)}`,calibrated:`2026-0${t%9+1}-1${t%10}`,owner:l[t%l.length]})),d=[{key:`sensor`,header:`Sensor`,width:n(140)},{key:`site`,header:`Site`,width:n(120)},{key:`reading`,header:`Reading`,width:n(120)},{key:`threshold`,header:`Threshold`,width:n(120)},{key:`drift`,header:`Drift`,width:n(100)},{key:`calibrated`,header:`Calibrated`,width:n(160)},{key:`owner`,header:`Owner`,width:n(160)}],f={title:`Core/TableStickyHeader`,tags:[`autodocs`]},p={marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},m={render:()=>{let e=a({maxHeight:320});return(0,s.jsxs)(`div`,{children:[(0,s.jsxs)(`p`,{style:p,children:[(0,s.jsx)(`code`,{children:`maxHeight: 320`}),` — scroll the table to see the header hold at the top.`]}),(0,s.jsx)(r,{data:u,columns:d,idKey:`id`,plugins:{stickyHeader:e}})]})}},h={render:()=>{let e=a({maxHeight:`50vh`});return(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{style:p,children:(0,s.jsx)(`code`,{children:`maxHeight: '50vh'`})}),(0,s.jsx)(r,{data:u,columns:d,idKey:`id`,plugins:{stickyHeader:e}})]})}},g={render:()=>{let e=a({maxHeight:320}),t=i({startKeys:[`sensor`]});return(0,s.jsxs)(`div`,{style:{maxWidth:640},children:[(0,s.jsx)(`p`,{style:p,children:`Scroll down and right — the corner cell stays pinned on both axes.`}),(0,s.jsx)(r,{data:u,columns:d,idKey:`id`,plugins:{stickyHeader:e,stickyColumns:t}})]})}},_={render:()=>{let e=a();return(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:320},children:[(0,s.jsxs)(`p`,{style:p,children:[`No `,(0,s.jsx)(`code`,{children:`maxHeight`}),` — the surrounding 320px flex column bounds the table instead.`]}),(0,s.jsx)(`div`,{style:{flex:1,minHeight:0,display:`flex`},children:(0,s.jsx)(r,{data:u,columns:d,idKey:`id`,plugins:{stickyHeader:e}})})]})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>({
      maxHeight: 320
    });
    return <div>
        <p style={note}>
          <code>maxHeight: 320</code> — scroll the table to see the header hold
          at the top.
        </p>
        <Table data={readings} columns={columns} idKey="id" plugins={{
        stickyHeader
      }} />
      </div>;
  }
}`,...m.parameters?.docs?.source},description:{story:`Cap the scroll container and the header stays put. Scroll the table
vertically — the column headings hold at the top while rows pass under them.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>({
      maxHeight: '50vh'
    });
    return <div>
        <p style={note}>
          <code>maxHeight: '50vh'</code>
        </p>
        <Table data={readings} columns={columns} idKey="id" plugins={{
        stickyHeader
      }} />
      </div>;
  }
}`,...h.parameters?.docs?.source},description:{story:"`maxHeight` also takes any CSS length, for a table sized against the\nviewport rather than a fixed pixel count.",...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>({
      maxHeight: 320
    });
    const stickyColumns = useTableStickyColumns<Reading>({
      startKeys: ['sensor']
    });
    return <div style={{
      maxWidth: 640
    }}>
        <p style={note}>
          Scroll down and right — the corner cell stays pinned on both axes.
        </p>
        <Table data={readings} columns={columns} idKey="id" plugins={{
        stickyHeader,
        stickyColumns
      }} />
      </div>;
  }
}`,...g.parameters?.docs?.source},description:{story:`Both plugins together. Scroll in either direction: the header holds at the
top, the \`Sensor\` column holds at the start edge, and the corner where they
cross stays above both runs rather than being overdrawn by either.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 320
    }}>
        <p style={note}>
          No <code>maxHeight</code> — the surrounding 320px flex column bounds
          the table instead.
        </p>
        <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex'
      }}>
          <Table data={readings} columns={columns} idKey="id" plugins={{
          stickyHeader
        }} />
        </div>
      </div>;
  }
}`,..._.parameters?.docs?.source},description:{story:"Without `maxHeight` the plugin pins the header but adds no height cap, for\ntables whose height an ancestor already bounds. Here the wrapper supplies it.",..._.parameters?.docs?.description}}},v=[`PinHeader`,`ViewportHeight`,`WithStickyColumns`,`HeightFromAncestor`]}))();export{_ as HeightFromAncestor,m as PinHeader,h as ViewportHeight,g as WithStickyColumns,v as __namedExportsOrder,f as default};