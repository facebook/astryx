import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";function n(e){return e.length===0?`transparent`:e.length===1?e[0]:`linear-gradient(to right, ${e.map((t,n)=>`${t} ${n/(e.length-1)*100}%`).join(`, `)})`}function r({items:e,gradient:t,domain:r,label:a,ticks:o=3,tickFormat:s=String}){if(t&&t.length>0&&r){let[e,c]=r,l=Array.from({length:o},(t,n)=>e+n/(o-1)*(c-e));return(0,i.jsx)(`foreignObject`,{x:0,y:-4,width:`100%`,height:48,style:{overflow:`visible`},children:(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:4,fontSize:12,color:`var(--color-text-secondary)`},children:[a&&(0,i.jsx)(`span`,{style:{fontWeight:500,color:`var(--color-text-primary)`},children:a}),(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:2,width:200},children:[(0,i.jsx)(`div`,{style:{height:10,borderRadius:4,background:n(t)}}),(0,i.jsx)(`div`,{style:{display:`flex`,justifyContent:`space-between`},children:l.map(e=>(0,i.jsx)(`span`,{style:{fontSize:10},children:s(e)},e))})]})]})})}return!e||e.length===0?null:(0,i.jsx)(`foreignObject`,{x:0,y:-4,width:`100%`,height:24,style:{overflow:`visible`},children:(0,i.jsx)(`div`,{style:{display:`flex`,gap:16,justifyContent:`center`,fontSize:12,color:`var(--color-text-secondary)`},children:e.map(e=>(0,i.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:4},children:[(0,i.jsx)(`div`,{style:{width:10,height:10,borderRadius:2,backgroundColor:e.color,flexShrink:0}}),(0,i.jsx)(`span`,{children:e.label})]},e.label))})})}var i;function a(){return(a=e((()=>{i=t(),r.__docgenInfo={description:`Chart legend — discrete swatches or continuous gradient.

@example
\`\`\`
<ChartLegend items={[
  {label: 'Revenue', color: colors[0]},
  {label: 'Expenses', color: colors[1]},
]} />
<ChartLegend
  gradient={useChartColors().sequential.blue(5)}
  domain={[0, 100]}
  label="Temperature"
/>
<ChartLegend
  gradient={useChartColors().diverging.coldHot(7)}
  domain={[-50, 50]}
  label="Change %"
/>
\`\`\``,methods:[],displayName:`ChartLegend`,props:{items:{required:!1,tsType:{name:`Array`,elements:[{name:`ChartLegendItem`}],raw:`ChartLegendItem[]`},description:`Discrete legend items — color swatches with labels`},gradient:{required:!1,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:`Continuous gradient — array of hex colors from low to high.
Pass the output of useChartColors().sequential.blue(5) or diverging directly.`},domain:{required:!1,tsType:{name:`tuple`,raw:`[number, number]`,elements:[{name:`number`},{name:`number`}]},description:`Numeric domain for the gradient [min, max]. Required when gradient is set.`},label:{required:!1,tsType:{name:`string`},description:`Label for the gradient legend`},ticks:{required:!1,tsType:{name:`number`},description:`Number of tick labels on the gradient bar (default: 3)`,defaultValue:{value:`3`,computed:!1}},tickFormat:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: number) => string`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`string`}}},description:`Custom tick formatter`,defaultValue:{value:`String`,computed:!0}}}}})))()}export{a as n,r as t};