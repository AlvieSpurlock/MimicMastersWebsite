# Free Demo (play.html)

A 10-minute demo in the browser. When the time is up the game stops right away and a panel pointing to the free
Google Play and App Store versions first, and itch.io ($2.99, no ads) last.
The timer and panel live on the web page, so the game itself needs no changes.

## 1. Build the web version in Unity

- File → Build Settings → WebGL → Build.
- Player Settings → Publishing Settings → Compression Format:
  - **Disabled** (simplest; leave `fileSuffix:""` in config.js), or
  - **Gzip + Decompression Fallback** ticked (set `fileSuffix:".unityweb"`).
  GitHub Pages can't serve Unity's compressed files without the fallback.
- Every file must be under 100 MB (GitHub's limit).

## 2. Copy the build here

From Unity's output folder, copy the **Build** folder into `play/`
(and **StreamingAssets** too, if your build has one). You should end up with:

    play/Build/MimicMasters.loader.js
    play/Build/MimicMasters.data
    play/Build/MimicMasters.framework.js
    play/Build/MimicMasters.wasm

Ignore Unity's index.html and TemplateData; play.html replaces them.

## 3. Fill in assets/config.js

- `webPlay.buildName`: the start of those file names (e.g. "MimicMasters").
- `webPlay.fileSuffix`: see step 1.
- `webPlay.aspect`: "9 / 16" for portrait, "16 / 9" for landscape.
- `stores.ios` / `stores.android`: paste the store links when the listings go live.
  Until then those buttons say "Free · coming soon (join the testers)" and open the tester pages.
- `stores.itch` and `itchPrice` are already set.

## Notes

- Only time the page is on screen counts, and it's remembered across reloads in that browser.
- The demo resets every day at midnight (the visitor's local time), so anyone can play again tomorrow.
- The same build can go on itch.io with no limit: the limit only exists on this page.
- Point the flier QR code at play.html to drop people straight into the game, or at the
  home page, which now has a "▶ Try the Free Demo" button at the top.
