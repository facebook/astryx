---
'@astryxdesign/core': patch
---

[fix] Theme CSS generation now guarantees a declaration stays a declaration: property names must be property-shaped and values may not contain CSS-structural characters (braces, semicolons, comment sequences, control characters). Every real token value — colors, gradients, calc(), light-dark(), font stacks — passes through byte-identically; anything else is dropped with a warning instead of extending the generated stylesheet.

@bhamodi
