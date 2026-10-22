// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file busyAnnouncements.test.tsx
 * @input Real busy controls, deferred actions/sources, and the shared-channel spy
 * @output Silent-indicator and shared-hook routing/cancellation regressions
 * @position Cross-component AST-086 FR3/FR6/FR8 DOM contracts (issue #7856);
 *   these assertions do not claim real screen-reader speech evidence
 */

import {StrictMode, type ReactElement} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {TextInput} from '../TextInput';
import {TextArea} from '../TextArea';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';
import {ComplexSelector} from '../ComplexSelector';
import {DateInput} from '../DateInput';
import {DateRangeInput} from '../DateRangeInput';
import {DateTimeInput} from '../DateTimeInput';
import {TimeInput} from '../TimeInput';
import {FileInput} from '../FileInput';
import {CheckboxInput} from '../CheckboxInput';
import {Switch} from '../Switch';
import {Thumbnail} from '../Thumbnail';
import {DropdownMenuSubMenu} from '../DropdownMenu';
import {
  BaseTypeahead,
  Typeahead,
  type SearchableItem,
  type SearchSource,
} from '../Typeahead';
import {Tokenizer} from '../Tokenizer';
import {CommandPalette, CommandPaletteInput} from '../CommandPalette';
import {ChatMessageList} from '../Chat/ChatMessageList';
import {Dialog} from '../Dialog';
import {InternationalizationProvider} from '../i18n';
import {InputGroup} from '../InputGroup';

const announce = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useAnnounce', () => ({useAnnounce: () => announce}));

beforeEach(() => {
  announce.mockClear();
  // jsdom has no native modality. Treat these open dialog fixtures as modal,
  // matching the standalone shared-hook contract tests.
  const matches = Element.prototype.matches;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
    this: Element,
    selector: string,
  ) {
    return selector === ':modal'
      ? this instanceof HTMLDialogElement && this.open
      : matches.call(this, selector);
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const noop = () => {};
const cases = [
  [
    'TextInput',
    (isLoading: boolean) => (
      <TextInput label="Email" value="" isLoading={isLoading} />
    ),
  ],
  [
    'TextArea',
    (isLoading: boolean) => (
      <TextArea label="Notes" value="" isLoading={isLoading} />
    ),
  ],
  [
    'Selector',
    (isLoading: boolean) => (
      <Selector label="Choice" options={['One']} isLoading={isLoading} />
    ),
  ],
  [
    'MultiSelector',
    (isLoading: boolean) => (
      <MultiSelector
        label="Choices"
        options={['One']}
        value={[]}
        onChange={noop}
        isLoading={isLoading}
      />
    ),
  ],
  [
    'ComplexSelector',
    (isLoading: boolean) => (
      <ComplexSelector label="Choice" value="" isLoading={isLoading}>
        {() => null}
      </ComplexSelector>
    ),
  ],
  ...(['popover', 'native', 'bottom-sheet'] as const).map(
    presentation =>
      [
        `DateInput ${presentation}`,
        (isLoading: boolean) => (
          <DateInput
            label="Date"
            presentation={presentation}
            isLoading={isLoading}
          />
        ),
      ] as const,
  ),
  [
    'DateRangeInput',
    (isLoading: boolean) => (
      <DateRangeInput
        label="Dates"
        value={null}
        onChange={noop}
        isLoading={isLoading}
      />
    ),
  ],
  ...(['popover', 'native', 'bottom-sheet'] as const).map(
    presentation =>
      [
        `DateTimeInput ${presentation}`,
        (isLoading: boolean) => (
          <DateTimeInput
            label="Date and time"
            presentation={presentation}
            onChange={noop}
            isLoading={isLoading}
          />
        ),
      ] as const,
  ),
  ...(['text-input', 'native', 'bottom-sheet'] as const).map(
    presentation =>
      [
        `TimeInput ${presentation}`,
        (isLoading: boolean) => (
          <TimeInput
            label="Time"
            presentation={presentation}
            isLoading={isLoading}
          />
        ),
      ] as const,
  ),
  ...(['input', 'dropzone'] as const).map(
    mode =>
      [
        `FileInput ${mode}`,
        (isLoading: boolean) => (
          <FileInput
            label="File"
            value={null}
            onChange={noop}
            mode={mode}
            isLoading={isLoading}
          />
        ),
      ] as const,
  ),
  [
    'CheckboxInput',
    (isLoading: boolean) => (
      <CheckboxInput label="Accept" value={false} isLoading={isLoading} />
    ),
  ],
  [
    'Switch',
    (isLoading: boolean) => (
      <Switch label="Enable" value={false} isLoading={isLoading} />
    ),
  ],
  [
    'Thumbnail',
    (isLoading: boolean) => (
      <Thumbnail src="/preview.png" alt="Preview" isLoading={isLoading} />
    ),
  ],
  [
    'DropdownMenuSubMenu',
    (isLoading: boolean) => (
      <DropdownMenuSubMenu label="More" hasSpinner={isLoading}>
        {null}
      </DropdownMenuSubMenu>
    ),
  ],
] satisfies ReadonlyArray<
  readonly [string, (isLoading: boolean) => ReactElement]
>;

function expectSilentSpinner(container: ParentNode) {
  const spinners = container.querySelectorAll('.astryx-spinner');
  expect(spinners).toHaveLength(1);
  for (const spinner of spinners) {
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(spinner).not.toHaveAttribute('role');
    expect(spinner).not.toHaveAttribute('aria-live');
    expect(spinner.querySelector('[role="status"], [aria-live]')).toBeNull();
  }
}

function loadingCalls() {
  return announce.mock.calls.filter(([message]) => message === 'Loading');
}

/** Preserve the shared hook's deferred route selection and empty-first write. */
async function nextFrame() {
  await act(async () => {
    await new Promise(resolve => requestAnimationFrame(resolve));
  });
}

function pendingSource() {
  const resolvers: ((items: SearchableItem[]) => void)[] = [];
  const request = async () =>
    new Promise<SearchableItem[]>(resolve => resolvers.push(resolve));
  const source: SearchSource = {bootstrap: request, search: request};
  return {
    source,
    async settle() {
      await act(async () => {
        resolvers
          .splice(0)
          .forEach(resolve => resolve([{id: 'one', label: 'One'}]));
      });
    },
  };
}

describe('busy announcement ownership', () => {
  it.each(cases)(
    '%s keeps its Spinner silent and announces each busy start once',
    async (_name, control) => {
      const field = (busy: boolean) => <StrictMode>{control(busy)}</StrictMode>;
      const {container, rerender} = render(field(true));
      expectSilentSpinner(container);
      await nextFrame();
      expect(loadingCalls()).toEqual([['Loading', 'polite']]);
      rerender(field(true));
      await nextFrame();
      expect(loadingCalls()).toHaveLength(1);
      rerender(field(false));
      await nextFrame();
      expect(loadingCalls()).toHaveLength(1);
      rerender(field(true));
      await nextFrame();
      expect(loadingCalls()).toHaveLength(2);
    },
  );

  it.each(cases)(
    '%s uses an initially empty persistent region inside a native dialog',
    async (_name, control) => {
      const field = (busy: boolean) => (
        <StrictMode>
          <dialog open>{control(busy)}</dialog>
        </StrictMode>
      );
      const {container, rerender} = render(field(true));
      expectSilentSpinner(container);
      await nextFrame();
      // Date/time pickers also retain empty Button status regions. Select
      // the shared busy owner's region, not the first status in the subtree.
      const region = container.querySelector('[data-astryx-modal-busy-region]');
      expect(region).toBeInTheDocument();
      expect(region).toBeEmptyDOMElement();
      expect(loadingCalls()).toHaveLength(0);
      await waitFor(() => expect(region).toHaveTextContent('Loading'));
      const write = vi.spyOn(region!, 'textContent', 'set');
      rerender(field(true));
      await nextFrame();
      expect(write).not.toHaveBeenCalled();
      rerender(field(false));
      expect(region).toBeEmptyDOMElement();
      rerender(field(true));
      expect(container.querySelector('[data-astryx-modal-busy-region]')).toBe(
        region,
      );
      await waitFor(() => expect(region).toHaveTextContent('Loading'));
      expect(
        write.mock.calls.filter(([text]) => text === 'Loading'),
      ).toHaveLength(1);
      expect(loadingCalls()).toHaveLength(0);
    },
  );

  it('keeps TextInput busy and named inside InputGroup', async () => {
    render(
      <InputGroup label="Address">
        <TextInput label="Email" value="" isLoading />
      </InputGroup>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('textbox')).toHaveAccessibleName(/Email/);
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
  });

  it('announces a pending changeAction, not every optimistic rerender', async () => {
    let complete!: () => void;
    const changeAction = async () =>
      new Promise<void>(resolve => {
        complete = resolve;
      });
    const field = (
      <TextInput label="Email" value="" changeAction={changeAction} />
    );
    const {container, rerender} = render(field);
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'a'}});
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-busy', 'true');
    expectSilentSpinner(container);
    rerender(field);
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
    await act(async () => complete());
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-busy');
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'b'}});
    await nextFrame();
    expect(loadingCalls()).toHaveLength(2);
    await act(async () => complete());
  });

  it('does not repeat a busy occasion when its translation changes', async () => {
    const field = (message: string, busy: boolean) => (
      <InternationalizationProvider
        locale="fr"
        messages={{fr: {'@astryx.spinner.loading': message}}}>
        <TextInput label="Email" value="" isLoading={busy} />
      </InternationalizationProvider>
    );
    const {rerender} = render(field('Chargement', true));
    await nextFrame();
    rerender(field('Patientez', true));
    await nextFrame();
    expect(announce.mock.calls).toEqual([['Chargement', 'polite']]);
    rerender(field('Patientez', false));
    rerender(field('Patientez', true));
    await nextFrame();
    expect(announce.mock.calls).toEqual([
      ['Chargement', 'polite'],
      ['Patientez', 'polite'],
    ]);
  });

  it('keeps Thumbnail ownership across image and tooltip presentation changes', async () => {
    const {container, rerender} = render(<Thumbnail alt="Preview" isLoading />);
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
    rerender(<Thumbnail src="/preview.png" alt="Preview" isLoading />);
    expectSilentSpinner(container);
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
    rerender(
      <Thumbnail src="/preview.png" alt="Preview" label="Preview" isLoading />,
    );
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
  });

  it.each(['ComplexSelector', 'MultiSelector'] as const)(
    '%s keeps ownership when switching between default and caller triggers',
    async name => {
      const field = (custom: boolean) => {
        const renderTrigger = custom
          ? () => <button type="button">Choose</button>
          : undefined;
        return name === 'MultiSelector' ? (
          <MultiSelector
            label="Choices"
            options={[]}
            value={[]}
            onChange={noop}
            isLoading
            renderTrigger={renderTrigger}
          />
        ) : (
          <ComplexSelector
            label="Choice"
            value=""
            isLoading
            renderTrigger={renderTrigger}>
            {() => null}
          </ComplexSelector>
        );
      };
      const {rerender} = render(field(false));
      await nextFrame();
      rerender(field(true));
      await nextFrame();
      rerender(field(false));
      await nextFrame();
      expect(loadingCalls()).toHaveLength(1);
    },
  );

  it('keeps busy announcements with caller-rendered selector owners', async () => {
    const customTrigger = () => <button type="button">Choose</button>;
    const {rerender} = render(
      <ComplexSelector
        label="Choice"
        value=""
        isLoading
        renderTrigger={customTrigger}>
        {() => null}
      </ComplexSelector>,
    );
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
    rerender(
      <ComplexSelector
        label="Choice"
        value=""
        isLoading
        renderTrigger={() => <button type="button">Other</button>}>
        {() => null}
      </ComplexSelector>,
    );
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
    cleanup();
    announce.mockClear();
    render(
      <MultiSelector
        label="Choices"
        options={[]}
        value={[]}
        onChange={noop}
        isLoading
        renderTrigger={customTrigger}
      />,
    );
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
  });
});

