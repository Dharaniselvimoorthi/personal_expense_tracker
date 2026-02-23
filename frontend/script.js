// ================= API =================
const API = "https://personal-expense-tracker-backend-e8br.onrender.com/expenses";

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
        showToast("Server Error ❌");
    }
}

/* ================= ADD ================= */
async function addExpense() {
    const name = nameInput.value.trim();
    const amount = amountInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

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
                date
            })
        });

        nameInput.value = "";
        amountInput.value = "";

        showToast("Expense Added ✅");
        fetchExpenses();

    } catch (err) {
        console.error("Add error:", err);
        showToast("Add Failed ❌");
    }
}

/* ================= CREATE CARD ================= */
function createExpenseCard(exp) {

    const card = document.createElement("div");
    card.className = "expense-card";

    const h3 = document.createElement("h3");
    h3.textContent = exp.name;

    const pAmount = document.createElement("p");
    pAmount.innerHTML = `<strong>₹ ${exp.amount}</strong>`;

    const pCat = document.createElement("p");
    pCat.textContent = "Category: " + exp.category;

    const pDate = document.createElement("p");
    pDate.textContent = exp.date;

    const badge = document.createElement("span");
    badge.className = `badge ${exp.paid ? "badge-paid" : "badge-unpaid"}`;
    badge.textContent = exp.paid ? "PAID" : "UNPAID";

    /* ===== TOGGLE PAID ===== */
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Toggle Paid";

    toggleBtn.onclick = async () => {
        try {
            await fetch(`${API}/${exp._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paid: !exp.paid })
            });

            // 🎉 CONFETTI WHEN BECOMES PAID
            if (!exp.paid) {
                launchConfetti();
            }

            showToast("Status Updated 🔄");
            fetchExpenses();

        } catch {
            showToast("Update Failed ❌");
        }
    };

    /* ===== DELETE ===== */
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.background = "linear-gradient(45deg,#ff4d6d,#ff0000)";
    deleteBtn.style.color = "white";

    deleteBtn.onclick = async () => {

        card.style.transform = "scale(0)";
        card.style.opacity = "0";

        setTimeout(async () => {
            try {
                await fetch(`${API}/${exp._id}`, {
                    method: "DELETE"
                });

                showToast("Deleted 🗑");
                fetchExpenses();

            } catch {
                showToast("Delete Failed ❌");
            }
        }, 300);
    };

    addTilt(card);

    card.append(
        h3,
        pAmount,
        pCat,
        pDate,
        document.createElement("br"),
        badge,
        document.createElement("br"),
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

    animateValue("totalAmount", total);
    animateValue("paidAmount", paid);
    animateValue("unpaidAmount", unpaid);

    updateChart(paid, unpaid);
}

/* ================= COUNT ANIMATION ================= */
function animateValue(id, value) {
    const el = document.getElementById(id);
    let start = 0;
    const duration = 800;
    const stepTime = 20;
    const increment = value / (duration / stepTime);

    const counter = setInterval(() => {
        start += increment;
        if (start >= value) {
            el.innerText = value;
            clearInterval(counter);
        } else {
            el.innerText = Math.floor(start);
        }
    }, stepTime);
}

/* ================= TILT EFFECT ================= */
function addTilt(card) {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = -(y - rect.height / 2) / 18;
        const rotateY = (x - rect.width / 2) / 18;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0) rotateY(0) scale(1)";
    });
}

/* ================= SMOOTH BAR CHART ================= */
function updateChart(paid, unpaid) {

    const canvas = document.getElementById("expenseChart");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const max = Math.max(paid, unpaid, 1);
    const chartHeight = 200;

    const paidHeight = (paid / max) * chartHeight;
    const unpaidHeight = (unpaid / max) * chartHeight;

    let progress = 0;

    function animateBars() {
        progress += 4;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff88";
        ctx.fillRect(120, 250 - (paidHeight * progress / 100), 120, (paidHeight * progress / 100));

        ctx.fillStyle = "#ff4d6d";
        ctx.fillRect(350, 250 - (unpaidHeight * progress / 100), 120, (unpaidHeight * progress / 100));

        if (progress < 100) {
            requestAnimationFrame(animateBars);
        }
    }

    animateBars();
}

/* ================= TOAST ================= */
function showToast(message) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => document.body.removeChild(toast), 400);
    }, 2500);
}

/* ================= CONFETTI ================= */
function launchConfetti() {

    const colors = ["#00ff88", "#00ffff", "#ffffff", "#ff4d6d", "#ffd700"];

    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti-piece";
        document.body.appendChild(confetti);

        const size = Math.random() * 8 + 6;
        confetti.style.width = size + "px";
        confetti.style.height = size + "px";
        confetti.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        confetti.style.position = "fixed";
        confetti.style.top = "-10px";
        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.borderRadius = "3px";
        confetti.style.zIndex = "9999";

        const duration = Math.random() * 3 + 2;

        confetti.animate(
            [
                { transform: "translateY(0) rotate(0deg)", opacity: 1 },
                {
                    transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`,
                    opacity: 0
                }
            ],
            {
                duration: duration * 1000,
                easing: "ease-out"
            }
        );

        setTimeout(() => confetti.remove(), duration * 1000);
    }
}

/* ================= THEME ================= */
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

/* ================= EXPORT ================= */
function exportPDF() {
    window.print();
}