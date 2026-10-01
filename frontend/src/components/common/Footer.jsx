import React from "react";
import { ExternalLink, Heart } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
	const { t, isRTL } = useLanguage();

	return (
		<footer className='w-full py-4 px-4 text-center border-t border-black/5 dark:border-white/[0.06] bg-base-100/80 dark:bg-[#0b0f19]/80 backdrop-blur-md transition-colors duration-200 mt-auto'>
			<div className='max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-slate-400'>
				<span className='flex items-center gap-1'>
					{t("createdBy")}
					<span className='font-bold text-slate-800 dark:text-slate-200'>Bestryful-soft</span>
				</span>
				<span className='hidden sm:inline text-slate-300 dark:text-slate-700'>•</span>
				<a
					href='https://bestryful-soft.vercel.app'
					target='_blank'
					rel='noopener noreferrer'
					className='font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition inline-flex items-center gap-1 group underline-offset-2 hover:underline'
				>
					<span>bestryful-soft.vercel.app</span>
					<ExternalLink className='w-3 h-3 group-hover:translate-x-0.5 transition-transform' />
				</a>
			</div>
		</footer>
	);
};

export default Footer;
