# Supabase Production Configuration Guide

## Production URL
**Your Vercel Production URL:** `https://unpuzzled-marketplace.vercel.app`

---

## Step-by-Step Configuration

### 1. Update Supabase Redirect URLs

**Go to:** https://supabase.com/dashboard → Select your project → **Authentication** → **URL Configuration**

#### In "Redirect URLs" section, add these URLs:

```
https://unpuzzled-marketplace.vercel.app/**
https://unpuzzled-marketplace.vercel.app/*
https://unpuzzled-marketplace.vercel.app/admin
https://unpuzzled-marketplace.vercel.app/admin/**
http://localhost:5173/**  (keep for development)
http://localhost:5173/*   (keep for development)
http://localhost:5173/admin  (keep for development)
```

**Important:** Use wildcards (`**` or `*`) to allow all routes on your domain.

#### In "Site URL" field, set:

```
https://unpuzzled-marketplace.vercel.app
```

---

### 2. Update Google OAuth Redirect URIs (if using Google OAuth)

**Go to:** https://console.cloud.google.com → **APIs & Services** → **Credentials** → Select your OAuth 2.0 Client ID

#### In "Authorized redirect URIs", add:

```
https://unpuzzled-marketplace.vercel.app/auth/callback
http://localhost:5173/auth/callback  (keep for development)
```

**Note:** Supabase handles the OAuth callback internally, so the actual redirect happens to your app routes (like `/role-selection`, `/dashboard`, etc.), not `/auth/callback`. But Google requires this URL in their console.

---

## Routes That Need Redirect Support

Your app uses these redirect routes after authentication:

- `/role-selection` - For new user signups
- `/dashboard` - For regular sign-ins  
- `/smart-redirect` - For smart login flow
- `/admin` - For admin sign-ins
- `/student` - For student dashboard
- `/teacher` - For teacher dashboard
- `/academy` - For academy owner dashboard

All of these will work with the wildcard URLs (`**` or `*`) configured above.

---

## Verification Steps

After updating the configuration:

1. **Clear browser cache** or use **Incognito/Private window**
2. **Test signup flow:**
   - Go to `https://unpuzzled-marketplace.vercel.app`
   - Click "Sign In with Google"
   - Complete OAuth flow
   - Should redirect to `https://unpuzzled-marketplace.vercel.app/role-selection` (not localhost)

3. **Test signin flow:**
   - Go to `https://unpuzzled-marketplace.vercel.app`
   - Click "Sign In with Google"
   - Should redirect to `https://unpuzzled-marketplace.vercel.app/dashboard` (not localhost)

---

## Troubleshooting

### If still redirecting to localhost:

1. **Check Site URL** in Supabase → Authentication → URL Configuration
   - Must be: `https://unpuzzled-marketplace.vercel.app`
   - NOT: `http://localhost:5173`

2. **Check Redirect URLs** include wildcards:
   - `https://unpuzzled-marketplace.vercel.app/**` ✅
   - `https://unpuzzled-marketplace.vercel.app` ❌ (missing wildcard)

3. **Clear browser cache** and try again

4. **Check Vercel environment variables:**
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

### If getting 404 error on admin sign-in:

**Error:** `Could not find a relationship between 'academies' and 'locations'` or `404 Not Found` on Supabase URL

**Solution:**
1. **Verify Redirect URLs in Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard → Your Project → **Authentication** → **URL Configuration**
   - Ensure these URLs are in "Redirect URLs":
     - `https://unpuzzled-marketplace.vercel.app/**`
     - `https://unpuzzled-marketplace.vercel.app/admin`
     - `https://unpuzzled-marketplace.vercel.app/admin/**`

2. **Verify Site URL:**
   - Must be exactly: `https://unpuzzled-marketplace.vercel.app`
   - No trailing slash

3. **Check Google OAuth Console:**
   - Go to: https://console.cloud.google.com → **APIs & Services** → **Credentials**
   - In "Authorized redirect URIs", ensure you have:
     - `https://rupjlkhrcpgrahrcowpk.supabase.co/auth/v1/callback`
     - (This is your Supabase project's OAuth callback URL)

4. **Clear browser cache and cookies** for both your app and Supabase

5. **Test in Incognito/Private window** to rule out browser cache issues

---

## Current Configuration Summary

✅ **Production URL:** `https://unpuzzled-marketplace.vercel.app`  
✅ **Supabase Redirect URLs:** Add `https://unpuzzled-marketplace.vercel.app/**`  
✅ **Supabase Site URL:** Set to `https://unpuzzled-marketplace.vercel.app`  
✅ **Google OAuth Redirect:** Add `https://unpuzzled-marketplace.vercel.app/auth/callback`  

---

## Quick Copy-Paste URLs for Supabase

**Redirect URLs:**
```
https://unpuzzled-marketplace.vercel.app/**
https://unpuzzled-marketplace.vercel.app/*
```

**Site URL:**
```
https://unpuzzled-marketplace.vercel.app
```

