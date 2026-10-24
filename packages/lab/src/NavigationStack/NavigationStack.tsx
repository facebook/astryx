// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavigationStack.tsx
 * @input React, StyleX, core's compositor animator and the UIKit table
 *   (`@astryxdesign/core/motion/experimental`), its gesture recognizers
 *   (`@astryxdesign/core/gestures/experimental`), navigationTransition.ts
 *   for the math
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
 * 10 % black dimming, and the bar contents cross-fading on the bar spring.
 * Every layer runs on the compositor (core's animator), so a busy main thread
 * does not stall a push or a pop. The back swipe is tracked 1:1 by the
 * recognizer (from the leading screen edge, or anywhere in the content as on
 * iOS 26) and released on the compositor: it finishes when progress plus
 * 0.35 s of velocity passes half the width, on a spring (0.3 s, ζ 0.85) that
 * starts at the finger's speed. A transition is never waited for: a pop
 * during a push turns it around from where it is, and a finger can grab a
 * moving card.
 *
 * The bar is iOS 26's (measured): Back is a 44 pt circle holding only the
 * chevron, named by the screen it returns to. It fades in on a push and out
 * on a pop; a back swipe leaves it alone until the pop finishes. A pushed
 * title appears in place while the covered one slides toward the leading
 * edge and is removed; on a pop, and under a finger, titles ride their
 * screens.
 *
 * In a browser tab the screen's leading edge is the browser's own back
 * swipe (iOS Safari keeps it): the stack's edge swipe runs only in a
 * home-screen web app (`navigator.standalone`), and the content swipe
 * ignores touches that start in that edge band.
 *
 * Reduce Motion follows UIKit's cross-fade (the animator's substitution):
 * the incoming screen fades in where it lands while the outgoing one fades
 * out, with no travel. The back swipe still tracks the finger.
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
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  resolveMotion,
  solveSpring,
  toSpring,
  uikit,
  useAnimator,
  type Animator,
  type MotionCurve,
  type SpringDescription,
} from '@astryxdesign/core/motion/experimental';
import {
  PanGestureRecognizer,
  ScreenEdgePanGestureRecognizer,
  readTouchPresentation,
  useGestureRecognizer,
  useTouchIdiom,
} from '@astryxdesign/core/gestures/experimental';
import {useTranslator} from '@astryxdesign/core/i18n';
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
  popVelocity,
  programmaticVelocity,
  progressFromTravel,
  shouldFinishPop,
} from './navigationTransition';
import {
  searchBarItemOpacity,
  searchClock,
  searchCurve,
  searchLargeTitleOpacity,
  searchLargeTitleReturnOpacity,
} from './navigationSearch';

const {navigation, springs, UIKIT_GESTURES} = uikit;

/**
 * The content swipe claims a sideways drag at the pan's own threshold, while
 * the browser can still be told no (it stops asking once its own slop has
 * passed), but moves nothing until UIKit's 27 px: the travel in between is
 * a dead zone.
 */
const CONTENT_CLAIM_PX = UIKIT_GESTURES.pan.hysteresis.value;
const CONTENT_DEAD_ZONE_PX = Math.max(
  0,
  navigation.contentPopHysteresis - CONTENT_CLAIM_PX,
);

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
  /**
   * A search field in the screen's bar area (UISearchController in a
   * navigation item): under the large title, scrolling with the content.
   * While `isActive`, the stack hands the bar to the field: the back button,
   * the titles and the bar items fade on the field's activation clock, and
   * the content rides up with the field into the bar.
   */
  search?: NavigationSearch;
  /** The screen's content; it scrolls on its own. */
  children?: ReactNode;
}

