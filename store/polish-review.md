# Small Plates: polish review before Google Play

Read-only review, 2026-10-18. Nothing in the game was edited. I ran `node build.js` (which rewrites the generated `docs/` and `small-plates.html`), served `docs/` on localhost, and looked at it in the built-in browser at 375x812 (light and dark) and on desktop (1280x800 and 1280x640).

How I checked: I used real clicks for the home screen, the New table dialog and a few plates. To get to a served word, a special, the course pile, Check please and two-player, I rigged the deck and called the game's own `place()` / `showEnd()` functions from the console. The scoring and rendering are the real code, but I did not play a full game by hand. Screenshots were not saved into the repo, so each item below describes what the screenshot showed.

The working copy has uncommitted course-pile changes, and `game.template.html` changed on disk while I was reviewing (line numbers shifted). The `docs/` I looked at was built a few minutes into the review, so re-check anything marked "must-fix" against the latest build.

**Update, same day: must-fix items 1 to 5 are now fixed in the working copy (not committed).** Splash regenerated (cobalt, S/P plates, plus a dark version); Back closes dialogs; How to play slides are one fixed size; the board shrinks so the tray never covers a row (checked at 1280x640, 1280x800 and 375x812); the "For one"/"For two" tiles skip the one/two question. Checked in the browser only; the Android build was not rebuilt or run on a device.

## Must fix before Play

**1. Android splash is still Capacitor's default.**
- Screen: app launch on Android.
- What looks off: `android/app/src/main/res/drawable/splash.png` (and the `drawable-port-*` / `drawable-land-*` copies, all dated Oct 7) is the stock Capacitor placeholder, a pale blue X on a white screen. The launcher icon was replaced on Oct 17 and looks good (cobalt, S/P plates, coral dot). The splash was not.
- Why it matters: it is the first thing every tester sees, and it says "unfinished" before the game starts.
- Fix: regenerate splash with `@capacitor/assets` (already a devDependency), using a cobalt `#2C5AA0` background, the S/P plates or the "Small Plates" wordmark, and a dark variant. `capacitor.config.json` already has `backgroundColor: #2c5aa0`, so a cobalt splash will blend into the first frame.

**2. Android Back button closes the whole game from inside a dialog.**
- Screen: any dialog or page (Menu, New table, Stats, Settings, How to play, Check please).
- What looks off: `showGame()` pushes a history step, so Back from the board goes home, which is right. Dialogs and pages (`showOverlay`) push nothing, so with the Menu or a page open, Back leaves the game (or exits the app from home) instead of closing the dialog. Escape closes them on desktop, but there is no Back equivalent. There is no `@capacitor/app` plugin and no `backButton` handler.
- Fix: push a history step when an overlay opens and close the overlay on `popstate`, or add the Capacitor App plugin's `backButton` listener (close overlay, then go home, then exit).

**3. How to play, step 4 ("Don't get sent back"): the dialog grows and jumps.**
- Screen: intro / How to play, slide 4 of 5.
- What looks off: the five-plate demo (T I L E X) is wider than the dialog, so on this slide the dialog stretches from 343px to 357px wide, nearly touching both screen edges at 375px. The height also changes slide to slide (412, 412, 463, 434, 469px), so the Back/Next buttons jump around under the thumb. In the slide 3 and 4 screenshots the demo plates also crowd the left edge of the tablecloth box.
- Fix: make the demo scale down (smaller plate size or `max-width: 100%` with flex shrink), and give the intro body a fixed min-height so the buttons stay put.

**4. Letter tray covers the bottom plate row on shorter screens, not only short desktops.**
- Screen: the board during play.
- What looks off: the "order ticket" is `position: sticky` at the bottom. At 1280x800 the board runs to y=735 and the ticket starts at y=639, so the fourth plate row is under the ticket until you scroll. At 1280x640 you only see two rows. On a 375x812 phone with the install banner showing, the ticket sat just below the board and fit, but anything shorter (small Androids, split screen, big font settings) will hit this too.
- Fix: size the board from the space actually left (dvh minus header, scores, specials and ticket), or add bottom padding equal to the ticket's height so you can always scroll the last row clear. Dropping the install banner on the board (see nice-to-have) buys ~120px on phones.

