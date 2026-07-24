import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Bt7jq58k.js";import{t as r}from"./Heading-DaPZub_W.js";import{c as i}from"./Stack-C7dTtCDZ.js";import{t as a}from"./Text-BYms8e3u.js";import{u as o}from"./iframe-4XAMyx57.js";import{A as s,O as c,S as l,b as u,t as d,tt as f,v as p,w as m}from"./src-C4_c7Msj.js";var h,g,_,v,y,b,x,S,C,w;e((()=>{d(),o(),a(),h=t(),g={title:`Lab/ThreeDChart`,tags:[`autodocs`]},_=Array.from({length:200},()=>({x:Math.random()*100,y:Math.random()*100,z:Math.random()*100})),v={render:()=>{let e=f();return(0,h.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,h.jsx)(r,{level:3,children:`3D Scatter Plot`}),(0,h.jsx)(n,{type:`supporting`,color:`secondary`,children:`200 points. Drag to rotate. Depth encoded via size and opacity.`}),(0,h.jsxs)(s,{data:_,xKey:`x`,yKey:`y`,zKey:`z`,height:400,interactive:!0,children:[(0,h.jsx)(l,{}),(0,h.jsx)(u,{}),(0,h.jsx)(c,{color:e.categorical(1)[0],radius:4})]})]})}},y=[{product:0,region:0,sales:42},{product:1,region:0,sales:58},{product:2,region:0,sales:35},{product:0,region:1,sales:65},{product:1,region:1,sales:48},{product:2,region:1,sales:72},{product:0,region:2,sales:30},{product:1,region:2,sales:55},{product:2,region:2,sales:40}],b={render:()=>{let e=f();return(0,h.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,h.jsx)(r,{level:3,children:`3D Bar Chart`}),(0,h.jsx)(n,{type:`supporting`,color:`secondary`,children:`Sales by product x region. Drag to rotate.`}),(0,h.jsxs)(s,{data:y,xKey:`product`,yKey:`sales`,zKey:`region`,height:400,interactive:!0,children:[(0,h.jsx)(l,{divisions:3}),(0,h.jsx)(u,{}),(0,h.jsx)(m,{color:e.categorical(1)[0],barWidth:.12,barDepth:.12})]})]})}},x=[];for(let e=0;e<=20;e++)for(let t=0;t<=20;t++){let n=e/20,r=t/20,i=Math.sin(n*Math.PI*2)*Math.cos(r*Math.PI*2)*50+50;x.push({x:e,y:Math.round(i),z:t})}S={render:()=>{let e=f();return(0,h.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,h.jsx)(r,{level:3,children:`3D Surface`}),(0,h.jsx)(n,{type:`supporting`,color:`secondary`,children:`sin(x) * cos(z) surface. Drag to rotate. Color maps to height.`}),(0,h.jsxs)(s,{data:x,xKey:`x`,yKey:`y`,zKey:`z`,height:450,interactive:!0,children:[(0,h.jsx)(l,{}),(0,h.jsx)(u,{}),(0,h.jsx)(p,{colorRange:e.sequential.blue(5)})]})]})}},C={render:()=>{let e=f();return(0,h.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,h.jsx)(r,{level:3,children:`3D Wireframe`}),(0,h.jsxs)(s,{data:x,xKey:`x`,yKey:`y`,zKey:`z`,height:450,interactive:!0,children:[(0,h.jsx)(l,{}),(0,h.jsx)(p,{colorRange:e.sequential.teal(5),wireframe:!0})]})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Scatter Plot</Heading>
        <Text type="supporting" color="secondary">
          200 points. Drag to rotate. Depth encoded via size and opacity.
        </Text>
        <ThreeDChart data={scatterData} xKey="x" yKey="y" zKey="z" height={400} interactive>
          <ThreeDGrid />
          <ThreeDAxis />
          <ThreeDScatter color={colors.categorical(1)[0]} radius={4} />
        </ThreeDChart>
      </Stack>;
  }
}`,...v.parameters?.docs?.source},description:{story:`3D scatter plot — drag to rotate`,...v.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Bar Chart</Heading>
        <Text type="supporting" color="secondary">
          Sales by product x region. Drag to rotate.
        </Text>
        <ThreeDChart data={barData} xKey="product" yKey="sales" zKey="region" height={400} interactive>
          <ThreeDGrid divisions={3} />
          <ThreeDAxis />
          <ThreeDBar color={colors.categorical(1)[0]} barWidth={0.12} barDepth={0.12} />
        </ThreeDChart>
      </Stack>;
  }
}`,...b.parameters?.docs?.source},description:{story:`3D bar chart — drag to rotate`,...b.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Surface</Heading>
        <Text type="supporting" color="secondary">
          sin(x) * cos(z) surface. Drag to rotate. Color maps to height.
        </Text>
        <ThreeDChart data={surfaceData} xKey="x" yKey="y" zKey="z" height={450} interactive>
          <ThreeDGrid />
          <ThreeDAxis />
          <ThreeDSurface colorRange={colors.sequential.blue(5)} />
        </ThreeDChart>
      </Stack>;
  }
}`,...S.parameters?.docs?.source},description:{story:`3D surface — height-colored mesh`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>3D Wireframe</Heading>
        <ThreeDChart data={surfaceData} xKey="x" yKey="y" zKey="z" height={450} interactive>
          <ThreeDGrid />
          <ThreeDSurface colorRange={colors.sequential.teal(5)} wireframe />
        </ThreeDChart>
      </Stack>;
  }
}`,...C.parameters?.docs?.source},description:{story:`3D surface wireframe`,...C.parameters?.docs?.description}}},w=[`Scatter3D`,`Bar3D`,`Surface3D`,`Wireframe3D`]}))();export{b as Bar3D,v as Scatter3D,S as Surface3D,C as Wireframe3D,w as __namedExportsOrder,g as default};