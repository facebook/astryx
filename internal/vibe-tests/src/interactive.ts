#!/usr/bin/env node
/**
 * @file Interactive vibe test runner for Claude Code
 *
 * Runs vibe tests using Claude Code subagents instead of API calls.
 * Results are stored in the same format as the automated harness.
 *
 * Usage:
 *   yarn workspace @xds/vibe-tests interactive
 *   yarn workspace @xds/vibe-tests interactive --sample 5
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import type {TestPrompt, Evaluation} from './types.js';
import {stratifiedSample} from './sampling.js';
import {
  generateIterationId,
  ensureDir,
  writeJson,
  readJson,
  timestamp,
  getResultsDir,
} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Install baseline docs (.baseline-docs/) for agent documentation
 */
function installBaselineDocs(): void {
  const vibeTestsDir = path.join(__dirname, '..');
  const baselineDocsDir = path.join(vibeTestsDir, '.baseline-docs');
  const agentsMdPath = path.join(vibeTestsDir, 'AGENTS.baseline.md');

  // Check if docs already exist and are recent
  if (fs.existsSync(baselineDocsDir) && fs.existsSync(agentsMdPath)) {
    const stats = fs.statSync(agentsMdPath);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < 60 * 60 * 1000) {
      return; // Less than 1 hour old, skip regeneration
    }
  }

  console.log('Installing baseline documentation...');
  ensureDir(baselineDocsDir);

  // Generate AGENTS.baseline.md
  const agentsMd = `# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- SHADCN:START -->
[baseline/ui Component Library]|root: ./.baseline-docs
|IMPORTANT: Prefer retrieval-led reasoning. Read docs from .baseline-docs/ before generating baseline code.
|principles.md: Key patterns, cn() utility, Tailwind usage
|tokens.md: Tailwind theme configuration
|layout: Card|Separator|Sheet|Tabs|ScrollArea|Collapsible|Resizable
|components: Button|Input|Label|Checkbox|Select|Switch|Slider|Textarea|Avatar|Badge|Calendar|Command|Dialog|DropdownMenu|HoverCard|Popover|Tooltip|Progress|Skeleton|Table|Toast
|theme: CSS variables via globals.css, dark mode via class strategy
|For component API: read .baseline-docs/{ComponentName}.md
<!-- SHADCN:END -->
`;
  fs.writeFileSync(agentsMdPath, agentsMd);

  // Generate principles.md
  fs.writeFileSync(
    path.join(baselineDocsDir, 'principles.md'),
    `# baseline/ui Principles

## Key Patterns

### cn() utility
Use \`cn()\` for conditional class merging:
\`\`\`tsx
import { cn } from "@/lib/utils"
<div className={cn("base-class", isActive && "active-class")} />
\`\`\`

### Component Structure
Components are copied into your project at \`components/ui/\`. Import from there:
\`\`\`tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
\`\`\`

### Tailwind First
All styling uses Tailwind utility classes. No CSS modules or styled-components.

### Composition over Configuration
Components are unstyled primitives. Compose them with Tailwind classes.

## cva (Class Variance Authority)
Define variants with cva:
\`\`\`tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
  }
)
\`\`\`

## Anti-patterns
- Don't use inline style objects (use Tailwind)
- Don't override component internals with CSS
- Don't skip the cn() utility for conditional classes
- Don't hardcode colors (use theme tokens)

## Layout Patterns
- Use flex/grid with Tailwind: \`flex gap-4\`, \`grid grid-cols-3\`
- Container with padding: \`container mx-auto px-4\`
- Stack with gap: \`flex flex-col gap-4\`
`,
  );

  // Generate tokens.md
  fs.writeFileSync(
    path.join(baselineDocsDir, 'tokens.md'),
    `# baseline/ui Theme Tokens

## CSS Variables (in globals.css)
\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
\`\`\`

## Usage in Tailwind
Reference with hsl():
\`\`\`tsx
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="border-border" />
\`\`\`

## Spacing (Tailwind default scale)
- p-0, p-1 (0.25rem), p-2 (0.5rem), p-3 (0.75rem), p-4 (1rem)
- gap-1, gap-2, gap-3, gap-4, gap-6, gap-8

## Border Radius
- rounded-sm (calc(var(--radius) - 4px))
- rounded-md (calc(var(--radius) - 2px))
- rounded-lg (var(--radius))
- rounded-full

## Typography
- text-xs, text-sm, text-base, text-lg, text-xl, text-2xl
- font-normal, font-medium, font-semibold, font-bold
`,
  );

  // Generate component docs
  const componentDocs: Record<string, string> = {
    Button: `# Button

## Usage
\`\`\`tsx
import { Button } from "@/components/ui/button"

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
\`\`\`

## Props
- \`variant\`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- \`size\`: "default" | "sm" | "lg" | "icon"
- \`asChild\`: boolean - Merge props onto child element

## With Icons
\`\`\`tsx
<Button><Mail className="mr-2 h-4 w-4" /> Login with Email</Button>
<Button size="icon"><ChevronRight className="h-4 w-4" /></Button>
\`\`\`
`,
    Input: `# Input

## Usage
\`\`\`tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<Input type="email" placeholder="Email" />
<Input disabled />

<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>
\`\`\`

## Props
Standard HTML input props plus:
- \`type\`: "text" | "email" | "password" | "number" | etc.
- \`placeholder\`: string
- \`disabled\`: boolean
`,
    Card: `# Card

## Usage
\`\`\`tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
\`\`\`

## Subcomponents
- \`Card\`: Container with border and shadow
- \`CardHeader\`: Top section for title/description
- \`CardTitle\`: Heading text
- \`CardDescription\`: Secondary text
- \`CardContent\`: Main content area
- \`CardFooter\`: Bottom section for actions
`,
    Table: `# Table

## Usage
\`\`\`tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
\`\`\`

## Subcomponents
- \`Table\`: Container
- \`TableHeader\`: Header section
- \`TableBody\`: Body section
- \`TableRow\`: Row container
- \`TableHead\`: Header cell
- \`TableCell\`: Body cell
- \`TableCaption\`: Caption text
`,
    Dialog: `# Dialog

## Usage
\`\`\`tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button type="submit">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
\`\`\`

## Controlled
\`\`\`tsx
const [open, setOpen] = useState(false)
<Dialog open={open} onOpenChange={setOpen}>...</Dialog>
\`\`\`
`,
    Popover: `# Popover

## Usage
\`\`\`tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <h4 className="font-medium">Dimensions</h4>
      <p className="text-sm text-muted-foreground">
        Set the dimensions for the layer.
      </p>
    </div>
  </PopoverContent>
</Popover>
\`\`\`

## Props (PopoverContent)
- \`align\`: "start" | "center" | "end"
- \`side\`: "top" | "right" | "bottom" | "left"
- \`sideOffset\`: number (default 4)
`,
    Select: `# Select

## Usage
\`\`\`tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
\`\`\`

## Controlled
\`\`\`tsx
const [value, setValue] = useState("")
<Select value={value} onValueChange={setValue}>...</Select>
\`\`\`
`,
    Checkbox: `# Checkbox

## Usage
\`\`\`tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
\`\`\`

## Controlled
\`\`\`tsx
const [checked, setChecked] = useState(false)
<Checkbox checked={checked} onCheckedChange={setChecked} />
\`\`\`

## Props
- \`checked\`: boolean | "indeterminate"
- \`onCheckedChange\`: (checked: boolean) => void
- \`disabled\`: boolean
`,
    Badge: `# Badge

## Usage
\`\`\`tsx
import { Badge } from "@/components/ui/badge"

<Badge>Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
\`\`\`

## Props
- \`variant\`: "default" | "secondary" | "destructive" | "outline"
`,
    Tabs: `# Tabs

## Usage
\`\`\`tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings here.</TabsContent>
  <TabsContent value="password">Change password here.</TabsContent>
</Tabs>
\`\`\`

## Controlled
\`\`\`tsx
const [value, setValue] = useState("account")
<Tabs value={value} onValueChange={setValue}>...</Tabs>
\`\`\`
`,
    Avatar: `# Avatar

## Usage
\`\`\`tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://github.com/baseline.png" alt="@baseline" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
\`\`\`

## Subcomponents
- \`Avatar\`: Container
- \`AvatarImage\`: Image element (with loading states)
- \`AvatarFallback\`: Shown while image loads or on error
`,
    Tooltip: `# Tooltip

## Usage
\`\`\`tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
\`\`\`

## Note
Wrap your app in \`<TooltipProvider>\` once at the root.
`,
    DropdownMenu: `# DropdownMenu

## Usage
\`\`\`tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
\`\`\`

## Subcomponents
- \`DropdownMenuCheckboxItem\`: Checkable item
- \`DropdownMenuRadioGroup\` / \`DropdownMenuRadioItem\`: Radio items
- \`DropdownMenuSub\` / \`DropdownMenuSubTrigger\` / \`DropdownMenuSubContent\`: Nested menus
`,
    Command: `# Command

A command palette / combobox component (used for search, autocomplete).

## Usage
\`\`\`tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
\`\`\`

## With Popover (Combobox pattern)
\`\`\`tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Select framework...</Button>
  </PopoverTrigger>
  <PopoverContent className="w-[200px] p-0">
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No framework found.</CommandEmpty>
        <CommandGroup>
          <CommandItem onSelect={(value) => setSelected(value)}>
            React
          </CommandItem>
          <CommandItem>Vue</CommandItem>
          <CommandItem>Svelte</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
\`\`\`
`,
    Label: `# Label

## Usage
\`\`\`tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>
\`\`\`

## Props
- \`htmlFor\`: string - Associates with input id
`,
    Switch: `# Switch

## Usage
\`\`\`tsx
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>
\`\`\`

## Controlled
\`\`\`tsx
const [checked, setChecked] = useState(false)
<Switch checked={checked} onCheckedChange={setChecked} />
\`\`\`
`,
    Progress: `# Progress

## Usage
\`\`\`tsx
import { Progress } from "@/components/ui/progress"

<Progress value={33} />
<Progress value={66} className="w-[60%]" />
\`\`\`

## Props
- \`value\`: number (0-100)
`,
    Skeleton: `# Skeleton

## Usage
\`\`\`tsx
import { Skeleton } from "@/components/ui/skeleton"

<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>
\`\`\`

## Usage
Style with className to match the content being loaded.
`,
  };

  for (const [name, content] of Object.entries(componentDocs)) {
    fs.writeFileSync(path.join(baselineDocsDir, `${name}.md`), content);
  }

  console.log(
    `✓ Generated AGENTS.baseline.md and .baseline-docs/ (${Object.keys(componentDocs).length + 2} files)`,
  );
}

