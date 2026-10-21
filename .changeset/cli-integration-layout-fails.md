---
'@astryxdesign/cli': minor
---

[breaking] `astryx integration check --strict` fails on the package layout findings it has listed since 0.7.3: two docs for one component (`duplicate_component_doc`), a root reached through a symlink (`symlinked_root`), a contribution file that cannot be read (`unreadable_file`), a package.json without `name` or `version` (`invalid_package_json`), no provider ID (`no_provider_id`), and a doc whose file name differs from its source only in letter case where the two still pair (`source_without_component_doc`). `astryx doctor integration validate` reports them as warnings in `issues`, and the `layout` list is gone.

@josephfarina
