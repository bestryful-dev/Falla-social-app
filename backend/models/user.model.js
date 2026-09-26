

// ==========================================
// USER MODEL DEFINITION (MERN STACK BACKEND)
// ==========================================

// 1. IMPORT MONGOOSE
// Mongoose is the data-modeling library that allows Node.js to communicate with MongoDB Atlas.
import mongoose from "mongoose";

// 2. DEFINE THE USER SCHEMA
// A Schema acts as a structural blueprint or validation rulebook. 
// It dictates exactly what properties a user document MUST have before it is allowed to save in the cloud.
const userSchema = new mongoose.Schema(
	{
		// Unique string used to mention and identify the user on the app (e.g., @bestryfuldev)
		username: {
			type: String,     // Must be characters/text
			required: true,   // Cannot be empty or blank during signup
			unique: true,     // No two accounts on the platform can share the same username
		},
		
		// The user's real or display name shown prominently on their profile page
		fullName: {
			type: String,
			required: true,   // Every profile must have a readable name
		},
		
		// The encrypted/hashed passphrase used for secure logins
		password: {
			type: String,
			required: true,
			minLength: 6,     // Security check: Express will block any password shorter than 6 characters
		},
		
		// The primary contact address for account recovery, notifications, and verification
		email: {
			type: String,
			required: true,
			unique: true,     // One email address per single account rule
		},
		
		// FOLLOWER RELATIONSHIPS (Self-Referencing List)
		// This array tracks who is following this specific user.
		followers: [
			{
				// Storing a simple string name here would break if a user changes their name.
				// Instead, we store MongoDB's internal, unique 24-character hex ID identifier code.
				type: mongoose.Schema.Types.ObjectId,
				
				// This build an invisible data bridge to the "User" collection.
				// It tells Mongoose: "This ID points to another account inside this exact same table."
				ref: "User",
				
				// Initializes a brand new account with 0 followers
				default: [],
			},
		],
		
		// FOLLOWING RELATIONSHIPS (Self-Referencing List)
		// This array tracks the accounts this user has decided to follow.
		following: [
			{
				type: mongoose.Schema.Types.ObjectId, // Holds the distinct ID of the target accounts
				ref: "User",                          // Points directly back to the User model
				default: [],                          // Initializes a brand new account following 0 people
			},
		],
		
		// AVATAR / PROFILE PIC URL
		// Instead of saving heavy image file blobs in MongoDB, we upload images to Cloudinary.
		// Cloudinary gives us back a web link URL string (e.g., "https://cloudinary.com..."). We store that string here.
		profileImg: {
			type: String,
			default: "",      // Blank by default until the user uploads a custom picture
		},
		
		// BANNER / BACKGROUND COVER IMAGE URL
		coverImg: {
			type: String,
			default: "",      // Blank text layout by default
		},
		
		// PERSONAL BIO / SLOGAN
		bio: {
			type: String,
			default: "",      // Empty string by default until edited on the profile settings page
		},

		// EXTERNAL WEBSITE LINK / PORTFOLIO
		link: {
			type: String,
			default: "",      // Allows users to share their website/social links
		},
		
		// CONTENT INTERACTION TRACKING (Cross-Model Reference List)
		// Keeps a record of every social feed post this user has hit the "Heart/Like" button on.
		likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId, // Stores the 24-character ID of the post
				ref: "Post",                          // Points to a different database table ("Post" collection)
				default: [],                          // Starts fresh with an empty history array list
			},
		],
	},
	
	// 3. AUTOMATED METADATA CONFIGURATION
	// This option tells Mongoose to automatically inject two fields into every single record:
	// - createdAt: Records the precise date and millisecond when the user account was first created.
	// - updatedAt: Automatically logs the date and time whenever any schema property changes.
	{ timestamps: true }
);

// 4. GENERATE THE MODEL DATABASE COLLECTION INTERFACE
// This line takes our schema rules and uses them to construct an active data operations model.
// Mongoose automatically looks at the word "User", lowercases it, and pluralizes it to create 
// the actual storage bucket collection collection named "users" inside your MongoDB Atlas cloud.
const User = mongoose.model("User", userSchema);

// 5. EXPORT THE BLUEPRINT OBJECT
// Allows us to import this model into our authentication controllers to create, find, or update accounts easily.
export default User;
