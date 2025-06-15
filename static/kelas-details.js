// Ambil kode_kelas dari URL
function getKodeKelasFromUrl() {
    const match = window.location.pathname.match(/\/kelas\/([A-Z0-9]+)/i);
    return match ? match[1] : null;
}

async function fetchNamaKelasByKode(kodeKelas) {
    const res = await fetch("/api/classes");
    if (!res.ok) return "";
    const kelasList = await res.json();
    const kelas = kelasList.find((k) => String(k.kode_kelas) === String(kodeKelas));
    return kelas ? kelas.nama_kelas : "";
}

async function fetchUploadDetailsByKode(kodeKelas) {
    const res = await fetch(`/api/results/kelas-kode/${kodeKelas}`);
    if (!res.ok) return [];
    return await res.json();
}

let kodeKelasGlobal = null;
let idUploadToDelete = null;

// Modal helpers
function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}

// logout
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

// Edit Kelas
const editKelasBtn = document.getElementById("editKelasBtn");
const editKelasModal = document.getElementById("editKelasModal");
const closeEditKelasModal = document.getElementById("closeEditKelasModal");
const editKelasForm = document.getElementById("editKelasForm");
const editNamaKelasInput = document.getElementById("editNamaKelas");

if (editKelasBtn) {
    editKelasBtn.onclick = async () => {
        const namaKelasSaatIni = await fetchNamaKelasByKode(kodeKelasGlobal);
        editNamaKelasInput.value = namaKelasSaatIni;
        showModal("editKelasModal");
    };
}
if (closeEditKelasModal) closeEditKelasModal.onclick = () => hideModal("editKelasModal");
if (editKelasModal)
    editKelasModal.onclick = (e) => {
        if (e.target === editKelasModal) hideModal("editKelasModal");
    };
if (editKelasForm) {
    editKelasForm.onsubmit = async function (e) {
        e.preventDefault();
        const namaBaru = editNamaKelasInput.value.trim();
        if (!namaBaru) return;
        const res = await fetch(`/api/class/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                kode_kelas: kodeKelasGlobal,
                nama_kelas: namaBaru,
            }),
        });
        if (res.ok) {
            hideModal("editKelasModal");
            await renderPage();
        } else {
            alert("Gagal update nama kelas");
        }
    };
}

// Hapus Kelas
const hapusKelasBtn = document.getElementById("hapusKelasBtn");
const hapusKelasModal = document.getElementById("hapusKelasModal");
const closeHapusKelasModal = document.getElementById("closeHapusKelasModal");
const confirmHapusKelasBtn = document.getElementById("confirmHapusKelasBtn");
if (hapusKelasBtn) hapusKelasBtn.onclick = () => showModal("hapusKelasModal");
if (closeHapusKelasModal) closeHapusKelasModal.onclick = () => hideModal("hapusKelasModal");
if (hapusKelasModal)
    hapusKelasModal.onclick = (e) => {
        if (e.target === hapusKelasModal) hideModal("hapusKelasModal");
    };
if (confirmHapusKelasBtn)
    confirmHapusKelasBtn.onclick = async function () {
        const res = await fetch(`/api/class/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kode_kelas: kodeKelasGlobal }),
        });
        if (res.ok) {
            window.location.href = "/dashboard";
        } else {
            alert("Gagal menghapus kelas");
        }
    };

// Hapus Upload
const hapusUploadModal = document.getElementById("hapusUploadModal");
const closeHapusUploadModal = document.getElementById("closeHapusUploadModal");
const confirmHapusUploadBtn = document.getElementById("confirmHapusUploadBtn");
if (closeHapusUploadModal) closeHapusUploadModal.onclick = () => hideModal("hapusUploadModal");
if (hapusUploadModal)
    hapusUploadModal.onclick = (e) => {
        if (e.target === hapusUploadModal) hideModal("hapusUploadModal");
    };
