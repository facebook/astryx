// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useCombobox.stories.tsx
 * @input Uses useCombobox from @astryxdesign/core/Selector, usePopover,
 *   Dialog, Layout, and Button
 * @output Comboboxes over text fields the story renders itself: a message
 *   field with a mention list in a layer, a search field whose results replace
 *   a page section, a contenteditable people field, and a field in a dialog
 * @position Storybook stories for useCombobox's field props;
 *   ComboboxField.a11y.chromium.spec.ts drives these stories in Chromium
 */

import type {Meta, StoryObj} from '@storybook/react';
import {useEffect, useId, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useCombobox} from '@astryxdesign/core/Selector';
import {usePopover} from '@astryxdesign/core/Popover';
import {isImeKeyEvent} from '@astryxdesign/core/utils';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const meta: Meta = {
  title: 'Core/Hooks/useCombobox',
  parameters: {
    docs: {
      description: {
        component:
          'useCombobox over a text field the product renders itself. The story owns the field, the rows and where the list renders; the hook owns the roles, the keys, the pointer model and the announced result count. Focus never leaves the field: arrows move the active option, Enter picks it, Escape hides the list.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

type Option = {value: string; label: string; disabled?: boolean};

const PEOPLE: Option[] = [
  {value: 'ada', label: 'Ada Lovelace'},
  {value: 'alan', label: 'Alan Turing'},
  {value: 'barbara', label: 'Barbara Liskov'},
  {value: 'edsger', label: 'Edsger Dijkstra'},
  {value: 'grace', label: 'Grace Hopper (away)', disabled: true},
  {value: 'katherine', label: 'Katherine Johnson'},
  {value: 'margaret', label: 'Margaret Hamilton'},
];

const SETTINGS: Option[] = [
  {value: 'notifications', label: 'Notifications'},
  {value: 'notification-sound', label: 'Notification sound'},
  {value: 'appearance', label: 'Appearance'},
  {value: 'language', label: 'Language and region'},
  {value: 'shortcuts', label: 'Keyboard shortcuts'},
  {value: 'password', label: 'Password'},
  {value: 'two-factor', label: 'Two-factor authentication'},
];

function matching(options: Option[], query: string): Option[] {
  const needle = query.trim().toLowerCase();
  return options.filter(option => option.label.toLowerCase().includes(needle));
}

function firstEnabled(options: Option[]): number {
  return options.findIndex(option => !option.disabled);
}

const styles = stylex.create({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    width: 360,
    fontFamily: 'inherit',
  },
  label: {
    fontWeight: 600,
  },
  field: {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: 36,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    font: 'inherit',
  },
  textarea: {
    minHeight: 72,
    resize: 'vertical',
  },
  listbox: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 224,
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-popover'],
  },
  layerListbox: {
    minWidth: 240,
    borderStyle: 'none',
  },
  option: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    userSelect: 'none',
  },
  active: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  disabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'default',
  },
  muted: {
    margin: 0,
    color: colorVars['--color-text-secondary'],
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  chip: {
    paddingBlock: spacingVars['--spacing-0-5'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-muted'],
  },
});

type Combobox = ReturnType<typeof useCombobox<Option>>;

/** The caller's rows: plain elements carrying the hook's option props. */
function Rows({combobox, options}: {combobox: Combobox; options: Option[]}) {
  return options.map((option, index) => (
    <div
      key={option.value}
      {...combobox.getOptionProps(index)}
      {...stylex.props(
        styles.option,
        index === combobox.highlightedIndex && styles.active,
        option.disabled && styles.disabled,
      )}>
      {option.label}
    </div>
  ));
}

// ---------------------------------------------------------------------------
// A message field: a textarea whose mention list renders in a layer.
// ---------------------------------------------------------------------------

function MessageFieldExample() {
  const fieldId = useId();
  const listboxId = useId();
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  // The caller finds the query in its own text: whatever follows an "@".
  const [mention, setMention] = useState<{start: number; query: string}>();
  const options = mention == null ? [] : matching(PEOPLE, mention.query);
  const isOpen = mention != null;

  const popover = usePopover({
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    role: 'none',
    onHide: () => setMention(undefined),
  });
  useEffect(() => {
    popover.triggerRef(fieldRef.current);
    return () => popover.triggerRef(null);
  }, [popover]);
  useEffect(() => {
    if (isOpen && !popover.isOpen) {
      popover.show();
    } else if (!isOpen && popover.isOpen) {
      popover.hide();
    }
  }, [isOpen, popover]);

  const combobox = useCombobox({
    selectableItems: options,
    isOpen,
    onOpen: () => false,
    onClose: () => setMention(undefined),
    onSelect: value => {
      const person = PEOPLE.find(candidate => candidate.value === value);
      if (mention == null || person == null) {
        return;
      }
      const end = mention.start + 1 + mention.query.length;
      const name = person.label.split(' ')[0];
      setText(`${text.slice(0, mention.start)}@${name} ${text.slice(end)}`);
      setMention(undefined);
    },
    listboxId,
    field: 'textarea',
    query: mention?.query,
  });

  return (
    <div {...stylex.props(styles.stack)}>
      <label htmlFor={fieldId} {...stylex.props(styles.label)}>
        Message
      </label>
      <textarea
        ref={fieldRef}
        id={fieldId}
        value={text}
        placeholder="Type @ to mention someone"
        onChange={event => {
          const next = event.currentTarget.value;
          const caret = event.currentTarget.selectionStart ?? next.length;
          setText(next);
          const match = /(^|\s)@(\w*)$/.exec(next.slice(0, caret));
          if (match == null) {
            setMention(undefined);
            return;
          }
          const query = match[2];
          setMention({start: caret - query.length - 1, query});
          // A new query makes its first match active, so Enter picks it.
          combobox.setHighlightedIndex(firstEnabled(matching(PEOPLE, query)));
        }}
        {...combobox.getFieldProps({
          // The field's own Enter sends; the hook stops it only for a pick.
          // An Enter that commits an input-method composition is not a send:
          // Safari reports it after compositionend with keyCode 229 and
          // `isComposing` false, which isImeKeyEvent also catches.
          onKeyDown: event => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !isImeKeyEvent(event.nativeEvent) &&
              text.trim() !== ''
            ) {
              event.preventDefault();
              setSent([...sent, text.trim()]);
              setText('');
            }
          },
        })}
        {...stylex.props(styles.field, styles.textarea)}
      />
      {popover.render(
        options.length > 0 ? (
          <div
            aria-label="People"
            {...combobox.getListboxProps()}
            {...stylex.props(styles.listbox, styles.layerListbox)}>
            <Rows combobox={combobox} options={options} />
          </div>
        ) : (
          <p {...stylex.props(styles.muted)}>No one matches</p>
        ),
      )}
      {sent.length > 0 ? (
        <p {...stylex.props(styles.muted)}>Sent: {sent.join(' · ')}</p>
      ) : null}
    </div>
  );
}

