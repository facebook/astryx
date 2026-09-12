import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{i as n,t as r}from"./Avatar-Blf9wnMx.js";import{Oi as i,ji as a,ki as o}from"./iframe-CxTsj-5P.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b;e((()=>{i(),r(),s=t(),{fn:c}=__STORYBOOK_MODULE_TEST__,l={title:`Core/AvatarGroupOverflow`,component:o,tags:[`autodocs`],args:{count:2,onClick:void 0},argTypes:{count:{control:`number`},children:{control:`text`},onClick:{control:!1,description:`Callback for intentionally clickable overflow indicators.`},ref:{control:!1},xstyle:{control:!1,description:`stylex.create() value — not an inline style object.`}},render:e=>(0,s.jsxs)(a,{size:`lg`,children:[(0,s.jsx)(n,{name:`Alice`}),(0,s.jsx)(n,{name:`Bob`}),(0,s.jsx)(o,{...e})]})},u={},d={args:{onClick:c()}},f={args:{count:12,children:`12+`}},p={render:()=>(0,s.jsx)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[`xsm`,`sm`,`md`,`lg`,`xl`].map(e=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1txdalj`,children:[(0,s.jsx)(`p`,{className:`x9ynric x1ghz6dp`,children:e}),(0,s.jsxs)(a,{size:e,children:[(0,s.jsx)(n,{name:`Alice`}),(0,s.jsx)(o,{count:2})]})]},e))})},m={render:()=>(0,s.jsx)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz x1a02dak`,children:[`circle`,`rounded`,`square`].map(e=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1txdalj`,children:[(0,s.jsx)(`p`,{className:`x9ynric x1ghz6dp`,children:e}),(0,s.jsxs)(a,{size:`lg`,shape:e,children:[(0,s.jsx)(n,{name:`Alice`}),(0,s.jsx)(o,{count:2})]})]},e))})},h={args:{count:4912}},g={args:{count:0}},_={render:e=>(0,s.jsx)(o,{...e})},v={globals:{direction:`rtl`}},y={render:e=>(0,s.jsx)(`div`,{className:`xygnafs`,children:(0,s.jsxs)(a,{size:`lg`,children:[(0,s.jsx)(n,{name:`Alice`}),(0,s.jsx)(n,{name:`Bob`}),(0,s.jsx)(o,{...e})]})})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    onClick: fn()
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    count: 12,
    children: '12+'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.column)}>
      {(['xsm', 'sm', 'md', 'lg', 'xl'] as const).map(size => <div key={size} {...stylex.props(storyStyles.item)}>
          <p {...stylex.props(storyStyles.label)}>{size}</p>
          <AvatarGroup size={size}>
            <Avatar name="Alice" />
            <AvatarGroupOverflow count={2} />
          </AvatarGroup>
        </div>)}
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.row)}>
      {(['circle', 'rounded', 'square'] as const).map(shape => <div key={shape} {...stylex.props(storyStyles.item)}>
          <p {...stylex.props(storyStyles.label)}>{shape}</p>
          <AvatarGroup size="lg" shape={shape}>
            <Avatar name="Alice" />
            <AvatarGroupOverflow count={2} />
          </AvatarGroup>
        </div>)}
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    count: 4912
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    count: 0
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => <AvatarGroupOverflow {...args} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: 'rtl'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => <div {...stylex.props(storyStyles.narrow)}>
      <AvatarGroup size="lg">
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <AvatarGroupOverflow {...args} />
      </AvatarGroup>
    </div>
}`,...y.parameters?.docs?.source}}},b=[`Default`,`Clickable`,`CustomContent`,`AllSizes`,`AllShapes`,`LargeCount`,`ZeroCount`,`Standalone`,`RightToLeft`,`NarrowContainer`]}))();export{m as AllShapes,p as AllSizes,d as Clickable,f as CustomContent,u as Default,h as LargeCount,y as NarrowContainer,v as RightToLeft,_ as Standalone,g as ZeroCount,b as __namedExportsOrder,l as default};