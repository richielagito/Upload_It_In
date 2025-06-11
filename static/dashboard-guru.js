// Render daftar kelas
async function loadKelas() {
  const tableBody = document.querySelector("#kelasTable tbody");
  if (!tableBody) return;
  tableBody.innerHTML = "<tr><td colspan='2'>Loading...</td></tr>";
  const res = await fetch("/api/classes");
  if (!res.ok) {
    tableBody.innerHTML = "<tr><td colspan='2'>Gagal memuat data kelas</td></tr>";
    return;
  }
  const data = await res.json();
  if (data.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='2'>Belum ada kelas</td></tr>";
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

document.addEventListener("DOMContentLoaded", loadKelas);

// Klik baris kelas ke halaman detail kelas
const kelasTable = document.getElementById("kelasTable");
if (kelasTable) {
  kelasTable.addEventListener("click", async function (e) {
    let tr = e.target;
    while (tr && tr.tagName !== "TR") tr = tr.parentElement;
    if (!tr) return;
    const rowIndex = tr.rowIndex - 1;
    if (rowIndex < 0) return;
    const res = await fetch("/api/classes");
    if (!res.ok) return;
    const kelasList = await res.json();
    const kelas = kelasList[rowIndex];
    if (!kelas) return;
    window.location.href = `/kelas/${kelas.kode_kelas}`;
  });
}

// Modal Buat Kelas
const createClassBtn = document.querySelector(".create-class-btn");
const createClassModal = document.getElementById("createClassModal");
const closeCreateClassModal = document.getElementById("closeCreateClassModal");
const createClassForm = document.querySelector(".create-class-form");
const classCodeResult = document.getElementById("classCodeResult");
const generatedClassCode = document.getElementById("generatedClassCode");

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
      createClassModal.classList.remove("active");
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

// Logout
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
document.addEventListener("DOMContentLoaded", function () {
  const logoutButtons = document.querySelectorAll('a[href="/logout"]');
  logoutButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      handleLogout();
    });
  });
});