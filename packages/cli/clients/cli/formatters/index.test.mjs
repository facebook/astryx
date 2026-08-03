// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, afterEach} from 'vitest';
import {
  emit,
  title,
  section,
  text,
  list,
  record,
  records,
  table,
  code,
  markdown,
  Block,
  BULLET,
  ARROW,
} from './index.mjs';
import {setJsonMode} from '../../../foundation/response/json.mjs';

afterEach(() => {
  setJsonMode(false);
  vi.restoreAllMocks();
});

describe('constants', () => {
  it('are plain ASCII', () => {
    expect(BULLET).toBe('-');
    expect(ARROW).toBe('->');
    expect(/[^\x20-\x7E]/.test(`${BULLET}${ARROW}`)).toBe(false);
  });
});

describe('renderers return Block', () => {
  it('produces nominal Block instances', () => {
    expect(title('x')).toBeInstanceOf(Block);
    expect(record({a: 1})).toBeInstanceOf(Block);
    expect(records([{a: 1}])).toBeInstanceOf(Block);
    expect(code('a')).toBeInstanceOf(Block);
  });
});

describe('section', () => {
  it('renders a heading alone, or heading + subtitle directly beneath', () => {
    expect(section('PAGE TEMPLATES').toString()).toBe('PAGE TEMPLATES');
    expect(section('PAGE TEMPLATES', 'Closest full-page templates.').toString()).toBe(
      'PAGE TEMPLATES\nClosest full-page templates.',
    );
  });
});

describe('list', () => {
  it('renders single-line items tightly with bullets', () => {
    expect(list(['alpha', 'beta']).toString()).toBe('- alpha\n- beta');
  });

  it('hang-indents multi-line items and separates them with a blank line', () => {
    expect(list([['head', 'detail'], 'solo']).toString()).toBe(
      '- head\n  detail\n\n- solo',
    );
  });
});

describe('record', () => {
  it('renders a JSON object as aligned key: value lines', () => {
    const lines = record({
      name: 'Button',
      domain: 'component',
      description: 'A button.',
    })
      .toString()
      .split('\n');
    expect(lines[0]).toMatch(/^name:\s+Button$/);
    expect(lines[1]).toMatch(/^domain:\s+component$/);
    expect(lines[2]).toMatch(/^description: A button\.$/);
    // Values align to one column (keyWidth 'description' = 11, +2 = 13).
    expect(lines[0].indexOf('Button')).toBe(13);
    expect(lines[2].indexOf('A button.')).toBe(13);
  });

  it('picks + orders fields and skips missing/empty ones', () => {
    const out = record(
      {name: 'X', domain: 'component', description: ''},
      {fields: ['domain', 'name', 'displayName', 'description']},
    ).toString();
    expect(out).toBe('domain: component\nname:   X');
  });

  it('applies labels and format transforms', () => {
    const out = record(
      {command: 'astryx x'},
      {labels: {command: 'run'}, format: {command: v => `pnpm exec ${v}`}},
    ).toString();
    expect(out).toBe('run: pnpm exec astryx x');
  });

  it('joins array values with commas', () => {
    expect(record({frame: ['AppShell', 'TopNav']}).toString()).toBe(
      'frame: AppShell, TopNav',
    );
  });
});

describe('records', () => {
  it('renders one record per object separated by a blank line', () => {
    expect(records([{name: 'A'}, {name: 'B'}]).toString()).toBe('name: A\n\nname: B');
  });
});

describe('table', () => {
  it('aligns columns to their widest cell and does not pad the last column', () => {
    const out = table(
      [
        ['Button', '100'],
        ['IconButton', '90'],
      ],
      {head: ['Name', 'Score']},
    ).toString();
    expect(out).toBe(
      ['Name        Score', '----------  -----', 'Button      100', 'IconButton  90'].join(
        '\n',
      ),
    );
  });
});

describe('code / markdown', () => {
  it('are byte-for-byte verbatim', () => {
    const src = 'const x = 1;\n  const y = 2;\n';
    expect(code(src).toString()).toBe(src);
    expect(markdown('# Title\n\n- a\n').toString()).toBe('# Title\n\n- a\n');
  });
});

describe('emit', () => {
  it('joins blocks with a single blank line via one console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    emit(title('A'), text('B'));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('A\n\nB');
  });

  it('drops falsy placeholders', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    emit(title('A'), false, null, undefined, text('B'));
    expect(spy).toHaveBeenCalledWith('A\n\nB');
  });

  it('is a no-op in --json mode (stdout stays clean)', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    setJsonMode(true);
    emit(title('A'), text('B'));
    expect(spy).not.toHaveBeenCalled();
  });
});
