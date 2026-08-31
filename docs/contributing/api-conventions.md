# API conventions for contributors

Use this guide to shape a public component API before review. This page is a
practical projection. It does not create policy. If it conflicts with a current
owner record, follow the owner record and fix this guide.

This repository guide is the maintained contributor reference. The public wiki
may provide an overview and rationale, but it should link here instead of keeping
a second copy of these conventions.

## Start with the owner

Use only records whose front matter says `authority: current`. Read the narrowest
owner first when one is linked or easy to find. Human contributors do not need to
understand or edit the spec system to contribute; reviewers and maintainers route
new decisions and record final rulings.

1. The component's `<Name>.spec.md`, when one exists beside its code in
   [`packages/core/src/`](../../packages/core/src/), owns component behavior.
2. A current contract under [`docs/families/`](../families/) owns behavior shared
   by sibling components.
3. Current architecture and accepted system decisions own cross-component rules.
   Start with the [public component API architecture](../architecture/public-component-api.md),
   the [knowledge contract](../architecture/knowledge-contracts.md), and
   [AST-002: public API admission and operation shape](../specs/AST-002/spec.md).

The `owners` field names who can settle a missing decision. Component source and
its public `index.ts` own the shipped API. The component's `.doc.mjs` owns exact
consumer syntax and reference material. The component spec owns local semantic
API meaning and guarantees, including public hooks or utilities it explicitly
co-owns.

The wiki gives broader background: [API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)
and [API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration).
Do not copy detailed decisions from those pages into a proposal. Link the current
owner instead.

## Separate semantic contract from syntax reference

Every public-facing API addition or semantic change updates its canonical owning
component, family, architecture, or system record. Update the component spec only
when it owns the changed component-local semantics or explicitly co-owns the
public hook or utility. The owning record describes what callers mean, observe,
and may rely on; `.doc.mjs` remains the authority for signatures, prop/reference
tables, and consumer usage. Do not turn the semantic contract into a second
syntax catalog.

A component spec inherits every applicable rule from its current family
contracts. Record only component-local concepts, additions, and explicit
exceptions. Link an exception to its approving decision instead of copying or
rewriting the family rule.

A component spec may co-own a colocated public hook or utility when that ownership
is explicit. Its local semantic contract covers:

- inputs and options, including meaning, defaults, invalid values, and unsupported
  combinations;
- outputs and operations, including observable results and guarantees; and
- side effects, identity, lifetime, resource ownership, and cleanup where relevant.

Link a different canonical owner for any public surface the component spec does
not own.

## Name one concept at a time

| Surface                      | Convention                              | Example                       |
| ---------------------------- | --------------------------------------- | ----------------------------- |
| Component                    | Unprefixed PascalCase                   | `Button`, `TextInput`         |
| Props type                   | `<Component>Props`                      | `ButtonProps`                 |
| Public hook                  | `use<Name>`                             | `usePopover`                  |
| Boolean state                | `is<Name>`                              | `isDisabled`                  |
| Boolean capability           | `has<Name>`                             | `hasClear`                    |
| Uncontrolled boolean default | `defaultIs<Name>` or `defaultHas<Name>` | `defaultIsOpen`               |
| Synchronous callback         | `on<Verb>`                              | `onChange`                    |
| Disambiguated callback       | `on<Verb><Scope>`                       | `onSidebarCollapsedChange`    |
| Transition Action            | `<verb>Action`                          | `changeAction`, `clickAction` |
| Logical direction            | `start` or `end`                        | `startIcon`, `paddingEnd`     |

Use callback scope only when the verb could refer to more than one part. Use an
`html` prefix only for a native attribute that passes through unchanged, such as
`htmlName`. Keep the clearer semantic name when the component owns the concept.

String values use `camelCase`. A prop should control one independent concept.
Do not combine unrelated states into one convenience mode.

## Callbacks and Actions

A callback reports an event synchronously. An Action starts transition-aware
work. The Action name never starts with `on`.

`changeAction` does not replace `onChange`. A component may support either or
both. When both are present, run the callback first. Run the Action afterward
unless the component's public event contract lets the consumer cancel it.

```tsx
interface SearchInputProps {
  value: string;
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  changeAction?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
}

const [, startTransition] = React.useTransition();

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  const nextValue = event.currentTarget.value;
  onChange?.(nextValue, event);

  if (changeAction && !event.defaultPrevented) {
    startTransition(() => changeAction(nextValue, event));
  }
}
```

Do not name the Action `onChangeAction`. Do not require every input callback by
category. Requiredness follows the component's usable-state, control, and
accessibility contract.

