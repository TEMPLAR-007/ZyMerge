# 🚀 ZyMerge

[![GitHub stars](https://img.shields.io/github/stars/TEMPLAR-007/ZyMerge?style=social)](https://github.com/TEMPLAR-007/ZyMerge/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/TEMPLAR-007/ZyMerge?style=social)](https://github.com/TEMPLAR-007/ZyMerge/network/members)
[![GitHub issues](https://img.shields.io/github/issues/TEMPLAR-007/ZyMerge)](https://github.com/TEMPLAR-007/ZyMerge/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Where creators connect and content flows** - A powerful multi-source image search platform that aggregates high-quality images from Unsplash, Pexels, Pixabay, and NASA in one unified interface.

## ✨ Features

- 🔍 **Multi-Source Search** - Search across Unsplash, Pexels, Pixabay, and NASA simultaneously
- ❤️ **Smart Favorites** - Save and organize your favorite images with one click
- 🚀 **Lightning Fast** - Optimized search engine with blazing-fast results
- 🌌 **NASA Space Explorer** - Discover stunning space imagery and astronomical data
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - Google OAuth integration for user accounts
- 💾 **Cloud Storage** - Your favorites are saved securely in the cloud
- 🎨 **Modern UI** - Clean, intuitive interface built with React and Tailwind CSS

## 🎯 Live Demo

**[Try ZyMerge Live](https://zymerge.com)** ← Click to see it in action!

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Convex (Real-time database and serverless functions)
- **Authentication**: Google OAuth
- **APIs**: Unsplash, Pexels, Pixabay, NASA
- **UI Components**: Radix UI, Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Convex account (free)
- API keys for image services (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TEMPLAR-007/ZyMerge.git
   cd ZyMerge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys (see Environment Variables section)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
VITE_CONVEX_URL=your_convex_deployment_url

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Image API Keys
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key
PIXABAY_API_KEY=your_pixabay_api_key
NASA_API_KEY=your_nasa_api_key
```

### Getting API Keys

- **Unsplash**: [Create an app](https://unsplash.com/developers)
- **Pexels**: [Get API key](https://www.pexels.com/api/)
- **Pixabay**: [Register for API](https://pixabay.com/api/docs/)
- **NASA**: [Get API key](https://api.nasa.gov/)
- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/)

## 📁 Project Structure

```
ZyMerge/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── ImageSearch.tsx # Main search interface
│   │   ├── FavoritesView.tsx # Favorites management
│   │   └── ...
│   ├── services/           # API service functions
│   ├── contexts/           # React contexts
│   └── styles/            # CSS and styling
├── convex/                # Backend functions and schema
├── public/               # Static assets
└── ...
```

## 🎨 Screenshots

### Search Interface
*Multi-source image search with real-time results*

### Favorites Dashboard
*Organize and manage your saved images*

### NASA Space Explorer
*Discover stunning space imagery*

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com/) for beautiful photography
- [Pexels](https://pexels.com/) for high-quality stock photos
- [Pixabay](https://pixabay.com/) for diverse image collection
- [NASA](https://api.nasa.gov/) for amazing space imagery
- [Convex](https://convex.dev/) for the backend infrastructure

## 👨‍💻 Author

**Arefin Khan**
- LinkedIn: [arefin-khan-441259241](https://www.linkedin.com/in/arefin-khan-441259241/)
- Email: arefin.khan8364@gmail.com
- GitHub: [@TEMPLAR-007](https://github.com/TEMPLAR-007)

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

<div align="center">
  <strong>Built with ❤️ for creators worldwide</strong>
</div>