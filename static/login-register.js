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
