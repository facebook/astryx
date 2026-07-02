import{a1 as r,ah as b}from"./iframe-DVtWfngO.js";import{u as ue,C as j,a as w,b as L,c as Q}from"./bar-D0VVtiME.js";import{a as be}from"./area-C5zWI711.js";import{m as ve}from"./monotone-BKrwi6Sb.js";import{l as ee}from"./line-D_0OSYh6.js";import{m as re,a as te,g as oe,c as ne,s as ae,h as se,P as Ae}from"./webgl-B2CDFegl.js";import{b as we}from"./ChartContext-D0irdEe5.js";import"./preload-helper-Ct5FWWRu.js";import"./linear-gs3faI6G.js";import"./array-2GBN5xbU.js";import"./ChartLegend-dOgF6LpM.js";import"./ChartSwatch-CUPSiIA1.js";import"./HStack-BqPpzmPe.js";import"./Stack-BrtSPKVR.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./VStack-CGn3zjL6.js";import"./index-BkVtLrZ4.js";import"./index-DpWozXzv.js";import"./step-fxRLXcQr.js";function Z(e){const t=e.color??"var(--color-chart-1)",u=e.opacity??.15;return{type:"band",key:`band-${e.upper}-${e.lower}`,dataKeys:[e.upper,e.lower],layout:{},resolve(a){const{data:o,xKey:c,xScale:h,yScale:i}=a,d=[];for(let f=0;f<o.length;f++){const m=o[f];let y;"bandwidth"in h?y=(h(String(m[c]))??0)+h.bandwidth()/2:y=h(m[c]);const l=typeof m[e.upper]=="number"?m[e.upper]:0,g=typeof m[e.lower]=="number"?m[e.lower]:0;d.push({px:y,py:i(l),py0:i(g),dataIndex:f})}return d},render(a){if(a.length===0)return null;const c=be().x(h=>h.px).y0(h=>h.py0).y1(h=>h.py).curve(ve)(a)??"";return r.jsx("path",{d:c,fill:t,fillOpacity:u,stroke:"none"})}}}function de(e){const t=e.upColor??"var(--color-positive)",u=e.downColor??"var(--color-negative)";return{type:"candlestick",key:`ohlc-${e.close}`,dataKeys:[e.open,e.high,e.low,e.close],layout:{},resolve(a){const{data:o,xKey:c,xScale:h,yScale:i}=a,d=[];for(let f=0;f<o.length;f++){const m=o[f];let y;"bandwidth"in h?y=(h(String(m[c]))??0)+h.bandwidth()/2:y=h(m[c]);const l=typeof m[e.close]=="number"?m[e.close]:0;d.push({px:y,py:i(l),py0:i(0),dataIndex:f})}return d},render(a,o){const{data:c,xScale:h,yScale:i}=o;if(!("bandwidth"in h))return null;const f=h.bandwidth()*.6;return r.jsx("g",{children:a.map((m,y)=>{const l=c[m.dataIndex],g=typeof l[e.open]=="number"?l[e.open]:0,p=typeof l[e.close]=="number"?l[e.close]:0,v=typeof l[e.high]=="number"?l[e.high]:0,x=typeof l[e.low]=="number"?l[e.low]:0,n=p>=g?t:u;return r.jsxs("g",{children:[r.jsx("line",{x1:m.px,x2:m.px,y1:i(v),y2:i(x),stroke:n,strokeWidth:1}),r.jsx("rect",{x:m.px-f/2,y:i(Math.max(g,p)),width:f,height:Math.max(1,Math.abs(i(g)-i(p))),fill:n})]},y)})})}}}function fe(e){const{high:t,low:u}=e,a=e.color??"var(--color-text-primary)",o=e.strokeWidth??1.5,c=e.capWidth??8;return{type:"errorBar",key:`errorBar-${t}-${u}`,dataKeys:[t,u],layout:{},resolve(h){const{data:i,xKey:d,xScale:f,yScale:m}=h,y=[];for(let l=0;l<i.length;l++){const g=i[l];let p;"bandwidth"in f?p=(f(String(g[d]))??0)+f.bandwidth()/2:p=f(g[d]);const v=typeof g[t]=="number"?g[t]:0,x=typeof g[u]=="number"?g[u]:0;y.push({px:p,py:m(v),py0:m(x),dataIndex:l})}return y},render(h){const i=c/2;return r.jsx("g",{children:h.map((d,f)=>r.jsxs("g",{children:[r.jsx("line",{x1:d.px,x2:d.px,y1:d.py,y2:d.py0,stroke:a,strokeWidth:o}),r.jsx("line",{x1:d.px-i,x2:d.px+i,y1:d.py,y2:d.py,stroke:a,strokeWidth:o}),r.jsx("line",{x1:d.px-i,x2:d.px+i,y1:d.py0,y2:d.py0,stroke:a,strokeWidth:o})]},f))})}}}function $(e){const t=e.color??"var(--color-border-emphasized)",u=e.strokeWidth??1,a=e.strokeDasharray??"6 3",o=e.label,c=e.labelPosition??"end",h=e.bandOpacity??.1,i=14,d=3,f=10;return{type:"referenceLine",key:`ref-${e.y??e.x??"none"}`,dataKeys:[],layout:{},resolve(){return[]},render(m,y){const{width:l,height:g,xScale:p,yScale:v}=y;if(e.y!=null){const x=v(e.y),s=o?o.length*5.5+8:0,n=c==="end"?l-s-2:2;if(e.y2!=null){const A=v(e.y2),R=Math.min(x,A),C=Math.abs(A-x);return r.jsxs("g",{children:[r.jsx("rect",{x:0,y:R,width:l,height:C,fill:t,opacity:h}),r.jsx("line",{x1:0,x2:l,y1:x,y2:x,stroke:t,strokeWidth:u,strokeDasharray:a}),r.jsx("line",{x1:0,x2:l,y1:A,y2:A,stroke:t,strokeWidth:u,strokeDasharray:a}),o&&r.jsxs("g",{transform:`translate(${n},${x})`,pointerEvents:"none",children:[r.jsx("rect",{x:0,y:-i/2,width:s,height:i,rx:d,fill:"var(--color-background-popover)",fillOpacity:.85,stroke:t,strokeWidth:.5}),r.jsx("text",{x:s/2,dy:"0.35em",textAnchor:"middle",fontSize:f,fontWeight:500,fill:t,children:o})]})]})}return r.jsxs("g",{children:[r.jsx("line",{x1:0,x2:l,y1:x,y2:x,stroke:t,strokeWidth:u,strokeDasharray:a}),o&&r.jsxs("g",{transform:`translate(${n},${x})`,pointerEvents:"none",children:[r.jsx("rect",{x:0,y:-i/2,width:s,height:i,rx:d,fill:"var(--color-background-popover)",fillOpacity:.85,stroke:t,strokeWidth:.5}),r.jsx("text",{x:s/2,dy:"0.35em",textAnchor:"middle",fontSize:f,fontWeight:500,fill:t,children:o})]})]})}if(e.x!=null&&!("bandwidth"in p)){const x=p(e.x),s=o?o.length*5.5+8:0,n=c==="end"?4:g-i-4;return r.jsxs("g",{children:[r.jsx("line",{x1:x,x2:x,y1:0,y2:g,stroke:t,strokeWidth:u,strokeDasharray:a}),o&&r.jsxs("g",{transform:`translate(${x-s/2},${n})`,pointerEvents:"none",children:[r.jsx("rect",{x:0,y:0,width:s,height:i,rx:d,fill:"var(--color-background-popover)",fillOpacity:.85,stroke:t,strokeWidth:.5}),r.jsx("text",{x:s/2,y:i/2,dy:"0.35em",textAnchor:"middle",fontSize:f,fontWeight:500,fill:t,children:o})]})]})}return null}}}const Re=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size * ${Ae.toFixed(6)};
  }
