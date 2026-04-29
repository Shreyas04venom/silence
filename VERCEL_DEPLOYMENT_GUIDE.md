# Vercel Deployment Guide - Silent Classrooms

## ✅ Issues Fixed

1. ✅ Removed `pnpm-lock.yaml` (was causing conflicts)
2. ✅ Created `package-lock.json` with npm
3. ✅ Added `.npmrc` for legacy peer deps
4. ✅ Created `vercel.json` with proper config

## 🚀 Deploy to Vercel (5 Steps)

### Step 1: Commit Your Changes

```bash
git add .
git commit -m "Fix: Update dependencies for Vercel deployment"
git push
```

### Step 2: Go to Vercel

1. Go to: https://vercel.com/
2. Click "Add New Project"
3. Import your Git repository

### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

**Required Variables:**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_e25hvxf
NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN=template_mgzb2bl
NEXT_PUBLIC_EMAILJS_TEMPLATE_USER=template_4rz3bmg

GEMINI_API_KEY=your_gemini_api_keys

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

YOUTUBE_API_KEY=your_youtube_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
```

**How to add them:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable one by one
3. Copy values from your `.env.local` file

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. ✅ Your app will be live!

### Step 5: Test Your Deployment

1. Visit your Vercel URL (e.g., `your-app.vercel.app`)
2. Test the contact form
3. Check all features work

## 🔧 Build Configuration

Vercel will automatically detect:
- Framework: Next.js
- Build Command: `npm run build`
- Install Command: `npm install --legacy-peer-deps`
- Output Directory: `.next`

## ⚠️ Common Issues & Solutions

### Issue 1: Build Fails with Dependency Errors

**Solution**: Make sure `.npmrc` file is committed:
```bash
git add .npmrc
git commit -m "Add npmrc for legacy peer deps"
git push
```

### Issue 2: Environment Variables Not Working

**Solution**: 
1. Check all variables are added in Vercel dashboard
2. Make sure variable names match exactly (case-sensitive)
3. Redeploy after adding variables

### Issue 3: Firebase/EmailJS Not Working

**Solution**:
1. Verify all `NEXT_PUBLIC_*` variables are set
2. Check Firebase/EmailJS keys are correct
3. Ensure no extra spaces in variable values

### Issue 4: Build Timeout

**Solution**:
1. Vercel free tier has 45-second build limit
2. If build times out, upgrade to Pro plan
3. Or optimize dependencies

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All changes committed and pushed to Git
- [ ] `package-lock.json` exists (not `pnpm-lock.yaml`)
- [ ] `.npmrc` file exists
- [ ] `vercel.json` file exists
- [ ] `.env.local` values ready to copy to Vercel
- [ ] EmailJS public key added to `.env.local`
- [ ] All features tested locally

## 🎯 Deployment Commands

If deploying via Vercel CLI:

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Add all secrets in Vercel dashboard** - Not in code
3. **Use environment variables** - Never hardcode keys
4. **Rotate keys regularly** - Especially API keys

## 📊 After Deployment

### Monitor Your App

1. Vercel Dashboard → Your Project → Analytics
2. Check for errors in Logs
3. Monitor performance

### Set Up Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Enable Analytics (Optional)

1. Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics
3. Already integrated in your app!

## 🎉 Success!

Your Silent Classrooms app should now be live on Vercel!

**Test these features**:
- ✅ Homepage loads
- ✅ Teacher/Student login works
- ✅ Contact form sends emails
- ✅ Lessons can be created
- ✅ Firebase authentication works
- ✅ All pages are accessible

## 🆘 Need Help?

If deployment fails:

1. Check Vercel build logs for errors
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check this guide: https://vercel.com/docs/deployments/troubleshoot

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project Issues: Check console logs

---

**Your app is ready to deploy!** 🚀

Just commit, push, and deploy on Vercel!
