import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./CodeEditor-DBtJwI04.js";function a(e){let[t,n]=(0,o.useState)(e.value??l);return(0,s.jsx)(i,{label:`Code editor`,language:`typescript`,hasLineNumbers:!0,...e,value:t,onChange:n})}var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{o=t(),r(),s=n(),c={title:`Lab/CodeEditor`,component:i,tags:[`autodocs`],argTypes:{language:{control:`select`,options:[`typescript`,`javascript`,`json`,`html`,`css`,`python`,`bash`,`php`,`hack`,`yaml`,`markdown`,`plaintext`]},size:{control:`select`,options:[`sm`,`md`]},hasLineNumbers:{control:`boolean`},isReadOnly:{control:`boolean`}}},l=`function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`,u={render:()=>(0,s.jsx)(a,{})},d={render:()=>(0,s.jsx)(a,{value:`{
  "name": "my-app",
  "version": "1.0.0",
  "settings": {
    "port": 3000,
    "debug": false
  }
}`,language:`json`,hasLineNumbers:!0})},f={render:()=>(0,s.jsx)(a,{value:`def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib[:n]

result = fibonacci(10)
print(result)`,language:`python`,hasLineNumbers:!0})},p={render:()=>(0,s.jsx)(a,{value:``,placeholder:`Type your code here...`,language:`typescript`})},m={render:()=>(0,s.jsx)(a,{isReadOnly:!0,hasLineNumbers:!0})},h={render:()=>(0,s.jsx)(a,{value:Array.from({length:30},(e,t)=>`const line${t+1} = ${t+1};`).join(`
`),language:`typescript`,hasLineNumbers:!0,maxHeight:200})},g={render:()=>(0,s.jsx)(a,{size:`sm`,hasLineNumbers:!0})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor />
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value={\`{\\n  "name": "my-app",\\n  "version": "1.0.0",\\n  "settings": {\\n    "port": 3000,\\n    "debug": false\\n  }\\n}\`} language="json" hasLineNumbers />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value={\`def fibonacci(n: int) -> list[int]:\\n    """Generate Fibonacci sequence."""\\n    if n <= 0:\\n        return []\\n    fib = [0, 1]\\n    for i in range(2, n):\\n        fib.append(fib[-1] + fib[-2])\\n    return fib[:n]\\n\\nresult = fibonacci(10)\\nprint(result)\`} language="python" hasLineNumbers />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value="" placeholder="Type your code here..." language="typescript" />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor isReadOnly hasLineNumbers />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value={Array.from({
    length: 30
  }, (_, i) => \`const line\${i + 1} = \${i + 1};\`).join('\\n')} language="typescript" hasLineNumbers maxHeight={200} />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor size="sm" hasLineNumbers />
}`,...g.parameters?.docs?.source}}},_=[`Default`,`JSONEditor`,`PythonEditor`,`WithPlaceholder`,`ReadOnly`,`WithMaxHeight`,`SmallSize`]})))()}v();export{u as Default,d as JSONEditor,f as PythonEditor,m as ReadOnly,g as SmallSize,h as WithMaxHeight,p as WithPlaceholder,_ as __namedExportsOrder,c as default};