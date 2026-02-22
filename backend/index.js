const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Todo = require("./model/todo");

const app = express();

app.use(cors());
app.use(express.json());

/* MongoDB Connection */
mongoose.connect("mongodb://localhost:27017/expenseDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* GET All Expenses */
app.get("/todos", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

/* ADD Expense */
app.post("/todos", async (req, res) => {
  const newTodo = new Todo(req.body);
  await newTodo.save();
  res.json(newTodo);
});

/* UPDATE Status */
app.put("/todos/:id", async (req, res) => {
  const updated = await Todo.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(updated);
});

/* DELETE Expense */
app.delete("/todos/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted Successfully" });
});

/* Server */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});