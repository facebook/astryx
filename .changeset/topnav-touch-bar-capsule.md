---
'@astryxdesign/core': patch
---

[feat] TopNav's phone bar on a touch screen takes the iOS 26 bar's geometry. It is 54px tall, with its items on the top 44px and 16px from the screen's sides, and its end items sit together on one glass capsule. The capsule is 44px tall and fully rounded, places each control where UIKit centres its 36px cells, and is painted with the new `--color-background-glass` token, with no shadow. By default the token is the theme's surface at 85 %, so a theme that changes its surface changes the capsule too; nothing is blurred. With a mouse the bar is unchanged. The Tailwind bridge maps the token to `bg-glass`.

@vjeux