/**
 * Install AGENTS.html.md for raw HTML/CSS target
 */
function installHtmlDocs(): void {
  const vibeTestsDir = path.join(__dirname, '..');
  const agentsMdPath = path.join(vibeTestsDir, 'AGENTS.html.md');

  if (fs.existsSync(agentsMdPath)) {
    const stats = fs.statSync(agentsMdPath);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < 60 * 60 * 1000) return;
  }

  const agentsMd = `# AGENTS.md

Project-specific guidance for AI coding agents.

## Raw HTML/CSS — No Component Library

You are writing React components using ONLY:
- Plain HTML elements (div, span, p, h1-h6, button, input, etc.)
- Inline styles via the \`style\` prop (style={{ ... }})
- Standard React hooks (useState, useEffect, etc.)

### Rules

1. Do NOT import any component library (no shadcn, no MUI, no XDS, no Radix)
2. Do NOT use Tailwind CSS or any CSS framework
3. Do NOT use CSS modules, styled-components, or CSS-in-JS libraries
4. Use inline \`style={{}}\` for ALL styling
5. Use semantic HTML elements where appropriate (button, nav, main, etc.)
6. Handle accessibility yourself (aria-labels, roles, keyboard events)
7. Export a default function component

### Styling Guidelines

- Use reasonable defaults: system font stack, 16px base, #333 text
- Use consistent spacing: 4/8/12/16/24/32px scale
- Use a neutral color palette: grays for backgrounds, blue for accent
- Add border-radius for interactive elements
- Include hover/focus states on interactive elements
`;

  fs.writeFileSync(agentsMdPath, agentsMd);
  console.log('✓ Generated AGENTS.html.md');
}

