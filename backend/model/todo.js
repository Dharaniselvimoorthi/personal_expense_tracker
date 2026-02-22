const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid"
  }
});

module.exports = mongoose.model("Todo", todoSchema);