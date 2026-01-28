import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const certificateKeyPath = join(__dirname, './keys/remote-audio-controller-key.pem')
const certificatePath = join(__dirname, './keys/remote-audio-controller-cert.pem')
const useSecureServer = existsSync(certificateKeyPath) == true && existsSync(certificatePath) == true

const https = useSecureServer == true ? {
  cert: readFileSync(certificatePath),
  key: readFileSync(certificateKeyPath)
} : undefined

// https://vite.dev/config/
export default defineConfig({
  server: { https },
  plugins: [react()],
})
