import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Bt7jq58k.js";import{t as a}from"./Heading-DaPZub_W.js";import{c as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BYms8e3u.js";import{t as c}from"./Divider-CyxlzlSx.js";import{u as l}from"./iframe-1XPcLcD3.js";import{$t as u,Bt as d,Ft as f,Ht as p,It as m,Lt as h,Mt as g,Nt as _,Pt as v,Rt as y,Vt as b,t as x,zt as S}from"./src-DWfAlzfh.js";function C(e){let t=e=>e.filter(e=>(e.type??`path`)!==`ellipse`).map(e=>({type:e.type??`path`,attrs:Object.fromEntries(Object.entries(e.attrs).map(([e,t])=>[e,String(t)])),role:e.role})),n=t(e.paths.filter(e=>(e.layer??`primary`)===`primary`)),r=t(e.paths.filter(e=>e.layer===`secondary`));return{name:e.name,viewBox:e.viewBox,primary:n,secondary:r.length>0?r:void 0}}var w,T,E,D,O,k,A,j,M,N,P;e((()=>{w=t(n()),x(),l(),s(),m(),T=r(),v(),E={title:`Lab/XIFSpec`},D=[`linear`,`bold`,`twotone`,`bulk`,`broken`],O={render:()=>(0,T.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,T.jsx)(a,{level:3,children:`XIF Spec Examples`}),(0,T.jsx)(i,{type:`supporting`,children:`Icons defined using the Astryx Icon Format specification. Each demonstrates a different capability: stroke-only, two-layer knockout, composable slots, animation declarations, personality overrides, and bold geometry overrides.`}),(0,T.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`140px repeat(${D.length}, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,T.jsx)(`div`,{}),D.map(e=>(0,T.jsx)(i,{type:`label`,style:{textAlign:`center`,fontSize:10},children:e},e)),y.map(e=>{let t=C(e),n=[];return e.slots?.length&&n.push(`🔌 slots`),e.paths.some(e=>e.animate)&&n.push(`✨ animated`),e.paths.some(e=>e.personality)&&n.push(`🎨 personality`),e.overrides&&n.push(`🔀 overrides`),e.paths.some(e=>e.layer===`secondary`)&&n.push(`📐 two-layer`),(0,T.jsxs)(w.Fragment,{children:[(0,T.jsxs)(`div`,{children:[(0,T.jsx)(i,{type:`label`,style:{fontSize:11},children:e.name}),n.length>0&&(0,T.jsx)(i,{type:`supporting`,style:{fontSize:9,marginTop:2},children:n.join(` `)})]}),D.map(n=>(0,T.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,T.jsx)(u,{icon:t,variation:n,size:`lg`})},`${e.name}-${n}`))]},e.name)})]})]})},k={render:()=>{let e=C(b),t=C(S),n={name:`shield-check`,primary:[...e.primary],secondary:[{type:`path`,attrs:{d:`M9 13l2 2 4-4`},role:`stroke`}]},r={name:`shield-x`,primary:[...e.primary],secondary:[{type:`path`,attrs:{d:`M9 9l6 6M15 9l-6 6`},role:`stroke`}]},s={name:`file-text`,primary:[...t.primary],secondary:[...t.secondary??[],{type:`line`,attrs:{x1:`9`,y1:`13`,x2:`15`,y2:`13`},role:`stroke`},{type:`line`,attrs:{x1:`9`,y1:`17`,x2:`13`,y2:`17`},role:`stroke`}]};return(0,T.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,T.jsx)(a,{level:3,children:`Composition via Slots`}),(0,T.jsxs)(i,{type:`supporting`,children:[`Icons with `,(0,T.jsx)(`code`,{children:`slots`}),` accept sub-icons. One shield base + different badges = many composed icons without extra path data.`]}),(0,T.jsx)(o,{direction:`horizontal`,gap:4,children:[{label:`shield (base)`,def:e},{label:`shield-check`,def:n},{label:`shield-x`,def:r},{label:`file (base)`,def:t},{label:`file-text`,def:s}].map(({label:e,def:t})=>(0,T.jsxs)(o,{direction:`vertical`,gap:1,hAlign:`center`,children:[(0,T.jsxs)(o,{direction:`horizontal`,gap:2,children:[(0,T.jsx)(u,{icon:t,variation:`linear`,size:`lg`}),(0,T.jsx)(u,{icon:t,variation:`bold`,size:`lg`})]}),(0,T.jsx)(i,{type:`supporting`,style:{fontSize:10},children:e})]},e))}),(0,T.jsx)(c,{}),(0,T.jsx)(a,{level:4,children:`Slot Definition`}),(0,T.jsxs)(i,{type:`supporting`,children:[`The shield icon defines:`,` `,(0,T.jsx)(`code`,{children:`slots: [{ name: 'badge', position: 'center', size: 0.42 }]`}),`. At render time, the component scales and positions the badge icon into the slot. The badge inherits the parent's variation and color.`]})]})}},A={render:()=>{let e=C(p),t=C(d),n=C(h),r=[{name:`Brutalist`,desc:`Sharp corners, straight lines, tight curves`},{name:`Technical`,desc:`Minimal rounding, precise geometry`},{name:`Default`,desc:`Balanced — slight softening`},{name:`Friendly`,desc:`Rounded corners, subtle curves`},{name:`Playful`,desc:`Very rounded, bowed segments`}];return(0,T.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,T.jsx)(a,{level:3,children:`Personality Axes (Conceptual)`}),(0,T.jsxs)(i,{type:`supporting`,children:[`Shape personality parameters adjust the `,(0,T.jsx)(`em`,{children:`feel`}),` of icons without changing their structure. All adjustments are relative, preserving the artist's hierarchy of sharp vs soft. These icons show the concept; path manipulation is not yet implemented.`]}),(0,T.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`120px repeat(5, 1fr)`,gap:`12px 8px`,alignItems:`center`},children:[(0,T.jsx)(`div`,{}),r.map(e=>(0,T.jsxs)(o,{direction:`vertical`,gap:0,hAlign:`center`,children:[(0,T.jsx)(i,{type:`label`,style:{fontSize:10},children:e.name}),(0,T.jsx)(i,{type:`supporting`,style:{fontSize:8},children:e.desc})]},e.name)),[{name:`star`,def:e},{name:`home`,def:t},{name:`bell`,def:n}].map(({name:e,def:t})=>(0,T.jsxs)(w.Fragment,{children:[(0,T.jsx)(i,{type:`label`,style:{fontSize:11},children:e}),r.map((e,n)=>(0,T.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`,opacity:.3+n*.175},children:(0,T.jsx)(u,{icon:t,variation:`linear`,size:`lg`,strokeWidth:1.5-n*.1})},e.name))]},e))]}),(0,T.jsx)(i,{type:`supporting`,children:`Note: opacity/stroke-width are used as visual placeholders here. The real implementation will modify path geometry, rounding corners, bowing segments, adjusting curve tension, all at build time via the theme pipeline.`})]})}},j={render:()=>(0,T.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,T.jsx)(`style`,{dangerouslySetInnerHTML:{__html:`
      @keyframes xif-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
      @keyframes xif-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes xif-scale { from { transform: scale(0); } to { transform: scale(1); } }
      @keyframes xif-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .xif-draw path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: xif-draw 1.2s ease-out forwards; }
      .xif-draw path:nth-child(2) { animation-delay: 0.4s; }
      .xif-fade path { opacity: 0; animation: xif-fade 0.6s ease-out forwards; }
      .xif-fade path:nth-child(2) { animation-delay: 0.3s; }
      .xif-scale path { transform-origin: center; transform: scale(0); animation: xif-scale 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .xif-scale path:nth-child(2) { animation-delay: 0.2s; }
      .xif-rotate { transform-origin: center; animation: xif-rotate 2s linear infinite; }
    `}}),(0,T.jsx)(a,{level:3,children:`Animation Types (Live)`}),(0,T.jsx)(i,{type:`supporting`,children:`Icons declare animation intent per path. The theme resolves timing. Each demo loops on page load.`}),(0,T.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(4, 1fr)`,gap:24},children:[{name:`draw`,desc:`Stroke reveals along path`,cls:`xif-draw`,paths:[`M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9`,`M10.3 21a1.94 1.94 0 0 0 3.4 0`]},{name:`fade`,desc:`Opacity entrance per layer`,cls:`xif-fade`,paths:[`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,`M9 12l2 2 4-4`]},{name:`scale`,desc:`Grow from center`,cls:`xif-scale`,paths:[`M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z`]},{name:`rotate`,desc:`Continuous spin`,cls:`xif-rotate`,paths:[`M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z`]}].map(e=>(0,T.jsxs)(o,{direction:`vertical`,gap:1,hAlign:`center`,style:{padding:16},children:[(0,T.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 24 24`,width:`48`,height:`48`,fill:`none`,stroke:`currentColor`,strokeWidth:1.5,strokeLinecap:`round`,strokeLinejoin:`round`,className:e.cls,children:e.paths.map((e,t)=>(0,T.jsx)(`path`,{d:e},t))}),(0,T.jsx)(i,{type:`label`,style:{fontSize:12,marginTop:8},children:e.name}),(0,T.jsx)(i,{type:`supporting`,style:{fontSize:10,textAlign:`center`},children:e.desc})]},e.name))})]})},M={square:`M4 4 L20 4 L20 20 L4 20 Z`,diamond:`M12 2 L22 12 L12 22 L2 12 Z`,arrow:`M12 2 L20 10 L16 10 L16 22 L8 22 L8 10 L4 10 Z`,star:`M12 2 L14.5 8.5 L21.5 9.5 L16.3 14.5 L17.6 21.5 L12 18 L6.4 21.5 L7.7 14.5 L2.5 9.5 L9.5 8.5 Z`,bell:`M4 17 L4 9 L8 5 L12 3 L16 5 L20 9 L20 17 Z`,envelope:`M2 6 L12 13 L22 6 L22 18 L2 18 Z`,chat:`M3 4 L21 4 L21 16 L13 16 L8 21 L8 16 L3 16 Z`,shield:`M4 5 L12 2 L20 5 L20 13 L12 22 L4 13 Z`,hexagon:`M12 2 L20.5 6.5 L20.5 15.5 L12 20 L3.5 15.5 L3.5 6.5 Z`,bookmark:`M6 2 L18 2 L18 22 L12 17 L6 22 Z`},N={render:()=>{let e=[0,.2,.4,.6,.8,1],t=[0,.2,.5,.8,1],n=Object.entries(M);return(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`Path Transform Playground`}),(0,T.jsxs)(i,{type:`supporting`,children:[`Live path manipulation with sagitta-corrected corner rounding. Sharp corners (like star tips) round less aggressively than gentle corners, achieving equal `,(0,T.jsx)(`em`,{children:`perceived`}),` roundness at all angles.`]}),(0,T.jsx)(a,{level:4,children:`Corner Rounding (sagitta-corrected)`}),(0,T.jsx)(i,{type:`supporting`,children:`Same cornerRounding value across all shapes. Sharp corners get less radius, gentle corners get more, visually balanced.`}),(0,T.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`80px repeat(${e.length}, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,T.jsx)(`div`,{}),e.map(e=>(0,T.jsx)(i,{type:`label`,style:{textAlign:`center`,fontSize:10},children:e},e)),n.map(([t,n])=>(0,T.jsxs)(w.Fragment,{children:[(0,T.jsx)(i,{type:`label`,style:{fontSize:11},children:t}),e.map(e=>(0,T.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,T.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`40`,height:`40`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,T.jsx)(`path`,{d:f(n,e)})})},e))]},t))]}),(0,T.jsx)(c,{}),(0,T.jsx)(a,{level:4,children:`Segment Curvature`}),(0,T.jsx)(i,{type:`supporting`,children:`Straight line segments gain a perpendicular bow. Subtle at low values, pronounced at high.`}),(0,T.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`80px repeat(${t.length}, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,T.jsx)(`div`,{}),t.map(e=>(0,T.jsx)(i,{type:`label`,style:{textAlign:`center`,fontSize:10},children:e},e)),n.slice(0,5).map(([e,n])=>(0,T.jsxs)(w.Fragment,{children:[(0,T.jsx)(i,{type:`label`,style:{fontSize:11},children:e}),t.map(e=>(0,T.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,T.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`40`,height:`40`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,T.jsx)(`path`,{d:g(n,e)})})},e))]},e))]}),(0,T.jsx)(c,{}),(0,T.jsx)(a,{level:4,children:`Personality Presets (combined transforms)`}),(0,T.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`80px repeat(5, 1fr)`,gap:`8px 4px`,alignItems:`center`},children:[(0,T.jsx)(`div`,{}),[{label:`Brutalist`,r:0,c:0},{label:`Technical`,r:.1,c:0},{label:`Default`,r:.25,c:.05},{label:`Friendly`,r:.5,c:.15},{label:`Playful`,r:.8,c:.3}].map(e=>(0,T.jsxs)(o,{direction:`vertical`,hAlign:`center`,gap:0,children:[(0,T.jsx)(i,{type:`label`,style:{fontSize:10},children:e.label}),(0,T.jsxs)(i,{type:`supporting`,style:{fontSize:8},children:[`r:`,e.r,` c:`,e.c]})]},e.label)),n.map(([e,t])=>(0,T.jsxs)(w.Fragment,{children:[(0,T.jsx)(i,{type:`label`,style:{fontSize:11},children:e}),[{r:0,c:0},{r:.1,c:0},{r:.25,c:.05},{r:.5,c:.15},{r:.8,c:.3}].map((e,n)=>(0,T.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,T.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`40`,height:`40`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,T.jsx)(`path`,{d:_(t,{cornerRounding:e.r,segmentCurvature:e.c})})})},n))]},e))]})]})}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={3}>
      <Heading level={3}>XIF Spec Examples</Heading>
      <Text type="supporting">
        Icons defined using the Astryx Icon Format specification. Each demonstrates
        a different capability: stroke-only, two-layer knockout, composable
        slots, animation declarations, personality overrides, and bold geometry
        overrides.
      </Text>

      <div style={{
      display: 'grid',
      gridTemplateColumns: \`140px repeat(\${VARIATIONS.length}, 1fr)\`,
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

        {xifExamples.map(xif => {
        const def = xifToSvgIconDef(xif);
        const features: string[] = [];
        if (xif.slots?.length) {
          features.push('🔌 slots');
        }
        if (xif.paths.some(p => p.animate)) {
          features.push('✨ animated');
        }
        if (xif.paths.some(p => p.personality)) {
          features.push('🎨 personality');
        }
        if (xif.overrides) {
          features.push('🔀 overrides');
        }
        if (xif.paths.some(p => p.layer === 'secondary')) {
          features.push('📐 two-layer');
        }
        return <Fragment key={xif.name}>
              <div>
                <Text type="label" style={{
              fontSize: 11
            }}>
                  {xif.name}
                </Text>
                {features.length > 0 && <Text type="supporting" style={{
              fontSize: 9,
              marginTop: 2
            }}>
                    {features.join(' ')}
                  </Text>}
              </div>
              {VARIATIONS.map(v => <div key={\`\${xif.name}-\${v}\`} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
                  <SVGIcon icon={def} variation={v} size="lg" />
                </div>)}
            </Fragment>;
      })}
      </div>
    </Stack>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const shieldDef = xifToSvgIconDef(xifShield);
    const fileDef = xifToSvgIconDef(xifFile);
    // Manually demonstrate what slot composition would produce
    // (Until the component natively supports slots)
    const composedShieldCheck: SVGIconDef = {
      name: 'shield-check',
      primary: [...shieldDef.primary],
      secondary: [{
        type: 'path' as const,
        attrs: {
          d: 'M9 13l2 2 4-4'
        },
        role: 'stroke' as const
      }]
    };
    const composedShieldX: SVGIconDef = {
      name: 'shield-x',
      primary: [...shieldDef.primary],
      secondary: [{
        type: 'path' as const,
        attrs: {
          d: 'M9 9l6 6M15 9l-6 6'
        },
        role: 'stroke' as const
      }]
    };
    const composedFileText: SVGIconDef = {
      name: 'file-text',
      primary: [...fileDef.primary],
      secondary: [...(fileDef.secondary ?? []), {
        type: 'line' as const,
        attrs: {
          x1: '9',
          y1: '13',
          x2: '15',
          y2: '13'
        },
        role: 'stroke' as const
      }, {
        type: 'line' as const,
        attrs: {
          x1: '9',
          y1: '17',
          x2: '13',
          y2: '17'
        },
        role: 'stroke' as const
      }]
    };
    return <Stack direction="vertical" gap={3}>
        <Heading level={3}>Composition via Slots</Heading>
        <Text type="supporting">
          Icons with <code>slots</code> accept sub-icons. One shield base +
          different badges = many composed icons without extra path data.
        </Text>

        <Stack direction="horizontal" gap={4}>
          {[{
          label: 'shield (base)',
          def: shieldDef
        }, {
          label: 'shield-check',
          def: composedShieldCheck
        }, {
          label: 'shield-x',
          def: composedShieldX
        }, {
          label: 'file (base)',
          def: fileDef
        }, {
          label: 'file-text',
          def: composedFileText
        }].map(({
          label,
          def
        }) => <Stack key={label} direction="vertical" gap={1} hAlign="center">
              <Stack direction="horizontal" gap={2}>
                <SVGIcon icon={def} variation="linear" size="lg" />
                <SVGIcon icon={def} variation="bold" size="lg" />
              </Stack>
              <Text type="supporting" style={{
            fontSize: 10
          }}>
                {label}
              </Text>
            </Stack>)}
        </Stack>

        <Divider />

        <Heading level={4}>Slot Definition</Heading>
        <Text type="supporting">
          The shield icon defines:{' '}
          <code>
            slots: [&#123; name: &apos;badge&apos;, position:
            &apos;center&apos;, size: 0.42 &#125;]
          </code>
          . At render time, the component scales and positions the badge icon
          into the slot. The badge inherits the parent&apos;s variation and
          color.
        </Text>
      </Stack>;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const starDef = xifToSvgIconDef(xifStar);
    const homeDef = xifToSvgIconDef(xifHome);
    const bellDef = xifToSvgIconDef(xifBell);
    const presets = [{
      name: 'Brutalist',
      desc: 'Sharp corners, straight lines, tight curves'
    }, {
      name: 'Technical',
      desc: 'Minimal rounding, precise geometry'
    }, {
      name: 'Default',
      desc: 'Balanced — slight softening'
    }, {
      name: 'Friendly',
      desc: 'Rounded corners, subtle curves'
    }, {
      name: 'Playful',
      desc: 'Very rounded, bowed segments'
    }];
    return <Stack direction="vertical" gap={3}>
        <Heading level={3}>Personality Axes (Conceptual)</Heading>
        <Text type="supporting">
          Shape personality parameters adjust the <em>feel</em> of icons without
          changing their structure. All adjustments are relative, preserving the
          artist&apos;s hierarchy of sharp vs soft. These icons show the
          concept; path manipulation is not yet implemented.
        </Text>

        <div style={{
        display: 'grid',
        gridTemplateColumns: '120px repeat(5, 1fr)',
        gap: '12px 8px',
        alignItems: 'center'
      }}>
          <div />
          {presets.map(p => <Stack key={p.name} direction="vertical" gap={0} hAlign="center">
              <Text type="label" style={{
            fontSize: 10
          }}>
                {p.name}
              </Text>
              <Text type="supporting" style={{
            fontSize: 8
          }}>
                {p.desc}
              </Text>
            </Stack>)}

          {[{
          name: 'star',
          def: starDef
        }, {
          name: 'home',
          def: homeDef
        }, {
          name: 'bell',
          def: bellDef
        }].map(({
          name,
          def
        }) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {presets.map((p, i) => <div key={p.name} style={{
            display: 'flex',
            justifyContent: 'center',
            opacity: 0.3 + i * 0.175
          }}>
                  <SVGIcon icon={def} variation="linear" size="lg" strokeWidth={1.5 - i * 0.1} />
                </div>)}
            </Fragment>)}
        </div>

        <Text type="supporting">
          Note: opacity/stroke-width are used as visual placeholders here. The
          real implementation will modify path geometry, rounding corners,
          bowing segments, adjusting curve tension, all at build time via the
          theme pipeline.
        </Text>
      </Stack>;
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const animStyles = \`
      @keyframes xif-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
      @keyframes xif-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes xif-scale { from { transform: scale(0); } to { transform: scale(1); } }
      @keyframes xif-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .xif-draw path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: xif-draw 1.2s ease-out forwards; }
      .xif-draw path:nth-child(2) { animation-delay: 0.4s; }
      .xif-fade path { opacity: 0; animation: xif-fade 0.6s ease-out forwards; }
      .xif-fade path:nth-child(2) { animation-delay: 0.3s; }
      .xif-scale path { transform-origin: center; transform: scale(0); animation: xif-scale 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .xif-scale path:nth-child(2) { animation-delay: 0.2s; }
      .xif-rotate { transform-origin: center; animation: xif-rotate 2s linear infinite; }
    \`;
    const demos = [{
      name: 'draw',
      desc: 'Stroke reveals along path',
      cls: 'xif-draw',
      paths: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0']
    }, {
      name: 'fade',
      desc: 'Opacity entrance per layer',
      cls: 'xif-fade',
      paths: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'M9 12l2 2 4-4']
    }, {
      name: 'scale',
      desc: 'Grow from center',
      cls: 'xif-scale',
      paths: ['M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z']
    }, {
      name: 'rotate',
      desc: 'Continuous spin',
      cls: 'xif-rotate',
      paths: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z']
    }];
    return <Stack direction="vertical" gap={3}>
        <style dangerouslySetInnerHTML={{
        __html: animStyles
      }} />
        <Heading level={3}>Animation Types (Live)</Heading>
        <Text type="supporting">
          Icons declare animation intent per path. The theme resolves timing.
          Each demo loops on page load.
        </Text>

        <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24
      }}>
          {demos.map(demo => <Stack key={demo.name} direction="vertical" gap={1} hAlign="center" style={{
          padding: 16
        }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={demo.cls}>
                {demo.paths.map((d, i) => <path key={i} d={d} />)}
              </svg>
              <Text type="label" style={{
            fontSize: 12,
            marginTop: 8
          }}>
                {demo.name}
              </Text>
              <Text type="supporting" style={{
            fontSize: 10,
            textAlign: 'center'
          }}>
                {demo.desc}
              </Text>
            </Stack>)}
        </div>
      </Stack>;
  }
}`,...j.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    // We can't use hooks in stories without a wrapper,
    // so we render multiple preset rows instead
    const roundingLevels = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const curvatureLevels = [0, 0.2, 0.5, 0.8, 1.0];
    const shapes = Object.entries(testShapes);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Path Transform Playground</Heading>
        <Text type="supporting">
          Live path manipulation with sagitta-corrected corner rounding. Sharp
          corners (like star tips) round less aggressively than gentle corners,
          achieving equal <em>perceived</em> roundness at all angles.
        </Text>

        {/* Corner Rounding */}
        <Heading level={4}>Corner Rounding (sagitta-corrected)</Heading>
        <Text type="supporting">
          Same cornerRounding value across all shapes. Sharp corners get less
          radius, gentle corners get more, visually balanced.
        </Text>
        <div style={{
        display: 'grid',
        gridTemplateColumns: \`80px repeat(\${roundingLevels.length}, 1fr)\`,
        gap: '8px 4px',
        alignItems: 'center'
      }}>
          <div />
          {roundingLevels.map(r => <Text key={r} type="label" style={{
          textAlign: 'center',
          fontSize: 10
        }}>
              {r}
            </Text>)}
          {shapes.map(([name, d]) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {roundingLevels.map(r => <div key={r} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={roundCorners(d, r)} />
                  </svg>
                </div>)}
            </Fragment>)}
        </div>

        <Divider />

        {/* Segment Curvature */}
        <Heading level={4}>Segment Curvature</Heading>
        <Text type="supporting">
          Straight line segments gain a perpendicular bow. Subtle at low values,
          pronounced at high.
        </Text>
        <div style={{
        display: 'grid',
        gridTemplateColumns: \`80px repeat(\${curvatureLevels.length}, 1fr)\`,
        gap: '8px 4px',
        alignItems: 'center'
      }}>
          <div />
          {curvatureLevels.map(c => <Text key={c} type="label" style={{
          textAlign: 'center',
          fontSize: 10
        }}>
              {c}
            </Text>)}
          {shapes.slice(0, 5).map(([name, d]) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {curvatureLevels.map(c => <div key={c} style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={addCurvature(d, c)} />
                  </svg>
                </div>)}
            </Fragment>)}
        </div>

        <Divider />

        {/* Combined: Rounding + Curvature presets */}
        <Heading level={4}>
          Personality Presets (combined transforms)
        </Heading>
        <div style={{
        display: 'grid',
        gridTemplateColumns: \`80px repeat(5, 1fr)\`,
        gap: '8px 4px',
        alignItems: 'center'
      }}>
          <div />
          {[{
          label: 'Brutalist',
          r: 0,
          c: 0
        }, {
          label: 'Technical',
          r: 0.1,
          c: 0
        }, {
          label: 'Default',
          r: 0.25,
          c: 0.05
        }, {
          label: 'Friendly',
          r: 0.5,
          c: 0.15
        }, {
          label: 'Playful',
          r: 0.8,
          c: 0.3
        }].map(p => <Stack key={p.label} direction="vertical" hAlign="center" gap={0}>
              <Text type="label" style={{
            fontSize: 10
          }}>
                {p.label}
              </Text>
              <Text type="supporting" style={{
            fontSize: 8
          }}>
                r:{p.r} c:{p.c}
              </Text>
            </Stack>)}
          {shapes.map(([name, d]) => <Fragment key={name}>
              <Text type="label" style={{
            fontSize: 11
          }}>
                {name}
              </Text>
              {[{
            r: 0,
            c: 0
          }, {
            r: 0.1,
            c: 0
          }, {
            r: 0.25,
            c: 0.05
          }, {
            r: 0.5,
            c: 0.15
          }, {
            r: 0.8,
            c: 0.3
          }].map((p, i) => {
            const transformed = applyPersonality(d, {
              cornerRounding: p.r,
              segmentCurvature: p.c
            });
            return <div key={i} style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={transformed} />
                    </svg>
                  </div>;
          })}
            </Fragment>)}
        </div>
      </Stack>;
  }
}`,...N.parameters?.docs?.source},description:{story:`Interactive path transform playground.
Demonstrates corner rounding, segment curvature, and tension
with live SVG rendering.`,...N.parameters?.docs?.description}}},P=[`SpecExamples`,`CompositionSlots`,`PersonalityAxes`,`AnimationIntent`,`PathTransformPlayground`]}))();export{j as AnimationIntent,k as CompositionSlots,N as PathTransformPlayground,A as PersonalityAxes,O as SpecExamples,P as __namedExportsOrder,E as default};