import{n as e}from"./rolldown-runtime-DaJ6WEGw.js";import{t}from"./jsx-runtime-cM__dR4X.js";import{A as n,E as r,M as i,O as a,T as o,m as s,p as c,t as l,v as u}from"./src-Byn5vS61.js";import{i as d,r as f,s as p}from"./_data-B9LkkYH_.js";var m,h,g,_,v,y;e((()=>{l(),f(),m=t(),h={title:`Charts/Composite`,component:i},g=(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(n,{position:`bottom`}),(0,m.jsx)(n,{position:`left`})]}),_={render:()=>(0,m.jsx)(i,{data:d,xKey:`month`,title:`Revenue vs trend`,subtitle:`Bars with a trendline overlay`,series:[r(`revenue`,{color:`#3b82f6`,label:`Revenue`}),o(`trend`,{color:`#f59e0b`,label:`Trend`})],tooltip:!0,legend:!0,grid:(0,m.jsx)(a,{}),axes:g,height:320})},v={render:()=>(0,m.jsx)(i,{data:p.map((e,t,n)=>{let r=n.slice(0,t+1).reduce((e,t)=>e+t.sales,0)/(t+1);return{...e,runAvg:Math.round(r*10)/10,upper:Math.round((r+8)*10)/10,lower:Math.round((r-8)*10)/10}}),xKey:`month`,title:`Kitchen sink`,series:[c({y:40,y2:60,color:`#22c55e`,bandOpacity:.08}),c({y:50,label:`Target`,color:`#ef4444`}),u({upper:`upper`,lower:`lower`,color:`#f59e0b`,opacity:.15}),r(`sales`,{color:`#3b82f6`,label:`Sales`}),s({high:`errorHigh`,low:`errorLow`,color:`#1e3a5f`}),o(`runAvg`,{color:`#f59e0b`,strokeWidth:2,label:`Run avg`})],grid:(0,m.jsx)(a,{}),axes:g,height:400})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={monthlyData} xKey="month" title="Revenue vs trend" subtitle="Bars with a trendline overlay" series={[bar('revenue', {
    color: '#3b82f6',
    label: 'Revenue'
  }), line('trend', {
    color: '#f59e0b',
    label: 'Trend'
  })]} tooltip legend grid={<ChartGrid />} axes={axes} height={320} />
}`,..._.parameters?.docs?.source},description:{story:`Bars + a trendline overlay sharing one scale.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Many marks at once: reference band + line, confidence band, bars, error bars, line.`,...v.parameters?.docs?.description}}},y=[`MixedMarks`,`KitchenSink`]}))();export{v as KitchenSink,_ as MixedMarks,y as __namedExportsOrder,h as default};