# ⚠️ MOVED TO PUBLIC/IMAGES

This folder is deprecated. Logo and favicon files have been moved to:

**New Location: `/public/images/`**

## Why the move?
- Public folder files are served directly by the web server
- Better for favicon and logo files that need direct URL access
- Easier to reference in HTML and components

## Next Steps:
1. Upload your logo and favicon files to `/public/images/`
2. Follow the instructions in `/public/images/README.md`
3. Update components to use the new LogoSwitcher component

## Migration:
- Old path: `/src/assets/logo/logo.svg`
- New path: `/public/images/logo.svg`
- Component usage: Use `LogoSwitcher` from `src/components/LogoSwitcher.tsx`