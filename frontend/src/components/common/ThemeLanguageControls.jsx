import React from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const ThemeLanguageControls = ({ compact = false, showLabels = false, className = "" }) => {
	const { theme, toggleTheme, isDark } = useTheme();
	const { language, toggleLanguage, isRTL, t } = useLanguage();

	return (
		<div className={`flex items-center gap-1.5 ${className}`}>
			{/* Theme Toggle Button */}
			<button
				type='button'
				onClick={toggleTheme}
				title={isDark ? t("themeLight") : t("themeDark")}
				className='p-2 rounded-xl text-slate-400 hover:text-amber-400 dark:hover:text-amber-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 flex items-center gap-2 group shrink-0'
			>
				{isDark ? (
					<Sun className='w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300' />
				) : (
					<Moon className='w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300' />
				)}
				{showLabels && (
					<span className='text-xs font-semibold text-slate-600 dark:text-slate-300 hidden md:inline'>
						{isDark ? t("themeLight") : t("themeDark")}
					</span>
				)}
			</button>

			{/* Language Switcher Button */}
			<button
				type='button'
				onClick={toggleLanguage}
				title={language === "en" ? "تغيير إلى العربية" : "Switch to English"}
				className='px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-200 flex items-center gap-1.5 text-xs font-bold shrink-0'
			>
				<Globe className='w-3.5 h-3.5 text-indigo-500' />
				<span className='font-bold uppercase tracking-wider text-[11px]'>
					{language === "en" ? "عربي" : "EN"}
				</span>
			</button>
		</div>
	);
};

export default ThemeLanguageControls;
