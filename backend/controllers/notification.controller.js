import Notification from "../models/notification.model.js";

// 🔔 Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
	try {
		const userId = req.user._id;
		const count = await Notification.countDocuments({ to: userId, read: false });
		res.status(200).json({ count });
	} catch (error) {
		console.log("Error in getUnreadNotificationCount controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId })
			.sort({ createdAt: -1 })
			.populate({
				path: "from",
				select: "username fullName profileImg",
			});

		// Mark all unread notifications as read when opening notification page
		await Notification.updateMany({ to: userId, read: false }, { read: true });

		res.status(200).json(notifications || []);
	} catch (error) {
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });

		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};