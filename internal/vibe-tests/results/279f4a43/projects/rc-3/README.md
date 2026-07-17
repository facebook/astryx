# shadcn/ui Baseline

This project uses shadcn/ui components with Tailwind CSS.

## Component Source

All components live in `components/ui/`. Read the source to understand props, variants, and usage:

```bash
ls components/ui/                    # list all components
cat components/ui/button.tsx         # read a component's source
```

Components use:

- `cva` (class-variance-authority) for variant definitions
- `cn()` from `@/lib/utils` for class merging
- Radix UI primitives for behavior
- Tailwind CSS utility classes for styling

## Import Pattern

```tsx
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
```
