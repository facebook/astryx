---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] The agent guide that global mode writes to the home folder now says how to build, not only how to find things. It tells agents to work in a project folder (creating one if there is none) with `@astryxdesign/core` and `@astryxdesign/cli` added to a new project or one without Core, or, in a project that already has `@astryxdesign/core`, the CLI at the same version, and `astryx init` run there, then gives the same template-first workflow and self-check the project agent docs give, and ends with building the project and delivering that build. Before, agents that found the right template could still build the page with a tool that cannot install packages and deliver a page with no Astryx in it. The guide stays version-free and names only commands every release keeps. The project agent docs are unchanged, and so is what `@astryxdesign/core`'s install script prints: its copy of the shared agent-docs file only gains the same workflow lines.

@josephfarina
