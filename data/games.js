/* ==========================================================
   TRANSPARENCY SETTINGS. Edit this when a game, charity or rate changes.
   Each game's numbers live in its own CSV in this folder.

   CSV columns (one row per platform per month):
     Month        2026-10            (year-month)
     Platform     itch.io / Google Play / App Store / Ads
     Gross        120.00             what buyers paid, before any cut
     PlatformCut  12.00  or  10%     the store's cut, in dollars or as a percent of Gross
     Donated      16.20              what you actually gave from this row's money
     Charity      OAR                must match a charity "short" name below (blank = the game's charity)
     Receipt      https://...        optional link to proof of the donation
     Notes        anything           optional
   The site works out:  Net = Gross - PlatformCut,  Kept = Net - Donated,
   and checks Donated against the game's pledge (rate x Net).
   ========================================================== */
window.CHARITIES = {
  OAR:  { name: "Organization for Autism Research", url: "https://researchautism.org" },
  IGDA: { name: "IGDA Foundation",                  url: "https://igdafoundation.org" },
  ASAN: { name: "Autistic Self Advocacy Network",   url: "https://autisticadvocacy.org" }
};

window.GAMES = [
  { id: "mimic-masters",      name: "Mimic Masters",                      csv: "mimic-masters.csv",      rate: 0.70, charity: "ASAN", page: "mimic-masters/index.html" },
  { id: "scorchlet",          name: "Scorchlet",                          csv: "scorchlet.csv",          rate: 0.15, charity: "OAR",  page: "scorchlet/index.html" },
  { id: "hero-impervious",    name: "Hero Impervious",                    csv: "hero-impervious.csv",    rate: 0.15, charity: "IGDA", page: "hero-impervious/index.html" },
  { id: "we-built-this-city", name: "We Built This City: Farmer Edition", csv: "we-built-this-city.csv", rate: 0.15, charity: "IGDA", page: "we-built-this-city/index.html" }
];
