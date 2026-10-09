import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { uploadBase64Image, deleteUploadThingFile } from "../lib/utils/uploadthing.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// Helper for standard post population
const populatePostQuery = (query) => {
	return query
		.populate({
			path: "user",
			select: "-password",
		})
		.populate({
			path: "comments.user",
			select: "-password",
		})
		.populate({
			path: "repostOf",
			populate: [
				{ path: "user", select: "-password" },
				{ path: "comments.user", select: "-password" },
			],
		});
};

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			img = await uploadBase64Image(img);
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();

		const populatedPost = await populatePostQuery(Post.findById(newPost._id));
		res.status(201).json(populatedPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			await deleteUploadThingFile(post.img);
		}

		if (post.repostOf) {
			await Post.findByIdAndUpdate(post.repostOf, { $pull: { reposts: req.user._id } });
		} else {
			await Post.deleteMany({ repostOf: post._id });
		}

		await User.updateMany(
			{ $or: [{ bookmarks: post._id }, { likedPosts: post._id }] },
			{ $pull: { bookmarks: post._id, likedPosts: post._id } }
		);

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentOnPost = async (req, res) => {
	try {
		const { text, replyTo } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text || !text.trim()) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = {
			user: userId,
			text: text.trim(),
			createdAt: new Date(),
			likes: [],
			replyTo: replyTo && replyTo.commentId ? {
				commentId: replyTo.commentId,
				username: replyTo.username || "",
				text: replyTo.text || "",
			} : undefined,
		};

		post.comments.push(comment);
		await post.save();

		const populatedPost = await populatePostQuery(Post.findById(postId));

		// 🚀 Real-time comment broadcast
		const newComment = populatedPost.comments[populatedPost.comments.length - 1];
		io.emit("newComment", { postId, comment: newComment });

		// 🔔 Reply & Comment Notifications
		let repliedUserId = null;
		if (replyTo?.commentId) {
			const parentComment = post.comments.id(replyTo.commentId) || post.comments.find((c) => c._id.toString() === replyTo.commentId);
			if (parentComment && parentComment.user.toString() !== userId.toString()) {
				repliedUserId = parentComment.user.toString();
				const replyNotification = new Notification({
					from: userId,
					to: parentComment.user,
					type: "reply",
					post: postId,
					commentId: newComment?._id?.toString() || null,
				});
				await replyNotification.save();

				const receiverSocketId = getReceiverSocketId(parentComment.user.toString());
				if (receiverSocketId) {
					const populatedNotification = await Notification.findById(replyNotification._id).populate({
						path: "from",
						select: "username fullName profileImg",
					});
					io.to(receiverSocketId).emit("newNotification", populatedNotification);
				}
			}
		}

		// 🔔 Create and send comment notification to post owner (if not the author and not already notified via reply)
		if (post.user.toString() !== userId.toString() && post.user.toString() !== repliedUserId) {
			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "comment",
				post: postId,
				commentId: newComment?._id?.toString() || null,
			});
			await notification.save();

			const receiverSocketId = getReceiverSocketId(post.user.toString());
			if (receiverSocketId) {
				const populatedNotification = await Notification.findById(notification._id).populate({
					path: "from",
					select: "username fullName profileImg",
				});
				io.to(receiverSocketId).emit("newNotification", populatedNotification);
			}
		}

		res.status(200).json(populatedPost);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteComment = async (req, res) => {
	try {
		const { postId, commentId } = req.params;
		const userId = req.user._id.toString();

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = post.comments.find((c) => c._id.toString() === commentId);
		if (!comment) {
			return res.status(404).json({ error: "Comment not found" });
		}

		if (comment.user.toString() !== userId && post.user.toString() !== userId) {
			return res.status(401).json({ error: "You are not authorized to delete this comment" });
		}

		post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
		await post.save();

		const populatedPost = await populatePostQuery(Post.findById(postId));

		// 🚀 Real-time comment deletion broadcast
		io.emit("commentDeleted", { postId, commentId });

		res.status(200).json(populatedPost);
	} catch (error) {
		console.log("Error in deleteComment controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeComment = async (req, res) => {
	try {
		const { postId, commentId } = req.params;
		const userId = req.user._id;

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = post.comments.id(commentId) || post.comments.find((c) => c._id.toString() === commentId);
		if (!comment) {
			return res.status(404).json({ error: "Comment not found" });
		}

		if (!comment.likes) {
			comment.likes = [];
		}

		const hasLiked = comment.likes.some((id) => id.toString() === userId.toString());
		let updatedLikes;

		if (hasLiked) {
			comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
			updatedLikes = comment.likes;
		} else {
			comment.likes.push(userId);
			updatedLikes = comment.likes;

			// 🔔 If liking someone else's comment, create and emit notification
			if (comment.user.toString() !== userId.toString()) {
				const notification = new Notification({
					from: userId,
					to: comment.user,
					type: "like",
					post: postId,
					commentId: commentId,
				});
				await notification.save();

				const receiverSocketId = getReceiverSocketId(comment.user.toString());
				if (receiverSocketId) {
					const populatedNotification = await Notification.findById(notification._id).populate({
						path: "from",
						select: "username fullName profileImg",
					});
					io.to(receiverSocketId).emit("newNotification", populatedNotification);
				}
			}
		}

		await post.save();

		// 🚀 Real-time comment likes broadcast
		io.emit("commentLikesUpdated", { postId, commentId, likes: updatedLikes });

		res.status(200).json({ commentId, likes: updatedLikes });
	} catch (error) {
		console.log("Error in likeComment controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.some((id) => id.toString() === userId.toString());

		let updatedLikes;
		if (userLikedPost) {
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
		} else {
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			updatedLikes = post.likes;

			// 🔔 Notification to post owner
			if (post.user.toString() !== userId.toString()) {
				const notification = new Notification({
					from: userId,
					to: post.user,
					type: "like",
					post: postId,
				});
				await notification.save();

				const receiverSocketId = getReceiverSocketId(post.user.toString());
				if (receiverSocketId) {
					const populatedNotification = await Notification.findById(notification._id).populate({
						path: "from",
						select: "username fullName profileImg",
					});
					io.to(receiverSocketId).emit("newNotification", populatedNotification);
				}
			}
		}

		// 🚀 Real-time like broadcast
		io.emit("postLikesUpdated", { postId, likes: updatedLikes });

		res.status(200).json(updatedLikes);
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// 🔖 BOOKMARK POST CONTROLLER
export const bookmarkPost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const isBookmarked = user.bookmarks && user.bookmarks.some((b) => b.toString() === postId.toString());

		if (isBookmarked) {
			await User.findByIdAndUpdate(userId, { $pull: { bookmarks: postId } });
			const updatedBookmarks = (user.bookmarks || []).filter((b) => b.toString() !== postId.toString());
			return res.status(200).json({ isBookmarked: false, bookmarks: updatedBookmarks, message: "Post removed from bookmarks" });
		} else {
			await User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: postId } });
			const updatedBookmarks = [...(user.bookmarks || []), postId];
			return res.status(200).json({ isBookmarked: true, bookmarks: updatedBookmarks, message: "Post saved to bookmarks" });
		}
	} catch (error) {
		console.log("Error in bookmarkPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getBookmarkedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const bookmarkedPosts = await populatePostQuery(
			Post.find({ _id: { $in: user.bookmarks } }).sort({ createdAt: -1 })
		);

		res.status(200).json(bookmarkedPosts || []);
	} catch (error) {
		console.log("Error in getBookmarkedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const sharePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const targetPost = await Post.findById(postId);
		if (!targetPost) {
			return res.status(404).json({ error: "Post not found" });
		}

		const originalPostId = targetPost.repostOf ? targetPost.repostOf : targetPost._id;
		const originalPost = await Post.findById(originalPostId);
		if (!originalPost) {
			return res.status(404).json({ error: "Original post not found" });
		}

		const existingShare = await Post.findOne({ user: userId, repostOf: originalPostId });

		if (existingShare) {
			await Post.findByIdAndDelete(existingShare._id);
			await Post.findByIdAndUpdate(originalPostId, { $pull: { reposts: userId } });

			const updatedOriginal = await Post.findById(originalPostId);
			const repostCount = updatedOriginal?.reposts?.length || 0;

			return res.status(200).json({ isShared: false, repostCount, message: "Post unshared successfully" });
		} else {
			const newShare = new Post({
				user: userId,
				repostOf: originalPostId,
			});
			await newShare.save();

			await Post.findByIdAndUpdate(originalPostId, { $addToSet: { reposts: userId } });

			if (originalPost.user.toString() !== userId.toString()) {
				const notification = new Notification({
					from: userId,
					to: originalPost.user,
					type: "share",
					post: originalPostId,
				});
				await notification.save();

				const receiverSocketId = getReceiverSocketId(originalPost.user.toString());
				if (receiverSocketId) {
					const populatedNotification = await Notification.findById(notification._id).populate({
						path: "from",
						select: "username fullName profileImg",
					});
					io.to(receiverSocketId).emit("newNotification", populatedNotification);
				}
			}

			const updatedOriginal = await Post.findById(originalPostId);
			const repostCount = updatedOriginal?.reposts?.length || 0;

			return res.status(201).json({ isShared: true, repostCount, message: "Post shared successfully", sharePost: newShare });
		}
	} catch (error) {
		console.log("Error in sharePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await populatePostQuery(Post.find().sort({ createdAt: -1 }));
		res.status(200).json(posts || []);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await populatePostQuery(
			Post.find({ _id: { $in: user.likedPosts } }).sort({ createdAt: -1 })
		);

		res.status(200).json(likedPosts || []);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await populatePostQuery(
			Post.find({ user: { $in: following } }).sort({ createdAt: -1 })
		);

		res.status(200).json(feedPosts || []);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await populatePostQuery(
			Post.find({ user: user._id }).sort({ createdAt: -1 })
		);

		res.status(200).json(posts || []);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getPostById = async (req, res) => {
	try {
		const { id } = req.params;
		const post = await populatePostQuery(Post.findById(id));
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}
		res.status(200).json(post);
	} catch (error) {
		console.log("Error in getPostById controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};