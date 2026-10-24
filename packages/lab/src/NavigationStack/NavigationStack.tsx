// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavigationStack.tsx
 * @input React, StyleX, core's holdSelection (the pushing row's selection),
 *   core's compositor animator and the UIKit table
 *   (`@astryxdesign/core/motion/experimental`), navigationTransition.ts for
 *   the math, NavigationStackTouch.ts for the back swipes (the touch layer)
 * @output Exports NavigationStack (a push/pop navigator with UIKit's
 *   transitions and back gestures), NavigationScreen (one screen: its bar
 *   title, back title, trailing items and content) and useNavigationStack
 *   (push / pop / popToRoot from inside a screen)
 * @position Lab component (packages/lab/src/NavigationStack); the phone
 *   presentation of drill-down navigation, UINavigationController's
 *   counterpart
 *
 * The app owns the path (`path` + `onPathChange`); the stack renders the
 * root screen and one screen per entry, top last, and animates the change
 * whenever the path gains or loses its top entry.
 *
 * Motion is UIKit's, measured on iOS 26.2 (motion/uikit/navigation.ts): a
 * critically damped spring (response 0.3 s) that starts at 8.773 widths per
 * second, the card underneath moving at 0.3 of the top card's speed under a
 * 10 % black dimming; each screen's bar moves with it.
 * Every layer runs on the compositor (core's animator), so a busy main thread
 * does not stall a push or a pop. The back swipe is tracked 1:1 by the
 * recognizer (from the leading screen edge, or anywhere in the content as on
 * iOS 26) and released on the compositor: it finishes when progress plus
 * 0.35 s of velocity passes half the width, on a spring (0.3 s, ζ 0.85) that
 * starts at the finger's speed. A transition is never waited for: a pop
 * during a push turns it around from where it is, and a finger can grab a
 * moving card.
 *
 * The bar is iOS 26's (measured): each screen has its own opaque bar that
 * moves with its screen, so a pushed title slides in with its screen and
 * covers the one it replaces, which rides the parallax underneath; under a
 * finger the revealed bar holds still. Back is one 44 pt circle over the
 * bars, holding only the chevron and named by the screen it returns to: on
 * a push from the root its platter is there from the first frame and the
 * chevron fades in a beat later; on a pop to the root the chevron fades out
 * at once and the platter leaves with the screen. A back swipe leaves it
 * alone until the pop finishes.
 *
 * In a browser tab the screen's leading edge is the browser's own back
 * swipe (iOS Safari keeps it): the stack's edge swipe runs only in a
 * home-screen web app (`navigator.standalone`), and the content swipe
 * ignores touches that start in that edge band.
 *
 * Reduced Motion is the animator's (`design:reduced-motion`): under a finger
 * the incoming screen fades in where it lands and the outgoing one fades out
 * in 200 ms, with no travel and no dimming; under a mouse the change is
 * immediate. A finger's back swipe still tracks it; what its release
 * starts fades on any pointer.
 *
 * A list row (Item, ListItem, TreeList) that pushes a screen stays
 * selected while that screen covers it and deselects as it pops (core's
 * holdSelection): over the pop's first 0.35 s, linearly, on the same clock
 * as the cards, or with a back swipe's progress; a cancelled swipe selects
 * it again.
 *
 * Accessibility: covered screens are `inert`. A push moves focus to the new
 * screen's title; a pop returns it to the control that pushed the screen.
 * The back button is a real button named by the screen it returns to.
 *
 * SYNC: When modified, update NavigationStack.doc.mjs,
 * NavigationStack.test.tsx and
 * __tests__/NavigationStack.interaction.browser.spec.ts.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Animator} from '@astryxdesign/core/motion/animator';
import {resolveMotion} from '@astryxdesign/core/motion/resolveMotion';
import {
  solveSpring,
  toSpring,
  type SpringDescription,
} from '@astryxdesign/core/motion/spring';
import {
  navigation,
  registerNavigationTable,
  registerSpringsTable,
  springs,
} from '@astryxdesign/core/motion/uikit';
import {useAnimator} from '@astryxdesign/core/motion/useAnimator';
import {isRtlElement} from '@astryxdesign/core/hooks';
import {useTranslator} from '@astryxdesign/core/i18n';
import {focusOutlineStyles, observeResize} from '@astryxdesign/core/utils';
import {holdSelection, type SelectionHold} from '@astryxdesign/core/List';
import {Icon} from '@astryxdesign/core/Icon';
import {
  colorVars,
  fontWeightVars,
  spacingVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  layerVelocities,
  layersAt,
  programmaticVelocity,
} from './navigationTransition';
import {useBackSwipes, type BackSwipeStack} from './NavigationStackTouch';

// =============================================================================
// Types
// =============================================================================

export interface NavigationScreenProps {
  /** The screen's title, shown in the bar and read first on arrival. */
  title: string;
  /**
   * What the back button reads on the screen pushed on top of this one.
   * Defaults to this screen's `title`.
   */
  backTitle?: string;
  /** Items at the trailing end of the bar while this screen is on top. */
  trailing?: ReactNode;
  /**
   * How the title shows: in the bar (`inline`), or `large` above the
   * content, scrolling with it and handing over to the bar's title once it
   * has scrolled under the bar (iOS's large titles).
   * @default 'inline'
   */
  titleDisplayMode?: 'large' | 'inline';
  /** The screen's content; it scrolls on its own. */
  children?: ReactNode;
}

export interface NavigationStackProps<T> {
  /** The root screen: a NavigationScreen. */
  root: ReactElement<NavigationScreenProps>;
  /** The entries pushed on the root, bottom first. Controlled. */
  path: ReadonlyArray<T>;
  /** Called with the new path when a push, pop or back swipe changes it. */
  onPathChange: (path: T[]) => void;
  /** Renders an entry's screen: a NavigationScreen. */
  renderScreen: (
    entry: T,
    index: number,
  ) => ReactElement<NavigationScreenProps>;
  /**
   * A stable key per entry, so a screen keeps its state while it moves down
   * the stack. Defaults to the entry's position.
   */
  getKey?: (entry: T, index: number) => string | number;
  /** Whether the back swipe pops. @default true */
  isInteractivePopEnabled?: boolean;
  /** Accessible name of the navigator region. */
  label?: string;
  'data-testid'?: string;
}

