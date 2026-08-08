import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{i as r,n as i,r as a,t as o}from"./ThreeDChart-BkP6W_tC.js";function s({splitX:e,leftColor:t,rightColor:n,radius:i=1.2,opacity:a=.65}){let{data:o,xKey:s,yKey:c,zKey:l,project:u,xDomain:d,yDomain:f,zDomain:h,normalize:g}=r(),_=(0,p.useMemo)(()=>o.map((e,t)=>{let n=g(e[s],d),r=g(e[c],f),i=g(e[l],h),{px:a,py:o,depth:p}=u(n,r,i);return{px:a,py:o,depth:p,index:t}}).sort((e,t)=>e.depth-t.depth),[o,s,c,l,u,d,f,h,g]);return(0,m.jsx)(`g`,{children:_.map(r=>{let o=.5+(r.depth+.5)*.5,s=r.px<e?t:n;return(0,m.jsx)(`circle`,{cx:r.px,cy:r.py,r:i*o,fill:s,fillOpacity:a*o},r.index)})})}function c({width:e,height:t,leftBg:n,rightBg:r}){return(0,m.jsxs)(`g`,{children:[(0,m.jsx)(`rect`,{x:0,y:0,width:e/2,height:t,fill:n}),(0,m.jsx)(`rect`,{x:e/2,y:0,width:e/2,height:t,fill:r})]})}function l({leftBg:e,rightBg:t,leftDot:n,rightDot:i}){let{width:a,height:o}=r();return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c,{width:a,height:o,leftBg:e,rightBg:t}),(0,m.jsx)(s,{splitX:a/2,leftColor:n,rightColor:i})]})}function u(e){let t=(1+Math.sqrt(5))/2;return Array.from({length:e},(n,r)=>{let i=Math.acos(1-2*(r+.5)/e),a=2*Math.PI*r/t;return{x:Math.sin(i)*Math.cos(a),y:Math.sin(i)*Math.sin(a),z:Math.cos(i)}})}function d(e){return Array.from({length:e},(t,n)=>{let r=n/e*Math.PI*2,i=Math.cos(3*r)+2;return{x:i*Math.cos(2*r),y:i*Math.sin(2*r),z:Math.sin(3*r)}})}function f(){let{width:e,height:t,data:n,xKey:i,yKey:a,zKey:o,project:s,xDomain:c,yDomain:l,zDomain:u,normalize:d}=r(),f=[{bg:`#0064E0`,dot:`#FFFFFF`},{bg:`#E3193B`,dot:`#FFFFFF`},{bg:`#FBCE03`,dot:`#0A1317`},{bg:`#0B991F`,dot:`#FFFFFF`}],h=(0,p.useMemo)(()=>n.map((e,t)=>{let n=d(e[i],c),r=d(e[a],l),f=d(e[o],u),{px:p,py:m,depth:h}=s(n,r,f);return{px:p,py:m,depth:h,index:t}}).sort((e,t)=>e.depth-t.depth),[n,i,a,o,s,c,l,u,d]),g=e/2,_=t/2;return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`rect`,{x:0,y:0,width:g,height:_,fill:f[0].bg}),(0,m.jsx)(`rect`,{x:g,y:0,width:g,height:_,fill:f[1].bg}),(0,m.jsx)(`rect`,{x:0,y:_,width:g,height:_,fill:f[2].bg}),(0,m.jsx)(`rect`,{x:g,y:_,width:g,height:_,fill:f[3].bg}),(0,m.jsx)(`g`,{children:h.map(e=>{let t=.5+(e.depth+.5)*.5,n=(e.px<g?0:1)+(e.py<_?0:2);return(0,m.jsx)(`circle`,{cx:e.px,cy:e.py,r:1.2*t,fill:f[n].dot,fillOpacity:.65*t},e.index)})})]})}var p,m,h,g,_,v,y;function b(){return(b=e((()=>{p=t(),i(),a(),m=n(),h={title:`Lab/3DChart/Backdrop`},g={render:()=>{let e=(0,p.useMemo)(()=>u(2e3),[]);return(0,m.jsx)(`div`,{style:{borderRadius:16,overflow:`hidden`,maxWidth:600},children:(0,m.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:400,interactive:!0,autoRotate:.15,children:(0,m.jsx)(l,{leftBg:`#0A1317`,rightBg:`#F1F4F7`,leftDot:`#DFE2E5`,rightDot:`#0A1317`})})})}},_={render:()=>{let e=(0,p.useMemo)(()=>d(2500),[]);return(0,m.jsx)(`div`,{style:{borderRadius:16,overflow:`hidden`,maxWidth:600},children:(0,m.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:400,interactive:!0,autoRotate:.2,children:(0,m.jsx)(l,{leftBg:`#0064E0`,rightBg:`#E3193B`,leftDot:`#FFFFFF`,rightDot:`#FFFFFF`})})})}},v={render:()=>{let e=(0,p.useMemo)(()=>u(2500),[]);return(0,m.jsx)(`div`,{style:{borderRadius:16,overflow:`hidden`,maxWidth:600},children:(0,m.jsx)(o,{data:e,xKey:`x`,yKey:`y`,zKey:`z`,height:400,interactive:!0,autoRotate:.15,children:(0,m.jsx)(f,{})})})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const data = useMemo(() => sphere(2000), []);
    return <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      maxWidth: 600
    }}>
        <ThreeDChart data={data} xKey="x" yKey="y" zKey="z" height={400} interactive autoRotate={0.15}>
          <BackdropInner leftBg="#0A1317" rightBg="#F1F4F7" leftDot="#DFE2E5" rightDot="#0A1317" />
        </ThreeDChart>
      </div>;
  }
}`,...g.parameters?.docs?.source},description:{story:`Dark/light split — points adapt color based on which half they project onto`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const data = useMemo(() => torusKnot(2500), []);
    return <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      maxWidth: 600
    }}>
        <ThreeDChart data={data} xKey="x" yKey="y" zKey="z" height={400} interactive autoRotate={0.2}>
          <BackdropInner leftBg="#0064E0" rightBg="#E3193B" leftDot="#FFFFFF" rightDot="#FFFFFF" />
        </ThreeDChart>
      </div>;
  }
}`,..._.parameters?.docs?.source},description:{story:`Color split — two bold colors`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const data = useMemo(() => sphere(2500), []);
    return <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      maxWidth: 600
    }}>
        <ThreeDChart data={data} xKey="x" yKey="y" zKey="z" height={400} interactive autoRotate={0.15}>
          <QuadBackdropInner />
        </ThreeDChart>
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y=[`SplitDarkLight`,`SplitBoldColors`,`QuadSplit`]})))()}b();export{v as QuadSplit,_ as SplitBoldColors,g as SplitDarkLight,y as __namedExportsOrder,h as default};