import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{a as n,d as r,f as i,g as a,h as o,m as s,p as c,r as l}from"./_data-DNraWrUw.js";import{n as u,t as d}from"./line-BJMqy3Wb.js";import{n as f,t as p}from"./band-cSHU9vBB.js";var m,h,g,_;function v(){return(v=e((()=>{a(),f(),d(),i(),s(),l(),m=t(),h={title:`Charts/Band`,component:o},g={render:()=>(0,m.jsx)(o,{data:n,xKey:`x`,title:`Forecast with confidence bands`,series:[p({upper:`upper95`,lower:`lower95`,color:`#3b82f6`,opacity:.12}),p({upper:`upper80`,lower:`lower80`,color:`#3b82f6`,opacity:.22}),u(`mean`,{color:`#3b82f6`,strokeWidth:2})],grid:(0,m.jsx)(r,{}),axes:(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c,{position:`bottom`}),(0,m.jsx)(c,{position:`left`})]}),height:320})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={predictionData} xKey="x" title="Forecast with confidence bands" series={[band({
    upper: 'upper95',
    lower: 'lower95',
    color: '#3b82f6',
    opacity: 0.12
  }), band({
    upper: 'upper80',
    lower: 'lower80',
    color: '#3b82f6',
    opacity: 0.22
  }), line('mean', {
    color: '#3b82f6',
    strokeWidth: 2
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={320} />
}`,...g.parameters?.docs?.source},description:{story:`Confidence bands (80% + 95%) around a forecast line.`,...g.parameters?.docs?.description}}},_=[`ConfidenceBands`]})))()}v();export{g as ConfidenceBands,_ as __namedExportsOrder,h as default};