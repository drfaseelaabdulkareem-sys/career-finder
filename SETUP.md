# Career Finder — setup guide

You do not need to write any code. You will copy and paste between a few
browser tabs. Set aside about 40 minutes.

Two accounts, both free. No monthly bill.

---

## How it works, in plain English

```
Someone comments your keyword on Instagram
   ↓  you reply with your website link
They open it and press START
   ↓  the page shows them your Razorpay link and a login box
They pay on the link
   ↓  they send you the payment screenshot on Instagram
You copy the next unused login out of your admin page
   ↓  and paste it into the Instagram chat
They type it into the login box on the page and start
```

**The page does the selling; you only hand over the login.** Everything a
buyer needs is on one screen — the price, the payment link, the four steps,
and the box they type their login into. You never have to explain the
process in a DM. You just reply with one link.

**You are still the gate.** Nothing is automated between the payment and the
login, and that is deliberate: no payment integration to break, no webhook
to debug, no email service that can drop a paying customer's access into
spam. You see every payment screenshot with your own eyes.

**Why it can't be pirated.** The worksheet is not a file you send. Your role
profiles, salary bands and 90-day roadmaps live on the server and are
assembled fresh each time someone answers the questions. If a buyer downloads
every file the site serves them, they get the questions and nothing else.

**And if they pass the login to a friend?** Each login works on **one
device** — the first one it is used on. Any other device is refused, and your
admin page shows you which logins people have tried to share.

**How long does access last?** 30 days, counted from the buyer's *first
sign-in*, not from the day you handed over the login. Nobody loses days
because they were busy for a week.

---

## Accounts you'll open

