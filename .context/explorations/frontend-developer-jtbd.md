# Frontend Developer Jobs To Be Done

*Exploration — January 2026*

## Context

Research into the jobs frontend developers are trying to accomplish when setting up and building with UI systems. Goal: ensure XDS serves the right jobs and doesn't over-engineer for jobs that don't exist.

---

## Research Findings

### Core Developer Jobs (from research)

| Job | Description | Frequency |
|-----|-------------|-----------|
| **Translate designs to code** | Convert mockups/specs into functional UI | Daily |
| **Maintain consistency** | Ensure visual/behavioral consistency across app | Ongoing |
| **Test across environments** | Verify UI works in different browsers/devices | Per feature |
| **Collaborate with team** | Work with designers, backend, other devs | Daily |
| **Optimize performance** | Reduce load times, improve responsiveness | Periodic |
| **Debug issues** | Fix visual bugs, interaction problems | As needed |

Source: [Guvi: What Does a Front End Developer Do](https://www.guvi.in/blog/what-does-a-front-end-developer-do/)

### Design System-Specific Jobs

| Job | Pain Point When Unmet |
|-----|----------------------|
| **Discover available components** | "Teams don't know what's available in the system" |
| **Trust component documentation** | "Developers question whether documented components match production reality" |
| **Integrate with existing toolchain** | "System components don't fit existing toolchains or workflows" |
| **Reduce design-to-code translation** | "Manual interpretation creates rework and inconsistency" |
| **Keep implementations current** | "Updating implementations when systems evolve" |

Source: [Netguru: Design System Adoption Pitfalls](https://www.netguru.com/blog/design-system-adoption-pitfalls)

### Key Insight: Adoption > Features

"Design systems aren't failing because they're poorly built—they're failing because no one's using them."

The solution isn't technical—it's organizational, requiring:
- Clear ownership structures
- Active team engagement
- Easy discovery
- Trust in the system

---

## XDS Builder Jobs Framework

Based on research, here are the jobs XDS should serve:

### Setup Phase Jobs

| Job | What Success Looks Like |
|-----|------------------------|
| **Set up project styling** | Define tokens, themes in one place; immediate visual consistency |
| **Configure for my stack** | Works with my build tools, framework, IDE |
| **Adopt incrementally** | Can start with one component, expand over time |

### Build Phase Jobs

| Job | What Success Looks Like |
|-----|------------------------|
| **Construct pages from components** | Compose UI quickly with typed props, autocomplete |
| **Customize component appearance** | Theme changes propagate everywhere automatically |
| **Handle edge cases** | Swizzle when needed, clear escalation path |
| **Stay consistent with design** | Components match design specs out of the box |

### Maintain Phase Jobs

| Job | What Success Looks Like |
|-----|------------------------|
| **Update to new versions** | Clear migration path, deprecation warnings |
| **Debug visual issues** | Predictable styles, easy to trace |
| **Scale to more features** | System grows with app, no breaking changes |

### Collaborate Phase Jobs

| Job | What Success Looks Like |
|-----|------------------------|
| **Share patterns with team** | Components are self-documenting, Storybook integration |
| **Onboard new developers** | Props-only API, familiar patterns |
| **Work with AI assistants** | Typed APIs, constrained options, predictable patterns |

---

## How XDS Maps to Jobs

| XDS Layer | Primary Jobs Served |
|-----------|---------------------|
| **Theme Layer** | Set up styling, customize appearance, maintain consistency |
| **Component API** | Construct pages, stay consistent, onboard developers, work with AI |
| **Swizzle Layer** | Handle edge cases, customize beyond theme |
| **CLI/Tooling** | Configure for stack, adopt incrementally, update versions |
| **Storybook/Docs** | Discover components, share patterns, trust documentation |

---

## Jobs XDS Should NOT Try to Serve

| Anti-Job | Why Not |
|----------|---------|
| **Backend/API development** | Out of scope |
| **State management** | Different concern, many solutions exist |
| **Routing/navigation logic** | Framework-specific |
| **Data fetching** | Not a styling/component concern |
| **Animation authoring** | Future phase, not core |

---

## Implications for Architecture

### Must-Haves (serves core jobs)

- Typed props API (construct pages, work with AI)
- Theme system (set up styling, customize appearance)
- Swizzle API (handle edge cases)
- Good docs/Storybook (discover components, trust documentation)

### Nice-to-Haves (serves secondary jobs)

- CLI for scaffolding (configure for stack)
- Migration tooling (update versions)
- Tailwind interop (adopt incrementally for Tailwind users)

### Won't-Do (not our jobs)

- State management solutions
- Routing components
- Data layer abstractions

---

## Open Questions

- Should we formally interview developers to validate these jobs?
- Are there jobs specific to AI-assisted development we're missing?
- How do enterprise vs indie developer jobs differ?

---

## Sources

- [Guvi: What Does a Front End Developer Do](https://www.guvi.in/blog/what-does-a-front-end-developer-do/)
- [Netguru: Design System Adoption Pitfalls](https://www.netguru.com/blog/design-system-adoption-pitfalls)
- [Netguru: Frontend Development Process](https://www.netguru.com/blog/front-end-development-process)
- [Digital Leadership: JTBD in UX Design](https://digitalleadership.com/glossary/jobs-to-be-done-ux/)
