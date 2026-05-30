# FORGE — Deployment Guide

## What you need first
- An Anthropic API key (free to get, pay per use ~$0.01/day typical usage)
- A Vercel account (free)
- A GitHub account (free)

---

## Step 1 — Get your Anthropic API key (5 min)

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Go to **Billing** → set a monthly spend limit (e.g. $5/month as a safety cap)

---

## Step 2 — Put the code on GitHub (5 min)

1. Go to https://github.com and create a new repository called `forge-app`
2. Set it to **Private**
3. Upload all files from this folder into the repo
   - Drag and drop the entire folder contents into the GitHub web UI
   - Or use GitHub Desktop app if you prefer

---

## Step 3 — Deploy on Vercel (3 min)

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New → Project**
3. Select your `forge-app` repository
4. Vercel auto-detects it's a Vite project — click **Deploy**
5. Wait ~60 seconds — Vercel gives you a live URL like `forge-app.vercel.app`

---

## Step 4 — Add your API key to Vercel (2 min)

1. In your Vercel project, go to **Settings → Environment Variables**
2. Click **Add**:
   - Name: `VITE_ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key
   - Environment: ✅ Production ✅ Preview ✅ Development
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

Your live URL now has the API key. Test it in your browser first.

---

## Step 5 — Add to iPhone home screen (1 min)

1. On your iPhone, open **Safari** (must be Safari — Chrome won't work for PWA)
2. Go to your Vercel URL (e.g. `https://forge-app.vercel.app`)
3. Tap the **Share button** (box with arrow, bottom of screen)
4. Scroll down and tap **"Add to Home Screen"**
5. Change the name to **FORGE** if needed → tap **Add**

FORGE now appears on your home screen, opens full-screen with no browser chrome,
and behaves like a native app. Works on iOS 16.4+ with full PWA support.

---

## Optional — Custom domain (e.g. forge.yourdomain.com)

In Vercel → Settings → Domains → Add your domain. Vercel handles SSL automatically.

---

## Updating the app in future

Any time you push changes to GitHub, Vercel auto-deploys within 60 seconds.
The app on your phone updates automatically next time you open it.

---

## Cost estimate

At typical personal use (1 workout/day + occasional photo analysis):
- Workout generation: ~$0.002 per session
- Whoop scan: ~$0.003 per scan
- Recovery advice: ~$0.001 per request
- **Total: well under $3/month**

Set your Anthropic billing limit to $10/month for complete peace of mind.
