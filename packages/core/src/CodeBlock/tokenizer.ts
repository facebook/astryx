/**
 * @file tokenizer.ts
 * @input Code string and language identifier
 * @output Array of tokens with type, start, and end positions
 * @position Shared utility; consumed by XDSCodeBlock and XDSCodeEditor
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CodeBlock/XDSCodeBlock.tsx
 * - /packages/core/src/CodeEditor/XDSCodeEditor.tsx
 */

export type Token = {type: string; start: number; end: number};

// ---------------------------------------------------------------------------
// Language definitions
// ---------------------------------------------------------------------------

type LangDef = {
  patterns: Array<{type: string; regex: RegExp}>;
};

const JS_KEYWORDS =
  /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await|try|catch|throw|new|typeof|instanceof|interface|type|enum|extends|implements|switch|case|break|continue|do|in|of|void|null|undefined|true|false|this|super|yield|delete|static|public|private|protected|readonly|abstract|as|is|keyof|declare|module|namespace|require)\b/;

const PYTHON_KEYWORDS =
  /\b(def|class|if|elif|else|for|while|return|import|from|as|with|try|except|raise|True|False|None|and|or|not|in|is|lambda|yield|async|await|pass|break|continue|del|global|nonlocal|assert|finally|print|self|cls)\b/;

const BASH_KEYWORDS =
  /\b(if|then|else|elif|fi|for|do|done|while|until|case|esac|function|in|select|return|exit|local|export|source|alias|unalias|readonly|shift|eval|exec|set|unset|trap|wait|read|echo|printf|test|true|false)\b/;

const CSS_KEYWORDS =
  /\b(important|inherit|initial|unset|revert|auto|none)\b/;