/**
 * Install AGENTS.md for agent documentation
 */
function installAgentsDocs(): void {
  const vibeTestsDir = path.join(__dirname, '..');
  const agentsMdPath = path.join(vibeTestsDir, 'AGENTS.md');

  // Check if AGENTS.md already exists and is recent (within last hour)
  if (fs.existsSync(agentsMdPath)) {
    const stats = fs.statSync(agentsMdPath);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < 60 * 60 * 1000) {
      // Less than 1 hour old, skip regeneration
      return;
    }
  }

  // Generate fresh AGENTS.md from xds init CLI
  try {
    execSync('npx xds init --features agents --agent-docs-path AGENTS.md', {
      cwd: vibeTestsDir,
      stdio: 'pipe',
    });
    console.log('✓ Generated AGENTS.md from CLI (xds init)');
  } catch (_error) {
    console.warn('⚠ Failed to generate AGENTS.md via xds init');
  }
}

interface InteractiveConfig {
  sample?: number;
  holdout?: boolean;
  persona: 'naive' | 'experienced' | 'adversarial';
  degradation?: boolean; // Enable degradation curve testing
  target: 'xds' | 'baseline' | 'html'; // Target design system
}

interface AgentTask {
  promptId: string;
  category: string;
  prompt: string;
  expectedComponents: string[];
  followUps?: string[]; // Follow-up prompts for iterative degradation testing
  persona: string;
  degradation?: boolean; // Run multi-turn degradation test
  target: string; // Target design system (xds, baseline)
}

