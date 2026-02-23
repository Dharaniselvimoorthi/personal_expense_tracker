//const API = "https://your-backend-url.onrender.com/expenses";
// If local testing use:
 const API = "http://localhost:3000/expenses";

const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const container = document.getElementById("expenseList");

window.onload = fetchExpenses;

/* ================= FETCH ALL ================= */
async function fetchExpenses() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        container.innerHTML = "";
        data.reverse().forEach(exp => createExpenseCard(exp));
        updateStats(data);

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

/* ================= ADD ================= */
async function addExpense() {
    const name = nameInput.value;
    const amount = amountInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!name || !amount || !category || !date) {
        alert("Fill all fields");
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
                date
            })
        });

        nameInput.value = "";
        amountInput.value = "";

        fetchExpenses();

    } catch (err) {
        console.error("Add error:", err);
    }
}

/* ================= CREATE CARD ================= */
function createExpenseCard(exp) {
    const card = document.createElement("div");
    card.className = "expense-card";

    const h3 = document.createElement("h3");
    h3.textContent = exp.name;

    const pAmount = document.createElement("p");
    pAmount.textContent = `₹ ${exp.amount}`;

    const pCat = document.createElement("p");
    pCat.textContent = exp.category;

    const pDate = document.createElement("p");
    pDate.textContent = exp.date;

    const badge = document.createElement("span");
    badge.className = `badge ${exp.paid ? "badge-paid" : "badge-unpaid"}`;
    badge.textContent = exp.paid ? "PAID" : "UNPAID";

    /* ===== TOGGLE PAID ===== */
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Toggle Paid";
    toggleBtn.onclick = async () => {
        await fetch(`${API}/${exp._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paid: !exp.paid })
        });

        fetchExpenses();
    };

    /* ===== DELETE ===== */
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {

        card.style.transform = "scale(0)";
        card.style.opacity = "0";

        setTimeout(async () => {
            await fetch(`${API}/${exp._id}`, {
                method: "DELETE"
            });

            fetchExpenses();
        }, 300);
    };

    addTilt(card);

    card.append(
        h3,
        pAmount,
        pCat,
        pDate,
        badge,
        document.createElement("br"),
        toggleBtn,
        deleteBtn
    );

    container.appendChild(card);
}

/* ================= UPDATE STATS ================= */
function updateStats(expenses) {
    let total = 0;
    let paid = 0;
    let unpaid = 0;

    expenses.forEach(exp => {
        total += exp.amount;
        if (exp.paid) paid += exp.amount;
        else unpaid += exp.amount;
    });

    document.getElementById("totalAmount").innerText = total;
    document.getElementById("paidAmount").innerText = paid;
    document.getElementById("unpaidAmount").innerText = unpaid;

    updateChart(paid, unpaid);
}

/* ================= TILT EFFECT ================= */
function addTilt(card) {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = -(y - rect.height / 2) / 15;
        const rotateY = (x - rect.width / 2) / 15;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0) rotateY(0)";
    });
}

/* ================= CHART ================= */
function updateChart(paid, unpaid) {
    const canvas = document.getElementById("expenseChart");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff88";
    ctx.fillRect(100, 250 - paid / 5, 100, paid / 5);

    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(300, 250 - unpaid / 5, 100, unpaid / 5);
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

function exportPDF() {
    window.print();
}