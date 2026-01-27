import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import { readFileSync } from 'fs'
import { dirname, join} from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: {
      cert: readFileSync(join(__dirname, './keys/remote-audio-controller-dev.pem')),
      key: readFileSync(join(__dirname, './keys/key.pem'))
    }
  },
  plugins: [react()],
})
