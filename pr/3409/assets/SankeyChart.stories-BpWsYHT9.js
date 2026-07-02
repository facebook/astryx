import{ah as _,a1 as e,T as S}from"./iframe-Z8EfSKmM.js";import{S as j}from"./Stack-zPlvthC6.js";import{H as C}from"./Heading-D0-Rn-po.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";const se=_.createContext(null),ie=se.Provider;function ee(){const r=_.useContext(se);if(!r)throw new Error("Sankey components must be used inside <SankeyChart>");return r}const ne=[[.65,.2,270],[.6,.17,235],[.62,.16,190],[.64,.18,155],[.58,.15,40],[.55,.14,350],[.54,.15,20],[.56,.13,300]];function ce(r){return r.map(t=>Array.isArray(t)?{ids:t}:t)}function de(r,t){const n=new Map,a=new Map;r.forEach(s=>{n.set(s.id,0),a.set(s.id,[])}),t.forEach(s=>{n.set(s.target,(n.get(s.target)||0)+1),a.get(s.source)?.push(s.target)});const i=new Map,l=[];for(r.forEach(s=>{n.get(s.id)===0&&(l.push(s.id),i.set(s.id,0))});l.length;){const s=l.shift();if(s==null)break;const d=i.get(s)??0;for(const u of a.get(s)||[]){const m=d+1;i.set(u,Math.max(i.get(u)||0,m)),n.set(u,(n.get(u)||0)-1),n.get(u)===0&&l.push(u)}}const c=Math.max(...Array.from(i.values()),0),o=Array.from({length:c+1},()=>({ids:[]}));return r.forEach(s=>{o[i.get(s.id)||0].ids.push(s.id)}),o}function ue(r,t,n){const{width:a,height:i,nodeWidth:l=20,nodeGap:c=14,labelMargin:o=28}=n,s=n.columns?ce(n.columns):de(r,t),d=s.length,m=s.some(g=>g.label)?20:0,h=new Map;r.forEach(g=>h.set(g.id,g));const x=i-o-16-m;let p=0;s.forEach(g=>{const L=g.ids.reduce((T,F)=>T+(h.get(F)?.value||0),0);L>p&&(p=L)});const M=Math.max(...s.map(g=>g.ids.length)),k=(x-(M-1)*c)/p,J=d>1?(a-l)/(d-1):0,R=[],N=new Map;let K=0;s.forEach((g,L)=>{const T=L*J;R.push({x:T,label:g.label,ids:g.ids});const F=g.ids.reduce((E,$)=>E+(h.get($)?.value||0)*k,0),te=(g.ids.length-1)*c;let Q=o+(x-F-te)/2;g.ids.forEach(E=>{const $=h.get(E);if(!$)return;const ae=$.value*k,le=$.color||ne[K%ne.length];K++,N.set(E,{id:E,label:$.label,value:$.value,color:le,x:T,y:Q,width:l,height:ae,column:L,_sourceOffset:0,_targetOffset:0}),Q+=ae+c})});const re=t.flatMap(g=>{const L=N.get(g.source),T=N.get(g.target);if(!L||!T)return[];const F=g.value*k,te=L.y+L._sourceOffset,Q=T.y+T._targetOffset;return L._sourceOffset+=F,T._targetOffset+=F,[{source:L,target:T,value:g.value,height:F,sourceY:te,targetY:Q}]});return{nodes:Array.from(N.values()),links:re,columns:R,valueScale:k,maxValue:p}}function pe(r,t,n){if(r)return r.length;const a=new Map,i=new Map;t.forEach(o=>{a.set(o.id,0),i.set(o.id,[])}),n.forEach(o=>{a.set(o.target,(a.get(o.target)||0)+1),i.get(o.source)?.push(o.target)});const l=new Map,c=[];for(t.forEach(o=>{a.get(o.id)===0&&(c.push(o.id),l.set(o.id,0))});c.length;){const o=c.shift();if(o==null)break;const s=l.get(o)??0;for(const d of i.get(o)||[])l.set(d,Math.max(l.get(d)||0,s+1)),a.set(d,(a.get(d)||0)-1),a.get(d)===0&&c.push(d)}return Math.max(...Array.from(l.values()),0)+1}function y({nodes:r,links:t,columns:n,height:a=320,nodeWidth:i=20,nodeGap:l=14,nodeColor:c,minColumnWidth:o=160,children:s}){const d=_.useRef(null),[u,m]=_.useState(0);_.useLayoutEffect(()=>{const R=d.current;if(!R)return;const N=new ResizeObserver(K=>{const re=K[0]?.contentRect.width??0;m(re)});return N.observe(R),()=>N.disconnect()},[]);const x=_.useMemo(()=>pe(n,r,t),[n,r,t])*o,p=Math.max(u,x),M=u>0&&p>u,k=_.useMemo(()=>u===0?null:ue(r,t,{width:p,height:a,nodeWidth:i,nodeGap:l,columns:n}),[r,t,p,a,i,l,n,u]),J=_.useMemo(()=>k?{nodes:k.nodes,links:k.links,columns:k.columns,width:p,height:a,valueScale:k.valueScale,maxValue:k.maxValue,nodeWidth:i,nodeColor:c}:null,[k,p,a,i,c]);return e.jsx("div",{ref:d,style:{width:"100%"},children:J&&e.jsx("div",{style:M?{overflowX:"auto",overflowY:"hidden"}:void 0,children:e.jsx("svg",{width:p,height:a,style:{overflow:"visible",display:"block"},children:e.jsx(ie,{value:J,children:s})})})})}y.displayName="SankeyChart";y.__docgenInfo={description:`Root component for Sankey/flow diagrams.

Computes layout from nodes + links, exposes positions via context.
Width is responsive but enforces minColumnWidth — scrolls when needed.

@example
\`\`\`tsx
<SankeyChart
  nodes={nodes}
  links={links}
  columns={[
    {ids: ['a', 'b'], label: 'Source'},
    {ids: ['c', 'd'], label: 'Target'},
  ]}
>
  <SankeyGrid />
  <SankeyLink />
  <SankeyNode />
  <SankeyLabel />
</SankeyChart>
\`\`\``,methods:[],displayName:"SankeyChart",props:{nodes:{required:!0,tsType:{name:"Array",elements:[{name:"SankeyNodeDatum"}],raw:"SankeyNodeDatum[]"},description:"Node definitions"},links:{required:!0,tsType:{name:"Array",elements:[{name:"SankeyLinkDatum"}],raw:"SankeyLinkDatum[]"},description:"Link definitions"},columns:{required:!1,tsType:{name:"Array",elements:[{name:"union",raw:"string[] | SankeyColumnDef",elements:[{name:"Array",elements:[{name:"string"}],raw:"string[]"},{name:"SankeyColumnDef"}]}],raw:"SankeyColumn[]"},description:"Column definitions. Accepts either:\n- Simple: `string[][]` — arrays of node IDs per column\n- Rich: `SankeyColumnDef[]` — objects with `ids`, optional `label`\n- Mixed: any combination\n\nIf omitted, columns are auto-detected via topological sort."},height:{required:!1,tsType:{name:"number"},description:"Chart height in px (default: 320)",defaultValue:{value:"320",computed:!1}},nodeWidth:{required:!1,tsType:{name:"number"},description:"Node bar width in px (default: 20)",defaultValue:{value:"20",computed:!1}},nodeGap:{required:!1,tsType:{name:"number"},description:"Vertical gap between sibling nodes (default: 14)",defaultValue:{value:"14",computed:!1}},nodeColor:{required:!1,tsType:{name:"string"},description:`Override all node bar colors with a single CSS color.
Both SankeyNode and SankeyLabel read this from context
so labels adapt their text color for contrast.`},minColumnWidth:{required:!1,tsType:{name:"number"},description:`Minimum width per column in px (default: 160).
When total min width exceeds the container, horizontal scrolling activates.`,defaultValue:{value:"160",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:"Chart contents"}}};function A(r,t){return`oklch(${r[0]} ${r[1]} ${r[2]} / ${t})`}function ge(r){return typeof r=="object"&&"gradient"in r?{type:"gradient",bias:r.gradient}:r==="gradient"?{type:"gradient",bias:.5}:r==="source"?{type:"source"}:r==="target"?{type:"target"}:{type:"flat",value:r}}function v({color:r="gradient",opacity:t=.7,tension:n=.5}){const{links:a}=ee(),i=ge(r);return e.jsxs("g",{children:[i.type==="gradient"&&e.jsx("defs",{children:a.map((l,c)=>e.jsx(me,{index:c,link:l,opacity:t,bias:i.bias},c))}),a.map((l,c)=>{const o=l.source.x+l.source.width,s=l.target.x,d=l.sourceY,u=l.targetY,m=l.height,h=(s-o)*n,x=[`M${o},${d}`,`C${o+h},${d} ${s-h},${u} ${s},${u}`,`L${s},${u+m}`,`C${s-h},${u+m} ${o+h},${d+m} ${o},${d+m}`,"Z"].join(" ");let p,M;return i.type==="flat"?(p=i.value,M=t):i.type==="source"?p=A(l.source.color,t):i.type==="target"?p=A(l.target.color,t):p=`url(#astryx-sankey-grad-${c})`,e.jsx("path",{d:x,fill:p,opacity:M},c)})]})}function me({index:r,link:t,opacity:n,bias:a}){const i=t.source.x+t.source.width,l=t.target.x,c=Math.max(0,a-.15),o=Math.min(1,a+.15);return e.jsxs("linearGradient",{id:`astryx-sankey-grad-${r}`,x1:i,x2:l,y1:0,y2:0,gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:A(t.source.color,n)}),e.jsx("stop",{offset:`${c*100}%`,stopColor:A(t.source.color,n*.9)}),e.jsx("stop",{offset:`${o*100}%`,stopColor:A(t.target.color,n*.9)}),e.jsx("stop",{offset:"100%",stopColor:A(t.target.color,n)})]})}v.displayName="SankeyLink";v.__docgenInfo={description:`Renders all link ribbons in the Sankey chart.

Place before SankeyNode so nodes render on top.`,methods:[],displayName:"SankeyLink",props:{color:{required:!1,tsType:{name:"union",raw:`| 'gradient'
| 'source'
| 'target'
| {gradient: number}
| (string & {})`,elements:[{name:"literal",value:"'gradient'"},{name:"literal",value:"'source'"},{name:"literal",value:"'target'"},{name:"signature",type:"object",raw:"{gradient: number}",signature:{properties:[{key:"gradient",value:{name:"number",required:!0}}]}},{name:"unknown"}]},description:"Link coloring mode (default: 'gradient')",defaultValue:{value:"'gradient'",computed:!1}},opacity:{required:!1,tsType:{name:"number"},description:"Opacity of the link fills (default: 0.7)",defaultValue:{value:"0.7",computed:!1}},tension:{required:!1,tsType:{name:"number"},description:"Bezier tension — 0 is straight, 1 is maximum curve (default: 0.5)",defaultValue:{value:"0.5",computed:!1}}}};function oe(r,t){return`oklch(${r[0]} ${r[1]} ${r[2]} / ${t})`}function b({glow:r=!0}){const{nodes:t,nodeColor:n}=ee();return e.jsx("g",{children:t.map(a=>{const i=n||oe(a.color,.9),l=n||oe(a.color,.12);return e.jsxs("g",{children:[r&&e.jsx("rect",{x:a.x-3,y:a.y-1,width:a.width+6,height:a.height+2,rx:4,fill:l,opacity:n?.12:1}),e.jsx("rect",{x:a.x,y:a.y,width:a.width,height:a.height,rx:1.5,fill:i})]},a.id)})})}b.displayName="SankeyNode";b.__docgenInfo={description:`Renders all node indicators in the Sankey chart.

Color comes from the chart's \`nodeColor\` prop (global override)
or each node's individual color from data.`,methods:[],displayName:"SankeyNode",props:{glow:{required:!1,tsType:{name:"boolean"},description:"Whether to show the glow effect behind nodes (default: true)",defaultValue:{value:"true",computed:!1}}}};function he(r){return r>=1e4?Math.round(r/1e3)+"k":r>=1e3?(r/1e3).toFixed(1)+"k":r.toLocaleString()}function ye(r,t){if(t){const n=t.toLowerCase().trim();return n==="black"||/^#[0-3]/.test(n)||/^#.[0-3]/.test(n)||/^rgb\(\s*[0-7]\d?\s*,/.test(n)?"var(--color-on-dark, #fff)":"var(--color-on-light, #000)"}return r[0]<.6?"var(--color-on-dark, #fff)":"var(--color-on-light, #000)"}function f({showPercent:r=!0,formatValue:t=he}){const{nodes:n,columns:a,maxValue:i,height:l,nodeWidth:c,nodeColor:o}=ee(),s=a.length-1;return e.jsx("g",{children:n.map(d=>{const u=d.value/i*100,m=u>=10?Math.round(u)+"%":u.toFixed(1)+"%",h=t(d.value),x=`${d.label} = ${h}`,p=x.length*6.5;return d.height>=p+8?e.jsx(ve,{node:d,nodeWidth:c,nodeColor:o,text:x,pctStr:m,showPercent:r,height:l},d.id):e.jsx(be,{node:d,nodeWidth:c,text:x,pctStr:m,showPercent:r,height:l,isLastColumn:d.column===s},d.id)})})}function ve({node:r,nodeWidth:t,nodeColor:n,text:a,pctStr:i,showPercent:l,height:c}){const o=r.x+t/2,s=r.y+r.height/2;return e.jsxs("g",{children:[e.jsx("g",{transform:`translate(${o}, ${s}) rotate(-90)`,children:e.jsx("text",{x:0,y:0,textAnchor:"middle",dominantBaseline:"central",style:{font:"600 10px/1 system-ui",fill:ye(r.color,n),letterSpacing:"-0.01em"},children:a})}),l&&r.column>0&&e.jsx("text",{x:o,y:Math.min(c-2,r.y+r.height+12),textAnchor:"middle",style:{font:"500 9px/1 system-ui",fill:"var(--color-text-tertiary, #8e8ea0)"},children:i})]})}function be({node:r,nodeWidth:t,text:n,pctStr:a,showPercent:i,height:l,isLastColumn:c}){const o=r.x+t/2,s=r.y+r.height/2,d=n.length*6+10,u=16,m=c?r.x-6:r.x+t+6,h=c?m-d+4:m-4,x=c?"end":"start";return e.jsxs("g",{children:[e.jsx("rect",{x:h,y:s-u/2,width:d,height:u,rx:3,fill:"var(--color-background-surface, #fff)",fillOpacity:.9}),e.jsx("text",{x:m,y:s,textAnchor:x,dominantBaseline:"central",style:{font:"600 10px/1 system-ui",fill:"var(--color-text-primary, #1c1c1e)",letterSpacing:"-0.01em"},children:n}),i&&r.column>0&&e.jsx("text",{x:o,y:Math.min(l-2,r.y+r.height+12),textAnchor:"middle",style:{font:"500 9px/1 system-ui",fill:"var(--color-text-tertiary, #8e8ea0)"},children:a})]})}f.displayName="SankeyLabel";f.__docgenInfo={description:"",methods:[],displayName:"SankeyLabel",props:{showPercent:{required:!1,tsType:{name:"boolean"},description:"Show percentage below the node (default: true)",defaultValue:{value:"true",computed:!1}},formatValue:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: number) => string",signature:{arguments:[{type:{name:"number"},name:"value"}],return:{name:"string"}}},description:"Format function for the value (default: compact notation)",defaultValue:{value:`function defaultFormat(value: number): string {
  if (value >= 10000) {
    return Math.round(value / 1000) + 'k';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value.toLocaleString();
}`,computed:!1}}}};function w({dashArray:r="4 4",color:t,opacity:n=.3,showHeaders:a=!0}){const{columns:i,height:l,nodeWidth:c}=ee();return e.jsx("g",{children:i.map((o,s)=>e.jsxs("g",{children:[e.jsx("line",{x1:o.x+c/2,x2:o.x+c/2,y1:0,y2:l,stroke:t||"var(--color-border, #d0d0d8)",strokeOpacity:n,strokeDasharray:r,strokeWidth:1}),a&&o.label&&e.jsx("text",{x:o.x+c/2,y:l-2,textAnchor:"middle",style:{font:"500 10px/1 system-ui",fill:"var(--color-text-secondary, #6e6e80)",textTransform:"uppercase",letterSpacing:"0.04em"},children:o.label})]},s))})}w.displayName="SankeyGrid";w.__docgenInfo={description:`Vertical grid lines at each column position, with optional column headers.

Place before SankeyLink so grid renders behind ribbons.`,methods:[],displayName:"SankeyGrid",props:{dashArray:{required:!1,tsType:{name:"string"},description:'Dash pattern (default: "4 4")',defaultValue:{value:"'4 4'",computed:!1}},color:{required:!1,tsType:{name:"string"},description:"Stroke color (default: theme border)"},opacity:{required:!1,tsType:{name:"number"},description:"Opacity (default: 0.3)",defaultValue:{value:"0.3",computed:!1}},showHeaders:{required:!1,tsType:{name:"boolean"},description:"Show column header labels if defined (default: true)",defaultValue:{value:"true",computed:!1}}}};const Ee={title:"Lab/SankeyChart",tags:["autodocs"]},H=[{id:"visitors",label:"Visitors",value:52e3,color:[.65,.2,270]},{id:"signups",label:"Sign Ups",value:28e3,color:[.6,.17,235]},{id:"bounced",label:"Bounced",value:24e3,color:[.55,.14,350]},{id:"activated",label:"Activated",value:19500,color:[.62,.16,190]},{id:"dormant",label:"Dormant",value:8500,color:[.55,.13,50]},{id:"subscribed",label:"Subscribed",value:12400,color:[.64,.18,155]},{id:"churned",label:"Churned",value:7100,color:[.54,.15,20]}],D=[{source:"visitors",target:"signups",value:28e3},{source:"visitors",target:"bounced",value:24e3},{source:"signups",target:"activated",value:19500},{source:"signups",target:"dormant",value:8500},{source:"activated",target:"subscribed",value:12400},{source:"activated",target:"churned",value:7100}],G=[["visitors"],["signups","bounced"],["activated","dormant"],["subscribed","churned"]],V={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Conversion Funnel"}),e.jsx(S,{type:"body",color:"secondary",children:"User journey · Last 30 days"}),e.jsxs(y,{nodes:H,links:D,columns:G,height:360,children:[e.jsx(w,{}),e.jsx(v,{}),e.jsx(b,{}),e.jsx(f,{})]})]})},fe=[{id:"organic",label:"Organic",value:18e3,color:[.62,.17,155]},{id:"paid",label:"Paid Ads",value:22e3,color:[.6,.18,240]},{id:"referral",label:"Referral",value:12e3,color:[.58,.15,40]},{id:"direct",label:"Direct",value:8e3,color:[.55,.14,300]},{id:"web",label:"Web",value:32e3,color:[.61,.16,210]},{id:"mobile",label:"Mobile",value:2e4,color:[.59,.16,170]},{id:"other",label:"Other",value:8e3,color:[.5,.11,320]},{id:"sub",label:"Subscription",value:38e3,color:[.64,.19,260]},{id:"onetime",label:"One-time",value:14e3,color:[.58,.15,50]},{id:"enterprise",label:"Enterprise",value:8e3,color:[.56,.13,190]}],xe=[{source:"organic",target:"web",value:12e3},{source:"organic",target:"mobile",value:6e3},{source:"paid",target:"web",value:14e3},{source:"paid",target:"mobile",value:8e3},{source:"referral",target:"web",value:4e3},{source:"referral",target:"mobile",value:6e3},{source:"referral",target:"other",value:2e3},{source:"direct",target:"web",value:2e3},{source:"direct",target:"other",value:6e3},{source:"web",target:"sub",value:22e3},{source:"web",target:"onetime",value:6e3},{source:"web",target:"enterprise",value:4e3},{source:"mobile",target:"sub",value:14e3},{source:"mobile",target:"onetime",value:4e3},{source:"mobile",target:"enterprise",value:2e3},{source:"other",target:"sub",value:2e3},{source:"other",target:"onetime",value:4e3},{source:"other",target:"enterprise",value:2e3}],ke=[["organic","paid","referral","direct"],["web","mobile","other"],["sub","onetime","enterprise"]],q={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Revenue Sources"}),e.jsx(S,{type:"body",color:"secondary",children:"Channel attribution · March 2026"}),e.jsxs(y,{nodes:fe,links:xe,columns:ke,height:420,children:[e.jsx(w,{}),e.jsx(v,{opacity:.65,tension:.55}),e.jsx(b,{}),e.jsx(f,{})]})]})},B={render:()=>{const r=[{id:"a",label:"Source A",value:100},{id:"b",label:"Source B",value:80},{id:"mid",label:"Middle",value:180},{id:"out1",label:"Output 1",value:120},{id:"out2",label:"Output 2",value:60}],t=[{source:"a",target:"mid",value:100},{source:"b",target:"mid",value:80},{source:"mid",target:"out1",value:120},{source:"mid",target:"out2",value:60}];return e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Auto Column Detection"}),e.jsx(S,{type:"body",color:"secondary",children:"No explicit columns — topologically sorted"}),e.jsxs(y,{nodes:r,links:t,height:280,children:[e.jsx(v,{tension:.6}),e.jsx(b,{}),e.jsx(f,{showPercent:!1})]})]})}},O={render:()=>{const r=[{id:"awareness",label:"Awareness",value:1e5},{id:"interest",label:"Interest",value:68e3},{id:"dropped1",label:"Dropped",value:32e3,color:[.5,.12,350]},{id:"consideration",label:"Consideration",value:45e3},{id:"dropped2",label:"Distracted",value:23e3,color:[.5,.12,350]},{id:"intent",label:"Intent",value:32e3},{id:"dropped3",label:"Abandoned",value:13e3,color:[.5,.12,350]},{id:"evaluation",label:"Evaluation",value:24e3},{id:"dropped4",label:"Lost",value:8e3,color:[.5,.12,350]},{id:"purchase",label:"Purchase",value:18e3,color:[.64,.18,155]},{id:"dropped5",label:"Rejected",value:6e3,color:[.5,.12,350]}],t=[{source:"awareness",target:"interest",value:68e3},{source:"awareness",target:"dropped1",value:32e3},{source:"interest",target:"consideration",value:45e3},{source:"interest",target:"dropped2",value:23e3},{source:"consideration",target:"intent",value:32e3},{source:"consideration",target:"dropped3",value:13e3},{source:"intent",target:"evaluation",value:24e3},{source:"intent",target:"dropped4",value:8e3},{source:"evaluation",target:"purchase",value:18e3},{source:"evaluation",target:"dropped5",value:6e3}],n=[["awareness"],["interest","dropped1"],["consideration","dropped2"],["intent","dropped3"],["evaluation","dropped4"],["purchase","dropped5"]];return e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Deep Funnel (6 stages)"}),e.jsx(S,{type:"body",color:"secondary",children:"Scrolls horizontally when columns exceed container width"}),e.jsx("div",{style:{maxWidth:600,border:"1px solid var(--color-border, #ddd)",borderRadius:12,overflow:"hidden"},children:e.jsxs(y,{nodes:r,links:t,columns:n,height:360,minColumnWidth:160,children:[e.jsx(w,{}),e.jsx(v,{}),e.jsx(b,{}),e.jsx(f,{})]})})]})}},Se=[{id:"visitors",label:"Visitors",value:84200,color:[.55,.19,255]},{id:"signups",label:"Signed Up",value:42100,color:[.58,.18,255]},{id:"bounce",label:"Bounced",value:42100,color:[.5,.02,240]},{id:"onboarded",label:"Onboarded",value:28700,color:[.61,.17,252]},{id:"stalled",label:"Stalled",value:13400,color:[.5,.02,240]},{id:"active",label:"Active Users",value:21500,color:[.64,.16,250]},{id:"inactive",label:"Inactive",value:7200,color:[.5,.02,240]},{id:"paying",label:"Paying",value:15200,color:[.67,.15,248]},{id:"free",label:"Free Tier",value:6300,color:[.5,.02,240]}],je=[{source:"visitors",target:"signups",value:42100},{source:"visitors",target:"bounce",value:42100},{source:"signups",target:"onboarded",value:28700},{source:"signups",target:"stalled",value:13400},{source:"onboarded",target:"active",value:21500},{source:"onboarded",target:"inactive",value:7200},{source:"active",target:"paying",value:15200},{source:"active",target:"free",value:6300}],Ce=[["visitors"],["signups","bounce"],["onboarded","stalled"],["active","inactive"],["paying","free"]],W={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Acquisition Funnel"}),e.jsx(S,{type:"body",color:"secondary",children:"Blue = progression · Gray = drop-off"}),e.jsxs(y,{nodes:Se,links:je,columns:Ce,height:380,children:[e.jsx(w,{}),e.jsx(v,{opacity:.6}),e.jsx(b,{}),e.jsx(f,{})]})]})},we=[{id:"single",label:"Single",value:48,color:[.62,.16,30]},{id:"married",label:"Married",value:35,color:[.58,.14,180]},{id:"divorced",label:"Divorced",value:17,color:[.55,.12,300]},{id:"male",label:"Male",value:55,color:[.57,.15,240]},{id:"female",label:"Female",value:45,color:[.6,.16,340]},{id:"happy",label:"Happy",value:62,color:[.64,.18,150]},{id:"unhappy",label:"Unhappy",value:38,color:[.52,.14,25]}],Le=[{source:"single",target:"male",value:26},{source:"single",target:"female",value:22},{source:"married",target:"male",value:20},{source:"married",target:"female",value:15},{source:"divorced",target:"male",value:9},{source:"divorced",target:"female",value:8},{source:"male",target:"happy",value:34},{source:"male",target:"unhappy",value:21},{source:"female",target:"happy",value:28},{source:"female",target:"unhappy",value:17}],Te=[{ids:["single","married","divorced"],label:"Relationship"},{ids:["male","female"],label:"Gender"},{ids:["happy","unhappy"],label:"Outcome"}],P={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Survey Flow"}),e.jsx(S,{type:"body",color:"secondary",children:"Wider node bars with rotated text labels"}),e.jsxs(y,{nodes:we,links:Le,columns:Te,height:380,nodeGap:8,children:[e.jsx(w,{}),e.jsx(v,{opacity:.5,tension:.5}),e.jsx(b,{}),e.jsx(f,{})]})]})},_e=[{id:"income_tax",label:"Income Tax",value:2118406e3,color:[.55,.19,255]},{id:"payroll_tax",label:"Payroll Tax",value:1336808e3,color:[.58,.17,240]},{id:"corp_tax",label:"Corp Tax",value:51122e4,color:[.6,.16,220]},{id:"excise_tax",label:"Excise Tax",value:119883e3,color:[.56,.14,200]},{id:"misc_revenue",label:"Misc Revenue",value:96615e3,color:[.54,.12,280]},{id:"customs",label:"Customs",value:47878e3,color:[.52,.11,180]},{id:"proposals",label:"Proposals",value:45e6,color:[.5,.1,300]},{id:"estate_tax",label:"Estate Tax",value:38543e3,color:[.48,.09,160]},{id:"general_fund",label:"General Fund",value:2812308e3,color:[.62,.17,150]},{id:"social_security",label:"Social Security",value:968357e3,color:[.6,.16,170]},{id:"hhs",label:"HHS",value:309881e3,color:[.58,.15,130]},{id:"treasury",label:"Treasury",value:75173e3,color:[.56,.13,190]},{id:"labor",label:"Labor",value:57839e3,color:[.54,.12,40]},{id:"transport",label:"Transport",value:57056e3,color:[.52,.11,60]},{id:"agriculture",label:"Agriculture",value:11566e3,color:[.5,.1,100]},{id:"fcc",label:"FCC",value:10049e3,color:[.48,.09,260]},{id:"rail_retire",label:"Rail Retire",value:7098e3,color:[.5,.08,320]},{id:"opm",label:"OPM",value:5026e3,color:[.48,.08,340]}],Me=[{source:"income_tax",target:"general_fund",value:2118406e3},{source:"payroll_tax",target:"social_security",value:968357e3},{source:"corp_tax",target:"general_fund",value:51122e4},{source:"payroll_tax",target:"hhs",value:298488e3},{source:"misc_revenue",target:"treasury",value:75173e3},{source:"excise_tax",target:"general_fund",value:62827e3},{source:"payroll_tax",target:"labor",value:57839e3},{source:"excise_tax",target:"transport",value:57056e3},{source:"proposals",target:"general_fund",value:45e6},{source:"estate_tax",target:"general_fund",value:38543e3},{source:"customs",target:"general_fund",value:36312e3},{source:"customs",target:"agriculture",value:11566e3},{source:"misc_revenue",target:"hhs",value:11393e3},{source:"misc_revenue",target:"fcc",value:10049e3},{source:"payroll_tax",target:"rail_retire",value:7098e3},{source:"payroll_tax",target:"opm",value:5026e3}],Ne=[{ids:["income_tax","payroll_tax","corp_tax","excise_tax","misc_revenue","customs","proposals","estate_tax"],label:"Revenue Source"},{ids:["general_fund","social_security","hhs","treasury","labor","transport","agriculture","fcc","rail_retire","opm"],label:"Receiving Agency"}];function Fe(r){return r>=1e9?"$"+(r/1e9).toFixed(1)+"T":r>=1e6?"$"+Math.round(r/1e6)+"B":r>=1e3?"$"+Math.round(r/1e3)+"M":"$"+r.toLocaleString()}const U={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"US Federal Budget FY2020"}),e.jsx(S,{type:"body",color:"secondary",children:"Revenue sources → receiving agencies (vega-datasets/budget.json)"}),e.jsxs(y,{nodes:_e,links:Me,columns:Ne,height:480,children:[e.jsx(w,{}),e.jsx(v,{opacity:.6,tension:.5}),e.jsx(b,{}),e.jsx(f,{formatValue:Fe})]})]})},I={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Petroleum Flow"}),e.jsx(S,{type:"body",color:"secondary",children:"Monochrome — flat color, no gradients"}),e.jsxs(y,{nodes:H,links:D,columns:G,height:340,nodeColor:"#1a1a1e",children:[e.jsx(v,{color:"#1a1a1e",opacity:.75}),e.jsx(b,{glow:!1}),e.jsx(f,{})]})]})},z={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Source-Colored Links"}),e.jsx(S,{type:"body",color:"secondary",children:"Each ribbon matches its source node"}),e.jsxs(y,{nodes:H,links:D,columns:G,height:340,children:[e.jsx(w,{}),e.jsx(v,{color:"source"}),e.jsx(b,{}),e.jsx(f,{})]})]})},Y={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Target-Colored Links"}),e.jsx(S,{type:"body",color:"secondary",children:"Each ribbon matches its destination node"}),e.jsxs(y,{nodes:H,links:D,columns:G,height:340,children:[e.jsx(w,{}),e.jsx(v,{color:"target"}),e.jsx(b,{}),e.jsx(f,{})]})]})},X={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Source-Leaned Gradient"}),e.jsx(S,{type:"body",color:"secondary",children:"bias=0.2 — holds source color, transitions near target"}),e.jsxs(y,{nodes:H,links:D,columns:G,height:340,children:[e.jsx(w,{}),e.jsx(v,{color:{gradient:.2}}),e.jsx(b,{}),e.jsx(f,{})]})]})},Z={render:()=>e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(C,{level:3,children:"Target-Leaned Gradient"}),e.jsx(S,{type:"body",color:"secondary",children:"bias=0.8 — transitions early, holds target color"}),e.jsxs(y,{nodes:H,links:D,columns:G,height:340,children:[e.jsx(w,{}),e.jsx(v,{color:{gradient:.8}}),e.jsx(b,{}),e.jsx(f,{})]})]})};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:"Classic diverging funnel with grid lines",...V.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source},description:{story:"Converging Sankey — multiple sources flowing to fewer destinations",...q.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:"Minimal — auto-detected columns, no grid",...B.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:"Many columns — demonstrates horizontal scroll with minColumnWidth",...O.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source},description:{story:`Business funnel with blue main flow and gray exit paths.
Uses background labels for readability over the ribbons.`,...W.parameters?.docs?.description}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:"Wide bars with rotated labels and column headers — art deco style",...P.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source},description:{story:`Real data: US Federal Budget FY2020 from vega-datasets.
Tax revenue sources flowing to receiving government agencies.`,...U.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:"Monochrome — flat black ribbons on white, editorial style",...I.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:"Source-colored — each link takes its source node's color",...z.parameters?.docs?.description}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:"Target-colored — each link takes its target node's color",...Y.parameters?.docs?.description}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source},description:{story:"Leaned gradient — source-biased, transitions late",...X.parameters?.docs?.description}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source},description:{story:"Leaned gradient — target-biased, transitions early",...Z.parameters?.docs?.description}}};const Ve=["ConversionFunnel","RevenueFlow","AutoColumns","ManyColumns","BusinessFunnel","WideBarStyle","USFederalBudget","Monochrome","SourceColored","TargetColored","LeanedSourceGradient","LeanedTargetGradient"];export{B as AutoColumns,W as BusinessFunnel,V as ConversionFunnel,X as LeanedSourceGradient,Z as LeanedTargetGradient,O as ManyColumns,I as Monochrome,q as RevenueFlow,z as SourceColored,Y as TargetColored,U as USFederalBudget,P as WideBarStyle,Ve as __namedExportsOrder,Ee as default};
