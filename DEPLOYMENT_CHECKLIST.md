# Media Hub Deployment Checklist

## ✅ Pre-Deployment Setup

### Convex Backend
- [x] Convex functions deployed to production (`npx convex deploy`)
- [x] Auth configuration set with production domain (`https://media-hub-dev.vercel.app`)
- [x] Environment variables set in Convex production:
  - [x] `UNSPLASH_ACCESS_KEY`
  - [x] `PEXELS_API_KEY`
  - [x] `PIXABAY_API_KEY`

### Frontend Configuration
- [x] Production environment file created (`.env.production`)
- [x] Vercel configuration file (`vercel.json`) properly configured
- [x] Build command tested locally (`npm run build`)

## 🔧 Vercel Environment Variables

Make sure these are set in your Vercel dashboard:

```
VITE_CONVEX_URL=https://calm-dogfish-935.convex.cloud
```

## 🚀 Deployment Steps

1. **Connect to Vercel** (if not already done):
   - Connect your GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. **Set Environment Variables in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_CONVEX_URL=https://calm-dogfish-935.convex.cloud`

3. **Deploy**:
   - Push changes to GitHub
   - Vercel will automatically deploy

## 🧪 Post-Deployment Testing

### Authentication Testing
- [ ] User registration works
- [ ] User login works
- [ ] Sign-in modal closes automatically after successful authentication
- [ ] Authentication persists across page refreshes

### Core Functionality Testing
- [ ] Image search works (Unsplash, Pexels, Pixabay)
- [ ] Adding images to favorites works
- [ ] Removing images from favorites works
- [ ] Favorites view displays correctly
- [ ] Image modal displays correctly

### Error Handling
- [ ] No authentication errors in console
- [ ] No CORS errors
- [ ] No environment variable errors

## 🔍 Monitoring

### Convex Dashboard
- Monitor function calls and errors
- Check authentication logs
- Verify database operations

### Vercel Analytics
- Monitor page performance
- Check for build errors
- Review deployment logs

## 🐛 Common Issues & Solutions

### Authentication Errors
- **Issue**: `[CONVEX A(auth:signIn)] Server Error`
- **Solution**: Verify auth config domain matches Vercel URL

### Environment Variable Issues
- **Issue**: API calls failing
- **Solution**: Check `VITE_CONVEX_URL` is set correctly in Vercel

### Build Errors
- **Issue**: Build fails on Vercel
- **Solution**: Test build locally first with `npm run build`

## 📞 Support

If issues persist:
1. Check Convex dashboard logs
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Test authentication flow step by step

---

**Current Status**: ✅ Ready for deployment
**Production URL**: https://media-hub-dev.vercel.app
**Convex Production**: https://calm-dogfish-935.convex.cloud