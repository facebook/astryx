import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{i as n,t as r}from"./Icon-hgxDpd-5.js";import{n as i,t as a}from"./IconButton-CA6xEwip.js";import{i as o,t as s}from"./CodeBlock-CIb6RsWa.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;e((()=>{s(),a(),r(),c=t(),l={title:`Core/CodeBlock`,component:o,tags:[`autodocs`],argTypes:{language:{control:`select`,options:[`typescript`,`javascript`,`json`,`html`,`css`,`python`,`bash`,`php`,`hack`,`yaml`,`markdown`,`plaintext`],description:`Language for syntax highlighting`},size:{control:`select`,options:[`sm`,`md`],description:`Text size`},width:{control:`text`,description:`Width of the code block (any CSS width value)`},container:{control:`select`,options:[`card`,`section`],description:`Container presentation style`},hasLineNumbers:{control:`boolean`},hasCopyButton:{control:`boolean`},isWrapped:{control:`boolean`},isCollapsible:{control:`boolean`},collapsibleThreshold:{control:`number`}}},u=`import {useState, useEffect} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }
  return response.json();
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);

  return user;
}`,d={args:{code:u,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,hasCopyButton:!0}},f={args:{code:u,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,highlightLines:[9,10,11,12,13]}},p={args:{code:`{
  "name": "@astryxdesign/core",
  "version": "0.0.5",
  "dependencies": {
    "@stylexjs/stylex": "^0.17.5",
    "react": "^19.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest"
  }
}`,language:`json`,title:`package.json`,hasLineNumbers:!0}},m={args:{code:`#!/usr/bin/env python3
"""Data processing pipeline."""

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Config:
    input_path: str
    output_path: str
    batch_size: int = 100

def process(config: Config) -> None:
    """Process data according to config."""
    print(f"Processing {config.input_path}")
    # TODO: implement pipeline
    pass

if __name__ == "__main__":
    cfg = Config("input.csv", "output.csv")
    process(cfg)`,language:`python`,title:`pipeline.py`,hasLineNumbers:!0,highlightLines:[7,8,9,10,11]}},h={args:{code:`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Hello World</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main id="app">
      <h1>Hello, World!</h1>
      <p class="subtitle">Welcome to Astryx.</p>
    </main>
    <script src="app.js"><\/script>
  </body>
</html>`,language:`html`,title:`index.html`,hasLineNumbers:!0}},g={args:{code:`:root {
  --color-primary: #0064E0;
  --radius: 8px;
}

.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius);
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  transition: opacity 0.15s ease;
}

.button:hover {
  opacity: 0.9;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #2694FE;
  }
}`,language:`css`,title:`button.css`,hasLineNumbers:!0}},_={args:{code:`#!/bin/bash
# Deploy script for production

set -euo pipefail

DEPLOY_DIR="/opt/app"
VERSION=$(git describe --tags --always)

echo "Deploying version $VERSION..."

if [ ! -d "$DEPLOY_DIR" ]; then
  mkdir -p "$DEPLOY_DIR"
fi

