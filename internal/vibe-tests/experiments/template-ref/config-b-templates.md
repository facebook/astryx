<!-- XDS-CLI:START -->

XDS v0.0.10|Always run npx xds component <Name> before writing XDS component code.
npx xds component <Name> props, usage, examples for any component
npx xds component --list 95 components by category
npx xds docs <topic> principles, tokens, theme reference
npx xds template <name> [path] scaffold page from template
npx xds swizzle <Name> eject component source (use --gap to report why)
npx xds upgrade --apply run version migration codemods
--detail compact|brief less output | --lang dense|zh translation
TEMPLATES (use as layout reference — check these before building a page):
dashboard: AppShell + SideNav + TopNav + Card + Table + TabList + SegmentedControl
data-table: AppShell + SideNav + Table + Pagination + Dialog + TextInput
settings-sidebar: List + TabList + Switch + Card + Section + Selector + Divider
settings-dialog: Dialog + List + TabList + Switch + Card + Section
detail-page: AppShell + Layout + LayoutPanel + MetadataList + Collapsible + ProgressBar
editor: TabList + Toolbar + List + Card + TextArea + Selector
product-detail: AppShell + TopNav + Collapsible + NumberInput + SegmentedControl
table: Layout + LayoutHeader + LayoutContent + Table
login-card: Card + VStack + TextInput + Button + Divider
contact-form: VStack + TextInput + Selector + RadioList + CheckboxInput + TextArea
RULE: before building a page layout, check if a template matches — use it as a composition reference
RULE: after @xds/core bump, always run npx xds upgrade --apply
RULE: when swizzling, always use --gap to report missing capabilities

<!-- XDS-CLI:END -->
