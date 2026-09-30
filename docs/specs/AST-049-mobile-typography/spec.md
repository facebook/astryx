---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-049
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [imdreamrunner]
affects_architecture:
  [
    architecture:theme-tokens,
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
    architecture:theme-application,
  ]
affects_families: []
affects_contributing: []
affects_consumer_docs: [typography, theme]
---

# First-party mobile typography system spec

## Intent

People reading and operating a narrow touch interface should have a comfortable
body size without unnecessarily enlarging already-prominent display text. This
proposal gives Astryx's first-party themes a 16px-reference reading base, a
finite **Pin** mapping that preserves each theme's largest display, and explicit
small-semantic-text floors. It applies only when the layout viewport is narrow
**and** the primary pointer is coarse.

Four first-party themes have a 14px-reference body scale. Merely lifting their
base to 16 while keeping their desktop ratios grows Display 1 from 42 to 48px or
from 53 to 61px. Conversely, shrinking every role for a smaller screen harms
secondary-copy readability. Pin directs the increase toward smaller reading
roles while retaining the display anchor. Distinguishing the document root from
a theme base, raw tokens from semantic roles, and width from pointer capability
makes that outcome predictable.

**Draft proposal, not current authority.** All MUST, SHOULD, and MAY language
below describes the candidate contract. Approval metadata is intentionally null;
`owners` is descriptive, not evidence of approval. The semantic floors are a
proposed extension beyond the historical pure-Pin implementation discussed in
Current-state impact. This record does not decide any pull request's disposition.

**Ownership boundary.** This system record owns the shared first-party profile's
environment, observable token outputs, defaults, exceptions, compatibility, and
distribution guarantees. [AST-012][AST012] already owns the adaptation API and
explicitly excludes choosing bundled-theme values. The draft
[typography-hierarchy design record][Typography-design] owns qualitative visual
intent and explicitly excludes font sizes, line-height values, and token names;
it is not approval for these numbers. Package-local theme records continue to
own each theme's identity, root values, selected mappings, and theme-specific
receipts. The tables here are computed projections of those root inputs through
one proposed shared profile, not a second owner for unrelated theme choices.
This is why a cross-theme system record, rather than a new single-theme record
or an expansion of AST-012's mechanism, is proposed.

The intended outcomes are:

- Body, label, code, and heading-4 use a nominal 16px/24px mobile reading base.
- Display identity, font families, weights, and semantic HTML are preserved.
- Every existing raw step and semantic role has inspectable, discrete endpoints.
- Desktop/nonmatching typography, root preferences, and unrelated geometry remain
  unchanged; custom authors retain the existing override and inheritance model.

`AST-049` is a **provisional draft identifier**, not a reservation. Numbering and
existing-owner research are recorded in Current-state impact. Concrete files,
implementation sketches, and execution phases live in the sibling [plan](plan.md).

## Non-goals

- Changing `html` or `:root` font-size, making all desktop themes 16px-based, or
  changing unthemed core typography defaults.
- Making every role 16px or larger, or claiming 12/14/16px are universal
  accessibility requirements.
- Changing theme font families, weights, tracking, colors, spacing, control
  heights, radii, motion, or heading semantics.
- Converting all pixel tokens to rem, globally shrinking component geometry, or
  changing existing iOS-targeted input zoom protection.
- Defining mobile spacing, AppShell navigation, focus modality, touch-target
  policy, or every product's notion of a mobile device.
- Introducing fluid viewport typography, a new `defineTheme.mobile` field,
  `isMobile`/`useIsMobile` export, device-detection service, or per-component
  mobile-size prop.
- Changing server-safe or JavaScript token reads into responsive snapshots.
- Automatically enrolling independent custom themes, rewriting previously copied
  consumer theme sources, or specifying arbitrary high-ratio custom display caps.
- Treating a token snapshot, jsdom, a viewport label, or an accessibility scanner
  as proof of browser layout or iOS Safari behavior.
- Replacing existing architecture or prescribing private modules, helper names,
  data structures, code-generation arrangements, or CI topology. Equivalent
  implementations remain valid when they satisfy the observable contract. Public
  token values and the matching predicate are intentional caller-visible outputs;
  their reproducible numeric definition does not require a particular private
  algorithm.

## Requirements

- **FR1 — Scoped first-party defaults.** The profile MUST apply to unmodified
  neutral, chocolate, butter, stone, gothic, matcha, and y2k themes in the
  environment defined by FR3. Selecting or inheriting one of these themes selects
  its defaults, subject to FR8's explicit customizations. Nonmatching theme values
  and independent custom themes MUST remain unchanged. The unpublished `probe`
  fixture is outside this product policy.
- **FR2 — A theme base is not the document root.** The profile MUST NOT change
  `html`/`:root` font-size or reinterpret rem. Stock matching themes MUST expose
  `--font-size-base: 1rem` and the corresponding body, label, code, and heading-4
  semantic sizes. Sixteen is the reference-pixel base, not a fixed physical or
  user-preference-independent size. Browser root preferences MUST NOT be
  counter-scaled.
- **FR3 — Mobile means narrow AND primary-coarse.** The matching condition MUST be
  layout viewport width below the effective `widthBreakpoints.md` **AND**
  `(pointer: coarse)`. Stock `md` is 768 CSS px and the upper edge is exclusive:
  `(width < 768px) and (pointer: coarse)`. Width alone, pointer alone, OR,
  `any-pointer`, hover capability, UA, device names, or last-input state MUST NOT
  broaden or narrow this predicate. An effective custom `md` remains governed by
  AST-012.
- **FR4 — Finite Pin endpoints.** Matching first-party raw typography MUST have
  the Pin outputs defined below, preserving raw steps −5 through +6 and each
  theme's Display 1 anchor. The profile MUST NOT continuously interpolate font
  sizes with viewport width or silently impose a shared display cap. Outside the
  predicate, the original endpoint set applies.
- **FR5 — Readable default semantic floors.** After Pin, the default semantic
  sizes MUST be at least 16px-reference for body, label, code, and heading-4;
  14px-reference for heading-5 and supporting; and 12px-reference for heading-6.
  The floored roles MUST receive the corresponding final-size leading. These
  floors MUST NOT clamp the raw primitive ladder. Explicit consumer opt-outs and
  size overrides remain possible under FR8 and do not claim the stock profile's
  readability guarantee. This claim, including its application to already-16
  themes, is a proposed extension, pending human design approval.
- **FR6 — Preserve typography identity.** Default leading MUST remain unitless
  and match the reference endpoints below. Theme/component font families,
  weights, explicit display-family distinctions, and tracking MUST be preserved.
  The profile MUST NOT change HTML heading levels, use color as the sole
  hierarchy cue, tighten tracking to fit old widths, or flatten existing weight
  distinctions.
- **FR7 — CSS presentation without a new rendering dependency.** The matching
  typography MUST be available through theme CSS without a JavaScript resize
  handler, diagnostic boolean, React rerender, or content remount being needed to
  select it. Width/pointer changes MUST select the correct endpoint in either
  direction. Server and initial hydration markup MUST agree; typography state
  MUST NOT change content, required actions, or semantic structure.
- **FR8 — Existing author intent and cascade.** Existing theme selection,
  adaptation conditions, ordered inheritance, explicit component overrides,
  nested-theme boundaries, portal behavior, and onDark/onLight precedence remain
  governed by AST-012 and theme-application architecture. A later child
  adaptation MAY deliberately replace the mobile values. Empty child rules or
  root-only overrides MUST NOT be presented as removing inherited rules.
  Token-backed explicit sizes MUST NOT be advertised as fixed-pixel opt-outs.
- **FR9 — Equivalent distribution and observation.** Runtime themes, built
  themes/CSS, and newly scaffolded first-party theme sources MUST express the
  same profile. Built theme extension MUST preserve adaptation information and
  ordering. A supported build MUST NOT silently discard adaptations. An initial
  document supplied with built theme CSS and the correct theme scope MUST paint
  the matching endpoint before hydration, including with JavaScript disabled.
  JavaScript theme/token reads remain root-value reads, not media-resolved
  snapshots.
