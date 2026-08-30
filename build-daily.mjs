// Picks the answers for one UTC day and writes them to data/daily.json.
// Run by .github/workflows/daily.yml at 00:05 UTC. The site works fine without
// this file — index.html falls back to a date-seeded local pick.

import { randomInt } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";

const LIMIT = 10000;
const BITS = 10;

function sieve(limit) {
  const flags = new Uint8Array(limit + 1);
  const out = [];
  for (let i = 2; i <= limit; i++) {
    if (flags[i]) continue;
    out.push(i);
    for (let j = i * i; j <= limit; j += i) flags[j] = 1;
  }
  return out;
}

const oddPrimes = sieve(LIMIT - 1).filter((p) => p > 2);

const now = new Date();
const date = [
  now.getUTCFullYear(),
  String(now.getUTCMonth() + 1).padStart(2, "0"),
  String(now.getUTCDate()).padStart(2, "0"),
].join("-");

const payload = {
  legendle: oddPrimes[randomInt(oddPrimes.length)],
  xordle: randomInt(1 << BITS),
};

mkdirSync("data", { recursive: true });
writeFileSync(
  "data/daily.json",
  JSON.stringify(
    {
      date,
      // Base64 keeps the answers out of a casual "view source" glance. It is not
      // secrecy: anything a browser can decode, a determined player can too. If
      // you need real secrecy, grade guesses server-side (see README).
      payload: Buffer.from(JSON.stringify(payload)).toString("base64"),
    },
    null,
    2
  ) + "\n"
);

console.log(`published ${date}`);
