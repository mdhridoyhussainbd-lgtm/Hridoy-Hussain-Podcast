// Pulls the latest videos from the YouTube channel's public RSS feed and writes
// episodes.json plus local thumbnails, so the site needs no API key and no third party.
// Run: node scripts/update-episodes.mjs   (Node 18+)
import { writeFile, readFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const CHANNEL_ID = 'UCIYa1AHI8t4agvOZoPxVLyA';   // @hridoyhussaintalks
const MAX = 6;                                     // how many episodes to show
const SKIP_SHORTS = true;                          // keep Shorts out of the episode list
const OUT = 'episodes.json';
const THUMBS = 'assets/episodes';

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const pick = (xml, re) => { const m = xml.match(re); return m ? decode(m[1].trim()) : ''; };

const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
const xml = await res.text();

let items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
  const id = pick(e, /<yt:videoId>([^<]+)<\/yt:videoId>/);
  const url = pick(e, /<link rel="alternate" href="([^"]+)"/);
  return {
    id,
    title: pick(e, /<title>([\s\S]*?)<\/title>/),
    published: pick(e, /<published>([^<]+)<\/published>/),
    url: url || `https://www.youtube.com/watch?v=${id}`,
    short: /\/shorts\//.test(url),
    thumb: `${THUMBS}/${id}.jpg`
  };
}).filter((v) => v.id);
if (SKIP_SHORTS) items = items.filter((v) => !v.short);
const seen = new Set();
items = items.filter((v) => { const k = v.title.trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); // same title twice: keep the newest
items = items.slice(0, MAX);

await mkdir(THUMBS, { recursive: true });
for (const v of items) {
  const file = `${THUMBS}/${v.id}.jpg`;
  if (existsSync(file)) continue;
  for (const size of ['maxresdefault', 'hqdefault']) {
    const r = await fetch(`https://i.ytimg.com/vi/${v.id}/${size}.jpg`);
    if (r.ok) { await writeFile(file, Buffer.from(await r.arrayBuffer())); break; }
  }
}
// remove thumbnails of episodes that dropped off the list
const keep = new Set(items.map((v) => `${v.id}.jpg`));
for (const f of await readdir(THUMBS)) if (f.endsWith('.jpg') && !keep.has(f)) await unlink(`${THUMBS}/${f}`);

const data = { channel: `https://www.youtube.com/channel/${CHANNEL_ID}`, items: items.map(({ short, ...v }) => v) };
const next = JSON.stringify(data, null, 2) + '\n';
const prev = existsSync(OUT) ? await readFile(OUT, 'utf8') : '';
if (next !== prev) { await writeFile(OUT, next); console.log(`Updated ${OUT} with ${items.length} episodes.`); }
else console.log('No new episodes.');
