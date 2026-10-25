/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	darkMode: ['class', '.dark'],
	theme: {
		extend: {
			colors: {
				border: 'var(--admin-border)',
				input: 'var(--admin-input)',
				ring: 'var(--admin-ring)',
				background: 'var(--admin-canvas)',
				foreground: 'var(--admin-text)',
				primary: {
					DEFAULT: 'var(--admin-primary)',
					foreground: 'var(--admin-primary-foreground)',
				},
				secondary: {
					DEFAULT: 'var(--admin-surface-2)',
					foreground: 'var(--admin-text)',
				},
				muted: {
					DEFAULT: 'var(--admin-surface-2)',
					foreground: 'var(--admin-muted)',
				},
				accent: {
					DEFAULT: 'var(--admin-hover)',
					foreground: 'var(--admin-text)',
				},
				card: {
					DEFAULT: 'var(--admin-surface)',
					foreground: 'var(--admin-text)',
				},
				sidebar: {
					DEFAULT: 'var(--admin-sidebar)',
					foreground: 'var(--admin-text)',
				},
			},
			borderRadius: {
				xl: 'var(--admin-radius-xl)',
				lg: 'var(--admin-radius-lg)',
				DEFAULT: 'var(--admin-radius)',
				sm: 'var(--admin-radius-sm)',
				xs: 'var(--admin-radius-xs)',
			},
			height: {
				'screen/2': '50vh',
			},
		},
	},
	plugins: [],
};
