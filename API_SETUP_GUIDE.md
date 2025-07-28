# Image API Setup Guide

ZyMerge now supports **6 premium image sources**! Here's how to set up all the API keys:

## 🎯 Current Image Sources

1. **Unsplash** - High-quality stock photos
2. **Pexels** - Free stock photos and videos
3. **Pixabay** - Free images, illustrations, and vectors
4. **Giphy** - GIFs and animated content
5. **Flickr** - Community photography
6. **FreeImages** - Professional stock photos

## 🔑 API Key Setup

### 1. **Giphy API Key** (Free)
- **Website**: https://developers.giphy.com/
- **Steps**:
  1. Sign up for a free account
  2. Create a new app
  3. Get your API key
- **Rate Limit**: 42 requests per hour (free tier)
- **Cost**: Free

### 2. **Flickr API Key** (Free)
- **Website**: https://www.flickr.com/services/apps/create/
- **Steps**:
  1. Sign in with Yahoo/Flickr account
  2. Create a new app
  3. Get your API key and secret
- **Rate Limit**: 3600 requests per hour
- **Cost**: Free

### 3. **FreeImages API Key** (Free with registration)
- **Website**: https://www.freeimages.com/developers
- **Steps**:
  1. Sign up for a free account
  2. Apply for API access
  3. Get your API key
- **Rate Limit**: Varies by plan
- **Cost**: Free tier available

## 🛠️ Environment Variables

Add these to your `.env.local` file:

```bash
# Existing APIs
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
PIXABAY_API_KEY=your_pixabay_key

# New APIs
GIPHY_API_KEY=your_giphy_key
FLICKR_API_KEY=your_flickr_key
FREEIMAGES_API_KEY=your_freeimages_key
```

## 🚀 Convex Deployment

After adding the environment variables locally, deploy to Convex:

```bash
npx convex deploy
```

## 📊 API Comparison

| Source | Content Type | Rate Limit | Cost | Quality |
|--------|-------------|------------|------|---------|
| Unsplash | Photos | 50/hour | Free | ⭐⭐⭐⭐⭐ |
| Pexels | Photos | 200/hour | Free | ⭐⭐⭐⭐⭐ |
| Pixabay | Photos/Illustrations | 5000/day | Free | ⭐⭐⭐⭐ |
| Giphy | GIFs | 42/hour | Free | ⭐⭐⭐⭐ |
| Flickr | Photos | 3600/hour | Free | ⭐⭐⭐⭐ |
| FreeImages | Photos | Varies | Free tier | ⭐⭐⭐⭐ |

## 🎨 Color Coding

Each source has a unique color in the UI:
- 🟢 **Unsplash** - Green
- 🔵 **Pexels** - Blue
- 🟣 **Pixabay** - Purple
- 🟣 **Giphy** - Pink
- 🟡 **Flickr** - Yellow
- 🟠 **FreeImages** - Orange

## 💡 Benefits of Multiple Sources

1. **More Variety**: Different styles and content types
2. **Better Coverage**: More results for any search
3. **Redundancy**: If one API is down, others still work
4. **Specialized Content**: GIFs from Giphy, community photos from Flickr
5. **Higher Quality**: Access to premium stock photos

## 🔧 Troubleshooting

### API Key Issues
- Ensure all keys are correctly copied
- Check if keys have proper permissions
- Verify rate limits aren't exceeded

### Missing Images
- Some APIs may return different data structures
- Check browser console for API errors
- Verify environment variables are set

### Performance
- Caching reduces API calls by 70-80%
- Rate limiting prevents abuse
- Pagination optimizes loading

## 🚀 Next Steps

1. **Get API Keys**: Sign up for the new services
2. **Add Environment Variables**: Update your `.env.local`
3. **Deploy**: Run `npx convex deploy`
4. **Test**: Search for different types of content
5. **Monitor**: Check Convex dashboard for API usage

## 💰 Monetization Opportunities

With 6 sources, you can:
- **Premium Tiers**: Offer unlimited searches
- **Source Filtering**: Let users choose specific sources
- **Affiliate Links**: Earn from image downloads
- **API Reselling**: Offer your aggregated API

---

**Need help?** Check the individual API documentation or contact support.