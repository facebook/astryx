# AI + Design Systems: Why Typed APIs Win

*Exploration — January 2026*

## Context

Research into problems with the current standard stack (Tailwind CSS, shadcn/ui, utility-first CSS) when used with AI code generation. Focus on design system adherence issues.

---

## Findings

### 1. Design System Adherence Problems

**Utility-class drift**
- AI generates arbitrary values (`mt-[13px]`) instead of design tokens
- Different prompts produce different class combinations for same intent
- No enforcement of spacing scales, color palettes, or typography

**Inconsistency across generations**
- Each AI session may produce different styling approaches
- "Style and structure inconsistencies" — fragmented codebases that appear disjointed
- Lost context means suggestions drift from established patterns

### 2. Architectural Blindness

**Local optimization, not systemic**
- AI "optimizes for local correctness, not systemic soundness"
- Doesn't understand *why* previous decisions were made
- Generates code without knowing if it belongs in that module

**No shared architecture**
- When developers use different AI sessions, there's no shared ownership
- Design discussions replaced by autocomplete — no collaborative reasoning
- Coupling emerges accidentally, not intentionally

### 3. Tailwind-Specific Issues at Scale

**The "utility-class mess"**
- Bloated markup: dozens of classes per element
- Without governance, "flexibility turns into chaos"
- Inconsistent spacing, mismatched colors across teams

**Abstraction gap**
- Tailwind is low-level; design systems need high-level primitives
- Requires manual component abstraction that AI often skips
- No semantic meaning in class names for AI to learn from

### 4. LLM Code Generation Weaknesses

From academic research on LLM failures:
- **Complexity degradation**: Accuracy drops exponentially with complexity
- **API misuse**: Wrong arguments, incorrect attribute inference
- **Corner case failures**: Over 54% of logic errors are edge cases
- **Real-world gap**: Models underperform on production vs benchmarks

---

## Strategies for Injecting Design System Opinions

### Strategy 1: Context Documents (Cursor Rules, CLAUDE.md, etc.)

**Approach**: Write design guidelines in markdown files, have AI read them as context.

**Results**:
- ❌ **Rules are suggestions, not constraints** — AI can ignore them without consequences
- ❌ **No verification system** — Can't confirm AI actually followed rules vs claimed compliance
- ❌ **Context window degradation** — Performance deteriorates within conversations; rules "forgotten"
- ❌ **Model-specific behavior** — Some models agree with everything without genuine adherence
- ❌ **Requires constant reinforcement** — Users report needing to restart sessions to maintain rule-following

**Community workarounds**:
- Place critical rules prominently with explicit reinforcement
- Use numbered prefixes for rule priority
- Reference actual code examples, not abstract instructions

### Strategy 2: Prompt Engineering / System Prompts

**Approach**: Include design tokens and guidelines in system prompts.

**Results**:
- ⚠️ **Token budget constraints** — Full design systems don't fit in context
- ⚠️ **Dilution effect** — More instructions = less attention to each one
- ⚠️ **No enforcement** — Still just suggestions the model can ignore
- ✅ **Works for simple constraints** — "Always use Tailwind" is followable; "use these 47 spacing values" is not

### Strategy 3: Schema-Enforced Structured Output

**Approach**: Define JSON schema, use API-level constraints to force valid output.

**Results**:
- ✅ **Actually enforced** — API contract constrains generation itself, not post-hoc parsing
- ✅ **Type safety** — Compile-time + runtime validation
- ✅ **Deterministic** — Predictable response shapes
- ⚠️ **Limited to data, not code** — Works for JSON output, not JSX/TSX generation

### Strategy 4: Typed Component APIs

**Approach**: Constrain what's possible at the TypeScript level.

**Results**:
- ✅ **Enforcement at compile time** — Invalid props = type error
- ✅ **AI learns from constraints** — Autocomplete only shows valid options
- ✅ **Self-documenting** — Types become the source of truth
- ⚠️ **Requires well-designed API** — Constraint design is hard
- ⚠️ **Reactive, not proactive** — Types catch errors after generation, not before

**Research on first-try accuracy**:
- LLMs pass all tests only 46-65% on first attempt (arxiv.org/html/2412.14841v1)
- Claude 3 Opus: 84.9% pass@1 on HumanEval; GPT-4 raw: ~86%
- Models with error feedback loops ("Reflexion") jump to 95-98%
- Best models fix 59% of incorrect code when given error info

**API misuse is common**:
- Research found "significant challenges in API usage, particularly hallucination and intent misalignment" (arxiv.org/abs/2503.22821v1)
- Study annotated 3,892 method-level and 2,560 parameter-level misuses

**Key insight**: Types are guardrails for iteration, not first-try guidance. The value is in fast recovery (instant compile error) rather than preventing the mistake.

### Strategy 5: JSDoc / Code Comments

**Approach**: Annotate components with JSDoc to guide AI understanding.

