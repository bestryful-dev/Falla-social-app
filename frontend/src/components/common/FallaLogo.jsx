import React from "react";
import { useLanguage } from "../../context/LanguageContext";

const FallaLogo = ({ className = "w-10 h-10", showText = true, textClassName = "text-xl font-extrabold" }) => {
	const { isRTL } = useLanguage();

	return (
		<div className='inline-flex items-center gap-3 select-none'>
			{/* Logo Icon Box with integrated shadow/glow */}
			<div className={`relative flex items-center justify-center shrink-0 ${className} shadow-lg shadow-indigo-500/20 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500`}>
				<svg
					viewBox='0 0 40 40'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
					className='w-full h-full block'
				>
					{/* Crisp "F" glyph */}
					<path
						d='M13 11C13 9.89543 13.8954 9 15 9H27C27.5523 9 28 9.44772 28 10V13C28 13.5523 27.5523 14 27 14H18V18H25C25.5523 18 26 18.4477 26 19V22C26 22.5523 25.5523 23 25 23H18V29C18 30.1046 17.1046 31 16 31H15C13.8954 31 13 30.1046 13 29V11Z'
						fill='#ffffff'
					/>
					{/* Accent dot */}
					<circle cx='28' cy='29' r='2.5' fill='#38bdf8' />
				</svg>
			</div>

			{/* Text Side */}
			{showText && (
				<div className='flex flex-col leading-none min-w-0'>
					{isRTL ? (
						<span className={`tracking-tight font-black text-slate-900 dark:text-white truncate ${textClassName}`}>
							فلة<span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mr-1 font-black'>سوشيال</span>
						</span>
					) : (
						<span className={`tracking-tight font-black text-slate-900 dark:text-white truncate ${textClassName}`}>
							Falla<span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent ml-1 font-black'>Social</span>
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default FallaLogo;