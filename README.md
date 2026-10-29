# Mimic Masters Website

Official website for **Mimic Masters**, hosted on GitHub Pages.

Live site: https://alviespurlock.github.io/MadTeaPartyDevelopment/mimic-masters/

This folder is part of the Mad Tea Party Development site. The privacy-sync workflow now lives at the repo root in `.github/workflows/sync-privacy.yml` and runs inside this folder.

## Pages (31)

| Group | Pages |
|---|---|
| Landing | `index.html` |
| Game Modes (7) | `classic`, `cadence-tracker`, `parry-madness`, `elemental-bash`, `shuffle-board`, `quantum-overload`, `battle-for-time` |
| Features (3) | `accessibility`, `customization`, `adjustable-ads` |
| Feedback (2) | `feedback-in-depth`, `feedback-short` |
| Store Network | `store-network` (+ forms `recommend-store`, `signup-store`) |
| Ethical Indie Dev Coalition | `ethical-indie-dev-coalition` (+ forms `recommend-indie-dev`, `signup-indie-dev`) |
| Community | `community` (Discord, YouTube Business, YouTube Personal, Twitch), `coverage`, `press`, `contact` |
| Other | `charity` (Charity Dedication), `about-creator` |
| Testers | `android-tester`, `ios-tester` |
| Help / Legal | `support`, `privacy` |

## Things you edit

- **Social links:** `assets/config.js` (Discord, YouTube Business, YouTube Personal, Twitch). Empty links show "Link coming soon".
- **Store Network data:** `data/stores.csv` (columns: StoreName, City, State, Category, RelevantHabit, AgeGroup, Notes, GoogleMapsLink, ImageLink). Category: Retail, Restaurant, Entertainment or Services (plus an optional SubCategory column).
- **Coalition criteria:** high-quality games, at least 10% to a grassroots charity, no controversies in the last year (edit in `ethical-indie-dev-coalition.html`), plus the "All For One, One For All" pledge with its three sub-points.
- **Indie Dev Coalition data:** `data/games.csv` (columns: GameName, StoreLink, Studio, StudioName, RelevantHabit, AgeGroup, OptimalRegion, ImageLink). Studio: MyStudio or OtherStudio. OptimalRegion can list several, separated by `|`.
- **Store Network sections:** results are grouped into Retail, Restaurant and Entertainment. The Google Sheet can use tabs named exactly `Retail`, `Restaurant`, `Entertainment`, or a single sheet with a `Category` column. Header spacing and capitalization don't matter ("Image Link" = `ImageLink`). ImageLink, RelevantHabit and AgeGroup are app-only and are not shown on the site.
- **App store buttons:** the landing page shows App Store and Google Play logos (inside the title card on PC, under it on mobile). Set `stores.ios` / `stores.android` in `assets/config.js` when the apps are live; until then they open `join-ios.html` / `join-android.html` (Discord + tester prompts). `appleFocused` picks which logo comes first when the visitor's platform can't be detected.
- **Press & Social downloads:** `downloads/press-assets.zip` (full quality) and `downloads/social-assets.zip` (post-ready), linked from the Press page.
- **Live data (optional):** publish a Google Sheet to the web as CSV and paste the link into `storesCsvUrl` / `gamesCsvUrl` in `assets/config.js`.
- **Press:** a Google Sheet (`pressSheetUrl` in `assets/config.js`, shared as Anyone with the link: Viewer) with two tabs named `Videos` and `Press`. Columns in each: `Thumbnail`, `Description`, `Date`, `Link`. Thumbnail can be an image URL or a Google Drive share link; for YouTube links it can be left blank. Put `press-assets.zip` and `social-assets.zip` in `downloads/` for the two download buttons.
- **Typed city search (Custom):** shows only stores whose City matches the town typed (and State, if given). Stores in nearby towns or elsewhere in the state are not shown; if there are none, the visitor sees the "No partner stores here yet" panel. **Around The Corner** is the exception: it goes by distance from the visitor, so it can include a neighbouring town's stores within `aroundCornerMiles`. `nearbyMiles` in `assets/config.js` is no longer used by the Store Network. `data/cities-us.json` (built from GeoNames `cities500.txt`, US places only) still supplies city positions for Near Me. City data © [GeoNames](https://www.geonames.org/) (CC BY 4.0), credited on the lookup pages.
- **Visitor location** is typed by the visitor, used only in their browser, and never sent or stored.

