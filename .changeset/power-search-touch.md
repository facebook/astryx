---
'@astryxdesign/core': patch
---

[feat] Make PowerSearch adapt automatically for touch devices.

On supported coarse pointers, the whole PowerSearch field opens one filter-management bottom sheet. Capsules stay display-only in the field with no close buttons. The sheet lists selected filters; pressing a row opens its update sheet, while each row's separate remove action deletes it without leaving management. Add filter follows the list, while Clear all and Done stay in the footer. String-valued content search also lives in that sheet. Save returns to management, and the editor footer has no dividing rule.

@imdreamrunner
