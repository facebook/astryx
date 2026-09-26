import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,E as r,O as i,t as a,w as o}from"./src-C9cdgC5S.js";var s,c,l,u,d,f,p;e((()=>{a(),s=t(),c=[{month:`January`,value:18},{month:`February`,value:31},{month:`March`,value:24},{month:`April`,value:42}],l=[{x:0,value:18},{x:5,value:31},{x:10,value:24}],u={title:`Charts/Chrome/ChartGrid`,component:r,tags:[`autodocs`],args:{horizontal:!0,vertical:!1,tickCount:5},argTypes:{tickCount:{control:{type:`range`,min:0,max:10,step:1}}},render:e=>(0,s.jsx)(n,{data:c,xKey:`month`,series:[o(`value`)],title:`Monthly value`,grid:(0,s.jsx)(r,{...e}),axes:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(i,{position:`bottom`}),(0,s.jsx)(i,{position:`left`})]}),height:300})},d={},f={args:{horizontal:!1,vertical:!0,tickCount:5},render:e=>(0,s.jsx)(n,{data:l,xKey:`x`,series:[o(`value`)],title:`Continuous x values`,grid:(0,s.jsx)(r,{...e}),axes:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(i,{position:`bottom`}),(0,s.jsx)(i,{position:`left`})]}),height:300})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source},description:{story:`Drive horizontal, vertical, combined, empty, and density states.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    horizontal: false,
    vertical: true,
    tickCount: 5
  },
  render: args => <Chart data={CONTINUOUS_DATA} xKey="x" series={[bar('value')]} title="Continuous x values" grid={<ChartGrid {...args} />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...f.parameters?.docs?.source},description:{story:`Continuous x values use d3 ticks rather than categorical band centers.`,...f.parameters?.docs?.description}}},p=[`Playground`,`ContinuousX`]}))();export{f as ContinuousX,d as Playground,p as __namedExportsOrder,u as default};