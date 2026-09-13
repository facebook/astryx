import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,E as r,O as i,f as a,t as o,w as s}from"./src-pPf0_m6g.js";import{r as c,s as l}from"./_data-DTSixHX1.js";var u,d,f,p;e((()=>{o(),c(),u=t(),d={title:`Charts/Error Bar`,component:n},f={render:()=>(0,u.jsx)(n,{data:l,xKey:`month`,title:`Sales with error bars`,series:[s(`sales`,{color:`#3b82f6`}),a({high:`errorHigh`,low:`errorLow`,color:`#1e3a5f`})],grid:(0,u.jsx)(r,{}),axes:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{position:`bottom`}),(0,u.jsx)(i,{position:`left`})]}),height:320})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={salesData} xKey="month" title="Sales with error bars" series={[bar('sales', {
    color: '#3b82f6'
  }), errorBar({
    high: 'errorHigh',
    low: 'errorLow',
    color: '#1e3a5f'
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={320} />
}`,...f.parameters?.docs?.source},description:{story:`Error bars pair with a value mark (here, bars) to show a high/low range.`,...f.parameters?.docs?.description}}},p=[`OnBars`]}))();export{f as OnBars,p as __namedExportsOrder,d as default};