---
'@astryxdesign/cli': patch
---

[feat] New codemod for the Table `tableProps` deprecation: lifts object-literal `tableProps` keys into direct props on `<Table>`, keeps colliding or dynamic values in place with a TODO note. **Codemod:** `npx astryx upgrade --codemod migrate-table-tableprops-to-direct-props` (#3679)
@AKnassa
