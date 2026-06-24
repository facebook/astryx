# Vibe Test Job Taxonomy

When an LLM generates UI from a prompt, its output breaks down into distinct jobs. This taxonomy helps analyze token costs and identify optimization opportunities.

## Summary

### Input Token Sources

| Source              | Description                                 |
| ------------------- | ------------------------------------------- |
| **AGENTS.md**       | Component catalog and XDS guidance          |
| **Design docs**     | principles.md, tokens.md - styling patterns |
| **Component docs**  | Button.md, TextInput.md, etc.               |
| **Prompt overhead** | Task instructions and persona               |

### Output Token Jobs

| Job                      | Description                                 | Typical % |
| ------------------------ | ------------------------------------------- | --------- |
| **Component Routing**    | Import statements for XDS components        | 3-10%     |
| **Component Config**     | Props and attributes on XDS components      | 7-30%     |
| **Supplemental Styling** | StyleX blocks for layout/spacing gaps       | 10-27%    |
| **Content Authoring**    | HTML structure, JSX elements, copy          | 15-27%    |
| **Business Logic**       | useState, handlers, API calls, conditionals | 5-51%     |
| **Boilerplate**          | Type definitions, imports, exports          | 5-10%     |

## Jobs (Detailed)

### 1. Component Routing (~3-10% of output tokens)

**Import statements for XDS components**

```tsx
import {XDSTextInput} from '@astryxdesign/core/TextInput';
import {XDSButton} from '@astryxdesign/core/Button';
```

- Requires: Understanding component catalog, matching intent to components
- Input cost: Reading component docs, AGENTS.md index
- Failure modes: Wrong component choice, missing components, hallucinated components

### 2. Component Configuration (~7-30% of output tokens)

**Props and attributes on XDS components**

```tsx
<XDSTextInput
  label="Name"
  value={name}
  onChange={setName}
  isRequired
  placeholder="Enter your name"
/>
<XDSButton variant="primary" disabled={!isFormValid}>
```

- Requires: Understanding component APIs, valid prop values
- Input cost: Reading specific component docs (Button.md, TextInput.md, etc.)
- Failure modes: Hallucinated props, wrong prop types, missing required props

### 3. Supplemental Styling (~10-27% of output tokens)

**StyleX blocks for layout/spacing gaps**

```tsx
const styles = stylex.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    padding: 'var(--spacing-6)',
    backgroundColor: 'var(--color-background-surface)',
  },
});
```

- Requires: Understanding design tokens, StyleX patterns
- Input cost: Reading tokens.md, principles.md
- Failure modes: Hardcoded values (anti-pattern), hallucinated CSS variables, redundant CSS

### 4. Content Authoring (~15-27% of output tokens)

**HTML structure, JSX elements, copy**

```tsx
return (
  <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
    {/* structure */}
    <div>Main content goes here</div>
  </form>
);
```

- Requires: Understanding JSX, semantic HTML
- Input cost: Minimal (general knowledge)
- Failure modes: Accessibility issues, poor structure

### 5. Business Logic (~5-51% of output tokens)

**useState, handlers, API calls, conditionals**

```tsx
const [name, setName] = useState('');
const isFormValid = name.trim() !== '' && email.trim() !== '';

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (isFormValid) {
    console.log('Form submitted:', {name, email});
  }
};
```

- Requires: Understanding React patterns, state management
- Input cost: Minimal (general knowledge)
- Failure modes: Logic bugs, missing edge cases

### 6. Boilerplate (~5-10% of output tokens)

**Type definitions, imports, exports**

```tsx
import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';

export function RequiredFieldsForm() {
```

- Requires: Understanding module system, TypeScript
- Input cost: Minimal (general knowledge)
- Failure modes: Missing imports, incorrect paths

## Token Distribution by Prompt Category

| Category                 | Routing | Config | Styling | Content | Logic | Boilerplate |
| ------------------------ | ------- | ------ | ------- | ------- | ----- | ----------- |
| **state-driven**         | 8%      | 29%    | 20%     | 15%     | 19%   | 9%          |
| **integration-oriented** | 2%      | 7%     | 10%     | 24%     | 51%   | 5%          |
| **page-setup**           | 6%      | 26%    | 27%     | 27%     | 5%    | 10%         |

### Key Insights

1. **Integration-oriented prompts are logic-heavy** (51% business logic)
   - File uploads, API calls, complex state
   - Component configuration is minimal (7%)

