# Astryx PR #8742: native iPad Tall-sheet handle recovery

**A genuine sheet-handle drag dismisses the visible iPad keyboard. Original frames show a transient accessory-only band, followed by full recovery. This does not prove a stable accessory-only state with a field still focused; acceptance of the requested evidence gate remains a reviewer decision.**

## Exact build and environment

- PR: https://github.com/meta/astryx/pull/8742
- Captured head: `b6ef992e156c5552a9a42ff59d84990bc5339c50`.
- The PR Analysis Report at https://github.com/meta/astryx/pull/8742#issuecomment-6453890623 identified that head and linked the deployment below. The head differs from `40d77a28fc80f48e1baed66351a858550bc1655f` only by four added comment lines in MobileTokenizer; this recording tests the new exact deployment rather than relying on that equivalence.
- Direct test page: https://astryx-2hyjqbd7c-fbopensource.vercel.app/storybook/iframe.html?id=core-bottomsheet--mobile-keyboard&viewMode=story . Safari opened it as the top-level document, not an embedded Storybook manager or Docs iframe.
- Device: iPad mini (A17 Pro) Simulator, portrait; iPadOS 27.0, runtime build `24A434`; Safari; Xcode 27.0 (`27A266a`). This is iPad evidence, not iPhone evidence.
- Native display: 744 × 1133 points; original capture: 1488 × 2266 pixels.
- Original recording began October 30, 2026, at approximately 22:56:59 UTC. All frame timestamps below are the original video presentation timestamps, not wall-clock gesture estimates.

AST-099 is current at `docs/specs/AST-099-mobile-keyboard/spec.md`. FR5 covers movement of the surface, such as dragging the sheet, not merely scrolling its body. FR7 and the platform-support section require a top-level iOS Simulator/device document. This receipt supplements the earlier iPhone show/Done recovery evidence; it is not the full platform or physical-device release matrix.

## Reproducible sequence

1. Open the direct test-page URL in iPad Simulator Safari and tap **Add a comment**. Keep the Tall sheet fully expanded.
2. Tap **Team**. Confirm QWERTY keys are visible. The test checked that `q` or `Q` was hittable, not just that an off-screen Keyboard accessibility node existed.
3. Press the real decorative sheet handle at approximately screen point `(372, 183)` for 0.1 seconds, then slowly drag down 20 points to `(372, 203)`, holding for another 0.1 seconds before release. This is short enough to keep the sheet open and return to the Tall detent.
4. Watch the native keyboard animate away while the sheet moves and springs back. Inspect the original frames for the brief remaining accessory strip.
5. Wait two seconds and retain the fully recovered, still-open sheet.
6. The same run re-focused Team and tapped iPad's native **Hide keyboard** key. That second path also recovered fully at rest. It is a native key press, not the handle gesture, and is not used to claim a stable retained-accessory state.

Native XCTest supplied actual taps and touch drags; `simctl io recordVideo --codec=h264` supplied the native display video. No host keyboard toggle, synthetic viewport event, modified source, injected script, or native wrapper created these stages. No keyboard-display preference or global Xcode setting was changed in this follow-up.

## Original frames and measured outcomes

- `01-ipad-keyboard-shown.png`: native screenshot before handle travel. Team has keyboard focus; QWERTY and the accessory band are visible. Team's text-entry rectangle is y=659–684 points, above the accessory controls at y=794 and keys starting at y=848.
- Original PTS **12.566667 s**, `02-native-keyboard-hiding.png`: actual keyboard dismissal in progress as the sheet begins moving.
- Original PTS **12.680000 s**, `03-native-accessory-only-transient.png`: no QWERTY keys remain on-screen; the bottom accessory strip and its up/down arrows are still visible.
- Original PTS **12.710000 s**, `04-native-accessory-only-transient.png`: the remaining strip is partly visible as it continues leaving. These two frames are 30 ms apart. They prove an observed transient band, not a stable state or its precise duration.
- Original PTS **12.900000 s**, `05-native-full-recovery.png`: keys and accessory band are gone; the sheet is still open and back in its Tall position.
- `06-ipad-recovered-at-rest.png`: native screenshot two seconds after the handle gesture. Title is y=431, Author y=507, Email y=583, Team y=659, Project y=735, Related task y=811 points, matching the pre-keyboard/native opened-sheet positions exactly. Team no longer has the accessibility `Keyboard Focused` state. The earlier iPad opening run established these pre-keyboard positions; this case starts with no additional body scroll.

The sheet's top edge moves slightly with the actual handle drag and returns. No visible first-frame content jump was found in the reviewed transition frames. The focused Team field was safely above the keyboard before movement, and the full recovered field geometry matches the opening geometry. No claim is made about a lower field, a nonzero pre-keyboard scroll baseline, pinch zoom, all focus routes, or frame-synchronous performance from this run.

## Retained media and limits

- `ipad-handle-native-original.mov`: original native recording, retained unchanged. It includes the handle sequence plus the later native Hide-key and body-scroll trial.
- `ipad-handle-recovery.webm`: browser-playable excerpt of original PTS 7–16 seconds. It is VP9, 1488 × 2266, YUV 4:2:0, TV/limited color range. The excerpt is re-encoded at 60 fps by sampling/duplicating recorded frames; it is not evidence of a 60 Hz native capture. Source PTS 12.68 corresponds to approximately 5.68 seconds in the excerpt.
- `frame-times.json`: exact PTS map for the unaltered decoded original PNG frames. Frames were extracted without image cropping, annotation, compositing, or interpolation.
- `01-ipad-keyboard-shown.png` and `06-ipad-recovered-at-rest.png` are native screenshots. Files 02–05 are native-video frame extractions, not standalone simulator screenshots.
- `ffprobe.json` and `SHA256SUMS`: format/decode verification and integrity hashes.

**Important limit:** the gesture blurs the field as FR5 requires. The accessory-only band here is a transient part of that native dismissal, and it disappears at rest. The run does not establish the still-focused, stable accessory-only recovery case described by the scroll-restoration implementation. Do not silently relabel this as such or mark the entire evidence gate passed without reviewer judgment.

All evidence work stayed outside the implementation repository. No source edits, commits, pushes, PR comments, thread changes, or merges were made by the evidence work.
