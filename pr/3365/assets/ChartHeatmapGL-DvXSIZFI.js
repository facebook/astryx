import{ah as a,a1 as H}from"./iframe-CF49Wwf0.js";import{u as N,b as z,i as J}from"./ChartContext-D9AeKs00.js";import{h as Q,m as X,a as Z,g as $,c as K,s as ee}from"./webgl-B2CDFegl.js";const te=`
  attribute vec2 a_position;
  attribute vec3 a_color;
  uniform vec2 u_resolution;
  varying vec3 v_color;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_color = a_color;
  }
`,ne=`
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;function re(t,l){const c=Math.max(0,Math.min(1,l));if(t.length===1)return t[0];const d=c*(t.length-1),r=Math.floor(d),m=Math.min(r+1,t.length-1),o=d-r;return[t[r][0]+o*(t[m][0]-t[r][0]),t[r][1]+o*(t[m][1]-t[r][1]),t[r][2]+o*(t[m][2]-t[r][2])]}function oe({xKey:t,yKey:l,valueKey:c,colorRange:d,domain:r,cellGap:m=1}){const{data:o,xScale:g,width:u,height:s}=N(),p=a.useRef(null),R=a.useRef(null),h=a.useRef(null),S=a.useRef(null),w=a.useMemo(()=>d.map(Q),[d]),v=a.useMemo(()=>{const n=[...new Set(o.map(e=>String(e[l])))];return z().domain(n).range([0,s]).padding(.05)},[o,l,s]),C=a.useMemo(()=>{if(r)return r;let n=1/0,e=-1/0;for(const f of o){const i=f[c];typeof i=="number"&&(i<n&&(n=i),i>e&&(e=i))}return[n,e]},[o,c,r]);return a.useEffect(()=>{const n=S.current;if(n)return p.current||(p.current=document.createElement("canvas")),X(n,p.current,u,s)},[u,s]),a.useEffect(()=>{const n=p.current;if(!n||u<=0||s<=0||!J(g))return;Z(n,u,s),R.current||(R.current=$(n));const e=R.current;if(!e)return;h.current||(h.current=K(e,te,ne));const f=h.current;if(!f)return;e.viewport(0,0,n.width,n.height),ee(e),e.useProgram(f);const i=[],E=[],[L,U]=C,W=U-L||1,A=m,D=g.bandwidth(),P=v.bandwidth();for(const b of o){const _=g(String(b[t])),x=v(String(b[l]));if(_==null||x==null)continue;const Y=((typeof b[c]=="number"?b[c]:0)-L)/W,[O,j,k]=re(w,Y),y=_+A/2,B=_+D-A/2,T=x+A/2,F=x+P-A/2;i.push(y,T,B,T,y,F,B,T,B,F,y,F);for(let I=0;I<6;I++)E.push(O,j,k)}const M=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,M),e.bufferData(e.ARRAY_BUFFER,new Float32Array(i),e.STATIC_DRAW);const G=e.getAttribLocation(f,"a_position");e.enableVertexAttribArray(G),e.vertexAttribPointer(G,2,e.FLOAT,!1,0,0);const V=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,V),e.bufferData(e.ARRAY_BUFFER,new Float32Array(E),e.STATIC_DRAW);const q=e.getAttribLocation(f,"a_color");e.enableVertexAttribArray(q),e.vertexAttribPointer(q,3,e.FLOAT,!1,0,0),e.uniform2f(e.getUniformLocation(f,"u_resolution"),u,s),e.drawArrays(e.TRIANGLES,0,i.length/2),e.deleteBuffer(M),e.deleteBuffer(V)},[o,t,l,c,g,v,u,s,C,w,m]),u<=0||s<=0?null:H.jsx("g",{ref:S})}oe.__docgenInfo={description:"",methods:[],displayName:"ChartHeatmapGL",props:{xKey:{required:!0,tsType:{name:"string"},description:""},yKey:{required:!0,tsType:{name:"string"},description:""},valueKey:{required:!0,tsType:{name:"string"},description:""},colorRange:{required:!0,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:""},domain:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},cellGap:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1",computed:!1}}}};export{oe as C};
