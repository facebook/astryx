import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,M as r,O as i,S as a,t as o}from"./src-BIUMvWXW.js";import{c as s,r as c,u as l}from"./_data-DTSixHX1.js";var u,d,f,p,m,h;e((()=>{o(),c(),u=t(),d={title:`Charts/Dot`,component:r},f=(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(n,{position:`bottom`}),(0,u.jsx)(n,{position:`left`})]}),p={render:()=>(0,u.jsx)(r,{data:s,xKey:`x`,title:`Scatter (SVG)`,series:[a(`y`,{color:`#3b82f6`,radius:4,opacity:.7})],grid:(0,u.jsx)(i,{horizontal:!0,vertical:!0}),axes:f,height:360})},m={render:()=>(0,u.jsx)(r,{data:l,xKey:`group`,title:`Values by group (dodged)`,series:[a(`value`,{dodge:!0,radius:5})],grid:(0,u.jsx)(i,{}),axes:f,height:300})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={scatterData} xKey="x" title="Scatter (SVG)" series={[dot('y', {
    color: '#3b82f6',
    radius: 4,
    opacity: 0.7
  })]} grid={<ChartGrid horizontal vertical />} axes={axes} height={360} />
}`,...p.parameters?.docs?.source},description:{story:"SVG scatter (numeric x/y). For large N (thousands of points) use `dotGL`.",...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={stripData} xKey="group" title="Values by group (dodged)" series={[dot('value', {
    dodge: true,
    radius: 5
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...m.parameters?.docs?.source},description:{story:"`dodge` spreads points sharing a category so they don't overlap.",...m.parameters?.docs?.description}}},h=[`Scatter`,`Dodged`]}))();export{m as Dodged,p as Scatter,h as __namedExportsOrder,d as default};