`,Ce=`
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float a = u_opacity * edge;
    gl_FragColor = vec4(u_color * a, a);
  }
`;function je({resolved:e,color:t,size:u,opacity:a,width:o,height:c}){const{svgRef:h}=ue(),i=b.useRef(null),d=b.useRef(null),f=b.useRef(null),m=b.useRef(null),y=b.useCallback(()=>{const l=[];for(const g of e)l.push(g.px,g.py);return new Float32Array(l)},[e]);return b.useEffect(()=>{const l=m.current;if(l)return i.current||(i.current=document.createElement("canvas")),re(l,i.current,o,c)},[o,c]),b.useEffect(()=>{const l=i.current;if(!l||o<=0||c<=0)return;const g=te(l,o,c);d.current||(d.current=oe(l));const p=d.current;if(!p)return;f.current||(f.current=ne(p,Re,Ce));const v=f.current;if(!v)return;p.viewport(0,0,l.width,l.height),ae(p),p.useProgram(v);const x=y(),s=p.createBuffer();p.bindBuffer(p.ARRAY_BUFFER,s),p.bufferData(p.ARRAY_BUFFER,x,p.STATIC_DRAW);const n=p.getAttribLocation(v,"a_position");p.enableVertexAttribArray(n),p.vertexAttribPointer(n,2,p.FLOAT,!1,0,0);const[A,R,C]=se(t);p.uniform2f(p.getUniformLocation(v,"u_resolution"),o,c),p.uniform3f(p.getUniformLocation(v,"u_color"),A,R,C),p.uniform1f(p.getUniformLocation(v,"u_size"),u*g),p.uniform1f(p.getUniformLocation(v,"u_opacity"),a),p.drawArrays(p.POINTS,0,x.length/2),p.deleteBuffer(s)},[o,c,t,u,a,y]),o<=0||c<=0?null:r.jsx("g",{ref:m})}function _e(e,t){const{color:u}=t,a=t.size??6,o=t.opacity??.8;return{type:"dotGL",key:e,dataKeys:[e],layout:{},resolve(c){const{data:h,xKey:i,xScale:d,yScale:f}=c,m=[];for(let y=0;y<h.length;y++){const l=h[y];let g;"bandwidth"in d?g=(d(String(l[i]))??0)+d.bandwidth()/2:g=d(l[i]);const p=typeof l[e]=="number"?l[e]:0;m.push({px:g,py:f(p),py0:f(0),dataIndex:y})}return m},render(c,h){return r.jsx(je,{resolved:c,color:u,size:a,opacity:o,width:h.width,height:h.height})}}}const Le=`
  attribute vec2 a_position;
  attribute vec3 a_color;
  uniform vec2 u_resolution;
  varying vec3 v_color;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_color = a_color;
  }
