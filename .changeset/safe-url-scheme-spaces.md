---
'@astryxdesign/core': patch
---

[fix] Navigation URL safety: refuse a data URL with spaces before its media type
@cixzhang

The shared URL safety check now ignores spaces after a URL's scheme before it compares the scheme, as a data URL's media type does, so `data: text/html,…` is refused like `data:text/html,…`. In Markdown this also refuses links, images, and angle autolinks whose destination decodes to that form, such as `data:&#32;text/html,…`. Accepted URLs are returned as before.
