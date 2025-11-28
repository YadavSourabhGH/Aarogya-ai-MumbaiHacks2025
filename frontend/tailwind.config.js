/** @type {import('tailwindcss').Config} */
export default {
    content: {
        files: [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}",
        ],
        safelist: [
            'bg-gray-50',
            'text-gray-900',
            'bg-slate-50',
            'text-slate-900',
        ],
    },
    theme: {
        extend: {
            colors: {
                primary: '#0ea5e9', // Sky 500
                secondary: '#6366f1', // Indigo 500
                accent: '#f43f5e', // Rose 500
                dark: '#0f172a', // Slate 900
            },
        },
    },
    plugins: [],
}
