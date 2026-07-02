import{ah as V,a1 as e,T as A}from"./iframe-Z8EfSKmM.js";import{S as W}from"./Stack-zPlvthC6.js";import{u as $}from"./useChartColors-t8VUt-8G.js";import{H as q}from"./Heading-D0-Rn-po.js";import{u as F,T as _}from"./ThreeDChart-CR4kvaea.js";import{T as U}from"./ThreeDScatter-CdgcugTy.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";function P({color:t,barWidth:n=.06,barDepth:u=.06}){const{data:s,xKey:a,yKey:l,zKey:x,project:i,xDomain:d,yDomain:m,zDomain:j,normalize:g}=F(),v=V.useMemo(()=>s.map((r,y)=>{const f=g(r[a],d),T=g(r[l],m),h=g(r[x],j),D=n/2,o=u/2,c=i(f-D,T,h-o),R=i(f+D,T,h-o),G=i(f-D,T,h+o),S=i(f+D,T,h+o),M=i(f-D,0,h-o),H=i(f+D,0,h-o),L=i(f-D,0,h+o),p=i(f+D,0,h+o),z=(c.depth+S.depth+M.depth+p.depth)/4;return{topFL:c,topFR:R,topBL:G,topBR:S,botFL:M,botFR:H,botBL:L,botBR:p,avgDepth:z,index:y,ny:T}}).sort((r,y)=>r.avgDepth-y.avgDepth),[s,a,l,x,i,d,m,j,g,n,u]);return e.jsx("g",{children:v.map(r=>{const y=(D,o)=>D.map(c=>`${c.px},${c.py}`).join(" "),f=[r.botFL,r.botFR,r.topFR,r.topFL],T=[r.botFR,r.botBR,r.topBR,r.topFR],h=[r.topFL,r.topFR,r.topBR,r.topBL];return e.jsxs("g",{children:[e.jsx("polygon",{points:y(f),fill:t,fillOpacity:.9,stroke:t,strokeWidth:.5}),e.jsx("polygon",{points:y(T),fill:t,fillOpacity:.7,stroke:t,strokeWidth:.5}),e.jsx("polygon",{points:y(h),fill:t,fillOpacity:1,stroke:t,strokeWidth:.5})]},r.index)})})}P.__docgenInfo={description:"",methods:[],displayName:"ThreeDBar",props:{color:{required:!0,tsType:{name:"string"},description:""},barWidth:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0.06",computed:!1}},barDepth:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0.06",computed:!1}}}};function B({divisions:t=5}){const{project:n}=F(),u=V.useMemo(()=>{const s=[];for(let a=0;a<=t;a++){const l=a/t,x=n(l,0,0),i=n(l,0,1);s.push({x1:x.px,y1:x.py,x2:i.px,y2:i.py,depth:(x.depth+i.depth)/2});const d=n(0,0,l),m=n(1,0,l);s.push({x1:d.px,y1:d.py,x2:m.px,y2:m.py,depth:(d.depth+m.depth)/2})}return s.sort((a,l)=>a.depth-l.depth)},[n,t]);return e.jsx("g",{children:u.map((s,a)=>e.jsx("line",{x1:s.x1,y1:s.y1,x2:s.x2,y2:s.y2,stroke:"var(--color-border)",strokeOpacity:.3,strokeWidth:1},a))})}B.__docgenInfo={description:"",methods:[],displayName:"ThreeDGrid",props:{divisions:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"5",computed:!1}}}};function w({labels:t=!0}){const{project:n,xKey:u,yKey:s,zKey:a,xDomain:l,yDomain:x,zDomain:i}=F(),d=n(0,0,0),m=n(1,0,0),j=n(0,1,0),g=n(0,0,1),v="var(--color-border-emphasized)",r="var(--color-text-secondary)";return e.jsxs("g",{children:[e.jsx("line",{x1:d.px,y1:d.py,x2:m.px,y2:m.py,stroke:v,strokeWidth:1.5}),e.jsx("line",{x1:d.px,y1:d.py,x2:j.px,y2:j.py,stroke:v,strokeWidth:1.5}),e.jsx("line",{x1:d.px,y1:d.py,x2:g.px,y2:g.py,stroke:v,strokeWidth:1.5}),t&&e.jsxs(e.Fragment,{children:[e.jsxs("text",{x:m.px+8,y:m.py,fill:r,fontSize:11,dominantBaseline:"central",children:[u," [",l[0],"-",l[1],"]"]}),e.jsxs("text",{x:j.px+8,y:j.py,fill:r,fontSize:11,dominantBaseline:"central",children:[s," [",x[0],"-",x[1],"]"]}),e.jsxs("text",{x:g.px+8,y:g.py,fill:r,fontSize:11,dominantBaseline:"central",children:[a," [",i[0],"-",i[1],"]"]})]})]})}w.__docgenInfo={description:"",methods:[],displayName:"ThreeDAxis",props:{labels:{required:!1,tsType:{name:"boolean"},description:"Show axis labels (default: true)",defaultValue:{value:"true",computed:!1}}}};function Y(t,n){const u=Math.max(0,Math.min(1,n));if(t.length===1)return t[0];const s=u*(t.length-1),a=Math.floor(s),l=Math.min(a+1,t.length-1);return s-a<.5?t[a]:t[l]}function O({colorRange:t,opacity:n=.8,wireframe:u=!1}){const{data:s,xKey:a,yKey:l,zKey:x,project:i,xDomain:d,yDomain:m,zDomain:j,normalize:g}=F(),v=V.useMemo(()=>{const r=[...new Set(s.map(o=>o[a]))].sort((o,c)=>o-c),y=[...new Set(s.map(o=>o[x]))].sort((o,c)=>o-c),f=r.length,T=y.length;if(f<2||T<2)return[];const h=new Map;for(const o of s)h.set(`${o[a]},${o[x]}`,o);const D=[];for(let o=0;o<T-1;o++)for(let c=0;c<f-1;c++){const R=[h.get(`${r[c]},${y[o]}`),h.get(`${r[c+1]},${y[o]}`),h.get(`${r[c+1]},${y[o+1]}`),h.get(`${r[c]},${y[o+1]}`)];if(R.some(p=>!p))continue;const S=R.filter(p=>p!=null).map(p=>{const z=g(p[a],d),I=g(p[l],m),N=g(p[x],j);return{...i(z,I,N),ny:I}}),M=S.reduce((p,z)=>p+z.ny,0)/4,H=S.reduce((p,z)=>p+z.depth,0)/4,L=Y(t,M);D.push({points:S.map(p=>`${p.px},${p.py}`).join(" "),color:L,depth:H})}return D.sort((o,c)=>o.depth-c.depth)},[s,a,l,x,i,d,m,j,g,t]);return e.jsx("g",{children:v.map((r,y)=>e.jsx("polygon",{points:r.points,fill:u?"none":r.color,fillOpacity:n,stroke:r.color,strokeWidth:u?1:.5,strokeOpacity:u?.8:.3},y))})}O.__docgenInfo={description:`3D surface mesh. Data should be a grid of points with x, y (height), z.
Points are triangulated in order and colored by y-value.`,methods:[],displayName:"ThreeDSurface",props:{colorRange:{required:!0,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:`Color ramp for surface height — low to high.
Use useChartColors().sequential.blue(5).`},opacity:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0.8",computed:!1}},wireframe:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const ie={title:"Lab/ThreeDChart",tags:["autodocs"]},J=Array.from({length:200},()=>({x:Math.random()*100,y:Math.random()*100,z:Math.random()*100})),K={render:()=>{const t=$();return e.jsxs(W,{direction:"vertical",gap:4,children:[e.jsx(q,{level:3,children:"3D Scatter Plot"}),e.jsx(A,{type:"supporting",color:"secondary",children:"200 points. Drag to rotate. Depth encoded via size and opacity."}),e.jsxs(_,{data:J,xKey:"x",yKey:"y",zKey:"z",height:400,interactive:!0,children:[e.jsx(B,{}),e.jsx(w,{}),e.jsx(U,{color:t.categorical(1)[0],radius:4})]})]})}},Q=[{product:0,region:0,sales:42},{product:1,region:0,sales:58},{product:2,region:0,sales:35},{product:0,region:1,sales:65},{product:1,region:1,sales:48},{product:2,region:1,sales:72},{product:0,region:2,sales:30},{product:1,region:2,sales:55},{product:2,region:2,sales:40}],C={render:()=>{const t=$();return e.jsxs(W,{direction:"vertical",gap:4,children:[e.jsx(q,{level:3,children:"3D Bar Chart"}),e.jsx(A,{type:"supporting",color:"secondary",children:"Sales by product x region. Drag to rotate."}),e.jsxs(_,{data:Q,xKey:"product",yKey:"sales",zKey:"region",height:400,interactive:!0,children:[e.jsx(B,{divisions:3}),e.jsx(w,{}),e.jsx(P,{color:t.categorical(1)[0],barWidth:.12,barDepth:.12})]})]})}},E=[];for(let t=0;t<=20;t++)for(let n=0;n<=20;n++){const u=t/20,s=n/20,a=Math.sin(u*Math.PI*2)*Math.cos(s*Math.PI*2)*50+50;E.push({x:t,y:Math.round(a),z:n})}const k={render:()=>{const t=$();return e.jsxs(W,{direction:"vertical",gap:4,children:[e.jsx(q,{level:3,children:"3D Surface"}),e.jsx(A,{type:"supporting",color:"secondary",children:"sin(x) * cos(z) surface. Drag to rotate. Color maps to height."}),e.jsxs(_,{data:E,xKey:"x",yKey:"y",zKey:"z",height:450,interactive:!0,children:[e.jsx(B,{}),e.jsx(w,{}),e.jsx(O,{colorRange:t.sequential.blue(5)})]})]})}},b={render:()=>{const t=$();return e.jsxs(W,{direction:"vertical",gap:4,children:[e.jsx(q,{level:3,children:"3D Wireframe"}),e.jsxs(_,{data:E,xKey:"x",yKey:"y",zKey:"z",height:450,interactive:!0,children:[e.jsx(B,{}),e.jsx(O,{colorRange:t.sequential.teal(5),wireframe:!0})]})]})}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:"3D scatter plot — drag to rotate",...K.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:"3D bar chart — drag to rotate",...C.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:"3D surface — height-colored mesh",...k.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:"3D surface wireframe",...b.parameters?.docs?.description}}};const ce=["Scatter3D","Bar3D","Surface3D","Wireframe3D"];export{C as Bar3D,K as Scatter3D,k as Surface3D,b as Wireframe3D,ce as __namedExportsOrder,ie as default};