/**
 * Generate the agent prompt for a single test
 */
function _generateAgentPrompt(task: AgentTask): string {
  const personaInstructions = {
    naive: `You are testing as a NAIVE user who describes UIs in plain language without technical terms.
You don't know component names. Describe what you want visually.`,
    experienced: `You are testing as an EXPERIENCED user who knows the component system.
Use correct component names and reference the docs.`,
    adversarial: `You are testing as an ADVERSARIAL user who mixes in patterns from other frameworks.
Reference Tailwind, baseline, Bootstrap patterns in your request.`,
  };

  // Always use AGENTS.md - Claude Code auto-injects it from cwd
  const skillDocSection = `## Component Documentation

XDS documentation is auto-loaded via AGENTS.md.`;

  return `# Vibe Test Task

You are running a vibeability test for the XDS component library.

## Your Role
${personaInstructions[task.persona as keyof typeof personaInstructions]}

${skillDocSection}

## Test Prompt
Category: ${task.category}
Prompt: "${task.prompt}"
Expected Components: ${task.expectedComponents.join(', ')}

## Instructions

1. **Generate a response** to the prompt as if you were an AI assistant helping a developer.
   Write working React/TSX code using XDS components.

2. **Self-evaluate** your response against these criteria:
   - Did you use the expected components (or reasonable alternatives)?
   - Did you hallucinate any props that don't exist?
   - Did you use redundant CSS for things components already handle?
   - Did you use acceptable supplemental CSS for gaps?
   - **CSS Variables**: Did you use valid XDS design tokens?

3. **Output JSON** in this exact format:
\`\`\`json
{
  "response": "Your full code response here...",
  "evaluation": {
    "success": true/false,
    "componentsUsed": ["XDSCard", "XDSButton", ...],
    "componentsExpected": ${JSON.stringify(task.expectedComponents)},
    "escapeHatches": [
      {
        "type": "supplemental_css|wrapper_div|inline_style|hallucination|wrong_component|redundant_css",
        "severity": "critical|acceptable",
        "detail": "Description",
        "codeSnippet": "relevant code"
      }
    ],
    "failureMode": null or "description of why it failed",
    "confusionSignals": ["any hedging language or uncertainty"]
  }
}
\`\`\`

Remember:
- Critical escape hatches (hallucination, wrong_component, redundant_css) = failure
- Acceptable escape hatches (supplemental_css, wrapper_div, inline_style) = still success
- Only output the JSON block, nothing else
`;
}

