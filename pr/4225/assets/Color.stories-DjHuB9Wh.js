import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,E as r,M as i,O as a,T as o,t as s}from"./src-D3ty3G8C.js";import{i as c,o as l,r as u}from"./_data-DTSixHX1.js";var d,f,p,m,h,g;e((()=>{s(),u(),d=t(),f={title:`Charts/Color`,component:i},p=(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n,{position:`bottom`}),(0,d.jsx)(n,{position:`left`})]}),m={render:()=>(0,d.jsx)(i,{data:c,xKey:`month`,title:`Auto palette`,subtitle:`No colors passed — assigned from the theme's categorical palette`,series:[r(`revenue`,{group:`g`}),r(`costs`,{group:`g`}),o(`trend`)],legend:!0,grid:(0,d.jsx)(a,{}),axes:p,height:320})},h={render:()=>(0,d.jsx)(i,{data:l,xKey:`month`,title:`Green when positive, red when negative`,series:[r(`profit`,{label:`Profit`,color:e=>e.profit>=0?`var(--color-success)`:`var(--color-error)`})],legend:!0,grid:(0,d.jsx)(a,{}),axes:p,height:320})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Auto palette" subtitle="No colors passed — assigned from the theme's categorical palette" series={[bar('revenue', {
    group: 'g'
  }), bar('costs', {
    group: 'g'
  }), line('trend')]} legend grid={<ChartGrid />} axes={axes} height={320} />
}`,...m.parameters?.docs?.source},description:{story:`No colors passed — the chart assigns distinct colors from the theme palette.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={profitLossData} xKey="month" title="Green when positive, red when negative" series={[bar('profit', {
    label: 'Profit',
    color: d => d.profit as number >= 0 ? 'var(--color-success)' : 'var(--color-error)'
  })]} legend grid={<ChartGrid />} axes={axes} height={320} />
}`,...h.parameters?.docs?.source},description:{story:`Per-datum color via an accessor; the series still shows in the legend.`,...h.parameters?.docs?.description}}},g=[`AutoPalette`,`AccessorColor`]}))();export{h as AccessorColor,m as AutoPalette,g as __namedExportsOrder,f as default};