/**
 * A textarea with a mention list in a layer. Type "@" and a few letters: the
 * first match is active, so Enter picks it; with nothing active, Enter sends.
 * The arrows move between matches while the list shows and move the caret
 * once it is hidden.
 */
export const MessageField: Story = {
  render: () => <MessageFieldExample />,
};

// ---------------------------------------------------------------------------
// A search field: an input whose results replace a page section in flow.
// ---------------------------------------------------------------------------

function SearchFieldExample() {
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [picked, setPicked] = useState<string>();
  const options = query.trim() === '' ? [] : matching(SETTINGS, query);
  const isShown = isOpen && query.trim() !== '';

  const combobox = useCombobox({
    selectableItems: options,
    isOpen: isShown,
    onOpen: () => {
      if (query.trim() === '') {
        return false;
      }
      setIsOpen(true);
    },
    onClose: () => setIsOpen(false),
    onSelect: value => {
      setPicked(SETTINGS.find(setting => setting.value === value)?.label);
      setQuery('');
    },
    listboxId,
    field: 'input',
    query: query.trim(),
  });

  return (
    <div {...stylex.props(styles.stack)}>
      <input
        aria-label="Search settings"
        type="text"
        value={query}
        placeholder="Search settings"
        onChange={event => {
          setQuery(event.currentTarget.value);
          setIsOpen(true);
          // The results answer a new query, so nothing is active until an
          // arrow or the pointer picks a row; Enter stays the field's.
          combobox.setHighlightedIndex(-1);
        }}
        onBlur={() => setIsOpen(false)}
        {...combobox.getFieldProps()}
        {...stylex.props(styles.field)}
      />
      {isShown ? (
        options.length > 0 ? (
          <div
            aria-label="Settings"
            {...combobox.getListboxProps()}
            {...stylex.props(styles.listbox)}>
            <Rows combobox={combobox} options={options} />
          </div>
        ) : (
          <p {...stylex.props(styles.muted)}>No settings match</p>
        )
      ) : (
        <p {...stylex.props(styles.muted)}>
          {picked == null
            ? 'Recent: Notifications, Appearance'
            : `Opened ${picked}`}
        </p>
      )}
    </div>
  );
}

/**
 * A single-line search field whose results replace a page section, in the
 * page's flow rather than a layer. ArrowDown brings back hidden results; a
 * press on a result picks it while focus stays in the field.
 */
