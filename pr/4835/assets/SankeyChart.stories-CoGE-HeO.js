import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./VisuallyHidden-Z2NjNH-_.js";import{n as s,t as c}from"./Heading-CaMVckJS.js";import{n as l,t as u}from"./Stack-D-ryFIvw.js";function d(){let e=(0,f.useContext)(p);if(!e)throw Error(`Sankey components must be used inside <SankeyChart>`);return e}var f,p,m;function h(){return(h=e((()=>{f=t(),p=(0,f.createContext)(null),m=p.Provider})))()}function g(e){return e.map(e=>Array.isArray(e)?{ids:e}:e)}function _(e,t){let n=new Map,r=new Map;e.forEach(e=>{n.set(e.id,0),r.set(e.id,[])}),t.forEach(e=>{n.set(e.target,(n.get(e.target)||0)+1),r.get(e.source)?.push(e.target)});let i=new Map,a=[];for(e.forEach(e=>{n.get(e.id)===0&&(a.push(e.id),i.set(e.id,0))});a.length;){let e=a.shift();if(e==null)break;let t=i.get(e)??0;for(let o of r.get(e)||[]){let e=t+1;i.set(o,Math.max(i.get(o)||0,e)),n.set(o,(n.get(o)||0)-1),n.get(o)===0&&a.push(o)}}let o=Math.max(...Array.from(i.values()),0),s=Array.from({length:o+1},()=>({ids:[]}));return e.forEach(e=>{s[i.get(e.id)||0].ids.push(e.id)}),s}function v(e,t,n){let{width:r,height:i,nodeWidth:a=20,nodeGap:o=14,labelMargin:s=28}=n,c=n.columns?g(n.columns):_(e,t),l=c.length,u=c.some(e=>e.label)?20:0,d=new Map;e.forEach(e=>d.set(e.id,e));let f=i-s-16-u,p=0;c.forEach(e=>{let t=e.ids.reduce((e,t)=>e+(d.get(t)?.value||0),0);t>p&&(p=t)});let m=(f-(Math.max(...c.map(e=>e.ids.length))-1)*o)/p,h=l>1?(r-a)/(l-1):0,v=[],b=new Map,x=0;c.forEach((e,t)=>{let n=t*h;v.push({x:n,label:e.label,ids:e.ids});let r=e.ids.reduce((e,t)=>e+(d.get(t)?.value||0)*m,0),i=(e.ids.length-1)*o,c=s+(f-r-i)/2;e.ids.forEach(e=>{let r=d.get(e);if(!r)return;let i=r.value*m,s=r.color||y[x%y.length];x++,b.set(e,{id:e,label:r.label,value:r.value,color:s,x:n,y:c,width:a,height:i,column:t,_sourceOffset:0,_targetOffset:0}),c+=i+o})});let S=t.flatMap(e=>{let t=b.get(e.source),n=b.get(e.target);if(!t||!n)return[];let r=e.value*m,i=t.y+t._sourceOffset,a=n.y+n._targetOffset;return t._sourceOffset+=r,n._targetOffset+=r,[{source:t,target:n,value:e.value,height:r,sourceY:i,targetY:a}]});return{nodes:Array.from(b.values()),links:S,columns:v,valueScale:m,maxValue:p}}var y;function b(){return(b=e((()=>{y=[[.65,.2,270],[.6,.17,235],[.62,.16,190],[.64,.18,155],[.58,.15,40],[.55,.14,350],[.54,.15,20],[.56,.13,300]]})))()}function x(e,t,n){if(e)return e.length;let r=new Map,i=new Map;t.forEach(e=>{r.set(e.id,0),i.set(e.id,[])}),n.forEach(e=>{r.set(e.target,(r.get(e.target)||0)+1),i.get(e.source)?.push(e.target)});let a=new Map,o=[];for(t.forEach(e=>{r.get(e.id)===0&&(o.push(e.id),a.set(e.id,0))});o.length;){let e=o.shift();if(e==null)break;let t=a.get(e)??0;for(let n of i.get(e)||[])a.set(n,Math.max(a.get(n)||0,t+1)),r.set(n,(r.get(n)||0)-1),r.get(n)===0&&o.push(n)}return Math.max(...Array.from(a.values()),0)+1}function S({nodes:e,links:t,columns:n,height:r=320,nodeWidth:i=20,nodeGap:a=14,nodeColor:s,minColumnWidth:c=160,label:l=`Sankey chart`,children:u}){let d=(0,C.useRef)(null),[f,p]=(0,C.useState)(0);(0,C.useLayoutEffect)(()=>{let e=d.current;if(!e)return;let t=new ResizeObserver(e=>{let t=e[0]?.contentRect.width??0;p(t)});return t.observe(e),()=>t.disconnect()},[]);let h=(0,C.useMemo)(()=>x(n,e,t),[n,e,t])*c,g=Math.max(f,h),_=f>0&&g>f,y=(0,C.useMemo)(()=>f===0?null:v(e,t,{width:g,height:r,nodeWidth:i,nodeGap:a,columns:n}),[e,t,g,r,i,a,n,f]),b=(0,C.useMemo)(()=>y?{nodes:y.nodes,links:y.links,columns:y.columns,width:g,height:r,valueScale:y.valueScale,maxValue:y.maxValue,nodeWidth:i,nodeColor:s}:null,[y,g,r,i,s]),S=(0,C.useMemo)(()=>new Map(e.map(e=>[e.id,e.label||e.id])),[e]),T=t.length>0&&t.length<=ee;return(0,w.jsxs)(`div`,{ref:d,style:{width:`100%`},children:[b&&(0,w.jsx)(`div`,{role:_?`group`:void 0,"aria-label":_?l:void 0,tabIndex:_?0:void 0,style:_?{overflowX:`auto`,overflowY:`hidden`}:void 0,children:(0,w.jsx)(`svg`,{role:`img`,"aria-label":l,width:g,height:r,style:{overflow:`visible`,display:`block`},children:(0,w.jsx)(m,{value:b,children:u})})}),T&&(0,w.jsx)(o,{as:`div`,children:(0,w.jsxs)(`table`,{children:[(0,w.jsx)(`caption`,{children:`${l} data`}),(0,w.jsx)(`thead`,{children:(0,w.jsxs)(`tr`,{children:[(0,w.jsx)(`th`,{scope:`col`,children:`From`}),(0,w.jsx)(`th`,{scope:`col`,children:`To`}),(0,w.jsx)(`th`,{scope:`col`,children:`Value`})]})}),(0,w.jsx)(`tbody`,{children:t.map((e,t)=>(0,w.jsxs)(`tr`,{children:[(0,w.jsx)(`th`,{scope:`row`,children:S.get(e.source)??e.source}),(0,w.jsx)(`td`,{children:S.get(e.target)??e.target}),(0,w.jsx)(`td`,{children:String(e.value)})]},t))})]})})]})}var C,w,ee;function T(){return(T=e((()=>{C=t(),a(),h(),b(),w=i(),ee=100,S.displayName=`SankeyChart`,S.__docgenInfo={description:`Root component for Sankey/flow diagrams.

