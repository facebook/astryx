import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSChatComposerInput} from './XDSChatComposerInput';
import type {
  XDSChatComposerTrigger,
  XDSChatComposerInputHandle,
} from './XDSChatComposerInput';
import {createStaticSource} from '../Typeahead/createStaticSource';
import type {XDSSearchableItem} from '../Typeahead/types';

// =============================================================================
// Helpers
// =============================================================================

const USERS: XDSSearchableItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
];

const COMMANDS: XDSSearchableItem[] = [
  {id: 'summarize', label: 'summarize'},
  {id: 'translate', label: 'translate'},
  {id: 'search', label: 'search'},
];

function createMentionTrigger(
  overrides?: Partial<XDSChatComposerTrigger>,
): XDSChatComposerTrigger {
  return {
    character: '@',
    searchSource: createStaticSource(USERS),
    onSelect: item => ({
      value: `@${item.id}`,
      label: `@${item.label}`,
      variant: 'blue' as const,
    }),
    ...overrides,
  };
}

function createCommandTrigger(
  overrides?: Partial<XDSChatComposerTrigger>,
): XDSChatComposerTrigger {
  return {
    character: '/',
    searchSource: createStaticSource(COMMANDS),
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
    it('calls onFiles on paste with files', () => {
      const onFiles = vi.fn();
      render(<XDSChatComposerInput onFiles={onFiles} />);
      const textbox = screen.getByRole('textbox');

      const file = new File(['content'], 'test.txt', {type: 'text/plain'});
      fireEvent.paste(textbox, {
        clipboardData: {
          files: [file],
          getData: () => '',
        },
      });
      expect(onFiles).toHaveBeenCalledWith([file]);
    });
  });

  describe('triggers', () => {
    it('accepts triggers with searchSource', () => {
      const triggers = [createMentionTrigger()];
      const {container} = render(<XDSChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts multiple triggers', () => {
      const triggers = [createMentionTrigger(), createCommandTrigger()];
      const {container} = render(<XDSChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts async searchSource trigger', () => {
      const asyncTrigger: XDSChatComposerTrigger = {
        character: '@',
        searchSource: {
          async search(query: string) {
            return USERS.filter(u =>
              u.label.toLowerCase().includes(query.toLowerCase()),
            );
          },
          async bootstrap() {
            return USERS;
          },
          cancel() {},
        },
        onSelect: item => ({
          value: `@${item.id}`,
          label: `@${item.label}`,
          variant: 'blue' as const,
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

    it('supports configurable empty/loading text', () => {
      const trigger = createMentionTrigger({
        emptySearchResultsText: 'Nobody found',
        loadingText: 'Looking up...',
        menuLabel: 'People',
      });
      const {container} = render(<XDSChatComposerInput triggers={[trigger]} />);
      expect(container).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has aria-haspopup on the textbox', () => {
      const triggers = [createMentionTrigger()];
      render(<XDSChatComposerInput triggers={triggers} />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('has aria-expanded=false when menu is closed', () => {
      const triggers = [createMentionTrigger()];
      render(<XDSChatComposerInput triggers={triggers} />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('ref (imperative handle)', () => {
    it('exposes imperative handle via ref', () => {
      const ref = vi.fn();
      render(<XDSChatComposerInput ref={ref} />);
      expect(ref).toHaveBeenCalledWith(
        expect.objectContaining({
          insertToken: expect.any(Function),
          insertText: expect.any(Function),
          focus: expect.any(Function),
          getValue: expect.any(Function),
        }),
      );
    });

    it('getValue returns empty string for empty input', () => {
      let handle: XDSChatComposerInputHandle | null = null;
      render(
        <XDSChatComposerInput
          ref={h => {
            handle = h;
          }}
        />,
      );
      expect(handle!.getValue()).toBe('');
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
