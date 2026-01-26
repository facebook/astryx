# XDS Theming Gaps

## Summary

| Component | Token Usage | Component Override |
|-----------|:-----------:|:------------------:|
| Button | Good | ✅ |
| XDSCard | Good | ✅ |
| Tooltip/HoverCard | Partial | ⚠️ |
| TextInput | Good | ❌ |
| TextArea | Good | ❌ |
| CheckboxInput | Good | ❌ |
| Field/FieldLabel | Good | ❌ |
| Avatar | Partial | ❌ |
| Skeleton | Good | ❌ |

## Missing Component Overrides

Components needing `theme.components.X` support:
- CheckboxInput
- TextInput / TextArea
- Field / FieldLabel
- Avatar
- Skeleton

## Hardcoded Values

| Property | Value | Components |
|----------|-------|------------|
| Font size | `0.875rem`, `0.75rem` | All |
| Font weight | `500`, `400` | Button, Field |
| Line height | `1.429` | TextInput, TextArea, Button |
| Border width | `1px` | TextInput, TextArea, Checkbox |
| Checkbox size | `24px` | CheckboxInput |
| Checkmark color | `white` | CheckboxInput |
| Focus outline | `2px` | All focusable |
| TextArea min-height | `80px` | TextArea |

## Suggested Tokens

```typescript
'--font-size-body': '0.875rem',
'--font-size-caption': '0.75rem',
'--line-height-body': '1.429',
'--font-weight-regular': '400',
'--font-weight-medium': '500',
'--border-width-thin': '1px',
'--border-width-focus': '2px',
'--checkbox-size': '24px',
'--textarea-min-height': '80px',
```

## Checklist

- [ ] Add component override support to CheckboxInput, TextInput, TextArea, Field, Avatar, Skeleton
- [ ] Create typography tokens
- [ ] Create border tokens
- [ ] Replace hardcoded `50%` with `--radius-rounded` in Avatar
- [ ] Replace hardcoded `white` with color token in CheckboxInput
