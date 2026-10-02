import dotenv from "dotenv";
dotenv.config();

import { UTApi, UTFile } from "uploadthing/server";

export const utapi = new UTApi({
	token: process.env.UPLOADTHING_TOKEN,
});

/**
 * Converts a base64 Data URL string to a UTFile object and uploads it to UploadThing
 */
export const uploadBase64Image = async (base64String) => {
	try {
		if (!base64String || typeof base64String !== "string") {
			throw new Error("Invalid base64 string provided");
		}

		// Extract MIME type and raw buffer
		const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
		let mimeType = "image/png";
		let buffer;

		if (matches && matches.length === 3) {
			mimeType = matches[1];
			buffer = Buffer.from(matches[2], "base64");
		} else {
			buffer = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64");
		}

		const extension = mimeType.split("/")[1] || "png";
		const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

		// ✅ Use UploadThing's official UTFile for Buffer compatibility in Node:
		const file = new UTFile([buffer], fileName, { type: mimeType });

		const response = await utapi.uploadFiles([file]);

		console.log("UploadThing API Response:", JSON.stringify(response, null, 2));

		const uploadResult = Array.isArray(response) ? response[0] : response;

		if (uploadResult?.error) {
			console.error("UploadThing Error details:", uploadResult.error);
			throw new Error(uploadResult.error.message || "UploadThing upload failed");
		}

		if (uploadResult?.data) {
			return uploadResult.data.ufsUrl || uploadResult.data.url;
		}

		throw new Error("Upload failed: No data returned from UploadThing");
	} catch (error) {
		console.error("UploadThing helper error:", error);
		throw error;
	}
};

/**
 * Deletes a file from UploadThing by its URL or key
 */
export const deleteUploadThingFile = async (fileUrl) => {
	if (!fileUrl) return;
	try {
		if (fileUrl.includes("utfs.io") || fileUrl.includes("ufs.sh")) {
			const fileKey = fileUrl.split("/").pop();
			if (fileKey) {
				await utapi.deleteFiles(fileKey);
			}
		}
	} catch (error) {
		console.error("UploadThing file deletion error:", error.message);
	}
};