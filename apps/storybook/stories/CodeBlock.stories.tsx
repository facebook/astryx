import type {Meta, StoryObj} from '@storybook/react';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const meta: Meta<typeof XDSCodeBlock> = {
  title: 'Core/CodeBlock',
  component: XDSCodeBlock,
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: [
        'typescript',
        'javascript',
        'json',
        'html',
        'css',
        'python',
        'bash',
        'php',
        'hack',
        'yaml',
        'markdown',
        'plaintext',
      ],
      description: 'Language for syntax highlighting',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Text size',
    },
    width: {
      control: 'text',
      description: 'Width of the code block (any CSS width value)',
    },
    container: {
      control: 'select',
      options: ['card', 'section'],
      description: 'Container presentation style',
    },
    hasLineNumbers: {control: 'boolean'},
    hasCopyButton: {control: 'boolean'},
    isWrapped: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSCodeBlock>;

const tsExample = `import {useState, useEffect} from 'react';

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
}`;

export const Default: Story = {
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    hasCopyButton: true,
  },
};

export const WithHighlightedLines: Story = {
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    highlightLines: [9, 10, 11, 12, 13],
  },
};

export const JSON: Story = {
  args: {
    code: `{
  "name": "@xds/core",
  "version": "0.0.5",
  "dependencies": {
    "@stylexjs/stylex": "^0.17.5",
    "react": "^19.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest"
  }
}`,
    language: 'json',
    title: 'package.json',
    hasLineNumbers: true,
  },
};

export const Python: Story = {
  args: {
    code: `#!/usr/bin/env python3
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
    process(cfg)`,
    language: 'python',
    title: 'pipeline.py',
    hasLineNumbers: true,
    highlightLines: [7, 8, 9, 10, 11],
  },
};

export const HTML: Story = {
  args: {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Hello World</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main id="app">
      <h1>Hello, World!</h1>
      <p class="subtitle">Welcome to XDS.</p>
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    language: 'html',
    title: 'index.html',
    hasLineNumbers: true,
  },
};

export const CSS: Story = {
  args: {
    code: `:root {
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
}`,
    language: 'css',
    title: 'button.css',
    hasLineNumbers: true,
  },
};

export const Bash: Story = {
  args: {
    code: `#!/bin/bash
# Deploy script for production

set -euo pipefail

DEPLOY_DIR="/opt/app"
VERSION=$(git describe --tags --always)

echo "Deploying version $VERSION..."

if [ ! -d "$DEPLOY_DIR" ]; then
  mkdir -p "$DEPLOY_DIR"
fi

yarn build
cp -r dist/* "$DEPLOY_DIR/"

echo "Deploy complete: $VERSION"`,
    language: 'bash',
    title: 'deploy.sh',
    hasLineNumbers: true,
  },
};

export const SingleLine: Story = {
  args: {
    code: 'npm install @xds/core',
    language: 'bash',
    hasCopyButton: true,
  },
};

export const Wrapped: Story = {
  args: {
    code: `// This is a very long line that demonstrates the word wrapping behavior of the code block component when isWrapped is set to true, which causes long lines to wrap instead of scrolling horizontally
const result = someVeryLongFunctionName(parameterOne, parameterTwo, parameterThree, parameterFour, parameterFive);`,
    language: 'typescript',
    isWrapped: true,
    hasLineNumbers: true,
  },
};

export const WithMaxHeight: Story = {
  args: {
    code: Array.from(
      {length: 50},
      (_, i) => `const line${i + 1} = ${i + 1};`,
    ).join('\n'),
    language: 'typescript',
    title: 'many-lines.ts',
    hasLineNumbers: true,
    maxHeight: 200,
  },
};

export const SmallSize: Story = {
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    hasLineNumbers: true,
    size: 'sm',
  },
};

export const NoHeader: Story = {
  args: {
    code: `const greeting = "Hello, world!";
console.log(greeting);`,
    language: 'typescript',
    hasCopyButton: true,
  },
};

export const Plaintext: Story = {
  args: {
    code: `This is plain text without any syntax highlighting.
It preserves whitespace and line breaks.

  Indentation is maintained.
    Nested indentation too.`,
    language: 'plaintext',
    title: 'notes.txt',
    hasLineNumbers: true,
  },
};

export const FullWidth: Story = {
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    width: '100%',
  },
};

export const ContainerSection: Story = {
  args: {
    code: tsExample,
    language: 'typescript',
    title: 'useUser.ts',
    width: '100%',
    container: 'section',
  },
};
