// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE/XLO playground examples — every entry verified against the
 * validator. @generated-ish: curated then machine-formatted; edit the
 * source list in tooling rather than by hand.
 */

export type XLEExample = {category: string; label: string; expr: string};

export const XLE_EXAMPLES: XLEExample[] = [
  {
    category: 'Pages',
    label: 'Analytics dashboard',
    expr: 'A[cp6 @topNav=TN @sideNav=SN] > L > LC > V[g6] > (H[j=between a=center] > Hd"Analytics"[level=2] + (H[g2] > B"Export" + B.primary"New report")) + (G[c4 g4] > (C[p6] > V[g1] > Tx.lg"\\$42k" + Tx[t=supporting]"Revenue")*4) + (G[c{min:340} g4] > C{card-callout} + C{card-callout}) + (C[p0] > T[striped] > (TR>THC"Order"+THC"Customer"+THC"Status"+THC"Total") + (TR>TC"#10$"+TC"Acme Inc"+(TC>Bd.success"Paid")+TC"\\$120")*5)',
  },
  {
    category: 'Pages',
    label: 'Settings page',
    expr: 'A[cp6 @topNav=TN @sideNav=SN] > L > LC > S[p6] > V[g6] > Hd"Settings"[level=2] + (C[p6] > V[g4] > Hd"Profile"[level=4] + (F > TI"Name"[req] + TI"Email"[t=email req]) + B.primary"Save") + (C[p6] > V[g4] > Hd"Notifications"[level=4] + (H[j=between a=center] > Tx"Email alerts" + SW"Email alerts") + (H[j=between a=center] > Tx"Push" + SW"Push"))',
  },
  {
    category: 'Pages',
    label: 'Order detail',
    expr: 'A[cp6 @topNav=TN] > L > LC > V[g6] > (H[j=between a=center] > (V[g1] > Hd"Order #1042"[level=2] + Tx[t=supporting]"Created today") + Bd.success"Paid") + (G[c{min:280} g6] > (C[p6] > V[g4] > Hd"Items"[level=4] + (T > (TR>THC"Item"+THC"Qty") + (TR>TC"Widget"+TC"2")*3)) + (C[p6] > V[g3] > Hd"Customer"[level=4] + (ML > MLI"Name":"Acme" + MLI"Email":"a@x.com" + MLI"Plan":"Pro")))',
  },
  {
    category: 'Pages',
    label: 'Users table page',
    expr: 'A[cp6 @topNav=TN @sideNav=SN] > L > LC > V[g4] > (Tbar"Users" > B"Filter" + B"Export" + B.primary"Invite") + (C[p0] > T[striped] > (TR>THC"Name"+THC"Role"+THC"Status") + (TR>TC"Person $"+TC"Engineer"+(TC>Bd.success"Active"))*8) + (H[j=end] > PG[variant=count])',
  },
  {
    category: 'Pages',
    label: 'Pricing page',
    expr: 'S[p8] > V[g8] > (Ctr > V[g2] > Hd"Pricing"[level=1] + Tx[t=supporting]"Pick a plan that fits") + (G[c3 g6] > (C[p6] > V[g4] > Hd"Pro"[level=3] + Tx.lg"\\$29/mo" + (UL > LI"Feature one" + LI"Feature two" + LI"Feature three") + B.primary"Choose Pro")*3)',
  },
  {
    category: 'Pages',
    label: 'Login split',
    expr: 'G[c2 h="100dvh"] > (S[p8 v=muted] > Ctr > V[g2] > Hd"Acme"[level=1] + Tx[t=supporting]"Welcome back") + (Ctr > C[w=360 p8] > V[g6] > (F > TI"Email"[t=email req] + TI"Password"[t=password req]) + (H[j=between a=center] > CB"Remember me" + Lk[href="/forgot"]"Forgot?") + B.primary"Sign in")',
  },
  {
    category: 'Pages',
    label: 'Profile header',
    expr: 'C[p6] > H[j=between a=center] > (H[g4 a=center] > Av + (V[g1] > Hd"Jane Doe"[level=3] + Tx[t=supporting]"Product Designer")) + (H[g2] > B"Message" + B.primary"Follow")',
  },
  {
    category: 'Pages',
    label: 'Kanban board',
    expr: 'G[c3 g4] > (C[p4] > V[g3] > (H[j=between a=center] > Hd"To Do"[level=5] + Bd"3") + (V[g2] > (C[p3] > Tx"Task item")*3))*3',
  },
  {
    category: 'Pages',
    label: 'Dashboard with sidebar nav',
    expr: 'A[cp0 @sideNav=(SN > (SNS"Main" > SNI"Dashboard" + SNI"Reports" + SNI"Settings"))] > L > LC > S[p6] > V[g6] > Hd"Dashboard"[level=2] + (G[c4 g4] > (C[p6] > V[g1] > Tx.lg"128" + Tx[t=supporting]"Metric")*4)',
  },
  {
    category: 'Pages',
    label: 'Feed with composer',
    expr: 'Ctr > C[w=560 p0] > V > (C[p4] > V[g3] > (H[g2 a=center] > Av + Tx"Share an update") + (H[j=end] > B.primary"Post")) + D + (V[g0] > (C[p4] > V[g2] > (H[g2 a=center] > Av + (V[g0.5] > Tx"User $" + Tx[t=supporting]"2h ago")) + Tx"A post body goes here.")*3)',
  },
  {
    category: 'Pages',
    label: 'Two-column form',
    expr: 'A[cp6 @topNav=TN] > L > LC > S[p6] > C[p6] > V[g4] > Hd"New employee"[level=3] + (G[c2 g4] > TI"First name"[req] + TI"Last name"[req] + TI"Email"[t=email req] + TI"Phone" + (RL"Department" > RLI"Engineering" + RLI"Design") + (CL"Access" > CLI"Admin" + CLI"Billing")) + (H[j=end g2] > B"Cancel" + B.primary"Create")',
  },
  {
    category: 'Pages',
    label: 'Stats + chart + activity',
    expr: 'V[g6] > (G[c3 g4] > (C[p6] > V[g1] > Tx.lg"\\$12k" + Tx[t=supporting]"This week")*3) + (G[c{min:320} g6] > C{card-callout} + (C[p6] > V[g3] > Hd"Recent activity"[level=4] + (UL > LI"Event one" + LI"Event two" + LI"Event three")))',
  },
  {
    category: 'Pages',
    label: 'Confirm dialog flow',
    expr: 'V[g4] > (Tbar"Document" > B"Share" + B.destructive"Delete"[opens=#del]) + (C[p6] > Tx"Document body content") ;; AD#del"Delete this document?"',
  },
  {
    category: 'Pages',
    label: 'Outline settings (XLO)',
    expr: 'AppShell cp=6\n  topNav: TN\n  sideNav: SN\n  Layout > LayoutContent\n    Section p=6\n      VStack g=6\n        Heading "Settings" level=2\n        Card p=6\n          VStack g=4\n            Heading "Profile" level=4\n            FormLayout\n              TextInput "Name" req\n              TextInput "Email" t=email req\n            Button.primary "Save"\n        Card p=6\n          VStack g=4\n            Heading "Danger zone" level=4\n            Button.destructive "Delete account" opens=#del\n\noverlays:\n  AlertDialog#del "Delete your account?"',
  },
  {
    category: 'Pages',
    label: 'Outline product page (XLO)',
    expr: 'Section p=8\n  Grid c={min:320} g=8\n    Card p=0\n      Center h=240\n        Text t=supporting "Image"\n    VStack g=4\n      Heading "Product name" level=1\n      Text.lg "\\$129"\n      Text t=supporting "A short product description goes here."\n      HStack g=2\n        Button.primary "Add to cart"\n        Button "Save"',
  },
  {
    category: 'Layout',
    label: 'Centered box',
    expr: 'Ctr[h="100dvh"] > C[w=400 p8] > Tx"Hello world"',
  },
  {
    category: 'Layout',
    label: 'App shell',
    expr: 'A[cp6 @topNav=TN @sideNav=SN] > L > LC > S[p6] > Tx"Page content"',
  },
  {
    category: 'Layout',
    label: 'App shell + header',
    expr: 'A[cp4 @topNav=TN] > L > LH"Page header" + LC > S[p4] > Tx"Body"',
  },
  {
    category: 'Layout',
    label: 'Vertical stack',
    expr: 'V[g4] > Tx"One" + Tx"Two" + Tx"Three"',
  },
  {
    category: 'Layout',
    label: 'Spread row',
    expr: 'H[j=between a=center] > Tx.lg"Title" + B.primary"Action"',
  },
  {category: 'Layout', label: 'Grid 4-up', expr: 'G[c4 g4] > C[p6]*4'},
  {
    category: 'Layout',
    label: 'Responsive grid',
    expr: 'G[c{min:320} g4] > C{card-callout}*3',
  },
  {
    category: 'Layout',
    label: 'Section muted',
    expr: 'S[p6 v=muted] > Tx"Muted section"',
  },
  {
    category: 'Layout',
    label: 'Nested stacks',
    expr: 'V[g6] > (H[j=between] > Tx.lg"Header" + B"Edit") + (G[c3 g4] > C[p4]*3)',
  },
  {
    category: 'Layout',
    label: 'Layout regions',
    expr: 'L > LH"Header" + LC > S[p4] > Tx"Body"',
  },
  {
    category: 'Layout',
    label: 'Divider between',
    expr: 'V[g4] > Tx"Above" + D + Tx"Below"',
  },
  {
    category: 'Layout',
    label: 'Fill stack item',
    expr: 'H[g4] > Tx"Fixed" + (SI[size=fill] > Tx"Grows")',
  },
  {
    category: 'Layout',
    label: 'Toolbar + content',
    expr: 'V[g4] > (Tbar"Actions" > B"Filter" + B.primary"New") + S[p4] > Tx"Below toolbar"',
  },
  {
    category: 'Cards',
    label: 'Titled card',
    expr: 'C[p6] > V[g2] > Hd"Card title"[level=3] + Tx[t=supporting]"Supporting copy"',
  },
  {
    category: 'Cards',
    label: 'KPI tile',
    expr: 'C[p6] > V[g1] > Tx.lg"1,284" + Tx[t=supporting]"Active users"',
  },
  {
    category: 'Cards',
    label: 'KPI grid',
    expr: 'G[c4 g4] > (C[p6] > V[g1] > Tx.lg"\\$42k" + Tx[t=supporting]"Revenue")*4',
  },
  {
    category: 'Cards',
    label: 'Clickable card',
    expr: 'CC[p6] > H[j=between a=center] > Tx"Open project" + Ic[icon=arrow-right]',
  },
  {
    category: 'Cards',
    label: 'Card grid',
    expr: 'G[c3 g4] > (C[p6] > V[g2] > Hd"A"[level=4] + Tx"text")*3',
  },
  {category: 'Cards', label: 'Callout block', expr: 'S[p6] > C{card-callout}'},
  {
    category: 'Cards',
    label: 'Badge row',
    expr: 'H[g2] > Bd.success"Active" + Bd.warning"Pending" + Bd.error"Failed" + Bd.info"New"',
  },
  {
    category: 'Cards',
    label: 'Avatar row',
    expr: 'H[g2 a=center] > Av + (V[g0.5] > Tx"Jane Doe" + Tx[t=supporting]"Admin")',
  },
  {
    category: 'Cards',
    label: 'Metadata list',
    expr: 'C[p6] > ML > MLI"Status":"Active" + MLI"Owner":"Jane" + MLI"Region":"us-east"',
  },
  {
    category: 'Content',
    label: 'List',
    expr: 'UL > LI"First item" + LI"Second item" + LI"Third item"',
  },
  {
    category: 'Content',
    label: 'Kbd hint',
    expr: 'H[g2 a=center] > Tx"Press" + K"mod+k" + Tx"to search"',
  },
  {
    category: 'Content',
    label: 'Headings scale',
    expr: 'V[g3] > Hd"H1"[level=1] + Hd"H2"[level=2] + Hd"H3"[level=3]',
  },
  {
    category: 'Content',
    label: 'Text + link',
    expr: 'H[g1] > Tx"Read" + Lk[href="/docs"]"the docs"',
  },
  {
    category: 'Content',
    label: 'Tokens',
    expr: 'H[g2] > Tk"react" + Tk"typescript" + Tk"stylex"',
  },
  {
    category: 'Tables',
    label: 'Simple table',
    expr: 'C[p0] > T[striped] > (TR > THC"Name" + THC"Email") + (TR > TC"Alice" + TC"alice@x.com")*5',
  },
  {
    category: 'Tables',
    label: 'Table + status cell',
    expr: 'T > (TR > THC"Service" + THC"Status") + (TR > TC"api-gateway" + (TC > Bd.success"Up"))*4',
  },
  {
    category: 'Tables',
    label: 'Dense table',
    expr: 'T[density=compact dividers=rows] > (TR > THC"ID" + THC"Value") + (TR > TC"row-$" + TC"\\$12.00")*6',
  },
  {
    category: 'Tables',
    label: 'Table in card',
    expr: 'C[p0] > T[striped] > (TR>THC"Item"+THC"Qty") + (TR>TC"Widget"+TC"3")*3',
  },
  {
    category: 'Forms',
    label: 'Login form',
    expr: 'Ctr[h="100dvh"] > C[w=400 p8] > V[g6] > (F > TI"Email"[t=email req] + TI"Password"[t=password req]) + B.primary"Sign in"',
  },
  {
    category: 'Forms',
    label: 'Field set',
    expr: 'F > TI"Full name"[req] + TI"Email"[t=email req] + TA"Bio" + B.primary"Save"',
  },
  {
    category: 'Forms',
    label: 'Inline controls',
    expr: 'H[j=between a=center] > CB"Remember me" + Lk[href="/forgot"]"Forgot password?"',
  },
  {
    category: 'Forms',
    label: 'Number + switch',
    expr: 'V[g4] > NI"Quantity" + (H[j=between a=center] > Tx"Notifications" + SW"Enable notifications")',
  },
  {
    category: 'Forms',
    label: 'Two column form',
    expr: 'G[c2 g4] > TI"First name"[req] + TI"Last name"[req] + TI"Email"[t=email req] + TI"Phone"',
  },
  {
    category: 'Forms',
    label: 'Checkbox list',
    expr: 'CL"Permissions" > CLI"Read" + CLI"Write" + CLI"Admin"',
  },
  {
    category: 'Forms',
    label: 'Radio list',
    expr: 'RL"Plan" > RLI"Free" + RLI"Pro" + RLI"Enterprise"',
  },
  {
    category: 'Forms',
    label: 'Slider',
    expr: 'V[g4] > SL"Volume" + SL"Brightness"',
  },
  {
    category: 'Forms',
    label: 'Date input',
    expr: 'F > DI"Start date" + DI"End date"',
  },
  {category: 'Forms', label: 'Search field', expr: 'TI"Search"[t=text]'},
  {
    category: 'Nav',
    label: 'Tabs',
    expr: 'TL > Tab"Overview"! + Tab"Activity" + Tab"Settings"',
  },
  {
    category: 'Nav',
    label: 'Breadcrumbs',
    expr: 'BC > BCI"Home"[href="/"] + BCI"Projects"[href="/projects"] + BCI"Detail"',
  },
  {
    category: 'Nav',
    label: 'Segmented control',
    expr: 'SG > SGI"Day" + SGI"Week" + SGI"Month"',
  },
  {
    category: 'Nav',
    label: 'Top nav',
    expr: 'TN > TNH"Acme" + TNI"Docs" + TNI"Pricing"',
  },
  {
    category: 'Nav',
    label: 'Side nav',
    expr: 'SN > (SNS"Main" > SNI"Dashboard" + SNI"Reports") + (SNS"Settings" > SNI"Profile")',
  },
  {category: 'Nav', label: 'Pagination', expr: 'PG[variant=count]'},
  {
    category: 'Nav',
    label: 'Tabs + content',
    expr: 'V[g4] > (TL > Tab"All"! + Tab"Active") + S[p4] > Tx"Tab body"',
  },
  {
    category: 'Feedback',
    label: 'Success banner',
    expr: 'Bn.success"Changes saved successfully"',
  },
  {
    category: 'Feedback',
    label: 'Empty state',
    expr: 'ES"No results found"[description="Try adjusting your filters"]',
  },
  {category: 'Feedback', label: 'Spinner', expr: 'Ctr[h=200] > Sp'},
  {
    category: 'Feedback',
    label: 'Progress bar',
    expr: 'V[g4] > PB[value=60] + PB[value=90]',
  },
  {category: 'Feedback', label: 'Skeletons', expr: 'V[g2] > Sk*4'},
  {
    category: 'Feedback',
    label: 'Delete dialog',
    expr: 'V > B.destructive"Delete"[opens=#confirm] ;; AD#confirm"Delete this item?"',
  },
  {
    category: 'Feedback',
    label: 'Status dots',
    expr: 'V[g2] > (H[g2 a=center] > SD.success + Tx"Operational") + (H[g2 a=center] > SD.error + Tx"Outage")',
  },
  {
    category: 'Feedback',
    label: 'Toolbar actions',
    expr: 'Tbar"Actions" > B"Filter" + B"Export" + B.primary"New"',
  },
  {category: 'Blocks', label: 'Splice block', expr: 'S[p6] > C{card-callout}'},
  {
    category: 'Blocks',
    label: 'Block grid',
    expr: 'G[c2 g4] > {card-callout}*2',
  },
  {category: 'Blocks', label: 'Standalone block', expr: '{card-callout}'},
  {
    category: 'Outline',
    label: 'Outline app shell',
    expr: 'AppShell cp=6\n  topNav: TN\n  Layout > LayoutContent\n    Section p=6\n      Grid cols=4 gap=4\n        Card p=6 x4',
  },
  {
    category: 'Outline',
    label: 'Outline form',
    expr: 'Center h="100dvh"\n  Card w=400 p=8\n    VStack g=6\n      FormLayout\n        TextInput "Email" t=email req\n        TextInput "Password" t=password req\n      Button.primary "Sign in"',
  },
  {
    category: 'Outline',
    label: 'Outline dashboard',
    expr: 'Section p=6\n  VStack g=6\n    HStack j=between a=center\n      Heading "Dashboard" level=2\n      Button.primary "New"\n    Grid c=4 g=4\n      Card {card-callout} x4',
  },
  {
    category: 'Outline',
    label: 'Outline table',
    expr: 'Card p=0\n  Table striped\n    TableRow\n      TableHeaderCell "Name"\n      TableHeaderCell "Role"\n    repeat 4:\n      TableRow\n        TableCell "Person"\n        TableCell "Engineer"',
  },
  {
    category: 'Outline',
    label: 'Outline with overlay',
    expr: 'VStack g=4\n  Button.destructive "Delete" opens=#confirm\n\noverlays:\n  AlertDialog#confirm "Delete this item?"',
  },
  {
    category: 'Outline',
    label: 'Outline tabs',
    expr: 'VStack g=4\n  TabList\n    Tab "Overview" !\n    Tab "Activity"\n    Tab "Settings"\n  Section p=4\n    Text "Tab content"',
  },
  {
    category: 'Chat',
    label: 'Chat layout',
    expr: 'ChL > ChML > ChS"Today" + (ChM > ChB"Hello there") + (ChM > ChB"Hi, how can I help?")',
  },
];

export const XLE_CATEGORIES = [...new Set(XLE_EXAMPLES.map(e => e.category))];
