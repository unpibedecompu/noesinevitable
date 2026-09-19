# Scaling plan — one-click sending, real tracking, public counter

Status: draft, 2026-09-18. Prices were checked on vendor pages on that date and change often; re-check before committing money.

Confidence legend used in the tables: **(v)** read on the vendor's own page · **(t)** third-party summary, not confirmed on the vendor page · **(e)** my estimate/arithmetic · **(?)** not verified.

---

## 1. TL;DR

- **The main cost is email volume, not hosting.** One person writes to *every* representative that applies to them, so one submission = roughly 7–110 emails depending on country (planning value: **20**). 100k people ≈ 2M emails.
- **Recommended stack (all free-tier friendly): Cloudflare (Workers + D1 + Queues + Turnstile) + Amazon SES for sending + PostHog/Umami for UX analytics.** Estimated monthly cost: **~$0–7 at 1k people, ~$25–45 at 10k, ~$300 at 100k, ~$2.7k at 1M** (section 5).
- The $200 AWS credit for new accounts (v) alone can cover the email cost of the first ~2M emails.
- **Real tracking comes for free with server-side sending.** Today `email_client_opened` is only a proxy (see `lib/analytics.ts`). Once our server sends, "people who sent" and "emails delivered/bounced" are facts, and the public counter can be built on them.
- **Biggest risks are not technical:** (1) deliverability and government mail servers blocking/flooding, (2) abuse of our domain as a mail relay, (3) GDPR/data-protection, (4) whether BlueDot considers this advocacy in scope. Section 6.

---

## 2. Where we are today

| Item | Current state |
|---|---|
| Sending | User clicks "Enviar con Gmail" / "Outlook" **once per representative**; their client opens with a prefilled draft. No server. |
| "Sent" signal | None reliable. `email_client_opened` (click) and `email_sent_confirmed` ("Ya lo mandé") are proxies. |
| Hosting | Cloudflare Workers, static assets only (`wrangler.jsonc`, `out/`), domain `noesinevitable.org`. |
| Analytics | Cloudflare Web Analytics (pageviews) + Umami Cloud Hobby (funnel events, 100k events/month cap, 6-month retention). |
| Data | `data/representatives.json`: 1,455 representatives across 9 countries (AR, CO, MX, EC, DO, UY, GT, CR, PA). Spain, Brazil, Chile, etc. not yet loaded. Every entry has an email. |

### Recipients per person (from the current dataset)

Recipients = national-level reps (`region: null`) + reps of the person's province. This is what "one button, everyone who applies" would send.

| Country | National | Avg province | **Avg total** | Min–max |
|---|---|---|---|---|
| AR | 3 | 13.7 | **16.7** | 11–76 |
| CO | 104 | 4.8 | **108.8** | 105–122 |
| MX | 31 | 4.1 | **35.1** | 33–40 |
| UY | 25 | 4.8 | **29.8** | 26–59 |
| EC | 16 | 5.0 | **21.0** | 18–40 |
| DO | 12 | 6.5 | **18.5** | 15–55 |
| GT | 12 | 2.5 | **14.5** | 13–20 |
| CR | 1 | 8.1 | **9.1** | 5–20 |
| PA | 1 | 6.4 | **7.4** | 3–25 |

Caveats: the data is incomplete (e.g. no Argentine governors, partial Mexican deputies; see `DATA_TODO.md`), so numbers will grow. Colombia is an outlier because 100 senators are elected nationwide, so every Colombian emails all of them. Spain is not in the dataset yet. **Planning value used below: 20 emails per submission.**

---

## 3. Scale scenarios used for costing

| | People (submissions) | Emails @20 each | Notes |
|---|---|---|---|
| **S1 Pilot** | 1,000 / month | 20k | Post-launch on one or two countries |
| **S2 Growth** | 10,000 / month | 200k | A few reels/posts go well |
| **S3 Viral** | 100,000 / month | 2M | The scenario the grant is aiming at |
| **S4 Massive** | 1,000,000 / month | 20M | Best case; would need a digest/cap design (section 6.4) |

Analytics assumption (e): ~3 visitors per submitter and ~10 tracked events per visitor → ~30 events per submission (S1 30k, S2 300k, S3 3M, S4 30M events/month).

---

## 4. Options, by building block

### 4.1 How the email actually leaves

