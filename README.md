# 🕹️ The Arcade — Ivy's & Archie's Arcade

One website, two players. A landing page lets you pick **Archie's Arcade** or **Ivy's Arcade**, and a shared **all-time leaderboard** saves high scores to the cloud so they show up on any device.

## What's in this folder

```
ivys-and-archies-arcade/
├── public/              ← the website (what visitors see)
│   ├── index.html       ← landing page: pick a player + all-time top scores
│   ├── archie.html      ← Archie's Arcade
│   └── ivy.html         ← Ivy's Arcade
├── netlify/functions/
│   └── scores.js        ← the tiny "backend" that stores & serves scores
├── netlify.toml         ← tells Netlify how to build the site
└── package.json         ← lists the one storage library the backend uses
```

You don't need to edit any of this. Just follow the steps below to put it online — for free.

---

## Part 1 — Put the files on GitHub (no coding, all in the browser)

1. Go to **github.com** and sign in (create a free account if you don't have one).
2. Click the **+** in the top-right → **New repository**.
3. Name it `kids-arcade` (any name is fine). Leave everything else default. Click **Create repository**.
4. On the next page, click the link **“uploading an existing file”**.
5. Open your **Downloads → ivys-and-archies-arcade** folder. Select the **four items inside it** — the `public` folder, the `netlify` folder, `netlify.toml`, and `package.json` — and **drag them onto the GitHub upload area**. (Use Chrome; it keeps the folders.)
6. Click **Commit changes**.

Your files are now on GitHub. ✅

## Part 2 — Turn it into a live website with Netlify

1. Go to **netlify.com** and click **Sign up** → choose **Sign up with GitHub** (easiest).
2. Once in, click **Add new site → Import an existing project → Deploy with GitHub**.
3. Authorise Netlify, then pick your `kids-arcade` repository.
4. Netlify reads the settings automatically (publish folder `public`, functions in `netlify/functions`). Leave the **Build command blank** and click **Deploy**.
5. Wait about a minute. You'll get a link like `something-random.netlify.app` — **that's your arcade, live on the internet.** 🎉
6. *(Optional)* Go to **Site configuration → Change site name** to make the link nicer, e.g. `mariesjunk-arcade.netlify.app`.

Send that link to any device — phone, tablet, grandparents — and it just works.

---

## How the scores work

- When a player sets a high score, it saves **two places**: on that device (so it works offline too) **and** to the shared cloud leaderboard.
- The **All-Time Top Scores** board on the landing page reads from the cloud, so everyone sees the same records no matter what device they're on.
- Storage uses **Netlify Blobs** — included free, no separate database or account.

## Free? Yes.

Netlify's free plan runs on a monthly credit allowance. A family high-score board uses a tiny fraction of it, so this stays free in normal use. If a game ever gets wildly popular, Netlify simply pauses the site until the next month rather than charging you.

## Playing without hosting

You can still just **double-click `index.html`** (or the arcade files) to play offline on your computer. Scores save on that device; the shared cloud board only fills in once the site is hosted on Netlify.

## Updating later

Changed a game? Re-upload the changed file to GitHub (repository → the file → upload/replace → commit). Netlify notices and republishes automatically within a minute.
