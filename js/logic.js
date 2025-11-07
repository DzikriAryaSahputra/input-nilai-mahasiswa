import { showInputPage, showLihatPage, tampilkanPesan, renderTabel } from './uiHandler.js';
import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Elemen DOM ---
const navInput = document.getElementById('nav-input');
const navLihat = document.getElementById('nav-lihat');
const pageInput = document.getElementById('page-input-data');
const pageLihat = document.getElementById('page-lihat-data');
const form = document.getElementById('formNilai');
const tbody = document.getElementById('tabel-body');
const alertBox = document.getElementById('custom-alert');
const searchInput = document.getElementById('searchInput');

// --- State Aplikasi ---
let allDataNilai = [];

// --- Fungsi CRUD ---
// koleksi di Firestore
const nilaiCollectionRef = collection(db, "nilaiMahasiswa");

/**
 * Fungsi untuk menyimpan data
 * @param {object} data - Objek data (nama, nim, mataKuliah, nilai)
 */
async function simpanDataKeFirestore(data) {
    try {
        await addDoc(nilaiCollectionRef, data);
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Gagal menyimpan data ke database."); 
    }
}

/**
 * Fungsi untuk mengambil data
 * @returns {Array} - Array berisi data mahasiswa
 */
async function loadDataDariFirestore() {
    try {
        const querySnapshot = await getDocs(nilaiCollectionRef);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Gagal memuat data dari database."); 
    }
}

// --- Fungsi Validasi ---
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
    if (!/^\d+$/.test(data.nim)) {
        return { valid: false, pesan: "NIM harus berupa angka." };
    }
    const nilaiNum = parseFloat(data.nilai);
    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
        return { valid: false, pesan: "Nilai harus angka antara 0 dan 100." };
    }
    return { valid: true, pesan: "Data valid" };
}

// --- Fungsi Logic Layers ---
/**
 * loadData()
 * Mengambil data dari Firestore dan memanggil uiHandler
 */
async function loadData() {
    // Memanggil uiHandler untuk menampilkan status loading
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 20px;"><i class="fas fa-spinner fa-spin me-2"></i>Memuat data...</td></tr>';
    try {
        // Memanggil fungsi CRUD di file ini
        const data = await loadDataDariFirestore();
        allDataNilai = data;
        
        // Memanggil uiHandler untuk me-render tabel
        renderTabel(tbody, allDataNilai);

    } catch (error) {
        // Memanggil uiHandler untuk menampilkan pesan error
        tampilkanPesan(alertBox, "Gagal memuat data dari database.", 'danger');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 20px;">Gagal memuat data.</td></tr>';
    }
}

// --- Inisialisasi Event Listeners ---
// Event listener navigasi
navInput.addEventListener('click', (e) => { 
    e.preventDefault(); 
    showInputPage(navInput, navLihat, pageInput, pageLihat); 
});

navLihat.addEventListener('click', (e) => { 
    e.preventDefault(); 
    showLihatPage(navInput, navLihat, pageInput, pageLihat, searchInput);
    loadData(); // Muat data saat pindah halaman
});

// Event listener filter pencarian
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredData = allDataNilai.filter(item => {
        const namaCocok = item.nama.toLowerCase().includes(searchTerm);
        const nimCocok = item.nim.toLowerCase().includes(searchTerm);
        const matkulCocok = item.mataKuliah.toLowerCase().includes(searchTerm);
        return namaCocok || nimCocok || matkulCocok;
    });
    
    // Memanggil uiHandler untuk me-render tabel hasil filter
    renderTabel(tbody, filteredData);
});

// Event listener form submit
form.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    const data = {
        nama: document.getElementById('nama').value.trim(),
        nim: document.getElementById('nim').value.trim(),
        mataKuliah: document.getElementById('matakuliah').value,
        nilai: document.getElementById('nilai').value 
    };

    // Memanggil fungsi validasi
    const hasilValidasi = validasiInput(data);
    
    if (!hasilValidasi.valid) {
        tampilkanPesan(alertBox, hasilValidasi.pesan, 'danger');
    } else {
        const dataToSave = {
            ...data,
            nilai: parseFloat(data.nilai) 
        };

        try {
            // Memanggil fungsi CRUD
            await simpanDataKeFirestore(dataToSave);
            
            // Memanggil uiHandler untuk notifikasi
            tampilkanPesan(alertBox, "Data berhasil disimpan!", "success");
            form.reset(); 
            
            // Memanggil uiHandler untuk pindah halaman
            showLihatPage(navInput, navLihat, pageInput, pageLihat, searchInput);
            loadData(); // Memuat data baru

        } catch (error) {
            tampilkanPesan(alertBox, error.message, 'danger');
        }
    }
});

// --- Inisialisasi Aplikasi ---
// Tampilkan halaman input saat pertama kali dimuat
showInputPage(navInput, navLihat, pageInput, pageLihat);