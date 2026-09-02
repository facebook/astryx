---
'@astryxdesign/core': patch
---

[feat] Make PowerSearch adapt automatically for touch devices.

On supported coarse pointers, the whole PowerSearch field opens one filter-management bottom sheet. Capsules stay display-only in the field with no close buttons. The sheet lists selected filters without an extra list heading; pressing a row opens its update sheet, while each row's separate remove action deletes it without leaving management. Add filter follows the list, while Clear all and Done stay in the footer. With no selected filters, structured-only configurations open directly to Add filter; configurations with content search retain management so its search remains available. Clear all removes every editable filter and closes the sheet. String-valued content search reuses the existing PowerSearch suggestion list for fields, operators, values, and free text. Value sheets confirm with Add filter or Edit filter and return to management, and their footer has no dividing rule.

@imdreamrunner
