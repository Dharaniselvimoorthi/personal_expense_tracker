import { useEffect, useState, useRef } from "react";
import "./App.css";

const API = "https://personal-expense-tracker-backend-e8br.onrender.com/expenses";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const canvasRef = useRef(null);

  /* ================= FETCH ================= */
  const fetchExpenses = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setExpenses(data.reverse());
      updateChart(data);
    } catch {
      showToast("Server Error ❌");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  /* ================= ADD ================= */
  const addExpense = async () => {
    if (!name || !amount || !category || !date) {
      showToast("Fill all fields ⚠");
      return;
    }

    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          category,
          date,
        }),
      });

      setName("");
      setAmount("");
      setCategory("");
      setDate("");

      showToast("Expense Added ✅");
      fetchExpenses();
    } catch {
      showToast("Add Failed ❌");
    }
  };

  /* ================= DELETE ================= */
  const deleteExpense = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    showToast("Deleted 🗑");
    fetchExpenses();
  };

  /* ================= TOGGLE PAID ================= */
  const togglePaid = async (exp) => {
    await fetch(`${API}/${exp._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !exp.paid }),
    });

    if (!exp.paid) launchConfetti();

    showToast("Status Updated 🔄");
    fetchExpenses();
  };

  /* ================= STATS ================= */
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paid = expenses
    .filter((e) => e.paid)
    .reduce((sum, e) => sum + e.amount, 0);
  const unpaid = total - paid;

  /* ================= CHART ================= */
  const updateChart = (data) => {
    const paidAmt = data
      .filter((e) => e.paid)
      .reduce((s, e) => s + e.amount, 0);

    const unpaidAmt =
      data.reduce((s, e) => s + e.amount, 0) - paidAmt;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const max = Math.max(paidAmt, unpaidAmt, 1);
    const chartHeight = 200;

    const paidHeight = (paidAmt / max) * chartHeight;
    const unpaidHeight = (unpaidAmt / max) * chartHeight;

    ctx.fillStyle = "#00ff88";
    ctx.fillRect(120, 250 - paidHeight, 120, paidHeight);

    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(350, 250 - unpaidHeight, 120, unpaidHeight);
  };

  useEffect(() => {
    updateChart(expenses);
  }, [expenses]);

  /* ================= TOAST ================= */
  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className = "toast show";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2500);
  };

  /* ================= CONFETTI ================= */
  const launchConfetti = () => {
    const colors = ["#00ff88", "#00ffff", "#ffffff", "#ff4d6d", "#ffd700"];

    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";
      document.body.appendChild(confetti);

      const size = Math.random() * 8 + 6;
      confetti.style.width = size + "px";
      confetti.style.height = size + "px";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      confetti.style.left = Math.random() * window.innerWidth + "px";

      confetti.animate(
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: `translateY(${window.innerHeight}px)`, opacity: 0 },
        ],
        { duration: 2000 }
      );

      setTimeout(() => confetti.remove(), 2000);
    }
  };

  return (
    <div className="container">
      <h1 className="title">💎 Expense Galaxy Dashboard</h1>

      {/* FORM */}
      <div className="form-card">
        <input
          type="text"
          placeholder="Expense Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Category</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
        </select>

        <button onClick={addExpense}>Add</button>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card total">
          <h3>Total</h3>
          <p>₹ {total}</p>
        </div>

        <div className="stat-card paid">
          <h3>Paid</h3>
          <p>₹ {paid}</p>
        </div>

        <div className="stat-card unpaid">
          <h3>Unpaid</h3>
          <p>₹ {unpaid}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-container">
        <canvas ref={canvasRef} width="500" height="300"></canvas>
      </div>

      {/* CARDS */}
      <div className="expense-list">
        {expenses.map((exp) => (
          <div key={exp._id} className="expense-card">
            <h3>{exp.name}</h3>
            <p><strong>₹ {exp.amount}</strong></p>
            <p>Category: {exp.category}</p>
            <p>{exp.date}</p>

            <span className={`badge ${exp.paid ? "badge-paid" : "badge-unpaid"}`}>
              {exp.paid ? "PAID" : "UNPAID"}
            </span>

            <br /><br />

            <button onClick={() => togglePaid(exp)}>
              Toggle Paid
            </button>

            <button
              style={{
                background: "linear-gradient(45deg,#ff4d6d,#ff0000)",
                color: "white",
                marginLeft: "10px",
              }}
              onClick={() => deleteExpense(exp._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;