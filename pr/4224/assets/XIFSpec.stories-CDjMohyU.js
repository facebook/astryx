import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./Text-Bs-khaxO.js";import{t as i}from"./jsx-runtime-cM__dR4X.js";import{t as a}from"./Heading-wwoO6PX8.js";import{c as o}from"./Stack-mterni5z.js";import{t as s}from"./Text-DRSNMNB3.js";import{t as c}from"./Divider-DJaE3lwx.js";import{s as l}from"./iframe-CorsBOL8.js";import{Ht as u,t as d}from"./src-BUw88aC7.js";var f,p,m,h,g,_,v,y,b=t((()=>{f={name:`check`,paths:[{type:`path`,attrs:{d:`M5 13l4 4L19 7`},role:`stroke`}],tags:[`action`,`confirm`]},p={name:`home`,paths:[{type:`path`,attrs:{d:`M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z`},role:`fill`,layer:`primary`},{type:`path`,attrs:{d:`M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8`},role:`fill`,layer:`secondary`}],tags:[`navigation`]},m={name:`file`,paths:[{type:`path`,attrs:{d:`M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z`},role:`fill`,layer:`primary`},{type:`path`,attrs:{d:`M14 2v4a2 2 0 0 0 2 2h4`},role:`stroke`,layer:`secondary`}],slots:[{name:`badge`,position:{x:.5,y:.65},size:.35}],tags:[`file`,`document`]},h={name:`shield`,paths:[{type:`path`,attrs:{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`},role:`fill`,layer:`primary`}],slots:[{name:`badge`,position:`center`,size:.42}],tags:[`security`,`protection`]},g={name:`bell`,paths:[{type:`path`,attrs:{d:`M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9`},role:`fill`,layer:`primary`,animate:{type:`scale`,sequence:1}},{type:`path`,attrs:{d:`M10.3 21a1.94 1.94 0 0 0 3.4 0`},role:`stroke`,layer:`secondary`,animate:{type:`draw`,sequence:2}}],tags:[`notification`,`alert`]},_={name:`star`,paths:[{type:`path`,attrs:{d:`M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z`},role:`fill`,layer:`primary`,personality:{cornerRounding:0}}],tags:[`rating`,`favorite`]},v={name:`bell-override`,paths:[{type:`path`,attrs:{d:`M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9`},role:`fill`,layer:`primary`},{type:`path`,attrs:{d:`M10.3 21a1.94 1.94 0 0 0 3.4 0`},role:`stroke`,layer:`secondary`}],overrides:{bold:[{type:`path`,attrs:{d:`M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9`},role:`fill`,layer:`primary`},{type:`path`,attrs:{d:`M10.3 21a1.94 1.94 0 0 0 3.4 0`},role:`fill`,layer:`secondary`}]},tags:[`notification`]},y=[f,p,m,h,g,_,v]}));function x(e){let t=[],n=/([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g,r,i=0,a=0,o=0,s=0;for(;(r=n.exec(e))!==null;){let e=r[1],n=(r[2].match(/-?[\d.]+(?:e[+-]?\d+)?/gi)||[]).map(Number);switch(e){case`M`:i=n[0],a=n[1],o=i,s=a,t.push({type:`M`,x:i,y:a});for(let e=2;e<n.length;e+=2)i=n[e],a=n[e+1],t.push({type:`L`,x:i,y:a});break;case`m`:i+=n[0],a+=n[1],o=i,s=a,t.push({type:`M`,x:i,y:a});for(let e=2;e<n.length;e+=2)i+=n[e],a+=n[e+1],t.push({type:`L`,x:i,y:a});break;case`L`:for(let e=0;e<n.length;e+=2)i=n[e],a=n[e+1],t.push({type:`L`,x:i,y:a});break;case`l`:for(let e=0;e<n.length;e+=2)i+=n[e],a+=n[e+1],t.push({type:`L`,x:i,y:a});break;case`H`:for(let e=0;e<n.length;e++)i=n[e],t.push({type:`L`,x:i,y:a});break;case`h`:for(let e=0;e<n.length;e++)i+=n[e],t.push({type:`L`,x:i,y:a});break;case`V`:for(let e=0;e<n.length;e++)a=n[e],t.push({type:`L`,x:i,y:a});break;case`v`:for(let e=0;e<n.length;e++)a+=n[e],t.push({type:`L`,x:i,y:a});break;case`C`:for(let e=0;e<n.length;e+=6)t.push({type:`C`,x1:n[e],y1:n[e+1],x2:n[e+2],y2:n[e+3],x:n[e+4],y:n[e+5]}),i=n[e+4],a=n[e+5];break;case`c`:for(let e=0;e<n.length;e+=6)t.push({type:`C`,x1:i+n[e],y1:a+n[e+1],x2:i+n[e+2],y2:a+n[e+3],x:i+n[e+4],y:a+n[e+5]}),i+=n[e+4],a+=n[e+5];break;case`Q`:for(let e=0;e<n.length;e+=4)t.push({type:`Q`,cx:n[e],cy:n[e+1],x:n[e+2],y:n[e+3]}),i=n[e+2],a=n[e+3];break;case`q`:for(let e=0;e<n.length;e+=4)t.push({type:`Q`,cx:i+n[e],cy:a+n[e+1],x:i+n[e+2],y:a+n[e+3]}),i+=n[e+2],a+=n[e+3];break;case`A`:case`a`:{let r=e===`a`;for(let e=0;e<n.length;e+=7){let o=r?i+n[e+5]:n[e+5],s=r?a+n[e+6]:n[e+6];t.push({type:`A`,rx:n[e],ry:n[e+1],rotation:n[e+2],large:n[e+3],sweep:n[e+4],x:o,y:s}),i=o,a=s}break}case`S`:case`s`:break;case`T`:case`t`:break;case`Z`:case`z`:t.push({type:`Z`}),i=o,a=s;break}}return t}function S(e,t){return Math.sqrt((t.x-e.x)**2+(t.y-e.y)**2)}function C(e,t,n){return{x:e.x+(t.x-e.x)*n,y:e.y+(t.y-e.y)*n}}function w(e,t){let n=e.x*t.x+e.y*t.y,r=Math.sqrt(e.x**2+e.y**2),i=Math.sqrt(t.x**2+t.y**2);return r===0||i===0?Math.PI:Math.acos(Math.max(-1,Math.min(1,n/(r*i))))}function T(e){return e.type===`Z`?null:{x:e.x,y:e.y}}function E(e,t){if(t<=0)return e;t=Math.min(1,t);let n=x(e),r=[];for(let e=0;e<n.length;e++){let i=e>0?n[e-1]:null,a=n[e],o=e<n.length-1?n[e+1]:null;if(a.type===`Z`&&i&&(i.type===`L`||i.type===`Q`)){let o=e-1;for(;o>=0&&n[o].type!==`M`;)o--;if(o>=0){let e=n[o],s=T(e),c=T(i);if(!s||!c){r.push(a);continue}let l=o+1;for(;l<n.length&&n[l].type!==`L`;)l++;if(l<n.length){let e=T(n[l]);if(!e){r.push(a);continue}let i=S(c,s),o=S(s,e),u=Math.min(i,o)/2,d=1-w({x:c.x-s.x,y:c.y-s.y},{x:e.x-s.x,y:e.y-s.y})/Math.PI,f=u*t*d*.85;if(f>=.1){let t=f/i,n=f/o,a=C(s,c,t),l=C(s,e,n);r.push({type:`L`,x:a.x,y:a.y}),r.push({type:`Q`,cx:s.x,cy:s.y,x:l.x,y:l.y}),r.push({type:`Z`});continue}}}r.push(a);continue}if(a.type===`L`&&i&&(i.type===`L`||i.type===`M`||i.type===`Q`)&&o&&(o.type===`L`||o.type===`Z`)){let e=T(i);if(!e){r.push(a);continue}let s={x:a.x,y:a.y},c;if(o.type===`Z`){let e=n.find(e=>e.type===`M`);c=e?T(e):null}else c=T(o);if(!c){r.push(a);continue}let l=S(e,s),u=S(s,c),d=Math.min(l,u)/2,f=1-w({x:e.x-s.x,y:e.y-s.y},{x:c.x-s.x,y:c.y-s.y})/Math.PI,p=d*t*f*.85;if(p<.1){r.push(a);continue}let m=p/l,h=p/u,g=C(s,e,m),_=C(s,c,h);r.push({type:`L`,x:g.x,y:g.y}),r.push({type:`Q`,cx:s.x,cy:s.y,x:_.x,y:_.y})}else r.push(a)}return j(r)}function D(e,t){if(t<=0)return e;t=Math.min(1,t);let n=x(e),r=[];for(let e=0;e<n.length;e++){let i=e>0?n[e-1]:null,a=n[e];if(a.type===`L`&&i){let e=T(i);if(!e){r.push(a);continue}let n={x:a.x,y:a.y},o=S(e,n);if(o<2){r.push(a);continue}let s=C(e,n,.5),c=n.x-e.x,l=-(n.y-e.y)/o,u=c/o,d=o*t*.25,f={x:s.x+l*d,y:s.y+u*d};r.push({type:`Q`,cx:f.x,cy:f.y,x:n.x,y:n.y})}else r.push(a)}return j(r)}function O(e,t){if(t===.5)return e;let n=x(e),r=[],i=1.5-t;for(let e=0;e<n.length;e++){let t=e>0?n[e-1]:null,a=n[e];if(a.type===`C`&&t){let e=T(t)||{x:0,y:0},n={x:a.x,y:a.y},o={x:e.x+(a.x1-e.x)*i,y:e.y+(a.y1-e.y)*i},s={x:n.x+(a.x2-n.x)*i,y:n.y+(a.y2-n.y)*i};r.push({type:`C`,x1:o.x,y1:o.y,x2:s.x,y2:s.y,x:n.x,y:n.y})}else if(a.type===`Q`&&t){let e=T(t)||{x:0,y:0},n={x:a.x,y:a.y},o=C(e,n,.5),s={x:o.x+(a.cx-o.x)*i,y:o.y+(a.cy-o.y)*i};r.push({type:`Q`,cx:s.x,cy:s.y,x:n.x,y:n.y})}else r.push(a)}return j(r)}function k(e,t){let n=e;return t.cornerRounding!=null&&t.cornerRounding>0&&(n=E(n,t.cornerRounding)),t.segmentCurvature!=null&&t.segmentCurvature>0&&(n=D(n,t.segmentCurvature)),t.tension!=null&&t.tension!==.5&&(n=O(n,t.tension)),n}function A(e){return Number(e.toFixed(3)).toString()}function j(e){return e.map(e=>{switch(e.type){case`M`:return`M${A(e.x)} ${A(e.y)}`;case`L`:return`L${A(e.x)} ${A(e.y)}`;case`C`:return`C${A(e.x1)} ${A(e.y1)} ${A(e.x2)} ${A(e.y2)} ${A(e.x)} ${A(e.y)}`;case`Q`:return`Q${A(e.cx)} ${A(e.cy)} ${A(e.x)} ${A(e.y)}`;case`A`:return`A${A(e.rx)} ${A(e.ry)} ${A(e.rotation)} ${e.large} ${e.sweep} ${A(e.x)} ${A(e.y)}`;case`Z`:return`Z`}}).join(` `)}var M=t((()=>{}));function N(e){let t=e=>e.filter(e=>(e.type??`path`)!==`ellipse`).map(e=>({type:e.type??`path`,attrs:Object.fromEntries(Object.entries(e.attrs).map(([e,t])=>[e,String(t)])),role:e.role})),n=t(e.paths.filter(e=>(e.layer??`primary`)===`primary`)),r=t(e.paths.filter(e=>e.layer===`secondary`));return{name:e.name,viewBox:e.viewBox,primary:n,secondary:r.length>0?r:void 0}}var P,F,I,L,R,z,B,V,H,U,W;t((()=>{P=e(n()),d(),l(),s(),b(),F=i(),M(),I={title:`Lab/XIFSpec`},L=[`linear`,`bold`,`twotone`,`bulk`,`broken`],R={render:()=>(0,F.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,F.jsx)(a,{level:3,children:`XIF Spec Examples`}),(0,F.jsx)(r,{type:`supporting`,children:`Icons defined using the Astryx Icon Format specification. Each demonstrates a different capability: stroke-only, two-layer knockout, composable slots, animation declarations, personality overrides, and bold geometry overrides.`}),(0,F.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`140px repeat(${L.length}, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,F.jsx)(`div`,{}),L.map(e=>(0,F.jsx)(r,{type:`label`,style:{textAlign:`center`,fontSize:10},children:e},e)),y.map(e=>{let t=N(e),n=[];return e.slots?.length&&n.push(`🔌 slots`),e.paths.some(e=>e.animate)&&n.push(`✨ animated`),e.paths.some(e=>e.personality)&&n.push(`🎨 personality`),e.overrides&&n.push(`🔀 overrides`),e.paths.some(e=>e.layer===`secondary`)&&n.push(`📐 two-layer`),(0,F.jsxs)(P.Fragment,{children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(r,{type:`label`,style:{fontSize:11},children:e.name}),n.length>0&&(0,F.jsx)(r,{type:`supporting`,style:{fontSize:9,marginTop:2},children:n.join(` `)})]}),L.map(n=>(0,F.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,F.jsx)(u,{icon:t,variation:n,size:`lg`})},`${e.name}-${n}`))]},e.name)})]})]})},z={render:()=>{let e=N(h),t=N(m),n={name:`shield-check`,primary:[...e.primary],secondary:[{type:`path`,attrs:{d:`M9 13l2 2 4-4`},role:`stroke`}]},i={name:`shield-x`,primary:[...e.primary],secondary:[{type:`path`,attrs:{d:`M9 9l6 6M15 9l-6 6`},role:`stroke`}]},s={name:`file-text`,primary:[...t.primary],secondary:[...t.secondary??[],{type:`line`,attrs:{x1:`9`,y1:`13`,x2:`15`,y2:`13`},role:`stroke`},{type:`line`,attrs:{x1:`9`,y1:`17`,x2:`13`,y2:`17`},role:`stroke`}]};return(0,F.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,F.jsx)(a,{level:3,children:`Composition via Slots`}),(0,F.jsxs)(r,{type:`supporting`,children:[`Icons with `,(0,F.jsx)(`code`,{children:`slots`}),` accept sub-icons. One shield base + different badges = many composed icons without extra path data.`]}),(0,F.jsx)(o,{direction:`horizontal`,gap:4,children:[{label:`shield (base)`,def:e},{label:`shield-check`,def:n},{label:`shield-x`,def:i},{label:`file (base)`,def:t},{label:`file-text`,def:s}].map(({label:e,def:t})=>(0,F.jsxs)(o,{direction:`vertical`,gap:1,hAlign:`center`,children:[(0,F.jsxs)(o,{direction:`horizontal`,gap:2,children:[(0,F.jsx)(u,{icon:t,variation:`linear`,size:`lg`}),(0,F.jsx)(u,{icon:t,variation:`bold`,size:`lg`})]}),(0,F.jsx)(r,{type:`supporting`,style:{fontSize:10},children:e})]},e))}),(0,F.jsx)(c,{}),(0,F.jsx)(a,{level:4,children:`Slot Definition`}),(0,F.jsxs)(r,{type:`supporting`,children:[`The shield icon defines:`,` `,(0,F.jsx)(`code`,{children:`slots: [{ name: 'badge', position: 'center', size: 0.42 }]`}),`. At render time, the component scales and positions the badge icon into the slot. The badge inherits the parent's variation and color.`]})]})}},B={render:()=>{let e=N(_),t=N(p),n=N(g),i=[{name:`Brutalist`,desc:`Sharp corners, straight lines, tight curves`},{name:`Technical`,desc:`Minimal rounding, precise geometry`},{name:`Default`,desc:`Balanced — slight softening`},{name:`Friendly`,desc:`Rounded corners, subtle curves`},{name:`Playful`,desc:`Very rounded, bowed segments`}];return(0,F.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,F.jsx)(a,{level:3,children:`Personality Axes (Conceptual)`}),(0,F.jsxs)(r,{type:`supporting`,children:[`Shape personality parameters adjust the `,(0,F.jsx)(`em`,{children:`feel`}),` of icons without changing their structure. All adjustments are relative, preserving the artist's hierarchy of sharp vs soft. These icons show the concept; path manipulation is not yet implemented.`]}),(0,F.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`120px repeat(5, 1fr)`,gap:`12px 8px`,alignItems:`center`},children:[(0,F.jsx)(`div`,{}),i.map(e=>(0,F.jsxs)(o,{direction:`vertical`,gap:0,hAlign:`center`,children:[(0,F.jsx)(r,{type:`label`,style:{fontSize:10},children:e.name}),(0,F.jsx)(r,{type:`supporting`,style:{fontSize:8},children:e.desc})]},e.name)),[{name:`star`,def:e},{name:`home`,def:t},{name:`bell`,def:n}].map(({name:e,def:t})=>(0,F.jsxs)(P.Fragment,{children:[(0,F.jsx)(r,{type:`label`,style:{fontSize:11},children:e}),i.map((e,n)=>(0,F.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`,opacity:.3+n*.175},children:(0,F.jsx)(u,{icon:t,variation:`linear`,size:`lg`,strokeWidth:1.5-n*.1})},e.name))]},e))]}),(0,F.jsx)(r,{type:`supporting`,children:`Note: opacity/stroke-width are used as visual placeholders here. The real implementation will modify path geometry, rounding corners, bowing segments, adjusting curve tension, all at build time via the theme pipeline.`})]})}},V={render:()=>(0,F.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,F.jsx)(`style`,{dangerouslySetInnerHTML:{__html:`
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
    `}}),(0,F.jsx)(a,{level:3,children:`Animation Types (Live)`}),(0,F.jsx)(r,{type:`supporting`,children:`Icons declare animation intent per path. The theme resolves timing. Each demo loops on page load.`}),(0,F.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(4, 1fr)`,gap:24},children:[{name:`draw`,desc:`Stroke reveals along path`,cls:`xif-draw`,paths:[`M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9`,`M10.3 21a1.94 1.94 0 0 0 3.4 0`]},{name:`fade`,desc:`Opacity entrance per layer`,cls:`xif-fade`,paths:[`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,`M9 12l2 2 4-4`]},{name:`scale`,desc:`Grow from center`,cls:`xif-scale`,paths:[`M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z`]},{name:`rotate`,desc:`Continuous spin`,cls:`xif-rotate`,paths:[`M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z`]}].map(e=>(0,F.jsxs)(o,{direction:`vertical`,gap:1,hAlign:`center`,style:{padding:16},children:[(0,F.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 24 24`,width:`48`,height:`48`,fill:`none`,stroke:`currentColor`,strokeWidth:1.5,strokeLinecap:`round`,strokeLinejoin:`round`,className:e.cls,children:e.paths.map((e,t)=>(0,F.jsx)(`path`,{d:e},t))}),(0,F.jsx)(r,{type:`label`,style:{fontSize:12,marginTop:8},children:e.name}),(0,F.jsx)(r,{type:`supporting`,style:{fontSize:10,textAlign:`center`},children:e.desc})]},e.name))})]})},H={square:`M4 4 L20 4 L20 20 L4 20 Z`,diamond:`M12 2 L22 12 L12 22 L2 12 Z`,arrow:`M12 2 L20 10 L16 10 L16 22 L8 22 L8 10 L4 10 Z`,star:`M12 2 L14.5 8.5 L21.5 9.5 L16.3 14.5 L17.6 21.5 L12 18 L6.4 21.5 L7.7 14.5 L2.5 9.5 L9.5 8.5 Z`,bell:`M4 17 L4 9 L8 5 L12 3 L16 5 L20 9 L20 17 Z`,envelope:`M2 6 L12 13 L22 6 L22 18 L2 18 Z`,chat:`M3 4 L21 4 L21 16 L13 16 L8 21 L8 16 L3 16 Z`,shield:`M4 5 L12 2 L20 5 L20 13 L12 22 L4 13 Z`,hexagon:`M12 2 L20.5 6.5 L20.5 15.5 L12 20 L3.5 15.5 L3.5 6.5 Z`,bookmark:`M6 2 L18 2 L18 22 L12 17 L6 22 Z`},U={render:()=>{let e=[0,.2,.4,.6,.8,1],t=[0,.2,.5,.8,1],n=Object.entries(H);return(0,F.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,F.jsx)(a,{level:3,children:`Path Transform Playground`}),(0,F.jsxs)(r,{type:`supporting`,children:[`Live path manipulation with sagitta-corrected corner rounding. Sharp corners (like star tips) round less aggressively than gentle corners, achieving equal `,(0,F.jsx)(`em`,{children:`perceived`}),` roundness at all angles.`]}),(0,F.jsx)(a,{level:4,children:`Corner Rounding (sagitta-corrected)`}),(0,F.jsx)(r,{type:`supporting`,children:`Same cornerRounding value across all shapes. Sharp corners get less radius, gentle corners get more, visually balanced.`}),(0,F.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`80px repeat(${e.length}, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,F.jsx)(`div`,{}),e.map(e=>(0,F.jsx)(r,{type:`label`,style:{textAlign:`center`,fontSize:10},children:e},e)),n.map(([t,n])=>(0,F.jsxs)(P.Fragment,{children:[(0,F.jsx)(r,{type:`label`,style:{fontSize:11},children:t}),e.map(e=>(0,F.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,F.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`40`,height:`40`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,F.jsx)(`path`,{d:E(n,e)})})},e))]},t))]}),(0,F.jsx)(c,{}),(0,F.jsx)(a,{level:4,children:`Segment Curvature`}),(0,F.jsx)(r,{type:`supporting`,children:`Straight line segments gain a perpendicular bow. Subtle at low values, pronounced at high.`}),(0,F.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`80px repeat(${t.length}, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,F.jsx)(`div`,{}),t.map(e=>(0,F.jsx)(r,{type:`label`,style:{textAlign:`center`,fontSize:10},children:e},e)),n.slice(0,5).map(([e,n])=>(0,F.jsxs)(P.Fragment,{children:[(0,F.jsx)(r,{type:`label`,style:{fontSize:11},children:e}),t.map(e=>(0,F.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,F.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`40`,height:`40`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,F.jsx)(`path`,{d:D(n,e)})})},e))]},e))]}),(0,F.jsx)(c,{}),(0,F.jsx)(a,{level:4,children:`Personality Presets (combined transforms)`}),(0,F.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`80px repeat(5, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,F.jsx)(`div`,{}),[{label:`Brutalist`,r:0,c:0},{label:`Technical`,r:.1,c:0},{label:`Default`,r:.25,c:.05},{label:`Friendly`,r:.5,c:.15},{label:`Playful`,r:.8,c:.3}].map(e=>(0,F.jsxs)(o,{direction:`vertical`,hAlign:`center`,gap:0,children:[(0,F.jsx)(r,{type:`label`,style:{fontSize:10},children:e.label}),(0,F.jsxs)(r,{type:`supporting`,style:{fontSize:8},children:[`r:`,e.r,` c:`,e.c]})]},e.label)),n.map(([e,t])=>(0,F.jsxs)(P.Fragment,{children:[(0,F.jsx)(r,{type:`label`,style:{fontSize:11},children:e}),[{r:0,c:0},{r:.1,c:0},{r:.25,c:.05},{r:.5,c:.15},{r:.8,c:.3}].map((e,n)=>(0,F.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,F.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`40`,height:`40`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,F.jsx)(`path`,{d:k(t,{cornerRounding:e.r,segmentCurvature:e.c})})})},n))]},e))]})]})}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source},description:{story:`Interactive path transform playground.
Demonstrates corner rounding, segment curvature, and tension
with live SVG rendering.`,...U.parameters?.docs?.description}}},W=[`SpecExamples`,`CompositionSlots`,`PersonalityAxes`,`AnimationIntent`,`PathTransformPlayground`]}))();export{V as AnimationIntent,z as CompositionSlots,U as PathTransformPlayground,B as PersonalityAxes,R as SpecExamples,W as __namedExportsOrder,I as default};