| Service | What for | Cost |
|---|---|---|
| [GitHub](https://github.com) | holds the code | Free |
| [Netlify](https://netlify.com) | runs the site | Free — commercial use allowed |

You already have Razorpay and Instagram, and you use both by hand.

---

# Step 1 — Put the code on GitHub

**Read this step carefully — this is what broke your last deploy.**

1. Unzip `career-finder.zip` on your computer. Open the folder.
2. You should see these items **inside** it:

   ```
   index.html      package.json      netlify.toml      vite.config.js
   src/            netlify/          public/           scripts/
   SETUP.md        README.md         .env.example      .gitignore
   ```

   `src/`, `netlify/`, `public/` and `scripts/` are **folders**. The site
   cannot build without them.

3. Go to [github.com/new](https://github.com/new). Name it
   `career-finder`, keep it **Private**, click **Create repository**.
4. On the next page click **uploading an existing file**.
5. Now the important part: **drag the folders in, not just the files.**
   Select everything from Step 2 — including the four folders — and drop
   them all together onto the upload area. GitHub's drag-and-drop uploads
   folders and everything inside them; clicking "choose your files" does
   **not**, which is why `src/` went missing last time.
6. Wait until the file list stops growing, then click **Commit changes**.
7. **Check your work before moving on.** On your repository's main page
   you must be able to click into `src` and see `App.jsx`, `main.jsx`,
   `config.js`, `index.css` and a `components` folder. If `src` is not
   there, repeat Step 5 — do not continue, the build will fail with
   *"Rollup failed to resolve import /src/main.jsx"*.

> **If drag-and-drop keeps failing**, upload the folders one at a time:
> click **Add file → Upload files**, drag in just `src`, commit, then
> repeat for `netlify`, `public` and `scripts`. Slower, but it works.

---

# Step 2 — Put the site on Netlify

1. Sign up at [netlify.com](https://netlify.com) using **Continue with
   GitHub**.
2. **Add new site → Import an existing project → GitHub**.
3. Authorise Netlify, pick `career-finder`.
4. Netlify reads `netlify.toml` and fills the build settings in for you.
   Leave them exactly as they are:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy**. Wait 2–3 minutes.

When it finishes you get an address like
`https://sparkly-cat-123456.netlify.app`. **Copy it** — you need it twice
below.

Rename it if you like: **Site configuration → Change site name** →
something like `drfaseela-careerfinder`. Do this *now* rather than later,
because the address goes into a setting below and into your Razorpay
dashboard, and changing it afterwards means redoing both.

---

# Step 3 — The five settings

In Netlify: **Site configuration → Environment variables → Add a
variable → Add a single variable**. Add these five, one at a time.

| Key | Value |
|---|---|
| `APP_URL` | your site address, no slash at the end |
| `SESSION_SECRET` | a long random string — see below |
| `ADMIN_PASSWORD` | a password only you know |
| `ACCESS_DAYS` | `30` |
| `MAX_DEVICES` | `1` |

**For `SESSION_SECRET`:** open a new tab, go to
[random.org/strings](https://www.random.org/strings/?num=8&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new),
and paste all eight lines together into one long line with no spaces.
This signs your buyers' sessions. You never type it again, so it does not
matter that it is unreadable — just don't lose it, because changing it
signs everyone out.

**For `ADMIN_PASSWORD`:** this one you *will* type, on your phone, every
time you hand out a login. Make it long but typeable — three unrelated
words and a number works well. Save it in your password manager or notes.

⚠️ **Never create a variable whose name starts with `VITE_`.** Anything
with that prefix gets printed into the public page where anyone can read
it.

Then: **Deploys → Trigger deploy → Deploy site**, so the new settings take
effect.

---

# Step 4 — Check your payment link and Instagram handle

**Both are already filled in for you.** `src/config.js` now reads:

```js
RAZORPAY_LINK: 'https://razorpay.me/@drfaseelaabdulkarim',
INSTAGRAM_HANDLE: 'dr_faseelakareem',
```

You only need to change these if your payment link or your Instagram
username ever changes. To edit: GitHub → `src/config.js` → **pencil** icon →
change the text inside the quote marks → **Commit changes**. Netlify rebuilds
on its own in about two minutes.

### What to check once the site is live

1. Open your site and press **START**. The page should scroll down to **Get
   access**.
2. Press **Pay ₹499 on Razorpay**. Your payment page should open.
   - **Does it show ₹499 already filled in, or an empty amount box?** A
     `razorpay.me` link often lets the payer type their own amount. If yours
     does, someone can pay ₹10 and send you a screenshot. Either set a fixed
     amount of ₹499 on the link in your Razorpay dashboard, or make a habit
     of reading the amount on every screenshot before you send a login.
   - **Does it ask for a shipping address?** Turn that off — nothing is being
     shipped.
3. Press **@dr_faseelakareem** in step 2. Your Instagram profile should open.

> The `ACCESS_DAYS: 30` and `MAX_DEVICES: 1` lines further down the same
> file are only what the **page says**. The real enforcement is the two
> Netlify variables from Step 3. If you ever change one, change both, or
> the page will promise something different from what the site does.

---

# Step 5 — Make your first batch of logins

1. Go to `your-site-address/api/admin`.
2. Type your `ADMIN_PASSWORD`.
3. In **Generate logins**, leave the number at 25 and click **Generate**.

You will see 25 logins, each one like:

```
CF-K7M2    harbour-lantern-48
```

**Copy the whole list into your notes app right now.** This is the only
time the page shows them all together in plain text — afterwards you look
them up one at a time in the table. (Nothing is lost if you skip this, it
is just slower.)

Nothing is "used up" by generating. An unused login costs you nothing, so
when you are down to your last few, generate another batch.

Bookmark `/api/admin` on your phone. That page is your whole business
back-office.

> **One thing worth knowing:** each login is stamped with 30 days and one
> device *at the moment you generate it*. So if you later decide to allow
> two devices, the change only applies to logins you generate afterwards —
> the ones already in your list keep the rules they were born with. That is
> on purpose: nobody who has already bought can have their access quietly
> shortened.

---

# Step 6 — Razorpay: your policy pages

Razorpay flagged your account earlier because it could not find your
policy pages. Your site has them, but the links at the bottom of the page
were removed at your request, so Razorpay's automatic scan may not find
them again.

**Give Razorpay the addresses directly.** In the Razorpay Dashboard →
**Account & Settings → Website and app details**, paste these in (swap in
your own site address):

| Field | Address |
|---|---|
| Website | `https://your-site.netlify.app` |
| Pricing | `https://your-site.netlify.app/pricing` |
| Terms & conditions | `https://your-site.netlify.app/terms` |
| Privacy policy | `https://your-site.netlify.app/privacy` |
| Refund policy | `https://your-site.netlify.app/refunds` |
| Shipping / delivery | `https://your-site.netlify.app/shipping` |
| Contact us | `https://your-site.netlify.app/contact` |

Open each address in your browser first and check the page loads. If one
of them 404s, tell me which and I'll fix it.

**Read `/shipping` and `/refunds` yourself before you sell anything.**
Those pages now promise, in your name, that a login arrives within 24
hours and that you refund in full if it doesn't. That is a promise you are
making to buyers and to Razorpay, so make sure you are happy with it.

---

# Step 7 — Test it yourself before you sell

Do this once, properly. Fifteen minutes now saves you an awkward refund
later.

1. Open your site. Press **START** — the page should scroll to **Get
   access**, showing the four steps, the payment button and the login box.
2. Check the payment button opens your real Razorpay page. Don't pay.
3. Take the first login from your batch and sign in on your laptop.
4. Answer all 14 questions. Confirm you reach the results, see three
   roles, salary bands and the roadmap, and that the confetti fires.
5. **Test the device limit.** Now open the site on your phone and sign in
   with the *same* login. It should be refused — one device only.
6. Go to `/api/admin`. That login should show 1 / 1 devices and a blocked
   attempt.
7. Click **Reset devices**, then sign in on your phone again. It should
   work now. Then click **Revoke** — burn that login, don't sell the one
   you tested with.

---

# Running it day to day

**When a payment screenshot arrives in your Instagram DMs:**

1. Open `/api/admin` on your phone.
2. Take the next login showing **Unused**.
3. Reply with three things in one message:

   ```
   Here you go 🎉

   Open: https://your-site.netlify.app
   Login: CF-K7M2
   Password: harbour-lantern-48

   Scroll down to the login box and type these in.
   Works on one device, so use the phone or laptop you'll actually
   work on. Access runs 30 days from your first sign-in.
   ```

4. In the **Given to** box next to that login, type their Instagram handle
   and press enter. Future-you will be grateful.

**The buttons on that page:**

| Button | When to use it |
|---|---|
| **Reset devices** | They changed phone, or cleared their browser, and are locked out. Frees the slot so the next device they use becomes theirs. |
| **+30 days** | A goodwill extension. |
| **Revoke** | Stop a login working. Use it when you can see it is being shared, or you handed one out by mistake. |
| **Restore** | Undo a revoke. |

**The four states a login can be in:**

- **Unused** — never signed in. Safe to sell.
- **Active** — in use, inside its 30 days.
- **Finished** — the 30 days are up.
- **Possibly shared** — a second device was refused. Worth a look. One
  refused attempt is often the buyer's own second browser; ten is someone
  passing it around.

---

# One honest warning about the one-device limit

One device is the strictest setting, and it will generate support messages.
Two things cause them, and neither is the buyer cheating:

- They start on their phone, then want to finish on a laptop. With one
  device, they can't — they have to message you for a reset.
- They clear their browser data, or open the site in a private window, or
  switch from Instagram's built-in browser to Chrome. The site can no
  longer recognise the device, so it looks like a new one.

That second case is the common one, and it will happen to honest buyers.
You have two options when it does: click **Reset devices** and tell them to
sign in again, which takes you ten seconds, or raise the limit.

**If it becomes a chore**, change `MAX_DEVICES` to `2` in Netlify (Step 3)
and `MAX_DEVICES: 1` to `2` in `src/config.js` (Step 4). It takes two
minutes and no code changes. Logins already generated keep one device;
new ones get two. Piracy protection barely weakens — the thing worth
stealing is the worksheet content, and that never leaves the server
regardless.

---

# When something goes wrong

**"Rollup failed to resolve import /src/main.jsx"**
The `src` folder is not in your GitHub repository. Go back to Step 1,
item 5. This is the one error that has actually bitten you.

**The Pay button goes somewhere wrong**
Check the `RAZORPAY_LINK` line in `src/config.js` against the link in your
Razorpay dashboard. The whole address goes inside the quote marks.

**The build fails some other way**
Netlify → **Deploys** → click the red deploy → scroll the log to the first
red line. Send me that line.

**A buyer says the login doesn't work**
Find it in `/api/admin`. If it says *Finished*, their 30 days are up —
**+30 days** if you want to be generous. If it says *Possibly shared*,
they are on a second device — **Reset devices** if you believe them, and
usually you should. If it is *Unused*, they are typing it wrong: the
logins deliberately contain no letter O, no capital I and no lowercase l,
so tell them to look again at what they thought was a zero.

**Someone paid but never messaged me**
You will see the payment in your Razorpay dashboard with no screenshot in
your DMs. Razorpay shows the payer's name, email and phone — reach out
first, before they think they have been cheated. This is the one gap in a
manual flow, and it is worth checking your Razorpay payments list once a
day.

**The admin page asks for the password again**
It signs you out after 12 hours. Normal.

**I changed a setting and nothing happened**
Netlify settings only apply to a *new* build. **Deploys → Trigger deploy
→ Deploy site**.

**I want to change the price or the wording**
`src/config.js` in GitHub, pencil icon, edit, commit. Two minutes later
it is live. Note that the ₹499 there is only what the page *says* — the
amount you actually charge is set on your Razorpay payment link, so change
both.

---

# What this costs you

Nothing per month. Netlify's free tier covers roughly 100,000 visits and
125,000 worksheet submissions a month; you will not come close. Razorpay
takes its usual ~2% per payment and nothing else.

The only thing you must not do is lose your `SESSION_SECRET` and
`ADMIN_PASSWORD`. Put both somewhere you will still have them in a year.
