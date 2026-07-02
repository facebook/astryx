import{ah as h,a1 as t,M as L}from"./iframe-CF49Wwf0.js";import{u as Q,T as y}from"./ThreeDChart-DRDXDR5d.js";import{T as g}from"./ThreeDScatter-6Ty-ETDv.js";import"./preload-helper-Ct5FWWRu.js";function Z(a){const r=parseInt(a.replace("#",""),16);return[(r>>16)/255,(r>>8&255)/255,(r&255)/255]}const ee=`
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
`,te=`
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
`;function V(a,r,o){const e=a.createShader(r);return e?(a.shaderSource(e,o),a.compileShader(e),a.getShaderParameter(e,a.COMPILE_STATUS)?e:(a.deleteShader(e),null)):null}function ae(a){const r=V(a,a.VERTEX_SHADER,ee),o=V(a,a.FRAGMENT_SHADER,te);if(!r||!o)return null;const e=a.createProgram();return e?(a.attachShader(e,r),a.attachShader(e,o),a.linkProgram(e),a.getProgramParameter(e,a.LINK_STATUS)?e:(a.deleteProgram(e),null)):null}function x({color:a,size:r=4,opacity:o=.85}){const{data:e,xKey:s,yKey:n,zKey:p,xDomain:u,yDomain:v,zDomain:A,normalize:E,camera:j,width:m,height:f}=Q(),D=h.useRef(null),H=h.useRef(null),_=h.useRef(null),R=h.useRef(null),C=h.useRef(null),P=h.useMemo(()=>{const l=new Float32Array(e.length*3);for(let c=0;c<e.length;c++)l[c*3]=E(e[c][s],u),l[c*3+1]=E(e[c][n],v),l[c*3+2]=E(e[c][p],A);return l},[e,s,n,p,u,v,A,E]);return h.useEffect(()=>{const l=C.current;if(!l)return;const c=l.ownerSVGElement;if(!c)return;const i=c.parentElement;if(!i)return;if(getComputedStyle(i).position==="static"&&(i.style.position="relative"),!D.current){const z=document.createElement("canvas");z.style.position="absolute",z.style.top="0",z.style.left="0",z.style.pointerEvents="none",D.current=z}const d=D.current;return i.appendChild(d),H.current=i,()=>{d.parentElement&&d.parentElement.removeChild(d)}},[]),h.useEffect(()=>{const l=D.current;if(!l||m<=0||f<=0)return;const c=(window.devicePixelRatio||2)*2;l.width=m*c,l.height=f*c,l.style.width=`${m}px`,l.style.height=`${f}px`,_.current||(_.current=l.getContext("webgl",{alpha:!0,premultipliedAlpha:!0,antialias:!0}));const i=_.current;if(!i)return;R.current||(R.current=ae(i));const d=R.current;if(!d)return;const z=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,z),i.bufferData(i.ARRAY_BUFFER,P,i.STATIC_DRAW),i.viewport(0,0,l.width,l.height),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.enable(i.BLEND),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),i.useProgram(d);const B=i.getAttribLocation(d,"a_position");i.enableVertexAttribArray(B),i.vertexAttribPointer(B,3,i.FLOAT,!1,0,0);const W=j.azimuth*Math.PI/180,k=j.elevation*Math.PI/180,Y=Math.min(m,f)*.35,[$,X,J]=Z(a);i.uniform2f(i.getUniformLocation(d,"u_resolution"),m,f),i.uniform2f(i.getUniformLocation(d,"u_center"),m/2,f/2),i.uniform1f(i.getUniformLocation(d,"u_scale"),Y),i.uniform1f(i.getUniformLocation(d,"u_cosAz"),Math.cos(W)),i.uniform1f(i.getUniformLocation(d,"u_sinAz"),Math.sin(W)),i.uniform1f(i.getUniformLocation(d,"u_cosEl"),Math.cos(k)),i.uniform1f(i.getUniformLocation(d,"u_sinEl"),Math.sin(k)),i.uniform3f(i.getUniformLocation(d,"u_color"),$,X,J),i.uniform1f(i.getUniformLocation(d,"u_size"),r*c),i.uniform1f(i.getUniformLocation(d,"u_opacity"),o),i.drawArrays(i.POINTS,0,e.length),i.deleteBuffer(z)},[P,j,a,r,o,m,f,e.length]),m<=0||f<=0?null:t.jsx("g",{ref:C})}x.__docgenInfo={description:"",methods:[],displayName:"ThreeDScatterGL",props:{color:{required:!0,tsType:{name:"string"},description:""},size:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"4",computed:!1}},opacity:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0.85",computed:!1}}}};const ne={title:"Lab/3DChart/PopArt"};function w(a){const r=[];for(let o=0;o<a*.45;o++){const e=Math.random()*Math.PI*2,s=Math.random()*Math.PI,n=Math.sin(s)*(1.2+.2*Math.sin(2*s));r.push({x:n*Math.cos(e),z:n*Math.sin(e),y:Math.cos(s)*.7})}for(let o=0;o<a*.18;o++){const e=Math.random(),s=Math.random()*Math.PI*2,n=.09*(1-e*.4);r.push({x:1.1+e*.6+e*e*.2,z:n*Math.cos(s),y:-.1+e*.6+e*e*.2})}for(let o=0;o<a*.17;o++){const e=Math.random()*Math.PI,s=Math.random()*Math.PI*2;r.push({x:-1.1-.5*Math.sin(e),z:.07*Math.cos(s),y:-.35+.7*Math.sin(e)})}for(let o=0;o<a*.15;o++){const e=Math.random()*.6,s=Math.random()*Math.PI*2;r.push({x:e*Math.cos(s),z:e*Math.sin(s),y:.72})}for(let o=0;o<a*.05;o++){const e=Math.random()*Math.PI*2,s=Math.random()*Math.PI,n=.1;r.push({x:n*Math.sin(s)*Math.cos(e),z:n*Math.sin(s)*Math.sin(e),y:.82+n*Math.cos(s)})}return r}function I(a){return Array.from({length:a},()=>{const r=Math.random()*Math.PI*2,o=Math.random()*Math.PI,e=Math.sin(o)*(15*Math.sin(r)-4*Math.sin(3*r)),s=8*Math.cos(o),n=Math.sin(o)*(15*Math.cos(r)-5*Math.cos(2*r)-2*Math.cos(3*r)-Math.cos(4*r));return{x:e/16,y:s/16,z:n/16}})}function F(a){return Array.from({length:a},()=>{const r=Math.random()*4*Math.PI,o=Math.random()*Math.PI*2,e=Math.exp(.15*r),s=.3+.3*Math.cos(o),n=e*Math.cos(r)*s,p=e*Math.sin(r)*s,u=e*(.08*r+.2*Math.sin(o)),v=.1;return{x:n*v,z:p*v,y:u*v-.5}})}function U(a){return Array.from({length:a},()=>{const r=Math.random()*Math.PI*2,o=Math.random()*Math.PI*2,e=4*(1-Math.cos(r)/2);let s,n;r<Math.PI?(s=6*Math.cos(r)*(1+Math.sin(r))+e*Math.cos(r)*Math.cos(o),n=e*Math.sin(r)*Math.cos(o)):(s=6*Math.cos(r)*(1+Math.sin(r))+e*Math.cos(o+Math.PI),n=e*Math.sin(r)*Math.cos(o));const p=-16*Math.sin(r)+e*Math.sin(o);return{x:s/22,y:p/22,z:n/22}})}function O(a){const r=[];for(let e=0;e<a;e++){const s=Math.random()*Math.PI*2,n=Math.acos(2*Math.random()-1),u=.6+.6*Math.pow(Math.abs(Math.cos(5*s/2)),8);r.push({x:u*Math.sin(n)*Math.cos(s),y:u*Math.cos(n),z:u*Math.sin(n)*Math.sin(s)})}return r}function N(a){const r=[];for(let o=0;o<a*.15;o++){const e=Math.random()*1,s=Math.random()*Math.PI*2,n=.1*(1-e*.4);r.push({x:n*Math.cos(s),y:e,z:n*Math.sin(s)})}for(let o=0;o<a*.85;o++){const e=Math.random(),s=.8+e*1.4,n=.8*(1-e*.7),p=Math.sqrt(Math.random())*n,u=Math.random()*Math.PI*2;r.push({x:p*Math.cos(u)+(Math.random()-.5)*.05,y:s+(Math.random()-.5)*.15,z:p*Math.sin(u)+(Math.random()-.5)*.05})}return r}function q({bg:a,mediaMode:r,data:o,label:e,azimuth:s=30,elevation:n=20}){return t.jsx(L,{mode:r,children:t.jsxs("div",{style:{background:a,borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column"},children:[t.jsx("div",{style:{flex:1,padding:4},children:t.jsx(y,{data:o,xKey:"x",yKey:"y",zKey:"z",height:220,azimuth:s,elevation:n,interactive:!0,autoRotate:.3,children:t.jsx(x,{color:r==="dark"?"#DFE2E5":"#0A1317",size:1.5,opacity:.6})})}),t.jsx("div",{style:{padding:"6px 12px",fontSize:11,fontWeight:500,color:"var(--color-text-primary)",textAlign:"center",letterSpacing:"0.05em",textTransform:"uppercase"},children:e})]})})}const K={render:()=>{const a=h.useMemo(()=>[{data:w(3e3),label:"Teapot",az:30,el:25},{data:I(2500),label:"Heart",az:0,el:15},{data:F(3e3),label:"Seashell",az:45,el:30},{data:U(2500),label:"Klein Bottle",az:50,el:25},{data:O(2500),label:"Star",az:30,el:35},{data:N(3e3),label:"Tree",az:35,el:15}],[]),r=[{bg:"#0064E0",mode:"dark"},{bg:"#E3193B",mode:"dark"},{bg:"#FBCE03",mode:"light"},{bg:"#6B1EFD",mode:"dark"},{bg:"#0B991F",mode:"dark"},{bg:"#EB6E00",mode:"dark"}];return t.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:12,maxWidth:780},children:a.map((o,e)=>t.jsx(q,{bg:r[e].bg,mediaMode:r[e].mode,data:o.data,label:o.label,azimuth:o.az,elevation:o.el},e))})}},G={render:()=>{const a=h.useMemo(()=>[{data:w(3e3),label:"Teapot",az:30,el:25},{data:I(2500),label:"Heart",az:0,el:15},{data:F(3e3),label:"Seashell",az:45,el:30},{data:U(2500),label:"Klein Bottle",az:50,el:25},{data:O(2500),label:"Star",az:30,el:35},{data:N(3e3),label:"Tree",az:35,el:15}],[]),r=["#1a1a2e","#16213e","#0f3460","#1b1b2f","#162447","#1f1f38"];return t.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:12,maxWidth:780},children:a.map((o,e)=>t.jsx(q,{bg:r[e],mediaMode:"dark",data:o.data,label:o.label,azimuth:o.az,elevation:o.el},e))})}},b={render:()=>{const a=h.useMemo(()=>{const r=(1+Math.sqrt(5))/2;return Array.from({length:2e3},(o,e)=>{const s=Math.acos(1-2*(e+.5)/2e3),n=2*Math.PI*e/r;return{x:Math.sin(s)*Math.cos(n),y:Math.sin(s)*Math.sin(n),z:Math.cos(s)}})},[]);return t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:780},children:[t.jsx("div",{style:{background:"#0064E0",borderRadius:16,overflow:"hidden"},children:t.jsxs(L,{mode:"dark",children:[t.jsx("div",{style:{padding:"6px 12px",fontSize:11,fontWeight:500,color:"var(--color-text-primary)",textAlign:"center",letterSpacing:"0.05em",textTransform:"uppercase"},children:"SVG (ThreeDScatter)"}),t.jsx(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:300,azimuth:30,elevation:20,interactive:!0,autoRotate:.3,children:t.jsx(g,{color:"#DFE2E5",radius:1.5,opacity:.85})})]})}),t.jsx("div",{style:{background:"#0064E0",borderRadius:16,overflow:"hidden"},children:t.jsxs(L,{mode:"dark",children:[t.jsx("div",{style:{padding:"6px 12px",fontSize:11,fontWeight:500,color:"var(--color-text-primary)",textAlign:"center",letterSpacing:"0.05em",textTransform:"uppercase"},children:"WebGL (ThreeDScatterGL)"}),t.jsx(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:300,azimuth:30,elevation:20,interactive:!0,autoRotate:.3,children:t.jsx(x,{color:"#DFE2E5",size:3,opacity:.85})})]})})]})}},M={render:()=>{const a=h.useMemo(()=>[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1},{x:1,y:1,z:0},{x:1,y:0,z:1},{x:0,y:1,z:1},{x:1,y:1,z:1},{x:.5,y:.5,z:.5}],[]);return t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:780},children:[t.jsxs("div",{style:{border:"1px solid red",borderRadius:8,overflow:"hidden"},children:[t.jsx("div",{style:{padding:"4px 8px",fontSize:11,fontWeight:600,color:"red"},children:"SVG"}),t.jsx(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:300,azimuth:35,elevation:25,children:t.jsx(g,{color:"#E3193B",radius:6,opacity:1})})]}),t.jsxs("div",{style:{border:"1px solid blue",borderRadius:8,overflow:"hidden"},children:[t.jsx("div",{style:{padding:"4px 8px",fontSize:11,fontWeight:600,color:"blue"},children:"WebGL"}),t.jsx(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:300,azimuth:35,elevation:25,children:t.jsx(x,{color:"#0064E0",size:12,opacity:1})})]})]})}},S={render:()=>{const a=h.useMemo(()=>[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1},{x:1,y:1,z:0},{x:1,y:0,z:1},{x:0,y:1,z:1},{x:1,y:1,z:1},{x:.5,y:.5,z:.5}],[]);return t.jsxs("div",{style:{border:"1px solid #ccc",borderRadius:8,maxWidth:500},children:[t.jsx("div",{style:{padding:"4px 8px",fontSize:11},children:"Red = SVG, Blue = WebGL. If Tier 1 holds, they overlap perfectly."}),t.jsxs(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:400,azimuth:35,elevation:25,children:[t.jsx(g,{color:"#E3193B",radius:8,opacity:.8}),t.jsx(x,{color:"#0064E0",size:8,opacity:.8})]})]})}},T={render:()=>{const a=h.useMemo(()=>[{x:.5,y:.5,z:.5}],[]);return t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,maxWidth:700},children:[t.jsx("div",{style:{fontSize:11,fontWeight:500},children:"Size 16, \\u03b1=1.0 — SVG only | GL only | SVG on GL | GL on SVG"}),t.jsxs("div",{style:{display:"flex",gap:4},children:[t.jsxs("div",{style:{border:"1px solid #eee",borderRadius:6,width:120,textAlign:"center"},children:[t.jsx("div",{style:{fontSize:9,color:"#ccc"},children:"SVG 16"}),t.jsx(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:120,azimuth:0,elevation:0,children:t.jsx(g,{color:"#E3193B",radius:8,opacity:1})})]}),t.jsxs("div",{style:{border:"1px solid #eee",borderRadius:6,width:120,textAlign:"center"},children:[t.jsx("div",{style:{fontSize:9,color:"#ccc"},children:"GL 16"}),t.jsx(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:120,azimuth:0,elevation:0,children:t.jsx(x,{color:"#0064E0",size:16,opacity:1})})]}),t.jsxs("div",{style:{border:"1px solid #eee",borderRadius:6,width:120,textAlign:"center"},children:[t.jsx("div",{style:{fontSize:9,color:"#ccc"},children:"SVG on GL"}),t.jsxs(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:120,azimuth:0,elevation:0,children:[t.jsx(x,{color:"#0064E0",size:16,opacity:1}),t.jsx(g,{color:"#E3193B",radius:8,opacity:1})]})]}),t.jsxs("div",{style:{border:"1px solid #eee",borderRadius:6,width:120,textAlign:"center"},children:[t.jsx("div",{style:{fontSize:9,color:"#ccc"},children:"GL on SVG"}),t.jsxs(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:120,azimuth:0,elevation:0,children:[t.jsx(g,{color:"#E3193B",radius:8,opacity:1}),t.jsx(x,{color:"#0064E0",size:16,opacity:1})]})]})]}),t.jsx("div",{style:{fontSize:11,fontWeight:500},children:"Size 16, \\u03b1=0.5"}),t.jsxs("div",{style:{display:"flex",gap:4},children:[t.jsxs("div",{style:{border:"1px solid #eee",borderRadius:6,width:120,textAlign:"center"},children:[t.jsx("div",{style:{fontSize:9,color:"#ccc"},children:"SVG on GL"}),t.jsxs(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:120,azimuth:0,elevation:0,children:[t.jsx(x,{color:"#0064E0",size:16,opacity:.5}),t.jsx(g,{color:"#E3193B",radius:8,opacity:.5})]})]}),t.jsxs("div",{style:{border:"1px solid #eee",borderRadius:6,width:120,textAlign:"center"},children:[t.jsx("div",{style:{fontSize:9,color:"#ccc"},children:"GL on SVG"}),t.jsxs(y,{data:a,xKey:"x",yKey:"y",zKey:"z",height:120,azimuth:0,elevation:0,children:[t.jsx(g,{color:"#E3193B",radius:8,opacity:.5}),t.jsx(x,{color:"#0064E0",size:16,opacity:.5})]})]})]})]})}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:"Side-by-side SVG vs WebGL — same data, same camera, same depth params",...b.parameters?.docs?.description}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:"Debug: 8 cube corners + center, labeled coordinates. SVG vs WebGL side by side.",...M.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:"Debug: same 9 points, same color, overlaid on ONE chart — SVG circles + WebGL dots",...S.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:"Debug: size/opacity parity — reduced grid to avoid WebGL context limit",...T.parameters?.docs?.description}}};const de=["Gallery","DarkGallery","SVGvsWebGL","DebugProjection","DebugOverlay","DebugSizeOpacity"];export{G as DarkGallery,S as DebugOverlay,M as DebugProjection,T as DebugSizeOpacity,K as Gallery,b as SVGvsWebGL,de as __namedExportsOrder,ne as default};
