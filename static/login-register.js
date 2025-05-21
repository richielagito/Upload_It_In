const registerScreen = document.getElementById("register-screen");
const loginScreen = document.getElementById("login-screen");
const goToLoginLink = document.getElementById("go-to-login");
const goToRegisterLink = document.getElementById("go-to-register");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

// Switch to login screen
goToLoginLink.addEventListener("click", function (e) {
    e.preventDefault();
    registerScreen.classList.remove("active");
    loginScreen.classList.add("active");
});

// Switch to register screen
goToRegisterLink.addEventListener("click", function (e) {
    e.preventDefault();
    loginScreen.classList.remove("active");
    registerScreen.classList.add("active");
});

// Form submissions
registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Registration logic would go here
    console.log("Registration submitted");
});

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Login logic would go here
    console.log("Login submitted");
});

registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("reg-email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("reg-password").value;
    const terms = document.getElementById("terms").checked;
    if (!terms) {
        alert("Anda harus menyetujui terms and conditions!");
        return;
    }
    const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (data.success) {
        alert("Registrasi berhasil! Silakan login.");
        loginScreen.classList.add("active");
        registerScreen.classList.remove("active");
    } else {
        alert(data.message || "Registrasi gagal!");
    }
});

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
        window.location.href = data.redirect_url; // menggunakan redirect_url dari server
    } else {
        alert(data.message || "Login gagal!");
    }
});
