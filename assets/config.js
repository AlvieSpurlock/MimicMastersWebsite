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
  nearbyMiles:50,   // Store Network: how far "nearby" reaches
  storesCsvUrl:"https://docs.google.com/spreadsheets/d/1I-3HYszsSXz9xXAMGkrx1USPITzDeKpg9hPNqrY4rl8/edit?usp=sharing",
  gamesCsvUrl:"https://docs.google.com/spreadsheets/d/1jiBBk1qjRfI4BG0QtHvUte_sYPmSXDYixHXfyW097Z8/edit?usp=sharing"
};
