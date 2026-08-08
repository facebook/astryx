import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{d as n,f as r,g as i,h as a,i as o,m as s,p as c,r as l}from"./_data-DNraWrUw.js";import{n as u,t as d}from"./line-BJMqy3Wb.js";var f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{i(),d(),r(),s(),l(),f=t(),p={title:`Charts/Line`,component:a},m=(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(c,{position:`bottom`}),(0,f.jsx)(c,{position:`left`})]}),h={render:()=>(0,f.jsx)(a,{data:o,xKey:`month`,title:`Trend`,series:[u(`trend`,{color:`#3b82f6`})],tooltip:!0,grid:(0,f.jsx)(n,{}),axes:m,height:300})},g={render:()=>(0,f.jsx)(a,{data:o,xKey:`month`,series:[u(`trend`,{color:`#3b82f6`,dots:!0,strokeWidth:2})],grid:(0,f.jsx)(n,{}),axes:m,height:300})},_={render:()=>(0,f.jsx)(a,{data:o,xKey:`month`,series:[u(`revenue`,{color:`#3b82f6`,label:`Revenue`}),u(`costs`,{color:`#ef4444`,label:`Costs`}),u(`trend`,{color:`#f59e0b`,label:`Trend`})],legend:!0,grid:(0,f.jsx)(n,{}),axes:m,height:300})},v={render:()=>(0,f.jsx)(a,{data:o,xKey:`month`,subtitle:`linear vs monotone vs step`,series:[u(`revenue`,{color:`#3b82f6`,curve:`linear`,label:`linear`}),u(`costs`,{color:`#22c55e`,curve:`monotone`,label:`monotone`}),u(`trend`,{color:`#f59e0b`,curve:`step`,label:`step`})],legend:!0,grid:(0,f.jsx)(n,{}),axes:m,height:300})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Trend" series={[line('trend', {
    color: '#3b82f6'
  })]} tooltip grid={<ChartGrid />} axes={axes} height={300} />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" series={[line('trend', {
    color: '#3b82f6',
    dots: true,
    strokeWidth: 2
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" series={[line('revenue', {
    color: '#3b82f6',
    label: 'Revenue'
  }), line('costs', {
    color: '#ef4444',
    label: 'Costs'
  }), line('trend', {
    color: '#f59e0b',
    label: 'Trend'
  })]} legend grid={<ChartGrid />} axes={axes} height={300} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" subtitle="linear vs monotone vs step" series={[line('revenue', {
    color: '#3b82f6',
    curve: 'linear',
    label: 'linear'
  }), line('costs', {
    color: '#22c55e',
    curve: 'monotone',
    label: 'monotone'
  }), line('trend', {
    color: '#f59e0b',
    curve: 'step',
    label: 'step'
  })]} legend grid={<ChartGrid />} axes={axes} height={300} />
}`,...v.parameters?.docs?.source}}},y=[`Simple`,`WithDots`,`MultiSeries`,`Curves`]})))()}b();export{v as Curves,_ as MultiSeries,h as Simple,g as WithDots,y as __namedExportsOrder,p as default};