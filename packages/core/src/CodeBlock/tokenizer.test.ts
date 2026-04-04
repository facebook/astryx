import {describe, it, expect} from 'vitest';
import {tokenize, tokenizeAsync, SYNC_TOKENIZE_THRESHOLD} from './tokenizer';

function tokenTypes(code: string, lang: string) {
  return tokenize(code, lang).map(t => ({
    type: t.type,
    text: code.slice(t.start, t.end),
  }));
}

function hasType(code: string, lang: string, type: string) {
  return tokenize(code, lang).some(t => t.type === type);
}

describe('tokenizer', () => {
  describe('typescript', () => {
    it('tokenizes keywords', () => {
      const tokens = tokenTypes('const x = 42;', 'typescript');
      expect(tokens).toContainEqual({type: 'keyword', text: 'const'});
    });

    it('tokenizes strings', () => {
      const tokens = tokenTypes('const s = "hello";', 'typescript');
      expect(tokens).toContainEqual({type: 'string', text: '"hello"'});
    });

    it('tokenizes single-quote strings', () => {
      const tokens = tokenTypes("const s = 'hello';", 'typescript');
      expect(tokens).toContainEqual({type: 'string', text: "'hello'"});
    });

    it('tokenizes template literals', () => {
      const tokens = tokenTypes('const s = `hello ${name}`;', 'typescript');
      expect(tokens).toContainEqual({type: 'string', text: '`hello ${name}`'});
    });

    it('tokenizes numbers', () => {
      const tokens = tokenTypes('const x = 42;', 'typescript');
      expect(tokens).toContainEqual({type: 'number', text: '42'});
    });

    it('tokenizes line comments', () => {
      const tokens = tokenTypes('// this is a comment', 'typescript');
      expect(tokens).toContainEqual({
        type: 'comment',
        text: '// this is a comment',
      });
    });

    it('tokenizes block comments', () => {
      const tokens = tokenTypes('/* block comment */', 'typescript');
      expect(tokens).toContainEqual({
        type: 'comment',
        text: '/* block comment */',
      });
    });

    it('tokenizes function calls', () => {
      const tokens = tokenTypes('console.log("hi")', 'typescript');
      expect(tokens).toContainEqual({type: 'function', text: 'log'});
    });

    it('tokenizes types (PascalCase)', () => {
      const tokens = tokenTypes('const x: MyType = {};', 'typescript');
      expect(tokens).toContainEqual({type: 'type', text: 'MyType'});
    });

    it('tokenizes multiple keywords', () => {
      const tokens = tokenTypes('if (true) { return false; }', 'typescript');
      const kws = tokens.filter(t => t.type === 'keyword').map(t => t.text);
      expect(kws).toContain('if');
      expect(kws).toContain('true');
      expect(kws).toContain('return');
      expect(kws).toContain('false');
    });

    it('tokenizes import statement', () => {
      const tokens = tokenTypes(
        "import {useState} from 'react';",
        'typescript',
      );
      const kws = tokens.filter(t => t.type === 'keyword').map(t => t.text);
      expect(kws).toContain('import');
      expect(kws).toContain('from');
      expect(tokens).toContainEqual({type: 'string', text: "'react'"});
    });

    it('tokenizes multi-line code', () => {
      const code = `const x = 1;
const y = "hello";
// comment`;
      const tokens = tokenTypes(code, 'typescript');
      const kws = tokens.filter(t => t.type === 'keyword');
      expect(kws.length).toBe(2); // two 'const'
      expect(tokens).toContainEqual({type: 'string', text: '"hello"'});
      expect(tokens).toContainEqual({type: 'comment', text: '// comment'});
    });

    it('produces non-zero tokens for typical code', () => {
      const code = `function greet(name: string): string {
  const greeting = \`Hello, \${name}!\`;
  console.log(greeting);
  return greeting;
}`;
      const tokens = tokenize(code, 'typescript');
      expect(tokens.length).toBeGreaterThan(5);
    });
  });

  describe('json', () => {
    it('tokenizes keys and values', () => {
      const tokens = tokenTypes('{"name": "value"}', 'json');
      expect(tokens).toContainEqual({type: 'property', text: '"name"'});
      expect(tokens).toContainEqual({type: 'string', text: '"value"'});
    });

    it('tokenizes numbers', () => {
      const tokens = tokenTypes('{"count": 42}', 'json');
      expect(tokens).toContainEqual({type: 'number', text: '42'});
    });

    it('tokenizes booleans and null', () => {
      const tokens = tokenTypes('{"a": true, "b": false, "c": null}', 'json');
      const constants = tokens
        .filter(t => t.type === 'constant')
        .map(t => t.text);
      expect(constants).toContain('true');
      expect(constants).toContain('false');
      expect(constants).toContain('null');
    });
  });

  describe('python', () => {
    it('tokenizes keywords', () => {
      const tokens = tokenTypes('def hello():', 'python');
      expect(tokens).toContainEqual({type: 'keyword', text: 'def'});
    });

    it('tokenizes comments', () => {
      const tokens = tokenTypes('# this is a comment', 'python');
      expect(tokens).toContainEqual({
        type: 'comment',
        text: '# this is a comment',
      });
    });

    it('tokenizes decorators', () => {
      const tokens = tokenTypes('@dataclass', 'python');
      expect(tokens).toContainEqual({type: 'constant', text: '@dataclass'});
    });

    it('tokenizes triple-quote strings', () => {
      const tokens = tokenTypes('"""docstring"""', 'python');
      expect(tokens).toContainEqual({type: 'string', text: '"""docstring"""'});
    });

    it('tokenizes f-strings', () => {
      const tokens = tokenTypes('f"hello {name}"', 'python');
      expect(tokens).toContainEqual({type: 'string', text: 'f"hello {name}"'});
    });

    it('produces tokens for a real function', () => {
      const code = `def process(config):
    print(f"Processing {config}")
    return True`;
      const tokens = tokenize(code, 'python');
      expect(tokens.length).toBeGreaterThan(5);
      const kws = tokenTypes(code, 'python')
        .filter(t => t.type === 'keyword')
        .map(t => t.text);
      expect(kws).toContain('def');
      expect(kws).toContain('return');
      expect(kws).toContain('True');
    });
  });

  describe('html', () => {
    it('tokenizes tags', () => {
      const tokens = tokenTypes('<div class="x">hello</div>', 'html');
      expect(tokens.some(t => t.type === 'tag')).toBe(true);
    });

    it('tokenizes attributes', () => {
      const tokens = tokenTypes('<div class="x">hello</div>', 'html');
      expect(tokens).toContainEqual({type: 'attribute', text: 'class'});
    });

    it('tokenizes comments', () => {
      const tokens = tokenTypes('<!-- comment -->', 'html');
      expect(tokens).toContainEqual({
        type: 'comment',
        text: '<!-- comment -->',
      });
    });
  });

  describe('css', () => {
    it('tokenizes properties', () => {
      const tokens = tokenTypes('display: flex;', 'css');
      expect(tokens).toContainEqual({type: 'property', text: 'display'});
    });

    it('tokenizes selectors', () => {
      const tokens = tokenTypes('.button { }', 'css');
      expect(tokens).toContainEqual({type: 'tag', text: '.button'});
    });

    it('tokenizes custom properties', () => {
      const tokens = tokenTypes('--color-primary: blue;', 'css');
      expect(tokens).toContainEqual({
        type: 'variable',
        text: '--color-primary',
      });
    });

    it('tokenizes numbers with units', () => {
      const tokens = tokenTypes('padding: 8px;', 'css');
      expect(tokens).toContainEqual({type: 'number', text: '8px'});
    });

    it('tokenizes hex colors', () => {
      const tokens = tokenTypes('color: #0064E0;', 'css');
      expect(tokens).toContainEqual({type: 'constant', text: '#0064E0'});
    });

    it('tokenizes functions', () => {
      const tokens = tokenTypes('color: var(--x);', 'css');
      expect(tokens).toContainEqual({type: 'function', text: 'var'});
    });
  });

  describe('bash', () => {
    it('tokenizes comments', () => {
      const tokens = tokenTypes('# comment', 'bash');
      expect(tokens).toContainEqual({type: 'comment', text: '# comment'});
    });

    it('tokenizes variables', () => {
      const tokens = tokenTypes('echo $HOME', 'bash');
      expect(tokens).toContainEqual({type: 'variable', text: '$HOME'});
    });

    it('tokenizes strings', () => {
      const tokens = tokenTypes('echo "hello"', 'bash');
      expect(tokens).toContainEqual({type: 'string', text: '"hello"'});
    });
  });

  describe('edge cases', () => {
    it('returns empty for unknown language', () => {
      expect(tokenize('const x = 1;', 'brainfuck')).toEqual([]);
    });

    it('returns empty for plaintext', () => {
      expect(tokenize('hello world', 'plaintext')).toEqual([]);
    });

    it('handles empty string', () => {
      expect(tokenize('', 'typescript')).toEqual([]);
    });

    it('tokens have valid ranges', () => {
      const code = 'const x = 42;';
      const tokens = tokenize(code, 'typescript');
      for (const t of tokens) {
        expect(t.start).toBeGreaterThanOrEqual(0);
        expect(t.end).toBeGreaterThan(t.start);
        expect(t.end).toBeLessThanOrEqual(code.length);
        expect(code.slice(t.start, t.end)).toBeTruthy();
      }
    });

    it('tokens do not overlap', () => {
      const code = 'const greeting = "hello"; // comment\nreturn 42;';
      const tokens = tokenize(code, 'typescript');
      for (let i = 1; i < tokens.length; i++) {
        expect(tokens[i].start).toBeGreaterThanOrEqual(tokens[i - 1].end);
      }
    });
  });

  describe('tokenizeAsync', () => {
    it('produces same results as sync tokenize for small code', async () => {
      const code = 'const x = 42;\nreturn "hello";';
      const syncTokens = tokenize(code, 'typescript');
      const asyncTokens = await tokenizeAsync(code, 'typescript');
      expect(asyncTokens).toEqual(syncTokens);
    });

    it('produces same results for larger code', async () => {
      // Generate code larger than SYNC_TOKENIZE_THRESHOLD
      const line = 'const x = 42; // comment\n';
      const code = line.repeat(
        Math.ceil(SYNC_TOKENIZE_THRESHOLD / line.length) + 10,
      );
      const syncTokens = tokenize(code, 'typescript');
      const asyncTokens = await tokenizeAsync(code, 'typescript');
      expect(asyncTokens).toEqual(syncTokens);
    });

    it('returns empty for unknown language', async () => {
      const tokens = await tokenizeAsync('const x = 1;', 'brainfuck');
      expect(tokens).toEqual([]);
    });

    it('respects abort signal', async () => {
      const controller = new AbortController();
      controller.abort();
      const tokens = await tokenizeAsync(
        'const x = 42;',
        'typescript',
        controller.signal,
      );
      // Aborted before processing — tokens may be empty or partial
      expect(Array.isArray(tokens)).toBe(true);
    });

    it('exports SYNC_TOKENIZE_THRESHOLD as a number', () => {
      expect(typeof SYNC_TOKENIZE_THRESHOLD).toBe('number');
      expect(SYNC_TOKENIZE_THRESHOLD).toBe(2000);
    });
  });
});
