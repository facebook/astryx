import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{a as n,i as r}from"./columnUtils-DaUh822W.js";import{t as i}from"./Table-Dh7tYFV6.js";import{dt as a,wt as o}from"./iframe-Y-SqSYW9.js";var s,c,l,u,d,f,p,m;e((()=>{a(),s=t(),c=[{id:`j1`,name:`build-core`,owner:`Ava`,state:`failed`},{id:`j2`,name:`lint`,owner:`Liam`,state:`running`},{id:`j3`,name:`unit-tests`,owner:`Zoe`,state:`succeeded`},{id:`j4`,name:`docsite-deploy`,owner:`Max`,state:`queued`},{id:`j5`,name:`smoke-test`,owner:`Mia`,state:`succeeded`},{id:`j6`,name:`snapshot-review`,owner:`Noah`,state:`needsAttention`}],l=[{key:`name`,header:`Job`,width:n(2)},{key:`owner`,header:`Owner`,width:r(120)},{key:`state`,header:`State`,width:r(120)}],u=e=>{switch(e.state){case`failed`:return{status:`error`,label:`Failed`};case`running`:return{color:`warning`,icon:`clock`,label:`Running`};case`queued`:return{color:`gray`,label:`Queued`};case`succeeded`:return{status:`success`,label:`Succeeded`};case`needsAttention`:return{status:`warning`,label:`Needs attention`}}},d={title:`Core/TableRowStatus`,tags:[`autodocs`]},f={render:()=>{let e=o({getStatus:u});return(0,s.jsx)(i,{data:c,columns:l,idKey:`id`,hasHover:!0,plugins:{rowStatus:e}})}},p={render:()=>{let e=o({getStatus:e=>e.state===`failed`?{color:`error`,label:`Error-colored dot`}:e.state===`running`?{color:`warning`,icon:`clock`,label:`Warning-colored clock`}:e.state===`succeeded`?{color:`success`,icon:`check`,label:`Success-colored check`}:{color:`#64748b`,label:`Custom gray dot`}});return(0,s.jsx)(i,{data:c,columns:l,idKey:`id`,hasHover:!0,plugins:{rowStatus:e}})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowStatus = useTableRowStatus<Job>({
      getStatus: jobStatus
    });
    return <Table data={jobs} columns={columns} idKey="id" hasHover plugins={{
      rowStatus
    }} />;
  }
}`,...f.parameters?.docs?.source},description:{story:`Semantic status values use the active theme's outcome glyph and tone. Custom
markers keep caller-owned paint: queued renders a dot, while running uses the
explicit clock icon. Each marker has one accessible image name from \`label\`.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowStatus = useTableRowStatus<Job>({
      getStatus: job => job.state === 'failed' ? {
        color: 'error',
        label: 'Error-colored dot'
      } : job.state === 'running' ? {
        color: 'warning',
        icon: 'clock',
        label: 'Warning-colored clock'
      } : job.state === 'succeeded' ? {
        color: 'success',
        icon: 'check',
        label: 'Success-colored check'
      } : {
        color: '#64748b',
        label: 'Custom gray dot'
      }
    });
    return <Table data={jobs} columns={columns} idKey="id" hasHover plugins={{
      rowStatus
    }} />;
  }
}`,...p.parameters?.docs?.source},description:{story:"A custom marker's color never selects its representation. Even colors named\n`error` or `success` remain dots unless the caller supplies an explicit icon.",...p.parameters?.docs?.description}}},m=[`Default`,`CustomMarkers`]}))();export{p as CustomMarkers,f as Default,m as __namedExportsOrder,d as default};