| # | Option | Friction for user | Real "sent" proof | Cost | Verdict |
|---|---|---|---|---|---|
| A | **Status quo**: mailto / Gmail / Outlook links | High: one click + one send per rep | No | $0 | Keep only as fallback |
| B | **Server-side send from our domain** via an email provider, `From: "<Name> via No es inevitable" <mensaje@…noesinevitable.org>`, `Reply-To` = user (if given) | **Lowest: one button** | **Yes** (accepted / delivered / bounced via provider webhooks) | Section 4.2 | **Recommended** |
| C | **Send as the user** via Gmail API / Microsoft Graph OAuth | Medium: consent screen; only Gmail/Outlook users | Yes (message id) | $0 infra, but needs Google OAuth app verification for `gmail.send` (t); weeks of setup | Optional later: best authenticity, worse conversion |
| D | Self-hosted SMTP on a VPS | Same as B | Partial | ~$5/mo VPS (e) | **Not recommended**: IP reputation, port-25 blocks, blocklists |
| E | **Hybrid: B as the main button + A as fallback** ("send it yourself instead") | Lowest | Yes for B | = B | **Recommended end state** |

Important: we **cannot** send *from the user's address* with B. SPF/DKIM/DMARC would fail and the mail would be rejected or spammed. Sender identity design is in 6.1.

### 4.2 Email providers (option B) — price per scenario

List prices; monthly cost if the whole volume falls in one month.

| Provider | Free tier | Paid entry | S1 20k | S2 200k | S3 2M | S4 20M | Notes |
|---|---|---|---|---|---|---|---|
| **Amazon SES** | New AWS accounts: up to **$200 credits, 6 months** (v) | **$0.10 / 1,000** (v) | **$2** | **$20** | **$200** | **$2,000** | Cheapest at scale. Needs a production-access request; account is reviewed at ~5% bounce and paused at ~10% (t); complaint ~0.1% review / 0.5% pause (t). Dedicated IPs $15/mo + per-email fee (v). |
| **Cloudflare Email Sending** | none for external recipients | Workers Paid $5/mo incl. 3,000 emails, then **$0.35 / 1,000** (v) | ~$11 | ~$74 | ~$704 | ~$7,004 | **Beta.** New accounts get a "conservative daily quota" that scales with reputation (v), so a viral spike may hit the ceiling. One vendor, native Worker binding. |
| **Resend** | 3,000/mo, **100/day** (v) | Pro $20/mo (50k) + $0.90/1k over (v); Scale $90–$1,150/mo up to 2.5M (v) | $20 | ~$155 (e) | ~$1,000 (e) | Enterprise (3M+) | Best developer experience; free tier too small for a burst. |
| **Postmark** | 100/mo (v) | Basic $15 (10k) + $1.80/1k over; Platform $18 + $1.20/1k (v) | ~$33 | ~$246 | ~$2,400 | custom | Best deliverability reputation, expensive; may not welcome bulk advocacy (check AUP (?)). |
| **Mailgun** | 100/day (v) | Basic $15 (10k); Scale $90 (100k), overage from $1.10/1k (v) | ~$33 | ~$200 | ~$2,180 | ~$22k | Dedicated IP $59/mo (v). |
| **MailerSend** | 500/mo (v) | Hobby $5.60 (5k); Starter (50k) price not visible; overage $0.90/1k (v) | n/v | n/v | n/v | n/v | Not costed. |
| **Brevo** | **300/day** (t) ≈ 9k/mo | Starter ~$9–69/mo for 5k–100k (t) | ~$9–69 (t) | above Starter cap (?) | (?) | (?) | Page did not load; figures from third-party reviews. |
| **Zoho ZeptoMail** | 10,000 emails free (first credit) (v) | pay-as-you-go, credit = 10k emails, valid 6 months (v) | price not on page (?) | (?) | (?) | (?) | Reportedly ~$2.50 per 10k (from memory, **unverified**), which would be very cheap. Worth a real check. |

Takeaway: below ~10k emails/month everything is cheap or free; above ~200k, **SES ($0.10/1k) and Cloudflare ($0.35/1k) are 3–20× cheaper** than Postmark/Mailgun/Resend. Free tiers of Resend/Mailgun (100/day) cannot survive a viral day: 100 emails is ~5 people.

### 4.3 Backend, storage, queue, bot protection

The site is a static export today. Sending needs a small backend; Workers static assets can coexist with a Worker script (`main` + `assets` in `wrangler.jsonc`, `/api/*` routed to the Worker). Static asset requests stay free and unlimited (v).

