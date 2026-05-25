# Setup instructions

Two ways to run this app:

- **Offline mode** — works out of the box. Data lives only in your browser.
- **Cloud mode** — sign-up + email/password + sync across devices via Supabase (free).

Pick the one you need.

---

## What you have

```
ledger/
├── index.html                 ← open this in a browser
├── README.md                  ← technical docs
├── SETUP.md                   ← you are here
├── .gitignore
│
├── supabase-config.js         ← EDIT THIS to enable cloud sync
├── supabase-schema.sql        ← Run this ONCE in Supabase SQL editor
├── supabase-sync.js           ← Supabase wrapper (don't edit)
├── cloud-bridge.js            ← Sync glue (don't edit)
│
├── app.js                     ← root
├── theme.js                   ← colors & fonts
├── store.js                   ← data layer
├── ui.js                      ← buttons, modals
├── charts.js                  ← chart drawing
├── shell.js                   ← sidebar + topbar
├── screens-overview.js
├── screens-transactions.js
├── screens-calendar.js
├── screens-debt.js
├── screens-plan.js
├── screens-analyze.js
├── screens-reports.js
└── screens-settings.js
```

All files must stay together. Don't rename anything.

---

## Option 1 · Offline mode (zero setup)

1. Open `index.html` in a browser (or serve the folder).
2. Done. The app opens straight to the dashboard. Data saves to your browser.

**Limitation:** data lives in one browser on one device. Use **Settings → Data → Backup all data (JSON)** to back up.

---

## Option 2 · Cloud mode with Supabase (recommended)

Adds: real email/password accounts, sync across laptop/phone/tablet, secure per-user data.

### Step 1 · Create a free Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign up (free, no credit card).
2. Click **New project**.
   - Name: anything (e.g. `ledger`)
   - Database password: pick a strong one (you won't need it again for normal use)
   - Region: pick one near you (e.g. Southeast Asia for the Philippines)
3. Wait ~2 minutes for the project to provision.

### Step 2 · Set up the database

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **+ New query**.
3. Open `supabase-schema.sql` from this folder, copy the entire contents, paste into the editor.
4. Click **Run**.
5. You should see "Success. No rows returned." That's correct.

This creates the `user_data` table with Row-Level Security so each user only sees their own data.

### Step 3 · Get your project credentials

1. In your Supabase dashboard, click **Project Settings** (gear icon) → **API**.
2. Copy two values:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **anon public key** — long string starting with `eyJ...`

> ⚠️ Use the **anon key**, NOT the **service_role** key. The anon key is safe to commit to your repo because Row-Level Security protects the data.

### Step 4 · Configure the app

Open `supabase-config.js` in any text editor. Paste your values:

```js
window.SUPABASE_URL      = "https://abcdefghij.supabase.co";
window.SUPABASE_ANON_KEY = "eyJ...your-anon-key-here";
```

Save the file.

### Step 5 · (Optional but recommended) Configure email auth

In your Supabase dashboard:

1. **Authentication → Providers → Email** — make sure it's **enabled** (default).
2. **Authentication → URL Configuration** — set your **Site URL** to where you're hosting (e.g. `https://yourname.github.io/ledger-app/` or `http://localhost:8080` for local testing). This makes magic-link emails redirect correctly.
3. **(Optional)** Turn OFF "Confirm email" if you want users to sign in without email verification: **Authentication → Sign In / Up → Email** → uncheck "Confirm email". Easier for testing; more secure with it on.

### Step 6 · Deploy

Same as offline mode — drop the whole folder into:
- **GitHub Pages** (Settings → Pages → Deploy from branch / root), OR
- **Vercel** (import repo, framework: Other, no build), OR
- **Netlify** (drag-and-drop at [app.netlify.com/drop](https://app.netlify.com/drop))

### Step 7 · Sign up and use it

1. Open the deployed site (or `index.html` locally).
2. You'll see a real sign-in screen with three tabs: **Sign in · Create account · Magic link**.
3. Click **Create account**, enter email + password (6+ chars), submit.
4. (If you enabled email confirmation) Check your email for the confirmation link.
5. Sign in. Your data now syncs to Supabase automatically — every change pushes within 1 second.

Sign in on a different device with the same email/password → all your data appears.

---

## Important notes

### How sync works
- Every change you make is debounced 0.8 seconds, then uploaded as a single JSON blob to your `user_data` row.
- When you sign in on a new device, the app pulls your latest data and replaces local state.
- **Conflict model:** last-write-wins. If you edit on two devices at the same time, the most recent save wins. Fine for personal use.

### Privacy
- Row-Level Security means even with the anon key, users can only read/write their own row. Other users' data is invisible at the database level.
- Supabase encrypts data at rest and in transit.

### Cost
- Supabase free tier: 500MB database + 50,000 monthly active users. You won't hit either.

---

## Troubleshooting

**"Sign in screen never appears"**
You haven't filled in `supabase-config.js`. Or you have a typo. Open browser DevTools → Console; if you see "Supabase not configured," fix the config file.

**"Email not arriving"**
- Check spam folder.
- In Supabase dashboard → Authentication → URL Configuration → verify your Site URL matches where you're running the app.
- For local testing, set Site URL to `http://localhost:8080` (or whatever port).

**"Invalid login credentials"**
- Make sure you created an account first (Sign Up tab, not Sign In).
- If you signed up with email confirmation on, check your inbox for the confirmation email and click the link.

**"My data isn't syncing"**
- Open DevTools → Console. Look for `Supabase fetch error` or `Supabase push error`.
- Most common cause: forgot to run `supabase-schema.sql` in step 2.
- Second most common: anon key copied with whitespace. Re-paste cleanly.

**Want to wipe everything**
- Supabase dashboard → Table Editor → user_data → delete your row, OR
- Settings → Data → Reset everything (only wipes local state)

---

## How to use the app

1. Sign in (or open offline mode).
2. **Settings → Cash accounts** → add at least one account (bank, wallet, cash).
3. Click **Add transaction** in the topbar → log your first expense or income.
4. Everything else populates automatically: Overview, Cash Checker, Health, Reports.

**Recommended order to populate:**
1. Cash accounts (Settings)
2. Categories — pre-populated, edit if you want (Settings)
3. Debts (Debt screen)
4. Credit accounts (Credit screen)
5. Recurring rules for monthly bills (Recurring screen)
6. Budgets (Budgets screen)
7. Savings goals (Goals screen)
8. Expected income for forecasting (Forecast screen)
