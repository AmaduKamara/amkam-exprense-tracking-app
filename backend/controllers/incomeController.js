import XLSL from "xlsx";

import Income from "../models/incomeModel.js";
import getDateRange from "../utils/dataFilter.js";

// Add income controller
export const addIncome = async (req, res) => {
  // Get the user id from the req.user
  const userId = await req.user._id;
  // Get the income date from the req.body
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create new income
    const newIncome = new Income({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    // Save the new incone to the dtabase
    await newIncome.save();

    // Return success message
    res.status(201).json({
      success: true,
      message: "Income added successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// Get All Income controller
export const getAllIncome = async (req, res) => {
  // Get the user id from the req.user
  const userId = req.user._id;

  try {
    // Find income for that particular user and sort it to the lates income
    const income = await Income.find({ userId }).sort({ date: -1 });

    // Return the json response of the income fetched
    res.status(200).json({ success: true, income });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// Update an income controller
export const updateIncome = async (req, res) => {
  // Get the id from the req.parames
  const { id } = req.params;
  // Get the user id from the req.user
  const userId = req.user._id;
  // Get the data to be updated
  const { description, amount } = req.body;

  try {
    // Find the income data to be update
    const updatedIncome = await Income.findOneAndUpdate(
      { _id: id, userId },
      { description, date },
      { new: true },
    );

    // If the updated income not found
    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // Return updated income
    res.status(200).json({
      success: true,
      message: "Income updated successfully",
      data: updatedIncome,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// Delete Income controller
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete({ _id: req.params.id });
    if (!income) {
      return res.status(404).json({
        successs: false,
        message: "Income not found",
      });
    }

    // If income is found, it is deleted
    return res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

export const downloadIncomeExcell = async (req, res) => {
  // Get the user id from the req.user
  const userId = req.user._id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: new Date(inc.date).toLocaleDateString(),
    }));

    // Create an excel file to be downloaded
    const worksheet = XLSX.utils.json_to_sheet(plainData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income");
    XLSX.writeFile(workbook, "income_details.xlsx");
    res.download("income_details.xlsx");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};

// Get income overview controller
export const getIncomeOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);

    const incomes = await Income.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;

    const recentTransactions = incomes.slice(0, 9);

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};
