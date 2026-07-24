import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{a,i as o}from"./globalIconRegistry-CnZOikiJ.js";import{c as s}from"./Stack-C7dTtCDZ.js";import{u as c}from"./iframe-CPRczjHQ.js";import{$t as l,t as u}from"./src-CJG3qgeI.js";function d(e,t){if(t===`circle`){let t=Number(e.cx||0),n=Number(e.cy||0),r=Number(e.r||0);return{x:t-r,y:n-r,width:r*2,height:r*2}}if(t===`rect`)return{x:Number(e.x||0),y:Number(e.y||0),width:Number(e.width||0),height:Number(e.height||0)};let n=(e.d||`${e.x1||0} ${e.y1||0} ${e.x2||0} ${e.y2||0}`).match(/-?[\d.]+/g)?.map(Number)||[];if(n.length<2)return{x:0,y:0,width:24,height:24};let r=1/0,i=1/0,a=-1/0,o=-1/0;for(let e=0;e<n.length-1;e+=2){let t=n[e],s=n[e+1];t<100&&s<100&&(r=Math.min(r,t),a=Math.max(a,t),i=Math.min(i,s),o=Math.max(o,s))}return isFinite(r)?{x:r,y:i,width:a-r,height:o-i}:{x:0,y:0,width:24,height:24}}function f(e,t){return e.x<=t.x&&e.y<=t.y&&e.x+e.width>=t.x+t.width&&e.y+e.height>=t.y+t.height}function p(e){return e.width*e.height}function m(e,t){if(!t?.props)return null;let n=t.props,r=h.Children.toArray(n.children).filter(h.isValidElement),i=n.fill===`currentColor`&&!n.stroke,a=[];for(let e of r){if(!(0,h.isValidElement)(e))continue;let t=e.type;if(![`path`,`circle`,`rect`,`line`,`polyline`,`polygon`].includes(t))continue;let{key:n,children:r,...o}=e.props,s={},c=[`d`,`cx`,`cy`,`r`,`x`,`y`,`width`,`height`,`rx`,`ry`,`x1`,`y1`,`x2`,`y2`,`points`,`fillRule`,`clipRule`];for(let[e,t]of Object.entries(o))if(c.includes(e)&&t!=null){let n=e===`fillRule`?`fill-rule`:e===`clipRule`?`clip-rule`:e;s[n]=String(t)}let l=`stroke`;if(i)l=`fill`;else if(t===`circle`&&o.fill===`currentColor`)l=`fill`;else if(t===`rect`&&Number(s.width||0)>6)l=`fill`;else if(t===`path`){let e=s.d||``;/[Zz]\s*$/.test(e)&&e.length>30&&(l=`fill`)}let u=d(s,t);a.push({type:t,attrs:s,role:l,bbox:u})}if(a.length===0)return null;let o=[],s=[];if(a.length===1)o.push(a[0]);else{let e=0,t=0;a.forEach((n,r)=>{let i=p(n.bbox);i>t&&(t=i,e=r)});let n=a[e].bbox;a.forEach((r,i)=>{i===e?o.push({type:r.type,attrs:r.attrs,role:r.role}):f(n,r.bbox)&&p(r.bbox)<t*.5?s.push({type:r.type,attrs:r.attrs,role:r.role}):o.push({type:r.type,attrs:r.attrs,role:r.role})})}return{name:e,primary:o,secondary:s.length>0?s:void 0}}var h,g,_,v,y,b;e((()=>{h=t(n()),u(),c(),a(),g=r(),_={title:`Lab/SVGIconRegistry`},v=[`linear`,`bold`,`twotone`,`bulk`,`broken`],y={render:()=>{let e=[];for(let[t,n]of Object.entries(o)){let r=m(t,n);r&&e.push({name:t,def:r})}return(0,g.jsxs)(s,{direction:`vertical`,gap:3,children:[(0,g.jsx)(i,{type:`large`,children:`Default Registry Icons \\u2192 SVGIcon System`}),(0,g.jsxs)(i,{type:`supporting`,children:[e.length,` icons auto-converted. Heuristic: containment-based layer classification (only elements fully contained within a larger shape become secondary). Peer elements (same size, not contained) stay primary.`]}),(0,g.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`130px repeat(${v.length}, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,g.jsx)(`div`,{}),v.map(e=>(0,g.jsx)(i,{type:`label`,style:{textAlign:`center`,fontSize:10},children:e},e)),e.map(({name:e,def:t})=>(0,g.jsxs)(h.Fragment,{children:[(0,g.jsx)(i,{type:`label`,style:{fontSize:11},children:e}),v.map(n=>(0,g.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,g.jsx)(l,{icon:t,variation:n,size:`lg`})},`${e}-${n}`))]},e))]})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b=[`DefaultRegistryIcons`]}))();export{y as DefaultRegistryIcons,b as __namedExportsOrder,_ as default};