# 🚀 Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment Setup

### Firebase Configuration
- [ ] Firebase project created
- [ ] Firestore database enabled (production mode)
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firebase Storage enabled (if using image uploads)
- [ ] Firestore security rules updated for production
- [ ] Backup enabled in Firebase Console

### Environment & Security
- [ ] `.env.local` created with all variables
- [ ] `.env` file added to `.gitignore`
- [ ] Firebase credentials are not committed to git
- [ ] All environment variables documented in `.env.example`
- [ ] WhatsApp phone number configured and tested

### Code Quality
- [ ] No `console.log()` statements in production code
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] ESLint checks pass (`npm run lint`)
- [ ] All API endpoints tested locally
- [ ] Admin authentication tested

### Testing
- [ ] Customer store loads products correctly
- [ ] Add to cart functionality works
- [ ] WhatsApp checkout link works
- [ ] Admin login/signup works
- [ ] Add product flow works end-to-end
- [ ] Edit product flow works
- [ ] Delete product works
- [ ] All pages are mobile-responsive

## Deployment to Vercel

### Pre-Deployment
- [ ] Vercel account created
- [ ] GitHub repository created and committed
- [ ] `.gitignore` includes `.env.local`

### Deploy Steps
```bash
# 1. Commit changes
git add .
git commit -m "Production ready"
git push origin main

# 2. Connect to Vercel
vercel

# 3. Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_FIREBASE_API_KEY
# - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# - NEXT_PUBLIC_FIREBASE_PROJECT_ID
# - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
# - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
# - NEXT_PUBLIC_FIREBASE_APP_ID
# - NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER

# 4. Redeploy with environment variables
vercel --prod
```

### Post-Deployment
- [ ] Visit production URL and verify store loads
- [ ] Add test product via admin
- [ ] Verify product appears on store
- [ ] Test WhatsApp checkout on mobile
- [ ] Monitor Vercel dashboard for errors
- [ ] Check Firebase console for database usage

## Deployment to Firebase Hosting

### Pre-Deployment
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

### Deploy Steps
```bash
# 1. Build Next.js app
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy

# 3. Add environment variables to Firebase:
# Use: firebase functions:config:set
```

### Post-Deployment
- [ ] Visit Firebase Hosting URL
- [ ] Verify all features work
- [ ] Check Firebase console for errors
- [ ] Monitor usage metrics

## Firestore Security Rules Deployment

### Apply Production Rules
1. Go to Firebase Console
2. Select project
3. Firestore Database → Rules
4. Paste rules from [FIRESTORE_RULES.md](FIRESTORE_RULES.md)
5. Review and Publish

```javascript
// Minimum production rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Verify Rules
- [ ] Public can read products
- [ ] Only authenticated users can write
- [ ] Test with Firestore Rules Simulator

## Performance Optimization

### Frontend
- [ ] Enable Next.js caching headers
- [ ] Images optimized and compressed
- [ ] Lazy loading enabled for images
- [ ] CSS purged (Tailwind production mode)

### Backend
- [ ] Firestore indexes created for queries
- [ ] API response times < 500ms
- [ ] Error handling implemented
- [ ] Rate limiting considered

### Monitoring
- [ ] Firebase Console monitoring enabled
- [ ] Vercel Analytics enabled
- [ ] Error tracking setup (Sentry optional)
- [ ] Performance monitoring enabled

## Post-Launch

### Monitoring & Maintenance
- [ ] Check server logs daily for first week
- [ ] Monitor Firestore usage and costs
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Review user analytics

### Backups & Recovery
- [ ] Firestore daily backups enabled
- [ ] Database export schedule created
- [ ] Disaster recovery plan documented
- [ ] Emergency contact procedures ready

### Updates & Maintenance
- [ ] Dependency update schedule planned
- [ ] Security updates monitored
- [ ] Firebase pricing monitored
- [ ] Vercel deployment log reviewed monthly

## Documentation

- [ ] Production credentials documented (securely)
- [ ] Deployment procedure documented
- [ ] Admin procedures documented
- [ ] Troubleshooting guide created
- [ ] Team trained on operations

## Cost Estimation

### Firebase Costs (Monthly)
- Firestore reads: ~0-25 reads/day = Free tier
- Firestore writes: ~0-10 writes/day = Free tier
- Authentication: Free tier includes unlimited users
- Hosting: Free tier sufficient for 5GB/day bandwidth

### Vercel Costs (Monthly)
- Pro plan: $20/month (or use free tier)
- Bandwidth: Included in pro
- Edge functions: Pay-as-you-go

### WhatsApp Costs
- WhatsApp Business account: Free (requires business verification)
- SMS messages: Pay-as-you-go (optional for marketing)

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (Vercel)
```bash
vercel rollback
```

### Manual Rollback
```bash
git revert <commit>
git push
vercel --prod
```

### Firebase Rollback
1. Revert database state from backup
2. Redeploy functions if needed
3. Check Firestore rules

---

## Final Sign-Off

Before going live:

- [ ] All team members aware of deployment
- [ ] Support team trained
- [ ] Customer communication prepared
- [ ] Monitoring dashboards set up
- [ ] Emergency procedures documented
- [ ] Go/No-go decision made

**Deployed By**: ________________  
**Date**: ________________  
**Notes**: ________________________________________________

---

**Good luck with your launch! 💎**