- **FR10 — Independent geometry and input contracts.** Unrelated pixel-valued
  spacing, size, border, and radius tokens and fixed literal component font sizes
  MUST retain their authored values. The named supporting-size exceptions below
  are deliberately changed only in the matching profile. Existing iOS-targeted
  input safeguards remain independent of viewport width. Larger intrinsic text
  metrics MAY cause wrapping or layout growth; controls and essential content
  MUST remain usable rather than being clipped or compensated for by shrinking
  text or global spacing.
- **FR11 — Accessibility remains an outcome.** The profile MUST preserve browser
  text preferences, text enlargement, zoom/reflow, user text spacing, keyboard
  access, and semantic relationships. Numeric floors alone MUST NOT be represented
  as accessibility certification. Loaded and fallback fonts, representative
  scripts, actual controls, and constrained layouts need evidence appropriate to
  their observable behavior.
- **FR12 — Compatibility follows the existing owner.** Any implementation and
  published package update MUST follow [AST-017][AST017] for released-consumer
  compatibility, migration, and Changeset classification. Visual scope or a
  `[feat]` label MUST NOT override a broken stable contract. This record does not
  classify a particular implementation or alter that release policy.

### First-party scope and reference inputs — FR1, FR6

**[Verified source snapshot]** The maintained first-party definitions have these
root scales and families. A base/ratio pair is a theme input, not an `html`
font-size declaration.

| Theme and source                                                             | Root base / ratio | Body / heading families     | Existing display distinction                      |
| ---------------------------------------------------------------------------- | ----------------: | --------------------------- | ------------------------------------------------- |
| [neutral — `packages/themes/neutral/src/neutralTheme.ts`][T-neutral]         |          14 / 1.2 | Figtree / Figtree           | Same configured family                            |
| [chocolate — `packages/themes/chocolate/src/chocolateTheme.ts`][T-chocolate] |          14 / 1.2 | Albert Sans / Fraunces      | Heading family                                    |
| [butter — `packages/themes/butter/src/butterTheme.ts`][T-butter]             |         14 / 1.25 | Outfit / Outfit             | `Text` display variants use Sarina                |
| [stone — `packages/themes/stone/src/stoneTheme.ts`][T-stone]                 |         14 / 1.25 | Figtree / Montserrat        | Heading family                                    |
| [gothic — `packages/themes/gothic/src/gothicTheme.ts`][T-gothic]             |         16 / 1.25 | Fustat / Fustat             | `Text` display variants use Manufacturing Consent |
| [matcha — `packages/themes/matcha/src/matchaTheme.ts`][T-matcha]             |         16 / 1.25 | DM Sans / Playwrite US Trad | Heading family                                    |
| [y2k — `packages/themes/y2k/src/y2kTheme.ts`][T-y2k]                         |         16 / 1.25 | Poppins / Poppins           | `Text` display variants use Crimson Text          |

A display override on `components.text` is not evidence of the same override on
`components.heading`. Gothic's source describes its dark-only presentation.
[Probe][Probe] is explicitly generated, unpublished fixture code. Independent
consumer themes do not acquire this profile merely by using Astryx.

The proposed matching inputs are `16 / 1.1736` for neutral/chocolate and
`16 / 1.2225` for butter/stone. Gothic/matcha/y2k retain `16 / 1.25` and need only
the proposed semantic-floor changes. Future theme-identity changes remain owned
by the relevant theme; the numeric projections must then be reconciled rather
than silently treating this snapshot as a second root-value authority.

### Root, reference units, and the reason for 16 — FR2, FR10

**[Verified]** The [reset][Reset] sets root line-height and
`-webkit-text-size-adjust: 100%`, but does not set `html` font-size. Generated
sizes use reference pixels divided by **16** to obtain rem. Core's raw
`--font-size-base: 0.875rem` and body/label/code/heading-4 aliases are token
values, not a 14px document root. Theme CSS is scoped to `data-astryx-theme`; a
theme's base is not a command to resize the root. [Scale][Scale] [Tokens][Tokens]
[Theme CSS evidence][Compiler]

Consequently:

- Leave the existing root behavior intact. Application examples should leave the
  browser root alone; `html {font-size: 100%;}` is a preference-respecting
  application option, not a new library declaration.
- Do not set `62.5%`, `14px`, a fixed `16px`, or the selected theme's base on the
  root as part of this profile. `1rem` always refers to the document root.
- All pixel figures here are **reference values at a 16px root and 100% zoom**.
  The 12/14/16/20px-reference values correspond to
  `0.75/0.875/1/1.25rem`. With a 20px root, body `1rem` is 20 CSS px and a
  `0.875rem` secondary role is 17.5 CSS px. Do not cancel that enlargement.

Sixteen is the common browser default and a familiar 1rem reading base. It
improves ordinary reading comfort without making zoom the only practical way to
read an interface. iOS Safari also commonly zooms when sufficiently small
text-entry controls receive focus; a computed font size of at least 16 CSS px
normally avoids that particular trigger. This is a rationale, not a guarantee
for every browser or custom root.

The existing [TextInput][TextInput] and [TextArea][TextArea] safeguards use
`max(1rem, var(--text-body-size))` inside both `(pointer: coarse)` and
`@supports (-webkit-touch-callout: none)`. They are **iOS-targeted**, not an
existing all-coarse-browser reading policy. This profile neither changes them
nor adds a width condition to them. A wide iOS form can therefore retain that
input protection while other text uses its ordinary theme scale.

No general WCAG rule mandates these particular font sizes. Contrast, font/script
legibility, spacing, zoom, and reflow remain independently applicable.

### Narrow AND touch — FR3

For this typography profile only:

```text
narrow := layout viewport width < effective widthBreakpoints.md
touch  := primary pointer matches (pointer: coarse)
mobile := narrow AND touch
```

The stock query is:

```css
@media (width < 768px) and (pointer: coarse) {
  /* mobile typography */
}
```

AST-012's named points are `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, and
`2xl: 1536` CSS px. `below` excludes its point. Do not replace the upper edge with
767px or an approximation that mishandles fractional widths. A descendant's
valid effective `md` override changes the inherited rule's threshold; a
JavaScript observation must use the same effective value. [AST-012][AST012]
[Condition evidence][Adaptations]

Here “touch” is a shorthand for a **reported coarse primary pointer**, not a
hardware inventory or phone detector:

- `pointer: fine`, `pointer: none`, or a nonmatching/unsupported pointer query does
  not match. A secondary touchscreen does not make `any-pointer: coarse` an
  acceptable replacement.
- `hover: none` is neither required nor an alternative OR branch. Coarse-primary
  with reported hover support still matches; no-hover without coarse-primary does
  not.
- UA strings, device classes, screen pixels, orientation, `maxTouchPoints`, and
  recent touch/mouse events do not override the media predicate.
- Attaching a mouse may or may not change the browser's primary-pointer report.
  Follow the query, not an assumption about the attached device.
- Keyboard use and focus visibility remain independent under the
  [interaction-modality contract][Modality].

| Narrow? | Primary coarse pointer? | Mobile typography?                              |
| ------- | ----------------------- | ----------------------------------------------- |
| Yes     | Yes                     | **Yes — Pin plus the proposed semantic floors** |
| Yes     | No                      | No — root/nonmatching typography                |
| No      | Yes                     | No — root/nonmatching typography                |
| No      | No                      | No — root/nonmatching typography                |

| Example environment                                     | Expected typography state         |
| ------------------------------------------------------- | --------------------------------- |
| Phone portrait, 390px, coarse primary                   | Matching                          |
| Small laptop or resized desktop, 680px, fine primary    | Nonmatching; layout still reflows |
| Tablet landscape, 1024px, coarse primary                | Nonmatching                       |
| Phone landscape, 844px, coarse primary                  | Nonmatching                       |
| Compact phone landscape, 667px, coarse primary          | Matching                          |
| Tablet portrait/split view, 744px, coarse primary       | Matching despite being a tablet   |
| Touch laptop, 1366px, fine primary and coarse secondary | Nonmatching                       |
| Same touch laptop, 700px, still fine primary            | Nonmatching                       |
| Device at 700px whose browser reports coarse primary    | Matching                          |
| Exactly 768px, coarse primary                           | Nonmatching                       |

