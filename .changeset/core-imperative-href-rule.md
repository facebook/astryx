---
'@astryxdesign/core': patch
---

[fix] Apply the same narrow blocked-scheme rule to native links, custom routers, clickable surfaces, and Markdown links. Rejected destinations stay visible without navigating or invoking a router, including structured URLs with a separate protocol. Ordinary URLs, safe custom schemes, downloads, and accepted router-object identity are preserved; Markdown image/resource policy is unchanged. (#5524)

@bhamodi
