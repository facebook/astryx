---
'@xds/core': patch
---

Fix XDSDropdownMenu light-dismiss + click-toggle race: on iOS Safari (and other touch browsers where pointerdown fires light-dismiss before the trigger's click event), tapping the trigger to close an open menu would close and then immediately re-open on the same tap. Stamp `lastHideTimeRef` whenever the menu is hidden and short-circuit `handleButtonClick` if it fires within 50ms of that stamp.
