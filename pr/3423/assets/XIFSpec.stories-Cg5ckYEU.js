import{a1 as s,T as h,ah as z}from"./iframe-FpdBIrKz.js";import{D as E}from"./Divider-BLixqolk.js";import{S as u}from"./Stack-DEYywiUi.js";import{H as v}from"./Heading-BWSbAVGy.js";import{S as V}from"./SVGIcon-Bad-ONKq.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";const ee={name:"check",paths:[{type:"path",attrs:{d:"M5 13l4 4L19 7"},role:"stroke"}],tags:["action","confirm"]},N={name:"home",paths:[{type:"path",attrs:{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},role:"fill",layer:"primary"},{type:"path",attrs:{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"},role:"fill",layer:"secondary"}],tags:["navigation"]},X={name:"file",paths:[{type:"path",attrs:{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"},role:"fill",layer:"primary"},{type:"path",attrs:{d:"M14 2v4a2 2 0 0 0 2 2h4"},role:"stroke",layer:"secondary"}],slots:[{name:"badge",position:{x:.5,y:.65},size:.35}],tags:["file","document"]},_={name:"shield",paths:[{type:"path",attrs:{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"},role:"fill",layer:"primary"}],slots:[{name:"badge",position:"center",size:.42}],tags:["security","protection"]},U={name:"bell",paths:[{type:"path",attrs:{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"},role:"fill",layer:"primary",animate:{type:"scale",sequence:1}},{type:"path",attrs:{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0"},role:"stroke",layer:"secondary",animate:{type:"draw",sequence:2}}],tags:["notification","alert"]},Y={name:"star",paths:[{type:"path",attrs:{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"},role:"fill",layer:"primary",personality:{cornerRounding:0}}],tags:["rating","favorite"]},te={name:"bell-override",paths:[{type:"path",attrs:{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"},role:"fill",layer:"primary"},{type:"path",attrs:{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0"},role:"stroke",layer:"secondary"}],overrides:{bold:[{type:"path",attrs:{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"},role:"fill",layer:"primary"},{type:"path",attrs:{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0"},role:"fill",layer:"secondary"}]},tags:["notification"]},ae=[ee,N,X,_,U,Y,te];function O(o){const a=[],l=/([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;let i,r=0,n=0,c=0,p=0;for(;(i=l.exec(o))!==null;){const d=i[1],t=(i[2].match(/-?[\d.]+(?:e[+-]?\d+)?/gi)||[]).map(Number);switch(d){case"M":r=t[0],n=t[1],c=r,p=n,a.push({type:"M",x:r,y:n});for(let e=2;e<t.length;e+=2)r=t[e],n=t[e+1],a.push({type:"L",x:r,y:n});break;case"m":r+=t[0],n+=t[1],c=r,p=n,a.push({type:"M",x:r,y:n});for(let e=2;e<t.length;e+=2)r+=t[e],n+=t[e+1],a.push({type:"L",x:r,y:n});break;case"L":for(let e=0;e<t.length;e+=2)r=t[e],n=t[e+1],a.push({type:"L",x:r,y:n});break;case"l":for(let e=0;e<t.length;e+=2)r+=t[e],n+=t[e+1],a.push({type:"L",x:r,y:n});break;case"H":for(let e=0;e<t.length;e++)r=t[e],a.push({type:"L",x:r,y:n});break;case"h":for(let e=0;e<t.length;e++)r+=t[e],a.push({type:"L",x:r,y:n});break;case"V":for(let e=0;e<t.length;e++)n=t[e],a.push({type:"L",x:r,y:n});break;case"v":for(let e=0;e<t.length;e++)n+=t[e],a.push({type:"L",x:r,y:n});break;case"C":for(let e=0;e<t.length;e+=6)a.push({type:"C",x1:t[e],y1:t[e+1],x2:t[e+2],y2:t[e+3],x:t[e+4],y:t[e+5]}),r=t[e+4],n=t[e+5];break;case"c":for(let e=0;e<t.length;e+=6)a.push({type:"C",x1:r+t[e],y1:n+t[e+1],x2:r+t[e+2],y2:n+t[e+3],x:r+t[e+4],y:n+t[e+5]}),r+=t[e+4],n+=t[e+5];break;case"Q":for(let e=0;e<t.length;e+=4)a.push({type:"Q",cx:t[e],cy:t[e+1],x:t[e+2],y:t[e+3]}),r=t[e+2],n=t[e+3];break;case"q":for(let e=0;e<t.length;e+=4)a.push({type:"Q",cx:r+t[e],cy:n+t[e+1],x:r+t[e+2],y:n+t[e+3]}),r+=t[e+2],n+=t[e+3];break;case"A":case"a":{const e=d==="a";for(let y=0;y<t.length;y+=7){const x=e?r+t[y+5]:t[y+5],f=e?n+t[y+6]:t[y+6];a.push({type:"A",rx:t[y],ry:t[y+1],rotation:t[y+2],large:t[y+3],sweep:t[y+4],x,y:f}),r=x,n=f}break}case"S":case"s":break;case"T":case"t":break;case"Z":case"z":a.push({type:"Z"}),r=c,n=p;break}}return a}function M(o,a){return Math.sqrt((a.x-o.x)**2+(a.y-o.y)**2)}function j(o,a,l){return{x:o.x+(a.x-o.x)*l,y:o.y+(a.y-o.y)*l}}function W(o,a){const l=o.x*a.x+o.y*a.y,i=Math.sqrt(o.x**2+o.y**2),r=Math.sqrt(a.x**2+a.y**2);return i===0||r===0?Math.PI:Math.acos(Math.max(-1,Math.min(1,l/(i*r))))}function g(o){return o.type==="Z"?null:{x:o.x,y:o.y}}function J(o,a){if(a<=0)return o;a=Math.min(1,a);const l=O(o),i=[];for(let r=0;r<l.length;r++){const n=r>0?l[r-1]:null,c=l[r],p=r<l.length-1?l[r+1]:null;if(c.type==="Z"&&n&&(n.type==="L"||n.type==="Q")){let d=r-1;for(;d>=0&&l[d].type!=="M";)d--;if(d>=0){const t=l[d],e=g(t),y=g(n);if(!e||!y){i.push(c);continue}let x=d+1;for(;x<l.length&&l[x].type!=="L";)x++;if(x<l.length){const f=g(l[x]);if(!f){i.push(c);continue}const S=M(y,e),k=M(e,f),T=Math.min(S,k)/2,B={x:y.x-e.x,y:y.y-e.y},w={x:f.x-e.x,y:f.y-e.y},Z=1-W(B,w)/Math.PI,b=T*a*Z*.85;if(b>=.1){const I=b/S,A=b/k,D=j(e,y,I),G=j(e,f,A);i.push({type:"L",x:D.x,y:D.y}),i.push({type:"Q",cx:e.x,cy:e.y,x:G.x,y:G.y}),i.push({type:"Z"});continue}}}i.push(c);continue}if(c.type==="L"&&n&&(n.type==="L"||n.type==="M"||n.type==="Q")&&p&&(p.type==="L"||p.type==="Z")){const d=g(n);if(!d){i.push(c);continue}const t={x:c.x,y:c.y};let e;if(p.type==="Z"){const A=l.find(D=>D.type==="M");e=A?g(A):null}else e=g(p);if(!e){i.push(c);continue}const y=M(d,t),x=M(t,e),f=Math.min(y,x)/2,S={x:d.x-t.x,y:d.y-t.y},k={x:e.x-t.x,y:e.y-t.y},B=1-W(S,k)/Math.PI,w=f*a*B*.85;if(w<.1){i.push(c);continue}const q=w/y,Z=w/x,b=j(t,d,q),I=j(t,e,Z);i.push({type:"L",x:b.x,y:b.y}),i.push({type:"Q",cx:t.x,cy:t.y,x:I.x,y:I.y})}else i.push(c)}return Q(i)}function K(o,a){if(a<=0)return o;a=Math.min(1,a);const l=O(o),i=[];for(let r=0;r<l.length;r++){const n=r>0?l[r-1]:null,c=l[r];if(c.type==="L"&&n){const p=g(n);if(!p){i.push(c);continue}const d={x:c.x,y:c.y},t=M(p,d);if(t<2){i.push(c);continue}const e=j(p,d,.5),y=d.x-p.x,f=-(d.y-p.y)/t,S=y/t,k=t*a*.25,T={x:e.x+f*k,y:e.y+S*k};i.push({type:"Q",cx:T.x,cy:T.y,x:d.x,y:d.y})}else i.push(c)}return Q(i)}function se(o,a){if(a===.5)return o;const l=O(o),i=[],r=1.5-a;for(let n=0;n<l.length;n++){const c=n>0?l[n-1]:null,p=l[n];if(p.type==="C"&&c){const d=g(c)||{x:0,y:0},t={x:p.x,y:p.y},e={x:d.x+(p.x1-d.x)*r,y:d.y+(p.y1-d.y)*r},y={x:t.x+(p.x2-t.x)*r,y:t.y+(p.y2-t.y)*r};i.push({type:"C",x1:e.x,y1:e.y,x2:y.x,y2:y.y,x:t.x,y:t.y})}else if(p.type==="Q"&&c){const d=g(c)||{x:0,y:0},t={x:p.x,y:p.y},e=j(d,t,.5),y={x:e.x+(p.cx-e.x)*r,y:e.y+(p.cy-e.y)*r};i.push({type:"Q",cx:y.x,cy:y.y,x:t.x,y:t.y})}else i.push(p)}return Q(i)}function re(o,a){let l=o;return a.cornerRounding!=null&&a.cornerRounding>0&&(l=J(l,a.cornerRounding)),a.segmentCurvature!=null&&a.segmentCurvature>0&&(l=K(l,a.segmentCurvature)),a.tension!=null&&a.tension!==.5&&(l=se(l,a.tension)),l}function m(o){return Number(o.toFixed(3)).toString()}function Q(o){return o.map(a=>{switch(a.type){case"M":return`M${m(a.x)} ${m(a.y)}`;case"L":return`L${m(a.x)} ${m(a.y)}`;case"C":return`C${m(a.x1)} ${m(a.y1)} ${m(a.x2)} ${m(a.y2)} ${m(a.x)} ${m(a.y)}`;case"Q":return`Q${m(a.cx)} ${m(a.cy)} ${m(a.x)} ${m(a.y)}`;case"A":return`A${m(a.rx)} ${m(a.ry)} ${m(a.rotation)} ${a.large} ${a.sweep} ${m(a.x)} ${m(a.y)}`;case"Z":return"Z"}}).join(" ")}function L(o){const a=r=>r.filter(n=>(n.type??"path")!=="ellipse").map(n=>({type:n.type??"path",attrs:Object.fromEntries(Object.entries(n.attrs).map(([c,p])=>[c,String(p)])),role:n.role})),l=a(o.paths.filter(r=>(r.layer??"primary")==="primary")),i=a(o.paths.filter(r=>r.layer==="secondary"));return{name:o.name,viewBox:o.viewBox,primary:l,secondary:i.length>0?i:void 0}}const he={title:"Lab/XIFSpec"},R=["linear","bold","twotone","bulk","broken"],P={render:()=>s.jsxs(u,{direction:"vertical",gap:3,children:[s.jsx(v,{level:3,children:"XIF Spec Examples"}),s.jsx(h,{type:"supporting",children:"Icons defined using the Astryx Icon Format specification. Each demonstrates a different capability: stroke-only, two-layer knockout, composable slots, animation declarations, personality overrides, and bold geometry overrides."}),s.jsxs("div",{style:{display:"grid",gridTemplateColumns:`140px repeat(${R.length}, 1fr)`,gap:"8px 4px",alignItems:"center"},children:[s.jsx("div",{}),R.map(o=>s.jsx(h,{type:"label",style:{textAlign:"center",fontSize:10},children:o},o)),ae.map(o=>{const a=L(o),l=[];return o.slots?.length&&l.push("🔌 slots"),o.paths.some(i=>i.animate)&&l.push("✨ animated"),o.paths.some(i=>i.personality)&&l.push("🎨 personality"),o.overrides&&l.push("🔀 overrides"),o.paths.some(i=>i.layer==="secondary")&&l.push("📐 two-layer"),s.jsxs(z.Fragment,{children:[s.jsxs("div",{children:[s.jsx(h,{type:"label",style:{fontSize:11},children:o.name}),l.length>0&&s.jsx(h,{type:"supporting",style:{fontSize:9,marginTop:2},children:l.join(" ")})]}),R.map(i=>s.jsx("div",{style:{display:"flex",justifyContent:"center"},children:s.jsx(V,{icon:a,variation:i,size:"lg"})},`${o.name}-${i}`))]},o.name)})]})]})},H={render:()=>{const o=L(_),a=L(X),l={name:"shield-check",primary:[...o.primary],secondary:[{type:"path",attrs:{d:"M9 13l2 2 4-4"},role:"stroke"}]},i={name:"shield-x",primary:[...o.primary],secondary:[{type:"path",attrs:{d:"M9 9l6 6M15 9l-6 6"},role:"stroke"}]},r={name:"file-text",primary:[...a.primary],secondary:[...a.secondary??[],{type:"line",attrs:{x1:"9",y1:"13",x2:"15",y2:"13"},role:"stroke"},{type:"line",attrs:{x1:"9",y1:"17",x2:"13",y2:"17"},role:"stroke"}]};return s.jsxs(u,{direction:"vertical",gap:3,children:[s.jsx(v,{level:3,children:"Composition via Slots"}),s.jsxs(h,{type:"supporting",children:["Icons with ",s.jsx("code",{children:"slots"})," accept sub-icons. One shield base + different badges = many composed icons without extra path data."]}),s.jsx(u,{direction:"horizontal",gap:4,children:[{label:"shield (base)",def:o},{label:"shield-check",def:l},{label:"shield-x",def:i},{label:"file (base)",def:a},{label:"file-text",def:r}].map(({label:n,def:c})=>s.jsxs(u,{direction:"vertical",gap:1,hAlign:"center",children:[s.jsxs(u,{direction:"horizontal",gap:2,children:[s.jsx(V,{icon:c,variation:"linear",size:"lg"}),s.jsx(V,{icon:c,variation:"bold",size:"lg"})]}),s.jsx(h,{type:"supporting",style:{fontSize:10},children:n})]},n))}),s.jsx(E,{}),s.jsx(v,{level:4,children:"Slot Definition"}),s.jsxs(h,{type:"supporting",children:["The shield icon defines:"," ",s.jsx("code",{children:"slots: [{ name: 'badge', position: 'center', size: 0.42 }]"}),". At render time, the component scales and positions the badge icon into the slot. The badge inherits the parent's variation and color."]})]})}},$={render:()=>{const o=L(Y),a=L(N),l=L(U),i=[{name:"Brutalist",desc:"Sharp corners, straight lines, tight curves"},{name:"Technical",desc:"Minimal rounding, precise geometry"},{name:"Default",desc:"Balanced — slight softening"},{name:"Friendly",desc:"Rounded corners, subtle curves"},{name:"Playful",desc:"Very rounded, bowed segments"}];return s.jsxs(u,{direction:"vertical",gap:3,children:[s.jsx(v,{level:3,children:"Personality Axes (Conceptual)"}),s.jsxs(h,{type:"supporting",children:["Shape personality parameters adjust the ",s.jsx("em",{children:"feel"})," of icons without changing their structure. All adjustments are relative, preserving the artist's hierarchy of sharp vs soft. These icons show the concept; path manipulation is not yet implemented."]}),s.jsxs("div",{style:{display:"grid",gridTemplateColumns:"120px repeat(5, 1fr)",gap:"12px 8px",alignItems:"center"},children:[s.jsx("div",{}),i.map(r=>s.jsxs(u,{direction:"vertical",gap:0,hAlign:"center",children:[s.jsx(h,{type:"label",style:{fontSize:10},children:r.name}),s.jsx(h,{type:"supporting",style:{fontSize:8},children:r.desc})]},r.name)),[{name:"star",def:o},{name:"home",def:a},{name:"bell",def:l}].map(({name:r,def:n})=>s.jsxs(z.Fragment,{children:[s.jsx(h,{type:"label",style:{fontSize:11},children:r}),i.map((c,p)=>s.jsx("div",{style:{display:"flex",justifyContent:"center",opacity:.3+p*.175},children:s.jsx(V,{icon:n,variation:"linear",size:"lg",strokeWidth:1.5-p*.1})},c.name))]},r))]}),s.jsx(h,{type:"supporting",children:"Note: opacity/stroke-width are used as visual placeholders here. The real implementation will modify path geometry, rounding corners, bowing segments, adjusting curve tension, all at build time via the theme pipeline."})]})}},F={render:()=>{const o=`
      @keyframes xif-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
      @keyframes xif-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes xif-scale { from { transform: scale(0); } to { transform: scale(1); } }
      @keyframes xif-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .xif-draw path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: xif-draw 1.2s ease-out forwards; }
      .xif-draw path:nth-child(2) { animation-delay: 0.4s; }
      .xif-fade path { opacity: 0; animation: xif-fade 0.6s ease-out forwards; }
      .xif-fade path:nth-child(2) { animation-delay: 0.3s; }
      .xif-scale path { transform-origin: center; transform: scale(0); animation: xif-scale 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .xif-scale path:nth-child(2) { animation-delay: 0.2s; }
      .xif-rotate { transform-origin: center; animation: xif-rotate 2s linear infinite; }
    `,a=[{name:"draw",desc:"Stroke reveals along path",cls:"xif-draw",paths:["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9","M10.3 21a1.94 1.94 0 0 0 3.4 0"]},{name:"fade",desc:"Opacity entrance per layer",cls:"xif-fade",paths:["M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z","M9 12l2 2 4-4"]},{name:"scale",desc:"Grow from center",cls:"xif-scale",paths:["M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"]},{name:"rotate",desc:"Continuous spin",cls:"xif-rotate",paths:["M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"]}];return s.jsxs(u,{direction:"vertical",gap:3,children:[s.jsx("style",{dangerouslySetInnerHTML:{__html:o}}),s.jsx(v,{level:3,children:"Animation Types (Live)"}),s.jsx(h,{type:"supporting",children:"Icons declare animation intent per path. The theme resolves timing. Each demo loops on page load."}),s.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:24},children:a.map(l=>s.jsxs(u,{direction:"vertical",gap:1,hAlign:"center",style:{padding:16},children:[s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"48",height:"48",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round",className:l.cls,children:l.paths.map((i,r)=>s.jsx("path",{d:i},r))}),s.jsx(h,{type:"label",style:{fontSize:12,marginTop:8},children:l.name}),s.jsx(h,{type:"supporting",style:{fontSize:10,textAlign:"center"},children:l.desc})]},l.name))})]})}},ne={square:"M4 4 L20 4 L20 20 L4 20 Z",diamond:"M12 2 L22 12 L12 22 L2 12 Z",arrow:"M12 2 L20 10 L16 10 L16 22 L8 22 L8 10 L4 10 Z",star:"M12 2 L14.5 8.5 L21.5 9.5 L16.3 14.5 L17.6 21.5 L12 18 L6.4 21.5 L7.7 14.5 L2.5 9.5 L9.5 8.5 Z",bell:"M4 17 L4 9 L8 5 L12 3 L16 5 L20 9 L20 17 Z",envelope:"M2 6 L12 13 L22 6 L22 18 L2 18 Z",chat:"M3 4 L21 4 L21 16 L13 16 L8 21 L8 16 L3 16 Z",shield:"M4 5 L12 2 L20 5 L20 13 L12 22 L4 13 Z",hexagon:"M12 2 L20.5 6.5 L20.5 15.5 L12 20 L3.5 15.5 L3.5 6.5 Z",bookmark:"M6 2 L18 2 L18 22 L12 17 L6 22 Z"},C={render:()=>{const o=[0,.2,.4,.6,.8,1],a=[0,.2,.5,.8,1],l=Object.entries(ne);return s.jsxs(u,{direction:"vertical",gap:4,children:[s.jsx(v,{level:3,children:"Path Transform Playground"}),s.jsxs(h,{type:"supporting",children:["Live path manipulation with sagitta-corrected corner rounding. Sharp corners (like star tips) round less aggressively than gentle corners, achieving equal ",s.jsx("em",{children:"perceived"})," roundness at all angles."]}),s.jsx(v,{level:4,children:"Corner Rounding (sagitta-corrected)"}),s.jsx(h,{type:"supporting",children:"Same cornerRounding value across all shapes. Sharp corners get less radius, gentle corners get more, visually balanced."}),s.jsxs("div",{style:{display:"grid",gridTemplateColumns:`80px repeat(${o.length}, 1fr)`,gap:"8px 4px",alignItems:"center"},children:[s.jsx("div",{}),o.map(i=>s.jsx(h,{type:"label",style:{textAlign:"center",fontSize:10},children:i},i)),l.map(([i,r])=>s.jsxs(z.Fragment,{children:[s.jsx(h,{type:"label",style:{fontSize:11},children:i}),o.map(n=>s.jsx("div",{style:{display:"flex",justifyContent:"center"},children:s.jsx("svg",{viewBox:"0 0 24 24",width:"40",height:"40",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:s.jsx("path",{d:J(r,n)})})},n))]},i))]}),s.jsx(E,{}),s.jsx(v,{level:4,children:"Segment Curvature"}),s.jsx(h,{type:"supporting",children:"Straight line segments gain a perpendicular bow. Subtle at low values, pronounced at high."}),s.jsxs("div",{style:{display:"grid",gridTemplateColumns:`80px repeat(${a.length}, 1fr)`,gap:"8px 4px",alignItems:"center"},children:[s.jsx("div",{}),a.map(i=>s.jsx(h,{type:"label",style:{textAlign:"center",fontSize:10},children:i},i)),l.slice(0,5).map(([i,r])=>s.jsxs(z.Fragment,{children:[s.jsx(h,{type:"label",style:{fontSize:11},children:i}),a.map(n=>s.jsx("div",{style:{display:"flex",justifyContent:"center"},children:s.jsx("svg",{viewBox:"0 0 24 24",width:"40",height:"40",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:s.jsx("path",{d:K(r,n)})})},n))]},i))]}),s.jsx(E,{}),s.jsx(v,{level:4,children:"Personality Presets (combined transforms)"}),s.jsxs("div",{style:{display:"grid",gridTemplateColumns:"80px repeat(5, 1fr)",gap:"8px 4px",alignItems:"center"},children:[s.jsx("div",{}),[{label:"Brutalist",r:0,c:0},{label:"Technical",r:.1,c:0},{label:"Default",r:.25,c:.05},{label:"Friendly",r:.5,c:.15},{label:"Playful",r:.8,c:.3}].map(i=>s.jsxs(u,{direction:"vertical",hAlign:"center",gap:0,children:[s.jsx(h,{type:"label",style:{fontSize:10},children:i.label}),s.jsxs(h,{type:"supporting",style:{fontSize:8},children:["r:",i.r," c:",i.c]})]},i.label)),l.map(([i,r])=>s.jsxs(z.Fragment,{children:[s.jsx(h,{type:"label",style:{fontSize:11},children:i}),[{r:0,c:0},{r:.1,c:0},{r:.25,c:.05},{r:.5,c:.15},{r:.8,c:.3}].map((n,c)=>{const p=re(r,{cornerRounding:n.r,segmentCurvature:n.c});return s.jsx("div",{style:{display:"flex",justifyContent:"center"},children:s.jsx("svg",{viewBox:"0 0 24 24",width:"40",height:"40",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:s.jsx("path",{d:p})})},c)})]},i))]})]})}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={3}>
      <Heading level={3}>XIF Spec Examples</Heading>
      <Text type="supporting">
        Icons defined using the Astryx Icon Format specification. Each demonstrates
        a different capability: stroke-only, two-layer knockout, composable
        slots, animation declarations, personality overrides, and bold geometry
        overrides.
      </Text>

      <div style={{
      display: 'grid',
      gridTemplateColumns: \`140px repeat(\${VARIATIONS.length}, 1fr)\`,
      gap: '8px 4px',
      alignItems: 'center'
    }}>
        <div />
        {VARIATIONS.map(v => <Text key={v} type="label" style={{
        textAlign: 'center',
        fontSize: 10
      }}>
            {v}
          </Text>)}

        {xifExamples.map(xif => {
        const def = xifToSvgIconDef(xif);
        const features: string[] = [];
        if (xif.slots?.length) {
          features.push('🔌 slots');
        }
        if (xif.paths.some(p => p.animate)) {
          features.push('✨ animated');
        }
        if (xif.paths.some(p => p.personality)) {
          features.push('🎨 personality');
        }
        if (xif.overrides) {
          features.push('🔀 overrides');
        }
        if (xif.paths.some(p => p.layer === 'secondary')) {
          features.push('📐 two-layer');
        }
        return <Fragment key={xif.name}>
              <div>
                <Text type="label" style={{
              fontSize: 11
            }}>
                  {xif.name}
                </Text>
                {features.length > 0 && <Text type="supporting" style={{
              fontSize: 9,
              marginTop: 2
            }}>
                    {features.join(' ')}
                  </Text>}
              </div>
              {VARIATIONS.map(v => <div key={\`\${xif.name}-\${v}\`} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
                  <SVGIcon icon={def} variation={v} size="lg" />
                </div>)}
            </Fragment>;
      })}
      </div>
    </Stack>
}`,...P.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => {
    const shieldDef = xifToSvgIconDef(xifShield);
    const fileDef = xifToSvgIconDef(xifFile);
    // Manually demonstrate what slot composition would produce
    // (Until the component natively supports slots)
    const composedShieldCheck: SVGIconDef = {
      name: 'shield-check',
      primary: [...shieldDef.primary],
      secondary: [{
        type: 'path' as const,
        attrs: {
          d: 'M9 13l2 2 4-4'
        },
        role: 'stroke' as const
      }]
    };
    const composedShieldX: SVGIconDef = {
      name: 'shield-x',
      primary: [...shieldDef.primary],
      secondary: [{
        type: 'path' as const,
        attrs: {
          d: 'M9 9l6 6M15 9l-6 6'
        },
        role: 'stroke' as const
      }]
    };
    const composedFileText: SVGIconDef = {
      name: 'file-text',
      primary: [...fileDef.primary],
      secondary: [...(fileDef.secondary ?? []), {
        type: 'line' as const,
        attrs: {
          x1: '9',
          y1: '13',
          x2: '15',
          y2: '13'
        },
        role: 'stroke' as const
      }, {
        type: 'line' as const,
        attrs: {
          x1: '9',
          y1: '17',
          x2: '13',
          y2: '17'
        },
        role: 'stroke' as const
      }]
    };
    return <Stack direction="vertical" gap={3}>
        <Heading level={3}>Composition via Slots</Heading>
        <Text type="supporting">
          Icons with <code>slots</code> accept sub-icons. One shield base +
          different badges = many composed icons without extra path data.
        </Text>

        <Stack direction="horizontal" gap={4}>
          {[{
          label: 'shield (base)',
          def: shieldDef
        }, {
          label: 'shield-check',
          def: composedShieldCheck
        }, {
          label: 'shield-x',
          def: composedShieldX
        }, {
          label: 'file (base)',
          def: fileDef
        }, {
          label: 'file-text',
          def: composedFileText
        }].map(({
          label,
          def
        }) => <Stack key={label} direction="vertical" gap={1} hAlign="center">
              <Stack direction="horizontal" gap={2}>
                <SVGIcon icon={def} variation="linear" size="lg" />
                <SVGIcon icon={def} variation="bold" size="lg" />
              </Stack>
              <Text type="supporting" style={{
            fontSize: 10
          }}>
                {label}
              </Text>
            </Stack>)}
        </Stack>

        <Divider />

        <Heading level={4}>Slot Definition</Heading>
        <Text type="supporting">
          The shield icon defines:{' '}
          <code>
            slots: [&#123; name: &apos;badge&apos;, position:
            &apos;center&apos;, size: 0.42 &#125;]
          </code>
          . At render time, the component scales and positions the badge icon
          into the slot. The badge inherits the parent&apos;s variation and
          color.
        </Text>
      </Stack>;
  }
}`,...H.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => {
    const starDef = xifToSvgIconDef(xifStar);
    const homeDef = xifToSvgIconDef(xifHome);
    const bellDef = xifToSvgIconDef(xifBell);
    const presets = [{
      name: 'Brutalist',
      desc: 'Sharp corners, straight lines, tight curves'
    }, {
      name: 'Technical',
      desc: 'Minimal rounding, precise geometry'
    }, {
      name: 'Default',
      desc: 'Balanced — slight softening'
    }, {
      name: 'Friendly',
      desc: 'Rounded corners, subtle curves'
    }, {
      name: 'Playful',
      desc: 'Very rounded, bowed segments'
    }];
    return <Stack direction="vertical" gap={3}>
        <Heading level={3}>Personality Axes (Conceptual)</Heading>
        <Text type="supporting">
          Shape personality parameters adjust the <em>feel</em> of icons without
          changing their structure. All adjustments are relative, preserving the
          artist&apos;s hierarchy of sharp vs soft. These icons show the
          concept; path manipulation is not yet implemented.
        </Text>

        <div style={{
        display: 'grid',
        gridTemplateColumns: '120px repeat(5, 1fr)',
        gap: '12px 8px',
        alignItems: 'center'
      }}>
          <div />
          {presets.map(p => <Stack key={p.name} direction="vertical" gap={0} hAlign="center">
              <Text type="label" style={{
            fontSize: 10
          }}>
                {p.name}
              </Text>
              <Text type="supporting" style={{
            fontSize: 8
          }}>
                {p.desc}
              </Text>
            </Stack>)}

          {[{
          name: 'star',
          def: starDef
        }, {
          name: 'home',
          def: homeDef
        }, {
          name: 'bell',
          def: bellDef
        }].map(({
          name,
          def
        }) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {presets.map((p, i) => <div key={p.name} style={{
            display: 'flex',
            justifyContent: 'center',
            opacity: 0.3 + i * 0.175
          }}>
                  <SVGIcon icon={def} variation="linear" size="lg" strokeWidth={1.5 - i * 0.1} />
                </div>)}
            </Fragment>)}
        </div>

        <Text type="supporting">
          Note: opacity/stroke-width are used as visual placeholders here. The
          real implementation will modify path geometry, rounding corners,
          bowing segments, adjusting curve tension, all at build time via the
          theme pipeline.
        </Text>
      </Stack>;
  }
}`,...$.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => {
    const animStyles = \`
      @keyframes xif-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
      @keyframes xif-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes xif-scale { from { transform: scale(0); } to { transform: scale(1); } }
      @keyframes xif-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .xif-draw path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: xif-draw 1.2s ease-out forwards; }
      .xif-draw path:nth-child(2) { animation-delay: 0.4s; }
      .xif-fade path { opacity: 0; animation: xif-fade 0.6s ease-out forwards; }
      .xif-fade path:nth-child(2) { animation-delay: 0.3s; }
      .xif-scale path { transform-origin: center; transform: scale(0); animation: xif-scale 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .xif-scale path:nth-child(2) { animation-delay: 0.2s; }
      .xif-rotate { transform-origin: center; animation: xif-rotate 2s linear infinite; }
    \`;
    const demos = [{
      name: 'draw',
      desc: 'Stroke reveals along path',
      cls: 'xif-draw',
      paths: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0']
    }, {
      name: 'fade',
      desc: 'Opacity entrance per layer',
      cls: 'xif-fade',
      paths: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'M9 12l2 2 4-4']
    }, {
      name: 'scale',
      desc: 'Grow from center',
      cls: 'xif-scale',
      paths: ['M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z']
    }, {
      name: 'rotate',
      desc: 'Continuous spin',
      cls: 'xif-rotate',
      paths: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z']
    }];
    return <Stack direction="vertical" gap={3}>
        <style dangerouslySetInnerHTML={{
        __html: animStyles
      }} />
        <Heading level={3}>Animation Types (Live)</Heading>
        <Text type="supporting">
          Icons declare animation intent per path. The theme resolves timing.
          Each demo loops on page load.
        </Text>

        <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24
      }}>
          {demos.map(demo => <Stack key={demo.name} direction="vertical" gap={1} hAlign="center" style={{
          padding: 16
        }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={demo.cls}>
                {demo.paths.map((d, i) => <path key={i} d={d} />)}
              </svg>
              <Text type="label" style={{
            fontSize: 12,
            marginTop: 8
          }}>
                {demo.name}
              </Text>
              <Text type="supporting" style={{
            fontSize: 10,
            textAlign: 'center'
          }}>
                {demo.desc}
              </Text>
            </Stack>)}
        </div>
      </Stack>;
  }
}`,...F.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    // We can't use hooks in stories without a wrapper,
    // so we render multiple preset rows instead
    const roundingLevels = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const curvatureLevels = [0, 0.2, 0.5, 0.8, 1.0];
    const shapes = Object.entries(testShapes);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Path Transform Playground</Heading>
        <Text type="supporting">
          Live path manipulation with sagitta-corrected corner rounding. Sharp
          corners (like star tips) round less aggressively than gentle corners,
          achieving equal <em>perceived</em> roundness at all angles.
        </Text>

        {/* Corner Rounding */}
        <Heading level={4}>Corner Rounding (sagitta-corrected)</Heading>
        <Text type="supporting">
          Same cornerRounding value across all shapes. Sharp corners get less
          radius, gentle corners get more, visually balanced.
        </Text>
        <div style={{
        display: 'grid',
        gridTemplateColumns: \`80px repeat(\${roundingLevels.length}, 1fr)\`,
        gap: '8px 4px',
        alignItems: 'center'
      }}>
          <div />
          {roundingLevels.map(r => <Text key={r} type="label" style={{
          textAlign: 'center',
          fontSize: 10
        }}>
              {r}
            </Text>)}
          {shapes.map(([name, d]) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {roundingLevels.map(r => <div key={r} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={roundCorners(d, r)} />
                  </svg>
                </div>)}
            </Fragment>)}
        </div>

        <Divider />

        {/* Segment Curvature */}
        <Heading level={4}>Segment Curvature</Heading>
        <Text type="supporting">
          Straight line segments gain a perpendicular bow. Subtle at low values,
          pronounced at high.
        </Text>
        <div style={{
        display: 'grid',
        gridTemplateColumns: \`80px repeat(\${curvatureLevels.length}, 1fr)\`,
        gap: '8px 4px',
        alignItems: 'center'
      }}>
          <div />
          {curvatureLevels.map(c => <Text key={c} type="label" style={{
          textAlign: 'center',
          fontSize: 10
        }}>
              {c}
            </Text>)}
          {shapes.slice(0, 5).map(([name, d]) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {curvatureLevels.map(c => <div key={c} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={addCurvature(d, c)} />
                  </svg>
                </div>)}
            </Fragment>)}
        </div>

        <Divider />

        {/* Combined: Rounding + Curvature presets */}
        <Heading level={4}>
          Personality Presets (combined transforms)
        </Heading>
        <div style={{
        display: 'grid',
        gridTemplateColumns: \`80px repeat(5, 1fr)\`,
        gap: '8px 4px',
        alignItems: 'center'
      }}>
          <div />
          {[{
          label: 'Brutalist',
          r: 0,
          c: 0
        }, {
          label: 'Technical',
          r: 0.1,
          c: 0
        }, {
          label: 'Default',
          r: 0.25,
          c: 0.05
        }, {
          label: 'Friendly',
          r: 0.5,
          c: 0.15
        }, {
          label: 'Playful',
          r: 0.8,
          c: 0.3
        }].map(p => <Stack key={p.label} direction="vertical" hAlign="center" gap={0}>
              <Text type="label" style={{
            fontSize: 10
          }}>
                {p.label}
              </Text>
              <Text type="supporting" style={{
            fontSize: 8
          }}>
                r:{p.r} c:{p.c}
              </Text>
            </Stack>)}
          {shapes.map(([name, d]) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {[{
            r: 0,
            c: 0
          }, {
            r: 0.1,
            c: 0
          }, {
            r: 0.25,
            c: 0.05
          }, {
            r: 0.5,
            c: 0.15
          }, {
            r: 0.8,
            c: 0.3
          }].map((p, i) => {
            const transformed = applyPersonality(d, {
              cornerRounding: p.r,
              segmentCurvature: p.c
            });
            return <div key={i} style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={transformed} />
                    </svg>
                  </div>;
          })}
            </Fragment>)}
        </div>
      </Stack>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Interactive path transform playground.
Demonstrates corner rounding, segment curvature, and tension
with live SVG rendering.`,...C.parameters?.docs?.description}}};const me=["SpecExamples","CompositionSlots","PersonalityAxes","AnimationIntent","PathTransformPlayground"];export{F as AnimationIntent,H as CompositionSlots,C as PathTransformPlayground,$ as PersonalityAxes,P as SpecExamples,me as __namedExportsOrder,he as default};
