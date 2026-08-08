import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{a as n,o as r,r as i}from"./color-B2pZ48oy.js";import{t as a}from"./jsx-runtime-DeHZSEgm.js";import{C as o,S as s,c,d as l,f as u,g as d,h as f,m as p,n as m,p as h,r as g}from"./_data-DNraWrUw.js";function _(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function v(e,t,n){let r=_(e,e.VERTEX_SHADER,t),i=_(e,e.FRAGMENT_SHADER,n);if(!r||!i)return r&&e.deleteShader(r),i&&e.deleteShader(i),null;let a=e.createProgram();return a?(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),e.getProgramParameter(a,e.LINK_STATUS)?a:(e.deleteProgram(a),null)):(e.deleteShader(r),e.deleteShader(i),null)}function y(e){return r(n(e))}function b(){return((typeof window<`u`?window.devicePixelRatio:0)||2)*2}function x(e){return e.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!0,antialias:!0})}function S(e){e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA)}function C(e,t,n){let r=b();return e.width=Math.max(1,Math.round(t*r)),e.height=Math.max(1,Math.round(n*r)),e.style.width=`${Math.max(0,t)}px`,e.style.height=`${Math.max(0,n)}px`,r}function w(e,t,n,r){let i=e.ownerSVGElement;if(!i)return;let a=i.parentElement;if(!a)return;getComputedStyle(a).position===`static`&&(a.style.position=`relative`),t.style.position=`absolute`,t.style.pointerEvents=`none`;let o=a.getBoundingClientRect(),s=e.getScreenCTM();return s?(t.style.left=`${s.e-o.left}px`,t.style.top=`${s.f-o.top}px`):(t.style.left=`0`,t.style.top=`0`),t.style.width=`${n}px`,t.style.height=`${r}px`,a.appendChild(t),()=>{t.parentElement===a&&a.removeChild(t)}}function T(e,t,n){let r=e=>{e.preventDefault(),t()};return e.addEventListener(`webglcontextlost`,r,!1),e.addEventListener(`webglcontextrestored`,n,!1),()=>{e.removeEventListener(`webglcontextlost`,r,!1),e.removeEventListener(`webglcontextrestored`,n,!1)}}function E(e){let t=e.getExtension(`WEBGL_lose_context`);t&&t.loseContext()}var D;function O(){return(O=e((()=>{i(),D=1/.96})))()}function k({resolved:e,color:t,size:n,opacity:r,width:i,height:a}){let o=(0,j.useRef)(null),s=(0,j.useRef)(null),c=(0,j.useRef)(null),l=(0,j.useRef)(null),u=(0,j.useRef)(null),d=(0,j.useRef)(null),[f,p]=(0,j.useState)(0),m=(0,j.useMemo)(()=>{let t=[];for(let n of e)Number.isFinite(n.px)&&Number.isFinite(n.py)&&t.push(n.px,n.py);return new Float32Array(t)},[e]);return(0,j.useEffect)(()=>{let e=d.current;if(!e)return;o.current||=document.createElement(`canvas`);let t=o.current,n=w(e,t,i,a),r=T(t,()=>{s.current=null,c.current=null,l.current=null,u.current=null},()=>p(e=>e+1));return()=>{r(),n?.()}},[i,a]),(0,j.useEffect)(()=>{let e=o.current;if(!e||i<=0||a<=0)return;let d=C(e,i,a);s.current||=x(e);let f=s.current;if(!f||f.isContextLost())return;c.current||(c.current=v(f,N,P),u.current=null);let p=c.current;if(!p)return;l.current||=f.createBuffer();let h=l.current;if(!h)return;u.current||={aPosition:f.getAttribLocation(p,`a_position`),uResolution:f.getUniformLocation(p,`u_resolution`),uColor:f.getUniformLocation(p,`u_color`),uSize:f.getUniformLocation(p,`u_size`),uOpacity:f.getUniformLocation(p,`u_opacity`)};let g=u.current;f.viewport(0,0,e.width,e.height),S(f),f.useProgram(p),f.bindBuffer(f.ARRAY_BUFFER,h),f.bufferData(f.ARRAY_BUFFER,m,f.STATIC_DRAW),f.enableVertexAttribArray(g.aPosition),f.vertexAttribPointer(g.aPosition,2,f.FLOAT,!1,0,0);let[_,b,w]=y(t);f.uniform2f(g.uResolution,i,a),f.uniform3f(g.uColor,_,b,w),f.uniform1f(g.uSize,n*d),f.uniform1f(g.uOpacity,r),f.drawArrays(f.POINTS,0,m.length/2)},[i,a,t,n,r,m,f]),(0,j.useEffect)(()=>()=>{let e=s.current;e&&(l.current&&e.deleteBuffer(l.current),c.current&&e.deleteProgram(c.current),E(e)),s.current=null,c.current=null,l.current=null,u.current=null},[]),i<=0||a<=0?null:(0,M.jsx)(`g`,{ref:d})}function A(e,t){let{color:n}=t,r=t.size??6,i=t.opacity??.8;return{type:`dotGL`,key:e,dataKeys:[e],layout:{},resolve(t){let{data:n,xKey:r,xScale:i,yScale:a}=t,o=[];for(let t=0;t<n.length;t++){let s=n[t],c;c=`bandwidth`in i?(i(String(s[r]))??0)+i.bandwidth()/2:i(s[r]);let l=typeof s[e]==`number`?s[e]:0;o.push({px:c,py:a(l),py0:a(0),dataIndex:t})}return o},render(e,t){return(0,M.jsx)(k,{resolved:e,color:n,size:r,opacity:i,width:t.width,height:t.height})}}}var j,M,N,P;function ee(){return(ee=e((()=>{j=t(),O(),M=a(),N=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size * ${D.toFixed(6)};
  }
`,P=`
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
`})))()}function te(e){let t=e+1;return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function ne(e,t,n){return e===0&&t===0&&n===0?-1:(e<<16|t<<8|n)-1}function re({resolved:e,color:t,size:n,opacity:r,width:i,height:a,data:o,renderTooltip:s}){let c=(0,F.useRef)(null),l=(0,F.useRef)(null),[u,d]=(0,F.useState)(-1),[f,p]=(0,F.useState)(null),[m,h]=(0,F.useState)(0),g=(0,F.useRef)(null),_=(0,F.useRef)(null),b=(0,F.useRef)(null),x=(0,F.useRef)(null),S=(0,F.useRef)(null),C=(0,F.useMemo)(()=>{let t=new Float32Array(e.length*2);for(let n=0;n<e.length;n++)t[n*2]=e[n].px,t[n*2+1]=e[n].py;return t},[e]),w=(0,F.useMemo)(()=>{let t=new Float32Array(e.length*3);for(let n=0;n<e.length;n++){let[e,r,i]=te(n);t[n*3]=e,t[n*3+1]=r,t[n*3+2]=i}return t},[e.length]);(0,F.useEffect)(()=>{if(i<=0||a<=0)return;let e=window.devicePixelRatio||1,o=Math.max(1,Math.round(i*e)),s=Math.max(1,Math.round(a*e)),u=c.current;if(u){if(u.width!==o&&(u.width=o),u.height!==s&&(u.height=s),!g.current){let e=u.getContext(`webgl`,{alpha:!0,premultipliedAlpha:!1,antialias:!0}),t=e?v(e,ae,oe):null;e&&t&&(g.current={gl:e,prog:t},_.current=null)}let c=g.current;if(c&&!c.gl.isContextLost()){let{gl:o,prog:s}=c;_.current||=o.createBuffer();let l=_.current;if(l){o.viewport(0,0,u.width,u.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.enable(o.BLEND),o.blendFunc(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA),o.useProgram(s),o.bindBuffer(o.ARRAY_BUFFER,l),o.bufferData(o.ARRAY_BUFFER,C,o.STATIC_DRAW);let c=o.getAttribLocation(s,`a_position`);o.enableVertexAttribArray(c),o.vertexAttribPointer(c,2,o.FLOAT,!1,0,0);let[d,f,p]=y(t);o.uniform2f(o.getUniformLocation(s,`u_resolution`),i,a),o.uniform3f(o.getUniformLocation(s,`u_color`),d,f,p),o.uniform1f(o.getUniformLocation(s,`u_size`),n*e),o.uniform1f(o.getUniformLocation(s,`u_opacity`),r),o.drawArrays(o.POINTS,0,C.length/2)}}}let d=l.current;if(d){if(d.width!==o&&(d.width=o),d.height!==s&&(d.height=s),!b.current){let t=d.getContext(`webgl`,{alpha:!1,premultipliedAlpha:!1,antialias:!1,preserveDrawingBuffer:!0});if(t){let n=v(t,se,ce),r=t.createFramebuffer(),i=t.createTexture();n&&r&&i&&(t.bindTexture(t.TEXTURE_2D,i),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindFramebuffer(t.FRAMEBUFFER,r),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,i,0),t.bindFramebuffer(t.FRAMEBUFFER,null),b.current={gl:t,prog:n,fb:r,tex:i,texW:0,texH:0,dpr:e},x.current=null,S.current=null)}}let t=b.current;if(t&&!t.gl.isContextLost()){let{gl:r,prog:o,fb:s,tex:c}=t;t.dpr=e,(t.texW!==d.width||t.texH!==d.height)&&(r.bindTexture(r.TEXTURE_2D,c),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,d.width,d.height,0,r.RGBA,r.UNSIGNED_BYTE,null),t.texW=d.width,t.texH=d.height),x.current||=r.createBuffer(),S.current||=r.createBuffer();let l=x.current,u=S.current;if(l&&u){r.bindFramebuffer(r.FRAMEBUFFER,s),r.viewport(0,0,d.width,d.height),r.clearColor(0,0,0,1),r.clear(r.COLOR_BUFFER_BIT),r.disable(r.BLEND),r.useProgram(o),r.bindBuffer(r.ARRAY_BUFFER,l),r.bufferData(r.ARRAY_BUFFER,C,r.STATIC_DRAW);let t=r.getAttribLocation(o,`a_position`);r.enableVertexAttribArray(t),r.vertexAttribPointer(t,2,r.FLOAT,!1,0,0),r.bindBuffer(r.ARRAY_BUFFER,u),r.bufferData(r.ARRAY_BUFFER,w,r.STATIC_DRAW);let c=r.getAttribLocation(o,`a_pickColor`);r.enableVertexAttribArray(c),r.vertexAttribPointer(c,3,r.FLOAT,!1,0,0),r.uniform2f(r.getUniformLocation(o,`u_resolution`),i,a),r.uniform1f(r.getUniformLocation(o,`u_size`),(n+L)*e),r.drawArrays(r.POINTS,0,C.length/2),r.bindFramebuffer(r.FRAMEBUFFER,null)}}}},[i,a,C,w,t,n,r,m]),(0,F.useEffect)(()=>{let e=[],t=c.current;t&&e.push(T(t,()=>{g.current=null,_.current=null},()=>h(e=>e+1)));let n=l.current;return n&&e.push(T(n,()=>{b.current=null,x.current=null,S.current=null},()=>h(e=>e+1))),()=>{for(let t of e)t()}},[]),(0,F.useEffect)(()=>()=>{let e=g.current;if(e){let{gl:t,prog:n}=e;_.current&&t.deleteBuffer(_.current),t.deleteProgram(n),E(t)}let t=b.current;if(t){let{gl:e,prog:n,fb:r,tex:i}=t;x.current&&e.deleteBuffer(x.current),S.current&&e.deleteBuffer(S.current),e.deleteFramebuffer(r),e.deleteTexture(i),e.deleteProgram(n),E(e)}g.current=null,_.current=null,b.current=null,x.current=null,S.current=null},[]);let D=(0,F.useCallback)(e=>{let t=b.current;if(!t||t.gl.isContextLost())return;let n=e.currentTarget.ownerSVGElement;if(!n)return;let r=e.currentTarget.getScreenCTM();if(!r)return;let i=n.createSVGPoint();i.x=e.clientX,i.y=e.clientY;let a=i.matrixTransform(r.inverse()),{gl:o,fb:s,dpr:c,texW:l,texH:u}=t,f=Math.floor(a.x*c),m=Math.floor(a.y*c);if(f<0||m<0||f>=l||m>=u){d(-1),p(null);return}o.bindFramebuffer(o.FRAMEBUFFER,s);let h=new Uint8Array(4);o.readPixels(f,u-1-m,1,1,o.RGBA,o.UNSIGNED_BYTE,h),o.bindFramebuffer(o.FRAMEBUFFER,null);let g=ne(h[0],h[1],h[2]);d(g),p(g>=0?{x:a.x,y:a.y}:null)},[]),O=(0,F.useCallback)(()=>{d(-1),p(null)},[]),k=u>=0&&u<o.length?o[u]:null;return(0,I.jsxs)(`g`,{children:[(0,I.jsx)(`foreignObject`,{x:0,y:0,width:i,height:a,style:{overflow:`hidden`},children:(0,I.jsx)(`canvas`,{ref:c,style:{width:i,height:a,pointerEvents:`none`}})}),(0,I.jsx)(`foreignObject`,{x:0,y:0,width:0,height:0,style:{overflow:`hidden`},children:(0,I.jsx)(`canvas`,{ref:l,style:{display:`none`}})}),(0,I.jsx)(`rect`,{x:0,y:0,width:i,height:a,fill:`transparent`,onMouseMove:D,onMouseLeave:O}),k&&u>=0&&(0,I.jsxs)(`g`,{pointerEvents:`none`,children:[(0,I.jsx)(`circle`,{cx:C[u*2],cy:C[u*2+1],r:n/2+7,fill:`none`,stroke:t,strokeWidth:2,strokeOpacity:.35}),(0,I.jsx)(`circle`,{cx:C[u*2],cy:C[u*2+1],r:n/2+2.5,fill:t,stroke:`var(--color-background-body, #fff)`,strokeWidth:2})]}),k&&f&&(0,I.jsx)(`foreignObject`,{x:f.x+12,y:Math.max(0,f.y-40),width:200,height:120,pointerEvents:`none`,style:{overflow:`visible`},children:(0,I.jsx)(`div`,{style:{background:`var(--color-background-popover)`,border:`1px solid var(--color-border)`,borderRadius:8,padding:`8px 12px`,boxShadow:`var(--shadow-med)`,whiteSpace:`nowrap`,width:`fit-content`},children:s?s(k,u):((e,t)=>(0,I.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:2,fontSize:12},children:[(0,I.jsxs)(`div`,{style:{fontWeight:600,color:`var(--color-text-primary)`},children:[`Point `,t]}),Object.entries(e).map(([e,t])=>(0,I.jsxs)(`div`,{children:[(0,I.jsxs)(`span`,{style:{color:`var(--color-text-secondary)`},children:[e,`:`]}),` `,(0,I.jsx)(`span`,{style:{fontWeight:500},children:String(t)})]},e))]}))(k,u)})})]})}function ie(e,t){let{color:n}=t,r=t.size??6,i=t.opacity??.8,a=t.renderTooltip;return{type:`dotGLInteractive`,key:e,dataKeys:[e],layout:{},resolve(t){let{data:n,xKey:r,xScale:i,yScale:a}=t,o=[];for(let t=0;t<n.length;t++){let s=n[t],c;c=`bandwidth`in i?(i(String(s[r]))??0)+i.bandwidth()/2:i(s[r]);let l=typeof s[e]==`number`?s[e]:0;o.push({px:c,py:a(l),py0:a(0),dataIndex:t})}return o},render(e,t){return(0,I.jsx)(re,{resolved:e,color:n,size:r,opacity:i,width:t.width,height:t.height,data:t.data,renderTooltip:a})}}}var F,I,L,ae,oe,se,ce;function le(){return(le=e((()=>{F=t(),O(),I=a(),L=16,ae=`
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
`,se=`
  attribute vec2 a_position;
  attribute vec3 a_pickColor;
  uniform vec2 u_resolution;
  uniform float u_size;
  varying vec3 v_pickColor;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size;
    v_pickColor = a_pickColor;
  }
`,ce=`
  precision mediump float;
  varying vec3 v_pickColor;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(v_pickColor, 1.0);
  }
`})))()}function ue(e,t){if(e.length===0)return[0,0,0];let n=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));if(e.length===1)return e[0];let r=n*(e.length-1),i=Math.floor(r),a=Math.min(i+1,e.length-1),o=r-i;return[e[i][0]+o*(e[a][0]-e[i][0]),e[i][1]+o*(e[a][1]-e[i][1]),e[i][2]+o*(e[a][2]-e[i][2])]}function de({data:e,xKey:t,yKey:n,valueKey:r,xScale:i,yBandScale:a,colorRange:o,domain:s,cellGap:c,width:l,height:u}){let d=(0,R.useRef)(null),f=(0,R.useRef)(null),p=(0,R.useRef)(null),m=(0,R.useRef)(null),h=(0,R.useRef)(null),g=(0,R.useRef)(null),_=(0,R.useRef)(null),[b,D]=(0,R.useState)(0),O=(0,R.useMemo)(()=>o.map(y),[o]),k=(0,R.useMemo)(()=>{if(s)return s;let t=1/0,n=-1/0;for(let i of e){let e=i[r];typeof e==`number`&&Number.isFinite(e)&&(e<t&&(t=e),e>n&&(n=e))}return!Number.isFinite(t)||!Number.isFinite(n)?[0,1]:[t,n]},[e,r,s]),A=(0,R.useMemo)(()=>{let o=[],s=[],[l,u]=k,d=u-l||1,f=c,p=i.bandwidth(),m=a.bandwidth(),h=typeof i.step==`function`?i.step():p,g=a.step();for(let c of e){let e=i(String(c[t])),u=a(String(c[n]));if(e==null||u==null)continue;let _=c[r],v=((typeof _==`number`&&Number.isFinite(_)?_:0)-l)/d,[y,b,x]=ue(O,v),S=e+p/2,C=u+m/2,w=S-h/2+f/2,T=S+h/2-f/2,E=C-g/2+f/2,D=C+g/2-f/2;o.push(w,E,T,E,w,D,T,E,T,D,w,D);for(let e=0;e<6;e++)s.push(y,b,x)}return{positions:new Float32Array(o),colors:new Float32Array(s),vertexCount:o.length/2}},[e,t,n,r,i,a,k,O,c]);return(0,R.useEffect)(()=>{let e=_.current;if(!e)return;d.current||=document.createElement(`canvas`);let t=d.current,n=w(e,t,l,u),r=T(t,()=>{f.current=null,p.current=null,m.current=null,h.current=null,g.current=null},()=>D(e=>e+1));return()=>{r(),n?.()}},[l,u]),(0,R.useEffect)(()=>{let e=d.current;if(!e||l<=0||u<=0)return;C(e,l,u),f.current||=x(e);let t=f.current;if(!t||t.isContextLost())return;p.current||(p.current=v(t,B,V),g.current=null);let n=p.current;if(!n)return;m.current||=t.createBuffer(),h.current||=t.createBuffer();let r=m.current,i=h.current;if(!r||!i)return;g.current||={aPosition:t.getAttribLocation(n,`a_position`),aColor:t.getAttribLocation(n,`a_color`),uResolution:t.getUniformLocation(n,`u_resolution`)};let a=g.current;t.viewport(0,0,e.width,e.height),S(t),t.useProgram(n),t.bindBuffer(t.ARRAY_BUFFER,r),t.bufferData(t.ARRAY_BUFFER,A.positions,t.STATIC_DRAW),t.enableVertexAttribArray(a.aPosition),t.vertexAttribPointer(a.aPosition,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,A.colors,t.STATIC_DRAW),t.enableVertexAttribArray(a.aColor),t.vertexAttribPointer(a.aColor,3,t.FLOAT,!1,0,0),t.uniform2f(a.uResolution,l,u),t.drawArrays(t.TRIANGLES,0,A.vertexCount)},[A,l,u,b]),(0,R.useEffect)(()=>()=>{let e=f.current;e&&(m.current&&e.deleteBuffer(m.current),h.current&&e.deleteBuffer(h.current),p.current&&e.deleteProgram(p.current),E(e)),f.current=null,p.current=null,m.current=null,h.current=null,g.current=null},[]),l<=0||u<=0?null:(0,z.jsx)(`g`,{ref:_})}function fe(e){let{xKey:t,yKey:n,valueKey:r,colorRange:i}=e,a=e.cellGap??1;return{type:`heatmapGL`,key:`heatmap-${r}`,dataKeys:[],layout:{yBandKey:n},resolve(e){let{data:r,xScale:i,yBandScale:a}=e,o=[];if(!(`bandwidth`in i)||!a)return o;let s=i;for(let e=0;e<r.length;e++){let i=r[e],c=(s(String(i[t]))??0)+s.bandwidth()/2,l=(a(String(i[n]))??0)+a.bandwidth()/2;o.push({px:c,py:l,py0:l,dataIndex:e})}return o},render(o,s){return!(`bandwidth`in s.xScale)||!s.yBandScale?null:(0,z.jsx)(de,{data:s.data,xKey:t,yKey:n,valueKey:r,xScale:s.xScale,yBandScale:s.yBandScale,colorRange:i,domain:e.domain,cellGap:a,width:s.width,height:s.height})}}}var R,z,B,V;function H(){return(H=e((()=>{R=t(),O(),z=a(),B=`
  attribute vec2 a_position;
  attribute vec3 a_color;
  uniform vec2 u_resolution;
  varying vec3 v_color;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_color = a_color;
  }
`,V=`
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`})))()}function pe({color:e,bufferSize:t,lineWidth:n,opacity:r,width:i,height:a,handleRef:s}){let{xScale:c,yScale:l}=o(),u=(0,U.useRef)(null),d=(0,U.useRef)(null),f=(0,U.useRef)(null),p=(0,U.useRef)(null),m=(0,U.useRef)(null),h=(0,U.useRef)(null),g=(0,U.useRef)(null),[_,b]=(0,U.useState)(0),D=(0,U.useRef)({data:new Float32Array(t*2),head:0,count:0,capacity:t}),O=(0,U.useRef)(new Float32Array(t*2));(0,U.useEffect)(()=>{let e=D.current;e.capacity!==t&&(e.data=new Float32Array(t*2),e.head=0,e.count=0,e.capacity=t,O.current=new Float32Array(t*2))},[t]);let k=(0,U.useCallback)(()=>{let t=u.current;if(!t||i<=0||a<=0)return;d.current||=x(t);let o=d.current;if(!o||o.isContextLost())return;f.current||(f.current=v(o,G,K),m.current=null);let s=f.current;if(!s)return;p.current||=o.createBuffer();let h=p.current;if(!h)return;m.current||={aPosition:o.getAttribLocation(s,`a_position`),uResolution:o.getUniformLocation(s,`u_resolution`),uColor:o.getUniformLocation(s,`u_color`),uOpacity:o.getUniformLocation(s,`u_opacity`)};let g=m.current;o.viewport(0,0,t.width,t.height),S(o);let{data:_,head:b,count:C,capacity:w}=D.current;if(C<2)return;let T=c,E=O.current;for(let e=0;e<C;e++){let t=(b-C+e+w)%w*2;E[e*2]=T(_[t]),E[e*2+1]=l(_[t+1])}o.useProgram(s),o.bindBuffer(o.ARRAY_BUFFER,h),o.bufferData(o.ARRAY_BUFFER,E.subarray(0,C*2),o.DYNAMIC_DRAW),o.enableVertexAttribArray(g.aPosition),o.vertexAttribPointer(g.aPosition,2,o.FLOAT,!1,0,0);let[k,A,j]=y(e);o.uniform2f(g.uResolution,i,a),o.uniform3f(g.uColor,k,A,j),o.uniform1f(g.uOpacity,r),o.lineWidth(n),o.drawArrays(o.LINE_STRIP,0,C)},[i,a,e,n,r,c,l]),A=(0,U.useRef)(k);(0,U.useEffect)(()=>{A.current=k},[k]);let j=(0,U.useCallback)(()=>{g.current??=requestAnimationFrame(()=>{g.current=null,A.current()})},[]);return(0,U.useEffect)(()=>{let e=h.current;if(!e)return;u.current||=document.createElement(`canvas`);let t=u.current,n=w(e,t,i,a),r=T(t,()=>{g.current!=null&&(cancelAnimationFrame(g.current),g.current=null),d.current=null,f.current=null,p.current=null,m.current=null},()=>b(e=>e+1));return()=>{r(),n?.()}},[i,a]),(0,U.useEffect)(()=>{let e=u.current;!e||i<=0||a<=0||C(e,i,a)},[i,a]),(0,U.useEffect)(()=>{j()},[k,j,_]),(0,U.useImperativeHandle)(s,()=>({push(e,t){if(!Number.isFinite(e)||!Number.isFinite(t))return;let n=D.current,r=n.head*2;n.data[r]=e,n.data[r+1]=t,n.head=(n.head+1)%n.capacity,n.count=Math.min(n.count+1,n.capacity),j()},clear(){let e=D.current;e.head=0,e.count=0,g.current!=null&&(cancelAnimationFrame(g.current),g.current=null);let t=d.current;t&&!t.isContextLost()&&(t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT))}}),[j]),(0,U.useEffect)(()=>()=>{g.current!=null&&(cancelAnimationFrame(g.current),g.current=null);let e=d.current;e&&(p.current&&e.deleteBuffer(p.current),f.current&&e.deleteProgram(f.current),E(e)),d.current=null,f.current=null,p.current=null,m.current=null},[]),i<=0||a<=0?null:(0,W.jsx)(`g`,{ref:h})}function me(e){let{color:t}=e,n=e.bufferSize??500,r=e.lineWidth??2,i=e.opacity??1,a=e.handleRef;return{type:`streamGL`,key:`stream`,dataKeys:[],layout:{},resolve(){return[]},render(e,o){return(0,W.jsx)(pe,{color:t,bufferSize:n,lineWidth:r,opacity:i,width:o.width,height:o.height,handleRef:a})}}}var U,W,G,K;function he(){return(he=e((()=>{U=t(),s(),O(),W=a(),G=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`,K=`
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    float a = u_opacity;
    gl_FragColor = vec4(u_color * a, a);
  }
`})))()}var q,J,ge,Y,X,Z,Q,$,_e;function ve(){return(ve=e((()=>{q=t(),d(),ee(),le(),H(),he(),u(),p(),g(),J=a(),ge={title:`Charts/WebGL`,component:f},Y=(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(h,{position:`bottom`}),(0,J.jsx)(h,{position:`left`})]}),X={name:`Scatter — static (high-performance)`,render:()=>(0,J.jsx)(f,{data:c,xKey:`x`,title:`WebGL scatter — static (dotGL)`,series:[A(`y`,{color:`#3b82f6`,size:5})],grid:(0,J.jsx)(l,{horizontal:!0,vertical:!0}),axes:Y,height:400})},Z={name:`Interactive scatter — hover + tooltip`,render:()=>(0,J.jsx)(f,{data:c,xKey:`x`,title:`WebGL scatter — interactive hover (dotGLInteractive)`,series:[ie(`y`,{color:`#6b1efd`,size:6,renderTooltip:e=>(0,J.jsxs)(`span`,{children:[`x: `,Math.round(e.x),`, y: `,Math.round(e.y)]})})],grid:(0,J.jsx)(l,{horizontal:!0,vertical:!0}),axes:Y,height:400})},Q={render:()=>(0,J.jsx)(f,{data:m,xKey:`hour`,title:`Traffic heatmap`,series:[fe({xKey:`hour`,yKey:`day`,valueKey:`traffic`,colorRange:[`#eff6ff`,`#1e40af`]})],axes:(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(h,{position:`bottom`}),(0,J.jsx)(h,{position:`left`,showAxisLine:!0})]}),height:280})},$={render:()=>{let e=(0,q.useRef)(null),[t,n]=(0,q.useState)(60);return(0,q.useEffect)(()=>{let t=0,r=setInterval(()=>{e.current?.push(t,50+Math.sin(t/10)*30+Math.random()*10),t++,n(Math.max(60,t))},200);return()=>clearInterval(r)},[]),(0,J.jsx)(f,{data:[],xKey:`x`,title:`Live stream (streamGL)`,xDomain:[Math.max(0,t-60),t],yDomain:[0,100],series:[me({handleRef:e,color:`#3b82f6`})],grid:(0,J.jsx)(l,{}),axes:Y,height:300})}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'Scatter — static (high-performance)',
  render: () => <Chart data={scatterData} xKey="x" title="WebGL scatter — static (dotGL)" series={[dotGL('y', {
    color: '#3b82f6',
    size: 5
  })]} grid={<ChartGrid horizontal vertical />} axes={axes} height={400} />
}`,...X.parameters?.docs?.source},description:{story:`Static, high-performance GPU scatter (\`dotGL\`) — one draw call, scales to
tens of thousands of points. Intentionally has NO hover/tooltip; for
interactivity see "Interactive scatter" below.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Interactive scatter — hover + tooltip',
  render: () => <Chart data={scatterData} xKey="x" title="WebGL scatter — interactive hover (dotGLInteractive)" series={[dotGLInteractive('y', {
    color: '#6b1efd',
    size: 6,
    renderTooltip: (d: Record<string, unknown>) => <span>
              x: {Math.round(d.x as number)}, y: {Math.round(d.y as number)}
            </span>
  })]} grid={<ChartGrid horizontal vertical />} axes={axes} height={400} />
}`,...Z.parameters?.docs?.source},description:{story:"GPU scatter with color-picking hover (`dotGLInteractive`) — hover any point\nfor a highlight + tooltip. O(1) hit detection regardless of point count.",...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={heatmapData} xKey="hour" title="Traffic heatmap" series={[heatmapGL({
    xKey: 'hour',
    yKey: 'day',
    valueKey: 'traffic',
    colorRange: ['#eff6ff', '#1e40af']
  })]} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" showAxisLine />
        </>} height={280} />
}`,...Q.parameters?.docs?.source},description:{story:`GPU heatmap — a 2D grid of colored cells (traffic by hour x day).`,...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => {
    const handleRef = useRef<StreamGLHandle | null>(null) as MutableRefObject<StreamGLHandle | null>;
    const WINDOW = 60;
    const [windowEnd, setWindowEnd] = useState(WINDOW);
    useEffect(() => {
      let t = 0;
      const interval = setInterval(() => {
        handleRef.current?.push(t, 50 + Math.sin(t / 10) * 30 + Math.random() * 10);
        t++;
        setWindowEnd(Math.max(WINDOW, t));
      }, 200);
      return () => clearInterval(interval);
    }, []);
    return <Chart data={[]} xKey="x" title="Live stream (streamGL)" xDomain={[Math.max(0, windowEnd - WINDOW), windowEnd]} yDomain={[0, 100]} series={[streamGL({
      handleRef,
      color: '#3b82f6'
    })]} grid={<ChartGrid />} axes={axes} height={300} />;
  }
}`,...$.parameters?.docs?.source},description:{story:`Streaming line via an imperative push handle + a sliding domain window.`,...$.parameters?.docs?.description}}},_e=[`Scatter`,`InteractiveScatter`,`Heatmap`,`Streaming`]})))()}ve();export{Q as Heatmap,Z as InteractiveScatter,X as Scatter,$ as Streaming,_e as __namedExportsOrder,ge as default};