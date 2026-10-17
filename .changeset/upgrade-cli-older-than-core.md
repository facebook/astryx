---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade` no longer reports your code as up to date when the CLI is older than the installed `@astryxdesign/core`. Core codemods ship inside the CLI, so an older CLI has none for the releases after its own version. It used to print "No changes needed" and "No codemods available for this version range" and exit 0 while the code still needed those releases' migrations. It now warns once that it cannot finish, prints the same upgrade pinned to the CLI release that matches your Core (such as `cd <project> && npx @astryxdesign/cli@<core-version> upgrade --from <old-version> --path <source-dir> --apply`), and ends with "Upgrade incomplete". That command changes to the folder the run used and names the directory it scanned as an absolute path, so it upgrades the same code wherever you paste it. It is written for a POSIX shell, or for PowerShell on Windows. `upgrade.status` (`no_codemods` and `config_fixable`) and `upgrade.run` gain an optional `cliBehindCore` field with `cliVersion` and `command`, present only in that case. The codemods the CLI has still run, and the exit status and every existing field are unchanged.

@josephfarina
