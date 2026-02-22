const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Expense = require("./model/todo"); // Updated Model Import

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/expenseDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("Mongo Error ❌:", err));

/* GET all expenses */
app.get("/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ADD expense */
app.post("/expenses", async (req, res) => {
    try {
        const { name, amount, category, date } = req.body;
        const newExpense = new Expense({
            name,
            amount,
            category,
            date,
            paid: false
        });

        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* UPDATE paid status */
app.put("/expenses/:id", async (req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { paid: req.body.paid },
            { new: true }
        );
        res.json(updatedExpense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* DELETE expense */
app.delete("/expenses/:id", async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* Start Server */

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:3000 🚀`);
});