import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Heading-CaMVckJS.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{a as l,i as u,l as d,n as f,o as p,r as m,t as h}from"./ChartAxis-BYz-LLki.js";import{n as g,t as _}from"./ChartGrid-DYJI9wDe.js";import{a as v,i as y}from"./webgl-C09eFXzS.js";import{n as b,t as x}from"./useChartColors-tODQlwNr.js";function S(e){let t=e+1;return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function C(e,t,n){return e===0&&t===0&&n===0?-1:(e<<16|t<<8|n)-1}function w(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function T(e,t,n){let r=w(e,e.VERTEX_SHADER,t),i=w(e,e.FRAGMENT_SHADER,n);if(!r||!i)return null;let a=e.createProgram();return a?(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.getProgramParameter(a,e.LINK_STATUS)?a:(e.deleteProgram(a),null)):null}function E({dataKey:e,color:t,size:n=6,opacity:r=.8,renderTooltip:i}){let{data:a,xKey:o,xScale:s,yScale:c,width:l,height:u}=p(),f=(0,D.useRef)(null),m=(0,D.useRef)(null),[h,g]=(0,D.useState)(-1),[_,v]=(0,D.useState)(null),b=(0,D.useRef)(null),x=(0,D.useRef)(null),w=(0,D.useMemo)(()=>{let t=[];for(let n of a){let r=d(n,o,s),i=typeof n[e]==`number`?n[e]:0;t.push(r,c(i))}return new Float32Array(t)},[a,o,e,s,c]),E=(0,D.useMemo)(()=>{let e=[];for(let t=0;t<a.length;t++){let[n,r,i]=S(t);e.push(n,r,i)}return new Float32Array(e)},[a.length]);(0,D.useEffect)(()=>{if(l<=0||u<=0)return;let e=window.devicePixelRatio||1,i=f.current;if(i){if(i.width=l*e,i.height=u*e,!b.current){let e=i.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!1,antialias:!0}),t=e?T(e,k,A):null;e&&t&&(b.current={gl:e,prog:t})}let a=b.current;if(a){let{gl:o,prog:s}=a;o.viewport(0,0,i.width,i.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.enable(o.BLEND),o.blendFunc(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA),o.useProgram(s);let c=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,c),o.bufferData(o.ARRAY_BUFFER,w,o.STATIC_DRAW);let d=o.getAttribLocation(s,`a_position`);o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0);let[f,p,m]=y(t);o.uniform2f(o.getUniformLocation(s,`u_resolution`),l,u),o.uniform3f(o.getUniformLocation(s,`u_color`),f,p,m),o.uniform1f(o.getUniformLocation(s,`u_size`),n*e),o.uniform1f(o.getUniformLocation(s,`u_opacity`),r),o.drawArrays(o.POINTS,0,w.length/2),o.deleteBuffer(c)}}let a=m.current;if(a){if(a.width=l*e,a.height=u*e,!x.current){let e=a.getContext(`webgl`,{alpha:!1,premultipliedAlpha:!1,antialias:!1,preserveDrawingBuffer:!0});if(e){let t=T(e,j,M),n=e.createFramebuffer(),r=e.createTexture();t&&n&&r&&(e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,a.width,a.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.bindFramebuffer(e.FRAMEBUFFER,n),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0),e.bindFramebuffer(e.FRAMEBUFFER,null),x.current={gl:e,prog:t,fb:n,tex:r})}}let t=x.current;if(t){let{gl:r,prog:i,fb:o,tex:s}=t;r.bindTexture(r.TEXTURE_2D,s),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,a.width,a.height,0,r.RGBA,r.UNSIGNED_BYTE,null),r.bindFramebuffer(r.FRAMEBUFFER,o),r.viewport(0,0,a.width,a.height),r.clearColor(0,0,0,1),r.clear(r.COLOR_BUFFER_BIT),r.disable(r.BLEND),r.useProgram(i);let c=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,c),r.bufferData(r.ARRAY_BUFFER,w,r.STATIC_DRAW);let d=r.getAttribLocation(i,`a_position`);r.enableVertexAttribArray(d),r.vertexAttribPointer(d,2,r.FLOAT,!1,0,0);let f=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,f),r.bufferData(r.ARRAY_BUFFER,E,r.STATIC_DRAW);let p=r.getAttribLocation(i,`a_pickColor`);r.enableVertexAttribArray(p),r.vertexAttribPointer(p,3,r.FLOAT,!1,0,0),r.uniform2f(r.getUniformLocation(i,`u_resolution`),l,u),r.uniform1f(r.getUniformLocation(i,`u_size`),(n+4)*e),r.drawArrays(r.POINTS,0,w.length/2),r.deleteBuffer(c),r.deleteBuffer(f),r.bindFramebuffer(r.FRAMEBUFFER,null)}}},[l,u,w,E,t,n,r]);let N=(0,D.useCallback)(e=>{let t=x.current;if(!t)return;let n=e.currentTarget.ownerSVGElement;if(!n)return;let r=n.createSVGPoint();r.x=e.clientX,r.y=e.clientY;let i=r.matrixTransform(e.currentTarget.getScreenCTM()?.inverse()),a=window.devicePixelRatio||1,o=Math.floor(i.x*a),s=Math.floor(i.y*a),{gl:c,fb:l}=t;c.bindFramebuffer(c.FRAMEBUFFER,l);let u=new Uint8Array(4);c.readPixels(o,c.canvas.height-s,1,1,c.RGBA,c.UNSIGNED_BYTE,u),c.bindFramebuffer(c.FRAMEBUFFER,null);let d=C(u[0],u[1],u[2]);g(d),v(d>=0?{x:i.x,y:i.y}:null)},[]),P=(0,D.useCallback)(()=>{g(-1),v(null)},[]),F=h>=0&&h<a.length?a[h]:null;return l<=0||u<=0?null:(0,O.jsxs)(`g`,{children:[(0,O.jsx)(`foreignObject`,{x:0,y:0,width:l,height:u,style:{overflow:`hidden`},children:(0,O.jsx)(`canvas`,{ref:f,style:{width:l,height:u,pointerEvents:`none`}})}),(0,O.jsx)(`foreignObject`,{x:0,y:0,width:0,height:0,style:{overflow:`hidden`},children:(0,O.jsx)(`canvas`,{ref:m,style:{display:`none`}})}),(0,O.jsx)(`rect`,{x:0,y:0,width:l,height:u,fill:`transparent`,onMouseMove:N,onMouseLeave:P}),F&&h>=0&&(0,O.jsx)(`circle`,{cx:w[h*2],cy:w[h*2+1],r:n/2+3,fill:`none`,stroke:t,strokeWidth:2,strokeOpacity:.8,pointerEvents:`none`}),F&&_&&(0,O.jsx)(`foreignObject`,{x:_.x+12,y:Math.max(0,_.y-40),width:200,height:120,pointerEvents:`none`,style:{overflow:`visible`},children:(0,O.jsx)(`div`,{style:{background:`var(--color-background-popover)`,border:`1px solid var(--color-border)`,borderRadius:8,padding:`8px 12px`,boxShadow:`var(--shadow-med)`,whiteSpace:`nowrap`,width:`fit-content`},children:i?i(F,h):((e,t)=>(0,O.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:2,fontSize:12},children:[(0,O.jsxs)(`div`,{style:{fontWeight:600,color:`var(--color-text-primary)`},children:[`Point `,t]}),Object.entries(e).map(([e,t])=>(0,O.jsxs)(`div`,{children:[(0,O.jsxs)(`span`,{style:{color:`var(--color-text-secondary)`},children:[e,`:`]}),` `,(0,O.jsx)(`span`,{style:{fontWeight:500},children:String(t)})]},e))]}))(F,h)})})]})}var D,O,k,A,j,M;function N(){return(N=e((()=>{D=t(),l(),v(),O=i(),k=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size;
  }
`,A=`
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(u_color, u_opacity);
  }
`,j=`
  attribute vec2 a_position;
  attribute vec3 a_pickColor;
  uniform vec2 u_resolution;
  uniform float u_size;
  varying vec3 v_pickColor;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size + 4.0; // slightly larger hit area
    v_pickColor = a_pickColor;
  }
`,M=`
  precision mediump float;
  varying vec3 v_pickColor;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(v_pickColor, 1.0);
  }
`,E.__docgenInfo={description:`WebGL scatter with built-in GPU hover detection.
Uses color-picking on an offscreen framebuffer — readPixels at cursor
gives the hovered point index in O(1), no matter how many points.

@example
\`\`\`
<ChartDotGLInteractive
  dataKey="value"
  color={useChartColors().categorical(1)[0]}
  renderTooltip={(d, i) => <span>Point {i}: {d.value}</span>}
/>
\`\`\``,methods:[],displayName:`ChartDotGLInteractive`,props:{dataKey:{required:!0,tsType:{name:`string`},description:`Which data key for the y values`},color:{required:!0,tsType:{name:`string`},description:`Dot fill color (hex string)`},size:{required:!1,tsType:{name:`number`},description:`Point size in pixels`,defaultValue:{value:`6`,computed:!1}},opacity:{required:!1,tsType:{name:`number`},description:`Opacity 0-1`,defaultValue:{value:`0.8`,computed:!1}},renderTooltip:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(datum: Record<string, unknown>, index: number) => ReactNode`,signature:{arguments:[{type:{name:`Record`,elements:[{name:`string`},{name:`unknown`}],raw:`Record<string, unknown>`},name:`datum`},{type:{name:`number`},name:`index`}],return:{name:`ReactNode`}}},description:`Tooltip render function. Receives the hovered data point and its index.
If omitted, a default tooltip is rendered.`}}}})))()}function P(){let e=b();return(0,I.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,I.jsx)(o,{level:3,children:`GPU Color-Picking \\u2014 5,000 points`}),(0,I.jsx)(r,{type:`supporting`,color:`secondary`,children:`Hover any point. O(1) via readPixels.`}),(0,I.jsxs)(m,{data:R,xKey:`x`,yKeys:[`y`],height:400,children:[(0,I.jsx)(_,{horizontal:!0,vertical:!0}),(0,I.jsx)(h,{position:`bottom`}),(0,I.jsx)(h,{position:`left`}),(0,I.jsx)(E,{dataKey:`y`,color:e.categorical(1)[0],size:6,opacity:.6})]})]})}function F(){let e=b();return(0,I.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,I.jsx)(o,{level:3,children:`GPU Color-Picking \\u2014 50,000 points`}),(0,I.jsxs)(m,{data:z,xKey:`x`,yKeys:[`y`],height:400,children:[(0,I.jsx)(_,{horizontal:!0}),(0,I.jsx)(h,{position:`bottom`}),(0,I.jsx)(h,{position:`left`}),(0,I.jsx)(E,{dataKey:`y`,color:e.categorical(2)[1],size:3,opacity:.4,renderTooltip:(e,t)=>(0,I.jsxs)(`div`,{style:{fontSize:12},children:[(0,I.jsxs)(`div`,{style:{fontWeight:600},children:[`#`,t.toLocaleString()]}),(0,I.jsxs)(`div`,{children:[`x: `,Number(e.x).toFixed(1)]}),(0,I.jsxs)(`div`,{children:[`y: `,Number(e.y).toFixed(1)]})]})})]})]})}var I,L,R,z,B,V,H;function U(){return(U=e((()=>{u(),f(),g(),N(),x(),s(),n(),a(),I=i(),L={title:`Lab/ChartDotGLInteractive`},R=Array.from({length:5e3},()=>({x:Math.random()*100,y:Math.random()*100})),z=Array.from({length:5e4},(e,t)=>({x:Math.random()*1e3,y:Math.sin(t*.001)*40+Math.random()*60})),B={render:()=>(0,I.jsx)(P,{})},V={render:()=>(0,I.jsx)(F,{})},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <GPUPicking5kDemo />
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <GPUPicking50kDemo />
}`,...V.parameters?.docs?.source}}},H=[`GPUPicking5k`,`GPUPicking50k`]})))()}U();export{V as GPUPicking50k,B as GPUPicking5k,H as __namedExportsOrder,L as default};