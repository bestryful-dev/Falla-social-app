import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	commentOnPost,
	deleteComment, // 👈 Added
	likeComment,
	createPost,
	deletePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
	getPostById,
	likeUnlikePost,
	bookmarkPost,
	getBookmarkedPosts,
	sharePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/bookmarks", protectRoute, getBookmarkedPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/:id", protectRoute, getPostById);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/bookmark/:id", protectRoute, bookmarkPost);
router.post("/share/:id", protectRoute, sharePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/:postId/comments/:commentId/like", protectRoute, likeComment);
router.delete("/:postId/comments/:commentId", protectRoute, deleteComment); 
router.delete("/:id", protectRoute, deletePost);

export default router;