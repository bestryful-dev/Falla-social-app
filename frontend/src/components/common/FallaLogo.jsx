import { useLanguage } from "../../context/LanguageContext";

const FallaLogo = ({ className = "w-10 h-10", showText = true, textClassName = "text-xl" }) => {
	const { isRTL } = useLanguage();

	return (
		<div className='flex items-center gap-2.5 group select-none'>
			{/* 🦅 Logo image container with deeper zoom to crop out outer borders */}
			<div className={`relative overflow-hidden rounded-2xl shrink-0 shadow-sm border border-amber-500/20 bg-amber-500/10 flex items-center justify-center ${className}`}>
				<img
					src='/logo.png'
					alt='Naba Logo'
					className='w-full h-full object-cover scale-[1.38]' // 👈 Changed from 1.04 to 1.38
				/>
			</div>

			{showText && (
				<span className={`font-black tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors duration-200 ${textClassName}`}>
					{isRTL ? (
						<span className='bg-gradient-to-l from-amber-500 to-orange-600 bg-clip-text text-transparent'>
							نبأ
						</span>
					) : (
						<>
							<span>Na</span>
							<span className='bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent'>
								ba
							</span>
						</>
					)}
				</span>
			)}
		</div>
	);
};

export default FallaLogo;