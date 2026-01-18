import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['cookies', 'storage'],
    host_permissions: [
      '*://github.com/*',
      'http://localhost:3000/*',
      'https://*/*'  // Allow all HTTPS hosts for custom server URLs
    ],
    content_scripts: [
      {
        matches: ['*://github.com/*'],
        exclude_matches: ['*://github.com/settings/*'],
        js: ['inject.js'],
        run_at: 'document_idle'
      }
    ],
    name: 'Starflow Extension',
    description: 'Manage your GitHub stars with Starflow',
    version: '0.2.0',
  },
  runner: {
    startUrls: ['https://github.com/'],
  },
  vite: () => ({
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      sourcemap: false, // 绝对禁止
      minify: 'esbuild', // 启用压缩
      target: 'esnext', // 避免为了兼容旧浏览器而注入包含 eval 的 polyfill
    },
  }),
});
