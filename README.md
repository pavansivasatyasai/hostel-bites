# Hostel Bites — Quick Commerce for One Hostel

Next.js (static export) + Supabase + Azure Static Web Apps. Solo-operated: you deliver yourself, guest checkout, no maps/riders.

## 1. Supabase setup
1. Create a project at https://supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Run `supabase/seed.sql` to load sample products
4. Create an admin user: Authentication → Users → Add user (email + password)
5. Storage: bucket `product-images` is created by schema.sql; upload product images there
6. Set secrets for Edge Functions:
   ```
   supabase secrets set RAZORPAY_KEY_ID=rzp_... RAZORPAY_KEY_SECRET=... TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...
   ```
7. Deploy Edge Functions:
   ```
   supabase functions deploy create-razorpay-order
   supabase functions deploy razorpay-webhook
   ```

## 2. Local dev
```
cp .env.example .env.local
# fill in NEXT_PUBLIC_* values
npm install
npm run dev
```

## 3. Azure Static Web Apps
1. Azure Portal → Create "Static Web App" → Free plan → connect to your GitHub repo
2. Azure auto-creates the GitHub Actions workflow (already in .github/workflows/)
3. Add app settings in SWA → Configuration:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Push to `main` → auto-deploys

## 4. Razorpay
- Create account at razorpay.com
- Use test keys first, switch to live after testing
- Webhook URL (optional): your Supabase Edge Function URL

## 5. Telegram notifications
- Create bot via @BotFather → get token
- Get your chat id (message @userinfobot)
- Set as secrets (step 1.6)

## Notes
- Products fetched client-side; admin auth via Supabase Auth (email+password)
- Guest checkout: name + phone + room number, no customer accounts
- Stock decremented on order (best-effort; add DB transaction for high volume)