if (confirmHapusUploadBtn)
    confirmHapusUploadBtn.onclick = async function () {
        if (!idUploadToDelete) return;
        const res = await fetch(`/api/upload/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: idUploadToDelete }),
        });
        if (res.ok) {
            hideModal("hapusUploadModal");
            await renderPage();
        } else {
            alert("Gagal menghapus upload");
        }
    };

// Upload Modal (Sekarang digunakan untuk Tambah Assignment dari sidebar)
const openTambahAssignmentModalBtn = document.getElementById("openTambahAssignmentModalBtn");
const uploadModal = document.getElementById("uploadModal"); // Modal Upload tetap ada untuk kemungkinan penggunaan lain
const closeUploadModal = document.getElementById("closeUploadModal");
const kelasIdInput = document.getElementById("kelasIdInput"); // Input untuk form upload

// Tambah Assignment Modal
const tambahAssignmentModal = document.getElementById("tambahAssignmentModal");
const closeTambahAssignmentModal = document.getElementById("closeTambahAssignmentModal");
const tambahAssignmentForm = document.getElementById("tambahAssignmentForm");
const kelasIdAssignmentInput = document.getElementById("kelasIdAssignmentInput"); // Input untuk form assignment

if (openTambahAssignmentModalBtn) {
    openTambahAssignmentModalBtn.onclick = async () => {
        const kelasId = await fetchKelasIdByKode(kodeKelasGlobal);
        if (kelasIdAssignmentInput) {
            kelasIdAssignmentInput.value = kelasId;
        }
        showModal("tambahAssignmentModal"); // Buka modal Tambah Assignment
    };
}
if (closeUploadModal) closeUploadModal.onclick = () => hideModal("uploadModal");
if (uploadModal)
    uploadModal.onclick = (e) => {
        if (e.target === uploadModal) hideModal("uploadModal");
    };

async function renderPage() {
    const kodeKelas = getKodeKelasFromUrl();
    kodeKelasGlobal = kodeKelas;
    if (!kodeKelas) return;

    const mainPageTitle = document.getElementById("mainPageTitle");
    const tbody = document.getElementById("uploadDetailsKelasTbody");

    // Set loading state for the main title and table
    mainPageTitle.textContent = "Loading...";
    tbody.innerHTML = '<tr><td colspan="5">Pilih assignment untuk melihat detail upload</td></tr>';

    const namaKelas = await fetchNamaKelasByKode(kodeKelas);
    mainPageTitle.textContent = `Kelas ${namaKelas || "-"}`; // Mengisi judul h1 utama
}

// Fungsi global untuk hapus upload
window.hapusUpload = function (id) {
    idUploadToDelete = id;
    showModal("hapusUploadModal");
};

// Logic penutup untuk modal Tambah Assignment
if (closeTambahAssignmentModal) closeTambahAssignmentModal.onclick = () => hideModal("tambahAssignmentModal");
if (tambahAssignmentModal)
    tambahAssignmentModal.onclick = (e) => {
        if (e.target === tambahAssignmentModal) hideModal("tambahAssignmentModal");
    };

if (tambahAssignmentForm) {
    tambahAssignmentForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(tambahAssignmentForm);

        try {
            const response = await fetch("/api/assignments", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: `Assignment added!`,
                    timer: 1000,
                    showConfirmButton: false,
                });
                hideModal("tambahAssignmentModal");
                await loadAssignments(); // Reload daftar assignment
            } else {
                const error = await response.json();
                alert(error.error || "Gagal menambahkan assignment");
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menambahkan assignment");
        }
    });
}

async function fetchKelasIdByKode(kodeKelas) {
    try {
        const res = await fetch("/api/classes");
        if (!res.ok) return null;
        const kelasList = await res.json();
        const kelas = kelasList.find((k) => String(k.kode_kelas) === String(kodeKelas));
        return kelas ? kelas.id : null;
    } catch (error) {
        console.error("Error fetching kelas ID:", error);
        return null;
    }
}

// Fungsi untuk memuat daftar assignment
async function loadAssignments() {
    try {
        const response = await fetch(`/api/assignments/${kodeKelasGlobal}`);
        if (response.ok) {
            const assignments = await response.json();
            const assignmentsList = document.getElementById("assignmentsList");
            assignmentsList.innerHTML = "";

            if (!assignments.length) {
                assignmentsList.innerHTML = '<div class="no-assignments">Belum ada assignment</div>';
                return;
            }

            assignments.forEach((assignment) => {
                const assignmentItem = document.createElement("div");
                assignmentItem.className = "assignment-item";
                assignmentItem.dataset.assignmentId = assignment.id; // Menyimpan ID assignment
                assignmentItem.addEventListener("click", () => displayUploadsForAssignment(assignment.id)); // Event click
                assignmentItem.innerHTML = `
          <h4>${assignment.judul}</h4>
          <p>${assignment.deskripsi}</p>
          <div class="deadline">Deadline: ${assignment.deadline}</div>
          <div class="actions">
            ${
                window.userRole === "Teacher"
                    ? `<button class="form-submit" style="background:#f04438;" onclick="deleteAssignment('${assignment.id}')">
                    Hapus
                  </button>`
                    : ""
            }
          </div>
        `;
                assignmentsList.appendChild(assignmentItem);
            });
        } else {
            console.error("Gagal mengambil daftar assignment");
            alert("Terjadi kesalahan saat mengambil daftar assignment");
        }
    } catch (error) {
        console.error("Error memuat assignment:", error);
        alert("Terjadi kesalahan saat memuat assignment");
    }
}

// Fungsi baru untuk menampilkan upload berdasarkan assignment ID
async function displayUploadsForAssignment(assignmentId) {
    const tbody = document.getElementById("uploadDetailsKelasTbody");
    tbody.innerHTML = '<tr><td colspan="5">Loading uploads...</td></tr>';

    try {
        const response = await fetch(`/api/results/assignment/${assignmentId}`);
        if (response.ok) {
            const data = await response.json();
            if (!data.length) {
                tbody.innerHTML = '<tr><td colspan="5">Belum ada upload untuk assignment ini</td></tr>';
                return;
            }
            tbody.innerHTML = "";
            data.forEach((item) => {
                let status = "";
                let statusColor = "";
                const nilai = parseFloat(item.nilai || item.grade || 0);

                if (nilai >= 90) {
                    status = "A";
                    statusColor = "status-very-good";
                } else if (nilai >= 80) {
                    status = "B";
                    statusColor = "status-good";
                } else if (nilai >= 70) {
                    status = "C";
                    statusColor = "status-average";
                } else if (nilai >= 60) {
                    status = "D";
                    statusColor = "status-bad";
                } else {
                    status = "E";
                    statusColor = "status-bad";
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
    <td class="ellipsis">${item.nama_murid || item.name || "-"}</td>
    <td>${item.nilai || item.grade || "-"}</td>
    <td>${item.similarity ?? "-"}</td>
    <td><span class="status-pill ${statusColor}">${status}</span></td>
     <td><button class="form-submit" style="background:#f04438;" onclick="window.hapusUpload('${item.id}')">Hapus</button></td>
  `;
                tbody.appendChild(tr);
            });
        } else {
            console.error("Gagal mengambil hasil upload untuk assignment");
            tbody.innerHTML = '<tr><td colspan="5">Error memuat upload</td></tr>';
        }
    } catch (error) {
        console.error("Error memuat upload untuk assignment:", error);
        tbody.innerHTML = '<tr><td colspan="5">Error memuat upload</td></tr>';
    }
}