export interface NavigationStackApi<T = unknown> {
  /**
   * Pushes an entry. The control that started it (the click or key press
   * being handled, or `options.source`) gets focus back when it is popped.
   */
  push: (entry: T, options?: {source?: Element | null}) => void;
  /** Pops the top screen; nothing at the root. */
  pop: () => void;
  /** Pops back to the root. */
  popToRoot: () => void;
  /** How many screens are pushed on the root. */
  depth: number;
}

// =============================================================================
// Context
// =============================================================================

const NavigationStackContext = createContext<NavigationStackApi | null>(null);

/** The enclosing NavigationStack's push / pop / popToRoot. */
export function useNavigationStack<T = unknown>(): NavigationStackApi<T> {
  const api = useContext(NavigationStackContext);
  if (api == null) {
    throw new Error('useNavigationStack must be used inside a NavigationStack');
  }
  return api as NavigationStackApi<T>;
}

// =============================================================================
// Styles
// =============================================================================

const BAR_HEIGHT = 44;

const styles = stylex.create({
  stack: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: colorVars['--color-background-body'],
  },
  bar: {
    position: 'relative',
    isolation: 'isolate',
    flexShrink: 0,
    height: BAR_HEIGHT,
    backgroundColor: colorVars['--color-background-surface'],
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  // Each screen's bar is opaque and moves with its screen, as UIKit's
  // per-screen bar copy does: the incoming one covers the outgoing title.
  barLayer: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
    // Below the back button: WebKit does not promote the static siblings a
    // moving layer crosses, so the moving one goes underneath.
    zIndex: -1,
  },
  // The one back button: it stays put while the bars move under it.
  backControl: {
    position: 'absolute',
    insetInlineStart: spacingVars['--spacing-4'],
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
  },
  barLayerCovered: {
    pointerEvents: 'none',
  },
  barLeading: {
    display: 'flex',
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  barTitle: {
    margin: 0,
    minWidth: 0,
    fontSize: textSizeVars['--font-size-lg'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  largeTitle: {
    margin: 0,
    paddingInline: spacingVars['--spacing-4'],
    paddingTop: spacingVars['--spacing-1'],
    paddingBottom: spacingVars['--spacing-2'],
    fontSize: textSizeVars['--font-size-4xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    lineHeight: 1.2,
  },
  barTrailing: {
    display: 'flex',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  // iOS 26: a 44 pt circle holding only the chevron; the previous title
  // is its accessible name, not a label.
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    padding: 0,
    borderRadius: '50%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-accent'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  backIcon: {
    transform: {
      default: null,
      ':is([dir="rtl"] *)': 'scaleX(-1)',
    },
  },
  cards: {
    position: 'relative',
    flexGrow: 1,
    minHeight: 0,
  },
  card: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colorVars['--color-background-body'],
    overflowY: 'auto',
    outline: 'none',
    // The card scrolls vertically; a sideways drag is the back swipe's. A
    // horizontal scroller inside the content is its own scroll container
    // and keeps its native sideways scrolling.
    touchAction: 'pan-y pinch-zoom',
  },
  cardHidden: {
    contentVisibility: 'hidden',
  },
  // Only while it overflows: a screen with nothing to scroll lets a scroll
  // chain on, as any other element does.
  cardOverflowing: {
    overscrollBehaviorY: 'contain',
  },
  dim: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
});

// The dimming's black is the UIKit table's alpha, a runtime value StyleX
// cannot read at compile time.
const dynamicStyles = stylex.create({
  dimColor: (alpha: number) => ({
    // eslint-disable-next-line @astryx/no-raw-color -- UIKit's parallax dimming is black at the table's measured alpha in every appearance; it is not a theme colour
    backgroundColor: `rgba(0, 0, 0, ${alpha})`,
  }),
});

// =============================================================================
// Layers
// =============================================================================

/**
 * One screen's animated layers: its card and the dimming over it, and its
 * bar, which moves with the card (title and trailing items included), with
 * the same dimming.
 */
interface ScreenLayers {
  card: Animator;
  dim: Animator;
  bar: Animator;
  barDim: Animator;
  cardElement: HTMLElement | null;
  titleElement: HTMLElement | null;
  /** The large title above the content, for `titleDisplayMode="large"`. */
  largeTitleElement: HTMLElement | null;
  /** The bar title's text, hidden while the large title shows. */
  titleText: Animator;
}

type Registry = Map<string, Partial<ScreenLayers>>;

interface ScreenModel {
  key: string;
  element: ReactElement<NavigationScreenProps>;
  /** The control that pushed this screen; focus returns to it on the pop. */
  source: Element | null;
}

function CardLayer({
  model,
  registry,
  isTop,
  isCovered,
  isHidden,
  onLargeTitleCollapse,
}: {
  model: ScreenModel;
  registry: Registry;
  isTop: boolean;
  isCovered: boolean;
  isHidden: boolean;
  onLargeTitleCollapse: (key: string, isCollapsed: boolean) => void;
}) {
  const isLarge = model.element.props.titleDisplayMode === 'large';
  const largeTitleRef = useRef<HTMLHeadingElement | null>(null);
  // The large title has collapsed once it has scrolled entirely under the
  // bar: the bar's own title takes over. Read from the card's scroll position
  // (the system this listens to) as it scrolls; a card hidden two levels down
  // scrolls no more and keeps its last value. A card that unmounts drops its
  // collapse: mounted again, it starts at the top with its large title.
  useLayoutEffect(() => {
    const title = largeTitleRef.current;
    const card = title?.parentElement ?? null;
    if (!isLarge || title == null || card == null) {
      return undefined;
    }
    // A title with no layout (nothing rendered yet) has not scrolled away.
    const read = () =>
      onLargeTitleCollapse(
        model.key,
        title.offsetHeight > 0 &&
          card.scrollTop >= title.offsetTop + title.offsetHeight,
      );
    read();
    card.addEventListener('scroll', read, {passive: true});
    return () => {
      card.removeEventListener('scroll', read);
      onLargeTitleCollapse(model.key, false);
    };
  }, [isLarge, model.key, onLargeTitleCollapse]);
  const largeTitleCallback = useCallback(
    (element: HTMLHeadingElement | null) => {
      largeTitleRef.current = element;
      const entry = registry.get(model.key) ?? {};
      entry.largeTitleElement = element;
      registry.set(model.key, entry);
    },
    [registry, model.key],
  );
  const card = useAnimator();
  const dim = useAnimator();
  const cardElementRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  // Watches the card and its content for a size change: whether the card can
  // scroll decides whether it contains its overscroll.
  useLayoutEffect(() => {
    const element = cardElementRef.current;
    if (element == null) {
      return undefined;
    }
    // Through core's shared observer, which also measures once right away.
    const measure = () =>
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    const unobserveCard = observeResize(element, measure);
    const content = element.firstElementChild;
    const unobserveContent =
      content == null ? undefined : observeResize(content, measure);
    return () => {
      unobserveCard();
      unobserveContent?.();
    };
  }, []);
  useLayoutEffect(() => {
    const entry = registry.get(model.key) ?? {};
    entry.card = card.animator;
    entry.dim = dim.animator;
    registry.set(model.key, entry);
  }, [registry, model.key, card.animator, dim.animator]);
  // Stable: a new callback each render would detach and reattach the
  // animator, restarting a running transition.
  const cardRef = useCallback(
    (element: HTMLDivElement | null) => {
      card.ref(element);
      cardElementRef.current = element;
      const entry = registry.get(model.key) ?? {};
      entry.cardElement = element;
      registry.set(model.key, entry);
    },
    [card, registry, model.key],
  );
  return (
    <div
      ref={cardRef}
      data-navigation-screen={model.key}
      data-navigation-top={isTop || undefined}
      inert={isCovered || undefined}
      {...stylex.props(
        styles.card,
        isOverflowing && styles.cardOverflowing,
        isHidden && styles.cardHidden,
      )}>
      {isLarge ? (
        <h1
          ref={largeTitleCallback}
          tabIndex={-1}
          {...stylex.props(styles.largeTitle, focusOutlineStyles.focusVisible)}>
          {model.element.props.title}
        </h1>
      ) : null}
      {model.element.props.children}
      <div
        ref={dim.ref}
        aria-hidden
        {...stylex.props(
          styles.dim,
          dynamicStyles.dimColor(navigation.dimmingAlpha),
        )}
      />
    </div>
  );
}

function BarLayer({
  model,
  registry,
  isCovered,
  isLargeTitleShown,
}: {
  model: ScreenModel;
  registry: Registry;
  isCovered: boolean;
  isLargeTitleShown: boolean;
}) {
  const bar = useAnimator();
  const barDim = useAnimator();
  const titleText = useAnimator();
  // The bar's title is hidden while the screen's large title shows, and
  // fades in when the large title has scrolled under the bar: this drives
  // the title's compositor animator (the system it synchronizes).
  const wasShownRef = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const entry = registry.get(model.key) ?? {};
    entry.titleText = titleText.animator;
    registry.set(model.key, entry);
    const target = {
      opacity: isLargeTitleShown ? 0 : 1,
      y: isLargeTitleShown ? navigation.inlineTitleRise : 0,
    };
    if (wasShownRef.current == null) {
      titleText.animator.set(target);
    } else if (wasShownRef.current !== isLargeTitleShown) {
      titleText.animator.animate(target, {
        spring: springs.navigationBarElements,
      });
    }
    wasShownRef.current = isLargeTitleShown;
  }, [registry, model.key, titleText.animator, isLargeTitleShown]);
  useLayoutEffect(() => {
    const entry = registry.get(model.key) ?? {};
    entry.bar = bar.animator;
    entry.barDim = barDim.animator;
    registry.set(model.key, entry);
  }, [registry, model.key, bar.animator, barDim.animator]);
  // The title is one element (its heading role): the stack focuses it, and
  // the animator rises and fades it.
  const titleRefs = useCallback(
    (element: HTMLHeadingElement | null) => {
      const entry = registry.get(model.key) ?? {};
      entry.titleElement = element;
      registry.set(model.key, entry);
      titleText.ref(element);
    },
    [registry, model.key, titleText],
  );
  const props = model.element.props;
  return (
    <div
      ref={bar.ref}
      data-navigation-bar={model.key}
      inert={isCovered || undefined}
      {...stylex.props(styles.barLayer, isCovered && styles.barLayerCovered)}>
      <div {...stylex.props(styles.barLeading)} />
      <h2
        ref={titleRefs}
        tabIndex={-1}
        aria-hidden={isLargeTitleShown || undefined}
        {...stylex.props(styles.barTitle, focusOutlineStyles.focusVisible)}>
        {props.title}
      </h2>
      <div {...stylex.props(styles.barTrailing)}>{props.trailing}</div>
      <div
        ref={barDim.ref}
        aria-hidden
        {...stylex.props(
          styles.dim,
          dynamicStyles.dimColor(navigation.dimmingAlpha),
        )}
      />
    </div>
  );
}

/**
 * The back button: one for the stack, over the moving bars. Its glass
 * platter shows from a push's first frame; its chevron fades in and out on
 * its own clock (the stack drives both).
 */
function BackControl({
  label,
  onBack,
  isLeaving,
  control,
  chevron,
}: {
  label: string;
  onBack: () => void;
  isLeaving: boolean;
  control: (element: HTMLElement | null) => void;
  chevron: (element: HTMLElement | null) => void;
}) {
  // The chevron is the icon's own element (one element per role, no
  // wrapper). An Icon named from the registry takes no ref, so the animator
  // binds to the element the button holds.
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    const icon = buttonRef.current?.firstElementChild;
    chevron(icon instanceof HTMLElement ? icon : null);
    return () => chevron(null);
  }, [chevron]);
  return (
    <div
      ref={control}
      inert={isLeaving || undefined}
      {...stylex.props(styles.backControl)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={onBack}
        aria-label={label}
        data-navigation-back
        {...stylex.props(styles.back)}>
        <Icon icon="chevronLeft" color="inherit" xstyle={styles.backIcon} />
      </button>
    </div>
  );
}