/**
 * Parse agent output to extract evaluation
 */
function _parseAgentOutput(
  output: string,
): {response: string; evaluation: Evaluation} | null {
  try {
    // Try to find JSON in the output
    const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // Try parsing the whole thing as JSON
    return JSON.parse(output);
  } catch {
    console.error('Failed to parse agent output');
    return null;
  }
}

/**
 * Create the task manifest for parallel execution
 */
function createTaskManifest(
  prompts: TestPrompt[],
  config: InteractiveConfig,
  iterationId: string,
  options?: {skillDocOverride?: string; label?: string},
): void {
  const resultsDir = path.join(getResultsDir(), iterationId);
  ensureDir(resultsDir);

  const manifest = {
    iterationId,
    createdAt: timestamp(),
    config,
    ...(options?.label && {label: options.label}),
    ...(options?.skillDocOverride && {
      skillDocOverride: options.skillDocOverride,
    }),
    prompts: prompts.map(p => ({
      id: p.id,
      category: p.category,
      prompt: p.prompt,
      expectedComponents: p.expectedComponents,
      status: 'pending',
    })),
    totalPrompts: prompts.length,
    completedPrompts: 0,
  };

  writeJson(path.join(resultsDir, 'manifest.json'), manifest);

  // Also write individual task files for agents to pick up
  const tasksDir = path.join(resultsDir, 'tasks');
  ensureDir(tasksDir);

  for (const prompt of prompts) {
    // Generate the complete subagent prompt
    const subagentPrompt = generateSubagentPrompt(
      iterationId,
      prompt,
      config,
      resultsDir,
    );

    const task: AgentTask & {subagentPrompt: string; createdAt: string} = {
      promptId: prompt.id,
      category: prompt.category,
      prompt: prompt.prompt,
      expectedComponents: prompt.expectedComponents,
      followUps: prompt.followUps,
      persona: config.persona,
      degradation: config.degradation,
      target: config.target,
      subagentPrompt,
      createdAt: new Date().toISOString(),
    };
    writeJson(path.join(tasksDir, `${prompt.id}.json`), task);
  }

  console.log(
    `\nCreated task manifest: ${path.join(resultsDir, 'manifest.json')}`,
  );
  console.log(`Individual tasks: ${tasksDir}/`);
}

/**
 * Generate the complete prompt for a subagent to run a single test
 */
function generateSubagentPrompt(
  iterationId: string,
  prompt: TestPrompt,
  config: InteractiveConfig,
  resultsDir: string,
): string {
  const codePath = `${resultsDir}/results/${prompt.id}.tsx`;

  // Target-specific AGENTS.md file
  const agentsMdFile =
    config.target === 'baseline'
      ? 'AGENTS.baseline.md'
      : config.target === 'html'
        ? 'AGENTS.html.md'
        : 'AGENTS.md';

  // Persona-specific framing to simulate different user types
  const personaFraming: Record<string, Record<string, string>> = {
    xds: {
      naive: '', // No special framing - just the natural request
      experienced: `Use XDS components from @xds/core. `,
      adversarial: `I'm used to Tailwind/baseline patterns but need to use your design system. `,
    },
    baseline: {
      naive: '', // No special framing
      experienced: `Use baseline/ui components. `,
      adversarial: `I'm used to Material UI patterns but need to use your design system. `,
    },
    html: {
      naive: '', // No special framing
      experienced: `Use only plain HTML elements and inline CSS. `,
      adversarial: `I know React component libraries exist but I want raw HTML/CSS. `,
    },
  };

  const framing = personaFraming[config.target]?.[config.persona] || '';

  // Natural prompt with AGENTS.md instruction
  // Note: docsRead tracking is handled via the structured JSON result (see subagent instructions)
  return `First read ${agentsMdFile} in this directory for component library guidance.

${framing}${prompt.prompt}

Write the code to: ${codePath}`;
}

