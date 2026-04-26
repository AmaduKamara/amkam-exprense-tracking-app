import Expense from "../controllers/incomeController.js";
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
