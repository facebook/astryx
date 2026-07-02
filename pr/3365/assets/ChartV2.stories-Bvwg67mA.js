import{a1 as e}from"./iframe-CF49Wwf0.js";import{C as s,a as t,b as a,c as o}from"./bar-CBzkU0Tg.js";import{a as O}from"./area-C5zWI711.js";import{a as V,c as $}from"./step-fxRLXcQr.js";import{m as E,c as N,l as W}from"./monotone-BKrwi6Sb.js";import{l as B}from"./line-fSNqyuCF.js";import{c as I}from"./formatters-BTRd7dIg.js";import"./preload-helper-Ct5FWWRu.js";import"./linear-gs3faI6G.js";import"./ChartContext-D9AeKs00.js";import"./array-2GBN5xbU.js";import"./ChartLegend-IrPLysYN.js";import"./ChartSwatch-De8PXMYE.js";import"./HStack-CDWOB9gg.js";import"./Stack-D8miSQVH.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./VStack-Dl1-N47R.js";import"./index-D35Phtcv.js";import"./index-qTNbWc0y.js";const _={linear:N,monotone:E,natural:$,step:V};function M(c,i={}){const p=i.color??"var(--color-chart-1)",T=i.opacity??.3,w=i.curve??"monotone",G=i.gradient??!1,J=i.stroke??!0;return{type:"area",key:c,dataKeys:[c],color:p,label:i.label??c,layout:{stack:i.stack,includeZero:!0},resolve(m,l){const{data:R,xKey:A,xScale:h,yScale:d}=m,u=[];for(let r=0;r<R.length;r++){const S=R[r];let F;"bandwidth"in h?F=(h(String(S[A]))??0)+h.bandwidth()/2:F=h(S[A]);let K,D;if(l)K=d(l[r].y1),D=d(l[r].y0);else{const L=typeof S[c]=="number"?S[c]:0;K=d(L),D=d(0)}u.push({px:F,py:K,py0:D,dataIndex:r})}return u},render(m){if(m.length===0)return null;const l=_[w],A=O().x(r=>r.px).y0(r=>r.py0).y1(r=>r.py).curve(l)(m)??"",d=W().x(r=>r.px).y(r=>r.py).curve(l)(m)??"",u=`area-grad-${c}`;return e.jsxs("g",{children:[G&&e.jsx("defs",{children:e.jsxs("linearGradient",{id:u,x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:p,stopOpacity:T}),e.jsx("stop",{offset:"100%",stopColor:p,stopOpacity:0})]})}),e.jsx("path",{d:A,fill:G?`url(#${u})`:p,fillOpacity:G?1:T,stroke:"none"}),J&&e.jsx("path",{d,fill:"none",stroke:p,strokeWidth:2})]})}}}const he={title:"Lab/ChartV2",component:s},n=[{month:"Jan",revenue:45,costs:30,trend:38},{month:"Feb",revenue:52,costs:35,trend:42},{month:"Mar",revenue:48,costs:32,trend:40},{month:"Apr",revenue:61,costs:38,trend:48},{month:"May",revenue:55,costs:34,trend:45},{month:"Jun",revenue:70,costs:40,trend:52}],U=[{month:"Jan",revenueA:30,costsA:15,revenueB:25,costsB:20},{month:"Feb",revenueA:35,costsA:18,revenueB:28,costsB:22},{month:"Mar",revenueA:28,costsA:14,revenueB:32,costsB:18},{month:"Apr",revenueA:42,costsA:20,revenueB:35,costsB:25},{month:"May",revenueA:38,costsA:17,revenueB:30,costsB:21},{month:"Jun",revenueA:50,costsA:22,revenueB:40,costsB:28}],x={render:()=>e.jsx(s,{data:n,xKey:"month",title:"Monthly Revenue",series:[o("revenue",{color:"#3b82f6"})],tooltip:!0,grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left",tickFormat:I()})]}),height:300})},g={render:()=>e.jsx(s,{data:n,xKey:"month",series:[B("trend",{color:"#3b82f6"})],tooltip:!0,grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})},b={render:()=>e.jsx(s,{data:n,xKey:"month",title:"Revenue & Costs",subtitle:"Stacked by category",series:[o("revenue",{color:"#3b82f6",stack:"totals",label:"Revenue"}),o("costs",{color:"#ef4444",stack:"totals",label:"Costs"})],legend:{position:"bottom",alignment:"center"},grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})},f={render:()=>e.jsx(s,{data:n,xKey:"month",title:"Revenue vs Costs",series:[o("revenue",{color:"#3b82f6",group:"compare",label:"Revenue"}),o("costs",{color:"#ef4444",group:"compare",label:"Costs"})],legend:{position:"top",alignment:"end"},grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})},v={render:()=>e.jsx(s,{data:U,xKey:"month",series:[o("revenueA",{color:"#3b82f6",stack:"stackA",group:"comparison"}),o("costsA",{color:"#93c5fd",stack:"stackA",group:"comparison"}),o("revenueB",{color:"#ef4444",stack:"stackB",group:"comparison"}),o("costsB",{color:"#fca5a5",stack:"stackB",group:"comparison"})],grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})},y={render:()=>e.jsx(s,{data:n,xKey:"month",title:"Revenue vs Trend",subtitle:"Bar chart with trendline overlay",series:[o("revenue",{color:"#3b82f6",label:"Revenue"}),B("trend",{color:"#f59e0b",label:"Trend"})],tooltip:!0,legend:{position:"end",alignment:"start"},grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})},C={render:()=>e.jsx(s,{data:n,xKey:"month",title:"Revenue Over Time",series:[M("revenue",{color:"#3b82f6",gradient:!0}),B("revenue",{color:"#3b82f6"})],grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})},k={render:()=>e.jsx(s,{data:n,xKey:"month",title:"Revenue & Costs Over Time",series:[M("revenue",{color:"#3b82f6",stack:"total",label:"Revenue"}),M("costs",{color:"#ef4444",stack:"total",label:"Costs"})],legend:!0,grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})},X=[{month:"Jan",profit:20,trend:15},{month:"Feb",profit:-10,trend:5},{month:"Mar",profit:35,trend:20},{month:"Apr",profit:-25,trend:-5},{month:"May",profit:15,trend:10},{month:"Jun",profit:-5,trend:8}],j={render:()=>e.jsx(s,{data:X,xKey:"month",series:[o("profit",{color:"#3b82f6"}),B("trend",{color:"#f59e0b",dots:!0,strokeWidth:2})],grid:e.jsx(a,{}),axes:e.jsxs(e.Fragment,{children:[e.jsx(t,{position:"bottom"}),e.jsx(t,{position:"left"})]}),height:300})};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Monthly Revenue" series={[bar('revenue', {
    color: '#3b82f6'
  })]} tooltip={true} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" tickFormat={currency()} />
        </>} height={300} />
}`,...x.parameters?.docs?.source},description:{story:"Simple bar chart",...x.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" series={[line('trend', {
    color: '#3b82f6'
  })]} tooltip={true} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...g.parameters?.docs?.source},description:{story:"Simple line chart",...g.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
  }} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...b.parameters?.docs?.source},description:{story:"Stacked bars",...b.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
  }} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...f.parameters?.docs?.source},description:{story:"Grouped bars",...f.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={groupedStackData} xKey="month" series={[
  // Stack A (left bar in each group)
  bar('revenueA', {
    color: '#3b82f6',
    stack: 'stackA',
    group: 'comparison'
  }), bar('costsA', {
    color: '#93c5fd',
    stack: 'stackA',
    group: 'comparison'
  }),
  // Stack B (right bar in each group)
  bar('revenueB', {
    color: '#ef4444',
    stack: 'stackB',
    group: 'comparison'
  }), bar('costsB', {
    color: '#fca5a5',
    stack: 'stackB',
    group: 'comparison'
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...v.parameters?.docs?.source},description:{story:"Grouped stacked bars — two stacks side by side per x value",...v.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue vs Trend" subtitle="Bar chart with trendline overlay" series={[bar('revenue', {
    color: '#3b82f6',
    label: 'Revenue'
  }), line('trend', {
    color: '#f59e0b',
    label: 'Trend'
  })]} tooltip={true} legend={{
    position: 'end',
    alignment: 'start'
  }} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...y.parameters?.docs?.source},description:{story:"Mixed: bars + line",...y.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue Over Time" series={[area('revenue', {
    color: '#3b82f6',
    gradient: true
  }), line('revenue', {
    color: '#3b82f6'
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...C.parameters?.docs?.source},description:{story:"Area with gradient",...C.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue & Costs Over Time" series={[area('revenue', {
    color: '#3b82f6',
    stack: 'total',
    label: 'Revenue'
  }), area('costs', {
    color: '#ef4444',
    stack: 'total',
    label: 'Costs'
  })]} legend={true} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...k.parameters?.docs?.source},description:{story:"Stacked areas",...k.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={profitLossData} xKey="month" series={[bar('profit', {
    color: '#3b82f6'
  }), line('trend', {
    color: '#f59e0b',
    dots: true,
    strokeWidth: 2
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...j.parameters?.docs?.source},description:{story:"Mixed marks with negative values",...j.parameters?.docs?.description}}};const ue=["SimpleBar","SimpleLine","StackedBars","GroupedBars","GroupedStackedBars","MixedMarks","AreaGradient","StackedAreas","NegativeValues"];export{C as AreaGradient,f as GroupedBars,v as GroupedStackedBars,y as MixedMarks,j as NegativeValues,x as SimpleBar,g as SimpleLine,k as StackedAreas,b as StackedBars,ue as __namedExportsOrder,he as default};
