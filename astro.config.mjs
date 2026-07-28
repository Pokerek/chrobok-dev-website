import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Required before a canonical link or an absolute og:url / og:image can be built.
  site: 'https://www.chrobok.dev',
  integrations: [tailwind({ applyBaseStyles: false })],
  // Assets are committed pre-optimized, so no transformation is needed — passthrough
  // keeps <Image>'s intrinsic width/height (which is what protects CLS) without
  // pulling in sharp.
  image: { service: passthroughImageService() },
});
