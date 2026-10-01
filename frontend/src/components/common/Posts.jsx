import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { MessageSquareDashed } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const Posts = ({ feedType, username, userId }) => {
	const { t } = useLanguage();

	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "posts":
				return `/api/posts/user/${username}`;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return "/api/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts", feedType, username, userId],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
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

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username, userId]);

	return (
		<div className='divide-y divide-black/5 dark:divide-white/[0.04] transition-colors duration-200'>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}

			{!isLoading && !isRefetching && posts?.length === 0 && (
				<div className='flex flex-col items-center justify-center p-12 text-center'>
					<div className='w-16 h-16 rounded-3xl bg-base-200 dark:bg-surface-100 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-inner'>
						<MessageSquareDashed className='w-8 h-8 text-indigo-500' />
					</div>
					<h3 className='font-bold text-slate-800 dark:text-slate-200 text-base'>
						{t("noPostsTitle")}
					</h3>
					<p className='text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1'>
						{feedType === "following"
							? t("noPostsFollowingDesc")
							: feedType === "likes"
							? t("noPostsLikesDesc")
							: t("noPostsDiscoverDesc")}
					</p>
				</div>
			)}

			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</div>
	);
};

export default Posts;
