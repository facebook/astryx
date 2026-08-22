import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{a as n}from"./i18n-D5qH93Fz.js";import{u as r}from"./iframe-B2K-Xl1P.js";import{A as i,E as a,M as o,O as s,T as c,n as l,t as u}from"./src-0fXk7huC.js";import{i as d,r as f}from"./_data-DTSixHX1.js";var p,m,h,g;e((()=>{u(),f(),r(),p=t(),m={title:`Charts/Chrome/Tooltip`,component:o},h={render:()=>{let e=n();return(0,p.jsx)(o,{data:d,xKey:`month`,series:[a(`revenue`,{color:`#3b82f6`,label:`Revenue`,stack:`x`}),a(`costs`,{color:`#ef4444`,label:`Costs`,stack:`x`}),c(`trend`,{color:`#f59e0b`,label:`Trend`})],tooltip:!0,grid:(0,p.jsx)(s,{}),axes:(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(i,{position:`bottom`}),(0,p.jsx)(i,{position:`left`,tickFormat:l(`$`,e)})]}),height:320})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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