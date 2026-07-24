import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{jn as i,t as a}from"./src-C4_c7Msj.js";function o(e){let[t,n]=(0,s.useState)(e.value??u);return(0,c.jsx)(i,{label:`Code editor`,language:`typescript`,hasLineNumbers:!0,...e,value:t,onChange:n})}var s,c,l,u,d,f,p,m,h,g,_,v;e((()=>{s=t(n()),a(),c=r(),l={title:`Lab/CodeEditor`,component:i,tags:[`autodocs`],argTypes:{language:{control:`select`,options:[`typescript`,`javascript`,`json`,`html`,`css`,`python`,`bash`,`php`,`hack`,`yaml`,`markdown`,`plaintext`]},size:{control:`select`,options:[`sm`,`md`]},hasLineNumbers:{control:`boolean`},isReadOnly:{control:`boolean`}}},u=`function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`,d={render:()=>(0,c.jsx)(o,{})},f={render:()=>(0,c.jsx)(o,{value:`{
  "name": "my-app",
  "version": "1.0.0",
  "settings": {
    "port": 3000,
    "debug": false
  }
}`,language:`json`,hasLineNumbers:!0})},p={render:()=>(0,c.jsx)(o,{value:`def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib[:n]

result = fibonacci(10)
print(result)`,language:`python`,hasLineNumbers:!0})},m={render:()=>(0,c.jsx)(o,{value:``,placeholder:`Type your code here...`,language:`typescript`})},h={render:()=>(0,c.jsx)(o,{isReadOnly:!0,hasLineNumbers:!0})},g={render:()=>(0,c.jsx)(o,{value:Array.from({length:30},(e,t)=>`const line${t+1} = ${t+1};`).join(`
`),language:`typescript`,hasLineNumbers:!0,maxHeight:200})},_={render:()=>(0,c.jsx)(o,{size:`sm`,hasLineNumbers:!0})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value={\`{\\n  "name": "my-app",\\n  "version": "1.0.0",\\n  "settings": {\\n    "port": 3000,\\n    "debug": false\\n  }\\n}\`} language="json" hasLineNumbers />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value={\`def fibonacci(n: int) -> list[int]:\\n    """Generate Fibonacci sequence."""\\n    if n <= 0:\\n        return []\\n    fib = [0, 1]\\n    for i in range(2, n):\\n        fib.append(fib[-1] + fib[-2])\\n    return fib[:n]\\n\\nresult = fibonacci(10)\\nprint(result)\`} language="python" hasLineNumbers />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value="" placeholder="Type your code here..." language="typescript" />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor isReadOnly hasLineNumbers />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value={Array.from({
    length: 30
  }, (_, i) => \`const line\${i + 1} = \${i + 1};\`).join('\\n')} language="typescript" hasLineNumbers maxHeight={200} />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor size="sm" hasLineNumbers />
}`,..._.parameters?.docs?.source}}},v=[`Default`,`JSONEditor`,`PythonEditor`,`WithPlaceholder`,`ReadOnly`,`WithMaxHeight`,`SmallSize`]}))();export{d as Default,f as JSONEditor,p as PythonEditor,h as ReadOnly,_ as SmallSize,g as WithMaxHeight,m as WithPlaceholder,v as __namedExportsOrder,l as default};