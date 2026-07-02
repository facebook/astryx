import{a1 as e,B as r}from"./iframe-JfpySt6L.js";import{H as a,u as x}from"./HoverCard-CehSb_SZ.js";import{V as b}from"./VStack-CNvSYnDY.js";import{H as g}from"./HStack-DA2weo84.js";import"./preload-helper-Ct5FWWRu.js";import"./Stack-CFTIC-Fa.js";import"./stack.stylex-BlarxY2N.js";const P={title:"Core/HoverCard",component:a,tags:["autodocs"],argTypes:{placement:{control:"select",options:["above","below","start","end"],description:"Position relative to trigger"},alignment:{control:"select",options:["start","center","end"],description:"Alignment on placement axis"},delay:{control:"number",description:"Show delay in ms"},hideDelay:{control:"number",description:"Hide delay in ms"},isEnabled:{control:"boolean",description:"Enable/disable the hover card"}}};function t(){return e.jsx("div",{style:{width:200},children:e.jsxs(b,{gap:2,children:[e.jsx("div",{style:{fontWeight:600},children:"Jane Doe"}),e.jsx("div",{style:{fontSize:14,opacity:.7},children:"Software Engineer"}),e.jsx("div",{style:{fontSize:13},children:"Building great products with great people."})]})})}const o={args:{placement:"above",content:e.jsx(t,{}),children:e.jsx(r,{label:"Hover me",children:"Hover me"})}},n={args:{placement:"below",content:e.jsx(t,{}),children:e.jsx(r,{label:"Hover me",children:"Hover me"})}},s={args:{placement:"start",content:e.jsx(t,{}),children:e.jsx(r,{label:"Hover me",children:"Hover me"})}},l={args:{placement:"end",content:e.jsx(t,{}),children:e.jsx(r,{label:"Hover me",children:"Hover me"})}},d={args:{placement:"above",delay:500,hideDelay:300,content:e.jsx(t,{}),children:e.jsx(r,{label:"Slow hover (500ms)",children:"Slow hover (500ms)"})}},c={args:{placement:"above",isEnabled:!1,content:e.jsx(t,{}),children:e.jsx(r,{label:"Hover disabled",children:"Hover disabled"})}},i={render:()=>e.jsxs("div",{style:{padding:100,display:"flex",gap:24,flexWrap:"wrap"},children:[e.jsx(a,{content:e.jsx(t,{}),placement:"above",children:e.jsx(r,{label:"Above",children:"Above"})}),e.jsx(a,{content:e.jsx(t,{}),placement:"below",children:e.jsx(r,{label:"Below",children:"Below"})}),e.jsx(a,{content:e.jsx(t,{}),placement:"start",children:e.jsx(r,{label:"Start",children:"Start"})}),e.jsx(a,{content:e.jsx(t,{}),placement:"end",children:e.jsx(r,{label:"End",children:"End"})})]})},p={render:function(){const u=x({placement:"above",delay:200});return e.jsxs("div",{style:{padding:100},children:[e.jsx(r,{label:"Using hook directly",ref:u.ref,"aria-describedby":u.describedBy,children:"Using hook directly"}),u.renderHoverCard(e.jsx(t,{}))]})}},m={render:()=>e.jsx("div",{style:{padding:100},children:e.jsx(a,{placement:"below",content:e.jsxs(b,{gap:2,children:[e.jsx("div",{children:"Interactive hover card content"}),e.jsxs(g,{gap:2,children:[e.jsx(r,{label:"Follow",variant:"primary",children:"Follow"}),e.jsx(r,{label:"Message",children:"Message"})]})]}),children:e.jsx(r,{label:"Hover for interactive content",children:"Hover for interactive content"})})})},v={render:()=>e.jsx("div",{style:{padding:100},children:e.jsxs("p",{children:["This feature was created by"," ",e.jsx(a,{content:e.jsx(t,{}),placement:"above",children:"Jane Doe"})," ","and shipped last week."]})})},h={render:()=>e.jsx("div",{style:{padding:100},children:e.jsxs("p",{children:["The project is maintained by"," ",e.jsx(a,{content:e.jsx(t,{}),placement:"above",children:"Jane Doe"}),","," ",e.jsx(a,{content:e.jsx("div",{style:{width:200},children:e.jsxs(b,{gap:2,children:[e.jsx("div",{style:{fontWeight:600},children:"John Smith"}),e.jsx("div",{style:{fontSize:14,opacity:.7},children:"Product Manager"})]})}),placement:"above",children:"John Smith"}),", and others."]})})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    delay: 500,
    hideDelay: 300,
    content: <ProfileCard />,
    children: <Button label="Slow hover (500ms)">Slow hover (500ms)</Button>
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    isEnabled: false,
    content: <ProfileCard />,
    children: <Button label="Hover disabled">Hover disabled</Button>
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};const k=["Default","Below","Start","End","CustomDelay","Disabled","AllPlacements","WithHook","InteractiveContent","TextNode","TextNodeMultiple"];export{i as AllPlacements,n as Below,d as CustomDelay,o as Default,c as Disabled,l as End,m as InteractiveContent,s as Start,v as TextNode,h as TextNodeMultiple,p as WithHook,k as __namedExportsOrder,P as default};
