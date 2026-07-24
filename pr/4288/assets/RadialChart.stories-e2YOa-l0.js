import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Heading-D-Ri_Mjs.js";import{c as r}from"./Stack-C7dTtCDZ.js";import{t as i}from"./Text-BUJwo4gL.js";import{u as a}from"./iframe-iQ3nuRH_.js";import{B as o,H as s,I as c,P as l,R as u,nt as d,t as f,tt as p}from"./src-DKsOurnU.js";var m,h,g,_,v,y,b,x,S;e((()=>{f(),a(),i(),m=t(),h={title:`Lab/RadialChart`,tags:[`autodocs`]},g=[{model:`Model A`,speed:85,handling:70,comfort:90,safety:95,efficiency:60},{model:`Model B`,speed:70,handling:95,comfort:60,safety:80,efficiency:85},{model:`Model C`,speed:95,handling:60,comfort:75,safety:70,efficiency:90}],_={render:()=>{let e=p().categorical(3);return(0,m.jsxs)(r,{direction:`vertical`,gap:4,children:[(0,m.jsx)(n,{level:3,children:`Spider Chart`}),(0,m.jsxs)(s,{data:g,axes:[`speed`,`handling`,`comfort`,`safety`,`efficiency`],height:400,children:[(0,m.jsx)(o,{rings:5}),(0,m.jsx)(u,{dataKey:`Model A`,color:e[0],dots:!0}),(0,m.jsx)(u,{dataKey:`Model B`,color:e[1],dots:!0}),(0,m.jsx)(u,{dataKey:`Model C`,color:e[2],dots:!0}),(0,m.jsx)(c,{}),(0,m.jsx)(d,{items:[{label:`Model A`,color:e[0]},{label:`Model B`,color:e[1]},{label:`Model C`,color:e[2]}]})]})]})}},v=[{region:`North America`,revenue:42},{region:`Europe`,revenue:28},{region:`Asia Pacific`,revenue:18},{region:`Latin America`,revenue:8},{region:`Africa`,revenue:4}],y={render:()=>{let e=p();return(0,m.jsxs)(r,{direction:`vertical`,gap:4,children:[(0,m.jsx)(n,{level:3,children:`Pie Chart`}),(0,m.jsxs)(s,{data:v,valueKey:`revenue`,labelKey:`region`,height:400,children:[(0,m.jsx)(l,{colors:e.categorical(5)}),(0,m.jsx)(d,{items:v.map((t,n)=>({label:t.region,color:e.categorical(5)[n]}))})]})]})}},b={render:()=>{let e=p();return(0,m.jsxs)(r,{direction:`vertical`,gap:4,children:[(0,m.jsx)(n,{level:3,children:`Donut Chart`}),(0,m.jsxs)(s,{data:v,valueKey:`revenue`,labelKey:`region`,innerRadius:.55,height:400,children:[(0,m.jsx)(l,{colors:e.categorical(5)}),(0,m.jsx)(d,{items:v.map((t,n)=>({label:t.region,color:e.categorical(5)[n]}))})]})]})}},x={render:()=>{let e=p().categorical(2);return(0,m.jsxs)(r,{direction:`vertical`,gap:4,children:[(0,m.jsx)(n,{level:3,children:`Spider with Inner Radius`}),(0,m.jsxs)(s,{data:g,axes:[`speed`,`handling`,`comfort`,`safety`,`efficiency`],innerRadius:.2,height:400,children:[(0,m.jsx)(o,{rings:4}),(0,m.jsx)(u,{dataKey:`Model A`,color:e[0],dots:!0}),(0,m.jsx)(u,{dataKey:`Model B`,color:e[1],dots:!0}),(0,m.jsx)(c,{})]})]})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const c = colors.categorical(3);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Spider Chart</Heading>
        <RadialChart data={spiderData} axes={['speed', 'handling', 'comfort', 'safety', 'efficiency']} height={400}>
          <RadialGrid rings={5} />
          <RadialArea dataKey="Model A" color={c[0]} dots />
          <RadialArea dataKey="Model B" color={c[1]} dots />
          <RadialArea dataKey="Model C" color={c[2]} dots />
          <RadialAxis />
          <ChartLegend items={[{
          label: 'Model A',
          color: c[0]
        }, {
          label: 'Model B',
          color: c[1]
        }, {
          label: 'Model C',
          color: c[2]
        }]} />
        </RadialChart>
      </Stack>;
  }
}`,..._.parameters?.docs?.source},description:{story:`Spider/radar chart comparing three models across five dimensions`,..._.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Pie Chart</Heading>
        <RadialChart data={pieData} valueKey="revenue" labelKey="region" height={400}>
          <RadialSlice colors={colors.categorical(5)} />
          <ChartLegend items={pieData.map((d, i) => ({
          label: d.region,
          color: colors.categorical(5)[i]
        }))} />
        </RadialChart>
      </Stack>;
  }
}`,...y.parameters?.docs?.source},description:{story:`Pie chart — revenue by region`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Donut Chart</Heading>
        <RadialChart data={pieData} valueKey="revenue" labelKey="region" innerRadius={0.55} height={400}>
          <RadialSlice colors={colors.categorical(5)} />
          <ChartLegend items={pieData.map((d, i) => ({
          label: d.region,
          color: colors.categorical(5)[i]
        }))} />
        </RadialChart>
      </Stack>;
  }
}`,...b.parameters?.docs?.source},description:{story:`Donut chart — same data with inner radius`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const c = colors.categorical(2);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Spider with Inner Radius</Heading>
        <RadialChart data={spiderData} axes={['speed', 'handling', 'comfort', 'safety', 'efficiency']} innerRadius={0.2} height={400}>
          <RadialGrid rings={4} />
          <RadialArea dataKey="Model A" color={c[0]} dots />
          <RadialArea dataKey="Model B" color={c[1]} dots />
          <RadialAxis />
        </RadialChart>
      </Stack>;
  }
}`,...x.parameters?.docs?.source},description:{story:`Spider with donut center`,...x.parameters?.docs?.description}}},S=[`SpiderChart`,`PieChart`,`DonutChart`,`SpiderDonut`]}))();export{b as DonutChart,y as PieChart,_ as SpiderChart,x as SpiderDonut,S as __namedExportsOrder,h as default};