export const SearchField: Story = {
  render: () => <SearchFieldExample />,
};

// ---------------------------------------------------------------------------
// A contenteditable people field with matches listed under it.
// ---------------------------------------------------------------------------

function EditableFieldExample() {
  const listboxId = useId();
  const editableRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [people, setPeople] = useState<Option[]>([]);
  const available = PEOPLE.filter(person => !people.includes(person));
  const options = query.trim() === '' ? [] : matching(available, query);
  const isShown = isOpen && query.trim() !== '';

  const combobox = useCombobox({
    selectableItems: options,
    isOpen: isShown,
    onOpen: () => false,
    onClose: () => setIsOpen(false),
    onSelect: value => {
      const person = PEOPLE.find(candidate => candidate.value === value);
      if (person != null) {
        setPeople([...people, person]);
      }
      setQuery('');
      if (editableRef.current) {
        editableRef.current.textContent = '';
      }
    },
    listboxId,
    field: 'contenteditable',
    query: query.trim(),
  });

  return (
    <div {...stylex.props(styles.stack)}>
      <span id={`${listboxId}-label`} {...stylex.props(styles.label)}>
        Add people
      </span>
      {people.length > 0 ? (
        <ul aria-label="Added" {...stylex.props(styles.chips)}>
          {people.map(person => (
            <li key={person.value} {...stylex.props(styles.chip)}>
              {person.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        aria-labelledby={`${listboxId}-label`}
        onInput={event => {
          const next = event.currentTarget.textContent ?? '';
          setQuery(next);
          setIsOpen(true);
          combobox.setHighlightedIndex(
            firstEnabled(next.trim() === '' ? [] : matching(available, next)),
          );
        }}
        {...combobox.getFieldProps()}
        {...stylex.props(styles.field)}
      />
      {isShown && options.length > 0 ? (
        <div
          aria-label="Matching people"
          {...combobox.getListboxProps()}
          {...stylex.props(styles.listbox)}>
          <Rows combobox={combobox} options={options} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * A contenteditable field, the shape a rich composer takes. It is multi-line,
 * so a hidden list never takes its arrows.
 */
export const EditableField: Story = {
  render: () => <EditableFieldExample />,
};

// ---------------------------------------------------------------------------
// A field inside a dialog: Escape hides the list before it closes the dialog.
// ---------------------------------------------------------------------------

function InDialogExample() {
  const listboxId = useId();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [shared, setShared] = useState<string[]>([]);
  const options = query.trim() === '' ? [] : matching(PEOPLE, query);
  const isShown = isOpen && query.trim() !== '';

  const combobox = useCombobox({
    selectableItems: options,
    isOpen: isShown,
    onOpen: () => {
      if (query.trim() === '') {
        return false;
      }
      setIsOpen(true);
    },
    onClose: () => setIsOpen(false),
    onSelect: value => {
      const person = PEOPLE.find(candidate => candidate.value === value);
      if (person != null) {
        setShared([...shared, person.label]);
      }
      setQuery('');
    },
    listboxId,
    field: 'input',
    query: query.trim(),
  });

  return (
    <>
      <Button
        label="Share"
        variant="secondary"
        onClick={() => setIsDialogOpen(true)}
      />
      <Dialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Layout
          header={<DialogHeader title="Share" onOpenChange={setIsDialogOpen} />}
          content={
            <LayoutContent>
              <div {...stylex.props(styles.stack)}>
                <input
                  aria-label="Add people"
                  type="text"
                  value={query}
                  onChange={event => {
                    const next = event.currentTarget.value;
                    setQuery(next);
                    setIsOpen(true);
                    combobox.setHighlightedIndex(
                      firstEnabled(matching(PEOPLE, next)),
                    );
                  }}
                  {...combobox.getFieldProps()}
                  {...stylex.props(styles.field)}
                />
                {isShown ? (
                  options.length > 0 ? (
                    <div
                      aria-label="People"
                      {...combobox.getListboxProps()}
                      {...stylex.props(styles.listbox)}>
                      <Rows combobox={combobox} options={options} />
                    </div>
                  ) : (
                    <p {...stylex.props(styles.muted)}>No one matches</p>
                  )
                ) : null}
                <p {...stylex.props(styles.muted)}>
                  {shared.length > 0
                    ? `Shared with ${shared.join(', ')}`
                    : 'Not shared yet'}
                </p>
              </div>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}

/**
 * A field inside a dialog, its matches listed in the dialog's flow and an
 * empty message shown when nothing matches. With either shown, the first
 * Escape hides it and the dialog stays; the next Escape closes the dialog.
 */
export const InDialog: Story = {
  render: () => <InDialogExample />,
};
