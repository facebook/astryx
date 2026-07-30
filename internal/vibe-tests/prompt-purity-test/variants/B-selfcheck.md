SELF-CHECK (before you finish, every time): re-read the file you wrote. If you see
className=, style={{...}}, an imported .css / @apply, Tailwind utility classes, raw
<div>/<span> used for layout, or hardcoded #hex/rgb()/px/rem — you veered off Astryx.
For each, replace it with the Astryx component or the xstyle prop + token. If unsure a
component exists, run `astryx search "<thing>"` / `astryx component <Name>` — do not
hand-roll it in CSS. Finish only when the file is Astryx components + xstyle/tokens
with zero raw CSS/Tailwind.
