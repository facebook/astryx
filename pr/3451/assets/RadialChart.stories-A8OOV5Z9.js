import{ah as b,a1 as e}from"./iframe-VDTgZ3S9.js";import{S as L}from"./Stack-YX98LP5s.js";import{u as _}from"./useChartColors-W8LUkfoQ.js";import{H as V}from"./Heading-CUggt4vn.js";import{C as E}from"./ChartLegend-BGePMn6s.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";const z=b.createContext(null),U=z.Provider;function H(){const a=b.useContext(z);if(!a)throw new Error("Radial components must be used inside <RadialChart>");return a}function I({data:a,height:r=400,axes:t,valueKey:o,labelKey:c,innerRadius:u=0,padAngle:s=.02,children:l}){const d=b.useRef(null),[n,f]=b.useState(0);b.useLayoutEffect(()=>{if(!d.current)return;const v=new ResizeObserver(j=>{const C=j[0];C&&f(C.contentRect.width)});return v.observe(d.current),()=>v.disconnect()},[]);const h=Math.min(n,r),m=n/2,g=r/2,p=h/2-40,i=p*u,y=t?"spider":"pie",R=b.useMemo(()=>{if(!t||t.length===0)return{};const v=new Map,j=2*Math.PI/t.length;t.forEach((w,x)=>{v.set(w,-Math.PI/2+j*x)});const C=new Map;for(const w of t){let x=1/0,M=-1/0;for(const $ of a){const S=$[w];typeof S=="number"&&(S<x&&(x=S),S>M&&(M=S))}x>0&&(x=0),C.set(w,[x,M])}return{axes:t,angleByAxis:v,radiusScale:w=>i+w*(p-i),axisDomains:C}},[t,a,p,i]),T=b.useMemo(()=>{if(!o)return{};const v=a.reduce((x,M)=>{const $=M[o];return x+(typeof $=="number"?$:0)},0);if(v===0)return{slices:[]};const j=s*a.length,C=2*Math.PI-j;let A=-Math.PI/2;return{slices:a.map(x=>{const M=typeof x[o]=="number"?x[o]:0,$=M/v,S=$*C,Z={key:String(c?x[c]:M),value:M,startAngle:A,endAngle:A+S,percentage:$};return A+=S+s,Z})}},[a,o,c,s]),W=b.useMemo(()=>({cx:m,cy:g,radius:p,innerRadius:i,data:a,mode:y,...R,...T}),[m,g,p,i,a,y,R,T]);return e.jsx("div",{ref:d,style:{width:"100%"},children:n>0&&e.jsx("svg",{width:n,height:r,children:e.jsx(U,{value:W,children:l})})})}I.__docgenInfo={description:`Root radial chart container. Computes angular/radial scales and provides
them to children via context.

@example
\`\`\`
// Spider
<RadialChart data={data} axes={['speed', 'handling', 'comfort']} height={400}>
  <RadialGrid rings={5} />
  <RadialArea dataKey="modelA" color={colors[0]} />
  <RadialAxis />
</RadialChart>

// Pie
<RadialChart data={data} valueKey="revenue" labelKey="region" height={400}>
  <RadialSlice />
</RadialChart>

// Donut
<RadialChart data={data} valueKey="revenue" labelKey="region" innerRadius={0.6} height={400}>
  <RadialSlice />
</RadialChart>
\`\`\``,methods:[],displayName:"RadialChart",props:{data:{required:!0,tsType:{name:"Array",elements:[{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"}],raw:"Record<string, unknown>[]"},description:"The dataset"},height:{required:!1,tsType:{name:"number"},description:"Chart height in pixels. Width is responsive.",defaultValue:{value:"400",computed:!1}},axes:{required:!1,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:`Spider mode: array of axis keys (each key is a dimension).
When provided, the chart operates in spider mode.`},valueKey:{required:!1,tsType:{name:"string"},description:`Pie/donut mode: data key containing the numeric value for each slice.
When provided (without axes), the chart operates in pie mode.`},labelKey:{required:!1,tsType:{name:"string"},description:"Pie/donut mode: data key for the slice label."},innerRadius:{required:!1,tsType:{name:"number"},description:`Inner radius as a fraction of outer radius (0-1).
0 = full pie/spider, 0.6 = donut. Default: 0.`,defaultValue:{value:"0",computed:!1}},padAngle:{required:!1,tsType:{name:"number"},description:"Padding between pie slices in radians. Default: 0.02.",defaultValue:{value:"0.02",computed:!1}},interactive:{required:!1,tsType:{name:"boolean"},description:"Enable touch interaction mode — blocks scroll on mobile."},children:{required:!0,tsType:{name:"ReactNode"},description:""}}};function N({rings:a=5}){const{cx:r,cy:t,radius:o,innerRadius:c,axes:u,angleByAxis:s,radiusScale:l}=H();return!u||!s||!l?null:e.jsxs("g",{children:[Array.from({length:a},(d,n)=>{const f=(n+1)/a,h=l(f),m=u.map(g=>{const p=s.get(g);return p==null?"":`${r+Math.cos(p)*h},${t+Math.sin(p)*h}`}).filter(Boolean).join(" ");return e.jsx("polygon",{points:m,fill:"none",stroke:"var(--color-border)",strokeOpacity:.3,strokeWidth:1},n)}),u.map(d=>{const n=s.get(d);return n==null?null:e.jsx("line",{x1:r+Math.cos(n)*c,y1:t+Math.sin(n)*c,x2:r+Math.cos(n)*o,y2:t+Math.sin(n)*o,stroke:"var(--color-border)",strokeOpacity:.3,strokeWidth:1},d)})]})}N.__docgenInfo={description:"Concentric grid rings and axis lines for spider charts.\n\n@example\n```\n<RadialGrid rings={5} />\n```",methods:[],displayName:"RadialGrid",props:{rings:{required:!1,tsType:{name:"number"},description:"Number of concentric rings (default: 5)",defaultValue:{value:"5",computed:!1}}}};function k({dataKey:a,color:r,opacity:t=.2,strokeWidth:o=2,dots:c=!1,dotRadius:u=4}){const{cx:s,cy:l,data:d,axes:n,angleByAxis:f,radiusScale:h,axisDomains:m}=H(),g=b.useMemo(()=>{if(!n||!f||!h||!m)return[];const i=d.find(y=>Object.values(y).some(R=>R===a))??d[0];return i?n.map(y=>{const R=f.get(y),T=m.get(y);if(R==null||!T)return{x:s,y:l,key:y};const W=typeof i[y]=="number"?i[y]:0,[v,j]=T,C=j>v?(W-v)/(j-v):0,A=h(Math.max(0,Math.min(1,C)));return{x:s+Math.cos(R)*A,y:l+Math.sin(R)*A,key:y}}):[]},[s,l,d,a,n,f,h,m]);if(g.length===0)return null;const p=g.map(i=>`${i.x},${i.y}`).join(" ");return e.jsxs("g",{children:[e.jsx("polygon",{points:p,fill:r,fillOpacity:t,stroke:r,strokeWidth:o,strokeLinejoin:"round"}),c&&g.map(i=>e.jsx("circle",{cx:i.x,cy:i.y,r:u,fill:r},i.key))]})}k.__docgenInfo={description:'Spider/radar polygon. Reads axis definitions and scales from radial context.\nEach axis value is normalized to [0,1] within its domain, then mapped to radius.\n\n@example\n```\n<RadialArea dataKey="modelA" color={colors[0]} dots />\n```',methods:[],displayName:"RadialArea",props:{dataKey:{required:!0,tsType:{name:"string"},description:"Key identifying which dataset row to plot (matches a value in data)"},color:{required:!0,tsType:{name:"string"},description:"Fill color"},opacity:{required:!1,tsType:{name:"number"},description:"Fill opacity (default: 0.2)",defaultValue:{value:"0.2",computed:!1}},strokeWidth:{required:!1,tsType:{name:"number"},description:"Stroke width (default: 2)",defaultValue:{value:"2",computed:!1}},dots:{required:!1,tsType:{name:"boolean"},description:"Show dots at vertices",defaultValue:{value:"false",computed:!1}},dotRadius:{required:!1,tsType:{name:"number"},description:"Dot radius",defaultValue:{value:"4",computed:!1}}}};function G({labelOffset:a=16}){const{cx:r,cy:t,radius:o,axes:c,angleByAxis:u}=H();return!c||!u?null:e.jsx("g",{children:c.map(s=>{const l=u.get(s);if(l==null)return null;const d=r+Math.cos(l)*(o+a),n=t+Math.sin(l)*(o+a),f=Math.cos(l)>.1,h=Math.cos(l)<-.1,m=f?"start":h?"end":"middle";return e.jsx("text",{x:d,y:n,textAnchor:m,dominantBaseline:"central",fill:"var(--color-text-secondary)",fontSize:12,children:s},s)})})}G.__docgenInfo={description:"Axis labels positioned at each spider chart vertex.\n\n@example\n```\n<RadialAxis />\n```",methods:[],displayName:"RadialAxis",props:{labelOffset:{required:!1,tsType:{name:"number"},description:"Label offset from the outer ring in pixels (default: 16)",defaultValue:{value:"16",computed:!1}}}};function J(a,r,t,o,c,u){const s=a+Math.cos(c)*o,l=r+Math.sin(c)*o,d=a+Math.cos(u)*o,n=r+Math.sin(u)*o,f=a+Math.cos(u)*t,h=r+Math.sin(u)*t,m=a+Math.cos(c)*t,g=r+Math.sin(c)*t,i=u-c>Math.PI?1:0;return t===0?[`M ${a} ${r}`,`L ${s} ${l}`,`A ${o} ${o} 0 ${i} 1 ${d} ${n}`,"Z"].join(" "):[`M ${s} ${l}`,`A ${o} ${o} 0 ${i} 1 ${d} ${n}`,`L ${f} ${h}`,`A ${t} ${t} 0 ${i} 0 ${m} ${g}`,"Z"].join(" ")}function O({colors:a,cornerRadius:r=0,labels:t=!0,labelThreshold:o=5}){const{cx:c,cy:u,radius:s,innerRadius:l,slices:d}=H();return!d||d.length===0?null:e.jsx("g",{children:d.map((n,f)=>{const h=a[f%a.length],m=J(c,u,l,s,n.startAngle,n.endAngle),g=(n.startAngle+n.endAngle)/2,p=l+(s-l)*.6,i=c+Math.cos(g)*p,y=u+Math.sin(g)*p,R=t&&n.percentage*100>=o;return e.jsxs("g",{children:[e.jsx("path",{d:m,fill:h,stroke:"var(--color-background-surface)",strokeWidth:r>0?0:1}),R&&e.jsxs("text",{x:i,y,textAnchor:"middle",dominantBaseline:"central",fill:"var(--color-text-primary)",fontSize:12,fontWeight:500,children:[Math.round(n.percentage*100),"%"]})]},n.key)})})}O.__docgenInfo={description:"Pie/donut slices. Reads slice geometry from radial context.\n\n@example\n```\n<RadialSlice colors={colors.categorical(5)} />\n```",methods:[],displayName:"RadialSlice",props:{colors:{required:!0,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:`Colors for each slice. Array of hex strings.
Use useChartColors().categorical(n).`},cornerRadius:{required:!1,tsType:{name:"number"},description:"Corner radius on slice edges (default: 2)",defaultValue:{value:"0",computed:!1}},labels:{required:!1,tsType:{name:"boolean"},description:"Show percentage labels (default: true)",defaultValue:{value:"true",computed:!1}},labelThreshold:{required:!1,tsType:{name:"number"},description:"Minimum percentage to show a label (default: 5)",defaultValue:{value:"5",computed:!1}}}};const oe={title:"Lab/RadialChart",tags:["autodocs"]},F=[{model:"Model A",speed:85,handling:70,comfort:90,safety:95,efficiency:60},{model:"Model B",speed:70,handling:95,comfort:60,safety:80,efficiency:85},{model:"Model C",speed:95,handling:60,comfort:75,safety:70,efficiency:90}],P={render:()=>{const r=_().categorical(3);return e.jsxs(L,{direction:"vertical",gap:4,children:[e.jsx(V,{level:3,children:"Spider Chart"}),e.jsxs(I,{data:F,axes:["speed","handling","comfort","safety","efficiency"],height:400,children:[e.jsx(N,{rings:5}),e.jsx(k,{dataKey:"Model A",color:r[0],dots:!0}),e.jsx(k,{dataKey:"Model B",color:r[1],dots:!0}),e.jsx(k,{dataKey:"Model C",color:r[2],dots:!0}),e.jsx(G,{}),e.jsx(E,{items:[{label:"Model A",color:r[0]},{label:"Model B",color:r[1]},{label:"Model C",color:r[2]}]})]})]})}},B=[{region:"North America",revenue:42},{region:"Europe",revenue:28},{region:"Asia Pacific",revenue:18},{region:"Latin America",revenue:8},{region:"Africa",revenue:4}],q={render:()=>{const a=_();return e.jsxs(L,{direction:"vertical",gap:4,children:[e.jsx(V,{level:3,children:"Pie Chart"}),e.jsxs(I,{data:B,valueKey:"revenue",labelKey:"region",height:400,children:[e.jsx(O,{colors:a.categorical(5)}),e.jsx(E,{items:B.map((r,t)=>({label:r.region,color:a.categorical(5)[t]}))})]})]})}},D={render:()=>{const a=_();return e.jsxs(L,{direction:"vertical",gap:4,children:[e.jsx(V,{level:3,children:"Donut Chart"}),e.jsxs(I,{data:B,valueKey:"revenue",labelKey:"region",innerRadius:.55,height:400,children:[e.jsx(O,{colors:a.categorical(5)}),e.jsx(E,{items:B.map((r,t)=>({label:r.region,color:a.categorical(5)[t]}))})]})]})}},K={render:()=>{const r=_().categorical(2);return e.jsxs(L,{direction:"vertical",gap:4,children:[e.jsx(V,{level:3,children:"Spider with Inner Radius"}),e.jsxs(I,{data:F,axes:["speed","handling","comfort","safety","efficiency"],innerRadius:.2,height:400,children:[e.jsx(N,{rings:4}),e.jsx(k,{dataKey:"Model A",color:r[0],dots:!0}),e.jsx(k,{dataKey:"Model B",color:r[1],dots:!0}),e.jsx(G,{})]})]})}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:"Spider/radar chart comparing three models across five dimensions",...P.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source},description:{story:"Pie chart — revenue by region",...q.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:"Donut chart — same data with inner radius",...D.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:"Spider with donut center",...K.parameters?.docs?.description}}};const ie=["SpiderChart","PieChart","DonutChart","SpiderDonut"];export{D as DonutChart,q as PieChart,P as SpiderChart,K as SpiderDonut,ie as __namedExportsOrder,oe as default};
