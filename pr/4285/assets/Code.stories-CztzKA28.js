import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{n as r,t as i}from"./CodeBlock-IQAiM3j8.js";import{c as a,t as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BUJwo4gL.js";import{i as c,t as l}from"./Link-Dbbw0J_w.js";var u,d,f,p,m,h,g,_,v;e((()=>{i(),s(),o(),l(),u=t(),d={title:`Core/Code`,component:r,tags:[`autodocs`],argTypes:{children:{control:`text`,description:`Code content`}}},f={args:{children:`const x = 1`}},p={name:`Inline in paragraph`,render:()=>(0,u.jsxs)(n,{type:`body`,children:[`Use `,(0,u.jsx)(r,{children:`useState`}),` for local state and`,` `,(0,u.jsx)(r,{children:`useEffect`}),` for side effects. If you need shared state across components, consider `,(0,u.jsx)(r,{children:`useContext`}),` or a state management library.`]})},m={name:`Instructional text`,render:()=>(0,u.jsxs)(a,{gap:3,children:[(0,u.jsxs)(n,{type:`body`,children:[`Install the package with `,(0,u.jsx)(r,{children:`npm install @astryxdesign/core`}),`, then import the component:`]}),(0,u.jsxs)(n,{type:`body`,children:[`Add `,(0,u.jsx)(r,{children:`<Button label="Save">Save</Button>`}),` to your JSX. The `,(0,u.jsx)(r,{children:`label`}),` prop is required for accessibility.`]})]})},h={name:`Mixed with links and emphasis`,render:()=>(0,u.jsxs)(n,{type:`body`,children:[`The `,(0,u.jsx)(r,{children:`ThemeProvider`}),` component wraps your app and supplies design tokens. See the`,` `,(0,u.jsx)(c,{href:`/docs/theme`,isExternalLink:!1,children:`theme docs`}),` `,`for setup. Set `,(0,u.jsx)(r,{children:`colorScheme="dark"`}),` to enable dark mode.`]})},g={name:`Various code content`,render:()=>(0,u.jsxs)(a,{gap:2,children:[(0,u.jsxs)(n,{type:`body`,children:[`Variable: `,(0,u.jsx)(r,{children:`const count = 0`})]}),(0,u.jsxs)(n,{type:`body`,children:[`Terminal: `,(0,u.jsx)(r,{children:`pnpm build --watch`})]}),(0,u.jsxs)(n,{type:`body`,children:[`CSS property: `,(0,u.jsx)(r,{children:`border-radius: 8px`})]}),(0,u.jsxs)(n,{type:`body`,children:[`File path: `,(0,u.jsx)(r,{children:`packages/core/src/CodeBlock/Code.tsx`})]}),(0,u.jsxs)(n,{type:`body`,children:[`Keyboard shortcut: `,(0,u.jsx)(r,{children:`Ctrl+Shift+P`})]})]})},_={name:`Across text sizes`,render:()=>(0,u.jsxs)(a,{gap:2,children:[(0,u.jsxs)(n,{type:`large`,children:[`Heading with `,(0,u.jsx)(r,{children:`inline code`})]}),(0,u.jsxs)(n,{type:`body`,children:[`Body text with `,(0,u.jsx)(r,{children:`inline code`})]}),(0,u.jsxs)(n,{type:`supporting`,children:[`Detail text with `,(0,u.jsx)(r,{children:`inline code`})]}),(0,u.jsxs)(n,{type:`label`,children:[`Label text with `,(0,u.jsx)(r,{children:`inline code`})]})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'const x = 1'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Inline in paragraph',
  render: () => <Text type="body">
      Use <Code>useState</Code> for local state and{' '}
      <Code>useEffect</Code> for side effects. If you need shared state
      across components, consider <Code>useContext</Code> or a state
      management library.
    </Text>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v=[`Default`,`InParagraph`,`InstructionalParagraph`,`MixedInline`,`VariousContent`,`TextSizes`]}))();export{f as Default,p as InParagraph,m as InstructionalParagraph,h as MixedInline,_ as TextSizes,g as VariousContent,v as __namedExportsOrder,d as default};