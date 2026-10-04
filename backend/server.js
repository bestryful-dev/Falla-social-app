import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectMongoDB from "./db/connectMongoDB.js";

// 🔌 Import app and server from socket.js
import { app, server } from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// 📱 Direct APK Download Route
app.get("/falla-social.apk", (req, res) => {
	const apkPath = path.resolve(__dirname, "frontend", "public", "falla-social.apk");
	res.download(apkPath, "falla-social.apk", (err) => {
		if (err) {
			console.log("APK download error:", err);
			res.status(404).send("APK file not found on server");
		}
	});
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*any", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// 🔌 Start HTTP + WebSocket Server
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectMongoDB();
});