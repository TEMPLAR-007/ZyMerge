# ZyMrge

Where creators connect and content flows. Your ultimate destination for discovering and collecting stunning images from the web's best sources.

## Features

- **Multi-Source Search**: Search across Unsplash, Pexels, and Pixabay simultaneously
- **Smart Favorites**: Save and organize your favorite images with secure cloud storage
- **Image Editing**: Crop, resize, and download images in various formats
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Authentication**: Secure user accounts with favorites sync

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and serverless functions)
- **Authentication**: Convex Auth
- **UI Components**: Shadcn/ui
- **Build Tool**: Vite

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development server: `npm run dev`

## Custom Logo Setup

To add your custom logo and favicon:

1. Add your logo files to `src/assets/logo/`:
   - `logo.svg` - Main logo
   - `favicon.ico` - Browser favicon
   - `favicon-16x16.png` - 16x16 favicon
   - `favicon-32x32.png` - 32x32 favicon
   - `apple-touch-icon.png` - Apple touch icon

2. Update the `CustomLogo` component in `src/components/Logo.tsx`
3. Replace the placeholder SVG with your custom logo

## Deployment

The app is configured for deployment on Vercel with Convex backend.

## License

All rights reserved © 2025 ZyMrge