// Copyright (c) Meta Platforms, Inc. and affiliates.

// @vitest-environment jsdom

/**
 * @file InteractivePreview tests.
 * @input InteractivePreviewStage and a radio-item playground preview
 * @output Regression coverage for wrapper-owned selection state.
 */

import {
  createContext,
  createElement,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {describe, expect, it, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {InteractivePreviewStage} from '../components/component-detail/InteractivePreview';

vi.mock('@stylexjs/stylex', () => ({
  create: (styles: unknown) => styles,
  props: () => ({}),
}));
vi.mock('@astryxdesign/core/theme/syntax', () => ({allSyntaxPresets: []}));
vi.mock('../components/component-detail/ComponentPreviewTheme', () => ({
  ComponentPreviewTheme: ({children}: {children: ReactNode}) =>
    createElement('div', null, children),
}));
vi.mock('../components/CodeExampleBlock', () => ({
  CodeExampleBlock: () => null,
}));

function Box({children}: {children?: ReactNode}) {
  return createElement('div', null, children);
}

function MockButton({label, onClick}: {label: string; onClick?: () => void}) {
  return createElement('button', {onClick}, label);
}

function MockDropdownMenu({
  button,
  children,
}: {
  button: {label: string};
  children?: ReactNode;
}) {
  return createElement(
    'div',
    null,
    createElement('button', null, button.label),
    children,
  );
}

const RadioContext = createContext<{
  value?: string;
  onChange: (value: string) => void;
}>({onChange: () => {}});

function MockRadioGroup({
  value,
  onChange,
  label,
  children,
}: {
  value?: string;
  onChange: (value: string) => void;
  label: string;
  children?: ReactNode;
}) {
  return createElement(
    RadioContext.Provider,
    {value: {value, onChange}},
    createElement('div', {'aria-label': label, role: 'group'}, children),
  );
}

function MockRadioItem({value, label}: {value: string; label: string}) {
  const group = useContext(RadioContext);
  return createElement(
    'div',
    {
      'aria-checked': String(group.value === value),
      onClick: () => group.onChange(value),
      role: 'menuitemradio',
    },
    label,
  );
}

vi.mock('@astryxdesign/core', () => ({
  Button: MockButton,
  Card: Box,
  Center: Box,
  DropdownMenu: MockDropdownMenu,
  DropdownMenuRadioGroup: MockRadioGroup,
  DropdownMenuRadioItem: MockRadioItem,
  Text: Box,
  VStack: Box,
}));

describe('InteractivePreviewStage', () => {
  it('keeps a radio item unchecked after its value changes until activation', async () => {
    const user = userEvent.setup();

    function PreviewHarness() {
      const [value, setValue] = useState('option-1');
      return createElement(
        'div',
        null,
        createElement(
          'button',
          {onClick: () => setValue('option-2')},
          'Change value',
        ),
        createElement(InteractivePreviewStage, {
          name: 'DropdownMenuRadioItem',
          state: {value, label: 'Option 2'},
          knobs: [],
          playground: {
            wrapper: {
              component: 'DropdownMenuRadioGroup',
              props: {value: 'option-1', label: 'Radio group'},
            },
          },
          onPropChange: (_propName: string, nextValue: unknown) =>
            setValue(nextValue as string),
        }),
      );
    }

    render(createElement(PreviewHarness));
    const item = screen.getByRole('menuitemradio', {name: 'Option 2'});
    expect(item).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('button', {name: 'Change value'}));
    expect(item).toHaveAttribute('aria-checked', 'false');

    await user.click(item);
    expect(item).toHaveAttribute('aria-checked', 'true');
  });
});
