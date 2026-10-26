// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import transform from '../migrate-codeblock-tokenizer-to-language.mjs';

async function applyTransform(source) {
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

/** Collapse whitespace so assertions ignore the printer's line breaks. */
const flat = text => text.replace(/\s+/g, ' ');

describe('migrate-codeblock-tokenizer-to-language', () => {
  it('rewrites tokenizer beside a static language to a custom language', async () => {
    const output = flat(
      await applyTransform(`import {CodeBlock} from '@astryxdesign/core/CodeBlock';
const a = <CodeBlock code={src} language="zig" tokenizer={zigTokens} />;
const b = <CodeBlock code={src} language={'nim'} tokenizer={(c) => tokens(c)} />;`),
    );

    expect(output).not.toContain('tokenizer=');
    expect(output).toContain(
      "import { CodeBlock, createCodeLanguage } from '@astryxdesign/core/CodeBlock';",
    );
    expect(output).toContain(
      "language={createCodeLanguage({ name: 'zig', identifiers: ['zig'], tokenize: zigTokens })}",
    );
    expect(output).toContain(
      "language={createCodeLanguage({ name: 'nim', identifiers: ['nim'], tokenize: (c) => tokens(c) })}",
    );
  });

  it('adds the import beside a root-package import and follows aliases', async () => {
    const output = flat(
      await applyTransform(`import {CodeBlock as Code} from '@astryxdesign/core';
const a = <Code code={src} language="zig" tokenizer={zigTokens} />;`),
    );

    expect(output).toContain(
      "import { createCodeLanguage } from '@astryxdesign/core/CodeBlock';",
    );
    expect(output).toContain("createCodeLanguage({ name: 'zig'");
  });

  it('reports what it cannot prove and leaves it unchanged', async () => {
    const source = `import {CodeBlock} from '@astryxdesign/core/CodeBlock';
const a = <CodeBlock code={src} language={lang} tokenizer={t} />;
const b = <CodeBlock code={src} tokenizer={t} />;
const c = <CodeBlock code={src} language="plaintext" tokenizer={t} />;
const d = <CodeBlock {...rest} code={src} language="zig" tokenizer={t} />;`;
    const output = await applyTransform(source);

    expect(output.match(/TODO\(astryx upgrade\)/g)).toHaveLength(4);
    expect(output.match(/tokenizer=\{t\}/g)).toHaveLength(4);
    expect(output).not.toMatch(/import \{[^}]*createCodeLanguage/);
    expect(await applyTransform(output)).toBe(output);
  });

  it('leaves files without CodeBlock tokenizer alone', async () => {
    const source = `import {CodeBlock} from '@astryxdesign/core/CodeBlock';
const a = <CodeBlock code={src} language="ts" />;`;
    expect(await applyTransform(source)).toBe(source);
  });
});