## Privacy Policy auto-sync

`.github/workflows/sync-privacy.yml` runs `scripts/sync_privacy.py` every 6 hours (Google Doc → parser → Markdown-to-HTML converter → formatter → `assets/privacy-content.html`). Do not edit that output file by hand. The Doc must be shared as "Anyone with the link: Viewer" and Actions needs "Read and write permissions".

## Forms

Forms embed Google Forms via their responder links. They must not require sign-in: no file uploads, "Limit to 1 response" off, email collection set to "Do not collect" or "Responder input".

If you edit locally, **Pull before you Push**, because the sync bot commits to this repo.

## Transparency (Made / Given / Kept)

`transparency.html` shows month by month what Mimic Masters made after platform cuts, what went to ASAN and what was kept. The numbers come from **`../data/mimic-masters.csv`** in the main site (one row per platform per month: `Month, Platform, Gross, PlatformCut, Donated, Charity, Receipt, Notes`). Platforms: Google Play, App Store, itch.io. The Charity page also shows a Made / Given / Kept summary from the same file, and once the CSV lists any donations it is used for "Donated so far" instead of the ledger Sheet. See the main site's README for how to fill the CSV in.

## Donations (Charity page and Landing page)

`assets/donations.js` fills the "Giving So Far" block on `charity.html` and the "Giving Back" block on `index.html` with two totals: Estimated raised (from players) and Donated so far (from the ledger). Nothing is shown until there is data.

Share the Sheet as **Anyone with the link: Viewer**. Tabs:
- **First tab, the ledger** (one universal ledger for ALL your games): headers `Charity`, `Date`, `Amount`, one row per donation you make. This site only totals and lists rows whose Charity matches `donationCharity` in `assets/config.js` (currently ASAN). Other games' charities are ignored here.
- **Contributions sheet (a second Sheet, also shared Anyone with the link: Viewer), tab `Players`**: columns `PlayerID`, `Contribution`, `Updated`, one row per player. Each game reports its lifetime estimated charity dollars through an Apps Script web app (`ContributionReceiver.gs`) using a random player id (`ContributionReporter.cs` in the Unity project). The site adds the `Contribution` column up for "Estimated raised" (always flagged ESTIMATE). Setup is in the header of `ContributionReceiver.gs`.
- **`Estimate` tab, optional fallback**: headers `Amount`, `AsOf`, one row typed by hand. Used only while `Players` is empty.

To use a different Sheet or tab name, add `donationsSheetUrl:"https://docs.google.com/spreadsheets/d/.../edit"` and/or `contributionsSheetUrl:"https://docs.google.com/spreadsheets/d/.../edit"` and/or `donationsContribTab:"Players"` to `assets/config.js`.

## Platform Progress (landing page)

`index.html` shows a "Platform Progress" block, filled by `assets/progress.js` from `platformProgress` in `assets/config.js`.

- **iOS:** plain text you edit by hand: `ios.status` (for example "Waiting for Review") and `ios.asOf` (for example "October 21st").
- **Android:** a live count of testers from the testers Google Sheet (`android.testersSheetUrl`). It counts the non-empty cells in `testersColumn` (B, the email column), so empty rows are ignored, and compares it to `testersGoal` (30). It reads only the count, never the emails. The Sheet must be shared as "Anyone with the link: Viewer". Repeated emails are counted each time. If the count can't load, the tile says "Testers wanted" and shows no number.
- When `stores.ios` / `stores.android` hold a real App Store / Google Play link, that tile switches to "Available now". When both are live the whole block hides.

## Store Network: "Near Me" button

