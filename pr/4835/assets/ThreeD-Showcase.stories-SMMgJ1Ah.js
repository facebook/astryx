import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{a as n,o as r,r as i}from"./color-B2pZ48oy.js";import{t as a}from"./jsx-runtime-DeHZSEgm.js";import{n as o,t as s}from"./MediaTheme-BDQYtshp.js";import{i as c,n as l,r as u,t as d}from"./ThreeDChart-BkP6W_tC.js";import{n as f,t as p}from"./ThreeDScatter-CW6oeEzF.js";function m(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function h(e){let t=m(e,e.VERTEX_SHADER,y),n=m(e,e.FRAGMENT_SHADER,b);if(!t||!n)return null;let r=e.createProgram();return r?(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS)?r:(e.deleteProgram(r),null)):null}function g({color:e,size:t=4,opacity:i=.85}){let{data:a,xKey:o,yKey:s,zKey:l,xDomain:u,yDomain:d,zDomain:f,normalize:p,camera:m,width:g,height:y}=c(),b=(0,_.useRef)(null),x=(0,_.useRef)(null),S=(0,_.useRef)(null),C=(0,_.useRef)(null),w=(0,_.useRef)(null),T=(0,_.useMemo)(()=>{let e=new Float32Array(a.length*3);for(let t=0;t<a.length;t++)e[t*3]=p(a[t][o],u),e[t*3+1]=p(a[t][s],d),e[t*3+2]=p(a[t][l],f);return e},[a,o,s,l,u,d,f,p]);return(0,_.useEffect)(()=>{let e=w.current;if(!e)return;let t=e.ownerSVGElement;if(!t)return;let n=t.parentElement;if(!n)return;if(getComputedStyle(n).position===`static`&&(n.style.position=`relative`),!b.current){let e=document.createElement(`canvas`);e.style.position=`absolute`,e.style.top=`0`,e.style.left=`0`,e.style.pointerEvents=`none`,b.current=e}let r=b.current;return n.appendChild(r),x.current=n,()=>{r.parentElement&&r.parentElement.removeChild(r)}},[]),(0,_.useEffect)(()=>{let o=b.current;if(!o||g<=0||y<=0)return;let s=(window.devicePixelRatio||2)*2;o.width=g*s,o.height=y*s,o.style.width=`${g}px`,o.style.height=`${y}px`,S.current||=o.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!0,antialias:!0});let c=S.current;if(!c)return;C.current||=h(c);let l=C.current;if(!l)return;let u=c.createBuffer();c.bindBuffer(c.ARRAY_BUFFER,u),c.bufferData(c.ARRAY_BUFFER,T,c.STATIC_DRAW),c.viewport(0,0,o.width,o.height),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT),c.enable(c.BLEND),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),c.useProgram(l);let d=c.getAttribLocation(l,`a_position`);c.enableVertexAttribArray(d),c.vertexAttribPointer(d,3,c.FLOAT,!1,0,0);let f=m.azimuth*Math.PI/180,p=m.elevation*Math.PI/180,_=Math.min(g,y)*.35,[v,x,w]=r(n(e));c.uniform2f(c.getUniformLocation(l,`u_resolution`),g,y),c.uniform2f(c.getUniformLocation(l,`u_center`),g/2,y/2),c.uniform1f(c.getUniformLocation(l,`u_scale`),_),c.uniform1f(c.getUniformLocation(l,`u_cosAz`),Math.cos(f)),c.uniform1f(c.getUniformLocation(l,`u_sinAz`),Math.sin(f)),c.uniform1f(c.getUniformLocation(l,`u_cosEl`),Math.cos(p)),c.uniform1f(c.getUniformLocation(l,`u_sinEl`),Math.sin(p)),c.uniform3f(c.getUniformLocation(l,`u_color`),v,x,w),c.uniform1f(c.getUniformLocation(l,`u_size`),t*s),c.uniform1f(c.getUniformLocation(l,`u_opacity`),i),c.drawArrays(c.POINTS,0,a.length),c.deleteBuffer(u)},[T,m,e,t,i,g,y,a.length]),g<=0||y<=0?null:(0,v.jsx)(`g`,{ref:w})}var _,v,y,b;function x(){return(x=e((()=>{_=t(),i(),u(),v=a(),y=`
  attribute vec3 a_position;
  uniform vec2 u_resolution;
  uniform vec2 u_center;
  uniform float u_scale;
  uniform float u_cosAz;
  uniform float u_sinAz;
  uniform float u_cosEl;
  uniform float u_sinEl;
  uniform float u_size;
  varying float v_depth;
  void main() {
    vec3 p = a_position - 0.5;
    float x1 = p.x * u_cosAz + p.z * u_sinAz;
    float z1 = -p.x * u_sinAz + p.z * u_cosAz;
    float y1 = p.y * u_cosEl - z1 * u_sinEl;
    float z2 = p.y * u_sinEl + z1 * u_cosEl;
    float px = u_center.x + x1 * u_scale;
    float py = u_center.y - y1 * u_scale;
    vec2 clip = (vec2(px, py) / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, z2, 1.0);
    v_depth = z2;
    float depthFactor = 0.75 + (z2 + 0.5) * 0.25;
    // Compensate for smoothstep edge erosion (visible at r=0.48, not 0.5)
    // so visible circle matches SVG radius exactly
    gl_PointSize = (u_size * depthFactor) / 0.96;
  }
`,b=`
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  varying float v_depth;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float depthFactor = 0.75 + (v_depth + 0.5) * 0.25;
    float a = u_opacity * depthFactor * edge;
    // Premultiplied alpha — required for correct compositing over page
    gl_FragColor = vec4(u_color * a, a);
  }
`,g.__docgenInfo={description:``,methods:[],displayName:`ThreeDScatterGL`,props:{color:{required:!0,tsType:{name:`string`},description:``},size:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`4`,computed:!1}},opacity:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`0.85`,computed:!1}}}}})))()}function S(e){let t=[];for(let n=0;n<e*.45;n++){let e=Math.random()*Math.PI*2,n=Math.random()*Math.PI,r=Math.sin(n)*(1.2+.2*Math.sin(2*n));t.push({x:r*Math.cos(e),z:r*Math.sin(e),y:Math.cos(n)*.7})}for(let n=0;n<e*.18;n++){let e=Math.random(),n=Math.random()*Math.PI*2,r=.09*(1-e*.4);t.push({x:1.1+e*.6+e*e*.2,z:r*Math.cos(n),y:-.1+e*.6+e*e*.2})}for(let n=0;n<e*.17;n++){let e=Math.random()*Math.PI,n=Math.random()*Math.PI*2;t.push({x:-1.1-.5*Math.sin(e),z:.07*Math.cos(n),y:-.35+.7*Math.sin(e)})}for(let n=0;n<e*.15;n++){let e=Math.random()*.6,n=Math.random()*Math.PI*2;t.push({x:e*Math.cos(n),z:e*Math.sin(n),y:.72})}for(let n=0;n<e*.05;n++){let e=Math.random()*Math.PI*2,n=Math.random()*Math.PI,r=.1;t.push({x:r*Math.sin(n)*Math.cos(e),z:r*Math.sin(n)*Math.sin(e),y:.82+r*Math.cos(n)})}return t}function C(e){return Array.from({length:e},()=>{let e=Math.random()*Math.PI*2,t=Math.random()*Math.PI,n=Math.sin(t)*(15*Math.sin(e)-4*Math.sin(3*e)),r=8*Math.cos(t),i=Math.sin(t)*(15*Math.cos(e)-5*Math.cos(2*e)-2*Math.cos(3*e)-Math.cos(4*e));return{x:n/16,y:r/16,z:i/16}})}function w(e){return Array.from({length:e},()=>{let e=Math.random()*4*Math.PI,t=Math.random()*Math.PI*2,n=Math.exp(.15*e),r=.3+.3*Math.cos(t),i=n*Math.cos(e)*r,a=n*Math.sin(e)*r,o=n*(.08*e+.2*Math.sin(t)),s=.1;return{x:i*s,z:a*s,y:o*s-.5}})}function T(e){return Array.from({length:e},()=>{let e=Math.random()*Math.PI*2,t=Math.random()*Math.PI*2,n=4*(1-Math.cos(e)/2),r,i;e<Math.PI?(r=6*Math.cos(e)*(1+Math.sin(e))+n*Math.cos(e)*Math.cos(t),i=n*Math.sin(e)*Math.cos(t)):(r=6*Math.cos(e)*(1+Math.sin(e))+n*Math.cos(t+Math.PI),i=n*Math.sin(e)*Math.cos(t));let a=-16*Math.sin(e)+n*Math.sin(t);return{x:r/22,y:a/22,z:i/22}})}function E(e){let t=[];for(let n=0;n<e;n++){let e=Math.random()*Math.PI*2,n=Math.acos(2*Math.random()-1),r=.6+.6*Math.abs(Math.cos(5*e/2))**8;t.push({x:r*Math.sin(n)*Math.cos(e),y:r*Math.cos(n),z:r*Math.sin(n)*Math.sin(e)})}return t}function D(e){let t=[];for(let n=0;n<e*.15;n++){let e=Math.random()*1,n=Math.random()*Math.PI*2,r=.1*(1-e*.4);t.push({x:r*Math.cos(n),y:e,z:r*Math.sin(n)})}for(let n=0;n<e*.85;n++){let e=Math.random(),n=.8+e*1.4,r=.8*(1-e*.7),i=Math.sqrt(Math.random())*r,a=Math.random()*Math.PI*2;t.push({x:i*Math.cos(a)+(Math.random()-.5)*.05,y:n+(Math.random()-.5)*.15,z:i*Math.sin(a)+(Math.random()-.5)*.05})}return t}function O({bg:e,mediaMode:t,data:n,label:r,azimuth:i=30,elevation:a=20}){return(0,A.jsx)(s,{mode:t,children:(0,A.jsxs)(`div`,{style:{background:e,borderRadius:16,overflow:`hidden`,display:`flex`,flexDirection:`column`},children:[(0,A.jsx)(`div`,{style:{flex:1,padding:4},children:(0,A.jsx)(d,{data:n,xKey:`x`,yKey:`y`,zKey:`z`,height:220,azimuth:i,elevation:a,interactive:!0,autoRotate:.3,children:(0,A.jsx)(g,{color:t===`dark`?`#DFE2E5`:`#0A1317`,size:1.5,opacity:.6})})}),(0,A.jsx)(`div`,{style:{padding:`6px 12px`,fontSize:11,fontWeight:500,color:`var(--color-text-primary)`,textAlign:`center`,letterSpacing:`0.05em`,textTransform:`uppercase`},children:r})]})})}var k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{k=t(),l(),f(),x(),o(),A=a(),j={title:`Lab/3DChart/PopArt`},M={render:()=>{let e=(0,k.useMemo)(()=>[{data:S(3e3),label:`Teapot`,az:30,el:25},{data:C(2500),label:`Heart`,az:0,el:15},{data:w(3e3),label:`Seashell`,az:45,el:30},{data:T(2500),label:`Klein Bottle`,az:50,el:25},{data:E(2500),label:`Star`,az:30,el:35},{data:D(3e3),label:`Tree`,az:35,el:15}],[]),t=[{bg:`#0064E0`,mode:`dark`},{bg:`#E3193B`,mode:`dark`},{bg:`#FBCE03`,mode:`light`},{bg:`#6B1EFD`,mode:`dark`},{bg:`#0B991F`,mode:`dark`},{bg:`#EB6E00`,mode:`dark`}];return(0,A.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(3, 1fr)`,gap:12,maxWidth:780},children:e.map((e,n)=>(0,A.jsx)(O,{bg:t[n].bg,mediaMode:t[n].mode,data:e.data,label:e.label,azimuth:e.az,elevation:e.el},n))})}},N={render:()=>{let e=(0,k.useMemo)(()=>[{data:S(3e3),label:`Teapot`,az:30,el:25},{data:C(2500),label:`Heart`,az:0,el:15},{data:w(3e3),label:`Seashell`,az:45,el:30},{data:T(2500),label:`Klein Bottle`,az:50,el:25},{data:E(2500),label:`Star`,az:30,el:35},{data:D(3e3),label:`Tree`,az:35,el:15}],[]),t=[`#1a1a2e`,`#16213e`,`#0f3460`,`#1b1b2f`,`#162447`,`#1f1f38`];return(0,A.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(3, 1fr)`,gap:12,maxWidth:780},children:e.map((e,n)=>(0,A.jsx)(O,{bg:t[n],mediaMode:`dark`,data:e.data,label:e.label,azimuth:e.az,elevation:e.el},n))})}},P={render:()=>{let e=(0,k.useMemo)(()=>{let e=(1+Math.sqrt(5))/2;return Array.from({length:2e3},(t,n)=>{let r=Math.acos(1-2*(n+.5)/2e3),i=2*Math.PI*n/e;return{x:Math.sin(r)*Math.cos(i),y:Math.sin(r)*Math.sin(i),z:Math.cos(r)}})},[]);return(0,A.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:12,maxWidth:780},children:[(0,A.jsx)(`div`,{style:{background:`#0064E0`,borderRadius:16,overflow:`hidden`},children:(0,A.jsxs)(s,{mode:`dark`,children:[(0,A.jsx)(`div`,{style:{padding:`6px 12px`,fontSize:11,fontWeight:500,color:`var(--color-text-primary)`,textAlign:`center`,letterSpacing:`0.05em`,textTransform:`uppercase`},children:`SVG (ThreeDScatter)`}),(0,A.jsx)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:30,elevation:20,interactive:!0,autoRotate:.3,children:(0,A.jsx)(p,{color:`#DFE2E5`,radius:1.5,opacity:.85})})]})}),(0,A.jsx)(`div`,{style:{background:`#0064E0`,borderRadius:16,overflow:`hidden`},children:(0,A.jsxs)(s,{mode:`dark`,children:[(0,A.jsx)(`div`,{style:{padding:`6px 12px`,fontSize:11,fontWeight:500,color:`var(--color-text-primary)`,textAlign:`center`,letterSpacing:`0.05em`,textTransform:`uppercase`},children:`WebGL (ThreeDScatterGL)`}),(0,A.jsx)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:30,elevation:20,interactive:!0,autoRotate:.3,children:(0,A.jsx)(g,{color:`#DFE2E5`,size:3,opacity:.85})})]})})]})}},F={render:()=>{let e=(0,k.useMemo)(()=>[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1},{x:1,y:1,z:0},{x:1,y:0,z:1},{x:0,y:1,z:1},{x:1,y:1,z:1},{x:.5,y:.5,z:.5}],[]);return(0,A.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:12,maxWidth:780},children:[(0,A.jsxs)(`div`,{style:{border:`1px solid red`,borderRadius:8,overflow:`hidden`},children:[(0,A.jsx)(`div`,{style:{padding:`4px 8px`,fontSize:11,fontWeight:600,color:`red`},children:`SVG`}),(0,A.jsx)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:35,elevation:25,children:(0,A.jsx)(p,{color:`#E3193B`,radius:6,opacity:1})})]}),(0,A.jsxs)(`div`,{style:{border:`1px solid blue`,borderRadius:8,overflow:`hidden`},children:[(0,A.jsx)(`div`,{style:{padding:`4px 8px`,fontSize:11,fontWeight:600,color:`blue`},children:`WebGL`}),(0,A.jsx)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:35,elevation:25,children:(0,A.jsx)(g,{color:`#0064E0`,size:12,opacity:1})})]})]})}},I={render:()=>{let e=(0,k.useMemo)(()=>[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1},{x:1,y:1,z:0},{x:1,y:0,z:1},{x:0,y:1,z:1},{x:1,y:1,z:1},{x:.5,y:.5,z:.5}],[]);return(0,A.jsxs)(`div`,{style:{border:`1px solid #ccc`,borderRadius:8,maxWidth:500},children:[(0,A.jsx)(`div`,{style:{padding:`4px 8px`,fontSize:11},children:`Red = SVG, Blue = WebGL. If Tier 1 holds, they overlap perfectly.`}),(0,A.jsxs)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:400,azimuth:35,elevation:25,children:[(0,A.jsx)(p,{color:`#E3193B`,radius:8,opacity:.8}),(0,A.jsx)(g,{color:`#0064E0`,size:8,opacity:.8})]})]})}},L={render:()=>{let e=(0,k.useMemo)(()=>[{x:.5,y:.5,z:.5}],[]);return(0,A.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,maxWidth:700},children:[(0,A.jsx)(`div`,{style:{fontSize:11,fontWeight:500},children:`Size 16, \\u03b1=1.0 — SVG only | GL only | SVG on GL | GL on SVG`}),(0,A.jsxs)(`div`,{style:{display:`flex`,gap:4},children:[(0,A.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,A.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`SVG 16`}),(0,A.jsx)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:(0,A.jsx)(p,{color:`#E3193B`,radius:8,opacity:1})})]}),(0,A.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,A.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`GL 16`}),(0,A.jsx)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:(0,A.jsx)(g,{color:`#0064E0`,size:16,opacity:1})})]}),(0,A.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,A.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`SVG on GL`}),(0,A.jsxs)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,A.jsx)(g,{color:`#0064E0`,size:16,opacity:1}),(0,A.jsx)(p,{color:`#E3193B`,radius:8,opacity:1})]})]}),(0,A.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,A.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`GL on SVG`}),(0,A.jsxs)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,A.jsx)(p,{color:`#E3193B`,radius:8,opacity:1}),(0,A.jsx)(g,{color:`#0064E0`,size:16,opacity:1})]})]})]}),(0,A.jsx)(`div`,{style:{fontSize:11,fontWeight:500},children:`Size 16, \\u03b1=0.5`}),(0,A.jsxs)(`div`,{style:{display:`flex`,gap:4},children:[(0,A.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,A.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`SVG on GL`}),(0,A.jsxs)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,A.jsx)(g,{color:`#0064E0`,size:16,opacity:.5}),(0,A.jsx)(p,{color:`#E3193B`,radius:8,opacity:.5})]})]}),(0,A.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,A.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`GL on SVG`}),(0,A.jsxs)(d,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,A.jsx)(p,{color:`#E3193B`,radius:8,opacity:.5}),(0,A.jsx)(g,{color:`#0064E0`,size:16,opacity:.5})]})]})]})]})}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const shapes = useMemo(() => [{
      data: teapot(3000),
      label: 'Teapot',
      az: 30,
      el: 25
    }, {
      data: heart(2500),
      label: 'Heart',
      az: 0,
      el: 15
    }, {
      data: seashell(3000),
      label: 'Seashell',
      az: 45,
      el: 30
    }, {
      data: kleinBottle(2500),
      label: 'Klein Bottle',
      az: 50,
      el: 25
    }, {
      data: star(2500),
      label: 'Star',
      az: 30,
      el: 35
    }, {
      data: tree(3000),
      label: 'Tree',
      az: 35,
      el: 15
    }], []);
    const palettes: {
      bg: string;
      mode: 'dark' | 'light';
    }[] = [{
      bg: '#0064E0',
      mode: 'dark'
    }, {
      bg: '#E3193B',
      mode: 'dark'
    }, {
      bg: '#FBCE03',
      mode: 'light'
    }, {
      bg: '#6B1EFD',
      mode: 'dark'
    }, {
      bg: '#0B991F',
      mode: 'dark'
    }, {
      bg: '#EB6E00',
      mode: 'dark'
    }];
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12,
      maxWidth: 780
    }}>
        {shapes.map((s, i) => <Cell key={i} bg={palettes[i].bg} mediaMode={palettes[i].mode} data={s.data} label={s.label} azimuth={s.az} elevation={s.el} />)}
      </div>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const shapes = useMemo(() => [{
      data: teapot(3000),
      label: 'Teapot',
      az: 30,
      el: 25
    }, {
      data: heart(2500),
      label: 'Heart',
      az: 0,
      el: 15
    }, {
      data: seashell(3000),
      label: 'Seashell',
      az: 45,
      el: 30
    }, {
      data: kleinBottle(2500),
      label: 'Klein Bottle',
      az: 50,
      el: 25
    }, {
      data: star(2500),
      label: 'Star',
      az: 30,
      el: 35
    }, {
      data: tree(3000),
      label: 'Tree',
      az: 35,
      el: 15
    }], []);
    const bgs = ['#1a1a2e', '#16213e', '#0f3460', '#1b1b2f', '#162447', '#1f1f38'];
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12,
      maxWidth: 780
    }}>
        {shapes.map((s, i) => <Cell key={i} bg={bgs[i]} mediaMode="dark" data={s.data} label={s.label} azimuth={s.az} elevation={s.el} />)}
      </div>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const data = useMemo(() => {
      const phi = (1 + Math.sqrt(5)) / 2;
      return Array.from({
        length: 2000
      }, (_, i) => {
        const theta = Math.acos(1 - 2 * (i + 0.5) / 2000);
        const p = 2 * Math.PI * i / phi;
        return {
          x: Math.sin(theta) * Math.cos(p),
          y: Math.sin(theta) * Math.sin(p),
          z: Math.cos(theta)
        };
      });
    }, []);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      maxWidth: 780
    }}>
        <div style={{
        background: '#0064E0',
        borderRadius: 16,
        overflow: 'hidden'
      }}>
          <MediaTheme mode="dark">
            <div style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
              SVG (ThreeDScatter)
            </div>
            <ThreeDChart data={data} xKey="x" yKey="y" zKey="z" height={300} azimuth={30} elevation={20} interactive autoRotate={0.3}>
              <ThreeDScatter color="#DFE2E5" radius={1.5} opacity={0.85} />
            </ThreeDChart>
          </MediaTheme>
        </div>
        <div style={{
        background: '#0064E0',
        borderRadius: 16,
        overflow: 'hidden'
      }}>
          <MediaTheme mode="dark">
            <div style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
              WebGL (ThreeDScatterGL)
            </div>
            <ThreeDChart data={data} xKey="x" yKey="y" zKey="z" height={300} azimuth={30} elevation={20} interactive autoRotate={0.3}>
              <ThreeDScatterGL color="#DFE2E5" size={3} opacity={0.85} />
            </ThreeDChart>
          </MediaTheme>
        </div>
      </div>;
  }
}`,...P.parameters?.docs?.source},description:{story:`Side-by-side SVG vs WebGL — same data, same camera, same depth params`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => {
    const debugData = useMemo(() => [{
      x: 0,
      y: 0,
      z: 0
    }, {
      x: 1,
      y: 0,
      z: 0
    }, {
      x: 0,
      y: 1,
      z: 0
    }, {
      x: 0,
      y: 0,
      z: 1
    }, {
      x: 1,
      y: 1,
      z: 0
    }, {
      x: 1,
      y: 0,
      z: 1
    }, {
      x: 0,
      y: 1,
      z: 1
    }, {
      x: 1,
      y: 1,
      z: 1
    }, {
      x: 0.5,
      y: 0.5,
      z: 0.5
    }], []);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      maxWidth: 780
    }}>
        <div style={{
        border: '1px solid red',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
          <div style={{
          padding: '4px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: 'red'
        }}>
            SVG
          </div>
          <ThreeDChart data={debugData} xKey="x" yKey="y" zKey="z" height={300} azimuth={35} elevation={25}>
            <ThreeDScatter color="#E3193B" radius={6} opacity={1} />
          </ThreeDChart>
        </div>
        <div style={{
        border: '1px solid blue',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
          <div style={{
          padding: '4px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: 'blue'
        }}>
            WebGL
          </div>
          <ThreeDChart data={debugData} xKey="x" yKey="y" zKey="z" height={300} azimuth={35} elevation={25}>
            <ThreeDScatterGL color="#0064E0" size={12} opacity={1} />
          </ThreeDChart>
        </div>
      </div>;
  }
}`,...F.parameters?.docs?.source},description:{story:`Debug: 8 cube corners + center, labeled coordinates. SVG vs WebGL side by side.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const debugData = useMemo(() => [{
      x: 0,
      y: 0,
      z: 0
    }, {
      x: 1,
      y: 0,
      z: 0
    }, {
      x: 0,
      y: 1,
      z: 0
    }, {
      x: 0,
      y: 0,
      z: 1
    }, {
      x: 1,
      y: 1,
      z: 0
    }, {
      x: 1,
      y: 0,
      z: 1
    }, {
      x: 0,
      y: 1,
      z: 1
    }, {
      x: 1,
      y: 1,
      z: 1
    }, {
      x: 0.5,
      y: 0.5,
      z: 0.5
    }], []);
    return <div style={{
      border: '1px solid #ccc',
      borderRadius: 8,
      maxWidth: 500
    }}>
        <div style={{
        padding: '4px 8px',
        fontSize: 11
      }}>
          Red = SVG, Blue = WebGL. If Tier 1 holds, they overlap perfectly.
        </div>
        <ThreeDChart data={debugData} xKey="x" yKey="y" zKey="z" height={400} azimuth={35} elevation={25}>
          <ThreeDScatter color="#E3193B" radius={8} opacity={0.8} />
          <ThreeDScatterGL color="#0064E0" size={8} opacity={0.8} />
        </ThreeDChart>
      </div>;
  }
}`,...I.parameters?.docs?.source},description:{story:`Debug: same 9 points, same color, overlaid on ONE chart — SVG circles + WebGL dots`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => {
    const pt = useMemo(() => [{
      x: 0.5,
      y: 0.5,
      z: 0.5
    }], []);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 700
    }}>
        <div style={{
        fontSize: 11,
        fontWeight: 500
      }}>
          Size 16, \\u03b1=1.0 — SVG only | GL only | SVG on GL | GL on SVG
        </div>
        <div style={{
        display: 'flex',
        gap: 4
      }}>
          <div style={{
          border: '1px solid #eee',
          borderRadius: 6,
          width: 120,
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: 9,
            color: '#ccc'
          }}>SVG 16</div>
            <ThreeDChart data={pt} xKey="x" yKey="y" zKey="z" height={120} azimuth={0} elevation={0}>
              <ThreeDScatter color="#E3193B" radius={8} opacity={1} />
            </ThreeDChart>
          </div>
          <div style={{
          border: '1px solid #eee',
          borderRadius: 6,
          width: 120,
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: 9,
            color: '#ccc'
          }}>GL 16</div>
            <ThreeDChart data={pt} xKey="x" yKey="y" zKey="z" height={120} azimuth={0} elevation={0}>
              <ThreeDScatterGL color="#0064E0" size={16} opacity={1} />
            </ThreeDChart>
          </div>
          <div style={{
          border: '1px solid #eee',
          borderRadius: 6,
          width: 120,
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: 9,
            color: '#ccc'
          }}>SVG on GL</div>
            <ThreeDChart data={pt} xKey="x" yKey="y" zKey="z" height={120} azimuth={0} elevation={0}>
              <ThreeDScatterGL color="#0064E0" size={16} opacity={1} />
              <ThreeDScatter color="#E3193B" radius={8} opacity={1} />
            </ThreeDChart>
          </div>
          <div style={{
          border: '1px solid #eee',
          borderRadius: 6,
          width: 120,
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: 9,
            color: '#ccc'
          }}>GL on SVG</div>
            <ThreeDChart data={pt} xKey="x" yKey="y" zKey="z" height={120} azimuth={0} elevation={0}>
              <ThreeDScatter color="#E3193B" radius={8} opacity={1} />
              <ThreeDScatterGL color="#0064E0" size={16} opacity={1} />
            </ThreeDChart>
          </div>
        </div>
        <div style={{
        fontSize: 11,
        fontWeight: 500
      }}>Size 16, \\u03b1=0.5</div>
        <div style={{
        display: 'flex',
        gap: 4
      }}>
          <div style={{
          border: '1px solid #eee',
          borderRadius: 6,
          width: 120,
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: 9,
            color: '#ccc'
          }}>SVG on GL</div>
            <ThreeDChart data={pt} xKey="x" yKey="y" zKey="z" height={120} azimuth={0} elevation={0}>
              <ThreeDScatterGL color="#0064E0" size={16} opacity={0.5} />
              <ThreeDScatter color="#E3193B" radius={8} opacity={0.5} />
            </ThreeDChart>
          </div>
          <div style={{
          border: '1px solid #eee',
          borderRadius: 6,
          width: 120,
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: 9,
            color: '#ccc'
          }}>GL on SVG</div>
            <ThreeDChart data={pt} xKey="x" yKey="y" zKey="z" height={120} azimuth={0} elevation={0}>
              <ThreeDScatter color="#E3193B" radius={8} opacity={0.5} />
              <ThreeDScatterGL color="#0064E0" size={16} opacity={0.5} />
            </ThreeDChart>
          </div>
        </div>
      </div>;
  }
}`,...L.parameters?.docs?.source},description:{story:`Debug: size/opacity parity — reduced grid to avoid WebGL context limit`,...L.parameters?.docs?.description}}},R=[`Gallery`,`DarkGallery`,`SVGvsWebGL`,`DebugProjection`,`DebugOverlay`,`DebugSizeOpacity`]})))()}z();export{N as DarkGallery,I as DebugOverlay,F as DebugProjection,L as DebugSizeOpacity,M as Gallery,P as SVGvsWebGL,R as __namedExportsOrder,j as default};