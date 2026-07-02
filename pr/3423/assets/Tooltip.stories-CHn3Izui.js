import{i as t,a1 as e,B as o,aN as v}from"./iframe-FpdBIrKz.js";import{H as g}from"./HStack-DS7NDpZg.js";import"./preload-helper-Ct5FWWRu.js";import"./Stack-DEYywiUi.js";import"./stack.stylex-BlarxY2N.js";const j={title:"Core/Tooltip",component:t,tags:["autodocs"],argTypes:{placement:{control:"select",options:["above","below","start","end"],description:"Position relative to trigger"},alignment:{control:"select",options:["start","center","end"],description:"Alignment on placement axis"},delay:{control:"number",description:"Show delay in ms"},hideDelay:{control:"number",description:"Hide delay in ms"},isEnabled:{control:"boolean",description:"Enable/disable the tooltip"}}},n={args:{placement:"above",content:"This is a helpful tooltip",children:e.jsx(o,{label:"Hover me",children:"Hover me"})}},a={args:{placement:"below",content:"Tooltip appears below",children:e.jsx(o,{label:"Hover me",children:"Hover me"})}},r={args:{placement:"start",content:"Tooltip on start",children:e.jsx(o,{label:"Hover me",children:"Hover me"})}},l={args:{placement:"end",content:"Tooltip on end",children:e.jsx(o,{label:"Hover me",children:"Hover me"})}},s={args:{placement:"above",delay:500,content:"Slower tooltip (500ms delay)",children:e.jsx(o,{label:"Slow tooltip",children:"Slow tooltip"})}},i={name:"Disabled Tooltip",args:{placement:"above",isEnabled:!1,content:"You should not see this",children:e.jsx(o,{label:"Hover me",children:"Hover me"})},parameters:{docs:{description:{story:"Demonstrates disabling the tooltip via the `isEnabled` prop. When `isEnabled` is `false`, the tooltip will not appear on hover or focus, even though the trigger element remains fully interactive. This is useful for conditionally showing tooltips based on application state."}}}},c={render:()=>e.jsxs("div",{style:{padding:100,display:"flex",gap:24,flexWrap:"wrap"},children:[e.jsx(t,{content:"Above",placement:"above",children:e.jsx(o,{label:"Above",children:"Above"})}),e.jsx(t,{content:"Below",placement:"below",children:e.jsx(o,{label:"Below",children:"Below"})}),e.jsx(t,{content:"Start",placement:"start",children:e.jsx(o,{label:"Start",children:"Start"})}),e.jsx(t,{content:"End",placement:"end",children:e.jsx(o,{label:"End",children:"End"})})]})},d={render:function(){const b=v({placement:"above",delay:100});return e.jsxs("div",{style:{padding:100},children:[e.jsx(o,{label:"Using hook directly",ref:b.ref,"aria-describedby":b.describedBy,children:"Using hook directly"}),b.renderTooltip("Tooltip via hook")]})}},p={args:{placement:"above",content:"This is a longer tooltip that contains more detailed information about the element.",children:e.jsx(o,{label:"Hover for more info",children:"Hover for more info"})}},m={render:()=>e.jsx("div",{style:{padding:100},children:e.jsxs(g,{gap:4,children:[e.jsx(t,{content:"Save your changes",placement:"above",children:e.jsx(o,{label:"Save",children:"Save"})}),e.jsx(t,{content:"Discard changes",placement:"above",children:e.jsx(o,{label:"Cancel",children:"Cancel"})}),e.jsx(t,{content:"Delete permanently",placement:"above",children:e.jsx(o,{label:"Delete",variant:"destructive",children:"Delete"})})]})})},u={render:()=>e.jsx("div",{style:{padding:100},children:e.jsxs("p",{children:["This paragraph contains a"," ",e.jsx(t,{content:"Tooltip on inline text!",placement:"above",children:"hover-able term"})," ","that explains what something means."]})})},h={render:()=>e.jsx("div",{style:{padding:100},children:e.jsxs("p",{children:["Learn more about our"," ",e.jsx(t,{content:"Your data is encrypted and never shared",placement:"above",children:"privacy policy"})," ","and"," ",e.jsx(t,{content:"Standard 30-day agreement",placement:"above",children:"terms of service"}),"."]})})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a helpful tooltip',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    content: 'Tooltip appears below',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    content: 'Tooltip on start',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    content: 'Tooltip on end',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...l.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    delay: 500,
    content: 'Slower tooltip (500ms delay)',
    children: <Button label="Slow tooltip">Slow tooltip</Button>
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a longer tooltip that contains more detailed information about the element.',
    children: <Button label="Hover for more info">Hover for more info</Button>
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};const H=["Default","Below","Start","End","CustomDelay","Disabled","AllPlacements","WithHook","LongContent","MultipleTooltips","TextNode","TextNodeInline"];export{c as AllPlacements,a as Below,s as CustomDelay,n as Default,i as Disabled,l as End,p as LongContent,m as MultipleTooltips,r as Start,u as TextNode,h as TextNodeInline,d as WithHook,H as __namedExportsOrder,j as default};
