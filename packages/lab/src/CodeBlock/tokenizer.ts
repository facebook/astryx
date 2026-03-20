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
  patterns: Array<{type: string; regex: RegExp; anchored: RegExp}>;
};

/** Cache compiled language definitions to avoid re-creating regexes. */
const langCache = new Map<string, LangDef | null>();

const JS_KEYWORDS =
  /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await|try|catch|throw|new|typeof|instanceof|interface|type|enum|extends|implements|switch|case|break|continue|do|in|of|void|null|undefined|true|false|this|super|yield|delete|static|public|private|protected|readonly|abstract|as|is|keyof|declare|module|namespace|require)\b/;

const PYTHON_KEYWORDS =
  /\b(def|class|if|elif|else|for|while|return|import|from|as|with|try|except|raise|True|False|None|and|or|not|in|is|lambda|yield|async|await|pass|break|continue|del|global|nonlocal|assert|finally|print|self|cls)\b/;

const BASH_KEYWORDS =
  /\b(if|then|else|elif|fi|for|do|done|while|until|case|esac|function|in|select|return|exit|local|export|source|alias|unalias|readonly|shift|eval|exec|set|unset|trap|wait|read|echo|printf|test|true|false)\b/;

const CSS_KEYWORDS = /\b(important|inherit|initial|unset|revert|auto|none)\b/;

const PHP_KEYWORDS =
  /\b(function|class|if|else|elseif|for|foreach|while|return|echo|public|private|protected|static|new|try|catch|throw|namespace|use|require|require_once|include|include_once|extends|implements|interface|abstract|final|const|var|true|false|null|array|isset|unset|empty|list|match|enum|switch|case|break|continue|do|yield|fn)\b/;

const HACK_KEYWORDS =
  /\b(function|class|if|else|for|foreach|while|return|echo|public|private|protected|static|new|try|catch|throw|namespace|use|require|include|extends|implements|interface|abstract|final|const|shape|vec|dict|keyset|async|await|concurrent|enum|type|newtype|tuple|inout)\b/;

function buildLanguage(lang: string): LangDef | null {
  const cached = langCache.get(lang);
  if (cached !== undefined) return cached;

  const def = buildLanguageUncached(lang);
  langCache.set(lang, def);
  return def;
}

function buildLanguageUncached(lang: string): LangDef | null {
  const raw = buildLanguagePatterns(lang);
  if (!raw) return null;
  return {
    patterns: raw.patterns.map(p => {
      const flags = p.regex.flags.replace('g', '');
      return {...p, anchored: new RegExp(p.regex.source, flags)};
    }),
  };
}

