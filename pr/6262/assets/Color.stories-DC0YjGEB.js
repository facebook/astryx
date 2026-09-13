import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,C as r,E as i,O as a,t as o,w as s}from"./src-pPf0_m6g.js";import{i as c,o as l,r as u}from"./_data-DTSixHX1.js";var d,f,p,m,h,g;e((()=>{o(),u(),d=t(),f={title:`Charts/Color`,component:n},p=(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(a,{position:`bottom`}),(0,d.jsx)(a,{position:`left`})]}),m={render:()=>(0,d.jsx)(n,{data:c,xKey:`month`,title:`Auto palette`,subtitle:`No colors passed — assigned from the theme's categorical palette`,series:[s(`revenue`,{group:`g`}),s(`costs`,{group:`g`}),r(`trend`)],legend:!0,grid:(0,d.jsx)(i,{}),axes:p,height:320})},h={render:()=>(0,d.jsx)(n,{data:l,xKey:`month`,title:`Green when positive, red when negative`,series:[s(`profit`,{label:`Profit`,color:e=>e.profit>=0?`var(--color-success)`:`var(--color-error)`})],legend:!0,grid:(0,d.jsx)(i,{}),axes:p,height:320})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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