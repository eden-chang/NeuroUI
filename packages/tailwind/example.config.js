// Example Tailwind CSS configuration using @neuroui/tailwind
import neuroPlugin from '@neuroui/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [neuroPlugin],
};
