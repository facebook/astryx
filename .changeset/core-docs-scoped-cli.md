---
'@astryxdesign/core': patch
---

[docs] The README's CDN template command and the icon and token hints in the DropdownMenu item and Indicator docs name the scoped `npx @astryxdesign/cli`, which runs this CLI whether or not it is installed. Bare `npx astryx` fetches an unrelated npm package until the CLI is a dependency.
@josephfarina