When a component and a consumer both handle the same React event, compose the
handlers deliberately. Put the consumer first only when the public contract
promises that `preventDefault()` cancels built-in behavior.

```tsx
const handleClick = composeEventHandlers(onClickProp, selectItem);
```

If cancellation is not promised, preserve the component's required behavior and
state that order in its contract and tests.

## DOM props, styling, and refs

Extend [`BaseProps`](../../packages/core/src/BaseProps.ts) only when the component
owns a stable DOM element. A component that only coordinates children or returns
multiple unrelated roots should expose the smaller contract it actually owns.

For a DOM-owning component:

- type `BaseProps` with the contract element and accept `ref` as a React 19 prop;
- remove native names that collide with component concepts by using `Omit`;
- forward neutral `data-*`, ARIA, DOM, and event props to the contract element;
- keep component-owned role, accessibility, and behavior props from being
  overwritten; and
- merge `xstyle`, `className`, and `style` instead of choosing one.

```tsx
export interface PanelProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}

export function Panel({
  children,
  ref,
  xstyle,
  className,
  style,
  ...rest
}: PanelProps) {
  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('panel'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...rest}>
      {children}
    </div>
  );
}
```

Destructure styling and owned handlers before spreading `rest`. Use
`composeEventHandlers` when both sides need the same event. Set component-owned
contract props after `rest` so spread order cannot change semantics.

## Open visual vocabularies and closed axes

A theme-extensible visual vocabulary uses a public `*Map` interface in the
component subpath barrel. Derive the prop type from its keys.

```ts
// packages/core/src/Button/index.ts
export interface ButtonVariantMap {
  primary: true;
  secondary: true;
  ghost: true;
  destructive: true;
}

// packages/core/src/Button/Button.tsx
export type ButtonVariant = keyof ButtonVariantMap;
```

A theme can add a visual value through module augmentation of
`@astryxdesign/core/Button`. Keep behavioral and structural axes closed when a
theme must not invent new meanings. Examples include interaction modes,
directions, placement rules, and finite state-machine states.

Do not assume a nested `theme.components.button.variants` shape. Follow the current
[theme authoring contract](../architecture/theme-authoring-contract.md) for
component target and style-key overrides.

## Slots and composition

Prefer composition when content or child behavior has its own contract. A named
slot accepts the complete child and renders it directly.

```tsx
<AppShell
  topNav={<TopNav items={items} />}
  sideNav={<SideNav sections={sections} />}
/>
```

Do not hoist `SideNav` state or callbacks onto `AppShell`. Keep them on the child
that owns them. Use a render function only when the parent must provide item data
or context. Use a prop for a finite independent axis, not for a one-off product
recipe.

High-level compositions have a higher bar for new props than utility components.
Before adding a prop, check whether a child, slot, theme target, styling escape
hatch, parent layout, or existing context already owns the distinction.

## API proposal gate