Nonmatching does not mean a layout may overflow, touch targets may shrink, or a
mouse is required. Those contracts do not depend on this typography predicate.

### Pin output definition — FR4, FR5

**[Proposed contract]** Pin is a finite endpoint mapping, not fluid `clamp()`/`vw`
interpolation. For the first-party root inputs above, its observable numeric
outputs are defined by:

```text
B = root reference base
r = root geometric ratio
M = max(B, 16)
a = 6                               # Display 1 is step +6

r_pin = r * (B / M)^(1/a)
desktop(k) = Math.round(B * r^k)
pinned(k)  = Math.round(M * r_pin^k)
rem(referencePx) = referencePx / 16
```

These equations define values callers can inspect through public tokens; they do
not require a new exported function, a particular private helper, or calculation
at runtime. Equivalent precomputed outputs satisfy the contract. Use
`Math.round`'s positive-number rounding behavior for these projections, not
intermediate-step rounding or a ratio reconstructed from an already-rounded
Display 1 token.

For neutral/chocolate, the exact ratio is `1.1735887063175583`, authored as
`1.1736`. For butter/stone it is `1.2224882357474567`, authored as `1.2225`.
**[Computed]** The inspected generator produces identical complete token maps
from the exact and four-decimal forms for both families. A base already equal to
16 retains its ratio. Thus the reference Display 1 endpoints stay 42, 53, and
61px; “pinned” does not mean every theme is capped at 36px.

Apply semantic floors after the raw Pin projection:

| Semantic role                |          Matching minimum | Treatment                                                |
| ---------------------------- | ------------------------: | -------------------------------------------------------- |
| body, label, code, heading-4 |     16px-reference / 1rem | Normal reading/control base                              |
| supporting, heading-5        | 14px-reference / 0.875rem | Readable secondary text                                  |
| heading-6                    |  12px-reference / 0.75rem | Brief subordinate headings, not paragraph copy or labels |

These are minima, not a reason to reduce a larger deliberate matching value.
They govern stock defaults and consciously authored profiles; they do **not** add
an automatic per-leaf maximum against every descendant's root override. Under
AST-012, inherited matching rules can override descendant root values. Custom
authors preserve a larger intended matching value with their later matching rule
or explicit component override, as described below.

### Actual public role and token inventory — FR4–FR6

A semantic role has `--text-<role>-size`, `--text-<role>-leading`, and
`--text-<role>-weight`. The inspected scale has twelve raw steps and fourteen
semantic roles. [Scale][Scale]

| Step | Raw token          | Semantic roles               |
| ---: | ------------------ | ---------------------------- |
|   +6 | `--font-size-5xl`  | display-1                    |
|   +5 | `--font-size-4xl`  | display-2                    |
|   +4 | `--font-size-3xl`  | display-3                    |
|   +3 | `--font-size-2xl`  | heading-1                    |
|   +2 | `--font-size-xl`   | heading-2                    |
|   +1 | `--font-size-lg`   | heading-3, large             |
|    0 | `--font-size-base` | heading-4, body, label, code |
|   −1 | `--font-size-sm`   | heading-5, supporting        |
|   −2 | `--font-size-xs`   | heading-6                    |
|   −3 | `--font-size-2xs`  | No built-in semantic role    |
|   −4 | `--font-size-3xs`  | No built-in semantic role    |
|   −5 | `--font-size-4xs`  | No built-in semantic role    |

There is no separate built-in caption, title, or headline token family in this
scale. Supporting is the relevant secondary-copy role; no new alias vocabulary
is introduced here.

### Recommended semantic PIN tables — FR4–FR6

Desktop columns are **[Verified/Computed]** effective root values at the evidence
snapshot. Mobile columns are the **[Proposed contract]**. `M/D` means mobile size
divided by desktop size, not the scale ratio. `LH` is reference-pixel line-height;
the mobile column includes the emitted unitless leading. Rounded leading can
make the actual line box differ from the displayed whole-pixel figure by a few
thousandths. The weight/family/tracking table below applies to every row.

Grouped roles are explicitly enumerated, covering all fourteen roles for each
of the seven themes. **† denotes a semantic-floor extension beyond the historical
pure-Pin implementation**, not a shipped or approved result.

#### A. Neutral and chocolate

Desktop `14 / 1.2`; matching `16 / 1.1736`.

| Role                         | Desktop px / rem | Desktop LH | Mobile PIN px / rem | Mobile LH / unitless |   M/D | Rationale                                |
| ---------------------------- | ---------------: | ---------: | ------------------: | -------------------: | ----: | ---------------------------------------- |
| display-1                    |       42 / 2.625 |         52 |          42 / 2.625 |          52 / 1.2381 | 1.000 | Pin the top; no new hero growth          |
| display-2                    |      35 / 2.1875 |         44 |           36 / 2.25 |          44 / 1.2222 | 1.029 | Preserve display hierarchy               |
| display-3                    |      29 / 1.8125 |         40 |          30 / 1.875 |          44 / 1.4667 | 1.034 | Preserve its rung and final-size leading |
| heading-1                    |         24 / 1.5 |         32 |          26 / 1.625 |          36 / 1.3846 | 1.083 | Page/section prominence above body       |
| heading-2                    |        20 / 1.25 |         28 |          22 / 1.375 |          32 / 1.4545 | 1.100 | Maintain intermediate hierarchy          |
| heading-3; large             |      17 / 1.0625 |         24 |         19 / 1.1875 |          28 / 1.4737 | 1.118 | Emphasized reading remains above base    |
| heading-4; body; label; code |       14 / 0.875 |         20 |              16 / 1 |             24 / 1.5 | 1.143 | Establish the readable base              |
| heading-5; supporting        |        12 / 0.75 |         20 |          14 / 0.875 |          20 / 1.4286 | 1.167 | Secondary text reaches its floor         |
| heading-6                    |       10 / 0.625 |         16 |           12 / 0.75 |          20 / 1.6667 | 1.200 | Smallest semantic heading reaches 12     |

Pure Pin already reaches the proposed minima for these two stock profiles; no
corrective floor write is necessary.

#### B. Butter and stone

Desktop `14 / 1.25`; matching `16 / 1.2225`, then semantic floors.

| Role                         |               Desktop px / rem | Desktop LH | Mobile PIN px / rem | Mobile LH / unitless |   M/D | Rationale                                    |
| ---------------------------- | -----------------------------: | ---------: | ------------------: | -------------------: | ----: | -------------------------------------------- |
| display-1                    |                    53 / 3.3125 |         68 |         53 / 3.3125 |          68 / 1.2830 | 1.000 | Pin the distinctive display                  |
| display-2                    |                    43 / 2.6875 |         52 |           44 / 2.75 |          56 / 1.2727 | 1.023 | Retain the second display rung               |
| display-3                    |                     34 / 2.125 |         44 |           36 / 2.25 |          44 / 1.2222 | 1.059 | Retain display/heading distinction           |
| heading-1                    |                    27 / 1.6875 |         36 |         29 / 1.8125 |          40 / 1.3793 | 1.074 | Preserve headline hierarchy                  |
| heading-2                    |                     22 / 1.375 |         32 |            24 / 1.5 |          32 / 1.3333 | 1.091 | Keep intermediate hierarchy                  |
| heading-3; large             |                     18 / 1.125 |         28 |           20 / 1.25 |             28 / 1.4 | 1.111 | Emphasized reading above body                |
| heading-4; body; label; code |                     14 / 0.875 |         20 |              16 / 1 |             24 / 1.5 | 1.143 | Readable base                                |
| heading-5                    |                    11 / 0.6875 |         16 |     **14 / 0.875†** |      **20 / 1.4286** | 1.273 | Raw Pin gives 13; apply secondary floor      |
| heading-6                    |                     9 / 0.5625 |         16 |      **12 / 0.75†** |      **20 / 1.6667** | 1.333 | Raw Pin gives 11; apply smallest-role floor  |
| supporting                   | 12px literal / 0.75 equivalent |     ≈17.45 |     **14 / 0.875†** |      **20 / 1.4286** | 1.167 | Replace the root-only 12px pin in this state |