**5. "For one" opens a dialog that asks one/two again.**
- Screen: Home, then New table.
- What looks off: tapping the "For one" tile opens "New table" with "How many?" showing Table for one / Table for two, plus Your name and All you can eat. The question was already answered by the tile. Confirmed in both themes. Also the Daily link inside the dialog says "Or play today's Daily Special".
- Fix: from a tile, preselect the mode and drop the "How many?" chooser (keep it only when opened from the Menu's "New table"), or make the tile start straight away with the saved name.

## Nice to have

**6. Install banner shows on the board.** Screen: board (web only; hidden in the Play build via `canInstall()`). It sits above the scores and pushes the playfield down ~120px on a phone. Show it on Home only, or after the first finished game.

**7. Color story vs. brand notes.** Screens: everywhere. The main buttons, plate rings, "Continue your table", the ticket top border and the "Your name" label are tomato/red-coral (a deeper red in light mode). Cobalt only shows on links, "Daily Special" and the icon. `../CLAUDE.md` says coral `#FF5D3A` is only for the studio mark, and the game color is cobalt. The game red is a different, deeper tone and is probably deliberate, but please confirm. If you want strict brand rules, switch the primary buttons to cobalt and keep red for sent-back/negative only. In the dark theme the "Continue your table" card and "Seat us" button read as a bright salmon, which is the closest thing to the studio coral.

**8. Course pile is small.** Screen: board, end of each served row. The stack of plates with a number (3, 2) is about 28px wide with a tiny number in dark mode. It works, but it is the new feature and easy to miss. Make the number larger (about 14px, bolder) and give the pile a touch more height difference between 1, 2 and 3+.

**9. Stats grid has holes.** Screen: Your stats, both themes. Specials and Sent back sit alone in half-width cells with a blank beside them; "Best all you can eat" wraps its label to two lines and makes its row taller than "Best solo"; its subtext "Playing solo" is confusing next to a dash. The "Stats count finished games…" note sits tight under the last cards. Fix: use a consistent 2-column grid with a full-width row for the last odd card, shorten the label ("Best AYCE" is not great; "All you can eat best" on one line, or let both cards share a height), and add space above the note.

**10. New table tiles on Home have dead space.** Screen: Home. The three tiles ("For one", "For two", "All you can eat") are equal height, but two of them have blank bottoms because "All you can eat" wraps to four lines. Shorten to "All you can eat" with a one-line sub ("Endless letters"), or give the tiles a fixed 3-column layout with smaller title type.

**11. Check, please! is plain.** Screen: end of game. "Best dish: BOAT" wraps with the points ("205") on a second line. There is no Share button for solo (the Share card appears to be Daily-only, which may be intended), and no direct "Home". Nice finishing touches: put "BOAT · 205" on one line and show a "New best!" ribbon.

**12. Desktop is a narrow column in a big empty page.** Screen: desktop home and board. The column is ~430px wide on a 1280px window, with a flat pale background. It works, but a subtle tablecloth pattern or a centered card with a shadow would make it look more intentional. Low priority since the stores are the real audience.

**13. Privacy text will go stale.** Screen: About. It says "no accounts, ads or trackers". That is true today, so no change now; remember `CLAUDE.md`'s rule to update privacy before any ad build.

## Fine as is

- Home screen in light and dark: clear hierarchy, readable contrast, nice wordmark and sign-off ("a dot awkward game" with the coral dot).
- Board in play, light and dark: the plates, the served-row highlight, the sent-back message ("OSC got sent back… -25") and the struck-through sent-back dishes in "Dishes served" all read clearly. A served special ("BOAT · a special! +205") strikes through the special in the banner and works well.
- Course pile exists and counts correctly (BAR as course 3, BOAT as course 2 in my rigged test).
- Two-player: each player gets a color, the turn label ("Alex, you're up") is obvious.
- Menu, Settings, Move your games, About, Add to home screen: all lay out cleanly in dark and light at phone width, no clipped text.
- New table dialog layout itself (apart from item 5).
- Fonts are bundled locally (no Google Fonts requests in the built `docs/index.html`), so it works offline.

## Android store-readiness (only things I checked)

| Item | Result |
|---|---|
| Launcher icon | Good. Custom adaptive icon, cobalt with S/P plates and coral dot. |
| Splash | **Default Capacitor placeholder. See must-fix 1.** |
| Android Back button | **Dialogs don't take part in history. See must-fix 2.** Back from the board to home works. |
| Safe areas / notch | CSS uses `env(safe-area-inset-*)` on the page, the sticky ticket and overlays, and the viewport has `viewport-fit=cover`. Only checked in code, not on a device or emulator. |
| Sound / haptics toggles | Present in Settings ("Sounds", "Vibration", on by default). |
| Accessibility labels | Present in the markup: `?` button, close button, plate rows ("Plate 1: BAR"), each spot ("Put T on plate 1, spot 2"), `aria-live` on the message, `role="dialog"`/`aria-modal` on sheets, focus-visible outlines, reduced-motion CSS. I did not run TalkBack. |
| Orientation | Locked to portrait in the manifest. Fine for a phone game. |
| In-app behavior | Install banner and "Add to home screen" are hidden when `IN_APP` is true (checked in code; not seen in a real build). Native Share is used when present. |
| Not checked | Real device/emulator behavior (status bar color, keyboard over the name field, TalkBack, gesture navigation), the signed build, and Play listing screenshots. |
