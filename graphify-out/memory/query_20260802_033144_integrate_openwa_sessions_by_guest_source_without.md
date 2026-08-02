---
type: "query"
date: "2026-08-02T03:31:44.373795+00:00"
question: "Integrate OpenWA sessions by guest source without storing credentials in the frontend"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Admin()", "supabase", "Environment Secret Management", "Admin Guest Management Panel", "data_tamu Database Schema"]
---

# Q: Integrate OpenWA sessions by guest source without storing credentials in the frontend

## Answer

Expanded from original query via graph vocab: [guest, admin, supabase, data, database, tamu, environment]. The React Admin page reads data_tamu and config_tamu_dari directly through Supabase. Add OpenWA session_id mapping to config_tamu_dari, call a Supabase Edge Function from the Send Invitation button, and store delivery status on data_tamu or a delivery log table. No broker is needed for individual sends; use an outbox or Supabase Queue only for scheduled bulk retries. OpenWA and storage secrets must remain server-side, and the current client-side admin authentication must be replaced or enforced with Supabase Auth before enabling sends.

## Outcome

- Signal: useful

## Source Nodes

- Admin()
- supabase
- Environment Secret Management
- Admin Guest Management Panel
- data_tamu Database Schema