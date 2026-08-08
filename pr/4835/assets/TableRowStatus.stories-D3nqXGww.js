import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Icon-C24cO4CC.js";import{r as s,t as c}from"./Tooltip-Ypc-fkfG.js";import{a as l,i as u,r as d}from"./columnUtils-BDDG7zo5.js";import{n as f,t as p}from"./Table-ClbWztQk.js";function m(e){return v[e]??e}function h(e){let{getStatus:t}=e;return(0,g.useMemo)(()=>({transformColumns(e){return[{key:`__rowStatus`,header:``,width:b,resizable:!1,renderCell:e=>{let r=t(e);if(!r)return null;let i=r.icon?(0,_.jsx)(o,{icon:r.icon,size:`xsm`,color:y[r.color]??`primary`}):(0,_.jsx)(`span`,{...n(S.dot(m(r.color)))});return(0,_.jsx)(c,{content:r.label,children:(0,_.jsx)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k`,role:`img`,"aria-label":r.label,children:i})})}},...e]}}),[t])}var g,_,v,y,b,x,S;function C(){return(C=e((()=>{g=t(),r(),a(),s(),_=i(),v={accent:`var(--color-icon-accent)`,success:`var(--color-icon-green)`,error:`var(--color-icon-red)`,warning:`var(--color-icon-orange)`,red:`var(--color-icon-red)`,orange:`var(--color-icon-orange)`,green:`var(--color-icon-green)`,yellow:`var(--color-icon-yellow)`,blue:`var(--color-icon-blue)`,gray:`var(--color-icon-gray)`},y={accent:`accent`,success:`success`,error:`error`,warning:`warning`,red:`red`,orange:`warning`,green:`green`,yellow:`warning`,blue:`blue`,gray:`gray`},b={type:`pixel`,value:28},x={kzqmXN:`astryx1xc55vz`,kZKoxP:`astryxdk7pt`,kaIpWk:`astryx16rqkct`,krdFHd:``,kfmiAY:``,kVL7Gh:``,kT0f0o:``,kIxVMA:``,ksF3WI:``,kqGeR4:``,kYm2EN:``,kmuXW:`astryx2lah0s`,$$css:!0},S={dot:e=>[x,{kWkggS:e==null?e:`astryxl8spv7`,$$css:!0},{"--x-backgroundColor":e??void 0}]}})))()}function w(e){switch(e.state){case`failed`:return{color:`error`,icon:`error`,label:`Failed`};case`running`:return{color:`warning`,icon:`warning`,label:`Running`};case`queued`:return{color:`gray`,label:`Queued`};default:return null}}var T,E,D,O,k,A,j;function M(){return(M=e((()=>{f(),C(),d(),T=i(),E=[{id:`j1`,name:`build-core`,owner:`Ava`,state:`failed`},{id:`j2`,name:`lint`,owner:`Liam`,state:`running`},{id:`j3`,name:`unit-tests`,owner:`Zoe`,state:`succeeded`},{id:`j4`,name:`docsite-deploy`,owner:`Max`,state:`queued`},{id:`j5`,name:`smoke-test`,owner:`Mia`,state:`succeeded`}],D=[{key:`name`,header:`Job`,width:l(2)},{key:`owner`,header:`Owner`,width:u(120)},{key:`state`,header:`State`,width:u(120)}],O={title:`Core/TableRowStatus`,tags:[`autodocs`]},k={render:()=>{let e=h({getStatus:w});return(0,T.jsx)(p,{data:E,columns:D,idKey:`id`,hasHover:!0,plugins:{rowStatus:e}})}},A={render:()=>{let e=h({getStatus:e=>e.state===`failed`?{color:`#dc2626`,label:`Failed`}:e.state===`running`?{color:`#f59e0b`,label:`Running`}:null});return(0,T.jsx)(p,{data:E,columns:D,idKey:`id`,hasHover:!0,plugins:{rowStatus:e}})}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowStatus = useTableRowStatus<Job>({
      getStatus: jobStatus
    });
    return <Table data={jobs} columns={columns} idKey="id" hasHover plugins={{
      rowStatus
    }} />;
  }
}`,...k.parameters?.docs?.source},description:{story:"A small colored dot in a leading gutter column signals per-row status.\nRows whose `getStatus` returns `null` (here: succeeded jobs) show no dot.\nHover a dot to see its accessible label.",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowStatus = useTableRowStatus<Job>({
      getStatus: job => job.state === 'failed' ? {
        color: '#dc2626',
        label: 'Failed'
      } : job.state === 'running' ? {
        color: '#f59e0b',
        label: 'Running'
      } : null
    });
    return <Table data={jobs} columns={columns} idKey="id" hasHover plugins={{
      rowStatus
    }} />;
  }
}`,...A.parameters?.docs?.source},description:{story:`Any CSS color works: here raw hex values instead of theme tokens.`,...A.parameters?.docs?.description}}},j=[`Default`,`RawColors`]})))()}M();export{k as Default,A as RawColors,j as __namedExportsOrder,O as default};