The search opens with three buttons in a row: **Near Me**, **Around The Corner** and **Custom**. **Custom** swaps them for the City and State boxes and **Find Stores**, with a **Back** button centred underneath that returns to the three. **Near Me** asks the browser for the visitor's exact location (the visitor must allow it), then lists only the stores in the visitor's own town, closest first. The town is the nearest one in `data/cities-us.json` within 15 miles, worked out in the browser; on the edge of a big city it can pick the neighbouring town, and **Custom** fixes that. Stores within 1 mile of each other are shuffled at random on each search so close neighbours share the top spot fairly. The location stays in the browser and is never sent or saved. **Custom** shows only stores in the town typed (no distances, since a town has no exact point).

Store positions are the middle of each store's city by default. For true distances, add optional `Latitude` and `Longitude` columns to the stores Sheet (right-click the place in Google Maps and click the numbers to copy them).

Exact store positions, in order of priority: `Latitude`/`Longitude` columns, then coordinates found inside a **full** Google Maps link in `GoogleMapsLink` (open the short maps.app.goo.gl link, then copy the long address from the browser's address bar), then the middle of the city. An optional `Address` column is shown on the store's card. `StoreGeocoder.gs` (Extensions > Apps Script in the stores Sheet) can fill `Latitude`/`Longitude` from the `Address` column automatically.

## Store Network: "Around The Corner" button

**Around The Corner** is the short-drive button next to Near Me. It uses the visitor's exact location (they must allow it) and lists only stores within `aroundCornerMiles` of it (default 2, set in `assets/config.js`; use 1 for a tighter circle). Stores in range are still closest first, with stores within a mile of each other shuffled so neighbours share the top spot. Near Me is unchanged.

Because the circle is small, it only counts stores with a confirmed spot: `Latitude`/`Longitude` columns, a full Google Maps link, or an `Address` filled in by StoreGeocoder. A store placed only by its city is left out, since the middle of a city could be miles from the shop. If nothing is in range, the visitor sees a message with a button to show the closest stores instead.

## Traffic per page

The site counts page views into a **private** Google Sheet that you own. Nothing goes to a third party. It is off until you set it up:

1. Make a new, private Sheet called "Mimic Masters Traffic", open Extensions > Apps Script, paste in `TrafficReceiver.gs` (it is not part of the website, so keep it with your other Apps Script files) and follow the steps at the top of that file.
2. Paste the web app URL (ends in `/exec`) into `trafficUrl` in `assets/config.js`.

Open the **Totals** tab to read it: views per page (all time and last 7 days), views by source, and views by day. The raw **Traffic** tab has one row per day, page and source.

**Tagging links.** Add `?src=name` to any link you hand out and the Sheet shows how many visits came from it, for example `store-network.html?src=flyer-lubbock-a` on a QR code, or `?src=email-warfrogs` in an email. Without a tag, the source is the site the visitor came from (`from:reddit.com`), `site` (moving around the site) or `direct`.

**What it does and does not do.**
- It counts page views, not unique people, and it still counts some bots and misses visitors who block scripts.
- No cookies and no visitor ID. The browser only remembers that a page was counted for the rest of that visit, so a reload does not add another view.
- It skips visitors who send Do Not Track or Global Privacy Control, automated browsers, and `localhost`.
- To keep your own visits out, open any page once with `?notrack=1` on each of your devices. Use `?notrack=0` to count that device again.
- Add a line to the Privacy Policy saying the site counts page views without cookies or personal identifiers.

## Store categories and sub categories

`Category` is one of **Retail**, **Restaurant**, **Entertainment** or **Services**. Add a `SubCategory` column to the stores Sheet (header spelling and capitals don't matter). Allowed values:

| Category | SubCategory |
|---|---|
| Retail | Clothes, Weapons, Games, Media, Nutrition, Specialty |
| Restaurant | Food, Cafes |
| Services | Clothes, Cars, Fashion, Specialty |
| Entertainment | (none) |

Picking a category on the Store Network page shows its sub category buttons. If the Sheet uses one tab per category, add a tab named `Services` as well. To change the lists, edit `SUBS` near the top of `assets/network.js`. Stores whose `SubCategory` is blank or not in the list still appear under "All" for their category.
