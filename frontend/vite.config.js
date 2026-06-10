import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 환경 변수 로드
    const env = loadEnv(mode, process.cwd(), '');

    const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:8000';

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api': {
                    target: backendUrl,
                    changeOrigin: true,
                },
                '/static': {
                    target: backendUrl,
                    changeOrigin: true,
                },
            },
        },
    };
});