Classify the change before asking for a new API decision. Use the current contract
review results from the [knowledge contract](../architecture/knowledge-contracts.md#change-coupling):
`preserves`, `settled`, `novel-human`, or `out-of-scope`.

A defect fix that restores a current contract or standard is `preserves`. Supply
focused regression evidence for the broken state and representative unchanged
states. Do not invent a semantic delta or new API decision. Change consumer docs
only when usage or a documented promise changes, or when the existing docs would
otherwise become false.

For a claimed API addition or semantic change, review has two stages:

1. **Mechanical pre-review.** Reject the change now when the pull request lacks a
   readable semantic before → after or does not update or add the canonical
   owning record. Component-local semantics update the component spec;
   family-, architecture-, or system-owned semantics update that owner instead.
   Also reject a public choice the component can derive or a parallel
   public/package-internal operation for the same semantic action. Within one
   module, keep one canonical operation name; the package-internal form may accept
   wider semantic options than the public contract. Another operation requires a
   genuinely distinct caller-owned intent and contract.
2. **Owner judgment.** For a surviving `novel-human` change, present the semantic
   delta to the linked owner. The gate does not choose the API. The owner accepts,
   rejects, or refines the meaning and the ruling is recorded in the canonical
   spec.

### Staged contract coverage

Semantic contract coverage is still incomplete, so the review path must not turn
missing `current` authority on the canonical owner into a dead end:

1. The contributor or maintainer puts the one-sentence semantic delta in the pull
   request, identifies the canonical owner by scope, and updates or adds that
   record. Component-local semantics use the component spec; shared family,
   architecture, or system semantics use that owner. A draft record is valid
   context and must identify its intended owner.
2. Review applies only current component, family, architecture, and system rules.
   A draft cannot clear the gate or be cited as settled policy; it routes the
   remaining `novel-human` delta to the owner.
3. The owner decides in the pull request. Exact-head owner approval settles that
   pull request only. The accepted contract and evidence remain in the canonical
   owning record; rejected direction is removed unless it protects a durable
   boundary.
4. Promote an owning record to `current` only after its local requirements,
   verification, relationships, approval, and every applicable acceptance
   prerequisite in current architecture are complete. For component specs, this
   includes the historical benchmark and pull-request enforcement required by the
   current knowledge contract. Only then may later reviews reuse it as `settled`
   policy.

A follow-up gate may mechanically reject missing `current` authority on a
canonical owning record only after a current policy change explicitly activates
enforcement for a named scope, that scope has current contract coverage, and the
historical benchmark has passed. Until then, missing current authority routes to
the staged owner path; it does not reject the API by itself.

Mechanical enforcement of this gate is follow-up work; this guide defines the
review contract, not gate implementation.

## API proposal checklist

Every public-facing API pull request has this minimum readable summary:

- **Owner:** link the canonical owning record and state its authority. Use the
  component spec only for component-local semantics; use the family, architecture,
  or system record when it owns the changed semantics. If the owner is draft or
  missing before this pull request, name the intended owner.
- **Semantic before → after:** state the caller-visible meaning and guarantee in
  one sentence.
- **Classification:** name `preserves`, `settled`, `novel-human`, or
  `out-of-scope`.
- **Representative syntax:** include it only when public syntax changes; the
  component `.doc.mjs` remains the complete syntax/reference authority.

Before requesting review:

- **Prove caller ownership.** Show two otherwise identical cases that need
  different outcomes, why the caller knows the difference, and why the component
  cannot derive it. This is the admission rule in
  [AST-002](../specs/AST-002/spec.md#dec-1--public-props-require-a-non-derivable-caller-distinction).
- **Update the semantic owner.** Update or add the canonical owning record.
  Component-local concepts belong in the component spec; shared family,
  architecture, or system concepts belong in that owner. Record inputs, options,
  defaults, invalid values and unsupported combinations, outputs, operations,
  guarantees, and relevant lifetime or resource obligations without copying
  inherited rules.
- **Prevent broken states.** Make statically knowable invalid combinations
  unrepresentable when practical. Otherwise document validation or warnings, or
  a safe fallback; do not silently render a broken state or block legitimate
  composition.
- **Check operation uniqueness.** Within one module, use the same canonical name
  for public and package-internal forms of one semantic action. The internal form
  may accept wider options; another operation requires distinct caller-owned
  intent.
- **Check the shared grammar.** Cover names, optionality, callback/Action order,
  cancellation, ref target, DOM pass-through, and whether each string axis is
  open or closed.
- **Protect compatibility.** State defaults and observable behavior. Include a
  migration for a released breaking change.
- **Ship API evidence together.** When consumer usage or a documented promise
  changes, update consumer docs, public exports, focused runtime and type tests,
  and representative integration coverage in the same pull request.

If two or three viable shapes remain after applying current conventions, use the
[API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)
process. Compare realistic consumer code across the relevant cases and put the
evidence in the pull request. Ask the owner to decide. A maintainer or review
agent records the final ruling in the owning spec. Keep the research procedure
out of architecture records.

## Common review smells

- A public API change has no semantic delta in its canonical owning record, so
  reviewers must infer meaning from implementation or syntax.
- One module gives the same semantic action separate public and package-internal
  operation names because an internal caller needs wider options.
- A prop exposes a value the component can derive from state, content, layout,
  context, or the platform.
- A high-level component accumulates tuning props or duplicates a child's state.
- Equivalent concepts use different names, such as `onChangeAction` instead of
  `changeAction`.
- An Action suppresses its callback, or handler order accidentally removes a
  promised consumer cancellation path.
- A callback is required only because all inputs were assumed to require it.
- A theme-extensible visual value is a closed union, or a behavioral axis is
  opened to theme augmentation.
- `BaseProps` is applied to a component without one stable contract element, or
  accepted DOM props never reach that element.
- `xstyle`, `className`, `style`, a ref, or an event handler is dropped or
  clobbered by spread order.
- A parent wraps slot content or mirrors props that belong to the slotted child.
- A proposal invents a nested `theme.components.button.variants` layer instead of
  using the current component target and style-key contract.
- A green docs parser is treated as full API proof. Parsing and selected drift
  checks do not prove export reachability, runtime behavior, ref targets,
  pass-through, handler composition, compatibility, or complete doc coverage.

When a current record conflicts with another current record, stop. Do not choose
by recency or specificity. Route the conflict to the canonical owner described in
the [knowledge contract](../architecture/knowledge-contracts.md#when-current-records-disagree).
