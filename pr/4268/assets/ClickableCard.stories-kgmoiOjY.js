import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Bt7jq58k.js";import{t as r}from"./Button-DlxrQzaK.js";import{t as i}from"./Button-PY4-RRjU.js";import{i as a,o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Layout-BvMyrLFX.js";import{t as c}from"./Text-BYms8e3u.js";import{mi as l,pi as u}from"./iframe-1XPcLcD3.js";var d,f,p,m,h,g,_,v;e((()=>{u(),c(),i(),s(),d=t(),f={title:`Core/ClickableCard`,component:l,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`default`,`transparent`,`muted`,`blue`,`cyan`,`gray`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`]}},parameters:{docs:{description:{component:"An interactive card for navigation or action targets. Nested interactive elements (buttons, links) work independently; clicking them does NOT trigger the card's onClick or navigation. Uses `useClickableContainer` internally."}}}},p={name:`Navigation (href)`,render:()=>(0,d.jsx)(l,{label:`Settings`,href:`/settings`,width:300,children:(0,d.jsxs)(a,{gap:1,children:[(0,d.jsx)(n,{type:`body`,weight:`bold`,children:`Settings`}),(0,d.jsx)(n,{type:`supporting`,color:`secondary`,children:`Manage your preferences`})]})}),parameters:{docs:{description:{story:"Card with `href`: clicking navigates. Ctrl/Cmd+click opens new tab. Middle-click opens new tab."}}}},m={name:`Action (onClick)`,render:()=>(0,d.jsx)(l,{label:`Open modal`,onClick:()=>alert(`Card clicked!`),width:300,children:(0,d.jsxs)(a,{gap:1,children:[(0,d.jsx)(n,{type:`body`,weight:`bold`,children:`Click me`}),(0,d.jsx)(n,{type:`supporting`,color:`secondary`,children:`Opens a modal`})]})}),parameters:{docs:{description:{story:"Card with `onClick`: fires the handler when the card surface is clicked."}}}},h={name:`Nested Interactive Elements`,render:()=>(0,d.jsx)(l,{label:`Product card`,href:`/product/123`,width:300,children:(0,d.jsxs)(a,{gap:2,children:[(0,d.jsx)(n,{type:`body`,weight:`bold`,children:`Product Name`}),(0,d.jsx)(n,{type:`supporting`,color:`secondary`,children:`$29.99`}),(0,d.jsx)(r,{label:`Add to cart`,onClick:()=>alert(`Added to cart! (card did NOT navigate)`),variant:`primary`})]})}),parameters:{docs:{description:{story:'The key feature: nested buttons/links work independently. Clicking "Add to cart" fires its own handler without triggering card navigation. This is handled by `useClickableContainer` which checks `hasInteractiveAncestor` on each click.'}}}},g={render:()=>(0,d.jsx)(l,{label:`Disabled card`,onClick:()=>{},isDisabled:!0,width:300,children:(0,d.jsxs)(a,{gap:1,children:[(0,d.jsx)(n,{type:`body`,weight:`bold`,children:`Disabled`}),(0,d.jsx)(n,{type:`supporting`,color:`secondary`,children:`This card cannot be clicked`})]})}),parameters:{docs:{description:{story:"`isDisabled` suppresses click, hover, focus, and sets `aria-disabled`. `tabIndex` becomes -1."}}}},_={name:`Color Variants`,render:()=>(0,d.jsx)(o,{gap:3,wrap:`wrap`,children:[`default`,`muted`,`transparent`,`blue`,`cyan`,`gray`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`].map(e=>(0,d.jsx)(l,{label:e,onClick:()=>alert(e),variant:e,width:140,children:(0,d.jsx)(n,{type:`body`,weight:`bold`,children:e})},e))}),parameters:{docs:{description:{story:`All color variants: same palette as Card. Color cards have transparent borders.`}}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Navigation (href)',
  render: () => <ClickableCard label="Settings" href="/settings" width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Settings
        </Text>
        <Text type="supporting" color="secondary">
          Manage your preferences
        </Text>
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: 'Card with \`href\`: clicking navigates. Ctrl/Cmd+click opens new tab. Middle-click opens new tab.'
      }
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Action (onClick)',
  render: () => <ClickableCard label="Open modal" onClick={() => alert('Card clicked!')} width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Click me
        </Text>
        <Text type="supporting" color="secondary">
          Opens a modal
        </Text>
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: 'Card with \`onClick\`: fires the handler when the card surface is clicked.'
      }
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Nested Interactive Elements',
  render: () => <ClickableCard label="Product card" href="/product/123" width={300}>
      <VStack gap={2}>
        <Text type="body" weight="bold">
          Product Name
        </Text>
        <Text type="supporting" color="secondary">
          $29.99
        </Text>
        <Button label="Add to cart" onClick={() => alert('Added to cart! (card did NOT navigate)')} variant="primary" />
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: 'The key feature: nested buttons/links work independently. ' + 'Clicking "Add to cart" fires its own handler without triggering card navigation. ' + 'This is handled by \`useClickableContainer\` which checks \`hasInteractiveAncestor\` on each click.'
      }
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <ClickableCard label="Disabled card" onClick={() => {}} isDisabled width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Disabled
        </Text>
        <Text type="supporting" color="secondary">
          This card cannot be clicked
        </Text>
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: '\`isDisabled\` suppresses click, hover, focus, and sets \`aria-disabled\`. \`tabIndex\` becomes -1.'
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Color Variants',
  render: () => {
    const variants = ['default', 'muted', 'transparent', 'blue', 'cyan', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'] as const;
    return <HStack gap={3} wrap="wrap">
        {variants.map(v => <ClickableCard key={v} label={v} onClick={() => alert(v)} variant={v} width={140}>
            <Text type="body" weight="bold">
              {v}
            </Text>
          </ClickableCard>)}
      </HStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'All color variants: same palette as Card. Color cards have transparent borders.'
      }
    }
  }
}`,..._.parameters?.docs?.source}}},v=[`Navigation`,`WithOnClick`,`NestedButton`,`Disabled`,`ColorVariants`]}))();export{_ as ColorVariants,g as Disabled,p as Navigation,h as NestedButton,m as WithOnClick,v as __namedExportsOrder,f as default};