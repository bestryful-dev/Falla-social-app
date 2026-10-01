import { useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkX } from "lucide-react";
import Post from "../../components/common/Post";
import PostSkeleton from "../../components/skeletons/PostSkeleton";
import { useLanguage } from "../../context/LanguageContext";

const BookmarksPage = () => {
	const { t } = useLanguage();

	const {
		data: bookmarkedPosts,
		isLoading,
		isRefetching,
	} = useQuery({
		queryKey: ["bookmarkedPosts"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/posts/bookmarks");
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	return (
		<div className='flex-1 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] min-h-screen max-w-2xl xl:max-w-3xl w-full transition-colors duration-200'>
			
			{/* Sticky Header */}
			<div className='sticky top-0 z-20 backdrop-blur-xl bg-base-100/90 dark:bg-[#0d111a]/85 border-b border-black/10 dark:border-white/[0.08] px-5 py-4 flex items-center justify-between transition-colors duration-200'>
				<div className='flex items-center gap-2.5'>
					<div className='p-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20'>
						<Bookmark className='w-4 h-4 fill-amber-500' />
					</div>
					<div className='text-start'>
						<h1 className='font-bold text-base text-slate-900 dark:text-white leading-tight'>
							{t("bookmarksTitle")}
						</h1>
						<p className='text-[11px] text-slate-500 dark:text-slate-400'>
							{t("bookmarksSubtitle")}
						</p>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{(isLoading || isRefetching) && (
				<div className='flex flex-col divide-y divide-black/5 dark:divide-white/[0.04]'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isRefetching && (!bookmarkedPosts || bookmarkedPosts.length === 0) && (
				<div className='flex flex-col items-center justify-center p-16 text-center'>
					<div className='w-16 h-16 rounded-3xl bg-base-200 dark:bg-surface-100 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-inner'>
						<BookmarkX className='w-8 h-8 text-amber-500' />
					</div>
					<h3 className='font-bold text-slate-800 dark:text-slate-200 text-base'>
						{t("noBookmarksTitle")}
					</h3>
					<p className='text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1'>
						{t("noBookmarksDesc")}
					</p>
				</div>
			)}

			{/* Bookmarked Posts Feed */}
			{!isLoading && !isRefetching && bookmarkedPosts && bookmarkedPosts.length > 0 && (
				<div className='divide-y divide-black/5 dark:divide-white/[0.04]'>
					{bookmarkedPosts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</div>
	);
};

export default BookmarksPage;
