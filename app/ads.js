// The Google Play app's one ad: a banner along the bottom, with Google's consent form where the law needs one.
// build.js adds this file to the Android app only. The website and the artifact copy never get it.
// House rule: a banner that never covers play. No pop-up ads between rounds, nothing that makes you wait,
// no watching ads to unlock anything.
(() => {
  const AdMob = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
    && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob;
  if (!AdMob) return;

  // Google's test ads until the real banner ID from AdMob goes here (then set TESTING to false).
  // The app ID lives in android/app/build.gradle (admobAppId).
  const TESTING = true;
  const BANNER_ID = "ca-app-pub-3940256099942544/9214589741";

  // The banner floats over the bottom of the page, just above Android's navigation bar, so the page
  // keeps that much room free: the scroll end, the sticky letter ticket and the pop-up sheets all sit above it.
  // The room only grows during a visit, so a banner that fails to load never makes the plates jump mid-game.
  const style = document.createElement("style");
  style.textContent = `
.app, .home { padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px) + var(--ad-h, 0px)) !important; }
.ticket { bottom: calc(max(8px, env(safe-area-inset-bottom, 0px)) + var(--ad-h, 0px)) !important; }
.overlay { padding-bottom: calc(max(16px, env(safe-area-inset-bottom, 0px)) + var(--ad-h, 0px)) !important; }`;
  const room = document.createElement("style");
  document.head.append(style, room);
  let reserved = 0;
  function reserve(h) {
    if (h === reserved) return;
    reserved = h;
    room.textContent = h ? `:root { --ad-h: ${h}px; }` : "";
    if (h) try { localStorage.setItem(ROOM_KEY, h); } catch (e) {}
  }
  // The banner's height from last time, so the room is there before the ad arrives (only the very first launch shifts).
  const ROOM_KEY = "small-plates-v1-ad-room";
  const lastRoom = () => { try { return parseInt(localStorage.getItem(ROOM_KEY), 10) || 0; } catch (e) { return 0; } };

  let showing = false;
  let retry = null;
  function showBanner() {
    if (showing) return;
    showing = true;
    Promise.resolve(AdMob.showBanner({
      adId: BANNER_ID,
      adSize: "ADAPTIVE_BANNER",
      position: "BOTTOM_CENTER",
      margin: 0,
      isTesting: TESTING,
    })).catch(() => { showing = false; });
  }
  function removeBanner() {
    clearTimeout(retry);
    showing = false;
    Promise.resolve(AdMob.removeBanner()).catch(() => {});
    reserve(0);
  }
  AdMob.addListener("bannerAdSizeChanged", size => {
    if (showing && size && size.height > 0) reserve(Math.max(reserved, Math.ceil(size.height)));
  });
  AdMob.addListener("bannerAdFailedToLoad", () => {
    // No ad right now (offline, say). Keep the space and try again in a minute.
    showing = false;
    clearTimeout(retry);
    retry = setTimeout(showBanner, 60000);
  });

  let canRequestAds = false;
  let privacyOptions = false;
  let initialized = null;
  function apply(info) {
    if (!info) return;
    canRequestAds = !!info.canRequestAds;
    privacyOptions = info.privacyOptionsRequirementStatus === "REQUIRED";
  }
  async function serve() {
    if (!canRequestAds) { removeBanner(); return; }
    initialized = initialized || AdMob.initialize({ initializeForTesting: TESTING, maxAdContentRating: "ParentalGuidance" });
    await initialized;
    reserve(Math.max(reserved, lastRoom()));
    showBanner();
  }

  // At launch, ask Google whether this phone needs the consent form (the EU, the UK and a few other places),
  // show it if so, then start the banner if ads are allowed.
  async function start() {
    try {
      const info = await AdMob.requestConsentInfo();
      apply(info);
      if (info.isConsentFormAvailable && info.status === "REQUIRED") apply(await AdMob.showConsentForm());
    } catch (e) {
      // Offline or the form failed: Google remembers earlier answers, so go by what it already knows.
    }
    try { await serve(); } catch (e) {}
  }

  // For the Settings page: whether to offer "Ad privacy choices", and the form behind it.
  window.smallPlatesAds = {
    privacyOptionsRequired: () => privacyOptions,
    async showPrivacyOptions() {
      try {
        await AdMob.showPrivacyOptionsForm();
        apply(await AdMob.requestConsentInfo());
        await serve();
      } catch (e) {}
    },
  };

  start();
})();
