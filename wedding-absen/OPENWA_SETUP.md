# OpenWA Invitation Setup

The admin page sends invitations through this path:

`Admin.jsx -> Supabase Edge Functions -> data_tamu + config_tamu_dari + invitation_message_templates -> OpenWA`

The OpenWA API key and Supabase service-role key must never be stored in a
`VITE_*` variable. Only the Edge Function may read them.

## 1. Apply the database migration

If the database columns were added manually, keep the migration in source
control and verify the final shape:

```sql
select name, openwa_session_id, openwa_enabled
from public.config_tamu_dari
order by name;

select invitation_status, count(*)
from public.data_tamu
group by invitation_status;
```

Otherwise, link the Supabase CLI and apply the migration:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migration also adds authenticated upload policies for the public
`assets-devaq/wedding-scan` storage path.

## 2. Configure Supabase Auth

Create an email/password user in Supabase Dashboard under Authentication ->
Users. Use that email in the `ADMIN_EMAILS` function secret. Disable public
email sign-up unless the application needs it; the function still enforces its
own email allow-list.

The old browser-side `VITE_ADMIN_USERNAME` and `VITE_ADMIN_PASSWORD` variables
are no longer used.

## 3. Configure the frontend

```bash
cp .env.example .env
```

Fill only the public Supabase URL and publishable key. Start local testing with:

```bash
npm install
npm run dev
```

## 4. Configure Edge Function secrets

OpenWA's REST base URL must include `/api`:

```bash
supabase secrets set \
  OPENWA_BASE_URL=https://openwa.maulanamalik.my.id/api \
  OPENWA_API_KEY=REPLACE_WITH_A_NEW_KEY \
  ADMIN_EMAILS=admin@example.com \
  ALLOWED_ORIGINS=http://localhost:3000,https://invitation.example.com
```

Optional settings:

```bash
supabase secrets set \
  OPENWA_REQUEST_TIMEOUT_MS=20000 \
  INVITATION_QR_BUCKET=assets-devaq \
  INVITATION_QR_PREFIX=wedding-scan
```

Invitation captions are stored per sender in the
`public.invitation_message_templates` table. Edit the `message_template` row
for `Maulana` or `Ica` in Supabase Table Editor. Templates support
`{{nama_tamu}}`, `{{alamat_tamu}}`, and `{{tamu_from}}`.

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are supplied
automatically by deployed Supabase Edge Functions. They only need to be filled
in `supabase/functions/.env` when serving the function locally.

## 5. Deploy the function

```bash
supabase functions deploy send-invitation
supabase functions deploy send-invitations-bulk
```

For local function testing:

```bash
cp supabase/functions/.env.example supabase/functions/.env
supabase functions serve send-invitation --env-file supabase/functions/.env
```

## 6. Test one invitation

1. Confirm the selected OpenWA session reports `ready`.
2. Log in to `/admin` with the Supabase Auth user.
3. Confirm the guest has a WhatsApp number, `tamu_from`, and generated QR.
4. Click **Send Invitation**.
5. Confirm `invitation_status = 'sent'` and `invitation_message_id` is filled.

No broker is required for one-by-one sends. Add a queue/outbox only when bulk
sends, scheduled sends, or automatic retries become requirements.

## 7. Bulk invitations and pacing

The admin bulk action groups eligible guests by `tamu_from` and uses OpenWA's
native background `send-bulk` endpoint. One batch accepts at most 100 guests.
Only guests with a contact number, a generated QR, and invitation status
`not_sent` or `failed` are included.

Pacing is stored per sender in `config_tamu_dari`:

- `bulk_delay_seconds`: 5–60 seconds; the application default is 20 seconds.
- `bulk_randomize_delay`: adds OpenWA's random 0–2 second jitter.

The frontend polls OpenWA batch status and maps each result back to its guest.
If the page was closed while a batch continued in OpenWA, use **Cek Batch
Aktif** to resume status polling. The database history is stored in
`invitation_bulk_batches`.

The delay reduces bursts but does not guarantee that WhatsApp will not restrict
an account. Send only to expected/opted-in recipients and warm up new numbers.
See OpenWA's safe-sending guidance:
https://docs.open-wa.org/guides/safe-sending/
