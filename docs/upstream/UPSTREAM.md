# JEDI Upstream Governance

## 1. Why Astryx?

Astryx is Meta's production design system — eight years of internal use across 13,000+ applications. JEDI references Astryx for:

- Proven architecture patterns (token cascade, StyleX authoring, component anatomy)
- Accessibility implementation quality
- Agent operability ideas (CLI, MCP, evaluation)
- Motion and interaction patterns

JEDI does not compete with Astryx on breadth. JEDI owns documentation-heavy, information-dense applications.

## 2. What is upstream reference?

| Area | Reference use |
|------|---------------|
| Architecture | Package boundaries, build patterns, theme application |
| Accessibility | ARIA patterns, focus management, keyboard interaction |
| Component APIs | API shape inspiration — always reimplemented with JEDI tokens |
| Motion | Duration/easing concepts, transition patterns |

## 3. How do we evaluate new upstream changes?

1. Read the change against [CONSTITUTION.md](../CONSTITUTION.md)
2. Ask: does this solve a JEDI capability gap?
3. Log decision in [decision-log.md](./decision-log.md) as adopt, adapt, or reject
4. Never auto-import code or dependencies
5. Implement JEDI-native if adopted

## 4. What never gets copied?

| Never copy | Reason |
|------------|--------|
| Runtime dependencies (`@astryxdesign/*`) | Architectural Independence |
| Package structure verbatim | JEDI has its own capability model |
| Release cadence | JEDI versions on capability milestones |
| Internal Meta assumptions | JEDI targets documentation-heavy products |
| Token values | JEDI-native design language |

## Upstream Policy

| Category | Treatment | Examples |
|----------|-----------|----------|
| **Reference** | Study principles, implement JEDI-native | Architecture, accessibility, component APIs, motion ideas |
| **Adapt** | Learn from, reshape for JEDI | Tokens, themes, documentation patterns |
| **Reject** | Never import | Runtime deps, package structure, release cadence, Meta-internal assumptions |

## Architectural Independence

**Milestone:** JEDI v0.2 — zero `@astryxdesign/*` runtime imports across all packages.

After independence, Astryx remains **optional reading** indefinitely. Mature projects continue learning from upstream without depending on it.

See [sync-strategy.md](./sync-strategy.md).
