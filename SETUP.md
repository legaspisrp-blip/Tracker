# Setup instructions

Read this first. Total time: 3–5 minutes.

---

## What you have

A complete personal-finance web app in this folder. **No build step. No npm install. No backend.** Open `index.html` in a browser and it runs.

```
ledger/
├── index.html                 ← open this in a browser
├── README.md                  ← technical docs
├── SETUP.md                   ← you are here
├── .gitignore
├── app.js                     ← root component
├── theme.js                   ← colors & fonts
├── store.js                   ← data layer (saves to your browser)
├── ui.js                      ← buttons, inputs, modals
├── charts.js                  ← chart drawing
├── shell.js                   ← sidebar + topbar
├── login.js                   ← sign-in screen
├── screens-overview.js        ← Overview + Cash Checker
├── screens-transactions.js    ← Transactions / Expenses / Income
├── screens-calendar.js        ← Calendar
├── screens-debt.js            ← Debt + Credit accounts
├── screens-plan.js            ← Budgets + Goals + Recurring
├── screens-analyze.js         ← Health + Forecast + Coach
├── screens-reports.js         ← Monthly reports
└── screens-settings.js        ← Settings
```

**All 18 files must stay together in the same folder.** Don't rename anything.
The `.js` files are pre-compiled — no build step needed at deploy time, and no in-browser code evaluation (CSP-strict friendly).

---

## Option A · Just open it on your computer

Double-click `index.html`.

That's it. The app opens in your default browser. Your data saves automatically to that browser. If you change browsers, your data won't follow — back it up from **Settings → Data**.

**If double-clicking doesn't work** (some browsers block JavaScript loaded over `file://`), use Option B.

---

## Option B · Run it as a tiny local site

Open a terminal in this folder, then:

```bash
# Mac / Linux
python3 -m http.server 8080

# Windows (in PowerShell)
python -m http.server 8080
```

Open your browser to **http://localhost:8080**.

---

## Option C · Put it on the internet (free)

### GitHub Pages (recommended — free, easiest)

1. Create a new GitHub repo. Any name works (e.g. `my-ledger`).
2. Upload all 18 files in this folder to the repo root.
   - Easiest: drag-and-drop them in the GitHub web interface, or use GitHub Desktop.
3. In the repo, click **Settings → Pages** (left sidebar).
4. Under "Source," pick **Deploy from a branch**.
5. Under "Branch," pick **main** and the folder **/ (root)**. Save.
6. Wait about 1 minute. GitHub shows you a URL like
   `https://<your-username>.github.io/my-ledger/`
7. Open the URL. Done.

### Vercel (also free, also easy)

1. Push the folder to a GitHub repo (same steps 1–2 as above).
2. Go to **vercel.com**, click **Add New → Project**.
3. Import the GitHub repo.
4. **Framework Preset:** "Other"
5. **Build Command:** leave empty
6. **Output Directory:** leave empty
7. Click **Deploy**. Done.

### Netlify (drag-and-drop, no GitHub needed)

1. Go to **app.netlify.com/drop**.
2. Drag this entire `ledger` folder onto the page.
3. Done. Netlify gives you a URL.

---

## How to use it

1. Open the app. You'll see a sign-in screen with two role cards.
2. Pick **Owner**, optionally type a display name, click **Continue**.
3. App opens with no data — that's intentional.
4. Click **Settings → Cash accounts** and add at least one account (bank, wallet, cash — whatever).
5. Click **Add transaction** in the topbar and log your first expense or income.
6. Everything else fills in automatically: Overview, Cash Checker, Health, Reports.

**Recommended order to populate the app:**
1. Cash accounts (Settings)
2. Categories — already pre-populated, edit if you want (Settings)
3. Debts (Debt screen)
4. Credit accounts (Credit screen)
5. Recurring rules for monthly bills (Recurring screen)
6. Budgets (Budgets screen)
7. Savings goals (Goals screen)
8. Expected income for forecasting (Forecast screen)

---

## Backing up your data

**Your data lives only in your browser.** Clearing browser data deletes it.

To back up:
- **Settings → Data → "Backup all data (JSON)"** — downloads a `.json` file. Keep this somewhere safe.
- To restore on another computer, open the app there, sign in, then **Settings → Data → "Restore from backup (JSON)"** and pick the file.

Do this monthly, or before clearing browser cache.

---

## Two users (Owner + Assistant)

This version has role gating built in:
- **Owner** — all 16 screens, full access.
- **Assistant** — only Transactions, Expenses, Income, Calendar, Recurring, Settings.

**Honest limitation:** because this is a static site (no server), both roles share the same browser-local data on the same computer. If your assistant is on a different device, you need a backend.

To get true separate-device sync, the next step is wiring **Supabase** — the store layer was designed for this swap. See `README.md` for the technical notes.

---

## If something breaks

1. Open the browser DevTools (right-click → Inspect → Console tab).
2. Note any red error messages.
3. The most common cause is a missing file. **Make sure all 18 files are in the same folder.**

---

## What you cannot do (yet)

- ❌ Cross-device sync without a backend
- ❌ Real PDF export (the "Print / Save as PDF" button uses your browser's print dialog)
- ❌ Live FX-rate fetch (you type the USD↔PHP rate manually in Forecast)
- ❌ Real password-protected login (it's role selection, not auth)

All of these are addressable when you're ready. The architecture was built so they swap in cleanly. Read `README.md` → "Recommended next steps when you go production."
