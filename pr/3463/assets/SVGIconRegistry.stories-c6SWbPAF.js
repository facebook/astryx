import{D as R,a1 as c,T as g,ah as I}from"./iframe-DVtWfngO.js";import{S as N}from"./Stack-BrtSPKVR.js";import{S as k}from"./SVGIcon-me58a_UA.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";function V(e,t){if(t==="circle"){const i=Number(e.cx||0),n=Number(e.cy||0),l=Number(e.r||0);return{x:i-l,y:n-l,width:l*2,height:l*2}}if(t==="rect")return{x:Number(e.x||0),y:Number(e.y||0),width:Number(e.width||0),height:Number(e.height||0)};const o=(e.d||`${e.x1||0} ${e.y1||0} ${e.x2||0} ${e.y2||0}`).match(/-?[\d.]+/g)?.map(Number)||[];if(o.length<2)return{x:0,y:0,width:24,height:24};let p=1/0,s=1/0,d=-1/0,f=-1/0;for(let i=0;i<o.length-1;i+=2){const n=o[i],l=o[i+1];n<100&&l<100&&(p=Math.min(p,n),d=Math.max(d,n),s=Math.min(s,l),f=Math.max(f,l))}return isFinite(p)?{x:p,y:s,width:d-p,height:f-s}:{x:0,y:0,width:24,height:24}}function $(e,t){return e.x<=t.x&&e.y<=t.y&&e.x+e.width>=t.x+t.width&&e.y+e.height>=t.y+t.height}function j(e){return e.width*e.height}function z(e,t){if(!t?.props)return null;const a=t.props,o=I.Children.toArray(a.children).filter(I.isValidElement),p=a.fill==="currentColor"&&!a.stroke,s=[];for(const i of o){if(!I.isValidElement(i))continue;const n=i.type;if(!["path","circle","rect","line","polyline","polygon"].includes(n))continue;const l=i.props,{key:r,children:x,...m}=l,h={},T=["d","cx","cy","r","x","y","width","height","rx","ry","x1","y1","x2","y2","points","fillRule","clipRule"];for(const[y,S]of Object.entries(m))if(T.includes(y)&&S!=null){const w=y==="fillRule"?"fill-rule":y==="clipRule"?"clip-rule":y;h[w]=String(S)}let u="stroke";if(p)u="fill";else if(n==="circle"&&m.fill==="currentColor")u="fill";else if(n==="rect"&&Number(h.width||0)>6)u="fill";else if(n==="path"){const y=h.d||"";/[Zz]\s*$/.test(y)&&y.length>30&&(u="fill")}const A=V(h,n);s.push({type:n,attrs:h,role:u,bbox:A})}if(s.length===0)return null;const d=[],f=[];if(s.length===1)d.push(s[0]);else{let i=0,n=0;s.forEach((r,x)=>{const m=j(r.bbox);m>n&&(n=m,i=x)});const l=s[i].bbox;s.forEach((r,x)=>{x===i?d.push({type:r.type,attrs:r.attrs,role:r.role}):$(l,r.bbox)&&j(r.bbox)<n*.5?f.push({type:r.type,attrs:r.attrs,role:r.role}):d.push({type:r.type,attrs:r.attrs,role:r.role})})}return{name:e,primary:d,secondary:f.length>0?f:void 0}}const F={title:"Lab/SVGIconRegistry"},v=["linear","bold","twotone","bulk","broken"],b={render:()=>{const e=[];for(const[t,a]of Object.entries(R)){const o=z(t,a);o&&e.push({name:t,def:o})}return c.jsxs(N,{direction:"vertical",gap:3,children:[c.jsx(g,{type:"large",children:"Default Registry Icons \\u2192 SVGIcon System"}),c.jsxs(g,{type:"supporting",children:[e.length," icons auto-converted. Heuristic: containment-based layer classification (only elements fully contained within a larger shape become secondary). Peer elements (same size, not contained) stay primary."]}),c.jsxs("div",{style:{display:"grid",gridTemplateColumns:`130px repeat(${v.length}, 1fr)`,gap:"8px 4px",alignItems:"center"},children:[c.jsx("div",{}),v.map(t=>c.jsx(g,{type:"label",style:{textAlign:"center",fontSize:10},children:t},t)),e.map(({name:t,def:a})=>c.jsxs(I.Fragment,{children:[c.jsx(g,{type:"label",style:{fontSize:11},children:t}),v.map(o=>c.jsx("div",{style:{display:"flex",justifyContent:"center"},children:c.jsx(k,{icon:a,variation:o,size:"lg"})},`${t}-${o}`))]},t))]})]})}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const converted: Array<{
      name: string;
      def: SVGIconDef;
    }> = [];
    for (const [name, jsx] of Object.entries(defaultIcons)) {
      const def = jsxSvgToIconDef(name, jsx as ReactElement);
      if (def) {
        converted.push({
          name,
          def
        });
      }
    }
    return <Stack direction="vertical" gap={3}>
        <Text type="large">
          Default Registry Icons \\u2192 SVGIcon System
        </Text>
        <Text type="supporting">
          {converted.length} icons auto-converted. Heuristic: containment-based
          layer classification (only elements fully contained within a larger
          shape become secondary). Peer elements (same size, not contained) stay
          primary.
        </Text>

        <div style={{
        display: 'grid',
        gridTemplateColumns: \`130px repeat(\${VARIATIONS.length}, 1fr)\`,
        gap: '8px 4px',
        alignItems: 'center'
      }}>
          <div />
          {VARIATIONS.map(v => <Text key={v} type="label" style={{
          textAlign: 'center',
          fontSize: 10
        }}>
              {v}
            </Text>)}

          {converted.map(({
          name,
          def
        }) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {VARIATIONS.map(v => <div key={\`\${name}-\${v}\`} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
                  <SVGIcon icon={def} variation={v} size="lg" />
                </div>)}
            </Fragment>)}
        </div>
      </Stack>;
  }
}`,...b.parameters?.docs?.source}}};const M=["DefaultRegistryIcons"];export{b as DefaultRegistryIcons,M as __namedExportsOrder,F as default};
