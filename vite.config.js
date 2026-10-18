import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const entry = path => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  base: './',
  plugins: [{
    name: 'distribution-license-notices',
    closeBundle() {
      fs.mkdirSync(entry('./dist/licenses/'), { recursive: true });
      for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'licenses/threejs.txt']) {
        fs.copyFileSync(entry('./' + file), entry('./dist/' + file));
      }
      // Keep the downloadable demo self-contained in the static distribution too.
      fs.copyFileSync(entry('./examples/postal.html'), entry('./dist/examples/postal.html'));
    },
  }],
  build: {
    rollupOptions: {
      input: {
        gallery: entry('./index.html'),
        postal: entry('./examples/postal-diorama/index.html'),
        store: entry('./examples/store.html'),
        london: entry('./examples/london-eye.html'),
      },
    },
  },
});
