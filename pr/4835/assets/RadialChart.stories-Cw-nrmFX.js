import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./VisuallyHidden-Z2NjNH-_.js";import{n as a,t as o}from"./Heading-CaMVckJS.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{n as l,t as u}from"./ChartLegend-CEsWUdbm.js";import{n as d,t as f}from"./useChartColors-tODQlwNr.js";function p(){let e=(0,m.useContext)(h);if(!e)throw Error(`Radial components must be used inside <RadialChart>`);return e}var m,h,g;function _(){return(_=e((()=>{m=t(),h=(0,m.createContext)(null),g=h.Provider})))()}function v(e,t){let n=Object.values(e).find(e=>typeof e==`string`);return typeof n==`string`?n:`Series ${t+1}`}function y({data:e,height:t=400,axes:n,valueKey:r,labelKey:a,innerRadius:o=0,padAngle:s=.02,label:c,children:l}){let u=(0,b.useRef)(null),[d,f]=(0,b.useState)(0);(0,b.useLayoutEffect)(()=>{if(!u.current)return;let e=new ResizeObserver(e=>{let t=e[0];t&&f(t.contentRect.width)});return e.observe(u.current),()=>e.disconnect()},[]);let p=Math.min(d,t),m=d/2,h=t/2,_=p/2-40,y=_*o,C=n?`spider`:`pie`,w=(0,b.useMemo)(()=>{if(!n||n.length===0)return{};let t=new Map,r=2*Math.PI/n.length;n.forEach((e,n)=>{t.set(e,-Math.PI/2+r*n)});let i=new Map;for(let t of n){let n=1/0,r=-1/0;for(let i of e){let e=i[t];typeof e==`number`&&(e<n&&(n=e),e>r&&(r=e))}n>0&&(n=0),i.set(t,[n,r])}return{axes:n,angleByAxis:t,radiusScale:e=>y+e*(_-y),axisDomains:i}},[n,e,_,y]),T=(0,b.useMemo)(()=>{if(!r)return{};let t=e.reduce((e,t)=>{let n=t[r];return e+(typeof n==`number`?n:0)},0);if(t===0)return{slices:[]};let n=s*e.length,i=2*Math.PI-n,o=-Math.PI/2;return{slices:e.map(e=>{let n=typeof e[r]==`number`?e[r]:0,c=n/t,l=c*i,u={key:String(a?e[a]:n),value:n,startAngle:o,endAngle:o+l,percentage:c};return o+=l+s,u})}},[e,r,a,s]),E=(0,b.useMemo)(()=>({cx:m,cy:h,radius:_,innerRadius:y,data:e,mode:C,...w,...T}),[m,h,_,y,e,C,w,T]),D=c??(C===`spider`?`Radar chart of ${(n??[]).join(`, `)}`:`Pie chart of ${r??`values`}`),O=T.slices??[],k=C===`pie`&&O.length>0&&O.length<=S,A=C===`spider`&&n!=null&&n.length>0&&e.length>0&&e.length*n.length<=S;return(0,x.jsxs)(`div`,{ref:u,style:{width:`100%`},children:[d>0&&(0,x.jsx)(`svg`,{role:`img`,"aria-label":D,width:d,height:t,children:(0,x.jsx)(g,{value:E,children:l})}),k&&(0,x.jsx)(i,{as:`div`,children:(0,x.jsxs)(`table`,{children:[(0,x.jsx)(`caption`,{children:`${D} data`}),(0,x.jsx)(`thead`,{children:(0,x.jsxs)(`tr`,{children:[(0,x.jsx)(`th`,{scope:`col`,children:a??`Label`}),(0,x.jsx)(`th`,{scope:`col`,children:r}),(0,x.jsx)(`th`,{scope:`col`,children:`Percentage`})]})}),(0,x.jsx)(`tbody`,{children:O.map((e,t)=>(0,x.jsxs)(`tr`,{children:[(0,x.jsx)(`th`,{scope:`row`,children:e.key}),(0,x.jsx)(`td`,{children:String(e.value)}),(0,x.jsx)(`td`,{children:`${(e.percentage*100).toFixed(1)}%`})]},t))})]})}),A&&(0,x.jsx)(i,{as:`div`,children:(0,x.jsxs)(`table`,{children:[(0,x.jsx)(`caption`,{children:`${D} data`}),(0,x.jsx)(`thead`,{children:(0,x.jsxs)(`tr`,{children:[(0,x.jsx)(`th`,{scope:`col`,children:`Series`}),n.map(e=>(0,x.jsx)(`th`,{scope:`col`,children:e},e))]})}),(0,x.jsx)(`tbody`,{children:e.map((e,t)=>(0,x.jsxs)(`tr`,{children:[(0,x.jsx)(`th`,{scope:`row`,children:v(e,t)}),n.map(t=>(0,x.jsx)(`td`,{children:e[t]==null?``:String(e[t])},t))]},t))})]})})]})}var b,x,S;function C(){return(C=e((()=>{b=t(),r(),_(),x=n(),S=100,y.__docgenInfo={description:`Root radial chart container. Computes angular/radial scales and provides
them to children via context.

@example
\`\`\`
<RadialChart data={data} axes={['speed', 'handling', 'comfort']} height={400}>
  <RadialGrid rings={5} />
  <RadialArea dataKey="modelA" color={colors[0]} />
  <RadialAxis />
</RadialChart>
<RadialChart data={data} valueKey="revenue" labelKey="region" height={400}>
  <RadialSlice />
</RadialChart>
<RadialChart data={data} valueKey="revenue" labelKey="region" innerRadius={0.6} height={400}>
  <RadialSlice />
</RadialChart>
\`\`\``,methods:[],displayName:`RadialChart`,props:{data:{required:!0,tsType:{name:`Array`,elements:[{name:`Record`,elements:[{name:`string`},{name:`unknown`}],raw:`Record<string, unknown>`}],raw:`Record<string, unknown>[]`},description:`The dataset`},height:{required:!1,tsType:{name:`number`},description:`Chart height in pixels. Width is responsive.`,defaultValue:{value:`400`,computed:!1}},axes:{required:!1,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:`Spider mode: array of axis keys (each key is a dimension).
When provided, the chart operates in spider mode.`},valueKey:{required:!1,tsType:{name:`string`},description:`Pie/donut mode: data key containing the numeric value for each slice.
When provided (without axes), the chart operates in pie mode.`},labelKey:{required:!1,tsType:{name:`string`},description:`Pie/donut mode: data key for the slice label.`},innerRadius:{required:!1,tsType:{name:`number`},description:`Inner radius as a fraction of outer radius (0-1).
0 = full pie/spider, 0.6 = donut. Default: 0.`,defaultValue:{value:`0`,computed:!1}},padAngle:{required:!1,tsType:{name:`number`},description:`Padding between pie slices in radians. Default: 0.02.`,defaultValue:{value:`0.02`,computed:!1}},interactive:{required:!1,tsType:{name:`boolean`},description:`Enable touch interaction mode — blocks scroll on mobile.`},label:{required:!1,tsType:{name:`string`},description:`Accessible name for the chart, announced by screen readers (the svg is
exposed as \`role="img"\`). Defaults to an English description derived from
the mode and keys (e.g. "Radar chart of speed, handling" or
"Pie chart of revenue") — pass a localized string to override.`},children:{required:!0,tsType:{name:`ReactNode`},description:``}}}})))()}function w({rings:e=5}){let{cx:t,cy:n,radius:r,innerRadius:i,axes:a,angleByAxis:o,radiusScale:s}=p();return!a||!o||!s?null:(0,T.jsxs)(`g`,{children:[Array.from({length:e},(r,i)=>{let c=(i+1)/e,l=s(c),u=a.map(e=>{let r=o.get(e);return r==null?``:`${t+Math.cos(r)*l},${n+Math.sin(r)*l}`}).filter(Boolean).join(` `);return(0,T.jsx)(`polygon`,{points:u,fill:`none`,stroke:`var(--color-border)`,strokeOpacity:.3,strokeWidth:1},i)}),a.map(e=>{let a=o.get(e);return a==null?null:(0,T.jsx)(`line`,{x1:t+Math.cos(a)*i,y1:n+Math.sin(a)*i,x2:t+Math.cos(a)*r,y2:n+Math.sin(a)*r,stroke:`var(--color-border)`,strokeOpacity:.3,strokeWidth:1},e)})]})}var T;function E(){return(E=e((()=>{_(),T=n(),w.__docgenInfo={description:"Concentric grid rings and axis lines for spider charts.\n\n@example\n```\n<RadialGrid rings={5} />\n```",methods:[],displayName:`RadialGrid`,props:{rings:{required:!1,tsType:{name:`number`},description:`Number of concentric rings (default: 5)`,defaultValue:{value:`5`,computed:!1}}}}})))()}function D({dataKey:e,color:t,opacity:n=.2,strokeWidth:r=2,dots:i=!1,dotRadius:a=4}){let{cx:o,cy:s,data:c,axes:l,angleByAxis:u,radiusScale:d,axisDomains:f}=p(),m=(0,O.useMemo)(()=>{if(!l||!u||!d||!f)return[];let t=c.find(t=>Object.values(t).some(t=>t===e))??c[0];return t?l.map(e=>{let n=u.get(e),r=f.get(e);if(n==null||!r)return{x:o,y:s,key:e};let i=typeof t[e]==`number`?t[e]:0,[a,c]=r,l=c>a?(i-a)/(c-a):0,p=d(Math.max(0,Math.min(1,l)));return{x:o+Math.cos(n)*p,y:s+Math.sin(n)*p,key:e}}):[]},[o,s,c,e,l,u,d,f]);if(m.length===0)return null;let h=m.map(e=>`${e.x},${e.y}`).join(` `);return(0,k.jsxs)(`g`,{children:[(0,k.jsx)(`polygon`,{points:h,fill:t,fillOpacity:n,stroke:t,strokeWidth:r,strokeLinejoin:`round`}),i&&m.map(e=>(0,k.jsx)(`circle`,{cx:e.x,cy:e.y,r:a,fill:t},e.key))]})}var O,k;function A(){return(A=e((()=>{O=t(),_(),k=n(),D.__docgenInfo={description:`Spider/radar polygon. Reads axis definitions and scales from radial context.
Each axis value is normalized to [0,1] within its domain, then mapped to radius.

@example
\`\`\`
<RadialArea dataKey="modelA" color={colors[0]} dots />
\`\`\``,methods:[],displayName:`RadialArea`,props:{dataKey:{required:!0,tsType:{name:`string`},description:`Key identifying which dataset row to plot (matches a value in data)`},color:{required:!0,tsType:{name:`string`},description:`Fill color`},opacity:{required:!1,tsType:{name:`number`},description:`Fill opacity (default: 0.2)`,defaultValue:{value:`0.2`,computed:!1}},strokeWidth:{required:!1,tsType:{name:`number`},description:`Stroke width (default: 2)`,defaultValue:{value:`2`,computed:!1}},dots:{required:!1,tsType:{name:`boolean`},description:`Show dots at vertices`,defaultValue:{value:`false`,computed:!1}},dotRadius:{required:!1,tsType:{name:`number`},description:`Dot radius`,defaultValue:{value:`4`,computed:!1}}}}})))()}function j({labelOffset:e=16}){let{cx:t,cy:n,radius:r,axes:i,angleByAxis:a}=p();return!i||!a?null:(0,M.jsx)(`g`,{children:i.map(i=>{let o=a.get(i);if(o==null)return null;let s=t+Math.cos(o)*(r+e),c=n+Math.sin(o)*(r+e);return(0,M.jsx)(`text`,{x:s,y:c,textAnchor:Math.cos(o)>.1?`start`:Math.cos(o)<-.1?`end`:`middle`,dominantBaseline:`central`,fill:`var(--color-text-secondary)`,fontSize:12,children:i},i)})})}var M;function N(){return(N=e((()=>{_(),M=n(),j.__docgenInfo={description:"Axis labels positioned at each spider chart vertex.\n\n@example\n```\n<RadialAxis />\n```",methods:[],displayName:`RadialAxis`,props:{labelOffset:{required:!1,tsType:{name:`number`},description:`Label offset from the outer ring in pixels (default: 16)`,defaultValue:{value:`16`,computed:!1}}}}})))()}function P(e,t,n,r,i,a){let o=e+Math.cos(i)*r,s=t+Math.sin(i)*r,c=e+Math.cos(a)*r,l=t+Math.sin(a)*r,u=e+Math.cos(a)*n,d=t+Math.sin(a)*n,f=e+Math.cos(i)*n,p=t+Math.sin(i)*n,m=+(a-i>Math.PI);return n===0?[`M ${e} ${t}`,`L ${o} ${s}`,`A ${r} ${r} 0 ${m} 1 ${c} ${l}`,`Z`].join(` `):[`M ${o} ${s}`,`A ${r} ${r} 0 ${m} 1 ${c} ${l}`,`L ${u} ${d}`,`A ${n} ${n} 0 ${m} 0 ${f} ${p}`,`Z`].join(` `)}function F({colors:e,cornerRadius:t=0,labels:n=!0,labelThreshold:r=5}){let{cx:i,cy:a,radius:o,innerRadius:s,slices:c}=p();return!c||c.length===0?null:(0,I.jsx)(`g`,{children:c.map((c,l)=>{let u=e[l%e.length],d=P(i,a,s,o,c.startAngle,c.endAngle),f=(c.startAngle+c.endAngle)/2,p=s+(o-s)*.6,m=i+Math.cos(f)*p,h=a+Math.sin(f)*p,g=n&&c.percentage*100>=r;return(0,I.jsxs)(`g`,{children:[(0,I.jsx)(`path`,{d,fill:u,stroke:`var(--color-background-surface)`,strokeWidth:t>0?0:1}),g&&(0,I.jsxs)(`text`,{x:m,y:h,textAnchor:`middle`,dominantBaseline:`central`,fill:`var(--color-text-primary)`,fontSize:12,fontWeight:500,children:[Math.round(c.percentage*100),`%`]})]},c.key)})})}var I;function L(){return(L=e((()=>{_(),I=n(),F.__docgenInfo={description:"Pie/donut slices. Reads slice geometry from radial context.\n\n@example\n```\n<RadialSlice colors={colors.categorical(5)} />\n```",methods:[],displayName:`RadialSlice`,props:{colors:{required:!0,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:`Colors for each slice. Array of hex strings.
Use useChartColors().categorical(n).`},cornerRadius:{required:!1,tsType:{name:`number`},description:`Corner radius on slice edges (default: 2)`,defaultValue:{value:`0`,computed:!1}},labels:{required:!1,tsType:{name:`boolean`},description:`Show percentage labels (default: true)`,defaultValue:{value:`true`,computed:!1}},labelThreshold:{required:!1,tsType:{name:`number`},description:`Minimum percentage to show a label (default: 5)`,defaultValue:{value:`5`,computed:!1}}}}})))()}var R,z,B,V,H,U,W,G,K;function q(){return(q=e((()=>{C(),E(),A(),N(),L(),l(),f(),s(),a(),R=n(),z={title:`Lab/RadialChart`,tags:[`autodocs`]},B=[{model:`Model A`,speed:85,handling:70,comfort:90,safety:95,efficiency:60},{model:`Model B`,speed:70,handling:95,comfort:60,safety:80,efficiency:85},{model:`Model C`,speed:95,handling:60,comfort:75,safety:70,efficiency:90}],V={render:()=>{let e=d().categorical(3);return(0,R.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,R.jsx)(o,{level:3,children:`Spider Chart`}),(0,R.jsxs)(y,{data:B,axes:[`speed`,`handling`,`comfort`,`safety`,`efficiency`],height:400,children:[(0,R.jsx)(w,{rings:5}),(0,R.jsx)(D,{dataKey:`Model A`,color:e[0],dots:!0}),(0,R.jsx)(D,{dataKey:`Model B`,color:e[1],dots:!0}),(0,R.jsx)(D,{dataKey:`Model C`,color:e[2],dots:!0}),(0,R.jsx)(j,{}),(0,R.jsx)(u,{items:[{label:`Model A`,color:e[0]},{label:`Model B`,color:e[1]},{label:`Model C`,color:e[2]}]})]})]})}},H=[{region:`North America`,revenue:42},{region:`Europe`,revenue:28},{region:`Asia Pacific`,revenue:18},{region:`Latin America`,revenue:8},{region:`Africa`,revenue:4}],U={render:()=>{let e=d();return(0,R.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,R.jsx)(o,{level:3,children:`Pie Chart`}),(0,R.jsxs)(y,{data:H,valueKey:`revenue`,labelKey:`region`,height:400,children:[(0,R.jsx)(F,{colors:e.categorical(5)}),(0,R.jsx)(u,{items:H.map((t,n)=>({label:t.region,color:e.categorical(5)[n]}))})]})]})}},W={render:()=>{let e=d();return(0,R.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,R.jsx)(o,{level:3,children:`Donut Chart`}),(0,R.jsxs)(y,{data:H,valueKey:`revenue`,labelKey:`region`,innerRadius:.55,height:400,children:[(0,R.jsx)(F,{colors:e.categorical(5)}),(0,R.jsx)(u,{items:H.map((t,n)=>({label:t.region,color:e.categorical(5)[n]}))})]})]})}},G={render:()=>{let e=d().categorical(2);return(0,R.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,R.jsx)(o,{level:3,children:`Spider with Inner Radius`}),(0,R.jsxs)(y,{data:B,axes:[`speed`,`handling`,`comfort`,`safety`,`efficiency`],innerRadius:.2,height:400,children:[(0,R.jsx)(w,{rings:4}),(0,R.jsx)(D,{dataKey:`Model A`,color:e[0],dots:!0}),(0,R.jsx)(D,{dataKey:`Model B`,color:e[1],dots:!0}),(0,R.jsx)(j,{})]})]})}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`Spider/radar chart comparing three models across five dimensions`,...V.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source},description:{story:`Pie chart — revenue by region`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source},description:{story:`Donut chart — same data with inner radius`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:`Spider with donut center`,...G.parameters?.docs?.description}}},K=[`SpiderChart`,`PieChart`,`DonutChart`,`SpiderDonut`]})))()}q();export{W as DonutChart,U as PieChart,V as SpiderChart,G as SpiderDonut,K as __namedExportsOrder,z as default};