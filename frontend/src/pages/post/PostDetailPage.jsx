import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ArrowRight,
	Heart,
	Repeat2,
	Bookmark,
	MessageCircle,
	Trash2,
	Send,
	Reply,
	X,
	Sparkles,
	AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { useLanguage } from "../../context/LanguageContext";
import { useSocket } from "../../context/SocketContext";

const PostDetailPage = () => {
	const { id: postId } = useParams();
	const [searchParams] = useSearchParams();
	const targetCommentId = searchParams.get("commentId");
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { t, isRTL, language } = useLanguage();
	const { socket } = useSocket();

	const [commentText, setCommentText] = useState("");
	const [replyingTo, setReplyingTo] = useState(null); // { commentId, username, text }
	const [highlightedCommentId, setHighlightedCommentId] = useState(null);
	const commentInputRef = useRef(null);
	const commentsEndRef = useRef(null);

	// 1. Current auth user
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	// 2. Fetch post by ID
	const {
		data: post,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["post", postId],
		queryFn: async () => {
			try {
				const res = await fetch(`/api/posts/${postId}`);
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to load post");
				return data;
			} catch (err) {
				throw new Error(err.message || "Failed to load post");
			}
		},
	});

	const isRepost = !!post?.repostOf;
	const displayPost = isRepost && post?.repostOf?._id ? post.repostOf : post;
	const postOwner = displayPost?.user || {};
	const sharerUser = isRepost ? post?.user : null;
	const targetPostId = displayPost?._id;

	const isLiked = displayPost?.likes?.some((id) => id?.toString() === authUser?._id?.toString());
	const isBookmarked = authUser?.bookmarks?.some((id) => id?.toString() === targetPostId?.toString());
	const isSharedByMe = displayPost?.reposts?.some((id) => id?.toString() === authUser?._id?.toString());
	const isMyPost = authUser?._id?.toString() === post?.user?._id?.toString();
	const formattedDate = formatPostDate(displayPost?.createdAt, language);

	// Helper to update post in queries
	const updatePostInCache = useCallback(
		(updatedPostId, updaterFn) => {
			queryClient.setQueryData(["post", postId], (oldPost) => {
				if (!oldPost) return oldPost;
				if (oldPost._id === updatedPostId) return updaterFn(oldPost);
				if (oldPost.repostOf && oldPost.repostOf._id === updatedPostId) {
					return { ...oldPost, repostOf: updaterFn(oldPost.repostOf) };
				}
				return oldPost;
			});

			queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
				if (!Array.isArray(oldData)) return oldData;
				return oldData.map((p) => {
					if (p._id === updatedPostId) return updaterFn(p);
					if (p.repostOf && p.repostOf._id === updatedPostId) {
						return { ...p, repostOf: updaterFn(p.repostOf) };
					}
					return p;
				});
			});

			queryClient.setQueriesData({ queryKey: ["bookmarkedPosts"] }, (oldData) => {
				if (!Array.isArray(oldData)) return oldData;
				return oldData.map((p) => {
					if (p._id === updatedPostId) return updaterFn(p);
					if (p.repostOf && p.repostOf._id === updatedPostId) {
						return { ...p, repostOf: updaterFn(p.repostOf) };
					}
					return p;
				});
			});
		},
		[queryClient, postId]
	);

	// 3. Socket.io listeners for real-time post & comment sync
	useEffect(() => {
		if (!socket || !targetPostId) return;

		const handleNewComment = ({ postId: incomingPostId, comment: incomingComment }) => {
			if (incomingPostId?.toString() === targetPostId?.toString()) {
				updatePostInCache(targetPostId, (p) => {
					const existing = p.comments || [];
					if (existing.some((c) => c._id === incomingComment._id)) return p;
					return { ...p, comments: [...existing, incomingComment] };
				});
			}
		};

		const handleCommentDeleted = ({ postId: incomingPostId, commentId: deletedCommentId }) => {
			if (incomingPostId?.toString() === targetPostId?.toString()) {
				updatePostInCache(targetPostId, (p) => ({
					...p,
					comments: (p.comments || []).filter((c) => c._id !== deletedCommentId),
				}));
			}
		};

		const handleLikesUpdated = ({ postId: incomingPostId, likes: newLikes }) => {
			if (incomingPostId?.toString() === targetPostId?.toString()) {
				updatePostInCache(targetPostId, (p) => ({
					...p,
					likes: newLikes,
				}));
			}
		};

		const handleCommentLikesUpdated = ({ postId: incomingPostId, commentId, likes: newLikes }) => {
			if (incomingPostId?.toString() === targetPostId?.toString()) {
				updatePostInCache(targetPostId, (p) => ({
					...p,
					comments: (p.comments || []).map((c) =>
						c._id === commentId ? { ...c, likes: newLikes } : c
					),
				}));
			}
		};

		socket.on("newComment", handleNewComment);
		socket.on("commentDeleted", handleCommentDeleted);
		socket.on("postLikesUpdated", handleLikesUpdated);
		socket.on("commentLikesUpdated", handleCommentLikesUpdated);

		return () => {
			socket.off("newComment", handleNewComment);
			socket.off("commentDeleted", handleCommentDeleted);
			socket.off("postLikesUpdated", handleLikesUpdated);
			socket.off("commentLikesUpdated", handleCommentLikesUpdated);
		};
	}, [socket, targetPostId, updatePostInCache]);

	// 4. Auto-scroll and highlight comment when targetCommentId is in URL query params
	useEffect(() => {
		if (!targetCommentId || !displayPost?.comments?.length) return;

		const timer = setTimeout(() => {
			const el = document.getElementById(`comment_${targetCommentId}`);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
				setHighlightedCommentId(targetCommentId);
				const removeTimer = setTimeout(() => {
					setHighlightedCommentId((prev) => (prev === targetCommentId ? null : prev));
				}, 2500);
				return () => clearTimeout(removeTimer);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [targetCommentId, displayPost?.comments]);

	// 5. Actions / Mutations
	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to delete post");
			return data;
		},
		onSuccess: () => {
			toast.success(t("postDeletedToast") || "Post deleted");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
			navigate("/");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/like/${targetPostId}`, { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onMutate: async () => {
			const userId = authUser?._id;
			if (!userId) return;
			updatePostInCache(targetPostId, (p) => {
				const currentLikes = p.likes || [];
				const alreadyLiked = currentLikes.some((id) => id?.toString() === userId.toString());
				const newLikes = alreadyLiked
					? currentLikes.filter((id) => id?.toString() !== userId.toString())
					: [...currentLikes, userId];
				return { ...p, likes: newLikes };
			});
		},
		onSuccess: (updatedLikes) => {
			updatePostInCache(targetPostId, (p) => ({ ...p, likes: updatedLikes }));
		},
		onError: (err) => {
			toast.error(err.message);
			queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});

	const { mutate: toggleBookmark, isPending: isBookmarking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/bookmark/${targetPostId}`, { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onMutate: async () => {
			queryClient.setQueryData(["authUser"], (oldAuth) => {
				if (!oldAuth) return oldAuth;
				const currentBookmarks = oldAuth.bookmarks || [];
				const alreadyBookmarked = currentBookmarks.some((id) => id?.toString() === targetPostId.toString());
				const updatedBookmarks = alreadyBookmarked
					? currentBookmarks.filter((id) => id?.toString() !== targetPostId.toString())
					: [...currentBookmarks, targetPostId];
				return { ...oldAuth, bookmarks: updatedBookmarks };
			});
		},
		onSuccess: (data) => {
			toast.success(data.isBookmarked ? (t("savedToBookmarks") || "Saved") : (t("removedFromBookmarks") || "Removed"));
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

	const { mutate: sharePostMutation, isPending: isSharing } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/share/${targetPostId}`, { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (data) => {
			toast.success(data.isShared ? (t("sharedPostToast") || "Shared post") : (t("unsharedPostToast") || "Unshared post"));
			updatePostInCache(targetPostId, (p) => {
				const currentReposts = p.reposts || [];
				const updatedReposts = data.isShared
					? [...currentReposts, authUser._id]
					: currentReposts.filter((id) => id?.toString() !== authUser._id.toString());
				return { ...p, reposts: updatedReposts };
			});
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/comment/${targetPostId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text: commentText,
					replyTo: replyingTo
						? {
								commentId: replyingTo.commentId,
								username: replyingTo.username,
								text: replyingTo.text,
						  }
						: undefined,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (updatedPost) => {
			toast.success(t("commentAddedToast") || "Comment added");
			setCommentText("");
			setReplyingTo(null);
			updatePostInCache(targetPostId, (p) => ({
				...p,
				comments: updatedPost.comments,
			}));
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const { mutate: likeCommentMutation } = useMutation({
		mutationFn: async (commentId) => {
			const res = await fetch(`/api/posts/${targetPostId}/comments/${commentId}/like`, {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to like comment");
			return data;
		},
		onMutate: async (commentId) => {
			const userId = authUser?._id;
			if (!userId) return;
			updatePostInCache(targetPostId, (p) => ({
				...p,
				comments: (p.comments || []).map((c) => {
					if (c._id !== commentId) return c;
					const currentLikes = c.likes || [];
					const alreadyLiked = currentLikes.some((id) => id?.toString() === userId.toString());
					const newLikes = alreadyLiked
						? currentLikes.filter((id) => id?.toString() !== userId.toString())
						: [...currentLikes, userId];
					return { ...c, likes: newLikes };
				}),
			}));
		},
		onSuccess: (data) => {
			if (data?.commentId && data?.likes) {
				updatePostInCache(targetPostId, (p) => ({
					...p,
					comments: (p.comments || []).map((c) =>
						c._id === data.commentId ? { ...c, likes: data.likes } : c
					),
				}));
			}
		},
		onError: (err) => {
			toast.error(err.message);
			queryClient.invalidateQueries({ queryKey: ["post", postId] });
		},
	});

	const { mutate: deleteCommentAction, isPending: isDeletingComment } = useMutation({
		mutationFn: async (commentId) => {
			const res = await fetch(`/api/posts/${targetPostId}/comments/${commentId}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to delete comment");
			return { data, commentId };
		},
		onSuccess: ({ commentId }) => {
			toast.success(t("commentDeletedToast") || "Comment deleted");
			if (replyingTo?.commentId === commentId) {
				setReplyingTo(null);
			}
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
		if (!commentText.trim() || isCommenting) return;
		commentPost();
	};

	const handleScrollToOriginal = (origCommentId) => {
		if (!origCommentId) return;
		const el = document.getElementById(`comment_${origCommentId}`);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
			setHighlightedCommentId(origCommentId);
			setTimeout(() => {
				setHighlightedCommentId((prev) => (prev === origCommentId ? null : prev));
			}, 1500);
		}
	};

	if (isLoading) {
		return (
			<div className='flex-1 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] min-h-screen max-w-2xl xl:max-w-3xl w-full flex items-center justify-center py-20'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className='flex-1 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] min-h-screen max-w-2xl xl:max-w-3xl w-full flex flex-col items-center justify-center p-12 text-center'>
				<AlertCircle className='w-10 h-10 text-rose-500 mb-3' />
				<h3 className='font-bold text-slate-800 dark:text-slate-200 text-base'>
					{t("postNotFound") || "Post not found"}
				</h3>
				<p className='text-xs text-slate-500 mt-1 mb-4'>{error?.message || "Could not retrieve post"}</p>
				<button onClick={() => navigate(-1)} className='gradient-btn px-4 py-2 rounded-xl text-xs'>
					{t("backToFeed") || "Go back"}
				</button>
			</div>
		);
	}

	return (
		<div className='flex-1 ltr:border-r rtl:border-l border-black/10 dark:border-white/[0.08] min-h-screen max-w-2xl xl:max-w-3xl w-full transition-colors duration-200 pb-20'>
			{/* Top Bar Header with Back Navigation */}
			<div className='sticky top-0 z-20 backdrop-blur-xl bg-base-100/90 dark:bg-[#0d111a]/85 border-b border-black/10 dark:border-white/[0.08] px-4 py-3.5 flex items-center gap-4 transition-colors duration-200'>
				<button
					onClick={() => navigate(-1)}
					className='p-2 rounded-2xl text-slate-500 dark:text-slate-300 hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/5 transition'
					title={t("close") || "Back"}
				>
					{isRTL ? <ArrowRight className='w-5 h-5' /> : <ArrowLeft className='w-5 h-5' />}
				</button>
				<div className='text-start'>
					<h1 className='font-bold text-base text-slate-900 dark:text-white leading-tight'>
						{t("postHeader") || "Post"}
					</h1>
					<p className='text-[11px] text-slate-500 dark:text-slate-400'>
						@{postOwner.username}
					</p>
				</div>
			</div>

			{/* Main Full-Width Post Article */}
			<div className='p-5 border-b border-black/10 dark:border-white/[0.08]'>
				{isRepost && sharerUser && (
					<div className='flex items-center gap-2 mb-3 px-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
						<Repeat2 className='w-4 h-4 shrink-0' />
						<Link to={`/profile/${sharerUser.username}`} className='hover:underline flex items-center gap-1 truncate'>
							<span>
								{sharerUser._id === authUser?._id
									? (t("youShared") || "You shared this post")
									: `${sharerUser.fullName} ${t("userShared") || "shared this"}`}
							</span>
						</Link>
					</div>
				)}

				{/* Post Author Info Row */}
				<div className='flex items-center justify-between gap-3 mb-4'>
					<div className='flex items-center gap-3 min-w-0'>
						<Link to={`/profile/${postOwner.username}`} className='shrink-0 group'>
							<img
								src={postOwner.profileImg || "/avatar-placeholder.png"}
								alt={postOwner.username}
								className='w-12 h-12 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/10 group-hover:ring-indigo-500 transition duration-200'
							/>
						</Link>
						<div className='flex flex-col min-w-0 text-start'>
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
						</div>
					</div>

					{isMyPost && (
						<button
							onClick={() => deletePost()}
							disabled={isDeleting}
							title={t("deletePost") || "Delete post"}
							className='p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition'
						>
							{isDeleting ? <LoadingSpinner size='xs' /> : <Trash2 className='w-4 h-4' />}
						</button>
					)}
				</div>

				{/* Post Main Text */}
				<div className='text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed break-words whitespace-pre-line text-start mb-4 font-normal'>
					{displayPost.text}
				</div>

				{/* Post Media Image */}
				{displayPost.img && (
					<div className='mb-4 rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 max-h-[520px]'>
						<img
							src={displayPost.img}
							className='w-full h-auto max-h-[520px] object-contain rounded-3xl'
							alt='Post visual'
						/>
					</div>
				)}

				{/* Post Timestamp */}
				<div className='pb-3.5 border-b border-black/10 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400 text-start font-medium'>
					{formattedDate}
				</div>

				{/* Metrics / Counts Bar */}
				<div className='flex items-center gap-6 py-3 border-b border-black/10 dark:border-white/[0.08] text-xs text-start'>
					<div>
						<span className='font-bold text-slate-900 dark:text-white'>{displayPost.likes?.length || 0}</span>{" "}
						<span className='text-slate-500'>{t("feedLikes") || "Likes"}</span>
					</div>
					<div>
						<span className='font-bold text-slate-900 dark:text-white'>{displayPost.comments?.length || 0}</span>{" "}
						<span className='text-slate-500'>{t("discussionTitle") || "Comments"}</span>
					</div>
					<div>
						<span className='font-bold text-slate-900 dark:text-white'>{displayPost.reposts?.length || 0}</span>{" "}
						<span className='text-slate-500'>{t("sharePost") || "Shares"}</span>
					</div>
				</div>

				{/* Interactive Actions Bar */}
				<div className='flex items-center justify-around py-2 pt-3 text-slate-500 dark:text-slate-400'>
					<button
						onClick={() => commentInputRef.current?.focus()}
						className='flex items-center gap-2 p-2 rounded-2xl hover:text-indigo-500 hover:bg-indigo-500/10 transition group text-xs font-semibold'
					>
						<MessageCircle className='w-5 h-5 group-hover:scale-110 transition-transform' />
					</button>

					<button
						onClick={() => sharePostMutation()}
						disabled={isSharing}
						className={`flex items-center gap-2 p-2 rounded-2xl transition group text-xs font-semibold ${
							isSharedByMe
								? "text-emerald-500 bg-emerald-500/10"
								: "hover:text-emerald-500 hover:bg-emerald-500/10"
						}`}
					>
						{isSharing ? (
							<LoadingSpinner size='xs' />
						) : (
							<Repeat2 className={`w-5 h-5 transition-transform duration-200 ${isSharedByMe ? "rotate-180" : "group-hover:rotate-180"}`} />
						)}
					</button>

					<button
						onClick={() => likePost()}
						disabled={isLiking}
						className={`flex items-center gap-2 p-2 rounded-2xl transition group text-xs font-semibold ${
							isLiked
								? "text-rose-500 bg-rose-500/10"
								: "hover:text-rose-500 hover:bg-rose-500/10"
						}`}
					>
						{isLiking ? (
							<LoadingSpinner size='xs' />
						) : (
							<Heart
								className={`w-5 h-5 transition-all duration-200 ${
									isLiked ? "fill-rose-500 text-rose-500 scale-110" : "group-hover:scale-125"
								}`}
							/>
						)}
					</button>

					<button
						onClick={() => toggleBookmark()}
						disabled={isBookmarking}
						className={`p-2 rounded-2xl transition group ${
							isBookmarked
								? "text-amber-500 bg-amber-500/10"
								: "hover:text-amber-500 hover:bg-amber-500/10"
						}`}
					>
						{isBookmarking ? (
							<LoadingSpinner size='xs' />
						) : (
							<Bookmark className={`w-5 h-5 transition-transform ${isBookmarked ? "fill-amber-500 scale-110" : ""}`} />
						)}
					</button>
				</div>
			</div>

			{/* Inline Comment Creation Box */}
			<div className='p-4 border-b border-black/10 dark:border-white/[0.08] bg-base-100/50 dark:bg-surface-200/20'>
				{/* Reply preview pill if replying */}
				{replyingTo && (
					<div className='flex items-center justify-between gap-2 px-3 py-1.5 mb-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-start'>
						<div className='flex items-center gap-1.5 min-w-0'>
							<Reply className={`w-3.5 h-3.5 text-indigo-500 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
							<span className='font-semibold text-indigo-500 shrink-0'>
								{t("replyingTo") || "Replying to"} @{replyingTo.username}:
							</span>
							<span className='text-slate-600 dark:text-slate-300 truncate'>
								{replyingTo.text}
							</span>
						</div>
						<button
							type='button'
							onClick={() => setReplyingTo(null)}
							title={t("cancelReply") || "Cancel"}
							className='p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition'
						>
							<X className='w-3.5 h-3.5' />
						</button>
					</div>
				)}

				<form onSubmit={handlePostComment} className='flex gap-3 items-start'>
					<img
						src={authUser?.profileImg || "/avatar-placeholder.png"}
						alt={authUser?.username}
						className='w-10 h-10 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/10 shrink-0'
					/>
					<div className='flex-1 flex flex-col gap-2'>
						<textarea
							ref={commentInputRef}
							rows={2}
							className='w-full glass-input rounded-2xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 text-start resize-none'
							placeholder={t("writeReplyPlaceholder") || "Post your reply..."}
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
						/>
						<div className='flex justify-end'>
							<button
								type='submit'
								disabled={isCommenting || !commentText.trim()}
								className='gradient-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed'
							>
								{isCommenting ? (
									<LoadingSpinner size='xs' />
								) : (
									<>
										<Send className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
										<span>{t("replyButton") || "Reply"}</span>
									</>
								)}
							</button>
						</div>
					</div>
				</form>
			</div>

			{/* Full Scrollable List of Comments */}
			<div className='p-4 flex flex-col gap-3'>
				{(!displayPost.comments || displayPost.comments.length === 0) && (
					<div className='text-center py-12 text-slate-400 flex flex-col items-center gap-2'>
						<Sparkles className='w-8 h-8 text-slate-400' />
						<p className='text-xs'>{t("noCommentsYet") || "No comments yet. Start the conversation!"}</p>
					</div>
				)}

				{displayPost.comments?.map((c, idx) => {
					const commentUser = c.user || {};
					const isCommentOwner = authUser?._id?.toString() === commentUser?._id?.toString();
					const isPostAuthor = displayPost.user?._id?.toString() === commentUser?._id?.toString();
					const isOwnerOfPost = authUser?._id?.toString() === displayPost.user?._id?.toString();
					const canDelete = isCommentOwner || isOwnerOfPost;
					const commentLikes = c.likes || [];
					const hasLikedComment = commentLikes.some((id) => id?.toString() === authUser?._id?.toString());
					const isHighlighted = highlightedCommentId === c._id;

					return (
						<div
							key={c._id || idx}
							id={`comment_${c._id}`}
							className={`flex flex-col max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 border transition-all duration-300 relative group/comment ${
								isCommentOwner
									? "self-end bg-indigo-600/15 border-indigo-500/30 text-start"
									: "self-start bg-base-200 dark:bg-surface-100/60 border-black/5 dark:border-white/[0.04] text-start"
							} ${
								isHighlighted
									? "ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/25 scale-[1.02]"
									: ""
							}`}
						>
							{/* Telegram-style Quoted Reply Preview */}
							{c.replyTo && c.replyTo.commentId && (
								<div
									onClick={() => handleScrollToOriginal(c.replyTo.commentId)}
									className='mb-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 border-l-2 rtl:border-l-0 rtl:border-r-2 border-indigo-500 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs'
									title={t("replyingTo") || "Replying to"}
								>
									<div className='flex items-center gap-1 font-semibold text-indigo-500 text-[11px] truncate'>
										<Reply className={`w-3 h-3 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
										<span>@{c.replyTo.username || "user"}</span>
									</div>
									{c.replyTo.text && (
										<p className='text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5'>
											{c.replyTo.text}
										</p>
									)}
								</div>
							)}

							<div className='flex items-start gap-2.5'>
								<Link to={`/profile/${commentUser.username}`} className='shrink-0'>
									<img
										src={commentUser.profileImg || "/avatar-placeholder.png"}
										alt={commentUser.username}
										className='w-8 h-8 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/10'
									/>
								</Link>

								<div className='flex flex-col flex-1 min-w-0'>
									<div className='flex items-center justify-between gap-2'>
										<div className='flex items-center gap-1.5 flex-wrap min-w-0'>
											<Link
												to={`/profile/${commentUser.username}`}
												className='font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-indigo-500 truncate'
											>
												{commentUser.fullName}
											</Link>
											<span className='text-[10px] text-slate-500 truncate'>
												@{commentUser.username}
											</span>
											{isPostAuthor && (
												<span className='px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'>
													{t("authorBadge") || "Author"}
												</span>
											)}
										</div>

										{canDelete && (
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													deleteCommentAction(c._id);
												}}
												disabled={isDeletingComment}
												title={t("deleteComment") || "Delete comment"}
												className='opacity-0 group-hover/comment:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition duration-150'
											>
												<Trash2 className='w-3 h-3' />
											</button>
										)}
									</div>

									{/* Comment Content */}
									<p className='text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed break-words whitespace-pre-line'>
										{c.text}
									</p>

									{/* Reply & Like Buttons */}
									<div className='flex items-center gap-3 mt-2 pt-1.5 border-t border-black/5 dark:border-white/[0.04] text-slate-500 dark:text-slate-400'>
										<button
											type='button'
											onClick={() => {
												setReplyingTo({
													commentId: c._id,
													username: commentUser.username || "",
													text: c.text?.slice(0, 70) || "",
												});
												commentInputRef.current?.focus();
											}}
											className='flex items-center gap-1 text-[11px] font-medium hover:text-indigo-500 transition-colors'
										>
											<Reply className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
											<span>{t("replyButton") || "Reply"}</span>
										</button>

										<button
											type='button'
											onClick={() => likeCommentMutation(c._id)}
											className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
												hasLikedComment ? "text-rose-500 font-semibold" : "hover:text-rose-500"
											}`}
										>
											<Heart
												className={`w-3 h-3 transition-transform ${
													hasLikedComment ? "fill-rose-500 text-rose-500 scale-110" : ""
												}`}
											/>
											<span>{commentLikes.length > 0 ? commentLikes.length : 0}</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default PostDetailPage;
