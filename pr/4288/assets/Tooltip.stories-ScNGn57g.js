import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n}from"./useTooltip-CdbL6YrA.js";import{t as r}from"./Button-BBk5Kqd0.js";import{t as i}from"./Button-CRpvXAU4.js";import{t as a}from"./Tooltip-DvVkBZ2Q.js";import{t as o}from"./Tooltip-B1rE8XDl.js";import{o as s}from"./Stack-C7dTtCDZ.js";import{t as c}from"./Layout-BvMyrLFX.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;e((()=>{o(),i(),c(),l=t(),u={title:`Core/Tooltip`,component:a,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},delay:{control:`number`,description:`Show delay in ms`},hideDelay:{control:`number`,description:`Hide delay in ms`},isEnabled:{control:`boolean`,description:`Enable/disable the tooltip`}}},d={args:{placement:`above`,content:`This is a helpful tooltip`,children:(0,l.jsx)(r,{label:`Hover me`,children:`Hover me`})}},f={args:{placement:`below`,content:`Tooltip appears below`,children:(0,l.jsx)(r,{label:`Hover me`,children:`Hover me`})}},p={args:{placement:`start`,content:`Tooltip on start`,children:(0,l.jsx)(r,{label:`Hover me`,children:`Hover me`})}},m={args:{placement:`end`,content:`Tooltip on end`,children:(0,l.jsx)(r,{label:`Hover me`,children:`Hover me`})}},h={args:{placement:`above`,delay:500,content:`Slower tooltip (500ms delay)`,children:(0,l.jsx)(r,{label:`Slow tooltip`,children:`Slow tooltip`})}},g={name:`Disabled Tooltip`,args:{placement:`above`,isEnabled:!1,content:`You should not see this`,children:(0,l.jsx)(r,{label:`Hover me`,children:`Hover me`})},parameters:{docs:{description:{story:"Demonstrates disabling the tooltip via the `isEnabled` prop. When `isEnabled` is `false`, the tooltip will not appear on hover or focus, even though the trigger element remains fully interactive. This is useful for conditionally showing tooltips based on application state."}}}},_={render:()=>(0,l.jsxs)(`div`,{style:{padding:100,display:`flex`,gap:24,flexWrap:`wrap`},children:[(0,l.jsx)(a,{content:`Above`,placement:`above`,children:(0,l.jsx)(r,{label:`Above`,children:`Above`})}),(0,l.jsx)(a,{content:`Below`,placement:`below`,children:(0,l.jsx)(r,{label:`Below`,children:`Below`})}),(0,l.jsx)(a,{content:`Start`,placement:`start`,children:(0,l.jsx)(r,{label:`Start`,children:`Start`})}),(0,l.jsx)(a,{content:`End`,placement:`end`,children:(0,l.jsx)(r,{label:`End`,children:`End`})})]})},v={render:function(){let e=n({placement:`above`,delay:100});return(0,l.jsxs)(`div`,{style:{padding:100},children:[(0,l.jsx)(r,{label:`Using hook directly`,ref:e.ref,"aria-describedby":e.describedBy,children:`Using hook directly`}),e.renderTooltip(`Tooltip via hook`)]})}},y={args:{placement:`above`,content:`This is a longer tooltip that contains more detailed information about the element.`,children:(0,l.jsx)(r,{label:`Hover for more info`,children:`Hover for more info`})}},b={render:()=>(0,l.jsx)(`div`,{style:{padding:100},children:(0,l.jsxs)(s,{gap:4,children:[(0,l.jsx)(a,{content:`Save your changes`,placement:`above`,children:(0,l.jsx)(r,{label:`Save`,children:`Save`})}),(0,l.jsx)(a,{content:`Discard changes`,placement:`above`,children:(0,l.jsx)(r,{label:`Cancel`,children:`Cancel`})}),(0,l.jsx)(a,{content:`Delete permanently`,placement:`above`,children:(0,l.jsx)(r,{label:`Delete`,variant:`destructive`,children:`Delete`})})]})})},x={render:()=>(0,l.jsx)(`div`,{style:{padding:100},children:(0,l.jsxs)(`p`,{children:[`This paragraph contains a`,` `,(0,l.jsx)(a,{content:`Tooltip on inline text!`,placement:`above`,children:`hover-able term`}),` `,`that explains what something means.`]})})},S={render:()=>(0,l.jsx)(`div`,{style:{padding:100},children:(0,l.jsxs)(`p`,{children:[`Learn more about our`,` `,(0,l.jsx)(a,{content:`Your data is encrypted and never shared`,placement:`above`,children:`privacy policy`}),` `,`and`,` `,(0,l.jsx)(a,{content:`Standard 30-day agreement`,placement:`above`,children:`terms of service`}),`.`]})})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a helpful tooltip',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    content: 'Tooltip appears below',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    content: 'Tooltip on start',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    content: 'Tooltip on end',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    delay: 500,
    content: 'Slower tooltip (500ms delay)',
    children: <Button label="Slow tooltip">Slow tooltip</Button>
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Disabled Tooltip',
  args: {
    placement: 'above',
    isEnabled: false,
    content: 'You should not see this',
    children: <Button label="Hover me">Hover me</Button>
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates disabling the tooltip via the \`isEnabled\` prop. When \`isEnabled\` is \`false\`, the tooltip will not appear on hover or focus, even though the trigger element remains fully interactive. This is useful for conditionally showing tooltips based on application state.'
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100,
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap'
  }}>
      <Tooltip content="Above" placement="above">
        <Button label="Above">Above</Button>
      </Tooltip>
      <Tooltip content="Below" placement="below">
        <Button label="Below">Below</Button>
      </Tooltip>
      <Tooltip content="Start" placement="start">
        <Button label="Start">Start</Button>
      </Tooltip>
      <Tooltip content="End" placement="end">
        <Button label="End">End</Button>
      </Tooltip>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: function HookExample() {
    const tooltip = useTooltip({
      placement: 'above',
      delay: 100
    });
    return <div style={{
      padding: 100
    }}>
        <Button label="Using hook directly" ref={tooltip.ref} aria-describedby={tooltip.describedBy}>
          Using hook directly
        </Button>
        {tooltip.renderTooltip('Tooltip via hook')}
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a longer tooltip that contains more detailed information about the element.',
    children: <Button label="Hover for more info">Hover for more info</Button>
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <HStack gap={4}>
        <Tooltip content="Save your changes" placement="above">
          <Button label="Save">Save</Button>
        </Tooltip>
        <Tooltip content="Discard changes" placement="above">
          <Button label="Cancel">Cancel</Button>
        </Tooltip>
        <Tooltip content="Delete permanently" placement="above">
          <Button label="Delete" variant="destructive">
            Delete
          </Button>
        </Tooltip>
      </HStack>
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <p>
        This paragraph contains a{' '}
        <Tooltip content="Tooltip on inline text!" placement="above">
          hover-able term
        </Tooltip>{' '}
        that explains what something means.
      </p>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <p>
        Learn more about our{' '}
        <Tooltip content="Your data is encrypted and never shared" placement="above">
          privacy policy
        </Tooltip>{' '}
        and{' '}
        <Tooltip content="Standard 30-day agreement" placement="above">
          terms of service
        </Tooltip>
        .
      </p>
    </div>
}`,...S.parameters?.docs?.source}}},C=[`Default`,`Below`,`Start`,`End`,`CustomDelay`,`Disabled`,`AllPlacements`,`WithHook`,`LongContent`,`MultipleTooltips`,`TextNode`,`TextNodeInline`]}))();export{_ as AllPlacements,f as Below,h as CustomDelay,d as Default,g as Disabled,m as End,y as LongContent,b as MultipleTooltips,p as Start,x as TextNode,S as TextNodeInline,v as WithHook,C as __namedExportsOrder,u as default};