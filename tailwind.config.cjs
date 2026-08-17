/**
 * Tailwind config: disable preflight to avoid generated `vertical-align` on block elements.
 * We provide a minimal, safe preflight in our source CSS instead.
 */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}'
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
