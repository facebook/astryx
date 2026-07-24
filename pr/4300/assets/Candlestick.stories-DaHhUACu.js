import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{A as i,M as a,O as o,T as s,g as c,t as l}from"./src-BoD0t5O0.js";import{l as u,r as d}from"./_data-DTSixHX1.js";var f,p,m,h,g,_,v;e((()=>{f=t(n()),l(),d(),p=r(),m={title:`Charts/Candlestick`,component:a},h=(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(i,{position:`bottom`}),(0,p.jsx)(i,{position:`left`})]}),g={render:()=>(0,p.jsx)(a,{data:u,xKey:`day`,title:`Price (OHLC)`,series:[c({open:`open`,high:`high`,low:`low`,close:`close`})],grid:(0,p.jsx)(o,{}),axes:h,height:360})},_={render:()=>(0,p.jsx)(a,{data:(0,f.useMemo)(()=>{let e=0;return u.map((t,n)=>{e+=t.close;let r=n>=4?(e-u.slice(0,n-4).reduce((e,t)=>e+t.close,0))/5:void 0;return{...t,ma5:r==null?void 0:Math.round(r*10)/10}})},[]),xKey:`day`,title:`Price + 5-day MA`,series:[c({open:`open`,high:`high`,low:`low`,close:`close`}),s(`ma5`,{color:`#f59e0b`,strokeWidth:1.5})],grid:(0,p.jsx)(o,{}),axes:h,height:360})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={stockData} xKey="day" title="Price (OHLC)" series={[candlestick({
    open: 'open',
    high: 'high',
    low: 'low',
    close: 'close'
  })]} grid={<ChartGrid />} axes={axes} height={360} />
}`,...g.parameters?.docs?.source},description:{story:`OHLC candlesticks. Up/down default to the theme's success/error colors.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const data = useMemo(() => {
      let sum = 0;
      return stockData.map((d, i) => {
        sum += d.close;
        const ma = i >= 4 ? (sum - stockData.slice(0, i - 4).reduce((s, v) => s + v.close, 0)) / 5 : undefined;
        return {
          ...d,
          ma5: ma == null ? undefined : Math.round(ma * 10) / 10
        };
      });
    }, []);
    return <Chart data={data} xKey="day" title="Price + 5-day MA" series={[candlestick({
      open: 'open',
      high: 'high',
      low: 'low',
      close: 'close'
    }), line('ma5', {
      color: '#f59e0b',
      strokeWidth: 1.5
    })]} grid={<ChartGrid />} axes={axes} height={360} />;
  }
}`,..._.parameters?.docs?.source},description:{story:`Candlesticks + a moving-average line overlay on the shared price scale.`,..._.parameters?.docs?.description}}},v=[`Basic`,`WithMovingAverage`]}))();export{g as Basic,_ as WithMovingAverage,v as __namedExportsOrder,m as default};