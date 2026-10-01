import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

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
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
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
			try {
				const imgId = post.img.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(imgId);
			} catch (e) {
				console.log("Image cleanup error: ", e);
			}
		}

		// If this post was a repost, update the original post's reposts array
		if (post.repostOf) {
			await Post.findByIdAndUpdate(post.repostOf, { $pull: { reposts: req.user._id } });
		} else {
			// If it's an original post, remove all shares of it
			await Post.deleteMany({ repostOf: post._id });
		}

		// Remove from bookmarks and likedPosts
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
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text || !text.trim()) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text: text.trim(), createdAt: new Date() };

		post.comments.push(comment);
		await post.save();

		const populatedPost = await populatePostQuery(Post.findById(postId));

		res.status(200).json(populatedPost);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
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

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			// Only send notification if liking someone else's post
			if (post.user.toString() !== userId.toString()) {
				const notification = new Notification({
					from: userId,
					to: post.user,
					type: "like",
				});
				await notification.save();
			}

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

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
			// Remove bookmark
			await User.findByIdAndUpdate(userId, { $pull: { bookmarks: postId } });
			const updatedBookmarks = (user.bookmarks || []).filter((b) => b.toString() !== postId.toString());
			return res.status(200).json({ isBookmarked: false, bookmarks: updatedBookmarks, message: "Post removed from bookmarks" });
		} else {
			// Add bookmark
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

		// If sharing a repost, resolve to the original post
		const originalPostId = targetPost.repostOf ? targetPost.repostOf : targetPost._id;
		const originalPost = await Post.findById(originalPostId);
		if (!originalPost) {
			return res.status(404).json({ error: "Original post not found" });
		}

		// Check if user already shared this post
		const existingShare = await Post.findOne({ user: userId, repostOf: originalPostId });

		if (existingShare) {
			// Unshare / delete repost
			await Post.findByIdAndDelete(existingShare._id);
			await Post.findByIdAndUpdate(originalPostId, { $pull: { reposts: userId } });

			const updatedOriginal = await Post.findById(originalPostId);
			const repostCount = updatedOriginal?.reposts?.length || 0;

			return res.status(200).json({ isShared: false, repostCount, message: "Post unshared successfully" });
		} else {
			// Create new share post
			const newShare = new Post({
				user: userId,
				repostOf: originalPostId,
			});
			await newShare.save();

			await Post.findByIdAndUpdate(originalPostId, { $addToSet: { reposts: userId } });

			// Send notification to original post owner if not sharing own post
			if (originalPost.user.toString() !== userId.toString()) {
				const notification = new Notification({
					from: userId,
					to: originalPost.user,
					type: "share",
				});
				await notification.save();
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

		if (!posts || posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
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