import { supabase } from "./db.js";

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
registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const username = document.getElementById("username").value.trim();
    const role = document.getElementById("reg-role").value;

    if (!email || !password || !username || !role) {
        alert("Semua field harus diisi!");
        return;
    }

    Swal.fire({
        title: "Processing...",
        text: "Please wait while we create your account.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: "http://127.0.0.1:5000/login-register",
            data: {
                username: username,
                role: role,
            },
        },
    });

    Swal.close();

    if (error) {
        Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
        });
    } else {
        await Swal.fire({
            title: "Success",
            text: "Check your email to verify your account.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        registerScreen.classList.remove("active");
        loginScreen.classList.add("active");
    }
});

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
        });
    } else {
        // Ambil access_token dari Supabase
        const { data } = await supabase.auth.getSession();
        const access_token = data.session.access_token;
        Swal.fire({
            title: "Processing...",
            text: "Please wait while we log you in.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        // Kirim ke backend untuk set session
        await fetch("/set_session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token }),
            credentials: "same-origin",
        });

        Swal.close();

        await Swal.fire({
            title: "Success",
            icon: "success",
            html: "Login success! Redirecting you...",
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
        });

        window.location.href = "/dashboard";
    }
});
