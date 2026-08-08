import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{a as n,d as r,f as i,g as a,h as o,m as s,p as c,r as l,s as u}from"./_data-DNraWrUw.js";import{n as d,t as f}from"./bar-5Bcz6no5.js";import{n as p,t as m}from"./line-BJMqy3Wb.js";import{n as h,t as g}from"./referenceLine-C39qlZyz.js";var _,v,y,b,x,S,C;function w(){return(w=e((()=>{a(),d(),m(),g(),i(),s(),l(),_=t(),v={title:`Charts/Reference Line`,component:o},y=(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(c,{position:`bottom`}),(0,_.jsx)(c,{position:`left`})]}),b={render:()=>(0,_.jsx)(o,{data:u,xKey:`month`,title:`Sales vs target`,series:[f(`sales`,{color:`#3b82f6`}),h({y:50,label:`Target`,color:`#ef4444`})],grid:(0,_.jsx)(r,{}),axes:y,height:300})},x={render:()=>(0,_.jsx)(o,{data:u,xKey:`month`,title:`Acceptable range`,series:[f(`sales`,{color:`#3b82f6`}),h({y:40,y2:60,label:`Acceptable`,color:`#22c55e`,bandOpacity:.12})],grid:(0,_.jsx)(r,{}),axes:y,height:300})},S={render:()=>(0,_.jsx)(o,{data:n,xKey:`x`,title:`Event marker`,series:[p(`mean`,{color:`#3b82f6`}),h({x:10,label:`Launch`,color:`#6b1efd`})],grid:(0,_.jsx)(r,{}),axes:y,height:300})},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={salesData} xKey="month" title="Sales vs target" series={[bar('sales', {
    color: '#3b82f6'
  }), referenceLine({
    y: 50,
    label: 'Target',
    color: '#ef4444'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...b.parameters?.docs?.source},description:{story:`A single horizontal reference line at a fixed y value.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={salesData} xKey="month" title="Acceptable range" series={[bar('sales', {
    color: '#3b82f6'
  }), referenceLine({
    y: 40,
    y2: 60,
    label: 'Acceptable',
    color: '#22c55e',
    bandOpacity: 0.12
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...x.parameters?.docs?.source},description:{story:`A shaded band between two y values (y + y2).`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={predictionData} xKey="x" title="Event marker" series={[line('mean', {
    color: '#3b82f6'
  }), referenceLine({
    x: 10,
    label: 'Launch',
    color: '#6b1efd'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...S.parameters?.docs?.source},description:{story:`A vertical reference line at a fixed x value (linear x scale only).`,...S.parameters?.docs?.description}}},C=[`Horizontal`,`Band`,`Vertical`]})))()}w();export{x as Band,b as Horizontal,S as Vertical,C as __namedExportsOrder,v as default};