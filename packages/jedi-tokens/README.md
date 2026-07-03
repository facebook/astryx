# @jedi/tokens

Token bridge CSS for applications migrating from legacy semantic aliases (`--bg`, `--fg`, …) to Astryx-backed theme tokens.

Applications import `bridge.css` after active theme CSS. Refine `--ax-*` mappings once theme token names are verified via `pnpm astryx docs tokens`.
