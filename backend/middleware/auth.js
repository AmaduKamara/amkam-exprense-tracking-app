import jwt from "jsonwebtoken";

import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  // Grab the token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized or token missing",
    });
  }

  // To get the token, split the auth header's ["Bearer", "Token"] to get the token-[1] from the returned array of the authHeader after the Bearer
  const token = authHeader.split(" ")[1];

  // Veryfy token
  try {
    // Verify the token and the secret if are original and valid
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the verified payload's id returned and then select out the password so it doesn't get returned
    const user = await User.findById(payload.id).select("-password");
    // Return user not found if not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the user if found to the requested user in the request
    req.user = user;

    next();
  } catch (error) {
    console.error("JWT verification failed: ", error);
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

export default authMiddleware;
