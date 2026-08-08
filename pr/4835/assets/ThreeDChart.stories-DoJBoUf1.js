import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Heading-CaMVckJS.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{n as l,t as u}from"./useChartColors-tODQlwNr.js";import{i as d,n as f,r as p,t as m}from"./ThreeDChart-BkP6W_tC.js";import{n as h,t as g}from"./ThreeDScatter-CW6oeEzF.js";function _({color:e,barWidth:t=.06,barDepth:n=.06}){let{data:r,xKey:i,yKey:a,zKey:o,project:s,xDomain:c,yDomain:l,zDomain:u,normalize:f}=d(),p=(0,v.useMemo)(()=>r.map((e,r)=>{let d=f(e[i],c),p=f(e[a],l),m=f(e[o],u),h=t/2,g=n/2,_=s(d-h,p,m-g),v=s(d+h,p,m-g),y=s(d-h,p,m+g),b=s(d+h,p,m+g),x=s(d-h,0,m-g),S=s(d+h,0,m-g),C=s(d-h,0,m+g),w=s(d+h,0,m+g);return{topFL:_,topFR:v,topBL:y,topBR:b,botFL:x,botFR:S,botBL:C,botBR:w,avgDepth:(_.depth+b.depth+x.depth+w.depth)/4,index:r,ny:p}}).sort((e,t)=>e.avgDepth-t.avgDepth),[r,i,a,o,s,c,l,u,f,t,n]);return(0,y.jsx)(`g`,{children:p.map(t=>{let n=(e,t)=>e.map(e=>`${e.px},${e.py}`).join(` `),r=[t.botFL,t.botFR,t.topFR,t.topFL],i=[t.botFR,t.botBR,t.topBR,t.topFR],a=[t.topFL,t.topFR,t.topBR,t.topBL];return(0,y.jsxs)(`g`,{children:[(0,y.jsx)(`polygon`,{points:n(r,0),fill:e,fillOpacity:.9,stroke:e,strokeWidth:.5}),(0,y.jsx)(`polygon`,{points:n(i,0),fill:e,fillOpacity:.7,stroke:e,strokeWidth:.5}),(0,y.jsx)(`polygon`,{points:n(a,0),fill:e,fillOpacity:1,stroke:e,strokeWidth:.5})]},t.index)})})}var v,y;function b(){return(b=e((()=>{v=t(),p(),y=i(),_.__docgenInfo={description:``,methods:[],displayName:`ThreeDBar`,props:{color:{required:!0,tsType:{name:`string`},description:``},barWidth:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`0.06`,computed:!1}},barDepth:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`0.06`,computed:!1}}}}})))()}function x({divisions:e=5}){let{project:t}=d(),n=(0,S.useMemo)(()=>{let n=[];for(let r=0;r<=e;r++){let i=r/e,a=t(i,0,0),o=t(i,0,1);n.push({x1:a.px,y1:a.py,x2:o.px,y2:o.py,depth:(a.depth+o.depth)/2});let s=t(0,0,i),c=t(1,0,i);n.push({x1:s.px,y1:s.py,x2:c.px,y2:c.py,depth:(s.depth+c.depth)/2})}return n.sort((e,t)=>e.depth-t.depth)},[t,e]);return(0,C.jsx)(`g`,{children:n.map((e,t)=>(0,C.jsx)(`line`,{x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,stroke:`var(--color-border)`,strokeOpacity:.3,strokeWidth:1},t))})}var S,C;function w(){return(w=e((()=>{S=t(),p(),C=i(),x.__docgenInfo={description:``,methods:[],displayName:`ThreeDGrid`,props:{divisions:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`5`,computed:!1}}}}})))()}function T({labels:e=!0}){let{project:t,xKey:n,yKey:r,zKey:i,xDomain:a,yDomain:o,zDomain:s}=d(),c=t(0,0,0),l=t(1,0,0),u=t(0,1,0),f=t(0,0,1),p=`var(--color-border-emphasized)`,m=`var(--color-text-secondary)`;return(0,E.jsxs)(`g`,{children:[(0,E.jsx)(`line`,{x1:c.px,y1:c.py,x2:l.px,y2:l.py,stroke:p,strokeWidth:1.5}),(0,E.jsx)(`line`,{x1:c.px,y1:c.py,x2:u.px,y2:u.py,stroke:p,strokeWidth:1.5}),(0,E.jsx)(`line`,{x1:c.px,y1:c.py,x2:f.px,y2:f.py,stroke:p,strokeWidth:1.5}),e&&(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(`text`,{x:l.px+8,y:l.py,fill:m,fontSize:11,dominantBaseline:`central`,children:[n,` [`,a[0],`-`,a[1],`]`]}),(0,E.jsxs)(`text`,{x:u.px+8,y:u.py,fill:m,fontSize:11,dominantBaseline:`central`,children:[r,` [`,o[0],`-`,o[1],`]`]}),(0,E.jsxs)(`text`,{x:f.px+8,y:f.py,fill:m,fontSize:11,dominantBaseline:`central`,children:[i,` [`,s[0],`-`,s[1],`]`]})]})]})}var E;function D(){return(D=e((()=>{p(),E=i(),T.__docgenInfo={description:``,methods:[],displayName:`ThreeDAxis`,props:{labels:{required:!1,tsType:{name:`boolean`},description:`Show axis labels (default: true)`,defaultValue:{value:`true`,computed:!1}}}}})))()}function O(e,t){let n=Math.max(0,Math.min(1,t));if(e.length===1)return e[0];let r=n*(e.length-1),i=Math.floor(r),a=Math.min(i+1,e.length-1);return r-i<.5?e[i]:e[a]}function k({colorRange:e,opacity:t=.8,wireframe:n=!1}){let{data:r,xKey:i,yKey:a,zKey:o,project:s,xDomain:c,yDomain:l,zDomain:u,normalize:f}=d(),p=(0,A.useMemo)(()=>{let t=[...new Set(r.map(e=>e[i]))].sort((e,t)=>e-t),n=[...new Set(r.map(e=>e[o]))].sort((e,t)=>e-t),d=t.length,p=n.length;if(d<2||p<2)return[];let m=new Map;for(let e of r)m.set(`${e[i]},${e[o]}`,e);let h=[];for(let r=0;r<p-1;r++)for(let p=0;p<d-1;p++){let d=[m.get(`${t[p]},${n[r]}`),m.get(`${t[p+1]},${n[r]}`),m.get(`${t[p+1]},${n[r+1]}`),m.get(`${t[p]},${n[r+1]}`)];if(d.some(e=>!e))continue;let g=d.filter(e=>e!=null).map(e=>{let t=f(e[i],c),n=f(e[a],l),r=f(e[o],u);return{...s(t,n,r),ny:n}}),_=g.reduce((e,t)=>e+t.ny,0)/4,v=g.reduce((e,t)=>e+t.depth,0)/4,y=O(e,_);h.push({points:g.map(e=>`${e.px},${e.py}`).join(` `),color:y,depth:v})}return h.sort((e,t)=>e.depth-t.depth)},[r,i,a,o,s,c,l,u,f,e]);return(0,j.jsx)(`g`,{children:p.map((e,r)=>(0,j.jsx)(`polygon`,{points:e.points,fill:n?`none`:e.color,fillOpacity:t,stroke:e.color,strokeWidth:n?1:.5,strokeOpacity:n?.8:.3},r))})}var A,j;function M(){return(M=e((()=>{A=t(),p(),j=i(),k.__docgenInfo={description:`3D surface mesh. Data should be a grid of points with x, y (height), z.
Points are triangulated in order and colored by y-value.`,methods:[],displayName:`ThreeDSurface`,props:{colorRange:{required:!0,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:`Color ramp for surface height — low to high.
Use useChartColors().sequential.blue(5).`},opacity:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`0.8`,computed:!1}},wireframe:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}}})))()}var N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{f(),h(),b(),w(),D(),M(),u(),s(),n(),a(),N=i(),P={title:`Lab/ThreeDChart`,tags:[`autodocs`]},F=Array.from({length:200},()=>({x:Math.random()*100,y:Math.random()*100,z:Math.random()*100})),I={render:()=>{let e=l();return(0,N.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,N.jsx)(o,{level:3,children:`3D Scatter Plot`}),(0,N.jsx)(r,{type:`supporting`,color:`secondary`,children:`200 points. Drag to rotate. Depth encoded via size and opacity.`}),(0,N.jsxs)(m,{data:F,xKey:`x`,yKey:`y`,zKey:`z`,height:400,interactive:!0,children:[(0,N.jsx)(x,{}),(0,N.jsx)(T,{}),(0,N.jsx)(g,{color:e.categorical(1)[0],radius:4})]})]})}},L=[{product:0,region:0,sales:42},{product:1,region:0,sales:58},{product:2,region:0,sales:35},{product:0,region:1,sales:65},{product:1,region:1,sales:48},{product:2,region:1,sales:72},{product:0,region:2,sales:30},{product:1,region:2,sales:55},{product:2,region:2,sales:40}],R={render:()=>{let e=l();return(0,N.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,N.jsx)(o,{level:3,children:`3D Bar Chart`}),(0,N.jsx)(r,{type:`supporting`,color:`secondary`,children:`Sales by product x region. Drag to rotate.`}),(0,N.jsxs)(m,{data:L,xKey:`product`,yKey:`sales`,zKey:`region`,height:400,interactive:!0,children:[(0,N.jsx)(x,{divisions:3}),(0,N.jsx)(T,{}),(0,N.jsx)(_,{color:e.categorical(1)[0],barWidth:.12,barDepth:.12})]})]})}},z=[];for(let e=0;e<=20;e++)for(let t=0;t<=20;t++){let n=e/20,r=t/20,i=Math.sin(n*Math.PI*2)*Math.cos(r*Math.PI*2)*50+50;z.push({x:e,y:Math.round(i),z:t})}B={render:()=>{let e=l();return(0,N.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,N.jsx)(o,{level:3,children:`3D Surface`}),(0,N.jsx)(r,{type:`supporting`,color:`secondary`,children:`sin(x) * cos(z) surface. Drag to rotate. Color maps to height.`}),(0,N.jsxs)(m,{data:z,xKey:`x`,yKey:`y`,zKey:`z`,height:450,interactive:!0,children:[(0,N.jsx)(x,{}),(0,N.jsx)(T,{}),(0,N.jsx)(k,{colorRange:e.sequential.blue(5)})]})]})}},V={render:()=>{let e=l();return(0,N.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,N.jsx)(o,{level:3,children:`3D Wireframe`}),(0,N.jsxs)(m,{data:z,xKey:`x`,yKey:`y`,zKey:`z`,height:450,interactive:!0,children:[(0,N.jsx)(x,{}),(0,N.jsx)(k,{colorRange:e.sequential.teal(5),wireframe:!0})]})]})}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:`3D scatter plot — drag to rotate`,...I.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`3D bar chart — drag to rotate`,...R.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`3D surface — height-colored mesh`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`3D surface wireframe`,...V.parameters?.docs?.description}}},H=[`Scatter3D`,`Bar3D`,`Surface3D`,`Wireframe3D`]})))()}U();export{R as Bar3D,I as Scatter3D,B as Surface3D,V as Wireframe3D,H as __namedExportsOrder,P as default};