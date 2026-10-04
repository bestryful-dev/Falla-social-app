import { MessageCircle, Repeat2, Heart, Bookmark, Trash2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { useLanguage } from "../../context/LanguageContext";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();
	const { t, isRTL, language } = useLanguage();

	const isRepost = !!post.repostOf;
	const displayPost = isRepost && post.repostOf._id ? post.repostOf : post;
	const postOwner = displayPost.user || {};
	const sharerUser = isRepost ? post.user : null;

	const targetPostId = displayPost._id;
	const isLiked = displayPost.likes?.some((id) => id.toString() === authUser?._id?.toString());
	const isBookmarked = authUser?.bookmarks?.some((id) => id.toString() === targetPostId?.toString());
	const isSharedByMe = displayPost.reposts?.some((id) => id.toString() === authUser?._id?.toString());

	const isMyPost = authUser?._id === post.user?._id;
	const formattedDate = formatPostDate(displayPost.createdAt, language);

	// Helper to update all post queries in the cache
	const updatePostInCache = (updatedPostId, updaterFn) => {
		queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
			if (!Array.isArray(oldData)) return oldData;
			return oldData.map((p) => {
				if (p._id === updatedPostId) {
					return updaterFn(p);
				}
				if (p.repostOf && p.repostOf._id === updatedPostId) {
					return {
						...p,
						repostOf: updaterFn(p.repostOf),
					};
				}
				return p;
			});
		});

		queryClient.setQueriesData({ queryKey: ["bookmarkedPosts"] }, (oldData) => {
			if (!Array.isArray(oldData)) return oldData;
			return oldData.map((p) => {
				if (p._id === updatedPostId) {
					return updaterFn(p);
				}
				if (p.repostOf && p.repostOf._id === updatedPostId) {
					return {
						...p,
						repostOf: updaterFn(p.repostOf),
					};
				}
				return p;
			});
		});
	};

	// 1. DELETE POST MUTATION
	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/${post._id}`, {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success(t("postDeletedToast") || "Post deleted");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	// 2. LIKE / UNLIKE MUTATION
	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/like/${targetPostId}`, {
					method: "POST",
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onMutate: async () => {
			const userId = authUser?._id;
			if (!userId) return;

			updatePostInCache(targetPostId, (p) => {
				const currentLikes = p.likes || [];
				const alreadyLiked = currentLikes.some((id) => id.toString() === userId.toString());
				const newLikes = alreadyLiked
					? currentLikes.filter((id) => id.toString() !== userId.toString())
					: [...currentLikes, userId];
				return { ...p, likes: newLikes };
			});
		},
		onSuccess: (updatedLikes) => {
			updatePostInCache(targetPostId, (p) => ({
				...p,
				likes: updatedLikes,
			}));
		},
		onError: (error) => {
			toast.error(error.message);
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
		},
	});

	// 3. BOOKMARK / UNBOOKMARK MUTATION
	const { mutate: toggleBookmark, isPending: isBookmarking } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/bookmark/${targetPostId}`, {
					method: "POST",
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onMutate: async () => {
			queryClient.setQueryData(["authUser"], (oldAuth) => {
				if (!oldAuth) return oldAuth;
				const currentBookmarks = oldAuth.bookmarks || [];
				const alreadyBookmarked = currentBookmarks.some((id) => id.toString() === targetPostId.toString());
				const updatedBookmarks = alreadyBookmarked
					? currentBookmarks.filter((id) => id.toString() !== targetPostId.toString())
					: [...currentBookmarks, targetPostId];
				return { ...oldAuth, bookmarks: updatedBookmarks };
			});
		},
		onSuccess: (data) => {
			toast.success(data.isBookmarked ? (t("savedToBookmarks") || "Saved to bookmarks") : (t("removedFromBookmarks") || "Removed from bookmarks"));
			queryClient.setQueryData(["authUser"], (oldAuth) => {
				if (!oldAuth) return oldAuth;
				return { ...oldAuth, bookmarks: data.bookmarks };
			});
			queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
		},
		onError: (err) => {
			toast.error(err.message);
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	// 4. SHARE / REPOST MUTATION
	const { mutate: sharePostMutation, isPending: isSharing } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/share/${targetPostId}`, {
					method: "POST",
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: (data) => {
			toast.success(data.isShared ? (t("sharedPostToast") || "Shared post") : (t("unsharedPostToast") || "Unshared post"));
			updatePostInCache(targetPostId, (p) => {
				const currentReposts = p.reposts || [];
				const updatedReposts = data.isShared
					? [...currentReposts, authUser._id]
					: currentReposts.filter((id) => id.toString() !== authUser._id.toString());
				return { ...p, reposts: updatedReposts };
			});
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	// 5. COMMENT MUTATION
	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/comment/${targetPostId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: comment }),
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: (updatedPost) => {
			toast.success(t("commentAddedToast") || "Comment added");
			setComment("");
			updatePostInCache(targetPostId, (p) => ({
				...p,
				comments: updatedPost.comments,
			}));
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// 6. 🗑️ DELETE COMMENT MUTATION
	const { mutate: deleteCommentAction, isPending: isDeletingComment } = useMutation({
		mutationFn: async (commentId) => {
			try {
				const res = await fetch(`/api/posts/${targetPostId}/comments/${commentId}`, {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to delete comment");
				return { data, commentId };
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: ({ commentId }) => {
			toast.success(t("commentDeletedToast") || "Comment deleted");
			updatePostInCache(targetPostId, (p) => ({
				...p,
				comments: (p.comments || []).filter((c) => c._id !== commentId),
			}));
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const handlePostComment = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!comment.trim() || isCommenting) return;
		commentPost();
	};

	const handleShare = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (isSharing) return;
		sharePostMutation();
	};

	return (
		<article className='p-4 sm:p-5 border-b border-black/5 dark:border-white/[0.07] bg-base-100/50 dark:bg-surface-200/30 hover:bg-base-200/50 dark:hover:bg-surface-100/40 transition-all duration-200'>
			{/* Shared Header Banner */}
			{isRepost && sharerUser && (
				<div className='flex items-center gap-2 mb-2.5 px-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
					<Repeat2 className='w-3.5 h-3.5 shrink-0' />
					<Link to={`/profile/${sharerUser.username}`} className='hover:underline flex items-center gap-1 truncate'>
						<span>
							{sharerUser._id === authUser?._id
								? (t("youShared") || "You shared this post")
								: `${sharerUser.fullName} ${t("userShared") || "shared this"}`}
						</span>
					</Link>
				</div>
			)}

			<div className='flex gap-3.5 items-start'>
				{/* Author Avatar */}
				<Link to={`/profile/${postOwner.username}`} className='relative shrink-0 group'>
					<img
						src={postOwner.profileImg || "/avatar-placeholder.png"}
						alt={postOwner.username}
						className='w-11 h-11 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/10 group-hover:ring-indigo-500/60 transition duration-200'
					/>
				</Link>

				{/* Post Body */}
				<div className='flex flex-col flex-1 min-w-0'>
					<div className='flex items-center justify-between gap-2 mb-1.5'>
						<div className='flex items-center gap-2 flex-wrap min-w-0'>
							<Link
								to={`/profile/${postOwner.username}`}
								className='font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-500 transition truncate'
							>
								{postOwner.fullName}
							</Link>
							<Link
								to={`/profile/${postOwner.username}`}
								className='text-xs text-slate-500 dark:text-slate-400 hover:underline truncate'
							>
								@{postOwner.username}
							</Link>
							<span className='text-slate-400 dark:text-slate-600 text-xs'>•</span>
							<span className='text-xs text-slate-500 font-medium'>{formattedDate}</span>
						</div>

						{/* Delete button (owner of post or owner of repost) */}
						{isMyPost && (
							<button
								onClick={() => deletePost()}
								disabled={isDeleting}
								title={t("deletePost") || "Delete post"}
								className='p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition duration-150'
							>
								{isDeleting ? <LoadingSpinner size='xs' /> : <Trash2 className='w-4 h-4' />}
							</button>
						)}
					</div>

					<div className='text-slate-800 dark:text-slate-200 text-sm leading-relaxed break-words whitespace-pre-line text-start'>
						{displayPost.text}
					</div>

					{displayPost.img && (
						<div className='mt-3 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-h-96 bg-black/5 dark:bg-black/40'>
							<img
								src={displayPost.img}
								className='w-full h-auto max-h-96 object-contain rounded-2xl hover:scale-[1.01] transition-transform duration-300'
								alt='Post visual'
							/>
						</div>
					)}

					{/* Interaction Action Bar */}
					<div className='flex items-center justify-between mt-4 pt-2 border-t border-black/5 dark:border-white/[0.04] text-slate-500 dark:text-slate-400'>
						<button
							onClick={() => document.getElementById("comments_modal" + targetPostId)?.showModal()}
							className='flex items-center gap-1.5 text-xs font-semibold hover:text-indigo-500 transition group p-1.5 ltr:-ml-1.5 rtl:-mr-1.5 rounded-xl hover:bg-indigo-500/10'
						>
							<MessageCircle className='w-4 h-4 group-hover:scale-110 transition-transform' />
							<span>{displayPost.comments?.length || 0}</span>
						</button>

						<button
							onClick={handleShare}
							disabled={isSharing}
							title={isSharedByMe ? (t("unsharePost") || "Unshare") : (t("sharePost") || "Share")}
							className={`flex items-center gap-1.5 text-xs font-semibold transition group p-1.5 rounded-xl ${
								isSharedByMe
									? "text-emerald-500 hover:bg-emerald-500/10"
									: "hover:text-emerald-500 hover:bg-emerald-500/10"
							}`}
						>
							{isSharing ? (
								<LoadingSpinner size='xs' />
							) : (
								<Repeat2 className={`w-4 h-4 transition-transform duration-200 ${isSharedByMe ? "rotate-180 font-bold" : "group-hover:rotate-180"}`} />
							)}
							<span>{displayPost.reposts?.length || 0}</span>
						</button>

						<button
							onClick={() => likePost()}
							disabled={isLiking}
							className={`flex items-center gap-1.5 text-xs font-semibold transition group p-1.5 rounded-xl ${
								isLiked
									? "text-rose-500 hover:bg-rose-500/10"
									: "hover:text-rose-500 hover:bg-rose-500/10"
							}`}
						>
							{isLiking ? (
								<LoadingSpinner size='xs' />
							) : (
								<Heart
									className={`w-4 h-4 transition-all duration-200 ${
										isLiked
											? "fill-rose-500 text-rose-500 scale-110"
											: "group-hover:scale-125"
									}`}
								/>
							)}
							<span className={isLiked ? "font-bold" : ""}>{displayPost.likes?.length || 0}</span>
						</button>

						<button
							onClick={() => toggleBookmark()}
							disabled={isBookmarking}
							title={isBookmarked ? (t("removedFromBookmarks") || "Saved") : (t("savedToBookmarks") || "Save")}
							className={`p-1.5 rounded-xl transition ${
								isBookmarked
									? "text-amber-500 bg-amber-500/10"
									: "hover:text-amber-500 hover:bg-amber-500/10"
							}`}
						>
							{isBookmarking ? (
								<LoadingSpinner size='xs' />
							) : (
								<Bookmark className={`w-4 h-4 transition-transform ${isBookmarked ? "fill-amber-500 scale-110" : ""}`} />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* DaisyUI Comments Modal */}
			<dialog id={`comments_modal${targetPostId}`} className='modal modal-bottom sm:modal-middle'>
				<div className='modal-box bg-base-100 dark:bg-[#111622] border border-black/10 dark:border-white/10 rounded-3xl p-5 shadow-2xl max-w-lg transition-colors duration-200'>
					<div className='flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10'>
						<div className='flex items-center gap-2'>
							<MessageCircle className='w-4 h-4 text-indigo-500' />
							<h3 className='font-bold text-base text-slate-900 dark:text-white'>{t("discussionTitle") || "Comments"}</h3>
							<span className='px-2 py-0.5 rounded-full text-xs bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-semibold'>
								{displayPost.comments?.length || 0}
							</span>
						</div>
						<form method='dialog'>
							<button className='btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-900 dark:hover:text-white'>✕</button>
						</form>
					</div>

					{/* Comments Thread */}
					<div className='flex flex-col gap-3 max-h-72 overflow-y-auto my-4 pr-1'>
						{(!displayPost.comments || displayPost.comments.length === 0) && (
							<div className='text-center py-8 text-slate-400 flex flex-col items-center gap-2'>
								<Sparkles className='w-6 h-6 text-slate-400' />
								<p className='text-xs'>{t("noCommentsYet") || "No comments yet"}</p>
							</div>
						)}

						{displayPost.comments?.map((c, idx) => {
							const isCommentOwner = authUser?._id?.toString() === c.user?._id?.toString();
							const isPostOwner = authUser?._id?.toString() === displayPost.user?._id?.toString();
							const canDelete = isCommentOwner || isPostOwner;

							return (
								<div
									key={c._id || idx}
									className='flex gap-3 items-start p-2.5 rounded-2xl bg-base-200 dark:bg-surface-100/60 border border-black/5 dark:border-white/[0.04] group/comment relative'
								>
									<Link to={`/profile/${c.user?.username}`} className='shrink-0'>
										<img
											src={c.user?.profileImg || "/avatar-placeholder.png"}
											alt={c.user?.username}
											className='w-8 h-8 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/10'
										/>
									</Link>
									<div className='flex flex-col flex-1 min-w-0 text-start'>
										<div className='flex items-center justify-between gap-2'>
											<div className='flex items-center gap-2 min-w-0'>
												<Link
													to={`/profile/${c.user?.username}`}
													className='font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-indigo-500 truncate'
												>
													{c.user?.fullName}
												</Link>
												<span className='text-[11px] text-slate-500 truncate'>
													@{c.user?.username}
												</span>
											</div>

											{/* 🗑️ Delete Comment Button */}
											{canDelete && (
												<button
													onClick={(e) => {
														e.preventDefault();
														deleteCommentAction(c._id);
													}}
													disabled={isDeletingComment}
													title={t("deleteComment") || "Delete comment"}
													className='opacity-0 group-hover/comment:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-150'
												>
													<Trash2 className='w-3 h-3' />
												</button>
											)}
										</div>
										<p className='text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed'>{c.text}</p>
									</div>
								</div>
							);
						})}
					</div>

					{/* Comment Form */}
					<form
						className='flex gap-2 items-center pt-3 border-t border-black/10 dark:border-white/10'
						onSubmit={handlePostComment}
					>
						<input
							type='text'
							className='flex-1 glass-input rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 text-start'
							placeholder={t("writeReplyPlaceholder") || "Write a reply..."}
							value={comment}
							onChange={(e) => setComment(e.target.value)}
						/>
						<button
							type='submit'
							disabled={isCommenting || !comment.trim()}
							className='gradient-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none'
						>
							{isCommenting ? (
								<LoadingSpinner size='xs' />
							) : (
								<>
									<Send className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
									<span>{t("replyButton") || "Reply"}</span>
								</>
							)}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop bg-black/60 backdrop-blur-sm'>
					<button className='cursor-default'>{t("close") || "Close"}</button>
				</form>
			</dialog>
		</article>
	);
};

export default Post;