# Small Plates

A word game for one or two, made for waiting on dinner. Plate letters one at a time, serve words, and keep turning each word into the next course: TIN → TINE → TILE → TILED.

Inspired by the old iPod touch game Moxie.

## Play

Open the GitHub Pages site on your phone, then add it to your home screen:

- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** ⋮ → Add to Home screen (or Install app)

After the first visit, it works fully offline.

## Build

```bash
node build.js
```

- `game.template.html` holds the game itself (markup, styles, and logic).
- `words-3to5.txt` is the dictionary (3 to 5 letter words from the public-domain ENABLE list), and `words-qu6.txt` adds 6-letter QU words, since the Qu plate spells two letters in one spot.
- `words-blocked.txt` lists swear words and slurs the game never accepts; `words-extra.txt` adds words the dictionary lacks (like POO).
- `app/` holds the icons, fonts, web app manifest, and service worker.
- `build.js` embeds the words and writes:
  - `docs/`, the installable offline web app that GitHub Pages serves
  - `small-plates.html`, the Claude artifact version

Fonts (Archivo Black, Caveat, Figtree, Young Serif) are from Google Fonts under the SIL Open Font License.
