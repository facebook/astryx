# AGENTS

Project-specific guidance for AI coding agents.

<!-- XDS:START -->

XDS v0.0.10|Always run yarn xds component <Name> before writing XDS component code.
yarn xds component <Name> props, usage, examples for any component
yarn xds component --list 106 components by category
yarn xds docs principles Design principles, rules, and anti-patterns for XDS.
yarn xds docs theme XDSTheme provider, custom themes, light/dark mode, and component style overrides.
yarn xds docs tokens Spacing, color, radius, typography, and shadow token reference.
yarn xds template <name> [path] scaffold page from template
TEMPLATES (use as layout reference — check before building a page):
blank Layout
contact-form CheckboxInput + Divider + RadioList + Selector + TextArea + TextInput + Token
dashboard AppShell + Avatar + Badge + Card + NavIcon + SegmentedControl + SideNav + Tab + TabList + Table + TopNav
data-table AppShell + Avatar + Badge + Card + Dialog + NavIcon + Pagination + Selector + SideNav + Tab + TabList + Table + TextInput
detail-page AppShell + Avatar + Badge + Card + Center + Collapsible + Divider + Layout + List + MetadataList + NavIcon + ProgressBar + SideNav + Tab + TabList
editor Card + Divider + List + SegmentedControl + Selector + Tab + TabList + TextArea + TextInput + Toolbar
file-explorer Divider + List + SegmentedControl + Toolbar
login Card + Center + FormLayout + Layout + TextInput
login-card Card + Divider + TextInput
login-split Card + Divider + TextInput
login-sso Card + Divider + TextInput
product-detail AppShell + Badge + Center + Collapsible + Divider + NavIcon + NumberInput + SegmentedControl + TopNav
settings CheckboxInput + Divider + List + Search + Searchable + TextInput + Typeahead
settings-dialog Badge + Card + Dialog + Divider + List + Selector + Switch + Tab + TabList + TextInput
settings-sidebar Badge + Card + Divider + List + Selector + Switch + Tab + TabList + TextInput
table Badge + Layout + Table
RULE: before building a page layout, check if a template matches your intent
yarn xds swizzle <Name> eject component source (use --gap to report why)
yarn xds upgrade --apply [--from <v> --to 0.0.10] run version migration codemods
--detail compact|brief less output | --lang dense|zh translation
RULE: after @xds/core bump, always run yarn xds upgrade --apply
RULE: when swizzling, always use --gap to report missing capabilities

<!-- XDS:END -->
