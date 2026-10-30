---
'@astryxdesign/core': patch
---

[fix] AlertDialog: its two actions are tracked as one group under every pointer, a finger, a pen or a mouse, the way iOS tracks an alert's actions. A press that lands on one action and slides to the other now runs the action it lifts on. Before, iOS Safari ran the action the finger first touched (Delete, when the finger slid to Cancel), and other browsers ran nothing and left the alert open. The pressed action highlights as soon as it is pressed instead of 150 ms later, the highlight follows the pointer between the actions, and lifting off both still runs nothing; a second finger or the window losing focus ends the press with nothing run. Only the actions are tracked: a press on the title or the message is not, and their text stays selectable with a mouse. The keyboard and assistive technology keep each button's own activation.

@vjeux
