import React from "react";
import { useLanguage } from "../../context/LanguageContext";

const FallaLogo = ({ className = "w-9 h-9", showText = false, textClassName = "text-xl font-extrabold" }) => {
	const { isRTL } = useLanguage();

	return (
		<div className='flex items-center gap-2.5 select-none'>
			<div className={`relative flex items-center justify-center shrink-0 ${className}`}>
				{/* Subtle Backlight Glow (offset behind badge) */}
				<div className='absolute -inset-0.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-2xl blur-[4px] opacity-40 group-hover:opacity-80 transition duration-300 pointer-events-none' />
				
				{/* Sharp Vector Logo Badge */}
				<svg
					viewBox='0 0 40 40'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
					shapeRendering='geometricPrecision'
					className='relative w-full h-full'
				>
					<defs>
						<linearGradient id='fallaGradSharp' x1='0%' y1='0%' x2='100%' y2='100%'>
							<stop offset='0%' stopColor='#6366f1' />
							<stop offset='50%' stopColor='#8b5cf6' />
							<stop offset='100%' stopColor='#ec4899' />
						</linearGradient>
						<linearGradient id='fallaGradLightSharp' x1='0%' y1='0%' x2='100%' y2='100%'>
							<stop offset='0%' stopColor='#ffffff' />
							<stop offset='100%' stopColor='#f1f5f9' />
						</linearGradient>
					</defs>
					
					{/* Sharp Rounded Badge Base */}
					<rect width='40' height='40' rx='12' fill='url(#fallaGradSharp)' />
					<rect x='0.5' y='0.5' width='39' height='39' rx='11.5' stroke='rgba(255,255,255,0.2)' strokeWidth='1' />
					
					{/* Stylized Crisp "F" glyph */}
					<path
						d='M13 11C13 9.89543 13.8954 9 15 9H27C27.5523 9 28 9.44772 28 10V13C28 13.5523 27.5523 14 27 14H18V18H25C25.5523 18 26 18.4477 26 19V22C26 22.5523 25.5523 23 25 23H18V29C18 30.1046 17.1046 31 16 31H15C13.8954 31 13 30.1046 13 29V11Z'
						fill='url(#fallaGradLightSharp)'
					/>
					
					{/* Dynamic accent dot */}
					<circle cx='28' cy='29' r='2.5' fill='#38bdf8' />
				</svg>
			</div>

			{showText && (
				<div className='flex flex-col leading-none'>
					{isRTL ? (
						<span className={`tracking-tight font-black text-slate-900 dark:text-white ${textClassName}`}>
							فلة<span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mr-1 font-black'>سوشيال</span>
						</span>
					) : (
						<span className={`tracking-tight font-black text-slate-900 dark:text-white ${textClassName}`}>
							Falla<span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent ml-1 font-black'>Social</span>
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default FallaLogo;
