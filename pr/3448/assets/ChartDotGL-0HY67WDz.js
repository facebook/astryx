import{ah as a,a1 as P}from"./iframe-Cm6U1NA5.js";import{u as T,x as E}from"./ChartContext-DPQDI6hz.js";import{m as G,a as S,g as F,c as V,s as B,h as I,P as O}from"./webgl-B2CDFegl.js";const U=`
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  varying float v_alpha;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size * ${O.toFixed(6)};
    v_alpha = 1.0;
  }
`,w=`
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
`;function z({dataKey:u,color:l,size:p=6,opacity:m=.8}){const{data:d,xKey:g,xScale:_,yScale:v,width:o,height:n}=T(),s=a.useRef(null),c=a.useRef(null),f=a.useRef(null),h=a.useRef(null),R=a.useCallback(()=>{const t=[];for(const i of d){const e=E(i,g,_),r=typeof i[u]=="number"?i[u]:0;t.push(e,v(r))}return new Float32Array(t)},[d,g,u,_,v]);return a.useEffect(()=>{const t=h.current;if(t)return s.current||(s.current=document.createElement("canvas")),G(t,s.current,o,n)},[o,n]),a.useEffect(()=>{const t=s.current;if(!t||o<=0||n<=0)return;const i=S(t,o,n);c.current||(c.current=F(t));const e=c.current;if(!e)return;f.current||(f.current=V(e,U,w));const r=f.current;if(!r)return;e.viewport(0,0,t.width,t.height),B(e),e.useProgram(r);const x=R(),y=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,y),e.bufferData(e.ARRAY_BUFFER,x,e.STATIC_DRAW);const A=e.getAttribLocation(r,"a_position");e.enableVertexAttribArray(A),e.vertexAttribPointer(A,2,e.FLOAT,!1,0,0);const[b,C,L]=I(l);e.uniform2f(e.getUniformLocation(r,"u_resolution"),o,n),e.uniform3f(e.getUniformLocation(r,"u_color"),b,C,L),e.uniform1f(e.getUniformLocation(r,"u_size"),p*i),e.uniform1f(e.getUniformLocation(r,"u_opacity"),m),e.drawArrays(e.POINTS,0,x.length/2),e.deleteBuffer(y)},[o,n,l,p,m,R]),o<=0||n<=0?null:P.jsx("g",{ref:h})}z.__docgenInfo={description:'WebGL scatter plot. Canvas mounted outside SVG for sharp Retina rendering.\n\n@example\n```\n<ChartDotGL dataKey="value" color={colors.categorical(1)[0]} />\n```',methods:[],displayName:"ChartDotGL",props:{dataKey:{required:!0,tsType:{name:"string"},description:""},color:{required:!0,tsType:{name:"string"},description:""},size:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"6",computed:!1}},opacity:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0.8",computed:!1}}}};export{z as C};
