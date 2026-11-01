import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import Handlebars from 'handlebars';
import { resolve } from 'path';
import { existsSync, readFileSync, readdirSync } from 'fs';

const root = __dirname;
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const sitePath = 'content/site.json';
const homePath = 'content/home.json';
const site = readJson(sitePath);
const home = readJson(homePath);

const siteOrigin = 'https://healwithmahima.com';
const normalizePublicUrl = (value) => {
  try {
    const url = new URL(value, siteOrigin);
    return url.protocol === 'https:' ? url.href : new URL(`/${String(value).replace(/^\/*/, '')}`, siteOrigin).href;
  } catch {
    return `${siteOrigin}/`;
  }
};
const safeJsonLd = (value) => {
  if (Array.isArray(value)) return value.map(safeJsonLd);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key, ['image', 'logo'].includes(key.toLowerCase()) && typeof item === 'string' ? normalizePublicUrl(item) : safeJsonLd(item),
  ]));
};
const homeJsonLd = {
  business: {
    '@context': 'https://schema.org',
    '@type': ['HealthAndBeautyBusiness', 'LocalBusiness'],
    name: 'HEALWITHMAHIMA',
    description: 'Corporate wellness programs featuring sound healing, breathwork, yoga, mindset workshops and nature retreats.',
    url: 'https://healwithmahima.com',
    logo: 'https://healwithmahima.com/web-app-manifest-512x512.png',
    image: normalizePublicUrl(readJson(homePath).seo.ogImage),
    telephone: site.phone.href,
    email: site.email,
    sameAs: ['https://www.instagram.com/healwithmahima'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    address: { '@type': 'PostalAddress', addressLocality: 'Gurgaon', addressRegion: 'Haryana', addressCountry: 'IN' },
    geo: { '@type': 'GeoCoordinates', latitude: '28.4595', longitude: '77.0266' },
    areaServed: [{ '@type': 'City', name: 'Gurgaon' }, { '@type': 'Place', name: 'Delhi NCR' }],
    priceRange: '₹₹',
    founder: { '@type': 'Person', name: 'Mahima' },
  },
  organization: {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'HEALWITHMAHIMA',
    url: 'https://healwithmahima.com', logo: 'https://healwithmahima.com/web-app-manifest-512x512.png',
    founder: { '@type': 'Person', name: 'Mahima', jobTitle: 'Corporate Wellness Facilitator' },
    contactPoint: { '@type': 'ContactPoint', telephone: site.phone.href, contactType: 'sales', areaServed: 'IN' },
    sameAs: ['https://www.instagram.com/healwithmahima'],
  },
  website: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'HEALWITHMAHIMA', url: 'https://healwithmahima.com' },
  faq: {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: home.faq.items.map(({ question, answer }) => ({
      '@type': 'Question', name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  },
};

function imageDimensions(publicPath, sourceMode) {
  if (sourceMode === 'small' && publicPath.endsWith('-1080.webp')) {
    const smaller = publicPath.replace(/-1080\.webp$/, '-800.webp');
    if (existsSync(resolve(root, `public${smaller}`))) publicPath = smaller;
  }
  const filePath = resolve(root, `public${publicPath}`);
  if (!existsSync(filePath)) return null;
  const data = readFileSync(filePath);
  if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = data.toString('ascii', 12, 16);
  if (chunk === 'VP8X' && data.length >= 30) return { width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3) };
  if (chunk === 'VP8L' && data.length >= 25) {
    const bits = data.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8 ' && data.length >= 30) return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff };
  return null;
}
const encodedAssetPath = (path) => String(path).split('/').map((part) => {
  try { return encodeURIComponent(decodeURIComponent(part)); } catch { return encodeURIComponent(part); }
}).join('/');

function programStructuredData(program) {
  return {
    ...program.jsonLd,
    breadcrumb: {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteOrigin}/` },
        {
          '@type': 'ListItem', position: 2,
          name: program.slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '),
          item: normalizePublicUrl(program.seo.canonical),
        },
      ],
    },
    faq: {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: program.faq.items.map(({ question, answer }) => ({
        '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  };
}

function responsiveImage(path, sourceMode) {
  const encoded = Handlebars.escapeExpression(encodedAssetPath(path));
  if (path.endsWith('-1080.webp')) {
    const smaller = path.replace(/-1080\.webp$/, '-800.webp');
    if (existsSync(resolve(root, `public${smaller}`))) {
      const src = sourceMode === 'small' ? Handlebars.escapeExpression(encodedAssetPath(smaller)) : encoded;
      return new Handlebars.SafeString(`src="${src}" srcset="${Handlebars.escapeExpression(encodedAssetPath(smaller))} 800w, ${encoded} 1080w"`);
    }
  }
  return new Handlebars.SafeString(`src="${encoded}"`);
}

const programPages = Object.fromEntries(
  readdirSync(resolve(root, 'programs'))
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace(/\.html$/, ''), resolve(root, 'programs', file)]),
);

export default defineConfig({
  root: '.',
  plugins: [
    {
      name: 'content-json-reload',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(/srcset="([^"]*)"/gi, (attribute, value) =>
            `srcset="${value.replace(/%25([\da-f]{2})/gi, '%$1')}"`,
          );
        },
      },
      configureServer(server) {
        server.watcher.add(resolve(root, 'content/**/*.json'));
        server.watcher.on('change', (file) => {
          if (file.includes(`${resolve(root, 'content')}/`) && file.endsWith('.json')) server.ws.send({ type: 'full-reload' });
        });
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin/' || req.url === '/admin') {
            res.statusCode = 302;
            res.setHeader('Location', '/admin/index.html');
            res.end();
            return;
          }
          next();
        });
      },
    },
    handlebars({
      partialDirectory: resolve(root, 'partials'),
      context(pagePath) {
        const site = readJson(sitePath);
        const home = readJson(homePath);
        if (pagePath === '/index.html') {
          return {
            site, home,
            homeJsonLd: {
              ...homeJsonLd,
              business: {
                ...homeJsonLd.business,
                image: normalizePublicUrl(home.seo.ogImage),
                telephone: site.phone.href,
                email: site.email,
              },
              organization: {
                ...homeJsonLd.organization,
                contactPoint: { ...homeJsonLd.organization.contactPoint, telephone: site.phone.href },
              },
              faq: { ...homeJsonLd.faq, mainEntity: home.faq.items.map(({ question, answer }) => ({
                '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
              })) },
            },
          };
        }
        const slug = pagePath.split('/').pop().replace(/\.html$/, '');
        const program = readJson(`content/programs/${slug}.json`);
        return { site, program: { ...program, jsonLd: safeJsonLd(programStructuredData(program)) } };
      },
      helpers: {
        jsonLd(value) {
          const json = JSON.stringify(safeJsonLd(value), null, 2)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029');
          return new Handlebars.SafeString(json);
        },
        responsiveImage,
        delayClass(index) { return `delay-${Number(index) + 1}`; },
        imageDimensions(path, sourceMode) {
          const dimensions = imageDimensions(path, sourceMode);
          return dimensions ? new Handlebars.SafeString(`width="${dimensions.width}" height="${dimensions.height}"`) : '';
        },
        absoluteUrl(value) { return normalizePublicUrl(value); },
        headingHtml(value) {
          const tokens = String(value).split(/(<br\s*\/?\s*>|&(?:#\d+|#x[\da-f]+|[a-z][\da-z]+);)/gi);
          return new Handlebars.SafeString(tokens.map((token) =>
            /^<br\s*\/?\s*>$/i.test(token) ? '<br>' : /^&(?:#\d+|#x[\da-f]+|[a-z][\da-z]+);$/i.test(token) ? token : Handlebars.escapeExpression(token),
          ).join(''));
        },
        encodeURIComponent(value) { return encodeURIComponent(value); },
        whatsappHref(number, message) { return `https://wa.me/${number}?text=${encodeURIComponent(message)}`; },
      },
      compileOptions: { preventIndent: true },
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: { input: { main: resolve(root, 'index.html'), ...programPages } },
    minify: 'terser',
    cssMinify: true,
  },
  server: {
    port: 3000,
    open: true,
    watch: { ignored: ['!**/content/**'] },
  },
});
