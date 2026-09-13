import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{s as n}from"./i18n-ly_JIbsb.js";import{u as r}from"./iframe-Dl9H3FMs.js";import{A as i,E as a,M as o,O as s,t as c,w as l}from"./src-Dm4nvyLR.js";import{i as u,o as d,r as f,t as p}from"./_data-DTSixHX1.js";var m,h,g,_,v,y,b,x,S;e((()=>{c(),f(),r(),m=t(),h={title:`Charts/Bar`,component:i},g=(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(s,{position:`bottom`}),(0,m.jsx)(s,{position:`left`})]}),_={render:()=>{let e=n();return(0,m.jsx)(i,{data:u,xKey:`month`,title:`Monthly Revenue`,series:[l(`revenue`,{color:`#3b82f6`})],tooltip:!0,grid:(0,m.jsx)(a,{}),axes:(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(s,{position:`bottom`}),(0,m.jsx)(s,{position:`left`,tickFormat:o(`$`,e)})]}),height:300})}},v={render:()=>(0,m.jsx)(i,{data:u,xKey:`month`,title:`Revenue & Costs`,subtitle:`Stacked by category`,series:[l(`revenue`,{color:`#3b82f6`,stack:`totals`,label:`Revenue`}),l(`costs`,{color:`#ef4444`,stack:`totals`,label:`Costs`})],legend:{position:`bottom`,alignment:`center`},grid:(0,m.jsx)(a,{}),axes:g,height:300})},y={render:()=>(0,m.jsx)(i,{data:u,xKey:`month`,title:`Revenue vs Costs`,series:[l(`revenue`,{color:`#3b82f6`,group:`compare`,label:`Revenue`}),l(`costs`,{color:`#ef4444`,group:`compare`,label:`Costs`})],legend:{position:`top`,alignment:`end`},grid:(0,m.jsx)(a,{}),axes:g,height:300})},b={render:()=>(0,m.jsx)(i,{data:p,xKey:`month`,title:`Grouped + stacked`,series:[l(`revenueA`,{color:`#3b82f6`,stack:`a`,group:`cmp`}),l(`costsA`,{color:`#93c5fd`,stack:`a`,group:`cmp`}),l(`revenueB`,{color:`#ef4444`,stack:`b`,group:`cmp`}),l(`costsB`,{color:`#fca5a5`,stack:`b`,group:`cmp`})],grid:(0,m.jsx)(a,{}),axes:g,height:300})},x={render:()=>(0,m.jsx)(i,{data:d,xKey:`month`,title:`Profit / Loss`,series:[l(`profit`,{color:`#3b82f6`})],grid:(0,m.jsx)(a,{}),axes:g,height:300})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const locale = useLocale();
    return <Chart data={monthlyData} xKey="month" title="Monthly Revenue" series={[bar('revenue', {
      color: '#3b82f6'
    })]} tooltip grid={<ChartGrid />} axes={<>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" tickFormat={currency('$', locale)} />
          </>} height={300} />;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue & Costs" subtitle="Stacked by category" series={[bar('revenue', {
    color: '#3b82f6',
    stack: 'totals',
    label: 'Revenue'
  }), bar('costs', {
    color: '#ef4444',
    stack: 'totals',
    label: 'Costs'
  })]} legend={{
    position: 'bottom',
    alignment: 'center'
  }} grid={<ChartGrid />} axes={axes} height={300} />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue vs Costs" series={[bar('revenue', {
    color: '#3b82f6',
    group: 'compare',
    label: 'Revenue'
  }), bar('costs', {
    color: '#ef4444',
    group: 'compare',
    label: 'Costs'
  })]} legend={{
    position: 'top',
    alignment: 'end'
  }} grid={<ChartGrid />} axes={axes} height={300} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={groupedStackData} xKey="month" title="Grouped + stacked" series={[bar('revenueA', {
    color: '#3b82f6',
    stack: 'a',
    group: 'cmp'
  }), bar('costsA', {
    color: '#93c5fd',
    stack: 'a',
    group: 'cmp'
  }), bar('revenueB', {
    color: '#ef4444',
    stack: 'b',
    group: 'cmp'
  }), bar('costsB', {
    color: '#fca5a5',
    stack: 'b',
    group: 'cmp'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={profitLossData} xKey="month" title="Profit / Loss" series={[bar('profit', {
    color: '#3b82f6'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...x.parameters?.docs?.source}}},S=[`Simple`,`Stacked`,`Grouped`,`GroupedStacked`,`NegativeValues`]}))();export{y as Grouped,b as GroupedStacked,x as NegativeValues,_ as Simple,v as Stacked,S as __namedExportsOrder,h as default};