import{ah as m,a1 as t,T as J}from"./iframe-FpdBIrKz.js";import{S as z}from"./Stack-DEYywiUi.js";import{u as V}from"./useChartColors-P-eVNnEe.js";import{H as X}from"./Heading-BWSbAVGy.js";import{C as K,a as C}from"./ChartAxis-CHhXfqDp.js";import{C as Y}from"./ChartGrid-DD1uUTZ5.js";import{u as Q,x as Z}from"./ChartContext-CfcnOMC-.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./linear-gs3faI6G.js";function $(r){const o=parseInt(r.replace("#",""),16);return[(o>>16)/255,(o>>8&255)/255,(o&255)/255]}function ee(r){const o=r+1;return[(o>>16&255)/255,(o>>8&255)/255,(o&255)/255]}function te(r,o,u){return r===0&&o===0&&u===0?-1:(r<<16|o<<8|u)-1}const re=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size;
  }
`,oe=`
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(u_color, u_opacity);
  }
`,ne=`
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
`,ie=`
  precision mediump float;
  varying vec3 v_pickColor;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(v_pickColor, 1.0);
  }
`;function N(r,o,u){const f=r.createShader(o);return f?(r.shaderSource(f,u),r.compileShader(f),r.getShaderParameter(f,r.COMPILE_STATUS)?f:(r.deleteShader(f),null)):null}function O(r,o,u){const f=N(r,r.VERTEX_SHADER,o),b=N(r,r.FRAGMENT_SHADER,u);if(!f||!b)return null;const l=r.createProgram();return l?(r.attachShader(l,f),r.attachShader(l,b),r.linkProgram(l),r.getProgramParameter(l,r.LINK_STATUS)?l:(r.deleteProgram(l),null)):null}function k({dataKey:r,color:o,size:u=6,opacity:f=.8,renderTooltip:b}){const{data:l,xKey:j,xScale:w,yScale:B,width:h,height:x}=Q(),D=m.useRef(null),L=m.useRef(null),[R,G]=m.useState(-1),[S,I]=m.useState(null),U=m.useRef(null),A=m.useRef(null),y=m.useMemo(()=>{const a=[];for(const s of l){const i=Z(s,j,w),c=typeof s[r]=="number"?s[r]:0;a.push(i,B(c))}return new Float32Array(a)},[l,j,r,w,B]),M=m.useMemo(()=>{const a=[];for(let s=0;s<l.length;s++){const[i,c,e]=ee(s);a.push(i,c,e)}return new Float32Array(a)},[l.length]);m.useEffect(()=>{if(h<=0||x<=0)return;const a=window.devicePixelRatio||1,s=D.current;if(s){if(s.width=h*a,s.height=x*a,!U.current){const e=s.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!0}),n=e?O(e,re,oe):null;e&&n&&(U.current={gl:e,prog:n})}const c=U.current;if(c){const{gl:e,prog:n}=c;e.viewport(0,0,s.width,s.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.useProgram(n);const g=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,g),e.bufferData(e.ARRAY_BUFFER,y,e.STATIC_DRAW);const p=e.getAttribLocation(n,"a_position");e.enableVertexAttribArray(p),e.vertexAttribPointer(p,2,e.FLOAT,!1,0,0);const[d,_,v]=$(o);e.uniform2f(e.getUniformLocation(n,"u_resolution"),h,x),e.uniform3f(e.getUniformLocation(n,"u_color"),d,_,v),e.uniform1f(e.getUniformLocation(n,"u_size"),u*a),e.uniform1f(e.getUniformLocation(n,"u_opacity"),f),e.drawArrays(e.POINTS,0,y.length/2),e.deleteBuffer(g)}}const i=L.current;if(i){if(i.width=h*a,i.height=x*a,!A.current){const e=i.getContext("webgl",{alpha:!1,premultipliedAlpha:!1,antialias:!1,preserveDrawingBuffer:!0});if(e){const n=O(e,ne,ie),g=e.createFramebuffer(),p=e.createTexture();n&&g&&p&&(e.bindTexture(e.TEXTURE_2D,p),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i.width,i.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.bindFramebuffer(e.FRAMEBUFFER,g),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,p,0),e.bindFramebuffer(e.FRAMEBUFFER,null),A.current={gl:e,prog:n,fb:g,tex:p})}}const c=A.current;if(c){const{gl:e,prog:n,fb:g,tex:p}=c;e.bindTexture(e.TEXTURE_2D,p),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i.width,i.height,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,g),e.viewport(0,0,i.width,i.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.disable(e.BLEND),e.useProgram(n);const d=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,d),e.bufferData(e.ARRAY_BUFFER,y,e.STATIC_DRAW);const _=e.getAttribLocation(n,"a_position");e.enableVertexAttribArray(_),e.vertexAttribPointer(_,2,e.FLOAT,!1,0,0);const v=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,v),e.bufferData(e.ARRAY_BUFFER,M,e.STATIC_DRAW);const E=e.getAttribLocation(n,"a_pickColor");e.enableVertexAttribArray(E),e.vertexAttribPointer(E,3,e.FLOAT,!1,0,0),e.uniform2f(e.getUniformLocation(n,"u_resolution"),h,x),e.uniform1f(e.getUniformLocation(n,"u_size"),(u+4)*a),e.drawArrays(e.POINTS,0,y.length/2),e.deleteBuffer(d),e.deleteBuffer(v),e.bindFramebuffer(e.FRAMEBUFFER,null)}}},[h,x,y,M,o,u,f]);const H=m.useCallback(a=>{const s=A.current;if(!s)return;const i=a.currentTarget.ownerSVGElement;if(!i)return;const c=i.createSVGPoint();c.x=a.clientX,c.y=a.clientY;const e=c.matrixTransform(a.currentTarget.getScreenCTM()?.inverse()),n=window.devicePixelRatio||1,g=Math.floor(e.x*n),p=Math.floor(e.y*n),{gl:d,fb:_}=s;d.bindFramebuffer(d.FRAMEBUFFER,_);const v=new Uint8Array(4);d.readPixels(g,d.canvas.height-p,1,1,d.RGBA,d.UNSIGNED_BYTE,v),d.bindFramebuffer(d.FRAMEBUFFER,null);const E=te(v[0],v[1],v[2]);G(E),I(E>=0?{x:e.x,y:e.y}:null)},[]),W=m.useCallback(()=>{G(-1),I(null)},[]),T=R>=0&&R<l.length?l[R]:null,q=(a,s)=>t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:2,fontSize:12},children:[t.jsxs("div",{style:{fontWeight:600,color:"var(--color-text-primary)"},children:["Point ",s]}),Object.entries(a).map(([i,c])=>t.jsxs("div",{children:[t.jsxs("span",{style:{color:"var(--color-text-secondary)"},children:[i,":"]})," ",t.jsx("span",{style:{fontWeight:500},children:String(c)})]},i))]});return h<=0||x<=0?null:t.jsxs("g",{children:[t.jsx("foreignObject",{x:0,y:0,width:h,height:x,style:{overflow:"hidden"},children:t.jsx("canvas",{ref:D,style:{width:h,height:x,pointerEvents:"none"}})}),t.jsx("foreignObject",{x:0,y:0,width:0,height:0,style:{overflow:"hidden"},children:t.jsx("canvas",{ref:L,style:{display:"none"}})}),t.jsx("rect",{x:0,y:0,width:h,height:x,fill:"transparent",onMouseMove:H,onMouseLeave:W}),T&&R>=0&&t.jsx("circle",{cx:y[R*2],cy:y[R*2+1],r:u/2+3,fill:"none",stroke:o,strokeWidth:2,strokeOpacity:.8,pointerEvents:"none"}),T&&S&&t.jsx("foreignObject",{x:S.x+12,y:Math.max(0,S.y-40),width:200,height:120,pointerEvents:"none",style:{overflow:"visible"},children:t.jsx("div",{style:{background:"var(--color-background-popover)",border:"1px solid var(--color-border)",borderRadius:8,padding:"8px 12px",boxShadow:"var(--shadow-med)",whiteSpace:"nowrap",width:"fit-content"},children:b?b(T,R):q(T,R)})})]})}k.__docgenInfo={description:`WebGL scatter with built-in GPU hover detection.
Uses color-picking on an offscreen framebuffer — readPixels at cursor
gives the hovered point index in O(1), no matter how many points.

