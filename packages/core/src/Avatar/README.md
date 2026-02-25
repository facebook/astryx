# Avatar

Avatar component for displaying user profile pictures with fallback support.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Image loading**: Primary and fallback image sources
- **Initials fallback**: Auto-generates initials from user name
- **Default icon**: Generic person icon when no image or name provided
- **Sizes**: tiny (20px), xsmall (24px), small (36px), medium (48px), large (128px), plus numeric pixel values
- **Status slot**: Corner position for status indicators or badges
- **Size-aware status dot**: Built-in `XDSAvatarStatusDot` that scales proportionally with avatar size
- **Accessible**: Proper role and aria-label support

## Usage

```tsx
import { XDSAvatar, XDSAvatarStatusDot } from '@xds/core/Avatar';

// With image
<XDSAvatar src="/user.jpg" name="John Doe" />

// Initials fallback
<XDSAvatar name="Jane Smith" size="large" />

// With size-aware status indicator
<XDSAvatar
  src="/user.jpg"
  name="John Doe"
  size="medium"
  status={<XDSAvatarStatusDot variant="positive" label="Online" />}
/>

// Status dot scales automatically across sizes
<XDSAvatar name="AB" size="tiny" status={<XDSAvatarStatusDot />} />
<XDSAvatar name="CD" size="large" status={<XDSAvatarStatusDot />} />

// Different variants for different contexts
<XDSAvatar name="EF" status={<XDSAvatarStatusDot variant="negative" label="Busy" />} />
<XDSAvatar name="GH" status={<XDSAvatarStatusDot variant="neutral" label="Away" />} />
```

## Props

### XDSAvatar

| Prop          | Type            | Default   | Description                          |
| ------------- | --------------- | --------- | ------------------------------------ |
| `src`         | `string`        | —         | Primary image source URL             |
| `fallbackSrc` | `string`        | —         | Fallback image when primary fails    |
| `name`        | `string`        | —         | User name for initials and alt text  |
| `alt`         | `string`        | —         | Alt text (falls back to `name`)      |
| `size`        | `XDSAvatarSize` | `'small'` | Avatar size (named or numeric)       |
| `status`      | `ReactNode`     | —         | Corner content for status indicators |
| `data-testid` | `string`        | —         | Test ID for testing                  |

### XDSAvatarStatusDot

| Prop      | Type                                    | Default      | Description                                         |
| --------- | --------------------------------------- | ------------ | --------------------------------------------------- |
| `variant` | `'positive' \| 'neutral' \| 'negative'` | `'positive'` | Semantic color variant of the dot                   |
| `label`   | `string`                                | —            | Accessible label for screen readers                 |
| `icon`    | `ReactNode`                             | —            | Icon centered inside the dot (hidden at tiny sizes) |

The status dot reads the avatar size from context and uses discrete size tiers:

| Avatar size | Dot size | Border |
| ----------- | -------- | ------ |
| ≤ 36px      | 8px      | 1px    |
| 40–72px     | 16px     | 2px    |
| ≥ 96px      | 24px     | 4px    |

## Fallback Cascade

1. `src` loads → show image
2. `src` fails → try `fallbackSrc`
3. `fallbackSrc` fails/missing → show initials from `name`
4. No `name` → show generic person icon

## Theming

Themes can override `Avatar` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    avatar: {
      root: myStyles,
      fallback: myStyles,
    },
  },
};
```

### Available surfaces

| Surface    | Description                        |
| ---------- | ---------------------------------- |
| `root`     | Root wrapper styles                |
| `fallback` | Fallback/initials container styles |

## Files

| File                      | Role     | Purpose                                    |
| ------------------------- | -------- | ------------------------------------------ |
| `index.ts`                | Entry    | Exports components and types               |
| `XDSAvatar.tsx`           | Core     | Avatar component implementation            |
| `XDSAvatarStatusDot.tsx`  | Sub-comp | Size-aware status indicator dot            |
| `XDSAvatarSizeContext.ts` | Context  | Internal context for passing size to slots |

## Implementation Notes

- Always circular shape (border-radius: 50%)
- Uses `color.deemphasized` and `color.textSecondary` for fallback background
- Initials extracted from first and last word of name
- `XDSAvatarSizeContext` provides the resolved numeric size to sub-components
- Status dot uses `CIRCLE_EDGE_OFFSET_RATIO` for positioning at the 45° point on the circle edge
