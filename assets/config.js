/* EDIT ME: site-wide settings. Leave a link empty ("") and its button shows "Link coming soon". */
window.SITE={
  links:{
    discord:"https://discord.gg/3SWjw83hHQ",   // e.g. https://discord.gg/yourInvite
    youtubeBusiness:"https://www.youtube.com/@Hatters_Mania",   // your business channel URL
    youtubePersonal:"https://www.youtube.com/@HattersMania",   // your personal channel URL
    twitch:"https://www.twitch.tv/hattersmania"     // e.g. https://www.twitch.tv/yourChannel
  },
  // Store pages: paste the App Store / Google Play URL when live. Empty = the landing buttons open the Join/Release pages.
  appleFocused:false,   // logo order when the visitors platform cannot be detected: true = Apple first, false = Android first
  stores:{
    ios:"",       // e.g. https://apps.apple.com/app/idXXXXXXXXX
    android:""    // e.g. https://play.google.com/store/apps/details?id=com.yourpackage
  },
  // Optional live data: Google Sheets > File > Share > Publish to web > CSV link.
  // If set, it is used instead of data/stores.csv / data/games.csv (falls back to them on failure).
  // Press page: Google Sheet with tabs named Videos and Press (columns: Thumbnail, Description, Date, Link). Share it as "Anyone with the link: Viewer".
  pressSheetUrl:"https://docs.google.com/spreadsheets/d/1-EAeArB_0UWxSoTxya9A-qL-SpKa5cw5RTqVdsQCdNI/edit?usp=sharing",
  trafficUrl:"https://script.google.com/macros/s/AKfycbxQPRHkJw_xzJ2kGwJy28oEKJ_15cpd4gmDQOzhY_d9waQCcfOylBdEOehHd9ji-ihB/exec",   // Page-view counter: paste your TrafficReceiver web app URL (ends in /exec). Leave blank to count nothing.
  nearbyMiles:50,   // Store Network: how far "nearby" reaches
  aroundCornerMiles:2,   // Store Network "Around The Corner" button: how far a short drive reaches (1 to 2 miles)
  storesCsvUrl:"https://docs.google.com/spreadsheets/d/1I-3HYszsSXz9xXAMGkrx1USPITzDeKpg9hPNqrY4rl8/edit?usp=sharing",
  gamesCsvUrl:"https://docs.google.com/spreadsheets/d/1jiBBk1qjRfI4BG0QtHvUte_sYPmSXDYixHXfyW097Z8/edit?usp=sharing",
  // Donations: ONE universal ledger for all your games (Charity | Date | Amount). This site only totals the charity named here.
  // Use the name exactly as you type it in the ledger's Charity column (capitals and punctuation do not matter). A list works too: ["ASAN","Autistic Self Advocacy Network"]
  donationsSheetUrl:"https://docs.google.com/spreadsheets/d/1dxzL7XYXNb0fk4bb9b4GMNO7BqOpGALekMsCOH7xLz0/edit?usp=sharing",
  donationCharity:["ASAN","Autistic Self Advocacy Network"],
  // Estimated raised: the Google Sheet the games report to (tab "Players").
  contributionsSheetUrl:"https://docs.google.com/spreadsheets/d/1KCmfXcqwW6QI4aUAgZk9iZ3ofzt2U2F8g2hDD4U6YSc/edit?usp=sharing"
};
