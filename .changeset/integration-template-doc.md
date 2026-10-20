---
'@astryxdesign/cli': patch
---

[feat] Three new published types describe an integration package's templates: `IntegrationPageTemplateDoc` and `IntegrationBlockTemplateDoc`, each with every field of its `TemplateDoc` member but `category` as the package's own string instead of a `TemplateCategory` value, and their union, `IntegrationTemplateDoc`. `@astryxdesign/cli/authoring` exports `IntegrationTemplateDoc`; `@astryxdesign/cli/doc` and `@astryxdesign/cli/template` export all three. `TemplateDoc` is unchanged.

@josephfarina
