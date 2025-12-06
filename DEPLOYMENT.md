# Free Hosting Guide - Youth Camp Registration System

This guide will help you deploy your Youth Camp Registration System for free using **Vercel** (recommended) or other free hosting options.

## Option 1: Vercel (Recommended - Best for Next.js)

Vercel is created by the makers of Next.js and offers the best free hosting for Next.js applications.

### Prerequisites
- A GitHub account (free)
- Your code pushed to a GitHub repository

### Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., `youth-camp-registration`)
   - Make it public or private (both work)
   - Don't initialize with README (you already have files)

2. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/youth-camp-registration.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub account

2. **Import Your Project**:
   - Click "Add New Project"
   - Select your `youth-camp-registration` repository
   - Click "Import"

3. **Configure Environment Variables**:
   - In the "Environment Variables" section, add your Firebase configuration:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```
   - These are the same values from your `.env.local` file

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Step 3: Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain (e.g., `youthcamp.yourdomain.com`)
3. Follow the DNS configuration instructions

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domains
- ✅ Automatic deployments from GitHub
- ✅ 100GB bandwidth per month
- ✅ Serverless functions

---

## Option 2: Netlify (Alternative)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up with GitHub
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variables (same Firebase config as above)
6. Click "Deploy site"

---

## Option 3: Firebase Hosting (If you want everything on Firebase)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Hosting
```bash
firebase init hosting
```
- Select your Firebase project
- Set public directory to: `.next`
- Configure as single-page app: No
- Set up automatic builds: Yes

### Step 4: Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

**Note**: Firebase Hosting is for static sites. For Next.js, you'll need to use `next export` or use Vercel/Netlify which support Next.js server-side features better.

---

## Option 4: Railway (Alternative)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Railway will automatically detect Next.js and deploy

---

## Recommended: Vercel

**Why Vercel is best for this project:**
- ✅ Made by Next.js creators
- ✅ Perfect Next.js support
- ✅ Zero configuration needed
- ✅ Automatic deployments
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Easy environment variable management

---

## Post-Deployment Checklist

After deploying, make sure to:

1. ✅ **Test the live site**: Visit your deployed URL
2. ✅ **Verify Firebase connection**: Register a test participant
3. ✅ **Check environment variables**: Ensure all Firebase config is set
4. ✅ **Test offline functionality**: Disable network and test
5. ✅ **Update Firestore Security Rules**: Make sure your rules allow public read/write (or set up proper authentication)

### Firestore Security Rules (for testing - adjust as needed)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Allow all for now - adjust for production
    }
  }
}
```

**⚠️ Important**: The above rules allow anyone to read/write. For production, implement proper authentication or restrict access.

---

## Troubleshooting

### Build Errors
- Check that all environment variables are set
- Ensure `next.config.mjs` is correct
- Check build logs in Vercel dashboard

### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project settings
- Ensure Firestore is enabled

### Deployment Not Updating
- Check GitHub repository for latest commits
- Vercel auto-deploys on push to main branch
- Manually trigger redeploy in Vercel dashboard if needed

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Firebase Hosting: https://firebase.google.com/docs/hosting

---

**Happy Deploying! 🚀**

