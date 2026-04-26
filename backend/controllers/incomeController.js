import Income from "../models/incomeModel.js";
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
    res.json({
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
    const income = (await Income.find({ userId })).toSorted({ date: -1 });

    // Return the json response of the income fetched
    res.json(income);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};