/** Whether the focused element shows its focus indicator (a keyboard's). */
function isFocusVisible(element: Element | null): boolean {
  if (element == null || element === element.ownerDocument.body) {
    return false;
  }
  try {
    return element.matches(':focus-visible');
  } catch {
    // An engine without :focus-visible: keep its own heuristic.
    return true;
  }
}

// =============================================================================
// Screen
// =============================================================================

/**
 * One screen of a NavigationStack. Its props describe the screen (title,
 * back title, bar items, content); the stack lays it out.
 */
export function NavigationScreen(_props: NavigationScreenProps): ReactNode {
  // Rendered by NavigationStack, which reads these props; on its own it is
  // nothing.
  return null;
}
NavigationScreen.displayName = 'NavigationScreen';

// =============================================================================
// Stack
// =============================================================================

interface Transition {
  id: number;
  kind: 'push' | 'pop' | 'none';
  /** The screen on top when the transition ends (push) or leaving (pop). */
  top: string;
  /** The screen under it. */
  under: string | null;
}

/** The stack's writing direction, as core reads it. */
function writingDirection(element: HTMLElement | null): 'ltr' | 'rtl' {
  return isRtlElement(element) ? 'rtl' : 'ltr';
}

/**
 * A push/pop navigator: UINavigationController's transitions, back button
 * and back swipes, on the compositor.
 */
