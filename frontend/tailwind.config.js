import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				sans: ["'Plus Jakarta Sans'", "'Cairo'", "sans-serif"],
				arabic: ["'Cairo'", "'Plus Jakarta Sans'", "sans-serif"],
			},
			colors: {
				falla: {
					50: "#eef2ff",
					100: "#e0e7ff",
					200: "#c7d2fe",
					300: "#a5b4fc",
					400: "#818cf8",
					500: "#6366f1",
					600: "#4f46e5",
					700: "#4338ca",
					800: "#3730a3",
					900: "#312e81",
					950: "#1e1b4b",
				},
				surface: {
					50: "var(--surface-50)",
					100: "var(--surface-100)",
					200: "var(--surface-200)",
					300: "var(--surface-300)",
					400: "var(--surface-400)",
				},
			},
			boxShadow: {
				glow: "0 0 25px -5px rgba(99, 102, 241, 0.4)",
				"glow-pink": "0 0 25px -5px rgba(236, 72, 153, 0.4)",
				card: "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
				"card-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
			},
			animation: {
				"pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				float: "float 6s ease-in-out infinite",
				shimmer: "shimmer 2s infinite linear",
			},
			keyframes: {
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-8px)" },
				},
				shimmer: {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				fallaDark: {
					primary: "#6366f1",
					"primary-focus": "#4f46e5",
					"primary-content": "#ffffff",
					secondary: "#8b5cf6",
					accent: "#ec4899",
					neutral: "#131722",
					"base-100": "#0b0f19",
					"base-200": "#111622",
					"base-300": "#171d2c",
					"base-content": "#f1f5f9",
					info: "#38bdf8",
					success: "#10b981",
					warning: "#f59e0b",
					error: "#ef4444",
				},
				fallaLight: {
					primary: "#6366f1",
					"primary-focus": "#4f46e5",
					"primary-content": "#ffffff",
					secondary: "#8b5cf6",
					accent: "#ec4899",
					neutral: "#e2e8f0",
					"base-100": "#f8fafc",
					"base-200": "#ffffff",
					"base-300": "#f1f5f9",
					"base-content": "#0f172a",
					info: "#0284c7",
					success: "#059669",
					warning: "#d97706",
					error: "#e11d48",
				},
			},
		],
		darkTheme: "fallaDark",
	},
};
