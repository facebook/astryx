import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{d as n,f as r,g as i,h as a,i as o,m as s,p as c,r as l}from"./_data-DNraWrUw.js";import{n as u,t as d}from"./bar-5Bcz6no5.js";import{n as f,t as p}from"./line-BJMqy3Wb.js";import{n as m,t as h}from"./formatters-Cp8GC_4t.js";var g,_,v,y;function b(){return(b=e((()=>{i(),u(),p(),r(),s(),m(),l(),g=t(),_={title:`Charts/Chrome/Tooltip`,component:a},v={render:()=>(0,g.jsx)(a,{data:o,xKey:`month`,series:[d(`revenue`,{color:`#3b82f6`,label:`Revenue`,stack:`x`}),d(`costs`,{color:`#ef4444`,label:`Costs`,stack:`x`}),f(`trend`,{color:`#f59e0b`,label:`Trend`})],tooltip:!0,grid:(0,g.jsx)(n,{}),axes:(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(c,{position:`bottom`}),(0,g.jsx)(c,{position:`left`,tickFormat:h()})]}),height:320})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Hover the chart: a grouped tooltip shows every series value at that x, with a
 column highlight for bars and hover dots on lines.`,...v.parameters?.docs?.description}}},y=[`Default`]})))()}b();export{v as Default,y as __namedExportsOrder,_ as default};