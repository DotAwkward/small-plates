# Data safety and ads answers (version 1.2 and later)

Small Plates 1.2 adds one AdMob banner, so the Play Console answers change. Dot Awkward still collects nothing itself; everything below is what Google's ad code (the Google Mobile Ads SDK) collects and sends to Google. Google's own list: https://developers.google.com/admob/android/privacy/play-data-disclosure

Update these **before** the first build with ads goes to testers, and after the privacy page update is live.

## Policy → App content → Ads

- Does your app contain ads? **Yes, my app contains ads.**

## Policy → App content → Advertising ID

- Does your app use advertising ID? **Yes**
- Purposes: **Advertising or marketing**, **Analytics**, **Fraud prevention, security and compliance**

(The ads code adds the `AD_ID` permission to the app on its own, so Play will expect this answer.)

## Policy → App content → Data safety

**Data collection and security**
- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes** (Google's ad code uses TLS)
- Do you provide a way for users to request that their data be deleted? **No** (Dot Awkward holds no user data; the advertising ID can be reset or deleted in the phone's settings)

**Data types** (tick only these)

| Category | Type | Collected | Shared | Processed ephemerally | Required or optional | Purposes |
|---|---|---|---|---|---|---|
| Location | Approximate location | Yes | Yes | No | Required | Advertising or marketing; Analytics; Fraud prevention, security, and compliance |
| App activity | App interactions | Yes | Yes | No | Required | Advertising or marketing; Analytics; Fraud prevention, security, and compliance |
| App info and performance | Crash logs | Yes | Yes | No | Required | Analytics; Fraud prevention, security, and compliance |
| App info and performance | Diagnostics | Yes | Yes | No | Required | Analytics; Fraud prevention, security, and compliance |
| Device or other IDs | Device or other IDs | Yes | Yes | No | Required | Advertising or marketing; Analytics; Fraud prevention, security, and compliance |

Why each one:
- **Approximate location:** the ad code sends the phone's IP address, which Google uses to guess the rough area.
- **App interactions:** app launches, ad views and taps.
- **Crash logs / Diagnostics:** how the app and the ad code are performing.
- **Device or other IDs:** the Android advertising ID and app set ID.

Leave everything else unticked: no personal info (name, email), no precise location, no messages, photos, contacts, health, financial or web-browsing data. Saved games and player names stay on the phone and never leave it, so they don't count.

## Store listing

Nothing to tick: Play adds the **Contains ads** label by itself once the Ads answer is Yes. The full description in `listing.md` already says how the banner behaves.

## Target audience

Unchanged: 13 and up. Keep "not designed for children". (If the app ever targets under-13s, the ad setup has to change to Families rules first.)
