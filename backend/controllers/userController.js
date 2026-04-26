import validator from "validator";
import bcrypt from "bcryptjs";

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

    // Return the created user and their token created
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred",
    });
  }
};

// LOGIN USER CONTROLLER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Fill in all fields",
    });
  }

  try {
    // Fetch the user first to check if exists
    const user = await User.findOne({ email });

    // Check if user is not found and return invalid email or password, as that user is not registered yet.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password matches for the user - that is if in the case the email exists and return false if password passed not matched with the existing emails's password
    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // CREATE LOGIN TOKEN FOR THE USER WHEN LOGIN IS SUCCESSFUL
    const token = createToken(user._id);

    // Return the logged in user and their logged in token
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
    // Get the user by their id and return only their name and email
    const user = await User.findById(req.user.id).select("name email");

    // Check if user not found and return a message
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the user when is found
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error" || error.message,
    });
  }
};

// UPDATE A USER
export const updateUser = async (req, res) => {
  // Get the name and email to be updated for a user from the req.body
  const { name, email } = req.body;

  // Check if name and email not provided and the email provided is a valid email. If not, return a invalid response
  if (!name || !email || !validator.isEmail(email)) {
    return res.ststus(400).json({
      success: false,
      message: "Valid name and email are required",
    });
  }

  try {
    // Find an existing user through their email
    const exist = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exist) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Find the user by ID and update their data passed 
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true, select: "name email" },
    );

    // Return updated user
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error" || error.message,
    });
  }
};

// UPDATE USER'S PASSWORD
export const updatePassword = async (req, res) => {
  // Get the current password and new password from req.body
  const { currentPassword, newPassword } = req.body;

  // If not entered, return invalid or too short passwords entered
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password invalid or too short.",
    });
  }

  try {
    // Find and select the user's password
    const user = await User.findById(req.user.id).select("password");
    // If user not found, return user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare the passwords
    const matchedPassowrd = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    // Passwords not matched, return incorrect passwords 
    if (!matchedPassowrd) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }
    // Update the user password and hash it before saving it
    user.password = await bcrypt.hash(newPassword, 10);

    // Save the new user's password
    await user.save();

    // Return password changed success message
    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error" || error.message,
    });
  }
};
