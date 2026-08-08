import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Button-BVMvoKVE.js";import{i,n as a,r as o,t as s}from"./HoverCard-J_-YySm1.js";import{n as c,t as l}from"./HStack-DtZv8gmp.js";import{n as u,t as d}from"./VStack-C2SBQ4Fm.js";function f(){return(0,p.jsx)(`div`,{style:{width:200},children:(0,p.jsxs)(d,{gap:2,children:[(0,p.jsx)(`div`,{style:{fontWeight:600},children:`Jane Doe`}),(0,p.jsx)(`div`,{style:{fontSize:14,opacity:.7},children:`Software Engineer`}),(0,p.jsx)(`div`,{style:{fontSize:13},children:`Building great products with great people.`})]})})}var p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{a(),o(),n(),u(),c(),p=t(),m={title:`Core/HoverCard`,component:s,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},delay:{control:`number`,description:`Show delay in ms`},hideDelay:{control:`number`,description:`Hide delay in ms`},isEnabled:{control:`boolean`,description:`Enable/disable the hover card`}}},h={args:{placement:`above`,content:(0,p.jsx)(f,{}),children:(0,p.jsx)(r,{label:`Hover me`,children:`Hover me`})}},g={args:{placement:`below`,content:(0,p.jsx)(f,{}),children:(0,p.jsx)(r,{label:`Hover me`,children:`Hover me`})}},_={args:{placement:`start`,content:(0,p.jsx)(f,{}),children:(0,p.jsx)(r,{label:`Hover me`,children:`Hover me`})}},v={args:{placement:`end`,content:(0,p.jsx)(f,{}),children:(0,p.jsx)(r,{label:`Hover me`,children:`Hover me`})}},y={args:{placement:`above`,delay:500,hideDelay:300,content:(0,p.jsx)(f,{}),children:(0,p.jsx)(r,{label:`Slow hover (500ms)`,children:`Slow hover (500ms)`})}},b={args:{placement:`above`,isEnabled:!1,content:(0,p.jsx)(f,{}),children:(0,p.jsx)(r,{label:`Hover disabled`,children:`Hover disabled`})}},x={render:()=>(0,p.jsxs)(`div`,{style:{padding:100,display:`flex`,gap:24,flexWrap:`wrap`},children:[(0,p.jsx)(s,{content:(0,p.jsx)(f,{}),placement:`above`,children:(0,p.jsx)(r,{label:`Above`,children:`Above`})}),(0,p.jsx)(s,{content:(0,p.jsx)(f,{}),placement:`below`,children:(0,p.jsx)(r,{label:`Below`,children:`Below`})}),(0,p.jsx)(s,{content:(0,p.jsx)(f,{}),placement:`start`,children:(0,p.jsx)(r,{label:`Start`,children:`Start`})}),(0,p.jsx)(s,{content:(0,p.jsx)(f,{}),placement:`end`,children:(0,p.jsx)(r,{label:`End`,children:`End`})})]})},S={render:function(){let e=i({placement:`above`,delay:200});return(0,p.jsxs)(`div`,{style:{padding:100},children:[(0,p.jsx)(r,{label:`Using hook directly`,ref:e.ref,"aria-describedby":e.describedBy,children:`Using hook directly`}),e.renderHoverCard((0,p.jsx)(f,{}))]})}},C={render:()=>(0,p.jsx)(`div`,{style:{padding:100},children:(0,p.jsx)(s,{placement:`below`,content:(0,p.jsxs)(d,{gap:2,children:[(0,p.jsx)(`div`,{children:`Interactive hover card content`}),(0,p.jsxs)(l,{gap:2,children:[(0,p.jsx)(r,{label:`Follow`,variant:`primary`,children:`Follow`}),(0,p.jsx)(r,{label:`Message`,children:`Message`})]})]}),children:(0,p.jsx)(r,{label:`Hover for interactive content`,children:`Hover for interactive content`})})})},w={render:()=>(0,p.jsx)(`div`,{style:{padding:100},children:(0,p.jsxs)(`p`,{children:[`This feature was created by`,` `,(0,p.jsx)(s,{content:(0,p.jsx)(f,{}),placement:`above`,children:`Jane Doe`}),` `,`and shipped last week.`]})})},T={render:()=>(0,p.jsx)(`div`,{style:{padding:100},children:(0,p.jsxs)(`p`,{children:[`The project is maintained by`,` `,(0,p.jsx)(s,{content:(0,p.jsx)(f,{}),placement:`above`,children:`Jane Doe`}),`,`,` `,(0,p.jsx)(s,{content:(0,p.jsx)(`div`,{style:{width:200},children:(0,p.jsxs)(d,{gap:2,children:[(0,p.jsx)(`div`,{style:{fontWeight:600},children:`John Smith`}),(0,p.jsx)(`div`,{style:{fontSize:14,opacity:.7},children:`Product Manager`})]})}),placement:`above`,children:`John Smith`}),`, and others.`]})})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    delay: 500,
    hideDelay: 300,
    content: <ProfileCard />,
    children: <Button label="Slow hover (500ms)">Slow hover (500ms)</Button>
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    isEnabled: false,
    content: <ProfileCard />,
    children: <Button label="Hover disabled">Hover disabled</Button>
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E=[`Default`,`Below`,`Start`,`End`,`CustomDelay`,`Disabled`,`AllPlacements`,`WithHook`,`InteractiveContent`,`TextNode`,`TextNodeMultiple`]})))()}D();export{x as AllPlacements,g as Below,y as CustomDelay,h as Default,b as Disabled,v as End,C as InteractiveContent,_ as Start,w as TextNode,T as TextNodeMultiple,S as WithHook,E as __namedExportsOrder,m as default};