import{q as e}from"./padding.stylex-C-GcuG1E.js";import{N as t}from"./index-DfITYF77.js";import{t as n}from"./ChatToolCalls-DcUU4Fug.js";import{t as r}from"./BlockDocContext-BenmBPJO.js";var i=e(),a=`--- a/src/utils/formatDate.ts
+++ b/src/utils/formatDate.ts
@@ -8,7 +8,11 @@
-export function formatDate(date: Date): string {
-  return date.toLocaleDateString();
-}
+export function formatDate(
+  date: Date,
+  locale = 'en-US',
+  options?: Intl.DateTimeFormatOptions,
+): string {
+  return new Intl.DateTimeFormat(locale, options).format(date);
+}`,o=`$ yarn test
 PASS  src/utils/formatDate.test.ts
 PASS  src/components/DatePicker.test.tsx

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Time:        1.8s`;function s(){return(0,i.jsx)(n,{defaultIsExpanded:!0,calls:[{name:`edit`,target:`src/utils/formatDate.ts`,status:`complete`,duration:`85ms`,node:`cli:remote-server`,additions:6,deletions:3,resultDetail:(0,i.jsx)(t,{code:a,language:`typescript`,maxHeight:`50vh`})},{name:`bash`,target:`yarn test`,status:`complete`,duration:`1.8s`,node:`cli:remote-server`,resultDetail:(0,i.jsx)(t,{code:o,language:`bash`,maxHeight:`50vh`})},{name:`web_search`,target:`Intl.DateTimeFormat locale options`,status:`complete`,duration:`1.2s`}]})}var c={type:`block`,exampleFor:`ChatToolCalls`,name:`ChatToolCalls — Expandable`,displayName:`ChatToolCalls — Expandable`,description:`Tool calls with expandable result details showing diffs and command output in code blocks. Click a row to reveal its result.`,isReady:!0,aspectRatio:16/9,componentsUsed:[`ChatToolCalls`,`CodeBlock`]};function l(){return(0,i.jsx)(r,{meta:{aspectRatio:c.aspectRatio??4/3,scale:c.scale??1},children:(0,i.jsx)(s,{})})}export{l as default};