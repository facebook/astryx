// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {stripCodeExampleCopyrightHeader} from '../lib/codeExamples';

const HEADER = '// Copyright (c) Meta Platforms, Inc. and affiliates.';

describe('stripCodeExampleCopyrightHeader', () => {
  it('removes the canonical repo header and following blank line', () => {
    expect(
      stripCodeExampleCopyrightHeader(
        `${HEADER}\n\nexport function Example() {}`,
      ),
    ).toBe('export function Example() {}');
  });

  it('handles CRLF line endings', () => {
    expect(
      stripCodeExampleCopyrightHeader(`${HEADER}\r\n\r\nconst x = 1;`),
    ).toBe('const x = 1;');
  });

  it('preserves shebangs while removing the copyright line after them', () => {
    expect(
      stripCodeExampleCopyrightHeader(
        `#!/usr/bin/env node\n${HEADER}\n\nconsole.log('hi');`,
      ),
    ).toBe("#!/usr/bin/env node\nconsole.log('hi');");
  });

  it('leaves non-header comments untouched', () => {
    const code = `const x = 1;\n${HEADER}\nconst y = 2;`;
    expect(stripCodeExampleCopyrightHeader(code)).toBe(code);
  });
});
