---
'@astryxdesign/core': patch
---

[feat] Under a finger, the picker wheels in the TimeInput, DateTimeInput and DateInput bottom sheets now look like UIPickerView, as they already move like it. The rows sit on a cylinder seen in perspective, 32 pt apart and dimmed above and below a capsule band, and the row in the band is drawn magnified. A sheet's columns draw as one picker: one band spans every column, the columns sit close together around the picker's centre where UIDatePicker sets its own, and each column's rows lean toward that centre. With a mouse the wheels keep today's column.

@vjeux
