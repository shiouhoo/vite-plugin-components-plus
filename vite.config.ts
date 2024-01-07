import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { componentsRename } from './src';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        open: '/test-vue-ts/index.html', // 在服务器启动时自动打开 /test-vue-ts/index.html
    },
    build: {
        rollupOptions: {
            input: 'test-vue-ts/index.html'
        }
    },
    plugins: [
        componentsRename(),
        vue()
    ],
});
