import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,C as r,E as i,O as a,t as o,w as s}from"./src-DiQupmlM.js";var c,l,u,d,f,p;e((()=>{o(),c=t(),l=[{month:`Jan`,revenue:42,trend:38},{month:`Feb`,revenue:58,trend:46},{month:`Mar`,revenue:51,trend:49},{month:`Apr`,revenue:74,trend:61},{month:`May`,revenue:68,trend:65},{month:`Jun`,revenue:86,trend:72}],u=Array.from({length:51},(e,t)=>({month:`Period ${t+1}`,revenue:40+t%8*6,trend:42+t*.75})),d={title:`Charts/Chart`,tags:[`autodocs`],argTypes:{dataState:{control:`inline-radio`,options:[`default`,`empty`,`large`]},titleState:{control:`inline-radio`,options:[`default`,`none`,`long`]},legendPosition:{control:`inline-radio`,options:[`off`,`top`,`bottom`,`start`,`end`]},hasTooltip:{control:`boolean`},height:{control:{type:`range`,min:160,max:480,step:20}}},args:{dataState:`default`,titleState:`default`,legendPosition:`bottom`,hasTooltip:!0,height:300}},f={render:({dataState:e,titleState:t,legendPosition:o,hasTooltip:d,height:f})=>{let p=e===`empty`?[]:e===`large`?u:l,m=t===`none`?void 0:t===`long`?`Monthly revenue across every regional sales program and reporting period`:`Monthly revenue`,h=t===`long`?`A deliberately expanded description that verifies the chart heading wraps without hiding the plot or creating horizontal scrolling.`:void 0;return(0,c.jsx)(n,{data:p,xKey:`month`,series:[s(`revenue`,{group:`comparison`,label:`Revenue`}),r(`trend`,{label:`Trend`})],title:m,subtitle:h,legend:o===`off`?!1:{position:o},tooltip:d,grid:(0,c.jsx)(i,{horizontal:!0}),axes:(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(a,{position:`bottom`}),(0,c.jsx)(a,{position:`left`})]}),height:f})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: ({
    dataState,
    titleState,
    legendPosition,
    hasTooltip,
    height
  }) => {
    const data = dataState === 'empty' ? [] : dataState === 'large' ? largeData : monthlyData;
    const title = titleState === 'none' ? undefined : titleState === 'long' ? 'Monthly revenue across every regional sales program and reporting period' : 'Monthly revenue';
    const subtitle = titleState === 'long' ? 'A deliberately expanded description that verifies the chart heading wraps without hiding the plot or creating horizontal scrolling.' : undefined;
    return <Chart data={data} xKey="month" series={[bar('revenue', {
      group: 'comparison',
      label: 'Revenue'
    }), line('trend', {
      label: 'Trend'
    })]} title={title} subtitle={subtitle} legend={legendPosition === 'off' ? false : {
      position: legendPosition
    }} tooltip={hasTooltip} grid={<ChartGrid horizontal />} axes={<>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>} height={height} />;
  }
}`,...f.parameters?.docs?.source},description:{story:`Reusable Chart-root fixture for normal, empty, large-data, long-text,
legend-position, tooltip, and height evidence.`,...f.parameters?.docs?.description}}},p=[`Playground`]}))();export{f as Playground,p as __namedExportsOrder,d as default};