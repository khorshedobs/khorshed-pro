import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { createKhorshedShikiTransformer } from './src/lib/shiki-transformer.ts';

export default defineConfig({
  site: 'https://khorshed.pro',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
      transformers: [createKhorshedShikiTransformer()],
    },
  },
});
