import{a1 as e,T as r}from"./iframe-j1EZkcGb.js";import{S as c}from"./Stack-DWPtcxDC.js";import{L as p}from"./Link-Cq8jRk2Z.js";import{C as t}from"./Code-D18NfaVy.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useInteractiveRole-Dd_xIN8b.js";const g={title:"Core/Code",component:t,tags:["autodocs"],argTypes:{children:{control:"text",description:"Code content"}}},o={args:{children:"const x = 1"}},s={name:"Inline in paragraph",render:()=>e.jsxs(r,{type:"body",children:["Use ",e.jsx(t,{children:"useState"})," for local state and"," ",e.jsx(t,{children:"useEffect"})," for side effects. If you need shared state across components, consider ",e.jsx(t,{children:"useContext"})," or a state management library."]})},a={name:"Instructional text",render:()=>e.jsxs(c,{gap:3,children:[e.jsxs(r,{type:"body",children:["Install the package with ",e.jsx(t,{children:"npm install @astryxdesign/core"}),", then import the component:"]}),e.jsxs(r,{type:"body",children:["Add ",e.jsx(t,{children:'<Button label="Save">Save</Button>'})," to your JSX. The ",e.jsx(t,{children:"label"})," prop is required for accessibility."]})]})},n={name:"Mixed with links and emphasis",render:()=>e.jsxs(r,{type:"body",children:["The ",e.jsx(t,{children:"ThemeProvider"})," component wraps your app and supplies design tokens. See the"," ",e.jsx(p,{href:"/docs/theme",isExternalLink:!1,children:"theme docs"})," ","for setup. Set ",e.jsx(t,{children:'colorScheme="dark"'})," to enable dark mode."]})},d={name:"Various code content",render:()=>e.jsxs(c,{gap:2,children:[e.jsxs(r,{type:"body",children:["Variable: ",e.jsx(t,{children:"const count = 0"})]}),e.jsxs(r,{type:"body",children:["Terminal: ",e.jsx(t,{children:"pnpm build --watch"})]}),e.jsxs(r,{type:"body",children:["CSS property: ",e.jsx(t,{children:"border-radius: 8px"})]}),e.jsxs(r,{type:"body",children:["File path: ",e.jsx(t,{children:"packages/core/src/CodeBlock/Code.tsx"})]}),e.jsxs(r,{type:"body",children:["Keyboard shortcut: ",e.jsx(t,{children:"Ctrl+Shift+P"})]})]})},i={name:"Across text sizes",render:()=>e.jsxs(c,{gap:2,children:[e.jsxs(r,{type:"large",children:["Heading with ",e.jsx(t,{children:"inline code"})]}),e.jsxs(r,{type:"body",children:["Body text with ",e.jsx(t,{children:"inline code"})]}),e.jsxs(r,{type:"supporting",children:["Detail text with ",e.jsx(t,{children:"inline code"})]}),e.jsxs(r,{type:"label",children:["Label text with ",e.jsx(t,{children:"inline code"})]})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'const x = 1'
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Inline in paragraph',
  render: () => <Text type="body">
      Use <Code>useState</Code> for local state and{' '}
      <Code>useEffect</Code> for side effects. If you need shared state
      across components, consider <Code>useContext</Code> or a state
      management library.
    </Text>
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'Instructional text',
  render: () => <Stack gap={3}>
      <Text type="body">
        Install the package with <Code>npm install @astryxdesign/core</Code>, then
        import the component:
      </Text>
      <Text type="body">
        Add <Code>{'<Button label="Save">Save</Button>'}</Code> to
        your JSX. The <Code>label</Code> prop is required for
        accessibility.
      </Text>
    </Stack>
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Mixed with links and emphasis',
  render: () => <Text type="body">
      The <Code>ThemeProvider</Code> component wraps your app and
      supplies design tokens. See the{' '}
      <Link href="/docs/theme" isExternalLink={false}>
        theme docs
      </Link>{' '}
      for setup. Set <Code>colorScheme=&quot;dark&quot;</Code> to enable
      dark mode.
    </Text>
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Various code content',
  render: () => <Stack gap={2}>
      <Text type="body">
        Variable: <Code>const count = 0</Code>
      </Text>
      <Text type="body">
        Terminal: <Code>pnpm build --watch</Code>
      </Text>
      <Text type="body">
        CSS property: <Code>border-radius: 8px</Code>
      </Text>
      <Text type="body">
        File path: <Code>packages/core/src/CodeBlock/Code.tsx</Code>
      </Text>
      <Text type="body">
        Keyboard shortcut: <Code>Ctrl+Shift+P</Code>
      </Text>
    </Stack>
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Across text sizes',
  render: () => <Stack gap={2}>
      <Text type="large">
        Heading with <Code>inline code</Code>
      </Text>
      <Text type="body">
        Body text with <Code>inline code</Code>
      </Text>
      <Text type="supporting">
        Detail text with <Code>inline code</Code>
      </Text>
      <Text type="label">
        Label text with <Code>inline code</Code>
      </Text>
    </Stack>
}`,...i.parameters?.docs?.source}}};const S=["Default","InParagraph","InstructionalParagraph","MixedInline","VariousContent","TextSizes"];export{o as Default,s as InParagraph,a as InstructionalParagraph,n as MixedInline,i as TextSizes,d as VariousContent,S as __namedExportsOrder,g as default};