@example
\`\`\`
<ChartDotGLInteractive
  dataKey="value"
  color={useChartColors().categorical(1)[0]}
  renderTooltip={(d, i) => <span>Point {i}: {d.value}</span>}
/>
\`\`\``,methods:[],displayName:"ChartDotGLInteractive",props:{dataKey:{required:!0,tsType:{name:"string"},description:"Which data key for the y values"},color:{required:!0,tsType:{name:"string"},description:"Dot fill color (hex string)"},size:{required:!1,tsType:{name:"number"},description:"Point size in pixels",defaultValue:{value:"6",computed:!1}},opacity:{required:!1,tsType:{name:"number"},description:"Opacity 0-1",defaultValue:{value:"0.8",computed:!1}},renderTooltip:{required:!1,tsType:{name:"signature",type:"function",raw:"(datum: Record<string, unknown>, index: number) => ReactNode",signature:{arguments:[{type:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},name:"datum"},{type:{name:"number"},name:"index"}],return:{name:"ReactNode"}}},description:`Tooltip render function. Receives the hovered data point and its index.
If omitted, a default tooltip is rendered.`}}};const ye={title:"Lab/ChartDotGLInteractive"},ae=Array.from({length:5e3},()=>({x:Math.random()*100,y:Math.random()*100})),se=Array.from({length:5e4},(r,o)=>({x:Math.random()*1e3,y:Math.sin(o*.001)*40+Math.random()*60}));function ce(){const r=V();return t.jsxs(z,{direction:"vertical",gap:4,children:[t.jsx(X,{level:3,children:"GPU Color-Picking \\u2014 5,000 points"}),t.jsx(J,{type:"supporting",color:"secondary",children:"Hover any point. O(1) via readPixels."}),t.jsxs(K,{data:ae,xKey:"x",yKeys:["y"],height:400,children:[t.jsx(Y,{horizontal:!0,vertical:!0}),t.jsx(C,{position:"bottom"}),t.jsx(C,{position:"left"}),t.jsx(k,{dataKey:"y",color:r.categorical(1)[0],size:6,opacity:.6})]})]})}const P={render:()=>t.jsx(ce,{})};function le(){const r=V();return t.jsxs(z,{direction:"vertical",gap:4,children:[t.jsx(X,{level:3,children:"GPU Color-Picking \\u2014 50,000 points"}),t.jsxs(K,{data:se,xKey:"x",yKeys:["y"],height:400,children:[t.jsx(Y,{horizontal:!0}),t.jsx(C,{position:"bottom"}),t.jsx(C,{position:"left"}),t.jsx(k,{dataKey:"y",color:r.categorical(2)[1],size:3,opacity:.4,renderTooltip:(o,u)=>t.jsxs("div",{style:{fontSize:12},children:[t.jsxs("div",{style:{fontWeight:600},children:["#",u.toLocaleString()]}),t.jsxs("div",{children:["x: ",Number(o.x).toFixed(1)]}),t.jsxs("div",{children:["y: ",Number(o.y).toFixed(1)]})]})})]})]})}const F={render:()=>t.jsx(le,{})};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <GPUPicking5kDemo />
}`,...P.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <GPUPicking50kDemo />
}`,...F.parameters?.docs?.source}}};const _e=["GPUPicking5k","GPUPicking50k"];export{F as GPUPicking50k,P as GPUPicking5k,_e as __namedExportsOrder,ye as default};
