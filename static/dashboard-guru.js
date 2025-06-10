const uploadBtn = document.querySelector(".upload-btn");
const uploadBtnNav = document.querySelector(".upload-btn-navbar");
const uploadModal = document.getElementById("uploadModal");
const closeModal = document.getElementById("closeModal");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileNavClose = document.querySelector(".mobile-nav-close");
const loading = document.querySelector(".loading");
const uploadBtnForm = document.querySelector(".form-upload-btn");
const uploadForm = document.querySelector(".upload-form");
const formSubmitBtn = document.querySelector(".form-submit");
const createClassBtn = document.querySelector(".create-class-btn");
const createClassModal = document.getElementById("createClassModal");
const closeCreateClassModal = document.getElementById("closeCreateClassModal");
const createClassForm = document.querySelector(".create-class-form");
const classCodeResult = document.getElementById("classCodeResult");
const generatedClassCode = document.getElementById("generatedClassCode");

let isLoading = false;

// Open Modal
uploadBtn.addEventListener("click", function () {
  uploadModal.classList.add("active");
});

uploadBtnNav.addEventListener("click", function () {
  uploadModal.classList.add("active");
});

// Close Modal
closeModal.addEventListener("click", function () {
  uploadModal.classList.remove("active");
});

// Close Modal when clicking outside
uploadModal.addEventListener("click", function (event) {
  if (event.target === uploadModal) {
    uploadModal.classList.remove("active");
  }
});

// Dropdown Menu
const toggle = document.getElementById("dropdownToggle");
const menu = document.getElementById("dropdownContent");

toggle.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent closing immediately
  menu.classList.toggle("show");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove("show");
  }
});

// Upload Function
document
  .querySelector(".upload-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    isLoading = true;
    if (loading) {
      loading.classList.add("active");
    }
    if (uploadBtnForm) {
      uploadBtnForm.classList.remove("active");
    }
    formSubmitBtn.setAttribute("disabled", "true");

    const response = await fetch("/grade", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      await loadDashboardData();
      isLoading = false;
      if (loading) {
        loading.classList.remove("active");
      }
      if (uploadBtnForm) {
        uploadBtnForm.classList.add("active");
      }
      formSubmitBtn.removeAttribute("disabled");
      uploadModal.classList.remove("active");
      form.reset();
    } else {
      alert("Gagal upload!");
    }
  });

async function loadDashboardData() {
  const response = await fetch("/api/results");
  if (response.ok) {
    const results = await response.json();
    updateDashboardTable(results, true);
  }
}

function updateDashboardTable(results, replace = false) {
  const tbody = document.querySelector(".main-content table tbody");
  let status = "";
  let statusColor = "";
  if (replace) tbody.innerHTML = ""; // kosongkan jika replace
  results.forEach((item, idx) => {
    const nama = item.nama_murid || item.name || "-";
    const nilai = item.nilai || item.grade || "-";
    const similarity = item.similarity || "-";
    switch (nilai) {
      case "A":
        status = "Very Good";
        statusColor = "status-very-good";
        break;
      case "B":
        status = "Good";
        statusColor = "status-good";
        break;
      case "C":
        status = "Average";
        statusColor = "status-average";
        break;
      case "D":
        status = "Bad";
        statusColor = "status-bad";
        break;
      default:
        status = "Bad";
        statusColor = "status-bad";
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="ellipsis">${nama}</td>
            <td>${new Date().toLocaleDateString()}</td>
            <td>${new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}</td>
            <td>${nilai} (${similarity})</td>
            <td><span class="status-pill ${statusColor}">${status}</span></td>
        `;
    tbody.appendChild(tr);
  });
}

window.addEventListener("DOMContentLoaded", loadDashboardData);

// Implementasi logout yang lebih baik
function handleLogout() {
  Swal.fire({
    title: "Are you sure?",
    text: "You are going to log out.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, log out",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("/logout")
        .then((response) => {
          if (response.ok) {
            window.location.href = "/";
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to log out. Please try again.",
              icon: "error",
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to log out. Please try again.",
            icon: "error",
          });
        });
    }
  });
}

// Menambahkan event listener untuk tombol logout di sidebar dan dropdown
document.addEventListener("DOMContentLoaded", function () {
  const logoutButtons = document.querySelectorAll('a[href="/logout"]');
  logoutButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      handleLogout();
    });
  });
});

async function loadKelas() {
  const tableBody = document.querySelector("#kelasTable tbody");
  if (!tableBody) return;
  tableBody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  const res = await fetch("/api/classes");
  if (!res.ok) {
    tableBody.innerHTML =
      "<tr><td colspan='3'>Gagal memuat data kelas</td></tr>";
    return;
  }
  const data = await res.json();
  if (data.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='3'>Belum ada kelas</td></tr>";
    return;
  }
  tableBody.innerHTML = "";
  data.forEach((kelas) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${kelas.nama_kelas}</td>
            <td>${kelas.kode_kelas}</td>
        `;
    tableBody.appendChild(tr);
  });
}
window.addEventListener("DOMContentLoaded", loadKelas);

document.getElementById("closeClassCodePopup").onclick = function () {
  document.getElementById("classCodePopup").style.display = "none";
};

if (createClassBtn) {
  createClassBtn.addEventListener("click", function () {
    createClassModal.classList.add("active");
    classCodeResult.style.display = "none";
    generatedClassCode.textContent = "";
  });
}
if (closeCreateClassModal) {
  closeCreateClassModal.addEventListener("click", function () {
    createClassModal.classList.remove("active");
  });
}
if (createClassModal) {
  createClassModal.addEventListener("click", function (event) {
    if (event.target === createClassModal) {
      createClassModal.classList.remove("active");
    }
  });
}
if (createClassForm) {
  createClassForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(createClassForm);
    const response = await fetch("/create-class", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      // Tutup modal
      createClassModal.classList.remove("active");
      // Tampilkan popup kode kelas
      const popup = document.getElementById("classCodePopup");
      const popupText = document.getElementById("classCodePopupText");
      popupText.textContent = "Kode kelas: " + data.class_code;
      popup.style.display = "block";
      loadKelas();
    } else {
      alert("Gagal membuat kelas!");
    }
  });
}
