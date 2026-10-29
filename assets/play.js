/* Play Free page: loads the full Unity WebGL build, gives a few minutes of free play,
   then shows the store panel (free mobile stores first, itch.io last).
   Settings live in assets/config.js → stores, itchPrice, webPlay. Nothing to edit here. */
(function () {
  var S = window.SITE || {};
  var W = Object.assign({ buildName: "MimicMasters", fileSuffix: "", freeMinutes: 5, graceSeconds: 60, aspect: "9 / 16" }, S.webPlay || {});
  var stores = S.stores || {};
  var KEY = "mm_free_play_seconds";
  var limit = W.freeMinutes * 60;

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
  var base = "play/Build/" + W.buildName;
  var sfx = W.fileSuffix || "";
  var unity = null, running = false, timer = null, overAt = 0, shown = false;

  startBtn.addEventListener("click", function () {
    startBtn.disabled = true;
    startBtn.textContent = "Loading…";
    var s = document.createElement("script");
    s.src = base + ".loader.js";
    s.onerror = function () { stage.classList.add("is-missing"); missing.hidden = false; startBtn.hidden = true; };
    s.onload = function () {
      createUnityInstance(canvas, {
        dataUrl: base + ".data" + sfx,
        frameworkUrl: base + ".framework.js" + sfx,
        codeUrl: base + ".wasm" + sfx,
        streamingAssetsUrl: "play/StreamingAssets",
        companyName: "March Hare Games",
        productName: "Mimic Masters",
        productVersion: "web"
      }, function (p) { bar.style.width = Math.round(p * 100) + "%"; })
      .then(function (inst) { unity = inst; stage.classList.add("is-running"); startClock(); })
      .catch(function () { stage.classList.add("is-missing"); missing.hidden = false; startBtn.hidden = true; });
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
    timeLeft.textContent = left > 0 ? Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") + " of free play left" : "Free play is over: finish your round!";
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
    timeLeft.textContent = "Thanks for playing!";
    panel.hidden = false;
    stage.classList.add("is-over");
    if (unity) { try { unity.Quit(); } catch (e) {} }   // stop the game and its sound behind the panel
  }
})();
