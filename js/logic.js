// Import fungsi database dari firebase-config.js
import { simpanDataKeFirestore, loadDataDariFirestore } from './firebase-config.js';

// --- Elemen DOM ---
const navInput = document.getElementById('nav-input');
const navLihat = document.getElementById('nav-lihat');
const pageInput = document.getElementById('page-input-data');
const pageLihat = document.getElementById('page-lihat-data');
const form = document.getElementById('formNilai');
const tbody = document.getElementById('tabel-body');
const alertBox = document.getElementById('custom-alert');


let notifTimer = null; 
// --- Logika Navigasi ---
/**
 * Menampilkan halaman Input Nilai
 */
function showInputPage() {
    navInput.classList.add('active');
    navLihat.classList.remove('active');
    pageInput.classList.remove('d-none');
    pageLihat.classList.add('d-none');
}

/**
 * Menampilkan halaman Lihat Data dan memuat data
 */
function showLihatPage() {
    navLihat.classList.add('active');
    navInput.classList.remove('active');
    pageLihat.classList.remove('d-none');
    pageInput.classList.add('d-none');
    
    // Panggil loadData() saat pindah ke halaman "lihat"
    loadData();
}

// Event listener ke tombol navigasi
navInput.addEventListener('click', (e) => { e.preventDefault(); showInputPage(); });
navLihat.addEventListener('click', (e) => { e.preventDefault(); showLihatPage(); });


// --- Fungsi Pembantu ---
/**
 * Menampilkan notifikasi kustom
 * @param {string} pesan - Pesan yang ingin ditampilkan
 * @param {string} tipe - 'berhasil' (hijau) atau 'gagal' (merah)
 */
function tampilkanPesan(pesan, tipe = "success") {
     if (notifTimer) {
        clearTimeout(notifTimer);
    }
    // Tentukan ikon berdasarkan tipe
    const ikon = tipe === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    // Atur kelas bootstrap
    const alertClass = tipe === 'success' ? 'alert-success' : 'alert-danger';

    // Pastikan alertBox ada sebelum mengubahnya
    if (alertBox) {
        alertBox.innerHTML = `<i class="fas ${ikon} me-2"></i> ${pesan}`;
        alertBox.className = `alert ${alertClass} d-flex align-items-center`;
        alertBox.style.display = 'block'; // Tampilkan alert

        // Sembunyikan alert setelah 3 detik
        notifTimer = setTimeout(() => {
            alertBox.style.display = 'none';
        }, 3000);
    } else {
        console.error("Elemen notifikasi '#custom-alert' tidak ditemukan di HTML.");
    }
}


/**
 * validasiInput()
 * Memeriksa apakah data yang diinput sudah lengkap dan sesuai format.
 * @param {object} data - Objek data dari form
 * @returns {object} - { valid: boolean, pesan: string }
 */
function validasiInput(data) {
    if (!data.nama || !data.nim || !data.mataKuliah || data.nilai === '') {
        return { valid: false, pesan: "Semua field wajib diisi!" };
    }
    // Validasi NIM (hanya angka)
    if (!/^\d+$/.test(data.nim)) {
        return { valid: false, pesan: "NIM harus berupa angka." };
    }
    const nilaiNum = parseFloat(data.nilai);
    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
        return { valid: false, pesan: "Nilai harus angka antara 0 dan 100." };
    }
    // Jika semua valid
    return { valid: true, pesan: "Data valid" };
}


/**
 * Render data ke tabel
 * @param {Array} data - Array data dari Firestore
 */
function renderTabel(data) {
    if (data.length === 0) {
        // Tampilkan pesan jika tidak ada data
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada data.</td></tr>';
        return;
    }

    tbody.innerHTML = ""; // Kosongkan tabel sebelum diisi
    let index = 1;
    data.forEach(item => {
        // Buat baris baru untuk setiap item data
        const newRow = `
            <tr>
                <th scope="row" class="text-center">${index++}</th>
                <td>${item.nama}</td>
                <td>${item.nim}</td>
                <td>${item.mataKuliah}</td>
                <td class="text-center"><span class="nilai-badge">${item.nilai}</span></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', newRow); // Masukkan baris ke tabel
    });
}


/**
 * loadData()
 * Mengambil data dari Firestore (via firebase-config.js) dan memanggil renderTabel
 */
async function loadData() {
    // Tampilkan status loading di tabel
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>Memuat data...</td></tr>';
    try {
        // Panggil fungsi dari Database Layer
        const data = await loadDataDariFirestore();
        // Kirim data ke Presentation Layer
        renderTabel(data);
    } catch (error) {
        // Tangani error jika gagal memuat
        tampilkanPesan(error.message, 'danger');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Gagal memuat data.</td></tr>';
    }
}


// --- Event Listener Form Submit ---
// Sesuai dengan intruksi di ppt ibu
form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Mencegah form refresh halaman
    // 1. Mengisi form (ambil data dari DOM)
    const data = {
        nama: document.getElementById('nama').value.trim(),
        nim: document.getElementById('nim').value.trim(),
        mataKuliah: document.getElementById('matakuliah').value,
        nilai: document.getElementById('nilai').value // Ambil sebagai string dulu untuk validasi
    };
    // 2. Klik Simpan -> Panggil validasiInput()
    const hasilValidasi = validasiInput(data);
    
    if (!hasilValidasi.valid) {
        // 3. Gagal: Kirim notifikasi gagal
        tampilkanPesan(hasilValidasi.pesan, 'danger');
    } else {
        // 4. Berhasil: Siapkan data untuk disimpan (ubah nilai ke angka)
        const dataToSave = {
            ...data,
            nilai: parseFloat(data.nilai) 
        };
        try {
            // Panggil fungsi dari Database Layer
            await simpanDataKeFirestore(dataToSave);
            
            // 5. Kirim notifikasi berhasil
            tampilkanPesan("Data berhasil disimpan!");
            form.reset(); // Kosongkan form
            
            // 6. Pindah ke halaman lihat data (akan otomatis memuat data baru)
            showLihatPage();

        } catch (error) {
            // 7. Gagal simpan (error dari Firebase)
            tampilkanPesan(error.message, 'danger');
        }
    }
});


// --- Inisialisasi Aplikasi ---
// Tampilkan halaman input saat pertama kali dimuat
showInputPage();