describe('async source ownership', () => {
  it.each(['BaseTypeahead', 'Typeahead', 'Tokenizer'] as const)(
    '%s announces through BaseTypeahead, never through its indicator lane',
    async name => {
      const {source, settle} = pendingSource();
      const shared = {searchSource: source, onChange: noop, debounceMs: 0};
      const field =
        name === 'Tokenizer' ? (
          <Tokenizer {...shared} label="Search" value={[]} />
        ) : name === 'Typeahead' ? (
          <Typeahead {...shared} label="Search" value={null} />
        ) : (
          <BaseTypeahead {...shared} aria-label="Search" value={null} />
        );
      const {container, rerender} = render(<StrictMode>{field}</StrictMode>);
      const input = screen.getByRole('combobox');
      fireEvent.change(input, {target: {value: 'o'}});
      expectSilentSpinner(container);
      expect(input).toHaveAttribute('aria-busy', 'true');
      await nextFrame();
      expect(loadingCalls()).toHaveLength(1);
      rerender(<StrictMode>{field}</StrictMode>);
      fireEvent.change(input, {target: {value: 'on'}});
      await nextFrame();
      expect(loadingCalls()).toHaveLength(1);
      await settle();
      fireEvent.change(input, {target: {value: 'one'}});
      await nextFrame();
      expect(loadingCalls()).toHaveLength(2);
      await settle();
    },
  );

  it('announces palette bootstrap, query and cleared-query loads inside the dialog', async () => {
    const {source, settle} = pendingSource();
    const palette = (isOpen: boolean) => (
      <StrictMode>
        <CommandPalette
          isOpen={isOpen}
          onOpenChange={noop}
          searchSource={source}
        />
      </StrictMode>
    );
    const {container, rerender} = render(palette(true));
    await act(async () => {});
    await nextFrame();
    const region = container.querySelector('dialog [role="status"]');
    expect(region).toBeEmptyDOMElement();
    expectSilentSpinner(container);
    await waitFor(() => expect(region).toHaveTextContent('Loading'));
    await settle();
    expect(region).toBeEmptyDOMElement();
    const input = screen.getByRole('combobox');
    const write = vi.spyOn(region!, 'textContent', 'set');
    fireEvent.change(input, {target: {value: 'o'}});
    await waitFor(() => expect(region).toHaveTextContent('Loading'));
    fireEvent.change(input, {target: {value: 'on'}});
    await nextFrame();
    expect(
      write.mock.calls.filter(([text]) => text === 'Loading'),
    ).toHaveLength(1);
    await settle();
    fireEvent.change(input, {target: {value: ''}});
    await waitFor(() => expect(region).toHaveTextContent('Loading'));
    expect(
      write.mock.calls.filter(([text]) => text === 'Loading'),
    ).toHaveLength(2);
    rerender(palette(false));
    expect(region).toBeEmptyDOMElement();
    await settle();
    rerender(palette(true));
    await waitFor(() => expect(region).toHaveTextContent('Loading'));
    expect(loadingCalls()).toHaveLength(0);
    await settle();
  });

  it('keeps palette delivery when the input slot is replaced, and inline delivery uses the channel', async () => {
    const {source, settle} = pendingSource();
    const palette = (input: ReactElement) => (
      <CommandPalette
        isOpen
        isInline
        onOpenChange={noop}
        searchSource={source}
        input={input}
      />
    );
    const {rerender} = render(palette(<CommandPaletteInput />));
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
    rerender(palette(<div>Custom search</div>));
    await nextFrame();
    expect(loadingCalls()).toHaveLength(1);
    await settle();
  });

  it('announces history loading once outside the transcript log', async () => {
    let notify!: (entries: IntersectionObserverEntry[]) => void;
    let sentinel!: Element;
    const action = pendingSource();
    class Observer implements IntersectionObserver {
      root = null;
      rootMargin = '0px';
      scrollMargin = '0px';
      thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        notify = entries => callback(entries, this);
      }
      observe(element: Element) {
        sentinel = element;
      }
      unobserve() {}
      takeRecords() {
        return [];
      }
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', Observer);
    try {
      const {container} = render(
        <ChatMessageList
          scrollToTopAction={async () => {
            await action.source.bootstrap();
          }}>
          Message
        </ChatMessageList>,
      );
      const entry: IntersectionObserverEntry = {
        target: sentinel,
        isIntersecting: true,
        intersectionRatio: 1,
        time: 0,
        boundingClientRect: new DOMRect(),
        intersectionRect: new DOMRect(),
        rootBounds: null,
      };
      act(() => notify([entry]));
      expectSilentSpinner(container);
      expect(
        screen.getByRole('log').querySelector('[role="status"], [aria-live]'),
      ).toBeNull();
      await nextFrame();
      expect(loadingCalls()).toHaveLength(1);
      await action.settle();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('native-modal region lifecycle', () => {
  it('handles an initially busy child before Dialog showModal runs', async () => {
    const {container} = render(
      <StrictMode>
        <Dialog isOpen onOpenChange={noop} aria-label="Edit">
          <TextInput label="Email" value="" isLoading />
        </Dialog>
      </StrictMode>,
    );
    await act(async () => {});
    await nextFrame();
    const region = container.querySelector('dialog [role="status"]');
    expect(region).toBeEmptyDOMElement();
    await waitFor(() => expect(region).toHaveTextContent('Loading'));
    expect(loadingCalls()).toHaveLength(0);
  });

  it('defers a hidden dialog busy start until first exposure without repeating on reopen', async () => {
    const field = (isOpen: boolean) => (
      <Dialog isOpen={isOpen} onOpenChange={noop} aria-label="Edit">
        <TextInput label="Email" value="" isLoading />
      </Dialog>
    );
    const {container, rerender} = render(field(false));
    await nextFrame();
    expect(container.querySelector('dialog [role="status"]')).toBeNull();
    expect(loadingCalls()).toHaveLength(0);
    rerender(field(true));
    await act(async () => {});
    await nextFrame();
    const region = container.querySelector('dialog [role="status"]')!;
    expect(region).toBeEmptyDOMElement();
    await waitFor(() => expect(region).toHaveTextContent('Loading'));
    const write = vi.spyOn(region, 'textContent', 'set');
    rerender(field(false));
    rerender(field(true));
    await nextFrame();
    await nextFrame();
    expect(
      write.mock.calls.filter(([text]) => text === 'Loading'),
    ).toHaveLength(0);
  });

  it('keeps a canceled modal write eligible when the dialog reopens', async () => {
    vi.useFakeTimers();
    const field = (open: boolean) => (
      <dialog open={open}>
        <TextInput label="Email" value="" isLoading />
      </dialog>
    );
    const {container, rerender} = render(field(true));
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    const region = container.querySelector('[role="status"]')!;
    expect(region).toBeEmptyDOMElement();
    rerender(field(false));
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(region).toBeEmptyDOMElement();
    rerender(field(true));
    await act(async () => {});
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(region).toHaveTextContent('Loading');
    expect(loadingCalls()).toHaveLength(0);
  });

  it.each(['settle', 'unmount'] as const)(
    'cancels a hidden dialog observation on %s',
    async finish => {
      vi.useFakeTimers();
      const field = (busy: boolean) => (
        <dialog>
          <TextInput label="Email" value="" isLoading={busy} />
        </dialog>
      );
      const {container, rerender, unmount} = render(field(true));
      const dialog = container.querySelector('dialog')!;
      expect(dialog.querySelector('[role="status"]')).toBeNull();
      if (finish === 'settle') {
        rerender(field(false));
      } else {
        unmount();
      }
      dialog.open = true;
      await act(async () => {});
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(dialog.querySelector('[role="status"]')).toBeNull();
      expect(loadingCalls()).toHaveLength(0);
    },
  );

  it('reschedules a pending modal write when its message changes before delivery', () => {
    vi.useFakeTimers();
    const field = (message: string) => (
      <dialog open>
        <InternationalizationProvider
          locale="fr"
          messages={{fr: {'@astryx.spinner.loading': message}}}>
          <TextInput label="Email" value="" isLoading />
        </InternationalizationProvider>
      </dialog>
    );
    const {container, rerender} = render(field('Chargement'));
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    const region = container.querySelector('[role="status"]')!;
    expect(region).toBeEmptyDOMElement();
    const write = vi.spyOn(region, 'textContent', 'set');
    rerender(field('Patientez'));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(region).toHaveTextContent('Patientez');
    expect(
      write.mock.calls.filter(([text]) => text === 'Chargement'),
    ).toHaveLength(0);
    expect(
      write.mock.calls.filter(([text]) => text === 'Patientez'),
    ).toHaveLength(1);
    expect(announce).not.toHaveBeenCalled();
  });

  it('does not let an earlier modal owner clear a later owner’s message', () => {
    vi.useFakeTimers();
    const field = (firstBusy: boolean, secondBusy: boolean) => (
      <dialog open>
        <InternationalizationProvider
          locale="fr"
          messages={{fr: {'@astryx.spinner.loading': 'First load'}}}>
          <TextInput label="First" value="" isLoading={firstBusy} />
        </InternationalizationProvider>
        <InternationalizationProvider
          locale="fr"
          messages={{fr: {'@astryx.spinner.loading': 'Second load'}}}>
          <TextArea label="Second" value="" isLoading={secondBusy} />
        </InternationalizationProvider>
      </dialog>
    );
    const {container, rerender} = render(field(true, false));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    const region = container.querySelector('[role="status"]')!;
    expect(region).toHaveTextContent('First load');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    rerender(field(true, true));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(
      container.querySelectorAll('[data-astryx-modal-busy-region]'),
    ).toHaveLength(1);
    expect(region).toHaveTextContent('Second load');
    rerender(field(false, true));
    expect(region).toHaveTextContent('Second load');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(region).toHaveTextContent('Second load');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(region).toBeEmptyDOMElement();
    expect(announce).not.toHaveBeenCalled();
  });

  it('cancels settled/unmounted pending writes and clears delivered text', () => {
    vi.useFakeTimers();
    const field = (busy: boolean) => (
      <StrictMode>
        <dialog open>
          <Switch label="Enable" value={false} isLoading={busy} />
        </dialog>
      </StrictMode>
    );
    const {container, rerender, unmount} = render(field(true));
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    const region = container.querySelector('[role="status"]')!;
    const write = vi.spyOn(region, 'textContent', 'set');
    rerender(field(false));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(
      write.mock.calls.filter(([text]) => text === 'Loading'),
    ).toHaveLength(0);
    rerender(field(true));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(region).toHaveTextContent('Loading');
    expect(screen.getByRole('switch')).toHaveAccessibleName('Enable');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(region).toBeEmptyDOMElement();
    rerender(field(false));
    rerender(field(true));
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(
      write.mock.calls.filter(([text]) => text === 'Loading'),
    ).toHaveLength(1);
  });
});
