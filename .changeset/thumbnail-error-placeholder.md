---
'@astryxdesign/core': patch
---

[fix] Thumbnail: show the placeholder when the image fails to load

The docs promise a placeholder on load failure, but the img had no error handling, so a broken src rendered a broken image indefinitely. The component now tracks the errored src and falls back to the placeholder, retrying when src changes.
@arham766
