import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSChatComposerInput} from './XDSChatComposerInput';
import type {
  XDSChatComposerTrigger,
  XDSChatComposerTriggerItem,
} from './XDSChatComposerInput';

// =============================================================================
// Helpers
// =============================================================================

const USERS: XDSChatComposerTriggerItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
];

const COMMANDS: XDSChatComposerTriggerItem[] = [
  {id: 'summarize', label: 'summarize'},
  {id: 'translate', label: 'translate'},
  {id: 'search', label: 'search'},
];

function createMentionTrigger(
  overrides?: Partial<XDSChatComposerTrigger>,
): XDSChatComposerTrigger {
  return {
    character: '@',
    items: USERS,
    onSelect: item => ({
      value: `@${item.id}`,
      render: () => <span>@{item.label}</span>,
    }),
    ...overrides,
  };
}

function createCommandTrigger(
  overrides?: Partial<XDSChatComposerTrigger>,
): XDSChatComposerTrigger {
  return {
    character: '/',
    items: COMMANDS,
    onSelect: item => `/${item.label} `,
    ...overrides,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('XDSChatComposerInput', () => {
  describe('basic rendering', () => {
    it('renders with placeholder', () => {
      render(<XDSChatComposerInput placeholder="Type here..." />);
      expect(screen.getByText('Type here...')).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<XDSChatComposerInput />);
      expect(screen.getByText(/Type a message/)).toBeInTheDocument();
    });

    it('renders a textbox role', () => {
      render(<XDSChatComposerInput label="Test input" />);
      expect(
        screen.getByRole('textbox', {name: 'Test input'}),
      ).toBeInTheDocument();
    });

    it('renders disabled state', () => {
      render(<XDSChatComposerInput isDisabled />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('contenteditable', 'false');
    });
  });

  describe('change and submit', () => {
    it('calls onChange on input', () => {
      const onChange = vi.fn();
      render(<XDSChatComposerInput onChange={onChange} />);
      const textbox = screen.getByRole('textbox');
      // Simulate typing by setting text content and firing input event
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      expect(onChange).toHaveBeenCalledWith('hello');
    });

    it('calls onSubmit on Enter', () => {
      const onSubmit = vi.fn();
      render(<XDSChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello world';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onSubmit).toHaveBeenCalledWith('hello world');
    });

    it('does not submit on Shift+Enter', () => {
      const onSubmit = vi.fn();
      render(<XDSChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter', shiftKey: true});
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('clears input after submit', () => {
      const onChange = vi.fn();
      render(<XDSChatComposerInput onSubmit={() => {}} onChange={onChange} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter'});
      // onChange called with empty string after clear
      expect(onChange).toHaveBeenLastCalledWith('');
    });

    it('does not submit empty input', () => {
      const onSubmit = vi.fn();
      render(<XDSChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('file handling', () => {
    it('calls onFiles on drop', () => {
      const onFiles = vi.fn();
      render(<XDSChatComposerInput onFiles={onFiles} />);
      const textbox = screen.getByRole('textbox');

      const file = new File(['content'], 'test.txt', {type: 'text/plain'});
      fireEvent.drop(textbox, {
        dataTransfer: {files: [file]},
      });
      expect(onFiles).toHaveBeenCalledWith([file]);
    });
  });

  describe('triggers', () => {
    it('accepts triggers prop without error', () => {
      const triggers = [createMentionTrigger()];
      const {container} = render(<XDSChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts multiple triggers', () => {
      const triggers = [createMentionTrigger(), createCommandTrigger()];
      const {container} = render(<XDSChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts async queryItemsAction trigger', () => {
      const asyncTrigger: XDSChatComposerTrigger = {
        character: '@',
        queryItemsAction: async (query: string) => {
          return USERS.filter(u =>
            u.label.toLowerCase().includes(query.toLowerCase()),
          );
        },
        onSelect: item => ({
          value: `@${item.id}`,
          render: () => <span>@{item.label}</span>,
        }),
      };
      const {container} = render(
        <XDSChatComposerInput triggers={[asyncTrigger]} />,
      );
      expect(container).toBeTruthy();
    });

    it('renders with custom renderItem', () => {
      const trigger = createMentionTrigger({
        renderItem: item => <div data-testid="custom-item">{item.label}</div>,
      });
      const {container} = render(<XDSChatComposerInput triggers={[trigger]} />);
      expect(container).toBeTruthy();
    });
  });

  describe('xds class names', () => {
    it('has xds-chat-composer-input class', () => {
      const {container} = render(<XDSChatComposerInput />);
      expect(
        container.querySelector('.xds-chat-composer-input'),
      ).toBeInTheDocument();
    });
  });
});
