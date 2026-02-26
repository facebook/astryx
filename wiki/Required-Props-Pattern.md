# Required Props Pattern

*Exploration — January 2026*

## Context

Exploring whether making all component props required (no defaults) improves AI code generation. Hypothesis: explicit APIs are more "vibe-able" because every example demonstrates all props and errors are more actionable.

Inspired by Rust's reputation for being LLM-friendly due to explicit, detailed compiler errors.

---

## Research Findings

### Why Rust Works Well for LLMs

**Not because everything is required — because errors are explicit and actionable.**

Microsoft's RustAssistant achieved 74% accuracy fixing Rust compilation errors because the compiler provides:
- Error code
- Exact location
- Documentation and examples for the error type

This enables fast iterate-until-correct loops. The LLM knows exactly what's wrong and how to fix it.

Source: [RustAssistant: Using LLMs to Fix Compilation Errors in Rust Code](https://www.microsoft.com/en-us/research/publication/rustassistant-using-llms-to-fix-compilation-errors-in-rust-code/)

### Arguments FOR Required Props

| Benefit | Explanation |
|---------|-------------|
| Actionable errors | "Missing prop X" is specific; silent wrong defaults are not |
| Complete examples | Every usage shows every prop — no hidden behavior |
| Forced intentionality | Can't accidentally rely on implicit defaults |
| Training data quality | LLMs learn from complete specifications |

### Arguments AGAINST / Caveats

| Concern | Explanation |
|---------|-------------|
| LLMs struggle with detail | Research shows models "overlook details in prompts" — more required props = more to miss |
| No direct research | No studies found comparing all-required vs optional for LLM accuracy |
| Human DX cost | Sensible defaults reduce decision fatigue for humans |
| Rust uses builders | Even Rust uses builder patterns for optional fields |

**Key finding from LLM failure analysis:**
- Complexity alone doesn't predict failure
- Semantic understanding is the bottleneck
- 76/148 tasks failed across *all* models when prompts were underspecified

Source: [Where Do LLMs Still Struggle?](https://arxiv.org/html/2511.04355)

### How Rust Actually Handles This

Rust doesn't make everything required. Instead:

1. **Structs require all fields** — but builders provide optional fields
2. **Type state pattern** — compile-time enforcement of which fields are set
3. **Recommendation**: Only use for "types with at least five parts or complex interdependencies"

Source: [Build Rust API with Builder Pattern](https://blog.logrocket.com/build-rust-api-builder-pattern/)

---

## Implications for XDS

The insight isn't "all props required" — it's "explicit errors with actionable messages."

### Proposed Approach

| Prop Type | Required? | Rationale |
|-----------|-----------|-----------|
| Behavioral props | Yes | Affects component behavior; must be explicit |
| Structural props | Yes | Affects DOM structure; must be explicit |
| Styling/presentation | Optional | Pure visual; safe defaults exist |

### Error Message Design

More important than required-vs-optional is error quality:

```
// Bad: silent wrong behavior
<XDSButton>Click</XDSButton>  // defaults to type="button", looks like submit

// Better: required prop
<XDSButton>Click</XDSButton>  // Error: missing required prop 'type'

// Best: actionable error with guidance
<XDSButton>Click</XDSButton>
// Error: XDSButton requires 'type' prop.
// Options: "button" | "submit" | "reset"
// Example: <XDSButton type="button">Click</XDSButton>
```

---

## Open Questions

- How do we measure "error actionability" for LLMs?
- ~~Should XDS provide an `llms.txt` with component examples for each prop combination?~~ **Answered**: No — no AI system currently reads llms.txt. Not worth investment. See [[AI Model Trajectory|AI-Model-Trajectory]].
- Can we A/B test required vs optional props with AI coding assistants?

---

## Related

- [[AI and Design Systems|AI-and-Design-Systems]] — Strategy 4: Typed Component APIs

---

## Sources

- [RustAssistant: Using LLMs to Fix Compilation Errors](https://www.microsoft.com/en-us/research/publication/rustassistant-using-llms-to-fix-compilation-errors-in-rust-code/) — 74% accuracy with explicit errors
- [Where Do LLMs Still Struggle?](https://arxiv.org/html/2511.04355) — Semantic understanding > complexity
- [Build Rust API with Builder Pattern](https://blog.logrocket.com/build-rust-api-builder-pattern/) — Required vs optional in Rust
- [Sensible Defaults](https://www.thoughtworks.com/insights/blog/technology-strategy/better-tech-decision-making-underpinned-by-sensible-defaults) — Value of good defaults
