---
'@astryxdesign/core': patch
---

[refactor] Rename the Field `labelElementID` prop to `labelID`, matching the `(part)ID` naming convention used by the sibling props (`inputID`, `descriptionID`, `messageID`). The disambiguation between "the id applied to the label element" and `inputID` ("the control the label points at") now lives in the prop JSDoc rather than the name. Also renamed on FieldLabel and updated the RadioList/CheckboxList/InputGroup consumers. No behavior change. (#3343)
@cixzhang