| Need | Cloudflare option | Free tier | Paid | Alternative |
|---|---|---|---|---|
| API / logic | **Workers** | 100k requests/day, 10 ms CPU (v) | $5/mo: 10M req/mo, $0.30/M over (v) | Supabase Edge Functions: 500k/mo free, $25/mo Pro (v) |
| Database (submissions, counters, delivery status) | **D1** | 5M reads/day, **100k writes/day**, 5 GB (v) | 25B reads + 50M writes/mo incl., $1/M writes over (v) | Supabase Free: 500 MB, **paused after 1 week idle** (v); Pro $25/mo. Not suited to a launch spike. |
| Send queue (smooth spikes, retries) | **Queues** | 10k ops/day, 24 h retention (v) | 1M ops/mo incl., $0.40/M over, 4-day retention (v) | Direct send from the request: simpler but fragile under load |
| Bot / abuse gate | **Turnstile** | Unlimited verifications, 20 widgets (v) | Enterprise only | hCaptcha, reCAPTCHA |
| Domain / DNS (SPF, DKIM, DMARC) | Cloudflare DNS | free | | |

Rough Cloudflare bill (e): S1 $0–5 · S2 ~$5 · S3 ~$10 (queue ≈ $2 for 6M ops, D1 stays inside the paid allowance) · S4 ~$40 (≈ $10 D1 writes, ≈ $24 queue). At S3+ the $5 Workers Paid plan is needed anyway (free tier = 100k requests/day, 100k D1 writes/day).

### 4.4 Analytics for reducing friction

Two layers, kept separate:

- **Business truth (first-party, server-side):** submissions, emails queued/delivered/bounced, by country and province. Lives in D1. This is what the public counter uses and it is not affected by ad-blockers.
- **UX/behaviour (client-side):** funnel drop-off, time per step, errors, devices, referrers (Instagram reel/story). Third-party tool.

| Tool | Free tier | Paid | Strengths for friction work | Watch out |
|---|---|---|---|---|
| **Umami Cloud** (current) | Hobby: 100k events/mo, 6-mo retention (t) | **Pro $20/mo**: 1M events, +$0.00003/event, 2-yr retention; Business $200/mo: 10M events, session replays, heatmaps (t) | Simple, cookieless, funnels; already wired via `trackFunnel` | 100k cap would break at S2+; no A/B testing |
| **PostHog Cloud** | **1M events, 5k session recordings, 1M flag requests / mo** (v) | pay-as-you-go beyond (price not verified (?)) | Funnels, **session replay**, **feature flags + experiments (A/B tests)** in one free tool: best fit for "reduce friction" | Heavier script; cookie/consent settings need care under GDPR |
| **Microsoft Clarity** | Free, no traffic limit; heatmaps + recordings (v) | n/a | Free heatmaps/replays on top of anything else | Consent rules for EU/UK visitors likely apply (?); verify |
| **Cloudflare Analytics Engine** | 100k data points/day written (v); currently **not billed** (v) | $0.25/M writes over 10M/mo (v) | First-party custom events at ~zero cost | Requires a Worker, which the sending backend gives us anyway. **This removes the objection in `PROJECT_STATUS.md`** ("mayor costo de ingeniería"). SQL-only querying, no UI. |
| **Plausible** | none | from ~$14/mo, scales with pageviews (t) | EU-hosted, simple goals/funnels | Less rich than PostHog; cost grows with traffic |
| **Self-hosted Umami** | software free | DB + host (Neon/Supabase free tiers, Vercel) | Full control | Free DBs pause/limit; you become the ops team. Not recommended. |

Suggested split: **D1 for business numbers · PostHog (or Umami Pro) for funnel/experiments · Clarity for replays if consent allows · keep Cloudflare Web Analytics for pageviews.**

Metrics worth adding once sending is server-side (in addition to the events already in `FunnelEvent`): `submit_clicked`, `submit_succeeded/failed` (+ reason), `turnstile_failed`, median time landing→submit, time per step, device/OS, UTM source, share rate per submitter, bounce rate per representative (feeds data cleanup), reply rate (if Reply-To is enabled).

### 4.5 Public "people who already wrote" counter, filter by country / province

- **Data:** one row per submission `(ts, country, region, n_recipients, ref)` plus a `counters(country, region, submissions, emails)` table incremented on each send (1 D1 write). No names needed.
- **Serving:** Worker endpoint `/api/stats?country=&region=` with a 60-second edge cache (Cache API is free), so a viral page view costs ~0 D1 reads. Alternative: a cron Worker writes `stats.json` every minute.
- **Cost:** effectively $0 on the Cloudflare stack above.
- **Integrity:** dedupe so one person = one count (verified-email hash if we ask for email, else a salted IP+UA hash, as Umami does); Turnstile on submit; show "at least N".
- **Privacy:** aggregate only. Suppress or blur small cells (e.g. show "<5" for a province with 2 people) so nobody is identifiable.
- **Front-end:** the static site fetches the endpoint at runtime (CORS/same-origin route); a country → province filter reuses the existing region list from `representatives.json`.

