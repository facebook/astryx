---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-094
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [vjeux]
affects_architecture:
  [
    architecture:interaction-modality,
    architecture:theme-tokens,
    architecture:theme-authoring-contract,
  ]
affects_families: [family:buttons]
affects_contributing: []
affects_consumer_docs: []
---

# Touch presentations feel native system spec

## Intent

A person using an Astryx product on a phone or tablet gets controls, sheets,
menus, lists and navigation with native-feeling touch behavior: measured
physics, timings and gesture thresholds instead of desktop motion stretched to
a finger. This behavior is the default on every touch device, iOS and Android
alike, with no opt-in, and its motion keeps running at display rate while the
page's JavaScript is busy.

The behavior comes from one measured table. Its values are measured from UIKit
on a named reference release, UIKit on iOS 26.2 today; each number names the
release it was taken from, moving the reference to a newer release re-measures
the table, and differences on older releases are noted, not targeted. Android
touch devices get the same behavior. How touch behavior differs between the
platforms is being explored, and the table records a separate value only where
a measured, sourced difference exists.

## Non-goals

- Pointer (desktop) presentations. Their timing and easing stay with the
  theme's duration and easing tokens (`architecture:theme-tokens`).
- Platform-matched look and feel: glass versus material surfaces, glyphs and
  chrome. This record governs behavior only.
- WebKit embedded in a native app and the native Swift package. This record
  governs the web components themselves.
- Scroll physics. Scrolling stays native on every platform: on iOS an overflow
  area or the page is a UIKit scroll view already.
- Which components get a touch presentation, and when. Each component's own
  record owns its presentation.
- Equivalent internal implementations remain valid when they satisfy this
  contract. The modules, files and algorithms of the motion and gesture
  foundations belong to their architecture records.

## Requirements

### Physics

- **FR1 — Measured values, the same everywhere.** Every spring, duration,
  deceleration rate, rubber-band coefficient, gesture threshold and haptic
  moment a touch presentation uses MUST default to the measured native value
  for that use (FR2), and every component that plays the same motion or
  gesture MUST use the same value; a theme MAY override a motion role (FR4).
  No component uses a value of its own where a measured value exists. The same
  values apply on every touch platform; a platform gets a value of its own only
  where a measured, sourced difference exists (FR2).
- **FR2 — Every value has a source.** Each measured value MUST name its source next to it: Apple's documentation, a WWDC session, WebKit's own
  source where WebKit states it matches UIKit, or a measurement of UIKit on
  the iOS simulator naming the app, the iOS version, the method and the date.
  A value without one of these MUST be labelled a guess and name the
  measurement that will replace it. A decompilation of UIKit MAY aim a
  measurement and MUST NOT be a source.

  The values this record names for menus under a finger (FR29):

  | Value            | Default                                                                                         | Source                                                                                                                                           |
  | ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Open delay       | none in a fixed bar; 150 ms with no scroll inside a scroll view (the content-touch delay, FR11) | owner decision, 2026-10-24; UIKit on the iOS 26.2 simulator (iPhone 17 Pro), 2026-10-23, opened a held finger's menu 150–153 ms after touch-down |
  | Handoff distance | 10 pt (CSS px), straight-line, from the first position the open menu sees                       | measured: same setup; moves of (0, 9) and (7, 7) picked nothing, and (0, 10), (10, 0) and (9, 9) picked                                          |
  | Drift allowance  | 13 pt (CSS px) of movement on the trigger before the open                                       | unmeasured, needs a measurement or justification: a 12 pt move still opened the menu and a 14 pt move did not (OQ5)                              |

- **FR3 — Native physics.** Springs MUST follow UIKit's spring model
  (response and damping ratio, mass, stiffness and damping, and the release
  velocity), with overdamping clamped to critical damping wherever UIKit
  clamps it. A momentum coast MUST decay like a UIKit scroll view (0.998 per
  millisecond, 0.99 for the fast rate), a drag past an edge MUST resist with
  UIKit's rubber band `(1 − 1 ÷ (x·c ÷ d + 1))·d` with the coefficient its use
  measures (0.55 for a scroll view and a sheet), and a release MUST pick its
  rest point by projecting its velocity the way its UIKit counterpart does:
  with a deceleration rate, or with a measured projection time.
