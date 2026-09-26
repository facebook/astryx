import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{Ct as i,bt as a,xt as o}from"./iframe-DE6xsx2W.js";function s({children:e}){let[t,n]=(0,c.useState)(0);return(0,l.jsxs)(`div`,{"data-a11y-activations":t,children:[e(()=>{n(e=>e+1)}),(0,l.jsxs)(`p`,{children:[`activations: `,(0,l.jsx)(`output`,{children:t})]})]})}var c,l,u,d,f,p,m,h;e((()=>{c=t(n()),a(),l=r(),u={title:`a11y/ToggleButton disabled state`,tags:[`no-visual`],parameters:{docs:{description:{component:`Disabled-state fixtures for ToggleButton and ToggleButtonGroup. Each story counts its own activations, because a toggle that refuses a press leaves no trace of having been pressed.`}}}},d={name:`group enabled — member disabled`,render:function(){let[e,t]=(0,c.useState)(null);return(0,l.jsx)(s,{children:n=>(0,l.jsxs)(i,{label:`View mode`,value:e,onChange:e=>{n(),t(e)},children:[(0,l.jsx)(o,{value:`list`,label:`List`,isDisabled:!0}),(0,l.jsx)(o,{value:`grid`,label:`Grid`})]})})}},f={name:`group disabled — member silent`,render:function(){let[e,t]=(0,c.useState)(null);return(0,l.jsx)(s,{children:n=>(0,l.jsx)(i,{label:`View mode`,value:e,isDisabled:!0,onChange:e=>{n(),t(e)},children:(0,l.jsx)(o,{value:`list`,label:`List`})})})}},p={name:`disabled — kept focusable by a tooltip`,render:function(){let[e,t]=(0,c.useState)(!1);return(0,l.jsx)(s,{children:n=>(0,l.jsx)(o,{label:`Bold`,tooltip:`Formatting is locked for this document`,isDisabled:!0,isPressed:e,onPressedChange:e=>{n(),t(e)}})})}},m={name:`enabled — with a tooltip`,render:function(){let[e,t]=(0,c.useState)(!1);return(0,l.jsx)(s,{children:n=>(0,l.jsx)(o,{label:`Bold`,tooltip:`Bold the selected text`,isPressed:e,onPressedChange:e=>{n(),t(e)}})})}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'group enabled — member disabled',
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    return <Counted>
        {activate => <ToggleButtonGroup label="View mode" value={value} onChange={next => {
        activate();
        setValue(next);
      }}>
            <ToggleButton value="list" label="List" isDisabled />
            <ToggleButton value="grid" label="Grid" />
          </ToggleButtonGroup>}
      </Counted>;
  }
}`,...d.parameters?.docs?.source},description:{story:`A member that disables itself, inside a group that does not disable anything.
The group must not hand the member its availability back.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'group disabled — member silent',
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    return <Counted>
        {activate => <ToggleButtonGroup label="View mode" value={value} isDisabled onChange={next => {
        activate();
        setValue(next);
      }}>
            <ToggleButton value="list" label="List" />
          </ToggleButtonGroup>}
      </Counted>;
  }
}`,...f.parameters?.docs?.source},description:{story:`The other half of the same rule: a group that disables everything still
disables a member that says nothing about its own availability.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'disabled — kept focusable by a tooltip',
  render: function Render() {
    const [isPressed, setIsPressed] = useState(false);
    return <Counted>
        {activate => <ToggleButton label="Bold" tooltip="Formatting is locked for this document" isDisabled isPressed={isPressed} onPressedChange={next => {
        activate();
        setIsPressed(next);
      }} />}
      </Counted>;
  }
}`,...p.parameters?.docs?.source},description:{story:`A disabled toggle kept focusable by its tooltip, so the reason it is
unavailable stays reachable. Focusable is not operable: a pointer press must
still be refused.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'enabled — with a tooltip',
  render: function Render() {
    const [isPressed, setIsPressed] = useState(false);
    return <Counted>
        {activate => <ToggleButton label="Bold" tooltip="Bold the selected text" isPressed={isPressed} onPressedChange={next => {
        activate();
        setIsPressed(next);
      }} />}
      </Counted>;
  }
}`,...m.parameters?.docs?.source},description:{story:`The control. An enabled toggle carrying the same tooltip must still toggle —
this is the story that fails if a fix disables too much.`,...m.parameters?.docs?.description}}},h=[`GroupEnabledMemberDisabled`,`GroupDisabledMemberSilent`,`DisabledWithTooltip`,`EnabledWithTooltip`]}))();export{p as DisabledWithTooltip,m as EnabledWithTooltip,f as GroupDisabledMemberSilent,d as GroupEnabledMemberDisabled,h as __namedExportsOrder,u as default};