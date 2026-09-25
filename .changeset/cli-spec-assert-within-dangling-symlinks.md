---
'@astryxdesign/cli': patch
---

[fix] Commands that write files no longer follow a dangling symlink out of the project: when the target, or a directory on the way to it, links to a missing path outside the project root, the command now fails with `ERR_PATH_TRAVERSAL` instead of creating the file there. A symlink escape reported by `integration add` now carries `ERR_PATH_TRAVERSAL` too, instead of an unregistered `PATH_TRAVERSAL` code. (#6513)

@josephfarina