/**
 * Generate instructions for running tests with subagents
 */
function generateSubagentInstructions(
  iterationId: string,
  prompts: TestPrompt[],
  config: InteractiveConfig,
): string {
  const resultsDir = path.join(getResultsDir(), iterationId);

  const degradationInstructions = config.degradation
    ? `

### Degradation Protocol (10-turn iterative development)
Each test simulates realistic iterative development with follow-up requests:
- Turn 0: Initial prompt (generate initial implementation)
- Turns 1-5: Filler prompts (unrelated questions like "How do I center a div?")
- Turn 6: First follow-up improvement request (from prompt's followUps[0])
- Turns 7-9: More filler prompts (continue unrelated questions)
- Turn 10: Second follow-up improvement request (from prompt's followUps[1])

Record results at turns 0, 6, and 10 with trajectoryDepth field set accordingly.
This tests: "Does the LLM maintain design system patterns while iterating on existing code?"
`
    : '';

  return `
# Interactive Vibe Test - Iteration ${iterationId}

## Running Tests with Subagents

To run these ${prompts.length} tests in parallel, use the Task tool to spawn subagents.

**Recommended**: Run with \`mode: "bypassPermissions"\` to avoid approval prompts for writing results.
${degradationInstructions}
### Option 1: Run all in parallel (recommended for small batches)
Spawn ${prompts.length} subagents, one for each test prompt.

### Option 2: Run in batches
Spawn subagents in groups of 3-5 for larger test sets.

### Subagent Prompt Template
For each test, the subagent should:
1. Read the task file: ${resultsDir}/tasks/{prompt-id}.json
2. Read docs from the docs directory (AGENTS.md auto-injected)
3. Generate a response to the prompt${config.degradation ? ' (with multi-turn conversation)' : ''}
4. Self-evaluate the response
5. Track which doc files were read during the task
6. Write result to individual file: ${resultsDir}/results/{promptId}.json
   - Include a "docsRead" array listing all doc files read (e.g., ["AGENTS.md", "Button.md", "tokens.md"])
   - Include "completedAt" with the current ISO timestamp (new Date().toISOString())
   - These are required for accurate cost tracking
   (Use individual files to avoid parallel write conflicts)

### After All Tests Complete
Run: yarn workspace @xds/vibe-tests aggregate --iteration ${iterationId}

This will:
- Read all results from results/ directory
- Calculate success rates by category
- Generate the summary report${config.degradation ? '\n- Show degradation curve with line graph' : ''}
`;
}