2. **Page-setup prompts are balanced**
   - Equal parts styling, content, and config
   - Minimal business logic (5%)

3. **State-driven prompts emphasize configuration**
   - Form validation requires component props (29%)
   - Moderate business logic for state (19%)

## Input Token Costs by Job

| Job                  | Docs Required            | Est. Input Tokens |
| -------------------- | ------------------------ | ----------------- |
| Component Routing    | AGENTS.md index          | ~175              |
| Component Config     | Component docs (1-3)     | 300-2000 each     |
| Supplemental Styling | tokens.md, principles.md | ~1200             |
| Content Authoring    | None (general knowledge) | 0                 |
| Business Logic       | None (general knowledge) | 0                 |
| Boilerplate          | None (general knowledge) | 0                 |

## Full Token Usage Breakdown

The aggregate command shows a complete breakdown of token usage:

```
📊 Token Usage Breakdown:
  ┌─────────────────────────────────────────────────┐
  │ INPUT TOKENS (estimated from doc reading)       │
  ├─────────────────────────────────────────────────┤
  │   AGENTS.md:           173 tokens               │
  │   Design docs:         1200 tokens              │  (principles.md, tokens.md)
  │   Component docs:       800 tokens              │  (Button.md, TextInput.md, etc.)
  │   Prompt overhead:      375 tokens              │  (task instructions)
  │   ─────────────────────────────                 │
  │   Input subtotal:      2548 tokens              │
  ├─────────────────────────────────────────────────┤
  │ OUTPUT TOKENS (from job breakdown)              │
  ├─────────────────────────────────────────────────┤
  │   Component routing:       4%  (~48 tokens)     │
  │   Component config:       16%  (~195 tokens)    │
  │   Supplemental styling:   16%  (~188 tokens)    │
  │   Content authoring:      22%  (~263 tokens)    │
  │   Business logic:         34%  (~408 tokens)    │
  │   Boilerplate:             7%  (~86 tokens)     │
  │   ─────────────────────────────                 │
  │   Output subtotal:       1188 tokens            │
  ├─────────────────────────────────────────────────┤
  │ TOTAL:                   3736 tokens            │
  └─────────────────────────────────────────────────┘
```

### Input Token Categories

- **AGENTS.md**: Always read (~173 tokens) - component catalog and XDS guidance
- **Design docs**: tokens.md (~897) and principles.md (~283) - styling patterns
- **Component docs**: Varies by components used (300-2000 tokens each)
- **Prompt overhead**: Task instructions and persona (~375 tokens)

### Output Token Categories

Analyzed from generated code by parsing:

- Import statements → Component Routing
- XDS component JSX with props → Component Config
- `stylex.create()` blocks → Supplemental Styling
- HTML elements and structure → Content Authoring
- State hooks, handlers, logic → Business Logic
- Type definitions, exports → Boilerplate

## Timing

Timing is tracked per test and per category:

```
⏱️  Performance:
  Total time: 200.9s (avg 67.0s per test)

By Category:
  integration-oriented      100% (1/1) ⏱️70.1s
  page-setup                100% (1/1) ⏱️65.8s
  state-driven              100% (1/1) ⏱️65.0s
```

Timing is inferred from file timestamps (task creation → result write).

## Optimization Opportunities

### Reduce Component Config Tokens

- Better defaults in components = fewer props needed
- Compound components = less configuration

### Reduce Supplemental Styling Tokens

- More layout primitives = less custom CSS
- Better gap/spacing props = less StyleX

### Reduce Business Logic Tokens

- Provide hooks (useForm, useUpload) = less custom logic
- Built-in patterns = less boilerplate logic

## Measuring Job Quality

Each job can be evaluated independently:

| Job                  | Success Criteria               | Escape Hatch Types                     |
| -------------------- | ------------------------------ | -------------------------------------- |
| Component Routing    | Correct components chosen      | `wrong_component`, `hallucination`     |
| Component Config     | Valid props, no hallucinations | `hallucination`                        |
| Supplemental Styling | Uses tokens, not hardcoded     | `hardcoded_color`, `hardcoded_spacing` |
| Content Authoring    | Semantic HTML, accessible      | (not tracked)                          |
| Business Logic       | Works correctly                | (not tracked)                          |
| Boilerplate          | Correct imports                | (not tracked)                          |
