# Residua

Two daily number puzzles, served as a single static page.

- **Legendle** — an odd prime `p` below 10,000. Guess a prime `a`; the board returns the Legendre symbol `(a|p)`. Twelve guesses.
- **XORdle** — an integer `N` in `[0, 1023]`. Guess `x`; the board returns `popcount(x ⊕ N)`. Ten guesses.

Both boards can show the full candidate set and dim it as your guesses eliminate
members. Each game has its own Easy/Hard switch: **Easy** shows that field, **Hard**
hides it and leaves the bookkeeping to you.

## Difficulty and records

The switch sits next to the puzzle heading and is sticky per game — Legendle can be
hard while XORdle stays easy. You can flip it at any point in a round.

Easy and hard keep separate records, because with the field on screen the elimination
work is done for you and it is a materially different game. A day is filed under
**easy if the field was ever visible while you were guessing**, so flipping to hard on
the last guess cannot pad a hard streak. Shared results say `hard` when the round
earned it.

## Practice rounds

**Practice** next to the difficulty switch starts a throwaway round on a random
answer. Your daily board is stashed untouched and comes back exactly as you left it —
guesses, field, result, remaining tries — when you press **Back to today's puzzle**.
Practice rounds record nothing and cannot be shared, and starting a second one while
already practising just deals a new answer rather than nesting.

## Files

```
index.html                     the whole site — markup, styles, logic
data/daily.json                today's answers, written by the workflow
tools/build-daily.mjs          picks and publishes a day's answers
.github/workflows/daily.yml    runs the above at 00:05 UTC
```

No build step, no dependencies, no package.json. `index.html` opens correctly from
the filesystem.

## Deploying to GitHub Pages

1. Create a repository and push these files to the default branch.
2. **Settings → Pages → Source → Deploy from a branch**, pick your branch and `/ (root)`.
3. **Settings → Actions → General → Workflow permissions**, choose *Read and write
   permissions* so the daily job can commit.
4. **Actions → Publish daily puzzle → Run workflow** once, to seed `data/daily.json`.

The site is live at `https://<username>.github.io/<repo>/` within a minute or two.

## Configuration

Everything tunable is in the `CONFIG` object near the top of the `<script>` block:

| Key | Effect |
| --- | --- |
| `seedSalt` | Change it to reshuffle every future puzzle. |
| `epochUTC` | The date that counts as puzzle #1. |
| `counterKey` | Visitor counter key. Blank hides the counter entirely. |
| `legendle.guesses` | Twelve. See the note below before lowering it. |
| `xordle.guesses` | Ten. |

Change the wordmark in `<h1 class="wordmark">`, the source link in the footer, and
`CONFIG.seedSalt` before you publish — otherwise your puzzles match everyone else's
copy of this file.

### Why twelve guesses on Legendle and not ten

Each `±1` answer is one bit, so `n` guesses separate at most `2ⁿ − 1` primes. There
are 1,228 odd primes below 10,000, and `2¹⁰ − 1 = 1023`. Ten guesses cannot cover
the board no matter how well you play.

Twelve is the exact number. Simulating a player who always picks the probe with the
most even split: every prime falls in twelve or fewer, and 161 of them need all
twelve. If you want ten, drop `legendle.max` to 1,000 — that leaves 167 odd primes,
which ten guesses covers comfortably.

## The daily answer

`index.html` derives the day's answers from a hash of `seedSalt` and the UTC date, so
the game works with no server at all. If `data/daily.json` exists and its `date`
matches today, those answers win instead. The answer is only swapped into a board
that has no guesses on it yet, so a round in progress can never change underneath a
player.

The published answers are base64, which stops a casual peek at the JSON and nothing
more. **Any answer a browser can read, a player can read.** That is true of Wordle
and every clone of it, and it is fine for a puzzle nobody is betting on. If you ever
need the answer to be genuinely secret, move grading off the page: a Cloudflare
Worker or a small serverless function that takes a guess and returns only the symbol
or the distance. The client code changes very little — `mode.evaluate` becomes a
`fetch`.

## Visitor counter

Set `CONFIG.counterKey` to something nobody else will use:

```js
counterKey: "residua_yourname_2026"
```

It calls [CountAPI](https://countapi.mileshilliard.com), which needs no account. The
key and its value are public, and one hit is recorded per browser session. If the
request fails the counter stays hidden rather than showing a broken dash.

For real numbers rather than a vanity count, [GoatCounter](https://www.goatcounter.com)
is free, privacy-friendly, and exposes a `/counter/TOTAL.json` endpoint you can drop
into `loadVisits` in place of the CountAPI URL.

## Browser support

Modern evergreen browsers. `fetch` is feature-detected, `localStorage` failures are
swallowed so the game still runs in private mode, and `prefers-reduced-motion` and
`prefers-color-scheme` are both respected.
