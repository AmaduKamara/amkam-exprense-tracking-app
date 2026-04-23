import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import { createToken } from "../utils/createToken.js";

// REGISTER USER CONTROLLER
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

// LOGIN USER CONTROLLER
export const loginUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Fill in all fields",
    });
  }

  try {
    const user = await User.findOne({ email });

    // Check if user is not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password matches for the user
    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // CREATE LOGIN POKEN FOR THE USER WHEN LOGIN IS SUCCESSFUL
    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error" || error.message,
    });
  }
};

// GET LOGGEDIN USER OR CURRENTUSER DETAILS
export const getCurrentUser = async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user.id).select("name email");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the user
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error" || error.message,
    });
  }
};
