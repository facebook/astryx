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
affects_families: [family:buttons, family:overlay-dismissal]
affects_contributing: []
affects_consumer_docs: []
---

# Touch presentations feel native system spec

## Intent

A person using an Astryx product on a phone or tablet gets controls, sheets,
menus, lists and navigation that behave the way their device's own apps do:
the same physics, the same timings, the same gesture thresholds and the same
feel. This native-feeling touch behavior is the default on every touch device,
iOS and Android alike, with no opt-in, and its motion keeps running at display
rate while the page's JavaScript is busy.

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
  chrome. This record governs behavior only (OQ3).
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

- **FR1 — One table of measured values.** Every spring, duration,
  deceleration rate, rubber-band coefficient, gesture threshold and haptic
  moment a touch presentation uses MUST come from one shared table of measured
  native values. A component MUST NOT carry a number of its own. The same
  values apply on every touch platform; a platform gets a value of its own only
  where the table records a measured, sourced difference (FR2).
- **FR2 — Every value has a source.** Each value in the table MUST name its
  source next to it: Apple's documentation, a WWDC session, WebKit's own
  source where WebKit states it matches UIKit, or a measurement of UIKit on
  the iOS simulator naming the app, the iOS version, the method and the date.
  A value without one of these MUST be labelled a guess and name the
  measurement that will replace it. A decompilation of UIKit MAY aim a
  measurement and MUST NOT be a source.
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
  touch presentation plays MUST be a theme motion role, named by its table path
  (`sheet.present`, `timing.curves.easeInOut`). The role's default value is
  its table value, and a theme MAY override it through `motion`, at its root or
  in an adaptation rule. A component MUST read touch motion through these roles
  and MUST NOT play a literal. A theme value MUST reach the motion at its
  start, without changing how the motion runs (FR5, FR6). Gesture thresholds,
  the velocity filter, the timings that decide who gets a touch (the
  content-touch delay, the scroll brake, momentum memory) and haptics are not
  motion: they stay internal constants from the table and are not public
  concepts (`spec:AST-002` FR3). This adds touch motion roles to the motion
  configuration of `architecture:theme-authoring-contract` and to
  `architecture:theme-tokens` beside the existing duration and easing tokens,
  whose rules are unchanged, and departs from the draft `design:motion` DR3
  wherever the native motion settles with an overshoot or stretches with a
  rubber band.

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
  platform. A rule that turns exits off by default, or closes at once under
  reduced motion, does not apply to touch presentations; FR8 governs their
  reduced-motion form.
- **FR8 — Reduce Motion substitutes as the native counterpart does.** Under
  `prefers-reduced-motion: reduce`, a touch presentation MUST do what its
  UIKit counterpart does with Reduce Motion and Prefer Cross-Fade Transitions
  on, on every touch platform. For screen transitions, sheets, full-screen
  modals and alerts that is a cross-fade carrying the same change of state: an
  entrance lands in place and fades in, an exit fades out in place, and any
  other move fades through. A navigation push or pop cross-fades over 0.5 s on
  the ease-in-out curve; a sheet, a full-screen modal or an alert fades on its
  own presentation spring and drops its travel and scale; menus open and close
  on the Reduce Motion spring. Some control indicators move at once instead:
  the segmented control's selection vanishes and reappears at its destination.
  A presentation MUST NOT jump where its native counterpart fades, nor fade
  where it moves at once. Motion that follows a finger, such as a throw, MUST
  keep its motion. The substitutions' durations and springs are theme motion
  roles (FR4). This is the minimally moving form the draft `design:motion` DR5
  asks for, for touch presentations.

### Gestures

- **FR9 — Fingers are tracked by recognizers.** A drag MUST be tracked by the
  shared gesture recognizers, writing one transform per move, with no
  component render per move and no layout read after the gesture begins.
  Native scrolling MUST be used only where the component is a scroll view
  (lists, scroll areas, the page). A component MAY track a finger with native
  scroll snapping only with simulator evidence that it tracks through a
  main-thread block, ends on the native release curve, ends correctly when the
  finger lifts during a block, and lets a finger catch the content mid-flight.
- **FR10 — A second finger never breaks the first.** A second finger MUST NOT
  cancel or redirect a drag a recognizer has claimed. Page pinch-zoom MUST stay
  the browser's whenever no pinch recognizer claims the fingers and no drag is
  claimed (WCAG 1.4.4).
