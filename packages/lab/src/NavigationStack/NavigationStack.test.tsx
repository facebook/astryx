// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NavigationStack.test.tsx
 * @input Uses vitest, @testing-library/react, NavigationStack,
 *   NavigationScreen and useNavigationStack
 * @output jsdom coverage of the stack's state: which screens render, the
 *   bar's title and back button, inert covered screens, a popped screen
 *   leaving once its slide-out ends, focus after a push and after a pop, and
 *   the hook's guard
 * @position Testing; the motion itself is proven in real engines by
 *   __tests__/NavigationStack.interaction.browser.spec.ts (jsdom has no Web
 *   Animations: the animator writes end values and settles on timers)
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useState} from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  NavigationScreen,
  NavigationStack,
  useNavigationStack,
} from './NavigationStack';

function Root() {
  const nav = useNavigationStack<string>();
  return (
    <>
      <button type="button" onClick={() => nav.push('General')}>
        General
      </button>
      <button type="button" onClick={() => nav.push('Privacy')}>
        Privacy
      </button>
    </>
  );
}

function Detail({entry}: {entry: string}) {
  const nav = useNavigationStack<string>();
  return (
    <>
      <p>{entry} content</p>
      <button type="button" onClick={() => nav.push(`${entry} › About`)}>
        About
      </button>
      <button type="button" onClick={() => nav.popToRoot()}>
        Done
      </button>
      <span data-testid="depth">{nav.depth}</span>
    </>
  );
}

function Harness({
  initial = [],
  backTitle,
  rootTitle = 'Settings',
}: {
  initial?: string[];
  backTitle?: string;
  rootTitle?: string;
}) {
  const [path, setPath] = useState<string[]>(initial);
  return (
    <NavigationStack
      label="Settings"
      root={
        <NavigationScreen title={rootTitle} backTitle={backTitle}>
          <Root />
        </NavigationScreen>
      }
      path={path}
      onPathChange={setPath}
      getKey={entry => entry}
      renderScreen={entry => (
        <NavigationScreen title={entry}>
          <Detail entry={entry} />
        </NavigationScreen>
      )}
    />
  );
}

/** A screen's card, by title (the root is "Settings"). */
const screenCard = (title: string) =>
  document.querySelector<HTMLElement>(
    `[data-navigation-screen="${title === 'Settings' ? 'root' : `screen-${title}`}"]`,
  );

/** The bar's back button (other buttons may share its name). */
const backButton = (name: string) =>
  screen
    .getAllByRole('button', {name})
    .find(button => button.hasAttribute('data-navigation-back'));

