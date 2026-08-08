import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./useTooltip-Cm0gpSWG.js";import{n as i,t as a}from"./Button-BVMvoKVE.js";import{r as o,t as s}from"./Tooltip-Ypc-fkfG.js";import{n as c,t as l}from"./HStack-DtZv8gmp.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{o(),r(),i(),c(),u=t(),d={title:`Core/Tooltip`,component:s,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},delay:{control:`number`,description:`Show delay in ms`},hideDelay:{control:`number`,description:`Hide delay in ms`},isEnabled:{control:`boolean`,description:`Enable/disable the tooltip`}}},f={args:{placement:`above`,content:`This is a helpful tooltip`,children:(0,u.jsx)(a,{label:`Hover me`,children:`Hover me`})}},p={args:{placement:`below`,content:`Tooltip appears below`,children:(0,u.jsx)(a,{label:`Hover me`,children:`Hover me`})}},m={args:{placement:`start`,content:`Tooltip on start`,children:(0,u.jsx)(a,{label:`Hover me`,children:`Hover me`})}},h={args:{placement:`end`,content:`Tooltip on end`,children:(0,u.jsx)(a,{label:`Hover me`,children:`Hover me`})}},g={args:{placement:`above`,delay:500,content:`Slower tooltip (500ms delay)`,children:(0,u.jsx)(a,{label:`Slow tooltip`,children:`Slow tooltip`})}},_={name:`Disabled Tooltip`,args:{placement:`above`,isEnabled:!1,content:`You should not see this`,children:(0,u.jsx)(a,{label:`Hover me`,children:`Hover me`})},parameters:{docs:{description:{story:"Demonstrates disabling the tooltip via the `isEnabled` prop. When `isEnabled` is `false`, the tooltip will not appear on hover or focus, even though the trigger element remains fully interactive. This is useful for conditionally showing tooltips based on application state."}}}},v={render:()=>(0,u.jsxs)(`div`,{style:{padding:100,display:`flex`,gap:24,flexWrap:`wrap`},children:[(0,u.jsx)(s,{content:`Above`,placement:`above`,children:(0,u.jsx)(a,{label:`Above`,children:`Above`})}),(0,u.jsx)(s,{content:`Below`,placement:`below`,children:(0,u.jsx)(a,{label:`Below`,children:`Below`})}),(0,u.jsx)(s,{content:`Start`,placement:`start`,children:(0,u.jsx)(a,{label:`Start`,children:`Start`})}),(0,u.jsx)(s,{content:`End`,placement:`end`,children:(0,u.jsx)(a,{label:`End`,children:`End`})})]})},y={render:function(){let e=n({placement:`above`,delay:100});return(0,u.jsxs)(`div`,{style:{padding:100},children:[(0,u.jsx)(a,{label:`Using hook directly`,ref:e.ref,"aria-describedby":e.describedBy,children:`Using hook directly`}),e.renderTooltip(`Tooltip via hook`)]})}},b={args:{placement:`above`,content:`This is a longer tooltip that contains more detailed information about the element.`,children:(0,u.jsx)(a,{label:`Hover for more info`,children:`Hover for more info`})}},x={render:()=>(0,u.jsx)(`div`,{style:{padding:100},children:(0,u.jsxs)(l,{gap:4,children:[(0,u.jsx)(s,{content:`Save your changes`,placement:`above`,children:(0,u.jsx)(a,{label:`Save`,children:`Save`})}),(0,u.jsx)(s,{content:`Discard changes`,placement:`above`,children:(0,u.jsx)(a,{label:`Cancel`,children:`Cancel`})}),(0,u.jsx)(s,{content:`Delete permanently`,placement:`above`,children:(0,u.jsx)(a,{label:`Delete`,variant:`destructive`,children:`Delete`})})]})})},S={render:()=>(0,u.jsx)(`div`,{style:{padding:100},children:(0,u.jsxs)(`p`,{children:[`This paragraph contains a`,` `,(0,u.jsx)(s,{content:`Tooltip on inline text!`,placement:`above`,children:`hover-able term`}),` `,`that explains what something means.`]})})},C={render:()=>(0,u.jsx)(`div`,{style:{padding:100},children:(0,u.jsxs)(`p`,{children:[`Learn more about our`,` `,(0,u.jsx)(s,{content:`Your data is encrypted and never shared`,placement:`above`,children:`privacy policy`}),` `,`and`,` `,(0,u.jsx)(s,{content:`Standard 30-day agreement`,placement:`above`,children:`terms of service`}),`.`]})})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a helpful tooltip',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    content: 'Tooltip appears below',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    content: 'Tooltip on start',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    content: 'Tooltip on end',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    delay: 500,
    content: 'Slower tooltip (500ms delay)',
    children: <Button label="Slow tooltip">Slow tooltip</Button>
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a longer tooltip that contains more detailed information about the element.',
    children: <Button label="Hover for more info">Hover for more info</Button>
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w=[`Default`,`Below`,`Start`,`End`,`CustomDelay`,`Disabled`,`AllPlacements`,`WithHook`,`LongContent`,`MultipleTooltips`,`TextNode`,`TextNodeInline`]})))()}T();export{v as AllPlacements,p as Below,g as CustomDelay,f as Default,_ as Disabled,h as End,b as LongContent,x as MultipleTooltips,m as Start,S as TextNode,C as TextNodeInline,y as WithHook,w as __namedExportsOrder,d as default};