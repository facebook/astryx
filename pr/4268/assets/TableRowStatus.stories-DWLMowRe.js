import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{_ as n,g as r,t as i}from"./Table-CpG1eUw3.js";import{Et as a,ft as o}from"./iframe-1XPcLcD3.js";function s(e){switch(e.state){case`failed`:return{color:`error`,icon:`error`,label:`Failed`};case`running`:return{color:`warning`,icon:`warning`,label:`Running`};case`queued`:return{color:`gray`,label:`Queued`};default:return null}}var c,l,u,d,f,p,m;e((()=>{o(),c=t(),l=[{id:`j1`,name:`build-core`,owner:`Ava`,state:`failed`},{id:`j2`,name:`lint`,owner:`Liam`,state:`running`},{id:`j3`,name:`unit-tests`,owner:`Zoe`,state:`succeeded`},{id:`j4`,name:`docsite-deploy`,owner:`Max`,state:`queued`},{id:`j5`,name:`smoke-test`,owner:`Mia`,state:`succeeded`}],u=[{key:`name`,header:`Job`,width:n(2)},{key:`owner`,header:`Owner`,width:r(120)},{key:`state`,header:`State`,width:r(120)}],d={title:`Core/TableRowStatus`,tags:[`autodocs`]},f={render:()=>{let e=a({getStatus:s});return(0,c.jsx)(i,{data:l,columns:u,idKey:`id`,hasHover:!0,plugins:{rowStatus:e}})}},p={render:()=>{let e=a({getStatus:e=>e.state===`failed`?{color:`#dc2626`,label:`Failed`}:e.state===`running`?{color:`#f59e0b`,label:`Running`}:null});return(0,c.jsx)(i,{data:l,columns:u,idKey:`id`,hasHover:!0,plugins:{rowStatus:e}})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowStatus = useTableRowStatus<Job>({
      getStatus: jobStatus
    });
    return <Table data={jobs} columns={columns} idKey="id" hasHover plugins={{
      rowStatus
    }} />;
  }
}`,...f.parameters?.docs?.source},description:{story:"A small colored dot in a leading gutter column signals per-row status.\nRows whose `getStatus` returns `null` (here: succeeded jobs) show no dot.\nHover a dot to see its accessible label.",...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`Any CSS color works: here raw hex values instead of theme tokens.`,...p.parameters?.docs?.description}}},m=[`Default`,`RawColors`]}))();export{f as Default,p as RawColors,m as __namedExportsOrder,d as default};