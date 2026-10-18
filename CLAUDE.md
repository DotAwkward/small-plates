# Small Plates

A word game for one or two, inspired by the old iPod touch game Moxie (rules and scoring are our own). Studio-wide notes are in `../CLAUDE.md`.

## Build and ship

- The whole game is `game.template.html` (markup, styles, logic). Word lists: `words-3to5.txt` (dictionary), `words-qu6.txt` (6-letter QU words), `words-blocked.txt` (swear words and slurs, never accepted), `words-extra.txt` (words the dictionary lacks).
- `node build.js` embeds the words and writes `docs/` (the installable web app GitHub Pages serves) and `small-plates.html` (the single-file Claude artifact copy). To ship the web version, rebuild and commit `docs/`.
- Pushing to `main` runs the "Android app" GitHub Actions workflow, which builds the signed `.aab` for Google Play (download from the run's Artifacts). Signing secrets are already set in the repo.
- `store/` has the Play listing (`listing.md`), tester invites and the screenshot capture script (`capture.mjs`; `store/frames/` is generated and gitignored).

## Don't change

- The manifest `id` (`/small-plates/?app=small-plates`): changing it makes installed copies look like a different app.
- Save keys and internal names (`daily`, `endless`, `solo`, `duo`). Players see "Daily Special" and "All you can eat", but the code and saves keep the old names so progress carries over.

## Voice

Restaurant theme everywhere: rows are plates, chains are courses, a bad word is "sent back", bonus words are "Today's specials", the score screen is "Check, please!", modes are Table for one, Table for two, the Daily Special and All you can eat. Two players alternate one letter at a time.