---

## 5. Reference stacks and monthly cost

Variable monthly cost, estimates (e) from the tables above.

| | S1 (1k people) | S2 (10k) | S3 (100k) | S4 (1M) |
|---|---|---|---|---|
| **Stack 1 — Cloudflare + SES** (recommended) | | | | |
| SES email | $2 (or $0 with AWS credits) | $20 | $200 | $2,000 |
| Cloudflare (Workers/D1/Queues) | $0–5 | ~$5 | ~$10 | ~$40 |
| Analytics (PostHog free / Umami) | $0 | $0–20 | ~$20–80 | ~$200–600 |
| **Total** | **~$0–7** | **~$25–45** | **~$230–290** | **~$2.3–2.7k** |
| **Stack 2 — all-Cloudflare** (Email Sending beta) | ~$11 | ~$75 | ~$705 | ~$7,000 |
| Simplest ops (one vendor); beta quota risk; 3.5× SES cost | | | | |
| **Stack 3 — Cloudflare + Resend** | ~$25 | ~$180 | ~$1,050 | Enterprise |
| Nicest DX; free tier unusable at launch | | | | |

Not counted: domain (already owned), your time, legal advice, representative-data collection labour (the largest real cost; see the grant doc).

---

## 6. Risks and design decisions (these matter more than the price)

### 6.1 Sender identity and user verification
Three levels, from least to most friction:

