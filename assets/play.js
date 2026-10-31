/* Free Demo page: loads the Unity WebGL build as a timed demo (a few minutes),
   then shows the store panel (free mobile stores first, itch.io last).
   Settings live in assets/config.js → stores, itchPrice, webPlay. Nothing to edit here. */
(function () {
  var S = window.SITE || {};
  var W = Object.assign({ buildName: "MimicMasters", fileSuffix: "", freeMinutes: 5, graceSeconds: 60, aspect: "9 / 16" }, S.webPlay || {});
  var stores = S.stores || {};
  var KEY = "mm_free_play_seconds";
  var limit = W.freeMinutes * 60;
  document.querySelectorAll("[data-mm-minutes]").forEach(function (e) { e.textContent = W.freeMinutes; });

  var stage = document.getElementById("mm-stage");
  var canvas = document.getElementById("mm-canvas");
  var bar = document.getElementById("mm-bar");
  var startBtn = document.getElementById("mm-start");
  var timeLeft = document.getElementById("mm-left");
  var panel = document.getElementById("mm-panel");
  var toast = document.getElementById("mm-toast");
  var missing = document.getElementById("mm-missing");
  stage.style.aspectRatio = W.aspect;

  function load() { try { return parseFloat(localStorage.getItem(KEY)) || 0; } catch (e) { return 0; } }
  function save(v) { try { localStorage.setItem(KEY, String(Math.floor(v))); } catch (e) {} }

  // ---- Store buttons (used by the panel and the "keep playing" row on the page) ----
  var ua = navigator.userAgent || "";
  var isApple = /iPhone|iPad|iPod|Macintosh/.test(ua) ? true : /Android/.test(ua) ? false : !!S.appleFocused;
  function storeBtn(name, live, tester) {
    var a = document.createElement("a");
    a.className = "btn" + (live ? "" : " tl");
    a.href = live || tester;
    if (live) { a.target = "_blank"; a.rel = "noopener"; }
    a.innerHTML = name + " · <b>Free</b>" + (live ? "" : " <small>(coming soon · join the testers)</small>");
    return a;
  }
  function fillStores(box) {
    var apple = storeBtn("App Store", stores.ios, "join-ios.html");
    var android = storeBtn("Google Play", stores.android, "join-android.html");
    box.appendChild(isApple ? apple : android);
    box.appendChild(isApple ? android : apple);
    if (stores.itch) {
      var i = document.createElement("a");
      i.className = "btn dk"; i.href = stores.itch; i.target = "_blank"; i.rel = "noopener";
      i.textContent = "itch.io · " + (S.itchPrice || "") + " once, no ads";
      box.appendChild(i);
    }
  }
  document.querySelectorAll("[data-mm-stores]").forEach(fillStores);
  var anyLive = !!(stores.ios || stores.android);
  document.querySelectorAll("[data-mm-free-line]").forEach(function (el) {
    el.textContent = anyLive
      ? "Keep playing all 7 modes for free on your phone. Prefer no ads? Get it once on itch.io."
      : "Mimic Masters is coming free to Google Play and the App Store. Join the testers to play it on your phone now, or get it once on itch.io with no ads.";
  });

  // ---- Already used the free minutes on this browser? ----
  var played = load();
  if (played >= limit) { showPanel(); return; }

  // ---- Load the build ----
  // buildBase: where the Build folder lives (another site on the same domain works too).
  // parts: files too big for GitHub are stored as numbered pieces (name.part01, name.part02, ...)
  //        and joined back together here, in the visitor's browser.
  var buildBase = (W.buildBase || "play/Build/").replace(/\/?$/, "/");
  var base = buildBase + W.buildName;
  var sfx = W.fileSuffix || "";
  var parts = W.parts || {};
  var unity = null, running = false, timer = null, overAt = 0, shown = false;
  var fail = function () { stage.classList.add("is-missing"); missing.hidden = false; startBtn.hidden = true; };

  // Download every piece of the split files (showing progress), then hand them to Unity as one file each.
  function joinParts(onProgress) {
    var jobs = [];
    [["data", "application/octet-stream"], ["wasm", "application/wasm"]].forEach(function (f) {
      var n = parts[f[0]] || 0;
      for (var i = 1; i <= n; i++) jobs.push({ key: f[0], type: f[1], url: base + "." + f[0] + (W.gzip ? ".gz" : sfx) + ".part" + String(i).padStart(2, "0") });
    });
    if (!jobs.length) return Promise.resolve({});
    if (W.gzip && typeof DecompressionStream === "undefined") return Promise.reject(new Error("This browser can't unpack the demo"));
    var done = 0;
    return Promise.all(jobs.map(function (j) {
      return fetch(j.url).then(function (r) { if (!r.ok) throw new Error(j.url); return r.blob(); })
        .then(function (b) { done++; onProgress(done / jobs.length); j.blob = b; return j; });
    })).then(function (list) {
      // Join each file's pieces; if they were gzipped, unpack them in the browser.
      var out = {};
      return Promise.all(["data", "wasm"].map(function (key) {
        var mine = list.filter(function (j) { return j.key === key; });
        if (!mine.length) return null;
        var joined = new Blob(mine.map(function (j) { return j.blob; }));
        var ready = W.gzip
          ? new Response(joined.stream().pipeThrough(new DecompressionStream("gzip"))).blob()
          : Promise.resolve(joined);
        return ready.then(function (b) { out[key] = URL.createObjectURL(new Blob([b], { type: mine[0].type })); });
      })).then(function () { return out; });
    });
  }

  startBtn.addEventListener("click", function () {
    startBtn.disabled = true;
    startBtn.textContent = "Loading…";
    var hasParts = (parts.data || 0) + (parts.wasm || 0) > 0;
    var s = document.createElement("script");
    s.src = base + ".loader.js";
    s.onerror = fail;
    s.onload = function () {
      joinParts(function (p) { bar.style.width = Math.round(p * 80) + "%"; })
      .then(function (joined) {
        return createUnityInstance(canvas, {
          dataUrl: joined.data || base + ".data" + sfx,
          frameworkUrl: base + ".framework.js" + sfx,
          codeUrl: joined.wasm || base + ".wasm" + sfx,
          streamingAssetsUrl: W.streamingAssets || buildBase.replace(/Build\/$/, "StreamingAssets"),
          companyName: W.companyName || "March Hare Games",
          productName: W.productName || "Mimic Masters",
          productVersion: W.productVersion || "web"
        }, function (p) { bar.style.width = Math.round((hasParts ? 80 : 0) + p * (hasParts ? 20 : 100)) + "%"; });
      })
      .then(function (inst) { unity = inst; stage.classList.add("is-running"); startClock(); })
      .catch(fail);
    };
    document.body.appendChild(s);
  });

  function startClock() {
    running = true;
    tick();
    timer = setInterval(tick, 1000);
    window.addEventListener("pagehide", function () { save(played); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) save(played); });
  }

  function tick() {
    if (!running || shown) return;
    if (!document.hidden) played += 1;          // only count time the page is on screen
    if (Math.floor(played) % 10 === 0) save(played);
    var left = Math.max(0, Math.ceil(limit - played));
    timeLeft.textContent = left > 0 ? Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") + " left in the demo" : "The demo is over: finish your round!";
    if (played >= limit) {
      if (!overAt) { overAt = played; toast.hidden = false; }
      if (played - overAt >= W.graceSeconds) showPanel();
    }
  }

  // Optional: if the game calls window.MMRoundEnded() (see play/unity-optional), the panel
  // shows the moment the round in progress ends, instead of after the grace time.
  window.MMRoundEnded = function () { if (played >= limit) showPanel(); };

  function showPanel() {
    if (shown) return;
    shown = true;
    running = false;
    if (timer) clearInterval(timer);
    save(Math.max(played, limit));
    toast.hidden = true;
    timeLeft.textContent = "Thanks for trying the demo!";
    panel.hidden = false;
    stage.classList.add("is-over");
    if (unity) { try { unity.Quit(); } catch (e) {} }   // stop the game and its sound behind the panel
  }
})();
