# Changelog

## [Latest] - 2024-12-19

### ✨ New Features
- **Enhanced Rate Limiting System**
  - Implemented rolling 1-hour windows for fair rate limiting
  - Increased free tier limits from 30 to 100 searches per hour
  - Added Premium tier with 500 searches per hour
  - Clear visual indicators with countdown timers and progress bars
  - Clock icon replaces emoji for better visibility

- **Route Persistence**
  - URLs now save current page state (e.g., `?view=search`)
  - Page reloads maintain current view instead of going to home
  - Browser back/forward buttons work properly
  - Shareable direct links to specific pages

- **Compact Search Bar**
  - Floating search bar appears when scrolling down
  - Positioned under navbar in center with pill design
  - Rate limit integration (disabled when limit reached)
  - Enter key support for quick searching
  - Go to top button included

### 🎨 UI/UX Improvements
- **Enhanced Navbar Design**
  - Reduced opacity for better blur effects
  - Removed border for cleaner appearance
  - More modern glass-morphism effect
  - Better integration with page content

- **Improved Rate Limit Display**
  - Clear usage indicators (X/Y searches)
  - Visual progress bars with color coding
  - Countdown timers when limit reached
  - Premium upgrade prompts
  - Consistent across all search interfaces

- **Better Visual Feedback**
  - Clock icons instead of emojis
  - Animated "New" badge in header
  - Updates section on landing page
  - Changelog button with notification dot

### 🔧 Technical Improvements
- **URL-Based Routing**
  - Implemented with URLSearchParams
  - Popstate event handling for browser navigation
  - Clean URL structure with view parameters
  - Proper history management

- **Rate Limit Architecture**
  - Rolling window implementation
  - User-specific search tracking
  - Tiered limit system
  - Automatic cleanup of old data

### 📱 Responsive Design
- **Mobile Optimizations**
  - Compact search bar works on all screen sizes
  - Responsive changelog cards
  - Better touch targets
  - Improved mobile navigation

### 🚀 Performance
- **Optimized Loading**
  - Faster route transitions (300ms vs 800ms)
  - Better state management
  - Reduced unnecessary re-renders
  - Improved caching system

### 📝 Update Notification
- **Modal-Based Changelog**
  - Notification bell icon in header with animated dot
  - Interactive modal with matte dark background for better aesthetics
  - Clean list format for most updates (less graphical, more readable)
  - Enhanced "Explore the Universe" card with modern animations and effects
  - Clickable "Explore the Universe" card navigates to NASA route
  - Auto-shows on first visit (2-second delay)
  - Persistent storage prevents repeated shows
  - Organized presentation with clear hierarchy

---

## Previous Updates
- Initial release with basic image search functionality
- Multi-source image integration (Unsplash, Pexels, Pixabay)
- Favorites system with authentication
- NASA Explorer integration
- Basic filtering and pagination

---

*For detailed technical information, see the commit history and code comments.*