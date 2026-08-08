import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{d as n,f as r,g as i,h as a,i as o,m as s,p as c,r as l,s as u}from"./_data-DNraWrUw.js";import{n as d,t as f}from"./bar-5Bcz6no5.js";import{n as p,t as m}from"./line-BJMqy3Wb.js";import{n as h,t as g}from"./band-cSHU9vBB.js";import{n as _,t as v}from"./errorBar-DC_Ri1mu.js";import{n as y,t as b}from"./referenceLine-C39qlZyz.js";var x,S,C,w,T,E;function D(){return(D=e((()=>{i(),d(),m(),h(),_(),b(),r(),s(),l(),x=t(),S={title:`Charts/Composite`,component:a},C=(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(c,{position:`bottom`}),(0,x.jsx)(c,{position:`left`})]}),w={render:()=>(0,x.jsx)(a,{data:o,xKey:`month`,title:`Revenue vs trend`,subtitle:`Bars with a trendline overlay`,series:[f(`revenue`,{color:`#3b82f6`,label:`Revenue`}),p(`trend`,{color:`#f59e0b`,label:`Trend`})],tooltip:!0,legend:!0,grid:(0,x.jsx)(n,{}),axes:C,height:320})},T={render:()=>{let e=u.map((e,t,n)=>{let r=n.slice(0,t+1).reduce((e,t)=>e+t.sales,0)/(t+1);return{...e,runAvg:Math.round(r*10)/10,upper:Math.round((r+8)*10)/10,lower:Math.round((r-8)*10)/10}});return(0,x.jsx)(a,{data:e,xKey:`month`,title:`Kitchen sink`,series:[y({y:40,y2:60,color:`#22c55e`,bandOpacity:.08}),y({y:50,label:`Target`,color:`#ef4444`}),g({upper:`upper`,lower:`lower`,color:`#f59e0b`,opacity:.15}),f(`sales`,{color:`#3b82f6`,label:`Sales`}),v({high:`errorHigh`,low:`errorLow`,color:`#1e3a5f`}),p(`runAvg`,{color:`#f59e0b`,strokeWidth:2,label:`Run avg`})],grid:(0,x.jsx)(n,{}),axes:C,height:400})}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue vs trend" subtitle="Bars with a trendline overlay" series={[bar('revenue', {
    color: '#3b82f6',
    label: 'Revenue'
  }), line('trend', {
    color: '#f59e0b',
    label: 'Trend'
  })]} tooltip legend grid={<ChartGrid />} axes={axes} height={320} />
}`,...w.parameters?.docs?.source},description:{story:`Bars + a trendline overlay sharing one scale.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const data = salesData.map((d, i, arr) => {
      const avg = arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1);
      return {
        ...d,
        runAvg: Math.round(avg * 10) / 10,
        upper: Math.round((avg + 8) * 10) / 10,
        lower: Math.round((avg - 8) * 10) / 10
      };
    });
    return <Chart data={data} xKey="month" title="Kitchen sink" series={[referenceLine({
      y: 40,
      y2: 60,
      color: '#22c55e',
      bandOpacity: 0.08
    }), referenceLine({
      y: 50,
      label: 'Target',
      color: '#ef4444'
    }), band({
      upper: 'upper',
      lower: 'lower',
      color: '#f59e0b',
      opacity: 0.15
    }), bar('sales', {
      color: '#3b82f6',
      label: 'Sales'
    }), errorBar({
      high: 'errorHigh',
      low: 'errorLow',
      color: '#1e3a5f'
    }), line('runAvg', {
      color: '#f59e0b',
      strokeWidth: 2,
      label: 'Run avg'
    })]} grid={<ChartGrid />} axes={axes} height={400} />;
  }
}`,...T.parameters?.docs?.source},description:{story:`Many marks at once: reference band + line, confidence band, bars, error bars, line.`,...T.parameters?.docs?.description}}},E=[`MixedMarks`,`KitchenSink`]})))()}D();export{T as KitchenSink,w as MixedMarks,E as __namedExportsOrder,S as default};