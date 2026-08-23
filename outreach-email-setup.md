# Outreach email setup — `hello@stripeysunday.co.uk`

**What this does:** Mail sent to `hello@stripeysunday.co.uk` (from the site, from outreach, anywhere) lands in Aliyah's Outlook. She sends outreach from her personal Gmail but the "From" is the studio address. Replies keep flowing.

**Time:** ~20 min, mostly waiting on DNS.
**Cost:** £0.

---

## Part 1 — Move DNS from GoDaddy to Cloudflare (10 min)

Cloudflare stays free. GoDaddy stays the registrar. We just point the domain's nameservers at Cloudflare.

1. Create / sign in at https://dash.cloudflare.com
2. Click **+ Add a site** → type `stripeysunday.co.uk` → choose **Free** plan
3. Cloudflare auto-scans existing DNS records from GoDaddy. **Review the list** — make sure the site and any other records are listed (e.g. an A record pointing to Vercel). If anything's missing, add it before continuing.
4. Cloudflare shows you **2 nameservers**, e.g.:
   - `lila.ns.cloudflare.com`
   - `ruben.ns.cloudflare.com`
5. In a new tab: https://account.godaddy.com/ → `stripeysunday.co.uk` → **DNS** → **Nameservers** → **Change** → **Custom** → paste the two Cloudflare nameservers → Save.
6. Back in Cloudflare, click **Done, check nameservers**. Status flips from "Pending" to "Active" in 5–30 min. You can keep going — Part 2 doesn't need this to be active.

---

## Part 2 — Cloudflare Email Routing (5 min)

1. Cloudflare dashboard → left sidebar → **Email** → **Email Routing** → **Get started** → **Enable**.
2. Add a **destination**: paste Aliyah's Outlook address. Cloudflare emails a verification link to that Outlook — she clicks it. Status flips to "Verified."
3. **Custom Addresses** → **Create address**:
   - **Address:** `hello`
   - **Action:** Send to → her verified Outlook
   - **Catch-all:** OFF (only `hello@` forwards; everything else gets bounced to avoid catching random spam)
4. Cloudflare automatically adds the required MX records + a `._mailchannels` SPF record. No manual DNS work for the forwarding.

---

## Part 3 — Add the Google SPF record (2 min, do this once Part 1 is active)

So her Gmail can authenticate when sending as the studio address.

1. Cloudflare dashboard → **DNS** → **Records** → **Add record**:
   - **Type:** TXT
   - **Name:** `@`
   - **Content:** `v=spf1 include:_spf.google.com ~all`
   - **Proxy status:** DNS only (grey cloud, not orange)
2. Save. Done.

---

## Part 4 — Gmail "Send mail as" (5 min)

1. Gmail web → ⚙️ → **See all settings** → **Accounts and Import** tab.
2. **"Send mail as"** → **Add another email address**.
3. Fill in:
   - **Name:** `Aliyah` *(or whatever shows in recipients' inboxes)*
   - **Email:** `hello@stripeysunday.co.uk`
   - **Uncheck** "Treat as an alias" *(so replies come back to the studio, not her personal Gmail)*
4. Click **Next** → **Send through Gmail™** *(not SMTP)* → **Next**.
5. Gmail sends a verification email to `hello@stripeysunday.co.uk`. It lands in her Outlook (because of Part 2). She clicks the **verification link** in that email.
6. Back in Gmail — the studio address now appears in the "Send mail as" list. Optional: tick **"Make default"** if she wants all her outbound to come from the studio.

---

## Part 5 — Sanity check before she starts outreach

Do all three. If any fail, the most likely cause is DNS hasn't propagated yet (give it 30 more min).

```bash
# Should show Cloudflare/Email Routing MX records
dig stripeysunday.co.uk MX +short

# Should show v=spf1 include:_spf.google.com ~all
dig stripeysunday.co.uk TXT +short

# Should show the two Cloudflare nameservers
dig NS stripeysunday.co.uk +short
```

Then in Gmail:
- Compose a new email → click the "From" dropdown → pick the studio address → send to her personal Gmail.
- Verify: the From is `Aliyah <hello@stripeysunday.co.uk>`.
- Reply to that test email. The reply should land in her Outlook (because the studio address is the reply-to).

---

## Part 6 — Outlook "Send as" (optional, 5 min)

So when she replies from Outlook (where the forwarded replies land), the From stays as `hello@stripeysunday.co.uk`.

1. Outlook web → ⚙️ → **Mail** → **Compose and reply** → **"Send from"** / **"Add a send-only address"**.
2. Add `hello@stripeysunday.co.uk`. Verification email arrives in her Outlook (yes, it sends to itself — she just clicks the link).

After this, when she hits "Reply" on an outreach message in Outlook, the From stays the studio address automatically.

---

## When outreach volume grows — add DKIM

Skip for now. Do this later when she wants better spam-folder placement.

1. In Gmail "Send mail as" settings, click **"Set up DKIM"** next to the studio address.
2. Google gives you a TXT record to add. Copy the value.
3. Cloudflare DNS → Add record:
   - **Type:** TXT
   - **Name:** `google._domainkey`
   - **Content:** *(paste the value)*
4. Back in Gmail → **Start authentication**.

---

## Rollback plan

If anything goes wrong:
- GoDaddy → Nameservers → Change → back to GoDaddy's defaults. Domain returns to GoDaddy in 5–30 min. No data lost.
- Cloudflare Email Routing can be disabled in one click — forwarding stops, but the studio address would then bounce until you set it up again.