`,ke=`
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;function Me(e,t){const u=Math.max(0,Math.min(1,t));if(e.length===1)return e[0];const a=u*(e.length-1),o=Math.floor(a),c=Math.min(o+1,e.length-1),h=a-o;return[e[o][0]+h*(e[c][0]-e[o][0]),e[o][1]+h*(e[c][1]-e[o][1]),e[o][2]+h*(e[c][2]-e[o][2])]}function Se({data:e,xKey:t,yKey:u,valueKey:a,xScale:o,colorRange:c,domain:h,cellGap:i,width:d,height:f}){const m=b.useRef(null),y=b.useRef(null),l=b.useRef(null),g=b.useRef(null),p=b.useMemo(()=>c.map(se),[c]),v=b.useMemo(()=>{const s=[...new Set(e.map(n=>String(n[u])))];return we().domain(s).range([0,f]).padding(.05)},[e,u,f]),x=b.useMemo(()=>{if(h)return h;let s=1/0,n=-1/0;for(const A of e){const R=A[a];typeof R=="number"&&(R<s&&(s=R),R>n&&(n=R))}return[s,n]},[e,a,h]);return b.useEffect(()=>{const s=g.current;if(s)return m.current||(m.current=document.createElement("canvas")),re(s,m.current,d,f)},[d,f]),b.useEffect(()=>{const s=m.current;if(!s||d<=0||f<=0)return;te(s,d,f),y.current||(y.current=oe(s));const n=y.current;if(!n)return;l.current||(l.current=ne(n,Le,ke));const A=l.current;if(!A)return;n.viewport(0,0,s.width,s.height),ae(n),n.useProgram(A);const R=[],C=[],[I,M]=x,O=M-I||1,k=i,H=o.bandwidth(),U=v.bandwidth();for(const P of e){const V=o(String(P[t])),Y=v(String(P[u]));if(V==null||Y==null)continue;const me=((typeof P[a]=="number"?P[a]:0)-I)/O,[xe,ye,ge]=Me(p,me),z=V+k/2,N=V+H-k/2,J=Y+k/2,X=Y+U-k/2;R.push(z,J,N,J,z,X,N,J,N,X,z,X);for(let le=0;le<6;le++)C.push(xe,ye,ge)}const _=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,_),n.bufferData(n.ARRAY_BUFFER,new Float32Array(R),n.STATIC_DRAW);const S=n.getAttribLocation(A,"a_position");n.enableVertexAttribArray(S),n.vertexAttribPointer(S,2,n.FLOAT,!1,0,0);const ce=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,ce),n.bufferData(n.ARRAY_BUFFER,new Float32Array(C),n.STATIC_DRAW);const ie=n.getAttribLocation(A,"a_color");n.enableVertexAttribArray(ie),n.vertexAttribPointer(ie,3,n.FLOAT,!1,0,0),n.uniform2f(n.getUniformLocation(A,"u_resolution"),d,f),n.drawArrays(n.TRIANGLES,0,R.length/2),n.deleteBuffer(_),n.deleteBuffer(ce)},[e,t,u,a,o,v,d,f,x,p,i]),d<=0||f<=0?null:r.jsx("g",{ref:g})}function Fe(e){const{xKey:t,yKey:u,valueKey:a,colorRange:o}=e,c=e.cellGap??1;return{type:"heatmapGL",key:`heatmap-${a}`,dataKeys:[a],layout:{},resolve(h){const{data:i,xScale:d,yScale:f}=h,m=[];if(!("bandwidth"in d))return m;for(let y=0;y<i.length;y++){const l=i[y],g=(d(String(l[t]))??0)+d.bandwidth()/2,p=typeof l[a]=="number"?l[a]:0;m.push({px:g,py:f(p),py0:f(0),dataIndex:y})}return m},render(h,i){return"bandwidth"in i.xScale?r.jsx(Se,{data:i.data,xKey:t,yKey:u,valueKey:a,xScale:i.xScale,colorRange:o,domain:e.domain,cellGap:c,width:i.width,height:i.height}):null}}}const Ge=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`,We=`
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    float a = u_opacity;
    gl_FragColor = vec4(u_color * a, a);
  }
