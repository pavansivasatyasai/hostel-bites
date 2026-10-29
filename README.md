# Crumb shared hostel snack shop (free-tier setup)

This version uses static hosting + Supabase's free database. WhatsApp remains a manual click-to-chat message. No payment or paid provider is used. Free-plan quotas and terms can change; Supabase may pause an inactive free project.

## 1. Create the shared database
1. Create a Supabase account and a project on the Free plan.
2. In the project, open **SQL Editor**, create a query, paste all of `setup.sql`, and run it.
3. In **Authentication → Providers / Sign In**, turn off public email sign-ups. Create your own owner account using the dashboard's user management (or enable sign-up temporarily, create your account, then turn sign-up off). Never share the owner login.
4. In **Project Settings → API**, copy the Project URL and `anon`/publishable key. These are intended for a browser app; never use the `service_role`/secret key in this site.

## 2. Configure and host
1. Open `index.html` and find `SUPABASE_URL` and `SUPABASE_ANON_KEY` near the start of its script. Replace the placeholders with your Project URL and anon/publishable key.
2. Create a **public** GitHub repository, upload `index.html`, and enable **Settings → Pages → Deploy from a branch**, choosing `main` and `/ (root)`. GitHub Pages gives you a free `github.io` link. Anyone with that link can place orders and see menu/stock.
3. Open the deployed link once and test with a small order. Use **Owner login** for your Supabase email/password.

## Important
- Supabase's free tier is for a small prototype and has quotas/availability limits. Back up important orders; the free plan does not provide automatic backups as a production guarantee.
- Anyone can submit an order. Orders contain personal contact and room information; share the link only with hostel residents and don't publish the order dashboard. Owner sign-in is protected by Supabase Auth/RLS.
- WhatsApp opens a prefilled message and still requires tapping Send. Orders are saved in Supabase even if the customer closes WhatsApp.
- The site does not collect payments, verify phone numbers, reserve inventory while customers browse, or send automated WhatsApp messages.
