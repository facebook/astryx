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
   [AST-002: public component prop admission](../specs/AST-002/spec.md).

The `owners` field names who can settle a missing decision. Component source and
its public `index.ts` own the shipped API. The component's `.doc.mjs` explains
that API to consumers.

The wiki gives broader background: [API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)
and [API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration).
Do not copy detailed decisions from those pages into a proposal. Link the current
owner instead.

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

## API proposal checklist

Before requesting review:

- **Find the owner.** Link the nearest current component, family, architecture,
  or system record when it is known. If it is not clear, explain the intended
  behavior normally; the reviewer routes the decision.
- **Prove caller ownership.** Show two otherwise identical cases that need
  different outcomes, why the caller knows the difference, and why the component
  cannot derive it. This is the admission rule in
  [AST-002](../specs/AST-002/spec.md#dec-1--public-props-require-a-non-derivable-caller-distinction).
- **Show the consumer API.** Include the default, configured or controlled,
  composed, edge, and migration cases that apply.
- **Check the shared grammar.** Cover names, optionality, callback/Action order,
  cancellation, ref target, DOM pass-through, and whether each string axis is
  open or closed.
- **Protect compatibility.** State defaults and observable behavior. Include a
  migration for a released breaking change.
- **Ship evidence together.** Update consumer docs, public exports, focused
  runtime and type tests, and representative integration coverage in the same
  pull request.

If two or three viable shapes remain after applying current conventions, use the
[API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)
process. Compare realistic consumer code across the relevant cases and put the
evidence in the pull request. Ask the owner to decide. A maintainer or review
agent records the final ruling in the owning spec. Keep the research procedure
out of architecture records.

## Common review smells

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
