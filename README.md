# Hridoy Hussain Podcast

Website for the **Hridoy Hussain Podcast**: *Real People · Real Conversations*. It has a guest application form with bKash payment and guest codes.

## Features

- **Bangla-English mixed by default.** One click on `বাংলা | English` switches to full English. The choice is remembered.
- **5-step guest application:** joining type → about you → your story → recording → review. The answers are written so that Hridoy can prepare interview questions from them.
- **Two ways to join:**
  - **Invited guests** enter a guest code, and the payment step is skipped.
  - **Featured guests** pay ৳10,000 by bKash Send Money to `01751210179`, then enter their bKash number and Transaction ID (TrxID).
- **Submission:** each application is sent to Formspree (email copy) and opened as a pre-filled WhatsApp message to `+8801302778420`.
- **Draft saving:** a draft is kept on the visitor's device. Payment details are never stored.

## Episodes update automatically

The **Latest episodes** section is built from `episodes.json`. A GitHub Action (`.github/workflows/update-episodes.yml`) runs every 3 hours. It reads the channel's public YouTube RSS feed, saves the newest videos and their thumbnails (in `assets/episodes/`), and commits any changes. GitHub Pages then republishes the site on its own.

- **New video on YouTube:** it appears on the site within about 3 hours.
- **Update right away:** open the repo, go to **Actions → Update episodes from YouTube → Run workflow**.
- **Settings** (top of `scripts/update-episodes.mjs`): `CHANNEL_ID`, `MAX` (how many to keep), `SKIP_SHORTS` (Shorts are left out by default). Videos with the same title are shown once.
- **Run it on your computer:** `node scripts/update-episodes.mjs` (Node 18+).
- No API key and no third-party service is needed. If `episodes.json` can't be loaded, the two episodes written in `index.html` are shown instead.

> GitHub pauses scheduled workflows in repositories with no activity for 60 days. New episode commits count as activity. If it ever pauses, press **Run workflow** once to restart it.

## Important: how payment and codes work

This is a static site, so it **cannot verify bKash payments automatically**. Every TrxID must be checked by hand in the bKash app before confirming a guest.

The guest code is stored as a short hash, not as plain text. Anyone who reads the page source can still bypass the payment step. That's fine as long as every application is reviewed: if someone uses a code but isn't on your invite list, reject them.

**Change the guest code:** generate a new hash with Node and replace `CODE_HASH` in `index.html`:

```bash
node -e "let h=0x811c9dc5;for(const c of 'NEWCODE'){h^=c.charCodeAt(0);h=Math.imul(h,0x01000193)>>>0}console.log(h.toString(16))"
```

## Refund policy shown on the site

If a featured guest isn't selected, or the episode isn't published, ৳8,000 is refunded to the paying bKash number and ৳2,000 is kept as a processing fee. Paid episodes are labelled as paid features on YouTube.

## Editing

| What | Where in `index.html` |
|---|---|
| All text, in both languages | The `T` object in the script (`[English, Bangla]` pairs) |
| WhatsApp number | `WA` |
| Formspree form | `FORMSPREE` |
| bKash number | `#bkNum` and the `copyBk` handler |
| Episodes | `<!-- EPISODES -->` |

## Deploy

Upload the folder to any static host, or use **GitHub Pages**: *Settings → Pages → Deploy from a branch → `main` / root*.

The first form submission triggers a Formspree confirmation email. Confirm it, or later submissions won't arrive.

© Hridoy Hussain Podcast. All rights reserved.
