import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const [theme, setThemeState] = useState(() => {
		const saved = localStorage.getItem("falla_theme");
		if (saved === "light" || saved === "dark") {
			return saved;
		}
		return "dark";
	});

	const isDark = theme === "dark";

	useEffect(() => {
		const root = document.documentElement;
		if (isDark) {
			root.setAttribute("data-theme", "fallaDark");
			root.classList.add("dark");
			root.classList.remove("light");
		} else {
			root.setAttribute("data-theme", "fallaLight");
			root.classList.add("light");
			root.classList.remove("dark");
		}
		localStorage.setItem("falla_theme", theme);
	}, [theme, isDark]);

	const setTheme = (newTheme) => {
		if (newTheme === "dark" || newTheme === "light") {
			setThemeState(newTheme);
		}
	};

	const toggleTheme = () => {
		setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

export default ThemeContext;