async function main() {
  const args = process.argv.slice(2);

  // Parse args
  const sampleIndex = args.indexOf('--sample');
  const sample =
    sampleIndex !== -1 ? parseInt(args[sampleIndex + 1]) : undefined;
  const holdout = args.includes('--holdout');
  const personaIndex = args.indexOf('--persona');
  const persona =
    personaIndex !== -1
      ? (args[personaIndex + 1] as 'naive' | 'experienced' | 'adversarial')
      : 'naive';
  const degradation = args.includes('--degradation');
  const targetIndex = args.indexOf('--target');
  const target =
    targetIndex !== -1
      ? (args[targetIndex + 1] as 'xds' | 'baseline' | 'html')
      : 'xds';
  const promptsIndex = args.indexOf('--prompts');
  const promptIds =
    promptsIndex !== -1 ? args[promptsIndex + 1].split(',') : undefined;
  const testSetIndex = args.indexOf('--test-set');
  const testSetName = testSetIndex !== -1 ? args[testSetIndex + 1] : 'default';
  const skillDocIndex = args.indexOf('--skill-doc');
  const skillDocOverride =
    skillDocIndex !== -1 ? args[skillDocIndex + 1] : undefined;
  const labelIndex = args.indexOf('--label');
  const label = labelIndex !== -1 ? args[labelIndex + 1] : undefined;

  const config: InteractiveConfig = {
    sample,
    holdout,
    persona,
    degradation,
    target,
  };

  // Install target-specific documentation for retrieval-led approach
  if (target === 'xds') {
    installAgentsDocs();
  } else if (target === 'baseline') {
    installBaselineDocs();
  } else if (target === 'html') {
    installHtmlDocs();
  }

  // Load test set
  const testSetPath = path.join(
    __dirname,
    '..',
    'test-sets',
    `${testSetName}.json`,
  );
  if (!fs.existsSync(testSetPath)) {
    console.error(`Error: Test set not found at ${testSetPath}`);
    console.error(
      `Available test sets: ${fs
        .readdirSync(path.join(__dirname, '..', 'test-sets'))
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''))
        .join(', ')}`,
    );
    process.exit(1);
  }
  const testSet = readJson<{prompts: TestPrompt[]; holdout?: TestPrompt[]}>(
    testSetPath,
  );

  // Select prompts
  let prompts: TestPrompt[];
  if (promptIds) {
    // Filter to specific prompt IDs
    prompts = testSet.prompts.filter(p => promptIds.includes(p.id));
    if (prompts.length !== promptIds.length) {
      const found = prompts.map(p => p.id);
      const missing = promptIds.filter(id => !found.includes(id));
      console.warn(`Warning: Prompt IDs not found: ${missing.join(', ')}`);
    }
  } else if (holdout && testSet.holdout) {
    prompts = testSet.holdout;
  } else if (sample && sample < testSet.prompts.length) {
    prompts = stratifiedSample(testSet.prompts, sample);
  } else {
    prompts = testSet.prompts;
  }

  // Generate iteration ID
  const iterationId = generateIterationId();

  console.log(`\n🧪 Interactive Vibe Test Setup`);
  console.log(`================================`);
  console.log(`Iteration: ${iterationId}`);
  if (label) console.log(`Label: ${label}`);
  console.log(`Test set: ${testSetName}`);
  console.log(`Target: ${target.toUpperCase()}`);
  console.log(`Persona: ${persona}`);
  if (skillDocOverride) console.log(`Skill doc: ${skillDocOverride}`);
  console.log(
    `Mode: ${target === 'xds' ? 'AGENTS.md' : target === 'baseline' ? 'AGENTS.baseline.md' : 'AGENTS.html.md'} (retrieval-led)`,
  );
  console.log(
    `Protocol: ${degradation ? 'Degradation (10-turn curve)' : 'One-shot'}`,
  );
  console.log(
    `Prompts: ${prompts.length}${sample ? ` (sampled from ${testSet.prompts.length})` : ''}`,
  );

  // Create task manifest
  createTaskManifest(prompts, config, iterationId, {
    skillDocOverride,
    label,
  });

  // Output instructions
  console.log(generateSubagentInstructions(iterationId, prompts, config));

  // Output the prompts for easy reference
  console.log(`\n## Test Prompts\n`);
  for (const p of prompts) {
    console.log(`- [${p.id}] (${p.category}) ${p.prompt}`);
  }

  console.log(`\n## Quick Start\n`);
  console.log(`To run all tests now, ask Claude Code to:`);
  console.log(
    `"Run vibe tests for iteration ${iterationId} using parallel subagents"`,
  );
}

main().catch(console.error);
