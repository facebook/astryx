import{a1 as t}from"./iframe-j1EZkcGb.js";import{C as e}from"./Citation-Bj92jja9.js";import"./preload-helper-Ct5FWWRu.js";const u={title:"Core/Citation",component:e,tags:["autodocs"],argTypes:{variant:{control:"select",options:["label","number"],description:"Display style — label chip or numbered badge"},number:{control:"number",description:"Citation display number"}}},r={args:{source:{title:"React Documentation",url:"https://react.dev"},number:1,variant:"label"}},a={args:{source:{title:"TypeScript Handbook",url:"https://typescriptlang.org"},number:2,variant:"number"}},s={args:{source:{title:"GitHub",url:"https://github.com",icon:"https://github.githubassets.com/favicons/favicon.svg"},number:3,variant:"label"}},n={args:{source:{title:"Internal reference"},number:4,variant:"label"}},o={render:()=>t.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"},children:[t.jsx(e,{source:{title:"React Docs",url:"https://react.dev"},number:1,variant:"label"}),t.jsx(e,{source:{title:"TypeScript",url:"https://typescriptlang.org"},number:2,variant:"number"}),t.jsx(e,{source:{title:"GitHub",url:"https://github.com",icon:"https://github.githubassets.com/favicons/favicon.svg"},number:3,variant:"label"}),t.jsx(e,{source:{title:"A very long source title that should be truncated with ellipsis"},number:4,variant:"label"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    source: {
      title: 'React Documentation',
      url: 'https://react.dev'
    },
    number: 1,
    variant: 'label'
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    source: {
      title: 'TypeScript Handbook',
      url: 'https://typescriptlang.org'
    },
    number: 2,
    variant: 'number'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    source: {
      title: 'GitHub',
      url: 'https://github.com',
      icon: 'https://github.githubassets.com/favicons/favicon.svg'
    },
    number: 3,
    variant: 'label'
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    source: {
      title: 'Internal reference'
    },
    number: 4,
    variant: 'label'
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  }}>
      <Citation source={{
      title: 'React Docs',
      url: 'https://react.dev'
    }} number={1} variant="label" />
      <Citation source={{
      title: 'TypeScript',
      url: 'https://typescriptlang.org'
    }} number={2} variant="number" />
      <Citation source={{
      title: 'GitHub',
      url: 'https://github.com',
      icon: 'https://github.githubassets.com/favicons/favicon.svg'
    }} number={3} variant="label" />
      <Citation source={{
      title: 'A very long source title that should be truncated with ellipsis'
    }} number={4} variant="label" />
    </div>
}`,...o.parameters?.docs?.source}}};const p=["Label","Number","WithIcon","NoLink","Variants"];export{r as Label,n as NoLink,a as Number,o as Variants,s as WithIcon,p as __namedExportsOrder,u as default};