/**
 * Registers the motion roles the stack animates with (the navigation and
 * spring tables), so a theme can retune them. Once per page, before the
 * first animation; nothing registers on import.
 */
let isStackMotionRegistered = false;
function registerStackMotion(): void {
  if (isStackMotionRegistered) {
    return;
  }
  isStackMotionRegistered = true;
  registerNavigationTable();
  registerSpringsTable();
}

export function NavigationStack<T>({
  root,
  path,
  onPathChange,
  renderScreen,
  getKey,
  isInteractivePopEnabled = true,
  label,
  'data-testid': testId,
}: NavigationStackProps<T>) {
  registerStackMotion();
  const t = useTranslator();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [registry] = useState<Registry>(() => new Map());
  // Screens whose large title has scrolled under the bar.
  const [collapsedTitles, setCollapsedTitles] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const collapsedRef = useRef(collapsedTitles);
  collapsedRef.current = collapsedTitles;
  const onLargeTitleCollapse = useCallback(
    (key: string, isCollapsed: boolean) => {
      setCollapsedTitles(current => {
        if (current.has(key) === isCollapsed) {
          return current;
        }
        const next = new Set(current);
        if (isCollapsed) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    },
    [],
  );

  // The screens on the path, root first.
  const models = useMemo<ScreenModel[]>(() => {
    const list: ScreenModel[] = [{key: 'root', element: root, source: null}];
    path.forEach((entry, index) => {
      list.push({
        key: `screen-${getKey ? getKey(entry, index) : index}`,
        element: renderScreen(entry, index),
        source: null,
      });
    });
    return list;
  }, [root, path, renderScreen, getKey]);
  const keys = models.map(model => model.key).join('\u0000');

  // Sources of pushes, by screen key (focus returns there on the pop).
  const sourcesRef = useRef(new Map<string, Element | null>());
  // The list row each push came from, kept selected while the pushed
  // screen covers it and deselected as that screen pops, by the
  // pushed screen's key, with the key of the screen the row lives in.
  const holdsRef = useRef(
    new Map<string, {hold: SelectionHold; from: string}>(),
  );
  // The last control activated inside the stack: what a push it starts came
  // from, and whether a key activated it.
  const lastActivationRef = useRef<{
    target: Element;
    at: number;
    isKeyboard: boolean;
  } | null>(null);
  // A pending push source handed to push(): applied to the new top.
  const pendingSourceRef = useRef<Element | null | undefined>(undefined);
  // The row a push asked to keep selected, until the app accepts the push
  // (the push transition commits); a refused push releases it.
  const pendingHoldRef = useRef<{
    key: string;
    hold: SelectionHold;
    from: string;
  } | null>(null);
  // An interactive release in flight: the pop it commits continues from the
  // finger's velocity instead of starting a programmatic pop.
  const releaseRef = useRef<{velocity: number} | null>(null);

  // Derived during render, so a popped screen is still rendered (leaving) in
  // the very commit that drops it from the path.
  const [view, setView] = useState<{
    keys: string;
    models: ScreenModel[];
    leaving: ScreenModel | null;
    transition: Transition;
  }>(() => ({
    keys,
    models,
    leaving: null,
    transition: {
      id: 0,
      kind: 'none',
      top: models.at(-1)?.key ?? 'root',
      under: null,
    },
  }));
  if (view.keys !== keys) {
    const before = view.models;
    const isPrefix = (shorter: ScreenModel[], longer: ScreenModel[]) =>
      shorter.every((model, i) => longer[i]?.key === model.key);
    let transition: Transition;
    let leaving: ScreenModel | null = null;
    if (models.length === before.length + 1 && isPrefix(before, models)) {
      transition = {
        id: view.transition.id + 1,
        kind: 'push',
        top: models[models.length - 1].key,
        under: before[before.length - 1]?.key ?? null,
      };
    } else if (models.length < before.length && isPrefix(models, before)) {
      leaving = before[before.length - 1];
      transition = {
        id: view.transition.id + 1,
        kind: 'pop',
        top: leaving.key,
        under: models[models.length - 1].key,
      };
    } else {
      transition = {
        id: view.transition.id + 1,
        kind: 'none',
        top: models[models.length - 1].key,
        under: null,
      };
    }
    setView({keys, models, leaving, transition});
  } else if (view.models !== models) {
    // Same screens, new elements (the app re-rendered): keep them current.
    setView({...view, models});
  }

  const depth = models.length - 1;
  const rendered = view.leaving ? [...view.models, view.leaving] : view.models;
  const topKey = view.leaving
    ? view.leaving.key
    : (view.models.at(-1)?.key ?? 'root');
  // While a pop runs, the screen it reveals; otherwise the one under the top
  // (a finished pop's `transition.under` is the new top itself).
  const underKey =
    view.leaving != null
      ? view.transition.under
      : (view.models.at(-2)?.key ?? null);

  // ---------------------------------------------------------------------------
  // Transition driver
  // ---------------------------------------------------------------------------

  const runningRef = useRef<{id: number; done: boolean} | null>(null);
  // The clock the last transition's screens run on (their start time), so
  // the back chevron keeps time with them.
  const startedRef = useRef(0);
  // A pop's focus return, waiting for the commit that drops the leaving
  // screen (until then every screen is `inert` and cannot take focus).
  const pendingFocusRef = useRef<{popped: string; revealed: string} | null>(
    null,
  );
  const progressRef = useRef(0);
  // The back button's platter and chevron (one for the stack).
  const backControl = useAnimator();
  const backChevron = useAnimator();

  const layersOf = useCallback(
    (key: string | null) => (key == null ? null : (registry.get(key) ?? null)),
    [registry],
  );

  /**
   * Writes the layers for progress p (a finger's frame, or a transition's
   * first one; no animation). The top bar moves with its card. Under a
   * finger the revealed bar holds still where it rests, as UIKit's does;
   * `underBar: 'ride'` puts it at its card's parallax instead (where a
   * programmatic pop starts it).
   */
  const setProgress = useCallback(
    (
      p: number,
      top: string,
      under: string | null,
      underBar: 'rest' | 'ride' = 'rest',
    ) => {
      const width = cardsRef.current?.clientWidth ?? 0;
      const direction = writingDirection(containerRef.current);
      const values = layersAt(p, width, direction);
      const topLayers = layersOf(top);
      const underLayers = layersOf(under);
      topLayers?.card?.set({x: values.topX});
      topLayers?.bar?.set({x: values.topX});
      underLayers?.card?.set({x: values.underX});
      underLayers?.bar?.set({x: underBar === 'ride' ? values.underX : 0});
      underLayers?.dim?.set({opacity: values.dim});
      underLayers?.barDim?.set({opacity: values.dim});
      progressRef.current = p;
    },
    [layersOf],
  );

  /**
   * Springs the layers to progress `to`. `dp` is the progress velocity to
   * start from (omit it to keep the velocity the layers have on screen).
   */
  const animateProgress = useCallback(
    (
      to: 0 | 1,
      top: string,
      under: string | null,
      spring: SpringDescription,
      dp: number | undefined,
      release: boolean,
      underBar: 'rest' | 'ride',
      startAt?: number,
    ): Promise<boolean> => {
      const width = cardsRef.current?.clientWidth ?? 0;
      const direction = writingDirection(containerRef.current);
      const values = layersAt(to, width, direction);
      const velocity =
        dp == null ? null : layerVelocities(dp, width, direction);
      const at = startAt ?? performance.now();
      const topLayers = layersOf(top);
      const underLayers = layersOf(under);
      const handles = [];
      // Reduced Motion is the animator's; `crossfadeAs` says which card
      // enters (fades in where it lands) and which leaves (fades out in
      // place). A finger's release fades on any pointer (`touchRelease`).
      if (topLayers?.card) {
        handles.push(
          topLayers.card.animate(
            {x: values.topX},
            {spring, velocity: velocity ? {x: velocity.topX} : undefined},
            {
              at,
              touchRelease: release,
              crossfadeAs: to === 0 ? 'entrance' : 'exit',
            },
          ),
        );
        startedRef.current = at;
      }
      // The bars move with their cards (each screen's bar is part of it in
      // UIKit): the incoming one covers the outgoing title.
      if (topLayers?.bar) {
        handles.push(
          topLayers.bar.animate(
            {x: values.topX},
            {spring, velocity: velocity ? {x: velocity.topX} : undefined},
            {at, touchRelease: release},
          ),
        );
      }
      if (underLayers?.bar && underBar === 'ride') {
        handles.push(
          underLayers.bar.animate(
            {x: values.underX},
            {spring, velocity: velocity ? {x: velocity.underX} : undefined},
            {at, touchRelease: release},
          ),
        );
      }
      if (underLayers?.card) {
        handles.push(
          underLayers.card.animate(
            {x: values.underX},
            {spring, velocity: velocity ? {x: velocity.underX} : undefined},
            {
              at,
              touchRelease: release,
              crossfadeAs: to === 1 ? 'entrance' : 'exit',
            },
          ),
        );
      }
      for (const dim of [underLayers?.dim, underLayers?.barDim]) {
        if (dim == null) {
          continue;
        }
        if (dim.reducedMotion({touchRelease: release}) !== 'off') {
          // A Reduced Motion fade has no dimming: the shade belongs to the
          // slide.
          dim.set({opacity: 0});
        } else {
          handles.push(
            dim.animate(
              {opacity: values.dim},
              {
                spring,
                velocity: velocity ? {opacity: velocity.dim} : undefined,
              },
              {at, touchRelease: release},
            ),
          );
        }
      }
      progressRef.current = to;
      return Promise.all(handles.map(async handle => handle.finished)).then(
        results => results.every(Boolean),
      );
    },
    [layersOf],
  );

  /**
   * The back button on a push from the root or a pop to it, as UIKit's: the
   * platter is there from the push's first frame and the chevron fades in a
   * beat later; on the pop the chevron fades out at once and the platter
   * leaves with the screen. Both fades are the back-button spring; the
   * push's delay is a motion role, resolved under the stack's theme.
   */
  const fadeBack = useCallback(
    (kind: 'push' | 'pop', under: string | null, release = false) => {
      const isRoot = under != null && view.models[0]?.key === under;
      if (!isRoot) {
        return;
      }
      const element = containerRef.current;
      const spring = springs.navigationBackButton;
      const delay =
        kind === 'pop'
          ? 0
          : resolveMotion(element, navigation, 'backChevronPushDelayMs');
      if (kind === 'push') {
        backControl.animator.set({opacity: 1});
        backChevron.animator.set({opacity: 0});
      }
      // On the screens' clock, and starting with them: the delay is part of
      // the curve, so the whole fade is one compositor animation that a busy
      // main thread cannot hold back (a start in the future would wait for
      // it in WebKit).
      const from = kind === 'push' ? 0 : 1;
      const to = kind === 'push' ? 1 : 0;
      const fade = solveSpring(toSpring(resolveMotion(element, spring)), {
        from,
        to,
      });
      const delayS = delay / 1000;
      backChevron.animator.play(
        {
          opacity: {
            duration: delayS + fade.settleTime(0.001),
            at: t => (t < delayS ? from : fade.value(t - delayS)),
            velocity: t => (t < delayS ? 0 : fade.velocity(t - delayS)),
          },
        },
        {at: startedRef.current, touchRelease: release},
      );
    },
    [view.models, backControl.animator, backChevron.animator],
  );

  /** Puts a screen's layers at rest: on top, covered, or off. */
  const settle = useCallback(
    (key: string, role: 'top' | 'covered') => {
      const layers = layersOf(key);
      const width = cardsRef.current?.clientWidth ?? 0;
      const direction = writingDirection(containerRef.current);
      const values = layersAt(0, width, direction);
      if (role === 'top') {
        layers?.card?.set({x: 0, opacity: 1});
        layers?.dim?.set({opacity: 0});
        layers?.bar?.set({x: 0});
        layers?.barDim?.set({opacity: 0});
      } else {
        // Covered: parked at the parallax, under the top screen and its bar.
        layers?.card?.set({x: values.underX, opacity: 1});
        layers?.dim?.set({opacity: 1});
        layers?.bar?.set({x: values.underX});
        layers?.barDim?.set({opacity: 1});
      }
    },
    [layersOf],
  );

  const focusAfter = useCallback(
    (kind: 'push' | 'pop', key: string, revealed?: string) => {
      const container = containerRef.current;
      if (container == null) {
        return;
      }
      const active = container.ownerDocument.activeElement;
      // Only move focus when it was in the stack (or nowhere): never take it
      // from elsewhere on the page.
      if (
        active != null &&
        active !== container.ownerDocument.body &&
        !container.contains(active)
      ) {
        return;
      }
      // The focus a transition moves keeps the modality of the input that
      // started it (interaction-modality INV1): after a key, or from a focus
      // that showed its indicator, the new target shows it too. After a tap
      // the browser's focus option keeps the target from matching
      // `:focus-visible` (iOS Safari otherwise rings a programmatic focus).
      // (The control that started a push is usually inert by now, so its
      // own state is read from the activation.)
      const isKeyboard =
        lastActivationRef.current?.isKeyboard === true ||
        isFocusVisible(active);
      const focusOptions: FocusOptions & {focusVisible?: boolean} = {
        preventScroll: true,
        ...(isKeyboard ? null : {focusVisible: false}),
      };
      if (kind === 'pop') {
        const hold = holdsRef.current.get(key)?.hold;
        holdsRef.current.delete(key);
        const source = sourcesRef.current.get(key);
        sourcesRef.current.delete(key);
        if (hold != null && hold.element.isConnected) {
          // Back to the control that pushed when it is in the row (a
          // trailing control of an interactive row), else the row itself.
          if (
            source instanceof HTMLElement &&
            source.isConnected &&
            hold.element.contains(source)
          ) {
            source.focus(focusOptions);
          } else {
            hold.focus(focusOptions);
          }
          return;
        }
        if (source instanceof HTMLElement && source.isConnected) {
          source.focus(focusOptions);
          return;
        }
      }
      // Else the screen now on top (the one pushed, or the one revealed): its
      // visible title, the large title while it shows, else the bar's.
      const target = revealed ?? key;
      const layers = layersOf(target);
      const large = layers?.largeTitleElement;
      (large != null && large.isConnected && !collapsedRef.current.has(target)
        ? large
        : layers?.titleElement
      )?.focus(focusOptions);
    },
    [layersOf],
  );

  // Runs the transition the last path change asked for.
  useLayoutEffect(() => {
    const transition = view.transition;
    // Screens gone from the stack. The row a pop reveals is the one in the
    // screen now on top, which pushed the first screen above it: it
    // deselects alongside the pop. Every other popped screen's row is out of
    // view (a multi-level pop drops the screens between) and is released at
    // once, as are the rows of screens a replaced path removed, before a
    // replaced path settles.
    const present = new Set(view.models.map(model => model.key));
    const revealedScreen = view.models.at(-1)?.key;
    let revealedKey: string | null = null;
    if (transition.kind === 'pop') {
      for (const [key, entry] of holdsRef.current) {
        if (!present.has(key) && entry.from === revealedScreen) {
          revealedKey = key;
        }
      }
    }
    for (const [key, entry] of holdsRef.current) {
      if (!present.has(key) && key !== revealedKey) {
        entry.hold.end(true);
        holdsRef.current.delete(key);
      }
    }
    if (transition.kind === 'none') {
      // Settle every screen where it rests.
      view.models.forEach((model, index) => {
        settle(model.key, index === view.models.length - 1 ? 'top' : 'covered');
      });
      backControl.animator.set({opacity: 1});
      backChevron.animator.set({opacity: 1});
      return;
    }
    const {top, under} = transition;
    const id = transition.id;
    const previous = runningRef.current;
    const wasRunning = previous != null && !previous.done;
    runningRef.current = {id, done: false};
    const release = releaseRef.current;
    releaseRef.current = null;
    pendingFocusRef.current = null;
    const hold =
      revealedKey == null
        ? null
        : (holdsRef.current.get(revealedKey)?.hold ?? null);
    const at = performance.now();
    let promise: Promise<boolean>;
    if (transition.kind === 'push') {
      if (!wasRunning) {
        setProgress(1, top, under);
      } else {
        // The covered screen continues from where it is; the new one (just
        // mounted, at rest) starts off screen as any push does.
        const values = layersAt(
          1,
          cardsRef.current?.clientWidth ?? 0,
          writingDirection(containerRef.current),
        );
        layersOf(top)?.card?.set({x: values.topX});
        layersOf(top)?.bar?.set({x: values.topX});
      }
      promise = animateProgress(
        0,
        top,
        under,
        springs.navigationPush,
        wasRunning ? undefined : programmaticVelocity('push'),
        false,
        'ride',
      );
      fadeBack('push', under);
    } else if (release != null) {
      // The row finishes deselecting on the cards' spring, from the swipe's
      // velocity.
      void hold?.animate(1, {
        spring: springs.navigationInteractivePopFinish,
        velocity: release.velocity,
        startTime: at,
      });
      promise = animateProgress(
        1,
        top,
        under,
        springs.navigationInteractivePopFinish,
        release.velocity,
        true,
        'rest',
        at,
      );
      fadeBack('pop', under, true);
    } else {
      if (!wasRunning) {
        setProgress(0, top, under, 'ride');
      }
      // UIKit's in-transition deselect (350 ms linear) from the pop's start.
      void hold?.animate(1, {startTime: at});
      promise = animateProgress(
        1,
        top,
        under,
        springs.navigationPop,
        wasRunning ? undefined : programmaticVelocity('pop'),
        false,
        'ride',
        at,
      );
      fadeBack('pop', under);
    }
    void promise.then(finished => {
      if (runningRef.current?.id !== id) {
        return;
      }
      runningRef.current = {id, done: true};
      if (!finished) {
        return;
      }
      if (transition.kind === 'pop') {
        setView(current =>
          current.transition.id === id ? {...current, leaving: null} : current,
        );
        hold?.end(true);
        if (under != null) {
          settle(under, 'top');
          pendingFocusRef.current = {
            popped: revealedKey ?? top,
            revealed: under,
          };
        }
      } else {
        if (under != null) {
          // The covered screen keeps its place under the top one.
          layersOf(under)?.card?.set({opacity: 1});
        }
        focusAfter('push', top);
      }
    });
    // Only a new transition restarts this; the layers are driven imperatively.
  }, [view.transition.id]);

  // The pop's focus return, after the commit that dropped the leaving screen
  // (the DOM's focus, the system this effect drives).
  useLayoutEffect(() => {
    const pending = pendingFocusRef.current;
    if (view.leaving == null && pending != null) {
      pendingFocusRef.current = null;
      focusAfter('pop', pending.popped, pending.revealed);
    }
  }, [view.leaving, focusAfter]);

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------

  const pathRef = useRef(path);
  pathRef.current = path;
  const onPathChangeRef = useRef(onPathChange);
  onPathChangeRef.current = onPathChange;
  const getKeyRef = useRef(getKey);
  getKeyRef.current = getKey;

  const api = useMemo<NavigationStackApi<T>>(
    () => ({
      push: (entry, options) => {
        const last = lastActivationRef.current;
        const source =
          options?.source !== undefined
            ? options.source
            : last != null && performance.now() - last.at < 1000
              ? last.target
              : null;
        pendingSourceRef.current = source;
        // In the same task as the activation, before the row's own press
        // release fades it: the row stays selected under the pushed screen.
        pendingHoldRef.current?.hold.end(true);
        pendingHoldRef.current = null;
        const hold = holdSelection(source);
        const before = pathRef.current;
        if (hold != null) {
          const index = before.length;
          const keyOf = (value: T, at: number) =>
            `screen-${getKeyRef.current ? getKeyRef.current(value, at) : at}`;
          // The row lives in the screen on top before this push.
          const from =
            index === 0 ? 'root' : keyOf(before[index - 1], index - 1);
          const pending = {key: keyOf(entry, index), hold, from};
          pendingHoldRef.current = pending;
          // An app that refuses or defers the push keeps its path: by the
          // next frame no push has taken the row, so it is released.
          const win = containerRef.current?.ownerDocument.defaultView;
          win?.requestAnimationFrame(() => {
            if (
              pendingHoldRef.current === pending &&
              pathRef.current === before
            ) {
              pendingHoldRef.current = null;
              pending.hold.end(true);
            }
          });
        }
        onPathChangeRef.current([...before, entry]);
      },
      pop: () => {
        if (pathRef.current.length > 0) {
          onPathChangeRef.current(pathRef.current.slice(0, -1));
        }
      },
      popToRoot: () => {
        if (pathRef.current.length > 0) {
          onPathChangeRef.current([]);
        }
      },
      depth,
    }),
    [depth],
  );

  // Record the source of a push, and the row it holds, on the screen it
  // pushed.
  useLayoutEffect(() => {
    if (view.transition.kind !== 'push') {
      return;
    }
    if (pendingSourceRef.current !== undefined) {
      sourcesRef.current.set(view.transition.top, pendingSourceRef.current);
      pendingSourceRef.current = undefined;
    }
    const pending = pendingHoldRef.current;
    if (pending != null) {
      pendingHoldRef.current = null;
      if (pending.key === view.transition.top) {
        holdsRef.current.get(pending.key)?.hold.end(true);
        holdsRef.current.set(pending.key, {
          hold: pending.hold,
          from: pending.from,
        });
      } else {
        pending.hold.end(true);
      }
    }
  }, [view.transition]);

  // Every row still held is released when the stack unmounts (the rows'
  // press controllers are the system these holds drive).
  useEffect(() => {
    const holds = holdsRef.current;
    return () => {
      pendingHoldRef.current?.hold.end(true);
      pendingHoldRef.current = null;
      for (const entry of holds.values()) {
        entry.hold.end(true);
      }
      holds.clear();
    };
  }, []);

  // The control a push starts from: the last click or key press in the stack
  // (the container's own capture handlers; nothing listens on the document).
  // A click a key produced (Enter or Space on a button) has no clicks counted.
  const rememberActivation = useCallback((event: SyntheticEvent) => {
    if (event.target instanceof Element) {
      lastActivationRef.current = {
        target: event.target,
        at: performance.now(),
        isKeyboard:
          event.type === 'keydown' ||
          (event.nativeEvent instanceof MouseEvent &&
            event.nativeEvent.detail === 0),
      };
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Back swipes
  // ---------------------------------------------------------------------------

  const canPop = depth > 0 && view.leaving == null;
  // What the touch layer (NavigationStackTouch.ts) moves: the swipes read
  // and drive the stack through this, each frame's values from the latest
  // render.
  const swipeStackRef = useRef<BackSwipeStack | null>(null);
  swipeStackRef.current = {
    width: () => cardsRef.current?.clientWidth ?? 0,
    direction: () => writingDirection(containerRef.current),
    screens: () => {
      const top = view.models.at(-1)?.key;
      const under = view.models.at(-2)?.key;
      return top == null || under == null ? null : {top, under};
    },
    grab: (top, under) => {
      // Grab whatever is moving: the top card's presentation value is the
      // progress to continue from.
      const width = cardsRef.current?.clientWidth ?? 0;
      const x = layersOf(top)?.card?.get('x') ?? 0;
      for (const key of [top, under]) {
        const layers = layersOf(key);
        layers?.card?.stop();
        layers?.dim?.stop();
        layers?.bar?.stop();
        layers?.barDim?.stop();
      }
      runningRef.current = null;
      return width > 0 ? Math.abs(x) / width : 0;
    },
    setProgress: (p, top, under) => {
      setProgress(p, top, under);
      // The pushing row deselects as far as the finger has popped.
      holdsRef.current.get(top)?.hold.setProgress(p);
    },
    progress: () => progressRef.current,
    release: (top, under, finish, velocity) => {
      const springBack = (v: number) => {
        const id = (runningRef.current?.id ?? 0) + 0.5;
        runningRef.current = {id, done: false};
        const at = performance.now();
        const hold = holdsRef.current.get(top)?.hold;
        // The row reselects on the same spring as the cards return.
        void hold
          ?.animate(0, {
            spring: springs.navigationInteractivePopFinish,
            velocity: v,
            startTime: at,
          })
          .then(arrived => {
            if (arrived) {
              hold.end(false);
            }
          });
        void animateProgress(
          0,
          top,
          under,
          // Released past its start (rubber-banded), UIKit's return.
          progressRef.current < 0
            ? springs.navigationInteractivePopReturn
            : springs.navigationInteractivePopFinish,
          v,
          true,
          'rest',
          at,
        ).then(finished => {
          if (runningRef.current?.id === id) {
            runningRef.current = {id, done: true};
          }
          if (finished) {
            settle(top, 'top');
            settle(under, 'covered');
          }
        });
      };
      if (!finish) {
        springBack(velocity);
        return;
      }
      // Commit the pop; the transition it triggers continues from here at
      // the finger's speed.
      const release = {velocity};
      const before = pathRef.current;
      releaseRef.current = release;
      onPathChangeRef.current(before.slice(0, -1));
      // An app that keeps its path (guarding unsaved edits, say) gets no
      // pop: by the next frame the release is still waiting, so the cards
      // spring back where they came from.
      const win = containerRef.current?.ownerDocument.defaultView;
      win?.requestAnimationFrame(() => {
        if (releaseRef.current === release && pathRef.current === before) {
          releaseRef.current = null;
          springBack(0);
        }
      });
    },
  };
  useBackSwipes(containerRef, cardsRef, swipeStackRef, {
    isEnabled: canPop && isInteractivePopEnabled,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const backLabelFor = (index: number) => {
    if (index === 0) {
      return null;
    }
    const previous = rendered[index - 1]?.element.props;
    // An empty title names nothing: the catalog's "Back" covers that too.
    return (
      previous?.backTitle ||
      previous?.title ||
      t('@astryx.navigationStack.back')
    );
  };
  // The top screen's back target; while a pop to the root runs, the leaving
  // screen's (its button fades out with it).
  const topBackLabel = backLabelFor(
    rendered.findIndex(model => model.key === topKey),
  );

  return (
    <NavigationStackContext.Provider value={api as NavigationStackApi}>
      <div
        ref={containerRef}
        role="region"
        aria-label={label}
        data-testid={testId}
        onClickCapture={rememberActivation}
        onKeyDownCapture={rememberActivation}
        {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.bar)}>
          {rendered.map(model =>
            model.key === topKey || model.key === underKey ? (
              <BarLayer
                key={model.key}
                model={model}
                registry={registry}
                isCovered={model.key !== topKey || view.leaving != null}
                isLargeTitleShown={
                  model.element.props.titleDisplayMode === 'large' &&
                  !collapsedTitles.has(model.key)
                }
              />
            ) : null,
          )}
          {topBackLabel != null ? (
            <BackControl
              label={topBackLabel}
              onBack={api.pop}
              isLeaving={view.leaving != null}
              control={backControl.ref}
              chevron={backChevron.ref}
            />
          ) : null}
        </div>
        <div ref={cardsRef} {...stylex.props(styles.cards)}>
          {rendered.map(model => (
            <CardLayer
              key={model.key}
              model={model}
              registry={registry}
              isTop={model.key === topKey && view.leaving == null}
              isCovered={model.key !== topKey || view.leaving != null}
              isHidden={model.key !== topKey && model.key !== underKey}
              onLargeTitleCollapse={onLargeTitleCollapse}
            />
          ))}
        </div>
      </div>
    </NavigationStackContext.Provider>
  );
}

NavigationStack.displayName = 'NavigationStack';