function buildLanguage(lang: string): LangDef | null {
  switch (lang) {
    case 'typescript':
    case 'javascript':
    case 'tsx':
    case 'jsx':
    case 'ts':
    case 'js':
      return {
        patterns: [
          {type: 'comment', regex: /\/\*[\s\S]*?\*\//},
          {type: 'comment', regex: /\/\/[^\n]*/},
          {type: 'string', regex: /`(?:[^`\\]|\\.)*`/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'(?:[^'\\]|\\.)*'/},
          {type: 'constant', regex: /@[\w]+/},
          {type: 'number', regex: /\b0[xX][0-9a-fA-F_]+\b/},
          {type: 'number', regex: /\b0[bB][01_]+\b/},
          {type: 'number', regex: /\b0[oO][0-7_]+\b/},
          {type: 'number', regex: /\b\d[\d_]*\.?[\d_]*(?:[eE][+-]?\d+)?\b/},
          {type: 'keyword', regex: JS_KEYWORDS},
          {type: 'type', regex: /\b[A-Z][a-zA-Z0-9_]*\b/},
          {type: 'function', regex: /\b[a-zA-Z_$][\w$]*(?=\s*\()/},
          {type: 'property', regex: /(?<=\.)\b[a-zA-Z_$][\w$]*\b/},
          {type: 'operator', regex: /[+\-*/%=!<>&|^~?:]+/},
          {type: 'punctuation', regex: /[{}()\[\];,.]/},
        ],
      };

    case 'json':
      return {
        patterns: [
          {type: 'property', regex: /"(?:[^"\\]|\\.)*"(?=\s*:)/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'number', regex: /-?\b\d+\.?\d*(?:[eE][+-]?\d+)?\b/},
          {type: 'constant', regex: /\b(true|false|null)\b/},
          {type: 'punctuation', regex: /[{}()\[\]:,]/},
        ],
      };

    case 'html':
    case 'xml':
    case 'svg':
      return {
        patterns: [
          {type: 'comment', regex: /<!--[\s\S]*?-->/},
          {type: 'keyword', regex: /<!DOCTYPE[^>]*>/i},
          {type: 'tag', regex: /<\/[a-zA-Z][\w-]*\s*>/},
          {type: 'tag', regex: /<[a-zA-Z][\w-]*/},
          {type: 'tag', regex: /\/?>/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'(?:[^'\\]|\\.)*'/},
          {type: 'attribute', regex: /\b[a-zA-Z_:][\w:.-]*(?=\s*=)/},
          {type: 'operator', regex: /=/},
        ],
      };

    case 'css':
    case 'scss':
    case 'less':
      return {
        patterns: [
          {type: 'comment', regex: /\/\*[\s\S]*?\*\//},
          {type: 'comment', regex: /\/\/[^\n]*/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'(?:[^'\\]|\\.)*'/},
          {type: 'number', regex: /-?\b\d+\.?\d*(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|deg|rad|turn|s|ms|fr)?\b/},
          {type: 'constant', regex: /#[0-9a-fA-F]{3,8}\b/},
          {type: 'keyword', regex: CSS_KEYWORDS},
          {type: 'keyword', regex: /@[a-zA-Z][\w-]*/},
          {type: 'function', regex: /\b[a-zA-Z_-][\w-]*(?=\s*\()/},
          {type: 'property', regex: /\b[a-zA-Z_-][\w-]*(?=\s*:)/},
          {type: 'keyword', regex: /::?[a-zA-Z][\w-]*/},
          {type: 'punctuation', regex: /[{}()\[\];:,]/},
          {type: 'operator', regex: /[+~>*=|^$]/},
        ],
      };

    case 'python':
    case 'py':
      return {
        patterns: [
          {type: 'string', regex: /"""[\s\S]*?"""/},
          {type: 'string', regex: /'''[\s\S]*?'''/},
          {type: 'string', regex: /f"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /f'(?:[^'\\]|\\.)*'/},
          {type: 'comment', regex: /#[^\n]*/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'(?:[^'\\]|\\.)*'/},
          {type: 'constant', regex: /@[\w.]+/},
          {type: 'number', regex: /\b0[xX][0-9a-fA-F_]+\b/},
          {type: 'number', regex: /\b0[bB][01_]+\b/},
          {type: 'number', regex: /\b0[oO][0-7_]+\b/},
          {type: 'number', regex: /\b\d[\d_]*\.?[\d_]*(?:[eE][+-]?\d+)?j?\b/},
          {type: 'keyword', regex: PYTHON_KEYWORDS},
          {type: 'type', regex: /\b[A-Z][a-zA-Z0-9_]*\b/},
          {type: 'function', regex: /\b[a-zA-Z_][\w]*(?=\s*\()/},
          {type: 'property', regex: /(?<=\.)\b[a-zA-Z_][\w]*\b/},
          {type: 'operator', regex: /[+\-*/%=!<>&|^~@:]+/},
          {type: 'punctuation', regex: /[{}()\[\];,.]/},
        ],
      };

    case 'bash':
    case 'sh':
    case 'zsh':
    case 'shell':
      return {
        patterns: [
          {type: 'comment', regex: /#[^\n]*/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'[^']*'/},
          {type: 'variable', regex: /\$\{[^}]+\}/},
          {type: 'variable', regex: /\$[a-zA-Z_][\w]*/},
          {type: 'variable', regex: /\$[0-9@#?*!$-]/},
          {type: 'number', regex: /\b\d+\b/},
          {type: 'keyword', regex: BASH_KEYWORDS},
          {type: 'function', regex: /(?<=^|\||\;|\&\&|\|\|)\s*[a-zA-Z_][\w.-]*/},
          {type: 'operator', regex: /[|&<>;!]+/},
          {type: 'punctuation', regex: /[{}()\[\]]/},
        ],
      };

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Core tokenizer
// ---------------------------------------------------------------------------

/**
 * Tokenizes a code string into an array of typed tokens with character offsets.
 *
 * Uses a greedy first-match strategy: at each position, try all patterns in
 * order and emit the first match. Skips characters that don't match any pattern.
 *
 * @param code - The source code string to tokenize
 * @param language - Language identifier (e.g. 'typescript', 'python')
 * @returns Array of tokens sorted by start position
 */
export function tokenize(code: string, language: string): Token[] {
  const langDef = buildLanguage(language);
  if (!langDef) return [];

  const tokens: Token[] = [];
  let pos = 0;

  while (pos < code.length) {
    let matched = false;

    for (const pattern of langDef.patterns) {
      pattern.regex.lastIndex = 0;
      const source = pattern.regex.source;
      const flags = pattern.regex.flags.replace('g', '');
      const anchored = new RegExp(source, flags);
      const slice = code.slice(pos);
      const match = anchored.exec(slice);

      if (match && match.index === 0 && match[0].length > 0) {
        tokens.push({
          type: pattern.type,
          start: pos,
          end: pos + match[0].length,
        });
        pos += match[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      pos++;
    }
  }

  return tokens;
}
