// OPTIONAL. Put this file anywhere under Assets/Plugins/WebGL in your Unity project.
// It lets the game tell the Play Free page "a round just ended", so the store panel
// appears right at the end of a round instead of after the grace time.
mergeInto(LibraryManager.library, {
  MM_RoundEnded: function () {
    if (typeof window.MMRoundEnded === "function") window.MMRoundEnded();
  }
});
