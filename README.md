# HEALWITHMAHIMA — Corporate Wellness Website

A modern, optimized static website for corporate wellness programs in Gurgaon.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
Runs Vite dev server with hot module replacement on http://localhost:3000

### Production Build
```bash
npm run build
```
Generates optimized static files in `/dist` directory

### Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
mahima-editorial/
├── index.html              # Homepage
├── programs/               # Program pages (5)
├── css/
│   └── style.css          # Main styles (36KB)
├── js/
│   └── main.js            # Main JavaScript (2.4KB)
├── components/            # Reusable components
│   ├── navbar.js
│   ├── footer.js
│   └── index.js
├── assets/
│   ├── images/            # Optimized WebP images (~960KB)
│   └── videos/            # Optimized video (14MB)
├── vite.config.js         # Build configuration
└── package.json
```

---

## ✨ Features

- ✅ **Modern Build System**: Vite for instant HMR & optimized builds
- ✅ **Optimized Media**: WebP images (92% smaller), compressed video (81% smaller)
- ✅ **SEO Ready**: Open Graph, Twitter Cards, Schema.org structured data
- ✅ **Component System**: DRY navbar/footer components
- ✅ **Responsive Design**: Desktop, tablet, mobile breakpoints
- ✅ **Modern JavaScript**: ES6+, vanilla JS, no framework bloat
- ✅ **Performance**: <2s load time, optimized assets

---

## 🎨 Technologies

- **HTML5** — Semantic markup
- **CSS3** — Custom design system, responsive
- **Vanilla JavaScript** — No dependencies
- **Vite** — Build tool & dev server
- **WebP** — Next-gen image format

---

## 📊 Optimization Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Dead Code** | 87MB | 0MB | 100% removed |
| **Images** | 10.6MB PNG | 960KB WebP | 92% reduction |
| **Video** | 75MB | 14MB | 81% reduction |
| **Project Size** | 87MB+ | ~15MB | 83% reduction |
| **Load Time** | 8-12s | <2s | 75% faster |

---

## 🛠️ Development

### Adding New Pages
1. Create HTML file in root or `/programs/`
2. Add to `vite.config.js` rollupOptions.input
3. Use `<div id="navbar-placeholder"></div>` and `<div id="footer-placeholder"></div>` for components
4. Import `<script type="module" src="/js/main.js"></script>`

### Component Usage
Components auto-initialize on page load. Navbar and footer detect subpage paths automatically.

### Image Optimization
All images use `<picture>` elements with WebP + PNG fallback:
```html
<picture>
  <source srcset="assets/images/image.webp" type="image/webp">
  <img src="assets/images/image.png" alt="Description">
</picture>
```

---

## 📦 Deployment

### Static Hosting (Recommended)
Deploy `/dist` folder to:
- **Netlify**: Drop folder or connect Git
- **Vercel**: `vercel deploy`
- **GitHub Pages**: Deploy from `/dist`

### Build Command
```bash
npm run build
```

### Environment Variables
Update URLs in SEO meta tags for production:
- Open Graph URLs
- Twitter Card URLs
- Canonical URLs
- Schema.org URLs

---

## 🔧 Configuration

### Vite Config
- Multi-page support configured
- Terser minification enabled
- CSS minification enabled
- Dev server on port 3000

### Browser Support
- Modern browsers (ES6+)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📝 TODO / Future Enhancements

- [ ] Service Worker for offline support
- [ ] Contact form backend integration
- [ ] Analytics integration (Plausible/Fathom)
- [ ] A11y audit with axe DevTools
- [ ] Performance monitoring
- [ ] CMS integration (optional)

---

## 📄 License

© 2026 HEALWITHMAHIMA. All rights reserved.

---

## 🤝 Support

For issues or questions:
- WhatsApp: +91 9069982434
- Location: Gurgaon, Haryana, India
