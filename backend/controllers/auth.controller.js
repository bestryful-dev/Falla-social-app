import User from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import {generateTokenAndSetCookie} from "../lib/utils/generateTokens.js"
import { Resend } from "resend";


const getResendClient = () => {
    return new Resend(process.env.RESEND_API_KEY);
};

const sendVerificationEmail = async (email, code) => {
    try {
        const resend = getResendClient(); // Initializes here when the function runs (after dotenv has loaded)
        
        const { data, error } = await resend.emails.send({
            from: "Falla Social <onboarding@resend.dev>",
            to: [email],
            subject: "Falla App - Email Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome to Falla!</h2>
                    <p>Your email verification code is:</p>
                    <h1 style="color: #6366f1; letter-spacing: 2px;">${code}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend error:", error);
            throw new Error(error.message);
        }

        console.log("Verification email sent successfully:", data);
    } catch (error) {
        console.log("Error in sendVerificationEmail:", error.message);
        throw error;
    }
};

export const signup = async (req,res)=>{
    try {
         const fullName = req.body.fullName?.trim();
        const username = req.body.username?.trim().toLowerCase();
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"invalid email format"});
        }

        const existingUser = await User.findOne({username:username})
        if(existingUser){
            return res.status(400).json({error: "Username already taken"});
        }

        const existingEmail = await User.findOne({email:email})
        if(existingEmail){
            return res.status(400).json({error: "email already taken"});
        }

        if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Generate 6 digit OTP
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = Date.now() + 10 * 60 * 1000; 

        const newUser = new User({
            fullName:fullName,
            username:username,
            email:email,
            password:hashedPassword,
            verificationCode,
            verificationCodeExpires,
            isVerified: false,
        })

        if(newUser){
            // generateTokenAndSetCookie(newUser._id,res)
            await newUser.save()
            await sendVerificationEmail(email, verificationCode);

            // res.status(201).json({
            //     _id: newUser._id,
            //     fullName: newUser.fullName,
			// 	username: newUser.username,
			// 	email: newUser.email,
			// 	followers: newUser.followers,
			// 	following: newUser.following,
			// 	profileImg: newUser.profileImg,
			// 	coverImg: newUser.coverImg,
            // })
            res.status(201).json({
                message: "Verification code sent to your email",
                email: newUser.email, // Pass the email so frontend can track it
            });

        } else{
            res.status(400).json({error:"invalid user data"})
        }

        
    } catch (error) {
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    } 
    
}

export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email is already verified" });
        }

        if (!user.verificationCode || user.verificationCode !== code) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ error: "Verification code has expired" });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        // Now generate the token cookie so they are logged in!
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
    } catch (error) {
        console.log("Error in verifyEmail controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
///////////////
export const login = async (req, res) => {
    try {
        const username = req.body.username?.trim().toLowerCase();
        const { password } = req.body;
        // Find user by matching EITHER username OR email
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });

        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username/email or password" });
        }

        // Check if user has verified their email (from our previous step)
        if (!user.isVerified) {
            return res.status(400).json({ error: "Please verify your email before logging in." });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
        
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//////////////
export const logout = async (req,res)=>{
    try {

        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message:"logut successfully"})
        
    } catch (error) {
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
    
}


export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};