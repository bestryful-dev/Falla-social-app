import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  // 1. Generate the secure encrypted pass token (signs the user's distinct ID code)
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token remains valid inside the system for 30 full days
  });

  // 2. Drop the pass token into the browser's storage cookie vault
  res.cookie("jwt", token, {
    // 30 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    maxAge: 30 * 24 * 60 * 60 * 1000,

    httpOnly: true, // Security layer blocking browser scripts from reading the token
    sameSite: "strict", // Standard defense layout protecting against CSRF exploits
    secure: process.env.NODE_ENV !== "development", // Encrypts path transit if deployed live
  });
};

