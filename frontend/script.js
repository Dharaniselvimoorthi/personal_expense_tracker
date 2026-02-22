let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let darkMode = false;

window.onload = function () {
    renderExpenses();
    updateChart();
};

function addExpense() {
    const name = document.getElementById("name").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!name || !amount || !category || !date) {
        alert("Fill all fields");
        return;
    }

    const expense = {
        id: Date.now(),
        name,
        amount: Number(amount),
        category,
        date,
        paid: false
    };

    expenses.push(expense);
    saveData();
    renderExpenses();
    updateChart();

    document.getElementById("name").value = "";
    document.getElementById("amount").value = "";
}

function renderExpenses() {
    const container = document.getElementById("expenseList");
    container.innerHTML = "";

    let total = 0;
    let paid = 0;
    let unpaid = 0;

    expenses.forEach(exp => {
        total += exp.amount;
        if (exp.paid) paid += exp.amount;
        else unpaid += exp.amount;

        const card = document.createElement("div");
        card.className = "expense-card";

        card.innerHTML = `
            <h3>${exp.name}</h3>
            <p>₹ ${exp.amount}</p>
            <p>${exp.category}</p>
            <p>${exp.date}</p>
            <span class="badge ${exp.paid ? "badge-paid" : "badge-unpaid"}">
                ${exp.paid ? "PAID" : "UNPAID"}
            </span>
            <br><br>
            <button onclick="togglePaid(${exp.id})">Paid</button>
            <button onclick="deleteExpense(${exp.id})">Delete</button>
        `;

        addTilt(card);
        container.appendChild(card);
    });

    document.getElementById("totalAmount").innerText = total;
    document.getElementById("paidAmount").innerText = paid;
    document.getElementById("unpaidAmount").innerText = unpaid;
}

function togglePaid(id) {
    expenses = expenses.map(exp =>
        exp.id === id ? { ...exp, paid: !exp.paid } : exp
    );
    saveData();
    renderExpenses();
    updateChart();
}

function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveData();
    renderExpenses();
    updateChart();
}

function addTilt(card) {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = -(y - rect.height/2) / 15;
        const rotateY = (x - rect.width/2) / 15;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0) rotateY(0)";
    });
}

function updateChart() {
    const canvas = document.getElementById("expenseChart");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let paid = expenses.filter(e => e.paid).reduce((a,b)=>a+b.amount,0);
    let unpaid = expenses.filter(e => !e.paid).reduce((a,b)=>a+b.amount,0);

    ctx.fillStyle = "#00ff88";
    ctx.fillRect(100, 250 - paid/5, 100, paid/5);

    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(300, 250 - unpaid/5, 100, unpaid/5);
}

function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode");
}

function exportPDF() {
    window.print();
}

function saveData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}