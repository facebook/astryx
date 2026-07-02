import{a1 as e}from"./iframe-Cm6U1NA5.js";function g(n){return n.length===0?"transparent":n.length===1?n[0]:`linear-gradient(to right, ${n.map((i,a)=>`${i} ${a/(n.length-1)*100}%`).join(", ")})`}function h({items:n,gradient:r,domain:i,label:a,ticks:l=3,tickFormat:o=String}){if(r&&r.length>0&&i){const[t,d]=i,u=Array.from({length:l},(s,c)=>t+c/(l-1)*(d-t));return e.jsx("foreignObject",{x:0,y:-4,width:"100%",height:48,style:{overflow:"visible"},children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontSize:12,color:"var(--color-text-secondary)"},children:[a&&e.jsx("span",{style:{fontWeight:500,color:"var(--color-text-primary)"},children:a}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:2,width:200},children:[e.jsx("div",{style:{height:10,borderRadius:4,background:g(r)}}),e.jsx("div",{style:{display:"flex",justifyContent:"space-between"},children:u.map(s=>e.jsx("span",{style:{fontSize:10},children:o(s)},s))})]})]})})}return!n||n.length===0?null:e.jsx("foreignObject",{x:0,y:-4,width:"100%",height:24,style:{overflow:"visible"},children:e.jsx("div",{style:{display:"flex",gap:16,justifyContent:"center",fontSize:12,color:"var(--color-text-secondary)"},children:n.map(t=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:4},children:[e.jsx("div",{style:{width:10,height:10,borderRadius:2,backgroundColor:t.color,flexShrink:0}}),e.jsx("span",{children:t.label})]},t.label))})})}h.__docgenInfo={description:`Chart legend — discrete swatches or continuous gradient.

@example
\`\`\`
// Discrete
<ChartLegend items={[
  {label: 'Revenue', color: colors[0]},
  {label: 'Expenses', color: colors[1]},
]} />

// Continuous — pipe useChartColors() directly
<ChartLegend
  gradient={useChartColors().sequential.blue(5)}
  domain={[0, 100]}
  label="Temperature"
/>

// Diverging
<ChartLegend
  gradient={useChartColors().diverging.coldHot(7)}
  domain={[-50, 50]}
  label="Change %"
/>
\`\`\``,methods:[],displayName:"ChartLegend",props:{items:{required:!1,tsType:{name:"Array",elements:[{name:"ChartLegendItem"}],raw:"ChartLegendItem[]"},description:"Discrete legend items — color swatches with labels"},gradient:{required:!1,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:`Continuous gradient — array of hex colors from low to high.
Pass the output of useChartColors().sequential.blue(5) or diverging directly.`},domain:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:"Numeric domain for the gradient [min, max]. Required when gradient is set."},label:{required:!1,tsType:{name:"string"},description:"Label for the gradient legend"},ticks:{required:!1,tsType:{name:"number"},description:"Number of tick labels on the gradient bar (default: 3)",defaultValue:{value:"3",computed:!1}},tickFormat:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: number) => string",signature:{arguments:[{type:{name:"number"},name:"value"}],return:{name:"string"}}},description:"Custom tick formatter",defaultValue:{value:"String",computed:!0}}}};export{h as C};
