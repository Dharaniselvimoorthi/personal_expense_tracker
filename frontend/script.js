const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const addBtn = document.querySelector("button[onclick='addExpense()']"); // Or give it an ID
const container = document.getElementById("expenseList");

// Data State
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// 1. Initialization on Load
window.onload = () => {
    renderAll();
};

// 2. Add Button Logic
function addExpense() {
    const name = nameInput.value;
    const amount = amountInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!name || !amount || !category || !date) {
        alert("Fill all fields");
        return;
    }

    const newExpense = {
        id: Date.now(),
        name,
        amount: Number(amount),
        category,
        date,
        paid: false
    };

    expenses.push(newExpense);
    saveData();
    
    // Instead of full re-render, we can just create the new card
    createExpenseCard(newExpense); 
    updateStats();
    
    // Clear inputs
    nameInput.value = "";
    amountInput.value = "";
}

// 3. Create Element Logic (Matches your Example Style)
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

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Paid";
    toggleBtn.onclick = () => {
        exp.paid = !exp.paid;
        saveData();
        // Update UI without full reload
        badge.className = `badge ${exp.paid ? "badge-paid" : "badge-unpaid"}`;
        badge.textContent = exp.paid ? "PAID" : "UNPAID";
        updateStats();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
        expenses = expenses.filter(e => e.id !== exp.id);
        saveData();
        card.remove();
        updateStats();
    };

    // Tilt effect helper
    addTilt(card);

    // Append everything
    card.append(h3, pAmount, pCat, pDate, badge, document.createElement("br"), toggleBtn, deleteBtn);
    container.appendChild(card);
}

// 4. Update Summary & Chart Logic
function updateStats() {
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

// Helpers
function renderAll() {
    container.innerHTML = "";
    expenses.forEach(exp => createExpenseCard(exp));
    updateStats();
}

function saveData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

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