`;function Be({color:e,bufferSize:t,lineWidth:u,opacity:a,width:o,height:c,handleRef:h}){const{xScale:i,yScale:d}=ue(),f=b.useRef(null),m=b.useRef(null),y=b.useRef(null),l=b.useRef(null),g=b.useRef(null),p=b.useRef({data:new Float32Array(t*2),head:0,count:0});b.useEffect(()=>{const x=g.current;if(x)return f.current||(f.current=document.createElement("canvas")),re(x,f.current,o,c)},[o,c]),b.useEffect(()=>{const x=f.current;!x||o<=0||c<=0||te(x,o,c)},[o,c]);const v=b.useCallback(()=>{const x=f.current;if(!x)return;m.current||(m.current=oe(x));const s=m.current;if(!s)return;y.current||(y.current=ne(s,Ge,We));const n=y.current;if(!n)return;l.current||(l.current=s.createBuffer());const{data:A,head:R,count:C}=p.current;if(C<2)return;const I=i,M=new Float32Array(C*2);for(let _=0;_<C;_++){const S=(R-C+_+t)%t*2;M[_*2]=I(A[S]),M[_*2+1]=d(A[S+1])}s.viewport(0,0,x.width,x.height),ae(s),s.useProgram(n),s.bindBuffer(s.ARRAY_BUFFER,l.current),s.bufferData(s.ARRAY_BUFFER,M,s.DYNAMIC_DRAW);const O=s.getAttribLocation(n,"a_position");s.enableVertexAttribArray(O),s.vertexAttribPointer(O,2,s.FLOAT,!1,0,0);const[k,H,U]=se(e);s.uniform2f(s.getUniformLocation(n,"u_resolution"),o,c),s.uniform3f(s.getUniformLocation(n,"u_color"),k,H,U),s.uniform1f(s.getUniformLocation(n,"u_opacity"),a),s.lineWidth(u),s.drawArrays(s.LINE_STRIP,0,C)},[o,c,e,u,a,t,i,d]);return b.useImperativeHandle(h,()=>({push(x,s){const n=p.current,A=n.head*2;n.data[A]=x,n.data[A+1]=s,n.head=(n.head+1)%t,n.count=Math.min(n.count+1,t),v()},clear(){p.current.head=0,p.current.count=0;const x=m.current;x&&(x.clearColor(0,0,0,0),x.clear(x.COLOR_BUFFER_BIT))}}),[t,v]),o<=0||c<=0?null:r.jsx("g",{ref:g})}function Ee(e){const{color:t}=e,u=e.bufferSize??500,a=e.lineWidth??2,o=e.opacity??1,c=e.handleRef;return{type:"streamGL",key:"stream",dataKeys:[],layout:{},resolve(){return[]},render(h,i){return r.jsx(Be,{color:t,bufferSize:u,lineWidth:a,opacity:o,width:i.width,height:i.height,handleRef:c})}}}const sr={title:"Lab/ChartV2Advanced",component:j},q=Array.from({length:30},(e,t)=>{const u=100+Math.sin(t/5)*20+t*.5,a=u+(Math.random()-.5)*8,o=u+(Math.random()-.5)*8;return{day:`Day ${t+1}`,open:Math.round(a*10)/10,close:Math.round(o*10)/10,high:Math.round(Math.max(a,o,u+Math.random()*10)*10)/10,low:Math.round(Math.min(a,o,u-Math.random()*10)*10)/10,volume:Math.round(500+Math.random()*1e3)}}),Ke=Array.from({length:20},(e,t)=>{const u=t,a=30+t*2+Math.sin(t/3)*5;return{x:u,mean:Math.round(a*10)/10,upper95:Math.round((a+8+t*.3)*10)/10,lower95:Math.round((a-8-t*.3)*10)/10,upper80:Math.round((a+4+t*.15)*10)/10,lower80:Math.round((a-4-t*.15)*10)/10}}),pe=[{month:"Jan",sales:45,target:50,errorHigh:48,errorLow:42},{month:"Feb",sales:52,target:50,errorHigh:56,errorLow:48},{month:"Mar",sales:48,target:50,errorHigh:52,errorLow:44},{month:"Apr",sales:61,target:50,errorHigh:66,errorLow:56},{month:"May",sales:55,target:50,errorHigh:59,errorLow:51},{month:"Jun",sales:70,target:50,errorHigh:76,errorLow:64}],De=Array.from({length:200},e=>({x:Math.random()*100,y:Math.random()*100})),he=[],Te=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];for(const e of Te)for(let t=0;t<24;t++)he.push({hour:`${t}`,day:e,traffic:Math.round(50+Math.sin(t/4)*30+(e==="Sat"||e==="Sun"?-20:10)+Math.random()*20)});const F={render:()=>r.jsx(j,{data:q,xKey:"day",series:[de({open:"open",high:"high",low:"low",close:"close",upColor:"#22c55e",downColor:"#ef4444"})],grid:r.jsx(L,{}),axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:350})},G={name:"Financial (Candlestick + MA + Volume)",render:()=>{const e=b.useMemo(()=>{let t=0;return q.map((u,a)=>(t+=u.close,{...u,ma5:a>=4?Math.round((t-q.slice(0,a-4).reduce((o,c)=>o+c.close,0))/5*10)/10:void 0}))},[]);return r.jsx(j,{data:e,xKey:"day",series:[de({open:"open",high:"high",low:"low",close:"close",upColor:"#22c55e",downColor:"#ef4444"}),ee("ma5",{color:"#f59e0b",strokeWidth:1.5}),Q("volume",{color:"#94a3b8",opacity:.3})],grid:r.jsx(L,{}),axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:400})}},W={render:()=>r.jsx(j,{data:Ke,xKey:"x",series:[Z({upper:"upper95",lower:"lower95",color:"#3b82f6",opacity:.1}),Z({upper:"upper80",lower:"lower80",color:"#3b82f6",opacity:.2}),ee("mean",{color:"#3b82f6",strokeWidth:2})],grid:r.jsx(L,{}),axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:300})},B={name:"Error Bars + Reference Line",render:()=>r.jsx(j,{data:pe,xKey:"month",series:[Q("sales",{color:"#3b82f6"}),fe({high:"errorHigh",low:"errorLow",color:"#1e3a5f"}),$({y:50,label:"Target",color:"#ef4444"}),$({y:40,y2:60,label:"Acceptable",color:"#22c55e",bandOpacity:.1})],grid:r.jsx(L,{}),axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:300})},E={name:"WebGL Scatter (dotGL)",render:()=>r.jsx(j,{data:De,xKey:"x",series:[_e("y",{color:"#3b82f6",size:4})],grid:r.jsx(L,{horizontal:!0,vertical:!0}),axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:400})},K={name:"WebGL Heatmap",render:()=>r.jsx(j,{data:he,xKey:"hour",series:[Fe({xKey:"hour",yKey:"day",valueKey:"traffic",colorRange:["#eff6ff","#1e40af"]})],axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:280})},D={name:"Streaming (streamGL)",render:()=>{const e=b.useRef(null);return b.useEffect(()=>{let t=0;const u=setInterval(()=>{e.current?.push(t,50+Math.sin(t/10)*30+Math.random()*10),t++},200);return()=>clearInterval(u)},[]),r.jsx(j,{data:[],xKey:"x",series:[Ee({handleRef:e,color:"#3b82f6"})],grid:r.jsx(L,{}),axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:300})}},T={name:"Kitchen Sink",render:()=>{const e=pe.map((t,u,a)=>({...t,runAvg:Math.round(a.slice(0,u+1).reduce((o,c)=>o+c.sales,0)/(u+1)*10)/10,upper:Math.round((a.slice(0,u+1).reduce((o,c)=>o+c.sales,0)/(u+1)+8)*10)/10,lower:Math.round((a.slice(0,u+1).reduce((o,c)=>o+c.sales,0)/(u+1)-8)*10)/10}));return r.jsx(j,{data:e,xKey:"month",series:[$({y:40,y2:60,color:"#22c55e",bandOpacity:.08}),$({y:50,label:"Target",color:"#ef4444"}),Z({upper:"upper",lower:"lower",color:"#f59e0b",opacity:.15}),Q("sales",{color:"#3b82f6"}),fe({high:"errorHigh",low:"errorLow",color:"#1e3a5f"}),ee("runAvg",{color:"#f59e0b",strokeWidth:2})],grid:r.jsx(L,{}),axes:r.jsxs(r.Fragment,{children:[r.jsx(w,{position:"bottom"}),r.jsx(w,{position:"left"})]}),height:400})}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={stockData} xKey="day" series={[candlestick({
    open: 'open',
    high: 'high',
    low: 'low',
    close: 'close',
    upColor: '#22c55e',
    downColor: '#ef4444'
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={350} />
}`,...F.parameters?.docs?.source},description:{story:"Candlestick chart",...F.parameters?.docs?.description}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Financial (Candlestick + MA + Volume)',
  render: () => {
    const data = useMemo(() => {
      let sum = 0;
      return stockData.map((d, i) => {
        sum += d.close;
        return {
          ...d,
          ma5: i >= 4 ? Math.round((sum - stockData.slice(0, i - 4).reduce((s, v) => s + v.close, 0)) / 5 * 10) / 10 : undefined
        };
      });
    }, []);
    return <Chart data={data} xKey="day" series={[candlestick({
      open: 'open',
      high: 'high',
      low: 'low',
      close: 'close',
      upColor: '#22c55e',
      downColor: '#ef4444'
    }), line('ma5', {
      color: '#f59e0b',
      strokeWidth: 1.5
    }), bar('volume', {
      color: '#94a3b8',
      opacity: 0.3
    })]} grid={<ChartGrid />} axes={<>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>} height={400} />;
  }
}`,...G.parameters?.docs?.source},description:{story:"Candlestick + MA line + volume bars",...G.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={predictionData} xKey="x" series={[band({
    upper: 'upper95',
    lower: 'lower95',
    color: '#3b82f6',
    opacity: 0.1
  }), band({
    upper: 'upper80',
    lower: 'lower80',
    color: '#3b82f6',
    opacity: 0.2
  }), line('mean', {
    color: '#3b82f6',
    strokeWidth: 2
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...W.parameters?.docs?.source},description:{story:"Confidence bands (80% + 95%)",...W.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Error Bars + Reference Line',
  render: () => <Chart data={salesData} xKey="month" series={[bar('sales', {
    color: '#3b82f6'
  }), errorBar({
    high: 'errorHigh',
    low: 'errorLow',
    color: '#1e3a5f'
  }), referenceLine({
    y: 50,
    label: 'Target',
    color: '#ef4444'
  }), referenceLine({
    y: 40,
    y2: 60,
    label: 'Acceptable',
    color: '#22c55e',
    bandOpacity: 0.1
  })]} grid={<ChartGrid />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={300} />
}`,...B.parameters?.docs?.source},description:{story:"Error bars on bar chart + reference line",...B.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'WebGL Scatter (dotGL)',
  render: () => <Chart data={scatterData} xKey="x" series={[dotGL('y', {
    color: '#3b82f6',
    size: 4
  })]} grid={<ChartGrid horizontal vertical />} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={400} />
}`,...E.parameters?.docs?.source},description:{story:"WebGL scatter — 200 points",...E.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'WebGL Heatmap',
  render: () => <Chart data={heatmapData} xKey="hour" series={[heatmapGL({
    xKey: 'hour',
    yKey: 'day',
    valueKey: 'traffic',
    colorRange: ['#eff6ff', '#1e40af']
  })]} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
        </>} height={280} />
}`,...K.parameters?.docs?.source},description:{story:"WebGL heatmap — traffic by hour × day",...K.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Streaming (streamGL)',
  render: () => {
    const handleRef = useRef<StreamGLHandle | null>(null) as MutableRefObject<StreamGLHandle | null>;
    useEffect(() => {
      let t = 0;
      const interval = setInterval(() => {
        handleRef.current?.push(t, 50 + Math.sin(t / 10) * 30 + Math.random() * 10);
        t++;
      }, 200);
      return () => clearInterval(interval);
    }, []);
    return <Chart data={[]} xKey="x" series={[streamGL({
      handleRef,
      color: '#3b82f6'
    })]} grid={<ChartGrid />} axes={<>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>} height={300} />;
  }
}`,...D.parameters?.docs?.source},description:{story:"Streaming line — real-time data",...D.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Kitchen Sink',
  render: () => {
    const data = salesData.map((d, i, arr) => ({
      ...d,
      runAvg: Math.round(arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1) * 10) / 10,
      upper: Math.round((arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1) + 8) * 10) / 10,
      lower: Math.round((arr.slice(0, i + 1).reduce((s, v) => s + v.sales, 0) / (i + 1) - 8) * 10) / 10
    }));
    return <Chart data={data} xKey="month" series={[referenceLine({
      y: 40,
      y2: 60,
      color: '#22c55e',
      bandOpacity: 0.08
    }), referenceLine({
      y: 50,
      label: 'Target',
      color: '#ef4444'
    }), band({
      upper: 'upper',
      lower: 'lower',
      color: '#f59e0b',
      opacity: 0.15
    }), bar('sales', {
      color: '#3b82f6'
    }), errorBar({
      high: 'errorHigh',
      low: 'errorLow',
      color: '#1e3a5f'
    }), line('runAvg', {
      color: '#f59e0b',
      strokeWidth: 2
    })]} grid={<ChartGrid />} axes={<>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>} height={400} />;
  }
}`,...T.parameters?.docs?.source},description:{story:"Mixed: bars with error bars, line, reference line, confidence band",...T.parameters?.docs?.description}}};const cr=["Candlestick","FinancialComposite","ConfidenceBands","ErrorBarsWithTarget","WebGLScatter","WebGLHeatmap","StreamingLine","KitchenSink"];export{F as Candlestick,W as ConfidenceBands,B as ErrorBarsWithTarget,G as FinancialComposite,T as KitchenSink,D as StreamingLine,K as WebGLHeatmap,E as WebGLScatter,cr as __namedExportsOrder,sr as default};
