import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{t as r}from"./Heading-D-Ri_Mjs.js";import{t as i}from"./Text-BUJwo4gL.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;e((()=>{i(),a=t(),o={title:`Core/Heading`,component:r,tags:[`autodocs`],argTypes:{level:{control:`select`,options:[1,2,3,4,5,6],description:`Visual heading level (1-6)`},color:{control:`select`,options:[`primary`,`secondary`,`disabled`,`placeholder`,`accent`,`inherit`],description:`Text color`},display:{control:`select`,options:[`inline`,`block`],description:`Display mode`},maxLines:{control:`number`,description:`Maximum lines before truncation (0 = no truncation)`},textWrap:{control:`select`,options:[`wrap`,`nowrap`,`balance`,`pretty`],description:`Text wrapping behavior`},wordBreak:{control:`select`,options:[`break-word`,`break-all`],description:`Word break behavior`},hasStrikethrough:{control:`boolean`,description:`Apply strikethrough decoration`},hasCapsize:{control:`boolean`,description:`Enable optical alignment (text-box-trim)`},accessibilityLevel:{control:`select`,options:[1,2,3,4,5,6],description:`Semantic level for accessibility (aria-level)`}}},s={args:{level:1,children:`Heading Level 1 (24px)`}},c={args:{level:2,children:`Heading Level 2 (20px)`}},l={args:{level:3,children:`Heading Level 3 (17px)`}},u={args:{level:4,children:`Heading Level 4 (14px — base)`}},d={args:{level:5,children:`Heading Level 5 (12px)`}},f={args:{level:6,children:`Heading Level 6 (10px)`}},p={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,a.jsx)(n,{type:`supporting`,display:`block`,children:`Type scale: base=14px, ratio=1.2, h4 anchored to base. Sizes are computed from the geometric progression: size = base × ratio^step`}),(0,a.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`,marginTop:`8px`},children:[(0,a.jsx)(r,{level:1,children:`Heading 1 — 24px`}),(0,a.jsx)(r,{level:2,children:`Heading 2 — 20px`}),(0,a.jsx)(r,{level:3,children:`Heading 3 — 17px`}),(0,a.jsx)(r,{level:4,children:`Heading 4 — 14px (base)`}),(0,a.jsx)(r,{level:5,children:`Heading 5 — 12px`}),(0,a.jsx)(r,{level:6,children:`Heading 6 — 10px`})]})]})},m={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[(0,a.jsx)(r,{level:2,color:`primary`,children:`Primary heading (default)`}),(0,a.jsx)(r,{level:2,color:`secondary`,children:`Secondary heading`}),(0,a.jsx)(r,{level:2,color:`disabled`,children:`Disabled heading`}),(0,a.jsx)(r,{level:2,color:`placeholder`,children:`Placeholder heading`}),(0,a.jsx)(r,{level:2,color:`accent`,children:`Active heading (accent)`}),(0,a.jsx)(`div`,{style:{color:`purple`},children:(0,a.jsx)(r,{level:2,color:`inherit`,children:`Inherit heading (from parent)`})})]})},h={render:()=>(0,a.jsxs)(`div`,{children:[(0,a.jsxs)(`div`,{style:{marginBottom:`16px`},children:[(0,a.jsxs)(r,{level:3,display:`inline`,children:[`Inline H3`,` `]}),(0,a.jsxs)(r,{level:3,display:`inline`,children:[`flows together`,` `]}),(0,a.jsx)(r,{level:3,display:`inline`,children:`on the same line`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(r,{level:3,display:`block`,children:`Block H3 (default)`}),(0,a.jsx)(r,{level:3,display:`block`,children:`Each heading on its own line`})]})]})},g={render:()=>(0,a.jsx)(`div`,{style:{width:`300px`,border:`1px solid #ccc`,padding:`12px`},children:(0,a.jsx)(r,{level:2,maxLines:1,children:`Very Long Heading That Will Be Truncated To One Line With Ellipsis`})})},_={render:()=>(0,a.jsx)(`div`,{style:{width:`300px`,border:`1px solid #ccc`,padding:`12px`},children:(0,a.jsx)(r,{level:2,maxLines:2,children:`Very Long Heading That Will Be Truncated To Two Lines To Keep Card Layout Compact`})})},v={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,a.jsxs)(`div`,{children:[(0,a.jsx)(n,{type:`supporting`,display:`block`,children:`Normal heading: visual and semantic levels match`}),(0,a.jsx)(r,{level:2,children:`Section Title (h2, aria-level=2)`})]}),(0,a.jsxs)(`div`,{style:{marginTop:`16px`},children:[(0,a.jsx)(n,{type:`supporting`,display:`block`,children:`Sidebar heading: visual h2 but semantic h3 (doesn't affect main outline)`}),(0,a.jsx)(r,{level:2,accessibilityLevel:3,children:`Sidebar Section (looks like h2, aria-level=3)`})]})]})},y={args:{level:2,hasStrikethrough:!0,children:`Deprecated Section`}},b={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,a.jsxs)(`div`,{children:[(0,a.jsx)(n,{type:`label`,display:`block`,children:`Without capsize (red border shows extra space):`}),(0,a.jsx)(`div`,{style:{border:`1px solid red`,display:`inline-block`},children:(0,a.jsx)(r,{level:1,children:`Regular Heading`})})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(n,{type:`label`,display:`block`,children:`With capsize (optically aligned):`}),(0,a.jsx)(`div`,{style:{border:`1px solid red`,display:`inline-block`},children:(0,a.jsx)(r,{level:1,hasCapsize:!0,children:`Capsize Heading`})})]})]})},x={render:()=>(0,a.jsxs)(`div`,{style:{maxWidth:`800px`},children:[(0,a.jsx)(r,{level:1,children:`Dashboard Overview`}),(0,a.jsx)(n,{type:`supporting`,display:`block`,children:`Last updated 5 minutes ago`}),(0,a.jsxs)(`div`,{style:{marginTop:`32px`},children:[(0,a.jsx)(r,{level:2,children:`Recent Activity`}),(0,a.jsx)(n,{type:`body`,display:`block`,children:`Here's what's been happening in your workspace.`})]}),(0,a.jsxs)(`div`,{style:{marginTop:`24px`},children:[(0,a.jsx)(r,{level:3,children:`Today`}),(0,a.jsxs)(n,{type:`body`,display:`block`,children:[`• Project Alpha updated`,(0,a.jsx)(`br`,{}),`• 3 new comments`,(0,a.jsx)(`br`,{}),`• Task completed`]})]})]})},S={render:()=>(0,a.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fill, minmax(250px, 1fr))`,gap:`16px`,maxWidth:`800px`},children:[1,2,3].map(e=>(0,a.jsxs)(`div`,{style:{padding:`16px`,borderRadius:`8px`,border:`1px solid #e0e0e0`,boxShadow:`0 2px 4px rgba(0,0,0,0.1)`},children:[(0,a.jsxs)(r,{level:3,maxLines:1,children:[e===1&&`Very Long Card Title That Gets Truncated`,e===2&&`Another Card`,e===3&&`Third Card With An Even Longer Title That Will Be Truncated`]}),(0,a.jsx)(n,{type:`body`,maxLines:2,display:`block`,children:`This is a card description that might be quite long and needs to be truncated after two lines to keep the card compact and uniform.`}),(0,a.jsxs)(n,{type:`supporting`,display:`block`,children:[`Updated `,e,` hour`,e>1?`s`:``,` ago`]})]},e))})},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    level: 1,
    children: 'Heading Level 1 (24px)'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    level: 2,
    children: 'Heading Level 2 (20px)'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    level: 3,
    children: 'Heading Level 3 (17px)'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    level: 4,
    children: 'Heading Level 4 (14px — base)'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    level: 5,
    children: 'Heading Level 5 (12px)'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    level: 6,
    children: 'Heading Level 6 (10px)'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <Text type="supporting" display="block">
        Type scale: base=14px, ratio=1.2, h4 anchored to base. Sizes are
        computed from the geometric progression: size = base × ratio^step
      </Text>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginTop: '8px'
    }}>
        <Heading level={1}>Heading 1 — 24px</Heading>
        <Heading level={2}>Heading 2 — 20px</Heading>
        <Heading level={3}>Heading 3 — 17px</Heading>
        <Heading level={4}>Heading 4 — 14px (base)</Heading>
        <Heading level={5}>Heading 5 — 12px</Heading>
        <Heading level={6}>Heading 6 — 10px</Heading>
      </div>
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
      <Heading level={2} color="primary">
        Primary heading (default)
      </Heading>
      <Heading level={2} color="secondary">
        Secondary heading
      </Heading>
      <Heading level={2} color="disabled">
        Disabled heading
      </Heading>
      <Heading level={2} color="placeholder">
        Placeholder heading
      </Heading>
      <Heading level={2} color="accent">
        Active heading (accent)
      </Heading>
      <div style={{
      color: 'purple'
    }}>
        <Heading level={2} color="inherit">
          Inherit heading (from parent)
        </Heading>
      </div>
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <div style={{
      marginBottom: '16px'
    }}>
        <Heading level={3} display="inline">
          Inline H3{' '}
        </Heading>
        <Heading level={3} display="inline">
          flows together{' '}
        </Heading>
        <Heading level={3} display="inline">
          on the same line
        </Heading>
      </div>
      <div>
        <Heading level={3} display="block">
          Block H3 (default)
        </Heading>
        <Heading level={3} display="block">
          Each heading on its own line
        </Heading>
      </div>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '300px',
    border: '1px solid #ccc',
    padding: '12px'
  }}>
      <Heading level={2} maxLines={1}>
        Very Long Heading That Will Be Truncated To One Line With Ellipsis
      </Heading>
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '300px',
    border: '1px solid #ccc',
    padding: '12px'
  }}>
      <Heading level={2} maxLines={2}>
        Very Long Heading That Will Be Truncated To Two Lines To Keep Card
        Layout Compact
      </Heading>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <div>
        <Text type="supporting" display="block">
          Normal heading: visual and semantic levels match
        </Text>
        <Heading level={2}>Section Title (h2, aria-level=2)</Heading>
      </div>
      <div style={{
      marginTop: '16px'
    }}>
        <Text type="supporting" display="block">
          Sidebar heading: visual h2 but semantic h3 (doesn't affect main
          outline)
        </Text>
        <Heading level={2} accessibilityLevel={3}>
          Sidebar Section (looks like h2, aria-level=3)
        </Heading>
      </div>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    level: 2,
    hasStrikethrough: true,
    children: 'Deprecated Section'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <div>
        <Text type="label" display="block">
          Without capsize (red border shows extra space):
        </Text>
        <div style={{
        border: '1px solid red',
        display: 'inline-block'
      }}>
          <Heading level={1}>Regular Heading</Heading>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          With capsize (optically aligned):
        </Text>
        <div style={{
        border: '1px solid red',
        display: 'inline-block'
      }}>
          <Heading level={1} hasCapsize>
            Capsize Heading
          </Heading>
        </div>
      </div>
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: '800px'
  }}>
      <Heading level={1}>Dashboard Overview</Heading>
      <Text type="supporting" display="block">
        Last updated 5 minutes ago
      </Text>

      <div style={{
      marginTop: '32px'
    }}>
        <Heading level={2}>Recent Activity</Heading>
        <Text type="body" display="block">
          Here's what's been happening in your workspace.
        </Text>
      </div>

      <div style={{
      marginTop: '24px'
    }}>
        <Heading level={3}>Today</Heading>
        <Text type="body" display="block">
          • Project Alpha updated
          <br />
          • 3 new comments
          <br />• Task completed
        </Text>
      </div>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    maxWidth: '800px'
  }}>
      {[1, 2, 3].map(i => <div key={i} style={{
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
          <Heading level={3} maxLines={1}>
            {i === 1 && 'Very Long Card Title That Gets Truncated'}
            {i === 2 && 'Another Card'}
            {i === 3 && 'Third Card With An Even Longer Title That Will Be Truncated'}
          </Heading>
          <Text type="body" maxLines={2} display="block">
            This is a card description that might be quite long and needs to be
            truncated after two lines to keep the card compact and uniform.
          </Text>
          <Text type="supporting" display="block">
            Updated {i} hour{i > 1 ? 's' : ''} ago
          </Text>
        </div>)}
    </div>
}`,...S.parameters?.docs?.source}}},C=[`Level1`,`Level2`,`Level3`,`Level4`,`Level5`,`Level6`,`AllLevels`,`ColorVariants`,`DisplayModes`,`SingleLineTruncation`,`MultiLineTruncation`,`AccessibilityLevel`,`Strikethrough`,`Capsize`,`PageLayout`,`CardGrid`]}))();export{v as AccessibilityLevel,p as AllLevels,b as Capsize,S as CardGrid,m as ColorVariants,h as DisplayModes,s as Level1,c as Level2,l as Level3,u as Level4,d as Level5,f as Level6,_ as MultiLineTruncation,x as PageLayout,g as SingleLineTruncation,y as Strikethrough,C as __namedExportsOrder,o as default};