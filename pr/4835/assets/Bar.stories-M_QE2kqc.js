import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{d as n,f as r,g as i,h as a,i as o,m as s,o as c,p as l,r as u,t as d}from"./_data-DNraWrUw.js";import{n as f,t as p}from"./bar-5Bcz6no5.js";import{n as m,t as h}from"./formatters-Cp8GC_4t.js";var g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{i(),f(),r(),s(),m(),u(),g=t(),_={title:`Charts/Bar`,component:a},v=(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(l,{position:`bottom`}),(0,g.jsx)(l,{position:`left`})]}),y={render:()=>(0,g.jsx)(a,{data:o,xKey:`month`,title:`Monthly Revenue`,series:[p(`revenue`,{color:`#3b82f6`})],tooltip:!0,grid:(0,g.jsx)(n,{}),axes:(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(l,{position:`bottom`}),(0,g.jsx)(l,{position:`left`,tickFormat:h()})]}),height:300})},b={render:()=>(0,g.jsx)(a,{data:o,xKey:`month`,title:`Revenue & Costs`,subtitle:`Stacked by category`,series:[p(`revenue`,{color:`#3b82f6`,stack:`totals`,label:`Revenue`}),p(`costs`,{color:`#ef4444`,stack:`totals`,label:`Costs`})],legend:{position:`bottom`,alignment:`center`},grid:(0,g.jsx)(n,{}),axes:v,height:300})},x={render:()=>(0,g.jsx)(a,{data:o,xKey:`month`,title:`Revenue vs Costs`,series:[p(`revenue`,{color:`#3b82f6`,group:`compare`,label:`Revenue`}),p(`costs`,{color:`#ef4444`,group:`compare`,label:`Costs`})],legend:{position:`top`,alignment:`end`},grid:(0,g.jsx)(n,{}),axes:v,height:300})},S={render:()=>(0,g.jsx)(a,{data:d,xKey:`month`,title:`Grouped + stacked`,series:[p(`revenueA`,{color:`#3b82f6`,stack:`a`,group:`cmp`}),p(`costsA`,{color:`#93c5fd`,stack:`a`,group:`cmp`}),p(`revenueB`,{color:`#ef4444`,stack:`b`,group:`cmp`}),p(`costsB`,{color:`#fca5a5`,stack:`b`,group:`cmp`})],grid:(0,g.jsx)(n,{}),axes:v,height:300})},C={render:()=>(0,g.jsx)(a,{data:c,xKey:`month`,title:`Profit / Loss`,series:[p(`profit`,{color:`#3b82f6`})],grid:(0,g.jsx)(n,{}),axes:v,height:300})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Monthly Revenue" series={[bar('revenue', {
    color: '#3b82f6'
  })]} tooltip grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" tickFormat={currency()} />
        </>} height={300} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={profitLossData} xKey="month" title="Profit / Loss" series={[bar('profit', {
    color: '#3b82f6'
  })]} grid={<ChartGrid />} axes={axes} height={300} />
}`,...C.parameters?.docs?.source}}},w=[`Simple`,`Stacked`,`Grouped`,`GroupedStacked`,`NegativeValues`]})))()}T();export{x as Grouped,S as GroupedStacked,C as NegativeValues,y as Simple,b as Stacked,w as __namedExportsOrder,_ as default};