export const content = [
    './src/**/*.{astro,js,ts,jsx,tsx}',
    './public/**/*.html'
];
export const theme = {
    extend: {},
};
export const plugins = [require('@tailwindcss/typography')];