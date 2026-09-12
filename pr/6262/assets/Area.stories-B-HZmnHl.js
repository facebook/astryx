import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,C as r,E as i,O as a,t as o,v as s}from"./src-CY0UQKur.js";import{i as c,r as l}from"./_data-DTSixHX1.js";var u,d,f,p,m,h;e((()=>{o(),l(),u=t(),d={title:`Charts/Area`,component:n},f=(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(a,{position:`bottom`}),(0,u.jsx)(a,{position:`left`})]}),p={render:()=>(0,u.jsx)(n,{data:c,xKey:`month`,title:`Revenue over time`,series:[s(`revenue`,{color:`#3b82f6`,gradient:!0}),r(`revenue`,{color:`#3b82f6`})],grid:(0,u.jsx)(i,{}),axes:f,height:300})},m={render:()=>(0,u.jsx)(n,{data:c,xKey:`month`,title:`Revenue & Costs`,series:[s(`revenue`,{color:`#3b82f6`,stack:`total`,label:`Revenue`}),s(`costs`,{color:`#ef4444`,stack:`total`,label:`Costs`})],legend:!0,grid:(0,u.jsx)(i,{}),axes:f,height:300})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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