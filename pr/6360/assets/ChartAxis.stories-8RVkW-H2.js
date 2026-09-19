import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{A as n,O as r,t as i,w as a}from"./src-ByAwr8Sm.js";var o,s,c,l,u,d,f,p;e((()=>{i(),o=t(),s=[{month:`January`,value:18},{month:`February`,value:31},{month:`March`,value:24},{month:`April`,value:42}],c=[{month:`👨‍👩‍👧‍👦 Family`,value:18},{month:`👩🏽‍🚀 Space`,value:31},{month:`🇯🇵 Japan`,value:24},{month:`éclair`,value:42}],l={title:`Charts/Chrome/ChartAxis`,component:r,tags:[`autodocs`],args:{position:`bottom`},argTypes:{tickFormat:{control:!1}},render:e=>(0,o.jsx)(n,{data:s,xKey:`month`,series:[a(`value`)],axes:(0,o.jsx)(r,{...e}),height:300})},u={},d={render:()=>(0,o.jsx)(n,{data:s,xKey:`month`,series:[a(`value`)],axes:(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(r,{position:`top`,showAxisLine:!0,showTicks:!0}),(0,o.jsx)(r,{position:`right`,showAxisLine:!0,showTicks:!0}),(0,o.jsx)(r,{position:`bottom`,showAxisLine:!0,showTicks:!0}),(0,o.jsx)(r,{position:`left`,showAxisLine:!0,showTicks:!0})]}),height:300})},f={args:{position:`bottom`,truncate:1,animated:!1},render:e=>(0,o.jsx)(n,{data:c,xKey:`month`,series:[a(`value`)],axes:(0,o.jsx)(r,{...e}),height:300})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source},description:{story:`Drive every ChartAxis prop against one stable categorical/linear chart.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={DATA} xKey="month" series={[bar('value')]} axes={<>
          <ChartAxis position="top" showAxisLine showTicks />
          <ChartAxis position="right" showAxisLine showTicks />
          <ChartAxis position="bottom" showAxisLine showTicks />
          <ChartAxis position="left" showAxisLine showTicks />
        </>} height={300} />
}`,...d.parameters?.docs?.source},description:{story:`Compare all four physical plot-edge placements in one chart.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    position: 'bottom',
    truncate: 1,
    animated: false
  },
  render: args => <Chart data={GRAPHEME_DATA} xKey="month" series={[bar('value')]} axes={<ChartAxis {...args} />} height={300} />
}`,...f.parameters?.docs?.source},description:{story:`Truncation keeps each user-perceived character intact before the ellipsis.`,...f.parameters?.docs?.description}}},p=[`Playground`,`AllPositions`,`GraphemeTruncation`]}))();export{d as AllPositions,f as GraphemeTruncation,u as Playground,p as __namedExportsOrder,l as default};