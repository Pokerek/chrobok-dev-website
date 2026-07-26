import { defineConfig, passthroughImageService } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  // Assets are committed pre-optimized, so no transformation is needed — passthrough
  // keeps <Image>'s intrinsic width/height (which is what protects CLS) without
  // pulling in sharp.
  image: { service: passthroughImageService() },
});
