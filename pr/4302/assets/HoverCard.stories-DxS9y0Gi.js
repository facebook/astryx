import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-BBk5Kqd0.js";import{t as r}from"./Button-CRpvXAU4.js";import{a as i,n as a,t as o}from"./HoverCard-OZCGjVHq.js";import{i as s,o as c}from"./Stack-C7dTtCDZ.js";import{t as l}from"./Layout-BvMyrLFX.js";function u(){return(0,d.jsx)(`div`,{style:{width:200},children:(0,d.jsxs)(s,{gap:2,children:[(0,d.jsx)(`div`,{style:{fontWeight:600},children:`Jane Doe`}),(0,d.jsx)(`div`,{style:{fontSize:14,opacity:.7},children:`Software Engineer`}),(0,d.jsx)(`div`,{style:{fontSize:13},children:`Building great products with great people.`})]})})}var d,f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{o(),r(),l(),d=t(),f={title:`Core/HoverCard`,component:a,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},delay:{control:`number`,description:`Show delay in ms`},hideDelay:{control:`number`,description:`Hide delay in ms`},isEnabled:{control:`boolean`,description:`Enable/disable the hover card`}}},p={args:{placement:`above`,content:(0,d.jsx)(u,{}),children:(0,d.jsx)(n,{label:`Hover me`,children:`Hover me`})}},m={args:{placement:`below`,content:(0,d.jsx)(u,{}),children:(0,d.jsx)(n,{label:`Hover me`,children:`Hover me`})}},h={args:{placement:`start`,content:(0,d.jsx)(u,{}),children:(0,d.jsx)(n,{label:`Hover me`,children:`Hover me`})}},g={args:{placement:`end`,content:(0,d.jsx)(u,{}),children:(0,d.jsx)(n,{label:`Hover me`,children:`Hover me`})}},_={args:{placement:`above`,delay:500,hideDelay:300,content:(0,d.jsx)(u,{}),children:(0,d.jsx)(n,{label:`Slow hover (500ms)`,children:`Slow hover (500ms)`})}},v={args:{placement:`above`,isEnabled:!1,content:(0,d.jsx)(u,{}),children:(0,d.jsx)(n,{label:`Hover disabled`,children:`Hover disabled`})}},y={render:()=>(0,d.jsxs)(`div`,{style:{padding:100,display:`flex`,gap:24,flexWrap:`wrap`},children:[(0,d.jsx)(a,{content:(0,d.jsx)(u,{}),placement:`above`,children:(0,d.jsx)(n,{label:`Above`,children:`Above`})}),(0,d.jsx)(a,{content:(0,d.jsx)(u,{}),placement:`below`,children:(0,d.jsx)(n,{label:`Below`,children:`Below`})}),(0,d.jsx)(a,{content:(0,d.jsx)(u,{}),placement:`start`,children:(0,d.jsx)(n,{label:`Start`,children:`Start`})}),(0,d.jsx)(a,{content:(0,d.jsx)(u,{}),placement:`end`,children:(0,d.jsx)(n,{label:`End`,children:`End`})})]})},b={render:function(){let e=i({placement:`above`,delay:200});return(0,d.jsxs)(`div`,{style:{padding:100},children:[(0,d.jsx)(n,{label:`Using hook directly`,ref:e.ref,"aria-describedby":e.describedBy,children:`Using hook directly`}),e.renderHoverCard((0,d.jsx)(u,{}))]})}},x={render:()=>(0,d.jsx)(`div`,{style:{padding:100},children:(0,d.jsx)(a,{placement:`below`,content:(0,d.jsxs)(s,{gap:2,children:[(0,d.jsx)(`div`,{children:`Interactive hover card content`}),(0,d.jsxs)(c,{gap:2,children:[(0,d.jsx)(n,{label:`Follow`,variant:`primary`,children:`Follow`}),(0,d.jsx)(n,{label:`Message`,children:`Message`})]})]}),children:(0,d.jsx)(n,{label:`Hover for interactive content`,children:`Hover for interactive content`})})})},S={render:()=>(0,d.jsx)(`div`,{style:{padding:100},children:(0,d.jsxs)(`p`,{children:[`This feature was created by`,` `,(0,d.jsx)(a,{content:(0,d.jsx)(u,{}),placement:`above`,children:`Jane Doe`}),` `,`and shipped last week.`]})})},C={render:()=>(0,d.jsx)(`div`,{style:{padding:100},children:(0,d.jsxs)(`p`,{children:[`The project is maintained by`,` `,(0,d.jsx)(a,{content:(0,d.jsx)(u,{}),placement:`above`,children:`Jane Doe`}),`,`,` `,(0,d.jsx)(a,{content:(0,d.jsx)(`div`,{style:{width:200},children:(0,d.jsxs)(s,{gap:2,children:[(0,d.jsx)(`div`,{style:{fontWeight:600},children:`John Smith`}),(0,d.jsx)(`div`,{style:{fontSize:14,opacity:.7},children:`Product Manager`})]})}),placement:`above`,children:`John Smith`}),`, and others.`]})})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    delay: 500,
    hideDelay: 300,
    content: <ProfileCard />,
    children: <Button label="Slow hover (500ms)">Slow hover (500ms)</Button>
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    isEnabled: false,
    content: <ProfileCard />,
    children: <Button label="Hover disabled">Hover disabled</Button>
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100,
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap'
  }}>
      <HoverCard content={<ProfileCard />} placement="above">
        <Button label="Above">Above</Button>
      </HoverCard>
      <HoverCard content={<ProfileCard />} placement="below">
        <Button label="Below">Below</Button>
      </HoverCard>
      <HoverCard content={<ProfileCard />} placement="start">
        <Button label="Start">Start</Button>
      </HoverCard>
      <HoverCard content={<ProfileCard />} placement="end">
        <Button label="End">End</Button>
      </HoverCard>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: function HookExample() {
    const hoverCard = useHoverCard({
      placement: 'above',
      delay: 200
    });
    return <div style={{
      padding: 100
    }}>
        <Button label="Using hook directly" ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
          Using hook directly
        </Button>
        {hoverCard.renderHoverCard(<ProfileCard />)}
      </div>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <HoverCard placement="below" content={<VStack gap={2}>
            <div>Interactive hover card content</div>
            <HStack gap={2}>
              <Button label="Follow" variant="primary">
                Follow
              </Button>
              <Button label="Message">Message</Button>
            </HStack>
          </VStack>}>
        <Button label="Hover for interactive content">
          Hover for interactive content
        </Button>
      </HoverCard>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <p>
        This feature was created by{' '}
        <HoverCard content={<ProfileCard />} placement="above">
          Jane Doe
        </HoverCard>{' '}
        and shipped last week.
      </p>
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <p>
        The project is maintained by{' '}
        <HoverCard content={<ProfileCard />} placement="above">
          Jane Doe
        </HoverCard>
        ,{' '}
        <HoverCard content={<div style={{
        width: 200
      }}>
              <VStack gap={2}>
                <div style={{
            fontWeight: 600
          }}>John Smith</div>
                <div style={{
            fontSize: 14,
            opacity: 0.7
          }}>Product Manager</div>
              </VStack>
            </div>} placement="above">
          John Smith
        </HoverCard>
        , and others.
      </p>
    </div>
}`,...C.parameters?.docs?.source}}},w=[`Default`,`Below`,`Start`,`End`,`CustomDelay`,`Disabled`,`AllPlacements`,`WithHook`,`InteractiveContent`,`TextNode`,`TextNodeMultiple`]}))();export{y as AllPlacements,m as Below,_ as CustomDelay,p as Default,v as Disabled,g as End,x as InteractiveContent,h as Start,S as TextNode,C as TextNodeMultiple,b as WithHook,w as __namedExportsOrder,f as default};