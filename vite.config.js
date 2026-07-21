import nodeCrypto from 'node:crypto';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

var ensureWebCrypto = function () {
    var existingCrypto = globalThis.crypto;
    if (existingCrypto && typeof existingCrypto.getRandomValues === 'function') {
        return;
    }
    var polyfilledCrypto = {
        getRandomValues: function (array) {
            if (array) {
                nodeCrypto.randomFillSync(array);
            }
            return array;
        },
        randomUUID: typeof nodeCrypto.randomUUID === 'function'
            ? nodeCrypto.randomUUID.bind(nodeCrypto)
            : undefined,
        subtle: nodeCrypto.webcrypto && nodeCrypto.webcrypto.subtle,
    };
    globalThis.crypto = polyfilledCrypto;
};

ensureWebCrypto();
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, '.', '');
    var runtimeConfig = {
        APP_NAME: env.APP_NAME || 'Org Per Chat',
        API_BASE_URL: env.API_BASE_URL || 'https://cf8vd512-8081.euw.devtunnels.ms',
        API_JWT_TOKEN: env.API_JWT_TOKEN || '',
        API_TIMEOUT_MS: env.API_TIMEOUT_MS || '15000',
        DEFAULT_AGENT_MODEL: env.DEFAULT_AGENT_MODEL || 'gemini-2.5-flash-lite',
        DEFAULT_ORGANIZATION_ID: env.DEFAULT_ORGANIZATION_ID || '1',
    };
    return {
        plugins: [react()],
        define: {
            __APP_CONFIG__: JSON.stringify(runtimeConfig),
        },
        server: {
            port: 5173,
        },
    };
});
