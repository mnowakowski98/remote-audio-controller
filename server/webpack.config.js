import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './src/index.ts',
    mode: 'production',
    target: 'node',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    resolve: {
        extensions: ['.js', '.ts'],
        conditionNames: ['...', 'import']
    },
    output: {
        asyncChunks: false,
        clean: true,
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist')
    },
    ignoreWarnings: [{
        module: /node_modules\/express\/lib\/view.js/,
        message: /the request of a dependency is an expression/
    }]
}