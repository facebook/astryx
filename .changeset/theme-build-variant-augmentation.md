---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build`: custom component variants declared in a theme (e.g. `button['variant:accentOutline']`) now generate a type augmentation against the component's real interface (`ButtonVariantMap`) instead of a non-existent `XDS`-prefixed one, so `variant="accentOutline"` type-checks. Props with no augmentation point (closed unions like Button `size` or Heading `type`) are skipped instead of emitting dead augmentations, and the generated `.variants.d.ts` is now referenced from the theme's `.d.ts` so the augmentation actually loads. (#3371)

@josephfarina
