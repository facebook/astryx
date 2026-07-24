import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,E as r,M as i,O as a,T as o,p as s,t as c}from"./src-B_RoeV06.js";import{a as l,r as u,s as d}from"./_data-DTSixHX1.js";var f,p,m,h,g,_,v;e((()=>{c(),u(),f=t(),p={title:`Charts/Reference Line`,component:i},m=(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(n,{position:`bottom`}),(0,f.jsx)(n,{position:`left`})]}),h={render:()=>(0,f.jsx)(i,{data:d,xKey:`month`,title:`Sales vs target`,series:[r(`sales`,{color:`#3b82f6`}),s({y:50,label:`Target`,color:`#ef4444`})],grid:(0,f.jsx)(a,{}),axes:m,height:300})},g={render:()=>(0,f.jsx)(i,{data:d,xKey:`month`,title:`Acceptable range`,series:[r(`sales`,{color:`#3b82f6`}),s({y:40,y2:60,label:`Acceptable`,color:`#22c55e`,bandOpacity:.12})],grid:(0,f.jsx)(a,{}),axes:m,height:300})},_={render:()=>(0,f.jsx)(i,{data:l,xKey:`x`,title:`Event marker`,series:[o(`mean`,{color:`#3b82f6`}),s({x:10,label:`Launch`,color:`#6b1efd`})],grid:(0,f.jsx)(a,{}),axes:m,height:300})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={salesData} xKey="month" title="Sales vs target" series={[bar('sales', {
    color: '#3b82f6'
  }), referenceLine({
    y: 50,
    label: 'Target',
    color: '#ef4444'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...h.parameters?.docs?.source},description:{story:`A single horizontal reference line at a fixed y value.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={salesData} xKey="month" title="Acceptable range" series={[bar('sales', {
    color: '#3b82f6'
  }), referenceLine({
    y: 40,
    y2: 60,
    label: 'Acceptable',
    color: '#22c55e',
    bandOpacity: 0.12
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...g.parameters?.docs?.source},description:{story:`A shaded band between two y values (y + y2).`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={predictionData} xKey="x" title="Event marker" series={[line('mean', {
    color: '#3b82f6'
  }), referenceLine({
    x: 10,
    label: 'Launch',
    color: '#6b1efd'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,..._.parameters?.docs?.source},description:{story:`A vertical reference line at a fixed x value (linear x scale only).`,..._.parameters?.docs?.description}}},v=[`Horizontal`,`Band`,`Vertical`]}))();export{g as Band,h as Horizontal,_ as Vertical,v as __namedExportsOrder,p as default};