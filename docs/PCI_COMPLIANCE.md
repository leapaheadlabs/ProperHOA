# PCI DSS Compliance

ProperHOA handles payment card data exclusively through **Stripe** — no card numbers, CVV, or magnetic stripe data ever touches our servers.

## Scope

- **SAQ A-EP** — Stripe Elements (hosted fields) + webhooks
- No cardholder data (CHD) stored in our database
- Stripe manages: tokenization, encryption, vaulting, processing

## Controls Implemented

| Requirement | Control | Status |
|-------------|---------|--------|
| 1. Firewall | VPS firewall + Docker network isolation | ✅ |
| 2. Passwords | bcrypt + password reset | ✅ |
| 3. CHD protection | No CHD stored; Stripe tokenization | ✅ |
| 4. Encryption | TLS 1.3 via Caddy, Stripe TLS | ✅ |
| 5. Antivirus | Host OS updates + minimal attack surface | ✅ |
| 6. Secure systems | Docker Compose, hardened images | ✅ |
| 7. Access control | Role-based auth, RLS, audit logs | ✅ |
| 8. Unique IDs | UUIDs for all entities | ✅ |
| 9. Physical access | VPS provider (Hetzner/DigitalOcean) | 🔄 |
| 10. Logging | ActivityLog table + audit trail | ✅ |
| 11. Testing | Quarterly vulnerability scans | 🔄 |
| 12. Policy | This document + incident response | ✅ |

## Stripe Security

- Webhook signature verification with `stripe.webhooks.constructEvent()`
- Idempotency key deduplication
- All payment events logged to ActivityLog
- `STRIPE_WEBHOOK_SECRET` rotated quarterly
- Stripe API version pinned: `2023-10-16`

## Data Retention

- Payment records: 7 years (IRS requirement)
- Stripe PaymentIntent IDs: stored indefinitely for reconciliation
- Card tokens: never stored
- Failed payment logs: 90 days

## Incident Response

1. Suspect breach → immediately rotate `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
2. Notify Stripe within 24 hours
3. Review ActivityLog for unauthorized access
4. Notify affected communities per breach notification laws
5. Document timeline and remediation

## Quarterly Checklist

- [ ] Rotate Stripe API keys
- [ ] Review webhook endpoint security
- [ ] Run vulnerability scan on VPS
- [ ] Verify TLS certificate validity
- [ ] Audit payment event logs for anomalies
- [ ] Review access logs for unauthorized admin access
- [ ] Update this document with any changes

## Contact

- Stripe Support: support@stripe.com
- ProperHOA Security: security@properhoa.com