- **FR11 — Two press profiles.** Press feedback MUST follow one of two native
  profiles. A control (UIControl) highlights on touch-down outside scroll
  views, keeps tracking within its expanded bounds (70 pt), turns its highlight
  off and on as the finger drags out and back, and activates on a lift inside.
  A cell (a table or collection cell) highlights 150 ms after touch-down inside
  a scroll view and drops the highlight when the scroll wins. The 150 ms delay
  applies only inside scroll views. On every touch platform this amends
  `design:user-states` DR1 (the pressed overlay during a hold) and DR3 (the
  selected SegmentedControl item's held surface) for touch presentations, the
  press treatment of `family:buttons`, and `module:DropdownMenu/useMenuPress`
  FR6, whose rule that menu rows show no pressed paint under a finger gives way
  to the cell profile for menu rows.
- **FR12 — Long press and rubber band are per use.** A long press MUST use the
  thresholds its UIKit counterpart uses: 0.5 s and 10 pt for a plain long
  press, the measured values for context menus and menus. A rubber band MUST
  use the coefficient its use measures.
- **FR13 — One touch-presentation resolver.** Whether a component shows its
  touch presentation MUST come from one shared resolver, beside the shared
  modality state of `architecture:interaction-modality`, which this record
  extends. Touch behaviors key on a coarse pointer and are on by default
  there; layout keys on the available size through the shared breakpoint names
  (`architecture:public-component-api` INV14), never a parallel breakpoint
  table; a presentation that depends on both (a sheet instead of a popover)
  asks for both. Which sizes count as compact is not set (OQ5). A component
  MUST NOT write its own media query for it. The resolver MUST NOT read
  `matchMedia` during a server render or the hydrating render: those renders
  produce the pointer presentation, and the touch presentation applies after
  hydration (`spec:AST-013` FR9).
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
- **FR17 — Native readings.** A recognizer's thresholds and readings MUST
  follow UIKit's and come from the table. A pan begins at 10 pt of travel on
  either axis, and its translation excludes that travel; its velocity is
  UIKit's estimate, 0.2 × the newest event's instantaneous velocity + 0.8 ×
  the previous event's, never decayed through a rest.
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
  element whose recognizers decide only at the lift keeps its listeners
  passive. Known limit: a native scroll that starts on an element with a
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

### Haptics

- **FR23 — Haptics where the native counterpart plays them.** A touch
  presentation MUST play a haptic only at the moments its UIKit counterpart
  does. In iOS Safari the only haptic a page can produce is a light impact from
  a real tap landing on a `<label>` or a switch checkbox; a moment UIKit marks
  mid-drag or after the lift has no haptic there, and the component records
  that gap. `navigator.vibrate` stands in where the platform offers it.

### Resources and compatibility

- **FR24 — Touch resources are held once and only while used.** Touch-only
  listeners, observers and timers MUST be acquired only under a coarse pointer
  and only while the presentation is enabled, and released when either stops
  holding (`architecture:react-component-runtime` INV5). No component instance
  registers its own `document` or `window` listener for touch: one shared owner
  holds each such listener for every instance (INV7).
- **FR25 — A moved default keeps a way back.** Turning a touch presentation on
  by default MUST NOT silently change a released default. Where a released
  default moves, such as Selector's `adaptive` presentation policy or a menu's
  long-press delay, the component MUST offer a prop that restores the released
  behavior and MUST document the change as a behavior change, not as a
  visual-only change (`spec:AST-017` FR3, FR25 and DEC-17). This replaces
  `component:Selector` DEC-1's width-and-pointer query with the FR13 touch rule
  for `adaptive`, shipped as a documented behavior change with a restoring
  option.

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
- `architecture:interaction-modality`: the shared touch-presentation resolver
  (FR13).
- `architecture:react-component-runtime` INV5 and INV7 already require FR24;
  no amendment.
- `family:buttons`: the control and cell press profiles (FR11).
- `family:overlay-dismissal`: exits and their Reduce Motion substitutions in
  touch presentations (FR7, FR8).
- `component:Selector` DEC-1: `adaptive` resolves through the FR13 touch rule
  instead of the width-and-pointer query, with a restoring option (FR25).
- `module:DropdownMenu/useMenuPress` FR6: menu rows take the cell press
  profile under a finger (FR11).
- `design:user-states` DR1 and DR3, `spec:AST-025` FR14 and `spec:AST-013` FR3
  each carry an amendment for touch presentations (FR11, FR14, Platform
  support); `design:motion` DR3 and DR5 (draft) are departed from or met as
  FR4 and FR8 state.
- Consumer docs: none until a component ships its touch presentation; each
  component documents its own, including any restoring prop (FR25).

## Verification

| Contract   | Verification                                                                                                                   | Representative states                                                                                         | Mutation or failure expectation                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2   | Table check over every domain of the table                                                                                     | every entry; a guess and its measurement task; a platform-specific entry                                      | an unsourced value, an unknown source kind, a guess without a listed measurement, or an unsourced platform split fails |
| FR3        | Unit tests of the spring, decay, rubber band and projection math against an independent integration and values read from UIKit | under-, critically and overdamped springs; release velocities; both rates; overscroll depths                  | changing a formula or a constant breaks the agreement with UIKit's values                                              |
| FR4        | Theme unit tests and a browser test of a themed spring                                                                         | no theme (table defaults); a theme writing a spring, a duration and a curve, at its root and in an adaptation | a role that ignores the theme, a literal played in place of a role, or a default that differs from the table fails     |
| FR5        | Browser proof: an animation keeps advancing frame by frame through a 1 s main-thread block, with no layout or paint per frame  | Chromium phone emulation; WebKit                                                                              | a script-driven or layout-animating implementation freezes or lays out                                                 |
| FR6        | Unit and browser tests catching an animation mid-flight and retargeting it                                                     | catch at peak velocity; retarget with a new spring                                                            | a layout read, a jump, or a lost velocity fails                                                                        |
| FR7, FR8   | Component browser tests and storyboards with and without Reduce Motion                                                         | entrance, exit, move                                                                                          | a substitution other than the native one, or a missing exit, fails                                                     |
| FR9, FR10  | Recognizer unit tests on synthetic streams and browser tests with real touch input                                             | drag, second finger, pinch, page zoom, main-thread block                                                      | a second finger that breaks a drag, or a blocked page pinch, fails                                                     |
| FR11, FR12 | Press and long-press tests on synthetic streams with explicit timestamps                                                       | inside and outside a scroll view; drag out and back; a menu row under a finger                                | the wrong profile's timing fails                                                                                       |
| FR13       | Resolver unit tests and a server-render test                                                                                   | coarse and fine pointer; narrow and wide; server render; hydrating render                                     | a component-owned media query diverges; a `matchMedia` read during server or hydrating render fails                    |
| FR14       | Browser tests of a sheet over a scrolled list                                                                                  | scrolled and at its top                                                                                       | a midway handoff fails                                                                                                 |
| FR15–FR17  | Recognizer unit tests on synthetic streams with explicit timestamps                                                            | exclusive, simultaneous, require-to-fail, nested; a blocked main thread; a pan at 10 pt per axis              | a wrong winner, a late deadline, or a translation that keeps the hysteresis fails                                      |
| FR18–FR22  | Browser tests with real touch input                                                                                            | per-axis pans beside native scrolling, page zoom, cancelled touches, clicks after taps, keyboard activation   | a ghost click, a blocked scroll or zoom, or a cancelled unowned touchmove fails                                        |
| FR23       | Haptics tests on the recorded moments                                                                                          | tap, drag, lift                                                                                               | a haptic outside a native moment fails                                                                                 |
| FR24       | Resource tests counting listeners, observers and timers                                                                        | fine pointer; coarse pointer enabled and disabled; many instances; unmount                                    | a touch listener on a fine pointer, a per-instance `document` or `window` listener, or a leak fails                    |
| FR25       | Component tests of each moved default and its restoring prop                                                                   | default; restoring prop set                                                                                   | a moved default without a restoring prop, or a restoring prop that differs from the released behavior, fails           |
| all        | iOS simulator: the UIKit reference capture and the same gesture in Safari; real iOS Safari and Android Chrome devices          | per component                                                                                                 | an unmatched curve or timing is a parity defect                                                                        |

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
of this decision (OQ3).

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
- **OQ3 — Platform-matched look and feel.** Should touch presentations match
  each platform's visual conventions (glass or material surfaces, glyphs,
  chrome)? This waits on an exploration of how iOS and Android differ; until
  then this record sets no platform-split visual rule. (`owner decision`)
- **OQ4 — Module-level experimental subpaths.** May the shared motion and
  gesture modules publish experimental API through their own module-level
  `/experimental` subpaths? `spec:AST-017` FR21 gives an experimental subpath
  only to an owning component, and `spec:AST-002` FR18 asks a public primitive
  for a current owning record. Options: (a) amend `spec:AST-017` FR21 to admit
  module-level experimental subpaths with a current owning record; (b) expose
  the modules only through an owning component's `/experimental` subpath.
  (`owner decision`)
- **OQ5 — Compact size.** Which available sizes count as compact for a
  presentation that depends on size (FR13)? The value is set through the
  shared breakpoint names, not a separate table. (`owner decision`)