**Results**:
- ❌ **Not reliably read** — Comments are one signal among many (surrounding code, open tabs, cursor context)
- ❌ **No privileged status** — GitHub Copilot docs show comments compete with other context sources
- ❌ **Token inefficient** — Verbose JSDoc bloats context window without enforcement
- ❌ **No verification** — Can't confirm AI actually read or followed the docs

**Research findings**:
- Type constraints reduce LLM code generation errors by >50% (arxiv.org/abs/2504.09246)
- The `llms.txt` standard emerged specifically because traditional docs (including JSDoc) fail for LLM consumption
- Shorter prompts (<50 words) outperform verbose documentation
- Concrete code examples work better than abstract documentation

### Key Insight

The pattern is clear:

| Strategy | Enforcement Level | Reliability |
|----------|------------------|-------------|
| Context docs / rules | None (suggestions) | Low |
| System prompts | None (suggestions) | Low |
| JSDoc / comments | None (suggestions) | Low |
| Schema-enforced output | API-level | High (for JSON) |
| Typed component APIs | Compile-time (reactive) | High — via iteration |

**Context injection fails because it's optional.** The AI can always ignore guidance. Typed APIs are reliable but *reactive* — they enable fast error→fix loops rather than preventing mistakes. First-try accuracy is only 46-65%; the value of types is making recovery instant.

---

## Implications for XDS

These gaps suggest opportunities for differentiation:

| Gap | Potential XDS Approach |
|-----|------------------------|
| Arbitrary values | Constrained API — only valid tokens accepted |
| Style drift | Semantic component names AI can learn |
| Lost context | Typed APIs > JSDoc (types are enforced, docs are ignored) |
| No enforcement | Plugin system for validation |
| Spacing chaos | Automatic spacing compensation |
| Abstraction gap | Pre-composed patterns, not utilities |
| Docs not read | Types as documentation — context arrives on import; skip llms.txt (not adopted by AI systems) |

---

## Sources

- [Vibe coding is destroying architecture](https://dev.to/dev_tips/vibe-coding-is-destroying-architecture-the-silent-rot-in-our-ai-built-systems-4p1n)
- [Mastering Tailwind CSS for Enterprise Apps](https://veduis.com/blog/mastering-tailwind-css-enterprise-apps-scalable-design-system/)
- [Vibe Coding Mistakes](https://dev.to/tirumalaraonaidu/vibe-coding-mistakes-when-using-ai-tools-and-how-to-avoid-them-2p7c)
- [What is Wrong with LLM Generated Code](https://arxiv.org/html/2407.06153)
- [Cursor rules are meaningless](https://forum.cursor.com/t/cursor-actively-admitting-that-rules-are-meaningless-and-it-doesnt-have-to-follow-them/131826)
- [Setting Up Cursor Rules Guide](https://dev.to/stamigos/setting-up-cursor-rules-the-complete-guide-to-ai-enhanced-development-24cg)
- [Schema-Enforced Outputs](https://dev.to/dthompsondev/llm-structured-json-building-production-ready-ai-features-with-schema-enforced-outputs-4j2j)
- [The crisis of context](https://standardbeagle.com/ai-coding-assistants-and-context/)
- [Type-Constrained Code Generation with LLMs](https://arxiv.org/abs/2504.09246) — Types reduce errors by >50%
- [llms.txt: What It Is and How It Works](https://apidog.com/blog/llms-txt/) — AI-friendly docs standard
- [ZenML's llms.txt Implementation](https://www.zenml.io/blog/llms-txt) — Tiered token budgets for docs
- [GitHub Copilot: Responsible Use](https://docs.github.com/en/enterprise-cloud@latest/copilot/responsible-use/copilot-code-completion) — How Copilot uses context
- [Using LLMs for Code](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) — Context > documentation
- [LLM Code Generation Accuracy Guide](https://www.prompthub.us/blog/using-llms-for-code-generation-a-guide-to-improving-accuracy-and-addressing-common-issues) — Short prompts outperform verbose
- [Testing and Static Analysis Feedback for LLMs](https://arxiv.org/html/2412.14841v1/) — 46-65% first-try accuracy, 59% fix rate with feedback
- [API Misuse in LLMs](https://arxiv.org/abs/2503.22821v1) — Taxonomy of 3,892 method-level misuses
- [HumanEval Benchmark](https://klu.ai/glossary/humaneval-benchmark) — pass@1 scores across models

---

## Open Questions

- How constrained should the API be vs flexibility for edge cases?
- ~~What JSDoc patterns work best for LLM consumption?~~ **Answered**: JSDoc doesn't reliably work — types beat comments. See Strategy 5.
- How do we measure "design system adherence" in AI-generated code?
- ~~Should XDS ship an `llms.txt` for AI-friendly documentation?~~ **Answered**: No — no AI system currently reads llms.txt. See [[AI Model Trajectory|AI-Model-Trajectory]].
