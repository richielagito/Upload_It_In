// Ambil kode_kelas dari URL
function getKodeKelasFromUrl() {
  const match = window.location.pathname.match(/\/kelas\/([A-Z0-9]+)/i);
  return match ? match[1] : null;
}

async function fetchNamaKelasByKode(kodeKelas) {
  const res = await fetch('/api/classes');
  if (!res.ok) return '';
  const kelasList = await res.json();
  const kelas = kelasList.find(k => String(k.kode_kelas) === String(kodeKelas));
  return kelas ? kelas.nama_kelas : '';
}

async function fetchUploadDetailsByKode(kodeKelas) {
  const res = await fetch(`/api/results/kelas-kode/${kodeKelas}`);
  if (!res.ok) return [];
  return await res.json();
}

let kodeKelasGlobal = null;
let idUploadToDelete = null;

// Modal helpers
function showModal(id) { document.getElementById(id).classList.add('active'); }
function hideModal(id) { document.getElementById(id).classList.remove('active'); }

// Edit Kelas
const editKelasBtn = document.getElementById('editKelasBtn');
const editKelasModal = document.getElementById('editKelasModal');
const closeEditKelasModal = document.getElementById('closeEditKelasModal');
const editKelasForm = document.getElementById('editKelasForm');
const editNamaKelasInput = document.getElementById('editNamaKelas');

if (editKelasBtn) {
  editKelasBtn.onclick = () => {
    editNamaKelasInput.value = document.getElementById('namaKelasDetail').textContent;
    showModal('editKelasModal');
  };
}
if (closeEditKelasModal) closeEditKelasModal.onclick = () => hideModal('editKelasModal');
if (editKelasModal) editKelasModal.onclick = (e) => { if (e.target === editKelasModal) hideModal('editKelasModal'); };
if (editKelasForm) {
  editKelasForm.onsubmit = async function(e) {
    e.preventDefault();
    const namaBaru = editNamaKelasInput.value.trim();
    if (!namaBaru) return;
    const res = await fetch(`/api/class/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kode_kelas: kodeKelasGlobal, nama_kelas: namaBaru })
    });
    if (res.ok) {
      hideModal('editKelasModal');
      await renderPage();
    } else {
      alert('Gagal update nama kelas');
    }
  };
}

// Hapus Kelas
const hapusKelasBtn = document.getElementById('hapusKelasBtn');
const hapusKelasModal = document.getElementById('hapusKelasModal');
const closeHapusKelasModal = document.getElementById('closeHapusKelasModal');
const confirmHapusKelasBtn = document.getElementById('confirmHapusKelasBtn');
if (hapusKelasBtn) hapusKelasBtn.onclick = () => showModal('hapusKelasModal');
if (closeHapusKelasModal) closeHapusKelasModal.onclick = () => hideModal('hapusKelasModal');
if (hapusKelasModal) hapusKelasModal.onclick = (e) => { if (e.target === hapusKelasModal) hideModal('hapusKelasModal'); };
if (confirmHapusKelasBtn) confirmHapusKelasBtn.onclick = async function() {
  const res = await fetch(`/api/class/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kode_kelas: kodeKelasGlobal })
  });
  if (res.ok) {
    window.location.href = '/dashboard';
  } else {
    alert('Gagal menghapus kelas');
  }
};

// Hapus Upload
const hapusUploadModal = document.getElementById('hapusUploadModal');
const closeHapusUploadModal = document.getElementById('closeHapusUploadModal');
const confirmHapusUploadBtn = document.getElementById('confirmHapusUploadBtn');
if (closeHapusUploadModal) closeHapusUploadModal.onclick = () => hideModal('hapusUploadModal');
if (hapusUploadModal) hapusUploadModal.onclick = (e) => { if (e.target === hapusUploadModal) hideModal('hapusUploadModal'); };
if (confirmHapusUploadBtn) confirmHapusUploadBtn.onclick = async function() {
  if (!idUploadToDelete) return;
  const res = await fetch(`/api/upload/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: idUploadToDelete })
  });
  if (res.ok) {
    hideModal('hapusUploadModal');
    await renderPage();
  } else {
    alert('Gagal menghapus upload');
  }
};

// Upload Modal
const openUploadModalBtn = document.getElementById('openUploadModalBtn');
const uploadModal = document.getElementById('uploadModal');
const closeUploadModal = document.getElementById('closeUploadModal');
const kelasIdInput = document.getElementById('kelasIdInput');

if (openUploadModalBtn) {
  openUploadModalBtn.onclick = () => {
    // Set kelas_id sesuai kelas yang sedang dibuka
    if (kelasIdInput && kodeKelasGlobal) kelasIdInput.value = kodeKelasGlobal;
    showModal('uploadModal');
  };
}
if (closeUploadModal) closeUploadModal.onclick = () => hideModal('uploadModal');
if (uploadModal) uploadModal.onclick = (e) => { if (e.target === uploadModal) hideModal('uploadModal'); };

async function renderPage() {
  const kodeKelas = getKodeKelasFromUrl();
  kodeKelasGlobal = kodeKelas;
  if (!kodeKelas) return;
  const namaKelasSpan = document.getElementById('namaKelasDetail');
  const tbody = document.getElementById('uploadDetailsKelasTbody');
  namaKelasSpan.textContent = 'Loading...';
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  const namaKelas = await fetchNamaKelasByKode(kodeKelas);
  namaKelasSpan.textContent = namaKelas || '-';

  const data = await fetchUploadDetailsByKode(kodeKelas);
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="5">Belum ada upload</td></tr>';
    return;
  }
  tbody.innerHTML = '';
  data.forEach(item => {
    let status = '';
    let statusColor = '';
    switch (item.nilai || item.grade) {
      case 'A': status = 'Very Good'; statusColor = 'status-very-good'; break;
      case 'B': status = 'Good'; statusColor = 'status-good'; break;
      case 'C': status = 'Average'; statusColor = 'status-average'; break;
      case 'D': status = 'Bad'; statusColor = 'status-bad'; break;
      default: status = 'Bad'; statusColor = 'status-bad';
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ellipsis">${item.nama_murid || item.name || '-'}</td>
      <td>${item.nilai || item.grade || '-'}</td>
      <td>${item.similarity ?? '-'}</td>
      <td><span class="status-pill ${statusColor}">${status}</span></td>
      <td><button class="form-submit" style="background:#f04438;" onclick="window.hapusUpload('${item.id}')">Hapus</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Fungsi global untuk hapus upload
window.hapusUpload = function(id) {
  idUploadToDelete = id;
  showModal('hapusUploadModal');
};

document.addEventListener('DOMContentLoaded', renderPage); 