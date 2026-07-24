import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,M as r,O as i,T as a,b as o,t as s}from"./src-DBVQ-sLB.js";import{i as c,r as l}from"./_data-DTSixHX1.js";var u,d,f,p,m,h;e((()=>{s(),l(),u=t(),d={title:`Charts/Area`,component:r},f=(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(n,{position:`bottom`}),(0,u.jsx)(n,{position:`left`})]}),p={render:()=>(0,u.jsx)(r,{data:c,xKey:`month`,title:`Revenue over time`,series:[o(`revenue`,{color:`#3b82f6`,gradient:!0}),a(`revenue`,{color:`#3b82f6`})],grid:(0,u.jsx)(i,{}),axes:f,height:300})},m={render:()=>(0,u.jsx)(r,{data:c,xKey:`month`,title:`Revenue & Costs`,series:[o(`revenue`,{color:`#3b82f6`,stack:`total`,label:`Revenue`}),o(`costs`,{color:`#ef4444`,stack:`total`,label:`Costs`})],legend:!0,grid:(0,u.jsx)(i,{}),axes:f,height:300})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue over time" series={[area('revenue', {
    color: '#3b82f6',
    gradient: true
  }), line('revenue', {
    color: '#3b82f6'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue & Costs" series={[area('revenue', {
    color: '#3b82f6',
    stack: 'total',
    label: 'Revenue'
  }), area('costs', {
    color: '#ef4444',
    stack: 'total',
    label: 'Costs'
  })]} legend grid={<ChartGrid />} axes={axes} height={300} />
}`,...m.parameters?.docs?.source}}},h=[`Gradient`,`Stacked`]}))();export{p as Gradient,m as Stacked,h as __namedExportsOrder,d as default};