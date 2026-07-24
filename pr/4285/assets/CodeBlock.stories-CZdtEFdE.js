import{i as e}from"./preload-helper-CT_b8DTk.js";import{i as t,t as n}from"./CodeBlock-IQAiM3j8.js";var r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;e((()=>{n(),r={title:`Core/CodeBlock`,component:t,tags:[`autodocs`],argTypes:{language:{control:`select`,options:[`typescript`,`javascript`,`json`,`html`,`css`,`python`,`bash`,`php`,`hack`,`yaml`,`markdown`,`plaintext`],description:`Language for syntax highlighting`},size:{control:`select`,options:[`sm`,`md`],description:`Text size`},width:{control:`text`,description:`Width of the code block (any CSS width value)`},container:{control:`select`,options:[`card`,`section`],description:`Container presentation style`},hasLineNumbers:{control:`boolean`},hasCopyButton:{control:`boolean`},isWrapped:{control:`boolean`}}},i=`import {useState, useEffect} from 'react';

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
}`,a={args:{code:i,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,hasCopyButton:!0}},o={args:{code:i,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,highlightLines:[9,10,11,12,13]}},s={args:{code:`{
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
}`,language:`json`,title:`package.json`,hasLineNumbers:!0}},c={args:{code:`#!/usr/bin/env python3
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
    process(cfg)`,language:`python`,title:`pipeline.py`,hasLineNumbers:!0,highlightLines:[7,8,9,10,11]}},l={args:{code:`<!DOCTYPE html>
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
</html>`,language:`html`,title:`index.html`,hasLineNumbers:!0}},u={args:{code:`:root {
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
}`,language:`css`,title:`button.css`,hasLineNumbers:!0}},d={args:{code:`#!/bin/bash
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

echo "Deploy complete: $VERSION"`,language:`bash`,title:`deploy.sh`,hasLineNumbers:!0}},f={args:{code:`npm install @astryxdesign/core`,language:`bash`,hasCopyButton:!0}},p={args:{code:`// This is a very long line that demonstrates the word wrapping behavior of the code block component when isWrapped is set to true, which causes long lines to wrap instead of scrolling horizontally
const result = someVeryLongFunctionName(parameterOne, parameterTwo, parameterThree, parameterFour, parameterFive);`,language:`typescript`,isWrapped:!0,hasLineNumbers:!0}},m={args:{code:Array.from({length:50},(e,t)=>`const line${t+1} = ${t+1};`).join(`
`),language:`typescript`,title:`many-lines.ts`,hasLineNumbers:!0,maxHeight:200}},h={args:{code:i,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,size:`sm`}},g={args:{code:`const greeting = "Hello, world!";
console.log(greeting);`,language:`typescript`,hasCopyButton:!0}},_={args:{code:`This is plain text without any syntax highlighting.
It preserves whitespace and line breaks.

  Indentation is maintained.
    Nested indentation too.`,language:`plaintext`,title:`notes.txt`,hasLineNumbers:!0}},v={args:{code:i,language:`typescript`,title:`useUser.ts`,width:`100%`}},y={args:{code:i,language:`typescript`,title:`useUser.ts`,width:`100%`,container:`section`}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    hasCopyButton: true
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    highlightLines: [9, 10, 11, 12, 13]
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    code: 'npm install @astryxdesign/core',
    language: 'bash',
    hasCopyButton: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`// This is a very long line that demonstrates the word wrapping behavior of the code block component when isWrapped is set to true, which causes long lines to wrap instead of scrolling horizontally
const result = someVeryLongFunctionName(parameterOne, parameterTwo, parameterThree, parameterFour, parameterFive);\`,
    language: 'typescript',
    isWrapped: true,
    hasLineNumbers: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    code: Array.from({
      length: 50
    }, (_, i) => \`const line\${i + 1} = \${i + 1};\`).join('\\n'),
    language: 'typescript',
    title: 'many-lines.ts',
    hasLineNumbers: true,
    maxHeight: 200
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    size: 'sm'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`const greeting = "Hello, world!";
console.log(greeting);\`,
    language: 'typescript',
    hasCopyButton: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    code: \`This is plain text without any syntax highlighting.
It preserves whitespace and line breaks.

  Indentation is maintained.
    Nested indentation too.\`,
    language: 'plaintext',
    title: 'notes.txt',
    hasLineNumbers: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    width: '100%'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    width: '100%',
    container: 'section'
  }
}`,...y.parameters?.docs?.source}}},b=[`Default`,`WithHighlightedLines`,`JSON`,`Python`,`HTML`,`CSS`,`Bash`,`SingleLine`,`Wrapped`,`WithMaxHeight`,`SmallSize`,`NoHeader`,`Plaintext`,`FullWidth`,`ContainerSection`]}))();export{d as Bash,u as CSS,y as ContainerSection,a as Default,v as FullWidth,l as HTML,s as JSON,g as NoHeader,_ as Plaintext,c as Python,f as SingleLine,h as SmallSize,o as WithHighlightedLines,m as WithMaxHeight,p as Wrapped,b as __namedExportsOrder,r as default};