function buildLanguagePatterns(
  lang: string,
): {patterns: Array<{type: string; regex: RegExp}>} | null {
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
          // eslint-disable-next-line no-useless-escape
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
          // eslint-disable-next-line no-useless-escape
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
          {
            type: 'number',
            regex:
              /-?\b\d+\.?\d*(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|deg|rad|turn|s|ms|fr)?\b/,
          },
          {type: 'constant', regex: /#[0-9a-fA-F]{3,8}\b/},
          {type: 'keyword', regex: CSS_KEYWORDS},
          {type: 'keyword', regex: /@[a-zA-Z][\w-]*/},
          {type: 'function', regex: /\b[a-zA-Z_-][\w-]*(?=\s*\()/},
          {type: 'property', regex: /\b[a-zA-Z_-][\w-]*(?=\s*:)/},
          {type: 'keyword', regex: /::?[a-zA-Z][\w-]*/},
          // eslint-disable-next-line no-useless-escape
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
          // eslint-disable-next-line no-useless-escape
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
          {type: 'function', regex: /(?<=^|\||;|&&|\|\|)\s*[a-zA-Z_][\w.-]*/},
          {type: 'operator', regex: /[|&<>;!]+/},
          // eslint-disable-next-line no-useless-escape
          {type: 'punctuation', regex: /[{}()\[\]]/},
        ],
      };

    case 'php':
      return {
        patterns: [
          {type: 'comment', regex: /\/\*[\s\S]*?\*\//},
          {type: 'comment', regex: /\/\/[^\n]*/},
          {type: 'comment', regex: /#[^\n]*/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'(?:[^'\\]|\\.)*'/},
          {type: 'variable', regex: /\$[a-zA-Z_][\w]*/},
          {type: 'number', regex: /\b0[xX][0-9a-fA-F]+\b/},
          {type: 'number', regex: /\b\d+\.?\d*(?:[eE][+-]?\d+)?\b/},
          {type: 'keyword', regex: PHP_KEYWORDS},
          {type: 'type', regex: /\b[A-Z][a-zA-Z0-9_]*\b/},
          {type: 'function', regex: /\b[a-zA-Z_][\w]*(?=\s*\()/},
          {type: 'property', regex: /(?<=->|::)\b[a-zA-Z_][\w]*\b/},
          {type: 'operator', regex: /[+\-*/%=!<>&|^~?:.]+/},
          {type: 'constant', regex: /@[\w]+/},
          // eslint-disable-next-line no-useless-escape
          {type: 'punctuation', regex: /[{}()\[\];,.]/},
        ],
      };

    case 'hack':
      return {
        patterns: [
          {type: 'comment', regex: /\/\*[\s\S]*?\*\//},
          {type: 'comment', regex: /\/\/[^\n]*/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'(?:[^'\\]|\\.)*'/},
          {type: 'variable', regex: /\$[a-zA-Z_][\w]*/},
          {type: 'number', regex: /\b0[xX][0-9a-fA-F]+\b/},
          {type: 'number', regex: /\b\d+\.?\d*(?:[eE][+-]?\d+)?\b/},
          {type: 'keyword', regex: HACK_KEYWORDS},
          {type: 'type', regex: /\b[A-Z][a-zA-Z0-9_]*\b/},
          {type: 'function', regex: /\b[a-zA-Z_][\w]*(?=\s*\()/},
          {type: 'property', regex: /(?<=->|::)\b[a-zA-Z_][\w]*\b/},
          {type: 'operator', regex: /[+\-*/%=!<>&|^~?:.]+/},
          {type: 'constant', regex: /<<[\w]+/},
          // eslint-disable-next-line no-useless-escape
          {type: 'punctuation', regex: /[{}()\[\];,.]/},
        ],
      };

    case 'yaml':
    case 'yml':
      return {
        patterns: [
          {type: 'comment', regex: /#[^\n]*/},
          {type: 'string', regex: /"(?:[^"\\]|\\.)*"/},
          {type: 'string', regex: /'(?:[^'\\]|\\.)*'/},
          {type: 'constant', regex: /\b(true|false|yes|no|on|off|null|~)\b/i},
          {type: 'variable', regex: /[&*][\w]+/},
          {type: 'type', regex: /!!\w+/},
          {type: 'number', regex: /\b-?\d+\.?\d*(?:[eE][+-]?\d+)?\b/},
          {type: 'property', regex: /^[ \t]*[\w][\w ./-]*(?=\s*:)/m},
          {type: 'keyword', regex: /---/},
          {type: 'keyword', regex: /\.\.\./},
          {type: 'operator', regex: /[:|>\-?]/},
          // eslint-disable-next-line no-useless-escape
          {type: 'punctuation', regex: /[{}()\[\],]/},
        ],
      };

    case 'markdown':
    case 'md':
      return {
        patterns: [
          {type: 'keyword', regex: /^```[\w]*$/m},
          {type: 'keyword', regex: /^#{1,6}\s+.*/m},
          {type: 'keyword', regex: /^---$/m},
          {type: 'keyword', regex: /^\*\*\*$/m},
          {type: 'string', regex: /\*\*(?:[^*]|\*(?!\*))+\*\*/},
          {type: 'string', regex: /\*(?:[^*])+\*/},
          {type: 'constant', regex: /`[^`]+`/},
          {type: 'function', regex: /\[(?:[^\]])+\]\([^)]+\)/},
          {type: 'comment', regex: /^>\s+.*/m},
          {type: 'operator', regex: /^\s*[-*+]\s/m},
          {type: 'number', regex: /^\s*\d+\.\s/m},
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
      const slice = code.slice(pos);
      const match = pattern.anchored.exec(slice);

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