// Fungsi baru untuk membuka modal upload dan mengisi assignment_id
function openUploadModalForAssignment(assignmentId) {
    const uploadModal = document.getElementById("uploadModal");
    const kelasIdInput = document.getElementById("kelasIdInput");
    const assignmentIdInput = document.getElementById("assignmentIdInput"); // Ini perlu ditambahkan di HTML jika belum ada

    if (kelasIdInput) {
        kelasIdInput.value = kodeKelasGlobal; // kelas_id tetap diambil dari global
    }
    if (assignmentIdInput) {
        assignmentIdInput.value = assignmentId; // Set assignment_id
    }
    showModal("uploadModal");
}

// Fungsi untuk mengunduh file assignment
function addDownloadQuery(url) {
    // Hilangkan download duplikat
    url = url.replace(/[?&]download\b/, "");
    if (url.includes("?")) {
        return url + "&download";
    } else {
        return url + "?download";
    }
}

function downloadAssignment(fileUrl) {
    const urlWithDownload = addDownloadQuery(fileUrl);
    const link = document.createElement("a");
    link.href = urlWithDownload;
    // Optional: set filename
    link.download = fileUrl.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fungsi untuk menghapus assignment
async function deleteAssignment(assignmentId) {
    if (!confirm("Apakah Anda yakin ingin menghapus assignment ini?")) {
        return;
    }

    try {
        const response = await fetch(`/api/assignments/${assignmentId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Assignment berhasil dihapus");
            loadAssignments(); // Muat ulang daftar assignment
        } else {
            const error = await response.json();
            alert("Gagal menghapus assignment: " + error.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat menghapus assignment");
    }
}

// Panggil loadAssignments saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    renderPage();
    loadAssignments();
});
