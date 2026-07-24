import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{t as r}from"./Text-BUJwo4gL.js";import{i,t as a}from"./Link-Dbbw0J_w.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;e((()=>{a(),r(),o=t(),s={title:`Core/Link`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Accessible label (required)`},href:{control:`text`,description:`Link destination URL`},color:{control:`select`,options:[`accent`,`primary`,`secondary`,`disabled`,`placeholder`,`inherit`],description:`Text color`},hasUnderline:{control:`boolean`,description:`Always show underline`},isDisabled:{control:`boolean`,description:`Disabled state`},isExternalLink:{control:`boolean`,description:`Opens in new tab with external icon`},tooltip:{control:`text`,description:`Tooltip text on hover`},isStandalone:{control:`boolean`,description:`Standalone (applies base font sizing)`}}},c={args:{label:`Documentation`,href:`/docs`,children:`Documentation`}},l={args:{label:`Privacy Policy`,href:`/privacy`,color:`secondary`,children:`Privacy Policy`}},u={args:{label:`Learn more`,href:`/learn`,color:`primary`,children:`Learn more`}},d={args:{label:`Always underlined`,href:`/underlined`,hasUnderline:!0,children:`Always underlined`}},f={args:{label:`Disabled link`,href:`/disabled`,isDisabled:!0,children:`Disabled link`}},p={args:{label:`GitHub`,href:`https://github.com`,isExternalLink:!0,children:`GitHub`}},m={args:{label:`Settings`,href:`/settings`,tooltip:`Configure your preferences`,children:`Settings`}},h={args:{label:`Standalone Link`,href:`/standalone`,isStandalone:!0,children:`Standalone Link`}},g={render:()=>(0,o.jsxs)(n,{type:`body`,children:[`Read the `,(0,o.jsx)(i,{href:`/docs`,children:`documentation`}),` for more information about using Astryx components.`]})},_={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`,maxWidth:`600px`},children:[(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,o.jsx)(i,{href:`/active`,isStandalone:!0,children:`Active (default)`}),(0,o.jsx)(i,{href:`/primary`,color:`primary`,isStandalone:!0,children:`Primary`}),(0,o.jsx)(i,{href:`/secondary`,color:`secondary`,isStandalone:!0,children:`Secondary`}),(0,o.jsx)(i,{href:`/inherit`,color:`inherit`,isStandalone:!0,children:`Inherit`})]}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,o.jsx)(i,{href:`/underlined`,hasUnderline:!0,isStandalone:!0,children:`With underline`}),(0,o.jsx)(i,{href:`https://example.com`,isExternalLink:!0,isStandalone:!0,children:`External`}),(0,o.jsx)(i,{href:`/tooltip`,tooltip:`Helpful info`,isStandalone:!0,children:`With tooltip`})]}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,o.jsx)(i,{href:`/disabled`,isDisabled:!0,isStandalone:!0,children:`Disabled active`}),(0,o.jsx)(i,{href:`/disabled`,color:`secondary`,isDisabled:!0,isStandalone:!0,children:`Disabled secondary`})]})]})},v={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,o.jsx)(i,{href:`https://github.com`,isExternalLink:!0,isStandalone:!0,children:`GitHub`}),(0,o.jsx)(i,{href:`https://developer.mozilla.org`,isExternalLink:!0,isStandalone:!0,children:`MDN Web Docs`}),(0,o.jsx)(i,{href:`https://react.dev`,isExternalLink:!0,hasUnderline:!0,isStandalone:!0,children:`React Documentation`})]})},y={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,o.jsx)(i,{href:`/settings`,tooltip:`Configure your account settings`,isStandalone:!0,children:`Settings`}),(0,o.jsx)(i,{href:`/profile`,tooltip:`View and edit your profile`,isStandalone:!0,children:`Profile`}),(0,o.jsx)(i,{href:`/help`,tooltip:`Get help and support`,color:`secondary`,isStandalone:!0,children:`Help`})]})},b={args:{children:`Click me (no href)`,onClick:()=>alert(`Clicked!`)},parameters:{docs:{description:{story:"When `href` is undefined, Link renders a `<button>` with reset styles. Visually identical to a link, but semantically correct for actions that do not navigate."}}}},x={args:{children:`Disabled action`,isDisabled:!0},parameters:{docs:{description:{story:"The button fallback supports the `isDisabled` prop with native `disabled` attribute."}}}},S={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`,maxWidth:`600px`},children:[(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,o.jsx)(i,{onClick:()=>{},isStandalone:!0,children:`Active (default)`}),(0,o.jsx)(i,{onClick:()=>{},color:`primary`,isStandalone:!0,children:`Primary`}),(0,o.jsx)(i,{onClick:()=>{},color:`secondary`,isStandalone:!0,children:`Secondary`}),(0,o.jsx)(i,{onClick:()=>{},color:`inherit`,isStandalone:!0,children:`Inherit`})]}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,o.jsx)(i,{onClick:()=>{},hasUnderline:!0,isStandalone:!0,children:`With underline`}),(0,o.jsx)(i,{onClick:()=>{},tooltip:`Action tooltip`,isStandalone:!0,children:`With tooltip`}),(0,o.jsx)(i,{onClick:()=>{},isDisabled:!0,isStandalone:!0,children:`Disabled`})]})]}),parameters:{docs:{description:{story:`Button fallback supports all visual variants (color, underline, tooltip, disabled), visually indistinguishable from a regular link.`}}}},C={render:()=>(0,o.jsxs)(n,{type:`body`,children:[`You can `,(0,o.jsx)(i,{onClick:()=>alert(`Undo!`),children:`undo this action`}),` if you change your mind.`]}),parameters:{docs:{description:{story:"Button fallback works inline within text, just like a regular link. Inspect the DOM; it renders a `<button>` not an `<a>`."}}}},w={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`600px`},children:[(0,o.jsx)(n,{type:`large`,size:`sm`,children:`Link (with href) vs Button (without href)`}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`,alignItems:`center`},children:[(0,o.jsx)(i,{href:`/destination`,isStandalone:!0,children:`I navigate`}),(0,o.jsx)(n,{type:`body`,size:`sm`,color:`secondary`,children:`<a href="/destination">`})]}),(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`,alignItems:`center`},children:[(0,o.jsx)(i,{onClick:()=>alert(`Action!`),isStandalone:!0,children:`I act`}),(0,o.jsx)(n,{type:`body`,size:`sm`,color:`secondary`,children:`<button type="button">`})]})]}),(0,o.jsx)(n,{type:`body`,size:`sm`,color:`secondary`,children:`Both look the same, but inspect the DOM to see the semantic difference.`})]}),parameters:{docs:{description:{story:`Side-by-side comparison showing that links and button fallbacks are visually identical. The only difference is in the rendered DOM element.`}}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Documentation',
    href: '/docs',
    children: 'Documentation'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Privacy Policy',
    href: '/privacy',
    color: 'secondary',
    children: 'Privacy Policy'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Learn more',
    href: '/learn',
    color: 'primary',
    children: 'Learn more'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Always underlined',
    href: '/underlined',
    hasUnderline: true,
    children: 'Always underlined'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Disabled link',
    href: '/disabled',
    isDisabled: true,
    children: 'Disabled link'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'GitHub',
    href: 'https://github.com',
    isExternalLink: true,
    children: 'GitHub'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Settings',
    href: '/settings',
    tooltip: 'Configure your preferences',
    children: 'Settings'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Standalone Link',
    href: '/standalone',
    isStandalone: true,
    children: 'Standalone Link'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Text type="body">
      Read the <Link href="/docs">documentation</Link> for more information
      about using Astryx components.
    </Text>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '600px'
  }}>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Link href="/active" isStandalone>
          Active (default)
        </Link>
        <Link href="/primary" color="primary" isStandalone>
          Primary
        </Link>
        <Link href="/secondary" color="secondary" isStandalone>
          Secondary
        </Link>
        <Link href="/inherit" color="inherit" isStandalone>
          Inherit
        </Link>
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Link href="/underlined" hasUnderline isStandalone>
          With underline
        </Link>
        <Link href="https://example.com" isExternalLink isStandalone>
          External
        </Link>
        <Link href="/tooltip" tooltip="Helpful info" isStandalone>
          With tooltip
        </Link>
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Link href="/disabled" isDisabled isStandalone>
          Disabled active
        </Link>
        <Link href="/disabled" color="secondary" isDisabled isStandalone>
          Disabled secondary
        </Link>
      </div>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <Link href="https://github.com" isExternalLink isStandalone>
        GitHub
      </Link>
      <Link href="https://developer.mozilla.org" isExternalLink isStandalone>
        MDN Web Docs
      </Link>
      <Link href="https://react.dev" isExternalLink hasUnderline isStandalone>
        React Documentation
      </Link>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }}>
      <Link href="/settings" tooltip="Configure your account settings" isStandalone>
        Settings
      </Link>
      <Link href="/profile" tooltip="View and edit your profile" isStandalone>
        Profile
      </Link>
      <Link href="/help" tooltip="Get help and support" color="secondary" isStandalone>
        Help
      </Link>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Click me (no href)',
    onClick: () => alert('Clicked!')
  },
  parameters: {
    docs: {
      description: {
        story: 'When \`href\` is undefined, Link renders a \`<button>\` with reset styles. ' + 'Visually identical to a link, but semantically correct for actions that do not navigate.'
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Disabled action',
    isDisabled: true
  },
  parameters: {
    docs: {
      description: {
        story: 'The button fallback supports the \`isDisabled\` prop with native \`disabled\` attribute.'
      }
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '600px'
  }}>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Link onClick={() => {}} isStandalone>
          Active (default)
        </Link>
        <Link onClick={() => {}} color="primary" isStandalone>
          Primary
        </Link>
        <Link onClick={() => {}} color="secondary" isStandalone>
          Secondary
        </Link>
        <Link onClick={() => {}} color="inherit" isStandalone>
          Inherit
        </Link>
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Link onClick={() => {}} hasUnderline isStandalone>
          With underline
        </Link>
        <Link onClick={() => {}} tooltip="Action tooltip" isStandalone>
          With tooltip
        </Link>
        <Link onClick={() => {}} isDisabled isStandalone>
          Disabled
        </Link>
      </div>
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Button fallback supports all visual variants (color, underline, tooltip, disabled), ' + 'visually indistinguishable from a regular link.'
      }
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Text type="body">
      You can <Link onClick={() => alert('Undo!')}>undo this action</Link> if
      you change your mind.
    </Text>,
  parameters: {
    docs: {
      description: {
        story: 'Button fallback works inline within text, just like a regular link. ' + 'Inspect the DOM; it renders a \`<button>\` not an \`<a>\`.'
      }
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '600px'
  }}>
      <Text type="large" size="sm">
        Link (with href) vs Button (without href)
      </Text>
      <div style={{
      display: 'flex',
      gap: '24px',
      alignItems: 'center'
    }}>
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center'
      }}>
          <Link href="/destination" isStandalone>
            I navigate
          </Link>
          <Text type="body" size="sm" color="secondary">
            {'<a href="/destination">'}
          </Text>
        </div>
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center'
      }}>
          <Link onClick={() => alert('Action!')} isStandalone>
            I act
          </Link>
          <Text type="body" size="sm" color="secondary">
            {'<button type="button">'}
          </Text>
        </div>
      </div>
      <Text type="body" size="sm" color="secondary">
        Both look the same, but inspect the DOM to see the semantic difference.
      </Text>
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison showing that links and button fallbacks are visually identical. ' + 'The only difference is in the rendered DOM element.'
      }
    }
  }
}`,...w.parameters?.docs?.source}}},T=[`Default`,`Secondary`,`Primary`,`WithUnderline`,`Disabled`,`ExternalLink`,`WithTooltip`,`Standalone`,`InlineWithText`,`AllVariants`,`ExternalLinks`,`LinksWithTooltips`,`ButtonFallback`,`ButtonFallbackDisabled`,`ButtonFallbackVariants`,`ButtonFallbackInline`,`LinkVsButtonComparison`]}))();export{_ as AllVariants,b as ButtonFallback,x as ButtonFallbackDisabled,C as ButtonFallbackInline,S as ButtonFallbackVariants,c as Default,f as Disabled,p as ExternalLink,v as ExternalLinks,g as InlineWithText,w as LinkVsButtonComparison,y as LinksWithTooltips,u as Primary,l as Secondary,h as Standalone,m as WithTooltip,d as WithUnderline,T as __namedExportsOrder,s as default};