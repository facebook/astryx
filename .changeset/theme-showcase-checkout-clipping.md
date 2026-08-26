---
'@astryxdesign/cli': patch
---

[fix] The theme-showcase checkout card no longer clips its own fields. The card number field truncated mid-number (`1234 1234 12`), the country selector ellipsized, and the pay button was left with only a few pixels of slack.

@rubyycheung

The checkout sat in a grid track with a 200px minimum, so its width was a fraction of however many tracks happened to fit — it swung between 208px and 328px as the viewport resized, and the narrow end is well under what the form needs. Themes with a large spacing scale suffered most: Matcha's `--spacing-5` card padding alone spends 60px of that budget.

The checkout and chat panels are now a wrapping flex row. They share a row at roughly 1:2 while both flex bases fit, then the chat drops to its own full-width row, which makes 300px a floor for the checkout rather than an accident of the track count. Raising the track minimum instead would have left a tall gap beside the checkout at mid widths, since a two-track row can't hold a two-track span.

Two narrower fixes ride along, both text the card was breaking rather than fitting: the payment-method grid's minimum goes 70px to 80px so "Google" stops breaking mid-word on Matcha and Y2K, and on phones the card drops one padding step and sheds the card number's decorative start icon, which together buy back the room a 16-digit number needs at 360px.
