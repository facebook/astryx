# Component README Structure Guide

## Why This Matters

The XDS CLI's `extractBrief` function parses component READMEs to generate
LLM-friendly documentation. This documentation powers:

- **`xds component --brief-all`** — compact docs that LLMs use to discover and
  correctly use XDS components
- **Vibe tests** — automated evaluations of how well LLMs can build UIs with XDS
- **Developer experience** — `xds component <name>` shows formatted docs in the terminal

When a README doesn't follow the expected structure, the brief extractor can't
find props or examples. This means LLMs miss critical API details — for example,
`XDSText.type` (which controls the semantic HTML element) was invisible to LLMs
because the Text README used `### XDSText / XDSHeading` instead of separate
`### XDSText` and `### XDSHeading` sections.

## Validation

Run the validation script to check all READMEs:

```bash
yarn validate-readmes
```

This runs automatically in CI to catch issues before merge.

## Required Structure

### Single-Component Directories

For directories with one `XDS*.tsx` file (e.g., `Button/`, `Card/`, `Spinner/`):

```markdown
# ComponentName

Brief description of what the component does.

## Usage

\`\`\`tsx
import { XDSComponent } from '@xds/core/Component';

<XDSComponent variant="primary" />
\`\`\`

## Props

| Prop         | Type                         | Default       | Description           |
| ------------ | ---------------------------- | ------------- | --------------------- |
| \`variant\`  | \`'primary' \| 'secondary'\` | \`'primary'\` | Visual style          |
| \`size\`     | \`'sm' \| 'md' \| 'lg'\`     | \`'md'\`      | Size of the component |
| \`children\` | \`ReactNode\`                | —             | Content               |
```

**Requirements:**

- A `## Props` section
- A markdown table inside `## Props` with at least one `| \`propName\`` row

### Multi-Component Directories

For directories with multiple `XDS*.tsx` files (e.g., `Text/`, `Stack/`, `Dialog/`):

```markdown
# ComponentGroup

Brief description of the component group.

### XDSComponentA

Description of ComponentA.

\`\`\`tsx
import { XDSComponentA } from '@xds/core/ComponentGroup';

<XDSComponentA requiredProp="value">Content</XDSComponentA>
\`\`\`

| Prop             | Type                  | Default | Description            |
| ---------------- | --------------------- | ------- | ---------------------- |
| \`requiredProp\` | \`'a' \| 'b' \| 'c'\` | —       | Description (required) |
| \`children\`     | \`ReactNode\`         | —       | Content                |

### XDSComponentB

Description of ComponentB.

\`\`\`tsx
<XDSComponentB prop="value" />
\`\`\`

| Prop     | Type       | Default | Description |
| -------- | ---------- | ------- | ----------- |
| \`prop\` | \`string\` | —       | Description |
```

**Requirements for each component:**

- A `### XDSComponentName` heading (exact match — no slashes, no extra text)
- A markdown props table within that section
- At least one `\`\`\`tsx`or`\`\`\`jsx`code block with`<XDS` JSX usage

## Common Mistakes

### ❌ Combined headings

```markdown
### XDSText / XDSHeading
```

The extractor looks for exact `### XDSText` and `### XDSHeading` matches.
Combined headings are invisible to it.

**Fix:** Split into separate sections:

```markdown
### XDSText

...props table and example...

### XDSHeading

...props table and example...
```

### ❌ Props table outside the component section

```markdown
### XDSDialog

Description of Dialog.

## Props

| Prop | Type | Default | Description |
```

The `## Props` heading breaks out of the `### XDSDialog` section (it's a
higher-level heading). The extractor can't associate the table with the component.

**Fix:** Put the table directly under the `###` heading without a separate
`## Props` section:

```markdown
### XDSDialog

Description of Dialog.

| Prop | Type | Default | Description |
```

### ❌ Missing code example

```markdown
### XDSButton

| Prop        | Type       | Default | Description  |
| ----------- | ---------- | ------- | ------------ |
| \`variant\` | \`string\` | —       | Visual style |
```

The extractor needs at least one code example to show LLMs how the component
is used.

**Fix:** Add a code block before or after the props table:

```markdown
### XDSButton

\`\`\`tsx
<XDSButton variant="primary" onClick={handleClick}>Save</XDSButton>
\`\`\`

| Prop | Type | Default | Description |
```

### ❌ Code example without XDS JSX

```markdown
\`\`\`tsx
const items = data.map(item => <li>{item.name}</li>);
\`\`\`
```

The extractor looks for `<XDS` in code blocks to find component usage examples.

**Fix:** Include actual component JSX:

```markdown
\`\`\`tsx
<XDSList>
{data.map(item => (
<XDSListItem key={item.id}>{item.name}</XDSListItem>
))}
</XDSList>
\`\`\`
```

## CLI Warnings

When running `xds component --brief` or `--brief-all`, the CLI will print
warnings to stderr if it can't extract complete information:

```
⚠️  No props found for XDSText. Ensure README has a '### XDSText' section with a props table.
⚠️  No code example found for XDSText.
```

These warnings help you identify and fix README structure issues during
development without polluting the brief output itself.
