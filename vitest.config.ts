import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    },
    resolve: {
        alias: {
            '@homethrive-lambda-crud/core': resolve(__dirname, './packages/core/src')
        }
    }
})
