---
type: "query"
date: "2026-08-02T04:12:03.611277+00:00"
question: "Audit current Supabase setup after user configuration"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Wedding Absen Kubernetes Deployment", "Environment Secret Management", "supabase", "Admin()"]
---

# Q: Audit current Supabase setup after user configuration

## Answer

Expanded via graph vocabulary [environment, deployment, supabase, admin]. Remote audit found send-invitation ACTIVE v3 with JWT verification, all required secrets present, migrations synchronized, database lint clean, one confirmed Auth user, public QR bucket with two wedding storage policies, and all four invitation columns. Fixed legacy nullable openwa_enabled with a second migration: Maulana now enabled with session ID; Ica disabled because session ID is missing. Security advisor still warns about unrestricted Allow all policies on config_tamu_dari and data_tamu plus disabled leaked-password protection.

## Outcome

- Signal: useful

## Source Nodes

- Wedding Absen Kubernetes Deployment
- Environment Secret Management
- supabase
- Admin()