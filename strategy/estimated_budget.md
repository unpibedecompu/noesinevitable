# Estimated Budget

## Estimated Umami Budget

Umami Cloud bills by **events**, not visitors (pageviews + custom events).
Pricing used (from third-party sources — verify on [umami.is/pricing](https://umami.is/pricing)
before submitting):

- **Hobby (free):** up to 100k events/month.
- **Pro:** $20/month, 1M events included, overage $0.00002/event (= $20 per extra 1M).

Observed data (first two days after the launch reel, 2026-09-13/14): **11 of
71 visitors sent 57 emails** → ~15% of visitors send, ~5.2 emails per sender.
Umami recorded 56 `email_client_opened`, consistent with the 57 emails.

### 1. Events per visitor type

Estimated from how `components/ContactForm.tsx` fires events.

| Event | Sender | Non-sender |
|---|---:|---:|
| pageview | 1 | 1 |
| `step_viewed` (steps 1, 2, 3) | 3 | 1 |
| country / region / message generated / view representatives | ~3 | ~0.5 |
| `email_client_opened` (one per email) | **5.2** | 0 |
| confirm sent, back, edits, finish, share, course | ~1.8 | 0 |
| **Total** | **~14** | **~2.5** |

### 2. Average events per visitor by sender share

| Share who send | Events per visitor on average | Free plan (100k) lasts up to | Pro's included 1M lasts up to |
|---|---:|---:|---:|
| 15% (observed) | **4.2** | ~24k visitors | ~240k visitors |
| 30% | **6.0** | ~17k visitors | ~170k visitors |
| 50% | **8.3** | ~12k visitors | ~120k visitors |

### 3. Monthly Umami cost by traffic

Free up to 100k events; Pro $20 includes 1M; overage $0.00002/event.
Example: 1M visitors at 30% sending = 6M events → $20 + 5M × $0.00002 = $120.

| Visitors a month | 15% send | 30% send | 50% send |
|---:|---:|---:|---:|
| 1,000 | $0 | $0 | $0 |
| 10,000 | $0 | $0 | $0 |
| 100,000 | $20 | $20 | $20 |
| 1,000,000 | **$84** | **$120** | **$165** |
| 10,000,000 | **$840** | **$1,200** | **$1,650** |

### Notes

- Up to ~100k visitors/month the cost stays between $0 and $20 even if the
  sender share triples; it only matters at viral scale.

Sources: [umami.is/pricing](https://umami.is/pricing)

### Decision:

- Ask for 3 months 100,000 visitors cap budget to validate the project -> 60 usd
