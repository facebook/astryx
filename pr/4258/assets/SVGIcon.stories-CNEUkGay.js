import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Bt7jq58k.js";import{t as a}from"./Heading-DaPZub_W.js";import{c as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BYms8e3u.js";import{t as c}from"./Divider-CyxlzlSx.js";import{u as l}from"./iframe-4XAMyx57.js";import{$t as u,Gt as d,Jt as f,Qt as p,Ut as m,Wt as h,Xt as g,Yt as _,Zt as v,qt as y,t as b}from"./src-C4_c7Msj.js";var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;e((()=>{x=t(n()),b(),l(),s(),S=r(),C={title:`Lab/SVGIcon`,component:u,argTypes:{variation:{control:`select`,options:[`linear`,`bold`,`twotone`,`bulk`,`broken`]},size:{control:`select`,options:[`xsm`,`sm`,`md`,`lg`]},color:{control:`select`,options:[`primary`,`secondary`,`disabled`,`accent`,`positive`,`negative`,`warning`,`inherit`]},strokeWidth:{control:{type:`range`,min:.5,max:4,step:.25}}}},w={args:{icon:m,variation:`linear`,size:`lg`,color:`primary`}},T=[`linear`,`bold`,`twotone`,`bulk`,`broken`],E={render:()=>(0,S.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,S.jsx)(a,{level:3,children:`Variation Matrix`}),(0,S.jsx)(i,{type:`supporting`,color:`secondary`,children:`Same SVG paths, different visual treatments via CSS custom properties. Note how stroke-role elements (menu lines, calendar pegs, bell clapper) stay as strokes even in bold/bulk mode.`}),(0,S.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`120px repeat(${T.length}, 1fr)`,gap:12,alignItems:`center`},children:[(0,S.jsx)(`div`,{}),T.map(e=>(0,S.jsx)(i,{type:`label`,color:`secondary`,style:{textAlign:`center`},children:e},e)),p.map(e=>(0,S.jsxs)(x.Fragment,{children:[(0,S.jsx)(i,{type:`label`,children:e.name}),T.map(t=>(0,S.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,S.jsx)(u,{icon:e,variation:t,size:`lg`})},`${e.name}-${t}`))]},e.name))]})]})},D={render:()=>(0,S.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,S.jsx)(a,{level:3,children:`Path Roles: Fill vs Stroke`}),(0,S.jsx)(i,{type:`supporting`,color:`secondary`,children:`Stroke-role elements always stay as strokes. Fill-role elements switch between stroke (linear) and fill (bold). Compare Menu (all stroke-role) vs Home (fill-role body + fill-role door with mask knockout).`}),(0,S.jsxs)(o,{direction:`vertical`,gap:2,children:[(0,S.jsx)(i,{type:`label`,color:`secondary`,children:`Menu — all stroke-role (lines never become fills)`}),(0,S.jsx)(o,{direction:`horizontal`,gap:3,children:T.map(e=>(0,S.jsxs)(o,{direction:`vertical`,gap:.5,hAlign:`center`,children:[(0,S.jsx)(u,{icon:_,variation:e,size:`lg`}),(0,S.jsx)(i,{type:`label`,color:`secondary`,children:e})]},e))}),(0,S.jsx)(c,{}),(0,S.jsx)(i,{type:`label`,color:`secondary`,children:`Home — fill-role body + door (mask gap in bold)`}),(0,S.jsx)(o,{direction:`horizontal`,gap:3,children:T.map(e=>(0,S.jsxs)(o,{direction:`vertical`,gap:.5,hAlign:`center`,children:[(0,S.jsx)(u,{icon:d,variation:e,size:`lg`}),(0,S.jsx)(i,{type:`label`,color:`secondary`,children:e})]},e))}),(0,S.jsx)(c,{}),(0,S.jsx)(i,{type:`label`,color:`secondary`,children:`Settings — fill-role gear + circle (mask gap in bold)`}),(0,S.jsx)(o,{direction:`horizontal`,gap:3,children:T.map(e=>(0,S.jsxs)(o,{direction:`vertical`,gap:.5,hAlign:`center`,children:[(0,S.jsx)(u,{icon:v,variation:e,size:`lg`}),(0,S.jsx)(i,{type:`label`,color:`secondary`,children:e})]},e))})]})]})},O=[`xsm`,`sm`,`md`,`lg`],k={render:()=>(0,S.jsxs)(o,{direction:`vertical`,gap:2,children:[(0,S.jsx)(a,{level:3,children:`Size Scale with Optical Compensation`}),(0,S.jsx)(i,{type:`supporting`,color:`secondary`,children:`Stroke width auto-adjusts at smaller sizes for legibility.`}),(0,S.jsx)(o,{direction:`horizontal`,gap:3,vAlign:`end`,children:O.map(e=>(0,S.jsxs)(o,{direction:`vertical`,gap:1,hAlign:`center`,children:[(0,S.jsx)(u,{icon:v,variation:`linear`,size:e}),(0,S.jsx)(i,{type:`label`,color:`secondary`,children:e})]},e))})]})},A=[`primary`,`secondary`,`disabled`,`accent`,`positive`,`negative`,`warning`],j={render:()=>(0,S.jsxs)(o,{direction:`vertical`,gap:2,children:[(0,S.jsx)(a,{level:3,children:`Semantic Colors`}),(0,S.jsx)(o,{direction:`horizontal`,gap:3,children:A.map(e=>(0,S.jsxs)(o,{direction:`vertical`,gap:1,hAlign:`center`,children:[(0,S.jsx)(u,{icon:m,variation:`linear`,size:`lg`,color:e}),(0,S.jsx)(i,{type:`label`,color:`secondary`,children:e})]},e))})]})},M=[d,v,h,g,f,y],N={render:()=>(0,S.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,S.jsx)(a,{level:3,children:`Mask Gaps on Different Backgrounds`}),(0,S.jsx)(i,{type:`supporting`,color:`secondary`,children:`Bold mode uses mask-based knockout gaps. Because the gap is transparent (not white), it works on any background: solid colors, surfaces, and gradients alike.`}),[{label:`White`,bg:`#ffffff`},{label:`Surface`,bg:`#f5f5f5`},{label:`Accent`,bg:`#0066ff`},{label:`Gradient`,bg:`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`}].map(({label:e,bg:t})=>(0,S.jsxs)(o,{direction:`vertical`,gap:1,children:[(0,S.jsx)(i,{type:`label`,color:`secondary`,children:e}),(0,S.jsx)(`div`,{style:{background:t,padding:16,borderRadius:8,display:`flex`,gap:16},children:M.map(t=>(0,S.jsx)(u,{icon:t,variation:`bold`,size:`lg`,color:e===`White`||e===`Surface`?`primary`:`inherit`,style:e===`Accent`||e===`Gradient`?{color:`#ffffff`}:void 0},t.name))})]},e))]})},P=[1,1.5,2,2.5,3],F={render:()=>(0,S.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,S.jsx)(a,{level:3,children:`Stroke Width Range`}),(0,S.jsx)(i,{type:`supporting`,color:`secondary`,children:`Linear mode at stroke widths from 1 to 3. Thinner strokes feel lighter and more refined; thicker strokes add visual weight.`}),(0,S.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`80px repeat(${P.length}, 1fr)`,gap:12,alignItems:`center`},children:[(0,S.jsx)(`div`,{}),P.map(e=>(0,S.jsx)(i,{type:`label`,color:`secondary`,style:{textAlign:`center`},children:e},e)),p.slice(0,8).map(e=>(0,S.jsxs)(x.Fragment,{children:[(0,S.jsx)(i,{type:`label`,children:e.name}),P.map(t=>(0,S.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,S.jsx)(u,{icon:e,variation:`linear`,size:`lg`,strokeWidth:t})},`${e.name}-${t}`))]},e.name))]})]})},I={render:()=>(0,S.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,S.jsx)(a,{level:3,children:`Structural Diversity`}),(0,S.jsx)(i,{type:`supporting`,color:`secondary`,children:`New icons with diverse structures: organic curves, complex single paths, nested overlapping fills, and mixed fill+stroke roles, across all five variations.`}),(0,S.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`120px repeat(${T.length}, 1fr)`,gap:12,alignItems:`center`},children:[(0,S.jsx)(`div`,{}),T.map(e=>(0,S.jsx)(i,{type:`label`,color:`secondary`,style:{textAlign:`center`},children:e},e)),p.slice(7).map(e=>(0,S.jsxs)(x.Fragment,{children:[(0,S.jsx)(i,{type:`label`,children:e.name}),T.map(t=>(0,S.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,S.jsx)(u,{icon:e,variation:t,size:`lg`})},`${e.name}-${t}`))]},e.name))]})]})},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    icon: bellIcon,
    variation: 'linear',
    size: 'lg',
    color: 'primary'
  }
}`,...w.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={3}>
      <Heading level={3}>Variation Matrix</Heading>
      <Text type="supporting" color="secondary">
        Same SVG paths, different visual treatments via CSS custom properties.
        Note how stroke-role elements (menu lines, calendar pegs, bell clapper)
        stay as strokes even in bold/bulk mode.
      </Text>
      <div style={{
      display: 'grid',
      gridTemplateColumns: \`120px repeat(\${VARIATIONS.length}, 1fr)\`,
      gap: 12,
      alignItems: 'center'
    }}>
        {/* Header row */}
        <div />
        {VARIATIONS.map(v => <Text key={v} type="label" color="secondary" style={{
        textAlign: 'center'
      }}>
            {v}
          </Text>)}

        {/* Icon rows */}
        {starterIcons.map(icon => <Fragment key={icon.name}>
            <Text type="label">{icon.name}</Text>
            {VARIATIONS.map(v => <div key={\`\${icon.name}-\${v}\`} style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
                <SVGIcon icon={icon} variation={v} size="lg" />
              </div>)}
          </Fragment>)}
      </div>
    </Stack>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={3}>
      <Heading level={3}>Path Roles: Fill vs Stroke</Heading>
      <Text type="supporting" color="secondary">
        Stroke-role elements always stay as strokes. Fill-role elements switch
        between stroke (linear) and fill (bold). Compare Menu (all stroke-role)
        vs Home (fill-role body + fill-role door with mask knockout).
      </Text>

      <Stack direction="vertical" gap={2}>
        <Text type="label" color="secondary">
          Menu — all stroke-role (lines never become fills)
        </Text>
        <Stack direction="horizontal" gap={3}>
          {VARIATIONS.map(v => <Stack direction="vertical" key={v} gap={0.5} hAlign="center">
              <SVGIcon icon={menuIcon} variation={v} size="lg" />
              <Text type="label" color="secondary">
                {v}
              </Text>
            </Stack>)}
        </Stack>

        <Divider />

        <Text type="label" color="secondary">
          Home — fill-role body + door (mask gap in bold)
        </Text>
        <Stack direction="horizontal" gap={3}>
          {VARIATIONS.map(v => <Stack direction="vertical" key={v} gap={0.5} hAlign="center">
              <SVGIcon icon={homeIcon} variation={v} size="lg" />
              <Text type="label" color="secondary">
                {v}
              </Text>
            </Stack>)}
        </Stack>

        <Divider />

        <Text type="label" color="secondary">
          Settings — fill-role gear + circle (mask gap in bold)
        </Text>
        <Stack direction="horizontal" gap={3}>
          {VARIATIONS.map(v => <Stack direction="vertical" key={v} gap={0.5} hAlign="center">
              <SVGIcon icon={settingsIcon} variation={v} size="lg" />
              <Text type="label" color="secondary">
                {v}
              </Text>
            </Stack>)}
        </Stack>
      </Stack>
    </Stack>
}`,...D.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={2}>
      <Heading level={3}>Size Scale with Optical Compensation</Heading>
      <Text type="supporting" color="secondary">
        Stroke width auto-adjusts at smaller sizes for legibility.
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="end">
        {SIZES.map(size => <Stack direction="vertical" key={size} gap={1} hAlign="center">
            <SVGIcon icon={settingsIcon} variation="linear" size={size} />
            <Text type="label" color="secondary">
              {size}
            </Text>
          </Stack>)}
      </Stack>
    </Stack>
}`,...k.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={2}>
      <Heading level={3}>Semantic Colors</Heading>
      <Stack direction="horizontal" gap={3}>
        {COLORS.map(c => <Stack direction="vertical" key={c} gap={1} hAlign="center">
            <SVGIcon icon={bellIcon} variation="linear" size="lg" color={c} />
            <Text type="label" color="secondary">
              {c}
            </Text>
          </Stack>)}
      </Stack>
    </Stack>
}`,...j.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={3}>
      <Heading level={3}>Mask Gaps on Different Backgrounds</Heading>
      <Text type="supporting" color="secondary">
        Bold mode uses mask-based knockout gaps. Because the gap is transparent
        (not white), it works on any background: solid colors, surfaces, and
        gradients alike.
      </Text>

      {[{
      label: 'White',
      bg: '#ffffff'
    }, {
      label: 'Surface',
      bg: '#f5f5f5'
    }, {
      label: 'Accent',
      bg: '#0066ff'
    }, {
      label: 'Gradient',
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }].map(({
      label,
      bg
    }) => <Stack direction="vertical" key={label} gap={1}>
          <Text type="label" color="secondary">
            {label}
          </Text>
          <div style={{
        background: bg,
        padding: 16,
        borderRadius: 8,
        display: 'flex',
        gap: 16
      }}>
            {MASK_GAP_ICONS.map(icon => <SVGIcon key={icon.name} icon={icon} variation="bold" size="lg" color={label === 'White' || label === 'Surface' ? 'primary' : 'inherit'} style={label === 'Accent' || label === 'Gradient' ? {
          color: '#ffffff'
        } : undefined} />)}
          </div>
        </Stack>)}
    </Stack>
}`,...N.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={3}>
      <Heading level={3}>Stroke Width Range</Heading>
      <Text type="supporting" color="secondary">
        Linear mode at stroke widths from 1 to 3. Thinner strokes feel lighter
        and more refined; thicker strokes add visual weight.
      </Text>
      <div style={{
      display: 'grid',
      gridTemplateColumns: \`80px repeat(\${STROKE_WIDTHS.length}, 1fr)\`,
      gap: 12,
      alignItems: 'center'
    }}>
        {/* Header row */}
        <div />
        {STROKE_WIDTHS.map(w => <Text key={w} type="label" color="secondary" style={{
        textAlign: 'center'
      }}>
            {w}
          </Text>)}

        {/* Icon rows — first 8 starterIcons */}
        {starterIcons.slice(0, 8).map(icon => <Fragment key={icon.name}>
            <Text type="label">{icon.name}</Text>
            {STROKE_WIDTHS.map(w => <div key={\`\${icon.name}-\${w}\`} style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
                <SVGIcon icon={icon} variation="linear" size="lg" strokeWidth={w} />
              </div>)}
          </Fragment>)}
      </div>
    </Stack>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={3}>
      <Heading level={3}>Structural Diversity</Heading>
      <Text type="supporting" color="secondary">
        New icons with diverse structures: organic curves, complex single paths,
        nested overlapping fills, and mixed fill+stroke roles, across all five
        variations.
      </Text>
      <div style={{
      display: 'grid',
      gridTemplateColumns: \`120px repeat(\${VARIATIONS.length}, 1fr)\`,
      gap: 12,
      alignItems: 'center'
    }}>
        {/* Header row */}
        <div />
        {VARIATIONS.map(v => <Text key={v} type="label" color="secondary" style={{
        textAlign: 'center'
      }}>
            {v}
          </Text>)}

        {/* Icon rows — new icons only */}
        {starterIcons.slice(7).map(icon => <Fragment key={icon.name}>
            <Text type="label">{icon.name}</Text>
            {VARIATIONS.map(v => <div key={\`\${icon.name}-\${v}\`} style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
                <SVGIcon icon={icon} variation={v} size="lg" />
              </div>)}
          </Fragment>)}
      </div>
    </Stack>
}`,...I.parameters?.docs?.source}}},L=[`Default`,`VariationMatrix`,`RoleBehavior`,`SizeScale`,`Colors`,`MaskGaps`,`StrokeWidthRange`,`StructuralDiversity`]}))();export{j as Colors,w as Default,N as MaskGaps,D as RoleBehavior,k as SizeScale,F as StrokeWidthRange,I as StructuralDiversity,E as VariationMatrix,L as __namedExportsOrder,C as default};