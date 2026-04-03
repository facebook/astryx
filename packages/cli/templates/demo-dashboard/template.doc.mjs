/** @type {import('../../src/template-doc-types').TemplateDoc} */
export const doc = {
  name: 'Dashboard',
  slug: 'demo-dashboard',
  description: 'Analytics dashboard with KPI cards and a data table.',
  category: 'dashboard',
  tags: ['analytics', 'kpi', 'table', 'sidebar'],
  fullscreen: true,
  components: [
    {name: 'AppShell', usage: 'Page layout with side navigation'},
    {name: 'SideNav', usage: 'Navigation sidebar'},
    {name: 'Card', usage: 'KPI metric cards'},
    {name: 'Badge', usage: 'Status indicators and trend labels'},
    {name: 'Text', usage: 'Headings and body text'},
    {name: 'Divider', usage: 'Section separator'},
  ],
  files: [
    {path: 'page.tsx', description: 'Main dashboard page'},
  ],
};
