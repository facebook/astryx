---
'@astryxdesign/core': patch
---

[feat] Make PowerSearch adapt automatically for touch devices.

On supported coarse pointers, the whole PowerSearch field opens one filter-management bottom sheet. Capsules stay display-only in the field with no close buttons. The management sheet lists selected filters without an extra list heading; pressing a chevron-ended row opens its update sheet, where explicit Cancel and Delete actions are available beside the edit confirmation. Add filter sits at the top-right of the management header, while Clear all and Done stay in the footer. With no selected filters, every interactive configuration opens directly to Add filter. Clear all removes every editable filter and closes the sheet. The Add filter sheet owns string-valued content search and reuses the existing PowerSearch suggestions for fields, operators, values, and free text, rendering them in a divided list below the input instead of a popover. Single- and multi-value enum choices share a divided list with trailing checkmarks on selected rows. Value sheets confirm with Add filter or Edit filter and return to management, and their footer has no dividing rule.

@imdreamrunner
