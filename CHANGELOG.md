# Changelog

All notable changes to ZyMerge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-30

### 🚀 Major Feature Update

#### Added
- **Professional Image Editor**: Advanced cropping tool with presets (1:1, 3:4, 16:9, center) and custom sizing options
- **Enhanced Premium Tiers**: Improved rate limiting with Free (100/hr), Premium (500/hr), and Pro (1000/hr) plans
- **Multi-Source Search Enhancement**: Simultaneous search across Unsplash, Pexels, and Pixabay with smart result caching
- **Contact & Upgrade System**: Streamlined upgrade requests with automated email notifications and admin management
- **Route Persistence**: URL-based navigation that persists across page reloads and browser sessions
- **Compact Search Bar**: Floating search bar that appears when scrolling for easy access from anywhere
- **Custom Scrollbars**: Enhanced UI with custom-styled scrollbars throughout the application
- **Enhanced UI/UX**: Improved responsive design, smooth animations, and better user experience

#### Improved
- **Search Performance**: Implemented search result caching to reduce API calls by 70-80%
- **Rate Limiting**: Rolling window rate limiting with clear usage indicators and reset times
- **Error Handling**: Better error messages and fallback mechanisms
- **Code Quality**: Removed console logs and debugging information for production readiness
- **TypeScript**: Enhanced type safety and error handling throughout the application

#### Technical Enhancements
- **Admin Functions**: Comprehensive user subscription management and bulk operations
- **Email System**: Automated email notifications for upgrade requests using Resend
- **Database Schema**: New tables for contact requests, user search windows, and enhanced caching
- **API Optimization**: Improved API call efficiency and error handling
- **Production Readiness**: Cleaned up development artifacts and optimized for production deployment

## [1.0.0] - 2025-01-30

### 🎉 Initial Release

#### Added
- **Multi-Source Image Search**: Search across Unsplash, Pexels, Pixabay, and NASA simultaneously
- **Smart Favorites System**: Save and organize favorite images with one-click
- **Google OAuth Authentication**: Secure user authentication and account management
- **NASA Space Explorer**: Dedicated section for space imagery and astronomical data
- **Responsive Design**: Fully responsive interface for all device sizes
- **Real-time Search**: Instant search results with optimized performance
- **Cloud Storage**: Secure cloud-based favorites storage using Convex
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS
- **Pricing Plans**: Free, Premium, and Pro tiers with different search limits
- **Contact System**: Automated contact forms with email notifications
- **Toast Notifications**: User-friendly feedback system

#### Technical Features
- React 18 with TypeScript for type safety
- Convex backend for real-time data and serverless functions
- Tailwind CSS for responsive styling
- Radix UI components for accessibility
- Vite for fast development and building
- ESLint and Prettier for code quality

#### API Integrations
- Unsplash API for high-quality photography
- Pexels API for stock photos
- Pixabay API for diverse image collection
- NASA API for space imagery and data
- Google OAuth for authentication
- Resend API for email notifications

### 🔧 Infrastructure
- Convex database schema for users, favorites, and subscriptions
- Environment-based configuration for different deployment stages
- Automated email system for user communications
- Rate limiting and usage tracking for API calls

---

## Future Releases

### Planned Features
- [ ] Bulk image download functionality
- [ ] Advanced search filters (color, orientation, size)
- [ ] Image editing tools integration
- [ ] Social sharing capabilities
- [ ] API access for Pro users
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Image collections and albums
- [ ] Export functionality (PDF, ZIP)
- [ ] AI-powered image recommendations

### Under Consideration
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Slack/Discord integrations
- [ ] Team collaboration features
- [ ] Custom image sources
- [ ] Advanced analytics dashboard

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to ZyMerge.

## Support

- 📧 Email: arefin.khan8364@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/TEMPLAR-007/ZyMerge/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/TEMPLAR-007/ZyMerge/discussions)