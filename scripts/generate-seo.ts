import { generateSeo } from '../server/seo/generate.js';

try {
  const result = generateSeo();
  if (!result.siteUrl) {
    console.warn(
      '[seo] Tip: set SITE_URL in .env so canonical URLs, Open Graph URLs and sitemap.xml use your production domain.',
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
