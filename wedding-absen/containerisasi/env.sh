#!/bin/sh

ENV_FILE="/usr/share/nginx/html/env.js"

echo "window.env = {" > $ENV_FILE
echo "  VITE_SUPABASE_URL: \"${VITE_SUPABASE_URL}\"," >> $ENV_FILE
echo "  VITE_SUPABASE_PUBLISHABLE_KEY: \"${VITE_SUPABASE_PUBLISHABLE_KEY}\"," >> $ENV_FILE
echo "  VITE_INVITATION_BASE_URL: \"${VITE_INVITATION_BASE_URL:-https://anisa.maulanamalik.my.id}\"" >> $ENV_FILE
echo "};" >> $ENV_FILE
