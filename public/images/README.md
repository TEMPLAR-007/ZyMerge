# ZyMrge Images

This folder contains all the logo and favicon files for ZyMrge.

## Files to Upload:

### Logo Files:
- `logo.svg` - Main logo (SVG format recommended for scalability)
- `logo-dark.svg` - Dark mode version of the logo (optional)
- `logo.png` - PNG version of the logo (fallback)
- `logo-192x192.png` - Logo for PWA manifest (192x192px)
- `logo-512x512.png` - Logo for PWA manifest (512x512px)

### Favicon Files:
- `favicon.ico` - Main favicon (32x32px, ICO format)
- `favicon-16x16.png` - Small favicon (16x16px)
- `favicon-32x32.png` - Standard favicon (32x32px)
- `apple-touch-icon.png` - Apple touch icon (180x180px)

## Usage:

The logo files are referenced in:
- `src/components/Logo.tsx` - Main logo component
- `index.html` - Favicon references

## File Formats:

### Logo:
- **SVG**: Best for scalability and small file size
- **PNG**: Good fallback, use transparent background
- **Recommended sizes**: 32x32, 64x64, 128x128, 256x256

### Favicon:
- **ICO**: Traditional favicon format
- **PNG**: Modern alternative, multiple sizes
- **Apple Touch Icon**: 180x180px PNG for iOS

## Current Status:
- ✅ Folder structure created
- ⏳ Placeholder files added
- ❌ Custom logo files needed
- ❌ Custom favicon files needed

## Next Steps:
1. Replace placeholder files with your actual logo and favicon
2. Update the Logo component if needed
3. Test the logo display across different screen sizes
4. Verify favicon appears correctly in browser tabs