Butter/stone override root supporting **size only** to `12px`. Root generated
leading remains `1.4545`, making the effective line-height approximately 17.45px,
not 20px. Historical pure Pin replaces the role with 13px and its generated
leading; the proposed extension uses 14px and `1.4286` instead. Outside the
predicate, the literal 12px size and original leading remain unchanged.

#### C. Gothic, matcha, and Y2K

Both geometric states remain `16 / 1.25`; only marked semantic floors change.

| Role                         |               Desktop px / rem | Desktop LH | Mobile PIN px / rem | Mobile LH / unitless |   M/D | Rationale                                       |
| ---------------------------- | -----------------------------: | ---------: | ------------------: | -------------------: | ----: | ----------------------------------------------- |
| display-1                    |                    61 / 3.8125 |         76 |         61 / 3.8125 |          76 / 1.2459 | 1.000 | Retain the existing display anchor              |
| display-2                    |                    49 / 3.0625 |         60 |         49 / 3.0625 |          60 / 1.2245 | 1.000 | No unnecessary rescaling                        |
| display-3                    |                    39 / 2.4375 |         48 |         39 / 2.4375 |          48 / 1.2308 | 1.000 | No unnecessary rescaling                        |
| heading-1                    |                    31 / 1.9375 |         44 |         31 / 1.9375 |          44 / 1.4194 | 1.000 | Preserve established hierarchy                  |
| heading-2                    |                    25 / 1.5625 |         36 |         25 / 1.5625 |            36 / 1.44 | 1.000 | Preserve established hierarchy                  |
| heading-3; large             |                      20 / 1.25 |         28 |           20 / 1.25 |             28 / 1.4 | 1.000 | Already above the reading base                  |
| heading-4; body; label; code |                         16 / 1 |         24 |              16 / 1 |             24 / 1.5 | 1.000 | Already meets the base policy                   |
| heading-5                    |                    13 / 0.8125 |         20 |     **14 / 0.875†** |      **20 / 1.4286** | 1.077 | Meet the secondary floor                        |
| heading-6                    |                     10 / 0.625 |         16 |      **12 / 0.75†** |      **20 / 1.6667** | 1.200 | Meet the smallest semantic floor                |
| supporting — gothic/matcha   |                    13 / 0.8125 |         20 |     **14 / 0.875†** |      **20 / 1.4286** | 1.077 | Readable secondary copy                         |
| supporting — Y2K             | 12px literal / 0.75 equivalent |     ≈18.46 |     **14 / 0.875†** |      **20 / 1.4286** | 1.167 | Replace Y2K's root-only 12px size in this state |

Y2K's root supporting leading is `1.5385` from its geometric scale; its separate
12px size override produces approximately 18.46px. A base of 16 does not by
itself meet every proposed semantic minimum.

### Complete raw scale projection and edge cases — FR4, FR5

Each cell is **desktop px (rem) → matching px (rem); M/D**. These are raw
primitives **before semantic floors**, not recommended small-copy sizes.

| Raw token          | Neutral/chocolate                | Butter/stone                     | Gothic/matcha/Y2K                |
| ------------------ | -------------------------------- | -------------------------------- | -------------------------------- |
| `--font-size-5xl`  | 42 (2.625) → 42 (2.625); 1.000   | 53 (3.3125) → 53 (3.3125); 1.000 | 61 (3.8125) → 61 (3.8125); 1.000 |
| `--font-size-4xl`  | 35 (2.1875) → 36 (2.25); 1.029   | 43 (2.6875) → 44 (2.75); 1.023   | 49 (3.0625) → 49 (3.0625); 1.000 |
| `--font-size-3xl`  | 29 (1.8125) → 30 (1.875); 1.034  | 34 (2.125) → 36 (2.25); 1.059    | 39 (2.4375) → 39 (2.4375); 1.000 |
| `--font-size-2xl`  | 24 (1.5) → 26 (1.625); 1.083     | 27 (1.6875) → 29 (1.8125); 1.074 | 31 (1.9375) → 31 (1.9375); 1.000 |
| `--font-size-xl`   | 20 (1.25) → 22 (1.375); 1.100    | 22 (1.375) → 24 (1.5); 1.091     | 25 (1.5625) → 25 (1.5625); 1.000 |
| `--font-size-lg`   | 17 (1.0625) → 19 (1.1875); 1.118 | 18 (1.125) → 20 (1.25); 1.111    | 20 (1.25) → 20 (1.25); 1.000     |
| `--font-size-base` | 14 (0.875) → 16 (1); 1.143       | 14 (0.875) → 16 (1); 1.143       | 16 (1) → 16 (1); 1.000           |
| `--font-size-sm`   | 12 (0.75) → 14 (0.875); 1.167    | 11 (0.6875) → 13 (0.8125); 1.182 | 13 (0.8125) → 13 (0.8125); 1.000 |
| `--font-size-xs`   | 10 (0.625) → 12 (0.75); 1.200    | 9 (0.5625) → 11 (0.6875); 1.222  | 10 (0.625) → 10 (0.625); 1.000   |
| `--font-size-2xs`  | 8 (0.5) → 10 (0.625); 1.250      | 7 (0.4375) → 9 (0.5625); 1.286   | 8 (0.5) → 8 (0.5); 1.000         |
| `--font-size-3xs`  | 7 (0.4375) → 8 (0.5); 1.143      | 6 (0.375) → 7 (0.4375); 1.167    | 7 (0.4375) → 7 (0.4375); 1.000   |
| `--font-size-4xs`  | 6 (0.375) → 7 (0.4375); 1.167    | 5 (0.3125) → 6 (0.375); 1.200    | 5 (0.3125) → 5 (0.3125); 1.000   |

Steps −3, −4, and −5 have no generated semantic leading, weight, or tracking of
their own; those are not missing values to invent. Leave the primitive values
intact, but do not select them for default readable UI copy. Explicit consumer
sizes can bypass the semantic floors and need their own accessibility judgment.

In particular, butter/stone raw `xs` stays 11 and `sm` stays 13 while semantic
heading-6 becomes 12 and heading-5/supporting become 14. Gothic/matcha/Y2K raw
`xs` stays 10 and `sm` stays 13 with the same semantic floors.

Pin caps **growth relative to a theme anchor**, not the number of lines in a
headline. A 61px display can still require substantial wrapping; do not silently
shrink it to force one line. Arbitrary custom themes with ratios above 1.25 are
outside this automatic profile. The existing explorer suggests lower anchors
for those ratios—heading-2 below 1.414, heading-3 at or above it—but that is
exploration guidance, not authorization for custom caps. Such a profile needs
explicit endpoints and readable semantic defaults. [Explorer][Mobile-explorer]

### Leading, weights, and tracking — FR6

The reference outputs use unitless leading, including body `1.5` (16/24),
secondary `1.4286` (14/~20), and smallest semantic heading `1.6667` (12/~20).
The existing final-size calculation targets 1.5 below 20px, 1.4 below 32px, and
1.25 above that, with a four-reference-pixel line grid and at least four pixels
of headroom. Snapping means the final ratio need not equal its tier target.
The plan records the precise reference calculation for reproducibility; the
observable endpoints above remain the requirement. [Scale][Scale]

A floor changes both size and leading; retaining an incompatible old leading
while raising only size is not the specified output. Unitless leading scales
with user preferences instead of fixing the line box in pixels. Actual scripts
and fallback fonts still need rendered verification.

