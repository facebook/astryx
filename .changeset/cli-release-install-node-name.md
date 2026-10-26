---
'@astryxdesign/cli': patch
---

[fix] A run that takes over a crashed run's release-cache lock now ends the npm install that run left behind when Node's own file is not named `node`, such as `nodejs` on some Linux distributions or a toolchain's `node-linux-x64`. The install is recognized by the Node the CLI starts npm with, whatever its name; before, such an install was left running while the lock was taken over.

@vjeux
