# Mimic Masters Website

Official website for **Mimic Masters**, hosted on GitHub Pages.

Live site: https://alviespurlock.github.io/MimicMastersWebsite/

## Pages (27)

| Group | Pages |
|---|---|
| Landing | `index.html` |
| Game Modes (7) | `classic`, `cadence-tracker`, `parry-madness`, `elemental-bash`, `shuffle-board`, `quantum-overload`, `battle-for-time` |
| Features (3) | `accessibility`, `customization`, `adjustable-ads` |
| Feedback (2) | `feedback-in-depth`, `feedback-short` |
| Store Network | `store-network` (+ forms `recommend-store`, `signup-store`) |
| Ethical Indie Dev Coalition | `ethical-indie-dev-coalition` (+ forms `recommend-indie-dev`, `signup-indie-dev`) |
| Community | `community` (Discord, YouTube Business, YouTube Personal, Twitch), `coverage` |
| Other | `charity` (Charity Dedication), `about-creator` |
| Testers | `android-tester`, `ios-tester` |
| Help / Legal | `support`, `privacy` |

## Things you edit

- **Social links:** `assets/config.js` (Discord, YouTube Business, YouTube Personal, Twitch). Empty links show "Link coming soon".
- **Store Network data:** `data/stores.csv` (columns: StoreName, City, State, Category, RelevantHabit, AgeGroup, Notes, GoogleMapsLink, ImageLink). Category: Retail, Restaurant or Entertainment.
- **Coalition criteria:** high-quality games, at least 10% to a grassroots charity, no controversies in the last year (edit in `ethical-indie-dev-coalition.html`).
- **Indie Dev Coalition data:** `data/games.csv` (columns: GameName, StoreLink, Studio, StudioName, RelevantHabit, AgeGroup, OptimalRegion, ImageLink). Studio: MyStudio or OtherStudio. OptimalRegion can list several, separated by `|`.
- **Live data (optional):** publish a Google Sheet to the web as CSV and paste the link into `storesCsvUrl` / `gamesCsvUrl` in `assets/config.js`.
- **Coverage:** `data/coverage.json` (see the comment in `coverage.html` for the entry format).
- **Nearby search:** `data/cities-us.json` (built from GeoNames `cities500.txt`, US places only) turns the typed city into coordinates; stores are listed nearest first within `nearbyMiles` (default 50) in `assets/config.js`, then same-state stores. City data © [GeoNames](https://www.geonames.org/) (CC BY 4.0), credited on the lookup pages.
- **Visitor location** is typed by the visitor, used only in their browser, and never sent or stored.

## Privacy Policy auto-sync

`.github/workflows/sync-privacy.yml` runs `scripts/sync_privacy.py` every 6 hours (Google Doc → parser → Markdown-to-HTML converter → formatter → `assets/privacy-content.html`). Do not edit that output file by hand. The Doc must be shared as "Anyone with the link: Viewer" and Actions needs "Read and write permissions".

## Forms

Forms embed Google Forms via their responder links. They must not require sign-in: no file uploads, "Limit to 1 response" off, email collection set to "Do not collect" or "Responder input".

If you edit locally, **Pull before you Push**, because the sync bot commits to this repo.
