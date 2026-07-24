import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./theme-BwMR6G18.js";import{t as a}from"./MediaTheme-DWtGGtUW.js";import{A as o,E as s,O as c,t as l}from"./src-doLYD-I7.js";function u(e){let t=[];for(let n=0;n<e*.45;n++){let e=Math.random()*Math.PI*2,n=Math.random()*Math.PI,r=Math.sin(n)*(1.2+.2*Math.sin(2*n));t.push({x:r*Math.cos(e),z:r*Math.sin(e),y:Math.cos(n)*.7})}for(let n=0;n<e*.18;n++){let e=Math.random(),n=Math.random()*Math.PI*2,r=.09*(1-e*.4);t.push({x:1.1+e*.6+e*e*.2,z:r*Math.cos(n),y:-.1+e*.6+e*e*.2})}for(let n=0;n<e*.17;n++){let e=Math.random()*Math.PI,n=Math.random()*Math.PI*2;t.push({x:-1.1-.5*Math.sin(e),z:.07*Math.cos(n),y:-.35+.7*Math.sin(e)})}for(let n=0;n<e*.15;n++){let e=Math.random()*.6,n=Math.random()*Math.PI*2;t.push({x:e*Math.cos(n),z:e*Math.sin(n),y:.72})}for(let n=0;n<e*.05;n++){let e=Math.random()*Math.PI*2,n=Math.random()*Math.PI,r=.1;t.push({x:r*Math.sin(n)*Math.cos(e),z:r*Math.sin(n)*Math.sin(e),y:.82+r*Math.cos(n)})}return t}function d(e){return Array.from({length:e},()=>{let e=Math.random()*Math.PI*2,t=Math.random()*Math.PI,n=Math.sin(t)*(15*Math.sin(e)-4*Math.sin(3*e)),r=8*Math.cos(t),i=Math.sin(t)*(15*Math.cos(e)-5*Math.cos(2*e)-2*Math.cos(3*e)-Math.cos(4*e));return{x:n/16,y:r/16,z:i/16}})}function f(e){return Array.from({length:e},()=>{let e=Math.random()*4*Math.PI,t=Math.random()*Math.PI*2,n=Math.exp(.15*e),r=.3+.3*Math.cos(t),i=n*Math.cos(e)*r,a=n*Math.sin(e)*r,o=n*(.08*e+.2*Math.sin(t)),s=.1;return{x:i*s,z:a*s,y:o*s-.5}})}function p(e){return Array.from({length:e},()=>{let e=Math.random()*Math.PI*2,t=Math.random()*Math.PI*2,n=4*(1-Math.cos(e)/2),r,i;e<Math.PI?(r=6*Math.cos(e)*(1+Math.sin(e))+n*Math.cos(e)*Math.cos(t),i=n*Math.sin(e)*Math.cos(t)):(r=6*Math.cos(e)*(1+Math.sin(e))+n*Math.cos(t+Math.PI),i=n*Math.sin(e)*Math.cos(t));let a=-16*Math.sin(e)+n*Math.sin(t);return{x:r/22,y:a/22,z:i/22}})}function m(e){let t=[];for(let n=0;n<e;n++){let e=Math.random()*Math.PI*2,n=Math.acos(2*Math.random()-1),r=.6+.6*Math.abs(Math.cos(5*e/2))**8;t.push({x:r*Math.sin(n)*Math.cos(e),y:r*Math.cos(n),z:r*Math.sin(n)*Math.sin(e)})}return t}function h(e){let t=[];for(let n=0;n<e*.15;n++){let e=Math.random()*1,n=Math.random()*Math.PI*2,r=.1*(1-e*.4);t.push({x:r*Math.cos(n),y:e,z:r*Math.sin(n)})}for(let n=0;n<e*.85;n++){let e=Math.random(),n=.8+e*1.4,r=.8*(1-e*.7),i=Math.sqrt(Math.random())*r,a=Math.random()*Math.PI*2;t.push({x:i*Math.cos(a)+(Math.random()-.5)*.05,y:n+(Math.random()-.5)*.15,z:i*Math.sin(a)+(Math.random()-.5)*.05})}return t}function g({bg:e,mediaMode:t,data:n,label:r,azimuth:i=30,elevation:c=20}){return(0,v.jsx)(a,{mode:t,children:(0,v.jsxs)(`div`,{style:{background:e,borderRadius:16,overflow:`hidden`,display:`flex`,flexDirection:`column`},children:[(0,v.jsx)(`div`,{style:{flex:1,padding:4},children:(0,v.jsx)(o,{data:n,xKey:`x`,yKey:`y`,zKey:`z`,height:220,azimuth:i,elevation:c,interactive:!0,autoRotate:.3,children:(0,v.jsx)(s,{color:t===`dark`?`#DFE2E5`:`#0A1317`,size:1.5,opacity:.6})})}),(0,v.jsx)(`div`,{style:{padding:`6px 12px`,fontSize:11,fontWeight:500,color:`var(--color-text-primary)`,textAlign:`center`,letterSpacing:`0.05em`,textTransform:`uppercase`},children:r})]})})}var _,v,y,b,x,S,C,w,T,E;e((()=>{_=t(n()),l(),i(),v=r(),y={title:`Lab/3DChart/PopArt`},b={render:()=>{let e=(0,_.useMemo)(()=>[{data:u(3e3),label:`Teapot`,az:30,el:25},{data:d(2500),label:`Heart`,az:0,el:15},{data:f(3e3),label:`Seashell`,az:45,el:30},{data:p(2500),label:`Klein Bottle`,az:50,el:25},{data:m(2500),label:`Star`,az:30,el:35},{data:h(3e3),label:`Tree`,az:35,el:15}],[]),t=[{bg:`#0064E0`,mode:`dark`},{bg:`#E3193B`,mode:`dark`},{bg:`#FBCE03`,mode:`light`},{bg:`#6B1EFD`,mode:`dark`},{bg:`#0B991F`,mode:`dark`},{bg:`#EB6E00`,mode:`dark`}];return(0,v.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(3, 1fr)`,gap:12,maxWidth:780},children:e.map((e,n)=>(0,v.jsx)(g,{bg:t[n].bg,mediaMode:t[n].mode,data:e.data,label:e.label,azimuth:e.az,elevation:e.el},n))})}},x={render:()=>{let e=(0,_.useMemo)(()=>[{data:u(3e3),label:`Teapot`,az:30,el:25},{data:d(2500),label:`Heart`,az:0,el:15},{data:f(3e3),label:`Seashell`,az:45,el:30},{data:p(2500),label:`Klein Bottle`,az:50,el:25},{data:m(2500),label:`Star`,az:30,el:35},{data:h(3e3),label:`Tree`,az:35,el:15}],[]),t=[`#1a1a2e`,`#16213e`,`#0f3460`,`#1b1b2f`,`#162447`,`#1f1f38`];return(0,v.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(3, 1fr)`,gap:12,maxWidth:780},children:e.map((e,n)=>(0,v.jsx)(g,{bg:t[n],mediaMode:`dark`,data:e.data,label:e.label,azimuth:e.az,elevation:e.el},n))})}},S={render:()=>{let e=(0,_.useMemo)(()=>{let e=(1+Math.sqrt(5))/2;return Array.from({length:2e3},(t,n)=>{let r=Math.acos(1-2*(n+.5)/2e3),i=2*Math.PI*n/e;return{x:Math.sin(r)*Math.cos(i),y:Math.sin(r)*Math.sin(i),z:Math.cos(r)}})},[]);return(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:12,maxWidth:780},children:[(0,v.jsx)(`div`,{style:{background:`#0064E0`,borderRadius:16,overflow:`hidden`},children:(0,v.jsxs)(a,{mode:`dark`,children:[(0,v.jsx)(`div`,{style:{padding:`6px 12px`,fontSize:11,fontWeight:500,color:`var(--color-text-primary)`,textAlign:`center`,letterSpacing:`0.05em`,textTransform:`uppercase`},children:`SVG (ThreeDScatter)`}),(0,v.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:30,elevation:20,interactive:!0,autoRotate:.3,children:(0,v.jsx)(c,{color:`#DFE2E5`,radius:1.5,opacity:.85})})]})}),(0,v.jsx)(`div`,{style:{background:`#0064E0`,borderRadius:16,overflow:`hidden`},children:(0,v.jsxs)(a,{mode:`dark`,children:[(0,v.jsx)(`div`,{style:{padding:`6px 12px`,fontSize:11,fontWeight:500,color:`var(--color-text-primary)`,textAlign:`center`,letterSpacing:`0.05em`,textTransform:`uppercase`},children:`WebGL (ThreeDScatterGL)`}),(0,v.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:30,elevation:20,interactive:!0,autoRotate:.3,children:(0,v.jsx)(s,{color:`#DFE2E5`,size:3,opacity:.85})})]})})]})}},C={render:()=>{let e=(0,_.useMemo)(()=>[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1},{x:1,y:1,z:0},{x:1,y:0,z:1},{x:0,y:1,z:1},{x:1,y:1,z:1},{x:.5,y:.5,z:.5}],[]);return(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:12,maxWidth:780},children:[(0,v.jsxs)(`div`,{style:{border:`1px solid red`,borderRadius:8,overflow:`hidden`},children:[(0,v.jsx)(`div`,{style:{padding:`4px 8px`,fontSize:11,fontWeight:600,color:`red`},children:`SVG`}),(0,v.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:35,elevation:25,children:(0,v.jsx)(c,{color:`#E3193B`,radius:6,opacity:1})})]}),(0,v.jsxs)(`div`,{style:{border:`1px solid blue`,borderRadius:8,overflow:`hidden`},children:[(0,v.jsx)(`div`,{style:{padding:`4px 8px`,fontSize:11,fontWeight:600,color:`blue`},children:`WebGL`}),(0,v.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:300,azimuth:35,elevation:25,children:(0,v.jsx)(s,{color:`#0064E0`,size:12,opacity:1})})]})]})}},w={render:()=>{let e=(0,_.useMemo)(()=>[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1},{x:1,y:1,z:0},{x:1,y:0,z:1},{x:0,y:1,z:1},{x:1,y:1,z:1},{x:.5,y:.5,z:.5}],[]);return(0,v.jsxs)(`div`,{style:{border:`1px solid #ccc`,borderRadius:8,maxWidth:500},children:[(0,v.jsx)(`div`,{style:{padding:`4px 8px`,fontSize:11},children:`Red = SVG, Blue = WebGL. If Tier 1 holds, they overlap perfectly.`}),(0,v.jsxs)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:400,azimuth:35,elevation:25,children:[(0,v.jsx)(c,{color:`#E3193B`,radius:8,opacity:.8}),(0,v.jsx)(s,{color:`#0064E0`,size:8,opacity:.8})]})]})}},T={render:()=>{let e=(0,_.useMemo)(()=>[{x:.5,y:.5,z:.5}],[]);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,maxWidth:700},children:[(0,v.jsx)(`div`,{style:{fontSize:11,fontWeight:500},children:`Size 16, \\u03b1=1.0 — SVG only | GL only | SVG on GL | GL on SVG`}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:4},children:[(0,v.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,v.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`SVG 16`}),(0,v.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:(0,v.jsx)(c,{color:`#E3193B`,radius:8,opacity:1})})]}),(0,v.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,v.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`GL 16`}),(0,v.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:(0,v.jsx)(s,{color:`#0064E0`,size:16,opacity:1})})]}),(0,v.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,v.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`SVG on GL`}),(0,v.jsxs)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,v.jsx)(s,{color:`#0064E0`,size:16,opacity:1}),(0,v.jsx)(c,{color:`#E3193B`,radius:8,opacity:1})]})]}),(0,v.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,v.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`GL on SVG`}),(0,v.jsxs)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,v.jsx)(c,{color:`#E3193B`,radius:8,opacity:1}),(0,v.jsx)(s,{color:`#0064E0`,size:16,opacity:1})]})]})]}),(0,v.jsx)(`div`,{style:{fontSize:11,fontWeight:500},children:`Size 16, \\u03b1=0.5`}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:4},children:[(0,v.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,v.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`SVG on GL`}),(0,v.jsxs)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,v.jsx)(s,{color:`#0064E0`,size:16,opacity:.5}),(0,v.jsx)(c,{color:`#E3193B`,radius:8,opacity:.5})]})]}),(0,v.jsxs)(`div`,{style:{border:`1px solid #eee`,borderRadius:6,width:120,textAlign:`center`},children:[(0,v.jsx)(`div`,{style:{fontSize:9,color:`#ccc`},children:`GL on SVG`}),(0,v.jsxs)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:120,azimuth:0,elevation:0,children:[(0,v.jsx)(c,{color:`#E3193B`,radius:8,opacity:.5}),(0,v.jsx)(s,{color:`#0064E0`,size:16,opacity:.5})]})]})]})]})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:`Side-by-side SVG vs WebGL — same data, same camera, same depth params`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`Debug: 8 cube corners + center, labeled coordinates. SVG vs WebGL side by side.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:`Debug: same 9 points, same color, overlaid on ONE chart — SVG circles + WebGL dots`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`Debug: size/opacity parity — reduced grid to avoid WebGL context limit`,...T.parameters?.docs?.description}}},E=[`Gallery`,`DarkGallery`,`SVGvsWebGL`,`DebugProjection`,`DebugOverlay`,`DebugSizeOpacity`]}))();export{x as DarkGallery,w as DebugOverlay,C as DebugProjection,T as DebugSizeOpacity,b as Gallery,S as SVGvsWebGL,E as __namedExportsOrder,y as default};