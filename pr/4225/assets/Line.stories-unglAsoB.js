import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,M as r,O as i,T as a,t as o}from"./src-D3ty3G8C.js";import{i as s,r as c}from"./_data-DTSixHX1.js";var l,u,d,f,p,m,h,g;e((()=>{o(),c(),l=t(),u={title:`Charts/Line`,component:r},d=(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n,{position:`bottom`}),(0,l.jsx)(n,{position:`left`})]}),f={render:()=>(0,l.jsx)(r,{data:s,xKey:`month`,title:`Trend`,series:[a(`trend`,{color:`#3b82f6`})],tooltip:!0,grid:(0,l.jsx)(i,{}),axes:d,height:300})},p={render:()=>(0,l.jsx)(r,{data:s,xKey:`month`,series:[a(`trend`,{color:`#3b82f6`,dots:!0,strokeWidth:2})],grid:(0,l.jsx)(i,{}),axes:d,height:300})},m={render:()=>(0,l.jsx)(r,{data:s,xKey:`month`,series:[a(`revenue`,{color:`#3b82f6`,label:`Revenue`}),a(`costs`,{color:`#ef4444`,label:`Costs`}),a(`trend`,{color:`#f59e0b`,label:`Trend`})],legend:!0,grid:(0,l.jsx)(i,{}),axes:d,height:300})},h={render:()=>(0,l.jsx)(r,{data:s,xKey:`month`,subtitle:`linear vs monotone vs step`,series:[a(`revenue`,{color:`#3b82f6`,curve:`linear`,label:`linear`}),a(`costs`,{color:`#22c55e`,curve:`monotone`,label:`monotone`}),a(`trend`,{color:`#f59e0b`,curve:`step`,label:`step`})],legend:!0,grid:(0,l.jsx)(i,{}),axes:d,height:300})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Trend" series={[line('trend', {
    color: '#3b82f6'
  })]} tooltip grid={<ChartGrid />} axes={axes} height={300} />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" series={[line('trend', {
    color: '#3b82f6',
    dots: true,
    strokeWidth: 2
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g=[`Simple`,`WithDots`,`MultiSeries`,`Curves`]}))();export{h as Curves,m as MultiSeries,f as Simple,p as WithDots,g as __namedExportsOrder,u as default};