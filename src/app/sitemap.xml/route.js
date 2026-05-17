export async function GET() {
  const baseUrl = 'https://isthiscarsafe.co.uk';

  // Popular profile paths to index for SEO authority
  const staticCars = [
    'ford/focus',
    'ford/fiesta',
    'volkswagen/golf',
    'volkswagen/polo',
    'bmw/3-series',
    'vauxhall/corsa',
    'vauxhall/astra',
    'nissan/qashqai',
    'toyota/yaris'
  ];

  const staticAdvisories = [
    'rear-brake-disc-corrosion',
    'suspension-arm-pin-bush-worn',
    'tyre-worn-close-to-legal-limit',
    'coil-spring-corroded',
    'brake-pipe-corroded'
  ];

  const pages = [
    '',
    'about',
    'recalls',
    'dealer',
    'dealer/pricing',
    ...staticCars.map(c => `cars/${c}`),
    ...staticAdvisories.map(a => `advisories/${a}`)
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${baseUrl}/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}