describe('NavigationStack', () => {
  it('renders the root screen with its title and no back button', () => {
    render(<Harness />);
    expect(screen.getByRole('region', {name: 'Settings'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Settings'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /back|settings/i})).toBeNull();
    expect(screen.getByRole('button', {name: 'General'})).toBeInTheDocument();
  });

  it('pushes a screen: its title shows, Back reads the previous title, the root is covered', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', {name: 'General'}));

    expect(screen.getByText('General content')).toBeInTheDocument();
    const back = screen.getByRole('button', {name: 'Settings'});
    expect(back).toHaveAttribute('data-navigation-back');
    // The covered root screen takes no input and is hidden from assistive
    // technology.
    expect(screenCard('Settings')).toHaveAttribute('inert');
    expect(screenCard('General')).not.toHaveAttribute('inert');
    expect(screen.getByTestId('depth')).toHaveTextContent('1');
  });

  it('pops with the back button; the popped screen leaves once its slide-out ends', async () => {
    render(<Harness initial={['General']} />);
    fireEvent.click(screen.getByRole('button', {name: 'Settings'}));

    // Still rendered, and inert, while it slides out...
    expect(screen.getByText('General content')).toBeInTheDocument();
    expect(screenCard('General')).toHaveAttribute('inert');
    // ...and gone once it has.
    await waitFor(
      () => expect(screen.queryByText('General content')).toBeNull(),
      {timeout: 3000},
    );
    expect(screenCard('Settings')).not.toHaveAttribute('inert');
  });

  it('moves focus to the new title after a push, and back to the pushing control after the pop', async () => {
    render(<Harness />);
    const general = screen.getByRole('button', {name: 'General'});
    general.focus();
    fireEvent.click(general);

    await waitFor(
      () =>
        expect(document.activeElement).toBe(
          screen.getByRole('heading', {name: 'General'}),
        ),
      {timeout: 3000},
    );

    fireEvent.click(screen.getByRole('button', {name: 'Settings'}));
    await waitFor(() => expect(general).toHaveFocus(), {timeout: 3000});
  });

  it('labels Back with the previous screen’s backTitle when it has one', () => {
    render(<Harness initial={['General']} backTitle="All settings" />);
    expect(screen.getByRole('button', {name: 'All settings'})).toHaveAttribute(
      'data-navigation-back',
    );
  });

  it('names Back with the catalog’s “Back” when the previous screen’s title is empty', () => {
    render(<Harness initial={['General']} rootTitle="" />);
    expect(backButton('Back')).toBeDefined();
  });

  it('pops several screens back to the root at once', async () => {
    render(<Harness initial={['General', 'General › About']} />);
    expect(backButton('General')).toBeDefined();
    act(() => {
      fireEvent.click(screen.getAllByRole('button', {name: 'Done'}).at(-1)!);
    });
    await waitFor(
      () => expect(screen.queryByText('General › About content')).toBeNull(),
      {timeout: 3000},
    );
    expect(screen.queryByText('General content')).toBeNull();
    expect(screen.getByRole('button', {name: 'Privacy'})).toBeInTheDocument();
  });

  describe('a large title', () => {
    function LargeHarness() {
      const [path, setPath] = useState<string[]>([]);
      return (
        <NavigationStack
          label="Settings"
          root={
            <NavigationScreen title="Settings" titleDisplayMode="large">
              <Root />
            </NavigationScreen>
          }
          path={path}
          onPathChange={setPath}
          getKey={entry => entry}
          renderScreen={entry => (
            <NavigationScreen title={entry} titleDisplayMode="large">
              <Detail entry={entry} />
            </NavigationScreen>
          )}
        />
      );
    }

    it('shows the title above the content and hides the bar title from assistive technology', () => {
      render(<LargeHarness />);
      const large = screen.getByRole('heading', {level: 1, name: 'Settings'});
      // First in the screen's scrolling content.
      expect(screenCard('Settings')?.firstElementChild?.firstElementChild).toBe(
        large,
      );
      // The bar's copy of the title is hidden while the large one shows.
      expect(screen.getAllByRole('heading', {name: 'Settings'})).toHaveLength(
        1,
      );
    });

    it('moves focus to the pushed screen’s large title', async () => {
      render(<LargeHarness />);
      const general = screen.getByRole('button', {name: 'General'});
      general.focus();
      fireEvent.click(general);
      await waitFor(
        () =>
          expect(document.activeElement).toBe(
            screen.getByRole('heading', {level: 1, name: 'General'}),
          ),
        {timeout: 3000},
      );
    });
  });

  describe('a search field', () => {
    /** A stand-in for SearchField: shows the lift it is handed. */
    // A stand-in SearchField: the stack reads its own `isActive` and hands
    // it `lift`.
    function ProbeField({lift}: {lift?: number; isActive?: boolean}) {
      return <input aria-label="Search" data-lift={lift} />;
    }

    function SearchHarness({ownLift}: {ownLift?: number}) {
      const [path, setPath] = useState<string[]>(['General']);
      const [isActive, setIsActive] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsActive(value => !value)}>
            Toggle search
          </button>
          <NavigationStack
            label="Settings"
            root={
              <NavigationScreen title="Settings">
                <Root />
              </NavigationScreen>
            }
            path={path}
            onPathChange={setPath}
            getKey={entry => entry}
            renderScreen={entry => (
              <NavigationScreen
                title={entry}
                titleDisplayMode="large"
                trailing={<button type="button">Edit</button>}
                search={<ProbeField lift={ownLift} isActive={isActive} />}>
                <p>{entry} content</p>
              </NavigationScreen>
            )}
          />
        </>
      );
    }

    it('sits under the large title, above the content, and is handed its lift', () => {
      render(<SearchHarness />);
      const field = screen.getByRole('textbox', {name: 'Search'});
      const scroller = screenCard('General')?.firstElementChild;
      const [title, wrapper, content] = Array.from(scroller?.children ?? []);
      expect(title).toBe(
        screen.getByRole('heading', {level: 1, name: 'General'}),
      );
      expect(wrapper).toHaveAttribute('data-navigation-search');
      expect(wrapper).toContainElement(field);
      expect(content).toHaveTextContent('General content');
      // The scroll edge sentinel marks the top of the content, as its first
      // child: no positioned wrapper of its own (architecture:component-style-
      // authoring INV7), at its static position in the scroller.
      expect(
        content.querySelector('[data-navigation-scroll-edge-sentinel]'),
      ).toBe(content.firstElementChild);
      expect(field).toHaveAttribute('data-lift', '0');
    });

    it('pins the field under the bar when it does not hide when scrolling', () => {
      const {container} = render(
        <NavigationStack
          label="Settings"
          root={
            <NavigationScreen
              title="Settings"
              titleDisplayMode="large"
              search={<input aria-label="Search" />}
              hidesSearchWhenScrolling={false}>
              <p>Rows</p>
            </NavigationScreen>
          }
          path={[]}
          onPathChange={() => {}}
          renderScreen={() => <NavigationScreen title="x" />}
        />,
      );
      const wrapper = container.querySelector('[data-navigation-search]');
      expect(wrapper?.className).toMatch(/searchPinned/);
    });

    it('keeps a lift the field sets itself', () => {
      render(<SearchHarness ownLift={5} />);
      expect(screen.getByRole('textbox', {name: 'Search'})).toHaveAttribute(
        'data-lift',
        '5',
      );
    });

    it('while active, takes the bar’s items out of reach and hides the titles; a cancel brings them back', () => {
      render(<SearchHarness />);
      const back = backButton('Settings') as HTMLElement;
      const edit = screen.getByRole('button', {name: 'Edit'});
      fireEvent.click(screen.getByRole('button', {name: 'Toggle search'}));

      expect(back.parentElement).toHaveAttribute('inert');
      expect(edit.parentElement).toHaveAttribute('inert');
      expect(
        screen.queryByRole('heading', {level: 1, name: 'General'}),
      ).toBeNull();
      expect(screen.getByRole('textbox', {name: 'Search'})).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'Toggle search'}));
      expect(back.parentElement).not.toHaveAttribute('inert');
      expect(edit.parentElement).not.toHaveAttribute('inert');
      expect(
        screen.getByRole('heading', {level: 1, name: 'General'}),
      ).toBeInTheDocument();
    });
  });

  it('keeps covered screens beyond the one underneath out of rendering', () => {
    render(<Harness initial={['General', 'General › About']} />);
    // Root, General (under the top) and About (top) are mounted; the root,
    // two below the top, keeps its state but is not rendered.
    expect(screenCard('Settings')?.className).toMatch(/cardHidden/);
    expect(screenCard('General')?.className).not.toMatch(/cardHidden/);
  });

  describe('the row that pushed', () => {
    // A row holds its selection under a finger (one touch model); a mouse's
    // row does not.
    beforeEach(() => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
          matches: query.includes('pointer: coarse'),
          media: query,
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        })),
      );
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    function ListRoot() {
      const nav = useNavigationStack<string>();
      return (
        <List>
          <ListItem label="General" onClick={() => nav.push('General')} />
          <ListItem label="Privacy" onClick={() => nav.push('Privacy')} />
        </List>
      );
    }
    function ListHarness() {
      const [path, setPath] = useState<string[]>([]);
      return (
        <NavigationStack
          label="Settings"
          root={
            <NavigationScreen title="Settings">
              <ListRoot />
            </NavigationScreen>
          }
          path={path}
          onPathChange={setPath}
          getKey={entry => entry}
          renderScreen={entry => (
            <NavigationScreen title={entry}>
              <p>{entry} content</p>
            </NavigationScreen>
          )}
        />
      );
    }
    const rowOf = (name: string) =>
      screen
        .getByRole('button', {name})
        .closest<HTMLElement>('[data-astryx-pressable="cell"]');

    it('stays selected under the pushed screen and is released by the pop, with focus back on it', async () => {
      render(<ListHarness />);
      const control = screen.getByRole('button', {name: 'General'});
      control.focus();
      fireEvent.click(control);
      expect(rowOf('General')).toHaveAttribute('data-astryx-press', 'held');

      fireEvent.click(backButton('Settings') as HTMLElement);
      await waitFor(
        () => expect(screen.queryByText('General content')).toBeNull(),
        {timeout: 3000},
      );
      expect(rowOf('General')).not.toHaveAttribute('data-astryx-press', 'held');
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'General'})).toHaveFocus(),
      );
    });

    it('releases the rows of screens a multi-level pop drops, at once', async () => {
      function DetailRows({entry}: {entry: string}) {
        const nav = useNavigationStack<string>();
        return (
          <List>
            <ListItem
              label={`${entry} details`}
              onClick={() => nav.push(`${entry} › Details`)}
            />
            <ListItem label="Done" onClick={() => nav.popToRoot()} />
          </List>
        );
      }
      function DeepHarness() {
        const [path, setPath] = useState<string[]>([]);
        return (
          <NavigationStack
            label="Settings"
            root={
              <NavigationScreen title="Settings">
                <ListRoot />
              </NavigationScreen>
            }
            path={path}
            onPathChange={setPath}
            getKey={entry => entry}
            renderScreen={entry => (
              <NavigationScreen title={entry}>
                <DetailRows entry={entry} />
              </NavigationScreen>
            )}
          />
        );
      }
      render(<DeepHarness />);
      const generalRow = rowOf('General');
      fireEvent.click(screen.getByRole('button', {name: 'General'}));
      await screen.findByRole('heading', {name: 'General', level: 2});
      const detailsRow = rowOf('General details');
      fireEvent.click(screen.getByRole('button', {name: 'General details'}));
      await screen.findByRole('heading', {
        name: 'General › Details',
        level: 2,
      });
      // Both pushing rows are held: the root's General row and General's
      // own row, under the screens they pushed.
      expect(generalRow).toHaveAttribute('data-astryx-press', 'held');
      expect(detailsRow).toHaveAttribute('data-astryx-press', 'held');

      // Done pops both screens in one transition. General is dropped without
      // a transition of its own: its row's hold ends in the same commit,
      // while the root's row deselects alongside the pop.
      fireEvent.click(screen.getAllByRole('button', {name: 'Done'}).at(-1)!);
      expect(detailsRow).not.toHaveAttribute('data-astryx-press', 'held');
      // The root's row, the one the pop reveals, deselects with the pop
      // rather than snapping off.
      expect(generalRow).toHaveAttribute('data-astryx-press', 'held');
      await waitFor(
        () => expect(screen.queryByText('General details')).toBeNull(),
        {timeout: 3000},
      );
      await waitFor(() =>
        expect(generalRow).not.toHaveAttribute('data-astryx-press', 'held'),
      );
    });

    it('releases the row when the app refuses the push', async () => {
      function RefusingHarness() {
        return (
          <NavigationStack
            label="Settings"
            root={
              <NavigationScreen title="Settings">
                <ListRoot />
              </NavigationScreen>
            }
            path={[]}
            onPathChange={() => {}}
            getKey={entry => entry}
            renderScreen={entry => (
              <NavigationScreen title={entry}>
                <p>{entry} content</p>
              </NavigationScreen>
            )}
          />
        );
      }
      render(<RefusingHarness />);
      fireEvent.click(screen.getByRole('button', {name: 'General'}));
      // No screen covers the row: by the next frame it is released.
      await waitFor(() =>
        expect(rowOf('General')).not.toHaveAttribute(
          'data-astryx-press',
          'held',
        ),
      );
    });

    it('releases the covered row when the app replaces the path', async () => {
      function ReplacingHarness() {
        const [path, setPath] = useState<string[]>([]);
        return (
          <>
            <button type="button" onClick={() => setPath(['Privacy'])}>
              Replace
            </button>
            <NavigationStack
              label="Settings"
              root={
                <NavigationScreen title="Settings">
                  <ListRoot />
                </NavigationScreen>
              }
              path={path}
              onPathChange={setPath}
              getKey={entry => entry}
              renderScreen={entry => (
                <NavigationScreen title={entry}>
                  <p>{entry} content</p>
                </NavigationScreen>
              )}
            />
          </>
        );
      }
      render(<ReplacingHarness />);
      fireEvent.click(screen.getByRole('button', {name: 'General'}));
      await screen.findByRole('heading', {name: 'General', level: 2});
      expect(rowOf('General')).toHaveAttribute('data-astryx-press', 'held');

      // A replaced path has no pop to deselect along: the row is released.
      fireEvent.click(screen.getByRole('button', {name: 'Replace'}));
      await screen.findByRole('heading', {name: 'Privacy', level: 2});
      expect(rowOf('General')).not.toHaveAttribute('data-astryx-press', 'held');
    });

    it('returns focus to a trailing control that pushed, inside its row', async () => {
      function TrailingRoot() {
        const nav = useNavigationStack<string>();
        return (
          <List>
            <ListItem
              label="General"
              onClick={() => nav.push('General')}
              endContent={
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    nav.push('General info');
                  }}>
                  Info
                </button>
              }
            />
          </List>
        );
      }
      function TrailingHarness() {
        const [path, setPath] = useState<string[]>([]);
        return (
          <NavigationStack
            label="Settings"
            root={
              <NavigationScreen title="Settings">
                <TrailingRoot />
              </NavigationScreen>
            }
            path={path}
            onPathChange={setPath}
            getKey={entry => entry}
            renderScreen={entry => (
              <NavigationScreen title={entry}>
                <p>{entry} content</p>
              </NavigationScreen>
            )}
          />
        );
      }
      render(<TrailingHarness />);
      const info = screen.getByRole('button', {name: 'Info'});
      info.focus();
      fireEvent.click(info);
      await screen.findByRole('heading', {name: 'General info', level: 2});

      fireEvent.click(backButton('Settings') as HTMLElement);
      await waitFor(
        () => expect(screen.queryByText('General info content')).toBeNull(),
        {timeout: 3000},
      );
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'Info'})).toHaveFocus(),
      );
    });

    it('holds only the row that was activated', () => {
      render(<ListHarness />);
      fireEvent.click(screen.getByRole('button', {name: 'Privacy'}));
      expect(rowOf('Privacy')).toHaveAttribute('data-astryx-press', 'held');
      expect(rowOf('General')).not.toHaveAttribute('data-astryx-press', 'held');
    });
  });

  it('throws when useNavigationStack is used outside a stack', () => {
    function Orphan() {
      useNavigationStack();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/inside a NavigationStack/);
  });
});
