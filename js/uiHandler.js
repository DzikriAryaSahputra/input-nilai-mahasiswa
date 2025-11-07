// Variabel timer untuk notifikasi (state internal modul UI)
let notifTimer = null; 

/**
 * Menampilkan halaman Input Nilai
 */
export function showInputPage(navInput, navLihat, pageInput, pageLihat) {
    navInput.classList.add('active');
    navLihat.classList.remove('active');
    pageInput.classList.remove('d-none');
    pageLihat.classList.add('d-none');
}

/**
 * Menampilkan halaman Lihat Data
 */
export function showLihatPage(navInput, navLihat, pageInput, pageLihat, searchInput) {
    navLihat.classList.add('active');
    navInput.classList.remove('active');
    pageLihat.classList.remove('d-none');
    pageInput.classList.add('d-none');
    
    // Kosongkan input pencarian saat pindah halaman
    if (searchInput) {
        searchInput.value = "";
    }
}

/**
 * Menampilkan notifikasi kustom
 * @param {HTMLElement} alertBox - Elemen div notifikasi
 * @param {string} pesan - Pesan yang ingin ditampilkan
 * @param {string} tipe - 'success' (hijau) atau 'danger' (merah)
 */
export function tampilkanPesan(alertBox, pesan, tipe = "success") {
    if (notifTimer) {
        clearTimeout(notifTimer);
    }
    const ikon = tipe === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    const alertClass = tipe === 'success' ? 'alert-success' : 'alert-danger';

    if (alertBox) {
        alertBox.innerHTML = `<i class="fas ${ikon} me-2"></i> ${pesan}`;
        alertBox.className = `alert ${alertClass} d-flex align-items-center`;
        alertBox.style.display = 'block'; 

        notifTimer = setTimeout(() => {
            alertBox.style.display = 'none';
        }, 3000);
    } else {
        console.error("Elemen notifikasi '#custom-alert' tidak ditemukan di HTML.");
    }
}

/**
 * Render data ke tabel
 * @param {HTMLElement} tbody - Elemen tbody tabel
 * @param {Array} data - Array data dari Firestore
 */
export function renderTabel(tbody, data) {
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 20px;">Data tidak ditemukan.</td></tr>';
        return;
    }

// TABEL DATA NILAI
    tbody.innerHTML = ""; // Kosongkan tabel sebelum diisi
    let index = 1;
    data.forEach(item => {
        const newRow = `
            <tr>
                <th scope="row" class="text-center">${index++}</th>
                <td>${item.nama}</td>
                <td>${item.nim}</td>
                <td>${item.mataKuliah}</td>
                <td class="text-center"><span class="nilai-badge">${item.nilai}</span></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', newRow);
    });
}