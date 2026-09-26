STOP — MANDATORY SELF-AUDIT before you output the final file. Astryx is the ONLY
styling system here; raw CSS/Tailwind is a failure, not a fallback. Run this checklist
against your file and fix every hit before finishing:

1. Grep your own output for: `className=`, `style={{`, `import "*.css"`, `@apply`,
   Tailwind utilities (e.g. `flex`, `p-4`, `text-sm`, `bg-*`, `rounded-*`), raw
   `<div>/<span>` doing layout, and hardcoded values (`#hex`, `rgb(`, `NNpx`, `NNrem`).
2. For EACH hit: delete it and use the Astryx component (layout, spacing, surfaces,
   typography all have one) or the `xstyle` prop with a token. Never a raw element +
   CSS when a component exists.
3. If you are not 100% sure a component/prop exists, you MUST verify with
   `astryx component <Name>` or `astryx search "<thing>"` — do NOT guess and do NOT
   fall back to CSS.
4. Only finish when a re-read shows ZERO items from step 1. If any remain, you have
   not finished — fix them and re-audit.
