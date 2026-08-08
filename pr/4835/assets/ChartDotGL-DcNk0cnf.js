import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{a as r,l as i,o as a}from"./ChartAxis-BYz-LLki.js";import{a as o,c as s,i as c,n as l,o as u,r as d,s as f,t as p}from"./webgl-C09eFXzS.js";function m({dataKey:e,color:t,size:n=6,opacity:r=.8}){let{data:o,xKey:p,xScale:m,yScale:y,width:b,height:x}=a(),S=(0,h.useRef)(null),C=(0,h.useRef)(null),w=(0,h.useRef)(null),T=(0,h.useRef)(null),E=(0,h.useCallback)(()=>{let t=[];for(let n of o){let r=i(n,p,m),a=typeof n[e]==`number`?n[e]:0;t.push(r,y(a))}return new Float32Array(t)},[o,p,e,m,y]);return(0,h.useEffect)(()=>{let e=T.current;if(e)return S.current||=document.createElement(`canvas`),u(e,S.current,b,x)},[b,x]),(0,h.useEffect)(()=>{let e=S.current;if(!e||b<=0||x<=0)return;let i=s(e,b,x);C.current||=d(e);let a=C.current;if(!a)return;w.current||=l(a,_,v);let o=w.current;if(!o)return;a.viewport(0,0,e.width,e.height),f(a),a.useProgram(o);let u=E(),p=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,p),a.bufferData(a.ARRAY_BUFFER,u,a.STATIC_DRAW);let m=a.getAttribLocation(o,`a_position`);a.enableVertexAttribArray(m),a.vertexAttribPointer(m,2,a.FLOAT,!1,0,0);let[h,g,y]=c(t);a.uniform2f(a.getUniformLocation(o,`u_resolution`),b,x),a.uniform3f(a.getUniformLocation(o,`u_color`),h,g,y),a.uniform1f(a.getUniformLocation(o,`u_size`),n*i),a.uniform1f(a.getUniformLocation(o,`u_opacity`),r),a.drawArrays(a.POINTS,0,u.length/2),a.deleteBuffer(p)},[b,x,t,n,r,E]),b<=0||x<=0?null:(0,g.jsx)(`g`,{ref:T})}var h,g,_,v;function y(){return(y=e((()=>{h=t(),r(),o(),g=n(),_=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  varying float v_alpha;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size * ${p.toFixed(6)};
    v_alpha = 1.0;
  }
`,v=`
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  varying float v_alpha;
  void main() {
    float v_alpha_final = u_opacity;
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float a = v_alpha_final * edge;
    gl_FragColor = vec4(u_color * a, a);
  }
`,m.__docgenInfo={description:'WebGL scatter plot. Canvas mounted outside SVG for sharp Retina rendering.\n\n@example\n```\n<ChartDotGL dataKey="value" color={colors.categorical(1)[0]} />\n```',methods:[],displayName:`ChartDotGL`,props:{dataKey:{required:!0,tsType:{name:`string`},description:``},color:{required:!0,tsType:{name:`string`},description:``},size:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`6`,computed:!1}},opacity:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`0.8`,computed:!1}}}}})))()}export{y as n,m as t};