export interface NavigationSearch {
  /**
   * The field: a SearchField. The stack passes it `lift`, the distance it
   * rises into the bar, unless the element sets its own.
   */
  field: ReactNode;
  /** Whether search is active: the field's controlled `isActive`. */
  isActive: boolean;
  /**
   * Whether the field scrolls away with the content; false keeps it pinned
   * under the bar.
   * @default true
   */
  hidesWhenScrolling?: boolean;
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
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: colorVars['--color-background-body'],
  },
  // The bar overlays the screens, which scroll under it (as UIKit's content
  // extends under its bar), so a search field can rise into the bar's row.
  bar: {
    position: 'absolute',
    top: 0,
    insetInline: 0,
    height: BAR_HEIGHT,
    zIndex: 1,
  },
  barSearching: {
    pointerEvents: 'none',
  },
  barBackground: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colorVars['--color-background-surface'],
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  barLayer: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: spacingVars['--spacing-4'],
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
    outline: 'none',
  },
  // A block, so its rise can move it (an inline box takes no transform).
  barTitleText: {
    display: 'block',
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
    outline: 'none',
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
    position: 'absolute',
    inset: 0,
  },
  card: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    backgroundColor: colorVars['--color-background-body'],
  },
  scroller: {
    position: 'absolute',
    inset: 0,
    boxSizing: 'border-box',
    paddingTop: BAR_HEIGHT,
    scrollPaddingTop: BAR_HEIGHT,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    outline: 'none',
    // The screen scrolls vertically; a sideways drag is the back swipe's. A
    // horizontal scroller inside the content is its own scroll container
    // and keeps its native sideways scrolling.
    touchAction: 'pan-y pinch-zoom',
  },
  search: {
    paddingBottom: spacingVars['--spacing-2'],
  },
  searchPinned: {
    position: 'sticky',
    top: BAR_HEIGHT,
    zIndex: 1,
    backgroundColor: colorVars['--color-background-body'],
  },
  cardHidden: {
    contentVisibility: 'hidden',
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
 * One screen's animated layers: its card, the dimming over it, and its bar
 * items (the title moves; the back button and trailing items fade).
 */
interface ScreenLayers {
  card: Animator;
  dim: Animator;
  title: Animator;
  back: Animator;
  trailing: Animator;
  cardElement: HTMLElement | null;
  titleElement: HTMLElement | null;
  /** The large title above the content, for `titleDisplayMode="large"`. */
  largeTitleElement: HTMLElement | null;
  /** The bar title's text, hidden while the large title shows. */
  titleText: Animator;
  /** The large title, which rides up and fades as search activates. */
  largeTitle: Animator;
  /** The content under the search field, which rides up with it. */
  content: Animator;
  /** The search field's wrapper, for its lift. */
  searchElement: HTMLElement | null;
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
  lift,
}: {
  model: ScreenModel;
  registry: Registry;
  isTop: boolean;
  isCovered: boolean;
  isHidden: boolean;
  onLargeTitleCollapse: (key: string, isCollapsed: boolean) => void;
  /** How far the screen's search field rises into the bar, px. */
  lift: number;
}) {
  const props = model.element.props;
  const isLarge = props.titleDisplayMode === 'large';
  const search = props.search;
  const isSearching = search?.isActive === true;
  const largeTitleRef = useRef<HTMLHeadingElement | null>(null);
  // The large title has collapsed once it has scrolled entirely under the
  // bar: the bar's own title takes over. An observer, not a scroll handler:
  // it reports the crossing only.
  useEffect(() => {
    const title = largeTitleRef.current;
    const scroller = title?.parentElement ?? null;
    if (
      !isLarge ||
      title == null ||
      scroller == null ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => onLargeTitleCollapse(model.key, !entry.isIntersecting),
      // The screen scrolls under the bar: what is left below it.
      {
        root: scroller,
        rootMargin: `-${BAR_HEIGHT}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, [isLarge, model.key, onLargeTitleCollapse]);
  const largeTitle = useAnimator();
  const content = useAnimator();
  const largeTitleCallback = useCallback(
    (element: HTMLHeadingElement | null) => {
      largeTitle.ref(element);
      largeTitleRef.current = element;
      const entry = registry.get(model.key) ?? {};
      entry.largeTitleElement = element;
      registry.set(model.key, entry);
    },
    [largeTitle, registry, model.key],
  );
  const searchRef = useCallback(
    (element: HTMLDivElement | null) => {
      const entry = registry.get(model.key) ?? {};
      entry.searchElement = element;
      registry.set(model.key, entry);
    },
    [registry, model.key],
  );
  const card = useAnimator();
  const dim = useAnimator();
  useLayoutEffect(() => {
    const entry = registry.get(model.key) ?? {};
    entry.card = card.animator;
    entry.dim = dim.animator;
    entry.largeTitle = largeTitle.animator;
    entry.content = content.animator;
    registry.set(model.key, entry);
  }, [
    registry,
    model.key,
    card.animator,
    dim.animator,
    largeTitle.animator,
    content.animator,
  ]);
  // The field rises by the stack's measured lift, unless it sets its own.
  const field =
    search == null
      ? null
      : isValidElement<{lift?: number}>(search.field) &&
          search.field.props.lift === undefined
        ? cloneElement(search.field, {lift})
        : search.field;
  // Stable: a new callback each render would detach and reattach the
  // animator, restarting a running transition.
  const cardRef = useCallback(
    (element: HTMLDivElement | null) => {
      card.ref(element);
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
      {...stylex.props(styles.card, isHidden && styles.cardHidden)}>
      <div {...stylex.props(styles.scroller)}>
        {isLarge ? (
          <h1
            ref={largeTitleCallback}
            tabIndex={-1}
            aria-hidden={isSearching || undefined}
            {...stylex.props(styles.largeTitle)}>
            {props.title}
          </h1>
        ) : null}
        {search != null ? (
          <div
            ref={searchRef}
            data-navigation-search
            {...stylex.props(
              styles.search,
              search.hidesWhenScrolling === false && styles.searchPinned,
            )}>
            {field}
          </div>
        ) : null}
        <div ref={content.ref}>{props.children}</div>
      </div>
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
  backLabel,
  onBack,
  isCovered,
  isLargeTitleShown,
}: {
  model: ScreenModel;
  registry: Registry;
  backLabel: string | null;
  onBack: () => void;
  isCovered: boolean;
  isLargeTitleShown: boolean;
}) {
  // While the screen's search is active its bar items are the search
  // motion's (the stack's), and out of reach.
  const isSearchActive = model.element.props.search?.isActive === true;
  const titleText = useAnimator();
  // The bar's title is hidden while the screen's large title shows, and
  // fades in when the large title has scrolled under the bar.
  const wasShownRef = useRef<boolean | null>(null);
  const wasSearchingRef = useRef(false);
  useLayoutEffect(() => {
    const entry = registry.get(model.key) ?? {};
    entry.titleText = titleText.animator;
    registry.set(model.key, entry);
    if (isSearchActive) {
      wasSearchingRef.current = true;
      wasShownRef.current = isLargeTitleShown;
      return;
    }
    const target = {
      opacity: isLargeTitleShown ? 0 : 1,
      y: isLargeTitleShown ? navigation.inlineTitleRise : 0,
    };
    if (wasShownRef.current == null || wasSearchingRef.current) {
      // First layout, or a cancelled search: the title is back at once.
      titleText.animator.set(target);
    } else if (wasShownRef.current !== isLargeTitleShown) {
      titleText.animator.animate(target, {
        spring: springs.navigationBarElements,
      });
    }
    wasSearchingRef.current = false;
    wasShownRef.current = isLargeTitleShown;
  }, [
    registry,
    model.key,
    titleText.animator,
    isLargeTitleShown,
    isSearchActive,
  ]);
  const title = useAnimator();
  const back = useAnimator();
  const trailing = useAnimator();
  useLayoutEffect(() => {
    const entry = registry.get(model.key) ?? {};
    entry.title = title.animator;
    entry.back = back.animator;
    entry.trailing = trailing.animator;
    registry.set(model.key, entry);
  }, [registry, model.key, title.animator, back.animator, trailing.animator]);
  const titleRef = useCallback(
    (element: HTMLHeadingElement | null) => {
      title.ref(element);
      const entry = registry.get(model.key) ?? {};
      entry.titleElement = element;
      registry.set(model.key, entry);
    },
    [title, registry, model.key],
  );
  const props = model.element.props;
  return (
    <div
      data-navigation-bar={model.key}
      inert={isCovered || undefined}
      {...stylex.props(styles.barLayer, isCovered && styles.barLayerCovered)}>
      <div
        ref={back.ref}
        inert={isSearchActive || undefined}
        {...stylex.props(styles.barLeading)}>
        {backLabel != null ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            data-navigation-back
            {...stylex.props(styles.back)}>
            <span {...stylex.props(styles.backIcon)}>
              <Icon icon="chevronLeft" color="inherit" />
            </span>
          </button>
        ) : null}
      </div>
      <h2
        ref={titleRef}
        tabIndex={-1}
        aria-hidden={isLargeTitleShown || isSearchActive || undefined}
        {...stylex.props(styles.barTitle)}>
        <span ref={titleText.ref} {...stylex.props(styles.barTitleText)}>
          {props.title}
        </span>
      </h2>
      <div
        ref={trailing.ref}
        inert={isSearchActive || undefined}
        {...stylex.props(styles.barTrailing)}>
        {props.trailing}
      </div>
    </div>
  );
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

/** A web app opened from the home screen, where no browser back swipe exists. */
function isStandaloneWebApp(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (navigator as Navigator & {standalone?: boolean}).standalone === true
  );
}

/** Whether a touch starting at client x is in the leading screen-edge band. */
function startsInEdgeBand(x: number, direction: 'ltr' | 'rtl'): boolean {
  const band = UIKIT_GESTURES.screenEdgePan.edgeRegion.value;
  return direction === 'rtl'
    ? typeof window !== 'undefined' && x >= window.innerWidth - band
    : x <= band;
}

/**
 * The covered title on a push: it slides toward the leading edge on its own
 * spring and is removed when UIKit removes it. The removal is a step in the
 * same compositor animation, so it happens on time even while the main
 * thread is busy. Both values are motion roles, resolved under the title's
 * theme.
 */
function coveredTitleCurves(
  element: Element | null | undefined,
  from: number,
  to: number,
): {x: MotionCurve; opacity: MotionCurve} {
  const slide = solveSpring(
    toSpring(resolveMotion(element, springs.navigationCoveredTitle)),
    {from, to},
  );
  const removeAt =
    resolveMotion(element, navigation, 'coveredTitleRemovedMs') / 1000;
  const duration = Math.max(removeAt, slide.settleTime(0.01));
  return {
    x: {
      duration,
      at: t => slide.value(t),
      velocity: t => slide.velocity(t),
    },
    opacity: {
      duration,
      at: t => (t < removeAt ? 1 : 0),
      velocity: () => 0,
    },
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function writingDirection(element: Element | null): 'ltr' | 'rtl' {
  if (element == null || typeof window === 'undefined') {
    return 'ltr';
  }
  return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * A push/pop navigator: UINavigationController's transitions, back button
 * and back swipes, on the compositor.
 */
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
  const t = useTranslator();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [registry] = useState<Registry>(() => new Map());
  // Screens whose search is active, or settling back from a cancel: their
  // bar items belong to the search motion.
  const searchingRef = useRef(new Set<string>());
  // While a screen's search moves its large title, the large title's
  // crossings are kept aside and applied once the motion is over.
  const heldCollapsesRef = useRef(new Map<string, boolean | null>());
  // Screens whose large title has scrolled under the bar.
  const [collapsedTitles, setCollapsedTitles] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const collapsedRef = useRef(collapsedTitles);
  collapsedRef.current = collapsedTitles;
  const onLargeTitleCollapse = useCallback(
    (key: string, isCollapsed: boolean) => {
      const held = heldCollapsesRef.current;
      if (held.has(key)) {
        held.set(key, isCollapsed);
        return;
      }
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
  // The last control activated inside the stack: what a push it starts came
  // from.
  const lastActivationRef = useRef<{target: Element; at: number} | null>(null);
  // A pending push source handed to push(): applied to the new top.
  const pendingSourceRef = useRef<Element | null | undefined>(undefined);
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
  const underKey =
    view.transition.kind !== 'none'
      ? view.transition.under
      : (view.models.at(-2)?.key ?? null);

  // ---------------------------------------------------------------------------
  // Transition driver
  // ---------------------------------------------------------------------------

  const runningRef = useRef<{id: number; done: boolean} | null>(null);
  const progressRef = useRef(0);

  const layersOf = useCallback(
    (key: string | null) => (key == null ? null : (registry.get(key) ?? null)),
    [registry],
  );

  /** Writes the layers for progress p (a finger's frame; no animation). */
  const setProgress = useCallback(
    (p: number, top: string, under: string | null) => {
      const width = cardsRef.current?.clientWidth ?? 0;
      const direction = writingDirection(containerRef.current);
      const values = layersAt(p, width, direction);
      const topLayers = layersOf(top);
      const underLayers = layersOf(under);
      topLayers?.card?.set({x: values.topX});
      underLayers?.card?.set({x: values.underX});
      underLayers?.dim?.set({opacity: values.dim});
      // The titles ride their views; the back button and trailing items do
      // not follow a finger (they fade once a pop finishes).
      topLayers?.title?.set({x: values.topX, opacity: 1});
      underLayers?.title?.set({x: values.underX, opacity: 1});
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
      reducedMotion: 'crossfade' | 'keep',
      kind: 'push' | 'pop' | 'cancel',
    ): Promise<boolean> => {
      const width = cardsRef.current?.clientWidth ?? 0;
      const direction = writingDirection(containerRef.current);
      const values = layersAt(to, width, direction);
      const velocity =
        dp == null ? null : layerVelocities(dp, width, direction);
      const at = performance.now();
      const topLayers = layersOf(top);
      const underLayers = layersOf(under);
      const handles = [];
      // Reduce Motion: UIKit cross-fades. The animator substitutes the fade
      // for the travel; `crossfadeAs` says which card enters (fades in where
      // it lands) and which leaves (fades out in place).
      if (topLayers?.card) {
        handles.push(
          topLayers.card.animate(
            {x: values.topX},
            {spring, velocity: velocity ? {x: velocity.topX} : undefined},
            {at, reducedMotion, crossfadeAs: to === 0 ? 'entrance' : 'exit'},
          ),
        );
      }
      // Titles: a pushed title appears in place at once; the covered one
      // slides toward the leading edge on its own, faster spring. A popping
      // title rides out with its card and the revealed one rides in with
      // its card.
      if (topLayers?.title) {
        if (kind === 'push') {
          topLayers.title.set({x: 0, opacity: 1});
        } else {
          handles.push(
            topLayers.title.animate(
              {x: values.topX},
              {spring, velocity: velocity ? {x: velocity.topX} : undefined},
              {at, reducedMotion: 'instant'},
            ),
          );
        }
      }
      if (underLayers?.title) {
        if (kind !== 'push') {
          // A covered title a push was removing comes back with its screen.
          underLayers.title.set({opacity: 1});
        }
        handles.push(
          kind === 'push'
            ? underLayers.title.play(
                coveredTitleCurves(
                  underLayers.titleElement,
                  underLayers.title.get('x'),
                  values.underX,
                ),
                {at, reducedMotion: 'instant'},
              )
            : underLayers.title.animate(
                {x: values.underX},
                {
                  spring,
                  velocity: velocity ? {x: velocity.underX} : undefined,
                },
                {at, reducedMotion: 'instant'},
              ),
        );
      }
      if (underLayers?.card) {
        handles.push(
          underLayers.card.animate(
            {x: values.underX},
            {spring, velocity: velocity ? {x: velocity.underX} : undefined},
            {at, reducedMotion, crossfadeAs: to === 1 ? 'entrance' : 'exit'},
          ),
        );
      }
      if (underLayers?.dim) {
        handles.push(
          underLayers.dim.animate(
            {opacity: values.dim},
            {spring, velocity: velocity ? {opacity: velocity.dim} : undefined},
            {at},
          ),
        );
      }
      progressRef.current = to;
      return Promise.all(handles.map(async handle => handle.finished)).then(
        results => results.every(Boolean),
      );
    },
    [layersOf],
  );

  /**
   * The back button and trailing items of a push or a pop: the incoming
   * screen's fade in and the outgoing screen's fade out, each on its own
   * spring, from the moment the transition (or a finished swipe) commits.
   */
  const fadeItems = useCallback(
    (kind: 'push' | 'pop', top: string, under: string | null) => {
      const at = performance.now();
      const incomingKey = kind === 'push' ? top : under;
      const incoming = layersOf(incomingKey);
      const outgoing = layersOf(kind === 'push' ? under : top);
      // A screen returning with its search still active keeps its bar items
      // out of the way.
      const shown =
        incomingKey != null && searchingRef.current.has(incomingKey) ? 0 : 1;
      if (kind === 'push') {
        incoming?.back?.set({opacity: 0});
        incoming?.trailing?.set({opacity: 0});
      }
      incoming?.back?.animate(
        {opacity: shown},
        {spring: springs.navigationBackButton},
        {at},
      );
      outgoing?.back?.animate(
        {opacity: 0},
        {spring: springs.navigationBackButton},
        {at},
      );
      incoming?.trailing?.animate(
        {opacity: shown},
        {spring: springs.navigationBarElements},
        {at},
      );
      outgoing?.trailing?.animate(
        {opacity: 0},
        {spring: springs.navigationBarElements},
        {at},
      );
    },
    [layersOf],
  );

  /** Puts a screen's layers at rest: on top, covered, or off. */
  const settle = useCallback(
    (key: string, role: 'top' | 'covered') => {
      const layers = layersOf(key);
      const width = cardsRef.current?.clientWidth ?? 0;
      const direction = writingDirection(containerRef.current);
      const values = layersAt(0, width, direction);
      if (role === 'top') {
        const shown = searchingRef.current.has(key) ? 0 : 1;
        layers?.card?.set({x: 0, opacity: 1});
        layers?.dim?.set({opacity: 0});
        layers?.title?.set({x: 0, opacity: 1});
        layers?.back?.set({opacity: shown});
        layers?.trailing?.set({opacity: shown});
      } else {
        // A covered screen's title is removed once it has slid away.
        layers?.card?.set({x: values.underX, opacity: 1});
        layers?.dim?.set({opacity: 1});
        layers?.title?.set({x: values.underX, opacity: 0});
        layers?.back?.set({opacity: 0});
        layers?.trailing?.set({opacity: 0});
      }
    },
    [layersOf],
  );

  const focusAfter = useCallback(
    (kind: 'push' | 'pop', key: string) => {
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
      if (kind === 'pop') {
        const source = sourcesRef.current.get(key);
        sourcesRef.current.delete(key);
        if (source instanceof HTMLElement && source.isConnected) {
          source.focus({preventScroll: true});
          return;
        }
      }
      // The visible title: the large title while it shows, else the bar's.
      const layers = layersOf(key);
      const large = layers?.largeTitleElement;
      (large != null && large.isConnected && !collapsedRef.current.has(key)
        ? large
        : layers?.titleElement
      )?.focus({preventScroll: true});
    },
    [layersOf],
  );

  // Runs the transition the last path change asked for.
  useLayoutEffect(() => {
    const transition = view.transition;
    if (transition.kind === 'none') {
      // Settle every screen where it rests.
      view.models.forEach((model, index) => {
        settle(model.key, index === view.models.length - 1 ? 'top' : 'covered');
      });
      return;
    }
    const {top, under} = transition;
    const id = transition.id;
    const previous = runningRef.current;
    const wasRunning = previous != null && !previous.done;
    runningRef.current = {id, done: false};
    const release = releaseRef.current;
    releaseRef.current = null;
    let promise: Promise<boolean>;
    if (transition.kind === 'push') {
      if (!wasRunning) {
        setProgress(1, top, under);
      }
      fadeItems('push', top, under);
      promise = animateProgress(
        0,
        top,
        under,
        springs.navigationPush,
        wasRunning ? undefined : programmaticVelocity('push'),
        'crossfade',
        'push',
      );
    } else if (release != null) {
      fadeItems('pop', top, under);
      promise = animateProgress(
        1,
        top,
        under,
        springs.navigationInteractivePopFinish,
        release.velocity,
        'keep',
        'pop',
      );
    } else {
      if (!wasRunning) {
        setProgress(0, top, under);
      }
      fadeItems('pop', top, under);
      promise = animateProgress(
        1,
        top,
        under,
        springs.navigationPop,
        wasRunning ? undefined : programmaticVelocity('pop'),
        'crossfade',
        'pop',
      );
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
        if (under != null) {
          settle(under, 'top');
          focusAfter('pop', top);
        }
      } else {
        if (under != null) {
          // The covered screen keeps its place under the top one; its title
          // is removed.
          layersOf(under)?.card?.set({opacity: 1});
          layersOf(under)?.title?.set({opacity: 0});
        }
        focusAfter('push', top);
      }
    });
    // Only a new transition restarts this; the layers are driven imperatively.
  }, [view.transition.id]);

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------

  const pathRef = useRef(path);
  pathRef.current = path;
  const onPathChangeRef = useRef(onPathChange);
  onPathChangeRef.current = onPathChange;

  const api = useMemo<NavigationStackApi<T>>(
    () => ({
      push: (entry, options) => {
        const last = lastActivationRef.current;
        pendingSourceRef.current =
          options?.source !== undefined
            ? options.source
            : last != null && performance.now() - last.at < 1000
              ? last.target
              : null;
        onPathChangeRef.current([...pathRef.current, entry]);
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

  // Record the source of a push on the screen it pushed.
  useLayoutEffect(() => {
    if (
      view.transition.kind === 'push' &&
      pendingSourceRef.current !== undefined
    ) {
      sourcesRef.current.set(view.transition.top, pendingSourceRef.current);
      pendingSourceRef.current = undefined;
    }
  }, [view.transition]);

  // The control a push starts from: the last click or key press in the stack.
  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return undefined;
    }
    const remember = (event: Event) => {
      if (event.target instanceof Element) {
        lastActivationRef.current = {
          target: event.target,
          at: performance.now(),
        };
      }
    };
    container.addEventListener('click', remember, true);
    container.addEventListener('keydown', remember, true);
    return () => {
      container.removeEventListener('click', remember, true);
      container.removeEventListener('keydown', remember, true);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Back swipes
  // ---------------------------------------------------------------------------

  const canPop = depth > 0 && view.leaving == null;
  const swipeRef = useRef<{
    start: number;
    top: string;
    under: string;
    /** The pan's last velocities in widths/s, newest last (UIKit averages 3). */
    velocities: number[];
  } | null>(null);

  const onSwipe = useCallback(
    (recognizer: PanGestureRecognizer, deadZone: number) => {
      const width = cardsRef.current?.clientWidth ?? 0;
      const direction = writingDirection(containerRef.current);
      const top = view.models.at(-1)?.key;
      const under = view.models.at(-2)?.key;
      if (top == null || under == null) {
        return;
      }
      switch (recognizer.state) {
        case 'began': {
          // Grab whatever is moving: the top card's presentation value is
          // the progress to continue from.
          const x = layersOf(top)?.card?.get('x') ?? 0;
          const start = width > 0 ? Math.abs(x) / width : 0;
          for (const key of [top, under]) {
            const layers = layersOf(key);
            layers?.card?.stop();
            layers?.dim?.stop();
            layers?.title?.stop();
          }
          runningRef.current = null;
          swipeRef.current = {start, top, under, velocities: []};
          setProgress(start, top, under);
          break;
        }
        case 'changed': {
          const swipe = swipeRef.current;
          if (swipe == null) {
            return;
          }
          swipe.velocities.push(
            popVelocity(recognizer.velocity().x, width, direction),
          );
          const along =
            (direction === 'rtl' ? -1 : 1) * recognizer.translation().x;
          const travel = Math.max(0, along - deadZone);
          setProgress(
            progressFromTravel(
              swipe.start,
              (direction === 'rtl' ? -1 : 1) * travel,
              width,
              direction,
            ),
            swipe.top,
            swipe.under,
          );
          break;
        }
        case 'ended':
        case 'cancelled': {
          const swipe = swipeRef.current;
          swipeRef.current = null;
          if (swipe == null) {
            return;
          }
          const p = progressRef.current;
          // UIKit's release velocity: the mean of the pan's last three
          // velocities, the lift's own update included. A pause keeps it.
          let v = 0;
          if (recognizer.state === 'ended') {
            swipe.velocities.push(
              popVelocity(recognizer.velocity().x, width, direction),
            );
            const recent = swipe.velocities.slice(
              -navigation.interactivePopVelocitySamples,
            );
            v = recent.reduce((sum, value) => sum + value, 0) / recent.length;
          }
          if (recognizer.state === 'ended' && shouldFinishPop(p, v)) {
            // Commit the pop; the transition it triggers continues from here
            // at the finger's speed.
            releaseRef.current = {velocity: v};
            onPathChangeRef.current(pathRef.current.slice(0, -1));
          } else {
            const id = (runningRef.current?.id ?? 0) + 0.5;
            runningRef.current = {id, done: false};
            void animateProgress(
              0,
              swipe.top,
              swipe.under,
              springs.navigationInteractivePopFinish,
              v,
              'keep',
              'cancel',
            ).then(finished => {
              if (runningRef.current?.id === id) {
                runningRef.current = {id, done: true};
              }
              if (finished) {
                settle(swipe.top, 'top');
                settle(swipe.under, 'covered');
              }
            });
          }
          break;
        }
        default:
          break;
      }
    },
    [view.models, layersOf, setProgress, animateProgress, settle],
  );

  // The back swipes are UIKit idioms: elsewhere (Android's system back owns
  // both edges) back is the bar's button and the browser's history.
  const isIos = useTouchIdiom() === 'ios';
  // In a browser tab the screen's leading edge is the browser's own back
  // swipe (iOS Safari keeps it, AST-094 FR22): the edge swipe only runs in a
  // home-screen web app, and the content swipe ignores touches that start
  // in that edge band. Server render and first paint assume a tab.
  const [browserOwnsEdge, setBrowserOwnsEdge] = useState(true);
  const browserOwnsEdgeRef = useRef(true);
  useEffect(() => {
    const owns = !isStandaloneWebApp();
    browserOwnsEdgeRef.current = owns;
    setBrowserOwnsEdge(owns);
  }, []);
  const edge = useGestureRecognizer(
    containerRef,
    () =>
      new ScreenEdgePanGestureRecognizer({
        edges: ['leading'],
        // Published, so app code can relate to it (gestureNamed).
        name: 'NavigationStack.backSwipe',
      }),
    recognizer => onSwipe(recognizer, 0),
    {
      isEnabled: isIos && canPop && isInteractivePopEnabled && !browserOwnsEdge,
    },
  );
  // iOS 26's back swipe from anywhere in the content. It waits for the edge
  // swipe to fail, which a touch outside the edge band does at once.
  const content = useGestureRecognizer(
    cardsRef,
    () =>
      new PanGestureRecognizer({
        name: 'NavigationStack.contentBackSwipe',
        direction: 'right',
        hysteresis: CONTENT_CLAIM_PX,
        maximumNumberOfTouches: 1,
        shouldReceiveTouch: (_recognizer, touch) =>
          !(
            browserOwnsEdgeRef.current &&
            startsInEdgeBand(
              touch.startX,
              writingDirection(containerRef.current),
            )
          ),
      }).requireToFail(edge),
    recognizer => onSwipe(recognizer, CONTENT_DEAD_ZONE_PX),
    {isEnabled: isIos && canPop && isInteractivePopEnabled},
  );
  // The content swipe pops toward the trailing edge: rightward unless RTL.
  useLayoutEffect(() => {
    content.direction =
      writingDirection(containerRef.current) === 'rtl' ? 'left' : 'right';
  }, [content]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Search (UISearchController in the top screen's navigation item)
  // ---------------------------------------------------------------------------

  const barBackground = useAnimator();
  // How far each screen's search field rises into the bar's row, px, as
  // measured when it activates. The field reads it when `isActive` flips.
  const [lifts, setLifts] = useState<ReadonlyMap<string, number>>(
    () => new Map(),
  );
  const liftsRef = useRef(lifts);
  liftsRef.current = lifts;
  // Screens whose lift was measured for the activation under way.
  const freshLiftsRef = useRef(new Set<string>());
  // The lift each active search moved its screen by, and the bar title's
  // opacity before it: what a cancel returns to.
  const searchRestRef = useRef(
    new Map<string, {lift: number; titleOpacity: number}>(),
  );

  const measureLift = useCallback(
    (key: string): number | null => {
      const field = layersOf(key)?.searchElement;
      const container = containerRef.current;
      if (field == null || container == null) {
        return null;
      }
      // From the field's place to the bar's row, at the stack's top.
      return Math.max(
        0,
        Math.round(
          field.getBoundingClientRect().top -
            container.getBoundingClientRect().top,
        ),
      );
    },
    [layersOf],
  );

  const storeLift = useCallback((key: string, lift: number) => {
    freshLiftsRef.current.add(key);
    setLifts(current =>
      current.get(key) === lift ? current : new Map(current).set(key, lift),
    );
  }, []);

  // A field takes focus as it activates: measure its lift in that event, so
  // the commit that activates it hands the field the right distance.
  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return undefined;
    }
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const key = target
        ?.closest('[data-navigation-search]')
        ?.closest('[data-navigation-screen]')
        ?.getAttribute('data-navigation-screen');
      if (key == null || searchingRef.current.has(key)) {
        return;
      }
      const lift = measureLift(key);
      if (lift != null) {
        storeLift(key, lift);
      }
    };
    container.addEventListener('focusin', onFocusIn, true);
    return () => container.removeEventListener('focusin', onFocusIn, true);
  }, [measureLift, storeLift]);

  const holdCollapses = useCallback((key: string) => {
    if (!heldCollapsesRef.current.has(key)) {
      heldCollapsesRef.current.set(key, null);
    }
  }, []);
  const releaseCollapses = useCallback(
    (key: string) => {
      const held = heldCollapsesRef.current.get(key);
      heldCollapsesRef.current.delete(key);
      if (held != null) {
        onLargeTitleCollapse(key, held);
      }
    },
    [onLargeTitleCollapse],
  );

  /**
   * Hands the bar to the top screen's search field, or back. The field's own
   * motion is SearchField's, on the same clock: both start in the commit
   * that flips `isActive`.
   */
  const runSearch = useCallback(
    (key: string, isActive: boolean, isImmediate: boolean) => {
      const layers = layersOf(key);
      if (layers == null) {
        return;
      }
      // UIKit's hand-off is an iOS idiom: under a mouse, or a finger on
      // another platform, the field takes its place at once (SearchField's
      // own gate), and so does the bar.
      const isMoving = !isImmediate && readTouchPresentation().idiom === 'ios';
      const options = {reducedMotion: 'keep' as const};
      if (isActive) {
        let lift = freshLiftsRef.current.has(key)
          ? (liftsRef.current.get(key) ?? null)
          : null;
        if (lift == null) {
          lift = measureLift(key) ?? 0;
          storeLift(key, lift);
        }
        const rest = searchRestRef.current.get(key);
        const titleOpacity =
          rest?.titleOpacity ?? layers.titleText?.get('opacity') ?? 1;
        searchRestRef.current.set(key, {lift, titleOpacity});
        searchingRef.current.add(key);
        holdCollapses(key);
        // From where the parts are (a cancel may be under way).
        const p0 =
          lift > 0 ? clamp01(-(layers.content?.get('y') ?? 0) / lift) : 0;
        const from = {
          back: layers.back?.get('opacity') ?? 1,
          trailing: layers.trailing?.get('opacity') ?? 1,
          title: layers.titleText?.get('opacity') ?? 0,
          large: layers.largeTitle?.get('opacity') ?? 1,
          background: barBackground.animator.get('opacity'),
        };
        if (!isMoving) {
          layers.back?.set({opacity: 0});
          layers.trailing?.set({opacity: 0});
          layers.titleText?.set({opacity: 0});
          layers.largeTitle?.set({y: -lift, opacity: 0});
          layers.content?.set({y: -lift});
          barBackground.animator.set({opacity: 0});
          return;
        }
        // The field's clock, under its theme, read as the move starts.
        const clock = searchClock(layers.searchElement);
        const duration = clock.durationS * (1 - p0);
        const progress = (r: number) => p0 + (1 - p0) * r;
        const fade = (start: number) =>
          searchCurve(clock.ease, duration, r =>
            Math.min(start, searchBarItemOpacity(progress(r))),
          );
        const rise = searchCurve(
          clock.ease,
          duration,
          r => -lift * progress(r),
        );
        layers.back?.play({opacity: fade(from.back)}, options);
        layers.trailing?.play({opacity: fade(from.trailing)}, options);
        layers.titleText?.play({opacity: fade(from.title)}, options);
        // The bar has no background of its own on iOS 26; this one clears
        // the row before the field reaches it.
        barBackground.animator.play({opacity: fade(from.background)}, options);
        layers.largeTitle?.play(
          {
            y: rise,
            opacity: searchCurve(clock.ease, duration, r =>
              Math.min(from.large, searchLargeTitleOpacity(progress(r))),
            ),
          },
          options,
        );
        layers.content?.play({y: rise}, options);
        return;
      }
      const rest = searchRestRef.current.get(key);
      const lift = rest?.lift ?? 0;
      const finish = () => {
        searchingRef.current.delete(key);
        freshLiftsRef.current.delete(key);
        searchRestRef.current.delete(key);
        releaseCollapses(key);
      };
      // The back button, bar items and inline title are back at once.
      layers.back?.set({opacity: 1});
      layers.trailing?.set({opacity: 1});
      layers.titleText?.set({opacity: rest?.titleOpacity ?? 1});
      const p0 =
        lift > 0 ? clamp01(-(layers.content?.get('y') ?? 0) / lift) : 0;
      const clock = searchClock(layers.searchElement);
      const duration = clock.durationS * p0;
      if (!isMoving || duration <= 0) {
        layers.largeTitle?.set({y: 0, opacity: 1});
        layers.content?.set({y: 0});
        barBackground.animator.set({opacity: 1});
        finish();
        return;
      }
      const large0 = layers.largeTitle?.get('opacity') ?? 0;
      const background0 = barBackground.animator.get('opacity');
      const fall = searchCurve(clock.ease, duration, r => -lift * p0 * (1 - r));
      // The large title returns over the last 35 %; anything still showing
      // from an interrupted activation fades along the way.
      const returning = (start: number) =>
        searchCurve(clock.ease, duration, r =>
          Math.max(start * (1 - r), searchLargeTitleReturnOpacity(r)),
        );
      layers.largeTitle?.play({y: fall, opacity: returning(large0)}, options);
      layers.content?.play({y: fall}, options);
      void barBackground.animator
        .play({opacity: returning(background0)}, options)
        .finished.then(done => {
          if (done) {
            finish();
          }
        });
    },
    [
      layersOf,
      measureLift,
      storeLift,
      holdCollapses,
      releaseCollapses,
      barBackground,
    ],
  );

  // The top screen's search: hand the bar over or back as it flips, and
  // follow it when the top screen changes.
  const topModel = view.models.at(-1) ?? null;
  const topKeyNow = topModel?.key ?? null;
  const isTopSearching = topModel?.element.props.search?.isActive === true;
  const searchStateRef = useRef<{key: string | null; isActive: boolean} | null>(
    null,
  );
  useLayoutEffect(() => {
    const previous = searchStateRef.current;
    searchStateRef.current = {key: topKeyNow, isActive: isTopSearching};
    if (topKeyNow == null) {
      return;
    }
    if (previous == null) {
      // First layout: a search that starts active is in place at once.
      if (isTopSearching) {
        runSearch(topKeyNow, true, true);
      } else {
        barBackground.animator.set({opacity: 1});
      }
      return;
    }
    if (previous.key !== topKeyNow) {
      barBackground.animator.animate(
        {opacity: searchingRef.current.has(topKeyNow) ? 0 : 1},
        {spring: springs.navigationBarElements},
      );
      return;
    }
    if (previous.isActive !== isTopSearching) {
      runSearch(topKeyNow, isTopSearching, false);
    }
  }, [topKeyNow, isTopSearching, runSearch, barBackground]);

  const backLabelFor = (index: number) => {
    if (index === 0) {
      return null;
    }
    const previous = rendered[index - 1]?.element.props;
    return (
      previous?.backTitle ??
      previous?.title ??
      t('@astryx.navigationStack.back')
    );
  };

  return (
    <NavigationStackContext.Provider value={api as NavigationStackApi}>
      <div
        ref={containerRef}
        role="region"
        aria-label={label}
        data-testid={testId}
        {...stylex.props(styles.stack)}>
        <div
          {...stylex.props(styles.bar, isTopSearching && styles.barSearching)}>
          <div
            ref={barBackground.ref}
            aria-hidden
            {...stylex.props(styles.barBackground)}
          />
          {rendered.map((model, index) =>
            model.key === topKey || model.key === underKey ? (
              <BarLayer
                key={model.key}
                model={model}
                registry={registry}
                backLabel={backLabelFor(index)}
                onBack={api.pop}
                isCovered={model.key !== topKey || view.leaving != null}
                isLargeTitleShown={
                  model.element.props.titleDisplayMode === 'large' &&
                  !collapsedTitles.has(model.key)
                }
              />
            ) : null,
          )}
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
              lift={lifts.get(model.key) ?? 0}
            />
          ))}
        </div>
      </div>
    </NavigationStackContext.Provider>
  );
}

NavigationStack.displayName = 'NavigationStack';
