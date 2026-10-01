import { useState } from "react";
import { Sparkles, Users } from "lucide-react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { useLanguage } from "../../context/LanguageContext";

const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou");
	const { t } = useLanguage();

	return (
		<div className='flex-1 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] min-h-screen max-w-2xl xl:max-w-3xl w-full transition-colors duration-200'>
			
			{/* Sticky Feed Header */}
			<div className='sticky top-0 z-20 backdrop-blur-xl bg-base-100/90 dark:bg-[#0d111a]/85 border-b border-black/10 dark:border-white/[0.08] flex transition-colors duration-200'>
				<button
					type='button'
					className={`flex-1 py-3.5 px-4 font-bold text-sm transition-all duration-200 relative flex items-center justify-center gap-2 ${
						feedType === "forYou"
							? "text-slate-900 dark:text-white"
							: "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/[0.03]"
					}`}
					onClick={() => setFeedType("forYou")}
				>
					<Sparkles className={`w-4 h-4 ${feedType === "forYou" ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"}`} />
					<span>{t("feedDiscover")}</span>
					{feedType === "forYou" && (
						<span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-glow' />
					)}
				</button>

				<button
					type='button'
					className={`flex-1 py-3.5 px-4 font-bold text-sm transition-all duration-200 relative flex items-center justify-center gap-2 ${
						feedType === "following"
							? "text-slate-900 dark:text-white"
							: "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/[0.03]"
					}`}
					onClick={() => setFeedType("following")}
				>
					<Users className={`w-4 h-4 ${feedType === "following" ? "text-purple-500" : "text-slate-400 dark:text-slate-500"}`} />
					<span>{t("feedFollowing")}</span>
					{feedType === "following" && (
						<span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-glow' />
					)}
				</button>
			</div>

			{/* Create Post Input */}
			<CreatePost />

			{/* Feed Stream */}
			<Posts feedType={feedType} />
		</div>
	);
};

export default HomePage;
