import{a1 as e,ah as m}from"./iframe-FpdBIrKz.js";import{C as d}from"./CodeEditor-Dw7MYN33.js";import"./preload-helper-Ct5FWWRu.js";import"./highlightRanges-DBgSijyY.js";const x={title:"Lab/CodeEditor",component:d,tags:["autodocs"],argTypes:{language:{control:"select",options:["typescript","javascript","json","html","css","python","bash","php","hack","yaml","markdown","plaintext"]},size:{control:"select",options:["sm","md"]},hasLineNumbers:{control:"boolean"},isReadOnly:{control:"boolean"}}},g=`function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`;function r(u){const[n,p]=m.useState(u.value??g);return e.jsx(d,{language:"typescript",hasLineNumbers:!0,...u,value:n,onChange:p})}const a={render:()=>e.jsx(r,{})},s={render:()=>e.jsx(r,{value:`{
  "name": "my-app",
  "version": "1.0.0",
  "settings": {
    "port": 3000,
    "debug": false
  }
}`,language:"json",hasLineNumbers:!0})},o={render:()=>e.jsx(r,{value:`def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib[:n]

result = fibonacci(10)
print(result)`,language:"python",hasLineNumbers:!0})},t={render:()=>e.jsx(r,{value:"",placeholder:"Type your code here...",language:"typescript"})},i={render:()=>e.jsx(r,{isReadOnly:!0,hasLineNumbers:!0})},c={render:()=>e.jsx(r,{value:Array.from({length:30},(u,n)=>`const line${n+1} = ${n+1};`).join(`
`),language:"typescript",hasLineNumbers:!0,maxHeight:200})},l={render:()=>e.jsx(r,{size:"sm",hasLineNumbers:!0})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor />
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:'{\n  render: () => <ControlledEditor value={`{\\n  "name": "my-app",\\n  "version": "1.0.0",\\n  "settings": {\\n    "port": 3000,\\n    "debug": false\\n  }\\n}`} language="json" hasLineNumbers />\n}',...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:'{\n  render: () => <ControlledEditor value={`def fibonacci(n: int) -> list[int]:\\n    """Generate Fibonacci sequence."""\\n    if n <= 0:\\n        return []\\n    fib = [0, 1]\\n    for i in range(2, n):\\n        fib.append(fib[-1] + fib[-2])\\n    return fib[:n]\\n\\nresult = fibonacci(10)\\nprint(result)`} language="python" hasLineNumbers />\n}',...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value="" placeholder="Type your code here..." language="typescript" />
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor isReadOnly hasLineNumbers />
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor value={Array.from({
    length: 30
  }, (_, i) => \`const line\${i + 1} = \${i + 1};\`).join('\\n')} language="typescript" hasLineNumbers maxHeight={200} />
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <ControlledEditor size="sm" hasLineNumbers />
}`,...l.parameters?.docs?.source}}};const E=["Default","JSONEditor","PythonEditor","WithPlaceholder","ReadOnly","WithMaxHeight","SmallSize"];export{a as Default,s as JSONEditor,o as PythonEditor,i as ReadOnly,l as SmallSize,c as WithMaxHeight,t as WithPlaceholder,E as __namedExportsOrder,x as default};
