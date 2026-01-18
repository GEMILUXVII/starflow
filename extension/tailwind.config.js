/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./entrypoints/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // 禁用全局样式重置，防止破坏 GitHub 页面
  },
  plugins: [],
}
