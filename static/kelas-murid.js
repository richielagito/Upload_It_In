// --- Fungsi untuk render assignment ---
async function renderAssignments(kodeKelas) {
  const assignmentList = document.getElementById("assignment-list");
  assignmentList.innerHTML = `<div class="assignment-status-message loading">Loading assignments...</div>`;
  const assignmentRes = await fetch(`/api/assignments/${kodeKelas}`);
  const assignments = await assignmentRes.json();
  assignmentList.innerHTML = "";
  if (!assignments.length) {
    assignmentList.innerHTML = `<div class="assignment-status-message">No assignments yet.</div>`;
  } else {
    assignments.forEach((ass) => {
      const card = document.createElement("div");
      card.className = "card";
      // Tambahkan ?download pada href
      let fileLink = "";
      if (ass.file_path) {
        let url = ass.file_path.replace(/[?&]download\b/, "");
        url += url.includes("?") ? "&download" : "?download";
        fileLink = `<a href="${url}" download>Download Assignment</a>`;
      } else {
        fileLink = "No file";
      }

      // Deadline logic
      let deadlineDate = ass.deadline
        ? new Date(ass.deadline.replace(" ", "T"))
        : null;
      let now = new Date();
      let isClosed = deadlineDate && now > deadlineDate;

      let uploadSection = "";
      if (isClosed) {
        uploadSection = `<p style="color: #f04438; font-weight: bold;">Assignment Closed</p>`;
      } else if (ass.is_submitted) {
        uploadSection = `
          <form class="upload-jawaban-form" data-id="${ass.id}">
            <label>Upload your answer again:</label>
            <input type="file" name="file" required />
            <button type="submit" class="upload-btn upload-it-in-btn" style="margin:10px 0 0 0;">Upload Again</button>
            <span class="jawaban-status"></span>
          </form>
        `;
      } else {
        uploadSection = `
          <form class="upload-jawaban-form" data-id="${ass.id}">
            <label>Upload your answer:</label>
            <input type="file" name="file" required />
            <button type="submit" class="upload-btn upload-it-in-btn" style="margin:10px 0 0 0;">Upload It In</button>
            <span class="jawaban-status"></span>
          </form>
        `;
      }

      card.innerHTML = `
        <div class="card-header">
            <h2 class="card-title">${ass.judul}</h2>
        </div>
        <div class="card-body">
            <p>${ass.deskripsi || ""}</p>
            <p><b>Deadline:</b> ${ass.deadline || "-"}</p>
            <p>
                <b>File:</b> ${fileLink}
            </p>
            ${uploadSection}
        </div>
      `;
      assignmentList.appendChild(card);
    });
    handleUploadJawaban();
  }
}

// --- Fungsi untuk handle upload jawaban ---
function handleUploadJawaban() {
  document.querySelectorAll(".upload-jawaban-form").forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const assignmentId = this.getAttribute("data-id");
      const fileInput = this.querySelector('input[type="file"]');
      const statusSpan = this.querySelector(".jawaban-status");
      if (!fileInput.files.length) return;
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      Swal.fire({
        title: "Processing...",
        text: "Please wait while we upload your answer.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const res = await fetch(`/api/assignments/upload/${assignmentId}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      Swal.close();

      if (data.success) {
        await Swal.fire({
          title: "Success",
          icon: "success",
          text: "Upload Success!",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        await Swal.fire({
          title: "Error",
          icon: "error",
          text: data.error,
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    });
  });
}

// --- Main ---
document.addEventListener("DOMContentLoaded", async function () {
  const kodeKelas = document.getElementById("kodeKelasHidden").value;
  // Fetch hasil upload kelas
  const tbody = document.getElementById("uploadDetailsKelasTbody");
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  const res = await fetch(`/api/results/kelas-kode/${kodeKelas}`);
  const data = await res.json();
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="4">No upload yet</td></tr>';
  } else {
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
    <td class="ellipsis">${item.judul_assignment || "-"}</td>
    <td>${item.nilai || item.grade || "-"}</td>
    <td>${item.similarity ?? "-"}</td>
    <td><span class="status-pill ${statusColor}">${status}</span></td>
  `;
      tbody.appendChild(tr);
    });
  }

  // Render assignments (panggil fungsi terpisah)
  renderAssignments(kodeKelas);
});

// --- Dropdown Menu (jika ada) ---
const toggle = document.getElementById("dropdownToggle");
const menu = document.getElementById("dropdownContent");
if (toggle && menu) {
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("show");
  });
}
