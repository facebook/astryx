---
'@astryxdesign/cli': patch
---

[docs] The styling setup docs now load the prebuilt stylesheets on every path. The "StyleX from source" path becomes "StyleX for your own code": it keeps `astryx.css` and points the StyleX compiler at your own and swizzled source only. A new "Other Astryx packages" section lists each package's stylesheet (`richtext.css`, `lab.css`, `charts.css`) and where to import it. Getting started no longer lists the two example setups that compile Astryx source; the remaining examples all load `astryx.css`.

@cixzhang
