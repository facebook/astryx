---
'@astryxdesign/core': patch
---

[fix] DropdownMenu submenu flyouts close with their menu when it is light-dismissed: previously a submenu opened by tap or a fast click stayed open (and re-anchored to the viewport corner) after the menu was dismissed and reopened. A hover-open scheduled on a submenu trigger before the menu closed from elsewhere is also cancelled, so it can no longer reopen a flyout behind the dismissed menu
@Pushpak731
