export const content = [
    './src/**/*.{astro,js,ts,jsx,tsx}',
    './public/**/*.html'
];

export const theme = {
    extend: {
        colors: {
            'primary-beige': '#F5F0E9',
            'primary-black': '#000000',
            'primary-white': '#FFFFFF',
            'primary-gray': '#6B7280',
        },
    },
};

export const plugins = [require('@tailwindcss/typography')];

// Configuración de purge para producción
export const purge = {
    enabled: process.env.NODE_ENV === 'production',
    content: [
        './src/**/*.{astro,js,ts,jsx,tsx}',
        './public/**/*.html'
    ],
    options: {
        safelist: ['html', 'body']
    }
};