| Roles                                      | Preserved weight                                                                       | Tracking/family treatment                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| display-1, display-2, display-3            | Normal / 400 defaults and explicit overrides                                           | Preserve each component's display family; no new negative tracking    |
| heading-1, heading-2, heading-5, heading-6 | Semibold / 600 defaults                                                                | Preserve heading family; no mobile-only all-caps or letter-spacing    |
| heading-3, heading-4                       | Bold / 700 in neutral, chocolate, butter, stone, gothic; semibold / 600 in matcha, Y2K | Preserve existing theme emphasis                                      |
| body, code, supporting                     | Normal / 400                                                                           | Preserve body/supporting tracking and code's monospace family/spacing |
| large                                      | Semibold / 600                                                                         | Preserve emphasis and final-size leading                              |
| label                                      | Medium / 500                                                                           | Do not tighten tracking to force old widths                           |

These are the current theme role configurations and weight tokens, not new
mobile weights. **No mobile tracking adjustment is proposed.** A later
font-specific optical adjustment needs its own design decision and evidence.
[Themes][T-neutral] [Tokens][Tokens] [Text styles][Text-styles]

### Author selection, inheritance, and escape hatches — FR8, FR10

Selecting a covered first-party theme selects the profile after upgrade. A
separate custom theme may adopt an equivalent profile through the existing
`adaptations.rules[].value` surface; the generic scale API stays theme-agnostic.
Semantic `Text type=…`, `Heading level=…`/`type=…`, and existing themed prose
consumers follow their semantic tokens. Authors must not change semantic HTML to
obtain a different mobile font size. [Text][Text] [Heading][Heading]

Public customization continues to use AST-012, not resolved private metadata.
For example, a deliberately dense neutral-derived theme can restore its desktop
scale using a later rule:

```ts
const denseNeutral = defineTheme({
  name: 'dense-neutral',
  extends: neutralTheme,
  adaptations: {
    rules: [
      {
        when: {width: {below: 'md'}, pointer: 'coarse'},
        value: {typography: {scale: {base: 14, ratio: 1.2}}},
      },
    ],
  },
});
```

This is an explicit opt-out, **not** the recommended reading default. A theme
with literal semantic pins must also restore those pins for exact root parity.
`rules: []`, an empty value, or a root-only typography override does not remove
inherited matching behavior. The same ordering lets an author preserve larger
custom matching values. [AST-012][AST012]

A literal component declaration such as `fontSize: '18px'` remains literal;
this profile does not convert it. In contrast, `Text size="lg"` overrides the
semantic type choice but still reads `--font-size-lg`, which can change with the
profile. The named `xsm` prop reads `--font-size-xs`; it is **not** the smallest
named prop—`2xs`, `3xs`, and `4xs` also exist. None is a freeze-to-desktop switch.
[Text implementation][Text] [Text styles][Text-styles]

Unrelated pixel geometry is unchanged, including explicit comfortable spacing
and size values in Y2K. The deliberate exceptions are butter/stone/Y2K's root
`--text-supporting-size: '12px'` pins: the matching semantic profile supersedes
those with `0.875rem`, while preserving their original nonmatching values.
Changed intrinsic widths, wrapping, or row heights do not mean spacing tokens
were rewritten.

### CSS, JavaScript observation, and server rendering — FR7–FR9

CSS carries both endpoint sets. No browser resize observer, DOM class switch, or
React state is needed to change text metrics. The named breakpoint resolves to
a numeric CSS-pixel condition; CSS custom properties are not substituted inside
the media-query condition. Existing theme boundaries and media-surface precedence
remain intact. [AST-012][AST012] [Theme application][Theme-application]

No new mobile export is needed. The existing public hook is:

```ts
useMediaQuery(query: string, serverDefault = false): boolean
```

A diagnostic may observe the exact combined query with the effective `md` and a
server default of **false**. Its boolean must not decide text content, heading
levels, or required actions. A one-shot non-React observation guards `window`
and `matchMedia` and returns false when unavailable. The plan contains an
optional documentation-local helper, not a proposed core API. This work does
not extend the existing hook's browser contract to arbitrary DOM shims.
[Hook evidence][Media-hook]

Server rendering must not infer pointer capability from UA. With the correct
scope attribute and built theme CSS included in the initial document, the
browser selects the matching typography before hydration even though a
JavaScript server snapshot is false. Hydration keeps markup and metrics stable;
a diagnostic update does not remount content or cause a second correction.

**Runtime injection alone is not pre-hydration evidence.** The inspected unbuilt
runtime theme injects styles in `useInsertionEffect`; first-paint/no-JavaScript
verification therefore uses the built-CSS path. Runtime/built parity is a
separate assertion. JavaScript `useTheme` and server-safe token reads continue
to expose root values under AST-012. A responsive typography probe inspects
actual computed CSS, not `theme.tokens`. [Theme runtime][Theme-runtime]

### Combined outcome — FR1–FR11

The browser's root preference establishes rem; the selected theme supplies its
normal values; the **narrow AND coarse-primary** predicate selects the Pin
outputs and semantic floors; existing ordered author overrides retain their
normal precedence. These are observable dependencies, not a required private
execution architecture.

At a 16px root:

- Neutral, 390px/coarse: body **16/~24**, Display 1 **42/~52**, supporting
  **14/~20**.
- Neutral, 390px/fine: body **14/~20**, Display 1 **42/~52**; ordinary responsive
  reflow still applies.
- Butter, 390px/coarse: body **16/~24**, `Text` Display 1 **53/~68 with Sarina**,
  supporting **14/~20** under the proposed floor extension.
- Butter, 1024px/coarse: root body remains **14px**. An iOS text-entry control may
  independently retain its existing 1rem safeguard.
- Gothic, 390px/coarse: body and display remain **16px** and **61px**;
  heading-6 becomes **12px** under the proposed extension.

With a 20px root, the first Neutral example has body 20px, Display 1 52.5px, and
supporting 17.5px. The 768 CSS-pixel breakpoint is not rewritten by that root
change. Page zoom can instead change available viewport width and the rendered
scale without doubling every computed `font-size`; verify the rendered outcome,
not a simplistic computed-size assertion.

### Platform support

- **Supported feature/engine floor:** inherit the current rolling Baseline,
  Baseline-minus-two reduced tier, and explicit latest-stable desktop Chrome and
  iOS Safari support from [AST-013][AST013]. This profile does not raise the
  browser floor. It needs CSS custom properties/rem, the existing theme scoping
  support, and the specified width/pointer media conditions. Generated support
  rows belong to the canonical [Browser Support guide][Browser-support], not a
  handwritten browser-version table in this record.
- **Unsupported behavior:** an unavailable/nonmatching predicate must not throw
  or guess a device; normal root typography remains usable. Below AST-013's
  supported tiers there is no new support promise. Within a supported tier,
  missing behavior cannot silently be relabeled as unsupported: equivalent
  behavior or an explicitly documented, approved reduced fallback must preserve
  the task, content, focus, cleanup, and accessibility obligations of AST-013.
- **Browser evidence:** numeric and source checks establish deterministic
  endpoints, not layout/paint. Real-browser evidence is needed for wrapping,
  scope/cascade, first paint, hydration presentation, and dynamic media changes.
  An iOS Safari or focus-zoom claim needs actual iOS Safari evidence; Chromium or
  Playwright WebKit is not a substitute. Compatibility, explicit support, and
  current test coverage remain different facts. This specifies evidence, not a
  CI lane or workflow topology.

## Current-state impact

### Existing-owner and implementation evidence

