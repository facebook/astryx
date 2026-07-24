import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,M as r,O as i,T as a,t as o,v as s}from"./src-B_RoeV06.js";import{a as c,r as l}from"./_data-DTSixHX1.js";var u,d,f,p;e((()=>{o(),l(),u=t(),d={title:`Charts/Band`,component:r},f={render:()=>(0,u.jsx)(r,{data:c,xKey:`x`,title:`Forecast with confidence bands`,series:[s({upper:`upper95`,lower:`lower95`,color:`#3b82f6`,opacity:.12}),s({upper:`upper80`,lower:`lower80`,color:`#3b82f6`,opacity:.22}),a(`mean`,{color:`#3b82f6`,strokeWidth:2})],grid:(0,u.jsx)(i,{}),axes:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(n,{position:`bottom`}),(0,u.jsx)(n,{position:`left`})]}),height:320})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`Confidence bands (80% + 95%) around a forecast line.`,...f.parameters?.docs?.description}}},p=[`ConfidenceBands`]}))();export{f as ConfidenceBands,p as __namedExportsOrder,d as default};