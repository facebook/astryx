import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-DtYqyGdI.js";import{o as r}from"./Stack-BNC3JVPO.js";import{t as i}from"./Layout-BzhOgwDr.js";import{t as a}from"./Text-ruMIfm9Y.js";import{n as o,t as s}from"./InfoTip-DiIBLm1P.js";var c,l,u,d,f,p,m;e((()=>{s(),i(),a(),c=t(),l={title:`Lab/InfoTip`,component:o,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`xsm`,`sm`,`md`,`lg`],description:`Size of the info icon`}}},u={args:{content:`Editors can change this field; viewers cannot.`}},d={render:()=>(0,c.jsx)(`div`,{style:{padding:100},children:(0,c.jsxs)(r,{gap:1,align:`center`,children:[(0,c.jsx)(n,{children:`Rolling average`}),(0,c.jsx)(o,{content:`30-day rolling average, recomputed nightly.`,label:`About this metric`})]})})},f={render:()=>(0,c.jsx)(`div`,{style:{padding:100},children:(0,c.jsxs)(r,{gap:1,align:`center`,children:[(0,c.jsx)(n,{children:`Rolling average`}),(0,c.jsx)(o,{content:`30-day rolling average, recomputed nightly.`,label:`About this metric`})]})})},p={render:()=>(0,c.jsx)(`div`,{style:{padding:100},children:(0,c.jsxs)(r,{gap:4,align:`center`,children:[(0,c.jsx)(o,{content:`Extra small`,size:`xsm`}),(0,c.jsx)(o,{content:`Small (default)`,size:`sm`}),(0,c.jsx)(o,{content:`Medium`,size:`md`}),(0,c.jsx)(o,{content:`Large`,size:`lg`})]})})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Editors can change this field; viewers cannot.'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <HStack gap={1} align="center">
        <Text>Rolling average</Text>
        <InfoTip content="30-day rolling average, recomputed nightly." label="About this metric" />
      </HStack>
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <HStack gap={1} align="center">
        <Text>Rolling average</Text>
        <InfoTip content="30-day rolling average, recomputed nightly." label="About this metric" />
      </HStack>
    </div>
}`,...f.parameters?.docs?.source},description:{story:"The trigger is a button, so `Tooltip`'s `auto` touch rule would give the tap\nto the control and suppress the tooltip. `InfoTip` sets `touchTrigger=\"tap\"`\nbecause revealing the tooltip is the button's only purpose — tap the icon on\na phone (or with touch emulation on) and the tooltip opens; tap outside and\nit dismisses.",...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <HStack gap={4} align="center">
        <InfoTip content="Extra small" size="xsm" />
        <InfoTip content="Small (default)" size="sm" />
        <InfoTip content="Medium" size="md" />
        <InfoTip content="Large" size="lg" />
      </HStack>
    </div>
}`,...p.parameters?.docs?.source}}},m=[`Default`,`NextToALabel`,`Touch`,`Sizes`]}))();export{u as Default,d as NextToALabel,p as Sizes,f as Touch,m as __namedExportsOrder,l as default};