pnpm build
cp -r dist/* "$DEPLOY_DIR/"

echo "Deploy complete: $VERSION"`,language:`bash`,title:`deploy.sh`,hasLineNumbers:!0}},v={args:{code:`npm install @astryxdesign/core`,language:`bash`,hasCopyButton:!0}},y={args:{code:`// This is a very long line that demonstrates the word wrapping behavior of the code block component when isWrapped is set to true, which causes long lines to wrap instead of scrolling horizontally
const result = someVeryLongFunctionName(parameterOne, parameterTwo, parameterThree, parameterFour, parameterFive);`,language:`typescript`,isWrapped:!0,hasLineNumbers:!0}},b={args:{code:Array.from({length:50},(e,t)=>`const line${t+1} = ${t+1};`).join(`
`),language:`typescript`,title:`many-lines.ts`,hasLineNumbers:!0,maxHeight:200}},x={args:{code:u,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,size:`sm`}},S={args:{code:`const greeting = "Hello, world!";
console.log(greeting);`,language:`typescript`,hasCopyButton:!0}},C={args:{code:`This is plain text without any syntax highlighting.
It preserves whitespace and line breaks.

  Indentation is maintained.
    Nested indentation too.`,language:`plaintext`,title:`notes.txt`,hasLineNumbers:!0}},w={args:{code:u,language:`typescript`,title:`useUser.ts`,width:`100%`}},T={args:{code:u,language:`typescript`,title:`useUser.ts`,width:`100%`,container:`section`}},E={args:{code:u,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,isCollapsible:!0}},D={args:{code:u,language:`typescript`,title:`useUser.ts`},render:e=>(0,c.jsx)(o,{...e,renderCopyButton:({isCopied:e,copy:t,label:r})=>(0,c.jsx)(i,{label:r,size:`sm`,variant:`ghost`,icon:(0,c.jsx)(n,{icon:e?`check`:`copy`}),onClick:t})})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    hasCopyButton: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    highlightLines: [9, 10, 11, 12, 13]
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`{
  "name": "@astryxdesign/core",
  "version": "0.0.5",
  "dependencies": {
    "@stylexjs/stylex": "^0.17.5",
    "react": "^19.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest"
  }
}\`,
    language: 'json',
    title: 'package.json',
    hasLineNumbers: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`#!/usr/bin/env python3
"""Data processing pipeline."""

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Config:
    input_path: str
    output_path: str
    batch_size: int = 100

def process(config: Config) -> None:
    """Process data according to config."""
    print(f"Processing {config.input_path}")
    # TODO: implement pipeline
    pass

if __name__ == "__main__":
    cfg = Config("input.csv", "output.csv")
    process(cfg)\`,
    language: 'python',
    title: 'pipeline.py',
    hasLineNumbers: true,
    highlightLines: [7, 8, 9, 10, 11]
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Hello World</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main id="app">
      <h1>Hello, World!</h1>
      <p class="subtitle">Welcome to Astryx.</p>
    </main>
    <script src="app.js"><\/script>
  </body>
</html>\`,
    language: 'html',
    title: 'index.html',
    hasLineNumbers: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`:root {
  --color-primary: #0064E0;
  --radius: 8px;
}

.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius);
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  transition: opacity 0.15s ease;
}

.button:hover {
  opacity: 0.9;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #2694FE;
  }
}\`,
    language: 'css',
    title: 'button.css',
    hasLineNumbers: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`#!/bin/bash
# Deploy script for production

set -euo pipefail

DEPLOY_DIR="/opt/app"
VERSION=$(git describe --tags --always)

echo "Deploying version $VERSION..."

if [ ! -d "$DEPLOY_DIR" ]; then
  mkdir -p "$DEPLOY_DIR"
fi

pnpm build
cp -r dist/* "$DEPLOY_DIR/"

echo "Deploy complete: $VERSION"\`,
    language: 'bash',
    title: 'deploy.sh',
    hasLineNumbers: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    code: 'npm install @astryxdesign/core',
    language: 'bash',
    hasCopyButton: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`// This is a very long line that demonstrates the word wrapping behavior of the code block component when isWrapped is set to true, which causes long lines to wrap instead of scrolling horizontally
const result = someVeryLongFunctionName(parameterOne, parameterTwo, parameterThree, parameterFour, parameterFive);\`,
    language: 'typescript',
    isWrapped: true,
    hasLineNumbers: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    code: Array.from({
      length: 50
    }, (_, i) => \`const line\${i + 1} = \${i + 1};\`).join('\\n'),
    language: 'typescript',
    title: 'many-lines.ts',
    hasLineNumbers: true,
    maxHeight: 200
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    size: 'sm'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`const greeting = "Hello, world!";
console.log(greeting);\`,
    language: 'typescript',
    hasCopyButton: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`This is plain text without any syntax highlighting.
It preserves whitespace and line breaks.

  Indentation is maintained.
    Nested indentation too.\`,
    language: 'plaintext',
    title: 'notes.txt',
    hasLineNumbers: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    width: '100%'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    width: '100%',
    container: 'section'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    isCollapsible: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts'
  },
  render: args => <CodeBlock {...args} renderCopyButton={({
    isCopied,
    copy,
    label
  }) => <IconButton label={label} size="sm" variant="ghost" icon={<Icon icon={isCopied ? 'check' : 'copy'} />} onClick={copy} />} />
}`,...D.parameters?.docs?.source}}},O=[`Default`,`WithHighlightedLines`,`JSON`,`Python`,`HTML`,`CSS`,`Bash`,`SingleLine`,`Wrapped`,`WithMaxHeight`,`SmallSize`,`NoHeader`,`Plaintext`,`FullWidth`,`ContainerSection`,`Collapsible`,`CustomCopyButton`]}))();export{_ as Bash,g as CSS,E as Collapsible,T as ContainerSection,D as CustomCopyButton,d as Default,w as FullWidth,h as HTML,p as JSON,S as NoHeader,C as Plaintext,m as Python,v as SingleLine,x as SmallSize,f as WithHighlightedLines,b as WithMaxHeight,y as Wrapped,O as __namedExportsOrder,l as default};