// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file require-table-section.test.mjs
 * @description Tests for the require-table-section ESLint rule, plus the
 * #5277 regression it was written for (the `table-grouped` page template
 * emitted `<table><tr>` because its rows had no `<TableBody>` around them).
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import requireTableSectionRule from './require-table-section.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
    },
  },
});

// RuleTester registers its own describe/it blocks internally, so it
// must run at the top level. Vitest 4 forbids calling suite functions
// (describe/it) from inside another it() callback.
ruleTester.run('require-table-section', requireTableSectionRule, {
  valid: [
    // The house pattern: rows live in a section component.
    {code: '<Table><TableBody><TableRow/></TableBody></Table>'},
    {code: '<Table><TableHeader><TableRow/></TableHeader></Table>'},
    {code: '<Table><TableFooter><TableRow/></TableFooter></Table>'},
    // Raw section elements are the same DOM node and equally valid.
    {code: '<Table><tbody><TableRow/></tbody></Table>'},
    {code: '<table><tbody><tr/></tbody></table>'},
    {code: '<table><thead><tr/></thead></table>'},
    // colgroup/caption are legal direct children of a table — untouched.
    {code: '<Table><colgroup><col/></colgroup><TableBody><TableRow/></TableBody></Table>'},
    {code: '<table><caption>Cap</caption><tbody><tr/></tbody></table>'},
    // Mapped rows inside a section: the .map()/fragment chain is transparent.
    {
      code: '<Table><TableBody>{rows.map(r => <TableRow key={r.id}/>)}</TableBody></Table>',
    },
    {
      code: '<Table><TableBody>{keys.map(k => (<React.Fragment key={k}><TableRow/></React.Fragment>))}</TableBody></Table>',
    },
    // Data-driven mode: Table supplies its own tbody, no children at all.
    {code: '<Table data={data} columns={columns}/>'},
    // A row whose enclosing element is some other component: we cannot know
    // what that renders, so the rule stays silent rather than guessing.
    {code: '<Wrapper><TableRow/></Wrapper>'},
    // A row hoisted out of the JSX: its lexical parent is a declarator, so
    // the rule cannot see where it lands. Silent, not a false positive.
    {code: 'const row = <TableRow/>; const t = <Table><TableBody>{row}</TableBody></Table>;'},
    // A row returned from a named helper — same reasoning.
    {code: 'function renderRow() { return <TableRow/>; }'},
    // A standalone row with no table around it at all (unit-test fixtures).
    {code: '<TableRow><TableCell>x</TableCell></TableRow>'},
  ],
  invalid: [
    // The straightforward case.
    {
      code: '<Table><TableRow/></Table>',
      errors: [{messageId: 'rowOutsideSection'}],
    },
    // The #5277 shape: a colgroup, then rows mapped straight into the table.
    {
      code: '<Table columns={columns}><colgroup><col/></colgroup>{rows.map(r => <TableRow key={r.id}/>)}</Table>',
      errors: [{messageId: 'rowOutsideSection'}],
    },
    // The #5277 shape in full: fragment + conditional + nested map, two rows.
    {
      code: `
        <Table columns={columns}>
          <colgroup><col/></colgroup>
          {groupKeys.map(key => {
            return (
              <React.Fragment key={key}>
                {groupBy !== 'none' && <TableRow role="button"/>}
                {isExpanded && tasks.map(task => (<TableRow key={task.id}/>))}
              </React.Fragment>
            );
          })}
        </Table>
      `,
      errors: [
        {messageId: 'rowOutsideSection'},
        {messageId: 'rowOutsideSection'},
      ],
    },
    // Raw <tr> under the Astryx <Table> is the same invalid DOM.
    {
      code: '<Table><tr><td>x</td></tr></Table>',
      errors: [{messageId: 'rowOutsideSection'}],
    },
    // ...and under a raw <table> too.
    {
      code: '<table><tr><td>x</td></tr></table>',
      errors: [{messageId: 'rowOutsideSection'}],
    },
    // A ternary branch is transparent: both arms are still direct children.
    {
      code: '<Table>{isEmpty ? <TableRow/> : <TableRow/>}</Table>',
      errors: [
        {messageId: 'rowOutsideSection'},
        {messageId: 'rowOutsideSection'},
      ],
    },
  ],
});
