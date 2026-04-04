<!-- XDS-CLI:START -->

XDS v0.0.10|Always run npx xds component <Name> before writing XDS component code.
npx xds component <Name> props, usage, examples for any component
npx xds component --list 95 components by category
npx xds docs <topic> principles, tokens, theme reference
npx xds template <name> [path] scaffold page from template
npx xds swizzle <Name> eject component source (use --gap to report why)
npx xds upgrade --apply run version migration codemods
--detail compact|brief less output | --lang dense|zh translation
TEMPLATES (use as layout reference — study the skeleton before building a page):
dashboard: AppShell + SideNav + TopNav + Card + Table + TabList + SegmentedControl
data-table: AppShell + SideNav + Table + Pagination + Dialog + TextInput
settings-sidebar: List + TabList + Switch + Card + Section + Selector + Divider
detail-page: AppShell + Layout + LayoutPanel + MetadataList + Collapsible + ProgressBar
table: Layout + LayoutHeader + LayoutContent + Table
product-detail: AppShell + TopNav + Collapsible + NumberInput + SegmentedControl
LAYOUT SKELETONS (spatial reference — note where padding and gap live):
[table]
<Layout>
<LayoutHeader hasDivider>
<HStack hAlign="between"> title + action </HStack>
</LayoutHeader>
<LayoutContent> ← LayoutContent provides scroll + padding
<Table />
</LayoutContent>
</Layout>
[dashboard]
<AppShell contentPadding={6} sideNav={<SideNav/>} topNav={<TopNav/>}>
<VStack gap={6}> ← page sections: gap 6
<Card> ← stat cards (use Grid columns={4} for card grid)
<VStack gap={4}> ← inside card: gap 4
<VStack gap={1}> ← label+value: gap 1
<Card padding={0}> ← table card: padding 0 so table bleeds to edges
<Table />
</VStack>
</AppShell>
[settings-sidebar]

  <div style="padding: 0">         ← sidebar: no extra padding, List handles it
    <VStack gap={4}>
      <Heading />
      <List density="spacious" />   ← nav items
    </VStack>
  </div>
  <div maxWidth={700} padding="16px 48px" margin="0 auto">  ← content area
    <VStack gap={6}>                ← sections: gap 6
      <Heading />
      <TabList hasDivider />
      <VStack gap={8}>              ← setting groups: gap 8
        <VStack gap={0}>            ← individual rows: gap 0, Divider between
          <Heading />
          <Divider />
          {rows}
        </VStack>
      </VStack>
    </VStack>
  </div>
[detail-page]
  <AppShell sideNav={<SideNav/>}>
    <Layout height="fill">
      <LayoutHeader hasDivider>     ← page header with breadcrumbs
      </LayoutHeader>
      <LayoutContent role="main" padding={0}>  ← padding 0 when using inner sections
        <VStack gap={6}>
          <Section>                  ← overview section
            <MetadataList />         ← key-value pairs
          </Section>
          <TabList />
          <Section>
            <Collapsible />          ← expandable detail sections
          </Section>
        </VStack>
      </LayoutContent>
      <LayoutPanel hasDivider width={360}>  ← right panel for summary
        <Card /> <ProgressBar />
      </LayoutPanel>
    </Layout>
  </AppShell>
SPATIAL RULES:
  - AppShell/Layout handle page padding — don't add extra padding inside LayoutContent
  - Card padding={0} when child is Table or List (they have their own row padding)
  - VStack gap={6-8} for page sections, gap={3-4} inside cards, gap={1-2} for label+value
  - Divider between list rows, not gap — use VStack gap={0} + Divider
  - maxWidth + margin auto for constrained content areas
RULE: before building a page layout, find the closest template skeleton and use it as spatial reference
RULE: after @xds/core bump, always run npx xds upgrade --apply
RULE: when swizzling, always use --gap to report missing capabilities
<!-- XDS-CLI:END -->