- **FR4 — Touch motion is themeable.** Every spring, duration and curve a
  touch presentation plays MUST be one of the theme motion roles below. The role's default value is
  its measured value (FR1, FR2), and a theme MAY override it through `motion`, at its root or
  in an adaptation rule. A component MUST read touch motion through these roles
  and MUST NOT play a literal. A theme value MUST reach the motion at its
  start, without changing how the motion runs (FR5, FR6). Gesture thresholds, the timings that decide who gets a touch (the
  content-touch delay, the scroll brake, momentum memory) and haptics are not
  motion: they stay internal measured values and are not public concepts (`spec:AST-002` FR3). This adds touch motion roles to the motion
  configuration of `architecture:theme-authoring-contract` and to
  `architecture:theme-tokens` beside the existing duration and easing tokens, whose rules are unchanged. It
  amends `spec:AST-057` for touch presentations: Item's swipe springs and
  durations become theme motion roles instead of constants in source, and its
  swipe travel is a transform the recognizer writes (FR9) instead of a custom
  property on the root (its FR2). It departs from the draft `design:motion` DR3
  wherever the native motion settles with an overshoot or stretches with a
  rubber band.

  | Kind     | Roles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
  | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Spring   | `springs.sheetPresent`, `springs.sheetDismiss`, `springs.sheetDismissSwipe`, `springs.sheetDetent`, `springs.sheetReleaseFast`, `springs.actionSheetPresent`, `springs.actionSheetDismiss`, `springs.alertPresent`, `springs.alertDismiss`, `springs.contextMenuLift`, `springs.contextMenuDismiss`, `springs.menuOpen`, `springs.menuClose`, `springs.banner`, `springs.keyboard`, `springs.navigationPush`, `springs.navigationPop`, `springs.navigationInteractivePopFinish`, `springs.navigationBarElements`, `springs.segmentedThumb`, `springs.switchThumbMove`, `springs.switchThumbStretch`, `springs.interactive`, `springs.bouncy`, `springs.smooth`, `springs.snappy`, `springs.uikitDefault`, `springs.uikitSpringDuration`, `springs.swiftUIDefault`, `springs.swiftUISpring`, `scroll.bounce`, `scroll.paging.snap` |
  | Duration | `timing.press.highlightInMs`, `timing.press.highlightOutMs`, `timing.press.buttonReleaseMs`, `timing.press.flashMs`, `timing.implicitAnimationMs`, `timing.keyboardNotificationMs`, `timing.navigationBarHideShowMs`, `navigation.transitionMs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  | Curve    | `timing.curves.caDefault`, `timing.curves.easeIn`, `timing.curves.easeOut`, `timing.curves.easeInOut`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

### Motion

- **FR5 — Motion runs on the compositor.** Every release and every
  programmatic animation of a touch presentation MUST animate `transform`, the
  individual `translate`, `scale` and `rotate` properties, or `opacity`
  (a dialog's `::backdrop` included) through Web Animations that the browser
  runs off the main thread,
  and MUST keep advancing at display rate through a main-thread block. It MUST
  NOT animate layout properties, and MUST NOT step a frame from script when the
  compositor can run the curve.
- **FR6 — Motion is interruptible.** A finger MUST be able to catch any
  animation mid-flight at the value on screen. That value and its velocity
  MUST come from the curve, not from a layout read. A new target MUST keep the
  current velocity, and a release MUST hand its velocity to the spring that
  follows.
- **FR7 — Exits animate as the native counterpart's do.** A touch
  presentation MUST play the exit its UIKit counterpart plays, on every touch
  platform. FR8 governs their reduced-motion form. Each overlay's own record states its
  exit, since members own their animation (`family:overlay-dismissal` AV6).
- **FR8 — Reduce Motion.** Under reduced motion, touch presentations follow
  `design:reduced-motion` DR2 and DR4.

### Gestures

- **FR9 — A finger is tracked off the render path.** A drag MUST follow the
  finger with one visual update per move, with no component render per move
  and no layout read after the gesture begins.
  Native scrolling MUST be used only where the component is a scroll view
  (lists, scroll areas, the page). A component MAY track a finger with native
  scroll snapping only with simulator evidence that it tracks through a
  main-thread block, ends on the native release curve, ends correctly when the
  finger lifts during a block, and lets a finger catch the content mid-flight.
- **FR10 — A second finger never breaks the first.** A second finger MUST NOT
  cancel or redirect a drag a recognizer has claimed. Page pinch-zoom MUST stay
  the browser's whenever no pinch recognizer claims the fingers and no drag is
  claimed (WCAG 1.4.4). A menu's press-tracking slide keeps
  `module:DropdownMenu/useMenuPress` FR4: a second pointer or `pointercancel`
  ends its gesture with nothing acting, which keeps the page zoomable over an
  open menu.
- **FR11 — Two press profiles.** Press feedback MUST follow one of two native
  profiles. A control (UIControl) highlights on touch-down outside scroll
  views, keeps tracking within its expanded bounds (70 pt), turns its highlight
  off and on as the finger drags out and back, and activates on a lift inside.
  A cell (a table or collection cell) highlights 150 ms after touch-down inside
  a scroll view, drops the highlight when the scroll wins, and activates on a
  lift inside it with no scroll. A control is inside a scroll view when it sits in a scrollable container,
  or in scrolling page content with no fixed ancestor; a control in a fixed
  bar (a top bar, a tab bar, a toolbar) is not. A control inside a scroll view
  takes the same 150 ms delay before its highlight and then follows its
  control profile; the 150 ms delay applies only inside scroll views. A control whose own record keeps its press through a drag
  keeps it: Slider's overlay stays on the dragged thumb (`design:user-states`
  DR4). On every touch platform this amends
  `design:user-states` DR1 (the pressed overlay during a hold) and DR3 (the
  selected SegmentedControl item's held surface) for touch presentations, the press treatment of `family:buttons`, and the last sentence of
  `module:DropdownMenu/useMenuPress` FR6 (menu rows paint `:active` only under
  `(hover: hover)`): under a finger, menu rows take the cell profile. FR6's
  rule that at most one row of a menu is lit still holds, so a finger that
  slides from one row to another lights only the row under it.
- **FR12 — Long press and rubber band are per use.** A long press MUST use the
  thresholds its UIKit counterpart uses: 0.5 s and 10 pt for a plain long
  press, the measured values for context menus and menus. A rubber band MUST
  use the coefficient its use measures.
- **FR13 — One rule for the touch presentation.** A touch presentation
  applies under a coarse primary pointer, and only after hydration: a server
  render and the hydrating render produce the pointer presentation
  (`spec:AST-013` FR9). Where a presentation also depends on size, compact is
  governed by `spec:AST-012` FR9 and `architecture:public-component-api`
  INV17. A presentation asks for exactly the conditions its own record names
  (the date and time sheet asks for the pointer only, `spec:AST-043` FR1).
- **FR14 — Nested scrolling follows the native rule.** Who gets a drag that
  starts inside a scroll area MUST be decided once, when the drag begins. If
  the area sits at its edge and the drag moves toward that edge, the
  surrounding surface (a sheet) takes the drag; otherwise the area keeps it for
  the whole gesture and rubber-bands at its edge. The drag MUST NOT change
  hands midway, in either direction. This amends `spec:AST-025` FR14 (scroll
  chaining by default) for touch presentations on every touch platform.
- **FR15 — Recognizers arbitrate like UIKit's.** Recognizers that see the
  same touch sequence MUST be exclusive by default: the first to recognize
  wins and the others fail, unless both allow simultaneous recognition. A
  recognizer that requires another to fail MUST hold its recognition until
  that one fails, and MUST fail if that one recognizes. When several recognize
  on the same event, the innermost element's recognizer MUST win.
- **FR16 — Gestures keep the event clock.** Recognizers MUST read time from the
  input events' timestamps. Durations (a long press, the interval between
  taps) MUST be deadlines on that clock, so a blocked main thread delays the
  report and never the moment reported.
- **FR17 — Native readings.** A recognizer's thresholds MUST follow UIKit's
  measured values (FR1, FR2). A pan begins at 10 pt of travel on either axis,
  and its translation excludes that travel. Release velocity is governed by
  `spec:AST-100`.
- **FR18 — `touch-action` leaves the browser the rest.** An element with touch
  recognizers MUST get a `touch-action` that leaves the browser exactly what
  its recognizers do not use: the other axis for an axis-limited pan or swipe,
  `manipulation` for taps and long presses, everything for a one-way pan or a
  pan that shares its axis with native scrolling. `pinch-zoom` MUST stay
  unless a pinch or rotation recognizer is attached.
- **FR19 — Claims are made in time and only by an owner.** Recognizers attach
  only under a coarse pointer; on a fine pointer no recognizer attaches and no
  touch listener is registered (FR24). A recognizer that begins MUST claim its
  touches by cancelling `touchmove` through a non-passive listener on its
  element. A `touchmove` of a touch no recognizer owns MUST NOT be cancelled. A
  recognizer that competes with native scrolling MUST decide within 10 px of
  travel, before the browser commits to the scroll. Only an element with a
  recognizer that must claim mid-gesture registers that blocking listener; an
  element whose recognizers decide only at the lift keeps its `touchmove`
  listener passive, and its `touchend` listener stays cancelable so the
  gesture can cancel the click (FR21). Known limit: a native scroll that starts on an element with a
  blocking listener waits for a free main thread in iOS Safari and Chromium.
  That is never worse than UIKit, whose scrolling stops on a busy main thread,
  and a passive listener, or one added at `touchstart`, would hand diagonal
  drags to the scroll.
- **FR20 — The browser can take a touch.** `pointercancel`, an uncancelable
  `touchmove`, or a native scroll under the touch MUST count as the browser
  taking the touch: possible recognizers that share it fail, active ones are
  cancelled, and the view's press is cancelled without a release.
- **FR21 — Clicks follow the gesture.** When a gesture takes a touch, its
  `touchend` MUST be cancelled, and no click or compatibility mouse event
  reaches the page. A click held for a recognizer that may still recognize (a
  tap that a double tap may claim) MUST be replayed on its target if that
  recognizer fails. Activation with `detail === 0` (keyboard, assistive
  technology) MUST always pass. A tap MUST NOT wait for the browser's
  double-tap delay.
- **FR22 — The platform keeps its edge gestures.** iOS Safari's back swipe
  from the screen edge and Android's system back gesture MUST stay the
  browser's and the system's; a touch presentation never overrides them.

### Menus and popovers under a finger

FR26–FR30 apply to a menu that carries the press model of
`module:DropdownMenu/useMenuPress` (DropdownMenu, ContextMenu and their
sub-menus) when a finger or pen drives it; FR31–FR33 apply to anchored menus
and to Popover under a finger. A mouse keeps today's behavior.

- **FR26 — The lift decides.** A menu row MUST act when the finger lifts over
  it, never because the press began on it; a press that never left its row is
  a tap and acts on that row. One gesture acts at most once: the browser's
  click for that gesture acts on nothing.
- **FR27 — The highlight follows the finger.** While a finger is held in an
  open menu, the lit row MUST be the enabled row under it, and nothing is lit
  over a divider, a heading, a disabled row or outside the menu. At most one
  row is lit; the row the press began on keeps no pressed look once the
  finger leaves it (FR11).
- **FR28 — A lift outside keeps the menu open.** A finger that began inside
  a menu and lifts outside it MUST act on nothing and leave the menu open. A
  cancelled touch, a second finger, or the window losing focus ends the
  gesture: nothing acts and the lit row clears.
- **FR29 — Opening on press, and the opening finger's handoff.** Under a
  finger, a menu's trigger in a fixed bar MUST open its menu as the finger
  presses. A trigger inside a scroll view (FR11) MUST open it once the 150 ms
  content-touch delay has passed with no scroll; a scroll that starts first
  takes the touch and nothing opens. Before the open, the finger may move no
  more than the drift allowance (FR2). After an open under a held finger,
  nothing is lit and a lift acts on nothing until the finger has travelled
  the handoff distance from the first position the open menu sees; from then
  on FR26–FR28 apply. `presentation="popover"` keeps today's open on a tap;
  the default is unset (`architecture:public-component-api` INV16). The
  delay and distances are internal values, not props (`spec:AST-002` FR3).
- **FR30 — Edge autoscroll under a finger.** While a finger is held in a menu
  that scrolls, resting near its top or bottom edge MUST scroll the menu
  toward that edge, and the lit row MUST follow the row now under the finger.
  The scrolling stops when the finger leaves the edge, the menu reaches its
  end, or the gesture ends.
- **FR31 — Menus and popovers grow from their trigger and shrink back.**
  Under a finger, on every touch device, an anchored menu or a Popover MUST
  open by growing out of its trigger and close by shrinking back into it, on
  its theme motion roles (FR4; a menu on `springs.menuOpen` and
  `springs.menuClose`). The shrink plays in full after the surface has
  closed. This is its exit under FR7 (`family:overlay-dismissal` AV6); under
  reduced motion FR8 applies. A menu or popover presented as a bottom sheet
  follows the sheet instead.
- **FR32 — A pan outside dismisses.** Under a finger, an open anchored menu
  or Popover MUST close as a touch outside it begins to pan, and at the lift
  of a tap or hold outside it. A pinch stays available over it: its surface
  never takes `touch-action: none`, so the page keeps zooming (FR10, FR18;
  WCAG 2.2 SC 1.4.4). Listening for that outside touch costs nothing once it
  ends (FR24).
- **FR33 — A ContextMenu under a finger.** With a finger or pen, the long
  press that opens a ContextMenu MUST NOT close it at the lift, and a press
  outside it follows FR32. On every touch device, a ContextMenu that a held
  finger opens on a block trigger MUST lift the trigger above the page and
  show the menu beside it, with no row lit. A tap outside closes the menu and
  reaches nothing beneath it, and closing returns the trigger to its place.
  Under reduced motion FR8 applies. An inline trigger keeps today's menu, and
  a menu presented as a bottom sheet follows the sheet.

### Release decisions

- **FR34 — One decision, at the release.** A drag that can commit an action
  MUST decide once, when the finger lifts: if its projected travel (the
  travel so far plus the release velocity times the use's projection, FR3)
  reaches the use's commit point, the action commits; otherwise the surface
  springs back. The decision MUST NOT change while the surface settles. The
  same rule backs dismissing a BottomSheet, a Toast or a Lightbox, popping a
  NavigationStack, completing a row swipe, and dismissing the keyboard; each
  use's commit point and projection are measured values (FR1, FR2).
- **FR35 — Moving back cancels.** A release whose velocity points back
  toward the start MUST cancel, whatever the travel so far.
- **FR36 — The settle continues the finger.** The commit or the spring-back
  MUST start at the release velocity (FR6). Under reduced motion it follows
  `design:reduced-motion` DR2.
- **FR37 — The action never needs a drag.** Every action a drag commits MUST
  also be reachable without a drag, by keyboard and by mouse
  (`architecture:interaction-modality` INV4).
- **FR38 — Release velocity.** The velocity FR34–FR36 read is governed by
  `spec:AST-100`.

### Haptics

- **FR23 — Haptics where the native counterpart plays them.** A touch
  presentation MUST play a haptic only at the moments its UIKit counterpart
  does. In iOS Safari the only haptic a page can produce is a light impact from
  a real tap landing on a `<label>` or a switch checkbox; a moment UIKit marks
  mid-drag or after the lift has no haptic there, and the component records
  that gap. `navigator.vibrate` stands in where the platform offers it.

### Resources and compatibility

- **FR24 — Touch work costs nothing where it is not used.** Under a fine
  pointer, and while a touch presentation is disabled, no touch-only listener,
  observer or timer is active. The number of `document`- or `window`-level
  touch listeners MUST NOT grow with the number of component instances, a
  repeated row or cell adds no touch observer of its own, and nothing
  touch-related remains after the last instance unmounts
  (`architecture:react-component-runtime` INV5, INV7).
- **FR25 — A moved default keeps a way back.** Where a touch presentation
  moves a released default, such as Selector's `adaptive` presentation policy,
  the way back and its release note are governed by
  `architecture:public-component-api` INV16 and `spec:AST-017` DEC-23 and FR3.
  This replaces `component:Selector` DEC-1's width-and-pointer query with the
  FR13 rule for `adaptive`.

### Platform support

- Supported engines: Astryx's supported browsers (`spec:AST-013`) with touch
  input, on iOS and Android. UIKit on the reference release is the parity
  reference, not a support floor; an older iOS Safari gets the same behavior
  wherever its engine supports it, and Android Chrome gets the same behavior.
  This amends `spec:AST-013` FR3 with an explicit Android Chrome support row
  for touch presentations.
- Unsupported behavior: haptics outside the moments FR23 allows. Where an
  engine cannot run a curve on its compositor, the animation still plays and
  still ends on its committed state.
- Browser evidence: the busy-main-thread proof and no layout or paint during
  the animation in Chromium with phone emulation, the busy-main-thread proof
  in WebKit, curves sampled by seeking the running animations, iOS simulator
  recordings for every claim about the reference values, and real-device
  evidence for every claim about iOS Safari and Android Chrome behavior
  (`spec:AST-013` FR10).

## Current-state impact

- `architecture:theme-tokens` and `architecture:theme-authoring-contract`:
  touch motion roles join the motion configuration, with the table's values as
  their defaults; INV3 and the duration and easing tokens are unchanged (FR4).
- `architecture:interaction-modality`: the touch-presentation conditions
  (FR13) sit beside the shared modality state; its invariants are unchanged.
- `architecture:react-component-runtime`: FR24 states the caller-visible
  outcome of INV5 and INV7 for touch work; both are unchanged.
- `family:buttons`: the control and cell press profiles (FR11).
- Each overlay member's own record (Dialog, BottomSheet, Drawer, Popover, the
  menus): its touch exit and its Reduce Motion cross-fade (FR7, FR8), since
  members own their animation (`family:overlay-dismissal` AV6).
- `spec:AST-057`: Item's swipe springs and durations become theme motion roles,
  and its swipe travel is a recognizer-written transform (FR4, FR9).
- `design:reduced-motion` owns the reduced-motion rule FR8 applies.
- `component:Selector` DEC-1: `adaptive` resolves through the FR13 touch rule
  (a coarse pointer and the `spec:AST-012` FR9 compact definition) instead of
  its own width-and-pointer query, with `presentation` as the way back (FR25).
- `module:DropdownMenu/useMenuPress`: its finger rules (FR1–FR3, FR6, FR7
  and FR9 under a finger) are stated here (FR26–FR30); FR6's last sentence
  gives way to the cell press profile (FR11); its mouse rules (FR8 and the
  mouse halves of FR1–FR3) and its non-gesture rules stay in the module.
- `component:DropdownMenu`, `component:ContextMenu` and `component:Popover`:
  under a finger they follow FR26–FR33 as each applies.
- BottomSheet, Toast, Lightbox, NavigationStack, row swipes and keyboard
  dismissal: a drag that commits follows FR34–FR38.
- `spec:AST-100` owns release velocity, which FR17 reads.
- `design:user-states` DR1 and DR3, `spec:AST-025` FR14 and `spec:AST-013` FR3
  each carry an amendment for touch presentations (FR11, FR14, Platform
  support); `design:motion` DR3 and DR5 (draft) are departed from or met as
  FR4 and FR8 state.
- Consumer docs: none until a component ships its touch presentation; each
  component documents its own, including the `presentation` value that keeps
  the released surface (FR25).

## Verification

| Contract        | Verification                                                                                                                   | Representative states                                                                                                                                                                   | Mutation or failure expectation                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2        | Value check over every measured value and its uses                                                                             | every value; a guess and its measurement task; a platform-specific value; two components playing the same motion                                                                        | an unsourced value, an unknown source kind, a guess without a listed measurement, an unsourced platform split, or two values for one use fails                                                            |
| FR3             | Unit tests of the spring, decay, rubber band and projection math against an independent integration and values read from UIKit | under-, critically and overdamped springs; release velocities; both rates; overscroll depths                                                                                            | changing a formula or a constant breaks the agreement with UIKit's values                                                                                                                                 |
| FR4             | Theme unit tests and a browser test of a themed spring                                                                         | no theme (table defaults); a theme writing a spring, a duration and a curve, at its root and in an adaptation                                                                           | a role that ignores the theme, a literal played in place of a role, or a default that differs from the table fails                                                                                        |
| FR5             | Browser proof: an animation keeps advancing frame by frame through a 1 s main-thread block, with no layout or paint per frame  | Chromium phone emulation; WebKit                                                                                                                                                        | a script-driven or layout-animating implementation freezes or lays out                                                                                                                                    |
| FR6             | Unit and browser tests catching an animation mid-flight and retargeting it                                                     | catch at peak velocity; retarget with a new spring                                                                                                                                      | a layout read, a jump, or a lost velocity fails                                                                                                                                                           |
| FR7, FR8        | Component browser tests and storyboards with and without Reduce Motion                                                         | entrance, exit, move; a drag and its lift under Reduce Motion                                                                                                                           | a missing exit, any travel, scale or spring under Reduce Motion, or an opacity fade over 200 ms fails                                                                                                     |
| FR9, FR10       | Recognizer unit tests on synthetic streams and browser tests with real touch input                                             | drag, second finger, pinch, page zoom, main-thread block                                                                                                                                | a second finger that breaks a drag, or a blocked page pinch, fails                                                                                                                                        |
| FR11, FR12      | Press and long-press tests on synthetic streams with explicit timestamps                                                       | inside and outside a scroll view; drag out and back; a menu row under a finger                                                                                                          | the wrong profile's timing fails                                                                                                                                                                          |
| FR13            | Resolver unit tests and a server-render test                                                                                   | coarse and fine pointer; narrow, wide and short; server render; hydrating render                                                                                                        | a component that answers the conditions differently, or a touch presentation in the server or hydrating render, fails                                                                                     |
| FR14            | Browser tests of a sheet over a scrolled list                                                                                  | scrolled and at its top                                                                                                                                                                 | a midway handoff fails                                                                                                                                                                                    |
| FR15–FR17       | Recognizer unit tests on synthetic streams with explicit timestamps                                                            | exclusive, simultaneous, require-to-fail, nested; a blocked main thread; a pan at 10 pt per axis                                                                                        | a wrong winner, a late deadline, or a translation that keeps the hysteresis fails                                                                                                                         |
| FR18–FR22       | Browser tests with real touch input                                                                                            | per-axis pans beside native scrolling, page zoom, cancelled touches, clicks after taps, keyboard activation                                                                             | a ghost click, a blocked scroll or zoom, or a cancelled unowned touchmove fails                                                                                                                           |
| FR23            | Haptics tests on the recorded moments                                                                                          | tap, drag, lift                                                                                                                                                                         | a haptic outside a native moment fails                                                                                                                                                                    |
| FR24            | Resource tests counting listeners, observers and timers                                                                        | fine pointer; coarse pointer enabled and disabled; many instances; unmount                                                                                                              | a touch listener on a fine pointer, a per-instance `document` or `window` listener, or a leak fails                                                                                                       |
| FR25            | Component tests of each moved default and its `presentation` value                                                             | default; `presentation` set to the released surface                                                                                                                                     | a moved default that `presentation` does not restore, or a public threshold, fails                                                                                                                        |
| FR26–FR28, FR30 | Menu press tests on synthetic touch streams and a real-Chromium touch test                                                     | a slide from one row to another; a lift outside; a cancel; a second finger; edge autoscroll                                                                                             | an act on the press-start row, two acts for one gesture, a lift outside that closes, or a lit row after a cancel fails                                                                                    |
| FR29            | Trigger tests with explicit timestamps                                                                                         | a press in a fixed bar; a press in scrolling content held 149 and 150 ms; a scroll before 150 ms; a drift of 12 and 14 pt; moves before and after the handoff; `presentation="popover"` | a fixed-bar press that waits, a scroll-view open before 150 ms or after a scroll, an open past the drift allowance, a lift that acts before the handoff, or a `popover` trigger that opens on press fails |
| FR31–FR33       | Browser tests and storyboards under a finger                                                                                   | a menu, a Popover and a ContextMenu lift: open, close, a pan outside, a tap outside, a pinch over the surface; a mouse                                                                  | a surface that does not grow from and shrink into its trigger, a pan outside that leaves it open, a blocked pinch, a tap outside that reaches the page, or a changed mouse path fails                     |
| FR34–FR38       | Release tests on synthetic touch streams with explicit timestamps, per use                                                     | below and past each commit point; a flick that projects past it; a slow drag past it; a release moving back; Reduce Motion; keyboard and mouse paths                                    | a decision that changes mid-settle, a release moving back that commits, a settle that does not start at the release velocity, or an action with no keyboard or mouse path fails                           |
| all             | iOS simulator: the UIKit reference capture and the same gesture in Safari; real iOS Safari and Android Chrome devices          | per component                                                                                                                                                                           | an unmatched curve or timing is a parity defect                                                                                                                                                           |

## Decision log

### DEC-1 — Touch presentations feel native by default

**Reference:** `spec:AST-094/DEC-1`
**Decider:** pending owner approval

Every touch device gets one native-feeling touch behavior by default, without
an opt-in, because the people using it already know that behavior from every
other app on their phone. The behavior's values are measured from UIKit, not
remembered: a number enters the table only with a citable source, and Android
touch devices get the same values until a measured, sourced difference is
recorded.

The table supplies the defaults and a theme may retune any motion role (FR4):
a product can soften a spring without forking a component, and the measured
values stay the ones it starts from. Platform-matched look and feel is not part
of this decision.

### DEC-2 — Recognizers track fingers; the compositor plays releases

**Reference:** `spec:AST-094/DEC-2`
**Decider:** pending owner approval

On iOS, native scroll snapping keeps tracking through a main-thread block,
but a finger that lifts during the block finishes on WebKit's own snap
physics rather than UIKit's curve, a finger cannot catch the content
mid-spring, and full-viewport hit testing breaks surfaces that leave the page
usable around them. Tracking therefore runs in the recognizers, and every
release runs as a compositor animation of the measured curve (FR5, FR9).

## Open questions

- **OQ1 — Scroll view bounce-back curve.** What curve brings a scroll view
  back from an overscroll? It is not a single spring from rest; the rubber
  band itself is settled. (`checkable`)
- **OQ2 — Rotation threshold.** What rotation starts a rotation gesture? No
  stored threshold is readable, and the simulator cannot script two-finger
  rotation. (`checkable`)
- **OQ4 — Module-level experimental subpaths.** Whether the shared motion and
  gesture modules may publish experimental API through module-level
  `/experimental` subpaths is governed by `spec:AST-017` FR21, which today
  gives an experimental subpath only to an owning component. (`owner
decision`)
- **OQ5 — The menu's drift allowance.** The 13 pt drift allowance (FR29)
  sits between a 12 pt move that opened the menu and a 14 pt move that did
  not. Is that bracket its justification, or does it need a finer
  measurement? (`owner decision`)
- **OQ6 — A finger dragged into a sub-menu.** What happens when a held finger
  drags from a row into its sub-menu? `module:DropdownMenu/useMenuPress`
  ORD1a covers only a mouse. (`owner decision`)
- **OQ7 — The opening haptic.** UIKit plays a haptic as a held finger
  opens a menu; a page in iOS Safari cannot (FR23). Where does the menu record
  that gap? (`owner decision`)
- **OQ8 — Withdrawing a tentative open.** What does a screen reader hear when
  a menu that a held finger opened is withdrawn by a cancel before the
  finger reached it? (`owner decision`)