Computes layout from nodes + links, exposes positions via context.
Width is responsive but enforces minColumnWidth — scrolls when needed.

@example
\`\`\`
<SankeyChart
  nodes={nodes}
  links={links}
  columns={[
    {ids: ['a', 'b'], label: 'Source'},
    {ids: ['c', 'd'], label: 'Target'},
  ]}>
  <SankeyGrid />
  <SankeyLink />
  <SankeyNode />
  <SankeyLabel />
</SankeyChart>
\`\`\``,methods:[],displayName:`SankeyChart`,props:{nodes:{required:!0,tsType:{name:`Array`,elements:[{name:`SankeyNodeDatum`}],raw:`SankeyNodeDatum[]`},description:`Node definitions`},links:{required:!0,tsType:{name:`Array`,elements:[{name:`SankeyLinkDatum`}],raw:`SankeyLinkDatum[]`},description:`Link definitions`},columns:{required:!1,tsType:{name:`Array`,elements:[{name:`union`,raw:`string[] | SankeyColumnDef`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`SankeyColumnDef`}]}],raw:`SankeyColumn[]`},description:"Column definitions. Accepts either:\n- Simple: `string[][]` — arrays of node IDs per column\n- Rich: `SankeyColumnDef[]` — objects with `ids`, optional `label`\n- Mixed: any combination\n\nIf omitted, columns are auto-detected via topological sort."},height:{required:!1,tsType:{name:`number`},description:`Chart height in px (default: 320)`,defaultValue:{value:`320`,computed:!1}},nodeWidth:{required:!1,tsType:{name:`number`},description:`Node bar width in px (default: 20)`,defaultValue:{value:`20`,computed:!1}},nodeGap:{required:!1,tsType:{name:`number`},description:`Vertical gap between sibling nodes (default: 14)`,defaultValue:{value:`14`,computed:!1}},nodeColor:{required:!1,tsType:{name:`string`},description:`Override all node bar colors with a single CSS color.
Both SankeyNode and SankeyLabel read this from context
so labels adapt their text color for contrast.`},minColumnWidth:{required:!1,tsType:{name:`number`},description:`Minimum width per column in px (default: 160).
When total min width exceeds the container, horizontal scrolling activates.`,defaultValue:{value:`160`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible name for the chart, announced by screen readers. Applied to the
svg (\`role="img"\`) and, when the chart scrolls, to the focusable scroll
region. Pass a localized string to override the English default.

@default 'Sankey chart'`,defaultValue:{value:`'Sankey chart'`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Chart contents`}}}})))()}function E(e,t){return`oklch(${e[0]} ${e[1]} ${e[2]} / ${t})`}function te(e){return typeof e==`object`&&`gradient`in e?{type:`gradient`,bias:e.gradient}:e===`gradient`?{type:`gradient`,bias:.5}:e===`source`?{type:`source`}:e===`target`?{type:`target`}:{type:`flat`,value:e}}function D({color:e=`gradient`,opacity:t=.7,tension:n=.5}){let{links:r}=d(),i=te(e);return(0,O.jsxs)(`g`,{children:[i.type===`gradient`&&(0,O.jsx)(`defs`,{children:r.map((e,n)=>(0,O.jsx)(ne,{index:n,link:e,opacity:t,bias:i.bias},n))}),r.map((e,r)=>{let a=e.source.x+e.source.width,o=e.target.x,s=e.sourceY,c=e.targetY,l=e.height,u=(o-a)*n,d=[`M${a},${s}`,`C${a+u},${s} ${o-u},${c} ${o},${c}`,`L${o},${c+l}`,`C${o-u},${c+l} ${a+u},${s+l} ${a},${s+l}`,`Z`].join(` `),f,p;return i.type===`flat`?(f=i.value,p=t):f=i.type===`source`?E(e.source.color,t):i.type===`target`?E(e.target.color,t):`url(#astryx-sankey-grad-${r})`,(0,O.jsx)(`path`,{d,fill:f,opacity:p},r)})]})}function ne({index:e,link:t,opacity:n,bias:r}){let i=t.source.x+t.source.width,a=t.target.x,o=Math.max(0,r-.15),s=Math.min(1,r+.15);return(0,O.jsxs)(`linearGradient`,{id:`astryx-sankey-grad-${e}`,x1:i,x2:a,y1:0,y2:0,gradientUnits:`userSpaceOnUse`,children:[(0,O.jsx)(`stop`,{offset:`0%`,stopColor:E(t.source.color,n)}),(0,O.jsx)(`stop`,{offset:`${o*100}%`,stopColor:E(t.source.color,n*.9)}),(0,O.jsx)(`stop`,{offset:`${s*100}%`,stopColor:E(t.target.color,n*.9)}),(0,O.jsx)(`stop`,{offset:`100%`,stopColor:E(t.target.color,n)})]})}var O;function re(){return(re=e((()=>{h(),O=i(),D.displayName=`SankeyLink`,D.__docgenInfo={description:`Renders all link ribbons in the Sankey chart.

Place before SankeyNode so nodes render on top.`,methods:[],displayName:`SankeyLink`,props:{color:{required:!1,tsType:{name:`union`,raw:`| 'gradient'
| 'source'
| 'target'
| {gradient: number}
| (string & {})`,elements:[{name:`literal`,value:`'gradient'`},{name:`literal`,value:`'source'`},{name:`literal`,value:`'target'`},{name:`signature`,type:`object`,raw:`{gradient: number}`,signature:{properties:[{key:`gradient`,value:{name:`number`,required:!0}}]}},{name:`unknown`}]},description:`Link coloring mode (default: 'gradient')`,defaultValue:{value:`'gradient'`,computed:!1}},opacity:{required:!1,tsType:{name:`number`},description:`Opacity of the link fills (default: 0.7)`,defaultValue:{value:`0.7`,computed:!1}},tension:{required:!1,tsType:{name:`number`},description:`Bezier tension — 0 is straight, 1 is maximum curve (default: 0.5)`,defaultValue:{value:`0.5`,computed:!1}}}}})))()}function k(e,t){return`oklch(${e[0]} ${e[1]} ${e[2]} / ${t})`}function A({glow:e=!0}){let{nodes:t,nodeColor:n}=d();return(0,j.jsx)(`g`,{children:t.map(t=>{let r=n||k(t.color,.9),i=n||k(t.color,.12);return(0,j.jsxs)(`g`,{children:[e&&(0,j.jsx)(`rect`,{x:t.x-3,y:t.y-1,width:t.width+6,height:t.height+2,rx:4,fill:i,opacity:n?.12:1}),(0,j.jsx)(`rect`,{x:t.x,y:t.y,width:t.width,height:t.height,rx:1.5,fill:r})]},t.id)})})}var j;function ie(){return(ie=e((()=>{h(),j=i(),A.displayName=`SankeyNode`,A.__docgenInfo={description:`Renders all node indicators in the Sankey chart.

Color comes from the chart's \`nodeColor\` prop (global override)
or each node's individual color from data.`,methods:[],displayName:`SankeyNode`,props:{glow:{required:!1,tsType:{name:`boolean`},description:`Whether to show the glow effect behind nodes (default: true)`,defaultValue:{value:`true`,computed:!1}}}}})))()}function ae(e){return e>=1e4?Math.round(e/1e3)+`k`:e>=1e3?(e/1e3).toFixed(1)+`k`:e.toLocaleString()}function oe(e,t){if(t){let e=t.toLowerCase().trim();return e===`black`||/^#[0-3]/.test(e)||/^#.[0-3]/.test(e)||/^rgb\(\s*[0-7]\d?\s*,/.test(e)?`var(--color-on-dark, #fff)`:`var(--color-on-light, #000)`}return e[0]<.6?`var(--color-on-dark, #fff)`:`var(--color-on-light, #000)`}function M({showPercent:e=!0,formatValue:t=ae}){let{nodes:n,columns:r,maxValue:i,height:a,nodeWidth:o,nodeColor:s}=d(),c=r.length-1;return(0,N.jsx)(`g`,{children:n.map(n=>{let r=n.value/i*100,l=r>=10?Math.round(r)+`%`:r.toFixed(1)+`%`,u=t(n.value),d=`${n.label} = ${u}`,f=d.length*6.5;return n.height>=f+8?(0,N.jsx)(se,{node:n,nodeWidth:o,nodeColor:s,text:d,pctStr:l,showPercent:e,height:a},n.id):(0,N.jsx)(ce,{node:n,nodeWidth:o,text:d,pctStr:l,showPercent:e,height:a,isLastColumn:n.column===c},n.id)})})}function se({node:e,nodeWidth:t,nodeColor:n,text:r,pctStr:i,showPercent:a,height:o}){let s=e.x+t/2,c=e.y+e.height/2;return(0,N.jsxs)(`g`,{children:[(0,N.jsx)(`g`,{transform:`translate(${s}, ${c}) rotate(-90)`,children:(0,N.jsx)(`text`,{x:0,y:0,textAnchor:`middle`,dominantBaseline:`central`,style:{font:`600 10px/1 system-ui`,fill:oe(e.color,n),letterSpacing:`-0.01em`},children:r})}),a&&e.column>0&&(0,N.jsx)(`text`,{x:s,y:Math.min(o-2,e.y+e.height+12),textAnchor:`middle`,style:{font:`500 9px/1 system-ui`,fill:`var(--color-text-tertiary, #8e8ea0)`},children:i})]})}function ce({node:e,nodeWidth:t,text:n,pctStr:r,showPercent:i,height:a,isLastColumn:o}){let s=e.x+t/2,c=e.y+e.height/2,l=n.length*6+10,u=o?e.x-6:e.x+t+6,d=o?u-l+4:u-4,f=o?`end`:`start`;return(0,N.jsxs)(`g`,{children:[(0,N.jsx)(`rect`,{x:d,y:c-16/2,width:l,height:16,rx:3,fill:`var(--color-background-surface, #fff)`,fillOpacity:.9}),(0,N.jsx)(`text`,{x:u,y:c,textAnchor:f,dominantBaseline:`central`,style:{font:`600 10px/1 system-ui`,fill:`var(--color-text-primary, #1c1c1e)`,letterSpacing:`-0.01em`},children:n}),i&&e.column>0&&(0,N.jsx)(`text`,{x:s,y:Math.min(a-2,e.y+e.height+12),textAnchor:`middle`,style:{font:`500 9px/1 system-ui`,fill:`var(--color-text-tertiary, #8e8ea0)`},children:r})]})}var N;function le(){return(le=e((()=>{h(),N=i(),M.displayName=`SankeyLabel`,M.__docgenInfo={description:``,methods:[],displayName:`SankeyLabel`,props:{showPercent:{required:!1,tsType:{name:`boolean`},description:`Show percentage below the node (default: true)`,defaultValue:{value:`true`,computed:!1}},formatValue:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: number) => string`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`string`}}},description:`Format function for the value (default: compact notation)`,defaultValue:{value:`function defaultFormat(value: number): string {
  if (value >= 10000) {
    return Math.round(value / 1000) + 'k';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value.toLocaleString();
}`,computed:!1}}}}})))()}function P({dashArray:e=`4 4`,color:t,opacity:n=.3,showHeaders:r=!0}){let{columns:i,height:a,nodeWidth:o}=d();return(0,F.jsx)(`g`,{children:i.map((i,s)=>(0,F.jsxs)(`g`,{children:[(0,F.jsx)(`line`,{x1:i.x+o/2,x2:i.x+o/2,y1:0,y2:a,stroke:t||`var(--color-border, #d0d0d8)`,strokeOpacity:n,strokeDasharray:e,strokeWidth:1}),r&&i.label&&(0,F.jsx)(`text`,{x:i.x+o/2,y:a-2,textAnchor:`middle`,style:{font:`500 10px/1 system-ui`,fill:`var(--color-text-secondary, #6e6e80)`,textTransform:`uppercase`,letterSpacing:`0.04em`},children:i.label})]},s))})}var F;function ue(){return(ue=e((()=>{h(),F=i(),P.displayName=`SankeyGrid`,P.__docgenInfo={description:`Vertical grid lines at each column position, with optional column headers.

Place before SankeyLink so grid renders behind ribbons.`,methods:[],displayName:`SankeyGrid`,props:{dashArray:{required:!1,tsType:{name:`string`},description:`Dash pattern (default: "4 4")`,defaultValue:{value:`'4 4'`,computed:!1}},color:{required:!1,tsType:{name:`string`},description:`Stroke color (default: theme border)`},opacity:{required:!1,tsType:{name:`number`},description:`Opacity (default: 0.3)`,defaultValue:{value:`0.3`,computed:!1}},showHeaders:{required:!1,tsType:{name:`boolean`},description:`Show column header labels if defined (default: true)`,defaultValue:{value:`true`,computed:!1}}}}})))()}function de(e){return e>=1e9?`$`+(e/1e9).toFixed(1)+`T`:e>=1e6?`$`+Math.round(e/1e6)+`B`:e>=1e3?`$`+Math.round(e/1e3)+`M`:`$`+e.toLocaleString()}var I,fe,L,R,z,B,V,pe,me,H,U,W,he,ge,_e,G,ve,ye,be,K,xe,Se,q,J,Y,X,Z,Q,$,Ce;function we(){return(we=e((()=>{T(),re(),ie(),le(),ue(),l(),n(),s(),I=i(),fe={title:`Lab/SankeyChart`,tags:[`autodocs`]},L=[{id:`visitors`,label:`Visitors`,value:52e3,color:[.65,.2,270]},{id:`signups`,label:`Sign Ups`,value:28e3,color:[.6,.17,235]},{id:`bounced`,label:`Bounced`,value:24e3,color:[.55,.14,350]},{id:`activated`,label:`Activated`,value:19500,color:[.62,.16,190]},{id:`dormant`,label:`Dormant`,value:8500,color:[.55,.13,50]},{id:`subscribed`,label:`Subscribed`,value:12400,color:[.64,.18,155]},{id:`churned`,label:`Churned`,value:7100,color:[.54,.15,20]}],R=[{source:`visitors`,target:`signups`,value:28e3},{source:`visitors`,target:`bounced`,value:24e3},{source:`signups`,target:`activated`,value:19500},{source:`signups`,target:`dormant`,value:8500},{source:`activated`,target:`subscribed`,value:12400},{source:`activated`,target:`churned`,value:7100}],z=[[`visitors`],[`signups`,`bounced`],[`activated`,`dormant`],[`subscribed`,`churned`]],B={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Conversion Funnel`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`User journey · Last 30 days`}),(0,I.jsxs)(S,{nodes:L,links:R,columns:z,height:360,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},V=[{id:`organic`,label:`Organic`,value:18e3,color:[.62,.17,155]},{id:`paid`,label:`Paid Ads`,value:22e3,color:[.6,.18,240]},{id:`referral`,label:`Referral`,value:12e3,color:[.58,.15,40]},{id:`direct`,label:`Direct`,value:8e3,color:[.55,.14,300]},{id:`web`,label:`Web`,value:32e3,color:[.61,.16,210]},{id:`mobile`,label:`Mobile`,value:2e4,color:[.59,.16,170]},{id:`other`,label:`Other`,value:8e3,color:[.5,.11,320]},{id:`sub`,label:`Subscription`,value:38e3,color:[.64,.19,260]},{id:`onetime`,label:`One-time`,value:14e3,color:[.58,.15,50]},{id:`enterprise`,label:`Enterprise`,value:8e3,color:[.56,.13,190]}],pe=[{source:`organic`,target:`web`,value:12e3},{source:`organic`,target:`mobile`,value:6e3},{source:`paid`,target:`web`,value:14e3},{source:`paid`,target:`mobile`,value:8e3},{source:`referral`,target:`web`,value:4e3},{source:`referral`,target:`mobile`,value:6e3},{source:`referral`,target:`other`,value:2e3},{source:`direct`,target:`web`,value:2e3},{source:`direct`,target:`other`,value:6e3},{source:`web`,target:`sub`,value:22e3},{source:`web`,target:`onetime`,value:6e3},{source:`web`,target:`enterprise`,value:4e3},{source:`mobile`,target:`sub`,value:14e3},{source:`mobile`,target:`onetime`,value:4e3},{source:`mobile`,target:`enterprise`,value:2e3},{source:`other`,target:`sub`,value:2e3},{source:`other`,target:`onetime`,value:4e3},{source:`other`,target:`enterprise`,value:2e3}],me=[[`organic`,`paid`,`referral`,`direct`],[`web`,`mobile`,`other`],[`sub`,`onetime`,`enterprise`]],H={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Revenue Sources`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Channel attribution · March 2026`}),(0,I.jsxs)(S,{nodes:V,links:pe,columns:me,height:420,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{opacity:.65,tension:.55}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},U={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Auto Column Detection`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`No explicit columns — topologically sorted`}),(0,I.jsxs)(S,{nodes:[{id:`a`,label:`Source A`,value:100},{id:`b`,label:`Source B`,value:80},{id:`mid`,label:`Middle`,value:180},{id:`out1`,label:`Output 1`,value:120},{id:`out2`,label:`Output 2`,value:60}],links:[{source:`a`,target:`mid`,value:100},{source:`b`,target:`mid`,value:80},{source:`mid`,target:`out1`,value:120},{source:`mid`,target:`out2`,value:60}],height:280,children:[(0,I.jsx)(D,{tension:.6}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{showPercent:!1})]})]})},W={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Deep Funnel (6 stages)`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Scrolls horizontally when columns exceed container width`}),(0,I.jsx)(`div`,{style:{maxWidth:600,border:`1px solid var(--color-border, #ddd)`,borderRadius:12,overflow:`hidden`},children:(0,I.jsxs)(S,{nodes:[{id:`awareness`,label:`Awareness`,value:1e5},{id:`interest`,label:`Interest`,value:68e3},{id:`dropped1`,label:`Dropped`,value:32e3,color:[.5,.12,350]},{id:`consideration`,label:`Consideration`,value:45e3},{id:`dropped2`,label:`Distracted`,value:23e3,color:[.5,.12,350]},{id:`intent`,label:`Intent`,value:32e3},{id:`dropped3`,label:`Abandoned`,value:13e3,color:[.5,.12,350]},{id:`evaluation`,label:`Evaluation`,value:24e3},{id:`dropped4`,label:`Lost`,value:8e3,color:[.5,.12,350]},{id:`purchase`,label:`Purchase`,value:18e3,color:[.64,.18,155]},{id:`dropped5`,label:`Rejected`,value:6e3,color:[.5,.12,350]}],links:[{source:`awareness`,target:`interest`,value:68e3},{source:`awareness`,target:`dropped1`,value:32e3},{source:`interest`,target:`consideration`,value:45e3},{source:`interest`,target:`dropped2`,value:23e3},{source:`consideration`,target:`intent`,value:32e3},{source:`consideration`,target:`dropped3`,value:13e3},{source:`intent`,target:`evaluation`,value:24e3},{source:`intent`,target:`dropped4`,value:8e3},{source:`evaluation`,target:`purchase`,value:18e3},{source:`evaluation`,target:`dropped5`,value:6e3}],columns:[[`awareness`],[`interest`,`dropped1`],[`consideration`,`dropped2`],[`intent`,`dropped3`],[`evaluation`,`dropped4`],[`purchase`,`dropped5`]],height:360,minColumnWidth:160,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})})]})},he=[{id:`visitors`,label:`Visitors`,value:84200,color:[.55,.19,255]},{id:`signups`,label:`Signed Up`,value:42100,color:[.58,.18,255]},{id:`bounce`,label:`Bounced`,value:42100,color:[.5,.02,240]},{id:`onboarded`,label:`Onboarded`,value:28700,color:[.61,.17,252]},{id:`stalled`,label:`Stalled`,value:13400,color:[.5,.02,240]},{id:`active`,label:`Active Users`,value:21500,color:[.64,.16,250]},{id:`inactive`,label:`Inactive`,value:7200,color:[.5,.02,240]},{id:`paying`,label:`Paying`,value:15200,color:[.67,.15,248]},{id:`free`,label:`Free Tier`,value:6300,color:[.5,.02,240]}],ge=[{source:`visitors`,target:`signups`,value:42100},{source:`visitors`,target:`bounce`,value:42100},{source:`signups`,target:`onboarded`,value:28700},{source:`signups`,target:`stalled`,value:13400},{source:`onboarded`,target:`active`,value:21500},{source:`onboarded`,target:`inactive`,value:7200},{source:`active`,target:`paying`,value:15200},{source:`active`,target:`free`,value:6300}],_e=[[`visitors`],[`signups`,`bounce`],[`onboarded`,`stalled`],[`active`,`inactive`],[`paying`,`free`]],G={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Acquisition Funnel`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Blue = progression · Gray = drop-off`}),(0,I.jsxs)(S,{nodes:he,links:ge,columns:_e,height:380,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{opacity:.6}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},ve=[{id:`single`,label:`Single`,value:48,color:[.62,.16,30]},{id:`married`,label:`Married`,value:35,color:[.58,.14,180]},{id:`divorced`,label:`Divorced`,value:17,color:[.55,.12,300]},{id:`male`,label:`Male`,value:55,color:[.57,.15,240]},{id:`female`,label:`Female`,value:45,color:[.6,.16,340]},{id:`happy`,label:`Happy`,value:62,color:[.64,.18,150]},{id:`unhappy`,label:`Unhappy`,value:38,color:[.52,.14,25]}],ye=[{source:`single`,target:`male`,value:26},{source:`single`,target:`female`,value:22},{source:`married`,target:`male`,value:20},{source:`married`,target:`female`,value:15},{source:`divorced`,target:`male`,value:9},{source:`divorced`,target:`female`,value:8},{source:`male`,target:`happy`,value:34},{source:`male`,target:`unhappy`,value:21},{source:`female`,target:`happy`,value:28},{source:`female`,target:`unhappy`,value:17}],be=[{ids:[`single`,`married`,`divorced`],label:`Relationship`},{ids:[`male`,`female`],label:`Gender`},{ids:[`happy`,`unhappy`],label:`Outcome`}],K={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Survey Flow`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Wider node bars with rotated text labels`}),(0,I.jsxs)(S,{nodes:ve,links:ye,columns:be,height:380,nodeGap:8,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{opacity:.5,tension:.5}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},xe=[{id:`income_tax`,label:`Income Tax`,value:2118406e3,color:[.55,.19,255]},{id:`payroll_tax`,label:`Payroll Tax`,value:1336808e3,color:[.58,.17,240]},{id:`corp_tax`,label:`Corp Tax`,value:51122e4,color:[.6,.16,220]},{id:`excise_tax`,label:`Excise Tax`,value:119883e3,color:[.56,.14,200]},{id:`misc_revenue`,label:`Misc Revenue`,value:96615e3,color:[.54,.12,280]},{id:`customs`,label:`Customs`,value:47878e3,color:[.52,.11,180]},{id:`proposals`,label:`Proposals`,value:45e6,color:[.5,.1,300]},{id:`estate_tax`,label:`Estate Tax`,value:38543e3,color:[.48,.09,160]},{id:`general_fund`,label:`General Fund`,value:2812308e3,color:[.62,.17,150]},{id:`social_security`,label:`Social Security`,value:968357e3,color:[.6,.16,170]},{id:`hhs`,label:`HHS`,value:309881e3,color:[.58,.15,130]},{id:`treasury`,label:`Treasury`,value:75173e3,color:[.56,.13,190]},{id:`labor`,label:`Labor`,value:57839e3,color:[.54,.12,40]},{id:`transport`,label:`Transport`,value:57056e3,color:[.52,.11,60]},{id:`agriculture`,label:`Agriculture`,value:11566e3,color:[.5,.1,100]},{id:`fcc`,label:`FCC`,value:10049e3,color:[.48,.09,260]},{id:`rail_retire`,label:`Rail Retire`,value:7098e3,color:[.5,.08,320]},{id:`opm`,label:`OPM`,value:5026e3,color:[.48,.08,340]}],Se=[{source:`income_tax`,target:`general_fund`,value:2118406e3},{source:`payroll_tax`,target:`social_security`,value:968357e3},{source:`corp_tax`,target:`general_fund`,value:51122e4},{source:`payroll_tax`,target:`hhs`,value:298488e3},{source:`misc_revenue`,target:`treasury`,value:75173e3},{source:`excise_tax`,target:`general_fund`,value:62827e3},{source:`payroll_tax`,target:`labor`,value:57839e3},{source:`excise_tax`,target:`transport`,value:57056e3},{source:`proposals`,target:`general_fund`,value:45e6},{source:`estate_tax`,target:`general_fund`,value:38543e3},{source:`customs`,target:`general_fund`,value:36312e3},{source:`customs`,target:`agriculture`,value:11566e3},{source:`misc_revenue`,target:`hhs`,value:11393e3},{source:`misc_revenue`,target:`fcc`,value:10049e3},{source:`payroll_tax`,target:`rail_retire`,value:7098e3},{source:`payroll_tax`,target:`opm`,value:5026e3}],q=[{ids:[`income_tax`,`payroll_tax`,`corp_tax`,`excise_tax`,`misc_revenue`,`customs`,`proposals`,`estate_tax`],label:`Revenue Source`},{ids:[`general_fund`,`social_security`,`hhs`,`treasury`,`labor`,`transport`,`agriculture`,`fcc`,`rail_retire`,`opm`],label:`Receiving Agency`}],J={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`US Federal Budget FY2020`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Revenue sources → receiving agencies (vega-datasets/budget.json)`}),(0,I.jsxs)(S,{nodes:xe,links:Se,columns:q,height:480,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{opacity:.6,tension:.5}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{formatValue:de})]})]})},Y={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Petroleum Flow`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Monochrome — flat color, no gradients`}),(0,I.jsxs)(S,{nodes:L,links:R,columns:z,height:340,nodeColor:`#1a1a1e`,children:[(0,I.jsx)(D,{color:`#1a1a1e`,opacity:.75}),(0,I.jsx)(A,{glow:!1}),(0,I.jsx)(M,{})]})]})},X={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Source-Colored Links`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Each ribbon matches its source node`}),(0,I.jsxs)(S,{nodes:L,links:R,columns:z,height:340,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{color:`source`}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},Z={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Target-Colored Links`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`Each ribbon matches its destination node`}),(0,I.jsxs)(S,{nodes:L,links:R,columns:z,height:340,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{color:`target`}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},Q={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Source-Leaned Gradient`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`bias=0.2 — holds source color, transitions near target`}),(0,I.jsxs)(S,{nodes:L,links:R,columns:z,height:340,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{color:{gradient:.2}}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},$={render:()=>(0,I.jsxs)(u,{direction:`vertical`,gap:4,children:[(0,I.jsx)(c,{level:3,children:`Target-Leaned Gradient`}),(0,I.jsx)(r,{type:`body`,color:`secondary`,children:`bias=0.8 — transitions early, holds target color`}),(0,I.jsxs)(S,{nodes:L,links:R,columns:z,height:340,children:[(0,I.jsx)(P,{}),(0,I.jsx)(D,{color:{gradient:.8}}),(0,I.jsx)(A,{}),(0,I.jsx)(M,{})]})]})},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Conversion Funnel</Heading>
      <Text type="body" color="secondary">
        User journey · Last 30 days
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={360}>
        <SankeyGrid />
        <SankeyLink />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...B.parameters?.docs?.source},description:{story:`Classic diverging funnel with grid lines`,...B.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Revenue Sources</Heading>
      <Text type="body" color="secondary">
        Channel attribution · March 2026
      </Text>
      <SankeyChart nodes={revenueNodes} links={revenueLinks} columns={revenueColumns} height={420}>
        <SankeyGrid />
        <SankeyLink opacity={0.65} tension={0.55} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...H.parameters?.docs?.source},description:{story:`Converging Sankey — multiple sources flowing to fewer destinations`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => {
    const nodes: SankeyNodeDatum[] = [{
      id: 'a',
      label: 'Source A',
      value: 100
    }, {
      id: 'b',
      label: 'Source B',
      value: 80
    }, {
      id: 'mid',
      label: 'Middle',
      value: 180
    }, {
      id: 'out1',
      label: 'Output 1',
      value: 120
    }, {
      id: 'out2',
      label: 'Output 2',
      value: 60
    }];
    const links: SankeyLinkDatum[] = [{
      source: 'a',
      target: 'mid',
      value: 100
    }, {
      source: 'b',
      target: 'mid',
      value: 80
    }, {
      source: 'mid',
      target: 'out1',
      value: 120
    }, {
      source: 'mid',
      target: 'out2',
      value: 60
    }];
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Auto Column Detection</Heading>
        <Text type="body" color="secondary">
          No explicit columns — topologically sorted
        </Text>
        <SankeyChart nodes={nodes} links={links} height={280}>
          <SankeyLink tension={0.6} />
          <SankeyNode />
          <SankeyLabel showPercent={false} />
        </SankeyChart>
      </Stack>;
  }
}`,...U.parameters?.docs?.source},description:{story:`Minimal — auto-detected columns, no grid`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => {
    const nodes: SankeyNodeDatum[] = [{
      id: 'awareness',
      label: 'Awareness',
      value: 100000
    }, {
      id: 'interest',
      label: 'Interest',
      value: 68000
    }, {
      id: 'dropped1',
      label: 'Dropped',
      value: 32000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'consideration',
      label: 'Consideration',
      value: 45000
    }, {
      id: 'dropped2',
      label: 'Distracted',
      value: 23000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'intent',
      label: 'Intent',
      value: 32000
    }, {
      id: 'dropped3',
      label: 'Abandoned',
      value: 13000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'evaluation',
      label: 'Evaluation',
      value: 24000
    }, {
      id: 'dropped4',
      label: 'Lost',
      value: 8000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'purchase',
      label: 'Purchase',
      value: 18000,
      color: [0.64, 0.18, 155]
    }, {
      id: 'dropped5',
      label: 'Rejected',
      value: 6000,
      color: [0.5, 0.12, 350]
    }];
    const links: SankeyLinkDatum[] = [{
      source: 'awareness',
      target: 'interest',
      value: 68000
    }, {
      source: 'awareness',
      target: 'dropped1',
      value: 32000
    }, {
      source: 'interest',
      target: 'consideration',
      value: 45000
    }, {
      source: 'interest',
      target: 'dropped2',
      value: 23000
    }, {
      source: 'consideration',
      target: 'intent',
      value: 32000
    }, {
      source: 'consideration',
      target: 'dropped3',
      value: 13000
    }, {
      source: 'intent',
      target: 'evaluation',
      value: 24000
    }, {
      source: 'intent',
      target: 'dropped4',
      value: 8000
    }, {
      source: 'evaluation',
      target: 'purchase',
      value: 18000
    }, {
      source: 'evaluation',
      target: 'dropped5',
      value: 6000
    }];
    const columns = [['awareness'], ['interest', 'dropped1'], ['consideration', 'dropped2'], ['intent', 'dropped3'], ['evaluation', 'dropped4'], ['purchase', 'dropped5']];
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Deep Funnel (6 stages)</Heading>
        <Text type="body" color="secondary">
          Scrolls horizontally when columns exceed container width
        </Text>
        <div style={{
        maxWidth: 600,
        border: '1px solid var(--color-border, #ddd)',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
          <SankeyChart nodes={nodes} links={links} columns={columns} height={360} minColumnWidth={160}>
            <SankeyGrid />
            <SankeyLink />
            <SankeyNode />
            <SankeyLabel />
          </SankeyChart>
        </div>
      </Stack>;
  }
}`,...W.parameters?.docs?.source},description:{story:`Many columns — demonstrates horizontal scroll with minColumnWidth`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Acquisition Funnel</Heading>
      <Text type="body" color="secondary">
        Blue = progression · Gray = drop-off
      </Text>
      <SankeyChart nodes={bizNodes} links={bizLinks} columns={bizColumns} height={380}>
        <SankeyGrid />
        <SankeyLink opacity={0.6} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...G.parameters?.docs?.source},description:{story:`Business funnel with blue main flow and gray exit paths.
Uses background labels for readability over the ribbons.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Survey Flow</Heading>
      <Text type="body" color="secondary">
        Wider node bars with rotated text labels
      </Text>
      <SankeyChart nodes={demoNodes} links={demoLinks} columns={demoColumns} height={380} nodeGap={8}>
        <SankeyGrid />
        <SankeyLink opacity={0.5} tension={0.5} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...K.parameters?.docs?.source},description:{story:`Wide bars with rotated labels and column headers — art deco style`,...K.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>US Federal Budget FY2020</Heading>
      <Text type="body" color="secondary">
        Revenue sources → receiving agencies (vega-datasets/budget.json)
      </Text>
      <SankeyChart nodes={budgetNodes} links={budgetLinks} columns={budgetColumns} height={480}>
        <SankeyGrid />
        <SankeyLink opacity={0.6} tension={0.5} />
        <SankeyNode />
        <SankeyLabel formatValue={formatBudget} />
      </SankeyChart>
    </Stack>
}`,...J.parameters?.docs?.source},description:{story:`Real data: US Federal Budget FY2020 from vega-datasets.
Tax revenue sources flowing to receiving government agencies.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Petroleum Flow</Heading>
      <Text type="body" color="secondary">
        Monochrome — flat color, no gradients
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340} nodeColor="#1a1a1e">
        <SankeyLink color="#1a1a1e" opacity={0.75} />
        <SankeyNode glow={false} />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...Y.parameters?.docs?.source},description:{story:`Monochrome — flat black ribbons on white, editorial style`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Source-Colored Links</Heading>
      <Text type="body" color="secondary">
        Each ribbon matches its source node
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color="source" />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...X.parameters?.docs?.source},description:{story:`Source-colored — each link takes its source node's color`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Target-Colored Links</Heading>
      <Text type="body" color="secondary">
        Each ribbon matches its destination node
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color="target" />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...Z.parameters?.docs?.source},description:{story:`Target-colored — each link takes its target node's color`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Source-Leaned Gradient</Heading>
      <Text type="body" color="secondary">
        bias=0.2 — holds source color, transitions near target
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color={{
        gradient: 0.2
      }} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...Q.parameters?.docs?.source},description:{story:`Leaned gradient — source-biased, transitions late`,...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Target-Leaned Gradient</Heading>
      <Text type="body" color="secondary">
        bias=0.8 — transitions early, holds target color
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color={{
        gradient: 0.8
      }} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...$.parameters?.docs?.source},description:{story:`Leaned gradient — target-biased, transitions early`,...$.parameters?.docs?.description}}},Ce=[`ConversionFunnel`,`RevenueFlow`,`AutoColumns`,`ManyColumns`,`BusinessFunnel`,`WideBarStyle`,`USFederalBudget`,`Monochrome`,`SourceColored`,`TargetColored`,`LeanedSourceGradient`,`LeanedTargetGradient`]})))()}we();export{U as AutoColumns,G as BusinessFunnel,B as ConversionFunnel,Q as LeanedSourceGradient,$ as LeanedTargetGradient,W as ManyColumns,Y as Monochrome,H as RevenueFlow,X as SourceColored,Z as TargetColored,J as USFederalBudget,K as WideBarStyle,Ce as __namedExportsOrder,fe as default};