The evidence snapshot is the public Astryx source at
`9057ebe308c1625b587927583654f5a2ef391e80`. **[Verified]** Historical
[PR #6699][PR], “feat(themes): pin type scale on touch + narrow viewports,” adds a
scale adaptation to neutral, chocolate, butter, and stone, their four CLI source
copies, four theme-test files, and one Changeset: thirteen files total. It does
not change the reset, core scale generator, or gothic/matcha/y2k.

That historical implementation uses:

```ts
when: {pointer: 'coarse', width: {below: 'md'}}
// neutral/chocolate value: typography.scale = {base: 16, ratio: 1.1736}
// butter/stone value: typography.scale = {base: 16, ratio: 1.2225}
```

It does **not** contain the six explicit size/leading floor writes for
butter/stone or floor-only rules for gothic/matcha/y2k. Neutral/chocolate reach
the proposed minima geometrically; butter/stone pure Pin has 13px heading-5 and
supporting, and 11px heading-6; the already-16 themes retain 13px heading-5 and
10px heading-6, with Y2K's literal 12px supporting exception. The additional
semantic safeguards are deliberately proposed here and must not be described as
implemented or tested merely because pure-Pin tests pass.

This snapshot and PR are **non-authoritative historical evidence**. Removing
this paragraph and the PR link would not change any requirement. No approval,
classification, rejection, or authorization of that PR follows from this draft.

Existing-owner research covered AST-012, the typography-hierarchy design draft,
[theme knowledge guidance][Theme-guidance], the current
[Neutral theme record][Neutral-record], and open work found by AST identifiers,
typography, mobile, Pin, and affected theme terminology. The separate
[mobile-spacing proposal #5868][Spacing-PR] addresses viewport-driven layout
spacing, not this primary-pointer typography policy. It is coordination context,
not authority for widening this record's scope.

### Affected surfaces and retained ownership

| Surface                                                       | Impact if the profile is adopted                                                                             | Boundary preserved                                                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First-party theme definitions and their package-local records | Mobile values, matching exceptions, theme-specific evidence, and migration descriptions for all seven themes | Themes retain ownership of identities, root choices, mappings, and receipts; their current records require owner-reviewed reconciliation where applicable |
| `architecture:theme-tokens`                                   | Reference the shared profile and distinguish primitive values from semantic-floor projections                | No new token vocabulary or document-root interpretation                                                                                                   |
| `architecture:theme-authoring-contract`                       | Reference the first-party default profile and existing author opt-out path                                   | No new field, inheritance model, or private helper requirement                                                                                            |
| `architecture:theme-compilation`                              | Verify equivalent runtime/built/scaffolded observable output                                                 | Existing compilation, validation, and artifact contracts remain the owner                                                                                 |
| `architecture:theme-application`                              | Verify scope, nested/portal application, media-surface precedence, and first-paint behavior                  | No second responsive state owner or theme-boundary model                                                                                                  |
| `design:typography-hierarchy`                                 | Coordinate human visual review and, when appropriate, backlink the adopted numeric policy                    | Qualitative hierarchy remains design-owned; a draft is not retroactive approval                                                                           |
| `typography` consumer guide                                   | Explain root versus base, all role endpoints/floors, and raw-size exceptions                                 | Usage belongs in consumer documentation, not duplicated review policy                                                                                     |
| `theme` consumer guide                                        | Explain the predicate, inheritance/opt-out, compatible builds, and CSS-first behavior                        | Existing public syntax remains intact                                                                                                                     |
| CLI first-party theme sources                                 | Newly copied/scaffolded sources contain the same profile                                                     | Existing consumer copies are not silently rewritten                                                                                                       |
| Sandbox/Storybook examples                                    | Show actual first-party Pin-plus-floor profiles, long content, explicit sizes, and representative states     | Generic Lift/Pin/Custom exploration remains separate from product defaults                                                                                |
| Family and contributing records                               | No new family or contributor policy is proposed                                                              | AST-013, AST-017, and existing contribution rules remain unchanged                                                                                        |

Concrete source/test/output paths and optional helper sketches are in
[plan.md](plan.md). No core mechanism change is anticipated; that is an
implementation observation, not a requirement to retain particular filenames or
helpers. Existing current records must not be edited to depend on this draft
merely to imply adoption.

### Migration, versioning, and risk

[AST-017][AST017] and [CONTRIBUTING.md][Contributing] define the existing 0.x
coupling: a nonbreaking `[feat]` carries **patch**; `[breaking]` carries **minor**;
major is not the 0.x tier. Stable defaults and behavior count when the documented
released contract protects them. An additive, compatible profile may use
`[feat]`/patch; a real stable-contract break needs `[breaking]`/minor and migration
regardless of visual risk or adoption. No particular PR is classified here.
Pure specification changes publish no package update and need no Changeset.
[Knowledge guidance][Knowledge-map] [Changeset validation][Changeset-check]

An implementation's migration evidence should:

1. Name the environment and all affected themes/roles, intended wrapping changes,
   and unchanged paths.
2. Preserve supported core/theme dependency combinations, or explicitly classify
   any raised range/floor under AST-017. When using an adaptation-capable core,
   distribute rebuilt theme CSS with the matching module rather than silently
   dropping rules. The existing build's capability rejection is relevant
   evidence, not permission to narrow a stable range. [Build evidence][Build]
3. Rebuild adopting/inheriting custom themes and update newly distributed CLI
   sources. Previously copied themes require an explicit consumer source update.
4. Audit child root overrides, literal supporting pins, fixed-height text
   containers, and explicit sizes. A child root override alone is not an opt-out.
5. Provide the later-rule opt-out or concrete replacement guidance where needed.
   Do not invent a source codemod when there is no mechanical source migration,
   or use a document-root reset as rollback.
6. Describe every genuinely affected published package, including CLI sources or
   docs when changed, without adding entries solely for version-only fixed-group
   co-bumps.

Principal risks and their required evidence are:

- **Wrapping/density:** a 14→16 base can grow forms, rows, and cards. Verify
  flexible layouts and fixed-height consumers; do not shrink text to hide loss.
- **Semantic-floor scope:** five themes need explicit corrective floors, including
  three with an already-16 base. Human review must see those additional outputs.
- **Theme identity:** scale changes must not overwrite existing component-family
  pins or explicit Heading weights; verify real computed families and weights.
- **Aliases and scope:** overriding only a descendant raw property may not retarget
  a semantic alias already resolved on an ancestor. Verify actual semantic text,
  nested themes, and competing surface rules, not only raw property strings.
- **Literal supporting pins:** preserve nonmatching 12px values and old leading,
  but apply the deliberate matching size/leading pair.
- **Hybrid devices:** browser primary-pointer reporting can change or remain stable
  after connecting a mouse. Query results, not hardware names, determine state.
- **Decorative displays:** a pinned 61px display remains large; long and translated
  content must wrap and remain available.
- **Stale CSS/version skew:** generated CSS, runtime modules, inherited metadata,
  and copied sources need equivalent behavior and supported version pairing.
- **Accessibility:** floors are not proof of contrast, script fit, zoom, or text
  spacing. Preserve the independently required checks.

### Identifier and evidence provenance

`AST-049` is a **draft placeholder**, not an allocation by a maintainer. This
candidate was initially drafted as AST-048 after an inventory through
[AST-047][AST047-tree]. A fresh pre-submission inventory on September 29, 2026
found that public main at `1ffe66db85490c7c6b9fa4378e18183a66eff2f9` now contains
[AST-048, Build recommendation](https://github.com/facebook/astryx/blob/1ffe66db85490c7c6b9fa4378e18183a66eff2f9/docs/specs/AST-048-build-recommendation/spec.md),
so this candidate and its plan were renumbered to AST-049. The fixed typography
source snapshot still contains AST numbers only through AST-043; open
[PR #6042][AST044-PR] already occupies AST-044. The exact AST-049 open-PR search
returned no match at that pre-submission check. No reservation service or
allocation rule was found in the inspected guidance, templates, or validator.
Recheck before a later submission and rename this spec, its plan, and references
together if necessary.

All source citations below are public, revision-pinned evidence. The external
Gestalt snapshot is independent of the Astryx snapshot. Proposed outcomes are
labeled separately from source observations and computed projections.

## Verification

Verification proves the observable claims; it neither adopts this draft nor
prescribes the private implementation or CI structure producing the evidence.
The executable path inventory and suggested commands are in [plan.md](plan.md).

| Contract   | Verification                                                                                      | Representative states                                                                                     | Mutation or failure expectation                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| FR1, FR2   | Compare root/default values and rendered semantic sizes before and after the profile              | Seven themes; matching and all three nonmatching truth-table cells; unthemed core                         | A root reset, desktop base rewrite, or unexpected independent-theme change fails                                  |
| FR3        | Check actual CSS/media matching, exact predicate, and custom breakpoint inheritance               | 767, 768, 769px; a fractional width below md; valid custom md; coarse/fine/none                           | Inclusive upper edge, 767px approximation, width-only, pointer-only, or OR fails                                  |
| FR3        | Distinguish primary from secondary pointer and hover behavior                                     | Narrow fine-primary with secondary touch; coarse-primary with/without hover                               | `any-pointer`, hover gating, UA, or input-history substitution fails                                              |
| FR4        | Compare every raw endpoint with the public Pin definition and exact/rounded ratios                | Twelve steps × seven themes; both 14-base ratios; already-16 family                                       | Wrong anchor, intermediate rounding, lost step, fluid interpolation, or global 36px cap fails                     |
| FR4–FR6    | Check all semantic size/leading/weight outputs and raw/semantic separation                        | Fourteen roles × seven themes, including grouped roles and literal supporting exceptions                  | Missing role, incorrect size/rem/M/D/LH, or clamping raw xs/sm to semantic floors fails                           |
| FR5, FR6   | Verify final floored size and corresponding unitless leading                                      | Butter/stone and gothic/matcha/y2k h5/h6/supporting; neutral/chocolate need no correction                 | Removing one required floor or keeping an old incompatible leading fails                                          |
| FR6, FR8   | Inspect real computed family, weight, size, and leading on semantic and explicit cases            | Text and Heading; Sarina, Manufacturing Consent, Crimson Text pins; explicit Heading weight and Text size | Treating a Text-only family pin as a Heading override, or erasing authored emphasis, fails                        |
| FR7, FR9   | First-paint built-CSS fixture without JavaScript; server render and hydration; runtime comparison | Matching and nonmatching initial load; root and nested scopes                                             | Requiring hydration to correct font size, divergent markup, or runtime injection credited as no-JS proof fails    |
| FR7, FR8   | Cross the width and primary-pointer predicate in both directions and inspect content identity     | Loaded page; no content remount; nested themes, portal/root and onDark/onLight states                     | Stale metrics, leaked child/parent values, changed surface precedence, or DOM-content substitution fails          |
| FR8        | Exercise later child overrides, larger matching values, and explicit opt-out                      | Source and built bases; root-only override; empty rule list; literal semantic pins                        | Empty rules incorrectly erase inheritance, later values lose, or root-only override is described as opt-out fails |
| FR8, FR10  | Separate literal size/geometry from token-backed explicit sizes                                   | Literal 18px style; `Text size="lg"`; xsm/2xs/3xs/4xs; Y2K spacing                                        | Automatically scaling fixed pixels or promising fixed pixels for named token sizes fails                          |
| FR9        | Compare source, built CSS/module, runtime output, and newly scaffolded sources                    | All changed first-party themes and a derived theme                                                        | Missing metadata/rules, drifted copied source, or silent adaptation loss fails                                    |
| FR9        | Verify diagnostic observation and unchanged JavaScript token semantics                            | SSR false default; media changes; cleanup; root token reads                                               | Responsive snapshots fabricated from `theme.tokens`, a server UA branch, or unremoved subscriptions fail          |
| FR10, FR11 | Actual-browser forms and layout/paint evidence                                                    | Narrow/wide iOS input focus, Android reading profile, dense rows, wrapped labels                          | Width-gating the separate input safeguard, clipping text, or shrinking unrelated control geometry fails           |
| FR11       | Text preferences, enlargement, reflow, spacing, keyboard, and script fixtures                     | 16px/20px root; loaded/fallback fonts; Latin, Arabic, CJK, tall combining marks                           | Lost content/actions, clipped lines, forced no-zoom, broken labels or heading semantics fails                     |
| FR12       | Released-consumer and package-range compatibility evidence; migration/Changeset check             | Supported stable usage, genuinely changed packages, unchanged public syntax                               | Calling a stable-contract break `[feat]`, ignoring a narrowed range, or omitting concrete migration fails         |

### Acceptance checklist

- [ ] The adopted profile's exact claims and human decision are explicit; current
      mechanism records and historical PRs are not misrepresented as numeric approval.
- [ ] Root font-size, unthemed defaults, and all nonmatching theme values are
      unchanged, including literal supporting-size/leading exceptions.
- [ ] All 98 semantic theme/role cases and all 84 raw theme/step cases match the
      projections; Display 1 is 42/53/61px-reference for the listed families.
- [ ] Semantic floors have the final-size unitless leading, without a raw-token
      clamp, invented aliases, or new mobile tracking.
- [ ] Theme families, Text-only display pins, weight distinctions, HTML headings,
      labels, and explicit author overrides remain correct.
- [ ] Only narrow AND coarse-primary matches; 768px is excluded and effective
      custom md, fractional widths, primary/secondary input, and hover cases are covered.
- [ ] CSS responds in both directions without typography-state rendering or a
      remount; built CSS paints correctly with JavaScript disabled.
- [ ] Server/hydration markup agrees and diagnostic observation does not correct
      presentation after hydration or pretend root token reads are responsive.
- [ ] Nested/portal and media-surface behavior, ordered child overrides, larger
      matching custom values, and a deliberate opt-out have rendered evidence.
- [ ] Literal explicit font sizes and unrelated geometry remain authored values;
      token-backed `Text size` is documented accurately.
- [ ] All distributed source/built/runtime forms and newly copied CLI themes agree,
      with supported package versions and no silent rule loss.
- [ ] Real-browser evidence covers wrapping, computed typography, text settings,
      zoom/reflow, user spacing, controls, and the actual browsers named by claims.
- [ ] Release notes and any Changesets describe the complete adopted scope and
      follow AST-017; no package release is implied by this spec-only document.

### Browser, visual, and device evidence

For every first-party theme, use supported light/dark states, with Gothic's
supported dark presentation:

- Widths **320, 390, 600, 767, 768, 769, and 1024 CSS px**, plus fractional-edge
  or zoom evidence where observable. Test coarse-primary and fine-primary;
  record actual query results instead of relying on a mobile UA/viewport label.
- All fourteen roles in short and multiline content, bare themed prose, explicit
  Text size, explicit Heading weight, and real label/control relationships.
- Root reference 16px and a larger preference such as 20px, production fonts
  loaded and fallback states, long translated headings, supporting messages,
  monospace code, dense rows, and button/label compositions.
- Runtime and built CSS, root/nested/portal content, and transitions across the
  predicate in both directions. Capture computed font-size, line-height,
  font-weight, and font-family on the actual elements, with before/after pixels.

Manual/browser-specific evidence includes:

1. **Actual iOS Safari:** portrait and both sides of a landscape threshold;
   TextInput/TextArea focus; no new focus-zoom regression; browser text settings;
   pinch zoom remains available.
2. **Android Chrome:** portrait/landscape and text scaling. The reading profile
   applies independently of the iOS-specific input support condition.
3. **Tablet Safari/Chrome:** wide coarse and narrow split-view; connect a
   trackpad/mouse and record the browser's real primary-pointer report.
4. **Touch laptop and desktop mouse:** wide and resized narrow windows, including
   fine-primary with a secondary touchscreen.
5. **Keyboard and assistive technology:** stable heading outline, labels, focus
   order, selection, and access to reflowed content.
6. **Accessibility stress:** 200% text enlargement; 400% page zoom/reflow producing
   approximately 320 CSS px from a suitable desktop viewport; user text spacing
   of 1.5 line-height, 2× font-size paragraph spacing, 0.12em letter spacing, and
   0.16em word spacing. Include long Latin text, Arabic, CJK, and a script with
   tall combining marks; preserve essential information and actions.

Nonmatching views should remain unchanged; matching views change only for the
profile or its intrinsic text reflow. Chromium and Playwright WebKit can provide
useful evidence but do not establish actual iOS Safari claims. Unavailable
browser/device evidence is **not yet verified**, never implicitly passed.

This draft contains source-derived and computed reference values. It does not
claim that the proposed floor implementation, rendered regressions, real-device
checks, or human approval have been completed. Structural/numeric document checks
and future implementation evidence are separate.

## Decision log

All entries below are **proposed decisions, not adopted rulings**. Human approval
is still required; no decider or approval date is inferred from existing code.

### DEC-1 — Use a 1rem mobile reading base without resizing the document root

**Reference:** `spec:AST-049/DEC-1`
**Decider:** Pending human decision; none recorded.

Propose the 16px-reference base only for matching first-party typography. This
improves normal reading while preserving browser preferences, unrelated geometry,
nonmatching density, and rem interoperability.

Rejected default: a global fixed-16px root, a 62.5% root convention, or changing
all desktop themes. Those alter unrelated consumers and root preferences rather
than solving the scoped reading problem.

### DEC-2 — Prefer Pin plus semantic floors to fluid scaling or a simple lift

**Reference:** `spec:AST-049/DEC-2`
**Decider:** Pending human design decision; none recorded.

| Approach                            | Reading base                             | Display outcome                      | Predictability/accessibility                                            | Proposed disposition                                 |
| ----------------------------------- | ---------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| Pin plus semantic floors            | Explicit 16px-reference base             | Per-theme Display 1 preserved        | Finite endpoints; rem respects preferences                              | Recommended                                          |
| Fluid `clamp()` with viewport terms | Can be bounded but needs another mapping | Continuously changing sizes/wrapping | More states; poorly authored viewport terms can offset zoom enlargement | Not the first-party default; separate product review |
| Unchanged root scale                | Four themes stay at 14px-reference       | Stable display                       | Leaves the matching reading problem unsolved                            | Nonmatching state or deliberate opt-out              |
| Lift to 16, retain full root ratio  | Readable base                            | 42→48 or 53→61px                     | Unnecessary growth at the largest end                                   | Not selected for this profile                        |

**External research boundary:** the inspected public [Gestalt typography
reference][Gestalt-doc] describes a finite 12/14/16/20/28/36 web scale, generally
14–16px and above for UI/long-form reading, smaller brief secondary copy, scalable
leading, and language support. Its [tokens][Gestalt-tokens] are role/size based.
That supports discrete, role-led typography; it does **not** establish that
Pinterest invented or publishes Astryx's anchor formula or this desktop/mobile
mapping. No such attribution is made.

Astryx's existing [mobile-type explorer][Mobile-explorer] already has the Pin
model: raise the base to at least 16 and re-derive the ratio around a selected
anchor, recommending Display 1 for ratios at or below 1.25. Its generic default
mode is Lift, it also offers Custom, and its generic Pin math does not include
these semantic floors. The proposed product profile is distinct from that tool's
exploration modes.

### DEC-3 — Define the typography environment as narrow AND primary-coarse

**Reference:** `spec:AST-049/DEC-3`
**Decider:** Pending human decision; none recorded.

Propose AST-012's exclusive `md` boundary and primary-pointer condition together.
This leaves resized fine-pointer desktops and roomy coarse-pointer tablets on
their existing typography without pretending to detect hardware identity.

Rejected: width-only, touch-only, OR, secondary-pointer matching, hover gating,
UA exceptions, and orientation/device-name heuristics. None expresses the same
independent width-and-primary-input requirement.

### DEC-4 — Add explicit 14px secondary and 12px smallest-semantic floors

**Reference:** `spec:AST-049/DEC-4`
**Decider:** Pending human design decision; none recorded. See OQ1.

Propose readable semantic minima separately from the raw ladder. Pure Pin reaches
them in neutral/chocolate, but not in butter/stone or the already-16 themes.
Explicit final size/leading pairs preserve both readability and raw-token
compatibility. The added endpoints are visibly marked in the tables.

Rejected default: calling an already-16 base sufficient, clamping every raw
primitive, changing size without leading, or treating these floors as implemented
because a geometric Pin test passes. This additional policy is reviewable
separately from the geometric mechanism and does not expand any historical PR by
assertion.

### DEC-5 — Keep CSS selection and existing author escape hatches

**Reference:** `spec:AST-049/DEC-5`
**Decider:** Pending human decision; none recorded.

Propose the existing theme/adaptation surface for selection and customization,
with initial built CSS and unchanged markup for first paint. Keep root-value
JavaScript token semantics, optional query observation, later child overrides,
and explicit component intent.

Rejected: a second responsive state owner in React, a new global mobile API,
UA-derived server markup, or deleting inherited private metadata. Those add
caller burden or break the existing cascade without improving the required
observable outcome.

## Open questions

- **OQ1 — Adopt the full semantic-floor extension?** (human-design) Recommended
  default: adopt the 14px-reference heading-5/supporting and 12px-reference
  heading-6 minima, including all five themes needing explicit corrections. Pure
  Pin remains a distinct smaller candidate but does not satisfy FR5. The chosen
  scope and reference outputs need an explicit human decision before promotion;
  this draft is not that decision.
- **OQ2 — Does a concrete implementation invalidate a documented stable use?**
  (checkable) Compare the proposed package updates with their latest stable
  consumer contracts and supported companion-version ranges under AST-017.
  Recommended classification only if compatible: `[feat]`/patch with clear visual
  and migration notes. If a released contract is broken, use `[breaking]`/minor
  and concrete migration. The result belongs to review of that implementation,
  not to a verdict in this system record.

The root strategy, predicate, Display 1 anchor for the listed scale families,
CSS-first presentation, and absence of fluid scaling are resolved
**recommendations**, not hidden implementation questions or already-approved
policy. Remaining numerical, cascade, and browser checks are verification work,
not choices to settle by inventing device rules.

[PR]: https://github.com/facebook/astryx/pull/6699
[T-neutral]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/neutral/src/neutralTheme.ts
[T-chocolate]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/chocolate/src/chocolateTheme.ts
[T-butter]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/butter/src/butterTheme.ts
[T-stone]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/stone/src/stoneTheme.ts
[T-gothic]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/gothic/src/gothicTheme.ts
[T-matcha]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/matcha/src/matchaTheme.ts
[T-y2k]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/y2k/src/y2kTheme.ts
[Probe]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/probe/src/probeTheme.ts#L1-L18
[Reset]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/reset.css#L63-L93
[Scale]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/theme/expandTypeScale.ts
[Tokens]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/theme/tokens.stylex.ts
[Adaptations]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/theme/themeAdaptations.ts
[Compiler]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/theme/generateThemeRules.ts
[Theme-runtime]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/theme/Theme.tsx
[Text]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/Text/Text.tsx
[Text-styles]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/Text/text.stylex.ts
[Heading]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/Heading/Heading.tsx
[TextInput]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/TextInput/TextInput.tsx#L60-L70
[TextArea]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/TextArea/TextArea.tsx#L97-L107
[Media-hook]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/hooks/useMediaQuery.ts
[Mobile-explorer]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/apps/sandbox/src/app/(sandbox)/pages/mobile-type/page.tsx
[AST012]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-012/spec.md
[AST013]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-013/spec.md
[AST017]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-017/spec.md
[Typography-design]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/design/typography-hierarchy.md
[Theme-guidance]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/themes/README.md
[Neutral-record]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes/neutral/neutral.spec.md
[Theme-application]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/architecture/theme-application.md
[Modality]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/architecture/interaction-modality.md
[Browser-support]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/cli/assets/docs/browser-support.doc.mjs
[Contributing]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/CONTRIBUTING.md#L560-L601
[Changeset-check]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/scripts/check-changesets.mjs
[Build]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/cli/api/theme/build/build.mjs
[Knowledge-map]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/README.md#L45-L118
[AST047-tree]: https://github.com/facebook/astryx/tree/e9fbd0f5eabe4bad19b1e1036bcd8b66fcaeb269/docs/specs/AST-047-navigable-output
[AST044-PR]: https://github.com/facebook/astryx/pull/6042
[Spacing-PR]: https://github.com/facebook/astryx/pull/5868
[Gestalt-doc]: https://github.com/pinterest/gestalt/blob/22874a7522d1803df992fae2bcb31ef42be29519/docs/pages/foundations/typography.tsx
[Gestalt-tokens]: https://github.com/pinterest/gestalt/blob/22874a7522d1803df992fae2bcb31ef42be29519/packages/gestalt-design-tokens/tokens/vr-theme/base/text/font.json
