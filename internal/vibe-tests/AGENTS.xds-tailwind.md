# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- XDS-TAILWIND:START -->

[XDS + Tailwind v0.0.1]|IMPORTANT: Prefer retrieval-led reasoning. Run CLI to read docs before generating code.
|npx xds --detail compact component <Name> Docs (props, usage)
|npx xds component --list All components by category
|npx xds docs tokens Token reference (spacing, color, radius)
|npx xds docs theme Theme system: XDSTheme, custom themes, overrides, nesting
|RULE: Use XDS components for structure, behavior, and accessibility.
|RULE: Use Tailwind utility classes for layout, spacing, colors, and visual customization.
|RULE: All XDS components accept a `className` prop for Tailwind utilities.
|RULE: Do NOT use StyleX, stylex.create, or the xstyle prop. Use className with Tailwind instead.
|RULE: Import components from @xds/core/<ComponentDir> (e.g., @xds/core/Button, @xds/core/Text)
|PATTERN: <XDSCard className="max-w-md p-6"><XDSVStack className="gap-4">...</XDSVStack></XDSCard>
|PATTERN: Use Tailwind responsive prefixes: sm:, md:, lg: for responsive layouts
|PATTERN: Use Tailwind arbitrary values for XDS tokens: className="p-[var(--spacing-4)]"

<!-- XDS-TAILWIND:END -->

## Skill Doc

Read `.generated/xds-tailwind-skill.md` for the full component catalog, token reference, and usage patterns.

## Quick Start

```tsx
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function MyComponent() {
  return (
    <XDSCard className="max-w-md p-6">
      <XDSVStack className="gap-4">
        <XDSHeading level={2}>Title</XDSHeading>
        <XDSText className="text-gray-500">Description</XDSText>
        <XDSButton label="Submit" variant="primary" />
      </XDSVStack>
    </XDSCard>
  );
}
```
