import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { navy: '#0B3B6F', blue: '#1668B8', orange: '#F28C28', green: '#2E9E5B',
      red: '#D94A3A', ink: '#1E2A3A', muted: '#51606F', line: '#D6E2EE', page: '#F5F8FB',
      'tint-blue': '#EAF2FA', 'tint-green': '#EAF6EE', 'tint-orange': '#FFF3E6',
      sky: '#EAF2FA', gray: '#D6E2EE' },
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    boxShadow: { soft: 'none' },
  } }, plugins: [],
} satisfies Config;
