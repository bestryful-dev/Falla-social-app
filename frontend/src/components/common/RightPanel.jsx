import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ShieldCheck } from "lucide-react";

import useFollow from "../../hooks/useFollow";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import { useLanguage } from "../../context/LanguageContext";

const RightPanel = () => {
	const { t, isRTL } = useLanguage();
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/users/suggested");
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	const { follow, isPending } = useFollow();

	if (suggestedUsers?.length === 0) return <div className='hidden lg:block w-72 shrink-0'></div>;

	return (
		<div className='hidden lg:block w-72 xl:w-80 shrink-0 p-4'>
			<div className='sticky top-4 flex flex-col gap-4'>
				
				{/* Suggested Creators Card */}
				<div className='p-4 rounded-3xl bg-base-200/80 dark:bg-surface-100/70 border border-black/5 dark:border-white/[0.08] backdrop-blur-xl shadow-card dark:shadow-card-dark transition-colors duration-200'>
					<div className='flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/[0.06]'>
						<div className='flex items-center gap-2'>
							<div className='p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'>
								<Sparkles className='w-4 h-4' />
							</div>
							<h2 className='font-bold text-sm text-slate-800 dark:text-white tracking-wide'>
								{t("suggestedForYou")}
							</h2>
						</div>
					</div>

					<div className='flex flex-col gap-3'>
						{isLoading && (
							<>
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
							</>
						)}

						{!isLoading &&
							suggestedUsers?.map((user) => (
								<div
									key={user._id}
									className='flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/[0.04] transition duration-200 group'
								>
									<Link
										to={`/profile/${user.username}`}
										className='flex items-center gap-2.5 min-w-0 flex-1'
									>
										<div className='relative shrink-0'>
											<img
												src={user.profileImg || "/avatar-placeholder.png"}
												alt={user.username}
												className='w-10 h-10 rounded-2xl object-cover ring-1 ring-black/10 dark:ring-white/10 group-hover:ring-indigo-500/50 transition duration-200'
											/>
										</div>
										<div className='flex flex-col min-w-0 text-start'>
											<span className='font-bold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition flex items-center gap-1'>
												{user.fullName}
											</span>
											<span className='text-[11px] text-slate-500 dark:text-slate-400 truncate'>
												@{user.username}
											</span>
										</div>
									</Link>

									<button
										onClick={(e) => {
											e.preventDefault();
											follow(user._id);
										}}
										disabled={isPending}
										className='px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-50 dark:hover:text-indigo-600 transition-all duration-200 shadow-sm active:scale-95 shrink-0 flex items-center gap-1'
									>
										{isPending ? <LoadingSpinner size='xs' /> : t("follow")}
									</button>
								</div>
							))}
					</div>
				</div>

				{/* Falla Info & Branding Footer Card */}
				<div className='p-4 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-surface-100/50 to-surface-200/50 dark:from-indigo-950/40 dark:via-surface-100/50 dark:to-surface-200/50 border border-indigo-500/10 backdrop-blur-xl transition-colors duration-200'>
					<div className='flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-1.5'>
						<ShieldCheck className='w-4 h-4 text-indigo-500 dark:text-indigo-400' />
						<span>{t("fallaExperience")}</span>
					</div>
					<p className='text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed text-start'>
						{t("fallaExperienceDesc")}
					</p>
					<div className='flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-black/5 dark:border-white/[0.05] text-[11px] text-slate-500'>
						<span>{t("terms")}</span>
						<span>{t("privacy")}</span>
						<span>{t("safety")}</span>
						<span>© {new Date().getFullYear()} {isRTL ? "نبأ" : "Naba"}</span>
					</div>
				</div>

			</div>
		</div>
	);
};

export default RightPanel;
