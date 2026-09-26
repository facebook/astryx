// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-unguarded-ime-keydown.test.mjs
 * @description Tests for the Astryx no-unguarded-ime-keydown ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import rule from './no-unguarded-ime-keydown.js';

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {jsx: true},
    },
  },
});

// RuleTester registers its own describe/it blocks internally, so it must run
// at the top level (Vitest 4 forbids calling suite functions inside an it()).
tester.run('no-unguarded-ime-keydown', rule, {
  valid: [
    // ✅ The real BaseTypeahead pattern: a same-file `handleKeyDown` that
    //    early-returns on `isImeKeyEvent(e.nativeEvent)` before the Enter
    //    switch, referenced by the input's onKeyDown.
    {
      code: `
        function C() {
          const handleKeyDown = (e) => {
            if (isImeKeyEvent(e.nativeEvent)) {
              return;
            }
            switch (e.key) {
              case 'ArrowDown':
                setHighlightedIndex(0);
                break;
              case 'Enter':
                handleSelect();
                break;
              case 'Escape':
                popover.hide();
                break;
            }
          };
          return <input onKeyDown={handleKeyDown} />;
        }
      `,
    },

    // ✅ Inline handler with an early `if (e.isComposing) return;` guard.
    {
      code: `
        const C = () => (
          <TextInput
            onKeyDown={e => {
              if (e.isComposing) return;
              if (e.key === 'Enter') onSubmit();
            }}
          />
        );
      `,
    },

    // ✅ useCallback-wrapped handler guarded by the legacy keyCode 229 check.
    {
      code: `
        function C() {
          const handleKeyDown = useCallback(e => {
            if (e.keyCode === 229) return;
            if (e.key === 'Escape') close();
          }, []);
          return <textarea onKeyDown={handleKeyDown} />;
        }
      `,
    },

    // ✅ Editable surface but the handler only reads Tab — not a command key,
    //    so IME can't misfire it.
    {
      code: `
        const C = () => (
          <input
            onKeyDown={e => {
              if (e.key === 'Tab') advanceFocus();
            }}
          />
        );
      `,
    },

    // ✅ onKeyDown on a NON-editable button branching on Enter — IME can't run
    //    on a button, so not flagged.
    {
      code: `
        const C = () => (
          <button
            onKeyDown={e => {
              if (e.key === 'Enter') activate();
            }}
          />
        );
      `,
    },

    // ✅ role="button" div branching on Enter — non-editable, not flagged.
    {
      code: `
        const C = () => (
          <div
            role="button"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') toggle();
            }}
          />
        );
      `,
    },

    // ✅ The Selector TRIGGER shape: a <button role="combobox"> branching on
    //    command keys. role="combobox" would look editable, but a button can't
    //    host IME composition — must NOT flag.
    {
      code: `
        const C = () => (
          <button
            role="combobox"
            onKeyDown={e => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') openOrMove();
            }}
          />
        );
      `,
    },

    // ✅ <input type="checkbox"> branching on Enter — a checkbox can't host
    //    IME text composition, so not flagged (the SelectableCard shape).
    {
      code: `
        const C = () => (
          <input
            type="checkbox"
            onKeyDown={e => { if (e.key === 'Enter') toggle(); }}
          />
        );
      `,
    },

    // ✅ <input type="number"> branching on arrows — non-composable type.
    {
      code: `
        const C = () => (
          <input
            type="number"
            onKeyDown={e => { if (e.key === 'ArrowUp') step(); }}
          />
        );
      `,
    },

    // ✅ Handler not resolvable in this file (imported) — treated as unknown,
    //    not flagged.
    {
      code: `
        import {handleKeyDown} from './keys';
        const C = () => <input onKeyDown={handleKeyDown} />;
      `,
    },

    // ✅ Test fixtures are skipped.
    {
      code: `
        const C = () => (
          <input onKeyDown={e => { if (e.key === 'Enter') go(); }} />
        );
      `,
      filename: '/packages/core/src/Selector/Selector.test.tsx',
    },
  ],

  invalid: [
    // ❌ Inline handler on a TextInput branching on Enter, no guard.
    {
      code: `
        const C = () => (
          <TextInput onKeyDown={e => { if (e.key === 'Enter') onSelect(); }} />
        );
      `,
      errors: [{messageId: 'unguardedImeKeydown'}],
    },

    // ❌ Native <input> with an identifier handler that switches on e.key
    //    Enter/Escape with no composition guard.
    {
      code: `
        function C() {
          const handleKeyDown = (e) => {
            switch (e.key) {
              case 'Enter':
                submit();
                break;
              case 'Escape':
                cancel();
                break;
            }
          };
          return <input onKeyDown={handleKeyDown} />;
        }
      `,
      errors: [{messageId: 'unguardedImeKeydown'}],
    },

    // ❌ The real Selector shape: a TextInput (role="combobox") whose inline
    //    onKeyDown forwards Enter/Escape/arrows to onKeyDown with no guard.
    {
      code: `
        const C = () => (
          <TextInput
            role="combobox"
            onKeyDown={e => {
              if (
                e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'PageUp' ||
                e.key === 'PageDown' ||
                e.key === 'Enter' ||
                e.key === 'Escape'
              ) {
                onKeyDown(e);
                return;
              }
              if (e.key === 'Tab' && (e.shiftKey || !hasQuery)) {
                onKeyDown(e);
              }
            }}
          />
        );
      `,
      errors: [{messageId: 'unguardedImeKeydown'}],
    },

    // ❌ contentEditable div branching on Enter, no guard.
    {
      code: `
        const C = () => (
          <div
            contentEditable
            onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
          />
        );
      `,
      errors: [{messageId: 'unguardedImeKeydown'}],
    },

    // ❌ role="textbox" element reading legacy keyCode without a 229 guard.
    {
      code: `
        const C = () => (
          <div
            role="textbox"
            onKeyDown={e => { if (e.keyCode === 13) submit(); }}
          />
        );
      `,
      errors: [{messageId: 'unguardedImeKeydown'}],
    },

    // ❌ useCallback handler on a textarea, arrow-key branch, no guard.
    {
      code: `
        function C() {
          const handleKeyDown = useCallback(e => {
            if (e.key === 'ArrowDown') moveDown();
          }, []);
          return <textarea onKeyDown={handleKeyDown} />;
        }
      `,
      errors: [{messageId: 'unguardedImeKeydown'}],
    },
  ],
});
