---
type: "query"
date: "2026-08-02T04:03:20.458699+00:00"
question: "Link Supabase project and continue OpenWA deployment"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Wedding Absen Kubernetes Deployment", "Environment Secret Management", "supabase", "Admin()"]
---

# Q: Link Supabase project and continue OpenWA deployment

## Answer

Expanded via graph vocabulary [environment, deployment, supabase, admin]. Linked local project to Supabase ref nemuftsdmjzkzcygkjpg, verified the pending migration, applied 20260802000000_openwa_invitation.sql, deployed send-invitation Edge Function version 1 with JWT verification, verified ACTIVE status, and set non-sensitive OpenWA base/timeout/QR secrets. Remaining required external values are a rotated OPENWA_API_KEY, ADMIN_EMAILS, and production ALLOWED_ORIGINS.

## Outcome

- Signal: useful

## Source Nodes

- Wedding Absen Kubernetes Deployment
- Environment Secret Management
- supabase
- Admin()