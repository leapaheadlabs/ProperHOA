# Go-Live Checklist

## Pre-Launch Verification

### Infrastructure
- [ ] VPS provisioned (Hetzner/DigitalOcean/AWS) with >= 4GB RAM, 2 vCPU
- [ ] Domain registered and DNS pointed to VPS
- [ ] Caddy auto-SSL configured and working
- [ ] Docker Compose stack tested with `docker-compose up -d`
- [ ] All health checks passing: `GET /api/health` returns 200
- [ ] Monitoring stack accessible: Grafana, Prometheus, Loki
- [ ] Backups automated (daily PostgreSQL dumps)

### Security
- [ ] All environment variables set with strong secrets (check deploy.sh validation)
- [ ] Stripe webhook secret rotated and verified
- [ ] OAuth credentials (Google, Apple) configured
- [ ] Rate limiting active (Redis connected)
- [ ] Security headers verified with securityheaders.com
- [ ] RLS policies active on all tables
- [ ] PCI DSS quarterly checklist reviewed

### Database
- [ ] Migrations deployed: `npx prisma migrate deploy`
- [ ] Seed data loaded for demo community
- [ ] pgvector extension confirmed
- [ ] Connection pooling configured
- [ ] Backup restore tested

### AI / Ollama
- [ ] Ollama container running and reachable
- [ ] Llama 3.1 model pulled: `ollama pull llama3.1`
- [ ] nomic-embed-text model pulled: `ollama pull nomic-embed-text`
- [ ] AI chat endpoint responding: `POST /api/ai/chat`
- [ ] RAG pipeline tested with sample documents

### Payments
- [ ] Stripe account active and keys configured
- [ ] PaymentIntent creation tested
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Test payment completed successfully
- [ ] PCI compliance documentation reviewed

### Email
- [ ] SMTP configured (Resend/Postmark/SendGrid)
- [ ] Magic link flow tested end-to-end
- [ ] Password reset email received
- [ ] Email verification flow working

### Search
- [ ] Meilisearch container running
- [ ] Documents indexed
- [ ] Search API responding: `GET /api/search?q=test`

### Storage
- [ ] MinIO bucket created for documents
- [ ] Upload endpoint tested
- [ ] Signed URL generation working
- [ ] Expiration alerts configured

### Mobile / PWA
- [ ] Manifest.json valid
- [ ] Service worker registered
- [ ] Install prompt works on Android
- [ ] Add to Home Screen works on iOS
- [ ] Mobile bottom nav visible and functional

### Testing
- [ ] `npm run test:unit` passes
- [ ] E2E smoke tests pass
- [ ] TypeScript check clean: `tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] Docker image builds successfully

### Documentation
- [ ] README.md updated with current info
- [ ] API documentation complete
- [ ] Help/FAQ page deployed
- [ ] Security policy published

## Launch Day

- [ ] Deploy to production with `./deploy.sh production`
- [ ] Verify health endpoint: `curl https://yourdomain.com/api/health`
- [ ] Run smoke tests against production
- [ ] Verify SSL certificate valid
- [ ] Check Grafana dashboards are receiving data
- [ ] Test critical user flows:
  - Sign up → onboarding → community creation
  - Invite resident → resident joins
  - Create invoice → resident pays → payment webhook received
  - Upload document → search finds it
  - Ask AI assistant → receives cited answer
- [ ] Announce launch to community

## Post-Launch (Week 1)

- [ ] Monitor error rates and response times
- [ ] Review Stripe webhook logs
- [ ] Check Ollama model performance
- [ ] Gather user feedback
- [ ] Fix any critical bugs immediately
- [ ] Update documentation based on feedback

## Post-Launch (Month 1)

- [ ] Review analytics and usage patterns
- [ ] Optimize slow queries based on metrics
- [ ] Plan Month 3-4 features (Plaid bank sync, advanced reporting)
- [ ] Conduct security review
- [ ] Update PCI compliance checklist
- [ ] Schedule community feedback session

---

**Product Version**: 1.0.0  
**Release Date**: TBD  
**Status**: READY FOR LAUNCH 🚀
