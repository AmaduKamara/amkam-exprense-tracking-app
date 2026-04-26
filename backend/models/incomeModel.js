import mongoose from "mongoose";
import { trim } from "validator";

const incomeSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }, // Income will be created for this particular user
    type: {
      type: String,
      default: "income",
    },
  },
  {
    timestamps: true,
  },
);

const incomeModel =
  mongoose.models.income || mongoose.model("Income", incomeSchema);
export default incomeModel;
