import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import { createToken } from "../utils/createToken.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Fill in all fields",
    });
  }

  // Check for invalid email
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "invalid email",
    });
  }

  // Check for password length
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  try {
    // Check is user email exists
    if (await User.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message: "User already exist",
      });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({ name, email, password: hashedPassword });

    // Create token
    const token = createToken(user._id);

    res.ststus(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error" || error.message,
    });
  }
};
