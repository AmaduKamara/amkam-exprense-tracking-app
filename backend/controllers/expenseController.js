import Expense from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";

// Add expense
export const addExpense = async (req, res) => {
  // Get the user id from the req.user
  const userId = await req.user._id;
  // Get the expense data from the req.body
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create new expense
    const newExpense = new Expense({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    // Save the new expense to the dtabase
    await newExpense.save();

    // Return success message
    res.status(201).json({
      success: true,
      message: "Expense added successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// Get All Expense controller
export const getAllExpense = async (req, res) => {
  // Get the user id from the req.user
  const userId = req.user._id;

  try {
    // Find expense for that particular user and sort it to the lates expense
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    // Return the json response of the expense fetched
    res.status(200).json({ success: true, expense });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// Update an expense controller
export const updateExpense = async (req, res) => {
  // Get the id from the req.parames
  const { id } = req.params;
  // Get the user id from the req.user
  const userId = req.user._id;
  // Get the data to be updated
  const { description, amount } = req.body;

  try {
    // Find the expense data to be updated
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { description, amount },
      { new: true },
    );

    // If the updated expense not found
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Return updated expense
    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};
