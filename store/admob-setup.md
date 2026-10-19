# Setting up AdMob for Small Plates

The app already shows Google's **test** banner (a sample ad that says "Test Ad"). That's safe for anyone to tap. Real ads switch on once the IDs from the steps below go into the code.

Think of AdMob like renting out a small sign at the bottom of the shop window: AdMob finds the advertisers, and you get paid when people see or tap the sign. You need an account (the landlord's paperwork), the app registered (which shop), and one "ad unit" (which window).

You click everything in AdMob and Play Console yourself. Send back the three IDs marked **Send this back**.

## 1. Create the AdMob account

1. Go to https://admob.google.com and sign in with the same Google account as Play Console.
2. **Get started**, then:
   - **Country or territory:** where you live (it decides tax and payments, and can't change later).
   - **Time zone:** yours.
   - **Billing currency:** your local currency.
3. Read and accept the AdMob terms.
4. Email preferences: your call. "Customized help and performance suggestions" can be off.

Payment details (name, address, bank) come later; AdMob asks once you've earned enough to be paid (around $100). The identity and tax steps it asks for then are yours to fill in.

## 2. Add the app

1. **Apps → Add app**.
2. **Platform:** Android.
3. **Is the app listed on a supported app store?** **No** for now: a closed test doesn't count as listed. You link it to the Play listing after it's public (step 6).
4. **App name:** `Small Plates`
5. **Enable user metrics:** **Off**. (It's extra analytics we don't need.)
6. **Add app**. AdMob shows the **App ID**, which looks like `ca-app-pub-1234567890123456~1234567890`. **Send this back.**

## 3. Make the banner ad unit

1. In the app, **Ad units → Add ad unit → Banner**.
2. **Ad unit name:** `Bottom banner`
3. Leave **Advanced settings** as they are (partner bidding and eCPM floor off is fine).
4. **Create ad unit**. Copy the **Ad unit ID**, which looks like `ca-app-pub-1234567890123456/1234567890`. **Send this back.**
5. Skip the "Implement" instructions; that part is done.

Don't add any other ad unit types (Interstitial, Rewarded, App open). They break the studio rule.

## 4. The consent message (EU, UK, Switzerland)

Without this, the consent pop-up the app asks for never appears, and Google may stop serving ads in Europe.

1. **Privacy & messaging → European regulations → Create message**.
2. **Apps:** tick Small Plates.
3. **Languages:** English (add others if you like).
4. **User consent options:** tick **Consent**, **Do not consent** and **Manage options**. (Showing "Do not consent" is friendlier and fine.)
5. **Close (do not consent):** off.
6. **Privacy policy URL:** `https://dotawkward.com/privacy/`
7. Styling: optional. Cobalt `#2C5AA0` for buttons matches the game.
8. **Publish**.

The **US states regulations** message is optional. Skip it unless you want it.

## 5. Your publisher ID and app-ads.txt

1. **Settings → Account information → Publisher ID**, which looks like `pub-1234567890123456`. **Send this back.**
2. I'll add a file to the studio site at `https://dotawkward.com/app-ads.txt` with this one line:

   ```
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```

   (Only your number changes. The last part is Google's fixed ID.) It tells advertisers "ads in this app really are sold by this AdMob account", which stops fakes and earns more.
3. AdMob finds that file through the **website** on the Play listing. It must be exactly `https://dotawkward.com/` (Play Console → **Grow users → Store presence → Store settings → Contact details → Website**). That's already in `listing.md`; just check it's saved.

## 6. Later, once the app is public on Google Play

1. AdMob → **Apps → Small Plates → App settings → App store details → Add** and find Small Plates on Google Play.
2. AdMob then checks app-ads.txt by itself (it can take a day or two). Status shows under **Apps → View all apps**.

## 7. Don't tap your own real ads

Once real IDs are in, tapping your own ads can get the account suspended. Before installing a build with real ads, add your phone as a test device: AdMob → **Settings → Test devices → Add test device**, platform Android, and the advertising ID from your phone's **Settings → Google → Ads**. Your phone then always gets test ads.

## Where the IDs go (for me)

- App ID → `android/app/build.gradle`, `admobAppId`.
- Ad unit ID → `app/ads.js`, `BANNER_ID`, and set `TESTING` to `false` there.
- Publisher ID → `../site/app-ads.txt`.

## Checklist: what you still click

AdMob:
- [ ] Create the account (step 1)
- [ ] Add the app, send the App ID (step 2)
- [ ] Make the banner, send the Ad unit ID (step 3)
- [ ] Publish the European consent message (step 4)
- [ ] Send the publisher ID (step 5)
- [ ] Add your phone as a test device (step 7)
- [ ] Later: link to the Play listing (step 6)

Play Console, before uploading the first 1.2 build (answers in `data-safety.md`):
- [ ] App content → Ads: **Yes**
- [ ] App content → Advertising ID: **Yes**, with the three purposes
- [ ] App content → Data safety: the five data types
- [ ] Main store listing: paste the new "MADE TO BE NICE TO YOU" lines from `listing.md`
- [ ] Store settings → Website is `https://dotawkward.com/`

Studio site (I prepare, you OK the push):
- [ ] Privacy page update live **before** the 1.2 build goes to testers
- [ ] app-ads.txt live once the publisher ID is in
