# Career Finder — setup guide

You do not need to write any code. You will be copying and pasting between
five browser tabs. Set aside about 45 minutes.

Four accounts, all free. No monthly bill.

---

## How it works, in plain English

```
Someone comments your keyword on Instagram
   ↓  (your ManyChat automation — you're handling this bit)
They get your Razorpay payment link
   ↓  they pay
Razorpay sends them straight back to your site, already unlocked
   ↓
The worksheet opens. They start immediately.
   ↓
An email with their personal link also arrives, so they can come back later
```

**The important bit:** the buyer gets in *instantly*, without waiting for an
email. The email is a spare key, not the front door. That matters because
emails sometimes land in spam, and you don't want a paying customer stuck.

**Why it can't be pirated:** the worksheet isn't a file. Your role profiles,
90-day roadmaps and scoring live on the server and are assembled fresh each
time. Someone who downloads every file your site serves gets the questions and
nothing else. Each buyer's link works on 2 devices, then stops.

---

## Accounts you'll open

| Service | What for | Cost |
|---|---|---|
| [GitHub](https://github.com) | holds the code | Free |
| [Netlify](https://netlify.com) | runs the site | Free — commercial use allowed |
| [Brevo](https://brevo.com) | sends the backup email | Free, 300 emails/day |
| [Razorpay](https://razorpay.com) | takes the money | ~2% per sale |

You do **not** need a domain to launch. Your site will live at something like
`career-finder.netlify.app`. See the note at the end about upgrading later.

---

## Step 1 — Get the code onto GitHub (10 min)

1. Go to [github.com](https://github.com) and sign up.
2. Click **+** (top right) → **New repository**.
3. Name it `career-finder`. Choose **Private**. Click **Create repository**.
4. On the next screen, click **uploading an existing file**.
5. Unzip the folder I sent you, then drag **everything inside** the
   `career-finder` folder into the browser window.
6. Scroll down, click **Commit changes**.

> Drag the *contents* of the folder, not the folder itself. You should see
> `package.json`, `netlify.toml`, `src`, `netlify` and the rest at the top level.

---

## Step 2 — Put it online with Netlify (5 min)

1. Go to [netlify.com](https://netlify.com) → **Sign up** → choose
   **Sign up with GitHub**.
2. Click **Add new project** → **Import an existing project** → **GitHub**.
3. Authorise Netlify, then pick your `career-finder` repository.
4. Leave every build setting exactly as it is — the `netlify.toml` file in the
   project already fills them in.
5. Click **Deploy**.

It will take a minute or two. When it finishes you'll have a URL like
`https://random-words-123.netlify.app`.

**Make it something you'd say out loud:** Site configuration → **Change site
name** → type `career-finder` or similar. Your URL becomes
`career-finder.netlify.app`. Write it down — you need it in the next step.

> The site will show an error right now. That's expected. It has no settings yet.

---

## Step 3 — Brevo, for the backup email (10 min)

1. Go to [brevo.com](https://brevo.com) and sign up.
2. Left sidebar → **Senders, Domains & Dedicated IPs** → **Senders** →
   **Add a sender**.
3. Use your normal email address (Gmail is fine). Brevo emails you a
   confirmation link — click it.
4. Now get your key: click your name (top right) → **SMTP & API** →
   **API Keys** tab → **Generate a new API key**. Name it `career-finder`.
5. **Copy that key now and paste it somewhere safe.** Brevo will not show it
   to you again.

---

## Step 4 — Razorpay (10 min)

### 4a. Your API keys

1. Razorpay Dashboard → **Account & Settings** → **API Keys** →
   **Generate Key**.
2. You get a **Key Id** (starts `rzp_`) and a **Key Secret**. Copy both —
   the secret is shown only once.

### 4b. Your payment link

1. Dashboard → **Payment Links** → **Create Payment Link**.
2. Amount `499`. Title: `Non-Clinical Career Finder`.
3. Turn **email** on and make it **required**. This is where the backup
   email goes.
4. Find the setting called **callback URL** (sometimes under "Advanced
   options" or "After payment"). Paste:

   ```
   https://career-finder.netlify.app/api/claim
   ```

   Use your own site name. **This single setting is what unlocks the worksheet
   the moment someone pays.** If you skip it, buyers have to wait for the email.
5. Create the link and copy it.

### 4c. The webhook (your safety net)

If someone closes the tab before Razorpay redirects them, this catches it.

1. Dashboard → **Settings** → **Webhooks** → **Add New Webhook**.
2. **URL:** `https://career-finder.netlify.app/api/webhook`
3. **Secret:** make up a long random string. Copy it.
4. **Active events:** tick `payment_link.paid` and `payment.captured`.
5. Save.

---

## Step 5 — Fill in your settings (10 min)

This is the fiddly bit, and the one place to go slowly.

In Netlify: **Site configuration** → **Environment variables** →
**Add a variable** → **Add a single variable**. Add each row below.

| Key | Value |
|---|---|
| `APP_URL` | `https://career-finder.netlify.app` — your real URL, **no slash at the end** |
| `SESSION_SECRET` | a long random string — see below |
| `ADMIN_PASSWORD` | invent a strong password for your buyer list |
| `RAZORPAY_KEY_ID` | from Step 4a |
| `RAZORPAY_KEY_SECRET` | from Step 4a |
| `RAZORPAY_WEBHOOK_SECRET` | the string you invented in Step 4c |
| `BREVO_API_KEY` | from Step 3 |
| `EMAIL_FROM` | `Career Finder <your.address@gmail.com>` — the address you verified |
| `EMAIL_REPLY_TO` | your email address |
| `SELLER_ALERT_EMAIL` | your email address |
| `ACCESS_DAYS` | `30` |
| `MAX_DEVICES` | `2` |

**For `SESSION_SECRET`,** you need a long random string. Open
[random.org/strings](https://www.random.org/strings/?num=6&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new),
generate, and paste all six strings together into one long line. Anything
over 50 characters of randomness is fine. You never need to remember it.

**Then redeploy.** Settings don't take effect until you do:
**Deploys** → **Trigger deploy** → **Deploy site**.

> Never create a variable whose name starts with `VITE_`. Those get baked into
> the public page where anyone can read them.

---

## Step 6 — Add your payment link to the site (5 min)

1. In GitHub, open your repository → `src` → `config.js` → the **pencil** icon.
2. Change these four lines:
   - `PAYMENT_LINK` → your Razorpay link from Step 4b
   - `PRICE_DISPLAY` → `'₹499'`
   - `SUPPORT_EMAIL` → your email
   - `SUPPORT_WHATSAPP` → your number
3. **Commit changes.** Netlify redeploys on its own in about a minute.

---

## Step 7 — Test it before you tell anyone (10 min)

Switch Razorpay to **Test Mode** (the toggle at the top of the dashboard),
make a test payment link the same way, and pay it with a test card.

Work down this list:

- [ ] After paying, the worksheet opens **by itself**, no password
- [ ] You can answer the questions and see your results and roadmap
- [ ] The email arrives (check spam too — tell me if it lands there)
- [ ] Opening the emailed link on your phone works — that's device 2 of 2
- [ ] Opening it on a **third** device is refused → **this is the anti-piracy lock working**
- [ ] `https://career-finder.netlify.app/api/admin` asks for your password and then lists your test buyer

If something fails, go to Netlify → **Logs** → **Functions** and look at the
most recent entry. It will name the problem. The usual culprits are a missing
slash in `APP_URL`, or forgetting to redeploy after adding settings.

---

## Step 8 — Point Instagram at it

Your ManyChat automation only needs to send one thing: your **Razorpay payment
link**. Everything after the tap is automatic.

Worth saying in your DM copy: *"You'll get instant access right after payment,
plus an email with your link so you can come back to it."* It cuts down the
"I paid, where is it?" messages.

---

## Running it day to day

Everything lives at **`your-site.netlify.app/api/admin`**. Bookmark it.

You'll see every buyer, how much you've collected, who finished the worksheet,
and — usefully — a red warning on anyone whose link has been refused on extra
devices. That's your piracy signal.

Four buttons per buyer:

- **Reset devices** — they got a new phone and are locked out. Most common request.
- **Resend link** — they lost the email.
- **+30 days** — extend their access.
- **Revoke** — cut someone off.

If someone has no email on file, expand **Their link** and send it by hand.

---

## Editing your worksheet content

Your content is in `netlify/lib/` — edit these on GitHub the same way you
edited `config.js`:

- `questions.mjs` — the questions and answers
- `roles.mjs` — the 12 role profiles, roadmaps, weights, result copy
- `scoring.mjs` — how roles get ranked

Every save redeploys automatically in about a minute.

---

## What this stops, and what it doesn't

**Stopped:**

- Reading your roadmaps out of the page source — they aren't there
- Passing one link round a WhatsApp group — the third device is refused
- Sharing a password — there isn't one
- Fiddling with answers to farm every result — scoring runs on the server
- Buying once and using it forever — access expires

**Not stopped, because nothing can stop it:**

- Someone screenshotting their own results
- Someone retyping your content by hand

Every results page carries the buyer's email printed at the bottom, so a
screenshot doing the rounds points back at whoever leaked it. That's
deterrence, not prevention. For a ₹499 product it's the right place to stop —
past this point, protection costs more than the piracy does.

---

## Cost

| | Monthly |
|---|---|
| Netlify | ₹0 |
| Brevo | ₹0 (300 emails/day) |
| GitHub | ₹0 |
| Razorpay | ~₹10 per ₹499 sale |

**₹0 fixed.** Netlify's free plan runs on a monthly credit allowance; a
worksheet like this uses very little, but if you ever start selling in real
volume, check your Netlify usage page rather than being surprised.

---

## Later: adding your own domain

You don't need one to start. Two things get better when you buy one (~₹800/year):

1. `careerfinder.in` looks more trustworthy than `career-finder.netlify.app`.
2. **Email deliverability improves a lot.** Brevo can't fully authenticate a
   Gmail address, so some of your backup emails will land in spam. With your
   own domain you can authenticate properly and they'll land in inboxes.

Because buyers get instant access via the redirect, spam-foldered email is an
annoyance rather than a disaster — which is exactly why you can safely launch
without a domain and add one once sales justify it.

When you do: add it in Netlify (**Domain management**), update `APP_URL`,
update your Razorpay callback URL, and authenticate the domain in Brevo.

---

## For a developer, if you ever hire one

```bash
npm install
npm run build && npm run verify   # verify fails if content or secrets leak into the bundle
npm test                          # scoring engine, session tokens, Razorpay signatures
npx netlify dev                   # run the functions locally
```


---

## Razorpay website verification

Razorpay checks your website before (and sometimes after) activating live
payments. The check is partly automated: a crawler visits your site looking for
six specific pages. A site that is only a password box fails it.

Your site now has all six, as plain HTML so the crawler can read them without
running any JavaScript:

| Page | URL to give Razorpay |
|---|---|
| Pricing | `https://your-site.netlify.app/pricing` |
| Terms and Conditions | `https://your-site.netlify.app/terms` |
| Privacy Policy | `https://your-site.netlify.app/privacy` |
| Cancellation and Refunds | `https://your-site.netlify.app/refunds` |
| Shipping / Delivery | `https://your-site.netlify.app/shipping` |
| Contact Us | `https://your-site.netlify.app/contact` |

They are all linked from the footer of your homepage as well, which is what the
crawler follows.

### Before you resubmit

1. **Fill in your business details.** Open `scripts/set-business-details.mjs`,
   put your real name, email, phone and city at the top, and run
   `node scripts/set-business-details.mjs`. Or ask for a version with them
   already filled in.
2. **The name must match your Razorpay KYC exactly.** If your KYC says
   "Faseela Abdul Kareem" and your site says "Career Finder India", that
   mismatch alone can fail the review.
3. **Check every page loads** by visiting each URL above in your browser.
4. **Read the policies.** They describe how your product actually works, but
   they are your policies now — make sure you are happy standing behind them.

### A note on the refund policy

Yours says no refunds once access is granted, with full refunds if delivery
fails or someone is charged twice. That is a normal position for a digital
product delivered in full and instantly, and stating it plainly is better for
review than being vague. What reviewers dislike is a missing or evasive policy,
not a firm one.

These policy pages are written to describe your business accurately. They are
not legal advice, and I am not a lawyer — if you later start selling at volume,
it is worth having someone qualified read them over.
