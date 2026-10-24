---
'@astryxdesign/core': patch
---

[fix] AlertDialog: on a touch screen the two actions are tracked as one group, the way iOS tracks an alert's actions. A finger that lands on one action and slides to the other now runs the action it lifts on. Before, iOS Safari ran the action the finger first touched (Delete, when the finger slid to Cancel), and other browsers ran nothing and left the alert open. The touched action highlights as soon as it is touched instead of 150 ms later, the highlight follows the finger between the actions, and lifting off both still runs nothing. A mouse, the keyboard and assistive technology keep each button's own click, and text stays selectable with a mouse.

@vjeux
