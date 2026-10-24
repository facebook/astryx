---
'@astryxdesign/core': patch
---

[fix] Removing a Tokenizer token with a finger no longer raises the touch keyboard. A tap on a token's remove button used to move focus to the field's input inside the tap, which makes iOS and Android show their keyboard; when the input was not focused before the tap (the keyboard was down), focus now stays where it was. A tap made while typing, a mouse click, and a key press on the remove button still put focus in the input. PowerSearch's filter tokens, which use the same field, get the same fix.

@vjeux
