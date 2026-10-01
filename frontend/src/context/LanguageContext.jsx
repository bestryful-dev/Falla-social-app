import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../locales/translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
	const [language, setLanguageState] = useState(() => {
		const saved = localStorage.getItem("falla_lang");
		return saved === "ar" ? "ar" : "en";
	});

	const isRTL = language === "ar";

	useEffect(() => {
		document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
		document.documentElement.setAttribute("lang", language);
		if (isRTL) {
			document.documentElement.classList.add("rtl");
		} else {
			document.documentElement.classList.remove("rtl");
		}
		localStorage.setItem("falla_lang", language);
	}, [language, isRTL]);

	const setLanguage = (lang) => {
		if (lang === "ar" || lang === "en") {
			setLanguageState(lang);
		}
	};

	const toggleLanguage = () => {
		setLanguageState((prev) => (prev === "en" ? "ar" : "en"));
	};

	const t = (key) => {
		const dict = translations[language] || translations.en;
		return dict[key] !== undefined ? dict[key] : (translations.en[key] || key);
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
};

export default LanguageContext;
