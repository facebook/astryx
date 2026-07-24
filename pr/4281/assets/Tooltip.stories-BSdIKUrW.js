import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,E as r,M as i,O as a,T as o,n as s,t as c}from"./src-hqqa6y1Z.js";import{i as l,r as u}from"./_data-DTSixHX1.js";var d,f,p,m;e((()=>{c(),u(),d=t(),f={title:`Charts/Chrome/Tooltip`,component:i},p={render:()=>(0,d.jsx)(i,{data:l,xKey:`month`,series:[r(`revenue`,{color:`#3b82f6`,label:`Revenue`,stack:`x`}),r(`costs`,{color:`#ef4444`,label:`Costs`,stack:`x`}),o(`trend`,{color:`#f59e0b`,label:`Trend`})],tooltip:!0,grid:(0,d.jsx)(a,{}),axes:(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n,{position:`bottom`}),(0,d.jsx)(n,{position:`left`,tickFormat:s()})]}),height:320})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" series={[bar('revenue', {
    color: '#3b82f6',
    label: 'Revenue',
    stack: 'x'
  }), bar('costs', {
    color: '#ef4444',
    label: 'Costs',
    stack: 'x'
  }), line('trend', {
    color: '#f59e0b',
    label: 'Trend'
  })]} tooltip grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" tickFormat={currency()} />
        </>} height={320} />
}`,...p.parameters?.docs?.source},description:{story:`Hover the chart: a grouped tooltip shows every series value at that x, with a
 column highlight for bars and hover dots on lines.`,...p.parameters?.docs?.description}}},m=[`Default`]}))();export{p as Default,m as __namedExportsOrder,f as default};