| Level | What the user does | Pros | Cons |
|---|---|---|---|
| **V0** | Name only, then one button. `Reply-To` = our inbox. | Meets the 10–20 s goal in `PROJECT_SPEC.md`; Turnstile invisible | We can't verify a real person exists; replies don't reach the user |
| **V1** | Enter email, click a verification link, *then* it sends | Real supporter list (with consent), dedupes people, working `Reply-To`, stronger counter | Extra step; expect measurable drop-off (test it, don't guess) |
| **V2** | OAuth "send as me" | Best authenticity | Highest friction, Google verification |

Suggested: **launch V0 + Turnstile + rate limits**, and offer V1 *after* sending ("want replies and updates? confirm your email"). Then A/B test V1-before-send with PostHog flags.

### 6.2 Abuse of our domain
An editable message sent from our domain to 100 legislators is a harassment/threat vector and a reputation risk. Mitigations: locked core paragraph + short editable personal paragraph, max length, blocklist / cheap moderation check, per-IP/device/day cap, Turnstile, global kill switch, logging of what was sent.

### 6.3 Deliverability
- Use a **subdomain** (e.g. `mail.noesinevitable.org`) so reputation issues don't touch the root domain. Publish SPF, DKIM, DMARC; Google/Yahoo want complaint rates below 0.1% and never above 0.3% (t).
- Warm up gradually; a cold domain sending 100k mails on day one will be throttled.
- Near-identical mails from many people get filtered as bulk. Personalize (representative's name, user's own paragraph).
- Government servers often run aggressive filters and mailboxes fill up. Handle bounces → suppression list → per-rep bounce report → data cleanup in `DATA_TODO.md`.
- Provider terms: check each provider's acceptable-use policy for bulk advocacy mail before choosing (?).

### 6.4 Flooding the representatives
The president/vice-president receive *every* submission from their country: 100k people = 100k emails in one inbox. Expect blocks, mailbox-full bounces, or the office marking us as spam. Options:

| Policy | Emails sent (S3) | Effect |
|---|---|---|
| Individual mail to every rep | ~2M | Max "each citizen's voice lands", max cost and block risk |
| Individual up to N per rep per day, then a **daily digest** ("1,842 citizens wrote today; here is the list") | ~10–30× fewer for national offices | Much cheaper, better deliverability, still fully counted publicly |
| Digest only | ~1.5k per day | Cheapest; weakest per-message signal |

Decide before scaling; it changes both cost (an order of magnitude at S3–S4) and the theory of change (`Theory_of_change.md`).

### 6.5 Legal / data protection (not legal advice)
- Spain/EU: GDPR applies once we store names/emails/IPs of EU residents: lawful basis (consent), privacy notice, retention limit, deletion on request, processor agreements with Cloudflare/AWS/analytics vendors. Latin America has its own regimes (e.g. Argentina Ley 25.326, Brazil LGPD, Mexico LFPDPPP, Colombia Ley 1581), so a lawyer should review before mass storage of personal data (a possible grant line item).
- Minimise data: store first name at most, hash emails, don't keep raw IPs (rotating-salt hash for rate limits), publish only aggregates.
- Representatives' institutional emails are public data, but review the source terms per country (already tracked in `DATA_TODO.md`).

### 6.6 Fit with BlueDot
Rapid Grants: up to $20k, decisions usually within about a week; they can't fund political donations or unlawful activities and require approval for material changes of purpose (v). Citizen advocacy to legislators is not a donation, but BlueDot is a UK charity, so **ask joshua@bluedot.org before applying** whether public-policy advocacy to lawmakers is in scope.

---

## 7. Phased roadmap

| Phase | Scope | Est. infra cost | Effort (e) |
|---|---|---|---|
| **0. Now** | Keep mailto flow; add `provider`/country to events; check funnel in Umami before it hits 100k events | $0 | done / trivial |
| **1. Backend skeleton** | Worker + D1 + Turnstile; `/api/submit` writes a submission and counters; **no email yet**; public counter live using confirmed-sent proxies | $0 | S–M |
| **2. Server-side send** | SES (production access + DNS auth on `mail.` subdomain), Queues consumer, bounce/complaint webhooks, kill switch, per-IP caps; one-button flow for 1 country (AR), mailto kept as fallback | ≈ $0–10 | M–L |
| **3. Measurement** | PostHog (funnel + replays + flags); A/B tests: V0 vs V1, button copy, message length; per-rep bounce report | $0 | S–M |
| **4. Scale-out** | More countries + Spain data, digest policy (6.4), dedicated IP if volume justifies, privacy notice + legal review | S2–S3 costs | M + data labour |

---

## 8. What this implies for the grant request

Infra lines that can be itemised in the BlueDot form (amounts are estimates (e); the form asks for the nearest $50):

| Item | Basis | Est. |
|---|---|---|
| Email sending (SES) for a viral month (S3) | 2M × $0.10/1k | ~$200 |
| Cloudflare Workers Paid + D1 + Queues, 6 months | S2–S3 | ~$60–120 |
| Analytics (PostHog free / Umami Pro), 6 months | | $0–500 |
| Legal review of privacy/data protection | quote needed | (?) |
| Representative data collection/verification per country | labour, your rate | (?) |

The infra is small next to the $20k cap. **The honest budget driver is data labour and legal review, not servers.** The grant text already reflects this ("Time for adding each national level representative").

---

## 9. Not verified / still open

- Brevo pricing page and Umami pricing page did not load; figures are from third-party summaries (t).
- ZeptoMail per-credit price, Resend 200k/2M tier prices, Postmark high-volume tiers, PostHog pay-as-you-go price, and Cloudflare Email Sending's real daily quota: not confirmed.
- SES initial sending quota and production-access wording; Gmail `gmail.send` verification effort.
- Clarity/PostHog consent requirements for EU visitors.
- Whether existing advocacy platforms (buy vs build) cover LatAm; not researched.
- Real visitor-to-submitter and events-per-visitor ratios; the numbers in section 3 are placeholders until measured.

## Sources (fetched 2026-09-18)

- Resend pricing: https://resend.com/pricing
- Amazon SES pricing: https://aws.amazon.com/ses/pricing/
- Cloudflare Email Service: https://developers.cloudflare.com/email-service/ · limits: https://developers.cloudflare.com/email-service/platform/limits/ · pricing: https://developers.cloudflare.com/email-service/platform/pricing/
- Cloudflare Workers / D1 / Queues / Turnstile / Analytics Engine pricing: https://developers.cloudflare.com/workers/platform/pricing/ · https://developers.cloudflare.com/d1/platform/pricing/ · https://developers.cloudflare.com/queues/platform/pricing/ · https://developers.cloudflare.com/turnstile/plans/ · https://developers.cloudflare.com/analytics/analytics-engine/pricing/
- Postmark: https://postmarkapp.com/pricing · Mailgun: https://www.mailgun.com/pricing/ · MailerSend: https://www.mailersend.com/pricing · ZeptoMail: https://www.zoho.com/zeptomail/pricing.html
- PostHog: https://posthog.com/pricing · Clarity: https://clarity.microsoft.com/ · Supabase: https://supabase.com/pricing
- BlueDot Rapid Grants: https://bluedot.org/programs/rapid-grants
- Third-party (t): Umami Cloud plans (search summaries of https://umami.is/pricing), Brevo plans (https://www.brevo.com/pricing/ via reviews), Plausible pricing, SES bounce/complaint thresholds (https://repost.aws/knowledge-center/ses-reputation-dashboard-bounce-rate), Gmail/Yahoo bulk-sender rules (search summaries), Google OAuth scope verification (https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification).
