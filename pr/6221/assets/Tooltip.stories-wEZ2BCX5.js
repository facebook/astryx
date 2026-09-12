import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{s as n}from"./i18n-ly_JIbsb.js";import{u as r}from"./iframe-DWEweYTA.js";import{A as i,C as a,E as o,M as s,O as c,t as l,w as u}from"./src-9xUKMZhk.js";import{i as d,r as f}from"./_data-DTSixHX1.js";var p,m,h,g;e((()=>{l(),f(),r(),p=t(),m={title:`Charts/Chrome/Tooltip`,component:i},h={render:()=>{let e=n();return(0,p.jsx)(i,{data:d,xKey:`month`,series:[u(`revenue`,{color:`#3b82f6`,label:`Revenue`,stack:`x`}),u(`costs`,{color:`#ef4444`,label:`Costs`,stack:`x`}),a(`trend`,{color:`#f59e0b`,label:`Trend`})],tooltip:!0,grid:(0,p.jsx)(o,{}),axes:(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(c,{position:`bottom`}),(0,p.jsx)(c,{position:`left`,tickFormat:s(`$`,e)})]}),height:320})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const locale = useLocale();
    return <Chart data={monthlyData} xKey="month" series={[bar('revenue', {
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
            <ChartAxis position="left" tickFormat={currency('$', locale)} />
          </>} height={320} />;
  }
}`,...h.parameters?.docs?.source},description:{story:`Hover the chart: a grouped tooltip shows every series value at that x, with a
 column highlight for bars and hover dots on lines.`,...h.parameters?.docs?.description}}},g=[`Default`]}))();export{h as Default,g as __namedExportsOrder,m as default};